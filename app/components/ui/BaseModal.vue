<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <div
          class="absolute inset-0 bg-black/40"
          @click="emit('update:modelValue', false)"
        />
        <div class="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 border border-neutral-100 dark:border-neutral-800">
          <h3 class="text-base font-medium text-neutral-800 dark:text-neutral-100">
            {{ title }}
          </h3>

          <slot />

          <div class="flex gap-3 justify-end">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              style="min-height: 44px;"
              @click="emit('update:modelValue', false)"
            >
              Cancel
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 active:bg-red-600 transition-colors"
              style="min-height: 44px;"
              @click="onConfirm"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title: string
  confirmLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

function onConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>