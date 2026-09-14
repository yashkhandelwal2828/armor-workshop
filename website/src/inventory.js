import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

// Display copies share geometry, but each finish owns its materials.
export function createInventory({
  scene,
  original,
  alternate,
  kits,
  onSelect,
}) {
  original.updateWorldMatrix(true, true);
  alternate.updateWorldMatrix(true, true);
  const group = new THREE.Group();
  group.name = "Workshop inventory";
  scene.add(group);
  const picks = [],
    items = [];
  const finishes = {
    classic: ["#95161f", "#d3a25b"],
    stealth: ["#202d37", "#9cabb5"],
    arctic: ["#dce5e8", "#698c9d"],
    midas: ["#bb853c", "#edd096"],
    obsidian: ["#15191f", "#714353"],
  };
  const definitions = [
    ...kits.parts
      .filter((p) => p.key)
      .sort(
        (a, b) =>
          (b.family === "Arsenal" ? 2 : b.family === "Foundry" ? 1 : 0) -
          (a.family === "Arsenal" ? 2 : a.family === "Foundry" ? 1 : 0),
      )
      .map((p) => [p.id, p.name, p.region, null, "classic"]),
    ["vii-classic", "Mark VII", "Helmet", "7", "classic"],
    ["85-classic", "Mark 85", "Helmet", "85", "classic"],
    ["vii-stealth", "VII · Stealth", "Helmet", "7", "stealth"],
    ["85-arctic", "85 · Arctic", "Helmet", "85", "arctic"],
    ["vii-midas", "VII · Midas", "Helmet", "7", "midas"],
    ["85-obsidian", "85 · Obsidian", "Helmet", "85", "obsidian"],
    ["chest", "Chest assembly", "Chest and back", null, "classic"],
    ["reactor", "Arc reactor", "Reactor", null, "classic"],
    ["left-arm", "Left gauntlet", "Left forearm", null, "midas"],
    ["right-arm", "Right gauntlet", "Right forearm", null, "stealth"],
    ["left-hand", "Left glove", "Left hand", null, "arctic"],
    ["shin", "Left greave", "Left shin", null, "obsidian"],
  ];
  for (const part of kits.parts.filter((p) => !p.key))
    definitions.push([part.id, part.name, part.region, null, "classic"]);
  const cabinetNames = [
    "HELMETS",
    "CHEST & BACK",
    "REACTORS",
    "LEFT ARM",
    "RIGHT ARM",
    "HANDS",
    "LEFT LEG",
    "RIGHT LEG",
    "SHOULDERS",
  ];
  const bankNames = ["Head & core", "Arms & hands", "Legs & shoulders"];
  function cabinetFor(region) {
    if (region === "Helmet") return 0;
    if (region === "Chest and back") return 1;
    if (region === "Reactor") return 2;
    if (region === "Left forearm") return 3;
    if (region === "Right forearm") return 4;
    if (region.includes("hand")) return 5;
    if (region.includes("shoulder") || region === "Abdomen") return 8;
    return region.startsWith("Left") ? 6 : 7;
  }
  const cabinetCounts = Array(9).fill(0);
  for (const d of definitions) cabinetCounts[cabinetFor(d[2])]++;
  const shoulderCount = definitions.filter((d) =>
    d[2].includes("shoulder"),
  ).length;
  let abdomenSlot = shoulderCount;
  const cabinetSlots = Array(9).fill(0);
  const cabinetLabels = [];
  function textPanel(text, x, y, width, height, font = 38) {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 112;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0b1722";
    ctx.fillRect(0, 0, 768, 112);
    ctx.fillStyle = "#acd8e7";
    ctx.font = font + "px monospace";
    ctx.textAlign = "center";
    ctx.fillText(text, 384, 72, 720);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }),
    );
    mesh.rotation.y = Math.PI;
    mesh.position.set(x, y, 4.13);
    group.add(mesh);
    return mesh;
  }
  for (let c = 0; c < cabinetNames.length; c++) {
    const x = [-2.45, 0, 2.45][c % 3];
    cabinetLabels.push({
      page: Math.floor(c / 3),
      object: textPanel(
        cabinetNames[c] + " / " + cabinetCounts[c],
        x,
        2.94,
        1.95,
        0.22,
      ),
    });
    if (c === 8)
      cabinetLabels.push({
        page: 2,
        object: textPanel("ABDOMEN", x, 0.83, 1.95, 0.13, 32),
      });
  }
  const metal = new THREE.MeshStandardMaterial({
    color: "#111e28",
    metalness: 0.65,
    roughness: 0.35,
  });
  const edge = new THREE.MeshBasicMaterial({ color: "#69c9ee" });
  function box(x, y, z, w, h, d, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  }
  RectAreaLightUniformsLib.init();
  // Broad frontal fill lights illuminate every row, including dark corner components.
  for (const x of [-2.45, 0, 2.45]) {
    const fill = new THREE.RectAreaLight("#d6e9ff", 4, 2.1, 2.6);
    fill.name = "Inventory bay fill";
    fill.position.set(x, 1.65, 3.25);
    fill.lookAt(x, 1.4, 4.55);
    group.add(fill);
  }
  // Existing rear service bays become stocked cabinets.
  for (const x of [-2.45, 0, 2.45]) {
    box(x, 1.55, 4.96, 2.2, 2.98, 0.045, metal);
    for (const dx of [-1.09, 1.09]) {
      box(x + dx, 1.55, 4.55, 0.045, 2.98, 0.75, metal);
      box(x + dx, 1.55, 4.145, 0.012, 2.9, 0.012, edge);
    }
    box(x, 3.03, 4.55, 2.22, 0.06, 0.82, metal);
    for (let c = 0; c < cabinetCounts.length; c++)
      if (c % 3 === Math.round((x + 2.45) / 2.45)) {
        const rows = Math.ceil(cabinetCounts[c] / 3);
        for (let r = 0; r < rows; r++) {
          const y = 0.17 + (r * 1.82) / Math.max(1, rows - 1);
          cabinetLabels.push({
            page: Math.floor(c / 3),
            object: box(x, y, 4.58, 2.15, 0.045, 0.84, metal),
          });
          cabinetLabels.push({
            page: Math.floor(c / 3),
            object: box(x, y + 0.025, 4.155, 2.1, 0.008, 0.008, edge),
          });
        }
      }
  }
  for (let i = 0; i < definitions.length; i++) {
    const [id, name, region, version, finish] = definitions[i];
    const kit = kits.parts.find((p) => p.id === id);
    const cabinet = cabinetFor(region),
      slot = region === "Abdomen" ? abdomenSlot++ : cabinetSlots[cabinet]++;
    const item = {
      id,
      name,
      region,
      version,
      finish,
      kit,
      cabinet,
      shelfCategory: cabinetNames[cabinet],
      colors: kit ? kit.colors || ["#651a20", "#a98a53"] : finishes[finish],
      category: kit
        ? kit.family || "Bastion"
        : version
          ? "Helmets"
          : "Components",
    };
    const display = new THREE.Group();
    display.name = name;
    const source = version === "85" ? alternate : original;
    const sources = [];
    if (kit)
      sources.push(...(kit.replaceBase ? [] : kit.originals), ...kit.meshes);
    else
      source.traverse((o) => {
        if (o.isMesh) sources.push(o);
      });
    sources.forEach((o) => {
      if (!o.isMesh || o.userData.inspection_region !== region) return;
      const materials = (
        Array.isArray(o.material) ? o.material : [o.material]
      ).map((m) => {
        const copy = m.clone();
        if (m.name.includes("/ Red ") || m.name === "Mark 85 / Red shell")
          copy.color.set(item.colors[0]);
        if (m.name.includes("/ Gold ") || m.name === "Mark 85 / Gold faceplate")
          copy.color.set(item.colors[1]);
        return copy;
      });
      const mesh = new THREE.Mesh(
        o.geometry,
        Array.isArray(o.material) ? materials : materials[0],
      );
      o.matrixWorld.decompose(mesh.position, mesh.quaternion, mesh.scale);
      mesh.userData.inventoryId = id;
      display.add(mesh);
      picks.push(mesh);
    });
    const bounds = new THREE.Box3().setFromObject(display),
      center = bounds.getCenter(new THREE.Vector3()),
      extent = bounds.getSize(new THREE.Vector3());
    const scale = 1; // Physical stock uses the same dimensions as the installed part.
    for (const mesh of display.children) mesh.position.sub(center);
    display.scale.setScalar(scale);
    const rows = Math.ceil(cabinetCounts[cabinet] / 3),
      col = slot % 3,
      row = rows - 1 - Math.floor(slot / 3),
      x = [-2.45, 0, 2.45][cabinet % 3] + (col - 1) * 0.69,
      y = 0.17 + (row * 1.82) / Math.max(1, rows - 1);
    display.position.set(x, y + 0.078 + extent.y / 2, 4.49);
    group.add(display);
    item.object = display;
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.19, 0.045, 40),
      metal,
    );
    pedestal.position.set(x, y + 0.055, 4.49);
    group.add(pedestal);
    const mounts = [];
    if (region === "Reactor") {
      // Small cores stay at fitted scale; illuminated docking cradles make their slots readable.
      const cradle = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.008, 8, 48),
        metal,
      );
      cradle.position.set(x, display.position.y, 4.6);
      group.add(cradle);
      mounts.push(cradle);
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.125, 0.002, 4, 48),
        edge,
      );
      halo.position.set(x, display.position.y, 4.59);
      group.add(halo);
      mounts.push(halo);
      for (const dx of [-0.145, 0.145])
        mounts.push(
          box(x + dx, display.position.y, 4.63, 0.018, 0.31, 0.025, metal),
        );
    }
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0b1722";
    ctx.fillRect(0, 0, 512, 96);
    ctx.fillStyle = "#acd8e7";
    ctx.font = "29px monospace";
    ctx.textAlign = "center";
    ctx.fillText(name.toUpperCase(), 256, 40, 480);
    ctx.font = "18px monospace";
    ctx.fillStyle = "#6a8b9d";
    ctx.fillText(
      version
        ? "HELMET / " +
            (finish === "classic" ? "SOURCE DESIGN" : "CUSTOM FINISH")
        : region.toUpperCase(),
      256,
      72,
      480,
    );
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.65, 0.12),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
    );
    label.rotation.y = Math.PI;
    label.position.set(x, y - 0.055, 4.15);
    group.add(label);
    item.page = Math.floor(cabinet / 3);
    item.fixtures = [pedestal, label, ...mounts];
    items.push(item);
  }
  let page = 0;
  const pageCount = bankNames.length;
  function setPage(value) {
    page = Math.max(0, Math.min(pageCount - 1, value));
    for (const label of cabinetLabels)
      label.object.visible = label.page === page;
    for (const item of items) {
      const visible = item.page === page;
      item.object.visible = visible;
      for (const mesh of item.object.children) mesh.visible = visible;
      for (const fixture of item.fixtures) fixture.visible = visible;
    }
  }
  setPage(0);
  return {
    group,
    items,
    picks,
    pageCount,
    bankNames,
    get page() {
      return page;
    },
    setPage,
    setPageFor(item) {
      setPage(item.page);
    },
    select(id) {
      const item = items.find((i) => i.id === id);
      if (item) {
        setPage(item.page);
        onSelect(item);
      }
    },
  };
}
