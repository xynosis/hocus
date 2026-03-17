<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative bg-white dark:bg-neutral-900 rounded-t-2xl px-4 pt-4 pb-8 flex flex-col gap-3 shadow-xl">
          <div class="flex items-center justify-between mb-1">
            <h2 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">Park it</h2>
            <button type="button"
              class="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              style="min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: flex-end;"
              @click="close">
              ✕
            </button>
          </div>

          <p class="text-sm text-neutral-400 dark:text-neutral-500 -mt-1">
            One item per line. Dump everything, sort it later.
          </p>

          <textarea
            ref="inputRef"
            v-model="body"
            placeholder="Buy milk&#10;Email Sarah&#10;Fix the thing..."
            rows="5"
            class="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />

          <button
            type="button"
            class="w-full py-3 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors disabled:opacity-40"
            style="min-height: 44px;"
            :disabled="!body.trim()"
            @click="submit"
          >
            Park {{ itemCount > 1 ? `${itemCount} items` : 'it' }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const tasksStore = useTasksStore()
const body = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)
const isSubmitting = ref(false)

const itemCount = computed(() =>
  body.value.split('\n').filter(l => l.trim()).length
)

watch(() => props.modelValue, (val) => {
  if (val) {
    body.value = ''
    nextTick(() => inputRef.value?.focus())
  }
})

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  if (isSubmitting.value) return
  const lines = body.value.split('\n').map(l => l.trim()).filter(Boolean)
  if (!lines.length) return
  isSubmitting.value = true
  await Promise.all(lines.map(title => tasksStore.addTask({ title })))
  isSubmitting.value = false
  close()
}
</script>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.25s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
</style>
