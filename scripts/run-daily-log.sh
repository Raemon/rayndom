#!/bin/bash
# Daily log cronjob wrapper
#
# Setup (run once):
#   chmod +x scripts/run-daily-log.sh
#   crontab -e
#   # Add this line (runs at 6:00 AM daily):
#   0 6 * * * /Users/raymondarnold/Documents/coding/rayndom/scripts/run-daily-log.sh
#
# Manual run:
#   ./scripts/run-daily-log.sh              # yesterday
#   ./scripts/run-daily-log.sh 2026-03-15   # specific date

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

LOG_FILE="$PROJECT_DIR/outputs/daily-log/cron.log"
mkdir -p "$(dirname "$LOG_FILE")"

echo "===== $(date) =====" >> "$LOG_FILE"
npx tsx scripts/daily-log.ts "$@" >> "$LOG_FILE" 2>&1
echo "Exit code: $?" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
