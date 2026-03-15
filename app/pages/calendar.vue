<template>
  <div class="p-4 flex flex-col gap-4">

    <!-- Header -->
    <div class="flex items-center justify-between px-2 py-3">
      <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Calendar</h1>
      <NuxtLink to="/week"
        class="text-xs text-neutral-400 dark:text-neutral-500 hover:text-purple-500 dark:hover:text-purple-400 transition-colors flex items-center gap-1">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        7 days
      </NuxtLink>
    </div>

    <!-- Month nav -->
    <div class="flex items-center justify-between px-1">
      <button
        type="button"
        class="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-lg"
        @click="prevMonth">
        ‹
      </button>
      <span class="text-base font-semibold text-neutral-800 dark:text-neutral-100">{{ monthLabel }}</span>
      <button
        type="button"
        class="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-lg"
        @click="nextMonth">
        ›
      </button>
    </div>

    <!-- Day-of-week headers -->
    <div class="grid grid-cols-7 text-center">
      <span
        v-for="label in DAY_LABELS"
        :key="label"
        class="text-xs font-medium text-neutral-400 dark:text-neutral-500 py-1">
        {{ label }}
      </span>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-1">
      <button
        v-for="cell in cells"
        :key="cell.key"
        type="button"
        class="flex flex-col items-center gap-0.5 rounded-xl py-1.5 px-0.5 transition-colors min-h-12"
        :class="[
          !cell.dateStr ? 'pointer-events-none' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          cell.dateStr && selectedDate === cell.dateStr
            ? 'bg-purple-50 dark:bg-purple-950 ring-1 ring-purple-300 dark:ring-purple-700'
            : '',
        ]"
        @click="cell.dateStr && selectDay(cell.dateStr)"
      >
        <span
          v-if="cell.day"
          class="text-xs leading-none font-medium w-6 h-6 flex items-center justify-center rounded-full"
          :class="cell.dateStr === todayStr
            ? 'bg-purple-500 text-white'
            : 'text-neutral-700 dark:text-neutral-300'"
        >
          {{ cell.day }}
        </span>

        <!-- Task dots -->
        <div v-if="cell.dateStr" class="flex flex-wrap gap-0.5 justify-center" style="min-height: 10px;">
          <span
            v-for="task in (tasksByDate.get(cell.dateStr) ?? []).slice(0, 3)"
            :key="task.id"
            class="w-1.5 h-1.5 rounded-full flex-shrink-0"
            :style="{ backgroundColor: taskDotColor(task) }"
          />
          <span
            v-if="(tasksByDate.get(cell.dateStr) ?? []).length > 3"
            class="text-neutral-400 dark:text-neutral-500 leading-none"
            style="font-size: 8px; line-height: 6px;">
            +{{ (tasksByDate.get(cell.dateStr) ?? []).length - 3 }}
          </span>
        </div>
      </button>
    </div>

    <!-- Selected day panel -->
    <Transition name="slide-up">
      <div v-if="selectedDate" class="flex flex-col gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <div class="flex items-center justify-between px-1">
          <h2 class="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{{ selectedDayLabel }}</h2>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="text-xs text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
              style="min-height: 32px; display: flex; align-items: center;"
              @click="openAddForDay">
              + Add
            </button>
            <button
              type="button"
              class="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              style="min-height: 32px; display: flex; align-items: center;"
              @click="selectedDate = null">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="selectedDayTasks.length === 0"
          class="px-2 py-4 text-center text-sm text-neutral-400 dark:text-neutral-500">
          Nothing on this day.
          <button
            type="button"
            class="block mx-auto mt-2 text-xs text-purple-500 dark:text-purple-400 hover:underline"
            @click="openAddForDay">
            Add a task
          </button>
        </div>

        <div v-else class="flex flex-col gap-2">
          <TaskCard
            v-for="task in selectedDayTasks"
            :key="task.id"
            :task="task"
            @click="navigateTo(`/task/${task.id}`)"
            @delete="onDelete(task.id)"
          />
        </div>
      </div>
    </Transition>

    <BaseModal v-model="showDeleteModal" title="Delete task?" confirm-label="Delete" @confirm="confirmDelete">
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        This will permanently remove the task. This can't be undone.
      </p>
    </BaseModal>

    <TaskForm v-model="isTaskFormOpen" @submit="onTaskSubmit" />
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import { useProjectsStore } from '~/stores/projects'
import { getColorHex } from '~/utils/colors'
import type { Task } from '~/types'
import type { CreateTaskPayload } from '~/stores/tasks'
import BaseModal from '~/components/ui/BaseModal.vue'
import TaskCard from '~/components/task/TaskCard.vue'
import TaskForm from '~/components/task/TaskForm.vue'

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

const todayStr = new Date().toISOString().split('T')[0]!

// Month navigation
const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth()) // 0-indexed

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1)
    .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
)

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
  selectedDate.value = null
}

function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
  selectedDate.value = null
}

// Grid cells
interface Cell {
  key: string
  day: number | null
  dateStr: string | null
}

const cells = computed<Cell[]>(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Monday-first: Sun=0 → shift so Mon=0
  const startPad = (firstDay.getDay() + 6) % 7

  const result: Cell[] = []

  for (let i = 0; i < startPad; i++) {
    result.push({ key: `pad-s-${i}`, day: null, dateStr: null })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dateStr = date.toISOString().split('T')[0]!
    result.push({ key: dateStr, day: d, dateStr })
  }

  const endPad = (7 - (result.length % 7)) % 7
  for (let i = 0; i < endPad; i++) {
    result.push({ key: `pad-e-${i}`, day: null, dateStr: null })
  }

  return result
})

// Tasks indexed by date (deduplicated per task per day)
const tasksByDate = computed(() => {
  const map = new Map<string, Task[]>()

  const addToDay = (dateStr: string, task: Task) => {
    if (!map.has(dateStr)) map.set(dateStr, [])
    const list = map.get(dateStr)!
    if (!list.find(t => t.id === task.id)) list.push(task)
  }

  for (const task of tasksStore.tasks) {
    if (task.parent_id !== null) continue
    if (task.working_on_date) addToDay(task.working_on_date, task)
    if (task.due_date && task.due_date !== task.working_on_date) addToDay(task.due_date, task)
  }

  return map
})

function taskDotColor(task: Task): string {
  if (task.status === 'done') return '#86efac'
  if (task.due_date && task.due_date < todayStr) return '#fca5a5'
  if (task.status === 'in_progress') return '#c4b5fd'
  if (task.status === 'orbit') return '#7dd3fc'
  return getColorHex(task.color_tag) ?? '#d6d3d1'
}

// Selected day
const selectedDate = ref<string | null>(null)

function selectDay(dateStr: string) {
  selectedDate.value = selectedDate.value === dateStr ? null : dateStr
}

const selectedDayLabel = computed(() => {
  if (!selectedDate.value) return ''
  const d = new Date(selectedDate.value + 'T12:00:00')
  if (selectedDate.value === todayStr) return 'Today'
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
})

const selectedDayTasks = computed(() =>
  selectedDate.value ? (tasksByDate.value.get(selectedDate.value) ?? []) : []
)

// Add task for selected day
const isTaskFormOpen = ref(false)

function openAddForDay() {
  isTaskFormOpen.value = true
}

async function onTaskSubmit(payload: CreateTaskPayload, projectIds: string[]) {
  const finalPayload: CreateTaskPayload = {
    ...payload,
    working_on_date: payload.working_on_date ?? selectedDate.value ?? undefined,
  }
  const task = await tasksStore.addTask(finalPayload)
  if (task && projectIds.length > 0) {
    await projectsStore.syncTaskProjects(task.id, projectIds)
  }
}

// Delete
const showDeleteModal = ref(false)
const pendingDeleteId = ref<string | null>(null)

function onDelete(id: string) {
  pendingDeleteId.value = id
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (pendingDeleteId.value) {
    await tasksStore.deleteTask(pendingDeleteId.value)
    pendingDeleteId.value = null
  }
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
