import { defineStore } from 'pinia'

export interface TaskNote {
  id: string
  task_id: string
  user_id: string
  body: string
  created_at: string
}

export const useTaskNotesStore = defineStore('taskNotes', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabaseClient() as any
  const authStore = useAuthStore()

  const notes = ref<TaskNote[]>([])

  function getNotesForTask(taskId: string): TaskNote[] {
    return notes.value
      .filter(n => n.task_id === taskId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async function fetchNotes(): Promise<void> {
    const { data, error } = await supabase
      .from('task_notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch task notes:', error.message)
      return
    }

    notes.value = (data as TaskNote[]) ?? []
  }

  async function addNote(taskId: string, body: string): Promise<void> {
    const optimistic: TaskNote = {
      id: crypto.randomUUID(),
      task_id: taskId,
      user_id: authStore.user!.id,
      body,
      created_at: new Date().toISOString(),
    }

    notes.value.unshift(optimistic)

    const { data, error } = await supabase
      .from('task_notes')
      .insert({ task_id: taskId, user_id: authStore.user!.id, body })
      .select()
      .single()

    if (error) {
      console.error('Failed to add task note:', error.message)
      notes.value = notes.value.filter(n => n.id !== optimistic.id)
      return
    }

    const index = notes.value.findIndex(n => n.id === optimistic.id)
    if (index !== -1) notes.value[index] = data as TaskNote
  }

  async function deleteNote(id: string): Promise<void> {
    const previous = [...notes.value]
    notes.value = notes.value.filter(n => n.id !== id)

    const { error } = await supabase
      .from('task_notes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete task note:', error.message)
      notes.value = previous
    }
  }

  return {
    notes,
    getNotesForTask,
    fetchNotes,
    addNote,
    deleteNote,
  }
})
