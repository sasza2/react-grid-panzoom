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
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/stories/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/types.ts',
      ],
      reporter: ['text', 'html'],
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
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
