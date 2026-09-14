import { launchBrowser, baseURL } from "./browser-support.mjs";
import fs from "node:fs";
const b = await launchBrowser();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto(baseURL);
await p.waitForFunction(() => window.workshop?.getState().ready);
const bounds = await p.evaluate(async () => {
  const THREE = await import("/node_modules/three/build/three.module.js");
  const out = {};
  window.workshop.scene.updateMatrixWorld(true);
  window.workshop.scene.traverse((o) => {
    if (
      o.isMesh &&
      o.userData.inspection_region &&
      !o.userData.kit &&
      !o.userData.inventoryId
    ) {
      const r = o.userData.inspection_region;
      if (!out[r]) out[r] = new THREE.Box3();
      out[r].expandByObject(o);
    }
  });
  return Object.fromEntries(
    Object.entries(out).map(([r, b]) => [
      r,
      { min: b.min.toArray(), max: b.max.toArray() },
    ]),
  );
});
fs.writeFileSync(
  "../work/runtime-bounds.json",
  JSON.stringify(bounds, null, 2),
);
await p.click("[data-panel=inventory]");
await p.waitForTimeout(1600);
await p.screenshot({ path: "test-results/inventory-before-expansion.png" });
await b.close();
