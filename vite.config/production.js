import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist/web',
    assetsDir: 'assets',
    sourcemap: false,
  },
})
