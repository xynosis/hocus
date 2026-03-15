# PROJECT.md — Hocus

## Overview

**Hocus** is a mobile-first, ADHD-friendly task management web application built with Nuxt 4 and Supabase. It is designed around the lived experience of ADHD: tasks pile up, priorities blur, starting feels impossible, and deadlines sneak up. Hocus addresses these friction points through thoughtful UX rather than feature bloat.

The app is not a power-user productivity suite. It is a calm, structured companion that helps users decide what to work on, break it into manageable pieces, and actually start.

---

## Product Vision

Hocus is the first of three planned tools in a suite for ADHD-friendly deep work:

- **Hocus** — task and focus management (this app)
- **[Spatial tool]** — Miro-style canvas for thinking, planning, and mapping. Imports Hocus tasks onto a free-form canvas. Own product, integrates with Hocus.
- **[Writing tool]** — distraction-free writing environment. Links to Hocus tasks as context. Own product, integrates with Hocus.

Each tool is valuable standalone. Together they cover the full ADHD workflow: capture + do → think + plan → write + create.

---

## Core Design Principles

### 1. Minimal Friction
Every interaction should require as few taps and decisions as possible. Adding a task, marking it done, or entering focus mode should feel effortless. Default values, smart placeholders, and progressive disclosure reduce cognitive load at every step.

### 2. Visual Clarity
The interface uses color-coding, iconography, and clear visual hierarchy to make task state, urgency, and structure scannable at a glance — without reading. Users should be able to understand their task landscape in under three seconds. Status-tinted card backgrounds (red=overdue, purple=in_progress, sky=orbit, green=done) reinforce state at a glance.

### 3. Focus Mode
A dedicated full-screen focus view shows one task at a time with all other UI hidden. An optional Pomodoro-style timer is available within focus mode, with optional ambient sound. This mode is designed to help users stop deciding and start doing.

Focus Mode includes active support for sustained attention and rest: an elapsed time counter grounds the user in time (addressing ADHD time blindness), a 90-minute hyperfocus nudge reminds users to rest before burning out, and the Pomodoro timer surfaces a directed break activity suggestion at the end of each work interval. After a break, a re-entry confirmation screen prevents the common pattern of accidentally skipping rest. A session summary note is automatically saved on exit, recording time worked and steps completed.

### 4. Reflective Task Breakdown
The app presents structured reflective prompts that guide users to break down tasks themselves. This preserves agency, builds self-knowledge, and produces child tasks that are personally meaningful. Common task templates offer a starting scaffold.

### 5. Dual-Date Awareness
Tasks have two date fields: a **"Working On" date** (when the user intends to begin) and a **Due Date** (the hard deadline). This distinction respects how ADHD brains plan — and why tasks often feel urgent before they're technically due.

### 6. Today View
A dedicated "Today" view surfaces tasks that need attention now. A "Start Here" mode reduces the list further and surfaces a single suggested task based on energy, interest, and deadline pressure.

### 7. Energy + Interest Priority
Rather than traditional priority levels, Hocus uses two axes that map to how ADHD brains actually decide what to do: **energy cost** (Easy / Moderate / Heavy) and **interest level** (Dreading / Neutral / Want to). These combine with deadline pressure to power smart suggestions.

### 8. Projects & Inbox
Tasks are organised into projects. Each project has a name, description, due date, and color. Tasks can belong to multiple projects. Projects can have optional named sections (phases/groups). Unprojected tasks live in the **Inbox**.

### 9. Orbit & Task Initiation
Tasks that have been `in_progress` but untouched for a period transition to an `orbit` state — a calm "live but paused" indicator that doesn't feel like a failure. Orbit tasks get a warming sheet before Focus Mode re-entry. Untouched tasks approaching their due date get a gentle nudge in Today View. Stale tasks (working_on_date 3+ days overdue) surface in the Avoidance Detector without shame.

The `in_progress` status is set automatically: entering Focus Mode on a childless task triggers it; on tasks with child tasks (container tasks), the first child completion promotes the parent. Orbit inference uses split thresholds — 4h for atomic tasks, 3 days based on child activity for container tasks.

> ⚠️ These orbit lifecycle thresholds are an initial approach and may need adjustment based on real use.

### 10. Structure & Capture
Recurring tasks, personal patterns (saved breakdown templates), task dependencies, weekly review, and the Park It brain dump capture close the loop between planning and doing. The floating Park It button is always accessible, enabling frictionless thought capture in any context — including from within Focus Mode, so mid-session thoughts can be captured without breaking concentration.

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Nuxt 4 | File-based routing, SPA mode, Vue ecosystem |
| Language | TypeScript | Type safety across composables, stores, and API calls |
| Styling | Tailwind CSS | Utility-first, consistent spacing, fast mobile iteration |
| State | Pinia | Nuxt-native, modular, TypeScript-friendly |
| Backend / DB | Supabase | Auth, Postgres, realtime, row-level security |
| Drag and drop | vue-draggable-plus | Touch + mouse, used for Today view order and planned section reordering |
| Containerisation | Docker | App packaged as a Docker image for portable deployment |
| Hosting | Hetzner VPS | Self-hosted; cost-effective, EU-based infrastructure |
| Deployment Manager | Coolify | Self-hosted PaaS managing containers, deploys, and env vars |

---

## Project Structure

```
hocus/
├── app/
│   ├── assets/css/main.css
│   ├── components/
│   │   ├── task/
│   │   │   ├── TaskCard.vue
│   │   │   ├── TaskForm.vue
│   │   │   ├── TaskBreakdown.vue
│   │   │   ├── ChildTaskItem.vue
│   │   │   ├── ParkItSheet.vue
│   │   │   ├── PushSheet.vue
│   │   │   ├── DoorOpenerSheet.vue
│   │   │   └── OrbitWarmingSheet.vue
│   │   ├── project/
│   │   │   └── ProjectForm.vue
│   │   ├── focus/
│   │   │   ├── FocusView.vue
│   │   │   ├── PomodoroTimer.vue
│   │   │   └── PickUpSheet.vue
│   │   ├── backlog/
│   │   │   ├── BacklogTriage.vue
│   │   │   └── AvoidanceTriage.vue
│   │   ├── review/
│   │   │   ├── WeeklyReview.vue
│   │   └── EndOfDaySweep.vue
│   │   ├── layout/
│   │   │   ├── AppNav.vue
│   │   │   └── AppSidebar.vue
│   │   └── ui/
│   │       ├── BaseModal.vue
│   │       ├── ColorTag.vue
│   │       ├── ErrorMessage.vue
│   │       ├── FilterSheet.vue
│   │       ├── NaturalDateInput.vue
│   │       ├── SearchBar.vue
│   │       └── SkeletonCard.vue
│   ├── composables/
│   │   ├── useAmbientSound.ts
│   │   ├── useAvoidance.ts
│   │   ├── useBacklogTriage.ts
│   │   ├── useFocus.ts
│   │   ├── useParkIt.ts
│   │   ├── useTodayOrder.ts
│   │   ├── useEndOfDaySweep.ts
│   │   └── useWeeklyReview.ts
│   ├── layouts/
│   │   ├── default.vue
│   │   └── auth.vue
│   ├── middleware/
│   │   └── auth.global.ts
│   ├── pages/
│   │   ├── index.vue
│   │   ├── inbox.vue
│   │   ├── week.vue
│   │   ├── calendar.vue
│   │   ├── account.vue
│   │   ├── projects/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   ├── task/
│   │   │   └── [id].vue
│   │   └── auth/
│   │       ├── login.vue
│   │       └── signup.vue
│   ├── plugins/
│   │   └── auth.client.ts
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── dependencies.ts
│   │   ├── patterns.ts
│   │   ├── projects.ts
│   │   ├── taskNotes.ts
│   │   └── tasks.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── database.types.ts
│   ├── utils/
│   │   ├── colors.ts
│   │   ├── dates.ts
│   │   ├── filters.ts
│   │   ├── startHere.ts
│   │   ├── taskTemplates.ts
│   │   └── projectTemplates.ts
│   └── app.vue
├── supabase/
│   └── migrations/
├── public/
│   └── favicon.svg
├── tests/
├── Dockerfile
├── nuxt.config.ts
└── tailwind.config.ts
```

---

## Target Users

People with ADHD (diagnosed or self-identified) who struggle with:
- Task initiation and knowing where to start
- Breaking vague tasks into concrete steps
- Losing track of what's urgent vs. what's due soon
- Getting overwhelmed by long to-do lists
- Motivation when tasks feel boring or heavy

The app is also usable by anyone who benefits from structured, low-distraction task management.

---

## Live

**Production:** https://todo.kierancutting.co.uk
**Stack:** Nuxt 4 + Supabase + Hetzner + Coolify

---

## Out of Scope (current version)

- Native mobile app (iOS/Android)
- Shared task lists / collaboration
- Calendar integrations
- Push notifications
- Offline mode / PWA
- Spatial canvas (planned as separate tool)
- Distraction-free writing mode (planned as separate tool)
- Mood check-in
- Email to task (Phase 10)
