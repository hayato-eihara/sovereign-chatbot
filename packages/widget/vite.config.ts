import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'SovereignChatbot',
      fileName: 'sovereign-chatbot',
      formats: ['umd'],
    },
    // React is bundled in — the host page cannot be assumed to have it
    rollupOptions: {},
  },
})
