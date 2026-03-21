import { defineStore } from 'pinia'
import type { WriteTemplate } from '~/types'

export const useWriteTemplatesStore = defineStore('write-templates', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabaseClient() as any
  const authStore = useAuthStore()

  const templates = ref<WriteTemplate[]>([])

  async function fetchAll(): Promise<void> {
    const { data, error } = await supabase
      .from('write_templates')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[write-templates] fetchAll error:', error.message)
    } else {
      templates.value = (data as WriteTemplate[]) ?? []
    }
  }

  async function save(title: string, content: string): Promise<WriteTemplate | null> {
    const { data, error } = await supabase
      .from('write_templates')
      .insert({ user_id: authStore.user!.id, title, content })
      .select()
      .single()
    if (error) {
      console.error('[write-templates] save error:', error.message)
      return null
    }
    const t = data as WriteTemplate
    templates.value.unshift(t)
    return t
  }

  async function rename(id: string, title: string): Promise<void> {
    const idx = templates.value.findIndex(t => t.id === id)
    if (idx !== -1) templates.value[idx] = { ...templates.value[idx]!, title }
    await supabase.from('write_templates').update({ title }).eq('id', id)
  }

  async function remove(id: string): Promise<void> {
    templates.value = templates.value.filter(t => t.id !== id)
    await supabase.from('write_templates').delete().eq('id', id)
  }

  return { templates, fetchAll, save, rename, remove }
})
