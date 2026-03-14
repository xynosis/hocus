<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue && task" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40" @click="onViewTask" />
        <div class="relative bg-white dark:bg-neutral-900 rounded-t-2xl overflow-hidden"
          style="max-height: 80vh; overflow-y: auto;">

          <!-- Header -->
          <div class="bg-purple-50 dark:bg-purple-950 px-4 pt-4 pb-3 border-b border-purple-100 dark:border-purple-900">
            <p class="text-xs text-purple-500 dark:text-purple-400 font-medium mb-1">Pick up where you left off</p>
            <h2 class="text-base font-semibold text-neutral-800 dark:text-neutral-100 leading-snug">
              {{ task.title }}
            </h2>
          </div>

          <div class="px-4 pt-4 pb-10 flex flex-col gap-4">

            <!-- Progress -->
            <div class="flex items-center gap-3">
              <div class="flex-1 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  class="h-full rounded-full bg-purple-400 dark:bg-purple-500 transition-all"
                  :style="{ width: `${progressPercent}%` }"
                />
              </div>
              <span class="text-sm text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                {{ doneCount }} of {{ children.length }} done
              </span>
            </div>

            <!-- Last completed step -->
            <div v-if="lastDone" class="flex flex-col gap-1">
              <span class="text-xs text-neutral-400 dark:text-neutral-500">Last completed</span>
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0" style="font-size: 8px;">
                  <span class="text-white">✓</span>
                </span>
                <span class="text-sm text-neutral-500 dark:text-neutral-400 line-through truncate">{{ lastDone.title }}</span>
              </div>
            </div>

            <!-- Next step -->
            <div v-if="nextStep" class="flex flex-col gap-1">
              <span class="text-xs text-neutral-400 dark:text-neutral-500">Up next</span>
              <div class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900">
                <span class="w-4 h-4 rounded-full border-2 border-purple-300 dark:border-purple-600 flex-shrink-0" />
                <span class="text-sm font-medium text-purple-800 dark:text-purple-200 truncate">{{ nextStep.title }}</span>
              </div>
            </div>

            <!-- Notes -->
            <p v-if="task.notes" class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {{ task.notes }}
            </p>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                class="flex-1 py-3 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                style="min-height: 44px;"
                @click="onViewTask"
              >
                View task
              </button>
              <button
                type="button"
                class="flex-1 py-3 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors"
                style="min-height: 44px;"
                @click="onStart"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'

const props = defineProps<{
  modelValue: boolean
  taskId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  start: []
  viewTask: []
}>()

const tasksStore = useTasksStore()
const task = computed(() => tasksStore.getTaskById(props.taskId))
const children = computed(() => tasksStore.getChildTasks(props.taskId))

const doneCount = computed(() => children.value.filter(c => c.status === 'done').length)
const progressPercent = computed(() =>
  children.value.length > 0 ? Math.round((doneCount.value / children.value.length) * 100) : 0
)

const lastDone = computed(() => {
  const done = children.value
    .filter(c => c.status === 'done' && c.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
  return done[0] ?? null
})

const nextStep = computed(() =>
  children.value.find(c => c.status !== 'done') ?? null
)

function onStart() {
  emit('start')
}

function onViewTask() {
  emit('update:modelValue', false)
  emit('viewTask')
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
