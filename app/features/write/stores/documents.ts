import { defineStore } from 'pinia'
import type { WritingDocument } from '~/types'

export type CreateDocumentPayload = {
  title?: string
  content?: string
  task_id?: string | null
  tags?: string[]
}

export type UpdateDocumentPayload = Partial<Pick<WritingDocument, 'title' | 'content' | 'updated_at'>>

export const useDocumentsStore = defineStore('documents', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabaseClient() as any
  const authStore = useAuthStore()

  const documents = ref<WritingDocument[]>([])

  function getById(id: string): WritingDocument | undefined {
    return documents.value.find(d => d.id === id)
  }

  function getByTaskId(taskId: string): WritingDocument | undefined {
    return documents.value.find(d => d.task_id === taskId)
  }

  async function fetchAll(): Promise<void> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch documents:', error.message)
      return
    }

    documents.value = (data as WritingDocument[]) ?? []
  }

  async function fetchById(id: string): Promise<WritingDocument | null> {
    const existing = getById(id)
    if (existing) return existing

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to fetch document:', error.message)
      return null
    }

    const doc = data as WritingDocument
    documents.value.push(doc)
    return doc
  }

  async function create(payload: CreateDocumentPayload): Promise<WritingDocument | null> {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: authStore.user!.id,
        title: payload.title ?? 'Untitled',
        content: payload.content ?? '',
        task_id: payload.task_id ?? null,
        tags: payload.tags ?? [],
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create document:', error.message)
      return null
    }

    const doc = data as WritingDocument
    documents.value.unshift(doc)
    return doc
  }

  async function update(id: string, patch: UpdateDocumentPayload): Promise<void> {
    const index = documents.value.findIndex(d => d.id === id)
    const previous = index !== -1 ? { ...documents.value[index] } : null

    if (index !== -1) {
      documents.value[index] = {
        ...documents.value[index]!,
        ...patch,
        updated_at: new Date().toISOString(),
      }
    }

    const { error } = await supabase
      .from('documents')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Failed to update document:', error.message)
      if (index !== -1 && previous) documents.value[index] = previous as WritingDocument
    }
  }

  async function remove(id: string): Promise<void> {
    const previous = [...documents.value]
    documents.value = documents.value.filter(d => d.id !== id)

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete document:', error.message)
      documents.value = previous
    }
  }

  async function updateTags(id: string, tags: string[]): Promise<void> {
    const index = documents.value.findIndex(d => d.id === id)
    if (index !== -1) documents.value[index] = { ...documents.value[index]!, tags }
    await supabase.from('documents').update({ tags }).eq('id', id)
  }

  async function pin(id: string): Promise<void> {
    const pinned_at = new Date().toISOString()
    const index = documents.value.findIndex(d => d.id === id)
    if (index !== -1) documents.value[index] = { ...documents.value[index]!, pinned_at }
    await supabase.from('documents').update({ pinned_at }).eq('id', id)
  }

  async function unpin(id: string): Promise<void> {
    const index = documents.value.findIndex(d => d.id === id)
    if (index !== -1) documents.value[index] = { ...documents.value[index]!, pinned_at: null }
    await supabase.from('documents').update({ pinned_at: null }).eq('id', id)
  }

  return {
    documents,
    getById,
    getByTaskId,
    fetchAll,
    fetchById,
    create,
    update,
    updateTags,
    pin,
    unpin,
    remove,
  }
})
