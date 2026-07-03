#!/usr/bin/env bash
# Launches BOTH the LiveKit agent worker and the browser voice UI together.
# Ctrl+C stops both. Then open the http://localhost:<port> URL it prints.
set -euo pipefail
cd "$(dirname "$0")"

# .venv lives at the repo root, one level up from this ml/ folder.
source ../.venv/bin/activate

echo "🎙️  Starting agent worker (LiveKit dev mode)…"
python main.py dev &
WORKER_PID=$!

# Make sure the worker is killed when this script exits / Ctrl+C.
cleanup() { echo; echo "Stopping…"; kill "$WORKER_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

sleep 2
echo "🌐 Starting web UI…  (open the http://localhost URL below in your browser)"
python web_server.py
