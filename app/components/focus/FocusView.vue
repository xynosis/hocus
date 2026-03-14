<template>
  <div class="fixed inset-0 z-50 bg-white dark:bg-neutral-950 overflow-y-auto">
    <div class="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6 min-h-screen">

      <div class="flex items-center justify-between">
        <span
          class="text-sm font-medium px-3 py-1 rounded-full"
          :class="task?.status === 'done'
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'"
        >
          Focus
        </span>
        <button
          type="button"
          class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          style="min-height: 44px; min-width: 44px; display: flex; align-items: center; justify-content: flex-end;"
          @click="onExit"
        >
          Exit
        </button>
      </div>

      <div v-if="task" class="flex flex-col gap-2">
        <h1 class="text-2xl font-semibold leading-snug text-neutral-800 dark:text-neutral-100">
          {{ task.title }}
        </h1>
        <p
          v-if="task.notes"
          class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed"
        >
          {{ task.notes }}
        </p>
      </div>

      <div v-if="subtasks.length > 0" class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Subtasks</span>
          <span class="text-sm text-neutral-400 dark:text-neutral-500">
            {{ completeCount }} of {{ subtasks.length }} done
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <SubtaskItem
            v-for="subtask in subtasks"
            :key="subtask.id"
            :subtask="subtask"
          />
        </div>
      </div>

      <div class="border-t border-neutral-100 dark:border-neutral-800 pt-6">
        <PomodoroTimer />
      </div>

      <Transition name="celebrate">
        <div
          v-if="isComplete"
          class="fixed inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm"
        >
          <div class="flex flex-col items-center gap-6 px-8 text-center">
            <p class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
              All done. Great work.
            </p>
            <p class="text-sm text-neutral-400 dark:text-neutral-500">
              Take a moment to appreciate what you just finished.
            </p>
            <button
              type="button"
              class="px-6 py-3 rounded-xl bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 active:bg-purple-700 transition-colors"
              style="min-height: 44px;"
              @click="onExit"
            >
              Exit Focus
            </button>
          </div>
        </div>
      </Transition>

    </div>
    <canvas ref="confettiCanvas" class="fixed inset-0 z-20 pointer-events-none" style="width: 100%; height: 100%;" />
  </div>
</template>

<script setup lang="ts">
import confetti from 'canvas-confetti'
import { useTasksStore } from '~/stores/tasks'
import { useSubtasksStore } from '~/stores/subtasks'
import SubtaskItem from '~/components/task/SubtaskItem.vue'
import PomodoroTimer from '~/components/focus/PomodoroTimer.vue'

const props = defineProps<{
  taskId: string
}>()

const { exitFocus } = useFocus()
const tasksStore = useTasksStore()
const subtasksStore = useSubtasksStore()

const task = computed(() => tasksStore.getTaskById(props.taskId))
const subtasks = computed(() => subtasksStore.getSubtasksByTaskId(props.taskId))
const completeCount = computed(() => subtasks.value.filter(s => s.is_complete).length)

const hasSubtasks = computed(() => subtasks.value.length > 0)
const isComplete = computed(() => {
  if (hasSubtasks.value) {
    return completeCount.value === subtasks.value.length && subtasks.value.length > 0
  }
  return task.value?.status === 'done'
})

const confettiCanvas = ref<HTMLCanvasElement | null>(null)
const hasCelebrated = ref(false)

watch(isComplete, (complete) => {
  if (complete && !hasCelebrated.value) {
    hasCelebrated.value = true
    nextTick(() => fireConfetti())
  }
})

function fireConfetti() {
  if (!confettiCanvas.value) return
  const myConfetti = confetti.create(confettiCanvas.value, { resize: true })
  myConfetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#7F77DD', '#639922', '#EF9F27', '#378ADD', '#D4537E'],
  })
}

function onExit() {
  exitFocus()
}
</script>

<style scoped>
.celebrate-enter-active,
.celebrate-leave-active {
  transition: opacity 0.4s ease;
}
.celebrate-enter-from,
.celebrate-leave-to {
  opacity: 0;
}
</style>