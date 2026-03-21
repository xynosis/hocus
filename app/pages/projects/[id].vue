<template>
    <div class="p-4 flex flex-col gap-4">
        <div v-if="!project" class="flex flex-col items-center justify-center py-20 gap-2">
            <p class="text-neutral-400 dark:text-neutral-500 text-base">Project not found.</p>
            <button type="button" class="text-purple-500 text-sm mt-2" @click="navigateTo('/projects')">
                Go to projects
            </button>
        </div>

        <template v-else>
            <div class="flex items-center gap-3 px-1">
                <button type="button"
                    class="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    style="min-width: 44px; min-height: 44px; display: flex; align-items: center;"
                    @click="router.back()">
                    ← Back
                </button>
            </div>

            <div class="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5"
                :style="{
                    borderLeftWidth: '4px',
                    borderLeftColor: getColorHex(project.color_tag) ?? 'transparent',
                }">
                <div class="flex items-start justify-between gap-3 mb-2">
                    <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
                        {{ project.name }}
                    </h1>
                    <button type="button" class="text-sm text-purple-500 dark:text-purple-400 flex-shrink-0"
                        style="min-height: 44px; display: flex; align-items: center;" @click="isEditFormOpen = true">
                        Edit
                    </button>
                </div>

                <p v-if="project.description"
                    class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
                    {{ project.description }}
                </p>

                <div class="flex items-center justify-between">
                    <span v-if="project.due_date" class="text-xs" :class="isOverdue(project.due_date)
                        ? 'text-red-500 dark:text-red-400 font-medium'
                        : 'text-neutral-400 dark:text-neutral-500'">
                        Due {{ formatDate(project.due_date) }}
                    </span>
                    <button type="button"
                        class="text-xs text-red-400 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        style="min-height: 44px; display: flex; align-items: center;" @click="showDeleteModal = true">
                        Delete project
                    </button>
                </div>
            </div>

            <div class="flex items-center justify-between px-1">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-100">Tasks</h2>
                <div class="flex items-center gap-1">
                    <SearchBar v-model="search" />
                    <button type="button"
                        class="relative flex items-center justify-center rounded-xl transition-colors"
                        :class="filterCount > 0
                            ? 'text-purple-500 dark:text-purple-400'
                            : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'"
                        style="min-height: 44px; min-width: 44px;"
                        aria-label="Filter tasks"
                        @click="showFilterSheet = true">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 4h14M5 9h8M8 14h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        <span v-if="filterCount > 0"
                            class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center"
                            style="font-size: 10px;">
                            {{ filterCount }}
                        </span>
                    </button>
                    <button type="button"
                        class="flex items-center gap-1 text-sm text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                        style="min-height: 44px;" @click="openAddTask(null)">
                        + Add task
                    </button>
                </div>
            </div>

            <div v-if="tasksStore.isLoading" class="flex flex-col gap-3">
                <SkeletonCard v-for="n in 3" :key="n" />
            </div>
            <ErrorMessage v-if="projectsStore.error" :message="projectsStore.error"
                :on-retry="() => projectsStore.fetchProjects()" />

            <template v-else>
                <div v-if="allProjectTasks.length === 0"
                    class="flex flex-col items-center justify-center py-12 gap-2">
                    <p class="text-neutral-400 dark:text-neutral-500 text-sm">No tasks in this project yet.</p>
                </div>

                <template v-else>
                    <!-- Unsectioned tasks -->
                    <div v-if="unsectionedActive.length > 0 || unsectionedDone.length > 0" class="flex flex-col gap-3">
                        <TaskCard v-for="task in unsectionedActive" :key="task.id" :task="task"
                            :search-term="search.trim().toLowerCase() || undefined"
                            :show-project-tags="false"
                            @click="navigateTo(`/task/${task.id}`)" @delete="onDeleteTask(task.id)" />

                        <template v-if="unsectionedDone.length > 0">
                            <button type="button"
                                class="flex items-center gap-2 text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors px-1 py-2"
                                @click="showCompleted = !showCompleted">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="transition-transform"
                                    :class="showCompleted ? 'rotate-180' : ''">
                                    <path d="M2 4L7 9L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                                {{ showCompleted ? 'Hide completed' : `Show completed (${unsectionedDone.length})` }}
                            </button>
                            <template v-if="showCompleted">
                                <div class="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex flex-col gap-3">
                                    <TaskCard v-for="task in unsectionedDone" :key="task.id" :task="task"
                                        :show-project-tags="false"
                                        @click="navigateTo(`/task/${task.id}`)" @delete="onDeleteTask(task.id)" />
                                </div>
                            </template>
                        </template>
                    </div>

                    <!-- Sections -->
                    <VueDraggable v-model="localSections" handle=".section-drag-handle" :animation="150" item-key="id" tag="div" class="flex flex-col gap-0" @end="onSectionDragEnd">
                    <div v-for="section in localSections" :key="section.id" class="flex flex-col gap-3">
                        <div class="flex items-center gap-2 px-1 mt-2">
                            <button
                                class="section-drag-handle flex items-center justify-center text-neutral-300 dark:text-neutral-600 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
                                style="min-width: 20px; min-height: 32px;" aria-label="Drag to reorder" @click.prevent>
                                <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                                    <circle cx="2.5" cy="2" r="1.1" fill="currentColor"/>
                                    <circle cx="7.5" cy="2" r="1.1" fill="currentColor"/>
                                    <circle cx="2.5" cy="6" r="1.1" fill="currentColor"/>
                                    <circle cx="7.5" cy="6" r="1.1" fill="currentColor"/>
                                    <circle cx="2.5" cy="10" r="1.1" fill="currentColor"/>
                                    <circle cx="7.5" cy="10" r="1.1" fill="currentColor"/>
                                </svg>
                            </button>
                            <template v-if="editingSectionId === section.id">
                                <input
                                    ref="sectionNameInput"
                                    v-model="editingSectionName"
                                    class="flex-1 text-sm font-medium bg-transparent border-b border-purple-400 outline-none text-neutral-800 dark:text-neutral-100"
                                    @keydown.enter="saveSection(section.id)"
                                    @keydown.escape="cancelEditSection"
                                    @blur="saveSection(section.id)"
                                />
                            </template>
                            <template v-else>
                                <h3 class="flex-1 text-sm font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                                    {{ section.name }}
                                </h3>
                                <button type="button"
                                    class="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                    style="min-height: 32px; min-width: 32px; display: flex; align-items: center; justify-content: center;"
                                    @click="startEditSection(section)">
                                    ✎
                                </button>
                                <button type="button"
                                    class="text-xs text-neutral-400 dark:text-neutral-500 hover:text-red-400 dark:hover:text-red-500 transition-colors"
                                    style="min-height: 32px; min-width: 32px; display: flex; align-items: center; justify-content: center;"
                                    @click="confirmDeleteSection(section.id)">
                                    ✕
                                </button>
                                <button type="button"
                                    class="text-xs text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                                    style="min-height: 32px; display: flex; align-items: center;"
                                    @click="openAddTask(section.id)">
                                    + Add
                                </button>
                            </template>
                        </div>

                        <div v-if="sectionActiveTasks(section.id).length === 0 && sectionDoneTasks(section.id).length === 0"
                            class="px-2 py-3 text-xs text-neutral-400 dark:text-neutral-500 italic">
                            No tasks in this section.
                        </div>

                        <TaskCard v-for="task in sectionActiveTasks(section.id)" :key="task.id" :task="task"
                            :search-term="search.trim().toLowerCase() || undefined"
                            :show-project-tags="false"
                            @click="navigateTo(`/task/${task.id}`)" @delete="onDeleteTask(task.id)" />

                        <template v-if="sectionDoneTasks(section.id).length > 0">
                            <button type="button"
                                class="flex items-center gap-2 text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors px-1 py-1"
                                @click="toggleSectionCompleted(section.id)">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="transition-transform"
                                    :class="sectionShowCompleted.has(section.id) ? 'rotate-180' : ''">
                                    <path d="M2 4L7 9L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                                {{ sectionShowCompleted.has(section.id) ? 'Hide completed' : `Show completed (${sectionDoneTasks(section.id).length})` }}
                            </button>
                            <template v-if="sectionShowCompleted.has(section.id)">
                                <div class="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex flex-col gap-3">
                                    <TaskCard v-for="task in sectionDoneTasks(section.id)" :key="task.id" :task="task"
                                        :show-project-tags="false"
                                        @click="navigateTo(`/task/${task.id}`)" @delete="onDeleteTask(task.id)" />
                                </div>
                            </template>
                        </template>
                    </div>
                    </VueDraggable>

                    <!-- Add section button -->
                    <button type="button"
                        class="flex items-center gap-2 text-sm text-neutral-400 dark:text-neutral-500 hover:text-purple-500 dark:hover:text-purple-400 transition-colors px-1 py-2"
                        @click="addNewSection">
                        + Add section
                    </button>
                </template>
            </template>
        </template>

        <ProjectForm v-if="project" v-model="isEditFormOpen" :project="project" @submit="onEditSubmit" />

        <TaskForm v-model="isTaskFormOpen" :preselected-project-id="route.params.id as string"
            @submit="onTaskSubmit" />

        <BaseModal v-model="showDeleteModal" title="Delete project?" confirm-label="Delete" @confirm="onDeleteProject">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                This will permanently remove the project. Tasks in this project will not be deleted.
            </p>
        </BaseModal>

        <BaseModal v-model="showDeleteTaskModal" title="Delete task?" confirm-label="Delete"
            @confirm="confirmDeleteTask">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                This will permanently remove the task. This can't be undone.
            </p>
        </BaseModal>

        <BaseModal v-model="showDeleteSectionModal" title="Delete section?" confirm-label="Delete"
            @confirm="executeDeleteSection">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                The section will be removed. Tasks inside it stay in the project.
            </p>
        </BaseModal>

        <FilterSheet v-model="showFilterSheet" :filters="filters" @update:filters="filters = $event" />
    </div>
</template>

<script setup lang="ts">
import { getColorHex } from '~/utils/colors'
import { useProjectsStore } from '~/stores/projects'
import { useTasksStore } from '~/stores/tasks'
import { isOverdue, formatDate } from '~/utils/dates'
import { emptyFilters, activeFilterCount, applyFilters } from '~/utils/filters'
import type { TaskFilters } from '~/utils/filters'
import type { ProjectSection } from '~/types'
import ProjectForm from '~/components/project/ProjectForm.vue'
import TaskForm from '~/components/task/TaskForm.vue'
import FilterSheet from '~/components/ui/FilterSheet.vue'
import SearchBar from '~/components/ui/SearchBar.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import type { CreateTaskPayload } from '~/stores/tasks'
import { VueDraggable } from 'vue-draggable-plus'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const project = computed(() => projectsStore.getProjectById(route.params.id as string))

const localSections = ref<ProjectSection[]>([])
watch(() => projectsStore.getSectionsForProject(route.params.id as string), (s) => {
    localSections.value = [...s]
}, { immediate: true })

function onSectionDragEnd() {
    projectsStore.reorderSections(localSections.value.map(s => s.id))
}

const showCompleted = ref(false)
const sectionShowCompleted = reactive(new Set<string>())
const search = ref('')
const showFilterSheet = ref(false)
const filters = ref<TaskFilters>(emptyFilters())
const filterCount = computed(() => activeFilterCount(filters.value))

const allProjectTasks = computed(() => {
    const taskIds = projectsStore.getTaskIdsForProject(route.params.id as string)
    return tasksStore.sortedTasks.filter(t => taskIds.includes(t.id))
})

function filteredActive(tasks: typeof allProjectTasks.value) {
    const searchTerm = search.value.trim().toLowerCase()
    if (searchTerm) {
        return tasks.filter(t =>
            t.title.toLowerCase().includes(searchTerm) ||
            (t.notes?.toLowerCase().includes(searchTerm) ?? false)
        )
    }
    return applyFilters(tasks.filter(t => t.status !== 'done'), filters.value)
}

const unsectionedActive = computed(() =>
    filteredActive(allProjectTasks.value.filter(t => !t.section_id))
)
const unsectionedDone = computed(() =>
    allProjectTasks.value.filter(t => t.status === 'done' && !t.section_id)
)

function sectionActiveTasks(sectionId: string) {
    return filteredActive(allProjectTasks.value.filter(t => t.section_id === sectionId))
}
function sectionDoneTasks(sectionId: string) {
    return allProjectTasks.value.filter(t => t.status === 'done' && t.section_id === sectionId)
}

function toggleSectionCompleted(sectionId: string) {
    if (sectionShowCompleted.has(sectionId)) {
        sectionShowCompleted.delete(sectionId)
    } else {
        sectionShowCompleted.add(sectionId)
    }
}

onUnmounted(() => {
    showCompleted.value = false
})

// Section editing
const editingSectionId = ref<string | null>(null)
const editingSectionName = ref('')
const sectionNameInput = ref<HTMLInputElement | null>(null)

function startEditSection(section: ProjectSection) {
    editingSectionId.value = section.id
    editingSectionName.value = section.name
    nextTick(() => {
        if (Array.isArray(sectionNameInput.value)) {
            sectionNameInput.value[0]?.focus()
        } else {
            sectionNameInput.value?.focus()
        }
    })
}

function cancelEditSection() {
    editingSectionId.value = null
    editingSectionName.value = ''
}

async function saveSection(id: string) {
    const name = editingSectionName.value.trim()
    if (name) await projectsStore.updateSection(id, name)
    cancelEditSection()
}

async function addNewSection() {
    await projectsStore.addSection(route.params.id as string, 'New section')
    const sections = projectsStore.getSectionsForProject(route.params.id as string)
    const newest = sections[sections.length - 1]
    if (newest) startEditSection(newest)
}

const showDeleteSectionModal = ref(false)
const pendingDeleteSectionId = ref<string | null>(null)

function confirmDeleteSection(id: string) {
    pendingDeleteSectionId.value = id
    showDeleteSectionModal.value = true
}

async function executeDeleteSection() {
    if (pendingDeleteSectionId.value) {
        await projectsStore.deleteSection(pendingDeleteSectionId.value)
        pendingDeleteSectionId.value = null
    }
}

// Task management
const isEditFormOpen = ref(false)
const isTaskFormOpen = ref(false)
const pendingTaskSectionId = ref<string | null>(null)
const showDeleteModal = ref(false)
const showDeleteTaskModal = ref(false)
const pendingDeleteTaskId = ref<string | null>(null)

function openAddTask(sectionId: string | null) {
    pendingTaskSectionId.value = sectionId
    isTaskFormOpen.value = true
}

async function onEditSubmit(payload: { name: string; description: string | null; due_date: string | null }) {
    await projectsStore.updateProject(route.params.id as string, payload)
}

async function onTaskSubmit(payload: CreateTaskPayload | import('~/stores/tasks').UpdateTaskPayload, projectIds: string[]) {
    const taskPayload = { ...(payload as CreateTaskPayload), section_id: pendingTaskSectionId.value }
    const task = await tasksStore.addTask(taskPayload)
    if (task) {
        const ids = projectIds.length > 0 ? projectIds : [route.params.id as string]
        await projectsStore.syncTaskProjects(task.id, ids)
    }
}

async function onDeleteProject() {
    await projectsStore.deleteProject(route.params.id as string)
    navigateTo('/projects')
}

function onDeleteTask(taskId: string) {
    pendingDeleteTaskId.value = taskId
    showDeleteTaskModal.value = true
}

async function confirmDeleteTask() {
    if (pendingDeleteTaskId.value) {
        await tasksStore.deleteTask(pendingDeleteTaskId.value)
        pendingDeleteTaskId.value = null
    }
}
</script>
