# Routing Architecture

## 1. Roadmap parameter (no logical gap)

- **Route:** `/roadmap/:masterschool` and `/roadmap/ignition/:statLink` render **SchoolRoadmap**.
- **SchoolRoadmap** uses `useParams()` to read `:masterschool`, maps it via **roadmapService** (`normalizeMasterschoolSlug`, `getSchoolConfig`) and passes `masterschool` + `schoolConfig` to **NeuralPathRoadmap**.
- **roadmapService.js** exposes:
  - `ROADMAP_SCHOOL_CONFIG` – per-school display name, slug, colors (Ignition, Insight, Transformation, Stellar Ops, Neural RPG).
  - `normalizeMasterschoolSlug(slug)` – URL slug → canonical name.
  - `getSchoolConfig(masterschool)` – config object for nodes/colors/content.
- Sidebar and ConstellationNavigatorWidget link to `/roadmap/ignition` (or `/roadmap/${target}`). Visiting `/roadmap/stellar-ops` or `/roadmap/neural-rpg` shows the correct school when supported by the RPC.

## 2. Orphan redirects and history

- **No redirect routes** for `/calendar` or `/timer` in `App.js`. All links should point directly to **`/mastery/calendar`** and **`/mastery/timer`** to avoid double lifecycle updates and history bloat. If you add such redirects later, prefer replacing them by updating links instead.

## 3. Dev-only routes

- **DevRoutes.jsx** defines `/test` and `/mastery-test` and is rendered only when `process.env.NODE_ENV === 'development'`.
- In `App.js`: `{process.env.NODE_ENV === 'development' && <DevRoutes />}`. Production builds strip this branch; dev routes are not reachable in production.

## 4. Shared navigation data (no double-fetch)

- **useNavigationData** (in `src/hooks/useNavigationData.js`) is the single source for:
  - notification count (Supabase + Realtime),
  - total XP,
  - last achievement,
  - level title.
- **AppShell** uses `useNavigationData()` once and, when `isMobile`, passes **navData** to **AppShellMobile** via `navData={navData}`.
- **AppShellMobile** accepts optional **navData**; when provided it uses that and skips its own notification/XP/level fetches, avoiding double-fetch on resize or when switching between desktop and mobile shell.

## 5. Lazy loading and prefetch

- All page lazy imports in **App.js** use **webpack magic comments** (`/* webpackChunkName: "..." */`) for named chunks (e.g. `dashboard-feature`, `mastery-feature`, `roadmap-feature`).
- **AppShell** defines **PREFETCH_MAP** (path → `() => import(...)`) and passes **onPrefetch** to **SidebarNavItem**. On hover, the matching chunk is prefetched so navigation feels instant.
