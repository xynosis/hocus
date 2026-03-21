# STATE.md — Hocus

_Paste this at the start of any new chat to restore context._

## Project
**Hocus** — ADHD-friendly task management app. Nuxt 4 + TypeScript + Tailwind + Pinia + Supabase. Mobile-first web. Live at todo.kierancutting.co.uk.

## Product Vision
Unified ADHD-friendly life OS:
- **Tasks** — task and focus management (original Hocus)
- **Write** — distraction-free writing at `/write`, links to tasks
- **Canvas** — Miro-style whiteboard at `/canvas`, embeds tasks + docs
- All three integrated into one app. Future pillars: read-later, reminders, budget tracking.

## Decisions Made

| Decision | Choice | Notes |
|---|---|---|
| UX Philosophy | Focus Mode, Minimal Friction, Visual Clarity, Reflective Breakdown | No AI generation |
| Data Persistence | Supabase (auth + cloud sync) | RLS required; all data user-scoped |
| Hosting | Hetzner VPS via Docker + Coolify | Live at todo.kierancutting.co.uk |
| Platform | Mobile-first web | Designed for 375px+ first |
| Task breakdown | Reflective prompts + task templates | One prompt at a time |
| Dates | Dual-date: `working_on_date` + `due_date` | Intent vs. deadline |
| Focus Mode | Full-screen overlay, no dedicated route | Owned by default.vue, triggered via useFocus() |
| Pomodoro timer | Configurable work/break durations (default 25/5) | Visual + Web Audio API chime |
| Timer persistence | sessionStorage | Restored on re-entry |
| Custom Pomodoro | Saved to localStorage | `pomodoro_work_minutes`, `pomodoro_break_minutes` |
| Ambient sound | Web Audio API — Rain, White, Brown, Café | YouTube deferred |
| Completion celebration | canvas-confetti | Fires when all subtasks complete |
| Focus entry points | Any task card + task detail page | Play button on card, Focus button on detail |
| Focus exit note | Optional prompt on exit if task not done | Saves to task_notes via taskNotes store |
| Task templates | Static config (v1) | User-created templates post-v1 |
| Today View logic | `working_on_date` ≤ today OR `due_date` ≤ today, status ≠ done | |
| Today View sort | Overdue due → overdue working-on → due today → working-on today | |
| Today View drag order | Per-day localStorage via useTodayOrder | Resets daily by design |
| Start Here mode | Manual trigger, scoring algorithm, surfaces one task | Energy + interest + deadline pressure |
| Priority system | Energy (easy/moderate/heavy) + Interest (dreading/neutral/want_to) | Deadline pressure derived automatically |
| Completed today | `completed_at` timestamptz | Set on done, cleared on un-done |
| Time estimates | User-provided `estimated_minutes` on task | Shown on card, detail, and focus mode |
| Filters | FilterSheet — status, energy, interest, size | AND logic |
| Search | Full-text search across title + notes, debounced 200ms | Notes snippet shown on card when notes match but title doesn't |
| AI features | None, ever | Explicitly excluded |
| Rendering mode | SPA (`ssr: false`) | Client-side only |
| Supabase client | `@nuxtjs/supabase` v2.0.4 | `redirect: false` |
| Auth session restore | `INITIAL_SESSION` event in `enforce: 'pre'` plugin | |
| Auth middleware | `auth.global.ts` — `supabase.auth.getSession()` directly | Never use `useSupabaseUser()` in middleware |
| Auth redirect | `/auth/login` | |
| Email confirmation | Disabled | |
| Migrations | Supabase CLI | `brew install supabase/tap/supabase` |
| RLS | SQL in migration files | 4 policies per table |
| Optimistic UI | Local state first, rollback on error | All stores |
| Package manager | pnpm | |
| Node version | 22 LTS | |
| Nuxt version | Nuxt 4 (v4.4.2) | |
| Directory structure | Nuxt 4 `app/` layout | `~/` resolves to `app/` |
| Tailwind | Auto-discovered | Do NOT add css key to nuxt.config.ts |
| Task creation UI | Slide-up sheet (modal on desktop) | `+` in sidebar / "New task" in sidebar |
| Task color type | `TaskColor` | Renamed from ColorTag |
| Status tints | red=overdue, purple=in_progress, sky=orbit, green=done, stone=default | Applied as card background + left border |
| Overdue tint | red (not orange) | Fires when due_date overdue and status ≠ done |
| Background | stone-50 / neutral-950 dark | Warm stone throughout |
| Drag-and-drop | `vue-draggable-plus` | Mouse + touch |
| Park It button | Floating purple + button in default.vue | Hidden during focus; `bottom-6 sm:bottom-8` (adjusted after bottom nav removal) |
| Park It capture | Multi-line textarea; one line = one task | All land in Inbox (no project, no date) |
| Inbox | `/inbox` — tasks with no project (renamed from Misc) | Inbox tray SVG icon |
| Inbox empty state | "Inbox is clear" | |
| Avoidance detector | working_on_date 3+ days overdue, status ≠ done | Actions: Move to today / Not now (session dismiss) / Drop it |
| Avoidance entry | Amber button on Today view, shows count | Only visible when stale tasks exist |
| Backlog triage | Full-screen overlay for unscheduled tasks | Same overlay pattern as WeeklyReview |
| Progress notes | task_notes — append-only, newest-first | Shown on task detail page; also captured on focus exit |
| Project sections | project_sections table — name, sort_order | Sections group tasks within project detail; inline rename |
| Section per-add | "+ Add task" per section sets section_id on creation | section_id injected in onTaskSubmit, not via prop |
| Section reordering | VueDraggable on sections in project detail, sort_order persisted to Supabase | `reorderSections` in projects store; drag handle on section header |
| End-of-day sweep | Full-screen overlay, 5-step guided flow | amber colour scheme; step 3 "Pick up tomorrow" uses scoring (due soon + orbit + interest); confirmed picks batch-update working_on_date = tomorrow |
| Breakdown | Inline on task detail | Prompts + templates |
| Back navigation | `router.back()` with `/projects` fallback | |
| Projects | Name, description, due date, color | Many-to-many via task_projects |
| Project colors | Same TaskColor palette | Left border on cards, dot in sidebar |
| Project progress bar | done/total shown on project list | |
| Desktop layout | Left sidebar w-56 + main area | Today, projects, Next 7 days, Calendar, Inbox, Backlog, New task, Account |
| Mobile nav | Hamburger (☰) top-left → slide-in sidebar overlay | AppNav.vue retained but unused; AppSidebar handles both desktop (fixed) and mobile (overlay via `open` prop + backdrop) |
| Completed in project/inbox | Hidden by default, toggle to show, resets on nav | |
| Account page | Email, sign out, delete note | hi@kierancutting.co.uk for deletion |
| Loading states | SkeletonCard with pulse | |
| Error handling | ErrorMessage with retry | |
| COLOR_MAP | `utils/colors.ts` — `getColorHex()` | |
| Favicon | SVG — purple square, white checkmark, amber twinkle stars | `public/favicon.svg` |
| Page title | Hocus | `nuxt.config.ts` app.head |
| Deployment | Coolify on Hetzner, Dockerfile | Auto-deploys on push to main |
| Orbit status | Inferred on app load, split by task type | Atomic tasks (no children): orbit after updated_at > 4h. Container tasks (has children): orbit after max(child.updated_at) > 3 days. ⚠️ Thresholds uncertain — revisit. |
| in_progress on focus entry | Set automatically for atomic tasks | enterFocus() calls setTaskStatus(id, 'in_progress') if task has no children and status is 'todo' |
| in_progress on child completion | Parent promoted to in_progress when first child done | ChildTaskItem.toggleDone() promotes parent if parent.status === 'todo'. Enables orbit inference on container tasks. |
| Heading font | DM Sans (Google Fonts via CSS @import) | Applied to h1/h2/h3 via main.css; tailwindcss.cssPath must point to ~/assets/css/main.css |
| Task card bg | white dark:neutral-900 + shadow-sm | Elevates off stone-50 page background |
| Confetti | canvas-confetti fires on task completion | Fires from TaskCard.toggleDone (all views) + FocusView canvas (canvas-bound for z-index) |
| Focus elapsed time | Count-up timer, shown below task title | "X min in"; starts on FocusView mount |
| Focus session note | Auto-saved on any exit | Format: "Focus session · X min · N steps completed · date at time"; skipped if <1 min |
| Focus Park It | openParkIt() composable in FocusView header | Small + icon button; ParkItSheet rendered in layout via Teleport |
| Hyperfocus nudge | Inline amber banner at 90 min elapsed | Dismissable ("Keep going"); not blocking |
| Pomodoro break activity | Random suggestion shown when break starts | 7 options; e.g. "Get some water", "Stretch for 2 minutes" |
| Pomodoro re-entry | Manual confirmation required after break ends | waitingForReentry ref; "Start next session" button; break→work does NOT auto-start |
| Task initiation | Door opener prompt after 3 days untouched | Single reflective prompt, micro-subtask flow |
| Upcoming + untouched nudge | Due within 3 days + never started → pulled into Today View | Encouraging language, never shaming |
| Task warming | Shown on orbit task tap | Last subtask, time since, Continue or Break it down |
| Personal templates | "Your patterns" | Explicit save + fuzzy autofill on new task creation |
| Pattern matching | Client-side fuzzy title match | Token overlap (words ≥4 chars), no external library |
| Pattern data model | `user_patterns` table | name, steps (text[]), user_id |
| Pattern linking | `pattern_id` FK on tasks | Auto-linked on save-as-pattern |
| Recurring tasks | `recurrence` text column on tasks | daily/weekly/monthly |
| Recurring task schedule | `scheduleNextOccurrence()` called from `setTaskStatus` | Creates new task when done; copies pattern_id |
| Task dependencies | `task_dependencies` join table | task_id, depends_on_id, user_id; composite PK |
| Dependency display | "Blocked" amber badge on TaskCard | Shown when any blocker is not done |
| Pick-up intercept | In `useFocus` composable | All callers get intercept for free |
| PickUpSheet | Bottom sheet via Teleport + Transition | Shows last done step, next step, progress bar |
| Project templates | Hardcoded util `projectTemplates.ts` | 6 built-in templates; no DB migration needed |
| Weekly review | Full-screen overlay, 4-step guided flow | Same overlay pattern as FocusView |
| Weekly review dismissed | `reactive(new Set<string>())` | Tracks acted-on tasks within session; no re-fetch |
| Backend formalisation | Phase 12 — Node + Hono API | After data model settles post-Phase 10 |
| Supabase type workaround | `as any` cast for new tables | project_sections, task_notes not in generated types until supabase gen types is re-run |

## Key Structural Notes
- `~/` resolves to `app/` (Nuxt 4)
- Layouts in `app/layouts/` — NOT `app/components/layout/`
- Components in layouts need explicit imports
- Never use `useSupabaseUser()` in middleware — use `supabase.auth.getSession()` directly
- Plugin `app/plugins/auth.client.ts` uses `enforce: 'pre'`, waits for `INITIAL_SESSION`
- Middleware `app/middleware/auth.global.ts` waits for `sessionReady` flag
- Layout `<style>` NOT scoped
- Skipped store tests: `tests/tasks.store.test.ts.skip`, `tests/subtasks.store.test.ts.skip`
- `useDependenciesStore` calls `useTasksStore()` at top of Pinia setup function (not nested) to avoid circular deps
- WeeklyReview, FocusView, BacklogTriage, AvoidanceTriage all use the same full-screen overlay pattern (fixed inset-0 z-50)
- ParkItSheet and PushSheet use Teleport + Transition (bottom sheet pattern)
- All global overlays are rendered in `app/layouts/default.vue`
- Watch calls in index.vue must be OUTSIDE computed functions — temporal dead zone bug if `watch(..., { immediate: true })` references a ref declared later in the same setup block
- `tailwindcss: { cssPath: '~/assets/css/main.css' }` in nuxt.config.ts is required — without it, `@nuxtjs/tailwindcss` uses its own virtual CSS module and ignores main.css entirely (custom font rules etc. won't apply)
- New Supabase tables (project_sections, task_notes) accessed via `(supabase as any).from(...)` until types are regenerated

## File Structure
```
hocus/
├── app/
│   ├── assets/css/main.css
│   ├── components/
│   │   ├── task/TaskCard.vue, TaskForm.vue, TaskBreakdown.vue, ChildTaskItem.vue
│   │   │         ParkItSheet.vue, PushSheet.vue, DoorOpenerSheet.vue, OrbitWarmingSheet.vue
│   │   ├── project/ProjectForm.vue
│   │   ├── focus/FocusView.vue, PomodoroTimer.vue, PickUpSheet.vue
│   │   ├── backlog/BacklogTriage.vue, AvoidanceTriage.vue
│   │   ├── review/WeeklyReview.vue, EndOfDaySweep.vue
│   │   ├── layout/AppNav.vue (retained, unused), AppSidebar.vue
│   │   └── ui/BaseModal.vue, ColorTag.vue, ErrorMessage.vue, FilterSheet.vue,
│   │            NaturalDateInput.vue, SearchBar.vue, SkeletonCard.vue
│   ├── composables/useFocus.ts, useAmbientSound.ts, useWeeklyReview.ts,
│   │              useBacklogTriage.ts, useParkIt.ts, useAvoidance.ts, useTodayOrder.ts,
│   │              useEndOfDaySweep.ts
│   ├── features/
│   │   ├── write/
│   │   │   ├── stores/documents.ts
│   │   │   ├── composables/useWriteFocus.ts
│   │   │   └── components/WriteEditor.vue
│   │   └── canvas/
│   │       ├── stores/boards.ts, canvas-items.ts, canvas-connections.ts
│   │       └── components/CanvasCard.vue
│   ├── layouts/default.vue, auth.vue, write.vue, canvas.vue
│   ├── middleware/auth.global.ts
│   ├── pages/index.vue, inbox.vue, week.vue, calendar.vue, account.vue,
│   │         projects/index.vue, projects/[id].vue, task/[id].vue,
│   │         auth/login.vue, auth/signup.vue,
│   │         write/index.vue, write/[id].vue,
│   │         canvas/index.vue, canvas/[id].vue
│   ├── plugins/auth.client.ts
│   ├── stores/auth.ts, tasks.ts, projects.ts, taskNotes.ts, patterns.ts, dependencies.ts
│   ├── types/index.ts, database.types.ts
│   ├── utils/colors.ts, dates.ts, filters.ts, startHere.ts, taskTemplates.ts,
│   │         projectTemplates.ts
│   └── app.vue
├── supabase/migrations/
├── public/favicon.svg
├── tests/
├── Dockerfile
├── nuxt.config.ts
└── tailwind.config.ts
```

## Migrations Applied
| File | Description |
|---|---|
| `20260314113727_create_tasks.sql` | Base tasks table |
| `20260314113759_create_subtasks.sql` | Subtasks table (legacy — subtasks migrated to child tasks via parent_id) |
| `20260314125733_create_projects.sql` | Projects table |
| `20260314125753_create_task_projects.sql` | task_projects join table |
| `20260314132125_add_completed_at_to_tasks.sql` | completed_at column |
| `20260314135808_add_color_to_projects.sql` | color_tag on projects |
| `20260314140000_add_priority_fields_to_tasks.sql` | energy, interest, estimated_minutes |
| `20260314150000_tasks_parent_id_replace_subtasks.sql` | parent_id on tasks (child tasks) |
| `20260315000000_add_orbit_status.sql` | orbit status value |
| `20260316000000_add_user_patterns.sql` | user_patterns table with RLS |
| `20260316000001_tasks_pattern_id.sql` | pattern_id FK on tasks |
| `20260317000000_tasks_recurrence.sql` | recurrence column (daily/weekly/monthly) |
| `20260317000001_task_dependencies.sql` | task_dependencies table with RLS |
| `20260318000000_project_sections.sql` | project_sections table with RLS |
| `20260318000001_tasks_section_id.sql` | section_id FK on tasks |
| `20260318000002_task_notes.sql` | task_notes table with RLS |
| `20260320000000_documents.sql` | documents table with RLS |
| `20260321000000_canvas.sql` | boards + canvas_items tables with RLS |
| `20260321000001_canvas_images.sql` | image_url on canvas_items, 'image' item_type, canvas-images storage bucket |
| `20260321000002_canvas_connections.sql` | canvas_connections table (bezier connections between items) with RLS |
| `20260322000000_canvas_frames.sql` | width, height, frame_id columns; 'frame' item_type |
| `20260322000001_canvas_groups.sql` | group_id uuid on canvas_items |
| `20260322000002_canvas_shapes.sql` | 'rect' and 'ellipse' item_types |
| `20260322000003_canvas_connection_labels.sql` | label text on canvas_connections |
| `20260322000004_canvas_sort_order.sql` | sort_order bigint on canvas_items (z-layer control) |
| `20260322000005_write_templates.sql` | write_templates table with RLS |
| `20260322000006_write_document_tags.sql` | tags text[] on documents |
| `20260322000007_user_keywords.sql` | user_keywords table (global keyword tracking) with RLS |

## Current Position
- **Phase:** Write + Canvas fully shipped as integrated Hocus features.
- **Write feature:** Full distraction-free writing mode at `/write`. Tiptap editor, markdown storage, autosave, export (MD + PDF), focus mode, typewriter mode, paragraph focus, word/time goals, task linking, auto-title from heading, create-task-from-selection. Tags (text[] on documents, filter on index). Outline panel (headings sidebar, click to jump). Save as template / create from template (write_templates table). Global keywords (user_keywords table + store — select text → "Mark keyword" → saved globally, persists across docs, click to search all docs mentioning that word). ⚠️ Keyword highlighting (dotted underline in editor) broken — see Blockers.
- **Canvas feature:** Full-screen Miro-style board at `/canvas` (fixed inset-0, no top offset). Complete feature set:
  - Pan/zoom (wheel + pinch), grid snapping (28px), multi-select lasso, drag-to-move
  - Item types: task card, document card, sticky note (colored), freeform text, image (paste), frame, rect, ellipse
  - Frames: named containers, drag moves contained items, auto frame-containment on drop
  - Shapes (rect/ellipse): freely resizable via corner drag handles (screen-space, snap on release), no placeholder text
  - Bezier connections with arrowheads, click-to-delete, double-click to add/edit label
  - Layer ordering: sort_order on canvas_items; bring-to-front / send-to-back toolbar buttons + ⌘]/⌘[
  - Grouping: ⌘G / ⌘⇧G, group selection expansion on click/lasso
  - Floating sidebar (left-centre): pan, select, frame, rect, ellipse, sticky, text, add-tasks/docs panel
  - Sidebar drag-to-canvas: drag tool button → drop at exact position; click → place at canvas centre; ghost preview follows cursor
  - Link handles: 4 edge dots on single selected card → click to start a connection
  - Floating toolbar above selected item: S/M/L snap (non-shape cards), layer ↑↓ (all non-frame), Group/Ungroup
  - Keyboard: Space=temp pan, Delete/Backspace=remove, ⌘G/⌘⇧G=group, ⌘]/⌘[=layer order
- **Mobile nav:** Bottom nav removed. Hamburger (☰) top-left → slide-in AppSidebar overlay.
- **⚠️ To revisit:** orbit lifecycle thresholds (split threshold approach is uncertain — review after real use).
- **Type debt:** project_sections, task_notes, canvas tables not in generated Supabase types — re-run `supabase gen types typescript --linked > app/types/database.types.ts` after pushing all migrations.
- **Pending migrations to push:** All migrations up to `20260322000004_canvas_sort_order.sql`.
- **Blockers:** None.
- **⚠️ Known broken — keyword highlighting:** `WriteEditor.vue` registers ProseMirror plugins via `editor.registerPlugin()` (TipTap v3 does not call `addProseMirrorPlugin` on custom extensions). The plugins register without error, but decoration rendering fails with `TypeError: Cannot read properties of undefined (reading 'localsInner')` inside ProseMirror's `_DecorationGroup.locals`. Tried: `Extension.create` + `addProseMirrorPlugin` (never called in TipTap v3), plugin-state pattern (`init`/`apply`), bare `props.decorations`, returning `null` instead of `DecorationSet.empty`. All crash at `registerPlugin` → `updateState`. Root cause likely: `Decoration`/`DecorationSet` imported from `@tiptap/pm/view` is a different bundle instance than TipTap's internal ProseMirror, causing instanceof checks to fail. To fix: either import from `prosemirror-view` directly (if accessible), or use a non-ProseMirror approach (e.g. DOM post-processing, CSS injection, or a TipTap Mark that's stripped on markdown serialisation). The `user_keywords` table and store are fully working — only the visual highlighting is broken.

## Post-launch / Future Backlog
- Mobile UX audit, dark mode audit, accessibility audit, performance audit
- Today view exit transition
- Re-enable store unit tests with Supabase mocking
- ~~Backend formalisation — Node + Hono API~~ — deprioritised, Edge Functions per-feature instead
- Email to task
- Keyboard shortcuts — `P` Park It, `F` focus, `N` new task (desktop)
- ~~Focus session history log~~ — done via auto session summary notes (Phase 12)
- ~~Spatial canvas~~ — shipped as Canvas feature in Hocus
- ~~Distraction-free writing~~ — shipped as Write feature in Hocus
- ~~Canvas: fix delete button~~ — resolved
- ~~Canvas: card resize handles~~ — shapes have corner handles; notes/tasks use S/M/L snap
- ~~Canvas: connections between cards~~ — bezier arrows with labels
- ~~Canvas: frames, groups, shapes~~ — all shipped
- ~~Canvas: layer ordering~~ — sort_order + toolbar + keyboard shortcuts
- ~~Canvas: sidebar drag-to-canvas~~ — shipped
- Canvas: multiple boards per user (supported in DB, no cross-board UI yet)
- Canvas: formatting toolbar for sticky notes
- Write: formatting toolbar
- Collaboration / shared lists (v3/v4)
- Mood check-in (stored for later)
- YouTube lofi in Focus Mode (stored for later)
- Project board view (grouped by status)

## Key Design Constraints
- Reflective prompts shown **one at a time**
- Task templates populate editable subtasks (not locked)
- Today View filter: (`working_on_date` ≤ today OR `due_date` ≤ today) AND status ≠ done
- Focus Mode is a full-screen overlay — no nav chrome, no dedicated route
- Language throughout must be **calm and non-alarming**
- Completed tasks hidden by default in project/inbox views
- `completed_at` set on task done, cleared on un-done
- Priority = Energy + Interest + deadline pressure (derived)
- Start Here suggestion uses scoring algorithm in `utils/startHere.ts`
- Park It always creates tasks with no date/project — Inbox only
- section_id injected at task creation time (not via TaskForm prop)
