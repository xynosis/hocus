export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
  ],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  app: {
    layoutTransition: false,
  },
  vite: {
    optimizeDeps: {
      include: [
        'vue-draggable-plus',
        'canvas-confetti',]
    }
  },

  supabase: {
    types: '~/types/database.types.ts',
    redirect: false,

  },
})