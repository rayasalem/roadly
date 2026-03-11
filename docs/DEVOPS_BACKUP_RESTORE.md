# Backup & Restore

## Database backups (when using PostgreSQL)

- **Automated:** Schedule `scripts/backup-db.sh` via cron or CI (e.g. daily). Set `DATABASE_URL` in the environment.
- **Retention:** Keep 7 daily, 4 weekly (adjust in script or separate cleanup job). Store off-host (e.g. S3, object storage).
- **Restore:** `gunzip -c mechnow_YYYYMMDD_HHMMSS.sql.gz | psql $DATABASE_URL`. Verify app and run migrations if any.

## In-memory backend (current default)

- No persistent DB yet; data is lost on restart. For production persistence, introduce PostgreSQL and run backups as above.

## Redis (optional)

- Redis AOF is enabled in docker-compose (`appendonly yes`). For critical cache/session data, consider Redis backup or replication; document restore in your runbook.
