"""
LangChain Agents and LangGraph State Machine for the
WhatsApp Gemini Link & Credit Distribution System.

Architecture:
  Supervisor Node -> routes to SupportAgent | AuthAgent | DispenseAgent | RegistrationHandler
"""

import os
import re
import time
import hashlib
from typing import Literal, TypedDict, Annotated, Sequence
from dotenv import load_dotenv
from collections import defaultdict

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

from database import (
    classify_user,
    get_or_create_user,
    log_transaction,
    verify_pin as db_verify_pin,
    check_credits as db_check_credits,
    dispense_link as db_dispense_link,
    SessionLocal,
    User,
)

from tools.business_tools import (
    SUPPORT_TOOLS,
    AUTH_TOOLS,
    DISPENSE_TOOLS,
    ADMIN_TOOLS,
    ALL_TOOLS,
)

load_dotenv()

# ============================================================
# Conversation Memory Store (in-memory, keyed by phone)
# ============================================================

class ConversationMemory:
    """Stores conversation history and user state per phone number."""

    def __init__(self):
        self._history: dict[str, list[BaseMessage]] = defaultdict(list)
        self._user_state: dict[str, dict] = {}
        self._max_turns = 20

    def get_state(self, phone: str) -> dict:
        return self._user_state.get(phone, {})

    def set_state(self, phone: str, state: dict):
        self._user_state[phone] = state

    def update_state(self, phone: str, **kwargs):
        if phone not in self._user_state:
            self._user_state[phone] = {}
        self._user_state[phone].update(kwargs)

    def is_pin_verified(self, phone: str) -> bool:
        return self._user_state.get(phone, {}).get("pin_verified", False)

    def mark_pin_verified(self, phone: str):
        self.update_state(phone, pin_verified=True)

    def is_role_set(self, phone: str) -> bool:
        return self._user_state.get(phone, {}).get("role") is not None

    def set_role(self, phone: str, role: str):
        self.update_state(phone, role=role)

    def get(self, phone: str) -> list[BaseMessage]:
        return self._history[phone]

    def append(self, phone: str, message: BaseMessage):
        self._history[phone].append(message)
        if len(self._history[phone]) > self._max_turns:
            self._history[phone] = self._history[phone][-self._max_turns:]

    def append_user(self, phone: str, content: str):
        self.append(phone, HumanMessage(content=content))

    def append_ai(self, phone: str, content: str):
        self.append(phone, AIMessage(content=content))

    def clear(self, phone: str):
        self._history.pop(phone, None)
        self._user_state.pop(phone, None)


# Global conversation memory
memory = ConversationMemory()


# ============================================================
# LLM initialization
# ============================================================

MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini")
MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "openai")

llm_kwargs = {
    "model": MODEL_NAME,
    "temperature": 0.3,
    "max_tokens": 512,
}

# Get API key
api_key = os.getenv(f"{MODEL_PROVIDER.upper()}_API_KEY") or os.getenv("OPENAI_API_KEY")
if api_key:
    llm_kwargs["openai_api_key"] = api_key

# Get base URL (for OpenAI-compatible APIs)
base_url = os.getenv(f"{MODEL_PROVIDER.upper()}_BASE_URL") or os.getenv("OPENAI_BASE_URL")
if base_url:
    llm_kwargs["openai_api_base"] = base_url

llm = ChatOpenAI(**llm_kwargs)

# Faster LLM for simple routing (supervisor)
router_llm = ChatOpenAI(
    model=MODEL_NAME,
    temperature=0,
    max_tokens=50,
    openai_api_key=api_key,
    openai_api_base=base_url,
)


# ============================================================
# Agent State (TypedDict for LangGraph)
# ============================================================

class AgentState(TypedDict):
    phone: str
    role: str
    is_verified: bool
    credits: int
    messages: Annotated[Sequence[BaseMessage], add_messages]
    current_step: str
    tool_calls: list[dict]
    last_response: str
    error: str | None


# ============================================================
# System prompts
# ============================================================

SUPPORT_SYSTEM_PROMPT = """You are a helpful customer support assistant for a Gemini access service.
You answer questions about:
  - How to use Gemini links
  - Link validity and expiration
  - Credit and payment inquiries
  - General technical support

Rules:
- You CANNOT dispense Gemini links (only resellers can request these).
- You CANNOT modify user credits or accounts.
- You CANNOT access any system administration functions.
- If a user asks for a link, direct them to contact a reseller.
- Be concise, friendly, and respond in the same language the user writes in.
- Keep responses short (under 200 words) for WhatsApp."""

AUTH_SYSTEM_PROMPT = """You are a PIN verification agent for resellers.
Your job is to verify a 4-digit PIN.
- If the user provides a PIN, call the verify_pin tool.
- If PIN is correct, confirm verification and tell them they can now request links.
- If PIN is wrong, tell them to try again.
- Be concise. This is WhatsApp — keep it short."""

DISPENSE_SYSTEM_PROMPT = """You are a link dispensing agent for verified resellers.
Your job is to dispense Gemini links to resellers who have credits.
- Always check credits first using check_credits.
- If credits > 0, call dispense_link to get a link.
- If credits == 0, tell the user to contact admin.
- If no links available, tell the user to contact admin.
- Be concise. This is WhatsApp — keep it short."""

SUPERVISOR_SYSTEM_PROMPT = """You are a routing supervisor for a WhatsApp bot.
Your job is to determine the next step for a user message.

Analyze the user's phone number and message, then route accordingly:

1. If the user is NOT registered (phone not in database):
   -> Route to 'registration'

2. If the user is a 'customer':
   -> Route to 'support'

3. If the user is a 'reseller' and NOT verified:
   -> Route to 'auth'

4. If the user is a 'reseller' and IS verified:
   -> Route to 'dispense'

5. If there is an error in the state:
   -> Route to 'error_handler'

Respond with ONLY the route name: registration, support, auth, dispense, or error_handler."""


# ============================================================
# Helpers
# ============================================================

def load_system_memory() -> str:
    """Load global memory from agent.md"""
    agent_md_path = os.path.join(os.path.dirname(__file__), "agent.md")
    if os.path.exists(agent_md_path):
        with open(agent_md_path, "r", encoding="utf-8") as f:
            return f.read()
    return ""


def get_skill_instructions(skill_name: str = "support") -> str:
    """Load progressive disclosure skill knowledge base."""
    skill_file = os.path.join(os.path.dirname(__file__), "skills", skill_name, "skill.md")
    if os.path.exists(skill_file):
        with open(skill_file, "r", encoding="utf-8") as f:
            return f.read()
    return ""


# ============================================================
# LangGraph Nodes
# ============================================================

def supervisor_node(state: AgentState) -> AgentState:
    """Route the user to the correct agent based on their state."""
    phone = state["phone"]

    if state.get("error"):
        return {**state, "current_step": "error_handler"}

    user_info = classify_user(phone)
    if not user_info:
        return {**state, "current_step": "registration"}

    role = user_info["role"]
    db_verified = user_info["is_verified"]
    mem_verified = memory.is_pin_verified(phone)

    if role == "customer":
        return {**state, "current_step": "support"}
    elif role == "reseller":
        if db_verified or mem_verified:
            return {**state, "current_step": "dispense"}
        else:
            return {**state, "current_step": "auth"}
    else:
        return {**state, "current_step": "registration"}


def registration_node(state: AgentState) -> AgentState:
    """Handle new user registration."""
    phone = state["phone"]
    messages = list(state["messages"])
    user_input = messages[-1].content.strip() if messages else ""

    lower_input = user_input.lower()
    if "customer" in lower_input or "buyer" in lower_input or "user" in lower_input or "grahak" in lower_input:
        get_or_create_user(phone, role="customer")
        log_transaction(phone, "registration", '{"role": "customer"}')
        memory.set_state(phone, {"role": "customer", "pin_verified": True})
        response = "Aap Customer ke roop me register ho chuke hain! Gemini links se related koi bhi sawal aap pooch sakte hain."
        return {
            **state,
            "role": "customer",
            "last_response": response,
            "messages": messages + [AIMessage(content=response)],
        }
    elif "reseller" in lower_input or "dealer" in lower_input or "seller" in lower_input:
        get_or_create_user(phone, role="reseller")
        log_transaction(phone, "registration", '{"role": "reseller"}')
        memory.set_state(phone, {"role": "reseller", "pin_verified": False})
        response = "Aap Reseller ke roop me register ho chuke hain. Kripya apna 4-digit PIN enter karein verify karne ke liye."
        return {
            **state,
            "role": "reseller",
            "last_response": response,
            "messages": messages + [AIMessage(content=response)],
        }

    # Ask the user politely in natural Hindi/English
    prompt = [
        SystemMessage(content=(
            "You are a friendly WhatsApp assistant for a Gemini service. "
            "A new user just messaged. Greet them warmly and ask if they are a 'Customer' (who needs help/support) "
            "or a 'Reseller' (who sells and dispenses links). Keep it short, clear, and in polite Hinglish."
        )),
        HumanMessage(content=user_input)
    ]
    ai_msg = llm.invoke(prompt)
    response = str(ai_msg.content)

    return {
        **state,
        "last_response": response,
        "messages": messages + [AIMessage(content=response)],
    }


def support_node(state: AgentState) -> AgentState:
    """Handle customer support via SupportAgent."""
    messages = list(state["messages"])
    user_input = messages[-1].content if messages else "Hello"

    response = run_support_agent(messages, user_input)
    new_messages = messages + [AIMessage(content=response)]

    return {
        **state,
        "last_response": response,
        "messages": new_messages,
    }


def auth_node(state: AgentState) -> AgentState:
    """Handle reseller PIN verification via AuthAgent."""
    messages = list(state["messages"])
    user_input = messages[-1].content.strip() if messages else ""

    # Try PIN verification
    result = db_verify_pin(state["phone"], user_input)

    if result["success"]:
        response = "PIN verified! Aap ab Gemini links maang sakte hain. Bas 'link' ya 'link chahiye' likh dein."
        log_transaction(state["phone"], "pin_verify", '{"success": true}')
        memory.mark_pin_verified(state["phone"])
        return {
            **state,
            "is_verified": True,
            "last_response": response,
            "messages": messages + [AIMessage(content=response)],
        }
    else:
        response = result["message"]
        return {
            **state,
            "last_response": response,
            "messages": messages + [AIMessage(content=response)],
        }


def dispense_node(state: AgentState) -> AgentState:
    """Handle link dispensing via DispenseAgent."""
    messages = list(state["messages"])
    user_input = messages[-1].content.strip().lower() if messages else ""

    # Check if user is asking for a link
    link_keywords = ["link", "get link", "gemini", "send link", "i want", "chahiye", "dedo"]
    wants_link = any(kw in user_input for kw in link_keywords)

    if not wants_link:
        response = run_dispense_agent(messages, user_input)
        return {
            **state,
            "last_response": response,
            "messages": messages + [AIMessage(content=response)],
        }

    # Check credits
    credit_info = db_check_credits(state["phone"])
    if not credit_info["found"] or credit_info["credits"] < 1:
        response = "Aapke paas koi credits nahi bache hain. Admin se contact karke credits add karwain."
        return {
            **state,
            "last_response": response,
            "messages": messages + [AIMessage(content=response)],
        }

    # Dispense link
    result = db_dispense_link(state["phone"])
    if result["success"]:
        response = f"Yahan aapka Gemini link hai: {result['url']}"
        log_transaction(state["phone"], "link_dispense", f'{{"url": "{result["url"]}"}}')
    else:
        response = result["message"]

    return {
        **state,
        "credits": max(credit_info["credits"] - 1, 0),
        "last_response": response,
        "messages": messages + [AIMessage(content=response)],
    }


def error_handler_node(state: AgentState) -> AgentState:
    """Handle errors gracefully."""
    response = "Kuch gadbad ho gayi. Phir se try karein ya support se contact karein."
    return {
        **state,
        "last_response": response,
        "error": None,
        "current_step": "supervisor",
        "messages": list(state["messages"]) + [AIMessage(content=response)],
    }


# ============================================================
# LangGraph Conditional Router
# ============================================================

def route_from_supervisor(state: AgentState) -> Literal[
    "registration", "support", "auth", "dispense", "error_handler"
]:
    step = state.get("current_step", "registration")
    return step


# ============================================================
# Graph Compilation
# ============================================================

def build_graph():
    """Build and compile the LangGraph state machine."""
    builder = StateGraph(AgentState)

    builder.add_node("supervisor", supervisor_node)
    builder.add_node("registration", registration_node)
    builder.add_node("support", support_node)
    builder.add_node("auth", auth_node)
    builder.add_node("dispense", dispense_node)
    builder.add_node("error_handler", error_handler_node)

    builder.set_entry_point("supervisor")

    builder.add_conditional_edges(
        "supervisor",
        route_from_supervisor,
        {
            "registration": "registration",
            "support": "support",
            "auth": "auth",
            "dispense": "dispense",
            "error_handler": "error_handler",
        },
    )

    builder.add_edge("registration", END)
    builder.add_edge("support", END)
    builder.add_edge("auth", END)
    builder.add_edge("dispense", END)
    builder.add_edge("error_handler", END)

    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///gemini_dist.db")
    if "postgres" in DATABASE_URL or "postgresql" in DATABASE_URL:
        from langgraph.checkpoint.postgres import PostgresSaver
        checkpointer = PostgresSaver(DATABASE_URL)
    else:
        import sqlite3
        from langgraph.checkpoint.sqlite import SqliteSaver
        db_path = DATABASE_URL.replace("sqlite:///", "")
        conn = sqlite3.connect(db_path, check_same_thread=False)
        checkpointer = SqliteSaver(conn)

    graph = builder.compile(checkpointer=checkpointer)
    return graph


# ============================================================
# Agent wrappers
# ============================================================

def run_support_agent(history: list, user_input: str) -> str:
    prompt = [
        SystemMessage(content=SUPPORT_SYSTEM_PROMPT),
        *history[-10:],  # last 10 turns
        HumanMessage(content=user_input),
    ]
    response = llm.invoke(prompt)
    return str(response.content)


def run_dispense_agent(history: list, user_input: str) -> str:
    prompt = [
        SystemMessage(content=DISPENSE_SYSTEM_PROMPT),
        *history[-10:],
        HumanMessage(content=user_input),
    ]
    response = llm.invoke(prompt)
    return str(response.content)


def run_autonomous_deep_agent(phone: str, user_input: str, conversation_history: list) -> str:
    """
    Autonomous Deep Agent Controller:
    Uses LLM tool calling with conversation memory and database tools.
    """
    global_memory = load_system_memory()
    support_skill = get_skill_instructions("support")
    user_info = classify_user(phone)
    user_context = f"Current User Phone: {phone}\nUser DB Record: {user_info}"

    # Memory-based state tracking
    mem_state = memory.get_state(phone)
    mem_pin_verified = mem_state.get("pin_verified", False)
    mem_role = mem_state.get("role")

    memory_context = f"""
=== MEMORY STATE ===
In-memory PIN verified: {mem_pin_verified}
In-memory role: {mem_role}
Note: If pin_verified=True, NEVER ask for PIN again for this user.
Note: If role is already set, do NOT ask the user to choose a role again."""

    system_prompt = f"""{global_memory}

=== CURRENT USER CONTEXT ===
{user_context}
{memory_context}

=== KNOWLEDGE BASE (ON-DEMAND SKILL) ===
{support_skill}

=== INSTRUCTIONS & AUTONOMOUS AGENT WORKFLOW ===
1. You have access to `execute_sql_query` tool to directly query database tables (users, links, settings, transaction_logs) whenever exact facts or custom data is required.
2. If the user is NEW (User DB Record is None) and hasn't chosen a role:
   - Politely greet them in Hinglish/English.
   - Ask if they are a 'Customer' (needs support/questions) or 'Reseller' (sells/dispenses links).
   - If they state their role (e.g. 'I am customer' or 'reseller'), register them accordingly.

3. If the user is a RESELLER:
   - If NOT verified (check both DB is_verified AND memory pin_verified): Ask for their 4-digit PIN and use `verify_pin` tool with phone="{phone}".
   - If VERIFIED and requests a link (e.g. "give me link", "link bhejo"):
     * Check credits with `check_credits(phone="{phone}")` or SQL.
     * If they have credits, call `dispense_link(phone="{phone}")` to dispense.
     * If 0 credits, tell them to contact admin.
   - If asking about credit balance or history: Query via `check_credits` or `execute_sql_query`.

4. If the user is a CUSTOMER:
   - Answer their questions regarding Gemini links using the knowledge base.
   - NEVER dispense links to customers.

5. Always respond naturally and politely in the user's language (Hindi/Hinglish/English).
6. CRITICAL: This is an ongoing conversation. Check the conversation history and memory state above. Do NOT ask again for information the user already provided (like their role, PIN, etc.). If memory shows pin_verified=True, treat them as fully verified."""

    messages = [
        SystemMessage(content=system_prompt),
        *conversation_history,
        HumanMessage(content=user_input)
    ]

    model_with_tools = llm.bind_tools(ALL_TOOLS)
    ai_msg = model_with_tools.invoke(messages)

    if ai_msg.tool_calls:
        tool_messages = []
        for tool_call in ai_msg.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            tool_call_id = tool_call["id"]

            tool_fn = next((t for t in ALL_TOOLS if t.name == tool_name), None)
            if tool_fn:
                try:
                    result = tool_fn.invoke(tool_args)
                    tool_messages.append(ToolMessage(content=str(result), tool_call_id=tool_call_id))
                except Exception as e:
                    tool_messages.append(ToolMessage(content=f"Tool error: {str(e)}", tool_call_id=tool_call_id))
            else:
                tool_messages.append(ToolMessage(content=f"Tool {tool_name} not found.", tool_call_id=tool_call_id))

        followup_messages = [
            *messages,
            ai_msg,
            *tool_messages
        ]
        final_msg = llm.invoke(followup_messages)
        return str(final_msg.content)

    return str(ai_msg.content)


# ============================================================
# Public API
# ============================================================

class WhatsAppAgent:
    """Main agent interface for the Flask webhook handler."""

    def __init__(self):
        self.graph = build_graph()

    def process_message(self, phone: str, message_text: str) -> str:
        """Process a single WhatsApp message with conversation memory."""
        try:
            # Load existing user info into memory if not already present
            user_info = classify_user(phone)
            existing_state = memory.get_state(phone)
            if user_info and not existing_state:
                memory.set_state(phone, {
                    "role": user_info.get("role"),
                    "pin_verified": bool(user_info.get("is_verified")),
                })
            elif user_info and "role" not in existing_state:
                memory.update_state(phone, role=user_info.get("role"))
            elif user_info and "pin_verified" not in existing_state:
                memory.update_state(phone, pin_verified=bool(user_info.get("is_verified")))

            # Store user message in memory
            memory.append_user(phone, message_text)

            # Get current user state from memory
            user_state = memory.get_state(phone)
            role = user_state.get("role")
            pin_verified = user_state.get("pin_verified", False)

            # Handle NEW user registration directly (no LLM needed for this)
            if not role:
                lower_msg = message_text.lower().strip()
                if any(kw in lower_msg for kw in ["customer", "buyer", "grahak"]):
                    get_or_create_user(phone, role="customer")
                    memory.set_state(phone, {"role": "customer", "pin_verified": True})
                    log_transaction(phone, "registration", '{"role": "customer"}')
                    response = "Aap Customer ke roop me register ho chuke hain! Gemini links se related koi bhi sawal aap pooch sakte hain."
                    memory.append_ai(phone, response)
                    return response
                elif any(kw in lower_msg for kw in ["reseller", "dealer", "seller"]):
                    get_or_create_user(phone, role="reseller")
                    memory.set_state(phone, {"role": "reseller", "pin_verified": False})
                    log_transaction(phone, "registration", '{"role": "reseller"}')
                    response = "Welcome! Aap reseller hain. Kripya apna 4-digit PIN share karein taaki main aapki verification kar sakoon."
                    memory.append_ai(phone, response)
                    return response
                else:
                    # First time user - ask for role
                    response = "Namaste! Aapka Welcome hai. Kya aap Customer hain ya Reseller?"
                    memory.append_ai(phone, response)
                    return response

            # Handle reseller PIN verification directly (no LLM needed)
            if role == "reseller" and not pin_verified:
                pin_input = message_text.strip()
                if pin_input and pin_input.isdigit() and 4 <= len(pin_input) <= 6:
                    result = db_verify_pin(phone, pin_input)
                    if result["success"]:
                        memory.mark_pin_verified(phone)
                        # Update DB
                        session = SessionLocal()
                        try:
                            user = session.query(User).filter_by(phone=phone).first()
                            if user:
                                user.is_verified = True
                                session.commit()
                        finally:
                            session.close()
                        response = "PIN verified! Aap ab Gemini links maang sakte hain. Bas 'link' ya 'link chahiye' likh dein."
                        memory.append_ai(phone, response)
                        return response
                    else:
                        response = result["message"]
                        memory.append_ai(phone, response)
                        return response
                else:
                    # Not a PIN format - remind but also allow LLM to handle general chat
                    pass

            # Use the autonomous deep agent for all other conversation
            history = memory.get(phone)
            response = run_autonomous_deep_agent(phone, message_text, history)

            # Sync memory state with DB
            refreshed = classify_user(phone)
            if refreshed:
                memory.update_state(
                    phone,
                    role=refreshed.get("role"),
                    pin_verified=bool(refreshed.get("is_verified")),
                )

            memory.append_ai(phone, response)
            return response
        except Exception as e:
            import traceback
            traceback.print_exc()
            return f"Kuch gadbad ho gayi: {str(e)}"
