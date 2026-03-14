<template>
  <div class="flex flex-col gap-1">
    <input
      ref="inputEl"
      v-model="inputText"
      type="text"
      :placeholder="placeholder"
      class="w-full rounded-xl border px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
      @focus="isFocused = true"
      @blur="onBlur"
      @keydown.enter.prevent="onBlur"
    />
    <p v-if="livePreview" class="text-xs text-purple-500 dark:text-purple-400 px-1">
      {{ livePreview }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { parseNaturalDate, formatNaturalPreview } from '~/utils/naturalDate'
import { formatDate } from '~/utils/dates'

const props = defineProps<{
  modelValue: string | null
  placeholder: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const inputEl = ref<HTMLInputElement | null>(null)
const inputText = ref('')
const isFocused = ref(false)

// When the external value changes (e.g. edit mode population), sync the display
watch(
  () => props.modelValue,
  (val) => {
    if (!isFocused.value) {
      inputText.value = val ? formatDate(val) : ''
    }
  },
  { immediate: true },
)

// Show a live preview as the user types a natural language phrase
const livePreview = computed(() => {
  if (!isFocused.value) return null
  const parsed = parseNaturalDate(inputText.value)
  if (!parsed) return null
  const preview = formatNaturalPreview(parsed)
  // Don't show preview if the input already matches the formatted output
  if (inputText.value.toLowerCase() === preview.toLowerCase()) return null
  return preview
})

function onBlur() {
  isFocused.value = false
  const text = inputText.value.trim()
  if (!text) {
    emit('update:modelValue', null)
    inputText.value = ''
    return
  }
  const parsed = parseNaturalDate(text)
  if (parsed) {
    emit('update:modelValue', parsed)
    inputText.value = formatDate(parsed)
  } else {
    // Revert to the last known good value
    inputText.value = props.modelValue ? formatDate(props.modelValue) : ''
  }
}
</script>
