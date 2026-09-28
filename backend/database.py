import os
import bcrypt
import re
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///gemini_dist.db")

# SQLite needs check_same_thread=False for multi-threaded use
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# ============================================================
# Models
# ============================================================

class User(Base):
    __tablename__ = "users"

    phone = Column(String(20), primary_key=True)
    role = Column(String(10), nullable=False)
    is_verified = Column(Boolean, default=False)
    credits = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Link(Base):
    __tablename__ = "links"

    id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(Text, nullable=False, unique=True)
    is_used = Column(Boolean, default=False, index=True)
    assigned_to = Column(String(20), nullable=True)
    dispensed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Setting(Base):
    __tablename__ = "settings"

    key = Column(String(50), primary_key=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TransactionLog(Base):
    __tablename__ = "transaction_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    phone = Column(String(20), nullable=False, index=True)
    action = Column(String(30), nullable=False)
    details = Column(Text, nullable=True)
    performed_by = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Create all tables."""
    Base.metadata.create_all(engine)


# ============================================================
# Tool functions (used by LangChain tools and directly)
# ============================================================

def get_or_create_user(phone: str, role: str = "customer"):
    """Get existing user or create new one."""
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(phone=phone).first()
        if not user:
            user = User(phone=phone, role=role, credits=0)
            session.add(user)
            session.commit()
        return user
    finally:
        session.close()


def classify_user(phone: str):
    """Return user dict or None if not found."""
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(phone=phone).first()
        if not user:
            return None
        return {
            "phone": user.phone,
            "role": user.role,
            "is_verified": user.is_verified,
            "credits": user.credits,
        }
    finally:
        session.close()


def verify_pin(phone: str, pin: str) -> dict:
    """Verify reseller PIN against bcrypt hash in settings."""
    session = SessionLocal()
    try:
        setting = session.query(Setting).filter_by(key="reseller_pin_hash").first()
        if not setting:
            return {"success": False, "message": "PIN not configured."}

        if bcrypt.checkpw(pin.encode(), setting.value.encode()):
            user = session.query(User).filter_by(phone=phone).first()
            if user:
                user.is_verified = True
                session.commit()
            return {"success": True, "message": "PIN verified successfully."}
        else:
            return {"success": False, "message": "Incorrect PIN. Please try again."}
    finally:
        session.close()


def check_credits(phone: str) -> dict:
    """Return credit balance for a user."""
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(phone=phone).first()
        if not user:
            return {"credits": 0, "found": False}
        return {"credits": user.credits, "found": True}
    finally:
        session.close()


def dispense_link(phone: str) -> dict:
    """Atomically dispense one link. Returns dict with url or error."""
    session = SessionLocal()
    try:
        with session.begin():
            link = (
                session.query(Link)
                .filter_by(is_used=False)
                .order_by(Link.id.asc())
                .with_for_update(skip_locked=True)
                .first()
            )
            if not link:
                return {"success": False, "message": "No links available. Contact admin."}

            user = session.query(User).filter_by(phone=phone).with_for_update().first()
            if not user or user.credits < 1:
                return {"success": False, "message": "No credits remaining. Contact admin."}

            link.is_used = True
            link.assigned_to = phone
            link.dispensed_at = datetime.utcnow()
            user.credits -= 1

            log = TransactionLog(
                phone=phone,
                action="link_dispense",
                details=f'{{"link_id": {link.id}, "url": "{link.url}"}}',
            )
            session.add(log)

        return {"success": True, "url": link.url}
    finally:
        session.close()


def add_credits(phone: str, delta: int, performed_by: str = None) -> dict:
    """Add or deduct credits for a user."""
    if delta == 0:
        return {"success": False, "message": "Delta cannot be zero."}
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(phone=phone).first()
        if not user:
            return {"success": False, "message": "User not found."}

        new_credits = user.credits + delta
        if new_credits < 0:
            return {"success": False, "message": "Credits cannot go below zero."}

        user.credits = new_credits
        log = TransactionLog(
            phone=phone,
            action="credit_add" if delta > 0 else "credit_deduct",
            details=f'{{"delta": {delta}, "new_balance": {new_credits}}}',
            performed_by=performed_by,
        )
        session.add(log)
        session.commit()
        return {"success": True, "new_credits": new_credits}
    finally:
        session.close()


def bulk_ingest_links(urls: list[str]) -> dict:
    """Bulk insert unique links."""
    session = SessionLocal()
    try:
        existing_urls = {row[0] for row in session.query(Link.url).all()}
        new_links = []
        duplicates = 0
        for url in urls:
            url = url.strip()
            if not url:
                continue
            if url in existing_urls:
                duplicates += 1
                continue
            new_links.append(Link(url=url, is_used=False))
            existing_urls.add(url)

        session.bulk_save_objects(new_links)
        session.commit()
        return {
            "success": True,
            "added": len(new_links),
            "duplicates_skipped": duplicates,
        }
    finally:
        session.close()


def get_setting(key: str) -> str | None:
    session = SessionLocal()
    try:
        setting = session.query(Setting).filter_by(key=key).first()
        return setting.value if setting else None
    finally:
        session.close()


def set_setting(key: str, value: str):
    session = SessionLocal()
    try:
        setting = session.query(Setting).filter_by(key=key).first()
        if setting:
            setting.value = value
        else:
            setting = Setting(key=key, value=value)
            session.add(setting)
        session.commit()
    finally:
        session.close()


def log_transaction(phone: str, action: str, details: str = None, performed_by: str = None):
    session = SessionLocal()
    try:
        log = TransactionLog(
            phone=phone, action=action, details=details, performed_by=performed_by
        )
        session.add(log)
        session.commit()
    finally:
        session.close()
