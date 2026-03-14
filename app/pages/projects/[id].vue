<template>
    <div class="p-4 flex flex-col gap-4">
        <div v-if="!project" class="flex flex-col items-center justify-center py-20 gap-2">
            <p class="text-neutral-400 dark:text-neutral-500 text-base">Project not found.</p>
            <button type="button" class="text-purple-500 text-sm mt-2" @click="navigateTo('/projects')">
                Go to projects
            </button>
        </div>

        <template v-else>
            <div class="flex items-center gap-3 px-1">
                <button type="button"
                    class="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    style="min-width: 44px; min-height: 44px; display: flex; align-items: center;"
                    @click="router.back()">
                    ← Back
                </button>
            </div>

            <div class="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5"
                :style="{
                    borderLeftWidth: '4px',
                    borderLeftColor: getColorHex(project.color_tag) ?? 'transparent',
                }">
                <div class="flex items-start justify-between gap-3 mb-2">
                    <h1 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                        {{ project.name }}
                    </h1>
                    <button type="button" class="text-sm text-purple-500 dark:text-purple-400 flex-shrink-0"
                        style="min-height: 44px; display: flex; align-items: center;" @click="isEditFormOpen = true">
                        Edit
                    </button>
                </div>

                <p v-if="project.description"
                    class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
                    {{ project.description }}
                </p>

                <div class="flex items-center justify-between">
                    <span v-if="project.due_date" class="text-xs" :class="isOverdue(project.due_date)
                        ? 'text-red-500 dark:text-red-400 font-medium'
                        : 'text-neutral-400 dark:text-neutral-500'">
                        Due {{ formatDate(project.due_date) }}
                    </span>
                    <button type="button"
                        class="text-xs text-red-400 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        style="min-height: 44px; display: flex; align-items: center;" @click="showDeleteModal = true">
                        Delete project
                    </button>
                </div>
            </div>

            <div class="flex items-center justify-between px-1">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-100">Tasks</h2>
                <button type="button"
                    class="flex items-center gap-1 text-sm text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                    style="min-height: 44px;" @click="isTaskFormOpen = true">
                    + Add task
                </button>
            </div>

            <div v-if="tasksStore.isLoading" class="flex flex-col gap-3">
                <SkeletonCard v-for="n in 3" :key="n" />
            </div>
            <ErrorMessage v-if="projectsStore.error" :message="projectsStore.error"
                :on-retry="() => projectsStore.fetchProjects()" />

            <template v-else>
                <div v-if="projectTasks.length === 0 && completedProjectTasks.length === 0"
                    class="flex flex-col items-center justify-center py-12 gap-2">
                    <p class="text-neutral-400 dark:text-neutral-500 text-sm">No tasks in this project yet.</p>
                </div>

                <div v-else class="flex flex-col gap-3">
                    <div v-if="projectTasks.length === 0 && !showCompleted"
                        class="flex flex-col items-center justify-center py-8 gap-2">
                        <p class="text-neutral-400 dark:text-neutral-500 text-sm">All tasks in this project are done.
                        </p>
                    </div>

                    <TaskCard v-for="task in projectTasks" :key="task.id" :task="task"
                        :subtask-count="subtaskCount(task.id)" :subtask-complete-count="subtaskCompleteCount(task.id)"
                        @click="navigateTo(`/task/${task.id}`)" @delete="onDeleteTask(task.id)" />

                    <template v-if="completedProjectTasks.length > 0">
                        <button type="button"
                            class="flex items-center gap-2 text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors px-1 py-2"
                            @click="showCompleted = !showCompleted">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="transition-transform"
                                :class="showCompleted ? 'rotate-180' : ''">
                                <path d="M2 4L7 9L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                            {{ showCompleted ? 'Hide completed' : `Show completed (${completedProjectTasks.length})` }}
                        </button>

                        <template v-if="showCompleted">
                            <div class="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex flex-col gap-3">
                                <TaskCard v-for="task in completedProjectTasks" :key="task.id" :task="task"
                                    :subtask-count="subtaskCount(task.id)"
                                    :subtask-complete-count="subtaskCompleteCount(task.id)"
                                    @click="navigateTo(`/task/${task.id}`)" @delete="onDeleteTask(task.id)" />
                            </div>
                        </template>
                    </template>
                </div>
            </template>
        </template>

        <ProjectForm v-if="project" v-model="isEditFormOpen" :project="project" @submit="onEditSubmit" />

        <TaskForm v-model="isTaskFormOpen" :preselected-project-id="route.params.id as string" @submit="onTaskSubmit" />

        <BaseModal v-model="showDeleteModal" title="Delete project?" confirm-label="Delete" @confirm="onDeleteProject">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                This will permanently remove the project. Tasks in this project will not be deleted.
            </p>
        </BaseModal>

        <BaseModal v-model="showDeleteTaskModal" title="Delete task?" confirm-label="Delete"
            @confirm="confirmDeleteTask">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                This will permanently remove the task. This can't be undone.
            </p>
        </BaseModal>
    </div>
</template>

<script setup lang="ts">
import { getColorHex } from '~/utils/colors'
import { useProjectsStore } from '~/stores/projects'
import { useTasksStore } from '~/stores/tasks'
import { useSubtasksStore } from '~/stores/subtasks'
import { isOverdue, formatDate } from '~/utils/dates'
import ProjectForm from '~/components/project/ProjectForm.vue'
import TaskForm from '~/components/task/TaskForm.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import type { CreateTaskPayload } from '~/stores/tasks'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const subtasksStore = useSubtasksStore()

const project = computed(() => projectsStore.getProjectById(route.params.id as string))


const showCompleted = ref(false)

const allProjectTasks = computed(() => {
    const taskIds = projectsStore.getTaskIdsForProject(route.params.id as string)
    return tasksStore.sortedTasks.filter(t => taskIds.includes(t.id))
})

const projectTasks = computed(() =>
    allProjectTasks.value.filter(t => t.status !== 'done')
)

const completedProjectTasks = computed(() =>
    allProjectTasks.value.filter(t => t.status === 'done')
)

onUnmounted(() => {
    showCompleted.value = false
})

function subtaskCount(taskId: string): number {
    return subtasksStore.getSubtasksByTaskId(taskId).length
}

function subtaskCompleteCount(taskId: string): number {
    return subtasksStore.getSubtasksByTaskId(taskId).filter(s => s.is_complete).length
}

const isEditFormOpen = ref(false)
const isTaskFormOpen = ref(false)
const showDeleteModal = ref(false)
const showDeleteTaskModal = ref(false)
const pendingDeleteTaskId = ref<string | null>(null)

async function onEditSubmit(payload: { name: string; description: string | null; due_date: string | null }) {
    await projectsStore.updateProject(route.params.id as string, payload)
}

async function onTaskSubmit(payload: CreateTaskPayload, projectIds: string[]) {
    const task = await tasksStore.addTask(payload)
    if (task) {
        const ids = projectIds.length > 0 ? projectIds : [route.params.id as string]
        await projectsStore.syncTaskProjects(task.id, ids)
    }
}

async function onDeleteProject() {
    await projectsStore.deleteProject(route.params.id as string)
    navigateTo('/projects')
}

function onDeleteTask(taskId: string) {
    pendingDeleteTaskId.value = taskId
    showDeleteTaskModal.value = true
}

async function confirmDeleteTask() {
    if (pendingDeleteTaskId.value) {
        await tasksStore.deleteTask(pendingDeleteTaskId.value)
        pendingDeleteTaskId.value = null
    }
}
</script>