#!/usr/bin/env bash

set -euo pipefail

SESSION_NAME="fonderie-content-lab-dev"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/.next/dev"
LOG_FILE="$LOG_DIR/screen.log"
PID_FILE="$LOG_DIR/screen.pid"

screen_running() {
  local sessions

  sessions="$(screen -ls 2>/dev/null || true)"
  grep -q "[.]${SESSION_NAME}[[:space:]]" <<<"$sessions"
}

read_pid() {
  if [[ -f "$PID_FILE" ]]; then
    tr -d '[:space:]' <"$PID_FILE"
  fi
}

pid_running() {
  local pid

  pid="$(read_pid)"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

cleanup_pid_file() {
  if [[ -f "$PID_FILE" ]] && ! pid_running; then
    rm -f "$PID_FILE"
  fi
}

require_screen() {
  if ! command -v screen >/dev/null 2>&1; then
    echo "screen is required to run the persistent dev server."
    exit 1
  fi
}

start() {
  local port_pid

  require_screen
  mkdir -p "$LOG_DIR"
  cleanup_pid_file

  if pid_running; then
    echo "Persistent dev server is already running."
    echo "PID: $(read_pid)"
    exit 0
  fi

  port_pid="$(lsof -tiTCP:3000 -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$port_pid" ]]; then
    echo "Port 3000 is already in use by PID $port_pid."
    exit 1
  fi

  rm -f "$LOG_FILE" "$PID_FILE"
  screen -dmS "$SESSION_NAME" bash -lc "cd \"$ROOT_DIR\" && npm run dev > \"$LOG_FILE\" 2>&1 & echo \$! > \"$PID_FILE\"; wait \$!"
  sleep 2

  if ! pid_running; then
    echo "Failed to start the persistent dev server."
    if [[ -f "$LOG_FILE" ]]; then
      tail -20 "$LOG_FILE"
    fi
    exit 1
  fi

  echo "Persistent dev server started."
  echo "PID: $(read_pid)"
  echo "Session: $SESSION_NAME"
  echo "Log: $LOG_FILE"
}

stop() {
  local pid

  cleanup_pid_file
  pid="$(read_pid)"

  if [[ -z "$pid" ]] && ! screen_running; then
    echo "Persistent dev server is not running."
    exit 0
  fi

  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  fi

  rm -f "$PID_FILE"

  if screen_running; then
    screen -S "$SESSION_NAME" -X quit || true
  fi

  echo "Persistent dev server stopped."
}

status() {
  cleanup_pid_file

  if pid_running; then
    echo "Persistent dev server is running."
    echo "PID: $(read_pid)"
    echo "Session: $SESSION_NAME"
    echo "Log: $LOG_FILE"
    exit 0
  fi

  echo "Persistent dev server is not running."
  exit 1
}

case "${1:-}" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  status)
    status
    ;;
  *)
    echo "Usage: ./scripts/dev-screen.sh {start|stop|status}"
    exit 1
    ;;
esac
