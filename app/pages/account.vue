<template>
    <div class="p-4 max-w-lg mx-auto">
        <h1 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100 px-2 py-3">
            Account
        </h1>

        <div class="flex flex-col gap-4">
            <div
                class="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <span class="text-xs text-neutral-400 dark:text-neutral-500">Signed in as</span>
                    <span class="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                        {{ user?.email }}
                    </span>
                </div>

                <div class="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                    <button type="button"
                        class="w-full py-3 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        style="min-height: 44px;" @click="handleSignOut">
                        Sign out
                    </button>
                </div>
            </div>

            <div class="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h2 class="text-sm font-medium text-neutral-800 dark:text-neutral-100 mb-2">
                    Delete account
                </h2>
                <p class="text-sm text-neutral-400 dark:text-neutral-500 leading-relaxed">
                    To delete your account and all associated data, email

                    <a href="mailto:hello@kierancutting.co.uk" class="text-purple-500 hover:underline">
                        hello@kierancutting.co.uk
                    </a>
                    and we'll take care of it within 48 hours.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const supabase = useSupabaseClient()
const user = computed(() => authStore.user)

async function handleSignOut() {
    await authStore.logout()
    navigateTo('/auth/login')
}
</script>