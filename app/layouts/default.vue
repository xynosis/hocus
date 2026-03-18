<template>
  <div class="min-h-screen bg-stone-50 dark:bg-neutral-950">
    <Transition name="fade">
      <div v-if="isOffline"
        class="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 px-4 py-2 bg-neutral-800 dark:bg-neutral-900 text-neutral-200 text-sm"
        style="min-height: 40px;">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="flex-shrink-0">
          <path d="M7 1v6M7 10.5v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.2"/>
        </svg>
        You're offline — changes will sync when reconnected
      </div>
    </Transition>
    <!-- Mobile top bar -->
    <div class="sm:hidden fixed top-0 inset-x-0 z-30 flex items-center h-12 px-4 bg-stone-50/95 dark:bg-neutral-950/95 backdrop-blur border-b border-neutral-100 dark:border-neutral-800">
      <button
        type="button"
        class="flex items-center justify-center w-9 h-9 text-neutral-500 dark:text-neutral-400"
        aria-label="Open navigation"
        @click="mobileNavOpen = true"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <AppSidebar
      :open="mobileNavOpen"
      @open-task-sheet="isSheetOpen = true; mobileNavOpen = false"
      @close="mobileNavOpen = false"
    />

    <div class="sm:pl-56 pt-12 sm:pt-0 pb-8 min-h-screen">
      <slot />
    </div>

    <TaskForm v-model="isSheetOpen" @submit="onTaskSubmit" />

    <PickUpSheet
      v-if="pickUpTaskId"
      v-model="showPickUp"
      :task-id="pickUpTaskId"
      @start="onPickUpStart"
      @view-task="onPickUpViewTask"
    />

    <Transition name="focus">
      <FocusView
        v-if="focusTaskId"
        :task-id="focusTaskId"
      />
    </Transition>

    <Transition name="focus">
      <WeeklyReview v-if="reviewOpen" />
    </Transition>

    <Transition name="focus">
      <BacklogTriage v-if="triageOpen" />
    </Transition>

    <Transition name="focus">
      <AvoidanceTriage v-if="avoidanceOpen" />
    </Transition>

    <Transition name="focus">
      <EndOfDaySweep v-if="sweepOpen" />
    </Transition>

    <!-- Park it floating button -->
    <button
      v-if="!focusTaskId"
      type="button"
      aria-label="Park a thought"
      class="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-40 w-12 h-12 rounded-full bg-purple-500 dark:bg-purple-600 text-white shadow-lg flex items-center justify-center hover:bg-purple-600 dark:hover:bg-purple-500 active:scale-95 transition-all"
      @click="openParkIt"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>

    <ParkItSheet v-model="parkItOpen" />

    <OrbitWarmingSheet
      v-if="orbitTask"
      v-model="orbitWarmingOpen"
      :task="orbitTask"
      @continue="onOrbitContinue"
      @breakdown="onOrbitBreakdown"
    />
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
import TaskForm from '~/components/task/TaskForm.vue'
import FocusView from '~/components/focus/FocusView.vue'
import PickUpSheet from '~/components/focus/PickUpSheet.vue'
import WeeklyReview from '~/components/review/WeeklyReview.vue'
import BacklogTriage from '~/components/backlog/BacklogTriage.vue'
import AvoidanceTriage from '~/components/backlog/AvoidanceTriage.vue'
import ParkItSheet from '~/components/task/ParkItSheet.vue'
import EndOfDaySweep from '~/components/review/EndOfDaySweep.vue'
import OrbitWarmingSheet from '~/components/task/OrbitWarmingSheet.vue'
import { useTasksStore } from '~/stores/tasks'
import { useProjectsStore } from '~/stores/projects'


const { focusTaskId, pickUpTaskId, confirmPickUp, dismissPickUp, enterFocus } = useFocus()
const { orbitTask, isOpen: orbitWarmingOpen, close: closeOrbitWarming } = useOrbitWarming()

function onOrbitContinue() {
  if (orbitTask.value) enterFocus(orbitTask.value.id)
  closeOrbitWarming()
}

function onOrbitBreakdown() {
  if (orbitTask.value) navigateTo(`/task/${orbitTask.value.id}?breakdown=1`)
  closeOrbitWarming()
}
const { isOpen: reviewOpen } = useWeeklyReview()
const { isOpen: triageOpen } = useBacklogTriage()
const { isOpen: avoidanceOpen } = useAvoidance()
const { isOpen: parkItOpen, openParkIt } = useParkIt()
const { isOpen: sweepOpen } = useEndOfDaySweep()

const showPickUp = computed({
  get: () => !!pickUpTaskId.value,
  set: (val) => { if (!val) dismissPickUp() },
})

const isOffline = ref(false)
onMounted(() => {
  isOffline.value = !navigator.onLine
  window.addEventListener('online', () => { isOffline.value = false })
  window.addEventListener('offline', () => { isOffline.value = true })
})

const mobileNavOpen = ref(false)
const isSheetOpen = ref(false)
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

function isTyping(): boolean {
  const el = document.activeElement
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement)?.isContentEditable
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

function onKeyDown(e: KeyboardEvent) {
  if (isTyping()) return
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (focusTaskId.value) return // ignore shortcuts while in Focus Mode
  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault()
    isSheetOpen.value = true
  } else if (e.key === 'p' || e.key === 'P') {
    e.preventDefault()
    openParkIt()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function onTaskSubmit(payload: any, projectIds: string[]) {
  const task = await tasksStore.addTask(payload)
  if (task && projectIds.length > 0) {
    await projectsStore.syncTaskProjects(task.id, projectIds)
  }
}

function onPickUpStart() {
  if (pickUpTaskId.value) confirmPickUp(pickUpTaskId.value)
}

function onPickUpViewTask() {
  if (pickUpTaskId.value) {
    const id = pickUpTaskId.value
    dismissPickUp()
    navigateTo(`/task/${id}`)
  }
}
</script>

<style>
.focus-enter-active,
.focus-leave-active {
  transition: opacity 0.3s ease;
}
.focus-enter-from,
.focus-leave-to {
  opacity: 0;
}
</style>