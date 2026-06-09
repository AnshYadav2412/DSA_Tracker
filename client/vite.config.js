import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // /lc-graphql  →  https://leetcode.com/graphql  (server-side, no CORS)
      '/lc-graphql': {
        target: 'https://leetcode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lc-graphql/, '/graphql'),
        secure: true,
      },
    },
  },
})

