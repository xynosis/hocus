<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Documents</h1>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          @click="showTemplatePicker = true"
        >
          From template
        </button>
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors active:scale-95"
          @click="createDocument"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          New document
        </button>
      </div>
    </div>

    <!-- Tag filters -->
    <div v-if="allTags.length > 0" class="flex items-center gap-2 flex-wrap mb-4">
      <button
        v-for="tag in allTags"
        :key="tag"
        type="button"
        class="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
        :class="activeTagFilter === tag
          ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'"
        @click="activeTagFilter = activeTagFilter === tag ? null : tag"
      >{{ tag }}</button>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && filteredDocuments.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" class="mb-4 text-neutral-300 dark:text-neutral-700">
        <rect x="6" y="4" width="28" height="34" rx="3" stroke="currentColor" stroke-width="2"/>
        <path d="M12 14h16M12 20h16M12 26h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <p class="text-neutral-500 dark:text-neutral-400 text-sm">
        {{ activeTagFilter ? `No documents tagged "${activeTagFilter}".` : 'No documents yet.' }}
      </p>
      <p v-if="!activeTagFilter" class="text-neutral-400 dark:text-neutral-500 text-sm mt-1">Start writing something.</p>
    </div>

    <!-- Document list -->
    <div v-else class="flex flex-col gap-2">
      <div
        v-for="doc in filteredDocuments"
        :key="doc.id"
        class="group rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm p-4 hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0 cursor-pointer" @click="navigateTo(`/write/${doc.id}`)">
            <p class="text-base font-medium text-neutral-800 dark:text-neutral-100 truncate">
              {{ doc.title || 'Untitled' }}
            </p>
            <p v-if="getPreview(doc)" class="text-sm text-neutral-400 dark:text-neutral-500 mt-0.5 line-clamp-1">
              {{ getPreview(doc) }}
            </p>
            <div class="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
              <span class="text-xs text-neutral-400 dark:text-neutral-500">{{ formatRelative(doc.updated_at) }}</span>
              <span v-if="getTaskName(doc.task_id)" class="text-xs text-neutral-500 dark:text-neutral-400">
                {{ getTaskName(doc.task_id) }}
              </span>
              <span
                v-for="project in getProjects(doc.task_id)"
                :key="project.id"
                class="text-xs px-1.5 py-0.5 rounded-md font-medium"
                :style="{ backgroundColor: hexWithOpacity(project.color_tag), color: getColorHex(project.color_tag) ?? '#6b7280' }"
              >{{ project.name }}</span>
            </div>
            <!-- Tags -->
            <div v-if="doc.tags?.length" class="flex flex-wrap gap-1 mt-1.5">
              <span
                v-for="tag in doc.tags"
                :key="tag"
                class="px-1.5 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
              >{{ tag }}</span>
            </div>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <template v-if="confirmDeleteId === doc.id">
              <button
                type="button"
                class="text-xs text-red-500 dark:text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                style="min-height: 32px;"
                @click.stop="deleteDocument(doc.id)"
              >Delete?</button>
              <button
                type="button"
                class="text-xs text-neutral-400 dark:text-neutral-500 px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                style="min-height: 32px;"
                @click.stop="confirmDeleteId = null"
              >Cancel</button>
            </template>
            <button
              v-else
              type="button"
              class="opacity-0 group-hover:opacity-100 focus:opacity-100 text-neutral-300 dark:text-neutral-700 hover:text-red-400 dark:hover:text-red-500 transition-colors rounded-lg flex items-center justify-center"
              style="min-width: 32px; min-height: 32px; font-size: 18px; line-height: 1;"
              aria-label="Delete document"
              @click.stop="confirmDeleteId = doc.id"
            >×</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Template picker overlay -->
  <Transition name="fade">
    <div v-if="showTemplatePicker" class="fixed inset-0 z-40 flex items-center justify-center p-4" @click.self="showTemplatePicker = false">
      <div class="absolute inset-0 bg-black/20 dark:bg-black/40" @click="showTemplatePicker = false" />
      <div class="relative z-10 w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xl flex flex-col max-h-[70vh]">
        <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
          <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Templates</span>
          <button type="button" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" @click="showTemplatePicker = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div v-if="templatesStore.templates.length === 0" class="px-4 py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
          No templates yet. Open a document and use <strong>··· → Save as template</strong>.
        </div>
        <div v-else class="flex-1 overflow-y-auto divide-y divide-neutral-50 dark:divide-neutral-800">
          <div
            v-for="template in templatesStore.templates"
            :key="template.id"
            class="flex items-center gap-3 px-4 py-3"
          >
            <div class="flex-1 min-w-0">
              <template v-if="renamingTemplateId === template.id">
                <input
                  ref="renameInputRef"
                  v-model="renamingTitle"
                  type="text"
                  class="w-full text-sm bg-transparent outline-none border-b border-purple-400 text-neutral-700 dark:text-neutral-300"
                  @blur="commitRename"
                  @keydown.enter.prevent="commitRename"
                  @keydown.escape.prevent="renamingTemplateId = null"
                  @click.stop
                />
              </template>
              <p v-else class="text-sm text-neutral-700 dark:text-neutral-300 truncate cursor-pointer" @dblclick="startRename(template)">
                {{ template.title }}
              </p>
            </div>
            <button
              type="button"
              class="flex-shrink-0 text-xs text-neutral-400 dark:text-neutral-500 hover:text-red-400 transition-colors"
              @click="deleteTemplate(template.id)"
            >×</button>
            <button
              type="button"
              class="flex-shrink-0 px-2.5 py-1 text-xs rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
              @click="useTemplate(template)"
            >Use</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useDocumentsStore } from '~/features/write/stores/documents'
import { useWriteTemplatesStore } from '~/features/write/stores/templates'
import { useTasksStore } from '~/stores/tasks'
import { useProjectsStore } from '~/stores/projects'
import { getColorHex } from '~/utils/colors'
import type { WriteTemplate } from '~/types'

definePageMeta({ layout: 'write' })

const documentsStore = useDocumentsStore()
const templatesStore = useWriteTemplatesStore()
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

const loading = ref(true)
const confirmDeleteId = ref<string | null>(null)
const activeTagFilter = ref<string | null>(null)
const showTemplatePicker = ref(false)
const renamingTemplateId = ref<string | null>(null)
const renamingTitle = ref('')
const renameInputRef = ref<HTMLInputElement | null>(null)

const documents = computed(() => documentsStore.documents)

const allTags = computed(() => {
  const set = new Set<string>()
  for (const doc of documents.value) {
    for (const tag of (doc.tags ?? [])) set.add(tag)
  }
  return [...set].sort()
})

const filteredDocuments = computed(() => {
  if (!activeTagFilter.value) return documents.value
  return documents.value.filter(d => d.tags?.includes(activeTagFilter.value!))
})

onMounted(async () => {
  await Promise.all([
    documentsStore.fetchAll(),
    templatesStore.fetchAll(),
    tasksStore.fetchTasks(),
    projectsStore.fetchProjects(),
    projectsStore.fetchTaskProjects(),
  ])
  loading.value = false
})

async function deleteDocument(id: string) {
  await documentsStore.remove(id)
  confirmDeleteId.value = null
}

async function createDocument() {
  const doc = await documentsStore.create({ title: 'Untitled' })
  if (doc) navigateTo(`/write/${doc.id}`)
}

async function useTemplate(template: WriteTemplate) {
  showTemplatePicker.value = false
  const doc = await documentsStore.create({ title: template.title, content: template.content })
  if (doc) navigateTo(`/write/${doc.id}`)
}

async function deleteTemplate(id: string) {
  await templatesStore.remove(id)
}

function startRename(template: WriteTemplate) {
  renamingTemplateId.value = template.id
  renamingTitle.value = template.title
  nextTick(() => renameInputRef.value?.focus())
}

async function commitRename() {
  if (!renamingTemplateId.value) return
  await templatesStore.rename(renamingTemplateId.value, renamingTitle.value.trim() || 'Untitled template')
  renamingTemplateId.value = null
}

function getPreview(doc: { title: string; content: string }): string {
  if (!doc.content) return ''
  const titleNorm = (doc.title || '').toLowerCase().trim()
  const firstLine = doc.content
    .split('\n')
    .map(l => l.replace(/^#{1,6}\s+/, '').replace(/[*_`~]/g, '').trim())
    .find(l => l.length > 0 && l.toLowerCase() !== titleNorm) ?? ''
  return firstLine.length > 80 ? firstLine.slice(0, 80) + '…' : firstLine
}

function getTaskName(taskId: string | null): string | null {
  if (!taskId) return null
  return tasksStore.getTaskById(taskId)?.title ?? null
}

function getProjects(taskId: string | null) {
  if (!taskId) return []
  const ids = projectsStore.getProjectIdsForTask(taskId)
  return ids.map(id => projectsStore.getProjectById(id)).filter(Boolean) as typeof projectsStore.sortedProjects
}

function hexWithOpacity(colorTag: string | null): string {
  const hex = getColorHex(colorTag as never)
  if (!hex) return '#f5f5f4'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, 0.12)`
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
