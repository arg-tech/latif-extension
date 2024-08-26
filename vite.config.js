import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

// Bootstrap icons requires the viewBox to be kept to resize the icon inline
// with the current font size.
const initialisedSvgLoader = svgLoader({
  svgo: false
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), initialisedSvgLoader],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        content: 'src/content.js',
        'service-worker': 'src/service-worker.js'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name !== 'index') {
            return chunkInfo.name + '.js'
          }
          return 'assets/[name].[hash].js'
        },
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})
