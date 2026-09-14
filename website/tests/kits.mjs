import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
const b = await launchBrowser();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto(baseURL);
await p.waitForFunction(() => window.workshop?.getState().ready);
const state = () => p.evaluate(() => window.workshop.getState());
assert.equal((await state()).kitVisible, 0);
for (let i = 0; i < 5; i++) {
  await p.click("button[data-panel=inventory]");
  await p.click("[data-category=Bastion]");
  await p.click(`[data-inventory="bastion-${i}"]`);
  await p.click("#inventory-equip");
  await p.click("#assembly-skip");
}
assert.equal(Object.keys((await state()).equippedKits).length, 5);
assert((await state()).kitVisible > 0);
await p.click("#replay");
await p.waitForTimeout(2400);
await p.screenshot({ path: "test-results/bastion-full.png" });
await p.click("button[data-panel=paint]");
await p.selectOption("#region", "Left forearm");
const before = (await state()).paint;
await p.locator("#red").fill("#2455aa");
const changed = (await state()).paint.filter(
  (m, i) => m.color !== before[i].color,
);
assert(changed.some((m) => m.name.includes("/ bastion-")));
assert(changed.every((m) => m.name.startsWith("Left forearm /")));
await p.reload();
await p.waitForFunction(() => window.workshop?.getState().ready);
assert.equal(Object.keys((await state()).equippedKits).length, 5);
await p.click("button[data-panel=inventory]");
await p.click("[data-category=Components]");
await p.click("[data-inventory=left-arm]");
await p.click("#inventory-equip");
await p.click("#assembly-skip");
assert.equal((await state()).equippedKits["Left forearm"], undefined);
assert.equal(Object.keys((await state()).equippedKits).length, 4);
await p.click("button[data-panel=inventory]");
await p.click("[data-category=Bastion]");
await p.click("[data-inventory=bastion-1]");
await p.click("#inventory-restore");
await p.click("#assembly-skip");
assert.equal(
  (await state()).equippedKits["Left shoulder and upper arm"],
  undefined,
);
assert.equal(Object.keys((await state()).equippedKits).length, 3);
await p.click("button[data-panel=paint]");
await p.click("#reset");
assert.equal((await state()).kitVisible, 0);
assert.deepEqual(errors, []);
await b.close();
console.log(
  "Kit installation, paint isolation, persistence, classic replacement, reset passed",
);
