#!/usr/bin/env bash
# Idempotent: first run sets up venv + installs deps, every run thereafter just starts the server.
# Prefers uv (much faster + better resolver) if available, falls back to python venv + pip.
set -e

cd "$(dirname "$0")"

PYTHON_BIN="${PYTHON_BIN:-python3}"
VENV_DIR=".venv"
REQ_FILE="requirements.txt"
INSTALL_STAMP="$VENV_DIR/.deps-installed-at"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "[expression-sidecar] error: $PYTHON_BIN not found on PATH" >&2
  exit 1
fi

USE_UV=0
if command -v uv >/dev/null 2>&1; then
  USE_UV=1
fi

# If there's a venv but no install stamp, the previous install almost certainly failed
# (e.g. resolver blew up midway). Wipe so we don't retry on top of partial state.
if [ -d "$VENV_DIR" ] && [ ! -f "$INSTALL_STAMP" ]; then
  echo "[expression-sidecar] wiping incomplete venv from a prior failed install..."
  rm -rf "$VENV_DIR"
fi

if [ ! -d "$VENV_DIR" ]; then
  if [ "$USE_UV" -eq 1 ]; then
    echo "[expression-sidecar] creating venv with uv..."
    uv venv --python "$PYTHON_BIN" "$VENV_DIR"
  else
    echo "[expression-sidecar] creating venv with $PYTHON_BIN..."
    "$PYTHON_BIN" -m venv "$VENV_DIR"
  fi
fi

source "$VENV_DIR/bin/activate"

if [ ! -f "$INSTALL_STAMP" ] || [ "$REQ_FILE" -nt "$INSTALL_STAMP" ]; then
  echo "[expression-sidecar] installing Python deps (this can take a couple minutes the first time)..."
  if [ "$USE_UV" -eq 1 ]; then
    echo "[expression-sidecar] using uv for installation"
    uv pip install -r "$REQ_FILE"
  else
    echo "[expression-sidecar] using pip (install 'uv' via brew for ~10x faster setup)"
    pip install --upgrade pip >/dev/null
    pip install --prefer-binary -r "$REQ_FILE"
  fi
  touch "$INSTALL_STAMP"
fi

echo "[expression-sidecar] starting on ws://localhost:7681/ws/au-stream"
echo "[expression-sidecar] first run downloads ~few hundred MB of Py-Feat model weights -- be patient."
exec python server.py
