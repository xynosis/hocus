import { defineStore } from 'pinia'
import type { UserPattern } from '~/types'

export const usePatternsStore = defineStore('patterns', () => {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()

  const patterns = ref<UserPattern[]>([])

  async function fetchPatterns() {
    const { data } = await supabase
      .from('user_patterns')
      .select('*')
      .order('created_at', { ascending: false })
    patterns.value = (data as UserPattern[]) ?? []
  }

  async function savePattern(name: string, steps: string[]): Promise<UserPattern | null> {
    const { data, error } = await supabase
      .from('user_patterns')
      .insert({ user_id: authStore.user!.id, name, steps })
      .select()
      .single()
    if (error) {
      console.error('Failed to save pattern:', error.message)
      return null
    }
    patterns.value.unshift(data as UserPattern)
    return data as UserPattern
  }

  async function deletePattern(id: string): Promise<void> {
    patterns.value = patterns.value.filter(p => p.id !== id)
    await supabase.from('user_patterns').delete().eq('id', id)
  }

  return { patterns, fetchPatterns, savePattern, deletePattern }
})
