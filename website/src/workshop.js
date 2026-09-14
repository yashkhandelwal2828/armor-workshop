import { showStartupError } from "./startup-error.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { assetUrl, isWorldVisible, readSavedConfiguration } from "./runtime.js";
import { createExploration } from "./exploration.js";
import { createArmorKits } from "./armor-kits.js";
import { createInventory } from "./inventory.js";
import { createAssembly } from "./assembly.js";
const $ = (id) => document.getElementById(id),
  view = $("viewport");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
view.append(renderer.domElement);
renderer.domElement.tabIndex = 0;
renderer.domElement.setAttribute(
  "aria-label",
  "3D suit. Drag to orbit, scroll to zoom. Use view buttons for keyboard navigation.",
);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#050a0e");
scene.fog = new THREE.Fog("#050a0e", 8, 24);
const pmrem = new THREE.PMREMGenerator(renderer),
  env = new RoomEnvironment();
scene.environment = pmrem.fromScene(env, 0.04).texture;
env.dispose();
pmrem.dispose();
const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
camera.position.set(2.8, 1.8, -5.5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(-0.35, 1.1, 0);
controls.enableDamping = true;
controls.minDistance = 0.16;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI * 0.98;
scene.add(new THREE.HemisphereLight("#819eaf", "#34414c", 0.85));
function light(color, intensity, pos) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.set(...pos);
  if (pos[0] === 3) {
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    Object.assign(l.shadow.camera, {
      left: -2.5,
      right: 2.5,
      top: 3,
      bottom: -2,
      near: 0.1,
      far: 15,
    });
    l.shadow.normalBias = 0.015;
    l.shadow.bias = -0.0001;
  }
  scene.add(l);
}
light("#ffdfb2", 2.6, [3, 5, -4]);
light("#80cfff", 2.0, [-3, 3, 3]);
light("#b6dfff", 0.9, [-2, 2, -3]);
const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
  type: THREE.HalfFloatType,
});
renderTarget.samples = 4;
const composer = new EffectComposer(renderer, renderTarget);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(800, 600), 0.14, 0.35, 2.0);
composer.addPass(bloom);
const outline = new OutlinePass(new THREE.Vector2(800, 600), scene, camera);
outline.edgeStrength = 2;
outline.edgeThickness = 1;
outline.visibleEdgeColor.set("#99eaff");
outline.hiddenEdgeColor.set("#153d52");
outline.enabled = false;
composer.addPass(outline);
composer.addPass(new OutputPass());
const holograms = new THREE.Group();
scene.add(holograms);
const ringMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#4cb9e4").multiplyScalar(1.5),
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
});
for (let i = 0; i < 3; i++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.28 + i * 0.08, 0.002, 4, 180),
    ringMaterial,
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.025 + i * 0.002;
  holograms.add(ring);
}
const scan = new THREE.Mesh(
  new THREE.TorusGeometry(0.55, 0.003, 4, 120),
  new THREE.MeshBasicMaterial({
    color: new THREE.Color("#80dfff").multiplyScalar(2.5),
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  }),
);
scan.rotation.x = Math.PI / 2;
scan.visible = false;
scene.add(scan);
let scanStart = -1;
const suit = new THREE.Group();
scene.add(suit);
let original,
  alternate,
  room,
  meshes = [],
  oldHelmet = [],
  newHelmet = [],
  face,
  helmet,
  baseFace,
  baseHelmet,
  ready = false,
  isolated = false,
  version = "7";
let kits = null,
  equippedKits = {},
  assembly = null,
  inventory = null,
  inventoryItem = null,
  inventoryCategory = "All",
  inventoryType = "All";
let dirty = true;
const defaults = new Map(),
  originalNames = new Map();
let tween = null;
const selection = () => $("region").value;
const exploration = createExploration({
  camera,
  controls,
  canvas: renderer.domElement,
  onChange: () => (dirty = true),
  onEnter: () => {
    tween = null;
    closePanel();
    document.body.classList.add("focused");
    isolated = false;
    $("room").checked = true;
    $("rotate").checked = false;
    if (ready) applyVisibility();
    camera.fov = 65;
    camera.updateProjectionMatrix();
  },
});
function size() {
  const w = view.clientWidth,
    h = view.clientHeight;
  if (!w || !h) return;
  const quality = $("quality").value;
  const requested =
    quality === "balanced"
      ? 1
      : quality === "ultra"
        ? 2.5
        : Math.max(1.5, Math.min(devicePixelRatio, 2));
  const ratio = Math.min(requested, Math.sqrt(8000000 / (w * h)));
  renderer.setPixelRatio(ratio);
  renderer.setSize(w, h);
  composer.setPixelRatio(ratio);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  composeView();
  dirty = true;
}
new ResizeObserver(size).observe(view);
controls.addEventListener("change", () => (dirty = true));
function notice(message) {
  $("status").textContent = message;
}
function chosen() {
  return meshes
    .filter((m) => !oldHelmet.includes(m))
    .concat(
      version === "7" ? oldHelmet : newHelmet,
      kits
        ? kits.meshes.filter(
            (m) =>
              equippedKits[m.userData.inspection_region] === m.userData.kit,
          )
        : [],
    )
    .filter(
      (m) =>
        selection() === "All armor" ||
        m.userData.inspection_region === selection(),
    );
}
function applyVisibility() {
  for (const m of meshes) m.visible = !oldHelmet.includes(m) || version === "7";
  for (const m of newHelmet)
    m.visible = version === "85" && !equippedKits.Helmet;
  if (kits) {
    for (const m of kits.meshes)
      m.visible = equippedKits[m.userData.inspection_region] === m.userData.kit;
    // Replacement kits own their regional shell. Keep source meshes hidden only while equipped.
    for (const part of kits.parts)
      if (
        part.replaceBase &&
        equippedKits[part.region] === (part.key || "bastion")
      )
        for (const original of part.originals) original.visible = false;
  }
  if (isolated && selection() !== "All armor")
    for (const m of [...meshes, ...newHelmet, ...(kits?.meshes || [])])
      m.visible = m.visible && m.userData.inspection_region === selection();
  syncHelmetControls();
  room.visible = $("room").checked && !isolated;
  holograms.visible = room.visible;
  if (inventory) inventory.group.visible = room.visible;
  if (assembly) assembly.group.visible = room.visible;
  dirty = true;
}
function syncPaint() {
  for (const [id, word] of [
    ["red", "Red"],
    ["gold", "Gold"],
  ]) {
    const mats = chosen()
      .flatMap((m) => (Array.isArray(m.material) ? m.material : [m.material]))
      .filter((m) => isPaint(m, word));
    $(id).disabled = !mats.length;
    if (mats.length) $(id).value = "#" + mats[0].color.getHexString();
  }
  $("isolate").disabled = selection() === "All armor";
}
function isPaint(m, word) {
  const name = originalNames.get(m) || m.name;
  return (
    name.includes("/ " + word + " paint") ||
    (name === "Mark 85 / Red shell" && word === "Red") ||
    (name === "Mark 85 / Gold faceplate" && word === "Gold")
  );
}
function syncHelmetControls() {
  const custom = kits?.parts.find(
    (p) => p.region === "Helmet" && p.key && p.key === equippedKits.Helmet,
  );
  for (const b of document.querySelectorAll("[data-helmet]"))
    b.setAttribute(
      "aria-pressed",
      String(!custom && b.dataset.helmet === version),
    );
  $("configuration").textContent = custom
    ? custom.name
    : version === "85"
      ? "Mark 85 / Nanotech helmet"
      : "Mark VII / Classic armor";
  $("mark-number").textContent = custom
    ? "LAB"
    : version === "85"
      ? "85"
      : "VII";
  $("lift").disabled = !!custom;
  $("face").disabled = !!custom || version === "85";
  $("face-note").textContent = custom
    ? "Fixed helmet and faceplate."
    : version === "85"
      ? "Mark 85 faceplate opening is not available."
      : "Inspection slide, not mechanical opening.";
}
function setVersion(value) {
  version = value;
  applyVisibility();
  syncPaint();
  save();
}
function focusRegion() {
  document.body.classList.add("focused");
  let list = chosen();
  const box = new THREE.Box3();
  suit.updateMatrixWorld(true);
  for (const m of list) if (m.visible) box.expandByObject(m);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3()),
    extent = box.getSize(new THREE.Vector3()).length();
  const dir = camera.position.clone().sub(controls.target).normalize();
  moveCamera(
    center.clone().addScaledVector(dir, Math.max(0.35, extent * 1.5)),
    center,
  );
}
function moveCamera(pos, target) {
  exploration.exit();
  tween = {
    from: camera.position.clone(),
    to: pos,
    oldTarget: controls.target.clone(),
    target,
    start: performance.now(),
  };
  dirty = true;
}
function fullView(back = false) {
  camera.fov = 40;
  camera.updateProjectionMatrix();
  document.body.classList.add("focused");
  suit.rotation.y = 0;
  $("rotate").checked = false;
  isolated = false;
  $("isolate").setAttribute("aria-pressed", "false");
  applyVisibility();
  moveCamera(
    new THREE.Vector3(0.0, 1.2, back ? 3.7 : -3.7),
    new THREE.Vector3(0, 1.06, 0),
  );
}
function save() {
  if (!ready) return;
  try {
    localStorage.setItem(
      "armor-workshop-v1",
      JSON.stringify({
        version,
        equippedKits,
        paint: [...defaults.keys()].map((m) => ({
          name: m.name,
          color: m.color.getHexString(),
        })),
      }),
    );
  } catch {
    /* Browser storage is optional. */
  }
}
function prep(model) {
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = false;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!defaults.has(m)) {
        defaults.set(m, m.color.clone());
        originalNames.set(m, m.name);
        if (m.metalness > 0) {
          m.envMapIntensity = 0.85;
          m.roughness = Math.max(m.roughness, 0.18);
        }
      }
    }
  });
}
try {
  const saved = localStorage.getItem("armor-render-quality");
  if (["balanced", "high", "ultra"].includes(saved)) $("quality").value = saved;
} catch {
  /* Browser storage is optional. */
}
$("quality").onchange = () => {
  try {
    localStorage.setItem("armor-render-quality", $("quality").value);
  } catch {
    /* Browser storage is optional. */
  }
  size();
};
const loader = new GLTFLoader();
async function start() {
  try {
    const assets = await Promise.all([
      loader.loadAsync(assetUrl("/models/mark-vii-hd.glb")),
      loader.loadAsync(assetUrl("/models/mark85-helmet.glb")),
      loader.loadAsync(assetUrl("/models/workshop.glb")),
      loader.loadAsync(assetUrl("/models/service-robot.glb")),
      loader.loadAsync(assetUrl("/models/inventory-lab.glb")),
      fetch(assetUrl("/inventory/manifest.json")).then((r) => {
        if (!r.ok) throw new Error("Inventory catalog unavailable");
        return r.json();
      }),
      loader.loadAsync(assetUrl("/models/foundry.glb")),
      fetch(assetUrl("/foundry/manifest.json")).then((r) => {
        if (!r.ok) throw new Error("Foundry catalog unavailable");
        return r.json();
      }),
      loader.loadAsync(assetUrl("/models/arsenal.glb")),
      fetch(assetUrl("/arsenal/manifest.json")).then((r) => {
        if (!r.ok) throw new Error("Arsenal catalog unavailable");
        return r.json();
      }),
      loader.loadAsync(assetUrl("/models/bastion-premium.glb")),
      fetch(assetUrl("/premium/bastion-manifest.json")).then((r) => {
        if (!r.ok) throw new Error("Bastion catalog unavailable");
        return r.json();
      }),
    ]);
    original = assets[0].scene;
    alternate = assets[1].scene;
    room = assets[2].scene;
    suit.add(original, alternate);
    scene.add(room);
    room.traverse((o) => {
      if (!o.isMesh) return;
      o.receiveShadow = true;
      if (
        /^(Robot[ _]|Service[ _]robot|Tool[ _]wrist|Gripper[ _]finger)/.test(
          o.name,
        ) ||
        /^Bay[ _]/.test(o.name) ||
        o.name.includes("identifier") ||
        o.name.includes("title")
      )
        o.visible = false;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        if (!m.userData.darkened) {
          m.userData.darkened = true;
          m.color.multiplyScalar(0.3);
          m.envMapIntensity = 0.3;
          m.roughness = 0.65;
          m.metalness = Math.min(m.metalness, 0.35);
          if (
            m.emissiveIntensity > 0 &&
            m.emissive.r + m.emissive.g + m.emissive.b > 0
          ) {
            m.emissive.set("#76c9e8");
            m.emissiveIntensity = 1.8;
          }
        }
      }
    });
    prep(original);
    prep(alternate);
    original.traverse((o) => {
      if (o.isMesh) meshes.push(o);
    });
    alternate.traverse((o) => {
      if (o.isMesh) newHelmet.push(o);
    });
    oldHelmet = meshes.filter((m) => m.userData.inspection_region === "Helmet");
    face = original.getObjectByName("FACEPLATE_MODULE");
    helmet = original.getObjectByName("HELMET_MODULE");
    baseFace = face.position.clone();
    baseHelmet = helmet.position.clone();
    for (const region of [
      ...new Set(meshes.map((m) => m.userData.inspection_region)),
    ]
      .filter(Boolean)
      .sort()) {
      const option = document.createElement("option");
      option.textContent = region;
      $("region").append(option);
    }
    kits = createArmorKits(
      suit,
      meshes,
      assets[4].scene,
      assets[5],
      assets[6].scene,
      assets[7],
      assets[8].scene,
      assets[9],
      assets[10].scene,
      assets[11],
    );
    prep(kits.group);
    inventory = createInventory({
      scene,
      original,
      alternate,
      kits,
      onSelect: selectInventory,
    });
    renderInventory();
    assembly = createAssembly(scene, {
      robotModel: assets[3].scene,
      onStage: (stage, progress) => {
        if (stage !== document.body.dataset.assemblyStage) {
          document.body.dataset.assemblyStage = stage;
          if (stage === "Fetch") {
            const target = inventoryItem.object.position.clone();
            camera.fov = 55;
            camera.updateProjectionMatrix();
            moveCamera(
              new THREE.Vector3(target.x - 1.4, target.y + 0.65, 2.6),
              target.clone().add(new THREE.Vector3(0, 0.05, -0.3)),
            );
          }
          if (stage === "Carry") {
            moveCamera(
              new THREE.Vector3(4.7, 3, -5),
              new THREE.Vector3(-0.6, 1.1, 2),
            );
          }
          if (stage === "Scan") {
            camera.fov = innerWidth < 650 ? 55 : 45;
            camera.updateProjectionMatrix();
            moveCamera(
              new THREE.Vector3(
                innerWidth < 650 ? 0.7 : 2.4,
                1.8,
                innerWidth < 650 ? -6.8 : -4.6,
              ),
              new THREE.Vector3(0, 1.1, 0),
            );
          }
        }
        $("assembly-stage").textContent = stage.toUpperCase();
        $("assembly-progress").value = progress;
      },
      onEnd: (committed) => {
        $("app").inert = false;
        controls.enabled = true;
        $("assembly-hud").hidden = true;
        delete document.body.dataset.assemblyStage;
        notice(committed ? "Component installed" : "Assembly cancelled");
        dirty = true;
      },
    });
    ready = true;
    const stored = readSavedConfiguration(kits.parts);
    equippedKits = stored.equippedKits;
    for (const m of defaults.keys()) {
      const color = stored.paint.get(m.name);
      if (color) m.color.set("#" + color);
    }
    version = stored.version;
    setVersion(version);
    $("loading").classList.add("hidden");
    notice("Ready");
    reveal();
    dirty = true;
    if (import.meta.env.DEV)
      window.workshop = {
        getState: () => ({
          ready,
          freeRoam: exploration.active,
          version,
          region: selection(),
          isolated,
          visibleHelmet:
            version === "7"
              ? oldHelmet.filter((m) => m.visible).length
              : newHelmet.filter((m) => m.visible).length,
          assembly: assembly.state,
          equippedKits: { ...equippedKits },
          kitVisible: kits.meshes.filter((m) => m.visible).length,
          inventoryCount: inventory.items.length,
          inventorySelected: inventoryItem?.id,
          inventoryVisible: inventory.group.visible,
          inventoryPage: inventory.page,
          inventoryItems: inventory.items.map((i) => ({
            id: i.id,
            category: i.category,
            region: i.region,
            page: i.page,
            cabinet: i.cabinet,
            shelfCategory: i.shelfCategory,
            visible: i.object.visible,
            meshes: i.object.children.length,
            replaceBase: !!i.kit?.replaceBase,
          })),
          meshCount: meshes.length,
          quality: $("quality").value,
          renderSize: [renderer.domElement.width, renderer.domElement.height],
          triangles: meshes.reduce(
            (n, m) =>
              n +
              (m.geometry.index?.count ||
                m.geometry.attributes.position.count) /
                3,
            0,
          ),
          paint: [...defaults.keys()].map((m) => ({
            name: m.name,
            color: m.color.getHexString(),
          })),
          face: face.position.toArray(),
          helmet: helmet.position.toArray(),
          camera: camera.position.toArray(),
          drawCalls: renderer.info.render.calls,
        }),
        scene,
      };
  } catch (error) {
    console.error(error);
    showStartupError();
  }
}
for (const el of document.querySelectorAll(
  "aside button,aside input,aside select",
))
  el.addEventListener("pointerdown", () => {
    if (!ready) notice("Still loading models…");
  });
for (const b of document.querySelectorAll("[data-helmet]"))
  b.onclick = () => {
    if (ready) {
      delete equippedKits.Helmet;
      setVersion(b.dataset.helmet);
    }
  };
$("region").onchange = () => {
  if (!ready) return;
  if (selection() === "All armor") isolated = false;
  $("isolate").setAttribute("aria-pressed", String(isolated));
  applyVisibility();
  syncPaint();
};
for (const [id, word] of [
  ["red", "Red"],
  ["gold", "Gold"],
])
  $(id).oninput = () => {
    if (!ready) return;
    for (const m of chosen())
      for (const mat of Array.isArray(m.material) ? m.material : [m.material])
        if (isPaint(mat, word)) mat.color.set($(id).value);
    dirty = true;
    save();
  };
$("lift").oninput = () => {
  if (!ready) return;
  const v = +$("lift").value / 100;
  helmet.position.copy(baseHelmet).add(new THREE.Vector3(0, 0.3 * v, 0));
  alternate.position.y = 0.3 * v;
  $("lift-value").value = Math.round(v * 100) + "%";
  dirty = true;
};
$("face").oninput = () => {
  if (!ready) return;
  const v = +$("face").value / 100;
  face.position.copy(baseFace).add(new THREE.Vector3(0, 0, -0.16 * v));
  $("face-value").value = Math.round(v * 100) + "%";
  dirty = true;
};
$("focus").onclick = () => {
  if (ready) focusRegion();
};
$("isolate").onclick = () => {
  if (!ready || selection() === "All armor") return;
  isolated = !isolated;
  $("isolate").setAttribute("aria-pressed", String(isolated));
  applyVisibility();
  focusRegion();
};
$("front").onclick = () => {
  if (ready) fullView();
};
$("back").onclick = () => {
  if (ready) fullView(true);
};
$("garage").onclick = () => {
  if (!ready) return;
  isolated = false;
  $("isolate").setAttribute("aria-pressed", "false");
  $("room").checked = true;
  applyVisibility();
  moveCamera(new THREE.Vector3(4.2, 3.1, -6.1), new THREE.Vector3(0, 1.2, 0.8));
};
$("room").onchange = () => {
  if (ready) applyVisibility();
};
$("rotate").onchange = () => (dirty = true);
$("reset").onclick = () => {
  if (!ready) return;
  equippedKits = {};
  for (const [m, c] of defaults) m.color.copy(c);
  $("region").value = "All armor";
  $("lift").value = $("face").value = 0;
  $("lift").oninput();
  $("face").oninput();
  $("room").checked = true;
  setVersion("7");
  fullView();
  syncPaint();
  save();
  notice("Original configuration restored");
};
$("capture").onclick = () => {
  if (!ready) return;
  composer.render();
  renderer.domElement.toBlob((blob) => {
    if (!blob) {
      notice("Image export unavailable");
      return;
    }
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "stark-armor-" + version + ".png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notice("Image saved");
  });
};
// Pointer selection uses a short click only, leaving orbit drags untouched.
const ray = new THREE.Raycaster(),
  pointer = new THREE.Vector2();
let down = null;
renderer.domElement.addEventListener(
  "pointerdown",
  (e) => (down = [e.clientX, e.clientY]),
);
renderer.domElement.addEventListener("pointerup", (e) => {
  if (
    !ready ||
    exploration.active ||
    assembly?.busy ||
    !down ||
    Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4
  )
    return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    (-(e.clientY - rect.top) / rect.height) * 2 + 1,
  );
  ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObjects(
    [
      ...meshes,
      ...newHelmet,
      ...(kits?.meshes || []),
      ...(inventory?.group.visible ? inventory.picks : []),
    ].filter(isWorldVisible),
    false,
  )[0];
  if (hit?.object.userData.inventoryId) {
    inventory.select(hit.object.userData.inventoryId);
    return;
  }
  if (hit) {
    $("region").value = hit.object.userData.inspection_region;
    $("region").onchange();
    notice("SELECTED / " + selection().toUpperCase());
    openPanel("paint", false);
  }
});
renderer.domElement.addEventListener("pointercancel", () => {
  down = null;
});
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (exploration.update(dt)) dirty = true;
  if (assembly?.update(now)) dirty = true;
  if (tween) {
    const t = Math.min((now - tween.start) / (tween.duration || 650), 1),
      k = matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 1
        : 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(tween.from, tween.to, k);
    controls.target.lerpVectors(tween.oldTarget, tween.target, k);
    dirty = true;
    if (k === 1) tween = null;
  }
  if (scanStart >= 0) {
    const t = (now - scanStart) / 2600;
    scan.position.y = 2.2 * (1 - t);
    scan.material.opacity = 0.8 * Math.sin(Math.PI * t);
    dirty = true;
    if (t >= 1) {
      scan.visible = false;
      scanStart = -1;
    }
  }
  if (ready && $("rotate").checked) {
    suit.rotation.y += dt * 0.28;
    dirty = true;
  }
  if (!exploration.active) controls.update();
  if (dirty) {
    composer.render();
    dirty = false;
  }
}
size();
requestAnimationFrame(frame);
start();
function composeView() {
  const w = view.clientWidth,
    h = view.clientHeight;
  if (w > 650 && document.body.classList.contains("panel-open"))
    camera.setViewOffset(w, h, w > 1000 ? 160 : 200, 0, w, h);
  else camera.clearViewOffset();
  dirty = true;
}
function openPanel(name, toggle = true) {
  const same =
    document.body.classList.contains("panel-open") &&
    document
      .querySelector(`button[data-panel="${name}"]`)
      ?.getAttribute("aria-expanded") === "true";
  if (same && toggle) return closePanel();
  document.body.classList.add("panel-open");
  document.body.dataset.panel = name;
  composeView();
  document.querySelector("aside").inert = false;
  for (const b of document.querySelectorAll("button[data-panel]"))
    b.setAttribute("aria-expanded", String(b.dataset.panel === name));
  for (const section of document.querySelectorAll("[data-section]"))
    section.classList.toggle("active", section.dataset.section === name);
  $("panel-title").textContent = {
    helmet: "ARMOR",
    paint: "FINISH",
    view: "INSPECT",
    inventory: "COMPONENTS",
  }[name];
}
function closePanel() {
  document.body.classList.remove("panel-open", "inventory-selected");
  delete document.body.dataset.panel;
  composeView();
  document.querySelector("aside").inert = true;
  for (const b of document.querySelectorAll("button[data-panel]"))
    b.setAttribute("aria-expanded", "false");
}
for (const b of document.querySelectorAll("button[data-panel]"))
  b.onclick = () => {
    openPanel(b.dataset.panel);
    if (
      b.dataset.panel === "inventory" &&
      document.body.classList.contains("panel-open")
    ) {
      document.body.classList.remove("inventory-selected");
      $("inventory-detail").hidden = true;
      renderInventory();
      inventoryTour();
    }
  };
$("close-panel").onclick = closePanel;
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (assembly?.busy) {
      assembly.cancel();
      return;
    }
    closePanel();
    document.body.classList.remove("cinema");
    $("cinema").setAttribute("aria-pressed", "false");
  }
});
$("cinema").onclick = () => {
  const on = document.body.classList.toggle("cinema");
  $("cinema").setAttribute("aria-pressed", String(on));
  if (on) closePanel();
};
function reveal() {
  if (!ready) return;
  camera.fov = 40;
  camera.updateProjectionMatrix();
  document.body.classList.remove("focused");
  closePanel();
  isolated = false;
  applyVisibility();
  suit.rotation.y = 0;
  $("rotate").checked = false;
  const mobile = innerWidth < 650;
  moveCamera(
    new THREE.Vector3(
      mobile ? 0.65 : 1.65,
      mobile ? 1.45 : 1.5,
      mobile ? -4.2 : -3.85,
    ),
    new THREE.Vector3(mobile ? 0 : 0.55, 1.05, 0),
  );
  tween.duration = 2200;
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    scan.visible = true;
    scanStart = performance.now();
  }
  notice("Ready to customize");
}
$("replay").onclick = reveal;
for (const b of document.querySelectorAll("[data-finish]"))
  b.onclick = () => {
    if (!ready) return;
    const colors = {
      classic: ["#95161f", "#d3a25b"],
      stealth: ["#263644", "#aab6c1"],
      midas: ["#c69d57", "#694424"],
    }[b.dataset.finish];
    $("red").value = colors[0];
    $("gold").value = colors[1];
    $("red").oninput();
    $("gold").oninput();
    for (const p of document.querySelectorAll("[data-finish]"))
      p.setAttribute("aria-pressed", String(p === b));
    notice(
      b.dataset.finish.toUpperCase() + " FINISH / " + selection().toUpperCase(),
    );
  };
let hoverTime = 0;
renderer.domElement.addEventListener("pointermove", (e) => {
  if (
    !ready ||
    exploration.active ||
    assembly?.busy ||
    e.buttons ||
    performance.now() - hoverTime < 100
  )
    return;
  hoverTime = performance.now();
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    (-(e.clientY - rect.top) / rect.height) * 2 + 1,
  );
  ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObjects(
    [
      ...meshes,
      ...newHelmet,
      ...(kits?.meshes || []),
      ...(inventory?.group.visible ? inventory.picks : []),
    ].filter(isWorldVisible),
    false,
  )[0];
  outline.selectedObjects = hit ? [hit.object] : [];
  outline.enabled = !!hit;
  const label = $("part-label");
  label.style.display = hit ? "block" : "none";
  if (hit) {
    label.textContent = hit.object.userData.inventoryId
      ? inventory.items.find((i) => i.id === hit.object.userData.inventoryId)
          .name
      : hit.object.userData.inspection_region;
    label.style.left = Math.min(e.clientX + 20, innerWidth - 200) + "px";
    label.style.top = e.clientY - 35 + "px";
  }
  renderer.domElement.style.cursor = hit ? "pointer" : "grab";
  dirty = true;
});
renderer.domElement.addEventListener("pointerleave", () => {
  outline.enabled = false;
  $("part-label").style.display = "none";
  dirty = true;
});

function renderInventory() {
  const list = $("inventory-list");
  list.replaceChildren();
  if (!inventory) return;
  const query = $("inventory-search").value.trim().toLowerCase();
  const matchesType = (i) =>
    inventoryType === "All" ||
    (inventoryType === "Helmets"
      ? i.region === "Helmet"
      : inventoryType === "Torso"
        ? ["Chest and back", "Abdomen", "Reactor"].includes(i.region)
        : inventoryType === "Arms"
          ? i.region.includes("forearm")
          : inventoryType === "Hands"
            ? i.region.includes("hand")
            : inventoryType === "Shoulders"
              ? i.region.includes("shoulder")
              : /thigh|shin|foot/.test(i.region));
  const filtered = inventory.items.filter(
    (i) =>
      matchesType(i) &&
      (inventoryCategory === "All" || i.category === inventoryCategory) &&
      (!query ||
        [i.name, i.region, i.category, i.kit?.description || ""]
          .join(" ")
          .toLowerCase()
          .includes(query)),
  );
  $("inventory-count").textContent =
    filtered.length + " / " + inventory.items.length + " parts";
  $("inventory-empty").hidden = filtered.length > 0;
  for (const item of filtered) {
    const button = document.createElement("button");
    button.dataset.inventory = item.id;
    button.setAttribute("aria-pressed", String(item === inventoryItem));
    if (item.kit?.thumbnail) {
      const img = document.createElement("img");
      img.src = assetUrl(item.kit.thumbnail);
      img.alt = "";
      img.loading = "lazy";
      button.append(img);
    } else {
      const swatch = document.createElement("span");
      swatch.className = "inventory-swatch";
      swatch.style.background = `linear-gradient(120deg,${item.colors[0]} 50%,${item.colors[1]} 50%)`;
      swatch.textContent = item.version
        ? "MK " + item.version
        : item.category === "Bastion"
          ? "B"
          : "VII";
      button.append(swatch);
    }
    const title = document.createElement("span");
    title.textContent = item.name;
    const note = document.createElement("small");
    note.textContent = item.kit
      ? equippedKits[item.region] === (item.kit.key || "bastion")
        ? "Installed · " + item.category
        : item.category
      : item.version
        ? item.finish === "classic"
          ? "Original shell"
          : "Custom finish"
        : "Classic component";
    button.append(title, note);
    button.onclick = () => selectInventory(item);
    list.append(button);
  }
  for (const b of document.querySelectorAll("[data-category]"))
    b.setAttribute(
      "aria-pressed",
      String(b.dataset.category === inventoryCategory),
    );
  $("inventory-bank").textContent =
    inventory.bankNames[inventory.page] +
    " · " +
    (inventory.page + 1) +
    " / " +
    inventory.pageCount;
  for (const b of document.querySelectorAll("[data-part-type]"))
    b.setAttribute(
      "aria-pressed",
      String(b.dataset.partType === inventoryType),
    );
  $("inventory-prev").disabled = inventory.page === 0;
  $("inventory-next").disabled = inventory.page === inventory.pageCount - 1;
}
function inventoryTour() {
  if (!ready) return;
  document.body.classList.add("focused");
  isolated = false;
  $("isolate").setAttribute("aria-pressed", "false");
  $("room").checked = true;
  applyVisibility();
  $("rotate").checked = false;
  const mobile = innerWidth < 650;
  camera.fov = mobile ? 65 : 85;
  camera.updateProjectionMatrix();
  moveCamera(
    new THREE.Vector3(0, 1.55, mobile ? -7 : 0.3),
    new THREE.Vector3(0, 1.5, 4.5),
  );
}
function selectInventory(item) {
  inventoryItem = item;
  inventoryType = "All";
  inventory.setPageFor(item);
  inventoryCategory = item.category;
  $("inventory-search").value = "";
  openPanel("inventory", false);
  renderInventory();
  $("inventory-detail").hidden = false;
  document.body.classList.add("inventory-selected");
  $("inventory-name").textContent = item.name;
  $("inventory-description").textContent = item.region + " · " + item.category;
  $("inventory-restore").hidden =
    !item.kit || equippedKits[item.region] !== (item.kit?.key || "bastion");
  $("inventory-equip").textContent = item.version
    ? "Equip helmet"
    : item.region === "Reactor" && !item.kit
      ? "Inspect installed reactor"
      : "Install component";
  document.body.classList.add("focused");
  camera.fov = 40;
  camera.updateProjectionMatrix();
  const target = item.object.position.clone();
  const position = target.clone().add(new THREE.Vector3(0.18, 0.12, -1.8));
  if (innerWidth < 650) {
    position.z = target.z - 2.5;
    target.y -= 0.2;
  }
  moveCamera(position, target);
  dirty = true;
}
for (const b of document.querySelectorAll("[data-category]"))
  b.onclick = () => {
    inventoryType = "All";
    inventoryCategory = b.dataset.category;
    renderInventory();
  };
$("inventory-browse").onclick = () => {
  document.body.classList.remove("inventory-selected");
  $("inventory-detail").hidden = true;
  renderInventory();
  inventoryTour();
};
for (const b of document.querySelectorAll("[data-part-type]"))
  b.onclick = () => {
    if (!ready) return;
    inventoryType = b.dataset.partType;
    inventoryCategory = "All";
    $("inventory-search").value = "";
    const bank = {
      All: 0,
      Helmets: 0,
      Torso: 0,
      Arms: 1,
      Hands: 1,
      Legs: 2,
      Shoulders: 2,
    }[inventoryType];
    inventory.setPage(bank);
    renderInventory();
    inventoryTour();
  };
$("inventory-search").oninput = renderInventory;
$("inventory-prev").onclick = () => {
  if (!ready) return;
  inventory.setPage(inventory.page - 1);
  renderInventory();
  inventoryTour();
};
$("inventory-next").onclick = () => {
  if (!ready) return;
  inventory.setPage(inventory.page + 1);
  renderInventory();
  inventoryTour();
};
$("inventory-tour").onclick = inventoryTour;
$("inventory-suit").onclick = () => {
  reveal();
};
$("inventory-equip").onclick = () => installInventory(false);
$("inventory-restore").onclick = () => installInventory(true);
function installInventory(restore) {
  if (!ready || !inventoryItem || assembly.busy) return;
  const item = inventoryItem;
  if (item.region === "Reactor" && !item.kit) {
    reveal();
    $("region").value = "Reactor";
    $("region").onchange();
    focusRegion();
    notice("INSTALLED ARC REACTOR");
    return;
  }
  // Freeze a consistent fitted pose before staging the exchange.
  closePanel();
  document.body.classList.add("focused");
  $("rotate").checked = false;
  suit.rotation.y = 0;
  isolated = false;
  $("room").checked = true;
  $("lift").value = $("face").value = 0;
  $("lift").oninput();
  $("face").oninput();
  $("region").value = item.region;
  applyVisibility();
  syncPaint();
  suit.updateWorldMatrix(true, true);
  const restoredSource =
    item.region === "Helmet"
      ? version === "85"
        ? newHelmet
        : oldHelmet
      : meshes.filter((m) => m.userData.inspection_region === item.region);
  const current = chosen().filter((m) => m.visible),
    replacement =
      item.kit && !restore
        ? [
            ...(item.kit.replaceBase ? [] : item.kit.originals),
            ...item.kit.meshes,
          ]
        : item.version
          ? item.version === "85"
            ? newHelmet
            : oldHelmet
          : restoredSource;
  const commit = () => {
    if (item.kit && !restore)
      equippedKits[item.region] = item.kit.key || "bastion";
    else delete equippedKits[item.region];
    if (item.version) setVersion(item.version);
    $("red").value = restore ? "#651a20" : item.colors[0];
    $("gold").value = restore ? "#a98a53" : item.colors[1];
    $("red").oninput();
    $("gold").oninput();
    applyVisibility();
    renderInventory();
    $("inventory-restore").hidden =
      !item.kit || equippedKits[item.region] !== (item.kit?.key || "bastion");
    save();
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    commit();
    fullView();
    notice("Component installed");
    return;
  }
  scan.visible = false;
  scanStart = -1;
  outline.enabled = false;
  $("part-label").style.display = "none";
  camera.fov = innerWidth < 650 ? 55 : 45;
  camera.updateProjectionMatrix();
  moveCamera(
    new THREE.Vector3(
      innerWidth < 650 ? 0.7 : 2.4,
      1.8,
      innerWidth < 650 ? -6.8 : -4.6,
    ),
    new THREE.Vector3(0, 1.1, 0),
  );
  assembly.start(current, replacement, item.colors, commit, item.object);
  $("app").inert = true;
  controls.enabled = false;
  $("assembly-hud").hidden = false;
  $("assembly-part").textContent = item.name;
}
$("assembly-skip").onclick = () => assembly?.skip();
$("assembly-cancel").onclick = () => assembly?.cancel();

$("armor-inventory").onclick = () =>
  ready &&
  selectInventory(
    inventory.items.find(
      (i) =>
        i.id ===
        (equippedKits.Helmet ||
          (version === "85" ? "85-classic" : "vii-classic")),
    ),
  );

$("assembly-sound").onclick = () => {
  const on = $("assembly-sound").getAttribute("aria-pressed") !== "true";
  $("assembly-sound").setAttribute("aria-pressed", String(on));
  $("assembly-sound").textContent = on ? "Sound on" : "Sound off";
  if (assembly) assembly.soundEnabled = on;
};
