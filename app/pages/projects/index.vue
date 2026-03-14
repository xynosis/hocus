<template>
    <div class="p-4">
        <div class="flex items-center justify-between px-2 py-3">
            <h1 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Projects</h1>

            <button type="button"
                class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors"
                style="min-height: 44px;" @click="isFormOpen = true">
                <span>+ New project</span>
            </button>
        </div>
        <div v-if="projectsStore.isLoading" class="flex flex-col gap-3 mt-2">
            <SkeletonCard v-for="n in 3" :key="n" />
        </div>
        <ErrorMessage v-if="projectsStore.error" :message="projectsStore.error"
            :on-retry="() => projectsStore.fetchProjects()" />
        <div v-else-if="projects.length === 0" class="flex flex-col items-center justify-center py-20 gap-2">
            <p class="text-neutral-400 dark:text-neutral-500 text-base">No projects yet.</p>
            <p class="text-neutral-400 dark:text-neutral-500 text-sm">Create one to get started.</p>
        </div>

        <div v-else class="flex flex-col gap-3">
            <div v-for="project in projects" :key="project.id"
                class="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 cursor-pointer hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors"
                :style="{
                    borderLeftWidth: '4px',
                    borderLeftColor: getColorHex(project.color_tag) ?? 'transparent',
                }" @click="navigateTo(`/projects/${project.id}`)">
                <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                    <p class="text-base font-medium text-neutral-800 dark:text-neutral-100 truncate">
                        {{ project.name }}
                    </p>
                    <p v-if="project.description"
                        class="text-sm text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                        {{ project.description }}
                    </p>
                    <div class="flex gap-3 mt-1.5">
                        <span v-if="project.due_date" class="text-xs" :class="isOverdue(project.due_date)
                            ? 'text-red-500 dark:text-red-400 font-medium'
                            : 'text-neutral-400 dark:text-neutral-500'">
                            Due {{ formatDate(project.due_date) }}
                        </span>
                        <span class="text-xs text-neutral-400 dark:text-neutral-500">
                            {{ taskCount(project.id) }} {{ taskCount(project.id) === 1 ? 'task' : 'tasks' }}
                        </span>
                    </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                    class="text-neutral-300 dark:text-neutral-600 flex-shrink-0 mt-1">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </div>
        </div>
    </div>

    <ProjectForm v-model="isFormOpen" @submit="onSubmit" />
    </div>
</template>

<script setup lang="ts">
import { getColorHex } from '~/utils/colors'

import { useProjectsStore } from '~/stores/projects'
import { isOverdue, formatDate } from '~/utils/dates'
import ProjectForm from '~/components/project/ProjectForm.vue'

const projectsStore = useProjectsStore()
const projects = computed(() => projectsStore.sortedProjects)

const isFormOpen = ref(false)

function taskCount(projectId: string): number {
    return projectsStore.getTaskIdsForProject(projectId).length
}

async function onSubmit(payload: { name: string; description: string | null; due_date: string | null }) {
    await projectsStore.addProject(payload)
}
</script>