<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-around px-4 pb-safe">
    <NuxtLink
      to="/"
      class="flex flex-col items-center justify-center gap-1 text-xs transition-colors"
      :class="route.path === '/'
        ? 'text-purple-500 dark:text-purple-400'
        : 'text-neutral-400 dark:text-neutral-500'"
      style="min-width: 64px; min-height: 44px;"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
      </svg>
      <span>Today</span>
    </NuxtLink>

    <NuxtLink
      to="/projects"
      class="flex flex-col items-center justify-center gap-1 text-xs transition-colors"
      :class="route.path.startsWith('/projects')
        ? 'text-purple-500 dark:text-purple-400'
        : 'text-neutral-400 dark:text-neutral-500'"
      style="min-width: 64px; min-height: 44px;"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M2 9H18" stroke="currentColor" stroke-width="1.5"/>
        <path d="M6 5V3M14 5V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span>Projects</span>
    </NuxtLink>

    <button
      type="button"
      aria-label="Add new task"
      class="flex items-center justify-center rounded-full bg-purple-500 active:bg-purple-600 transition-colors shadow-sm"
      style="width: 52px; height: 52px;"
      @click="emit('open-task-sheet')"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <NuxtLink
      to="/misc"
      class="flex flex-col items-center justify-center gap-1 text-xs transition-colors"
      :class="route.path === '/misc'
        ? 'text-purple-500 dark:text-purple-400'
        : 'text-neutral-400 dark:text-neutral-500'"
      style="min-width: 64px; min-height: 44px;"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 5H17M3 10H17M3 15H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span>Misc</span>
    </NuxtLink>

    <NuxtLink
      to="/account"
      class="flex flex-col items-center justify-center gap-1 text-xs transition-colors"
      :class="route.path === '/account'
        ? 'text-purple-500 dark:text-purple-400'
        : 'text-neutral-400 dark:text-neutral-500'"
      style="min-width: 64px; min-height: 44px;"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M3 17C3 14 6 12 10 12C14 12 17 14 17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span>Account</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const emit = defineEmits<{
  'open-task-sheet': []
}>()
</script>