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
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const props = defineProps<{
  modelValue: string
  typewriterMode?: boolean
  paragraphFocus?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'wordCountUpdate': [count: number]
  'selectionText': [text: string]
  'autoTitle': [title: string]
}>()

const wordCount = ref<number | null>(null)

// Tiptap extension wrapping the ProseMirror decoration plugin.
// Always decorates the active top-level block with .is-focused-paragraph.
// The dim CSS only fires when .paragraph-focus class is on the wrapper div.
const ParagraphFocusExtension = Extension.create({
  name: 'paragraphFocus',
  addProseMirrorPlugin() {
    return [
      new Plugin({
        key: new PluginKey('paragraphFocus'),
        props: {
          decorations(state) {
            const { $from } = state.selection
            if ($from.depth === 0) return DecorationSet.empty
            try {
              const pos = $from.before(1)
              const node = $from.node(1)
              return DecorationSet.create(state.doc, [
                Decoration.node(pos, pos + node.nodeSize, { class: 'is-focused-paragraph' }),
              ])
            } catch {
              return DecorationSet.empty
            }
          },
        },
      }),
    ]
  },
})

const editor = useEditor({
  extensions: [
    StarterKit,
    Markdown.configure({
      html: false,
      transformPastedText: true,
    }),
    CharacterCount,
    Placeholder.configure({
      placeholder: 'Start writing…',
    }),
    ParagraphFocusExtension,
  ],
  content: props.modelValue,
  editorProps: {
    attributes: { class: 'outline-none min-h-96' },
  },
  onUpdate({ editor }) {
    const md = editor.storage.markdown.getMarkdown()
    emit('update:modelValue', md)

    const words = editor.storage.characterCount.words()
    wordCount.value = words
    emit('wordCountUpdate', words)

    // W7.4 — auto-title from first heading
    const firstChild = editor.state.doc.firstChild
    if (firstChild && firstChild.type.name === 'heading') {
      emit('autoTitle', firstChild.textContent)
    }
  },
  onCreate({ editor }) {
    const words = editor.storage.characterCount.words()
    wordCount.value = words
    emit('wordCountUpdate', words)
  },
  onSelectionUpdate({ editor }) {
    // W7.2 — emit selected text so parent can show "Create task" button
    const { from, to } = editor.state.selection
    if (from === to) {
      emit('selectionText', '')
      return
    }
    const text = editor.state.doc.textBetween(from, to, ' ').trim()
    emit('selectionText', text)
  },
  onTransaction({ editor }) {
    // W7.1 — typewriter mode: scroll cursor to vertical centre
    if (!props.typewriterMode) return
    nextTick(() => {
      try {
        const { from } = editor.state.selection
        const domPos = editor.view.domAtPos(from)
        const node = domPos.node
        const el = (node.nodeType === Node.TEXT_NODE ? node.parentElement : node) as HTMLElement | null
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      } catch {
        // ignore if DOM position unavailable
      }
    })
  },
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (!editor.value) return
    const current = editor.value.storage.markdown.getMarkdown()
    if (current !== newVal) {
      editor.value.commands.setContent(newVal, false)
    }
  },
)

onBeforeUnmount(() => {
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
.dark .write-editor .ProseMirror p.is-editor-empty:first-child::before {
  color: #525252;
}

/* Base prose */
.write-editor .ProseMirror {
  font-size: 1rem;
  line-height: 1.75;
  color: #404040;
}
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

/* W7.3 — Paragraph focus */
.paragraph-focus .ProseMirror > * {
  opacity: 0.25;
  transition: opacity 0.15s ease;
}
.paragraph-focus .ProseMirror > .is-focused-paragraph {
  opacity: 1;
}
</style>
