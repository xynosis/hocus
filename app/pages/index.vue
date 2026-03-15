<template>
  <div class="p-4">
    <!-- Normal Today header -->
    <div v-if="!startHereActive" class="flex items-center justify-between px-2 py-3">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Today</h1>
        <NuxtLink to="/week"
          class="text-xs text-neutral-400 dark:text-neutral-500 hover:text-purple-500 dark:hover:text-purple-400 transition-colors flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="3" width="14" height="11" rx="1.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
            <path d="M5 1v3M11 1v3M1 7h14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          7 days
        </NuxtLink>
      </div>
      <div class="flex items-center gap-1">
        <SearchBar v-model="search" />
        <button v-if="todayTasks.length > 1" type="button"
          class="text-xs font-medium px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
          style="min-height: 44px;" @click="activateStartHere">
          Where do I start?
        </button>
        <button type="button" class="relative flex items-center justify-center rounded-xl transition-colors" :class="filterCount > 0
          ? 'text-purple-500 dark:text-purple-400'
          : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'"
          style="min-height: 44px; min-width: 44px;" aria-label="Filter tasks" @click="showFilterSheet = true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4h14M5 9h8M8 14h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <span v-if="filterCount > 0"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center"
            style="font-size: 10px;">
            {{ filterCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Start Here: single task view -->
    <Transition name="fade">
      <div v-if="startHereActive && startHereTask" class="flex flex-col gap-4">
        <div class="flex items-center justify-between px-2 py-3">
          <span class="text-sm font-medium text-purple-500 dark:text-purple-400">Start here</span>
          <button type="button"
            class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            style="min-height: 44px;" @click="dismissStartHere">
            Back to Today
          </button>
        </div>

        <p class="px-2 text-sm text-neutral-500 dark:text-neutral-400">
          Based on what's on your plate, this is a good place to start.
        </p>

        <TaskCard :task="startHereTask" @click="onTaskClick(startHereTask)" @delete="onDelete(startHereTask.id)"
          @door-opener="onDoorOpener(startHereTask)" @push="onPush(startHereTask)" />
      </div>
    </Transition>

    <!-- Normal task list -->
    <template v-if="!startHereActive">
      <div v-if="tasksStore.isLoading" class="flex flex-col gap-3">
        <SkeletonCard v-for="n in 3" :key="n" />
      </div>
      <ErrorMessage v-if="tasksStore.error" :message="tasksStore.error" :on-retry="() => tasksStore.fetchTasks()" />
      <VueDraggable v-else v-model="todayTasksOrdered" class="flex flex-col gap-3" handle=".drag-handle"
        :animation="150" @end="onDragEnd">
        <div v-for="task in todayTasksOrdered" :key="task.id" class="flex items-stretch gap-1.5">
          <button
            class="drag-handle flex items-center justify-center text-neutral-300 dark:text-neutral-600 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 rounded-xl"
            style="min-width: 24px; padding: 4px;" aria-label="Drag to reorder" @click.prevent>
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <circle cx="3" cy="2.5" r="1.2" fill="currentColor" />
              <circle cx="9" cy="2.5" r="1.2" fill="currentColor" />
              <circle cx="3" cy="7" r="1.2" fill="currentColor" />
              <circle cx="9" cy="7" r="1.2" fill="currentColor" />
              <circle cx="3" cy="11.5" r="1.2" fill="currentColor" />
              <circle cx="9" cy="11.5" r="1.2" fill="currentColor" />
            </svg>
          </button>
          <div class="flex-1 min-w-0">
            <TaskCard :task="task" :search-term="searchTerm || undefined" @click="onTaskClick(task)"
              @delete="onDelete(task.id)" @door-opener="onDoorOpener(task)" @push="onPush(task)" />
          </div>
        </div>
      </VueDraggable>

      <Transition name="fade">
        <div v-if="todayTasks.length === 0 && completedToday.length === 0"
          class="flex flex-col items-center justify-center py-20 gap-2">
          <p class="text-neutral-400 dark:text-neutral-500 text-base">You're all caught up.</p>
          <p class="text-neutral-400 dark:text-neutral-500 text-sm">Enjoy the calm.</p>
        </div>
      </Transition>

      <div v-if="completedToday.length > 0" class="mt-6">
        <button type="button" class="flex items-center gap-2 w-full px-2 py-3 text-sm transition-colors" :class="showCompleted
          ? 'text-neutral-600 dark:text-neutral-400'
          : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400'"
          @click="showCompleted = !showCompleted">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="transition-transform flex-shrink-0"
            :class="showCompleted ? 'rotate-180' : ''">
            <path d="M2 4L7 9L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          <span v-if="!showCompleted">
            {{ completedToday.length === 1
              ? 'You finished 1 thing today'
              : `You finished ${completedToday.length} things today` }}
          </span>
          <span v-else class="font-medium">Finished today</span>
        </button>

        <Transition name="expand">
          <div v-if="showCompleted" class="flex flex-col gap-4 mt-2">
            <div
              class="rounded-2xl bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 px-4 py-3">
              <p class="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                {{ completionMessage }}
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <div v-for="task in completedToday" :key="task.id"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 cursor-pointer"
                @click="navigateTo(`/task/${task.id}`)">
                <span class="flex-shrink-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                  <span class="text-white" style="font-size: 10px;">✓</span>
                </span>
                <span class="text-sm text-green-700 dark:text-green-300 line-through truncate">
                  {{ task.title }}
                </span>
                <span v-if="task.completed_at" class="text-xs text-green-500 dark:text-green-600 flex-shrink-0 ml-auto">
                  {{ formatTime(task.completed_at) }}
                </span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </template>

    <!-- Weekly review + backlog triage + avoidance entry -->
    <div v-if="!startHereActive && !searchTerm" class="px-2 flex gap-2 flex-wrap">
      <button type="button"
        class="flex-1 py-2.5 rounded-xl text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
        style="min-height: 44px;" @click="openReview">
        Weekly review
      </button>
      <button type="button"
        class="flex-1 py-2.5 rounded-xl text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
        style="min-height: 44px;" @click="openSweep">
        End of day
      </button>
      <button type="button" class="flex-1 py-2.5 rounded-xl text-sm transition-colors border" :class="backlogCount > 0
        ? 'text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-300'
        : 'text-neutral-300 dark:text-neutral-600 border-neutral-100 dark:border-neutral-800'"
        style="min-height: 44px;" @click="openTriage">
        Backlog{{ backlogCount > 0 ? ` (${backlogCount})` : '' }}
      </button>
      <button type="button" class="flex-1 py-2.5 rounded-xl text-sm transition-colors border" :class="avoidanceCount > 0
        ? 'text-amber-500 dark:text-amber-400 border-amber-200 dark:border-amber-900 hover:bg-amber-50 dark:hover:bg-amber-950'
        : 'text-neutral-300 dark:text-neutral-600 border-neutral-100 dark:border-neutral-800'"
        style="min-height: 44px;" @click="openAvoidance">
        Avoiding{{ avoidanceCount > 0 ? ` (${avoidanceCount})` : '' }}
      </button>
    </div>

    <!-- Upcoming + untouched nudge -->
    <div v-if="!searchTerm && !startHereActive && untouchedUpcoming.length > 0" class="mt-4 flex flex-col gap-2">
      <p class="px-2 text-sm text-neutral-400 dark:text-neutral-500">Coming up — worth a thought</p>
      <TaskCard v-for="task in untouchedUpcoming" :key="task.id" :task="task" @click="onTaskClick(task)"
        @delete="onDelete(task.id)" @door-opener="onDoorOpener(task)" @push="onPush(task)" />
    </div>

    <BaseModal v-model="showDeleteModal" title="Delete task?" confirm-label="Delete" @confirm="confirmDelete">
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        This will permanently remove the task. This can't be undone.
      </p>
    </BaseModal>

    <FilterSheet v-model="showFilterSheet" :filters="filters" @update:filters="filters = $event" />

    <OrbitWarmingSheet v-if="orbitWarmingTask" v-model="showOrbitSheet" :task="orbitWarmingTask"
      @continue="handleOrbitContinue" @breakdown="handleOrbitBreakdown" />

    <DoorOpenerSheet v-if="doorOpenerTask" v-model="showDoorOpenerSheet" :task="doorOpenerTask" />

    <PushSheet v-model="showPushSheet" :task="pushTask" />
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import type { Task } from '~/types'
import { isTodayOrOverdue, isOverdue, isToday, toDateValue } from '~/utils/dates'
import { pickStartHereTask } from '~/utils/startHere'
import { emptyFilters, activeFilterCount, applyFilters } from '~/utils/filters'
import type { TaskFilters } from '~/utils/filters'
import BaseModal from '~/components/ui/BaseModal.vue'
import FilterSheet from '~/components/ui/FilterSheet.vue'
import SearchBar from '~/components/ui/SearchBar.vue'
import OrbitWarmingSheet from '~/components/task/OrbitWarmingSheet.vue'
import DoorOpenerSheet from '~/components/task/DoorOpenerSheet.vue'
import PushSheet from '~/components/task/PushSheet.vue'
import { VueDraggable } from 'vue-draggable-plus'

const tasksStore = useTasksStore()
const { enterFocus } = useFocus()
const { openReview } = useWeeklyReview()
const { openTriage } = useBacklogTriage()
const { openAvoidance } = useAvoidance()
const { openSweep } = useEndOfDaySweep()
const { applyOrder, saveOrder } = useTodayOrder()

// Search and filters must be declared before computeds that use them
const search = ref('')
const showFilterSheet = ref(false)
const filters = ref<TaskFilters>(emptyFilters())
const filterCount = computed(() => activeFilterCount(filters.value))

const STALE_DAYS = 3
const avoidanceCount = computed(() =>
  tasksStore.tasks.filter(t => {
    if (t.status === 'done' || t.parent_id !== null || !t.working_on_date) return false
    const days = (Date.now() - new Date(t.working_on_date).getTime()) / (1000 * 60 * 60 * 24)
    return days >= STALE_DAYS
  }).length
)

const todayTasksOrdered = ref<Task[]>([])

function onDragEnd() {
  saveOrder(todayTasksOrdered.value.map(t => t.id))
}

const backlogCount = computed(() =>
  tasksStore.tasks.filter(t =>
    t.status !== 'done' && t.parent_id === null && !t.working_on_date && !t.due_date
  ).length
)

const searchTerm = computed(() => search.value.trim().toLowerCase())

const todayTasks = computed(() => {
  if (searchTerm.value) {
    return tasksStore.tasks.filter(t =>
      t.title.toLowerCase().includes(searchTerm.value) ||
      (t.notes?.toLowerCase().includes(searchTerm.value) ?? false)
    )
  }

  const filtered = tasksStore.tasks.filter(task => {
    if (task.status === 'done') return false
    const workingOnMatch = task.working_on_date ? isTodayOrOverdue(task.working_on_date) : false
    const dueDateMatch = task.due_date ? isTodayOrOverdue(task.due_date) : false
    return workingOnMatch || dueDateMatch
  })

  const withFilters = applyFilters(filtered, filters.value)

  return withFilters.sort((a, b) => {
    const aOverdueDue = a.due_date && isOverdue(a.due_date)
    const bOverdueDue = b.due_date && isOverdue(b.due_date)
    const aOverdueWorking = a.working_on_date && isOverdue(a.working_on_date)
    const bOverdueWorking = b.working_on_date && isOverdue(b.working_on_date)

    if (aOverdueDue && !bOverdueDue) return -1
    if (!aOverdueDue && bOverdueDue) return 1
    if (aOverdueDue && bOverdueDue) return toDateValue(a.due_date) - toDateValue(b.due_date)

    if (aOverdueWorking && !bOverdueWorking) return -1
    if (!aOverdueWorking && bOverdueWorking) return 1
    if (aOverdueWorking && bOverdueWorking) return toDateValue(a.working_on_date) - toDateValue(b.working_on_date)

    if (a.due_date && !b.due_date) return -1
    if (!a.due_date && b.due_date) return 1
    if (a.due_date && b.due_date) return toDateValue(a.due_date) - toDateValue(b.due_date)

    return toDateValue(a.working_on_date) - toDateValue(b.working_on_date)
  })
})

watch(todayTasks, (newTasks) => {
  todayTasksOrdered.value = applyOrder(newTasks)
}, { immediate: true })

const completedToday = computed(() =>
  tasksStore.tasks
    .filter(t => t.status === 'done' && t.completed_at && isToday(t.completed_at))
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
)

const completionMessages = [
  'These are done. That took real effort — notice that.',
  'Look at what you actually got through today.',
  'Finished. Each one of these required you to start and follow through.',
  'Done means done. These aren\'t small things.',
  'You showed up for these. That matters.',
]

const completionMessage = computed(() => {
  const index = completedToday.value.length % completionMessages.length
  return completionMessages[index]
})

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}


// Start Here
const startHereActive = ref(false)
const startHereTask = ref<ReturnType<typeof pickStartHereTask>>(null)

function activateStartHere() {
  startHereTask.value = pickStartHereTask(todayTasks.value)
  if (startHereTask.value) startHereActive.value = true
}

function dismissStartHere() {
  startHereActive.value = false
  startHereTask.value = null
}

const showCompleted = ref(false)
const showDeleteModal = ref(false)
const pendingDeleteId = ref<string | null>(null)

// Orbit warming sheet
const showOrbitSheet = ref(false)
const orbitWarmingTask = ref<Task | null>(null)

function onTaskClick(task: Task) {
  if (task.status === 'orbit') {
    orbitWarmingTask.value = task
    showOrbitSheet.value = true
  } else {
    navigateTo(`/task/${task.id}`)
  }
}

function handleOrbitContinue() {
  showOrbitSheet.value = false
  if (orbitWarmingTask.value) enterFocus(orbitWarmingTask.value.id)
}

function handleOrbitBreakdown() {
  showOrbitSheet.value = false
  if (orbitWarmingTask.value) navigateTo(`/task/${orbitWarmingTask.value.id}`)
}

// Door opener sheet
const showDoorOpenerSheet = ref(false)
const doorOpenerTask = ref<Task | null>(null)

function onDoorOpener(task: Task) {
  doorOpenerTask.value = task
  showDoorOpenerSheet.value = true
}

// Push sheet
const showPushSheet = ref(false)
const pushTask = ref<Task | null>(null)

function onPush(task: Task) {
  pushTask.value = task
  showPushSheet.value = true
}

// Upcoming + untouched nudge
const untouchedUpcoming = computed(() => {
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  return tasksStore.tasks.filter(task => {
    if (task.status !== 'todo') return false
    if (!task.due_date) return false
    const due = new Date(task.due_date)
    if (due <= now || due > threeDaysFromNow) return false
    const children = tasksStore.getChildTasks(task.id)
    return !children.some(c => c.status === 'done')
  })
})

onUnmounted(() => {
  showCompleted.value = false
  startHereActive.value = false
})

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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.25s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
}
</style>
