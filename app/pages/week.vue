<template>
  <div class="p-4 flex flex-col gap-4">
    <div class="flex items-center justify-between px-2 py-3">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Next 7 days</h1>
        <NuxtLink to="/calendar"
          class="text-xs text-neutral-400 dark:text-neutral-500 hover:text-purple-500 dark:hover:text-purple-400 transition-colors flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2" width="14" height="13" rx="1.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
            <path d="M5 1v2M11 1v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            <path d="M1 6h14" stroke="currentColor" stroke-width="1.4"/>
            <circle cx="5" cy="10" r="1" fill="currentColor"/>
            <circle cx="8" cy="10" r="1" fill="currentColor"/>
            <circle cx="11" cy="10" r="1" fill="currentColor"/>
          </svg>
          Month
        </NuxtLink>
      </div>
      <div class="flex items-center gap-1">
        <SearchBar v-model="search" />
        <button type="button"
          class="relative flex items-center justify-center rounded-xl transition-colors"
          :class="filterCount > 0
            ? 'text-purple-500 dark:text-purple-400'
            : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'"
          style="min-height: 44px; min-width: 44px;" aria-label="Filter tasks"
          @click="showFilterSheet = true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4h14M5 9h8M8 14h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span v-if="filterCount > 0"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center"
            style="font-size: 10px;">
            {{ filterCount }}
          </span>
        </button>
      </div>
    </div>

    <div v-if="tasksStore.isLoading" class="flex flex-col gap-3">
      <SkeletonCard v-for="n in 4" :key="n" />
    </div>

    <template v-else>
      <!-- Day sections -->
      <div v-for="day in days" :key="day.dateStr" class="flex flex-col gap-2">
        <div class="flex items-center justify-between px-1 pt-2">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{{ day.label }}</h2>
            <span class="text-xs text-neutral-400 dark:text-neutral-500">{{ day.shortDate }}</span>
            <span v-if="day.isToday"
              class="text-xs font-medium px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              today
            </span>
          </div>
          <button type="button"
            class="text-xs text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
            style="min-height: 32px; display: flex; align-items: center;"
            @click="openAddForDay(day.dateStr)">
            + Add
          </button>
        </div>

        <div v-if="day.tasks.length === 0"
          class="px-2 py-2 text-xs text-neutral-400 dark:text-neutral-500 italic">
          Nothing scheduled
        </div>

        <template v-else>
          <TaskCard
            v-for="task in day.tasks"
            :key="task.id"
            :task="task"
            :search-term="searchTerm || undefined"
            @click="navigateTo(`/task/${task.id}`)"
            @delete="onDelete(task.id)"
          />
        </template>
      </div>

      <!-- Unscheduled -->
      <div class="flex flex-col gap-2 mt-2">
        <div class="flex items-center justify-between px-1 pt-2">
          <h2 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Unscheduled</h2>
          <button type="button"
            class="text-xs text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
            style="min-height: 32px; display: flex; align-items: center;"
            @click="openAddForDay(null)">
            + Add
          </button>
        </div>

        <div v-if="unscheduled.length === 0"
          class="px-2 py-2 text-xs text-neutral-400 dark:text-neutral-500 italic">
          No unscheduled tasks
        </div>

        <template v-else>
          <TaskCard
            v-for="task in unscheduled"
            :key="task.id"
            :task="task"
            :search-term="searchTerm || undefined"
            @click="navigateTo(`/task/${task.id}`)"
            @delete="onDelete(task.id)"
          />
        </template>
      </div>
    </template>

    <BaseModal v-model="showDeleteModal" title="Delete task?" confirm-label="Delete" @confirm="confirmDelete">
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        This will permanently remove the task. This can't be undone.
      </p>
    </BaseModal>

    <FilterSheet v-model="showFilterSheet" :filters="filters" @update:filters="filters = $event" />

    <TaskForm v-model="isTaskFormOpen" @submit="onTaskSubmit" />
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import { useProjectsStore } from '~/stores/projects'
import { emptyFilters, activeFilterCount, applyFilters } from '~/utils/filters'
import type { TaskFilters } from '~/utils/filters'
import type { CreateTaskPayload } from '~/stores/tasks'
import type { Task } from '~/types'
import BaseModal from '~/components/ui/BaseModal.vue'
import FilterSheet from '~/components/ui/FilterSheet.vue'
import SearchBar from '~/components/ui/SearchBar.vue'
import SkeletonCard from '~/components/ui/SkeletonCard.vue'
import TaskCard from '~/components/task/TaskCard.vue'
import TaskForm from '~/components/task/TaskForm.vue'

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

const search = ref('')
const showFilterSheet = ref(false)
const filters = ref<TaskFilters>(emptyFilters())
const filterCount = computed(() => activeFilterCount(filters.value))
const searchTerm = computed(() => search.value.trim().toLowerCase())

const isTaskFormOpen = ref(false)
const pendingWorkingOnDate = ref<string | null>(null)
const showDeleteModal = ref(false)
const pendingDeleteId = ref<string | null>(null)

function openAddForDay(dateStr: string | null) {
  pendingWorkingOnDate.value = dateStr
  isTaskFormOpen.value = true
}

async function onTaskSubmit(payload: CreateTaskPayload, projectIds: string[]) {
  const finalPayload: CreateTaskPayload = {
    ...payload,
    working_on_date: payload.working_on_date ?? pendingWorkingOnDate.value ?? undefined,
  }
  const task = await tasksStore.addTask(finalPayload)
  if (task && projectIds.length > 0) {
    await projectsStore.syncTaskProjects(task.id, projectIds)
  }
  pendingWorkingOnDate.value = null
}

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

// Build the 7-day window
interface DayEntry {
  dateStr: string
  label: string
  shortDate: string
  isToday: boolean
  tasks: Task[]
}

const days = computed<DayEntry[]>(() => {
  const result: DayEntry[] = []
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]!

  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]!

    const label = i === 0
      ? 'Today'
      : i === 1
        ? 'Tomorrow'
        : d.toLocaleDateString('en-GB', { weekday: 'long' })

    const shortDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

    const base = tasksStore.tasks.filter(t => {
      if (t.status === 'done') return false
      if (t.parent_id !== null) return false
      return t.working_on_date === dateStr || t.due_date === dateStr
    })

    const filtered = searchTerm.value
      ? base.filter(t =>
          t.title.toLowerCase().includes(searchTerm.value) ||
          (t.notes?.toLowerCase().includes(searchTerm.value) ?? false)
        )
      : applyFilters(base, filters.value)

    result.push({ dateStr, label, shortDate, isToday: dateStr === todayStr, tasks: filtered })
  }

  return result
})

const unscheduled = computed(() => {
  const scheduledIds = new Set(days.value.flatMap(d => d.tasks.map(t => t.id)))
  const base = tasksStore.tasks.filter(t => {
    if (t.status === 'done') return false
    if (t.parent_id !== null) return false
    if (scheduledIds.has(t.id)) return false
    // Only truly unscheduled — no working_on_date and no due_date in the 7-day window
    return !t.working_on_date && !t.due_date
  })

  return searchTerm.value
    ? base.filter(t =>
        t.title.toLowerCase().includes(searchTerm.value) ||
        (t.notes?.toLowerCase().includes(searchTerm.value) ?? false)
      )
    : applyFilters(base, filters.value)
})
</script>
