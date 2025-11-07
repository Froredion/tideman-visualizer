import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build config for the demo site (GitHub Pages)
export default defineConfig({
  plugins: [react()],
  root: 'example',
  base: '/tideman-visualizer/', // Important: set to your repo name
  publicDir: 'public',
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
})

