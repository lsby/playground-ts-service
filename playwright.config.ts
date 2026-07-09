import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './test/e2e',
  /* Run tests in files in parallel */
  fullyParallel: false, // E2E 涉及到清空数据库，最好串行运行避免互相干扰
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://127.0.0.1:9000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // 我们跑有头模式
    headless: false,
  },

  /* Configure projects for major browsers */
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  /* 自动拉起测试服务器 */
  webServer: {
    // 启动前先构建一下前端，然后拉起以 test-web 环境变量运行的服务端进程 (端口 9000)
    command: 'pnpm _build:web && pnpm run:service:test',
    url: 'http://127.0.0.1:9000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
