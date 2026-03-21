<template>
  <div class="h-screen overflow-hidden bg-stone-50 dark:bg-neutral-950">
    <!-- Mobile top bar -->
    <div class="sm:hidden fixed top-0 inset-x-0 z-30 flex items-center h-12 px-4 bg-stone-50/95 dark:bg-neutral-950/95 backdrop-blur border-b border-neutral-100 dark:border-neutral-800">
      <button
        type="button"
        class="flex items-center justify-center w-9 h-9 flex-shrink-0 text-neutral-500 dark:text-neutral-400"
        aria-label="Open navigation"
        @click="mobileNavOpen = true"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <AppSidebar :open="mobileNavOpen" @close="mobileNavOpen = false" />

    <div class="sm:pl-56 h-full pt-12 sm:pt-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
const mobileNavOpen = ref(false)
</script>
