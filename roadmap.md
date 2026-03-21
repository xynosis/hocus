# ROADMAP.md — Hocus

## Guiding Philosophy

Each phase produces a usable, testable slice of the app. No phase ends with infrastructure alone. Phases are ordered to defer complexity until the core UX is validated.

---

## Phase 0 — Project Bootstrap ✅
Nuxt 4 project, Tailwind, Pinia, Supabase client, folder structure, TypeScript interfaces, placeholder pages.

## Phase 1 — Core Task CRUD ✅
Task creation (slide-up sheet), task cards, task detail, Today View (stub), bottom nav, default layout.

## Phase 2 — Subtasks & Breakdown ✅
Subtasks store, SubtaskItem, TaskBreakdown, reflective prompts, task templates, subtask progress on cards.

## Phase 3 — Today View ✅
Correct Today View sort order (overdue due → overdue working-on → due today → working-on today). Date utility helpers with unit tests.

## Phase 4 — Focus Mode ✅
Full-screen overlay, Pomodoro timer, sessionStorage persistence, confetti completion celebration, focus entry from any task card or detail page.

## Phase 5 — Supabase Integration ✅
Migrations, RLS policies, auth pages, auth middleware, tasks and subtasks stores replaced with Supabase, optimistic UI, session persistence fix (INITIAL_SESSION plugin pattern).

## Phase 6 — Projects ✅
Projects table, task_projects join table, projects store, ProjectForm, projects list and detail pages, desktop sidebar, mobile nav update, Misc view, completed tasks hidden by default with toggle, "Completed today" section on Today View, `completed_at` column.

## Phase 7 — Polish & Deployment ✅
Account page, skeleton loading states, error boundaries, COLOR_MAP consolidated, project colors, favicon (purple rounded square, white checkmark, amber twinkle stars), Dockerfile, Coolify deployment on Hetzner at todo.kierancutting.co.uk, Supabase allowed URLs updated, app renamed to Hocus.

## Phase 8 — Priority & Focus ✅
Energy + interest fields, time estimates, Start Here mode, ambient sound in Focus Mode, custom Pomodoro durations, filter sheet, search.

| Task | Description |
|---|---|
| 8.1 | Add energy, interest, estimated_minutes to schema ✅ |
| 8.2 | Update TaskForm with energy, interest, time estimate inputs ✅ |
| 8.3 | Update TaskCard to show new fields ✅ |
| 8.4 | Build Start Here mode with scoring algorithm ✅ |
| 8.5 | Show time estimate on task detail and focus mode ✅ |
| 8.6 | Ambient sound composable + controls in Focus Mode ✅ |
| 8.7 | Custom Pomodoro durations ✅ |
| 8.8 | Filter sheet ✅ |
| 8.9 | Search bar ✅ |

## Phase 9 — Structure ✅
Recurring tasks, task dependencies, project templates, "pick up this task", weekly review, orbit status, task initiation, personal patterns.

| Task | Description |
|---|---|
| 9.1 | Recurring tasks (schema + UI) ✅ |
| 9.2 | Task dependencies (blocked by) ✅ |
| 9.3 | Project templates ✅ |
| 9.4 | "Pick up this task" — intercept on focus entry for tasks with prior progress ✅ |
| 9.5 | Weekly review page ✅ |
| 9.6 | Add `orbit` to task status enum — migration + type updates ✅ |
| 9.7 | Orbit inference on app load — batch update stale in_progress tasks ✅ |
| 9.8 | Orbit visual treatment on TaskCard — calm distinct state, not a warning ✅ |
| 9.9 | Task warming on orbit task tap — last progress, time since, Continue / Break it down ✅ |
| 9.10 | "Door opener" indicator on untouched tasks — micro-subtask prompt ✅ |
| 9.11 | Upcoming + untouched nudge in Today View — due within 3 days, never started ✅ |
| 9.12 | Update Start Here scoring for orbit and untouched-approaching tasks ✅ |
| 9.13 | `user_patterns` table migration ✅ |
| 9.14 | "Save as pattern" — explicit save from TaskBreakdown header ✅ |
| 9.15 | Pattern suggestion on task creation — fuzzy title match ✅ |
| 9.16 | "Your patterns" management UI — view, link/unlink, delete ✅ |
| 9.17 | Link recurring tasks to patterns for auto-populated subtasks ✅ |

## Phase 10 — ADHD Tools & Polish ✅ / 🔄

| Task | Description |
|---|---|
| 10.1 | Full-text search across title + notes, match snippet on card ✅ |
| 10.2 | Project sections — add, rename, delete, assign tasks, per-section add ✅ |
| 10.3 | `project_sections` table migration + RLS ✅ |
| 10.4 | `section_id` FK on tasks + migration ✅ |
| 10.5 | Progress notes (task_notes) — append-only log on task detail ✅ |
| 10.6 | `task_notes` table migration + RLS ✅ |
| 10.7 | End-of-focus note prompt — "Where did you get to?" on exit ✅ |
| 10.8 | Drag-to-reorder Today view (per-day localStorage order) ✅ |
| 10.9 | Park It brain dump — floating purple +, multi-line capture, lands in Inbox ✅ |
| 10.10 | Avoidance detector — stale working_on_date tasks, session dismiss ✅ |
| 10.11 | Backlog triage entry point on Today view ✅ |
| 10.12 | Visual redesign — warm stone backgrounds, status-tinted cards, red overdue ✅ |
| 10.13 | Rename Misc → Inbox (route, nav, icon, all references) ✅ |
| 10.14 | Section drag-to-reorder (sort_order persisted to Supabase) ✅ |
| 10.15 | End-of-day sweep — guided wind-down overlay ✅ |

## Phase 11 — Calendar & Scheduling ✅

| Task | Description |
|---|---|
| 11.1 | Next 7 Days view — tasks grouped by day, Unscheduled section at bottom ✅ |
| 11.2 | Entry points: "7 days" link in Today header, "Next 7 days" in sidebar ✅ |
| 11.3 | Calendar view — monthly grid, task dots per day, month navigation ✅ |
| 11.4 | Tap a day: detail panel with task list + "+ Add" shortcut ✅ |

## Phase 12 — ADHD Focus & Visual Polish ✅

| Task | Description |
|---|---|
| 12.1 | Visual redesign — DM Sans header font, card white bg + shadow, text-2xl/3xl page headings ✅ |
| 12.2 | Today header shows current date below title ✅ |
| 12.3 | Drag handles fade in on hover/press (reduce visual noise) ✅ |
| 12.4 | Bottom nav active pill indicator ✅ |
| 12.5 | Action row on Today simplified to plain text links; Backlog/Avoiding hidden when count = 0 ✅ |
| 12.6 | Focus Mode: stone-50 background, text-4xl task title ✅ |
| 12.7 | Sidebar: remove "Other" section label ✅ |
| 12.8 | Confetti fires on task completion from any card (not only Focus Mode) ✅ |
| 12.9 | Focus Mode: elapsed time counter (count-up, shown below task title) ✅ |
| 12.10 | Focus Mode: auto session summary note on exit — minutes worked, steps completed, timestamp ✅ |
| 12.11 | Focus Mode: Park It accessible via capture button in header ✅ |
| 12.12 | Focus Mode: 90-minute hyperfocus nudge — soft inline banner, dismissable ✅ |
| 12.13 | Pomodoro: directed break activity suggestion shown when break phase starts ✅ |
| 12.14 | Pomodoro: re-entry confirmation screen after break ends — tap to start next session ✅ |

## Phase 12.5 — Orbit Lifecycle Fix ✅

> ⚠️ Approach uncertain — revisit thresholds after real-world use.

| Task | Description |
|---|---|
| 12.5.1 | Split `inferOrbitTasks()`: atomic tasks orbit after 4h on `updated_at`; container tasks orbit after 3 days on `max(child.updated_at)` ✅ |
| 12.5.2 | `enterFocus()` auto-sets `in_progress` for atomic tasks (no children) with status `todo` ✅ |
| 12.5.3 | `ChildTaskItem.toggleDone()` promotes parent to `in_progress` when first child completed and parent is still `todo` ✅ |

---

## Phase 13 — Backend Formalisation _(deprioritised)_

**Status:** Deferred indefinitely. A standalone Node + Hono API layer adds no meaningful user-visible value at current scale. Backend work will be introduced only when a specific feature demands it.

**When to revisit:** Each of the following features will require a backend component when built — at that point, use **Supabase Edge Functions** for the specific need rather than standing up a full API service:

- **Email to task** — inbound email webhook
- **Push notifications** — server-side scheduling, device token management
- **Calendar sync** — OAuth token refresh, two-way event sync
- **Email digests** — scheduled daily/weekly sends

**What was planned (for reference):**

| Task | Notes |
|---|---|
| Move orbit inference to scheduled job | Low priority — client-side inference on load is fine unless notifications are added |
| Set up full API service (Node + Hono) | Not justified until multiple server-side features exist simultaneously |

---

## Future Phases (Post-v2 Backlog)

- **Email to task** — inbound email → Supabase Edge Function _(requires backend)_
- **Keyboard shortcuts** — `N` for new task, `P` for Park It ✅
- **PWA / offline** — install prompt, service worker, offline banner ✅
- **Push notifications** — server-side scheduling _(requires backend)_
- **Calendar sync** — OAuth token refresh, two-way event sync _(requires backend)_
- **Email digests** — daily/weekly sends _(requires backend)_
- **Shutdown routine enhancement** — track completion streaks, show over time
- **Time blocking** — link a task to a time of day, shown in Next 7 Days
- **Focus session history** — log how long focus mode was active per task
- **Task aging** — visual indicator for tasks untouched beyond a threshold
- **Recurring task patterns** — e.g. weekly review auto-creates a task every Monday
- ~~**Spatial canvas**~~ — shipped as Canvas feature within Hocus (Phase C)
- ~~**Distraction-free writing**~~ — shipped as Write feature within Hocus (Phase W)
- **Collaboration / shared lists** — v3/v4
- **Native app** — post-v2
- **Mood check-in** — stored for later
- **Project board view** (grouped by status)

---

## Phase W — Distraction-Free Writing ✅

Integrated at `/write` within Hocus. Separable: `app/features/write/` has no imports from Hocus-specific stores; cross-feature coupling only in `app/pages/write/`.

| Task | Description |
|---|---|
| W1 | documents table migration + RLS ✅ |
| W2 | documents store (Pinia), WritingDocument type ✅ |
| W3 | Write layout (minimal chrome), /write index (doc list with project tags, delete, back) ✅ |
| W4 | WriteEditor component — Tiptap + tiptap-markdown, CharacterCount, Placeholder ✅ |
| W5 | /write/[id] editor page — autosave, title input, export MD + PDF, focus mode overlay ✅ |
| W7.1 | Typewriter scroll mode ✅ |
| W7.2 | Create task from selected text ✅ |
| W7.3 | Paragraph focus (ProseMirror decoration, dims non-active blocks) ✅ |
| W7.4 | Auto-title from first heading ✅ |
| W7.5 | Return-to-task link from document ✅ |
| W7.6 | "Open writing space" / "Open document" button on task detail ✅ |
| — | Auto-delete empty documents on unmount ✅ |
| — | Mobile header overflow fix (··· menu collapses secondary actions) ✅ |

**Known gaps / future:** Formatting toolbar (deferred).

---

## Phase C — Canvas ✅

Integrated at `/canvas` within Hocus. Separable: `app/features/canvas/` has no imports from Hocus-specific stores.

| Task | Description |
|---|---|
| C1 | boards + canvas_items tables migration + RLS ✅ |
| C2 | boards store, canvas-items store (Pinia) ✅ |
| C3 | Canvas layout, /canvas index (board list) ✅ |
| C4 | /canvas/[id] — infinite canvas, pan (pointer events), wheel zoom, grid background ✅ |
| C5 | CanvasCard component — task, document, note, freeform text, image card types ✅ |
| C6 | Drag cards (lazy pointer capture — deferred until 3px movement so clicks reach inner elements) ✅ |
| C7 | Multi-select (shift+click), group drag ✅ |
| C8 | Pinch-to-zoom (touch events, two-finger) ✅ |
| C9 | Add panel — tasks (with project colour), docs, sticky notes, freeform text ✅ |
| C10 | Note editing — single click on selected note enters edit mode ✅ |
| C11 | Project colour stripe on task cards; project colour dots in add panel ✅ |
| C12 | Backspace/Delete key removes selected items ✅ |
| C13 | Image paste — uploads to Supabase Storage (canvas-images bucket), renders as image card ✅ |
| C14 | Mobile nav replaced with hamburger → slide-in sidebar overlay ✅ |
| C15 | Square (200×200) card shape; text cards auto-sized, no border/shadow ✅ |

**Known issues:** Delete button (×) on cards does not respond to click — pointer event ordering issue. Backspace works as workaround.

**Pending migration:** `20260321000001_canvas_images.sql` — run `supabase db push`.

---

## Product Vision

Hocus is a unified ADHD-friendly deep work suite:

1. **Tasks & Focus** — capture, prioritise, focus (core Hocus)
2. **Canvas** — spatial thinking, boards, task post-its (`/canvas`)
3. **Write** — distraction-free writing linked to tasks (`/write`)

Together: capture + do → think + plan → write + create.
