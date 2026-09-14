import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
const b = await launchBrowser();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto(baseURL);
await p.waitForFunction(() => window.workshop?.getState().ready);
const state = () => p.evaluate(() => window.workshop.getState());
await p.click("[data-panel=inventory]");
await p.click("[data-category=Bastion]");
await p.click("[data-inventory=bastion-0]");
await p.click("#inventory-equip");
await p.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Carry",
  {},
  { timeout: 60000 },
);
assert.equal((await state()).assembly.shelfVisible, false);
assert.equal((await state()).kitVisible, 0);
await p.screenshot({ path: "test-results/bastion-carry.png" });
await p.waitForFunction(
  () => !window.workshop.getState().assembly.busy,
  {},
  { timeout: 90000 },
);
assert.equal((await state()).equippedKits["Chest and back"], "bastion");
assert((await state()).assembly.physics.maxReachError < 0.002);
assert((await state()).assembly.audio.events >= 5);
await p.click("[data-panel=inventory]");
await p.click("[data-inventory=bastion-4]");
await p.click("#inventory-equip");
await p.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Carry",
  {},
  { timeout: 60000 },
);
await p.click("#assembly-cancel");
assert.equal((await state()).equippedKits["Right forearm"], undefined);
assert.equal((await state()).equippedKits["Chest and back"], "bastion");
await p.setViewportSize({ width: 390, height: 844 });
await p.click("[data-panel=inventory]");
await p.click("[data-inventory=bastion-1]");
assert(await p.locator("#inventory-equip").isVisible());
await p.screenshot({ path: "test-results/bastion-mobile.png" });
await p.click("#inventory-equip");
await p.click("#assembly-skip");
assert.equal(
  (await state()).equippedKits["Left shoulder and upper arm"],
  "bastion",
);
assert.deepEqual(errors, []);
await b.close();
console.log(
  "Full kit fetch/install, audio, reach, cancellation and mobile equip passed",
);
