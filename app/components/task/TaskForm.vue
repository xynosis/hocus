<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div
          class="relative bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl px-4 pt-3 pb-8 flex flex-col gap-3 w-full sm:max-w-md sm:mx-4"
          style="max-height: 90vh; overflow-y: auto;">
          <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-100">
            {{ isEditMode ? 'Edit task' : props.parentId ? 'New step' : 'New task' }}
          </h2>

          <div class="flex flex-col gap-1">
            <input v-model="form.title" type="text" placeholder="Task title"
              class="w-full rounded-xl border px-3 py-3 text-base bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              @keydown.enter="handleSubmit" />
            <p v-if="showTitleError" class="text-sm text-red-500 px-1">
              A title is needed to save this task.
            </p>
          </div>

          <Transition name="expand">
            <div v-if="isExpanded" class="flex flex-col gap-3">
              <textarea v-model="form.notes" placeholder="Notes (optional)" rows="3"
                class="w-full rounded-xl border px-3 py-3 text-base bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />

              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-xs text-neutral-500 dark:text-neutral-400 px-1">Working on</label>
                  <NaturalDateInput v-model="form.working_on_date" placeholder="e.g. tomorrow" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs text-neutral-500 dark:text-neutral-400 px-1">Due date</label>
                  <NaturalDateInput v-model="form.due_date" placeholder="e.g. next Friday" />
                </div>
              </div>

              <!-- Energy -->
              <div class="flex flex-col gap-2">
                <label class="text-xs text-neutral-500 dark:text-neutral-400 px-1">Energy cost</label>
                <div class="grid grid-cols-3 gap-2">
                  <button v-for="opt in energyOptions" :key="opt.value" type="button"
                    class="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-colors"
                    :class="form.energy === opt.value
                      ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                    style="min-height: 44px;"
                    @click="form.energy = form.energy === opt.value ? null : opt.value">
                    <span>{{ opt.emoji }}</span>
                    <span>{{ opt.label }}</span>
                  </button>
                </div>
              </div>

              <!-- Interest -->
              <div class="flex flex-col gap-2">
                <label class="text-xs text-neutral-500 dark:text-neutral-400 px-1">How do you feel about it?</label>
                <div class="grid grid-cols-3 gap-2">
                  <button v-for="opt in interestOptions" :key="opt.value" type="button"
                    class="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-colors"
                    :class="form.interest === opt.value
                      ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                    style="min-height: 44px;"
                    @click="form.interest = form.interest === opt.value ? null : opt.value">
                    <span>{{ opt.emoji }}</span>
                    <span>{{ opt.label }}</span>
                  </button>
                </div>
              </div>

              <!-- Estimate -->
              <div class="flex flex-col gap-2">
                <label class="text-xs text-neutral-500 dark:text-neutral-400 px-1">Time estimate</label>
                <div class="flex items-center gap-2">
                  <div class="relative flex-1">
                    <input
                      v-model.number="form.estimated_minutes"
                      type="number"
                      min="1"
                      placeholder="Minutes"
                      class="w-full rounded-xl border px-3 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <span v-if="inferredSize"
                    class="flex-shrink-0 text-sm font-semibold px-3 py-2.5 rounded-xl border"
                    :class="inferredSize === 'L' || inferredSize === 'XL'
                      ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                      : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'">
                    {{ inferredSize }}
                  </span>
                </div>
                <p v-if="inferredSize === 'L' || inferredSize === 'XL'"
                  class="text-xs text-amber-600 dark:text-amber-500 px-1">
                  This is a big one — worth breaking into steps?
                </p>
              </div>

              <!-- Recurrence -->
              <div class="flex flex-col gap-2">
                <label class="text-xs text-neutral-500 dark:text-neutral-400 px-1">Repeats</label>
                <div class="flex gap-2">
                  <button
                    v-for="opt in recurrenceOptions"
                    :key="opt.value"
                    type="button"
                    class="flex-1 py-2.5 rounded-xl border text-xs font-medium transition-colors"
                    :class="form.recurrence === opt.value
                      ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                    style="min-height: 44px;"
                    @click="form.recurrence = form.recurrence === opt.value ? null : opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>

          <div v-if="projects.length > 0" class="flex flex-col gap-2">
            <label class="text-xs text-neutral-500 dark:text-neutral-400 px-1">Projects</label>
            <div class="flex flex-col gap-1">
              <button v-for="project in projects" :key="project.id" type="button"
                class="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors text-left"
                :class="selectedProjectIds.includes(project.id)
                  ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'" style="min-height: 44px;" @click="toggleProject(project.id)">
                <span class="flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
                  :class="selectedProjectIds.includes(project.id)
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-neutral-300 dark:border-neutral-600'">
                  <span v-if="selectedProjectIds.includes(project.id)" class="text-white"
                    style="font-size: 9px;">✓</span>
                </span>
                {{ project.name }}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <ColorTag v-model="form.color_tag" />
            <button type="button"
              class="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-600 rounded-full px-3 py-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              @click="isExpanded = !isExpanded">
              <span>{{ isExpanded ? 'Less' : 'More' }}</span>
              <span>{{ isExpanded ? '↑' : '↓' }}</span>
            </button>
          </div>

          <button type="button" class="w-full rounded-xl py-3 text-base font-medium transition-opacity" :class="form.title.trim()
            ? 'bg-purple-500 text-white active:opacity-80'
            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'" @click="handleSubmit">
            Save task
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Task, TaskColor, TaskEnergy, TaskInterest, TaskRecurrence } from '~/types'
import type { CreateTaskPayload, UpdateTaskPayload } from '~/stores/tasks'
import { useProjectsStore } from '~/stores/projects'
import { inferTaskSize } from '~/utils/taskSize'
import NaturalDateInput from '~/components/ui/NaturalDateInput.vue'

const props = defineProps<{
  modelValue: boolean
  task?: Task
  preselectedProjectId?: string
  parentId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [payload: CreateTaskPayload | UpdateTaskPayload, projectIds: string[]]
}>()

const projectsStore = useProjectsStore()
const projects = computed(() => projectsStore.sortedProjects)

const isEditMode = computed(() => !!props.task)
const isExpanded = ref(isEditMode.value)
const showTitleError = ref(false)
const selectedProjectIds = ref<string[]>([])

const energyOptions: { value: TaskEnergy; label: string; emoji: string }[] = [
  { value: 'easy', label: 'Easy', emoji: '🌱' },
  { value: 'moderate', label: 'Moderate', emoji: '⚡' },
  { value: 'heavy', label: 'Heavy', emoji: '🔥' },
]

const interestOptions: { value: TaskInterest; label: string; emoji: string }[] = [
  { value: 'dreading', label: 'Dreading', emoji: '😬' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'want_to', label: 'Want to', emoji: '✨' },
]

const recurrenceOptions: { value: TaskRecurrence; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const emptyForm = () => ({
  title: '',
  notes: null as string | null,
  color_tag: null as TaskColor | null,
  working_on_date: null as string | null,
  due_date: null as string | null,
  energy: null as TaskEnergy | null,
  interest: null as TaskInterest | null,
  estimated_minutes: null as number | null,
  recurrence: null as TaskRecurrence | null,
})

const form = reactive(emptyForm())

const inferredSize = computed(() => inferTaskSize(form.estimated_minutes))

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.task) {
        form.title = props.task.title
        form.notes = props.task.notes
        form.color_tag = props.task.color_tag
        form.working_on_date = props.task.working_on_date
        form.due_date = props.task.due_date
        form.energy = props.task.energy
        form.interest = props.task.interest
        form.estimated_minutes = props.task.estimated_minutes
        form.recurrence = props.task.recurrence
        isExpanded.value = true
        selectedProjectIds.value = projectsStore.getProjectIdsForTask(props.task.id)
      } else {
        Object.assign(form, emptyForm())
        isExpanded.value = false
        selectedProjectIds.value = props.preselectedProjectId
          ? [props.preselectedProjectId]
          : []
      }
      showTitleError.value = false
    }
  }
)

function toggleProject(projectId: string) {
  const index = selectedProjectIds.value.indexOf(projectId)
  if (index === -1) {
    selectedProjectIds.value.push(projectId)
  } else {
    selectedProjectIds.value.splice(index, 1)
  }
}

function close() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!form.title.trim()) {
    showTitleError.value = true
    return
  }
  emit('submit', {
    title: form.title.trim(),
    notes: form.notes || null,
    color_tag: form.color_tag,
    working_on_date: form.working_on_date || null,
    due_date: form.due_date || null,
    energy: form.energy,
    interest: form.interest,
    estimated_minutes: form.estimated_minutes || null,
    recurrence: form.recurrence,
    ...(props.parentId ? { parent_id: props.parentId } : {}),
  }, selectedProjectIds.value)
  close()
}
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}

.sheet-enter-active .relative,
.sheet-leave-active .relative {
  transition: transform 0.25s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .relative,
.sheet-leave-to .relative {
  transform: translateY(100%);
}

.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
}
</style>
