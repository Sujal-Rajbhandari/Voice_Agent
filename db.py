
from __future__ import annotations

import os
import random
import sqlite3
from datetime import datetime, timezone
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "voiceagent.db")


def _connect() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create tables if they don't exist. Safe to call repeatedly."""
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS bookings (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                confirmation  TEXT UNIQUE NOT NULL,
                vertical      TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                phone         TEXT NOT NULL,
                date          TEXT NOT NULL,
                time          TEXT NOT NULL,
                party_size    INTEGER,
                service       TEXT,
                notes         TEXT,
                status        TEXT NOT NULL DEFAULT 'confirmed',
                created_at    TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                vertical      TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                phone         TEXT NOT NULL,
                message       TEXT NOT NULL,
                created_at    TEXT NOT NULL
            )
            """
        )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _new_confirmation(prefix: str) -> str:
    """e.g. 'R-4821'. Retries on the (very unlikely) collision."""
    with _connect() as conn:
        for _ in range(20):
            code = f"{prefix}-{random.randint(1000, 9999)}"
            exists = conn.execute(
                "SELECT 1 FROM bookings WHERE confirmation = ?", (code,)
            ).fetchone()
            if not exists:
                return code
    # Fallback: timestamp-based, guaranteed unique enough for a demo.
    return f"{prefix}-{int(datetime.now().timestamp()) % 100000}"

# Bookings
def count_bookings_at(vertical: str, date: str, time: str) -> int:
    """How many active bookings already exist for a given slot."""
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT COUNT(*) AS n FROM bookings
            WHERE vertical = ? AND date = ? AND time = ? AND status = 'confirmed'
            """,
            (vertical, date, time),
        ).fetchone()
        return row["n"]


def create_booking(
    *,
    vertical: str,
    confirmation_prefix: str,
    customer_name: str,
    phone: str,
    date: str,
    time: str,
    party_size: Optional[int] = None,
    service: Optional[str] = None,
    notes: Optional[str] = None,
) -> dict:
    confirmation = _new_confirmation(confirmation_prefix)
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO bookings
              (confirmation, vertical, customer_name, phone, date, time,
               party_size, service, notes, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
            """,
            (
                confirmation, vertical, customer_name, phone, date, time,
                party_size, service, notes, _now(),
            ),
        )
    return get_booking(confirmation=confirmation)


def get_booking(
    *, confirmation: Optional[str] = None, phone: Optional[str] = None,
    vertical: Optional[str] = None,
) -> Optional[dict]:
    """Look up the most recent active booking by confirmation code or phone."""
    clauses, params = [], []
    if confirmation:
        clauses.append("confirmation = ?")
        params.append(confirmation.upper())
    if phone:
        clauses.append("phone = ?")
        params.append(phone)
    if vertical:
        clauses.append("vertical = ?")
        params.append(vertical)
    if not clauses:
        return None
    where = " AND ".join(clauses)
    with _connect() as conn:
        row = conn.execute(
            f"""
            SELECT * FROM bookings
            WHERE {where} AND status = 'confirmed'
            ORDER BY id DESC LIMIT 1
            """,
            params,
        ).fetchone()
        return dict(row) if row else None


def cancel_booking(confirmation: str) -> Optional[dict]:
    with _connect() as conn:
        cur = conn.execute(
            "UPDATE bookings SET status = 'cancelled' WHERE confirmation = ? AND status = 'confirmed'",
            (confirmation.upper(),),
        )
        if cur.rowcount == 0:
            return None
    return _get_any(confirmation)


def modify_booking(confirmation: str, **changes) -> Optional[dict]:
    allowed = {"date", "time", "party_size", "service", "notes"}
    fields = {k: v for k, v in changes.items() if k in allowed and v is not None}
    if not fields:
        return get_booking(confirmation=confirmation)
    assignments = ", ".join(f"{k} = ?" for k in fields)
    params = list(fields.values()) + [confirmation.upper()]
    with _connect() as conn:
        cur = conn.execute(
            f"UPDATE bookings SET {assignments} WHERE confirmation = ? AND status = 'confirmed'",
            params,
        )
        if cur.rowcount == 0:
            return None
    return get_booking(confirmation=confirmation)


def _get_any(confirmation: str) -> Optional[dict]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM bookings WHERE confirmation = ?", (confirmation.upper(),)
        ).fetchone()
        return dict(row) if row else None


# --------------------------------------------------------------------------- #
# Messages
# --------------------------------------------------------------------------- #
def add_message(*, vertical: str, customer_name: str, phone: str, message: str) -> None:
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO messages (vertical, customer_name, phone, message, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (vertical, customer_name, phone, message, _now()),
        )
