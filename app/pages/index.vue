<template>
  <div class="p-4">
    <h1 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100 px-2 py-3">
      Today
    </h1>
    <div v-if="tasksStore.isLoading" class="flex flex-col gap-3">
      <SkeletonCard v-for="n in 3" :key="n" />
    </div>
    <ErrorMessage v-if="tasksStore.error" :message="tasksStore.error" :on-retry="() => tasksStore.fetchTasks()" />
    <TransitionGroup v-else name="task-list" tag="div" class="flex flex-col gap-3 relative">
      <TaskCard v-for="task in todayTasks" :key="task.id" :task="task" :subtask-count="subtaskCount(task.id)"
        :subtask-complete-count="subtaskCompleteCount(task.id)" @click="navigateTo(`/task/${task.id}`)"
        @delete="onDelete(task.id)" />
    </TransitionGroup>

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
import { isTodayOrOverdue, isOverdue, isToday, toDateValue, formatDate } from '~/utils/dates'
import BaseModal from '~/components/ui/BaseModal.vue'

const tasksStore = useTasksStore()
const subtasksStore = useSubtasksStore()

const todayTasks = computed(() => {
  const filtered = tasksStore.tasks.filter(task => {
    if (task.status === 'done') return false
    const workingOnMatch = task.working_on_date ? isTodayOrOverdue(task.working_on_date) : false
    const dueDateMatch = task.due_date ? isTodayOrOverdue(task.due_date) : false
    return workingOnMatch || dueDateMatch
  })

  return filtered.sort((a, b) => {
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

function subtaskCount(taskId: string): number {
  return subtasksStore.getSubtasksByTaskId(taskId).length
}

function subtaskCompleteCount(taskId: string): number {
  return subtasksStore.getSubtasksByTaskId(taskId).filter(s => s.is_complete).length
}

const showCompleted = ref(false)
const showDeleteModal = ref(false)
const pendingDeleteId = ref<string | null>(null)

onUnmounted(() => {
  showCompleted.value = false
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
.task-list-enter-active,
.task-list-leave-active {
  transition: opacity 0.4s ease;
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
}

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