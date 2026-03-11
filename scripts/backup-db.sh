#!/usr/bin/env bash
# MechNow – PostgreSQL backup script (use when DATABASE_URL is in use)
# Usage: ./scripts/backup-db.sh [output_dir]
# Requires: pg_dump, env DATABASE_URL or POSTGRES_* vars

set -e
OUTPUT_DIR="${1:-./backups}"
mkdir -p "$OUTPUT_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILE="$OUTPUT_DIR/mechnow_$TIMESTAMP.sql.gz"

if [ -n "$DATABASE_URL" ]; then
  pg_dump "$DATABASE_URL" | gzip > "$FILE"
else
  echo "Set DATABASE_URL or run with PostgreSQL connection details"
  exit 1
fi

echo "Backup written: $FILE"
# Retention: keep last 7 daily, 4 weekly (customize as needed)
# find "$OUTPUT_DIR" -name 'mechnow_*.sql.gz' -mtime +7 -delete
