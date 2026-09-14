import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assetUrl,
  isWorldVisible,
  parseSavedConfiguration,
} from "../src/runtime.js";
const parts = [
  { region: "Helmet", key: "vector-helmet" },
  { region: "Right forearm" },
];

test("untrusted saved data cannot break startup", () => {
  for (const raw of [
    null,
    "",
    "{broken",
    "null",
    "42",
    "[]",
    '{"paint":{}}',
    '{"paint":[null,4,{}, {"name":"x","color":null}]}',
    '{"equippedKits":"bad"}',
  ]) {
    const state = parseSavedConfiguration(raw, parts);
    assert.equal(state.version, "7");
    assert.deepEqual(state.equippedKits, {});
    assert.equal(state.paint.size, 0);
  }
});
test("only valid regional kits and paint survive restoration", () => {
  const state = parseSavedConfiguration(
    JSON.stringify({
      version: "85",
      equippedKits: {
        Helmet: "vector-helmet",
        "Right forearm": "bastion",
        Reactor: "vector-helmet",
        Unknown: "missing",
      },
      paint: [
        { name: "red", color: "ABC123" },
        { name: "invalid", color: "#123456" },
      ],
    }),
    parts,
  );
  assert.equal(state.version, "85");
  assert.deepEqual(state.equippedKits, {
    Helmet: "vector-helmet",
    "Right forearm": "bastion",
  });
  assert.deepEqual([...state.paint], [["red", "ABC123"]]);
});
test("hidden ancestor excludes shelf meshes from picking", () => {
  assert.equal(
    isWorldVisible({ visible: true, parent: { visible: false } }),
    false,
  );
  assert.equal(
    isWorldVisible({ visible: true, parent: { visible: true } }),
    true,
  );
});
test("asset paths stay relative to the deployment directory", () => {
  assert.equal(assetUrl("/models/suit.glb"), "./models/suit.glb");
  assert.equal(assetUrl("premium/helmet.png"), "./premium/helmet.png");
});
