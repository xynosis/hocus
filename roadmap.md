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

## Phase 12 — Backend Formalisation _(planned)_

**Goal:** Replace client-side business logic with a proper API layer. Stabilise after Phase 10 when the core data model has settled.

| Task | Description |
|---|---|
| 12.1 | Evaluate and select API framework (Node + Hono recommended) |
| 12.2 | Set up API service alongside Supabase — auth via Supabase JWT verification |
| 12.3 | Move orbit inference to scheduled job (replaces client-side app load check) |
| 12.4 | Move email-to-task handler to API (inbound email webhook) |
| 12.5 | Move weekly review generation to API |
| 12.6 | Set up deployment pipeline for API service on Hetzner via Coolify |
| 12.7 | Future: push notifications, calendar sync, third-party integrations |

**Rationale:** Data model is still actively changing through Phases 9–11. Building scheduled/backend logic on an unstable schema is expensive.

---

## Future Phases (Post-v2 Backlog)

- **Email to task** — inbound email → Supabase function
- **Keyboard shortcuts** — `P` for Park It, `F` for focus, `N` for new task (desktop)
- **Shutdown routine enhancement** — track completion streaks, show over time
- **Time blocking** — link a task to a time of day, shown in Next 7 Days
- **Focus session history** — log how long focus mode was active per task
- **Task aging** — visual indicator for tasks untouched beyond a threshold
- **Recurring task patterns** — e.g. weekly review auto-creates a task every Monday
- **Spatial canvas** — planned as a separate tool that integrates with Hocus
- **Distraction-free writing** — planned as a separate tool that integrates with Hocus
- **Collaboration / shared lists** — v3/v4
- **Push notifications** — post-v2
- **PWA / offline** — post-v2
- **Native app** — post-v2
- **Mood check-in** — stored for later
- **Project board view** (grouped by status)

---

## Product Vision

Hocus is the first of three planned tools:

1. **Hocus** — task and focus management
2. **[Spatial tool]** — free-form canvas for thinking and planning, imports Hocus tasks
3. **[Writing tool]** — distraction-free writing, links to Hocus tasks as context

Together: capture + do → think + plan → write + create.
