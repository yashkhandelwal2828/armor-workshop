import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(baseURL);
await page.waitForFunction(() => window.workshop?.getState().ready);
const results = [];
for (const [category, id] of [
  ["Helmets", "85-arctic"],
  ["Components", "left-arm"],
  ["Components", "shin"],
]) {
  await page.click("[data-panel=inventory]");
  await page.click(`[data-category="${category}"]`);
  await page.click(`[data-inventory="${id}"]`);
  await page.click("#inventory-equip");
  await page.waitForFunction(
    () => window.workshop.getState().assembly.audio.peak > 0.001,
  );
  assert.equal(
    await page.evaluate(
      () => window.workshop.getState().assembly.audio.context,
    ),
    "running",
  );
  if (id === "85-arctic") {
    await page.click("#assembly-sound");
    await page.waitForTimeout(500);
    assert(
      (await page.evaluate(
        () => window.workshop.getState().assembly.audio.peak,
      )) < 0.001,
    );
    await page.click("#assembly-sound");
  }
  await page.waitForFunction(
    () => window.workshop.getState().assembly.stage === "Install",
    {},
    { timeout: 30000 },
  );
  await page.waitForTimeout(800);
  await page.screenshot({ path: `test-results/mechanics-${id}.png` });
  await page.waitForFunction(
    () => !window.workshop.getState().assembly.busy,
    {},
    { timeout: 30000 },
  );
  const s = await page.evaluate(() => window.workshop.getState().assembly);
  assert(s.physics.maxReachError < 0.001, JSON.stringify(s));
  assert(s.physics.maxSpeed <= 0.75001);
  results.push({ id, ...s });
}
assert.deepEqual(errors, []);
await fs.writeFile(
  "test-results/mechanics.json",
  JSON.stringify(results, null, 2),
);
await browser.close();
console.log(
  "Helmet, forearm, shin reach; audio output / mute; complete installs passed",
);
