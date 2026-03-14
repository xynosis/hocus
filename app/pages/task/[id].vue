<template>
  <div class="p-4 flex flex-col gap-4">
    <div v-if="!task" class="flex flex-col items-center justify-center py-20 gap-2">
      <p class="text-neutral-400 dark:text-neutral-500 text-base">Task not found.</p>
      <button type="button" class="text-purple-500 text-sm mt-2" @click="navigateTo('/')">
        Go home
      </button>
    </div>

    <template v-else>
      <div class="flex items-center gap-3 px-1">
        <button type="button"
          class="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          style="min-width: 44px; min-height: 44px; display: flex; align-items: center;" @click="router.back()">
          ← Back
        </button>
      </div>

      <div class="rounded-2xl p-5 border" :class="task.status === 'done'
        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
        : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'" :style="{
          borderLeftWidth: '4px',
          borderLeftColor: task.status === 'done'
            ? '#639922'
            : (colorHex ?? 'transparent'),
        }">
        <div class="flex items-start justify-between gap-3 mb-3">
          <h1 class="text-xl font-semibold leading-snug" :class="task.status === 'done'
            ? 'line-through text-green-700 dark:text-green-400'
            : 'text-neutral-800 dark:text-neutral-100'">
            {{ task.title }}
          </h1>
          <span class="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0" :class="{
            'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400': task.status === 'todo',
            'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300': task.status === 'in_progress',
            'bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300': task.status === 'orbit',
            'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300': task.status === 'done',
          }">
            {{ statusLabel }}
          </span>
        </div>

        <p v-if="task.notes" class="text-sm text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
          {{ task.notes }}
        </p>

        <div class="flex flex-wrap gap-x-4 gap-y-1">
          <span v-if="task.working_on_date" class="text-xs text-neutral-400 dark:text-neutral-500">
            Working on {{ formatDate(task.working_on_date) }}
          </span>
          <span v-if="task.due_date" class="text-xs" :class="task.status !== 'done' && isOverdue(task.due_date)
            ? 'text-red-500 dark:text-red-400 font-medium'
            : 'text-neutral-400 dark:text-neutral-500'">
            Due {{ formatDate(task.due_date) }}
          </span>
          <span v-if="task.estimated_minutes" class="text-xs text-neutral-400 dark:text-neutral-500">
            ~{{ task.estimated_minutes }}m&nbsp;·&nbsp;{{ inferTaskSize(task.estimated_minutes) }}
          </span>
          <span v-if="task.recurrence" class="text-xs text-neutral-400 dark:text-neutral-500">
            ↻ Repeats {{ task.recurrence }}
          </span>
        </div>
      </div>

      <div class="flex gap-3 px-1">
        <button type="button"
          class="flex-1 py-3 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          style="min-height: 44px;" @click="isEditSheetOpen = true">
          Edit
        </button>

        <button v-if="task.status !== 'done'" type="button"
          class="flex-1 py-3 rounded-xl text-sm font-medium bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors"
          style="min-height: 44px;" @click="enterFocus(task.id)">
          Focus
        </button>

        <button type="button"
          class="flex-1 py-3 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          style="min-height: 44px;" @click="showDeleteModal = true">
          Delete
        </button>
      </div>

      <!-- Start fresh (linked pattern) -->
      <div v-if="task.status === 'done' && task.pattern_id" class="px-1">
        <button
          type="button"
          class="w-full py-3 rounded-xl text-sm font-medium border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
          style="min-height: 44px;"
          @click="startFresh"
        >
          Start a fresh one
        </button>
      </div>

      <!-- Orbit status actions -->
      <div v-if="task.status === 'orbit' || task.status === 'in_progress'" class="flex gap-3 px-1">
        <button
          v-if="task.status === 'orbit'"
          type="button"
          class="flex-1 py-3 rounded-xl text-sm font-medium border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors"
          style="min-height: 44px;"
          @click="tasksStore.setTaskStatus(task.id, 'in_progress')"
        >
          Resume
        </button>
        <button
          v-if="task.status === 'in_progress'"
          type="button"
          class="flex-1 py-3 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          style="min-height: 44px;"
          @click="tasksStore.setTaskStatus(task.id, 'orbit')"
        >
          Set to quiet
        </button>
      </div>

      <!-- Dependencies -->
      <div class="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex flex-col gap-3">
        <div class="flex items-center justify-between px-1">
          <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-100">Blocked by</h2>
          <button
            type="button"
            class="text-xs text-neutral-400 dark:text-neutral-500 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
            style="min-height: 32px;"
            @click="showBlockerSearch = !showBlockerSearch"
          >
            + Add
          </button>
        </div>

        <div v-if="blockers.length === 0 && !showBlockerSearch" class="px-1">
          <p class="text-sm text-neutral-400 dark:text-neutral-500">No blockers.</p>
        </div>

        <div v-if="blockers.length > 0" class="flex flex-col gap-2">
          <div
            v-for="blocker in blockers"
            :key="blocker.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
            :class="blocker.status === 'done'
              ? 'bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-900'
              : 'bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900'"
          >
            <span
              class="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white"
              :class="blocker.status === 'done' ? 'bg-green-600' : 'bg-amber-400'"
              style="font-size: 9px;"
            >{{ blocker.status === 'done' ? '✓' : '!' }}</span>
            <span
              class="flex-1 text-sm truncate"
              :class="blocker.status === 'done'
                ? 'text-green-700 dark:text-green-300 line-through'
                : 'text-amber-700 dark:text-amber-300'"
            >{{ blocker.title }}</span>
            <button
              type="button"
              class="flex-shrink-0 text-neutral-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-500 transition-colors"
              style="min-width: 32px; min-height: 32px; font-size: 16px;"
              @click="dependenciesStore.removeDependency(task.id, blocker.id)"
            >×</button>
          </div>
        </div>

        <Transition name="expand">
          <div v-if="showBlockerSearch" class="flex flex-col gap-2">
            <input
              v-model="blockerSearch"
              type="text"
              placeholder="Search tasks…"
              class="w-full rounded-xl border px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <div v-if="blockerResults.length > 0" class="flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <button
                v-for="result in blockerResults"
                :key="result.id"
                type="button"
                class="text-left px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                style="min-height: 44px;"
                @click="addBlocker(result.id)"
              >{{ result.title }}</button>
            </div>
          </div>
        </Transition>
      </div>

      <div class="border-t border-neutral-100 dark:border-neutral-800 pt-4">
        <TaskBreakdown :task-id="task.id" />
      </div>

      <!-- Progress notes -->
      <div class="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex flex-col gap-3">
        <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-100 px-1">Progress log</h2>

        <div class="flex gap-2">
          <textarea
            v-model="newNote"
            placeholder="Add a note…"
            rows="2"
            class="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            @keydown.meta.enter="submitNote"
            @keydown.ctrl.enter="submitNote"
          />
          <button
            type="button"
            class="self-end px-4 py-2 rounded-xl text-sm font-medium bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors disabled:opacity-40"
            style="min-height: 44px;"
            :disabled="!newNote.trim()"
            @click="submitNote"
          >
            Add
          </button>
        </div>

        <div v-if="taskNotes.length === 0" class="px-1">
          <p class="text-sm text-neutral-400 dark:text-neutral-500">No notes yet.</p>
        </div>

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="note in taskNotes"
            :key="note.id"
            class="group flex items-start gap-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2.5"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{{ note.body }}</p>
              <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{{ formatNoteDate(note.created_at) }}</p>
            </div>
            <button
              type="button"
              class="flex-shrink-0 text-neutral-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              style="min-width: 32px; min-height: 32px; font-size: 16px; display: flex; align-items: center; justify-content: center;"
              @click="taskNotesStore.deleteNote(note.id)"
            >×</button>
          </div>
        </div>
      </div>
    </template>

    <TaskForm v-if="task" v-model="isEditSheetOpen" :task="task" @submit="onEditSubmit" />
    <BaseModal v-model="showDeleteModal" title="Delete task?" confirm-label="Delete" @confirm="onDelete">
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        This will permanently remove the task. This can't be undone.
      </p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import type { UpdateTaskPayload } from '~/stores/tasks'
import TaskForm from '~/components/task/TaskForm.vue'
import TaskBreakdown from '~/components/task/TaskBreakdown.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { isOverdue, formatDate } from '~/utils/dates'
import { useProjectsStore } from '~/stores/projects'
import { usePatternsStore } from '~/stores/patterns'
import { useDependenciesStore } from '~/stores/dependencies'
import { useTaskNotesStore } from '~/stores/taskNotes'
const projectsStore = useProjectsStore()
const patternsStore = usePatternsStore()
const dependenciesStore = useDependenciesStore()

async function onEditSubmit(payload: UpdateTaskPayload, projectIds: string[]) {
  tasksStore.updateTask(route.params.id as string, payload)
  await projectsStore.syncTaskProjects(route.params.id as string, projectIds)
}

const router = useRouter()
const route = useRoute()
const tasksStore = useTasksStore()
const { enterFocus } = useFocus()

const task = computed(() => tasksStore.getTaskById(route.params.id as string))

import { getColorHex } from '~/utils/colors'
import { inferTaskSize } from '~/utils/taskSize'

const colorHex = computed(() => getColorHex(task.value?.color_tag ?? null))

const statusLabel = computed(() => {
  switch (task.value?.status) {
    case 'in_progress': return 'In progress'
    case 'orbit': return 'Quiet'
    case 'done': return 'Done'
    default: return 'To do'
  }
})

const isEditSheetOpen = ref(false)
const showDeleteModal = ref(false)

function onDelete() {
  tasksStore.deleteTask(route.params.id as string)
  navigateTo('/projects')
}

async function startFresh() {
  if (!task.value?.pattern_id) return
  const pattern = patternsStore.patterns.find(p => p.id === task.value!.pattern_id)
  const newTask = await tasksStore.addTask({
    title: task.value.title,
    notes: task.value.notes,
    color_tag: task.value.color_tag,
    pattern_id: task.value.pattern_id,
  })
  if (newTask && pattern) {
    await Promise.all(pattern.steps.map(title =>
      tasksStore.addTask({ title, parent_id: newTask.id })
    ))
  }
  if (newTask) navigateTo(`/task/${newTask.id}`)
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/projects')
  }
}

// Dependencies
const showBlockerSearch = ref(false)
const blockerSearch = ref('')

const blockers = computed(() => {
  if (!task.value) return []
  return dependenciesStore.getBlockerIds(task.value.id)
    .map(id => tasksStore.getTaskById(id))
    .filter((t): t is NonNullable<typeof t> => !!t)
})

const blockerResults = computed(() => {
  const q = blockerSearch.value.trim().toLowerCase()
  if (!q || !task.value) return []
  const existingIds = new Set(dependenciesStore.getBlockerIds(task.value.id))
  return tasksStore.tasks
    .filter(t =>
      t.id !== task.value!.id &&
      t.parent_id === null &&
      t.status !== 'done' &&
      !existingIds.has(t.id) &&
      t.title.toLowerCase().includes(q)
    )
    .slice(0, 6)
})

async function addBlocker(dependsOnId: string) {
  if (!task.value) return
  await dependenciesStore.addDependency(task.value.id, dependsOnId)
  blockerSearch.value = ''
  showBlockerSearch.value = false
}

// Progress notes
const taskNotesStore = useTaskNotesStore()
const taskNotes = computed(() => taskNotesStore.getNotesForTask(route.params.id as string))
const newNote = ref('')

async function submitNote() {
  const body = newNote.value.trim()
  if (!body) return
  newNote.value = ''
  await taskNotesStore.addNote(route.params.id as string, body)
}

function formatNoteDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}
</script>