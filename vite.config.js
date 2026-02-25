import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 4002,
        strictPort: true,
        host: '0.0.0.0'
    },
    preview: {
        port: 4002,
        strictPort: true,
        host: '0.0.0.0'
    },
    optimizeDeps: {
        include: ['@supabase/supabase-js']
    }
});
