<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative bg-white dark:bg-neutral-900 rounded-t-2xl px-4 pt-4 pb-10 flex flex-col gap-4"
          style="max-height: 80vh; overflow-y: auto;">

          <div class="flex items-center justify-between">
            <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-100 leading-snug pr-4">
              {{ task.title }}
            </h2>
            <button
              type="button"
              class="flex-shrink-0 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              style="min-width: 44px; min-height: 44px; font-size: 20px; line-height: 1; display: flex; align-items: center; justify-content: flex-end;"
              @click="close"
            >
              ×
            </button>
          </div>

          <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            What's the smallest possible first step?
          </p>

          <div class="flex gap-2">
            <input
              ref="inputRef"
              v-model="stepTitle"
              type="text"
              placeholder="One small action…"
              class="flex-1 rounded-xl border px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              @keydown.enter="addStep"
              @keydown.escape="close"
            />
            <button
              type="button"
              class="flex items-center justify-center rounded-xl bg-purple-500 active:bg-purple-600 transition-colors flex-shrink-0"
              style="min-width: 44px; min-height: 44px;"
              @click="addStep"
            >
              <span class="text-white text-xl leading-none">+</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Task } from '~/types'

const props = defineProps<{
  modelValue: boolean
  task: Task
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  stepAdded: []
}>()

const tasksStore = useTasksStore()
const stepTitle = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.modelValue, (val) => {
  if (val) nextTick(() => inputRef.value?.focus())
})

async function addStep() {
  const title = stepTitle.value.trim()
  if (!title) return
  await tasksStore.addTask({ title, parent_id: props.task.id })
  stepTitle.value = ''
  emit('stepAdded')
  close()
}

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
