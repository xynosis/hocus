import { defineStore } from 'pinia'

export const useKeywordsStore = defineStore('user-keywords', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabaseClient() as any
  const authStore = useAuthStore()

  const keywords = ref<string[]>([])

  async function fetchAll(): Promise<void> {
    const { data, error } = await supabase
      .from('user_keywords')
      .select('text')
      .order('created_at', { ascending: true })
    if (error) {
      console.error('[keywords] fetchAll error:', error.message)
    } else {
      keywords.value = (data as { text: string }[]).map(r => r.text)
    }
  }

  async function add(text: string): Promise<void> {
    const trimmed = text.trim().toLowerCase()
    if (!trimmed || keywords.value.includes(trimmed)) return
    keywords.value = [...keywords.value, trimmed]
    const { error } = await supabase
      .from('user_keywords')
      .upsert({ user_id: authStore.user!.id, text: trimmed }, { onConflict: 'user_id,text' })
    if (error) {
      console.error('[keywords] add error:', error.message)
      keywords.value = keywords.value.filter(k => k !== trimmed)
    }
  }

  async function remove(text: string): Promise<void> {
    keywords.value = keywords.value.filter(k => k !== text)
    await supabase
      .from('user_keywords')
      .delete()
      .eq('user_id', authStore.user!.id)
      .eq('text', text)
  }

  return { keywords, fetchAll, add, remove }
})
