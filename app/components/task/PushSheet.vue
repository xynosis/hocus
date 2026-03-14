<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue && task" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40" @click="emit('update:modelValue', false)" />
        <div class="relative bg-white dark:bg-neutral-900 rounded-t-2xl overflow-hidden">

          <div class="px-4 pt-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <p class="text-xs text-neutral-400 dark:text-neutral-500 mb-1">Move to</p>
            <h2 class="text-base font-semibold text-neutral-800 dark:text-neutral-100 leading-snug truncate">
              {{ task.title }}
            </h2>
          </div>

          <div class="px-4 pt-3 pb-10 flex flex-col gap-2">
            <button
              type="button"
              class="w-full text-left px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              style="min-height: 44px;"
              @click="push(tomorrow)"
            >
              Tomorrow
              <span class="text-neutral-400 dark:text-neutral-500 font-normal ml-1">— {{ formatDate(tomorrow) }}</span>
            </button>

            <button
              type="button"
              class="w-full text-left px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              style="min-height: 44px;"
              @click="push(nextWeek)"
            >
              Next week
              <span class="text-neutral-400 dark:text-neutral-500 font-normal ml-1">— {{ formatDate(nextWeek) }}</span>
            </button>

            <div v-if="showDatePicker" class="flex gap-2">
              <input
                v-model="customDate"
                type="date"
                class="flex-1 rounded-xl border px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="button"
                class="px-4 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                style="min-height: 44px;"
                @click="push(customDate)"
              >
                Set
              </button>
              <button
                type="button"
                class="px-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                style="min-height: 44px;"
                @click="showDatePicker = false"
              >
                ×
              </button>
            </div>

            <button
              v-else
              type="button"
              class="w-full text-left px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              style="min-height: 44px;"
              @click="showDatePicker = true"
            >
              Pick a date…
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Task } from '~/types'
import { formatDate } from '~/utils/dates'
import { useTasksStore } from '~/stores/tasks'

const props = defineProps<{
  modelValue: boolean
  task: Task | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const tasksStore = useTasksStore()
const showDatePicker = ref(false)
const customDate = ref('')

const tomorrow = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]!
})

const nextWeek = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]!
})

async function push(date: string) {
  if (!props.task || !date) return
  await tasksStore.updateTask(props.task.id, { working_on_date: date })
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (val) => {
  if (!val) showDatePicker.value = false
})
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
