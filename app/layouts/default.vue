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

    <Transition name="focus">
      <FocusView
        v-if="focusTaskId"
        :task-id="focusTaskId"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import AppNav from '~/components/layout/AppNav.vue'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import TaskForm from '~/components/task/TaskForm.vue'
import FocusView from '~/components/focus/FocusView.vue'
import { useTasksStore } from '~/stores/tasks'
import { useProjectsStore } from '~/stores/projects'
import type { CreateTaskPayload } from '~/stores/tasks'

const { focusTaskId } = useFocus()

const isSheetOpen = ref(false)
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

async function onTaskSubmit(payload: CreateTaskPayload, projectIds: string[]) {
  const task = await tasksStore.addTask(payload)
  if (task && projectIds.length > 0) {
    await projectsStore.syncTaskProjects(task.id, projectIds)
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