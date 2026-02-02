# process-event-outbox

Edge Function that processes the **event_outbox** table in batches and POSTs to n8n.

- **Runs:** Via Supabase Cron (e.g. every minute) or external scheduler every 30s.
- **Secrets:** Set `N8N_WEBHOOK_URL` in Dashboard → Edge Functions → process-event-outbox → Secrets.
- **Flow:** Fetches unprocessed rows with `get_event_outbox_batch(50)`, POSTs `{ events: [...] }` to n8n, then calls `mark_event_outbox_processed(ids)` on success.

See `docs/DATABASE_AND_WEBHOOK_ARCHITECTURE.md` for the full outbox design.
