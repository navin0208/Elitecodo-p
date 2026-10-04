#!/usr/bin/env bash
cd "$(dirname "$0")"

echo "Stopping all EliteCodo processes and tunnels..."
if [ -d logs ]; then
  for pidfile in logs/*.pid; do
    if [ -f "$pidfile" ]; then
      pid=$(cat "$pidfile" 2>/dev/null)
      if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
      fi
      rm -f "$pidfile"
    fi
  done
fi

for port in 8583 8080 4001 3001 4200 5050; do
  pid=$(lsof -tiTCP:$port -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pid" ]; then
    kill -9 $pid 2>/dev/null || true
  fi
done

pkill -f "ngrok http 5050" 2>/dev/null || true

echo "All services stopped."
