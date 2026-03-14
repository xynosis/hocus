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

const props = defineProps<{
    modelValue: boolean
    project?: Project
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'submit': [payload: { name: string; description: string | null; due_date: string | null; color_tag: TaskColor | null }]
}>()

const isEditMode = computed(() => !!props.project)
const showNameError = ref(false)

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
            }
            showNameError.value = false
        }
    }
)

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