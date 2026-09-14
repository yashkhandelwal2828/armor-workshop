import assert from "node:assert/strict";
import { Vector3 } from "three";
import { STEP, stepServo } from "../src/servo.js";
function simulate(fps) {
  const p = new Vector3(),
    v = new Vector3(),
    target = new Vector3(1, 0.4, -0.3);
  let accumulated = 0,
    peak = 0;
  for (let frame = 0; frame < fps * 5; frame++) {
    accumulated += 1 / fps;
    while (accumulated + 1e-10 >= STEP) {
      const before = v.clone();
      stepServo(p, v, target);
      assert(v.clone().sub(before).length() / STEP <= 5.000001);
      peak = Math.max(peak, v.length());
      accumulated -= STEP;
    }
  }
  assert(peak <= 0.750001);
  assert(p.distanceTo(target) < 0.001);
  return p;
}
const a = simulate(30);
for (const fps of [60, 120, 144]) assert(a.distanceTo(simulate(fps)) < 1e-8);
console.log(
  "Servo: acceleration / speed bounds, settling, equivalent 30/60/120/144 Hz passed",
);
