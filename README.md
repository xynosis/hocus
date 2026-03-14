# Focus Flow

A calm, structured to-do list built for ADHD brains. Focus Flow helps you decide what to work on, break it into manageable pieces, and actually start — without the overwhelm.

Live at [todo.kierancutting.co.uk](https://todo.kierancutting.co.uk)

---

## What it does

**Today View** — surfaces only what needs attention now. Tasks are shown when their working-on date or due date is today or earlier. Sorted by urgency: overdue due dates first, then overdue working-on dates, then today's tasks. A collapsible "Completed today" section at the bottom lets you appreciate what you finished.

**Projects** — group tasks into projects with a name, description, due date, and color. Tasks can belong to multiple projects. Completed tasks are hidden by default with a toggle to reveal them.

**Misc** — a virtual inbox for tasks that don't belong to any project.

**Task breakdown** — open any task to break it into subtasks. Reflective prompts (one at a time) help you think through decomposition. Pre-built templates scaffold common task types like writing an essay, planning an event, or filing paperwork.

**Focus Mode** — full-screen, distraction-free view of a single task. Includes an optional Pomodoro timer (25 min work / 5 min break) with a soft audio cue on phase transitions. Completing all subtasks fires a confetti celebration.

**Dual dates** — every task has two date fields: a working-on date (when you intend to start) and a due date (the hard deadline). Both independently surface tasks in Today View.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 4 (SPA mode) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Pinia |
| Backend / DB | Supabase (Auth + Postgres + RLS) |
| Hosting | Hetzner VPS |
| Deployment | Coolify + Docker |

---

## Getting started

### Prerequisites

- Node 22+
- pnpm
- A Supabase project

### Install

```bash
git clone https://github.com/your-username/focus-flow.git
cd focus-flow
pnpm install
```

### Environment

Create a `.env` file at the project root:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-key
```

### Database

Install the Supabase CLI:

```bash
brew install supabase/tap/supabase
```

Link to your project:

```bash
supabase login
supabase link --project-ref your-project-ref
```

Apply migrations:

```bash
supabase db push
```

Generate TypeScript types:

```bash
supabase gen types typescript --linked > app/types/database.types.ts
```

### Run

```bash
pnpm dev
```

Visit `localhost:3000`.

### Test

```bash
pnpm test
```

---

## Project structure

```
focus-flow/
├── app/
│   ├── components/
│   │   ├── focus/          # FocusView, PomodoroTimer
│   │   ├── layout/         # AppNav, AppSidebar
│   │   ├── project/        # ProjectForm
│   │   ├── task/           # TaskCard, TaskForm, TaskBreakdown, SubtaskItem
│   │   └── ui/             # BaseModal, ColorTag, ErrorMessage, SkeletonCard
│   ├── composables/
│   │   └── useFocus.ts     # Focus mode shared state
│   ├── layouts/
│   │   ├── default.vue     # Main layout with nav/sidebar
│   │   └── auth.vue        # Centered auth layout
│   ├── middleware/
│   │   └── auth.global.ts  # Route protection
│   ├── pages/
│   │   ├── index.vue       # Today view
│   │   ├── misc.vue        # Unprojectd tasks
│   │   ├── account.vue     # Account settings
│   │   ├── projects/       # Projects list + detail
│   │   ├── task/           # Task detail + edit
│   │   └── auth/           # Login + signup
│   ├── plugins/
│   │   └── auth.client.ts  # Session restore before middleware
│   ├── stores/             # Pinia stores: auth, tasks, subtasks, projects
│   ├── types/              # Shared TypeScript interfaces
│   └── utils/              # dates.ts, colors.ts, taskTemplates.ts
├── supabase/
│   └── migrations/         # SQL migration files
├── tests/                  # Vitest unit tests
├── Dockerfile
├── nuxt.config.ts
└── tailwind.config.ts
```

---

## Deployment

The app is packaged as a Docker image and deployed to a Hetzner VPS via Coolify.

Coolify builds the image from the `Dockerfile` on every push to `main`. Environment variables (`SUPABASE_URL`, `SUPABASE_KEY`) are injected at runtime.

To deploy your own instance:
1. Push to a Git repository
2. Create a new Coolify application pointing at your repo
3. Set build pack to Dockerfile
4. Add environment variables
5. Set your domain and enable HTTPS
6. Deploy

---

## Design principles

- **Minimal friction** — as few taps and decisions as possible
- **Visual clarity** — task state and urgency scannable at a glance
- **Focus mode** — one task at a time, distractions hidden
- **Reflective breakdown** — prompts that help users think, not AI that thinks for them
- **Calm language** — nothing alarming, nothing urgent-sounding

---

## Out of scope (v1)

- Recurring tasks
- Task sharing / collaboration
- Calendar integrations
- Push notifications
- Native mobile app (iOS/Android)
- User-created templates
- Offline / PWA support
