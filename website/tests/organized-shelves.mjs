import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(baseURL);
await page.waitForFunction(() => window.workshop?.getState().ready);
await page.click("[data-panel=inventory]");
const evidence = [];
for (const [type, expectedPage, count] of [
  ["Helmets", 0, 12],
  ["Arms", 1, 14],
  ["Legs", 2, 11],
]) {
  await page.click(`[data-part-type=${type}]`);
  assert.equal(await page.locator("[data-inventory]").count(), count);
  const state = await page.evaluate(() => window.workshop.getState());
  assert.equal(state.inventoryPage, expectedPage);
  const bounds = await page.evaluate(async () => {
    const THREE = await import("/node_modules/three/build/three.module.js");
    const groups = new Map();
    window.workshop.scene.updateMatrixWorld(true);
    window.workshop.scene.traverse((o) => {
      if (o.isMesh && o.userData.inventoryId && o.visible && o.parent.visible) {
        const id = o.userData.inventoryId;
        if (!groups.has(id)) groups.set(id, new THREE.Box3());
        groups.get(id).expandByObject(o);
      }
    });
    return [...groups].map(([id, box]) => ({
      id,
      min: box.min.toArray(),
      max: box.max.toArray(),
    }));
  });
  assert.equal(
    bounds.length,
    state.inventoryItems.filter((i) => i.visible).length,
  );
  for (let i = 0; i < bounds.length; i++)
    for (let j = i + 1; j < bounds.length; j++) {
      const a = bounds[i],
        b = bounds[j];
      const overlapping = [0, 1, 2].every(
        (axis) =>
          Math.min(a.max[axis], b.max[axis]) -
            Math.max(a.min[axis], b.min[axis]) >
          0.001,
      );
      assert(!overlapping, `${a.id} overlaps ${b.id}`);
    }
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: `test-results/shelves-${type.toLowerCase()}.png`,
  });
  evidence.push({
    type,
    page: expectedPage,
    filtered: count,
    stock: bounds.length,
    noOverlap: true,
  });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.click("[data-part-type=Arms]");
await page.click("[data-inventory=nano-shield]");
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
await page.click("#inventory-browse");
await page.click("[data-part-type=Legs]");
assert.equal(await page.locator("[data-inventory]").count(), 11);
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.screenshot({ path: "test-results/shelves-mobile.png" });
assert.deepEqual(errors, []);
fs.writeFileSync(
  "test-results/organized-shelves.json",
  JSON.stringify(
    { passed: true, banks: evidence, mobile: true, errors },
    null,
    2,
  ),
);
await browser.close();
console.log(
  "Dedicated cabinets, regional filtering, three banks, non-overlapping stock and mobile navigation passed.",
);
