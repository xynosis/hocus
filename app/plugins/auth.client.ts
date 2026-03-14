export default defineNuxtPlugin({
  name: 'auth',
  enforce: 'pre',
  async setup() {
    const supabase = useSupabaseClient()
    const sessionReady = useState('sessionReady', () => false)

    await new Promise<void>((resolve) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'INITIAL_SESSION') {
          subscription.unsubscribe()
          resolve()
        }
      })
    })

    sessionReady.value = true
  }
})