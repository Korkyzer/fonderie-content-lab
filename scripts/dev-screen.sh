#!/usr/bin/env bash

set -euo pipefail

SESSION_NAME="fonderie-content-lab-dev"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/.next/dev"
LOG_FILE="$LOG_DIR/screen.log"
PID_FILE="$LOG_DIR/screen.pid"
PID_START_FILE="$LOG_DIR/screen.pid.start"

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
  [[ -n "$pid" ]] && pid_is_dev_server "$pid"
}

cleanup_pid_file() {
  local pid

  pid="$(read_pid)"
  if [[ -f "$PID_FILE" ]] && { [[ -z "$pid" ]] || ! pid_alive "$pid"; }; then
    rm -f "$PID_FILE" "$PID_START_FILE"
  fi
}

pid_alive() {
  local pid="$1"

  [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null
}

pid_command() {
  local pid="$1"

  if [[ -r "/proc/$pid/cmdline" ]]; then
    tr '\0' ' ' <"/proc/$pid/cmdline" || true
    return
  fi

  ps -o command= -p "$pid" 2>/dev/null || true
}

pid_start_time() {
  local pid="$1"

  ps -o lstart= -p "$pid" 2>/dev/null | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || true
}

write_pid_start_time() {
  local pid="$1"
  local start_time

  start_time="$(pid_start_time "$pid")"
  if [[ -n "$start_time" ]]; then
    printf '%s\n' "$start_time" >"$PID_START_FILE"
  fi
}

pid_has_expected_command() {
  local pid="$1"
  local command

  command="$(pid_command "$pid")"
  [[ "$command" == *"npm"*run\ dev* || "$command" == *"next dev"* ]]
}

pid_has_expected_start_time() {
  local pid="$1"
  local current_start_time
  local saved_start_time

  [[ -f "$PID_START_FILE" ]] || return 1

  current_start_time="$(pid_start_time "$pid")"
  saved_start_time="$(tr -d '\r\n' <"$PID_START_FILE")"

  [[ -n "$current_start_time" ]] && [[ "$current_start_time" == "$saved_start_time" ]]
}

pid_is_dev_server() {
  local pid="$1"

  pid_alive "$pid" && pid_has_expected_command "$pid" && pid_has_expected_start_time "$pid"
}

require_screen() {
  if ! command -v screen >/dev/null 2>&1; then
    echo "screen is required to run the persistent dev server."
    exit 1
  fi
}

start() {
  local dev_pid
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

  rm -f "$LOG_FILE" "$PID_FILE" "$PID_START_FILE"
  screen -dmS "$SESSION_NAME" bash -lc "cd \"$ROOT_DIR\" && npm run dev > \"$LOG_FILE\" 2>&1 & echo \$! > \"$PID_FILE\"; wait \$!"
  sleep 2

  dev_pid="$(read_pid)"
  if [[ -z "$dev_pid" ]] || ! pid_alive "$dev_pid"; then
    echo "Failed to start the persistent dev server."
    if [[ -f "$LOG_FILE" ]]; then
      tail -20 "$LOG_FILE"
    fi
    exit 1
  fi

  write_pid_start_time "$dev_pid"

  if ! pid_running; then
    echo "Failed to validate the persistent dev server process."
    if [[ -f "$LOG_FILE" ]]; then
      tail -20 "$LOG_FILE"
    fi
    rm -f "$PID_FILE" "$PID_START_FILE"
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

  if [[ -n "$pid" ]] && pid_alive "$pid"; then
    if pid_is_dev_server "$pid"; then
      kill "$pid" 2>/dev/null || true
      sleep 1
      if kill -0 "$pid" 2>/dev/null; then
        kill -9 "$pid" 2>/dev/null || true
      fi
    else
      echo "PID $pid is not the dev server, skipping"
    fi
  fi

  rm -f "$PID_FILE" "$PID_START_FILE"

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
