<template>
    <aside
        class="fixed left-0 top-0 bottom-0 w-56 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 flex flex-col z-30">
        <div class="px-4 py-5 border-b border-neutral-100 dark:border-neutral-800">
            <h1 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">Hocus</h1>
        </div>

        <div class="flex-1 overflow-y-auto py-3 flex flex-col gap-1 px-2">
            <NuxtLink to="/" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors" :class="route.path === '/'
                ? 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                style="min-height: 44px;">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" stroke="currentColor" stroke-width="1.5"
                        stroke-linejoin="round" fill="none" />
                </svg>
                Today
            </NuxtLink>

            <div class="px-3 pt-3 pb-1">
                <span
                    class="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Projects</span>
            </div>

            <NuxtLink v-for="project in projects" :key="project.id" :to="`/projects/${project.id}`"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors truncate" :class="route.path === `/projects/${project.id}`
                    ? 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                style="min-height: 44px;">
                <span class="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                    :style="{ backgroundColor: getColorHex(project.color_tag) ?? '#d4d4d4' }" />
                <span class="truncate">{{ project.name }}</span>
            </NuxtLink>

            <button type="button"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left w-full"
                :class="route.path === '/projects'
                    ? 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-medium'
                    : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                style="min-height: 44px;" @click="navigateTo('/projects')">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" fill="none" />
                    <path d="M10 7V10M10 13H10.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                All projects
            </button>

            <div class="px-3 pt-3 pb-1">
                <span
                    class="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Other</span>
            </div>

            <NuxtLink to="/misc" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors"
                :class="route.path === '/misc'
                    ? 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                style="min-height: 44px;">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5H17M3 10H17M3 15H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                Misc
            </NuxtLink>

            <button
                type="button"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left w-full text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                style="min-height: 44px;"
                @click="openTriage"
            >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5H17M3 10H12M3 15H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    <circle cx="15" cy="14" r="3" stroke="currentColor" stroke-width="1.5" fill="none" />
                    <path d="M14 14L15 15L17 13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Backlog{{ backlogCount > 0 ? ` (${backlogCount})` : '' }}
            </button>
        </div>

        <div class="px-2 py-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-1">
            <button type="button"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors w-full"
                style="min-height: 44px;" @click="emit('open-task-sheet')">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="white" stroke-width="2" stroke-linecap="round" />
                </svg>
                New task
            </button>

            <button type="button"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors w-full"
                style="min-height: 44px;" @click="navigateTo('/account')">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5" fill="none" />
                    <path d="M3 17C3 14 6 12 10 12C14 12 17 14 17 17" stroke="currentColor" stroke-width="1.5"
                        stroke-linecap="round" />
                </svg>
                Account
            </button>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { getColorHex } from '~/utils/colors'
import { useProjectsStore } from '~/stores/projects'
import { useTasksStore } from '~/stores/tasks'

const route = useRoute()
const projectsStore = useProjectsStore()
const projects = computed(() => projectsStore.sortedProjects)

const { openTriage } = useBacklogTriage()
const tasksStore = useTasksStore()
const backlogCount = computed(() =>
  tasksStore.tasks.filter(t =>
    t.status !== 'done' && t.parent_id === null && !t.working_on_date && !t.due_date
  ).length
)

const emit = defineEmits<{
    'open-task-sheet': []
}>()
</script>