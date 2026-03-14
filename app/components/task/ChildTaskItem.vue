<template>
  <div class="flex flex-col gap-1">
    <!-- Task row -->
    <div
      class="flex items-center gap-2 px-3 py-2 rounded-xl border group transition-colors"
      :class="task.status === 'done'
        ? 'bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-900'
        : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700'"
    >
      <button
        type="button"
        :aria-label="task.status === 'done' ? 'Mark incomplete' : 'Mark complete'"
        class="flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors"
        :class="task.status === 'done'
          ? 'bg-green-600 border-green-600'
          : 'border-neutral-300 dark:border-neutral-500'"
        style="min-width: 22px; min-height: 22px; width: 22px; height: 22px;"
        @click="toggleDone"
      >
        <span v-if="task.status === 'done'" class="text-white" style="font-size: 10px;">✓</span>
      </button>

      <div class="flex-1 min-w-0">
        <input
          v-if="isEditing"
          ref="inputRef"
          v-model="editTitle"
          type="text"
          class="w-full text-sm bg-transparent text-neutral-800 dark:text-neutral-100 focus:outline-none"
          @blur="saveEdit"
          @keydown.enter="saveEdit"
          @keydown.escape="cancelEdit"
        />
        <p
          v-else
          class="text-sm truncate cursor-text"
          :class="task.status === 'done'
            ? 'line-through text-neutral-400 dark:text-neutral-500'
            : 'text-neutral-800 dark:text-neutral-100'"
          @click="startEdit"
        >
          {{ task.title }}
        </p>
      </div>

      <!-- Add child button (only if not at max depth) -->
      <button
        v-if="depth < 2"
        type="button"
        aria-label="Add child task"
        class="flex-shrink-0 text-neutral-300 dark:text-neutral-600 hover:text-purple-400 dark:hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100"
        style="min-width: 22px; min-height: 22px; font-size: 16px; line-height: 1;"
        @click="showAddChild = !showAddChild"
      >
        +
      </button>

      <button
        type="button"
        aria-label="Delete task"
        class="flex-shrink-0 text-neutral-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        style="min-width: 22px; min-height: 22px; font-size: 18px; line-height: 1;"
        @click="tasksStore.deleteTask(task.id)"
      >
        ×
      </button>

      <button
        type="button"
        aria-label="Open task"
        class="flex-shrink-0 text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
        style="min-width: 22px; min-height: 22px;"
        @click="navigateTo(`/task/${task.id}`)"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Children (depth 0 → 1, depth 1 → 2, depth 2 → stop) -->
    <div v-if="depth < 2" class="ml-4 flex flex-col gap-1">
      <ChildTaskItem
        v-for="child in children"
        :key="child.id"
        :task="child"
        :depth="depth + 1"
      />

      <Transition name="expand">
        <div v-if="showAddChild" class="flex gap-2 mt-1">
          <input
            ref="childInputRef"
            v-model="newChildTitle"
            type="text"
            placeholder="Add a step…"
            class="flex-1 rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            @keydown.enter="addChild"
            @keydown.escape="showAddChild = false"
          />
          <button
            type="button"
            class="flex items-center justify-center rounded-xl bg-purple-500 active:bg-purple-600 transition-colors flex-shrink-0"
            style="min-width: 36px; min-height: 36px;"
            @click="addChild"
          >
            <span class="text-white text-lg leading-none">+</span>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/types'

const props = defineProps<{
  task: Task
  depth: number
}>()

const tasksStore = useTasksStore()

const children = computed(() => tasksStore.getChildTasks(props.task.id))

// Toggle done
function toggleDone() {
  const next = props.task.status === 'done' ? 'todo' : 'done'
  tasksStore.setTaskStatus(props.task.id, next)
}

// Inline edit
const isEditing = ref(false)
const editTitle = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function startEdit() {
  if (props.task.status === 'done') return
  editTitle.value = props.task.title
  isEditing.value = true
  nextTick(() => inputRef.value?.focus())
}

function saveEdit() {
  const trimmed = editTitle.value.trim()
  if (trimmed && trimmed !== props.task.title) {
    tasksStore.updateTask(props.task.id, { title: trimmed })
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

// Add child task
const showAddChild = ref(false)
const newChildTitle = ref('')
const childInputRef = ref<HTMLInputElement | null>(null)

watch(showAddChild, (val) => {
  if (val) nextTick(() => childInputRef.value?.focus())
})

async function addChild() {
  const title = newChildTitle.value.trim()
  if (!title) return
  await tasksStore.addTask({ title, parent_id: props.task.id })
  newChildTitle.value = ''
  showAddChild.value = false
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.15s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
}
</style>
