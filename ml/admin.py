"""Tiny CLI to inspect what the agent saved — proves bookings/messages persist.

    python admin.py            # show all bookings + messages
    python admin.py bookings   # only bookings
    python admin.py messages   # only messages
"""

import sqlite3
import sys

from db import DB_PATH, init_db


def show(table: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(f"SELECT * FROM {table} ORDER BY id DESC").fetchall()
    print(f"\n=== {table.upper()} ({len(rows)}) ===")
    for r in rows:
        print(dict(r))
    conn.close()


if __name__ == "__main__":
    init_db()
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    if which in ("all", "bookings"):
        show("bookings")
    if which in ("all", "messages"):
        show("messages")
