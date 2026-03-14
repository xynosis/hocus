<template>
    <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between px-1">
            <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-100">Subtasks</h2>
            <span v-if="subtasks.length > 0" class="text-sm text-neutral-400 dark:text-neutral-500">
                {{ completeCount }} of {{ subtasks.length }} done
            </span>
        </div>

        <div v-if="subtasks.length === 0" class="px-1">
            <p class="text-sm text-neutral-400 dark:text-neutral-500">
                No steps yet. Add one below or use a template.
            </p>
        </div>

        <VueDraggable v-else v-model="draggableSubtasks" :animation="200" handle=".drag-handle"
            class="flex flex-col gap-2" @end="onReorder">
            <SubtaskItem v-for="subtask in draggableSubtasks" :key="subtask.id" :subtask="subtask" drag-handle />
        </VueDraggable>
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
                        {{ promptIndex < prompts.length - 1 ? 'Next' : 'Finish' }} </button>
                </div>
            </div>
        </Transition>
        <BaseModal v-model="showTemplateConfirm" title="Add template subtasks?" confirm-label="Add anyway"
            @confirm="confirmApplyTemplate">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                This task already has subtasks. The template steps will be added below them.
            </p>
        </BaseModal>

        <div class="flex gap-2">
            <input v-model="newSubtaskTitle" type="text" placeholder="Add a subtask..."
                class="flex-1 rounded-xl border px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                @keydown.enter="addSubtask" />
            <button type="button" aria-label="Add subtask"
                class="flex items-center justify-center rounded-xl bg-purple-500 active:bg-purple-600 transition-colors"
                style="min-width: 44px; min-height: 44px;" @click="addSubtask">
                <span class="text-white text-xl leading-none">+</span>
            </button>
        </div>

        <div class="flex gap-2">
            <button type="button" class="flex-1 py-2 px-3 rounded-xl text-sm border transition-colors"
                :class="showPrompt
                    ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'" style="min-height: 44px;" @click="onPromptToggle">
                Help me break this down
            </button>
            <button type="button" class="flex-1 py-2 px-3 rounded-xl text-sm border transition-colors"
                :class="showTemplatePicker
                    ? 'border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'" style="min-height: 44px;"
                @click="showTemplatePicker = !showTemplatePicker">
                Use a template
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { useSubtasksStore } from '~/stores/subtasks'
import type { Subtask } from '~/types'
import SubtaskItem from '~/components/task/SubtaskItem.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { taskTemplates } from '~/utils/taskTemplates'
import type { TaskTemplate } from '~/utils/taskTemplates'

const props = defineProps<{
    taskId: string
}>()

const subtasksStore = useSubtasksStore()

const subtasks = computed(() => subtasksStore.getSubtasksByTaskId(props.taskId))

const draggableSubtasks = ref<Subtask[]>([])

watch(subtasks, (val) => {
    draggableSubtasks.value = [...val]
}, { immediate: true })

const completeCount = computed(() =>
    draggableSubtasks.value.filter(s => s.is_complete).length
)

const newSubtaskTitle = ref('')

function addSubtask() {
    const title = newSubtaskTitle.value.trim()
    if (!title) return
    subtasksStore.addSubtask(props.taskId, title)
    newSubtaskTitle.value = ''
}

function onReorder() {
    subtasksStore.reorderSubtasks(props.taskId, draggableSubtasks.value)
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
const pendingTemplate = ref<TaskTemplate | null>(null)

function applyTemplate(template: TaskTemplate) {
    showTemplatePicker.value = false
    if (subtasks.value.length > 0) {
        pendingTemplate.value = template
        showTemplateConfirm.value = true
    } else {
        applyTemplateSubtasks(template)
    }
}

function confirmApplyTemplate() {
    if (pendingTemplate.value) {
        applyTemplateSubtasks(pendingTemplate.value)
        pendingTemplate.value = null
    }
}

function applyTemplateSubtasks(template: TaskTemplate) {
    template.subtasks.forEach(title => {
        subtasksStore.addSubtask(props.taskId, title)
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