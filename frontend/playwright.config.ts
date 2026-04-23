import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the weekly-commit-module e2e smoke suite.
 *
 * Default baseURL points at the live Railway deploy so the suite runs
 * without needing a local docker-compose up. Override with E2E_BASE_URL
 * for CI runs against local docker-compose (e.g. E2E_BASE_URL=http://localhost:5173).
 */

const baseURL = process.env.E2E_BASE_URL || "https://aware-adaptation-production-9167.up.railway.app";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts$/,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false, // shared demo user session; avoid race on mutations
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
