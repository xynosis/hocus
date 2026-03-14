<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <AppSidebar
      class="hidden sm:flex"
      @open-task-sheet="isSheetOpen = true"
    />

    <div class="sm:pl-56 pb-24 sm:pb-8 min-h-screen">
      <slot />
    </div>

    <AppNav
      class="sm:hidden"
      @open-task-sheet="isSheetOpen = true"
    />

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

    <!-- Park it floating button -->
    <button
      v-if="!focusTaskId"
      type="button"
      aria-label="Park a thought"
      class="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 w-12 h-12 rounded-full bg-amber-400 dark:bg-amber-500 text-white shadow-lg flex items-center justify-center hover:bg-amber-500 dark:hover:bg-amber-400 active:scale-95 transition-all"
      @click="openParkIt"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>

    <ParkItSheet v-model="parkItOpen" />
  </div>
</template>

<script setup lang="ts">
import AppNav from '~/components/layout/AppNav.vue'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import TaskForm from '~/components/task/TaskForm.vue'
import FocusView from '~/components/focus/FocusView.vue'
import PickUpSheet from '~/components/focus/PickUpSheet.vue'
import WeeklyReview from '~/components/review/WeeklyReview.vue'
import BacklogTriage from '~/components/backlog/BacklogTriage.vue'
import AvoidanceTriage from '~/components/backlog/AvoidanceTriage.vue'
import ParkItSheet from '~/components/task/ParkItSheet.vue'
import { useTasksStore } from '~/stores/tasks'
import { useProjectsStore } from '~/stores/projects'
import type { CreateTaskPayload } from '~/stores/tasks'

const { focusTaskId, pickUpTaskId, confirmPickUp, dismissPickUp } = useFocus()
const { isOpen: reviewOpen } = useWeeklyReview()
const { isOpen: triageOpen } = useBacklogTriage()
const { isOpen: avoidanceOpen } = useAvoidance()
const { isOpen: parkItOpen, openParkIt } = useParkIt()

const showPickUp = computed({
  get: () => !!pickUpTaskId.value,
  set: (val) => { if (!val) dismissPickUp() },
})

const isSheetOpen = ref(false)
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

async function onTaskSubmit(payload: CreateTaskPayload, projectIds: string[]) {
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