"""
SHIELD Authentication Module
==============================
- SQLite user storage (no external DB needed)
- bcrypt password hashing
- JWT tokens (30-day expiry)
- Email + password signup / login
"""

import os
import sqlite3
import hashlib
import secrets
import time
from datetime import datetime, timedelta
from typing import Optional

# ── JWT support (python-jose or fallback) ──────────────────────────────────
try:
    from jose import JWTError, jwt
    HAS_JOSE = True
except ImportError:
    HAS_JOSE = False
    print("Warning: python-jose not installed. Using simple token fallback.")

# ── Password hashing (passlib or fallback using sha256) ───────────────────
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    HAS_PASSLIB = True
except ImportError:
    HAS_PASSLIB = False
    print("Warning: passlib not installed. Using sha256 fallback.")

# ── Config ─────────────────────────────────────────────────────────────────
DB_PATH = os.path.join(os.path.dirname(__file__), "shield_users.db")
JWT_SECRET = os.getenv("JWT_SECRET", "shield-secret-key-change-in-production-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30


# ── DB Setup ───────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            email     TEXT    UNIQUE NOT NULL,
            name      TEXT    NOT NULL,
            password  TEXT    NOT NULL,
            created_at TEXT   NOT NULL
        )
    """)
    conn.commit()
    conn.close()


# ── Password helpers ───────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    if HAS_PASSLIB:
        return pwd_context.hash(plain)
    # Simple sha256 fallback (not as secure — install passlib for production)
    salt = secrets.token_hex(16)
    h = hashlib.sha256((salt + plain).encode()).hexdigest()
    return f"{salt}:{h}"


def verify_password(plain: str, hashed: str) -> bool:
    if HAS_PASSLIB:
        try:
            return pwd_context.verify(plain, hashed)
        except Exception:
            pass
    # Fallback sha256
    if ":" in hashed:
        salt, h = hashed.split(":", 1)
        return hashlib.sha256((salt + plain).encode()).hexdigest() == h
    return False


# ── JWT helpers ────────────────────────────────────────────────────────────
def create_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS),
        "iat": datetime.utcnow(),
    }
    if HAS_JOSE:
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    # Fallback: base64-encoded JSON (insecure — install python-jose for production)
    import base64, json
    payload["exp"] = payload["exp"].isoformat()
    payload["iat"] = payload["iat"].isoformat()
    return base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()


def decode_token(token: str) -> Optional[dict]:
    try:
        if HAS_JOSE:
            return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        import base64, json
        data = json.loads(base64.urlsafe_b64decode(token.encode() + b"=="))
        return data
    except Exception:
        return None


# ── User CRUD ──────────────────────────────────────────────────────────────
def create_user(email: str, name: str, password: str) -> dict:
    """Register a new user. Returns user dict or raises ValueError."""
    conn = get_db()
    try:
        existing = conn.execute("SELECT id FROM users WHERE email=?", (email.lower(),)).fetchone()
        if existing:
            raise ValueError("An account with this email already exists.")
        hashed = hash_password(password)
        conn.execute(
            "INSERT INTO users (email, name, password, created_at) VALUES (?,?,?,?)",
            (email.lower(), name, hashed, datetime.utcnow().isoformat()),
        )
        conn.commit()
        row = conn.execute("SELECT id, email, name, created_at FROM users WHERE email=?", (email.lower(),)).fetchone()
        return dict(row)
    finally:
        conn.close()


def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Verify email + password. Returns user dict or None."""
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM users WHERE email=?", (email.lower(),)).fetchone()
        if not row:
            return None
        if not verify_password(password, row["password"]):
            return None
        return {"id": row["id"], "email": row["email"], "name": row["name"]}
    finally:
        conn.close()


def get_user_by_id(user_id: int) -> Optional[dict]:
    conn = get_db()
    try:
        row = conn.execute("SELECT id, email, name, created_at FROM users WHERE id=?", (user_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


# ── Init on import ─────────────────────────────────────────────────────────
init_db()
