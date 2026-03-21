<template>
  <!-- Normal chrome: back button + header row — hidden in focus mode -->
  <div v-show="!isFocused" class="max-w-2xl mx-auto px-4 pt-8">
    <!-- Back -->
    <button
      type="button"
      class="write-chrome flex items-center gap-1.5 text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors mb-6"
      @click="navigateTo('/write')"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      All documents
    </button>

    <!-- Not found -->
    <div v-if="notFound" class="text-center py-20">
      <p class="text-neutral-500 dark:text-neutral-400">Document not found.</p>
      <button
        type="button"
        class="mt-4 text-sm text-purple-500 hover:text-purple-600 transition-colors"
        @click="navigateTo('/write')"
      >Back to writing</button>
    </div>

    <!-- Header row — primary + secondary -->
    <div v-if="loaded && !notFound" class="write-chrome mb-1">
      <!-- Primary row -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <!-- Return to task -->
          <button
            v-if="linkedTaskName"
            type="button"
            class="text-xs text-neutral-400 dark:text-neutral-600 hover:text-purple-500 dark:hover:text-purple-400 transition-colors truncate max-w-[140px]"
            @click="navigateTo(`/task/${linkedTaskId}`)"
          >↗ {{ linkedTaskName }}</button>

          <!-- Create task from selection -->
          <button
            v-if="selectedText"
            type="button"
            class="text-xs text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors font-medium flex-shrink-0"
            @click="createTaskFromSelection"
          >+ Task</button>

          <!-- Mark keyword from selection -->
          <button
            v-if="selectedText"
            type="button"
            class="text-xs text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors font-medium flex-shrink-0"
            @click="keywordsStore.add(selectedText)"
          >Mark keyword</button>

          <span v-if="taskCreatedConfirm" class="text-xs text-green-500 dark:text-green-400 flex-shrink-0">Task created</span>
        </div>

        <div class="flex items-center gap-3 flex-shrink-0">
          <span
            class="text-xs transition-opacity duration-300"
            :class="saveStatus === 'idle' ? 'opacity-0' : 'opacity-100 text-neutral-400 dark:text-neutral-600'"
          >{{ saveStatus === 'saving' ? 'Saving…' : 'Saved' }}</span>

          <!-- Outline toggle -->
          <button
            v-if="outline.length > 0"
            type="button"
            class="text-xs transition-colors"
            :class="showOutline
              ? 'text-purple-500 dark:text-purple-400'
              : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400'"
            @click="showOutline = !showOutline"
          >Outline</button>

          <button
            type="button"
            class="text-xs text-neutral-400 dark:text-neutral-600 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
            @click="enterFocus"
          >Write</button>

          <!-- More options toggle -->
          <button
            type="button"
            class="text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
            :class="showMoreOptions ? 'text-neutral-600 dark:text-neutral-400' : ''"
            @click="showMoreOptions = !showMoreOptions"
          >···</button>
        </div>
      </div>

      <!-- Secondary row (collapsible) -->
      <div v-if="showMoreOptions" class="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="button"
          class="text-xs transition-colors"
          :class="currentDoc?.pinned_at
            ? 'text-amber-500 dark:text-amber-400 hover:text-amber-600'
            : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400'"
          @click="currentDoc?.pinned_at ? documentsStore.unpin(docId) : documentsStore.pin(docId)"
        >{{ currentDoc?.pinned_at ? 'Unpin' : 'Pin' }}</button>

        <button
          type="button"
          class="text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          @click="exportMarkdown"
        >Export .md</button>

        <button
          type="button"
          class="text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          @click="exportPdf"
        >Export PDF</button>

        <button
          type="button"
          class="text-xs transition-colors"
          :class="isTypewriter
            ? 'text-purple-500 dark:text-purple-400'
            : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400'"
          @click="isTypewriter = !isTypewriter"
        >Typewriter</button>

        <button
          type="button"
          class="text-xs transition-colors"
          :class="paragraphFocus
            ? 'text-purple-500 dark:text-purple-400'
            : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400'"
          @click="paragraphFocus = !paragraphFocus"
        >Para focus</button>

        <!-- Tags input -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-neutral-300 dark:text-neutral-700">Tags:</span>
          <input
            v-model="tagsInput"
            type="text"
            placeholder="comma, separated"
            class="text-xs bg-transparent outline-none border-b border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 w-36 pb-0.5"
            @blur="saveTags"
            @keydown.enter.prevent="saveTags"
          />
        </div>

        <!-- Save as template -->
        <template v-if="savingAsTemplate">
          <input
            ref="templateNameInputRef"
            v-model="templateName"
            type="text"
            placeholder="Template name"
            class="text-xs bg-transparent outline-none border-b border-purple-400 text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400 w-32 pb-0.5"
            @blur="commitSaveTemplate"
            @keydown.enter.prevent="commitSaveTemplate"
            @keydown.escape.prevent="savingAsTemplate = false"
          />
        </template>
        <button
          v-else
          type="button"
          class="text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          @click="startSaveAsTemplate"
        >Save as template</button>
        <span v-if="templateSavedConfirm" class="text-xs text-green-500 dark:text-green-400">Saved!</span>

        <template v-if="confirmDelete">
          <button
            type="button"
            class="text-xs text-red-500 dark:text-red-400 hover:text-red-600 transition-colors"
            @click="deleteDocument"
          >Delete?</button>
          <button
            type="button"
            class="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 transition-colors"
            @click="confirmDelete = false"
          >Cancel</button>
        </template>
        <button
          v-else
          type="button"
          class="text-xs text-neutral-400 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-500 transition-colors"
          @click="confirmDelete = true"
        >Delete</button>
      </div>
    </div>
  </div>

  <!-- Outline panel — fixed left drawer, hidden in focus mode -->
  <Transition name="slide-left">
    <div
      v-if="showOutline && !isFocused && outline.length > 0"
      class="fixed left-0 top-0 bottom-0 z-20 w-52 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-r border-neutral-100 dark:border-neutral-800 overflow-y-auto py-8 px-3"
    >
      <p class="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide px-2 mb-3">Outline</p>
      <nav class="flex flex-col gap-0.5">
        <button
          v-for="(heading, i) in outline"
          :key="i"
          type="button"
          class="text-left text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg px-2 py-1.5 transition-colors truncate"
          :style="{ paddingLeft: `${(heading.level - 1) * 10 + 8}px` }"
          @click="editorRef?.scrollToHeading(heading.text, heading.level)"
        >{{ heading.text }}</button>
      </nav>
    </div>
  </Transition>

  <!-- Keyword search overlay -->
  <Transition name="fade">
    <div
      v-if="keywordSearch"
      class="fixed inset-0 z-40 flex items-start justify-center pt-24 px-4"
      @click.self="keywordSearch = null"
    >
      <div class="absolute inset-0 bg-black/10 dark:bg-black/30" @click="keywordSearch = null" />
      <div class="relative z-10 w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
          <span class="text-sm text-neutral-700 dark:text-neutral-300">
            Documents mentioning <strong>"{{ keywordSearch }}"</strong>
          </span>
          <button type="button" class="text-neutral-400 hover:text-neutral-600 transition-colors" @click="keywordSearch = null">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div v-if="keywordResults.length === 0" class="px-4 py-8 text-sm text-center text-neutral-400 dark:text-neutral-500">
          No other documents mention this word.
        </div>
        <div v-else class="divide-y divide-neutral-50 dark:divide-neutral-800 max-h-72 overflow-y-auto">
          <button
            v-for="doc in keywordResults"
            :key="doc.id"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            @click="navigateTo(`/write/${doc.id}`); keywordSearch = null"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">{{ doc.title || 'Untitled' }}</p>
              <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">{{ getKeywordContext(doc.content, keywordSearch!) }}</p>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="flex-shrink-0 text-neutral-300 dark:text-neutral-600"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Focus background (z-50) -->
  <Transition name="write-focus">
    <div v-if="isFocused" class="fixed inset-0 z-50 bg-stone-50 dark:bg-neutral-950 pointer-events-none" />
  </Transition>

  <!-- Focus chrome: header + progress bar (z-[52]) -->
  <Transition name="write-focus">
    <div v-if="isFocused" class="fixed top-0 inset-x-0 z-[52]">
      <div class="flex items-center justify-between px-6 py-4 gap-4">
        <div class="flex items-center gap-4 flex-1 flex-wrap">
          <div class="flex items-center gap-2">
            <input
              v-model.number="wordGoalInput"
              type="number"
              min="0"
              placeholder="Word goal"
              class="w-24 text-xs bg-transparent border-b border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700 pb-0.5"
              @keydown.enter.blur
            />
            <span v-if="wordGoalInput && wordGoalInput > 0" class="text-xs text-neutral-400 dark:text-neutral-600">
              {{ wordCount }} / {{ wordGoalInput }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model.number="timeGoalInput"
              type="number"
              min="0"
              placeholder="Minutes"
              class="w-20 text-xs bg-transparent border-b border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700 pb-0.5"
              @keydown.enter.blur
              @change="startTimer"
            />
            <span
              v-if="timerDisplay"
              class="text-xs font-mono tabular-nums transition-colors"
              :class="timerExpired ? 'text-amber-400 dark:text-amber-500 animate-pulse' : 'text-neutral-400 dark:text-neutral-600'"
            >{{ timerDisplay }}</span>
          </div>
          <button
            type="button"
            class="text-xs transition-colors"
            :class="isTypewriter ? 'text-purple-400' : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-500'"
            @click="isTypewriter = !isTypewriter"
          >Typewriter</button>
          <button
            type="button"
            class="text-xs transition-colors"
            :class="paragraphFocus ? 'text-purple-400' : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-500'"
            @click="paragraphFocus = !paragraphFocus"
          >Para focus</button>
        </div>
        <div class="flex items-center gap-4 flex-shrink-0">
          <span
            class="text-xs transition-opacity duration-300"
            :class="saveStatus === 'idle' ? 'opacity-0' : 'opacity-100 text-neutral-400 dark:text-neutral-600'"
          >{{ saveStatus === 'saving' ? 'Saving…' : 'Saved' }}</span>
          <button
            type="button"
            class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            style="min-height: 44px;"
            @click="exitFocus"
          >Exit</button>
        </div>
      </div>
      <div v-if="wordGoalInput && wordGoalInput > 0" class="h-0.5 bg-neutral-100 dark:bg-neutral-800">
        <div
          class="h-full bg-purple-400 dark:bg-purple-600 transition-all duration-500"
          :style="{ width: `${Math.min(100, (wordCount / wordGoalInput) * 100)}%` }"
        />
      </div>
    </div>
  </Transition>

  <!-- Editor area -->
  <div
    v-if="loaded && !notFound"
    :class="isFocused ? 'fixed inset-0 z-[51] overflow-y-auto' : 'max-w-2xl mx-auto px-4'"
  >
    <div :class="isFocused ? 'max-w-2xl mx-auto px-6 pt-20 pb-12' : 'pb-8'">
      <h1 class="write-print-title hidden text-3xl font-bold text-black mb-6 leading-snug">{{ title || 'Untitled' }}</h1>

      <input
        v-model="title"
        type="text"
        placeholder="Untitled"
        class="w-full text-3xl font-semibold text-neutral-800 dark:text-neutral-100 bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700 mb-6"
        :class="isFocused ? '' : 'write-chrome'"
        @blur="saveTitle"
        @keydown.enter.prevent="focusEditorEl"
      />

      <WriteEditor
        ref="editorRef"
        v-model="content"
        :typewriter-mode="isTypewriter"
        :paragraph-focus="paragraphFocus"
        :keywords="keywordsStore.keywords"
        @word-count-update="wordCount = $event"
        @selection-text="selectedText = $event"
        @auto-title="onAutoTitle"
        @outline="outline = $event"
        @keyword-click="keywordSearch = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDocumentsStore } from '~/features/write/stores/documents'
import { useWriteTemplatesStore } from '~/features/write/stores/templates'
import { useKeywordsStore } from '~/features/write/stores/keywords'
import { useWriteFocus } from '~/features/write/composables/useWriteFocus'
import { useTasksStore } from '~/stores/tasks'
import WriteEditor from '~/features/write/components/WriteEditor.vue'
import type { OutlineHeading } from '~/features/write/components/WriteEditor.vue'

definePageMeta({ layout: 'write' })

const route = useRoute()
const documentsStore = useDocumentsStore()
const templatesStore = useWriteTemplatesStore()
const keywordsStore = useKeywordsStore()
const tasksStore = useTasksStore()
const { isFocused, wordGoal, timeGoalMinutes, isTypewriter, enterFocus, exitFocus } = useWriteFocus()

const editorRef = ref<InstanceType<typeof WriteEditor> | null>(null)

const notFound = ref(false)
const loaded = ref(false)
const confirmDelete = ref(false)
const showMoreOptions = ref(false)
const title = ref('')
const content = ref('')
const wordCount = ref(0)
const saveStatus = ref<'idle' | 'saving' | 'saved'>('idle')
const paragraphFocus = ref(false)
const selectedText = ref('')
const taskCreatedConfirm = ref(false)

// Outline
const outline = ref<OutlineHeading[]>([])
const showOutline = ref(false)

// Tags
const tagsInput = ref('')

// Save as template
const savingAsTemplate = ref(false)
const templateName = ref('')
const templateNameInputRef = ref<HTMLInputElement | null>(null)
const templateSavedConfirm = ref(false)

// Keyword search
const keywordSearch = ref<string | null>(null)
const keywordResults = computed(() => {
  if (!keywordSearch.value) return []
  const term = keywordSearch.value.toLowerCase()
  return documentsStore.documents.filter(d => d.id !== docId.value && (d.content.toLowerCase().includes(term) || d.title.toLowerCase().includes(term)))
})

function getKeywordContext(content: string, keyword: string): string {
  const lower = content.toLowerCase()
  const idx = lower.indexOf(keyword.toLowerCase())
  if (idx === -1) return ''
  const start = Math.max(0, idx - 30)
  const end = Math.min(content.length, idx + keyword.length + 50)
  return (start > 0 ? '…' : '') + content.slice(start, end).replace(/\n/g, ' ') + (end < content.length ? '…' : '')
}

// Linked task
const linkedTaskId = computed(() => documentsStore.getById(docId.value)?.task_id ?? null)
const linkedTaskName = computed(() =>
  linkedTaskId.value ? (tasksStore.getTaskById(linkedTaskId.value)?.title ?? null) : null
)

async function createTaskFromSelection() {
  if (!selectedText.value) return
  await tasksStore.addTask({ title: selectedText.value })
  selectedText.value = ''
  taskCreatedConfirm.value = true
  setTimeout(() => { taskCreatedConfirm.value = false }, 2000)
}

function onAutoTitle(heading: string) {
  if (title.value === 'Untitled' && heading) {
    title.value = heading
    documentsStore.update(docId.value, { title: heading })
  }
}

// Tags
function saveTags() {
  const tags = tagsInput.value
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0)
  documentsStore.updateTags(docId.value, tags)
}

// Save as template
function startSaveAsTemplate() {
  templateName.value = title.value || 'Untitled template'
  savingAsTemplate.value = true
  nextTick(() => templateNameInputRef.value?.focus())
}

async function commitSaveTemplate() {
  savingAsTemplate.value = false
  if (!templateName.value.trim()) return
  await templatesStore.save(templateName.value.trim(), content.value)
  templateSavedConfirm.value = true
  setTimeout(() => { templateSavedConfirm.value = false }, 2000)
}

// Goals
const wordGoalInput = computed({
  get: () => wordGoal.value,
  set: (v) => { wordGoal.value = v && v > 0 ? v : null },
})
const timeGoalInput = computed({
  get: () => timeGoalMinutes.value,
  set: (v) => { timeGoalMinutes.value = v && v > 0 ? v : null },
})

// Timer
const timerSeconds = ref<number | null>(null)
const timerExpired = ref(false)
let timerInterval: ReturnType<typeof setInterval> | null = null

function startTimer() {
  if (timerInterval) clearInterval(timerInterval)
  timerExpired.value = false
  if (!timeGoalMinutes.value || timeGoalMinutes.value <= 0) { timerSeconds.value = null; return }
  timerSeconds.value = timeGoalMinutes.value * 60
  timerInterval = setInterval(() => {
    if (timerSeconds.value === null) return
    timerSeconds.value--
    if (timerSeconds.value <= 0) {
      timerSeconds.value = 0
      timerExpired.value = true
      clearInterval(timerInterval!)
    }
  }, 1000)
}

const timerDisplay = computed(() => {
  if (timerSeconds.value === null) return null
  const m = Math.floor(timerSeconds.value / 60)
  const s = timerSeconds.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

watch(isFocused, (val) => {
  if (!val && timerInterval) {
    clearInterval(timerInterval)
    timerSeconds.value = null
    timerExpired.value = false
  }
})

let saveTimer: ReturnType<typeof setTimeout> | null = null
let savedTimer: ReturnType<typeof setTimeout> | null = null
const docId = computed(() => route.params.id as string)
const currentDoc = computed(() => documentsStore.getById(docId.value))

onMounted(async () => {
  const doc = await documentsStore.fetchById(docId.value)
  if (!doc) { notFound.value = true; return }
  title.value = doc.title
  content.value = doc.content
  tagsInput.value = (doc.tags ?? []).join(', ')
  loaded.value = true
  if (doc.task_id) tasksStore.fetchTasks()
  await documentsStore.fetchAll() // ensure all docs are loaded for keyword search
  await templatesStore.fetchAll()
  await keywordsStore.fetchAll()
})

onUnmounted(async () => {
  if (timerInterval) clearInterval(timerInterval)
  if (saveTimer) clearTimeout(saveTimer)
  if (savedTimer) clearTimeout(savedTimer)
  const doc = documentsStore.getById(docId.value)
  if (doc && doc.title === 'Untitled' && !doc.content.trim()) {
    await documentsStore.remove(docId.value)
  }
})

watch(content, (newVal) => {
  if (!loaded.value) return
  if (saveTimer) clearTimeout(saveTimer)
  if (savedTimer) clearTimeout(savedTimer)
  saveStatus.value = 'saving'
  saveTimer = setTimeout(async () => {
    await documentsStore.update(docId.value, { content: newVal })
    saveStatus.value = 'saved'
    savedTimer = setTimeout(() => { saveStatus.value = 'idle' }, 2000)
  }, 1500)
})

function saveTitle() {
  const doc = documentsStore.getById(docId.value)
  if (!doc || title.value === doc.title) return
  documentsStore.update(docId.value, { title: title.value })
}

function focusEditorEl() {
  document.querySelector<HTMLElement>('.ProseMirror')?.focus()
}

async function deleteDocument() {
  await documentsStore.remove(docId.value)
  navigateTo('/write')
}

function exportPdf() { window.print() }

function exportMarkdown() {
  const blob = new Blob([content.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.value || 'untitled'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

useHead(computed(() => ({ title: title.value || 'Untitled' })))
</script>

<style>
.write-focus-enter-active,
.write-focus-leave-active { transition: opacity 0.25s ease; }
.write-focus-enter-from,
.write-focus-leave-to { opacity: 0; }

.slide-left-enter-active,
.slide-left-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.slide-left-enter-from,
.slide-left-leave-to { transform: translateX(-100%); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media print {
  .write-chrome, .fixed { display: none !important; }
  .write-print-title { display: block !important; }
  @page { margin: 2cm; }
  body, html { background: white !important; }
  .write-editor .ProseMirror { font-size: 11pt; line-height: 1.6; color: black !important; }
  .write-editor .ProseMirror h1 { font-size: 20pt; }
  .write-editor .ProseMirror h2 { font-size: 16pt; }
  .write-editor .ProseMirror h3 { font-size: 13pt; }
  .write-editor .ProseMirror blockquote { border-left-color: #ccc; color: #444; }
  .write-editor .ProseMirror code,
  .write-editor .ProseMirror pre { background: #f5f5f4; }
}
</style>
