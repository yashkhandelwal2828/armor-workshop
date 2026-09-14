import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const catalogs = [
  "public/inventory/manifest.json",
  "public/foundry/manifest.json",
  "public/arsenal/manifest.json",
].map((path) => JSON.parse(fs.readFileSync(path)));
const expectedInventoryCount = catalogs.flat().length + 17;
await page.goto(baseURL);
await page.waitForFunction(() => window.workshop?.getState().ready);
const state = () => page.evaluate(() => window.workshop.getState());
assert.equal((await state()).inventoryCount, expectedInventoryCount);
await page.click("button[data-panel=inventory]");
await page.waitForTimeout(1500);
await page.screenshot({ path: "test-results/inventory-shelves.png" });
await page.click('[data-inventory="85-arctic"]');
await page.waitForTimeout(1000);
await page.screenshot({ path: "test-results/inventory-helmet.png" });
await page.click("#inventory-equip");
await page.waitForFunction(() => !window.workshop.getState().assembly.busy);
assert.equal((await state()).version, "85");
assert.equal((await state()).visibleHelmet, 4);
assert(
  (await state()).paint.some(
    (m) => m.name === "Mark 85 / Red shell" && m.color === "dce5e8",
  ),
);
await page.click("button[data-panel=inventory]");
await page.click("[data-category=Components]");
await page.click("[data-inventory=left-arm]");
const before = (await state()).paint;
await page.click("#inventory-equip");
await page.waitForFunction(() => !window.workshop.getState().assembly.busy);
const changed = (await state()).paint.filter(
  (m, i) => m.color !== before[i].color,
);
assert(changed.length > 0);
assert(changed.every((m) => m.name.startsWith("Left forearm /")));
await page.click("button[data-panel=paint]");
await page.selectOption("#region", "Left forearm");
await page.click("#isolate");
assert.equal((await state()).inventoryVisible, false);
await page.click("#reset");
assert.equal((await state()).inventoryVisible, true);
await page.setViewportSize({ width: 390, height: 844 });
await page.reload();
await page.waitForFunction(() => window.workshop?.getState().ready);
await page.click("button[data-panel=inventory]");
await page.click("[data-inventory=vii-stealth]");
await page.locator("#inventory-equip").scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await page.screenshot({ path: "test-results/inventory-mobile.png" });
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.click("#inventory-equip");
await page.waitForFunction(() => !window.workshop.getState().assembly.busy);
assert.equal((await state()).version, "7");
assert.deepEqual(errors, []);
await browser.close();
console.log(
  `Inventory checks passed: ${expectedInventoryCount} catalog-derived items, helmets, part finishes, isolation, mobile, runtime errors`,
);
