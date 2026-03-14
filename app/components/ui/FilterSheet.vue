<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative bg-white dark:bg-neutral-900 rounded-t-2xl px-4 pt-3 pb-10 flex flex-col gap-4"
          style="max-height: 80vh; overflow-y: auto;">

          <div class="flex items-center justify-between">
            <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-100">Filter</h2>
            <button
              v-if="localActiveCount > 0"
              type="button"
              class="text-sm text-purple-500 dark:text-purple-400"
              style="min-height: 44px;"
              @click="clearAll"
            >
              Clear all
            </button>
          </div>

          <!-- Status -->
          <div class="flex flex-col gap-2">
            <label class="text-xs text-neutral-500 dark:text-neutral-400">Status</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="opt in statusOptions" :key="opt.value" type="button"
                class="px-3 py-2 rounded-xl border text-sm transition-colors"
                :class="local.status === opt.value
                  ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'"
                style="min-height: 44px;"
                @click="toggle('status', opt.value)">
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Energy -->
          <div class="flex flex-col gap-2">
            <label class="text-xs text-neutral-500 dark:text-neutral-400">Energy cost</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="opt in energyOptions" :key="opt.value" type="button"
                class="px-3 py-2 rounded-xl border text-sm transition-colors"
                :class="local.energy === opt.value
                  ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'"
                style="min-height: 44px;"
                @click="toggle('energy', opt.value)">
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Interest -->
          <div class="flex flex-col gap-2">
            <label class="text-xs text-neutral-500 dark:text-neutral-400">How you feel about it</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="opt in interestOptions" :key="opt.value" type="button"
                class="px-3 py-2 rounded-xl border text-sm transition-colors"
                :class="local.interest === opt.value
                  ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'"
                style="min-height: 44px;"
                @click="toggle('interest', opt.value)">
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Has due date -->
          <div class="flex flex-col gap-2">
            <label class="text-xs text-neutral-500 dark:text-neutral-400">Due date</label>
            <div class="flex gap-2">
              <button type="button"
                class="px-3 py-2 rounded-xl border text-sm transition-colors"
                :class="local.hasDueDate === true
                  ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'"
                style="min-height: 44px;"
                @click="toggle('hasDueDate', true)">
                Has due date
              </button>
              <button type="button"
                class="px-3 py-2 rounded-xl border text-sm transition-colors"
                :class="local.hasDueDate === false
                  ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'"
                style="min-height: 44px;"
                @click="toggle('hasDueDate', false)">
                No due date
              </button>
            </div>
          </div>

          <!-- Has estimate -->
          <div class="flex flex-col gap-2">
            <label class="text-xs text-neutral-500 dark:text-neutral-400">Time estimate</label>
            <div class="flex gap-2">
              <button type="button"
                class="px-3 py-2 rounded-xl border text-sm transition-colors"
                :class="local.hasEstimate === true
                  ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'"
                style="min-height: 44px;"
                @click="toggle('hasEstimate', true)">
                Has estimate
              </button>
              <button type="button"
                class="px-3 py-2 rounded-xl border text-sm transition-colors"
                :class="local.hasEstimate === false
                  ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'"
                style="min-height: 44px;"
                @click="toggle('hasEstimate', false)">
                No estimate
              </button>
            </div>
          </div>

          <button type="button"
            class="w-full rounded-xl py-3 text-base font-medium bg-purple-500 text-white active:opacity-80 transition-opacity"
            style="min-height: 44px;"
            @click="apply">
            Apply{{ localActiveCount > 0 ? ` (${localActiveCount})` : '' }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { TaskFilters } from '~/utils/filters'
import { emptyFilters, activeFilterCount } from '~/utils/filters'
import type { TaskStatus, TaskEnergy, TaskInterest } from '~/types'

const props = defineProps<{
  modelValue: boolean
  filters: TaskFilters
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:filters': [filters: TaskFilters]
}>()

const local = reactive<TaskFilters>({ ...emptyFilters() })

watch(() => props.modelValue, (open) => {
  if (open) Object.assign(local, { ...props.filters })
})

const localActiveCount = computed(() => activeFilterCount(local))

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'orbit', label: 'Quiet' },
  { value: 'done', label: 'Done' },
]

const energyOptions: { value: TaskEnergy; label: string }[] = [
  { value: 'easy', label: '🌱 Easy' },
  { value: 'moderate', label: '⚡ Moderate' },
  { value: 'heavy', label: '🔥 Heavy' },
]

const interestOptions: { value: TaskInterest; label: string }[] = [
  { value: 'dreading', label: '😬 Dreading' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'want_to', label: '✨ Want to' },
]

function toggle(field: keyof TaskFilters, value: unknown) {
  if ((local as Record<string, unknown>)[field] === value) {
    (local as Record<string, unknown>)[field] = null
  } else {
    (local as Record<string, unknown>)[field] = value
  }
}

function clearAll() {
  Object.assign(local, emptyFilters())
}

function apply() {
  emit('update:filters', { ...local })
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
