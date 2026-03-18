<template>
  <div
    data-card
    class="absolute select-none text-sm group"
    :class="[
      isTextCard ? 'cursor-grab' : 'rounded-xl shadow-sm border cursor-grab transition-shadow',
      cardBg,
      selected
        ? 'ring-2 ring-purple-400 dark:ring-purple-500 shadow-md'
        : isTextCard ? '' : 'hover:shadow-md',
      isDragging ? 'cursor-grabbing shadow-lg' : '',
    ]"
    :style="{ left: `${item.x}px`, top: `${item.y}px`, width: '220px' }"
    @pointerdown.stop="emit('pointerdown', $event)"
    @click.stop="emit('select', $event)"
  >
    <!-- Task card -->
    <template v-if="item.item_type === 'task' && task">
      <div class="p-4">
        <!-- Project labels at top -->
        <div v-if="taskProjects.length" class="flex flex-wrap gap-1 mb-2.5">
          <span
            v-for="project in taskProjects"
            :key="project.id"
            class="text-xs px-2 py-0.5 rounded-md font-medium"
            :style="{ backgroundColor: hexWithOpacity(project.color_tag), color: getColorHex(project.color_tag) ?? '#6b7280' }"
          >{{ project.name }}</span>
        </div>

        <div class="flex items-start gap-2">
          <span
            class="mt-0.5 flex-shrink-0 w-3 h-3 rounded-full border"
            :class="task.status === 'done'
              ? 'bg-green-400 border-green-400'
              : task.status === 'in_progress'
                ? 'bg-purple-400 border-purple-400'
                : 'border-neutral-300 dark:border-neutral-600'"
          />
          <span
            class="text-neutral-800 dark:text-neutral-100 font-medium leading-snug line-clamp-3 flex-1"
            :class="task.status === 'done' ? 'line-through opacity-40' : ''"
          >{{ task.title }}</span>
        </div>

        <div class="flex items-center justify-end mt-3">
          <button
            type="button"
            class="text-xs text-neutral-300 dark:text-neutral-700 hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100"
            @click.stop="navigateTo(`/task/${task.id}`)"
          >Open task ↗</button>
        </div>
      </div>
    </template>

    <!-- Document card -->
    <template v-else-if="item.item_type === 'document' && document">
      <div class="p-4">
        <!-- Project labels at top -->
        <div v-if="docProjects.length" class="flex flex-wrap gap-1 mb-2.5">
          <span
            v-for="project in docProjects"
            :key="project.id"
            class="text-xs px-2 py-0.5 rounded-md font-medium"
            :style="{ backgroundColor: hexWithOpacity(project.color_tag), color: getColorHex(project.color_tag) ?? '#6b7280' }"
          >{{ project.name }}</span>
        </div>

        <p class="text-neutral-800 dark:text-neutral-100 font-medium leading-snug line-clamp-2">{{ document.title || 'Untitled' }}</p>
        <p v-if="docPreview" class="text-neutral-400 dark:text-neutral-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">{{ docPreview }}</p>
        <div class="flex items-center justify-end mt-3">
          <button
            type="button"
            class="text-xs text-neutral-300 dark:text-neutral-700 hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100"
            @click.stop="navigateTo(`/write/${document.id}`)"
          >Open doc →</button>
        </div>
      </div>
    </template>

    <!-- Note / freeform text card -->
    <template v-else-if="item.item_type === 'note'">
      <div class="p-4">
        <textarea
          v-if="editing"
          ref="textareaRef"
          class="w-full bg-transparent outline-none resize-none leading-relaxed placeholder:text-neutral-400"
          :class="isTextCard
            ? 'text-neutral-700 dark:text-neutral-300 text-base font-medium'
            : 'text-neutral-800 dark:text-neutral-900 text-sm'"
          rows="4"
          placeholder="Write something…"
          :value="noteText"
          @input="noteText = ($event.target as HTMLTextAreaElement).value"
          @blur="commitNote"
          @pointerdown.stop
          @click.stop
        />
        <p
          v-else
          class="leading-relaxed min-h-[4rem] whitespace-pre-wrap break-words"
          :class="[
            isTextCard
              ? 'text-neutral-700 dark:text-neutral-300 text-base font-medium'
              : 'text-neutral-800 dark:text-neutral-900 text-sm',
            noteText ? '' : 'opacity-40',
            selected ? 'cursor-text' : '',
          ]"
          @click.stop="onNoteBodyClick($event)"
        >{{ noteText || (selected ? 'Click to edit' : 'Click to select') }}</p>

        <!-- Footer: color picker (sticky only) + delete -->
        <div
          class="flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
          :class="isTextCard ? 'justify-end' : 'justify-between'"
        >
          <div v-if="!isTextCard" class="flex gap-1">
            <button
              v-for="c in STICKY_COLORS"
              :key="c"
              type="button"
              class="w-3 h-3 rounded-full border transition-transform hover:scale-125"
              :class="[noteColorDot(c), item.note_color === c ? 'ring-1 ring-offset-1 ring-neutral-500' : '']"
              @click.stop="emit('change-color', c)"
            />
          </div>
          <button
            type="button"
            class="text-xs text-neutral-400 hover:text-red-400 transition-colors ml-2"
            @click.stop="emit('remove')"
          >×</button>
        </div>
      </div>
    </template>

    <!-- Delete button for task/doc cards (shown on group-hover) -->
    <button
      v-if="item.item_type !== 'note'"
      type="button"
      class="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-neutral-300 dark:text-neutral-700 hover:text-red-400 dark:hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 rounded"
      style="font-size: 16px; line-height: 1;"
      @click.stop="emit('remove')"
    >×</button>
  </div>
</template>

<script setup lang="ts">
import type { CanvasItem, Task, WritingDocument, NoteColor } from '~/types'
import { getColorHex } from '~/utils/colors'
import { useProjectsStore } from '~/stores/projects'

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

const editing = ref(false)
const noteText = ref(props.item.note_text ?? '')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

watch(() => props.item.note_text, (v) => { noteText.value = v ?? '' })

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

const docPreview = computed(() => {
  const content = props.document?.content
  if (!content) return ''
  const line = content.split('\n')
    .map(l => l.replace(/^#{1,6}\s+/, '').replace(/[*_`~]/g, '').trim())
    .find(l => l.length > 0 && l.toLowerCase() !== (props.document?.title ?? '').toLowerCase().trim()) ?? ''
  return line.length > 70 ? line.slice(0, 70) + '…' : line
})

const cardBg = computed(() => {
  if (props.item.item_type === 'note') {
    if (props.item.note_color === 'none') {
      return 'bg-transparent border-transparent shadow-none'
    }
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

function onNoteBodyClick(e: MouseEvent) {
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
}

function commitNote() {
  editing.value = false
  emit('update-note', noteText.value)
}
</script>
