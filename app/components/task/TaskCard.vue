<template>
    <div class="relative overflow-hidden rounded-2xl" @touchstart="onTouchStart" @touchmove="onTouchMove"
        @touchend="onTouchEnd">
        <div class="absolute inset-0 flex items-center justify-between px-6 rounded-2xl" aria-hidden="true">
            <span class="text-sm font-medium text-white">Done</span>
            <span class="text-sm font-medium text-white">Delete</span>
        </div>

        <div class="relative border rounded-2xl p-4 flex gap-3 transition-all" :class="task.status === 'done'
            ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
            : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'" :style="{
                transform: `translateX(${swipeX}px)`,
                borderLeftWidth: '4px',
                borderLeftColor: task.status === 'done'
                    ? '#639922'
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

                <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                    <span v-if="task.status === 'in_progress'"
                        class="text-xs text-purple-500 dark:text-purple-400 font-medium">
                        In progress
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

                    <span v-if="subtaskCount && subtaskCount > 0" class="text-xs" :class="task.status === 'done'
                        ? 'text-green-600 dark:text-green-500 opacity-70'
                        : 'text-neutral-400 dark:text-neutral-500'">
                        {{ subtaskCompleteCount ?? 0 }}/{{ subtaskCount }} done
                    </span>
                </div>
            </div>

            <button v-if="task.status !== 'done'" type="button" aria-label="Enter focus mode"
                class="flex-shrink-0 flex items-center justify-center rounded-xl transition-colors bg-purple-100 dark:bg-purple-950 text-purple-500 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900 active:scale-95"
                style="min-width: 44px; min-height: 44px;" @click.stop="enterFocus(task.id)">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="4,2 16,9 4,16" fill="currentColor" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Task } from '~/types'
import { isOverdue, formatDate } from '~/utils/dates'
import { getColorHex } from '~/utils/colors'

const colorHex = computed(() => getColorHex(props.task.color_tag))
const props = defineProps<{
    task: Task
    subtaskCount?: number
    subtaskCompleteCount?: number
}>()

const emit = defineEmits<{
    click: []
    delete: []
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