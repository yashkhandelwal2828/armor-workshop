import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await launchBrowser();
const p = await b.newPage({
  viewport: { width: Number(process.env.FETCH_WIDTH || 1440), height: 1000 },
});
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto(baseURL);
await p.waitForFunction(() => window.workshop?.getState().ready);
await p.click("[data-panel=inventory]");
await p.click(`[data-inventory="${process.env.FETCH_ITEM || "85-arctic"}"]`);
await p.click("#inventory-equip");
const state = () => p.evaluate(() => window.workshop.getState());
assert.equal((await state()).assembly.stage, "Fetch");
await p.evaluate(() => {
  window.baseSamples = [];
  window.baseSampler = setInterval(
    () =>
      window.baseSamples.push(
        window.workshop.getState().assembly.basePositions,
      ),
    30,
  );
});
assert.equal((await state()).visibleHelmet, 6);
await p.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Grip",
  {},
  { timeout: 60000 },
);
await p.screenshot({
  path: `test-results/shelf-grip-${process.env.FETCH_ITEM || "arctic"}.png`,
});
assert.equal((await state()).assembly.shelfVisible, true);
assert.equal((await state()).visibleHelmet, 6);
await p.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Carry",
  {},
  { timeout: 60000 },
);
assert.equal((await state()).assembly.shelfVisible, false);
assert.equal((await state()).visibleHelmet, 6);
await p.waitForTimeout(1000);
await p.screenshot({
  path: `test-results/shelf-carry-${process.env.FETCH_ITEM || "arctic"}.png`,
});
await p.waitForFunction(
  () => window.workshop.getState().assembly.stage === "Release",
  {},
  { timeout: 60000 },
);
await p.screenshot({
  path: `test-results/shelf-release-${process.env.FETCH_ITEM || "arctic"}.png`,
});
await p.waitForFunction(
  () => !window.workshop.getState().assembly.busy,
  {},
  { timeout: 60000 },
);
let s = await state();
assert.equal(s.version, "85");
assert.equal(s.visibleHelmet, 4);
assert(s.assembly.physics.maxReachError < 0.002, JSON.stringify(s.assembly));
assert.equal(s.assembly.audio.context, "running");
assert(s.assembly.audio.events >= 5);
await p.click("[data-panel=inventory]");
await p.click("[data-inventory=vii-stealth]");
await p.click("#inventory-equip");
await p.click("#assembly-cancel");
s = await state();
assert.equal(s.visibleHelmet, 4);
assert.equal(s.assembly.busy, false);
const samples = await p.evaluate(() => {
  clearInterval(window.baseSampler);
  return window.baseSamples;
});
assert(samples.length > 50);
for (const sample of samples)
  assert.deepEqual(sample, [
    [-1.75, 0, 0.55],
    [1.75, 0, 0.55],
  ]);
assert.deepEqual(errors, []);
await fs.writeFile(
  "test-results/shelf-fetch.json",
  JSON.stringify({ passed: true, state: s }, null, 2),
);
await b.close();
console.log(
  "Shelf fetch, grip, delivery before removal, installation, reach, audio and cancellation passed",
);
