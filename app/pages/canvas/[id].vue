<template>
  <!-- Floating toolbar -->
  <div class="fixed top-0 inset-x-0 z-20 flex items-center gap-3 px-4 h-12 bg-stone-50/90 dark:bg-neutral-950/90 backdrop-blur border-b border-neutral-100 dark:border-neutral-800">
    <!-- Back -->
    <button
      type="button"
      class="flex items-center gap-1.5 text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors flex-shrink-0"
      @click="navigateTo('/canvas')"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Boards
    </button>

    <span class="text-neutral-200 dark:text-neutral-800">|</span>

    <!-- Board title -->
    <input
      v-model="boardTitle"
      type="text"
      class="text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-transparent border-none outline-none placeholder:text-neutral-400 min-w-0 flex-1"
      placeholder="Untitled board"
      @blur="saveTitle"
      @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
    />

    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- Zoom controls -->
      <button type="button" class="text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" @click="adjustZoom(1 / 1.2)">−</button>
      <button type="button" class="text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors tabular-nums w-10 text-center" @click="resetView">{{ Math.round(zoom * 100) }}%</button>
      <button type="button" class="text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" @click="adjustZoom(1.2)">+</button>

      <span class="text-neutral-200 dark:text-neutral-800">|</span>

      <!-- Add button -->
      <button
        type="button"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium transition-colors"
        @click="showAddPanel = !showAddPanel"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        </svg>
        Add
      </button>
    </div>
  </div>

  <!-- Canvas container -->
  <div
    ref="canvasRef"
    class="fixed inset-0 top-12 overflow-hidden touch-none"
    :class="isPanning ? 'cursor-grabbing' : 'cursor-default'"
    :style="gridStyle"
    @pointerdown="onCanvasPointerDown"
    @pointermove="onCanvasPointerMove"
    @pointerup="onCanvasPointerUp"
    @pointercancel="onCanvasPointerUp"
  >
    <!-- World transform layer -->
    <div
      :style="{
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        transformOrigin: '0 0',
        position: 'absolute',
        top: 0,
        left: 0,
      }"
    >
      <CanvasCard
        v-for="item in boardItems"
        :key="item.id"
        :item="item"
        :task="item.task_id ? tasksStore.getTaskById(item.task_id) ?? undefined : undefined"
        :document="item.document_id ? documentsStore.getById(item.document_id) ?? undefined : undefined"
        :selected="selectedIds.has(item.id)"
        :is-dragging="!!dragState && dragState.itemStartPositions.has(item.id)"
        @pointerdown="onCardPointerDown($event, item.id)"
        @select="onCardSelect($event, item.id)"
        @remove="canvasItemsStore.remove(item.id)"
        @update-note="canvasItemsStore.updateNote(item.id, $event)"
        @change-color="canvasItemsStore.updateColor(item.id, $event)"
      />
    </div>

    <!-- Empty state -->
    <div v-if="loaded && boardItems.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="text-center">
        <p class="text-neutral-300 dark:text-neutral-700 text-sm">Click <strong class="font-medium">Add</strong> to place tasks, documents, or notes</p>
      </div>
    </div>
  </div>

  <!-- Add panel -->
  <Transition name="slide-right">
    <div
      v-if="showAddPanel"
      class="fixed right-0 top-12 bottom-0 z-20 w-72 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col shadow-xl"
    >
      <!-- Panel header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Add to board</span>
        <button type="button" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" @click="showAddPanel = false">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-neutral-100 dark:border-neutral-800">
        <button
          v-for="tab in (['note', 'task', 'document'] as const)"
          :key="tab"
          type="button"
          class="flex-1 py-2 text-xs font-medium capitalize transition-colors"
          :class="activeTab === tab
            ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-500 dark:border-purple-400'
            : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'"
          @click="activeTab = tab"
        >{{ tab === 'document' ? 'Docs' : tab === 'task' ? 'Tasks' : 'Note' }}</button>
      </div>

      <!-- Note tab -->
      <div v-if="activeTab === 'note'" class="p-4 flex flex-col gap-4">
        <!-- Freeform text -->
        <div>
          <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Freeform text</p>
          <button
            type="button"
            class="w-full py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-400 hover:border-purple-400 hover:text-purple-500 transition-colors font-medium"
            @click="addText"
          >
            <span class="font-serif italic mr-1">T</span> Add text
          </button>
        </div>

        <!-- Sticky notes -->
        <div>
          <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Sticky note</p>
          <div class="flex gap-2 flex-wrap mb-3">
            <button
              v-for="c in STICKY_COLORS"
              :key="c"
              type="button"
              class="px-3 py-2 rounded-lg text-xs font-medium border transition-all hover:scale-105"
              :class="[noteBtnBg(c), selectedNoteColor === c ? 'ring-2 ring-purple-400' : '']"
              @click="selectedNoteColor = c"
            >{{ c }}</button>
          </div>
          <button
            type="button"
            class="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors"
            @click="addNote"
          >Add sticky</button>
        </div>
      </div>

      <!-- Tasks tab -->
      <div v-else-if="activeTab === 'task'" class="flex flex-col flex-1 min-h-0">
        <div class="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
          <input
            v-model="search"
            type="text"
            placeholder="Search tasks…"
            class="w-full text-sm bg-transparent outline-none text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400"
          />
        </div>
        <div class="flex-1 overflow-y-auto">
          <button
            v-for="task in filteredTasks"
            :key="task.id"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-50 dark:border-neutral-800/50"
            @click="addTask(task.id)"
          >
            <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: taskStatusColor(task.status) }" />
            <span class="text-sm text-neutral-700 dark:text-neutral-300 truncate flex-1">{{ task.title }}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="text-neutral-300 dark:text-neutral-700 flex-shrink-0"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <p v-if="filteredTasks.length === 0" class="px-4 py-6 text-xs text-neutral-400 dark:text-neutral-600 text-center">
            {{ search ? 'No matching tasks' : 'All tasks are on the board' }}
          </p>
        </div>
      </div>

      <!-- Documents tab -->
      <div v-else-if="activeTab === 'document'" class="flex flex-col flex-1 min-h-0">
        <div class="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
          <input
            v-model="search"
            type="text"
            placeholder="Search documents…"
            class="w-full text-sm bg-transparent outline-none text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400"
          />
        </div>
        <div class="flex-1 overflow-y-auto">
          <button
            v-for="doc in filteredDocs"
            :key="doc.id"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-50 dark:border-neutral-800/50"
            @click="addDocument(doc.id)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="text-neutral-400 flex-shrink-0"><rect x="2" y="1" width="10" height="12" rx="1" stroke="currentColor" stroke-width="1.25"/><path d="M4 5h6M4 7.5h6M4 10h4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>
            <span class="text-sm text-neutral-700 dark:text-neutral-300 truncate flex-1">{{ doc.title || 'Untitled' }}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="text-neutral-300 dark:text-neutral-700 flex-shrink-0"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <p v-if="filteredDocs.length === 0" class="px-4 py-6 text-xs text-neutral-400 dark:text-neutral-600 text-center">
            {{ search ? 'No matching documents' : 'All documents are on the board' }}
          </p>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Click-outside overlay for add panel -->
  <div v-if="showAddPanel" class="fixed inset-0 z-10" @click="showAddPanel = false" />
</template>

<script setup lang="ts">
import { useBoardsStore } from '~/features/canvas/stores/boards'
import { useCanvasItemsStore } from '~/features/canvas/stores/canvas-items'
import { useTasksStore } from '~/stores/tasks'
import { useDocumentsStore } from '~/features/write/stores/documents'
import CanvasCard from '~/features/canvas/components/CanvasCard.vue'
import type { NoteColor, TaskStatus } from '~/types'

definePageMeta({ layout: 'canvas' })

const STICKY_COLORS: NoteColor[] = ['yellow', 'pink', 'green', 'blue', 'purple']

const route = useRoute()
const boardsStore = useBoardsStore()
const canvasItemsStore = useCanvasItemsStore()
const tasksStore = useTasksStore()
const documentsStore = useDocumentsStore()

const boardId = computed(() => route.params.id as string)
const loaded = ref(false)
const boardTitle = ref('')
const showAddPanel = ref(false)
const activeTab = ref<'note' | 'task' | 'document'>('note')
const search = ref('')
const selectedNoteColor = ref<NoteColor>('yellow')

// Pan / zoom state
const panX = ref(0)
const panY = ref(0)
const zoom = ref(1)
const canvasRef = ref<HTMLElement | null>(null)
const isPanning = ref(false)

// Drag state
type DragState = {
  itemId: string
  startPointerX: number
  startPointerY: number
  itemStartPositions: Map<string, { x: number; y: number }>
  pointerId: number
}
let dragState: DragState | null = null

// Pan state
type PanState = { startPointerX: number; startPointerY: number; startPanX: number; startPanY: number }
let panState: PanState | null = null

// Multi-select
const selectedIds = ref(new Set<string>())

const boardItems = computed(() => canvasItemsStore.getForBoard(boardId.value))

const gridStyle = computed(() => ({
  backgroundImage: 'radial-gradient(circle, #d4d4d4 1px, transparent 1px)',
  backgroundSize: `${28 * zoom.value}px ${28 * zoom.value}px`,
  backgroundPosition: `${panX.value}px ${panY.value}px`,
}))

onMounted(async () => {
  await Promise.all([
    boardsStore.fetchAll(),
    canvasItemsStore.fetchForBoard(boardId.value),
    tasksStore.fetchTasks(),
    documentsStore.fetchAll(),
  ])
  const board = boardsStore.getById(boardId.value)
  if (board) boardTitle.value = board.title
  loaded.value = true

  // Attach wheel listener with passive:false so we can preventDefault
  canvasRef.value?.addEventListener('wheel', onWheel, { passive: false })
})

onUnmounted(() => {
  canvasRef.value?.removeEventListener('wheel', onWheel)
})

// ── Wheel zoom ──────────────────────────────────────────────────────────────
function onWheel(e: WheelEvent) {
  e.preventDefault()
  const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
  applyZoom(factor, e.clientX, e.clientY)
}

function applyZoom(factor: number, cx: number, cy: number) {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  const localX = cx - rect.left
  const localY = cy - rect.top
  const newZoom = Math.max(0.15, Math.min(4, zoom.value * factor))
  panX.value = localX - (localX - panX.value) * (newZoom / zoom.value)
  panY.value = localY - (localY - panY.value) * (newZoom / zoom.value)
  zoom.value = newZoom
}

function adjustZoom(factor: number) {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  applyZoom(factor, rect.left + rect.width / 2, rect.top + rect.height / 2)
}

function resetView() {
  panX.value = 0
  panY.value = 0
  zoom.value = 1
}

// ── Pointer events on canvas background ──────────────────────────────────────
function onCanvasPointerDown(e: PointerEvent) {
  if ((e.target as HTMLElement).closest('[data-card]')) return
  selectedIds.value = new Set()
  panState = {
    startPointerX: e.clientX,
    startPointerY: e.clientY,
    startPanX: panX.value,
    startPanY: panY.value,
  }
  isPanning.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onCanvasPointerMove(e: PointerEvent) {
  if (dragState) {
    const dx = (e.clientX - dragState.startPointerX) / zoom.value
    const dy = (e.clientY - dragState.startPointerY) / zoom.value
    for (const [id, start] of dragState.itemStartPositions) {
      canvasItemsStore.moveLocal(id, start.x + dx, start.y + dy)
    }
    return
  }
  if (panState) {
    panX.value = panState.startPanX + (e.clientX - panState.startPointerX)
    panY.value = panState.startPanY + (e.clientY - panState.startPointerY)
  }
}

function onCanvasPointerUp(_e: PointerEvent) {
  if (dragState) {
    for (const id of dragState.itemStartPositions.keys()) {
      const item = canvasItemsStore.getById(id)
      if (item) canvasItemsStore.updatePosition(id, item.x, item.y)
    }
    dragState = null
  }
  panState = null
  isPanning.value = false
}

// ── Pointer events on cards ──────────────────────────────────────────────────
function onCardPointerDown(e: PointerEvent, itemId: string) {
  // Ensure this card is in selection
  if (!selectedIds.value.has(itemId)) {
    selectedIds.value = new Set([itemId])
  }

  const ids = [...selectedIds.value]
  const startPositions = new Map(
    ids.map(id => {
      const item = canvasItemsStore.getById(id)
      return [id, { x: item?.x ?? 0, y: item?.y ?? 0 }]
    })
  )

  dragState = {
    itemId,
    startPointerX: e.clientX,
    startPointerY: e.clientY,
    itemStartPositions: startPositions,
    pointerId: e.pointerId,
  }
  // Capture on the canvas so we keep receiving move/up
  canvasRef.value?.setPointerCapture(e.pointerId)
}

function onCardSelect(e: MouseEvent, itemId: string) {
  if (e.shiftKey) {
    const next = new Set(selectedIds.value)
    if (next.has(itemId)) next.delete(itemId)
    else next.add(itemId)
    selectedIds.value = next
  } else {
    selectedIds.value = new Set([itemId])
  }
}

// ── Board title ──────────────────────────────────────────────────────────────
function saveTitle() {
  const board = boardsStore.getById(boardId.value)
  if (!board || boardTitle.value === board.title) return
  boardsStore.updateTitle(boardId.value, boardTitle.value || 'Untitled board')
}

// ── Add items ────────────────────────────────────────────────────────────────
function centerWorldPos() {
  const el = canvasRef.value
  if (!el) return { x: 200, y: 200 }
  const cx = el.clientWidth / 2
  const cy = el.clientHeight / 2
  // Stagger slightly so items don't stack
  const offset = boardItems.value.length * 20
  return {
    x: (cx - panX.value) / zoom.value - 100 + offset,
    y: (cy - panY.value) / zoom.value - 60 + offset,
  }
}

async function addText() {
  const pos = centerWorldPos()
  await canvasItemsStore.add({
    board_id: boardId.value,
    item_type: 'note',
    note_text: '',
    note_color: 'none',
    x: pos.x,
    y: pos.y,
  })
  showAddPanel.value = false
}

async function addNote() {
  const pos = centerWorldPos()
  await canvasItemsStore.add({
    board_id: boardId.value,
    item_type: 'note',
    note_text: '',
    note_color: selectedNoteColor.value,
    x: pos.x,
    y: pos.y,
  })
  showAddPanel.value = false
}

async function addTask(taskId: string) {
  const pos = centerWorldPos()
  await canvasItemsStore.add({
    board_id: boardId.value,
    item_type: 'task',
    task_id: taskId,
    x: pos.x,
    y: pos.y,
  })
  search.value = ''
}

async function addDocument(documentId: string) {
  const pos = centerWorldPos()
  await canvasItemsStore.add({
    board_id: boardId.value,
    item_type: 'document',
    document_id: documentId,
    x: pos.x,
    y: pos.y,
  })
  search.value = ''
}

// ── Filtered add-panel lists ──────────────────────────────────────────────────
const filteredTasks = computed(() => {
  const term = search.value.toLowerCase()
  return tasksStore.tasks.filter(t => {
    if (t.status === 'done') return false
    if (canvasItemsStore.taskOnBoard(boardId.value, t.id)) return false
    if (term && !t.title.toLowerCase().includes(term)) return false
    return true
  })
})

const filteredDocs = computed(() => {
  const term = search.value.toLowerCase()
  return documentsStore.documents.filter(d => {
    if (canvasItemsStore.documentOnBoard(boardId.value, d.id)) return false
    if (term && !(d.title || '').toLowerCase().includes(term)) return false
    return true
  })
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function noteBtnBg(color: NoteColor): string {
  const map: Record<NoteColor, string> = {
    yellow: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    pink:   'bg-pink-100 border-pink-200 text-pink-800',
    green:  'bg-green-100 border-green-200 text-green-800',
    blue:   'bg-blue-100 border-blue-200 text-blue-800',
    purple: 'bg-purple-100 border-purple-200 text-purple-800',
    none:   'bg-transparent border-neutral-200 text-neutral-600',
  }
  return map[color]
}

function taskStatusColor(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    todo: '#d4d4d4',
    in_progress: '#a78bfa',
    orbit: '#94a3b8',
    done: '#4ade80',
  }
  return map[status]
}

watch(search, () => {})
watch(showAddPanel, (val) => { if (!val) search.value = '' })

useHead(computed(() => ({ title: boardTitle.value || 'Board' })))
</script>

<style>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
