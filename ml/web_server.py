"""Token + static web server for the browser voice UI.

Serves web/index.html and mints LiveKit access tokens. The room name encodes the
chosen vertical ('va-<vertical>-xxxx') so the agent worker picks the right
persona automatically (see _select_vertical in main.py).

Run (in its own terminal, alongside `python main.py dev`):

    python web_server.py            # then open http://localhost:8000
"""

from __future__ import annotations

import os
import secrets

from aiohttp import web
from dotenv import load_dotenv
from livekit import api

from verticals import VERTICALS

load_dotenv()

LIVEKIT_URL = os.getenv("WEBSOCKET_URL") or os.getenv("LIVEKIT_URL")
API_KEY = os.getenv("LIVE_KIT") or os.getenv("LIVEKIT_API_KEY")
API_SECRET = os.getenv("LIVEKIT_API_SECRET")
WEB_DIR = os.path.join(os.path.dirname(__file__), "web")
PORT = int(os.getenv("WEB_PORT", "8000"))


def _check_config() -> None:
    missing = [
        name
        for name, val in (
            ("WEBSOCKET_URL / LIVEKIT_URL", LIVEKIT_URL),
            ("LIVE_KIT / LIVEKIT_API_KEY", API_KEY),
            ("LIVEKIT_API_SECRET", API_SECRET),
        )
        if not val
    ]
    if missing:
        raise SystemExit(
            "Missing required LiveKit settings in .env: " + ", ".join(missing) +
            "\nThe browser UI needs all three (get them at cloud.livekit.io -> Settings -> Keys)."
        )


async def index(request: web.Request) -> web.Response:
    return web.FileResponse(os.path.join(WEB_DIR, "index.html"))


async def get_token(request: web.Request) -> web.Response:
    vertical = request.query.get("vertical", "restaurant")
    if vertical not in VERTICALS:
        vertical = "restaurant"
    room = f"va-{vertical}-{secrets.token_hex(3)}"
    identity = f"web-{secrets.token_hex(2)}"

    grant = api.VideoGrants(
        room_join=True, room=room, can_publish=True,
        can_subscribe=True, can_publish_data=True,
    )
    token = (
        api.AccessToken(API_KEY, API_SECRET)
        .with_identity(identity)
        .with_name("Web Tester")
        .with_grants(grant)
        .to_jwt()
    )
    return web.json_response(
        {
            "token": token,
            "url": LIVEKIT_URL,
            "room": room,
            "vertical": vertical,
            "business_name": VERTICALS[vertical].business_name,
        }
    )


async def verticals_list(request: web.Request) -> web.Response:
    return web.json_response(
        [
            {"key": k, "business_name": v.business_name, "booking_noun": v.booking_noun}
            for k, v in VERTICALS.items()
        ]
    )


def build_app() -> web.Application:
    app = web.Application()
    app.router.add_get("/", index)
    app.router.add_get("/token", get_token)
    app.router.add_get("/verticals", verticals_list)
    return app


def main() -> None:
    _check_config()
    # Try PORT, then the next few, so an occupied port doesn't block startup.
    for port in range(PORT, PORT + 12):
        try:
            print(f"\n  Voice UI  ->  http://localhost:{port}")
            print(f"  LiveKit URL: {LIVEKIT_URL}")
            print("  Keep `python main.py dev` running in another terminal.\n")
            web.run_app(build_app(), host="0.0.0.0", port=port, print=None)
            return
        except OSError as e:
            if e.errno in (48, 98):  # address already in use
                print(f"  ⚠️  port {port} is busy, trying {port + 1}…")
                continue
            raise
    raise SystemExit(f"No free port found in range {PORT}-{PORT + 11}.")


if __name__ == "__main__":
    main()
