<template>
  <div class="fixed inset-0 z-50 bg-white dark:bg-neutral-950 overflow-y-auto">
    <div class="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6 min-h-screen">

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Avoidance check</h1>
          <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-0.5">
            These have been sitting overdue for a while.
          </p>
        </div>
        <button type="button"
          class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          style="min-height: 44px; min-width: 44px; display: flex; align-items: center; justify-content: flex-end;"
          @click="closeAvoidance">
          Done
        </button>
      </div>

      <div v-if="avoidedTasks.length === 0" class="flex flex-col items-center justify-center py-20 gap-2">
        <p class="text-neutral-400 dark:text-neutral-500 text-base">Nothing hiding here.</p>
        <p class="text-neutral-400 dark:text-neutral-500 text-sm">All overdue tasks are recent.</p>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div
          v-for="task in visibleTasks"
          :key="task.id"
          class="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 flex flex-col gap-3"
        >
          <div class="flex items-start gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-neutral-800 dark:text-neutral-100 leading-snug">{{ task.title }}</p>
              <p class="text-xs text-amber-500 dark:text-amber-400 mt-1 font-medium">
                Working date {{ staleDays(task) }} days ago
              </p>
            </div>
          </div>

          <p v-if="task.notes" class="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed italic line-clamp-2">
            {{ task.notes }}
          </p>

          <div class="flex gap-2 flex-wrap">
            <button type="button"
              class="flex-1 py-2 rounded-xl text-sm font-medium bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors"
              style="min-height: 40px;"
              @click="rescheduleToday(task.id)">
              Move to today
            </button>
            <button type="button"
              class="flex-1 py-2 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              style="min-height: 40px;"
              @click="dismiss(task.id)">
              Not now
            </button>
            <button type="button"
              class="py-2 px-3 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900 text-red-400 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              style="min-height: 40px;"
              @click="drop(task.id)">
              Drop it
            </button>
          </div>
        </div>

        <p v-if="dismissed.size > 0" class="text-xs text-center text-neutral-400 dark:text-neutral-500">
          {{ dismissed.size }} hidden this session
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'

const tasksStore = useTasksStore()
const { closeAvoidance } = useAvoidance()

const dismissed = reactive(new Set<string>())

const STALE_DAYS = 3

function staleDays(task: { working_on_date: string | null }): number {
  if (!task.working_on_date) return 0
  const diff = Date.now() - new Date(task.working_on_date).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const avoidedTasks = computed(() =>
  tasksStore.tasks.filter(t => {
    if (t.status === 'done' || t.parent_id !== null) return false
    if (!t.working_on_date) return false
    return staleDays(t) >= STALE_DAYS
  }).sort((a, b) => staleDays(b) - staleDays(a))
)

const visibleTasks = computed(() =>
  avoidedTasks.value.filter(t => !dismissed.has(t.id))
)

const today = new Date().toISOString().split('T')[0]!

async function rescheduleToday(id: string) {
  await tasksStore.updateTask(id, { working_on_date: today })
  dismissed.add(id)
}

function dismiss(id: string) {
  dismissed.add(id)
}

async function drop(id: string) {
  await tasksStore.deleteTask(id)
}
</script>
