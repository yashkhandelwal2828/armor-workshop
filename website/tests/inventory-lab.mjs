import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const state = () => page.evaluate(() => window.workshop.getState());
const catalog = JSON.parse(fs.readFileSync("public/inventory/manifest.json"));
const foundryCatalog = JSON.parse(
  fs.readFileSync("public/foundry/manifest.json"),
);
const expectedInventoryCount =
  catalog.length +
  foundryCatalog.length +
  JSON.parse(fs.readFileSync("public/arsenal/manifest.json")).length +
  17;
await page.goto(baseURL);
await page.waitForFunction(() => window.workshop?.getState().ready);
assert.equal((await state()).inventoryCount, expectedInventoryCount);
assert((await state()).inventoryItems.every((i) => i.meshes > 0));
await page.click("button[data-panel=inventory]");
await page.waitForTimeout(1300);
await page.screenshot({ path: "test-results/inventory-lab-library.png" });
await page.fill("#inventory-search", "servo");
assert.equal(await page.locator("[data-inventory]").count(), 2);
await page.fill("#inventory-search", "does-not-exist");
assert(await page.locator("#inventory-empty").isVisible());
await page.fill("#inventory-search", "");
await page.click("#inventory-next");
assert.equal((await state()).inventoryPage, 1);
assert.equal(
  (await state()).inventoryItems.filter((i) => i.visible).length,
  (await state()).inventoryItems.filter((item) => item.page === 1).length,
);
await page.click("#inventory-prev");
assert.equal(
  (await state()).inventoryItems.filter((i) => i.visible).length,
  (await state()).inventoryItems.filter((item) => item.page === 0).length,
);
for (const [index, item] of catalog.entries()) {
  if (index) await page.click("button[data-panel=inventory]");
  await page.click(`[data-category=${item.family}]`);
  await page.click(`[data-inventory=${item.id}]`);
  assert.equal((await state()).inventorySelected, item.id);
  if (item.id === "vector-left-bracer") {
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "test-results/inventory-lab-bracer.png" });
  }
  await page.click("#inventory-equip");
  await page.click("#assembly-skip");
  assert.equal((await state()).equippedKits[item.region], item.id);
  const visible = await page.evaluate((id) => {
    let n = 0;
    window.workshop.scene.traverse((o) => {
      if (
        o.isMesh &&
        o.userData.kit === id &&
        !o.userData.inventoryId &&
        o.visible
      )
        n++;
    });
    return n;
  }, item.id);
  assert(visible > 0, item.id + " geometry must be visible");
}
await page.click("button[data-panel=view]");
await page.click("#front");
await page.click("#close-panel");
await page.click("#replay");
await page.waitForTimeout(2200);
await page.screenshot({ path: "test-results/inventory-lab-equipped.png" });
await page.reload();
await page.waitForFunction(() => window.workshop?.getState().ready);
assert.equal(Object.keys((await state()).equippedKits).length, catalog.length);
await page.click("button[data-panel=inventory]");
await page.click("[data-category=Vector]");
await page.click("[data-inventory=vector-left-bracer]");
await page.click("#inventory-restore");
await page.click("#assembly-skip");
assert.equal((await state()).equippedKits["Left forearm"], undefined);
// Swapping a competing geometry kit removes the previous kit, cancellation preserves it.
await page.click("button[data-panel=inventory]");
await page.click("[data-category=Bastion]");
await page.click("[data-inventory=bastion-0]");
await page.click("#inventory-equip");
await page.click("#assembly-cancel");
assert.equal((await state()).equippedKits["Chest and back"], "aegis-cuirass");
await page.click("button[data-panel=inventory]");
await page.click("[data-inventory=bastion-0]");
await page.click("#inventory-equip");
await page.click("#assembly-skip");
assert.equal((await state()).equippedKits["Chest and back"], "bastion");
await page.click("button[data-panel=paint]");
await page.selectOption("#region", "Right forearm");
await page.locator("#red").fill("#2455aa");
assert(
  (await state()).paint.some(
    (m) =>
      m.name.includes("vector-right-bracer") &&
      m.name.includes("Red paint") &&
      m.color === "2455aa",
  ),
);
await page.click("#reset");
assert.equal((await state()).kitVisible, 0);
await page.setViewportSize({ width: 390, height: 844 });
await page.reload();
await page.waitForFunction(() => window.workshop?.getState().ready);
await page.click("button[data-panel=inventory]");
await page.click("[data-category=Helix]");
await page.waitForTimeout(1000);
await page.screenshot({
  path: "test-results/inventory-lab-mobile-library.png",
});
await page.click("[data-inventory=helix-left-gauntlet]");
await page.waitForTimeout(1000);
await page.screenshot({ path: "test-results/inventory-lab-mobile-detail.png" });
assert(await page.locator("#inventory-browse").isVisible());
assert(
  await page.locator("#inventory-equip").evaluate((e) => {
    const r = e.getBoundingClientRect();
    return (
      r.y > 0 &&
      r.bottom < innerHeight &&
      document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === e
    );
  }),
);
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.emulateMedia({ reducedMotion: "reduce" });
await page.click("#inventory-equip");
assert.equal((await state()).equippedKits["Left hand"], "helix-left-gauntlet");
assert(!(await state()).assembly.busy);
assert.deepEqual(errors, []);
await browser.close();
console.log(
  `${expectedInventoryCount} catalog-derived parts; ${catalog.length} unique legacy module installs; search, shelf banks, persistence, restore, competing-kit swap/cancel, paint, mobile and reduced motion passed.`,
);
