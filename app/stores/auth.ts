import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()

  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)

  async function init() {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  async function login(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    return null
  }

  async function signup(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return error.message
    return null
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  return {
    user,
    isLoggedIn,
    init,
    login,
    signup,
    logout,
  }
})