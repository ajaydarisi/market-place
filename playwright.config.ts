import { defineConfig } from "@playwright/test";

// Requires a configured .env.local (Supabase project with email confirmation
// disabled, and the Turnstile *test* site key 1x00000000000000000000AA so the
// captcha auto-passes). Run with: npm run test:e2e
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
