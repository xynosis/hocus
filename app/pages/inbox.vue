<template>
    <div class="p-4">
        <div class="flex items-center justify-between px-2 py-3">
          <h1 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Inbox</h1>
          <SearchBar v-model="search" />
          <button
            type="button"
            class="relative flex items-center justify-center rounded-xl transition-colors"
            :class="filterCount > 0
              ? 'text-purple-500 dark:text-purple-400'
              : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'"
            style="min-height: 44px; min-width: 44px;"
            aria-label="Filter tasks"
            @click="showFilterSheet = true"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4h14M5 9h8M8 14h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span v-if="filterCount > 0"
              class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center"
              style="font-size: 10px;">
              {{ filterCount }}
            </span>
          </button>
        </div>


        <ErrorMessage v-if="tasksStore.error" :message="tasksStore.error" :on-retry="() => tasksStore.fetchTasks()" />
        <div v-if="tasksStore.isLoading" class="flex flex-col gap-3">
            <SkeletonCard v-for="n in 3" :key="n" />
        </div>

        <template v-else>
            <div v-if="inboxTasks.length === 0 && completedInboxTasks.length === 0"
                class="flex flex-col items-center justify-center py-20 gap-2">
                <p class="text-neutral-400 dark:text-neutral-500 text-base">Inbox is clear.</p>
                <p class="text-neutral-400 dark:text-neutral-500 text-sm">Everything is in a project.</p>
            </div>

            <div v-else class="flex flex-col gap-3">
                <div v-if="inboxTasks.length === 0 && !showCompleted"
                    class="flex flex-col items-center justify-center py-8 gap-2">
                    <p class="text-neutral-400 dark:text-neutral-500 text-sm">All loose tasks are done.</p>
                </div>

                <TaskCard v-for="task in inboxTasks" :key="task.id" :task="task"
                    :search-term="search.trim().toLowerCase() || undefined"
                    @click="navigateTo(`/task/${task.id}`)"
                    @delete="onDelete(task.id)" />

                <template v-if="completedInboxTasks.length > 0">
                    <button type="button"
                        class="flex items-center gap-2 text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors px-1 py-2"
                        @click="showCompleted = !showCompleted">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="transition-transform"
                            :class="showCompleted ? 'rotate-180' : ''">
                            <path d="M2 4L7 9L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        {{ showCompleted ? 'Hide completed' : `Show completed (${completedInboxTasks.length})` }}
                    </button>

                    <template v-if="showCompleted">
                        <div class="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex flex-col gap-3">
                            <TaskCard v-for="task in completedInboxTasks" :key="task.id" :task="task"
                                @click="navigateTo(`/task/${task.id}`)" @delete="onDelete(task.id)" />
                        </div>
                    </template>
                </template>
            </div>
        </template>
        <BaseModal v-model="showDeleteModal" title="Delete task?" confirm-label="Delete" @confirm="confirmDelete">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                This will permanently remove the task. This can't be undone.
            </p>
        </BaseModal>

        <FilterSheet v-model="showFilterSheet" :filters="filters" @update:filters="filters = $event" />
    </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import { useProjectsStore } from '~/stores/projects'
import { emptyFilters, activeFilterCount, applyFilters } from '~/utils/filters'
import type { TaskFilters } from '~/utils/filters'
import BaseModal from '~/components/ui/BaseModal.vue'
import FilterSheet from '~/components/ui/FilterSheet.vue'
import SearchBar from '~/components/ui/SearchBar.vue'

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const showCompleted = ref(false)
const search = ref('')
const showFilterSheet = ref(false)
const filters = ref<TaskFilters>(emptyFilters())
const filterCount = computed(() => activeFilterCount(filters.value))

const allInboxTasks = computed(() => {
    const inboxTaskIds = new Set(projectsStore.getInboxTaskIds())
    return tasksStore.sortedTasks.filter(t => inboxTaskIds.has(t.id))
})

const inboxTasks = computed(() => {
    const searchTerm = search.value.trim().toLowerCase()
    if (searchTerm) {
        return tasksStore.sortedTasks.filter(t =>
      t.title.toLowerCase().includes(searchTerm) ||
      (t.notes?.toLowerCase().includes(searchTerm) ?? false)
    )
    }
    const base = allInboxTasks.value.filter(t => t.status !== 'done')
    return applyFilters(base, filters.value)
})

const completedInboxTasks = computed(() =>
    allInboxTasks.value.filter(t => t.status === 'done')
)

onUnmounted(() => {
    showCompleted.value = false
})

const showDeleteModal = ref(false)
const pendingDeleteId = ref<string | null>(null)

function onDelete(id: string) {
    pendingDeleteId.value = id
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (pendingDeleteId.value) {
        await tasksStore.deleteTask(pendingDeleteId.value)
        pendingDeleteId.value = null
    }
}
</script>