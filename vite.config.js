import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './',
  server: {
    port: 5175,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
