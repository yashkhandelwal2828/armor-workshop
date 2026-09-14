import { launchBrowser, baseURL } from "./browser-support.mjs";
import assert from "node:assert/strict";
const b = await launchBrowser();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
p.setDefaultTimeout(15000);
await p.goto(baseURL);
await p.waitForFunction(() => window.workshop?.getState().ready);
await p.click("button[data-panel=inventory]");
await p.click("[data-category=Vector]");
await p.click("[data-inventory=vector-left-bracer]");
await p.locator("aside").waitFor({ state: "hidden" });
await p.click("#inventory-browse");
await p.locator("aside").waitFor({ state: "visible" });
console.log("Browse return visible");
assert(!(await p.locator("#inventory-detail").isVisible()));
await p.click("[data-category=Aegis]");
await p.click("[data-inventory=aegis-cuirass]");
assert.equal(await p.locator("#inventory-name").textContent(), "Aegis cuirass");
console.log("Reselected");
await p.click("button[data-panel=inventory]");
assert(!(await p.locator("#inventory-detail").isVisible()));
await p.click("button[data-panel=inventory]");
await p.locator("aside").waitFor({ state: "visible" });
await b.close();
console.log(
  "Mobile preview, Browse parts return, reselection, close and reopen passed.",
);
