#!/usr/bin/env bash
# Sufuf — local MySQL backup
# Runs mysqldump, gzips, keeps last N days only.
# Add to crontab:
#   0 3 * * *  /home/sufuf/sufuf/backend/scripts/backup-db.sh >> /var/log/sufuf-backup.log 2>&1

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/home/sufuf/backups}"
RETAIN_DAYS="${RETAIN_DAYS:-14}"
DB_NAME="${DB_NAME:-sufuf_sufuf_db}"
DB_USER="${DB_USER:-sufuf_Notouch}"
# DB_PASS must be set in env (do NOT hardcode secrets)
DB_PASS="${DB_PASS:?DB_PASS env var is required}"

mkdir -p "$BACKUP_DIR"
TS=$(date +"%Y%m%d-%H%M%S")
OUT="$BACKUP_DIR/${DB_NAME}-${TS}.sql.gz"

echo "[$(date -Iseconds)] starting backup → $OUT"
mysqldump \
  --user="$DB_USER" \
  --password="$DB_PASS" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --no-tablespaces \
  --default-character-set=utf8mb4 \
  "$DB_NAME" | gzip -c > "$OUT"

SIZE=$(du -h "$OUT" | cut -f1)
echo "[$(date -Iseconds)] backup complete · $SIZE"

# Prune old backups
find "$BACKUP_DIR" -name "${DB_NAME}-*.sql.gz" -type f -mtime +${RETAIN_DAYS} -print -delete
echo "[$(date -Iseconds)] pruned files older than ${RETAIN_DAYS} days"
