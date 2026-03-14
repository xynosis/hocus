<template>
  <div class="rounded-2xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-4 flex flex-col gap-3">
    <p class="text-sm text-red-700 dark:text-red-300 leading-relaxed">
      {{ message }}
    </p>
    <button
      v-if="onRetry"
      type="button"
      class="self-start text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline transition-colors"
      @click="onRetry"
    >
      Try again
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
  onRetry?: () => void
}>()
</script>