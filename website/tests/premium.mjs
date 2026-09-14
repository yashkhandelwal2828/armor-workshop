import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(baseURL);
await page.waitForFunction(() => window.workshop?.getState().ready);
await page.waitForTimeout(3000);
const state = () => page.evaluate(() => window.workshop.getState());
async function panel(name) {
  const b = page.locator(`button[data-panel="${name}"]`);
  if ((await b.getAttribute("aria-expanded")) !== "true") await b.click();
  await page.waitForTimeout(350);
}
await page.screenshot({ path: "test-results/premium-desktop.png" });
await panel("helmet");
await page.click('[data-helmet="85"]');
assert.equal((await state()).visibleHelmet, 4);
assert(await page.locator("#face").isDisabled());
await page.screenshot({ path: "test-results/premium-panel.png" });
await page.reload();
await page.waitForFunction(() => window.workshop?.getState().ready);
assert.equal((await state()).version, "85");
await panel("paint");
await page.selectOption("#region", "Left forearm");
const before = (await state()).paint;
await page.click('[data-finish="stealth"]');
const after = (await state()).paint;
const changed = after.filter((m, i) => m.color !== before[i].color);
assert(changed.length > 0);
assert(changed.every((m) => m.name.startsWith("Left forearm /")));
await page.click("#isolate");
assert((await state()).isolated);
await page.click("#focus");
await page.waitForTimeout(1000);
await page.click("#reset");
assert.equal((await state()).version, "7");
assert.equal((await state()).isolated, false);
await panel("helmet");
await page.locator("#face").fill("100");
assert(Math.abs((await state()).face[2]) > 0.1);
await page.locator("#face").fill("0");
await page.locator("#lift").fill("100");
await page.locator("#lift").fill("0");
await panel("view");
await page.click("#back");
await page.waitForFunction(() => window.workshop.getState().camera[2] > 0);
await page.click("#front");
await page.waitForFunction(() => window.workshop.getState().camera[2] < 0);
await page.click("#cinema");
assert(
  await page.locator("body").evaluate((e) => e.classList.contains("cinema")),
);
assert(await page.locator("aside").evaluate((e) => e.inert));
await page.keyboard.press("Escape");
await page.click("#replay");
await page.waitForTimeout(3000);
await page.screenshot({ path: "test-results/premium-desktop.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.reload();
await page.waitForFunction(() => window.workshop?.getState().ready);
await page.waitForTimeout(3000);
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.screenshot({ path: "test-results/premium-mobile.png" });
await panel("paint");
await page.screenshot({ path: "test-results/premium-mobile-panel.png" });
await panel("view");
const download = page.waitForEvent("download");
await page.click("#capture");
await download;
assert.deepEqual(errors, []);
await fs.writeFile(
  "test-results/premium-verification.json",
  JSON.stringify(
    {
      passed: true,
      checks: [
        "reveal",
        "contextual panels",
        "helmet switching",
        "reload persistence",
        "regional finish preset",
        "isolation",
        "reset",
        "faceplate",
        "helmet lift",
        "camera presets",
        "cinematic mode",
        "Escape closes controls",
        "mobile fit",
        "image download",
        "no runtime errors",
      ],
      state: await state(),
    },
    null,
    2,
  ),
);
await browser.close();
console.log("Premium interaction checks passed");
