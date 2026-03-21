<template>
  <div
    data-card
    class="absolute select-none text-base group"
    :class="[
      isFrame
        ? 'rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 bg-stone-50/50 dark:bg-neutral-900/30'
        : isTextCard
          ? 'cursor-default overflow-hidden'
          : item.item_type === 'image'
            ? 'rounded-xl shadow-sm overflow-hidden'
            : item.item_type === 'ellipse'
              ? 'rounded-full shadow-sm border overflow-hidden'
              : 'rounded-xl shadow-sm border overflow-hidden',
      isFrame ? '' : isTextCard ? '' : cardBg,
      isFrame
        ? (selected ? 'ring-2 ring-purple-400 dark:ring-purple-500' : '')
        : selected
          ? (isTextCard
              ? 'ring-1 ring-purple-300 dark:ring-purple-700'
              : 'ring-2 ring-purple-400 dark:ring-purple-500 shadow-md')
          : !isTextCard && item.item_type !== 'image'
            ? 'hover:shadow-md hover:-translate-y-px transition-[shadow,transform] duration-100'
            : '',
      isDragging && !isTextCard && !isFrame ? 'shadow-lg opacity-90 !translate-y-0' : '',
      isDragging && isFrame ? 'opacity-80' : '',
    ]"
    :style="isFrame
      ? { left: `${item.x}px`, top: `${item.y}px`, width: `${item.width ?? 560}px`, height: `${item.height ?? 392}px` }
      : isTextCard
        ? { left: `${item.x}px`, top: `${item.y}px`, minWidth: '140px', maxWidth: '320px' }
        : { left: `${item.x}px`, top: `${item.y}px`, width: `${item.width ?? 200}px`, height: `${item.height ?? 200}px` }"
    @pointerdown.stop="emit('pointerdown', $event)"
    @click.stop="emit('select', $event)"
  >
    <!-- Frame -->
    <template v-if="isFrame">
      <div class="flex flex-col h-full p-3 pointer-events-none">
        <!-- Editable label -->
        <div class="flex items-center gap-1.5 pointer-events-auto" @click.stop>
          <input
            ref="frameLabelRef"
            class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-transparent outline-none border-none w-full min-w-0 truncate cursor-default"
            :class="frameEditing ? 'cursor-text' : 'cursor-default'"
            :readonly="!frameEditing"
            :value="frameLabel"
            @click.stop="onFrameLabelClick"
            @blur="commitFrameLabel"
            @keydown.enter.prevent="(frameLabelRef as HTMLInputElement)?.blur()"
            @input="frameLabel = ($event.target as HTMLInputElement).value"
          />
        </div>
      </div>
      <!-- Delete button -->
      <button
        type="button"
        class="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-colors pointer-events-auto"
        style="font-size: 16px; line-height: 1;"
        :class="selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        @pointerdown.stop
        @click.stop="emit('remove')"
      >×</button>
    </template>

    <!-- Task card -->
    <template v-else-if="item.item_type === 'task' && task">
      <div class="flex h-full">
        <!-- Project colour stripe -->
        <div
          class="w-1.5 flex-shrink-0 rounded-l-xl"
          :style="{ backgroundColor: taskProjects[0] ? (getColorHex(taskProjects[0].color_tag) ?? '#e5e7eb') : '#e5e7eb' }"
        />
        <!-- Content: vertically and horizontally centered -->
        <div class="flex flex-col flex-1 items-center justify-center p-3 text-center overflow-hidden gap-1.5">
          <!-- Project labels -->
          <div v-if="taskProjects.length" class="flex flex-wrap justify-center gap-1">
            <span
              v-for="project in taskProjects"
              :key="project.id"
              class="text-xs px-1.5 py-0.5 rounded-md font-medium"
              :style="{ backgroundColor: hexWithOpacity(project.color_tag), color: getColorHex(project.color_tag) ?? '#6b7280' }"
            >{{ project.name }}</span>
          </div>

          <!-- Status dot + title -->
          <div class="flex items-start justify-center gap-1.5">
            <span
              class="mt-0.5 flex-shrink-0 w-2.5 h-2.5 rounded-full border"
              :class="task.status === 'done'
                ? 'bg-green-400 border-green-400'
                : task.status === 'in_progress'
                  ? 'bg-purple-400 border-purple-400'
                  : 'border-neutral-300 dark:border-neutral-600'"
            />
            <span
              class="text-base font-semibold leading-snug line-clamp-3 text-neutral-800 dark:text-neutral-100"
              :class="task.status === 'done' ? 'line-through opacity-40' : ''"
            >{{ task.title }}</span>
          </div>

          <!-- Meta: due date, children -->
          <div class="flex flex-col items-center gap-0.5">
            <span
              v-if="task.due_date"
              class="text-xs"
              :class="isOverdue(task.due_date) && task.status !== 'done'
                ? 'text-red-500 dark:text-red-400 font-medium'
                : 'text-neutral-400 dark:text-neutral-500'"
            >{{ isOverdue(task.due_date) && task.status !== 'done' ? 'Overdue' : 'Due' }} {{ formatDate(task.due_date) }}</span>
            <span v-if="childCount > 0" class="text-xs text-neutral-400 dark:text-neutral-500">
              {{ childCompleteCount }}/{{ childCount }} done
            </span>
          </div>

          <!-- Open link -->
          <button
            type="button"
            class="text-xs text-neutral-300 dark:text-neutral-700 hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100"
            @click.stop="navigateTo(`/task/${task.id}`)"
          >Open ↗</button>
        </div>
      </div>
    </template>

    <!-- Document card -->
    <template v-else-if="item.item_type === 'document' && document">
      <div class="flex flex-col items-center justify-center p-4 h-full text-center overflow-hidden gap-2">
        <!-- Doc icon -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-neutral-300 dark:text-neutral-600 flex-shrink-0">
          <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>

        <!-- Project tags -->
        <div v-if="docProjects.length" class="flex flex-wrap justify-center gap-1">
          <span
            v-for="project in docProjects"
            :key="project.id"
            class="text-xs px-1.5 py-0.5 rounded-md font-medium"
            :style="{ backgroundColor: hexWithOpacity(project.color_tag), color: getColorHex(project.color_tag) ?? '#6b7280' }"
          >{{ project.name }}</span>
        </div>

        <p class="text-base font-semibold leading-snug line-clamp-3 text-neutral-800 dark:text-neutral-100">{{ document.title || 'Untitled' }}</p>
        <p v-if="docPreview" class="text-neutral-400 dark:text-neutral-500 text-xs line-clamp-2 leading-relaxed">{{ docPreview }}</p>

        <button
          type="button"
          class="text-xs text-neutral-300 dark:text-neutral-700 hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100"
          @click.stop="navigateTo(`/write/${document.id}`)"
        >Open →</button>
      </div>
    </template>

    <!-- Note / freeform text / shape cards — all share a colored container with editable text -->
    <template v-else-if="item.item_type === 'note' || isShape">
      <div class="flex flex-col h-full p-4">
        <textarea
          ref="textareaRef"
          class="flex-1 w-full bg-transparent resize-none leading-relaxed break-words outline-none placeholder:opacity-40 text-center"
          :class="[
            isTextCard
              ? 'text-neutral-700 dark:text-neutral-300 text-lg font-semibold'
              : 'text-neutral-800 dark:text-neutral-900 text-base font-medium',
            editing ? 'cursor-text' : 'cursor-default',
          ]"
          :readonly="!editing"
          :placeholder="isShape ? '' : (editing ? 'Write something…' : (noteText ? '' : (selected ? 'Click to edit' : 'Click to select')))"
          :value="noteText"
          @pointerdown="onNotePointerDown"
          @click.stop="onNoteClick"
          @input="noteText = ($event.target as HTMLTextAreaElement).value"
          @blur="commitNote"
        />

        <!-- Footer: color picker + delete -->
        <div
          class="flex items-center mt-2 transition-opacity"
          :class="[
            isTextCard ? 'justify-end' : 'justify-between',
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          ]"
        >
          <div v-if="!isTextCard" class="flex gap-1">
            <button
              v-for="c in STICKY_COLORS"
              :key="c"
              type="button"
              class="w-3 h-3 rounded-full border transition-transform hover:scale-125"
              :class="[noteColorDot(c), item.note_color === c ? 'ring-1 ring-offset-1 ring-neutral-500' : '']"
              @pointerdown.stop
              @click.stop="emit('change-color', c)"
            />
          </div>
          <button
            type="button"
            class="text-xs text-neutral-400 hover:text-red-400 transition-colors ml-2"
            @pointerdown.stop
            @click.stop="emit('remove')"
          >×</button>
        </div>
      </div>
    </template>

    <!-- Image card -->
    <template v-else-if="item.item_type === 'image' && item.image_url">
      <img
        :src="item.image_url"
        class="w-full h-full object-cover"
        draggable="false"
        alt=""
      />
    </template>

    <!-- Delete button for task/doc/image cards (note/shapes have their own in the footer) -->
    <button
      v-if="item.item_type !== 'note' && !isShape"
      type="button"
      class="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-neutral-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-400 bg-white/70 dark:bg-neutral-900/70 rounded transition-all"
      style="font-size: 16px; line-height: 1;"
      :class="selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
      @pointerdown.stop
      @click.stop="emit('remove')"
    >×</button>
  </div>
</template>

<script setup lang="ts">
import type { CanvasItem, Task, WritingDocument, NoteColor } from '~/types'
import { getColorHex } from '~/utils/colors'
import { isOverdue, formatDate } from '~/utils/dates'
import { useProjectsStore } from '~/stores/projects'
import { useTasksStore } from '~/stores/tasks'

const STICKY_COLORS: NoteColor[] = ['yellow', 'pink', 'green', 'blue', 'purple']

const props = defineProps<{
  item: CanvasItem
  task?: Task
  document?: WritingDocument
  selected: boolean
  isDragging: boolean
}>()

const emit = defineEmits<{
  'pointerdown': [e: PointerEvent]
  'select': [e: MouseEvent]
  'remove': []
  'change-color': [color: NoteColor]
  'update-note': [text: string]
}>()

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

// Frame label state
const frameLabelRef = ref<HTMLInputElement | null>(null)
const frameEditing = ref(false)
const frameLabel = ref(props.item.note_text ?? 'Frame')

watch(() => props.item.note_text, (v) => {
  if (!frameEditing.value) frameLabel.value = v ?? 'Frame'
})

function onFrameLabelClick() {
  if (!frameEditing.value) {
    frameEditing.value = true
    nextTick(() => {
      frameLabelRef.value?.focus()
      frameLabelRef.value?.select()
    })
  }
}

function commitFrameLabel() {
  frameEditing.value = false
  emit('update-note', frameLabel.value || 'Frame')
}

// Note card state
const editing = ref(false)
const noteText = ref(props.item.note_text ?? '')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

watch(() => props.item.note_text, (v) => {
  if (!editing.value) noteText.value = v ?? ''
})

const isFrame = computed(() => props.item.item_type === 'frame')
const isShape = computed(() => props.item.item_type === 'rect' || props.item.item_type === 'ellipse')
const isTextCard = computed(() => props.item.item_type === 'note' && props.item.note_color === 'none')

const taskProjects = computed(() => {
  if (!props.task) return []
  const ids = projectsStore.getProjectIdsForTask(props.task.id)
  return ids.map(id => projectsStore.getProjectById(id)).filter(Boolean) as typeof projectsStore.sortedProjects
})

const docProjects = computed(() => {
  if (!props.document?.task_id) return []
  const ids = projectsStore.getProjectIdsForTask(props.document.task_id)
  return ids.map(id => projectsStore.getProjectById(id)).filter(Boolean) as typeof projectsStore.sortedProjects
})

const childCount = computed(() =>
  props.task ? tasksStore.getChildTasks(props.task.id).length : 0
)
const childCompleteCount = computed(() =>
  props.task ? tasksStore.getChildTasks(props.task.id).filter(t => t.status === 'done').length : 0
)

const docPreview = computed(() => {
  const content = props.document?.content
  if (!content) return ''
  const line = content.split('\n')
    .map(l => l.replace(/^#{1,6}\s+/, '').replace(/[*_`~]/g, '').trim())
    .find(l => l.length > 0 && l.toLowerCase() !== (props.document?.title ?? '').toLowerCase().trim()) ?? ''
  return line.length > 80 ? line.slice(0, 80) + '…' : line
})

const cardBg = computed(() => {
  if (props.item.item_type === 'note') {
    if (props.item.note_color === 'none') return 'bg-transparent border-transparent shadow-none'
    return noteStickyBg(props.item.note_color)
  }
  return 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'
})

function noteStickyBg(color: NoteColor): string {
  const map: Record<NoteColor, string> = {
    yellow: 'bg-yellow-100 border-yellow-200',
    pink:   'bg-pink-100 border-pink-200',
    green:  'bg-green-100 border-green-200',
    blue:   'bg-blue-100 border-blue-200',
    purple: 'bg-purple-100 border-purple-200',
    none:   'bg-transparent border-transparent',
  }
  return map[color]
}

function noteColorDot(color: NoteColor): string {
  const map: Record<NoteColor, string> = {
    yellow: 'bg-yellow-300 border-yellow-400',
    pink:   'bg-pink-300 border-pink-400',
    green:  'bg-green-300 border-green-400',
    blue:   'bg-blue-300 border-blue-400',
    purple: 'bg-purple-300 border-purple-400',
    none:   '',
  }
  return map[color]
}

function hexWithOpacity(colorTag: string | null): string {
  const hex = getColorHex(colorTag as never)
  if (!hex) return '#f5f5f4'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, 0.15)`
}

// Note card interaction
// pointerdown: only stop propagation when editing (to prevent drag while typing)
function onNotePointerDown(e: PointerEvent) {
  if (editing.value) e.stopPropagation()
}

// click: first click selects, second click (when selected) starts editing
function onNoteClick(e: MouseEvent) {
  if (editing.value) return
  if (props.selected) {
    startEditing()
  } else {
    emit('select', e)
  }
}

async function startEditing() {
  editing.value = true
  await nextTick()
  textareaRef.value?.focus()
  // move cursor to end
  const len = textareaRef.value?.value.length ?? 0
  textareaRef.value?.setSelectionRange(len, len)
}

function commitNote() {
  editing.value = false
  emit('update-note', noteText.value)
}
</script>
