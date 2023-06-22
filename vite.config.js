import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test.setup.js',
    coverage: {
      provider: 'v8',
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src', 'index.ts'),
      name: 'ReactGridPanZoom',
      fileName: 'main',
    },
    target: 'es2015',
    rollupOptions: {
      external: ['react'],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
        },
      },
    },
  },
});
