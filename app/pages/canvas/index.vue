<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Boards</h1>
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors active:scale-95"
        @click="createBoard"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        New board
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && boards.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" class="mb-4 text-neutral-300 dark:text-neutral-700">
        <rect x="4" y="4" width="32" height="32" rx="4" stroke="currentColor" stroke-width="2"/>
        <rect x="10" y="10" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
        <rect x="24" y="10" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
        <rect x="10" y="22" width="6" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
        <rect x="20" y="24" width="10" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <p class="text-neutral-500 dark:text-neutral-400 text-sm">No boards yet.</p>
      <p class="text-neutral-400 dark:text-neutral-500 text-sm mt-1">Create one to start mapping your work.</p>
    </div>

    <!-- Board list -->
    <div v-else class="flex flex-col gap-2">
      <div
        v-for="board in boards"
        :key="board.id"
        class="group rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm p-4 hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex-1 min-w-0 cursor-pointer" @click="navigateTo(`/canvas/${board.id}`)">
            <p class="text-base font-medium text-neutral-800 dark:text-neutral-100 truncate">{{ board.title }}</p>
            <span class="text-xs text-neutral-400 dark:text-neutral-500">{{ formatRelative(board.updated_at) }}</span>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <template v-if="confirmDeleteId === board.id">
              <button
                type="button"
                class="text-xs text-red-500 dark:text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                style="min-height: 32px;"
                @click.stop="deleteBoard(board.id)"
              >Delete?</button>
              <button
                type="button"
                class="text-xs text-neutral-400 dark:text-neutral-500 px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                style="min-height: 32px;"
                @click.stop="confirmDeleteId = null"
              >Cancel</button>
            </template>
            <button
              v-else
              type="button"
              class="opacity-0 group-hover:opacity-100 focus:opacity-100 text-neutral-300 dark:text-neutral-700 hover:text-red-400 dark:hover:text-red-500 transition-colors rounded-lg flex items-center justify-center"
              style="min-width: 32px; min-height: 32px; font-size: 18px; line-height: 1;"
              aria-label="Delete board"
              @click.stop="confirmDeleteId = board.id"
            >×</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBoardsStore } from '~/features/canvas/stores/boards'

definePageMeta({ layout: 'default' })

const boardsStore = useBoardsStore()
const loading = ref(true)
const confirmDeleteId = ref<string | null>(null)

const boards = computed(() => boardsStore.boards)

onMounted(async () => {
  await boardsStore.fetchAll()
  loading.value = false
})

async function createBoard() {
  const board = await boardsStore.create()
  if (board) navigateTo(`/canvas/${board.id}`)
}

async function deleteBoard(id: string) {
  await boardsStore.remove(id)
  confirmDeleteId.value = null
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>
