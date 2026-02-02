# Database & Webhook Architecture

## 1. Unified Event Outbox (replaces chatty webhooks)

**Problem:** Multiple triggers (level_up, xp_milestone, achievement_unlocked, lesson_completed, etc.) each called n8n webhooks synchronously. PostgreSQL waited for each HTTP handshake before committing, causing 500ms–2s "frozen" UI on simple updates.

**Solution:** A single **event_outbox** table. Triggers only **insert** a row (~1ms). No HTTP from inside the transaction.

- **Table:** `public.event_outbox`  
  - `event_type`: `profile_update` | `user_signup` | `achievement_unlocked` | `lesson_completed` | `habit_completed`  
  - `user_id`, `payload` (jsonb), `processed` (boolean), `created_at`
- **Triggers:**  
  - `tr_event_profile_update` (AFTER UPDATE ON profiles)  
  - `tr_event_profile_insert` (AFTER INSERT ON profiles) → `user_signup`  
  - `tr_event_achievement_unlocked` (AFTER INSERT ON user_badges)  
  - `tr_event_lesson_completed` (AFTER UPDATE ON user_lesson_progress WHEN is_completed flips to true)  
  - `tr_event_habit_completed` (AFTER INSERT ON user_habit_completions)

**Centralized processing:** The **process-event-outbox** Edge Function runs every 30 seconds (Supabase Cron):

1. Calls RPC `get_event_outbox_batch(50)` to fetch unprocessed rows.
2. POSTs a single batched payload `{ events: [...] }` to the n8n webhook URL.
3. On 2xx response, calls RPC `mark_event_outbox_processed(ids)` so rows are not retried.

**Setup:**

- Set **N8N_WEBHOOK_URL** in Supabase Dashboard → Edge Functions → process-event-outbox → Secrets.
- Schedule the function: Dashboard → Edge Functions → process-event-outbox → Cron. Standard cron is per-minute; use `* * * * *` (every minute) or an external scheduler (e.g. GitHub Actions, cron job) to POST to the function URL every 30 seconds if you need sub-minute batching.

**RPCs:** `get_event_outbox_batch(p_limit)`, `mark_event_outbox_processed(p_ids uuid[])` — see `migrations/event_outbox_processor_rpc.sql`.

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
- **get_mastery_data_v1(user_id, start_date, end_date):** Single RPC for Mastery page — returns `user_habits`, `habits_library`, `completions`, `user_toolbox`, `toolbox_library`, `calendar_events`. Use `masteryService.getMasteryDataConsolidated()` so the Mastery screen populates all sections in one call (CalendarTabMobile already uses it).
- **get_course_catalog_data_v1(user_id):** Single RPC for Course Catalog — returns `user_xp`, `schools`, `courses`, `user_progress`. Use `courseService.getCourseCatalogDataConsolidated()`.
- **get_user_roadmap_details(user_id, masterschool):** Single RPC for Roadmap — returns lessons with `is_completed` derived from **user_lesson_progress** (canonical source). Ensures users who already had progress (before the new flow) see correct completion state; see `migrations/get_user_roadmap_details_rpc.sql`.

---

## 4. Legacy triggers and SQL files

- **Audit:** Run `supabase/audit_triggers.sql` (first SELECT) in the Supabase SQL Editor to list current triggers. After applying `migrations/event_outbox_unified_trigger.sql`, only `tr_event_*` triggers should remain.
- **Legacy files** (do **not** re-run on production; they define old webhook triggers):  
  `supabase-triggers-email.sql`, `create-trigger-level-up-simple.sql`, `test-webhook-simple.sql`, `create-webhook-new-user.sql`, `create-single-webhook-profiles.sql`, `supabase-webhooks-sql.sql`, `supabase-webhook-level-up-fixed.sql`, etc.  
  These are kept for reference only. The migration drops the corresponding triggers and replaces them with the outbox-based design.
