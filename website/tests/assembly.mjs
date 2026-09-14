import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(baseURL);
await page.waitForFunction(() => window.workshop?.getState().ready);
const state = () => page.evaluate(() => window.workshop.getState());
async function equip(id) {
  await page.click("[data-panel=inventory]");
  await page.click("[data-category=Helmets]");
  await page.click(`[data-inventory="${id}"]`);
  await page.click("#inventory-equip");
}
await equip("85-arctic");
assert((await state()).assembly.busy);
assert.equal((await state()).version, "7");
await page.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Release",
);
await page.screenshot({ path: "test-results/assembly-release.png" });
await page.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Install",
);
await page.screenshot({ path: "test-results/assembly-install.png" });
await page.waitForFunction(() => !window.workshop.getState().assembly.busy);
assert.equal((await state()).version, "85");
assert.equal((await state()).visibleHelmet, 4);
assert(await page.locator("#app").evaluate((e) => !e.inert));
await equip("vii-midas");
await page.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Release",
);
await page.click("#assembly-cancel");
assert.equal((await state()).version, "85");
assert.equal((await state()).visibleHelmet, 4);
assert.equal((await state()).assembly.stage, "Cancelled");
await equip("vii-stealth");
await page.click("#assembly-skip");
assert.equal((await state()).version, "7");
assert.equal((await state()).visibleHelmet, 6);
await page.click("[data-panel=inventory]");
await page.click("[data-category=Components]");
await page.click("[data-inventory=left-arm]");
const before = (await state()).paint;
await page.click("#inventory-equip");
await page.click("#assembly-skip");
const changed = (await state()).paint.filter(
  (m, i) => m.color !== before[i].color,
);
assert(changed.length > 0);
assert(changed.every((m) => m.name.startsWith("Left forearm /")));
await page.emulateMedia({ reducedMotion: "reduce" });
await equip("85-obsidian");
assert.equal((await state()).assembly.busy, false);
assert.equal((await state()).version, "85");
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.setViewportSize({ width: 390, height: 844 });
await equip("vii-classic");
await page.waitForTimeout(3600);
await page.screenshot({ path: "test-results/assembly-mobile.png" });
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.keyboard.press("Escape");
assert.equal((await state()).version, "85");
assert.equal((await state()).visibleHelmet, 4);
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "Assembly passed: staged exchange, completion, cancellation, skip, regional part, reduced motion, mobile, Escape",
);
