"""
LangChain Tools for the WhatsApp Gemini Distribution Agent.

Each function is exposed as a StructuredTool that the LLM can call.
All tools operate on the shared database layer.
"""

from langchain_core.tools import StructuredTool, tool
from pydantic import BaseModel, Field
from typing import Optional
from database import (
    verify_pin as db_verify_pin,
    check_credits as db_check_credits,
    dispense_link as db_dispense_link,
    add_credits as db_add_credits,
    bulk_ingest_links as db_bulk_ingest,
    get_or_create_user,
    classify_user,
    get_setting,
    set_setting,
    log_transaction,
    init_db,
)


# ============================================================
# Pydantic schemas for tool inputs
# ============================================================

class VerifyPinInput(BaseModel):
    phone: str = Field(description="WhatsApp JID of the reseller (e.g. 919876543210@s.whatsapp.net)")
    pin: str = Field(description="4-digit PIN entered by the reseller")


class CheckCreditsInput(BaseModel):
    phone: str = Field(description="WhatsApp JID of the user")


class DispenseLinkInput(BaseModel):
    phone: str = Field(description="WhatsApp JID of the reseller requesting a link")


class AddCreditsInput(BaseModel):
    phone: str = Field(description="WhatsApp JID of the user")
    delta: int = Field(description="Credit delta (positive to add, negative to deduct)")


class BulkIngestInput(BaseModel):
    urls: list[str] = Field(description="List of Gemini invite URLs to ingest")


class SetPinInput(BaseModel):
    new_pin: str = Field(description="New 4-digit PIN for resellers")


# ============================================================
# Tool wrappers
# ============================================================

def verify_pin(phone: str, pin: str) -> str:
    """Verify a reseller's 4-digit PIN. Returns success or error message."""
    result = db_verify_pin(phone, pin)
    if result["success"]:
        log_transaction(phone, "pin_verify", '{"success": true}')
    return result["message"]


def check_credits(phone: str) -> str:
    """Check remaining credits for a user. Returns a human-readable string."""
    result = db_check_credits(phone)
    if not result["found"]:
        return "User not found."
    return f"You have {result['credits']} credits remaining."


def dispense_link(phone: str) -> str:
    """Dispense one Gemini link to a verified reseller with available credits.
    Returns the link URL or an error message."""
    result = db_dispense_link(phone)
    if result["success"]:
        log_transaction(phone, "link_dispense", f'{{"url": "{result["url"]}"}}')
        return f"Here is your Gemini link: {result['url']}"
    else:
        return result["message"]


def add_credits(phone: str, delta: int) -> str:
    """Add or deduct credits for a user. Admin-only tool.
    Positive delta = add credits, negative delta = deduct credits."""
    result = db_add_credits(phone, delta)
    if result["success"]:
        return f"Credits updated. New balance: {result['new_credits']}"
    return result["message"]


def bulk_ingest(urls: list[str]) -> str:
    """Bulk ingest Gemini links. Admin-only tool.
    Takes a list of URLs and adds unique ones to the database."""
    result = db_bulk_ingest(urls)
    return (
        f"Ingestion complete. Added: {result['added']}, "
        f"Duplicates skipped: {result['duplicates_skipped']}"
    )


def set_reseller_pin(new_pin: str) -> str:
    """Set a new 4-digit reseller PIN. Admin-only tool.
    The old PIN is immediately invalidated."""
    import bcrypt
    hashed = bcrypt.hashpw(new_pin.encode(), bcrypt.gensalt(rounds=12)).decode()
    set_setting("reseller_pin_hash", hashed)
    log_transaction("system", "pin_change", '{"action": "PIN updated"}')
    return "Reseller PIN updated successfully."


def get_user_info(phone: str) -> str:
    """Get user details: role, verification status, credits."""
    user = classify_user(phone)
    if not user:
        return "User not found."
    return (
        f"User: {phone}\n"
        f"Role: {user['role']}\n"
        f"Verified: {user['is_verified']}\n"
        f"Credits: {user['credits']}"
    )


# ============================================================
# StructuredTool instances (LangChain)
# ============================================================

verify_pin_tool = StructuredTool.from_function(
    func=verify_pin,
    name="verify_pin",
    description="Verify a reseller's 4-digit PIN. Use when a reseller needs to authenticate.",
    args_schema=VerifyPinInput,
)

check_credits_tool = StructuredTool.from_function(
    func=check_credits,
    name="check_credits",
    description="Check remaining credits for a user. Use when a user asks about their balance.",
    args_schema=CheckCreditsInput,
)

dispense_link_tool = StructuredTool.from_function(
    func=dispense_link,
    name="dispense_link",
    description="Dispense one Gemini link to a verified reseller. Deducts 1 credit atomically.",
    args_schema=DispenseLinkInput,
)

add_credits_tool = StructuredTool.from_function(
    func=add_credits,
    name="add_credits",
    description="Add or deduct credits for a user. Admin-only. Positive delta adds, negative deducts.",
    args_schema=AddCreditsInput,
)

bulk_ingest_tool = StructuredTool.from_function(
    func=bulk_ingest,
    name="bulk_ingest",
    description="Bulk ingest Gemini invite links. Admin-only. Skips duplicates automatically.",
    args_schema=BulkIngestInput,
)

set_pin_tool = StructuredTool.from_function(
    func=set_reseller_pin,
    name="set_reseller_pin",
    description="Set a new 4-digit reseller PIN. Admin-only. Old PIN is invalidated immediately.",
    args_schema=SetPinInput,
)

get_user_info_tool = StructuredTool.from_function(
    func=get_user_info,
    name="get_user_info",
    description="Get user details including role, verification status, and credits.",
    args_schema=CheckCreditsInput,
)

class SqlQueryInput(BaseModel):
    query: str = Field(description="SQL query to execute against the SQLite/Postgres database (e.g. SELECT * FROM users, SELECT COUNT(*) FROM links WHERE is_used=0)")


def execute_sql_query(query: str) -> str:
    """
    Execute an exact SQL query on the database and return the results as a string/table.
    Tables available:
    - users (phone, role, is_verified, credits, created_at, updated_at)
    - links (id, url, is_used, assigned_to, dispensed_at, created_at)
    - settings (key, value, updated_at)
    - transaction_logs (id, phone, action, details, performed_by, created_at)
    """
    from database import SessionLocal
    from sqlalchemy import text
    import json

    # Clean query
    clean_query = query.strip()
    session = SessionLocal()
    try:
        result = session.execute(text(clean_query))
        
        # If it is a SELECT / returning query
        if result.returns_rows:
            columns = result.keys()
            rows = result.fetchall()
            if not rows:
                return "Query executed successfully. 0 rows returned."
            
            output = []
            for row in rows:
                row_dict = {}
                for col, val in zip(columns, row):
                    row_dict[col] = str(val) if val is not None else None
                output.append(row_dict)
            return json.dumps(output, indent=2)
        else:
            session.commit()
            return f"Query executed successfully. Rows affected: {result.rowcount}"
    except Exception as e:
        session.rollback()
        return f"SQL Execution Error: {str(e)}"
    finally:
        session.close()


sql_query_tool = StructuredTool.from_function(
    func=execute_sql_query,
    name="execute_sql_query",
    description="Run an SQL query on the database to fetch exact records, check links count, verify users, inspect transaction logs, etc.",
    args_schema=SqlQueryInput,
)

# Public tool list
SUPPORT_TOOLS = [check_credits_tool, get_user_info_tool, sql_query_tool]
AUTH_TOOLS = [verify_pin_tool, sql_query_tool]
DISPENSE_TOOLS = [check_credits_tool, dispense_link_tool, sql_query_tool]
ADMIN_TOOLS = [add_credits_tool, bulk_ingest_tool, set_pin_tool, get_user_info_tool, sql_query_tool]
ALL_TOOLS = [verify_pin_tool, check_credits_tool, dispense_link_tool, add_credits_tool, bulk_ingest_tool, set_pin_tool, get_user_info_tool, sql_query_tool]
