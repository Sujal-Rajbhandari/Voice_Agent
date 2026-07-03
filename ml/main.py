"""LiveKit voice-agent entrypoint.

Run it (pick the vertical with the VERTICAL env var, default = restaurant):

    # Talk to it right now through your laptop mic/speakers (no LiveKit account needed):
    python main.py console

    # Or connect to LiveKit Cloud and test in the browser Console / a web client:
    python main.py dev

    VERTICAL=hotel python main.py console     # restaurant | pest | vet | clinic | hotel
"""

from __future__ import annotations

import asyncio
import logging
import os
import sys

from dotenv import load_dotenv

# Load .env. DEEPGRAM_API_KEY and OPENAI_API_KEY are already standard names and
# read automatically by their plugins.
load_dotenv()

# Normalize the user's LiveKit variable names to the ones the worker expects.
# IMPORTANT: only do this for cloud modes (dev/start/connect). In `console`
# mode the agent runs fully locally on your mic/speakers and must NOT have a
# LIVEKIT_URL set, otherwise the worker tries to build a cloud API client and
# demands LIVEKIT_API_SECRET. So console mode needs zero LiveKit credentials.
if "console" not in sys.argv:
    if os.getenv("WEBSOCKET_URL") and not os.getenv("LIVEKIT_URL"):
        os.environ["LIVEKIT_URL"] = os.environ["WEBSOCKET_URL"]
    if os.getenv("LIVE_KIT") and not os.getenv("LIVEKIT_API_KEY"):
        os.environ["LIVEKIT_API_KEY"] = os.environ["LIVE_KIT"]

from livekit.agents import (  # noqa: E402  (must come after env setup)
    AgentSession,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
)
from livekit.plugins import deepgram, openai, silero  # noqa: E402

import db  # noqa: E402
from assistant import VerticalAssistant, hang_up  # noqa: E402
from verticals import VERTICALS, get_vertical  # noqa: E402

# Auto-hangup tuning (seconds). Override in .env if you like.
IDLE_AWAY_TIMEOUT = float(os.getenv("IDLE_AWAY_TIMEOUT", "20"))  # silence before "are you there?"
IDLE_GRACE = float(os.getenv("IDLE_GRACE", "12"))               # more silence before hanging up

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voiceagent")

# Voice per vertical so each business sounds a little different (Deepgram Aura-2).
VOICES = {
    "restaurant": "aura-2-thalia-en",   # warm female
    "pest": "aura-2-orion-en",          # calm male
    "vet": "aura-2-luna-en",            # friendly female
    "clinic": "aura-2-arcas-en",        # clear male
    "hotel": "aura-2-asteria-en",       # polished female
}


def prewarm(proc: JobProcess) -> None:
    """Load the Silero VAD once per worker process so calls start fast."""
    proc.userdata["vad"] = silero.VAD.load()


def _select_vertical(room_name: str):
    """Pick the vertical from the room name (web UI uses 'va-<vertical>-xxxx'),
    falling back to the VERTICAL env var (console mode) then 'restaurant'."""
    if room_name:
        parts = room_name.split("-")
        if len(parts) >= 2 and parts[0] == "va" and parts[1] in VERTICALS:
            return get_vertical(parts[1])
    return get_vertical(os.getenv("VERTICAL", "restaurant"))


async def entrypoint(ctx: JobContext) -> None:
    db.init_db()
    vertical = _select_vertical(ctx.room.name)
    logger.info("Starting agent for vertical: %s (%s) in room %s",
                vertical.key, vertical.business_name, ctx.room.name)

    await ctx.connect()

    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="en"),
        # Lower temperature -> more consistent tool-calling (less "I'll check…" stalling).
        llm=openai.LLM(model="gpt-4o-mini", temperature=0.4),
        tts=deepgram.TTS(model=VOICES.get(vertical.key, "aura-2-thalia-en")),
        vad=ctx.proc.userdata["vad"],
        user_away_timeout=IDLE_AWAY_TIMEOUT,  # mark caller "away" after this much silence
    )

    # --- Inactivity auto-hangup: if the caller goes silent, warn once, then hang up. ---
    grace_task: asyncio.Task | None = None

    async def _warn_then_hangup() -> None:
        try:
            await session.say("I'm sorry, I can't hear anyone there. Are you still on the line?")
            await asyncio.sleep(IDLE_GRACE)
            if session.user_state == "away":
                logger.info("Caller idle past grace period — hanging up.")
                await session.say(
                    f"Okay, I'll let you go. Thanks for calling {vertical.business_name}. Goodbye!"
                )
                await hang_up()
        except asyncio.CancelledError:
            pass  # caller came back; abort the hangup

    @session.on("user_state_changed")
    def _on_user_state(ev) -> None:
        nonlocal grace_task
        if ev.new_state == "away":
            if grace_task is None or grace_task.done():
                grace_task = asyncio.create_task(_warn_then_hangup())
        elif grace_task is not None and not grace_task.done():
            grace_task.cancel()  # caller is back (spoke again) — cancel pending hangup

    await session.start(room=ctx.room, agent=VerticalAssistant(vertical))


if __name__ == "__main__":
    db.init_db()
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
