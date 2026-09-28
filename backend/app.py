"""
WhatsApp Gemini Link Distribution — Flask Application
Webhook handler + Admin API
"""

import os
import re
import hmac
import hashlib
import logging
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv

from agent import WhatsAppAgent

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, template_folder="templates")
agent = WhatsAppAgent()

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "")
EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "")
EVOLUTION_INSTANCE = os.getenv("EVOLUTION_INSTANCE", "")
ADMIN_API_TOKEN = os.getenv("ADMIN_API_TOKEN", "")


# ============================================================
# Auth guard for the admin API (server-to-server shared token).
# Every /api/admin/* request must send  X-Admin-Token: <ADMIN_API_TOKEN>.
# The Next.js frontend calls these only from its own server routes, so the
# token never reaches the browser.
# ============================================================

@app.before_request
def _guard_admin_api():
    if request.path.startswith("/api/admin/"):
        if not ADMIN_API_TOKEN:
            return jsonify({"error": "Admin API token not configured on the server"}), 503
        token = request.headers.get("X-Admin-Token", "")
        if not hmac.compare_digest(token, ADMIN_API_TOKEN):
            return jsonify({"error": "Unauthorized"}), 401


# ============================================================
# Helper: Mask phone numbers for logging
# ============================================================

def mask_phone(phone: str) -> str:
    """Mask phone number for safe logging."""
    clean = phone.split("@")[0]
    if len(clean) >= 8:
        return clean[:4] + "****" + clean[-4:]
    return "****"


# ============================================================
# Web UI / Testing Endpoints
# ============================================================

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/admin", methods=["GET"])
def admin_page():
    return render_template("admin.html")


@app.route("/api/chat", methods=["POST"])
def api_chat():
    try:
        data = request.get_json(force=True)
        phone = data.get("phone", "+919876543210")
        message_text = data.get("message", "")

        if not message_text:
            return jsonify({"error": "Empty message"}), 400

        logger.info(f"UI chat from {mask_phone(phone)}: {message_text}")
        response_text = agent.process_message(phone, message_text)
        logger.info(f"UI response to {mask_phone(phone)}: {response_text}")

        return jsonify({"response": response_text}), 200
    except Exception as e:
        logger.error(f"API chat error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ============================================================
# Webhook Endpoint
# ============================================================

@app.route("/webhook/evolution", methods=["POST"])
def webhook_evolution():
    try:
        payload = request.get_json(force=True)
        event = payload.get("event", "")

        if event != "messages.upsert":
            return jsonify({"status": "ignored"}), 200

        data = payload.get("data", {})
        key = data.get("key", {})
        remote_jid = key.get("remoteJid", "")
        message_data = data.get("message", {})
        message_text = message_data.get("conversation", "") or message_data.get("extendedTextMessage", {}).get("text", "")

        if not remote_jid or not message_text:
            return jsonify({"status": "no_content"}), 200

        # Ignore group messages
        if "@g.us" in remote_jid:
            return jsonify({"status": "ignored_group"}), 200

        # Ignore messages from the bot itself
        if "status@broadcast" in remote_jid:
            return jsonify({"status": "ignored_self"}), 200

        phone = remote_jid
        logger.info(f"Inbound from {mask_phone(phone)}: {message_text[:100]}")

        # Process through Deep Agent graph
        response_text = agent.process_message(phone, message_text)

        logger.info(f"Outbound to {mask_phone(phone)}: {response_text[:100]}")

        # Send response via Evolution API
        send_whatsapp_message(phone, response_text)

        return jsonify({"status": "processed"}), 200

    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ============================================================
# Admin API Endpoints
# ============================================================

@app.route("/api/admin/analytics", methods=["GET"])
def admin_analytics():
    # TODO: Add JWT auth middleware
    from database import SessionLocal, User, Link, TransactionLog
    from sqlalchemy import func

    session = SessionLocal()
    try:
        total_links = session.query(func.count(Link.id)).scalar()
        unused_links = session.query(func.count(Link.id)).filter_by(is_used=False).scalar()
        active_users = session.query(func.count(User.phone)).scalar()
        today = func.date(func.now())
        today_dispensed = session.query(func.count(TransactionLog.id)).filter(
            TransactionLog.action == "link_dispense",
            func.date(TransactionLog.created_at) == today,
        ).scalar()
        return jsonify({
            "total_links": total_links,
            "unused_links": unused_links,
            "used_links": total_links - unused_links,
            "active_users": active_users,
            "today_dispensed": today_dispensed,
        })
    finally:
        session.close()


@app.route("/api/admin/users", methods=["GET"])
def admin_list_users():
    # TODO: Add JWT auth middleware
    from database import SessionLocal, User
    session = SessionLocal()
    try:
        users = session.query(User).all()
        return jsonify([
            {
                "phone": u.phone,
                "role": u.role,
                "is_verified": u.is_verified,
                "credits": u.credits,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ])
    finally:
        session.close()


@app.route("/api/admin/users/credits", methods=["POST"])
def admin_adjust_credits():
    # TODO: Add JWT auth middleware
    data = request.get_json(force=True)
    phone = data.get("phone")
    delta = data.get("delta")
    from database import add_credits
    result = add_credits(phone, delta)
    return jsonify(result)


@app.route("/api/admin/links", methods=["POST"])
@app.route("/api/admin/links/ingest", methods=["POST"])
def admin_ingest_links():
    # TODO: Add JWT auth middleware
    data = request.get_json(force=True)
    urls = data.get("urls", [])
    from database import bulk_ingest_links
    result = bulk_ingest_links(urls)
    return jsonify(result)


@app.route("/api/admin/register/reseller", methods=["POST"])
def admin_register_reseller():
    data = request.get_json(force=True)
    phone = data.get("phone")
    name = data.get("name", "")
    credits = data.get("credits", 0)
    pin = data.get("pin")

    from database import SessionLocal, User, Setting, TransactionLog
    from sqlalchemy import func
    import bcrypt
    session = SessionLocal()
    try:
        existing = session.query(User).filter_by(phone=phone).first()
        if existing:
            return jsonify({"success": False, "message": f"User already exists with role: {existing.role}"})

        user = User(phone=phone, role="reseller", is_verified=True, credits=credits)
        session.add(user)

        if pin:
            pin_hash = bcrypt.hashpw(pin.encode(), bcrypt.gensalt(rounds=12)).decode()
            existing_pin = session.query(Setting).filter_by(key="reseller_pin_hash").first()
            if existing_pin:
                existing_pin.value = pin_hash
                existing_pin.updated_at = func.now()
            else:
                pin_setting = Setting(key="reseller_pin_hash", value=pin_hash)
                session.add(pin_setting)

        log = TransactionLog(
            phone=phone,
            action="reseller_registered",
            details=f'{{"name": "{name}", "credits": {credits}, "pin_set": {bool(pin)}}}',
            performed_by="admin",
        )
        session.add(log)
        session.commit()

        return jsonify({
            "success": True,
            "message": f"Reseller {name or phone} registered with {credits} credits",
            "user": {
                "phone": phone,
                "role": "reseller",
                "credits": credits,
                "is_verified": True,
            }
        })
    except Exception as e:
        session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        session.close()


@app.route("/api/admin/settings/pin", methods=["POST"])
def admin_set_pin():
    # TODO: Add JWT auth middleware
    data = request.get_json(force=True)
    new_pin = data.get("pin")
    from tools.business_tools import set_reseller_pin
    result = set_reseller_pin(new_pin)
    return jsonify({"success": True, "message": result})


@app.route("/api/admin/transactions", methods=["GET"])
def admin_transactions():
    # TODO: Add JWT auth middleware + pagination
    from database import SessionLocal, TransactionLog
    session = SessionLocal()
    try:
        logs = session.query(TransactionLog).order_by(TransactionLog.created_at.desc()).limit(100).all()
        return jsonify([
            {
                "id": l.id,
                "phone": l.phone,
                "action": l.action,
                "details": l.details,
                "performed_by": l.performed_by,
                "created_at": l.created_at.isoformat(),
            }
            for l in logs
        ])
    finally:
        session.close()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# ============================================================
# Evolution API Message Sender
# ============================================================

def send_whatsapp_message(phone_jid: str, text: str):
    """Send a WhatsApp message via Evolution API."""
    if not EVOLUTION_API_URL or not EVOLUTION_API_KEY or not EVOLUTION_INSTANCE:
        logger.warning("Evolution API not configured — message not sent.")
        return False

    phone_number = phone_jid.split("@")[0]
    url = f"{EVOLUTION_API_URL}/message/sendText/{EVOLUTION_INSTANCE}"

    try:
        import requests
        resp = requests.post(
            url,
            headers={
                "Content-Type": "application/json",
                "apikey": EVOLUTION_API_KEY,
            },
            json={"number": phone_number, "text": text},
            timeout=10,
        )
        return resp.ok
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message: {e}")
        return False


if __name__ == "__main__":
    # Initialize database tables on startup
    from database import init_db
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
