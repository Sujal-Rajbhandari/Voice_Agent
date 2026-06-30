"""Streamlit test console for the multi-vertical voice agent.

Run with:  streamlit run streamlit_app.py
Talks to the same DB, system prompts, and tool logic as the real voice agent —
just over text instead of voice, so you can test without a working mic.
"""

from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime, timedelta

import pandas as pd
import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

import db
from assistant import _build_instructions
from verticals import VERTICALS, get_vertical

db.init_db()

# --------------------------------------------------------------------------- #
# Page config
# --------------------------------------------------------------------------- #
st.set_page_config(
    page_title="VoiceAgent Console",
    page_icon="🎙️",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
    <style>
    /* Slim the sidebar a touch */
    [data-testid="stSidebar"] { min-width: 280px; max-width: 320px; }
    /* Compact tool-call expander */
    .tool-call { font-size: 0.78rem; color: #888; }
    /* Biz card */
    .biz-card { background: #1e2130; border-radius: 10px; padding: 14px 16px;
                margin-bottom: 12px; border-left: 4px solid #4f8ef7; }
    .biz-card h3 { margin: 0 0 4px 0; font-size: 1rem; }
    .biz-card p  { margin: 0; font-size: 0.8rem; color: #aaa; }
    </style>
    """,
    unsafe_allow_html=True,
)

# --------------------------------------------------------------------------- #
# Sidebar
# --------------------------------------------------------------------------- #
VERTICAL_ICONS = {
    "restaurant": "🍽️",
    "pest": "🐜",
    "vet": "🐾",
    "clinic": "🏥",
    "hotel": "🏨",
}

with st.sidebar:
    st.markdown("## 🎙️ VoiceAgent Console")
    st.caption("Text-based test interface — same logic as the voice agent.")
    st.divider()

    vertical_key = st.selectbox(
        "Active business vertical",
        options=list(VERTICALS.keys()),
        format_func=lambda k: f"{VERTICAL_ICONS[k]}  {VERTICALS[k].business_name}",
        key="vertical_selector",
    )

    v = get_vertical(vertical_key)

    st.markdown(
        f"""
        <div class="biz-card">
            <h3>{VERTICAL_ICONS[vertical_key]} {v.business_name}</h3>
            <p>Booking noun: <b>{v.booking_noun}</b><br>
               Slot capacity: <b>{v.slot_capacity}</b><br>
               Confirmation prefix: <b>{v.confirmation_prefix}-XXXX</b></p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("**Agent persona:**")
    st.caption(v.persona)

    st.divider()
    if st.button("🗑️ Clear conversation", use_container_width=True):
        st.session_state.chat_history = []
        st.session_state.oai_messages = []
        st.rerun()

    st.divider()
    st.markdown("**Quick test prompts:**")
    PROMPTS = {
        "restaurant": [
            "Book a table for 4 this Friday at 7:30 PM",
            "What are your hours?",
            "Do you have vegan options?",
            "Cancel my reservation R-1234",
        ],
        "pest": [
            "I have cockroaches in my kitchen, need a visit ASAP",
            "Book a rodent control visit for Monday morning",
            "Is the treatment safe for my dog?",
        ],
        "vet": [
            "My cat hasn't eaten in 2 days — is this urgent?",
            "Book a vaccination appointment for my dog",
            "I need a prescription refill for my pet",
        ],
        "clinic": [
            "I'd like a check-up with Dr. Sharma next week",
            "Do you accept walk-ins?",
            "I need to reschedule my appointment",
        ],
        "hotel": [
            "Book a Mountain-View Suite for 3 nights starting June 20",
            "What time is check-in?",
            "Do you allow pets?",
        ],
    }
    for p in PROMPTS.get(vertical_key, []):
        if st.button(p, use_container_width=True, key=f"prompt_{p[:20]}"):
            st.session_state._inject_prompt = p
            st.rerun()

# --------------------------------------------------------------------------- #
# Session state init / vertical switch reset
# --------------------------------------------------------------------------- #
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []      # [{role, content, tools_used}]
if "oai_messages" not in st.session_state:
    st.session_state.oai_messages = []      # raw OpenAI message dicts
if "last_vertical" not in st.session_state:
    st.session_state.last_vertical = vertical_key

if st.session_state.last_vertical != vertical_key:
    st.session_state.chat_history = []
    st.session_state.oai_messages = []
    st.session_state.last_vertical = vertical_key

# --------------------------------------------------------------------------- #
# OpenAI tool schemas
# --------------------------------------------------------------------------- #
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "check_availability",
            "description": "Check whether a date+time slot is open before booking.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {"type": "string", "description": "YYYY-MM-DD"},
                    "time": {"type": "string", "description": "HH:MM 24h, or window like 'Morning 8-12'"},
                    "party_size": {"type": "integer"},
                },
                "required": ["date", "time"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "book_appointment",
            "description": "Create a booking after caller confirmed all details.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {"type": "string"},
                    "phone": {"type": "string"},
                    "date": {"type": "string"},
                    "time": {"type": "string"},
                    "party_size": {"type": "integer"},
                    "service": {"type": "string"},
                    "notes": {"type": "string"},
                },
                "required": ["customer_name", "phone", "date", "time"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "look_up_booking",
            "description": "Find an existing booking by confirmation code or phone number.",
            "parameters": {
                "type": "object",
                "properties": {
                    "confirmation": {"type": "string"},
                    "phone": {"type": "string"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "modify_booking",
            "description": "Change details on an existing booking.",
            "parameters": {
                "type": "object",
                "properties": {
                    "confirmation": {"type": "string"},
                    "date": {"type": "string"},
                    "time": {"type": "string"},
                    "party_size": {"type": "integer"},
                    "service": {"type": "string"},
                    "notes": {"type": "string"},
                },
                "required": ["confirmation"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_booking",
            "description": "Cancel an existing booking.",
            "parameters": {
                "type": "object",
                "properties": {
                    "confirmation": {"type": "string"},
                },
                "required": ["confirmation"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "take_message",
            "description": "Record a callback, prescription refill, concierge request, or waitlist entry.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {"type": "string"},
                    "phone": {"type": "string"},
                    "message": {"type": "string"},
                },
                "required": ["customer_name", "phone", "message"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "transfer_to_human",
            "description": "Escalate to a human team member.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {"type": "string"},
                },
                "required": ["reason"],
            },
        },
    },
]

# --------------------------------------------------------------------------- #
# Tool executor (sync, same logic as assistant.py)
# --------------------------------------------------------------------------- #
TOOL_ICONS = {
    "check_availability": "📅",
    "book_appointment": "✅",
    "look_up_booking": "🔍",
    "modify_booking": "✏️",
    "cancel_booking": "❌",
    "take_message": "📝",
    "transfer_to_human": "👤",
}


def execute_tool(name: str, args: dict, vertical) -> str:
    if name == "check_availability":
        taken = db.count_bookings_at(vertical.key, args["date"], args["time"])
        remaining = vertical.slot_capacity - taken
        if remaining > 0:
            return (
                f"AVAILABLE: {args['date']} at {args['time']} is open "
                f"({remaining}/{vertical.slot_capacity} spots left). Proceed to confirm and book."
            )
        alts = []
        try:
            hh, mm = map(int, args["time"].split(":"))
            for delta in (-60, 60, -120, 120):
                t2 = (datetime(2000, 1, 1, hh, mm) + timedelta(minutes=delta)).strftime("%H:%M")
                if db.count_bookings_at(vertical.key, args["date"], t2) < vertical.slot_capacity:
                    alts.append(t2)
                if len(alts) >= 2:
                    break
        except ValueError:
            pass
        alt_text = f" Nearby open times: {', '.join(alts)}." if alts else ""
        return f"FULL: {args['date']} at {args['time']} is fully booked.{alt_text} Offer alternatives."

    elif name == "book_appointment":
        if db.count_bookings_at(vertical.key, args["date"], args["time"]) >= vertical.slot_capacity:
            return "That slot just filled up — offer another time."
        b = db.create_booking(
            vertical=vertical.key,
            confirmation_prefix=vertical.confirmation_prefix,
            customer_name=args["customer_name"],
            phone=args["phone"],
            date=args["date"],
            time=args["time"],
            party_size=args.get("party_size"),
            service=args.get("service"),
            notes=args.get("notes"),
        )
        return (
            f"BOOKED. Confirmation code: {b['confirmation']}. "
            f"Details: {b['customer_name']} ({b['phone']}), {b['date']} at {b['time']}."
        )

    elif name == "look_up_booking":
        b = db.get_booking(
            confirmation=args.get("confirmation"),
            phone=args.get("phone"),
            vertical=vertical.key,
        )
        if not b:
            return "No active booking found with those details."
        parts = [f"{b['customer_name']} ({b['phone']})", f"{b['date']} at {b['time']}"]
        if b.get("service"):
            parts.append(b["service"])
        if b.get("party_size"):
            parts.append(f"{b['party_size']} guests")
        if b.get("notes"):
            parts.append(f"notes: {b['notes']}")
        return f"FOUND {b['confirmation']}: {', '.join(parts)}, status: {b['status']}."

    elif name == "modify_booking":
        b = db.modify_booking(
            args["confirmation"],
            date=args.get("date"),
            time=args.get("time"),
            party_size=args.get("party_size"),
            service=args.get("service"),
            notes=args.get("notes"),
        )
        if not b:
            return "No active booking found with that code to modify."
        return f"UPDATED {b['confirmation']}: {b['date']} at {b['time']}."

    elif name == "cancel_booking":
        b = db.cancel_booking(args["confirmation"])
        if not b:
            return "No active booking found with that code."
        return f"CANCELLED {b['confirmation']}."

    elif name == "take_message":
        db.add_message(
            vertical=vertical.key,
            customer_name=args["customer_name"],
            phone=args["phone"],
            message=args["message"],
        )
        return "MESSAGE SAVED. Tell the caller the team will follow up."

    elif name == "transfer_to_human":
        return f"TRANSFER (simulated). Reason: {args.get('reason', 'not specified')}. In production this would SIP-transfer the call."

    return f"Unknown tool: {name}"


# --------------------------------------------------------------------------- #
# OpenAI call with tool loop
# --------------------------------------------------------------------------- #
def chat_with_agent(user_message: str, vertical) -> tuple[str, list[dict]]:
    """Send a user message and return (reply_text, list_of_tool_calls_made)."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # Build system prompt fresh each turn so the date stays current.
    system = _build_instructions(vertical)

    messages = [{"role": "system", "content": system}] + st.session_state.oai_messages
    messages.append({"role": "user", "content": user_message})

    tool_calls_log = []

    # Tool-call loop (handles chains of multiple calls)
    for _ in range(8):
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=TOOL_SCHEMAS,
            tool_choice="auto",
            temperature=0.3,
        )
        msg = response.choices[0].message
        messages.append(msg)

        if not msg.tool_calls:
            # Final text response
            st.session_state.oai_messages = messages[1:]  # drop system prompt
            return msg.content or "", tool_calls_log

        # Execute each tool call
        for tc in msg.tool_calls:
            name = tc.function.name
            args = json.loads(tc.function.arguments)
            result = execute_tool(name, args, vertical)
            tool_calls_log.append(
                {"icon": TOOL_ICONS.get(name, "🔧"), "name": name, "args": args, "result": result}
            )
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result,
                }
            )

    return "I'm sorry, something went wrong — please try again.", tool_calls_log


# --------------------------------------------------------------------------- #
# Main UI — chat
# --------------------------------------------------------------------------- #
st.markdown(f"### {VERTICAL_ICONS[vertical_key]} {v.business_name} — Agent Chat")
st.caption(
    "Type as if you're calling in. The agent uses the same logic, tools, and database as the voice version."
)

# Display conversation history
chat_container = st.container()
with chat_container:
    if not st.session_state.chat_history:
        st.info(
            f"Conversation started. The agent will greet you as **{v.business_name}**. "
            "Type a message below or pick a quick prompt from the sidebar."
        )
    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"], avatar="🧑" if msg["role"] == "user" else "🎙️"):
            st.markdown(msg["content"])
            if msg.get("tools_used"):
                with st.expander(f"🔧 {len(msg['tools_used'])} tool call(s)", expanded=False):
                    for t in msg["tools_used"]:
                        st.markdown(
                            f"**{t['icon']} `{t['name']}`**  \n"
                            f"Args: `{json.dumps(t['args'])}`  \n"
                            f"Result: `{t['result']}`"
                        )

# Handle sidebar quick-prompt injection
injected = st.session_state.pop("_inject_prompt", None)

user_input = st.chat_input(f"Message {v.business_name}…") or injected

if user_input:
    # Show user message immediately
    st.session_state.chat_history.append({"role": "user", "content": user_input})
    with st.chat_message("user", avatar="🧑"):
        st.markdown(user_input)

    # Stream spinner while waiting for the agent
    with st.chat_message("assistant", avatar="🎙️"):
        with st.spinner("Agent is thinking…"):
            reply, tools_used = chat_with_agent(user_input, v)
        st.markdown(reply)
        if tools_used:
            with st.expander(f"🔧 {len(tools_used)} tool call(s)", expanded=False):
                for t in tools_used:
                    st.markdown(
                        f"**{t['icon']} `{t['name']}`**  \n"
                        f"Args: `{json.dumps(t['args'])}`  \n"
                        f"Result: `{t['result']}`"
                    )

    st.session_state.chat_history.append(
        {"role": "assistant", "content": reply, "tools_used": tools_used}
    )

# --------------------------------------------------------------------------- #
# Live data dashboard (below chat)
# --------------------------------------------------------------------------- #
st.divider()

col1, col2 = st.columns(2)

with col1:
    with st.expander("📋 Bookings — all verticals", expanded=True):
        try:
            conn = sqlite3.connect(db.DB_PATH)
            df = pd.read_sql("SELECT * FROM bookings ORDER BY id DESC", conn)
            conn.close()
            if df.empty:
                st.caption("No bookings yet. Start a conversation and book something!")
            else:
                # Color the status column
                def highlight_status(val):
                    color = "#2ecc71" if val == "confirmed" else "#e74c3c"
                    return f"color: {color}; font-weight: bold"

                st.dataframe(
                    df.style.applymap(highlight_status, subset=["status"]),  # type: ignore[call-arg]
                    use_container_width=True,
                    height=280,
                )
        except Exception as e:
            st.error(f"DB error: {e}")

with col2:
    with st.expander("📝 Messages / Callbacks", expanded=True):
        try:
            conn = sqlite3.connect(db.DB_PATH)
            df_m = pd.read_sql("SELECT * FROM messages ORDER BY id DESC", conn)
            conn.close()
            if df_m.empty:
                st.caption("No messages yet.")
            else:
                st.dataframe(df_m, use_container_width=True, height=280)
        except Exception as e:
            st.error(f"DB error: {e}")

# Refresh button
if st.button("🔄 Refresh dashboard"):
    st.rerun()
