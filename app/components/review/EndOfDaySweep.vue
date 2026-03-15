<template>
  <div class="fixed inset-0 z-50 bg-stone-50 dark:bg-neutral-950 overflow-y-auto">
    <div class="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6 min-h-screen">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
          End of day
        </span>
        <button
          type="button"
          class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          style="min-height: 44px; min-width: 44px; display: flex; align-items: center; justify-content: flex-end;"
          @click="closeSweep"
        >
          Exit
        </button>
      </div>

      <!-- Progress dots -->
      <div class="flex items-center gap-2">
        <div
          v-for="i in STEPS"
          :key="i"
          class="h-1.5 rounded-full transition-all"
          :class="i <= step
            ? 'bg-amber-400 dark:bg-amber-500'
            : 'bg-neutral-200 dark:bg-neutral-700'"
          :style="{ width: i === step ? '24px' : '8px' }"
        />
      </div>

      <!-- Step 0: What did you finish? -->
      <template v-if="step === 0">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
            {{ finishedHeading }}
          </h1>
          <p class="text-sm text-neutral-400 dark:text-neutral-500">Tasks you completed today.</p>
        </div>

        <div v-if="finishedToday.length === 0" class="py-8 text-center">
          <p class="text-neutral-400 dark:text-neutral-500 text-sm">
            Nothing marked done today — that's OK. Tomorrow is a fresh start.
          </p>
        </div>

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="task in finishedToday"
            :key="task.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900"
          >
            <span class="flex-shrink-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
              <span class="text-white" style="font-size: 10px;">✓</span>
            </span>
            <span class="text-sm text-green-700 dark:text-green-300 line-through truncate">{{ task.title }}</span>
            <span v-if="task.completed_at" class="text-xs text-green-500 dark:text-green-600 flex-shrink-0 ml-auto">
              {{ formatTime(task.completed_at) }}
            </span>
          </div>
        </div>

        <button
          type="button"
          class="w-full py-3 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 transition-colors"
          style="min-height: 44px;"
          @click="step++"
        >
          Next
        </button>
      </template>

      <!-- Step 1: What moves to tomorrow? -->
      <template v-if="step === 1">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Move to tomorrow?</h1>
          <p class="text-sm text-neutral-400 dark:text-neutral-500">
            These were on your list today but didn't get done. Does each one move to tomorrow?
          </p>
        </div>

        <div v-if="unfinishedToday.length === 0" class="py-8 text-center">
          <p class="text-neutral-500 dark:text-neutral-400 text-sm">
            Nothing left on today's list.
          </p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="task in unfinishedToday"
            :key="task.id"
            class="flex flex-col gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
            :class="{ 'opacity-50': dismissed.has(task.id) }"
          >
            <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-snug">{{ task.title }}</p>

            <div v-if="!dismissed.has(task.id)" class="flex gap-2 flex-wrap">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
                style="min-height: 36px;"
                @click="moveToTomorrow(task.id)"
              >
                Tomorrow
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                style="min-height: 36px;"
                @click="moveToNextWeek(task.id)"
              >
                Next week
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                style="min-height: 36px;"
                @click="dismissed.add(task.id)"
              >
                Keep today
              </button>
            </div>
            <p v-else class="text-xs text-neutral-400 dark:text-neutral-500 italic">Moved</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button type="button" class="flex-1 py-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" style="min-height: 44px;" @click="step--">Back</button>
          <button type="button" class="flex-1 py-3 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 transition-colors" style="min-height: 44px;" @click="step++">Next</button>
        </div>
      </template>

      <!-- Step 2: Pick up tomorrow -->
      <template v-if="step === 2">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Pick up tomorrow?</h1>
          <p class="text-sm text-neutral-400 dark:text-neutral-500">
            Anything from your backlog worth pulling into tomorrow? Tap to claim it.
          </p>
        </div>

        <div v-if="pickUpCandidates.length === 0" class="py-8 text-center">
          <p class="text-neutral-500 dark:text-neutral-400 text-sm">Nothing obvious to suggest.</p>
        </div>

        <div v-else class="flex flex-col gap-2">
          <button
            v-for="task in pickUpCandidates"
            :key="task.id"
            type="button"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-colors"
            :class="pickedForTomorrow.has(task.id)
              ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700'
              : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700'"
            @click="togglePickUp(task.id)"
          >
            <span
              class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
              :class="pickedForTomorrow.has(task.id)
                ? 'bg-amber-500 border-amber-500'
                : 'border-neutral-300 dark:border-neutral-600'"
            >
              <svg v-if="pickedForTomorrow.has(task.id)" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7L8 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-snug truncate">{{ task.title }}</p>
              <p v-if="task.due_date" class="text-xs mt-0.5" :class="isDueSoon(task.due_date) ? 'text-red-400 dark:text-red-500' : 'text-neutral-400 dark:text-neutral-500'">
                Due {{ formatDueDate(task.due_date) }}
              </p>
            </div>
            <span
              v-if="task.status === 'orbit'"
              class="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              orbit
            </span>
          </button>
        </div>

        <div class="flex gap-3">
          <button type="button" class="flex-1 py-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" style="min-height: 44px;" @click="step--">Back</button>
          <button type="button" class="flex-1 py-3 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 transition-colors" style="min-height: 44px;" @click="confirmPickUps">
            {{ pickedForTomorrow.size > 0 ? `Add ${pickedForTomorrow.size} to tomorrow` : 'Skip' }}
          </button>
        </div>
      </template>

      <!-- Step 3: What can you drop? -->
      <template v-if="step === 3">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Anything to drop?</h1>
          <p class="text-sm text-neutral-400 dark:text-neutral-500">
            These have been sitting overdue for a while. No pressure — but it's worth asking.
          </p>
        </div>

        <div v-if="lingeringTasks.length === 0" class="py-8 text-center">
          <p class="text-neutral-500 dark:text-neutral-400 text-sm">Nothing overdue. Nice.</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="task in lingeringTasks"
            :key="task.id"
            class="flex flex-col gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
            :class="{ 'opacity-50': dismissed.has(task.id) }"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-snug">{{ task.title }}</p>
              <span v-if="task.working_on_date" class="text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                {{ staleDays(task.working_on_date) }}d overdue
              </span>
            </div>

            <div v-if="!dismissed.has(task.id)" class="flex gap-2 flex-wrap">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                style="min-height: 36px;"
                @click="dropTask(task.id)"
              >
                Drop it
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                style="min-height: 36px;"
                @click="parkTask(task.id)"
              >
                Park it
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                style="min-height: 36px;"
                @click="dismissed.add(task.id)"
              >
                Keep it
              </button>
            </div>
            <p v-else class="text-xs text-neutral-400 dark:text-neutral-500 italic">Done</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button type="button" class="flex-1 py-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" style="min-height: 44px;" @click="step--">Back</button>
          <button type="button" class="flex-1 py-3 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 transition-colors" style="min-height: 44px;" @click="step++">Finish</button>
        </div>
      </template>

      <!-- Step 4: Done -->
      <template v-if="step === 4">
        <div class="flex flex-col items-center justify-center py-16 gap-6 text-center">
          <p class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Day closed.</p>
          <p class="text-sm text-neutral-400 dark:text-neutral-500 leading-relaxed max-w-xs">
            {{ closingMessage }}
          </p>
          <button
            type="button"
            class="px-8 py-3 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 active:bg-amber-700 transition-colors"
            style="min-height: 44px;"
            @click="closeSweep"
          >
            Done
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import { isToday, isOverdue } from '~/utils/dates'

const STEPS = [1, 2, 3, 4, 5]
const step = ref(0)
const dismissed = reactive(new Set<string>())
const pickedForTomorrow = reactive(new Set<string>())

const tasksStore = useTasksStore()
const { closeSweep } = useEndOfDaySweep()

const today = new Date().toISOString().split('T')[0]!
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]!
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function staleDays(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

function isDueSoon(date: string): boolean {
  const days = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return days <= 3
}

function formatDueDate(date: string): string {
  const d = new Date(date + 'T12:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// Step 0: finished today
const finishedToday = computed(() =>
  tasksStore.tasks
    .filter(t => t.status === 'done' && t.completed_at && isToday(t.completed_at) && t.parent_id === null)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
)

const finishedHeading = computed(() => {
  const n = finishedToday.value.length
  if (n === 0) return 'Today'
  if (n === 1) return 'You finished 1 thing'
  return `You finished ${n} things`
})

// Step 1: on today's list, not done
const unfinishedToday = computed(() =>
  tasksStore.tasks.filter(t =>
    !dismissed.has(t.id) &&
    t.status !== 'done' &&
    t.parent_id === null &&
    t.working_on_date === today
  )
)

async function moveToTomorrow(id: string) {
  await tasksStore.updateTask(id, { working_on_date: tomorrow })
  dismissed.add(id)
}

async function moveToNextWeek(id: string) {
  await tasksStore.updateTask(id, { working_on_date: nextWeek })
  dismissed.add(id)
}

// Step 2: candidates to pick up tomorrow
function candidateScore(task: typeof tasksStore.tasks[number]): number {
  let score = 0
  const daysUntilDue = task.due_date
    ? (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    : Infinity
  if (daysUntilDue <= 1) score += 100
  else if (daysUntilDue <= 3) score += 50
  else if (daysUntilDue <= 7) score += 20
  if (task.status === 'orbit') score += 30
  if (task.interest === 'want_to') score += 10
  if (task.energy === 'easy') score += 5
  return score
}

const pickUpCandidates = computed(() =>
  tasksStore.tasks
    .filter(t => {
      if (dismissed.has(t.id)) return false
      if (t.status === 'done') return false
      if (t.parent_id !== null) return false
      // Exclude tasks already on today (handled in step 1) or already on tomorrow
      if (t.working_on_date === today || t.working_on_date === tomorrow) return false
      return true
    })
    .sort((a, b) => candidateScore(b) - candidateScore(a))
    .slice(0, 10)
)

function togglePickUp(id: string) {
  if (pickedForTomorrow.has(id)) pickedForTomorrow.delete(id)
  else pickedForTomorrow.add(id)
}

async function confirmPickUps() {
  if (pickedForTomorrow.size > 0) {
    await Promise.all(
      [...pickedForTomorrow].map(id => tasksStore.updateTask(id, { working_on_date: tomorrow }))
    )
  }
  step.value++
}

// Step 3: lingering overdue tasks (working_on_date < today)
const lingeringTasks = computed(() =>
  tasksStore.tasks.filter(t => {
    if (dismissed.has(t.id)) return false
    if (t.status === 'done') return false
    if (t.parent_id !== null) return false
    if (!t.working_on_date) return false
    return isOverdue(t.working_on_date)
  }).sort((a, b) =>
    new Date(a.working_on_date!).getTime() - new Date(b.working_on_date!).getTime()
  )
)

async function dropTask(id: string) {
  dismissed.add(id)
  await tasksStore.deleteTask(id)
}

async function parkTask(id: string) {
  // Remove working_on_date so it falls out of Today and into the backlog/inbox
  await tasksStore.updateTask(id, { working_on_date: null })
  dismissed.add(id)
}

// Step 4: closing message
const closingMessage = computed(() => {
  const done = finishedToday.value.length
  if (done === 0) return 'Rest up. Tomorrow you start fresh.'
  if (done === 1) return 'One thing done is one thing done. Rest up.'
  return `${done} things done. That took real effort — rest up.`
})

watch(step, (s) => {
  if (s === 0) {
    dismissed.clear()
    pickedForTomorrow.clear()
  }
})
</script>
