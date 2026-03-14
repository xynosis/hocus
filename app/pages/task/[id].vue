<template>
  <div class="p-4 flex flex-col gap-4">
    <div v-if="!task" class="flex flex-col items-center justify-center py-20 gap-2">
      <p class="text-neutral-400 dark:text-neutral-500 text-base">Task not found.</p>
      <button type="button" class="text-purple-500 text-sm mt-2" @click="navigateTo('/')">
        Go home
      </button>
    </div>

    <template v-else>
      <div class="flex items-center gap-3 px-1">
        <button type="button"
          class="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          style="min-width: 44px; min-height: 44px; display: flex; align-items: center;" @click="router.back()">
          ← Back
        </button>
      </div>

      <div class="rounded-2xl p-5 border" :class="task.status === 'done'
        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
        : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'" :style="{
          borderLeftWidth: '4px',
          borderLeftColor: task.status === 'done'
            ? '#639922'
            : (colorHex ?? 'transparent'),
        }">
        <div class="flex items-start justify-between gap-3 mb-3">
          <h1 class="text-xl font-semibold leading-snug" :class="task.status === 'done'
            ? 'line-through text-green-700 dark:text-green-400'
            : 'text-neutral-800 dark:text-neutral-100'">
            {{ task.title }}
          </h1>
          <span class="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0" :class="{
            'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400': task.status === 'todo',
            'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300': task.status === 'in_progress',
            'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300': task.status === 'done',
          }">
            {{ statusLabel }}
          </span>
        </div>

        <p v-if="task.notes" class="text-sm text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
          {{ task.notes }}
        </p>

        <div class="flex flex-wrap gap-x-4 gap-y-1">
          <span v-if="task.working_on_date" class="text-xs text-neutral-400 dark:text-neutral-500">
            Working on {{ formatDate(task.working_on_date) }}
          </span>
          <span v-if="task.due_date" class="text-xs" :class="task.status !== 'done' && isOverdue(task.due_date)
            ? 'text-red-500 dark:text-red-400 font-medium'
            : 'text-neutral-400 dark:text-neutral-500'">
            Due {{ formatDate(task.due_date) }}
          </span>
        </div>
      </div>

      <div class="flex gap-3 px-1">
        <button type="button"
          class="flex-1 py-3 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          style="min-height: 44px;" @click="isEditSheetOpen = true">
          Edit
        </button>

        <button v-if="task.status !== 'done'" type="button"
          class="flex-1 py-3 rounded-xl text-sm font-medium bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors"
          style="min-height: 44px;" @click="enterFocus(task.id)">
          Focus
        </button>

        <button type="button"
          class="flex-1 py-3 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          style="min-height: 44px;" @click="showDeleteModal = true">
          Delete
        </button>
      </div>

      <div class="border-t border-neutral-100 dark:border-neutral-800 pt-4">
        <TaskBreakdown :task-id="task.id" />
      </div>
    </template>

    <TaskForm v-if="task" v-model="isEditSheetOpen" :task="task" @submit="onEditSubmit" />
    <BaseModal v-model="showDeleteModal" title="Delete task?" confirm-label="Delete" @confirm="onDelete">
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        This will permanently remove the task. This can't be undone.
      </p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import type { UpdateTaskPayload } from '~/stores/tasks'
import TaskForm from '~/components/task/TaskForm.vue'
import TaskBreakdown from '~/components/task/TaskBreakdown.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { isOverdue, formatDate } from '~/utils/dates'
import { useProjectsStore } from '~/stores/projects'
const projectsStore = useProjectsStore()

async function onEditSubmit(payload: UpdateTaskPayload, projectIds: string[]) {
  tasksStore.updateTask(route.params.id as string, payload)
  await projectsStore.syncTaskProjects(route.params.id as string, projectIds)
}

const router = useRouter()
const route = useRoute()
const tasksStore = useTasksStore()
const { enterFocus } = useFocus()

const task = computed(() => tasksStore.getTaskById(route.params.id as string))

import { getColorHex } from '~/utils/colors'

const colorHex = computed(() => getColorHex(task.value?.color_tag ?? null))

const statusLabel = computed(() => {
  switch (task.value?.status) {
    case 'in_progress': return 'In progress'
    case 'done': return 'Done'
    default: return 'To do'
  }
})

const isEditSheetOpen = ref(false)
const showDeleteModal = ref(false)

function onDelete() {
  tasksStore.deleteTask(route.params.id as string)
  navigateTo('/projects')
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/projects')
  }
}
</script>