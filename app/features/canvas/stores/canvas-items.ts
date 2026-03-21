import { defineStore } from 'pinia'
import type { CanvasItem, NoteColor } from '~/types'

export type AddItemPayload = {
  board_id: string
  item_type: 'task' | 'document' | 'note' | 'image' | 'frame' | 'rect' | 'ellipse'
  task_id?: string | null
  document_id?: string | null
  note_text?: string | null
  note_color?: NoteColor
  image_url?: string | null
  frame_id?: string | null
  width?: number | null
  height?: number | null
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
        note_color: payload.note_color ?? 'none',
        image_url: payload.image_url ?? null,
        frame_id: payload.frame_id ?? null,
        width: payload.width ?? null,
        height: payload.height ?? null,
        sort_order: Date.now(),
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

  async function updateSize(id: string, width: number, height: number): Promise<void> {
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) items.value[index] = { ...items.value[index]!, width, height }
    const { error } = await supabase
      .from('canvas_items')
      .update({ width, height })
      .eq('id', id)
    if (error) console.error('Failed to update size:', error.message)
  }

  // Update size locally only (called on every pointermove during shape resize)
  function sizeLocal(id: string, width: number, height: number): void {
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) items.value[index] = { ...items.value[index]!, width, height }
  }

  async function bringToFront(id: string): Promise<void> {
    const contentItems = items.value.filter(i => i.item_type !== 'frame')
    const maxOrder = contentItems.reduce((m, i) => Math.max(m, i.sort_order), 0)
    const newOrder = maxOrder + 1
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) items.value[index] = { ...items.value[index]!, sort_order: newOrder }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('canvas_items').update({ sort_order: newOrder }).eq('id', id)
  }

  async function sendToBack(id: string): Promise<void> {
    const contentItems = items.value.filter(i => i.item_type !== 'frame')
    const minOrder = contentItems.reduce((m, i) => Math.min(m, i.sort_order), 0)
    const newOrder = minOrder - 1
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) items.value[index] = { ...items.value[index]!, sort_order: newOrder }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('canvas_items').update({ sort_order: newOrder }).eq('id', id)
  }

  async function groupItems(ids: string[]): Promise<void> {
    const groupId = crypto.randomUUID()
    for (const id of ids) {
      const index = items.value.findIndex(i => i.id === id)
      if (index !== -1) items.value[index] = { ...items.value[index]!, group_id: groupId }
    }
    const { error } = await supabase
      .from('canvas_items')
      .update({ group_id: groupId })
      .in('id', ids)
    if (error) console.error('Failed to group items:', error.message)
  }

  async function ungroupItems(groupId: string): Promise<void> {
    for (let i = 0; i < items.value.length; i++) {
      if (items.value[i]!.group_id === groupId) {
        items.value[i] = { ...items.value[i]!, group_id: null }
      }
    }
    const { error } = await supabase
      .from('canvas_items')
      .update({ group_id: null })
      .eq('group_id', groupId)
    if (error) console.error('Failed to ungroup items:', error.message)
  }

  async function updateFrameId(id: string, frameId: string | null): Promise<void> {
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) items.value[index] = { ...items.value[index]!, frame_id: frameId }
    const { error } = await supabase
      .from('canvas_items')
      .update({ frame_id: frameId })
      .eq('id', id)
    if (error) console.error('Failed to update frame_id:', error.message)
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
    sizeLocal,
    updatePosition,
    updateNote,
    updateColor,
    updateSize,
    bringToFront,
    sendToBack,
    groupItems,
    ungroupItems,
    updateFrameId,
  }
})
