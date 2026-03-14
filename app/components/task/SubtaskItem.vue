<template>
    <div
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 group">
        <span v-if="dragHandle"
            class="drag-handle text-neutral-300 dark:text-neutral-600 cursor-grab active:cursor-grabbing flex-shrink-0 select-none"
            style="font-size: 14px; letter-spacing: -1px;">⋮⋮</span>
        <button type="button" :aria-label="subtask.is_complete ? 'Mark incomplete' : 'Mark complete'"
            class="flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors" :class="subtask.is_complete
                ? 'bg-green-600 border-green-600'
                : 'border-neutral-300 dark:border-neutral-500'"
            style="min-width: 24px; min-height: 24px; width: 24px; height: 24px;"
            @click="subtasksStore.toggleSubtask(subtask.id)">
            <span v-if="subtask.is_complete" class="text-white" style="font-size: 11px;">✓</span>
        </button>

        <div class="flex-1 min-w-0">
            <input v-if="isEditing" ref="inputRef" v-model="editTitle" type="text"
                class="w-full text-sm bg-transparent text-neutral-800 dark:text-neutral-100 focus:outline-none"
                @blur="saveEdit" @keydown.enter="saveEdit" @keydown.escape="cancelEdit" />
            <p v-else class="text-sm cursor-text truncate" :class="subtask.is_complete
                ? 'line-through text-neutral-400 dark:text-neutral-500'
                : 'text-neutral-800 dark:text-neutral-100'" @click="startEdit">
                {{ subtask.title }}
            </p>
        </div>

        <button type="button" aria-label="Delete subtask"
            class="flex-shrink-0 text-neutral-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            style="min-width: 24px; min-height: 24px; font-size: 16px; line-height: 1;"
            @click="subtasksStore.deleteSubtask(subtask.id)">
            ×
        </button>
    </div>
</template>

<script setup lang="ts">
import { useSubtasksStore } from '~/stores/subtasks'
import type { Subtask } from '~/types'

const props = defineProps<{
    subtask: Subtask
    dragHandle?: boolean
}>()

const subtasksStore = useSubtasksStore()

const isEditing = ref(false)
const editTitle = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function startEdit() {
    if (props.subtask.is_complete) return
    editTitle.value = props.subtask.title
    isEditing.value = true
    nextTick(() => inputRef.value?.focus())
}

function saveEdit() {
    const trimmed = editTitle.value.trim()
    if (trimmed && trimmed !== props.subtask.title) {
        subtasksStore.updateSubtask(props.subtask.id, { title: trimmed })
    }
    isEditing.value = false
}

function cancelEdit() {
    isEditing.value = false
}
</script>