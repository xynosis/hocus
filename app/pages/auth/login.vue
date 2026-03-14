<template>
  <div
    class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 flex flex-col gap-4">
    <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-100">Sign in</h2>

    <div class="flex flex-col gap-1">
      <label class="text-xs text-neutral-500 dark:text-neutral-400 px-1">Email</label>
      <input v-model="email" type="email" placeholder="you@example.com" autocomplete="email"
        class="w-full rounded-xl border px-3 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
        @keydown.enter="handleLogin" />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-xs text-neutral-500 dark:text-neutral-400 px-1">Password</label>
      <input v-model="password" type="password" placeholder="••••••••" autocomplete="current-password"
        class="w-full rounded-xl border px-3 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
        @keydown.enter="handleLogin" />
    </div>

    <p v-if="errorMessage" class="text-sm text-red-500 px-1">{{ errorMessage }}</p>

    <button type="button" class="w-full rounded-xl py-3 text-sm font-medium transition-opacity" :class="isLoading
      ? 'bg-purple-300 dark:bg-purple-800 text-white cursor-not-allowed'
      : 'bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700'" :disabled="isLoading"
      @click="handleLogin">
      {{ isLoading ? 'Signing in...' : 'Sign in' }}
    </button>

    <p class="text-center text-sm text-neutral-400 dark:text-neutral-500">
      No account?
      <NuxtLink to="/auth/signup" class="text-purple-500 hover:underline">Sign up</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const user = useSupabaseUser()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter your email and password.'
    return
  }
  isLoading.value = true
  errorMessage.value = ''
  const error = await authStore.login(email.value, password.value)
  isLoading.value = false
  if (error) {
    errorMessage.value = 'That email or password doesn\'t look right. Please try again.'
    return
  }
  navigateTo('/')
}
</script>