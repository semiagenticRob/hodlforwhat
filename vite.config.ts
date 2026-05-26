/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/hodlforwhat/',
  test: {
    globals: true,
    environment: 'happy-dom',
  },
});
