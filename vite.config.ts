import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'Культура.РФ - Летописи',
        short_name: 'Летописи',
        description: 'Исследование древнерусских летописей',
        theme_color: '#850000',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/upload\.wikimedia\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wikimedia-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 дней
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  // Для GitHub Pages используем базовый путь репозитория
  base: command === 'build' && process.env.GITHUB_PAGES ? '/ChronicleSearch_frontend/' : '/',
  server: {
    // HTTPS для PWA
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost+3-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost+3.pem')),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/sign_up': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/books': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      usePolling: true, 
    },
    host: true, 
    strictPort: true, 
    port: 3000, 
  },
}))
