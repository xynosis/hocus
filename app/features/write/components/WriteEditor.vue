<template>
  <div :class="['write-editor', { 'paragraph-focus': paragraphFocus }]">
    <EditorContent :editor="editor" class="prose-editor" />
    <div v-if="wordCount !== null" class="mt-4 text-xs text-neutral-400 dark:text-neutral-600 select-none">
      {{ wordCount }} {{ wordCount === 1 ? 'word' : 'words' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export type OutlineHeading = { level: number; text: string }

const props = defineProps<{
  modelValue: string
  typewriterMode?: boolean
  paragraphFocus?: boolean
  keywords?: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'wordCountUpdate': [count: number]
  'selectionText': [text: string]
  'autoTitle': [title: string]
  'outline': [headings: OutlineHeading[]]
  'keywordClick': [text: string]
}>()

const wordCount = ref<number | null>(null)

// ── Paragraph focus plugin ────────────────────────────────────────────────────
const paragraphFocusKey = new PluginKey('paragraphFocus')
function makeParagraphFocusPlugin() {
  return new Plugin({
    key: paragraphFocusKey,
    props: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      decorations(state: any) {
        const { $from } = state.selection
        if ($from.depth === 0) return null
        try {
          const pos = $from.before(1)
          const node = $from.node(1)
          return DecorationSet.create(state.doc, [
            Decoration.node(pos, pos + node.nodeSize, { class: 'is-focused-paragraph' }),
          ])
        } catch {
          return null
        }
      },
    },
  })
}

// ── Keyword decorator ─────────────────────────────────────────────────────────
const keywordsHolder = { current: [] as string[] }
const keywordPluginKey = new PluginKey('keywordDecorator')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildKeywordDecorations(doc: any, keywords: string[]): DecorationSet | null {
  if (!keywords.length) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decorations: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc.descendants((node: any, pos: number) => {
    if (!node.isText || !node.text) return
    const text: string = node.text
    const textLower = text.toLowerCase()
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase()
      let idx = textLower.indexOf(kwLower)
      while (idx !== -1) {
        decorations.push(
          Decoration.inline(pos + idx, pos + idx + kw.length, {
            class: 'keyword-mark',
            'data-keyword': kw,
          })
        )
        idx = textLower.indexOf(kwLower, idx + kw.length)
      }
    }
  })
  if (!decorations.length) return null
  return DecorationSet.create(doc, decorations)
}

function makeKeywordPlugin() {
  return new Plugin({
    key: keywordPluginKey,
    props: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      decorations(state: any) {
        return buildKeywordDecorations(state.doc, keywordsHolder.current)
      },
      handleDOMEvents: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        click(_view: any, event: MouseEvent) {
          const target = event.target as HTMLElement
          const kw = target.getAttribute('data-keyword')
            ?? target.closest('[data-keyword]')?.getAttribute('data-keyword')
          if (kw) {
            emit('keywordClick', kw)
            return true
          }
          return false
        },
      },
    },
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractOutline(): OutlineHeading[] {
  if (!editor.value) return []
  const headings: OutlineHeading[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor.value.state.doc.forEach((node: any) => {
    if (node.type.name === 'heading') {
      headings.push({ level: node.attrs.level as number, text: node.textContent as string })
    }
  })
  return headings
}

// ── Editor ────────────────────────────────────────────────────────────────────
const editor = useEditor({
  extensions: [
    StarterKit,
    Markdown.configure({ html: false, transformPastedText: true }),
    CharacterCount,
    Placeholder.configure({ placeholder: 'Start writing…' }),
  ],
  content: props.modelValue,
  editorProps: {
    attributes: { class: 'outline-none min-h-96' },
  },
  onUpdate({ editor: e }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const md = (e.storage as any).markdown.getMarkdown()
    emit('update:modelValue', md)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const words = (e.storage as any).characterCount.words()
    wordCount.value = words
    emit('wordCountUpdate', words)
    emit('outline', extractOutline())
    const firstChild = e.state.doc.firstChild
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((firstChild as any)?.type.name === 'heading') {
      emit('autoTitle', firstChild!.textContent)
    }
  },
  onCreate({ editor: e }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const words = (e.storage as any).characterCount.words()
    wordCount.value = words
    emit('wordCountUpdate', words)
    emit('outline', extractOutline())
  },
  onSelectionUpdate({ editor: e }) {
    const { from, to } = e.state.selection
    if (from === to) { emit('selectionText', ''); return }
    emit('selectionText', e.state.doc.textBetween(from, to, ' ').trim())
  },
  onTransaction({ editor: e }) {
    if (!props.typewriterMode) return
    nextTick(() => {
      try {
        const { from } = e.state.selection
        const domPos = e.view.domAtPos(from)
        const el = (domPos.node.nodeType === Node.TEXT_NODE
          ? domPos.node.parentElement
          : domPos.node) as HTMLElement | null
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      } catch { /* ignore */ }
    })
  },
})

// ── Register plugins once editor is ready ─────────────────────────────────────
watch(editor, (e) => {
  if (!e) return
  keywordsHolder.current = props.keywords ?? []
  e.registerPlugin(makeParagraphFocusPlugin())
  e.registerPlugin(makeKeywordPlugin())
})

// ── Sync keyword prop → holder → trigger re-decoration ───────────────────────
watch(
  () => props.keywords,
  (v) => {
    keywordsHolder.current = v ?? []
    if (editor.value) editor.value.view.dispatch(editor.value.state.tr)
  },
  { immediate: true },
)

// ── Public API ────────────────────────────────────────────────────────────────
function scrollToHeading(text: string, level: number) {
  if (!editor.value) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor.value.state.doc.forEach((node: any, pos: number) => {
    if (node.type.name === 'heading' && node.attrs.level === level && node.textContent === text) {
      editor.value!.commands.focus()
      editor.value!.commands.setTextSelection(pos + 1)
      nextTick(() => {
        try {
          const { from } = editor.value!.state.selection
          const domPos = editor.value!.view.domAtPos(from)
          const el = (domPos.node.nodeType === Node.TEXT_NODE
            ? domPos.node.parentElement
            : domPos.node) as HTMLElement
          el?.scrollIntoView({ block: 'start', behavior: 'smooth' })
        } catch { /* ignore */ }
      })
    }
  })
}

defineExpose({ scrollToHeading })

watch(
  () => props.modelValue,
  (newVal) => {
    if (!editor.value) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = (editor.value.storage as any).markdown.getMarkdown()
    if (current !== newVal) editor.value.commands.setContent(newVal, false)
  },
)

onBeforeUnmount(() => {
  editor.value?.unregisterPlugin(paragraphFocusKey)
  editor.value?.unregisterPlugin(keywordPluginKey)
  editor.value?.destroy()
})
</script>

<style>
/* Placeholder */
.write-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #a8a29e;
  pointer-events: none;
  height: 0;
}
.dark .write-editor .ProseMirror p.is-editor-empty:first-child::before { color: #525252; }

/* Base prose */
.write-editor .ProseMirror { font-size: 1rem; line-height: 1.75; color: #404040; }
.dark .write-editor .ProseMirror { color: #d4d4d4; }

.write-editor .ProseMirror h1 { font-size: 1.75rem; font-weight: 700; margin: 1.25rem 0 0.5rem; line-height: 1.3; }
.write-editor .ProseMirror h2 { font-size: 1.375rem; font-weight: 600; margin: 1rem 0 0.4rem; line-height: 1.3; }
.write-editor .ProseMirror h3 { font-size: 1.125rem; font-weight: 600; margin: 0.875rem 0 0.35rem; }
.write-editor .ProseMirror p { margin: 0.5rem 0; }
.write-editor .ProseMirror strong { font-weight: 600; }
.write-editor .ProseMirror em { font-style: italic; }
.write-editor .ProseMirror ul, .write-editor .ProseMirror ol { padding-left: 1.5rem; margin: 0.5rem 0; }
.write-editor .ProseMirror li { margin: 0.15rem 0; }
.write-editor .ProseMirror blockquote {
  border-left: 3px solid #e5e7eb;
  padding-left: 1rem;
  margin: 0.75rem 0;
  color: #6b7280;
  font-style: italic;
}
.dark .write-editor .ProseMirror blockquote { border-left-color: #404040; color: #9ca3af; }
.write-editor .ProseMirror code {
  background: #f5f5f4;
  border-radius: 3px;
  padding: 0.1rem 0.3rem;
  font-size: 0.875em;
  font-family: ui-monospace, monospace;
}
.dark .write-editor .ProseMirror code { background: #262626; }
.write-editor .ProseMirror pre {
  background: #f5f5f4;
  border-radius: 8px;
  padding: 0.875rem 1rem;
  margin: 0.75rem 0;
  overflow-x: auto;
}
.dark .write-editor .ProseMirror pre { background: #1a1a1a; }
.write-editor .ProseMirror pre code { background: none; padding: 0; font-size: 0.875rem; }
.write-editor .ProseMirror hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
.dark .write-editor .ProseMirror hr { border-top-color: #404040; }

/* Paragraph focus */
.paragraph-focus .ProseMirror > * { opacity: 0.25; transition: opacity 0.15s ease; }
.paragraph-focus .ProseMirror > .is-focused-paragraph { opacity: 1; }

/* Keyword decorations */
.keyword-mark {
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: #a78bfa;
  text-underline-offset: 3px;
  cursor: pointer;
}
.keyword-mark:hover { text-decoration-color: #7c3aed; }
</style>
