import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";

const legacy = JSON.parse(fs.readFileSync("public/inventory/manifest.json"));
const foundry = JSON.parse(fs.readFileSync("public/foundry/manifest.json"));
assert.equal(foundry.length, 10, "Foundry contract has ten modules");
assert(
  foundry.every((item) => item.family === "Foundry"),
  "Foundry family metadata",
);
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const state = () => page.evaluate(() => window.workshop.getState());
const sourceVisible = (region) =>
  page.evaluate((region) => {
    let count = 0;
    window.workshop.scene.traverse((mesh) => {
      if (
        mesh.isMesh &&
        mesh.userData.inspection_region === region &&
        !mesh.userData.kit &&
        !mesh.userData.inventoryId &&
        mesh.visible
      )
        count++;
    });
    return count;
  }, region);
const paintChannels = (kitId, inventoryId) =>
  page.evaluate(
    ({ kitId, inventoryId }) => {
      const channels = { red: [], gold: [] };
      window.workshop.scene.traverse((mesh) => {
        if (
          !mesh.isMesh ||
          (kitId && mesh.userData.kit !== kitId) ||
          (inventoryId && mesh.userData.inventoryId !== inventoryId)
        )
          return;
        for (const material of Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]) {
          if (material.name.includes("/ Red paint"))
            channels.red.push(material.color.getHexString());
          if (material.name.includes("/ Gold paint"))
            channels.gold.push(material.color.getHexString());
        }
      });
      return channels;
    },
    { kitId, inventoryId },
  );
async function select(id) {
  const inventoryButton = page.locator("button[data-panel=inventory]");
  if ((await inventoryButton.getAttribute("aria-expanded")) !== "true")
    await inventoryButton.click();
  await page.click("[data-category=Foundry]");
  await page.click(`[data-inventory="${id}"]`);
}
async function equip(id) {
  await select(id);
  await page.click("#inventory-equip");
}
async function restore(id) {
  await select(id);
  await page.click("#inventory-restore");
}

await page.goto(baseURL);
await page.waitForFunction(() => window.workshop?.getState().ready);
const expectedInventoryCount =
  legacy.length +
  foundry.length +
  JSON.parse(fs.readFileSync("public/arsenal/manifest.json")).length +
  17;
assert.equal((await state()).inventoryCount, expectedInventoryCount);
assert.equal(
  (await state()).inventoryItems.filter((item) => item.category === "Foundry")
    .length,
  foundry.length,
);

await page.click("button[data-panel=inventory]");
await page.fill("#inventory-search", "foundry");
assert.equal(await page.locator("[data-inventory]").count(), foundry.length);
await page.waitForFunction(() =>
  [...document.querySelectorAll("[data-inventory] img")].every(
    (image) => image.complete && image.naturalWidth > 0,
  ),
);
assert.equal(
  await page.locator("[data-inventory] img").count(),
  foundry.length,
  "Foundry previews render",
);
await page.fill("#inventory-search", "");
await page.click("#inventory-next");
await page.click("#inventory-next");
assert.equal((await state()).inventoryPage, 2);
for (const item of (await state()).inventoryItems) {
  const expected =
    item.region === "Helmet"
      ? 0
      : item.region === "Chest and back"
        ? 1
        : item.region === "Reactor"
          ? 2
          : item.region === "Left forearm"
            ? 3
            : item.region === "Right forearm"
              ? 4
              : item.region.includes("hand")
                ? 5
                : item.region.includes("shoulder") || item.region === "Abdomen"
                  ? 8
                  : item.region.startsWith("Left")
                    ? 6
                    : 7;
  assert.equal(
    item.cabinet,
    expected,
    `${item.id} has dedicated regional cabinet`,
  );
}
await page.click("[data-part-type=Arms]");
assert.equal((await state()).inventoryPage, 1);
assert.equal(await page.locator("[data-inventory]").count(), 14);
await page.click("[data-part-type=Legs]");
assert.equal((await state()).inventoryPage, 2);
assert.equal(await page.locator("[data-inventory]").count(), 11);
await page.click("[data-part-type=Helmets]");
assert.equal((await state()).inventoryPage, 0);
assert.equal(await page.locator("[data-inventory]").count(), 12);
await page.click("[data-part-type=All]");
await page.click("#inventory-next");
await page.click("#inventory-next");
assert.equal(
  (await state()).inventoryItems.filter((item) => item.visible).length,
  (await state()).inventoryItems.filter((item) => item.page === 2).length,
);
await page.screenshot({ path: "test-results/foundry-third-shelf-bank.png" });

await page.emulateMedia({ reducedMotion: "reduce" });
for (const item of foundry) {
  await equip(item.id);
  assert.equal(
    (await state()).equippedKits[item.region],
    item.id,
    `${item.id} installed`,
  );
  const visible = await page.evaluate((id) => {
    let count = 0;
    window.workshop.scene.traverse((mesh) => {
      if (
        mesh.isMesh &&
        mesh.userData.kit === id &&
        !mesh.userData.inventoryId &&
        mesh.visible
      )
        count++;
    });
    return count;
  }, item.id);
  assert(visible > 0, `${item.id} geometry visible`);
  if (item.replaceBase)
    assert.equal(
      await sourceVisible(item.region),
      0,
      `${item.id} hides its original source`,
    );
}

const paintTarget = foundry.find((item) => item.id === "heavy-left-gauntlet");
const preservedTarget = foundry.find(
  (item) => item.id === "heavy-right-gauntlet",
);
assert(paintTarget && preservedTarget, "Foundry paint targets available");
await equip(paintTarget.id);
await equip(preservedTarget.id);
const stockBefore = await paintChannels(null, paintTarget.id);
const preservedBefore = await paintChannels(preservedTarget.id, null);
await page.click("button[data-panel=paint]");
await page.selectOption("#region", paintTarget.region);
await page.locator("#red").fill("#2468a5");
await page.locator("#gold").fill("#c47a25");
const painted = await paintChannels(paintTarget.id, null);
assert(
  painted.red.length > 0 && painted.gold.length > 0,
  "Foundry kit exposes primary and accent paint channels",
);
assert(
  painted.red.every((color) => color === "2468a5") &&
    painted.gold.every((color) => color === "c47a25"),
  "Foundry primary and accent paint update installed geometry",
);
assert.deepEqual(
  await paintChannels(null, paintTarget.id),
  stockBefore,
  "inventory stock paint remains independent",
);
assert.deepEqual(
  await paintChannels(preservedTarget.id, null),
  preservedBefore,
  "other equipped Foundry kit paint remains independent",
);

const replaceBase = foundry.find(
  (item) => item.id === "delta-reactor" && item.replaceBase,
);
assert(replaceBase, "Foundry defines delta replacement source");
assert.equal(
  (await state()).inventoryItems.find((item) => item.id === replaceBase.id)
    .replaceBase,
  true,
);
assert.equal(
  await sourceVisible(replaceBase.region),
  0,
  "replacement kit hides source geometry",
);
await restore(replaceBase.id);
assert.equal((await state()).equippedKits[replaceBase.region], undefined);
assert(
  (await sourceVisible(replaceBase.region)) > 0,
  "restore returns source geometry",
);

const competitor = foundry.find((item) =>
  legacy.some((old) => old.region === item.region),
);
assert(competitor, "Foundry has a regional competitor");
const old = legacy.find((item) => item.region === competitor.region);
await page.click("button[data-panel=inventory]");
await page.click(`[data-category=${old.family}]`);
await page.click(`[data-inventory="${old.id}"]`);
await page.click("#inventory-equip");
assert.equal((await state()).equippedKits[old.region], old.id);
await equip(competitor.id);
const competingVisibility = await page.evaluate(
  ([previous, next]) => {
    const out = {};
    for (const id of [previous, next]) {
      out[id] = 0;
      window.workshop.scene.traverse((mesh) => {
        if (
          mesh.isMesh &&
          mesh.userData.kit === id &&
          !mesh.userData.inventoryId &&
          mesh.visible
        )
          out[id]++;
      });
    }
    return out;
  },
  [old.id, competitor.id],
);
assert.equal((await state()).equippedKits[competitor.region], competitor.id);
assert.equal(
  competingVisibility[old.id],
  0,
  "competing legacy geometry removed",
);
assert(
  competingVisibility[competitor.id] > 0,
  "competing Foundry geometry shown",
);

await page.emulateMedia({ reducedMotion: "no-preference" });
await equip(replaceBase.id);
await page.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Carry",
  {},
  { timeout: 60000 },
);
await page.click("#assembly-cancel");
assert.equal((await state()).equippedKits[replaceBase.region], undefined);
assert(
  (await sourceVisible(replaceBase.region)) > 0,
  "cancelled source replacement keeps source visible",
);
await page.emulateMedia({ reducedMotion: "reduce" });
await equip(replaceBase.id);
assert.equal(await sourceVisible(replaceBase.region), 0);
await page.emulateMedia({ reducedMotion: "no-preference" });
await restore(replaceBase.id);
await page.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Carry",
  {},
  { timeout: 60000 },
);
await page.click("#assembly-cancel");
assert.equal((await state()).equippedKits[replaceBase.region], replaceBase.id);
assert.equal(
  await sourceVisible(replaceBase.region),
  0,
  "cancelled restore keeps replacement source hidden",
);

const shield = foundry.find((item) => item.id === "nano-shield");
const blade = foundry.find((item) => item.id === "nano-blade");
const pack = foundry.find((item) => item.id === "orbital-pack");
assert(shield && blade && pack, "named loadout modules available");
await equip(shield.id);
await page.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Carry",
  {},
  { timeout: 60000 },
);
await page.screenshot({ path: "test-results/foundry-shield-carry.png" });
await page.waitForFunction(
  () => !window.workshop.getState().assembly.busy,
  {},
  { timeout: 90000 },
);
await page.emulateMedia({ reducedMotion: "reduce" });
await equip(blade.id);
await equip(pack.id);
await page.click("button[data-panel=view]");
await page.click("#front");
await page.click("#close-panel");
await page.waitForTimeout(800);
await page.screenshot({
  path: "test-results/foundry-shield-blade-pack-front.png",
});
await page.click("button[data-panel=view]");
await page.click("#back");
await page.click("#close-panel");
await page.waitForTimeout(800);
await page.screenshot({
  path: "test-results/foundry-shield-blade-pack-back.png",
});

await page.reload();
await page.waitForFunction(() => window.workshop?.getState().ready);
for (const item of [shield, blade, pack])
  assert.equal(
    (await state()).equippedKits[item.region],
    item.id,
    `${item.id} persists`,
  );
await page.setViewportSize({ width: 390, height: 844 });
await page.click("button[data-panel=inventory]");
await page.click("[data-category=Foundry]");
await page.click(`[data-inventory="${pack.id}"]`);
assert(await page.locator("#inventory-browse").isVisible());
assert(
  await page.locator("#inventory-equip").evaluate((element) => {
    const box = element.getBoundingClientRect();
    return (
      box.y > 0 &&
      box.bottom < innerHeight &&
      document.elementFromPoint(
        box.x + box.width / 2,
        box.y + box.height / 2,
      ) === element
    );
  }),
);
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "Foundry: ten installs, third shelf bank, search, replacement visibility, cancellations, regional competition, animated shield, loadout screenshots, persistence, mobile, runtime errors passed.",
);
