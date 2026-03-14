export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/auth/login', '/auth/signup', '/confirm']
  if (publicRoutes.includes(to.path)) return

  const sessionReady = useState('sessionReady', () => false)

  if (!sessionReady.value) {
    await new Promise<void>(resolve => {
      const stop = watch(sessionReady, (ready) => {
        if (ready) {
          stop()
          resolve()
        }
      })
    })
  }

  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()

  if (!data.session) {
    return navigateTo('/auth/login')
  }
})