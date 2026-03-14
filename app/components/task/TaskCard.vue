<template>
    <div class="relative overflow-hidden rounded-2xl" @touchstart="onTouchStart" @touchmove="onTouchMove"
        @touchend="onTouchEnd">
        <div class="absolute inset-0 flex items-center justify-between px-6 rounded-2xl" aria-hidden="true">
            <span class="text-sm font-medium text-white">Done</span>
            <span class="text-sm font-medium text-white">Delete</span>
        </div>

        <div class="relative border rounded-2xl p-4 flex gap-3 transition-all" :class="task.status === 'done'
            ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
            : task.status === 'orbit'
              ? 'bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-900'
              : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'" :style="{
                transform: `translateX(${swipeX}px)`,
                borderLeftWidth: '4px',
                borderLeftColor: task.status === 'done'
                    ? '#639922'
                    : task.status === 'orbit'
                      ? '#64A8C8'
                      : (colorHex ?? 'transparent'),
            }">
            <button type="button" :aria-label="task.status === 'done' ? 'Mark as not done' : 'Mark as done'"
                class="flex-shrink-0 mt-0.5 rounded-full border-2 flex items-center justify-center transition-colors"
                :class="task.status === 'done'
                    ? 'bg-green-600 border-green-600'
                    : 'border-neutral-300 dark:border-neutral-600'"
                style="min-width: 44px; min-height: 44px; width: 44px; height: 44px;" @click.stop="toggleDone">
                <span v-if="task.status === 'done'" class="text-white text-xs">✓</span>
            </button>

            <div class="flex-1 min-w-0 cursor-pointer" @click="emit('click')">
                <p class="text-base font-medium leading-snug" :class="task.status === 'done'
                    ? 'line-through text-green-700 dark:text-green-400'
                    : 'text-neutral-800 dark:text-neutral-100'">
                    {{ task.title }}
                </p>

                <p v-if="notesSnippet" class="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 leading-relaxed italic line-clamp-2">
                    {{ notesSnippet }}
                </p>

                <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                    <span v-if="isBlocked && task.status !== 'done'"
                        class="text-xs text-amber-500 dark:text-amber-400 font-medium">
                        Blocked
                    </span>
                    <span v-if="task.status === 'in_progress'"
                        class="text-xs text-purple-500 dark:text-purple-400 font-medium">
                        In progress
                    </span>
                    <span v-if="task.status === 'orbit'"
                        class="text-xs text-sky-500 dark:text-sky-400 font-medium">
                        Quiet
                    </span>

                    <span v-if="task.due_date" class="text-xs" :class="task.status === 'done'
                        ? 'text-green-600 dark:text-green-500 opacity-70'
                        : isOverdue(task.due_date)
                            ? 'text-red-500 dark:text-red-400 font-medium'
                            : 'text-neutral-400 dark:text-neutral-500'">
                        Due {{ formatDate(task.due_date) }}
                    </span>

                    <span v-if="task.working_on_date" class="text-xs" :class="task.status === 'done'
                        ? 'text-green-600 dark:text-green-500 opacity-70'
                        : 'text-neutral-400 dark:text-neutral-500'">
                        Working on {{ formatDate(task.working_on_date) }}
                    </span>

                    <span v-if="childCount > 0" class="text-xs" :class="task.status === 'done'
                        ? 'text-green-600 dark:text-green-500 opacity-70'
                        : 'text-neutral-400 dark:text-neutral-500'">
                        {{ childCompleteCount }}/{{ childCount }} done
                    </span>

                    <span v-if="taskSize" class="text-xs" :class="task.status === 'done'
                        ? 'text-green-600 dark:text-green-500 opacity-70'
                        : 'text-neutral-400 dark:text-neutral-500'">
                        {{ taskSize }}
                    </span>

                    <span v-if="task.recurrence && task.status !== 'done'" class="text-xs text-neutral-400 dark:text-neutral-500">
                        ↻ {{ task.recurrence }}
                    </span>
                </div>
            </div>

            <button v-if="task.status !== 'done'" type="button" aria-label="Enter focus mode"
                class="flex-shrink-0 flex items-center justify-center rounded-xl transition-colors active:scale-95"
                :class="task.status === 'orbit'
                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-500 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900'
                    : 'bg-purple-100 dark:bg-purple-950 text-purple-500 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900'"
                style="min-width: 44px; min-height: 44px;" @click.stop="enterFocus(task.id)">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="4,2 16,9 4,16" fill="currentColor" />
                </svg>
            </button>
            <button
                v-if="task.status !== 'done'"
                type="button"
                :aria-label="isDoorOpener ? 'What\'s the smallest possible first step?' : 'Reschedule'"
                class="flex-shrink-0 flex items-center justify-center rounded-xl text-neutral-300 dark:text-neutral-600 hover:text-neutral-400 dark:hover:text-neutral-500 transition-colors"
                style="min-width: 32px; min-height: 32px; font-size: 18px; line-height: 1;"
                @click.stop="isDoorOpener ? emit('doorOpener') : emit('push')"
            >
                ···
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Task } from '~/types'
import { isOverdue, formatDate } from '~/utils/dates'
import { getColorHex } from '~/utils/colors'
import { inferTaskSize } from '~/utils/taskSize'
import { useDependenciesStore } from '~/stores/dependencies'

const colorHex = computed(() => getColorHex(props.task.color_tag))
const taskSize = computed(() => inferTaskSize(props.task.estimated_minutes))
const props = defineProps<{
    task: Task
    searchTerm?: string
}>()

const notesSnippet = computed((): string | null => {
    if (!props.searchTerm || !props.task.notes) return null
    const term = props.searchTerm.toLowerCase()
    if (props.task.title.toLowerCase().includes(term)) return null
    if (!props.task.notes.toLowerCase().includes(term)) return null
    const idx = props.task.notes.toLowerCase().indexOf(term)
    const start = Math.max(0, idx - 30)
    const end = Math.min(props.task.notes.length, idx + term.length + 60)
    let snippet = props.task.notes.slice(start, end).replace(/\n/g, ' ')
    if (start > 0) snippet = '…' + snippet
    if (end < props.task.notes.length) snippet = snippet + '…'
    return snippet
})

const dependenciesStore = useDependenciesStore()
const isBlocked = computed(() => dependenciesStore.isBlocked(props.task.id))
const childCount = computed(() => tasksStore.getChildTasks(props.task.id).length)
const childCompleteCount = computed(() => tasksStore.getChildTasks(props.task.id).filter(t => t.status === 'done').length)
const isDoorOpener = computed(() => {
    if (props.task.status !== 'todo') return false
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    return new Date(props.task.updated_at) < threeDaysAgo
})

const emit = defineEmits<{
    click: []
    delete: []
    doorOpener: []
    push: []
}>()

const tasksStore = useTasksStore()
const { enterFocus } = useFocus()

function toggleDone() {
    const next = props.task.status === 'done' ? 'todo' : 'done'
    tasksStore.setTaskStatus(props.task.id, next)
}

const swipeX = ref(0)
const swipeStartX = ref(0)
const swipeStartY = ref(0)
const isSwiping = ref(false)
const THRESHOLD = 80

function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    if (!touch) return
    swipeStartX.value = touch.clientX
    swipeStartY.value = touch.clientY
    isSwiping.value = true
}

function onTouchMove(e: TouchEvent) {
    if (!isSwiping.value) return
    const touch = e.touches[0]
    if (!touch) return
    const dx = touch.clientX - swipeStartX.value
    const dy = touch.clientY - swipeStartY.value
    if (Math.abs(dy) > Math.abs(dx)) {
        isSwiping.value = false
        swipeX.value = 0
        return
    }
    swipeX.value = dx
}

function onTouchEnd() {
    isSwiping.value = false
    if (swipeX.value > THRESHOLD) {
        toggleDone()
    } else if (swipeX.value < -THRESHOLD) {
        emit('delete')
    }
    swipeX.value = 0
}
</script>