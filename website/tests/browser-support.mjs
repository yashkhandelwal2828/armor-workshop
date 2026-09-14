import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

export const baseURL = process.env.TEST_BASE_URL || "http://127.0.0.1:5175/";
export async function launchBrowser() {
  await mkdir("test-results", { recursive: true });
  return chromium.launch({
    headless: true,
    args:
      process.platform === "darwin"
        ? ["--use-angle=metal"]
        : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
}
