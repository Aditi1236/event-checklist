import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 4000}`,
        changeOrigin: true,
        configure: (proxy) => {
          // Ensure Server-Sent Events (live sync) are streamed, not buffered.
          proxy.on('proxyRes', (proxyRes) => {
            const type = proxyRes.headers['content-type'] || '';
            if (type.includes('text/event-stream')) {
              proxyRes.headers['cache-control'] = 'no-cache, no-transform';
              proxyRes.headers['connection'] = 'keep-alive';
            }
          });
        },
      },
    },
  },
})
