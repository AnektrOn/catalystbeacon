# Database & Webhook Architecture

## 1. Unified Event Outbox (replaces chatty webhooks)

**Problem:** Multiple triggers (level_up, xp_milestone, achievement_unlocked, lesson_completed, etc.) each called n8n webhooks synchronously. PostgreSQL waited for each HTTP handshake before committing, causing 500ms–2s "frozen" UI on simple updates.

**Solution:** A single **event_outbox** table. Triggers only **insert** a row (~1ms). No HTTP from inside the transaction.

- **Table:** `public.event_outbox`  
  - `event_type`: `profile_update` | `user_signup` | `achievement_unlocked` | `lesson_completed`  
  - `user_id`, `payload` (jsonb), `processed` (boolean), `created_at`
- **Triggers:**  
  - `tr_event_profile_update` (AFTER UPDATE ON profiles)  
  - `tr_event_profile_insert` (AFTER INSERT ON profiles) → `user_signup`  
  - `tr_event_achievement_unlocked` (AFTER INSERT ON user_badges)  
  - `tr_event_lesson_completed` (AFTER UPDATE ON user_lesson_progress WHEN is_completed flips to true)

**Worker / n8n:** One process (cron, Edge Function, or single n8n webhook) should:

1. `SELECT * FROM event_outbox WHERE processed = false ORDER BY created_at LIMIT N`
2. For each row: call your n8n webhook (or send email, etc.) with `event_type` and `payload`
3. `UPDATE event_outbox SET processed = true WHERE id IN (...)`

This recovers ~99% of DB speed; UI no longer waits on webhooks.

---

## 2. Logic placement: Database vs codebase

| Logic type           | Place in        | Reason |
|----------------------|-----------------|--------|
| **XP / level math**  | Database (RPC)  | Atomic access to profile row; never compute rewards only in React. |
| **Data aggregation**| Database (RPC)  | e.g. `get_dashboard_data_v3` — one call instead of 6+. Replicate for Mastery/Course tabs. |
| **Input validation** | Codebase (React)| Don’t use a DB round-trip to check "habit name empty" or length. |
| **Notification UI**  | Codebase (React)| Toasts from local state; unread counts via **Supabase Realtime** subscription, not polling every 5s. |

---

## 3. RPC efficiency & God-Mode pattern

- **get_dashboard_data_v3:** Nested arrays are **limited** (e.g. teacher_feed LIMIT 5, constellation nodes LIMIT 5) so the RPC doesn’t grow to MBs as data grows.
- **get_feed_paginated(page_number, page_size):** Use for "load more" / infinite scroll on the teacher feed. Call from `dashboardService.getFeedPaginated(pageNumber, pageSize)`.

---

## 4. Legacy triggers and SQL files

- **Audit:** Run `supabase/audit_triggers.sql` (first SELECT) in the Supabase SQL Editor to list current triggers. After applying `migrations/event_outbox_unified_trigger.sql`, only `tr_event_*` triggers should remain.
- **Legacy files** (do **not** re-run on production; they define old webhook triggers):  
  `supabase-triggers-email.sql`, `create-trigger-level-up-simple.sql`, `test-webhook-simple.sql`, `create-webhook-new-user.sql`, `create-single-webhook-profiles.sql`, `supabase-webhooks-sql.sql`, `supabase-webhook-level-up-fixed.sql`, etc.  
  These are kept for reference only. The migration drops the corresponding triggers and replaces them with the outbox-based design.
