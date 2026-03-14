<template>
  <div class="flex gap-3">
    <button
      v-for="color in colors"
      :key="color.value"
      type="button"
      :aria-label="`Select ${color.value}`"
      :aria-pressed="modelValue === color.value"
      class="relative flex items-center justify-center rounded-full transition-transform active:scale-95"
      style="width: 44px; height: 44px;"
      @click="emit('update:modelValue', modelValue === color.value ? null : color.value)"
    >
      <span
        class="rounded-full"
        :style="{ backgroundColor: color.hex, width: '28px', height: '28px' }"
      />
      <span
        v-if="modelValue === color.value"
        class="absolute inset-0 flex items-center justify-center"
        style="font-size: 14px; color: white;"
      >✓</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TaskColor } from '~/types'

const props = defineProps<{
  modelValue: TaskColor | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TaskColor | null]
}>()

const colors: { value: TaskColor; hex: string }[] = [
  { value: 'red',    hex: '#E24B4A' },
  { value: 'orange', hex: '#EF9F27' },
  { value: 'green',  hex: '#639922' },
  { value: 'blue',   hex: '#378ADD' },
  { value: 'purple', hex: '#7F77DD' },
  { value: 'pink',   hex: '#D4537E' },
]
</script>