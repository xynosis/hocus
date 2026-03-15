<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-stone-50 dark:bg-neutral-900 border-t border-stone-200 dark:border-neutral-800 flex items-center justify-around px-4 pb-safe">
    <NuxtLink
      to="/"
      class="flex flex-col items-center justify-center gap-1 text-xs transition-colors"
      :class="route.path === '/'
        ? 'text-purple-500 dark:text-purple-400'
        : 'text-neutral-400 dark:text-neutral-500'"
      style="min-width: 64px; min-height: 44px;"
    >
      <span class="block h-0.5 w-6 rounded-full transition-colors mb-0.5" :class="route.path === '/' ? 'bg-purple-500 dark:bg-purple-400' : 'bg-transparent'" />
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
      <span class="block h-0.5 w-6 rounded-full transition-colors mb-0.5" :class="route.path.startsWith('/projects') ? 'bg-purple-500 dark:bg-purple-400' : 'bg-transparent'" />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M2 9H18" stroke="currentColor" stroke-width="1.5"/>
        <path d="M6 5V3M14 5V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span>Projects</span>
    </NuxtLink>

    <NuxtLink
      to="/inbox"
      class="flex flex-col items-center justify-center gap-1 text-xs transition-colors"
      :class="route.path === '/inbox'
        ? 'text-purple-500 dark:text-purple-400'
        : 'text-neutral-400 dark:text-neutral-500'"
      style="min-width: 64px; min-height: 44px;"
    >
      <span class="block h-0.5 w-6 rounded-full transition-colors mb-0.5" :class="route.path === '/inbox' ? 'bg-purple-500 dark:bg-purple-400' : 'bg-transparent'" />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 12H6L8 15H12L14 12H18" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M2 12V16C2 16.6 2.4 17 3 17H17C17.6 17 18 16.6 18 16V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M10 3V11M7 8L10 11L13 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Inbox</span>
    </NuxtLink>

    <NuxtLink
      to="/account"
      class="flex flex-col items-center justify-center gap-1 text-xs transition-colors"
      :class="route.path === '/account'
        ? 'text-purple-500 dark:text-purple-400'
        : 'text-neutral-400 dark:text-neutral-500'"
      style="min-width: 64px; min-height: 44px;"
    >
      <span class="block h-0.5 w-6 rounded-full transition-colors mb-0.5" :class="route.path === '/account' ? 'bg-purple-500 dark:bg-purple-400' : 'bg-transparent'" />
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
</script>