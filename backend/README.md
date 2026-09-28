# WhatsApp Gemini Link & Credit Distribution System

Deep Agent-based WhatsApp bot built with **LangChain + LangGraph + deep-agents** for automated Gemini link distribution and customer support.

## Architecture

```
WhatsApp User → Evolution API → Flask Webhook → LangGraph State Machine
                                                      │
                                      ┌───────────────┼───────────────┐
                                      ▼               ▼               ▼
                               SupportAgent     AuthAgent      DispenseAgent
                               (GPT-4o-mini)   (PIN check)    (Link + Credits)
                                      │               │               │
                                      └───────────────┼───────────────┘
                                                      ▼
                                              PostgreSQL + Redis
```

## Key Features

- **Deep Agent architecture** with LangGraph state machine — planning, sub-agents, memory, virtual file system
- **Specialized agents**: SupportAgent (GPT-4o-mini), AuthAgent (PIN verification), DispenseAgent (atomic link dispensing)
- **Persistent memory** via `agent.md` (global rules) + on-demand `skills/` (progressive disclosure)
- **Conversation checkpointing** with LangGraph PostgresSaver — resumable across webhook invocations
- **LangSmith tracing** for full observability of agent execution
- **Atomic link dispensing** with `FOR UPDATE SKIP LOCKED` — no race conditions
- **Evolution API integration** for WhatsApp messaging
- **Admin API** for credit management, link ingestion, PIN configuration

## Project Structure

```
whatsapp-gemini-agent/
├── agent.md                    # Deep agent memory (global rules)
├── app.py                      # Flask webhook + admin API
├── agent.py                    # LangGraph state machine + Deep Agent
├── database.py                 # SQLAlchemy models + DB functions
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Production container
├── docker-compose.yml          # Local dev stack (app + postgres + redis)
├── .env.example                # Environment variable template
├── .gitignore
├── tools/
│   ├── search.py               # Tavily web search tool
│   └── business_tools.py       # LangChain StructuredTools (verify_pin, dispense_link, etc.)
├── skills/
│   └── support/
│       └── skill.md            # On-demand skill: support knowledge base
└── logs/
```

## Quick Start

```bash
# 1. Clone and setup
cd whatsapp-gemini-agent
uv venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. Install dependencies
uv pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 4. Initialize database
python -c "from database import init_db; init_db()"

# 5. Run the Flask server
python app.py
```

## Deep Agent Pillars

1. **Planning** — `write_todos` tool for task decomposition (built into deep-agents)
2. **Sub-Agents** — SupportAgent, AuthAgent, DispenseAgent (isolated, clean context)
3. **Memory** — `agent.md` always-loaded + `skills/support/skill.md` loaded on-demand
4. **Virtual File System** — State backend (LangGraph checkpointer) for persistent graph state

## LangGraph Flow

```
supervisor → registration → END
           → support     → END
           → auth        → dispense → END
           → dispense    → END
           → error_handler → END
```

Each webhook invocation is a graph run with `thread_id = phone_number`. LangGraph checkpoints state after each node, enabling resumable conversations.

## License

Private — All rights reserved.
