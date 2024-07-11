import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/interface/**/*.ts', 'src/model/**/*.ts', 'src/plugin/**/*.ts'],
      exclude: ['node_modules/', 'test/', 'src/interface/**/*.test.ts'],
    },
    include: ['test/**/*.test.ts'],
    testTimeout: 99999999999,
  },
})
