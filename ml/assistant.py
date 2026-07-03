"""The shared voice agent.

One Agent class powers every vertical. The persona, terminology, knowledge base
and which booking fields to collect all come from the Vertical config that gets
passed in. The function tools below are generic on purpose: a "reservation", an
"appointment", a "service visit" and a "room booking" are all the same record
with different words around it.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Optional

from livekit.agents import Agent, RunContext, function_tool, get_job_context

import db
from verticals import Vertical

logger = logging.getLogger("voiceagent.assistant")


async def hang_up() -> None:
    """End the call for everyone by deleting the room (web/dev mode), with a
    shutdown fallback for console mode where there is no room API."""
    try:
        ctx = get_job_context()
    except Exception:
        return
    try:
        await ctx.delete_room()
    except Exception as e:
        logger.info("delete_room failed (%s); falling back to shutdown", e)
        try:
            ctx.shutdown(reason="call ended")
        except Exception:
            pass


def _build_instructions(v: Vertical) -> str:
    today = datetime.now()
    dates_hint = (
        f"Today is {today:%A, %B %d, %Y}. "
        f"Tomorrow is {today + timedelta(days=1):%A, %B %d, %Y}. "
        "Whenever the caller uses a relative day ('tomorrow', 'next Friday'), "
        "convert it to an absolute calendar date (YYYY-MM-DD) before calling a tool, "
        "and pass times in 24-hour HH:MM format."
    )
    return f"""{v.persona}

You are the AI phone agent for {v.business_name}. You handle inbound calls and help
callers with their {v.booking_noun}s. You are talking on the PHONE, so:
- Keep replies short and conversational. Speak numbers, dates and times in words
  a person would say out loud (say "seven thirty PM", not "19:30").
- Be efficient and quick. Ask for one missing detail at a time, but don't re-ask or
  re-confirm something the caller already told you. Keep the call moving.
- If you don't catch something, politely ask them to repeat it. Never guess at a
  name, phone number, or confirmation code — read those back to verify.
- Spell out and confirm the confirmation code after booking (e.g. "R as in Romeo, four eight two one").

*** CRITICAL — NEVER STALL. ***
Your tools run INSTANTLY; there is no waiting. So you must NEVER announce an action and
then stop talking. Do NOT say "let me check", "one moment", "I'll look that up",
"just a second", or "I'll check availability" and then end your turn — that leaves the
caller in dead silence forever. The MOMENT you have the information you need, CALL THE
TOOL in the same turn, then tell the caller the actual result. Decide and act; don't
narrate that you're about to act.

{dates_hint}

WHAT TO COLLECT FOR A {v.booking_noun.upper()}:
You always need the caller's name and a callback phone number.
{v.booking_fields}

BOOKING FLOW (do this efficiently):
1. Collect the needed details (name, phone, date, time, and the vertical-specific fields).
2. Briefly confirm them back ONCE ("So that's a table for three tomorrow at seven PM?").
3. As soon as the caller agrees, CALL check_availability right away (do not announce it).
4. If it's open, immediately CALL book_appointment in the same flow — don't ask twice.
   If it's full, offer the alternative times the tool returned.
5. Read back the confirmation code and ask if there's anything else.

HOW TO USE YOUR TOOLS:
- check_availability: call it the instant you have date + time (and party size); never
  say you'll check and wait — just call it and report the result.
- book_appointment: call it right after availability is confirmed and the caller agreed.
- look_up_booking / modify_booking / cancel_booking: ask for the confirmation code, or
  look up by phone number.
- take_message: for callbacks, prescription refills, special/concierge requests, or
  anything you can't directly do.
- transfer_to_human: when the caller asks for a person or has a complaint/issue you
  can't resolve.
- end_call: hang up the call. Use it once the conversation is genuinely over.

ENDING THE CALL:
When the caller's request is handled, ask "Is there anything else I can help you with?"
If they say no / thanks / goodbye, give a brief warm farewell and then call end_call.
Also end the call if the caller is clearly not making a real request — abusive, just
testing, or fooling around after a polite nudge — say a courteous goodbye and end_call.
Do not keep the line open with dead air or endless small talk.

BUSINESS KNOWLEDGE (use this to answer questions; do not invent facts beyond it):
{v.knowledge}

If you are asked something not covered here, say you're not certain and offer to take
a message or transfer to a team member. Never make up prices, policies, or availability.
Stay in character as {v.business_name}'s phone agent at all times.
"""


class VerticalAssistant(Agent):
    def __init__(self, vertical: Vertical):
        self.v = vertical
        super().__init__(instructions=_build_instructions(vertical))

    async def on_enter(self) -> None:
        # Deterministic, on-brand greeting the moment the call connects.
        await self.session.say(self.v.greeting, allow_interruptions=True)

    # ----------------------------------------------------------------- #
    # Tools
    # ----------------------------------------------------------------- #
    @function_tool
    async def check_availability(
        self,
        context: RunContext,
        date: str,
        time: str,
        party_size: Optional[int] = None,
    ) -> str:
        """Check whether a slot is open before booking.

        Args:
            date: Calendar date in YYYY-MM-DD format.
            time: Time in 24-hour HH:MM format (or a window like 'Morning 8-12' for service visits).
            party_size: Number of people/guests, if relevant for this business.
        """
        v = self.v
        taken = db.count_bookings_at(v.key, date, time)
        remaining = v.slot_capacity - taken
        if remaining > 0:
            return (
                f"AVAILABLE: the {date} at {time} slot is open "
                f"({remaining} of {v.slot_capacity} spots left). Proceed to confirm and book."
            )
        # Suggest nearby alternatives by nudging the hour.
        alts = []
        try:
            hh, mm = map(int, time.split(":"))
            for delta in (-60, 60, -120, 120):
                t2 = (datetime(2000, 1, 1, hh, mm) + timedelta(minutes=delta)).strftime("%H:%M")
                if db.count_bookings_at(v.key, date, t2) < v.slot_capacity:
                    alts.append(t2)
                if len(alts) >= 2:
                    break
        except ValueError:
            pass
        alt_text = f" Nearby open times: {', '.join(alts)}." if alts else ""
        return (
            f"FULL: the {date} at {time} slot is fully booked.{alt_text} "
            "Offer the alternatives, a different day, or take_message to add them to the waitlist."
        )

    @function_tool
    async def book_appointment(
        self,
        context: RunContext,
        customer_name: str,
        phone: str,
        date: str,
        time: str,
        party_size: Optional[int] = None,
        service: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> str:
        """Create a booking after the caller has confirmed all the details.

        Args:
            customer_name: Caller's full name.
            phone: Callback phone number.
            date: Date in YYYY-MM-DD format.
            time: Time in 24-hour HH:MM, or a window for service visits.
            party_size: People/guests, if relevant.
            service: Service/room/visit type, if relevant (e.g. 'Dental cleaning', 'Deluxe King').
            notes: Anything extra — seating/dietary/pet/address/provider/special requests.
        """
        v = self.v
        if db.count_bookings_at(v.key, date, time) >= v.slot_capacity:
            return "That slot just filled up — let the caller know and offer another time."
        booking = db.create_booking(
            vertical=v.key,
            confirmation_prefix=v.confirmation_prefix,
            customer_name=customer_name,
            phone=phone,
            date=date,
            time=time,
            party_size=party_size,
            service=service,
            notes=notes,
        )
        logger.info("Created booking %s", booking["confirmation"])
        return (
            f"BOOKED. Confirmation code is {booking['confirmation']}. "
            f"Details: {_summarize(booking, v)}. "
            "Read the confirmation code back to the caller letter-by-letter and confirm."
        )

    @function_tool
    async def look_up_booking(
        self,
        context: RunContext,
        confirmation: Optional[str] = None,
        phone: Optional[str] = None,
    ) -> str:
        """Find an existing booking by confirmation code or by phone number.

        Args:
            confirmation: The booking confirmation code, e.g. 'R-4821'.
            phone: The phone number used when booking.
        """
        v = self.v
        booking = db.get_booking(confirmation=confirmation, phone=phone, vertical=v.key)
        if not booking:
            return "No active booking found with those details. Ask the caller to re-check the code or phone number."
        return f"FOUND {booking['confirmation']}: {_summarize(booking, v)}."

    @function_tool
    async def modify_booking(
        self,
        context: RunContext,
        confirmation: str,
        date: Optional[str] = None,
        time: Optional[str] = None,
        party_size: Optional[int] = None,
        service: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> str:
        """Change details on an existing booking. Only pass the fields that change.

        Args:
            confirmation: The booking confirmation code.
            date: New date (YYYY-MM-DD), if changing.
            time: New time (HH:MM), if changing.
            party_size: New party size, if changing.
            service: New service/room/visit type, if changing.
            notes: Updated notes, if changing.
        """
        v = self.v
        # If moving to a new slot, make sure it has room.
        if (date or time):
            existing = db.get_booking(confirmation=confirmation, vertical=v.key)
            if existing:
                new_date = date or existing["date"]
                new_time = time or existing["time"]
                if db.count_bookings_at(v.key, new_date, new_time) >= v.slot_capacity:
                    return f"The {new_date} {new_time} slot is full — offer another time instead."
        booking = db.modify_booking(
            confirmation, date=date, time=time, party_size=party_size,
            service=service, notes=notes,
        )
        if not booking:
            return "Couldn't find an active booking with that code to modify."
        return f"UPDATED {booking['confirmation']}: {_summarize(booking, v)}. Confirm the change with the caller."

    @function_tool
    async def cancel_booking(self, context: RunContext, confirmation: str) -> str:
        """Cancel an existing booking.

        Args:
            confirmation: The booking confirmation code to cancel.
        """
        booking = db.cancel_booking(confirmation)
        if not booking:
            return "No active booking found with that code. Double-check the code with the caller."
        return (
            f"CANCELLED {booking['confirmation']}. Confirm to the caller that it's cancelled "
            "and ask if there's anything else."
        )

    @function_tool
    async def take_message(
        self,
        context: RunContext,
        customer_name: str,
        phone: str,
        message: str,
    ) -> str:
        """Record a callback request, prescription refill, concierge/special request, or waitlist add.

        Args:
            customer_name: Caller's name.
            phone: Callback number.
            message: What the caller wants — be specific.
        """
        db.add_message(
            vertical=self.v.key, customer_name=customer_name, phone=phone, message=message
        )
        return (
            "MESSAGE SAVED. Tell the caller the team will follow up at the number provided, "
            "and confirm the callback number back to them."
        )

    @function_tool
    async def transfer_to_human(self, context: RunContext, reason: str) -> str:
        """Escalate to a human team member.

        Args:
            reason: Why a transfer is needed (request for a person, complaint, edge case).
        """
        logger.info("Transfer requested: %s", reason)
        # In a real telephony deployment this would do a SIP transfer / warm handoff.
        return (
            "TRANSFER (simulated for this demo): tell the caller you're connecting them to a "
            "team member now, and that if no one picks up you can take a message instead."
        )

    @function_tool
    async def end_call(self, ctx: RunContext) -> str:
        """End / hang up the phone call. Use this when the conversation is over:
        the caller said goodbye, confirmed they need nothing else, or is clearly
        not making a genuine request (just testing or fooling around). ALWAYS say a
        short, warm goodbye in your spoken reply BEFORE this is called.
        """
        logger.info("end_call invoked — hanging up")
        # Let the goodbye finish playing before we disconnect.
        speech = ctx.session.current_speech
        if speech is not None:
            await speech.wait_for_playout()
        else:
            await ctx.session.say(f"Thank you for calling {self.v.business_name}. Goodbye!")
        await hang_up()
        return "Call ended."


def _summarize(b: dict, v: Vertical) -> str:
    parts = [f"{b['customer_name']} ({b['phone']})", f"{b['date']} at {b['time']}"]
    if b.get("service"):
        parts.append(str(b["service"]))
    if b.get("party_size"):
        parts.append(f"{b['party_size']} guests")
    if b.get("notes"):
        parts.append(f"notes: {b['notes']}")
    return ", ".join(parts)
