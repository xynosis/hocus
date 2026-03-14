<template>
    <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between px-1">
            <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-100">Steps</h2>
            <div class="flex items-center gap-3">
                <span v-if="children.length > 0" class="text-sm text-neutral-400 dark:text-neutral-500">
                    {{ completeCount }} of {{ children.length }} done
                </span>
                <div class="flex items-center gap-2">
                    <span v-if="linkedPattern" class="text-xs text-purple-500 dark:text-purple-400">
                        ⟳ {{ linkedPattern.name }}
                    </span>
                    <button
                        v-if="children.length > 0 && !showSaveAsPattern"
                        type="button"
                        class="text-xs text-neutral-400 dark:text-neutral-500 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                        style="min-height: 32px;"
                        @click="showSaveAsPattern = true"
                    >
                        Save as pattern
                    </button>
                </div>
            </div>
        </div>

        <!-- Save as pattern inline form -->
        <Transition name="prompt">
            <div v-if="showSaveAsPattern"
                class="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-4 flex flex-col gap-3">
                <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Save these steps as a pattern</p>
                <div class="flex gap-2">
                    <input
                        ref="patternNameInput"
                        v-model="patternName"
                        type="text"
                        placeholder="Pattern name…"
                        class="flex-1 rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        @keydown.enter="saveAsPattern"
                        @keydown.escape="showSaveAsPattern = false"
                    />
                    <button
                        type="button"
                        class="px-4 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors"
                        style="min-height: 44px;"
                        @click="saveAsPattern"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        class="px-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        style="min-height: 44px;"
                        @click="showSaveAsPattern = false"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Transition>

        <!-- Fuzzy pattern suggestion (shown when no steps yet) -->
        <Transition name="prompt">
            <div v-if="suggestedPattern && children.length === 0"
                class="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 flex items-center justify-between gap-3">
                <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-snug">
                    Your <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ suggestedPattern.name }}</span> pattern might fit.
                </p>
                <button
                    type="button"
                    class="flex-shrink-0 text-sm font-medium text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                    style="min-height: 36px;"
                    @click="applyUserPattern(suggestedPattern)"
                >
                    Apply
                </button>
            </div>
        </Transition>

        <div v-if="children.length === 0 && !suggestedPattern" class="px-1">
            <p class="text-sm text-neutral-400 dark:text-neutral-500">
                No steps yet. Add one below or use a template.
            </p>
        </div>

        <div v-else-if="children.length > 0" class="flex flex-col gap-2">
            <ChildTaskItem
                v-for="child in children"
                :key="child.id"
                :task="child"
                :depth="0"
            />
        </div>

        <Transition name="prompt">
            <div v-if="showTemplatePicker"
                class="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
                <div
                    class="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100">Choose a template</p>
                    <button type="button"
                        class="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                        style="min-width: 32px; min-height: 32px; font-size: 18px; line-height: 1;"
                        @click="showTemplatePicker = false">
                        ×
                    </button>
                </div>

                <!-- User patterns section -->
                <template v-if="patternsStore.patterns.length > 0">
                    <div class="px-4 py-2 bg-neutral-50 dark:bg-neutral-800">
                        <p class="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Your patterns</p>
                    </div>
                    <div class="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
                        <div
                            v-for="pattern in patternsStore.patterns"
                            :key="pattern.id"
                            class="flex items-center"
                        >
                            <button
                                type="button"
                                class="flex-1 text-left px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                style="min-height: 44px;"
                                @click="applyUserPattern(pattern)"
                            >
                                {{ pattern.name }}
                                <span class="text-xs text-neutral-400 dark:text-neutral-500 ml-1">({{ pattern.steps.length }})</span>
                            </button>
                            <button
                                type="button"
                                class="flex-shrink-0 px-2 text-xs transition-colors"
                                :class="task?.pattern_id === pattern.id
                                    ? 'text-purple-500 dark:text-purple-400 hover:text-neutral-400 dark:hover:text-neutral-500'
                                    : 'text-neutral-300 dark:text-neutral-600 hover:text-purple-400 dark:hover:text-purple-500'"
                                style="min-width: 36px; min-height: 44px;"
                                :aria-label="task?.pattern_id === pattern.id ? 'Unlink pattern' : 'Link pattern'"
                                @click="toggleLink(pattern.id)"
                            >
                                ⟳
                            </button>
                            <button
                                type="button"
                                class="flex-shrink-0 px-3 text-neutral-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-500 transition-colors"
                                style="min-width: 40px; min-height: 44px; font-size: 16px;"
                                aria-label="Delete pattern"
                                @click="patternsStore.deletePattern(pattern.id)"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                    <div class="border-t border-neutral-100 dark:border-neutral-800 px-4 py-2 bg-neutral-50 dark:bg-neutral-800">
                        <p class="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Built-in</p>
                    </div>
                </template>

                <div class="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
                    <button v-for="template in taskTemplates" :key="template.id" type="button"
                        class="w-full text-left px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        style="min-height: 44px;" @click="applyTemplate(template)">
                        {{ template.label }}
                    </button>
                </div>
            </div>
        </Transition>

        <Transition name="prompt">
            <div v-if="showPrompt"
                class="rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 p-4 flex flex-col gap-3">
                <p class="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                    {{ currentPrompt }}
                </p>
                <div class="flex gap-2 justify-end">
                    <button type="button"
                        class="px-3 py-1.5 rounded-lg text-xs text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                        style="min-height: 36px;" @click="showPrompt = false">
                        Done
                    </button>
                    <button type="button"
                        class="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-purple-500 hover:bg-purple-600 active:bg-purple-700 transition-colors"
                        style="min-height: 36px;" @click="nextPrompt">
                        {{ promptIndex < prompts.length - 1 ? 'Next' : 'Finish' }}
                    </button>
                </div>
            </div>
        </Transition>

        <BaseModal v-model="showTemplateConfirm" title="Add template steps?" confirm-label="Add anyway"
            @confirm="confirmApplyTemplate">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                This task already has steps. The template steps will be added below them.
            </p>
        </BaseModal>

        <div class="flex gap-2">
            <input v-model="newChildTitle" type="text" placeholder="Add a step..."
                class="flex-1 rounded-xl border px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                @keydown.enter="addChild" />
            <button type="button" aria-label="Add step"
                class="flex items-center justify-center rounded-xl bg-purple-500 active:bg-purple-600 transition-colors"
                style="min-width: 44px; min-height: 44px;" @click="addChild">
                <span class="text-white text-xl leading-none">+</span>
            </button>
        </div>

        <div class="flex gap-2">
            <button type="button" class="flex-1 py-2 px-3 rounded-xl text-sm border transition-colors"
                :class="showPrompt
                    ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'"
                style="min-height: 44px;" @click="onPromptToggle">
                Help me break this down
            </button>
            <button type="button" class="flex-1 py-2 px-3 rounded-xl text-sm border transition-colors"
                :class="showTemplatePicker
                    ? 'border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'"
                style="min-height: 44px;"
                @click="showTemplatePicker = !showTemplatePicker">
                Use a template
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import ChildTaskItem from '~/components/task/ChildTaskItem.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { taskTemplates } from '~/utils/taskTemplates'
import type { TaskTemplate } from '~/utils/taskTemplates'
import type { UserPattern } from '~/types'
import { usePatternsStore } from '~/stores/patterns'

const props = defineProps<{
    taskId: string
}>()

const tasksStore = useTasksStore()
const patternsStore = usePatternsStore()

const task = computed(() => tasksStore.getTaskById(props.taskId))
const children = computed(() => tasksStore.getChildTasks(props.taskId))
const linkedPattern = computed(() =>
    task.value?.pattern_id
        ? patternsStore.patterns.find(p => p.id === task.value!.pattern_id) ?? null
        : null
)

const completeCount = computed(() =>
    children.value.filter(t => t.status === 'done').length
)

const newChildTitle = ref('')

async function addChild() {
    const title = newChildTitle.value.trim()
    if (!title) return
    await tasksStore.addTask({ title, parent_id: props.taskId })
    newChildTitle.value = ''
}

// Fuzzy pattern suggestion
const suggestedPattern = computed<UserPattern | null>(() => {
    if (!task.value || children.value.length > 0) return null
    const titleWords = task.value.title.toLowerCase().split(/\s+/).filter(w => w.length >= 4)
    if (titleWords.length === 0) return null
    return patternsStore.patterns.find(pattern => {
        const patternWords = pattern.name.toLowerCase().split(/\s+/).filter(w => w.length >= 4)
        return titleWords.some(tw => patternWords.some(pw => pw.includes(tw) || tw.includes(pw)))
    }) ?? null
})

// Save as pattern
const showSaveAsPattern = ref(false)
const patternName = ref('')
const patternNameInput = ref<HTMLInputElement | null>(null)

watch(showSaveAsPattern, (val) => {
    if (val) {
        patternName.value = task.value?.title ?? ''
        nextTick(() => patternNameInput.value?.focus())
    }
})

async function toggleLink(patternId: string) {
    const newId = task.value?.pattern_id === patternId ? null : patternId
    await tasksStore.updateTask(props.taskId, { pattern_id: newId })
}

async function saveAsPattern() {
    const name = patternName.value.trim()
    if (!name || children.value.length === 0) return
    const steps = children.value.map(c => c.title)
    const newPattern = await patternsStore.savePattern(name, steps)
    if (newPattern) {
        await tasksStore.updateTask(props.taskId, { pattern_id: newPattern.id })
    }
    showSaveAsPattern.value = false
    patternName.value = ''
}

const prompts = [
    'What\'s the very first physical action needed to start this?',
    'What would "done" actually look like?',
    'Is there anything you need from someone else before you can begin?',
    'Can this be broken into chunks of 25 minutes or less?',
    'What\'s the smallest possible next step?',
]

const showPrompt = ref(false)
const promptIndex = ref(0)

const currentPrompt = computed(() => prompts[promptIndex.value])

function onPromptToggle() {
    promptIndex.value = 0
    showPrompt.value = !showPrompt.value
}

function nextPrompt() {
    if (promptIndex.value < prompts.length - 1) {
        promptIndex.value++
    } else {
        showPrompt.value = false
        promptIndex.value = 0
    }
}

const showTemplatePicker = ref(false)
const showTemplateConfirm = ref(false)
const pendingTemplate = ref<{ steps: string[] } | null>(null)

function applyTemplate(template: TaskTemplate) {
    showTemplatePicker.value = false
    if (children.value.length > 0) {
        pendingTemplate.value = { steps: template.subtasks }
        showTemplateConfirm.value = true
    } else {
        applySteps(template.subtasks)
    }
}

function applyUserPattern(pattern: UserPattern) {
    showTemplatePicker.value = false
    if (children.value.length > 0) {
        pendingTemplate.value = { steps: pattern.steps }
        showTemplateConfirm.value = true
    } else {
        applySteps(pattern.steps)
    }
}

function confirmApplyTemplate() {
    if (pendingTemplate.value) {
        applySteps(pendingTemplate.value.steps)
        pendingTemplate.value = null
    }
}

function applySteps(steps: string[]) {
    steps.forEach(title => {
        tasksStore.addTask({ title, parent_id: props.taskId })
    })
}
</script>

<style scoped>
.prompt-enter-active,
.prompt-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.prompt-enter-from,
.prompt-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
