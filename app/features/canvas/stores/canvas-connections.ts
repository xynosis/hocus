import { defineStore } from 'pinia'

export interface CanvasConnection {
  id: string
  board_id: string
  user_id: string
  from_item_id: string
  to_item_id: string
  label: string | null
  created_at: string
}

export const useCanvasConnectionsStore = defineStore('canvas-connections', () => {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()
  const connections = ref<CanvasConnection[]>([])

  function getForBoard(boardId: string) {
    return connections.value.filter(c => c.board_id === boardId)
  }

  async function fetchForBoard(boardId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('canvas_connections')
      .select('*')
      .eq('board_id', boardId)
    if (error) {
      console.error('[canvas-connections] fetchForBoard error:', error.message)
    } else if (data) {
      connections.value = [
        ...connections.value.filter(c => c.board_id !== boardId),
        ...data,
      ]
    }
  }

  async function add(fromItemId: string, toItemId: string, boardId: string) {
    const temp: CanvasConnection = {
      id: crypto.randomUUID(),
      board_id: boardId,
      user_id: authStore.user!.id,
      from_item_id: fromItemId,
      to_item_id: toItemId,
      label: null,
      created_at: new Date().toISOString(),
    }
    connections.value.push(temp)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('canvas_connections')
      .insert(temp)
      .select()
      .single()
    if (error) {
      console.error('[canvas-connections] add error:', error.message)
      connections.value = connections.value.filter(c => c.id !== temp.id)
    } else if (data) {
      const idx = connections.value.findIndex(c => c.id === temp.id)
      if (idx !== -1) connections.value[idx] = data
    }
  }

  async function updateLabel(id: string, label: string): Promise<void> {
    const idx = connections.value.findIndex(c => c.id === id)
    if (idx !== -1) connections.value[idx] = { ...connections.value[idx]!, label: label || null }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('canvas_connections')
      .update({ label: label || null })
      .eq('id', id)
  }

  async function remove(id: string) {
    connections.value = connections.value.filter(c => c.id !== id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('canvas_connections').delete().eq('id', id)
  }

  function removeForItem(itemId: string) {
    const toRemove = connections.value.filter(
      c => c.from_item_id === itemId || c.to_item_id === itemId
    )
    for (const c of toRemove) remove(c.id)
  }

  return { connections, getForBoard, fetchForBoard, add, updateLabel, remove, removeForItem }
})
