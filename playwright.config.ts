import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 300_000,
    env: {
      NEXT_PUBLIC_APP_URL: baseURL,
      NEXT_PUBLIC_API_URL: `${baseURL}/api`,
    },
  },
});
