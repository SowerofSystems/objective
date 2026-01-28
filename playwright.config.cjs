// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * Playwright configuration for OBJECTIVE Calculator tests
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: "./test",
  testMatch: "**/*.spec.cjs",

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use (open: 'never' prevents auto-opening browser)
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],

  use: {
    // Base URL for all tests
    baseURL: "file://" + __dirname,

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Screenshot only on failure
    screenshot: "only-on-failure",
  },

  // Configure projects for major browsers
  projects: [
    // Chromium has SIGSEGV crashes on macOS - use webkit
    // {
    //   name: "chromium",
    //   use: { ...devices["Desktop Chrome"] },
    // },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
