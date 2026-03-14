<template>
  <div class="relative flex items-center">
    <Transition name="expand">
      <input
        v-if="expanded"
        ref="inputRef"
        :value="modelValue"
        type="search"
        placeholder="Search tasks…"
        class="w-full rounded-xl border px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400 pr-9"
        @input="onInput"
        @keydown.escape="collapse"
      />
    </Transition>
    <button
      type="button"
      class="flex items-center justify-center rounded-xl transition-colors flex-shrink-0"
      :class="[
        expanded ? 'absolute right-0 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300' : '',
        !expanded ? (modelValue ? 'text-purple-500 dark:text-purple-400' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300') : '',
      ]"
      style="min-height: 44px; min-width: 44px;"
      :aria-label="expanded ? 'Close search' : 'Search'"
      @click="toggleExpand"
    >
      <svg v-if="!expanded || !modelValue" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M12 12l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const expanded = ref(!!props.modelValue)
const inputRef = ref<HTMLInputElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:modelValue', value)
  }, 200)
}

function toggleExpand() {
  if (expanded.value) {
    collapse()
  } else {
    expanded.value = true
    nextTick(() => inputRef.value?.focus())
  }
}

function collapse() {
  emit('update:modelValue', '')
  expanded.value = false
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.15s ease, width 0.2s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  width: 0;
}
</style>
