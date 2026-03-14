<template>
    <div class="p-4">
        <h1 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100 px-2 py-3">
            Misc
        </h1>


        <ErrorMessage v-if="tasksStore.error" :message="tasksStore.error" :on-retry="() => tasksStore.fetchTasks()" />
        <div v-if="tasksStore.isLoading" class="flex flex-col gap-3">
            <SkeletonCard v-for="n in 3" :key="n" />
        </div>

        <template v-else>
            <div v-if="miscTasks.length === 0 && completedMiscTasks.length === 0"
                class="flex flex-col items-center justify-center py-20 gap-2">
                <p class="text-neutral-400 dark:text-neutral-500 text-base">No loose tasks.</p>
                <p class="text-neutral-400 dark:text-neutral-500 text-sm">Everything is in a project.</p>
            </div>

            <div v-else class="flex flex-col gap-3">
                <div v-if="miscTasks.length === 0 && !showCompleted"
                    class="flex flex-col items-center justify-center py-8 gap-2">
                    <p class="text-neutral-400 dark:text-neutral-500 text-sm">All loose tasks are done.</p>
                </div>

                <TaskCard v-for="task in miscTasks" :key="task.id" :task="task" :subtask-count="subtaskCount(task.id)"
                    :subtask-complete-count="subtaskCompleteCount(task.id)" @click="navigateTo(`/task/${task.id}`)"
                    @delete="onDelete(task.id)" />

                <template v-if="completedMiscTasks.length > 0">
                    <button type="button"
                        class="flex items-center gap-2 text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors px-1 py-2"
                        @click="showCompleted = !showCompleted">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="transition-transform"
                            :class="showCompleted ? 'rotate-180' : ''">
                            <path d="M2 4L7 9L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        {{ showCompleted ? 'Hide completed' : `Show completed (${completedMiscTasks.length})` }}
                    </button>

                    <template v-if="showCompleted">
                        <div class="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex flex-col gap-3">
                            <TaskCard v-for="task in completedMiscTasks" :key="task.id" :task="task"
                                :subtask-count="subtaskCount(task.id)"
                                :subtask-complete-count="subtaskCompleteCount(task.id)"
                                @click="navigateTo(`/task/${task.id}`)" @delete="onDelete(task.id)" />
                        </div>
                    </template>
                </template>
            </div>
        </template>
        <BaseModal v-model="showDeleteModal" title="Delete task?" confirm-label="Delete" @confirm="confirmDelete">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                This will permanently remove the task. This can't be undone.
            </p>
        </BaseModal>
    </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import { useSubtasksStore } from '~/stores/subtasks'
import { useProjectsStore } from '~/stores/projects'
import BaseModal from '~/components/ui/BaseModal.vue'

const tasksStore = useTasksStore()
const subtasksStore = useSubtasksStore()
const projectsStore = useProjectsStore()
const showCompleted = ref(false)

const allMiscTasks = computed(() => {
    const miscTaskIds = new Set(projectsStore.getMiscTaskIds())
    return tasksStore.sortedTasks.filter(t => miscTaskIds.has(t.id))
})

const miscTasks = computed(() =>
    allMiscTasks.value.filter(t => t.status !== 'done')
)

const completedMiscTasks = computed(() =>
    allMiscTasks.value.filter(t => t.status === 'done')
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