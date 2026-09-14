import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await launchBrowser();
const page = await browser.newPage({
  viewport: { width: 1000, height: 850 },
  deviceScaleFactor: 2,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(baseURL);
await page.waitForFunction(() => window.workshop?.getState().ready);
await page.waitForTimeout(3000);
const state = () => page.evaluate(() => window.workshop.getState());
assert.equal((await state()).triangles, 996904);
assert.deepEqual((await state()).renderSize, [2000, 1700]);
assert.equal((await state()).meshCount, 142);
await page.screenshot({ path: "test-results/hd-desktop.png" });
await page.click("[data-panel=view]");
await page.selectOption("#quality", "ultra");
assert.deepEqual((await state()).renderSize, [2500, 2125]);
await page.selectOption("#quality", "balanced");
assert.deepEqual((await state()).renderSize, [1000, 850]);
await page.selectOption("#quality", "high");
await page.click("[data-panel=helmet]");
await page.click('[data-helmet="85"]');
assert.equal((await state()).visibleHelmet, 4);
await page.click("[data-panel=paint]");
await page.selectOption("#region", "Left forearm");
const before = (await state()).paint;
await page.click("[data-finish=stealth]");
const changed = (await state()).paint.filter(
  (m, i) => m.color !== before[i].color,
);
assert(changed.length > 0);
assert(changed.every((m) => m.name.startsWith("Left forearm /")));
await page.click("#isolate");
assert((await state()).isolated);
await page.click("#reset");
assert.equal((await state()).visibleHelmet, 6);
await page.click("[data-panel=helmet]");
await page.locator("#face").fill("100");
assert(Math.abs((await state()).face[2]) > 0.1);
await page.locator("#face").fill("0");
await page.click("[data-panel=view]");
await page.selectOption("#quality", "ultra");
await page.reload();
await page.waitForFunction(() => window.workshop?.getState().ready);
assert.equal((await state()).quality, "ultra");
await page.click("[data-panel=view]");
await page.selectOption("#quality", "high");
await page.click("#close-panel");
await page.setViewportSize({ width: 390, height: 844 });
await page.reload();
await page.waitForFunction(() => window.workshop?.getState().ready);
await page.waitForTimeout(3000);
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.screenshot({ path: "test-results/hd-mobile.png" });
assert.deepEqual(errors, []);
await fs.writeFile(
  "test-results/hd-verification.json",
  JSON.stringify(
    {
      passed: true,
      checks: [
        "full geometry",
        "Retina render size",
        "quality presets",
        "quality persistence",
        "helmet swap",
        "region paint",
        "isolation",
        "faceplate",
        "mobile fit",
        "no runtime errors",
      ],
      state: await state(),
    },
    null,
    2,
  ),
);
await browser.close();
console.log("HD checks passed");
