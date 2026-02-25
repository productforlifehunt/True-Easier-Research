import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { componentTagger } from 'lovable-tagger'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  server: {
    port: 8080,
    strictPort: true,
    host: '0.0.0.0'
  },
  preview: {
    port: 8080,
    strictPort: true,
    host: '0.0.0.0'
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  }
}))
