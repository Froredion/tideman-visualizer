import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build as a library to publish on npm
export default defineConfig({
  plugins: [react()],
  root: 'example', // Point to example folder for dev server
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TidemanVisualizer',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.es.js' : 'index.cjs',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
  },
})
