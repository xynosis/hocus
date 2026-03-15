# STATE.md — Hocus

_Paste this at the start of any new chat to restore context._

## Project
**Hocus** — ADHD-friendly task management app. Nuxt 4 + TypeScript + Tailwind + Pinia + Supabase. Mobile-first web. Live at todo.kierancutting.co.uk.

## Product Vision
Three-tool suite for ADHD-friendly deep work:
- **Hocus** — task and focus management (this app)
- **[Spatial tool]** — Miro-style canvas, imports Hocus tasks. Separate product.
- **[Writing tool]** — distraction-free writing, links to Hocus tasks. Separate product.

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
| Park It button | Floating purple + button in default.vue | Hidden during focus; replaces + in bottom nav |
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
| End-of-day sweep | Full-screen overlay, 4-step guided flow | Same overlay pattern as WeeklyReview; amber colour scheme; button on Today view |
| Breakdown | Inline on task detail | Prompts + templates |
| Back navigation | `router.back()` with `/projects` fallback | |
| Projects | Name, description, due date, color | Many-to-many via task_projects |
| Project colors | Same TaskColor palette | Left border on cards, dot in sidebar |
| Project progress bar | done/total shown on project list | |
| Desktop layout | Left sidebar w-56 + main area | Today, projects, Next 7 days, Calendar, Inbox, Backlog, New task, Account |
| Mobile nav | Today, Projects, Inbox, Account | No + button; floating Park It replaces it |
| Completed in project/inbox | Hidden by default, toggle to show, resets on nav | |
| Account page | Email, sign out, delete note | hi@kierancutting.co.uk for deletion |
| Loading states | SkeletonCard with pulse | |
| Error handling | ErrorMessage with retry | |
| COLOR_MAP | `utils/colors.ts` — `getColorHex()` | |
| Favicon | SVG — purple square, white checkmark, amber twinkle stars | `public/favicon.svg` |
| Page title | Hocus | `nuxt.config.ts` app.head |
| Deployment | Coolify on Hetzner, Dockerfile | Auto-deploys on push to main |
| Orbit status | Inferred (client-side on app load) + manual set | tasks where status=in_progress and updated_at > 4h ago → orbit |
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
│   │   ├── layout/AppNav.vue, AppSidebar.vue
│   │   └── ui/BaseModal.vue, ColorTag.vue, ErrorMessage.vue, FilterSheet.vue,
│   │            NaturalDateInput.vue, SearchBar.vue, SkeletonCard.vue
│   ├── composables/useFocus.ts, useAmbientSound.ts, useWeeklyReview.ts,
│   │              useBacklogTriage.ts, useParkIt.ts, useAvoidance.ts, useTodayOrder.ts,
│   │              useEndOfDaySweep.ts
│   ├── layouts/default.vue, auth.vue
│   ├── middleware/auth.global.ts
│   ├── pages/index.vue, inbox.vue, week.vue, calendar.vue, account.vue, projects/index.vue,
│   │         projects/[id].vue, task/[id].vue, auth/login.vue, auth/signup.vue
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
| `20260318000000_project_sections.sql` | project_sections table with RLS ⚠️ pending push |
| `20260318000001_tasks_section_id.sql` | section_id FK on tasks ⚠️ pending push |
| `20260318000002_task_notes.sql` | task_notes table with RLS ⚠️ pending push |

> ⚠️ Run `supabase db push` to apply the three pending migrations.

## Current Position
- **Phase:** Phase 10 in progress.
- **Completed in Phase 10:** Full-text search, project sections (add/rename/delete/reorder), progress notes, end-of-focus note, drag-to-reorder Today, Park It capture, avoidance detector, backlog triage, visual redesign (stone bg + status tints), Inbox rename, end-of-day sweep. Phase 10 complete.
- **Phase 11 complete:** Next 7 Days + Calendar views done.
- **Pending migrations to push:** `20260318000000`, `20260318000001`, `20260318000002`
- **Type debt:** project_sections and task_notes not in generated Supabase types — re-run `supabase gen types typescript --linked > app/types/database.types.ts` after pushing migrations.
- **Blockers:** None.

## Post-launch / Future Backlog
- Mobile UX audit, dark mode audit, accessibility audit, performance audit
- Today view exit transition
- Re-enable store unit tests with Supabase mocking
- Backend formalisation — Node + Hono API (Phase 12)
- Email to task
- Keyboard shortcuts — `P` Park It, `F` focus, `N` new task (desktop)
- Focus session history log
- Spatial canvas (separate tool — long term)
- Distraction-free writing (separate tool — long term)
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
