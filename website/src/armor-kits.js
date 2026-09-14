import * as THREE from "three";

// Blender-authored replacement assemblies retain the existing regional slot contract.
export function createArmorKits(
  suit,
  baseMeshes,
  lab,
  catalog,
  foundry,
  foundryCatalog,
  arsenal,
  arsenalCatalog,
  bastion,
  bastionCatalog,
) {
  const group = new THREE.Group();
  group.name = "Bastion armor kit";
  suit.add(group);
  suit.updateWorldMatrix(true, true);
  const parts = [],
    meshes = [];
  function addCatalog(sourceModel, definitions, legacyBastion = false) {
    group.add(sourceModel);
    group.updateWorldMatrix(true, true);
    for (const definition of definitions) {
      const source = sourceModel.getObjectByName(definition.id);
      if (!source)
        throw new Error("Missing inventory module: " + definition.id);
      const local = [];
      source.traverse((o) => {
        if (o.isMesh) {
          o.userData.inspection_region = definition.region;
          o.userData.kit = legacyBastion ? "bastion" : definition.id;
          local.push(o);
          meshes.push(o);
        }
      });
      parts.push({
        ...definition,
        ...(legacyBastion ? {} : { key: definition.id }),
        meshes: local,
        originals: baseMeshes.filter(
          (m) => m.userData.inspection_region === definition.region,
        ),
      });
    }
  }
  addCatalog(bastion, bastionCatalog, true);
  addCatalog(lab, catalog);
  addCatalog(foundry, foundryCatalog);
  addCatalog(arsenal, arsenalCatalog);
  group.updateWorldMatrix(true, true);
  return { group, parts, meshes };
}
