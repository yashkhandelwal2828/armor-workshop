import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
const b = await launchBrowser();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto(baseURL);
await p.waitForFunction(() => window.workshop?.getState().ready);
const state = () => p.evaluate(() => window.workshop.getState());
await p.click("button[data-panel=inventory]");
await p.click("[data-category=Vector]");
await p.click("[data-inventory=vector-left-bracer]");
await p.click("#inventory-equip");
await p.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Carry",
  {},
  { timeout: 60000 },
);
assert.equal((await state()).assembly.shelfVisible, false);
assert.equal((await state()).equippedKits["Left forearm"], undefined);
await p.screenshot({ path: "test-results/inventory-lab-carry.png" });
await p.waitForFunction(
  () => !window.workshop.getState().assembly.busy,
  {},
  { timeout: 90000 },
);
assert.equal(
  (await state()).equippedKits["Left forearm"],
  "vector-left-bracer",
);
assert((await state()).assembly.physics.maxReachError < 0.002);
assert((await state()).assembly.audio.events >= 5);
await p.click("button[data-panel=inventory]");
await p.click("[data-inventory=vector-right-bracer]");
await p.click("#inventory-equip");
await p.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Carry",
  {},
  { timeout: 60000 },
);
await p.click("#assembly-cancel");
assert.equal((await state()).equippedKits["Right forearm"], undefined);
assert.equal(
  (await state()).equippedKits["Left forearm"],
  "vector-left-bracer",
);
assert.deepEqual(errors, []);
fs.writeFileSync(
  "test-results/inventory-lab-motion.json",
  JSON.stringify({ passed: true, errors, state: await state() }, null, 2),
);
await b.close();
console.log(
  "Full Blender module fetch, carry, install, reach, audio and mid-carry cancellation passed.",
);
