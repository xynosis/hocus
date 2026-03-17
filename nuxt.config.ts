export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt',
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Hocus',
      short_name: 'Hocus',
      description: 'ADHD-friendly task and focus management',
      theme_color: '#7F77DD',
      background_color: '#fafaf9',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'supabase-cache',
            networkTimeoutSeconds: 10,
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'google-fonts-cache' },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-assets',
            expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  app: {
    layoutTransition: false,
    app: {
      layoutTransition: false,
      head: {
        title: 'Hocus',
        link: [
          { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        ]
      }
    },
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