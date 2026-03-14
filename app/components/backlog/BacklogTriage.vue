<template>
  <div class="fixed inset-0 z-50 bg-white dark:bg-neutral-950 overflow-y-auto">
    <div class="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6 min-h-screen">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
          Backlog triage
        </span>
        <button
          type="button"
          class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          style="min-height: 44px; min-width: 44px; display: flex; align-items: center; justify-content: flex-end;"
          @click="closeTriage"
        >
          Exit
        </button>
      </div>

      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
          {{ heading }}
        </h1>
        <p class="text-sm text-neutral-400 dark:text-neutral-500">
          Tasks with no date or project. Schedule them, move them, or let them go.
        </p>
      </div>

      <!-- Empty state -->
      <div v-if="undatedTasks.length === 0" class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <p class="text-neutral-800 dark:text-neutral-100 font-medium">Backlog is clear.</p>
        <p class="text-sm text-neutral-400 dark:text-neutral-500">Nothing undated and unscheduled.</p>
        <button
          type="button"
          class="px-6 py-3 rounded-xl bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors"
          style="min-height: 44px;"
          @click="closeTriage"
        >
          Done
        </button>
      </div>

      <!-- Task list -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="task in undatedTasks"
          :key="task.id"
          class="flex flex-col gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-snug">{{ task.title }}</p>
            <span v-if="task.energy" class="text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0">
              {{ energyLabel(task.energy) }}
            </span>
          </div>

          <!-- Scheduling input -->
          <div v-if="schedulingId === task.id" class="flex gap-2">
            <NaturalDateInput
              v-model="scheduleDate"
              placeholder="e.g. next Monday"
              class="flex-1"
            />
            <button
              type="button"
              class="px-4 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors flex-shrink-0"
              style="min-height: 44px;"
              @click="confirmSchedule(task.id)"
            >
              Set
            </button>
            <button
              type="button"
              class="px-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
              style="min-height: 44px;"
              @click="schedulingId = null"
            >
              ×
            </button>
          </div>

          <!-- Actions -->
          <div v-else class="flex gap-2 flex-wrap">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors"
              style="min-height: 36px;"
              @click="scheduleToday(task.id)"
            >
              Work on it today
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              style="min-height: 36px;"
              @click="startSchedule(task.id)"
            >
              Pick a date
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              style="min-height: 36px;"
              @click="dismissed.add(task.id)"
            >
              Skip
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              style="min-height: 36px;"
              @click="dropTask(task.id)"
            >
              Drop it
            </button>
          </div>
        </div>
      </div>

      <!-- Footer action -->
      <div v-if="undatedTasks.length > 0" class="pt-2">
        <button
          type="button"
          class="w-full py-3 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors"
          style="min-height: 44px;"
          @click="closeTriage"
        >
          Done for now
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import NaturalDateInput from '~/components/ui/NaturalDateInput.vue'
import type { TaskEnergy } from '~/types'

const tasksStore = useTasksStore()
const { closeTriage } = useBacklogTriage()

const today = new Date().toISOString().split('T')[0]!
const dismissed = reactive(new Set<string>())

const undatedTasks = computed(() =>
  tasksStore.tasks.filter(t => {
    if (dismissed.has(t.id)) return false
    if (t.status === 'done') return false
    if (t.parent_id !== null) return false
    if (t.working_on_date || t.due_date) return false
    return true
  })
)

const heading = computed(() => {
  const n = undatedTasks.value.length
  if (n === 0) return 'All clear'
  if (n === 1) return '1 task with no date'
  return `${n} tasks with no date`
})

const schedulingId = ref<string | null>(null)
const scheduleDate = ref<string | null>(null)

function startSchedule(id: string) {
  schedulingId.value = id
  scheduleDate.value = null
}

async function confirmSchedule(id: string) {
  if (!scheduleDate.value) return
  await tasksStore.updateTask(id, { working_on_date: scheduleDate.value })
  dismissed.add(id)
  schedulingId.value = null
  scheduleDate.value = null
}

async function scheduleToday(id: string) {
  await tasksStore.updateTask(id, { working_on_date: today })
  dismissed.add(id)
}

async function dropTask(id: string) {
  dismissed.add(id)
  await tasksStore.deleteTask(id)
}

function energyLabel(energy: TaskEnergy): string {
  if (energy === 'easy') return '🌱 Easy'
  if (energy === 'moderate') return '⚡ Moderate'
  return '🔥 Heavy'
}

watch(schedulingId, (id) => {
  if (!id) scheduleDate.value = null
})
</script>
