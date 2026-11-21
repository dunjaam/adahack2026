#!/usr/bin/env bash
# Start AirShift backend (FastAPI) + frontend (Vite) together.
set -e
cd "$(dirname "$0")"
echo "▶ Backend  : http://localhost:8000  (docs /docs)"
.venv/bin/uvicorn api:app --reload --port 8000 &
BACK=$!
echo "▶ Frontend : http://localhost:5173"
( cd frontend && npm run dev )
kill $BACK 2>/dev/null || true
