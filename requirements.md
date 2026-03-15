# REQUIREMENTS.md — Hocus

## 1. Authentication

### Functional
- **REQ-AUTH-01** Users can sign up with email and password.
- **REQ-AUTH-02** Users can log in with email and password.
- **REQ-AUTH-03** Users can log out.
- **REQ-AUTH-04** Sessions persist across page refreshes.
- **REQ-AUTH-05** Unauthenticated users are redirected to `/auth/login`.
- **REQ-AUTH-06** All data is scoped to the authenticated user via Supabase Row Level Security (RLS).

### Non-Functional
- **REQ-AUTH-NF-01** Auth state is resolved before any protected page renders.

---

## 2. Task Management

### Functional
- **REQ-TASK-01** Users can create a task with the following fields:
  - `title` (required)
  - `notes` (optional)
  - `color_tag` (optional, 7 colors)
  - `working_on_date` (optional, natural language input supported)
  - `due_date` (optional, natural language input supported)
  - `status` (`todo` | `in_progress` | `orbit` | `done`)
  - `energy` (`easy` | `moderate` | `heavy`, optional)
  - `interest` (`dreading` | `neutral` | `want_to`, optional)
  - `estimated_minutes` (optional integer)
  - `recurrence` (`daily` | `weekly` | `monthly`, optional)
  - `section_id` (optional; assigns to a project section on creation)
- **REQ-TASK-02** Users can edit any field of an existing task.
- **REQ-TASK-03** Users can mark a task as done (quick action from task card).
- **REQ-TASK-04** Users can delete a task (with confirmation).
- **REQ-TASK-05** Tasks are displayed reverse-chronologically by default.
- **REQ-TASK-06** Task cards display: title, color tag, due date, working-on date, subtask progress, status, energy, interest, estimated time, recurrence badge, blocked badge.
- **REQ-TASK-07** Marking a task done sets `completed_at` timestamp. Un-doing clears it.

### Non-Functional
- **REQ-TASK-NF-01** Task creation completes with optimistic UI under 300ms perceived latency.
- **REQ-TASK-NF-02** Tasks are persisted to Supabase in real time.

---

## 3. Subtasks & Task Breakdown

### Functional
- **REQ-SUB-01** A task can have one or more child tasks (stored as tasks with `parent_id`).
- **REQ-SUB-02** Each child task has: `title` (required), `status`, `estimated_minutes` (optional).
- **REQ-SUB-03** Users can add, edit, reorder, and delete child tasks.
- **REQ-SUB-04** Each child task can be independently marked complete.
- **REQ-SUB-05** Child task progress indicator visible on parent task card.
- **REQ-SUB-06** Reflective prompts shown one at a time to help task decomposition.
- **REQ-SUB-07** Built-in task templates provide predefined step sets.

### Non-Functional
- **REQ-SUB-NF-01** Child task reordering uses drag-and-drop (touch and mouse).
- **REQ-SUB-NF-02** Reflective prompts shown one at a time.

---

## 4. Today View

### Functional
- **REQ-TODAY-01** Default route (`/`) is the Today View.
- **REQ-TODAY-02** Shows tasks where `status ≠ done` AND (`working_on_date` ≤ today OR `due_date` ≤ today).
- **REQ-TODAY-03** Sorted: overdue due date → overdue working-on → due today → working-on today.
- **REQ-TODAY-04** Calm empty state when no tasks due.
- **REQ-TODAY-05** Users can enter Focus Mode from any task.
- **REQ-TODAY-06** A collapsible "Completed today" section shows tasks where `completed_at` is today, with warm appreciative copy and completion times.
- **REQ-TODAY-07** "Start Here" mode available — manual trigger, surfaces one suggested task, dims others.
- **REQ-TODAY-08** Weekly review button entry point shown below the task list.
- **REQ-TODAY-09** Backlog triage entry point shown below the task list.
- **REQ-TODAY-10** Avoidance detector entry point — shown with a count of stale tasks when any task has a working_on_date 3+ days overdue.
- **REQ-TODAY-11** Full-text search across task title and notes, with match snippet shown on card when notes match but title does not.
- **REQ-TODAY-12** Filter sheet: status, energy, interest, size. Active filter count shown on icon.
- **REQ-TODAY-13** Drag-to-reorder: custom order persisted to localStorage per day. Resets daily.

### Non-Functional
- **REQ-TODAY-NF-01** Today View loads with no more than one network round-trip.

---

## 5. Focus Mode

### Functional
- **REQ-FOCUS-01** Focus Mode can be entered from any task card or task detail page.
- **REQ-FOCUS-02** Full-screen overlay showing only: task title, notes, subtask list, Pomodoro timer, ambient sound controls.
- **REQ-FOCUS-03** No navigation or non-essential UI visible.
- **REQ-FOCUS-04** Pomodoro timer with configurable work/break durations (default 25/5). Start, pause, reset. Visual + audio cue on phase transition.
- **REQ-FOCUS-05** Child tasks can be checked off within Focus Mode.
- **REQ-FOCUS-06** Exit returns user to originating view.
- **REQ-FOCUS-07** Completing all child tasks shows a celebration and exit prompt.
- **REQ-FOCUS-08** Optional ambient sound: Rain, White noise, Brown noise, Café. Volume control. Stops on exit.
- **REQ-FOCUS-09** Estimated time shown as a calm anchor below task title.
- **REQ-FOCUS-10** If a task has prior progress (at least one child task done), a "Pick up where you left off" sheet is shown before entering Focus Mode. Shows last completed step, next pending step, and progress bar.
- **REQ-FOCUS-11** On exit, if the task is not yet done, an optional note prompt asks "Where did you get to?". Saving creates a progress note. The prompt is skippable.

### Non-Functional
- **REQ-FOCUS-NF-01** Focus Mode uses no standard navigation chrome.
- **REQ-FOCUS-NF-02** Timer state preserved in sessionStorage.
- **REQ-FOCUS-NF-03** Custom Pomodoro durations saved to localStorage.

---

## 6. Projects

### Functional
- **REQ-PROJ-01** Users can create projects with: `name`, `description`, `due_date`, `color_tag`.
- **REQ-PROJ-02** Tasks can belong to multiple projects (many-to-many).
- **REQ-PROJ-03** Project assignment happens from the task form.
- **REQ-PROJ-04** Projects list page shows all projects with name, description, due date, task count, color border, and progress bar (done/total).
- **REQ-PROJ-05** Project detail page shows tasks in that project. Completed tasks hidden by default with toggle.
- **REQ-PROJ-06** Unprojected tasks appear in the Inbox (`/inbox`).
- **REQ-PROJ-07** Projects can be edited and deleted.
- **REQ-PROJ-08** Deleting a project does not delete its tasks.
- **REQ-PROJ-09** When creating a project, users can select a built-in template that pre-populates the project name and creates a starter set of tasks.
- **REQ-PROJ-10** Projects can have optional named sections (phases/groups). Tasks are grouped by section in the project detail view.
- **REQ-PROJ-11** Sections can be added, renamed inline, and deleted.
- **REQ-PROJ-12** Each section has a "+ Add task" button that assigns `section_id` on task creation.
- **REQ-PROJ-13** Each section has a completed tasks toggle (per-section, independent).
- **REQ-PROJ-14** Sections can be reordered via drag-and-drop. Order persisted to `project_sections.sort_order`.

---

## 7. Inbox

### Functional
- **REQ-INBOX-01** The Inbox (`/inbox`) shows all top-level tasks not assigned to any project.
- **REQ-INBOX-02** Full-text search, filter, and completed task toggle available.
- **REQ-INBOX-03** Empty state: "Inbox is clear."

---

## 8. Priority System

### Functional
- **REQ-PRI-01** Tasks have an optional `energy` field: `easy` | `moderate` | `heavy`.
- **REQ-PRI-02** Tasks have an optional `interest` field: `dreading` | `neutral` | `want_to`.
- **REQ-PRI-03** Deadline pressure is derived automatically from due date proximity.
- **REQ-PRI-04** "Start Here" suggestion algorithm combines energy + interest + deadline pressure to surface one task.
- **REQ-PRI-05** Energy and interest shown as subtle metadata on task cards and detail pages.

---

## 9. Filters & Search

### Functional
- **REQ-FILTER-01** A filter sheet is accessible from Today, project detail, and Inbox views.
- **REQ-FILTER-02** Filter options: status, energy, interest, size.
- **REQ-FILTER-03** Multiple filters combine with AND logic.
- **REQ-FILTER-04** Active filter state shown on filter icon (badge count).
- **REQ-FILTER-05** Full-text search bar filters tasks by title and notes in real time (debounced 200ms).
- **REQ-FILTER-06** When a search matches task notes (but not title), a notes snippet is shown on the task card.
- **REQ-FILTER-07** Search and filters compose — both can be active simultaneously.

---

## 10. Task Templates

### Functional
- **REQ-TMPL-01** Built-in templates available when creating child tasks.
- **REQ-TMPL-02** Selecting a template populates editable child task list.
- **REQ-TMPL-03** Templates defined in static config (not user-created).

---

## 11. Visual Design & UX

### Functional
- **REQ-UX-01** 7 color tags per task/project. Consistent across all views.
- **REQ-UX-02** Mobile-first: all touch targets ≥ 44×44px; single-column primary layout.
- **REQ-UX-03** Light and dark mode following system preference.
- **REQ-UX-04** Destructive actions require confirmation.
- **REQ-UX-05** Form validation errors shown inline in plain, non-alarming language.
- **REQ-UX-06** Desktop: left sidebar (w-56) with Today, project list, Inbox, Backlog, New task.
- **REQ-UX-07** Mobile: bottom nav with Today, Projects, Inbox, Account. Floating purple Park It button replaces the old + button in the nav.
- **REQ-UX-08** Skeleton cards shown while data loads.
- **REQ-UX-09** Errors shown inline with retry option — app never crashes.
- **REQ-UX-10** Task cards use status-tinted backgrounds: red for overdue, purple for in_progress, sky for orbit, green for done, stone for default.
- **REQ-UX-11** Warm stone background throughout (stone-50 / neutral-950 in dark mode).

### Non-Functional
- **REQ-UX-NF-01** Lighthouse mobile performance ≥ 85.
- **REQ-UX-NF-02** Navigable by keyboard, WCAG 2.1 AA contrast.
- **REQ-UX-NF-03** No horizontal scrolling on 375px viewport.

---

## 12. Data Model (Supabase)

### `tasks`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → auth.users |
| `title` | `text` | Required |
| `notes` | `text` | Nullable |
| `color_tag` | `text` | Nullable; one of 7 values |
| `working_on_date` | `date` | Nullable |
| `due_date` | `date` | Nullable |
| `status` | `text` | `todo` \| `in_progress` \| `orbit` \| `done` |
| `energy` | `text` | Nullable; `easy` \| `moderate` \| `heavy` |
| `interest` | `text` | Nullable; `dreading` \| `neutral` \| `want_to` |
| `estimated_minutes` | `int` | Nullable |
| `completed_at` | `timestamptz` | Nullable; set when done |
| `parent_id` | `uuid` | Nullable; FK → tasks (child tasks) |
| `pattern_id` | `uuid` | Nullable; FK → user_patterns |
| `recurrence` | `text` | Nullable; `daily` \| `weekly` \| `monthly` |
| `section_id` | `uuid` | Nullable; FK → project_sections (on delete set null) |
| `created_at` | `timestamptz` | Auto |
| `updated_at` | `timestamptz` | Auto |

### `projects`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → auth.users |
| `name` | `text` | Required |
| `description` | `text` | Nullable |
| `due_date` | `date` | Nullable |
| `color_tag` | `text` | Nullable; one of 7 values |
| `created_at` | `timestamptz` | Auto |
| `updated_at` | `timestamptz` | Auto |

### `task_projects`
| Column | Type | Notes |
|---|---|---|
| `task_id` | `uuid` | FK → tasks |
| `project_id` | `uuid` | FK → projects |
| `user_id` | `uuid` | FK → auth.users |
| PK | (`task_id`, `project_id`) | Composite |

### `project_sections`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `project_id` | `uuid` | FK → projects (on delete cascade) |
| `user_id` | `uuid` | FK → auth.users |
| `name` | `text` | Required |
| `sort_order` | `int` | For drag-to-reorder |
| `created_at` | `timestamptz` | Auto |

### `task_notes`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `task_id` | `uuid` | FK → tasks (on delete cascade) |
| `user_id` | `uuid` | FK → auth.users |
| `body` | `text` | Required |
| `created_at` | `timestamptz` | Auto |

### `user_patterns`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → auth.users |
| `name` | `text` | Required |
| `steps` | `text[]` | Array of step titles |
| `created_at` | `timestamptz` | Auto |

### `task_dependencies`
| Column | Type | Notes |
|---|---|---|
| `task_id` | `uuid` | FK → tasks (the blocked task) |
| `depends_on_id` | `uuid` | FK → tasks (the blocker) |
| `user_id` | `uuid` | FK → auth.users |
| PK | (`task_id`, `depends_on_id`) | Composite |

---

## 13. Orbit & Task Initiation

### Functional
- **REQ-ORBIT-01** Tasks have an `orbit` status sitting between `in_progress` and `todo`.
- **REQ-ORBIT-02** Orbit status is inferred automatically on app load: tasks where `status = 'in_progress'` and `updated_at` is more than 4h ago are moved to `orbit`.
- **REQ-ORBIT-03** Users can manually set a task to orbit, or move it back to `in_progress`.
- **REQ-ORBIT-04** Orbit tasks show a distinct calm visual treatment (sky tint) — communicates "live but paused", not "failed or abandoned".
- **REQ-ORBIT-05** When a user taps an orbit task, task warming is shown: last subtask completed, time since last activity, user's own notes. Then two options: **Continue** (enters Focus Mode) or **Break it down** (opens TaskBreakdown).
- **REQ-ORBIT-06** Tasks untouched for 3+ days show a "door opener" indicator. Tapping it surfaces a single reflective prompt and opens a micro-subtask flow.
- **REQ-ORBIT-07** Tasks with a due date within 3 days that are still `todo` and have never been started are pulled into Today View with encouraging framing.
- **REQ-ORBIT-08** The "upcoming + untouched" prompt uses encouraging, non-shaming language.
- **REQ-ORBIT-09** Start Here scoring gives a boost to orbit tasks and to untouched tasks approaching their due date.

### Non-Functional
- **REQ-ORBIT-NF-01** Orbit inference runs on app load via client-side check.
- **REQ-ORBIT-NF-02** Orbit card treatment must not increase perceived urgency or anxiety.

---

## 14. Recurring Tasks

### Functional
- **REQ-RECUR-01** Tasks can have an optional `recurrence` field: `daily` | `weekly` | `monthly`.
- **REQ-RECUR-02** When a recurring task is marked done, a new copy is automatically created with the next scheduled date.
- **REQ-RECUR-03** The new occurrence inherits `title`, `color_tag`, `energy`, `interest`, `estimated_minutes`, `recurrence`, and `pattern_id`.
- **REQ-RECUR-04** Recurrence is set via toggle buttons (Daily / Weekly / Monthly) in the task form.
- **REQ-RECUR-05** A `↻ daily/weekly/monthly` badge is shown on task cards for recurring tasks.

---

## 15. Task Dependencies

### Functional
- **REQ-DEP-01** A task can be marked as blocked by one or more other tasks.
- **REQ-DEP-02** A "Blocked" amber badge is shown on the task card for any blocked task.
- **REQ-DEP-03** The task detail page shows a "Blocked by" section listing all blockers with their current status.
- **REQ-DEP-04** Users can add blockers via an inline search on the task detail page.
- **REQ-DEP-05** Users can remove individual blockers from the task detail page.
- **REQ-DEP-06** A task cannot depend on itself.

---

## 16. Your Patterns (Personal Template Library)

### Functional
- **REQ-PAT-01** Users can save the current child task list as a named pattern from the TaskBreakdown header.
- **REQ-PAT-02** Saved patterns are stored per user with: pattern name, list of step titles, created date.
- **REQ-PAT-03** Saved patterns appear in a "Your patterns" section above built-in templates with link/unlink toggle and delete button.
- **REQ-PAT-04** Selecting a pattern populates the child task list with saved step titles, all editable.
- **REQ-PAT-05** Saving a pattern auto-links it to the current task via `pattern_id`.
- **REQ-PAT-06** When a task title fuzzy-matches a saved pattern, a suggestion banner is shown.
- **REQ-PAT-07** Recurring tasks carry the `pattern_id` forward; steps are not auto-applied (suggestion banner instead).

### Non-Functional
- **REQ-PAT-NF-01** Fuzzy matching is client-side using token overlap (words ≥4 chars).

---

## 17. Progress Notes / Activity Log

### Functional
- **REQ-NOTES-01** Each task has an append-only progress log (task_notes table).
- **REQ-NOTES-02** Users can add a timestamped note from the task detail page. Cmd/Ctrl+Enter submits.
- **REQ-NOTES-03** Notes are shown newest-first with relative timestamps ("5m ago", "2h ago", specific date beyond 24h).
- **REQ-NOTES-04** Users can delete individual notes from the task detail page.
- **REQ-NOTES-05** On exit from Focus Mode, if the task is not done, users are prompted to capture a progress note. Skippable.

---

## 18. Park It (Brain Dump Capture)

### Functional
- **REQ-PARK-01** A floating purple + button is visible on all pages except during Focus Mode.
- **REQ-PARK-02** Tapping the button opens a multi-line textarea brain dump sheet.
- **REQ-PARK-03** Each line becomes a separate task in the Inbox. Single line creates one task.
- **REQ-PARK-04** Button label reflects line count: "Park 3 items" or "Park it".
- **REQ-PARK-05** Parked tasks are created with no date, project, or status (land in Inbox as `todo`).

---

## 19. ADHD Tools

### Functional
- **REQ-ADHD-01** **Backlog Triage** — full-screen overlay for reviewing unscheduled tasks. Actions: schedule, or drop.
- **REQ-ADHD-02** **Avoidance Detector** — surfaces tasks with a working_on_date 3+ days overdue. Actions: Move to today, Not now (session dismiss), Drop it. Sorted most stale first.
- **REQ-ADHD-03** Avoidance entry point shows task count. Only visible when stale tasks exist.
- **REQ-ADHD-04** **End-of-day sweep** — guided wind-down routine triggered from Today view. 4 steps: What did you finish? (completed today) / What moves to tomorrow? (today's unfinished, actions: Tomorrow / Next week / Keep today) / What can you drop? (lingering overdue, actions: Drop it / Park it / Keep it) / Done (closing message).

---

## 20. Weekly Review

### Functional
- **REQ-REVIEW-01** A "Weekly review" button on the Today View opens the review flow.
- **REQ-REVIEW-02** Full-screen overlay, 4-step guided flow with progress dots.
- **REQ-REVIEW-03** Step 1 (Wins): tasks completed in the last 7 days, read-only.
- **REQ-REVIEW-04** Step 2 (Past due): overdue tasks with actions — Done, Reschedule, Drop it.
- **REQ-REVIEW-05** Step 3 (Coming up): tasks due in next 7 days with no `working_on_date`. Actions — Work on it today, Pick a date, Skip.
- **REQ-REVIEW-06** Step 4 (Done): wrap-up message, "Back to today" button.
- **REQ-REVIEW-07** Tasks acted upon during the review are hidden from their step immediately.

---

## 21. Calendar & Scheduling _(planned)_

### Functional
- **REQ-CAL-01** **Next 7 Days view** (`/week`) — tasks grouped by day for today + 6 days. A task appears on a day if its `working_on_date` or `due_date` matches. Days with no tasks show "Nothing scheduled". "Today" / "Tomorrow" labels on first two days. Full-text search and filter compose across all day sections.
- **REQ-CAL-02** Each day section has a "+ Add" button that pre-fills `working_on_date` for that day when the task is submitted.
- **REQ-CAL-03** "Unscheduled" section at bottom shows tasks with no `working_on_date` and no `due_date` (status ≠ done, top-level only).
- **REQ-CAL-04** Entry points: "7 days" link in Today view header, "Next 7 days" in desktop sidebar.
- **REQ-CAL-05** **Calendar view** (`/calendar`) — monthly grid, Monday-first. Each day cell shows up to 3 coloured task dots (status/color tinted) with "+N" overflow. Today's date highlighted in purple.
- **REQ-CAL-06** Tapping a day opens an inline detail panel: day label, full task list as TaskCards, "+ Add" button that pre-fills `working_on_date`. Tapping a selected day or the × closes the panel.
- **REQ-CAL-07** Month navigation (‹ ›) with month + year label. Changing month closes any open day panel.
- **REQ-CAL-08** Entry points: "Month" link in Next 7 Days header, "Calendar" in desktop sidebar. Tasks appear on the day matching their `working_on_date` or `due_date` (deduplicated if both fall on the same day).

---

## 22. Out of Scope (current version)

- Email to task (Phase 10)
- Spatial canvas (separate tool)
- Distraction-free writing mode (separate tool)
- Shared task lists / collaboration
- Calendar integrations (Google Cal sync etc.)
- Push notifications
- Native app (iOS/Android)
- Offline / PWA
- Mood check-in
