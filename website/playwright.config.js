import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "release.spec.js",
  workers: 1,
  timeout: 120000,
  expect: { timeout: 20000 },
  use: {
    baseURL: "http://127.0.0.1:4179/preview/",
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    launchOptions: {
      args:
        process.platform === "darwin"
          ? ["--use-angle=metal"]
          : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --port 4179 --strictPort --base /preview/",
    url: "http://127.0.0.1:4179/preview/",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
