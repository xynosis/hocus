<template>
  <div class="fixed inset-0 z-50 bg-white dark:bg-neutral-950 overflow-y-auto">
    <div class="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6 min-h-screen">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
          Weekly review
        </span>
        <button
          type="button"
          class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          style="min-height: 44px; min-width: 44px; display: flex; align-items: center; justify-content: flex-end;"
          @click="closeReview"
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
            ? 'bg-purple-400 dark:bg-purple-500'
            : 'bg-neutral-200 dark:bg-neutral-700'"
          :style="{ width: i === step ? '24px' : '8px' }"
        />
      </div>

      <!-- Step 0: Wins -->
      <template v-if="step === 0">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
            {{ winsHeading }}
          </h1>
          <p class="text-sm text-neutral-400 dark:text-neutral-500">Tasks you completed in the last 7 days.</p>
        </div>

        <div v-if="wins.length === 0" class="py-8 text-center">
          <p class="text-neutral-400 dark:text-neutral-500 text-sm">Nothing completed this week — that's OK. Fresh start.</p>
        </div>

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="task in wins"
            :key="task.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900"
          >
            <span class="flex-shrink-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
              <span class="text-white" style="font-size: 10px;">✓</span>
            </span>
            <span class="text-sm text-green-700 dark:text-green-300 line-through truncate">{{ task.title }}</span>
            <span v-if="task.completed_at" class="text-xs text-green-500 dark:text-green-600 flex-shrink-0 ml-auto">
              {{ formatDate(task.completed_at) }}
            </span>
          </div>
        </div>

        <button type="button" class="w-full py-3 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors" style="min-height: 44px;" @click="step++">
          Next
        </button>
      </template>

      <!-- Step 1: Overdue -->
      <template v-if="step === 1">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Past due</h1>
          <p class="text-sm text-neutral-400 dark:text-neutral-500">These tasks have passed their due date.</p>
        </div>

        <div v-if="overdueList.length === 0" class="py-8 text-center">
          <p class="text-neutral-500 dark:text-neutral-400 text-sm">Nothing overdue.</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="task in overdueList"
            :key="task.id"
            class="flex flex-col gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-red-100 dark:border-red-900"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-snug">{{ task.title }}</p>
              <span class="text-xs text-red-500 dark:text-red-400 flex-shrink-0">{{ formatDate(task.due_date!) }}</span>
            </div>

            <div v-if="reschedulingId === task.id" class="flex gap-2 mt-1">
              <input
                v-model="rescheduleDate"
                type="date"
                class="flex-1 rounded-xl border px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="button"
                class="px-4 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                style="min-height: 44px;"
                @click="confirmReschedule(task.id)"
              >
                Set
              </button>
              <button type="button" class="px-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" style="min-height: 44px;" @click="reschedulingId = null">
                ×
              </button>
            </div>

            <div v-else class="flex gap-2 flex-wrap">
              <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900 transition-colors" style="min-height: 36px;" @click="markDone(task.id)">
                Done
              </button>
              <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors" style="min-height: 36px;" @click="startReschedule(task.id, task.due_date!)">
                Reschedule
              </button>
              <button type="button" class="px-3 py-1.5 rounded-lg text-xs text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" style="min-height: 36px;" @click="dropTask(task.id)">
                Drop it
              </button>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button type="button" class="flex-1 py-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" style="min-height: 44px;" @click="step--">Back</button>
          <button type="button" class="flex-1 py-3 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors" style="min-height: 44px;" @click="step++">Next</button>
        </div>
      </template>

      <!-- Step 2: Upcoming without a working_on_date -->
      <template v-if="step === 2">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Coming up</h1>
          <p class="text-sm text-neutral-400 dark:text-neutral-500">Due in the next 7 days — no working date set yet.</p>
        </div>

        <div v-if="upcomingList.length === 0" class="py-8 text-center">
          <p class="text-neutral-500 dark:text-neutral-400 text-sm">Nothing coming up, or it's all scheduled.</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="task in upcomingList"
            :key="task.id"
            class="flex flex-col gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-snug">{{ task.title }}</p>
              <span class="text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0">Due {{ formatDate(task.due_date!) }}</span>
            </div>

            <div v-if="schedulingId === task.id" class="flex gap-2 mt-1">
              <input
                v-model="scheduleDate"
                type="date"
                class="flex-1 rounded-xl border px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button type="button" class="px-4 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors" style="min-height: 44px;" @click="confirmSchedule(task.id)">
                Set
              </button>
              <button type="button" class="px-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" style="min-height: 44px;" @click="schedulingId = null">×</button>
            </div>

            <div v-else class="flex gap-2 flex-wrap">
              <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors" style="min-height: 36px;" @click="scheduleToday(task.id)">
                Work on it today
              </button>
              <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors" style="min-height: 36px;" @click="startSchedule(task.id)">
                Pick a date
              </button>
              <button type="button" class="px-3 py-1.5 rounded-lg text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" style="min-height: 36px;" @click="dismissed.add(task.id)">
                Skip
              </button>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button type="button" class="flex-1 py-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" style="min-height: 44px;" @click="step--">Back</button>
          <button type="button" class="flex-1 py-3 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors" style="min-height: 44px;" @click="step++">Finish</button>
        </div>
      </template>

      <!-- Step 3: Done -->
      <template v-if="step === 3">
        <div class="flex flex-col items-center justify-center py-16 gap-6 text-center">
          <p class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Review done.</p>
          <p class="text-sm text-neutral-400 dark:text-neutral-500 leading-relaxed max-w-xs">
            {{ wrapUpMessage }}
          </p>
          <button type="button" class="px-8 py-3 rounded-xl bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 active:bg-purple-700 transition-colors" style="min-height: 44px;" @click="closeReview">
            Back to today
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import { isOverdue, formatDate } from '~/utils/dates'

const STEPS = [1, 2, 3, 4]
const step = ref(0)
const dismissed = reactive(new Set<string>())

const tasksStore = useTasksStore()
const { closeReview } = useWeeklyReview()

const today = new Date().toISOString().split('T')[0]!

// Step 0: wins — completed in last 7 days
const wins = computed(() => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return tasksStore.tasks.filter(t =>
    t.status === 'done' &&
    t.completed_at &&
    new Date(t.completed_at) >= sevenDaysAgo &&
    t.parent_id === null
  ).sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
})

const winsHeading = computed(() => {
  const n = wins.value.length
  if (n === 0) return 'This week'
  if (n === 1) return 'You finished 1 thing'
  return `You finished ${n} things`
})

// Step 1: overdue
const overdueList = computed(() =>
  tasksStore.tasks.filter(t =>
    !dismissed.has(t.id) &&
    t.status !== 'done' &&
    t.parent_id === null &&
    t.due_date != null &&
    isOverdue(t.due_date)
  )
)

const reschedulingId = ref<string | null>(null)
const rescheduleDate = ref('')

function startReschedule(id: string, currentDate: string) {
  reschedulingId.value = id
  rescheduleDate.value = currentDate
}

async function confirmReschedule(id: string) {
  if (!rescheduleDate.value) return
  await tasksStore.updateTask(id, { due_date: rescheduleDate.value })
  dismissed.add(id)
  reschedulingId.value = null
}

async function markDone(id: string) {
  await tasksStore.setTaskStatus(id, 'done')
  dismissed.add(id)
}

async function dropTask(id: string) {
  dismissed.add(id)
  await tasksStore.deleteTask(id)
}

// Step 2: upcoming without working_on_date
const upcomingList = computed(() => {
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return tasksStore.tasks.filter(t => {
    if (dismissed.has(t.id)) return false
    if (t.status === 'done') return false
    if (t.parent_id !== null) return false
    if (!t.due_date) return false
    if (t.working_on_date) return false
    const due = new Date(t.due_date)
    return due > now && due <= sevenDaysFromNow
  }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
})

const schedulingId = ref<string | null>(null)
const scheduleDate = ref('')

function startSchedule(id: string) {
  schedulingId.value = id
  scheduleDate.value = today
}

async function confirmSchedule(id: string) {
  if (!scheduleDate.value) return
  await tasksStore.updateTask(id, { working_on_date: scheduleDate.value })
  dismissed.add(id)
  schedulingId.value = null
}

async function scheduleToday(id: string) {
  await tasksStore.updateTask(id, { working_on_date: today })
  dismissed.add(id)
}

// Step 3: wrap-up
const wrapUpMessage = computed(() => {
  const parts: string[] = []
  if (wins.value.length > 0) parts.push(`${wins.value.length} thing${wins.value.length !== 1 ? 's' : ''} done`)
  return parts.length > 0
    ? `${parts.join(', ')}. You're on top of it.`
    : 'Your tasks are up to date.'
})

// Reset state when opened
watch(step, (s) => {
  if (s !== 1) reschedulingId.value = null
  if (s !== 2) schedulingId.value = null
})
</script>
