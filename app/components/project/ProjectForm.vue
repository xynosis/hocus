<template>
    <Teleport to="body">
        <Transition name="sheet">
            <div v-if="modelValue"
                class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
                <div class="absolute inset-0 bg-black/40" @click="close" />
                <div class="relative bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl px-4 pt-3 pb-8 flex flex-col gap-3 w-full sm:max-w-md sm:mx-4"
                    style="max-height: 90vh; overflow-y: auto;">
                    <div class="flex items-center justify-center mb-1 sm:hidden">
                        <div class="w-8 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                    </div>

                    <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-100">
                        {{ isEditMode ? 'Edit project' : 'New project' }}
                    </h2>

                    <!-- Template picker (new project only) -->
                    <template v-if="!isEditMode">
                        <div v-if="!selectedTemplate">
                            <button
                                type="button"
                                class="w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors"
                                :class="showTemplatePicker
                                    ? 'border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                                style="min-height: 44px;"
                                @click="showTemplatePicker = !showTemplatePicker"
                            >
                                {{ showTemplatePicker ? 'Hide templates' : 'Start from a template…' }}
                            </button>
                            <Transition name="expand">
                                <div v-if="showTemplatePicker" class="mt-2 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                                    <button
                                        v-for="template in projectTemplates"
                                        :key="template.id"
                                        type="button"
                                        class="w-full text-left px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                                        style="min-height: 44px;"
                                        @click="applyTemplate(template)"
                                    >
                                        {{ template.label }}
                                        <span class="text-xs text-neutral-400 dark:text-neutral-500 ml-1">({{ template.tasks.length }} tasks)</span>
                                    </button>
                                </div>
                            </Transition>
                        </div>

                        <div v-else class="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 px-4 py-3 flex flex-col gap-2">
                            <div class="flex items-center justify-between">
                                <p class="text-xs font-medium text-purple-600 dark:text-purple-400">Template: {{ selectedTemplate.label }}</p>
                                <button type="button" class="text-purple-400 dark:text-purple-500 hover:text-purple-600 dark:hover:text-purple-300 transition-colors text-base" style="min-width: 32px; min-height: 32px;" @click="clearTemplate">×</button>
                            </div>
                            <ul class="flex flex-col gap-0.5">
                                <li v-for="task in selectedTemplate.tasks" :key="task" class="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                                    <span class="w-1 h-1 rounded-full bg-purple-400 dark:bg-purple-500 flex-shrink-0" />
                                    {{ task }}
                                </li>
                            </ul>
                        </div>
                    </template>

                    <div class="flex flex-col gap-1">
                        <input v-model="form.name" type="text" placeholder="Project name"
                            class="w-full rounded-xl border px-3 py-3 text-base bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            @keydown.enter="handleSubmit" />
                        <p v-if="showNameError" class="text-sm text-red-500 px-1">
                            A name is needed to save this project.
                        </p>
                    </div>

                    <textarea v-model="form.description" placeholder="Description (optional)" rows="3"
                        class="w-full rounded-xl border px-3 py-3 text-base bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-neutral-500 dark:text-neutral-400 px-1">Color</label>
                        <ColorTag v-model="form.color_tag" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-neutral-500 dark:text-neutral-400 px-1">Due date</label>
                        <input v-model="form.due_date" type="date"
                            class="w-full rounded-xl border px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                    </div>

                    <button type="button" class="w-full rounded-xl py-3 text-base font-medium transition-opacity"
                        :class="form.name.trim()
                            ? 'bg-purple-500 text-white active:opacity-80'
                            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'"
                        @click="handleSubmit">
                        Save project
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import type { Project, TaskColor } from '~/types'
import { projectTemplates } from '~/utils/projectTemplates'
import type { ProjectTemplate } from '~/utils/projectTemplates'

const props = defineProps<{
    modelValue: boolean
    project?: Project
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'submit': [payload: { name: string; description: string | null; due_date: string | null; color_tag: TaskColor | null; templateTaskTitles: string[] }]
}>()

const isEditMode = computed(() => !!props.project)
const showNameError = ref(false)
const selectedTemplate = ref<ProjectTemplate | null>(null)
const showTemplatePicker = ref(false)

const emptyForm = () => ({
    name: '',
    description: null as string | null,
    due_date: null as string | null,
    color_tag: null as TaskColor | null,
})

const form = reactive(emptyForm())

watch(
    () => props.modelValue,
    (open) => {
        if (open) {
            if (props.project) {
                form.name = props.project.name
                form.description = props.project.description
                form.due_date = props.project.due_date
                form.color_tag = props.project.color_tag
            } else {
                Object.assign(form, emptyForm())
                selectedTemplate.value = null
                showTemplatePicker.value = false
            }
            showNameError.value = false
        }
    }
)

function applyTemplate(template: ProjectTemplate) {
    selectedTemplate.value = template
    form.name = template.label
    showTemplatePicker.value = false
}

function clearTemplate() {
    selectedTemplate.value = null
}

function close() {
    emit('update:modelValue', false)
}

function handleSubmit() {
    if (!form.name.trim()) {
        showNameError.value = true
        return
    }
    emit('submit', {
        name: form.name.trim(),
        description: form.description || null,
        due_date: form.due_date || null,
        color_tag: form.color_tag,
        templateTaskTitles: selectedTemplate.value?.tasks ?? [],
    })
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
</style>