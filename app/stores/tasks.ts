import { defineStore } from 'pinia'
import type { Task, TaskStatus, TaskColor, TaskEnergy, TaskInterest, TaskRecurrence } from '~/types'
const error = ref<string | null>(null)

export interface CreateTaskPayload {
  title: string
  notes?: string | null
  color_tag?: TaskColor | null
  working_on_date?: string | null
  due_date?: string | null
  energy?: TaskEnergy | null
  interest?: TaskInterest | null
  estimated_minutes?: number | null
  parent_id?: string | null
  pattern_id?: string | null
  recurrence?: TaskRecurrence | null
  section_id?: string | null
  is_container?: boolean
}

export interface UpdateTaskPayload {
  title?: string
  notes?: string | null
  color_tag?: TaskColor | null
  working_on_date?: string | null
  due_date?: string | null
  status?: TaskStatus
  completed_at?: string | null
  energy?: TaskEnergy | null
  interest?: TaskInterest | null
  estimated_minutes?: number | null
  parent_id?: string | null
  pattern_id?: string | null
  recurrence?: TaskRecurrence | null
  section_id?: string | null
  is_container?: boolean
}

export const useTasksStore = defineStore('tasks', () => {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()

  const tasks = ref<Task[]>([])

  const sortedTasks = computed(() => {
    const statusOrder: Record<string, number> = { in_progress: 0, orbit: 1, todo: 2, done: 3 }
    return [...tasks.value].sort((a, b) => {
      const aOrder = statusOrder[a.status] ?? 2
      const bOrder = statusOrder[b.status] ?? 2
      if (aOrder !== bOrder) return aOrder - bOrder
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  })

  function getTaskById(id: string): Task | undefined {
    return tasks.value.find(t => t.id === id)
  }

  function getChildTasks(parentId: string): Task[] {
    return tasks.value
      .filter(t => t.parent_id === parentId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
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
      energy: payload.energy ?? null,
      interest: payload.interest ?? null,
      estimated_minutes: payload.estimated_minutes ?? null,
      parent_id: payload.parent_id ?? null,
      pattern_id: payload.pattern_id ?? null,
      recurrence: payload.recurrence ?? null,
      section_id: payload.section_id ?? null,
      is_container: payload.is_container ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
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
        energy: payload.energy ?? null,
        interest: payload.interest ?? null,
        estimated_minutes: payload.estimated_minutes ?? null,
        parent_id: payload.parent_id ?? null,
        pattern_id: payload.pattern_id ?? null,
        recurrence: payload.recurrence ?? null,
        section_id: payload.section_id ?? null,
        is_container: payload.is_container ?? false,
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
    // Also remove all descendants from local state (DB cascade handles the rest)
    const idsToRemove = collectDescendantIds(id)
    idsToRemove.add(id)
    const previous = [...tasks.value]
    tasks.value = tasks.value.filter(t => !idsToRemove.has(t.id))

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete task:', error.message)
      tasks.value = previous
    }
  }

  function collectDescendantIds(parentId: string, visited = new Set<string>()): Set<string> {
    const children = tasks.value.filter(t => t.parent_id === parentId)
    for (const child of children) {
      if (!visited.has(child.id)) {
        visited.add(child.id)
        collectDescendantIds(child.id, visited)
      }
    }
    return visited
  }

  async function setTaskStatus(id: string, status: TaskStatus): Promise<void> {
    const task = getTaskById(id)
    const completed_at = status === 'done' ? new Date().toISOString() : null
    await updateTask(id, { status, completed_at })
    if (status === 'done' && task?.recurrence) {
      await scheduleNextOccurrence(task)
    }
  }

  function bumpDate(date: string | null, recurrence: TaskRecurrence): string | null {
    if (!date) return null
    const d = new Date(date)
    if (recurrence === 'daily') d.setDate(d.getDate() + 1)
    else if (recurrence === 'weekly') d.setDate(d.getDate() + 7)
    else if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]!
  }

  async function scheduleNextOccurrence(task: Task): Promise<void> {
    await addTask({
      title: task.title,
      notes: task.notes,
      color_tag: task.color_tag,
      working_on_date: bumpDate(task.working_on_date, task.recurrence!),
      due_date: bumpDate(task.due_date, task.recurrence!),
      energy: task.energy,
      interest: task.interest,
      estimated_minutes: task.estimated_minutes,
      recurrence: task.recurrence,
      pattern_id: task.pattern_id,
    })
  }

  async function inferOrbitTasks(): Promise<void> {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const candidates = tasks.value.filter(t => {
      if (t.status !== 'in_progress') return false
      const children = getChildTasks(t.id)
      if (children.length === 0 && !t.is_container) {
        // Atomic task: orbit after 4h of no activity on the task itself
        return new Date(t.updated_at) < fourHoursAgo
      } else {
        // Container task: orbit after 3 days of no child activity
        const lastChildActivity = children.reduce((latest, child) => {
          const d = new Date(child.updated_at)
          return d > latest ? d : latest
        }, new Date(0))
        return lastChildActivity < threeDaysAgo
      }
    })
    await Promise.all(candidates.map(t => setTaskStatus(t.id, 'orbit')))
  }

  return {
    tasks, error,
    isLoading,
    sortedTasks,
    getTaskById,
    getChildTasks,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    inferOrbitTasks,
  }
})
