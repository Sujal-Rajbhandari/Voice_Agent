# Multi-Vertical AI Voice Agent

An inbound-call voice agent built on **LiveKit Agents**, **Deepgram** (speech-to-text
Nova-3 + text-to-speech Aura-2) and **OpenAI** (gpt-4o-mini brain). One shared engine
serves five business verticals — you switch with a single env var:

| Vertical | Business | Books… |
|---|---|---|
| `restaurant` | Sajilo Bistro | reservations |
| `pest` | ShieldGuard Pest Control | service visits |
| `vet` | Paws & Care Veterinary | appointments |
| `clinic` | Himalaya Family Health Clinic | appointments |
| `hotel` | Annapurna Grand Hotel | room bookings |

The agent can: greet callers, **book / cancel / modify / look up** bookings, check
capacity-aware availability, answer FAQs from each vertical's knowledge base, capture
name + phone, take messages (callbacks / Rx refills / concierge / waitlist), escalate
to a human, handle barge-in interruptions, confirm details back, and recover from
"I didn't catch that." Bookings persist in SQLite (`data/voiceagent.db`).

No Twilio needed — designed for testing from anywhere (including Nepal) via your
laptop mic or LiveKit's browser tools.

---

## 1. Setup

```bash
cd voiceagent
python3.12 -m venv .venv          # 3.10+ required; already created here
source .venv/bin/activate
pip install -r requirements.txt
```

Create `.env` (see `.env.example`). At minimum you need:

```
DEEPGRAM_API_KEY="..."
OPENAI_API_KEY="..."
```

`WEBSOCKET_URL` / `LIVE_KIT` / `LIVEKIT_API_SECRET` are only needed for browser
testing (`dev` mode), **not** for local mic testing (`console` mode).

---

## 2. Talk to it — Browser Voice UI (recommended) 🎙️

A built-in web page lets you **pick a business, choose your mic, see a live mic-level
meter, connect, and actually talk** to the agent — with a live transcript. This is the
easiest way to confirm everything works (browser mic permissions are simpler than the
terminal's). Requires `WEBSOCKET_URL`, `LIVE_KIT`, and `LIVEKIT_API_SECRET` in `.env`.

**One command (starts the agent + the web UI together):**

```bash
./start_web.sh
```

Then open the `http://localhost:<port>` URL it prints (it auto-picks a free port if
8000 is busy). In the page:
1. Pick the **business vertical** from the dropdown.
2. Pick your **microphone** — the meter bar should jump when you talk (mic check!).
3. Click **Connect & Talk**, allow mic access, and start speaking after the greeting.
4. Switch vertical anytime: hang up, choose another business, connect again — no restart.

> Prefer two terminals? Run `python main.py dev` in one and `python web_server.py` in
> another, then open the printed URL.

## 3. Talk to it — local mic in the terminal (no LiveKit account)

```bash
python main.py console
```

Speak into your mic; you'll hear the agent reply. Press `Ctrl+C` to end.
Switch vertical:

```bash
VERTICAL=hotel  python main.py console
VERTICAL=vet    python main.py console
```

(If the mic meter stays flat, grant your terminal app Microphone permission in
macOS System Settings → Privacy & Security → Microphone, then fully restart it.)

## 4. "Phone call" path (later, for real telephony)

Because Twilio isn't available in Nepal, when you're ready for actual PSTN calls use
**LiveKit SIP** with a SIP trunk provider that serves your region (e.g. Plivo,
Telnyx, or a local SIP provider). The agent code doesn't change — you just add a SIP
inbound trunk + dispatch rule in LiveKit and point a number at it. Until then,
`console`/`dev` fully exercise the conversation logic.

---

## 5. Verify bookings persisted

After a call where you booked/cancelled something:

```bash
python admin.py            # dump all bookings + messages
python admin.py bookings
```

---

## Project layout

```
main.py          LiveKit worker entrypoint; wires Deepgram + OpenAI + LiveKit, picks voice
assistant.py     The shared Agent: persona prompt + all function tools
verticals.py     Per-vertical config (persona, greeting, knowledge base, capacity)
db.py            SQLite datastore (bookings + messages), capacity-aware availability
web_server.py    Token + static server for the browser voice UI (auto-picks a free port)
web/index.html   Browser voice UI: vertical/mic pickers, mic meter, transcript
start_web.sh     One command to launch the agent worker + web UI together
streamlit_app.py Text-based test console (type instead of talk) + live booking dashboard
admin.py         Inspect saved bookings/messages from the CLI
data/            SQLite DB lives here (created on first run)
```

Add a new vertical = add one `Vertical(...)` entry in `verticals.py`. No engine changes.

---

## What's fully working vs. stubbed

**Fully working**
- Real-time voice loop: Deepgram STT → OpenAI → Deepgram TTS over LiveKit, with VAD
  turn-taking and barge-in.
- Book / look up / modify / cancel, persisted to SQLite with confirmation codes.
- Capacity-aware availability with nearby-slot suggestions.
- Take-message (callbacks, Rx refills, concierge, waitlist).
- Five distinct vertical personas + knowledge bases + emergency/urgency screening
  (vet & clinic) and infestation triage (pest).
- **Auto-hangup**: the agent ends the call (and disconnects the browser) when the
  caller is done — via an `end_call` tool after a goodbye — and on inactivity: after
  `IDLE_AWAY_TIMEOUT` of silence it asks "are you still there?", then hangs up after
  another `IDLE_GRACE` (tunable in `.env`). Keeps time-wasters from holding the line.

**Stubbed / simplified (intentional for a local demo)**
- `transfer_to_human` is simulated (speaks a handoff line). Real warm transfer needs
  LiveKit SIP + a destination number.
- Availability uses a simple per-slot capacity counter, not a real booking calendar
  with business-hours validation.
- No real PSTN phone number (see §4). No SMS confirmations, payments, or CRM sync.
- Knowledge bases are hand-written samples, not connected to a live menu/EHR/PMS.
```
