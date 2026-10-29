export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '~/assets/css/interior.css', '~/assets/css/content.css', '~/assets/css/lite-premium.css', '~/assets/css/welcome-premium.css', '~/assets/css/entry-cinematic.css'],
  app: {
    head: {
      title: 'Robert | My Little World',
      meta: [
        { name: 'description', content: 'An interactive miniature-world portfolio built with Nuxt, Three.js and GSAP.' },
        { name: 'theme-color', content: '#eef3e8' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap' },
      ],
    },
  },
})
