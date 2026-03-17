<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative bg-white dark:bg-neutral-900 rounded-t-2xl overflow-hidden">

          <!-- Header -->
          <div class="px-4 pt-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <p class="text-xs text-neutral-400 dark:text-neutral-500 mb-1">Task</p>
            <h2 class="text-base font-semibold text-neutral-800 dark:text-neutral-100 leading-snug truncate">
              {{ task.title }}
            </h2>
          </div>

          <!-- Actions -->
          <div class="px-4 pt-3 pb-10 flex flex-col gap-1.5">

            <!-- Quick scheduling -->
            <button
              v-if="!isWorkingOnToday"
              type="button"
              class="w-full text-left px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              style="min-height: 44px;"
              @click="workOnToday"
            >Work on today</button>

            <button
              type="button"
              class="w-full text-left px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              style="min-height: 44px;"
              @click="workOnTomorrow"
            >Move to tomorrow</button>

            <button
              type="button"
              class="w-full text-left px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              style="min-height: 44px;"
              @click="onReschedule"
            >
              Reschedule
              <span class="text-neutral-400 dark:text-neutral-500 font-normal ml-1">more options →</span>
            </button>

            <div class="border-t border-neutral-100 dark:border-neutral-800 my-0.5" />

            <!-- Project assignment -->
            <button
              type="button"
              class="w-full text-left px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center justify-between"
              style="min-height: 44px;"
              @click="showProjectPicker = true"
            >
              <span>Assign to project</span>
              <span v-if="assignedProjects.length > 0" class="text-xs text-purple-500 dark:text-purple-400 font-normal ml-2 truncate max-w-32">
                {{ assignedProjects.map(p => p.name).join(', ') }}
              </span>
              <span v-else class="text-neutral-400 dark:text-neutral-500 font-normal">None</span>
            </button>

            <!-- Door opener -->
            <button
              v-if="isDoorOpener"
              type="button"
              class="w-full text-left px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              style="min-height: 44px;"
              @click="onDoorOpener"
            >Break down first step</button>

            <div class="border-t border-neutral-100 dark:border-neutral-800 my-0.5" />

            <!-- Edit -->
            <button
              type="button"
              class="w-full text-left px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              style="min-height: 44px;"
              @click="showEditForm = true"
            >Edit</button>

            <!-- Delete -->
            <button
              type="button"
              class="w-full text-left px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              style="min-height: 44px;"
              @click="onDelete"
            >Delete</button>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Project picker sub-sheet -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="showProjectPicker" class="fixed inset-0 z-[60] flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40" @click="showProjectPicker = false" />
        <div class="relative bg-white dark:bg-neutral-900 rounded-t-2xl overflow-hidden">
          <div class="px-4 pt-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <p class="text-xs text-neutral-400 dark:text-neutral-500 mb-1">Assign to project</p>
            <h2 class="text-base font-semibold text-neutral-800 dark:text-neutral-100 leading-snug truncate">{{ task.title }}</h2>
          </div>
          <div class="px-4 pt-3 pb-10 flex flex-col gap-1.5">
            <div v-if="projects.length === 0" class="py-4 text-center">
              <p class="text-sm text-neutral-400 dark:text-neutral-500">No projects yet.</p>
            </div>
            <button
              v-for="project in projects"
              :key="project.id"
              type="button"
              class="w-full text-left px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm font-medium transition-colors flex items-center justify-between"
              :class="assignedProjectIds.has(project.id)
                ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'"
              style="min-height: 44px;"
              @click="toggleProject(project.id)"
            >
              <div class="flex items-center gap-2.5">
                <span
                  class="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                  :style="{ backgroundColor: getColorHex(project.color_tag) ?? '#d6d3d1' }"
                />
                {{ project.name }}
              </div>
              <svg v-if="assignedProjectIds.has(project.id)" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Edit form -->
  <TaskForm v-if="task" v-model="showEditForm" :task="task" @submit="onEditSubmit" />

  <!-- Push sheet -->
  <PushSheet v-model="showPushSheet" :task="task" />

  <!-- Delete confirm -->
  <BaseModal v-model="showDeleteModal" title="Delete task?" confirm-label="Delete" @confirm="confirmDelete">
    <p class="text-sm text-neutral-600 dark:text-neutral-400">
      This will permanently remove the task. This can't be undone.
    </p>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Task } from '~/types'
import type { UpdateTaskPayload } from '~/stores/tasks'
import { getColorHex } from '~/utils/colors'
import { useProjectsStore } from '~/stores/projects'
import { useTasksStore } from '~/stores/tasks'
import TaskForm from '~/components/task/TaskForm.vue'
import PushSheet from '~/components/task/PushSheet.vue'
import BaseModal from '~/components/ui/BaseModal.vue'

const props = defineProps<{
  modelValue: boolean
  task: Task
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'doorOpener': []
}>()

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const projects = computed(() => projectsStore.sortedProjects)
const assignedProjectIds = computed(() => new Set(projectsStore.getProjectIdsForTask(props.task.id)))
const assignedProjects = computed(() =>
  projects.value.filter(p => assignedProjectIds.value.has(p.id))
)

const isDoorOpener = computed(() => {
  if (props.task.status !== 'todo') return false
  return new Date(props.task.updated_at) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
})

const isWorkingOnToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return props.task.working_on_date === today
})

const showProjectPicker = ref(false)
const showEditForm = ref(false)
const showPushSheet = ref(false)
const showDeleteModal = ref(false)

function close() {
  emit('update:modelValue', false)
}

async function toggleProject(projectId: string) {
  const current = projectsStore.getProjectIdsForTask(props.task.id)
  const next = current.includes(projectId)
    ? current.filter(id => id !== projectId)
    : [...current, projectId]
  await projectsStore.syncTaskProjects(props.task.id, next)
}

async function workOnToday() {
  const today = new Date().toISOString().split('T')[0]!
  await tasksStore.updateTask(props.task.id, { working_on_date: today })
  close()
}

async function workOnTomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const tomorrow = d.toISOString().split('T')[0]!
  await tasksStore.updateTask(props.task.id, { working_on_date: tomorrow })
  close()
}

function onReschedule() {
  showPushSheet.value = true
}

function onDoorOpener() {
  close()
  emit('doorOpener')
}

async function onEditSubmit(payload: UpdateTaskPayload, projectIds: string[]) {
  await tasksStore.updateTask(props.task.id, payload)
  await projectsStore.syncTaskProjects(props.task.id, projectIds)
  showEditForm.value = false
}

function onDelete() {
  showDeleteModal.value = true
}

async function confirmDelete() {
  await tasksStore.deleteTask(props.task.id)
  close()
}
</script>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.2s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
</style>
