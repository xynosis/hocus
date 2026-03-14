import { defineStore } from 'pinia'
import type { Subtask } from '~/types'

export interface CreateSubtaskPayload {
  title: string
}

export interface UpdateSubtaskPayload {
  title?: string
  is_complete?: boolean
  sort_order?: number
}

export const useSubtasksStore = defineStore('subtasks', () => {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()

  const subtasks = ref<Subtask[]>([])

  function getSubtasksByTaskId(taskId: string): Subtask[] {
    return subtasks.value
      .filter(s => s.task_id === taskId)
      .sort((a, b) => a.sort_order - b.sort_order)
  }

  async function fetchSubtasks(taskId: string): Promise<void> {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch subtasks:', error.message)
      return
    }

    const existing = subtasks.value.filter(s => s.task_id !== taskId)
    subtasks.value = [...existing, ...(data as Subtask[])]
  }

  async function fetchAllSubtasks(): Promise<void> {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch subtasks:', error.message)
      return
    }

    subtasks.value = (data as Subtask[]) ?? []
  }

  async function addSubtask(taskId: string, title: string): Promise<Subtask | null> {
    const existing = getSubtasksByTaskId(taskId)
    const nextOrder = existing.length > 0
      ? Math.max(...existing.map(s => s.sort_order)) + 1
      : 0

    const optimistic: Subtask = {
      id: crypto.randomUUID(),
      task_id: taskId,
      user_id: authStore.user!.id,
      title,
      is_complete: false,
      estimated_minutes: null,
      sort_order: nextOrder,
      created_at: new Date().toISOString(),
    }

    subtasks.value.push(optimistic)

    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        user_id: authStore.user!.id,
        title,
        is_complete: false,
        sort_order: nextOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to add subtask:', error.message)
      subtasks.value = subtasks.value.filter(s => s.id !== optimistic.id)
      return null
    }

    const index = subtasks.value.findIndex(s => s.id === optimistic.id)
    if (index !== -1) subtasks.value[index] = data as Subtask

    return data as Subtask
  }

  async function updateSubtask(id: string, payload: UpdateSubtaskPayload): Promise<void> {
    const index = subtasks.value.findIndex(s => s.id === id)
    if (index === -1) return

    const previous = { ...subtasks.value[index]! }
    subtasks.value[index] = { ...subtasks.value[index]!, ...payload }

    const { error } = await supabase
      .from('subtasks')
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('Failed to update subtask:', error.message)
      subtasks.value[index] = previous
    }
  }

  async function deleteSubtask(id: string): Promise<void> {
    const previous = [...subtasks.value]
    subtasks.value = subtasks.value.filter(s => s.id !== id)

    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete subtask:', error.message)
      subtasks.value = previous
    }
  }

  async function toggleSubtask(id: string): Promise<void> {
    const subtask = subtasks.value.find(s => s.id === id)
    if (!subtask) return
    await updateSubtask(id, { is_complete: !subtask.is_complete })
  }

  async function reorderSubtasks(taskId: string, newOrder: Subtask[]): Promise<void> {
    newOrder.forEach((subtask, index) => {
      const i = subtasks.value.findIndex(s => s.id === subtask.id)
      if (i !== -1) subtasks.value[i]!.sort_order = index
    })

    await Promise.all(
      newOrder.map((subtask, index) =>
        supabase
          .from('subtasks')
          .update({ sort_order: index })
          .eq('id', subtask.id)
      )
    )
  }

  return {
    subtasks,
    getSubtasksByTaskId,
    fetchSubtasks,
    fetchAllSubtasks,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    reorderSubtasks,
  }
})