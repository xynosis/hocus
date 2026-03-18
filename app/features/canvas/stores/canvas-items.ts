import { defineStore } from 'pinia'
import type { CanvasItem, NoteColor } from '~/types'

export type AddItemPayload = {
  board_id: string
  item_type: 'task' | 'document' | 'note'
  task_id?: string | null
  document_id?: string | null
  note_text?: string | null
  note_color?: NoteColor
  x: number
  y: number
}

export const useCanvasItemsStore = defineStore('canvasItems', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabaseClient() as any
  const authStore = useAuthStore()

  const items = ref<CanvasItem[]>([])

  function getById(id: string): CanvasItem | undefined {
    return items.value.find(i => i.id === id)
  }

  function getForBoard(boardId: string): CanvasItem[] {
    return items.value.filter(i => i.board_id === boardId)
  }

  function taskOnBoard(boardId: string, taskId: string): boolean {
    return items.value.some(i => i.board_id === boardId && i.task_id === taskId)
  }

  function documentOnBoard(boardId: string, documentId: string): boolean {
    return items.value.some(i => i.board_id === boardId && i.document_id === documentId)
  }

  async function fetchForBoard(boardId: string): Promise<void> {
    const { data, error } = await supabase
      .from('canvas_items')
      .select('*')
      .eq('board_id', boardId)

    if (error) {
      console.error('Failed to fetch canvas items:', error.message)
      return
    }
    // Replace items for this board
    items.value = [
      ...items.value.filter(i => i.board_id !== boardId),
      ...((data as CanvasItem[]) ?? []),
    ]
  }

  async function add(payload: AddItemPayload): Promise<CanvasItem | null> {
    const { data, error } = await supabase
      .from('canvas_items')
      .insert({
        user_id: authStore.user!.id,
        board_id: payload.board_id,
        item_type: payload.item_type,
        task_id: payload.task_id ?? null,
        document_id: payload.document_id ?? null,
        note_text: payload.note_text ?? null,
        note_color: payload.note_color ?? 'yellow',
        x: payload.x,
        y: payload.y,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to add canvas item:', error.message)
      return null
    }
    const item = data as CanvasItem
    items.value.push(item)
    return item
  }

  async function remove(id: string): Promise<void> {
    const previous = [...items.value]
    items.value = items.value.filter(i => i.id !== id)
    const { error } = await supabase.from('canvas_items').delete().eq('id', id)
    if (error) {
      console.error('Failed to remove canvas item:', error.message)
      items.value = previous
    }
  }

  // Move locally (no DB call — called on every pointermove during drag)
  function moveLocal(id: string, x: number, y: number): void {
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index]!, x, y }
    }
  }

  // Persist position to DB (called on pointerup)
  async function updatePosition(id: string, x: number, y: number): Promise<void> {
    const { error } = await supabase
      .from('canvas_items')
      .update({ x, y })
      .eq('id', id)
    if (error) console.error('Failed to save position:', error.message)
  }

  async function updateNote(id: string, text: string): Promise<void> {
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) items.value[index] = { ...items.value[index]!, note_text: text }
    const { error } = await supabase
      .from('canvas_items')
      .update({ note_text: text })
      .eq('id', id)
    if (error) console.error('Failed to update note:', error.message)
  }

  async function updateColor(id: string, color: NoteColor): Promise<void> {
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) items.value[index] = { ...items.value[index]!, note_color: color }
    const { error } = await supabase
      .from('canvas_items')
      .update({ note_color: color })
      .eq('id', id)
    if (error) console.error('Failed to update note color:', error.message)
  }

  return {
    items,
    getById,
    getForBoard,
    taskOnBoard,
    documentOnBoard,
    fetchForBoard,
    add,
    remove,
    moveLocal,
    updatePosition,
    updateNote,
    updateColor,
  }
})
