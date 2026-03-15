<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative bg-white dark:bg-neutral-900 rounded-t-2xl overflow-hidden"
          style="max-height: 80vh; overflow-y: auto;">

          <!-- Sky-tinted header -->
          <div class="bg-sky-50 dark:bg-sky-950 px-4 pt-4 pb-3 border-b border-sky-100 dark:border-sky-900">
            <p class="text-xs text-sky-500 dark:text-sky-400 font-medium mb-1">Drifted?</p>
            <h2 class="text-base font-semibold text-neutral-800 dark:text-neutral-100 leading-snug">
              {{ task.title }}
            </h2>
          </div>

          <div class="px-4 pt-4 pb-10 flex flex-col gap-4">

            <!-- Drift explanation -->
            <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              It looks like this one drifted — it might have slipped off your radar for a while. That's okay. Here's where you left off, whenever you're ready to pick it back up.
            </p>

            <!-- Last activity + last step -->
            <div class="bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 flex flex-col gap-3">
              <div class="flex items-baseline gap-2">
                <span class="text-xs text-neutral-400 dark:text-neutral-500">Last activity</span>
                <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{{ timeSince }}</span>
              </div>

              <div v-if="lastCompletedChild" class="flex flex-col gap-1">
                <span class="text-xs text-neutral-400 dark:text-neutral-500">Last step completed</span>
                <div class="flex items-center gap-2">
                  <span class="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <span class="text-white" style="font-size: 8px;">✓</span>
                  </span>
                  <span class="text-sm text-neutral-700 dark:text-neutral-300 truncate">{{ lastCompletedChild.title }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-neutral-400 dark:text-neutral-500">
                No steps completed yet.
              </div>
            </div>

            <!-- Notes -->
            <p v-if="task.notes" class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {{ task.notes }}
            </p>

            <!-- Actions -->
            <div class="flex flex-col gap-2 pt-1">
              <button
                type="button"
                class="w-full py-3 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors"
                style="min-height: 44px;"
                @click="emit('continue')"
              >
                Resume this task
              </button>
              <button
                type="button"
                class="w-full py-3 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                style="min-height: 44px;"
                @click="emit('breakdown')"
              >
                Help me break it down first
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Task } from '~/types'
import { formatTimeSince } from '~/utils/dates'

const props = defineProps<{
  modelValue: boolean
  task: Task
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  continue: []
  breakdown: []
}>()

const tasksStore = useTasksStore()

const timeSince = computed(() => formatTimeSince(props.task.updated_at))

const lastCompletedChild = computed(() => {
  const done = tasksStore.getChildTasks(props.task.id)
    .filter(t => t.status === 'done' && t.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
  return done[0] ?? null
})

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
</style>
