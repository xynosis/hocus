import { defineStore } from 'pinia'
import type { Project, TaskProject } from '~/types'

const error = ref<string | null>(null)

export interface CreateProjectPayload {
    name: string
    description?: string | null
    due_date?: string | null
    color_tag?: TaskColor | null

}

export interface UpdateProjectPayload {
    name?: string
    description?: string | null
    due_date?: string | null
    color_tag?: TaskColor | null

}

export const useProjectsStore = defineStore('projects', () => {
    const supabase = useSupabaseClient()
    const authStore = useAuthStore()

    const projects = ref<Project[]>([])
    const taskProjects = ref<TaskProject[]>([])

    const sortedProjects = computed(() => {
        return [...projects.value].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
    })

    function getProjectById(id: string): Project | undefined {
        return projects.value.find(p => p.id === id)
    }

    function getProjectIdsForTask(taskId: string): string[] {
        return taskProjects.value
            .filter(tp => tp.task_id === taskId)
            .map(tp => tp.project_id)
    }

    function getTaskIdsForProject(projectId: string): string[] {
        return taskProjects.value
            .filter(tp => tp.project_id === projectId)
            .map(tp => tp.task_id)
    }

    function getMiscTaskIds(): string[] {
        const assignedTaskIds = new Set(taskProjects.value.map(tp => tp.task_id))
        const tasksStore = useTasksStore()
        return tasksStore.tasks
            .filter(t => !assignedTaskIds.has(t.id))
            .map(t => t.id)
    }

    const isLoading = ref(false)

    async function fetchProjects(): Promise<void> {
        isLoading.value = true
        error.value = null

        const { data, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: true })

        if (fetchError) {
            console.error('Failed to fetch projects:', fetchError.message)
            error.value = 'We couldn\'t load your projects. Please try again.'
            isLoading.value = false
            return
        }

        projects.value = (data as Project[]) ?? []
        isLoading.value = false
    }


    async function fetchTaskProjects(): Promise<void> {
        const { data, error } = await supabase
            .from('task_projects')
            .select('*')

        if (error) {
            console.error('Failed to fetch task_projects:', error.message)
            return
        }

        taskProjects.value = (data as TaskProject[]) ?? []
    }

    async function addProject(payload: CreateProjectPayload): Promise<Project | null> {
        const optimistic: Project = {
            id: crypto.randomUUID(),
            user_id: authStore.user!.id,
            name: payload.name,
            description: payload.description ?? null,
            due_date: payload.due_date ?? null,
            color_tag: payload.color_tag ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        projects.value.push(optimistic)

        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: authStore.user!.id,
                name: payload.name,
                description: payload.description ?? null,
                due_date: payload.due_date ?? null,
                color_tag: payload.color_tag ?? null,

            })
            .select()
            .single()

        if (error) {
            console.error('Failed to add project:', error.message)
            projects.value = projects.value.filter(p => p.id !== optimistic.id)
            return null
        }

        const index = projects.value.findIndex(p => p.id === optimistic.id)
        if (index !== -1) projects.value[index] = data as Project

        return data as Project
    }

    async function updateProject(id: string, payload: UpdateProjectPayload): Promise<void> {
        const index = projects.value.findIndex(p => p.id === id)
        if (index === -1) return

        const previous = { ...projects.value[index]! }
        projects.value[index] = {
            ...projects.value[index]!,
            ...payload,
            updated_at: new Date().toISOString(),
        }

        const { error } = await supabase
            .from('projects')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) {
            console.error('Failed to update project:', error.message)
            projects.value[index] = previous
        }
    }

    async function deleteProject(id: string): Promise<void> {
        const previousProjects = [...projects.value]
        const previousTaskProjects = [...taskProjects.value]

        projects.value = projects.value.filter(p => p.id !== id)
        taskProjects.value = taskProjects.value.filter(tp => tp.project_id !== id)

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Failed to delete project:', error.message)
            projects.value = previousProjects
            taskProjects.value = previousTaskProjects
        }
    }

    async function assignTaskToProject(taskId: string, projectId: string): Promise<void> {
        const already = taskProjects.value.some(
            tp => tp.task_id === taskId && tp.project_id === projectId
        )
        if (already) return

        const optimistic: TaskProject = {
            task_id: taskId,
            project_id: projectId,
            user_id: authStore.user!.id,
        }

        taskProjects.value.push(optimistic)

        const { error } = await supabase
            .from('task_projects')
            .insert({
                task_id: taskId,
                project_id: projectId,
                user_id: authStore.user!.id,
            })

        if (error) {
            console.error('Failed to assign task to project:', error.message)
            taskProjects.value = taskProjects.value.filter(
                tp => !(tp.task_id === taskId && tp.project_id === projectId)
            )
        }
    }

    async function removeTaskFromProject(taskId: string, projectId: string): Promise<void> {
        const previous = [...taskProjects.value]
        taskProjects.value = taskProjects.value.filter(
            tp => !(tp.task_id === taskId && tp.project_id === projectId)
        )

        const { error } = await supabase
            .from('task_projects')
            .delete()
            .eq('task_id', taskId)
            .eq('project_id', projectId)

        if (error) {
            console.error('Failed to remove task from project:', error.message)
            taskProjects.value = previous
        }
    }

    async function syncTaskProjects(taskId: string, projectIds: string[]): Promise<void> {
        const current = getProjectIdsForTask(taskId)
        const toAdd = projectIds.filter(id => !current.includes(id))
        const toRemove = current.filter(id => !projectIds.includes(id))

        await Promise.all([
            ...toAdd.map(id => assignTaskToProject(taskId, id)),
            ...toRemove.map(id => removeTaskFromProject(taskId, id)),
        ])
    }

    return {
        projects, error,
        isLoading,
        taskProjects,
        sortedProjects,
        getProjectById,
        getProjectIdsForTask,
        getTaskIdsForProject,
        getMiscTaskIds,
        fetchProjects,
        fetchTaskProjects,
        addProject,
        updateProject,
        deleteProject,
        assignTaskToProject,
        removeTaskFromProject,
        syncTaskProjects,
    }
})