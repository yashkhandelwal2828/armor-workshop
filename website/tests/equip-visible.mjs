import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
const browser = await launchBrowser();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
for (const [width, height] of [
  [1440, 1000],
  [842, 746],
  [390, 844],
]) {
  await page.setViewportSize({ width, height });
  await page.goto(baseURL);
  await page.waitForFunction(() => window.workshop?.getState().ready);
  await page.click("[data-panel=helmet]");
  await page.click("#armor-inventory");
  await page.waitForTimeout(700);
  const bounds = await page.locator("#inventory-equip").boundingBox();
  assert(bounds && bounds.y >= 0 && bounds.y + bounds.height <= height);
  assert(
    await page.locator("#inventory-equip").evaluate((e) => {
      const r = e.getBoundingClientRect();
      return (
        document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === e
      );
    }),
  );
  await page.screenshot({ path: `test-results/equip-visible-${width}.png` });
  await page.click("#inventory-equip");
  await page.waitForFunction(
    () => window.workshop.getState().assembly.stage === "Install",
  );
  const lengths = await page.evaluate(
    () => window.workshop.getState().assembly.linkLengths,
  );
  for (const [a, b] of lengths) {
    assert(Math.abs(a - 1.45) < 1e-6);
    assert(b >= 1.35 - 1e-6 && b <= 5 + 1e-6);
  }
  await page.screenshot({ path: `test-results/robot-blender-${width}.png` });
  await page.click("#assembly-skip");
  assert(await page.locator("#app").evaluate((e) => !e.inert));
}
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "Visible, unobstructed equip at 1440 / 842 / 390; fixed upper links and bounded telescoping forearms; installs passed",
);
