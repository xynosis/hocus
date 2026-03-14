import { defineStore } from 'pinia'
import type { Task, TaskStatus, TaskColor } from '~/types'
const error = ref<string | null>(null)

export interface CreateTaskPayload {
  title: string
  notes?: string | null
  color_tag?: TaskColor | null
  working_on_date?: string | null
  due_date?: string | null
}

export interface UpdateTaskPayload {
  title?: string
  notes?: string | null
  color_tag?: TaskColor | null
  working_on_date?: string | null
  due_date?: string | null
  status?: TaskStatus
  completed_at?: string | null

}

export const useTasksStore = defineStore('tasks', () => {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()

  const tasks = ref<Task[]>([])

  const sortedTasks = computed(() => {
    return [...tasks.value].sort((a, b) => {
      if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
      if (a.status !== 'in_progress' && b.status === 'in_progress') return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  })

  function getTaskById(id: string): Task | undefined {
    return tasks.value.find(t => t.id === id)
  }

  const isLoading = ref(false)

  async function fetchTasks() {
    isLoading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Failed to fetch tasks:', fetchError.message)
      error.value = 'We couldn\'t load your tasks. Please try again.'
      isLoading.value = false
      return
    }

    tasks.value = (data as Task[]) ?? []
    isLoading.value = false
  }
  async function addTask(payload: CreateTaskPayload): Promise<Task | null> {
    const optimisticTask: Task = {
      id: crypto.randomUUID(),
      user_id: authStore.user!.id,
      title: payload.title,
      notes: payload.notes ?? null,
      color_tag: payload.color_tag ?? null,
      working_on_date: payload.working_on_date ?? null,
      due_date: payload.due_date ?? null,
      status: 'todo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    tasks.value.unshift(optimisticTask)

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: authStore.user!.id,
        title: payload.title,
        notes: payload.notes ?? null,
        color_tag: payload.color_tag ?? null,
        working_on_date: payload.working_on_date ?? null,
        due_date: payload.due_date ?? null,
        status: 'todo',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to add task:', error.message)
      tasks.value = tasks.value.filter(t => t.id !== optimisticTask.id)
      return null
    }

    const index = tasks.value.findIndex(t => t.id === optimisticTask.id)
    if (index !== -1) tasks.value[index] = data as Task

    return data as Task
  }

  async function updateTask(id: string, payload: UpdateTaskPayload): Promise<void> {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return

    const previous = { ...tasks.value[index]! }
    tasks.value[index] = {
      ...tasks.value[index]!,
      ...payload,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('tasks')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Failed to update task:', error.message)
      tasks.value[index] = previous
    }
  }

  async function deleteTask(id: string): Promise<void> {
    const previous = [...tasks.value]
    tasks.value = tasks.value.filter(t => t.id !== id)

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete task:', error.message)
      tasks.value = previous
    }
  }

  async function setTaskStatus(id: string, status: TaskStatus): Promise<void> {
    const completed_at = status === 'done' ? new Date().toISOString() : null
    await updateTask(id, { status, completed_at })
  }


  return {
    tasks, error,
    isLoading,
    sortedTasks,
    getTaskById,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
  }
})