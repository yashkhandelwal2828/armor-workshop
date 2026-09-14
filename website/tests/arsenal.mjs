import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
const catalog = JSON.parse(fs.readFileSync("public/arsenal/manifest.json"));
const browser = await launchBrowser();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const state = () => page.evaluate(() => window.workshop.getState());
async function select(id) {
  if (
    (await page
      .locator("button[data-panel=inventory]")
      .getAttribute("aria-expanded")) !== "true"
  )
    await page.click("button[data-panel=inventory]");
  await page.click("[data-category=Arsenal]");
  await page.click(`[data-inventory="${id}"]`);
}
async function equip(id) {
  await select(id);
  await page.click("#inventory-equip");
}
async function sourceHelmets() {
  return page.evaluate(() => {
    let n = 0;
    window.workshop.scene.traverse((o) => {
      if (
        o.isMesh &&
        o.userData.inspection_region === "Helmet" &&
        !o.userData.kit &&
        !o.userData.inventoryId &&
        o.visible
      )
        n++;
    });
    return n;
  });
}
await page.goto(baseURL);
await page.waitForFunction(() => window.workshop?.getState().ready);
assert.equal((await state()).inventoryCount, 69);
await page.click("button[data-panel=helmet]");
await page.click('[data-helmet="85"]');
assert((await sourceHelmets()) > 0);
for (const item of catalog) {
  await equip(item.id);
  assert.equal((await state()).equippedKits[item.region], item.id);
  if (item.region === "Helmet") {
    assert.equal(await sourceHelmets(), 0);
    assert(await page.locator("#lift").isDisabled());
    assert(await page.locator("#face").isDisabled());
  }
}
await equip("arsenal-helmet-3");
await page.reload();
await page.waitForFunction(() => window.workshop?.getState().ready);
assert.equal((await state()).equippedKits.Helmet, "arsenal-helmet-3");
assert.equal(await sourceHelmets(), 0);
await select("arsenal-helmet-3");
await page.click("#inventory-restore");
assert.equal((await state()).equippedKits.Helmet, undefined);
assert((await sourceHelmets()) > 0);
assert.equal((await state()).version, "85");
assert(!(await page.locator("#lift").isDisabled()));
assert.equal(await page.locator("#mark-number").textContent(), "85");
await equip("arsenal-helmet-1");
await page.click("button[data-panel=helmet]");
await page.click('[data-helmet="7"]');
assert.equal((await state()).equippedKits.Helmet, undefined);
assert((await sourceHelmets()) > 0);
await equip("arsenal-helmet-5");
await page.click("button[data-panel=inventory]");
await page.click("[data-category=Helmets]");
await page.click('[data-inventory="85-classic"]');
await page.click("#inventory-equip");
assert.equal((await state()).equippedKits.Helmet, undefined);
assert.equal((await state()).version, "85");
await equip("arsenal-helmet-3");
await page.click("button[data-panel=paint]");
await page.selectOption("#region", "Helmet");
await page.locator("#red").fill("#335577");
assert(
  (await state()).paint.some(
    (m) =>
      m.name === "Helmet / Red paint / arsenal-helmet-3" &&
      m.color === "335577",
  ),
);
await page.click("button[data-panel=view]");
await page.click("#front");
await page.click("#close-panel");
await page.waitForTimeout(500);
await page.screenshot({ path: "test-results/arsenal-equipped.png" });
await page.click("button[data-panel=inventory]");
const banks = [];
for (const [type, expected] of [
  ["Helmets", 12],
  ["Arms", 14],
  ["Legs", 11],
]) {
  await page.click(`[data-part-type=${type}]`);
  assert.equal(await page.locator("[data-inventory]").count(), expected);
  const bounds = await page.evaluate(async () => {
    const THREE = await import("/node_modules/three/build/three.module.js");
    const groups = new Map();
    window.workshop.scene.updateMatrixWorld(true);
    window.workshop.scene.traverse((o) => {
      if (o.isMesh && o.userData.inventoryId && o.visible && o.parent.visible) {
        let box = groups.get(o.userData.inventoryId);
        if (!box) {
          box = new THREE.Box3();
          groups.set(o.userData.inventoryId, box);
        }
        box.expandByObject(o);
      }
    });
    return [...groups].map(([id, b]) => ({
      id,
      min: b.min.toArray(),
      max: b.max.toArray(),
    }));
  });
  for (let i = 0; i < bounds.length; i++)
    for (let j = i + 1; j < bounds.length; j++) {
      const a = bounds[i],
        b = bounds[j];
      assert(
        ![0, 1, 2].every(
          (k) =>
            Math.min(a.max[k], b.max[k]) - Math.max(a.min[k], b.min[k]) > 0.001,
        ),
        a.id + " overlaps " + b.id,
      );
    }
  await page.waitForTimeout(800);
  await page.screenshot({
    path: `test-results/arsenal-shelves-${type.toLowerCase()}.png`,
  });
  banks.push({ type, stock: bounds.length, noOverlap: true });
}
await page.click("[data-category=Arsenal]");
await page.waitForFunction(() =>
  [...document.querySelectorAll("[data-inventory] img")].every(
    (i) => i.complete && i.naturalWidth,
  ),
);
assert.equal(await page.locator("[data-inventory] img").count(), 30);
await page.setViewportSize({ width: 390, height: 844 });
await page.click("[data-part-type=Helmets]");
await page.click("[data-inventory=arsenal-helmet-4]");
assert(
  await page.locator("#inventory-equip").evaluate((e) => {
    const r = e.getBoundingClientRect();
    return (
      r.top >= 0 &&
      r.bottom <= innerHeight &&
      document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === e
    );
  }),
);
await page.click("#inventory-equip");
assert.equal((await state()).equippedKits.Helmet, "arsenal-helmet-4");
await page.click("button[data-panel=inventory]");
await page.click("[data-part-type=Helmets]");
await page.screenshot({ path: "test-results/arsenal-mobile.png" });
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.setViewportSize({ width: 1280, height: 900 });
await page.emulateMedia({ reducedMotion: "no-preference" });
await select("arsenal-helmet-2");
await page.click("#inventory-equip");
await page.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Carry",
  {},
  { timeout: 60000 },
);
await page.click("#assembly-cancel");
assert.equal((await state()).equippedKits.Helmet, "arsenal-helmet-4");
assert.equal(await sourceHelmets(), 0);
await select("arsenal-helmet-2");
await page.click("#inventory-equip");
await page.waitForFunction(
  () => !window.workshop.getState().assembly.busy,
  {},
  { timeout: 90000 },
);
assert.equal((await state()).equippedKits.Helmet, "arsenal-helmet-2");
assert.equal(await sourceHelmets(), 0);
assert.deepEqual(errors, []);
fs.writeFileSync(
  "test-results/arsenal-validation.json",
  JSON.stringify(
    {
      parts: 69,
      newModels: 30,
      installed: catalog.length,
      helmets: true,
      restore: true,
      persistence: true,
      mobile: true,
      animation: true,
      banks,
      errors,
    },
    null,
    2,
  ),
);
await browser.close();
console.log(
  "69 entries; 30 installs; six replacement helmets; restore, canonical switching, paint, persistence, 30 previews, shelf bounds, mobile and full animated helmet exchange passed.",
);
