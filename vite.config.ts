/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: 'src/test/setupTests.ts',
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "." },
      ]
    })
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    }
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: "popup.html",
        background: "src/backend/background.ts"
      },
      output: {
        entryFileNames: "[name].js",
      }
    }
  }
})
