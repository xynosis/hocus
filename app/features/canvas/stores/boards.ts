import { defineStore } from 'pinia'
import type { Board } from '~/types'

export const useBoardsStore = defineStore('boards', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabaseClient() as any
  const authStore = useAuthStore()

  const boards = ref<Board[]>([])

  function getById(id: string): Board | undefined {
    return boards.value.find(b => b.id === id)
  }

  async function fetchAll(): Promise<void> {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch boards:', error.message)
      return
    }
    boards.value = (data as Board[]) ?? []
  }

  async function create(title = 'Untitled board'): Promise<Board | null> {
    const { data, error } = await supabase
      .from('boards')
      .insert({ user_id: authStore.user!.id, title })
      .select()
      .single()

    if (error) {
      console.error('Failed to create board:', error.message)
      return null
    }
    const board = data as Board
    boards.value.unshift(board)
    return board
  }

  async function updateTitle(id: string, title: string): Promise<void> {
    const index = boards.value.findIndex(b => b.id === id)
    if (index !== -1) {
      boards.value[index] = { ...boards.value[index]!, title, updated_at: new Date().toISOString() }
    }
    const { error } = await supabase
      .from('boards')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) console.error('Failed to update board:', error.message)
  }

  async function remove(id: string): Promise<void> {
    const previous = [...boards.value]
    boards.value = boards.value.filter(b => b.id !== id)
    const { error } = await supabase.from('boards').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete board:', error.message)
      boards.value = previous
    }
  }

  return { boards, getById, fetchAll, create, updateTitle, remove }
})
