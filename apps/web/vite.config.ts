import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite({ tmpDir: 'node_modules/.tanstack/tmp' }), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
