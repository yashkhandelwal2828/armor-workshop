import * as THREE from "three";
import { stepServo, STEP } from "./servo.js";
import { createMechanicalAudio } from "./mechanical-audio.js";
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
// Speed up travel and stage holds together, preserving fixed-step servo motion.
const PLAYBACK_RATE = 1.4;

export function createAssembly(scene, { onStage, onEnd, robotModel }) {
  const sound = createMechanicalAudio();
  const group = new THREE.Group();
  group.name = "Articulated assembly machines";
  scene.add(group);
  const glow = new THREE.MeshBasicMaterial({ color: "#8de8ff" });
  function mesh(geo, mat, parent = group) {
    const m = new THREE.Mesh(geo, mat);
    parent.add(m);
    return m;
  }
  function module(name) {
    const part = robotModel.getObjectByName(name).clone(true);
    part.position.set(0, 0, 0);
    part.quaternion.identity();
    part.scale.set(1, 1, 1);
    part.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = false;
      }
    });
    group.add(part);
    return part;
  }
  const lengths = [1.45, 1.35];
  const arms = [-1, 1].map((side) => {
    const base = V(side * 1.75, 0, 0.55),
      shoulder = base.clone().add(V(0, 0.69, 0));
    const foundation = module("BASE");
    foundation.position.copy(base);
    const home = base.clone();
    const upper = module("UPPER"),
      forearm = module("FOREARM"),
      joints = [module("JOINT"), module("JOINT")],
      wrist = module("WRIST");
    const telescope = mesh(
      new THREE.BoxGeometry(0.13, 1, 0.13),
      new THREE.MeshStandardMaterial({
        color: "#a4b2bb",
        metalness: 0.9,
        roughness: 0.23,
      }),
    );
    const fingers = [module("FINGER"), module("FINGER")];
    fingers.forEach((f) => wrist.add(f));
    const rest = V(side * 1.05, 1.35, 0.15);
    let measured = [0, 0];
    const position = rest.clone(),
      velocity = V();
    let reachError = 0;
    function pose(partCenter, grip = 0) {
      const target = partCenter.clone().add(V(side * 0.28, 0, 0.05));
      const delta = target.clone().sub(shoulder),
        foreLength = Math.min(
          5,
          Math.max(lengths[1], delta.length() - lengths[0] + 0.25),
        ),
        distance = THREE.MathUtils.clamp(
          delta.length(),
          0.12,
          lengths[0] + foreLength - 0.001,
        ),
        axis = delta.normalize();
      const reach = shoulder.clone().addScaledVector(axis, distance);
      reachError = reach.distanceTo(target);
      const along =
          (lengths[0] ** 2 - foreLength ** 2 + distance ** 2) / (2 * distance),
        height = Math.sqrt(Math.max(0, lengths[0] ** 2 - along ** 2));
      const bend = V(side, 0.45, 0.65);
      bend.addScaledVector(axis, -bend.dot(axis)).normalize();
      const elbow = shoulder
        .clone()
        .addScaledVector(axis, along)
        .addScaledVector(bend, height);
      for (const [part, a, b, length] of [
        [upper, shoulder, elbow, lengths[0]],
        [forearm, elbow, reach, lengths[1]],
      ]) {
        part.position.copy(a);
        part.quaternion.setFromUnitVectors(
          V(0, 1, 0),
          b.clone().sub(a).normalize(),
        );
        part.scale.set(1, length, 1);
      }
      const foreAxis = reach.clone().sub(elbow).normalize(),
        extension = foreLength - lengths[1];
      telescope.visible = extension > 0.001;
      telescope.position
        .copy(elbow)
        .addScaledVector(foreAxis, lengths[1] - 0.16 + extension / 2);
      telescope.quaternion.copy(forearm.quaternion);
      telescope.scale.set(1, extension + 0.32, 1);
      joints[0].position.copy(shoulder);
      joints[1].position.copy(elbow);
      wrist.position.copy(reach);
      wrist.quaternion.setFromUnitVectors(
        V(0, 1, 0),
        partCenter.clone().sub(reach).normalize(),
      );
      fingers.forEach((f, i) => {
        f.position.set((i ? 1 : -1) * (0.13 - 0.045 * grip), 0.23, 0);
        f.rotation.y = i ? 0 : Math.PI;
      });
      measured = [shoulder.distanceTo(elbow), elbow.distanceTo(reach)];
    }
    pose(rest);
    return {
      pose,
      rest,
      side,
      position,
      velocity,
      base,
      home,
      advance(target, grip, fast = false) {
        stepServo(
          position,
          velocity,
          target,
          STEP,
          fast ? { speed: 1.4, acceleration: 7 } : {},
        );
        pose(position, grip);
      },
      get reachError() {
        return reachError;
      },
      get lengths() {
        return measured;
      },
    };
  });
  const scanner = mesh(new THREE.TorusGeometry(0.48, 0.003, 6, 100), glow);
  scanner.rotation.x = Math.PI / 2;
  scanner.visible = false;
  let job = null,
    stage = "Idle",
    lastTime = null,
    accumulator = 0;
  let lastMetrics = { maxReachError: 0, maxSpeed: 0 };
  function copyParts(parts, colors) {
    const root = new THREE.Group(),
      box = new THREE.Box3();
    for (const source of parts) {
      source.updateWorldMatrix(true, false);
      const mats = (
        Array.isArray(source.material) ? source.material : [source.material]
      ).map((m) => {
        const c = m.clone();
        if (colors) {
          if (m.name.includes("/ Red ") || m.name === "Mark 85 / Red shell")
            c.color.set(colors[0]);
          if (
            m.name.includes("/ Gold ") ||
            m.name === "Mark 85 / Gold faceplate"
          )
            c.color.set(colors[1]);
        }
        return c;
      });
      const m = new THREE.Mesh(
        source.geometry,
        Array.isArray(source.material) ? mats : mats[0],
      );
      source.matrixWorld.decompose(m.position, m.quaternion, m.scale);
      root.add(m);
    }
    box.setFromObject(root);
    const center = box.getCenter(V());
    for (const m of root.children) m.position.sub(center);
    root.position.copy(center);
    scene.add(root);
    return { root, center };
  }
  function disposeCopy(copy) {
    scene.remove(copy.root);
    copy.root.traverse((m) => {
      if (m.isMesh)
        for (const mat of Array.isArray(m.material) ? m.material : [m.material])
          mat.dispose();
    });
  }
  function finish(commit) {
    if (!job) return;
    const j = job;
    job = null;
    j.shelf.visible = true;
    j.parts.forEach((m, i) => (m.visible = j.visibility[i]));
    disposeCopy(j.out);
    disposeCopy(j.incoming);
    scanner.visible = false;
    sound.stop();
    arms.forEach((a) => {
      a.position.copy(a.rest);
      a.velocity.set(0, 0, 0);
      a.pose(a.rest);
    });
    if (commit) j.commit();
    stage = commit ? "Complete" : "Cancelled";
    onEnd(commit);
  }
  return {
    group,
    get busy() {
      return !!job;
    },
    set soundEnabled(value) {
      sound.enabled = value;
    },
    get state() {
      return {
        busy: !!job,
        stage,
        source: job?.shelf.name,
        phase: job?.phase,
        shelfVisible: job?.shelf.visible,
        carrying: job?.phase >= 3 && job?.phase < 12,
        basePositions: arms.map((a) => a.base.toArray()),
        linkLengths: arms.map((a) => a.lengths),
        progress: job?.progress || 0,
        physics: { step: STEP, ...lastMetrics },
        audio: sound.state,
      };
    },
    start(parts, replacement, colors, commit, shelf) {
      if (job) return false;
      sound.init();
      sound.cue("Fetch");
      const out = copyParts(parts),
        incoming = copyParts(replacement, colors);
      out.root.visible = false;
      incoming.root.visible = false;
      shelf.updateWorldMatrix(true, true);
      const stock = new THREE.Box3().setFromObject(shelf).getCenter(V());
      const center = out.center,
        destination = incoming.center.clone(),
        helmet = parts[0]?.userData.inspection_region === "Helmet";
      const clearance = helmet ? V(0, 0.38, 0) : V(0, 0, -0.48);
      const removed = center
          .clone()
          .add(clearance)
          .add(V(-0.85, 0.1, 0)),
        supply = destination
          .clone()
          .add(clearance)
          .add(V(0.85, 0.1, 0));
      incoming.root.position.copy(stock);
      const approach = stock.clone().add(V(0, 0, -0.6));
      job = {
        parts,
        visibility: parts.map((m) => m.visible),
        out,
        incoming,
        commit,
        shelf,
        stock,
        destination,
        approach,
        progress: 0,
        phase: 0,
        elapsed: 0,
        center,
        clearance,
        removed,
        supply,
      };
      lastTime = performance.now();
      accumulator = 0;
      lastMetrics = { maxReachError: 0, maxSpeed: 0 };
      stage = "Fetch";
      onStage(stage, 0);
      return true;
    },
    skip() {
      finish(true);
    },
    cancel() {
      finish(false);
    },
    update(now) {
      if (!job) return false;
      accumulator += Math.min((now - lastTime) / 1000, 0.1) * PLAYBACK_RATE;
      lastTime = now;
      while (accumulator >= STEP && job) {
        accumulator -= STEP;
        const j = job;
        j.elapsed += STEP;
        const phases = [
          "Fetch",
          "Grip",
          "Grip",
          "Carry",
          "Carry",
          "Scan",
          "Release",
          "Release",
          "Release",
          "Install",
          "Install",
          "Lock",
          "Retract",
        ];
        const next = phases[j.phase];
        if (next !== stage) {
          stage = next;
          sound.cue(stage);
        }
        const clear = j.center.clone().add(j.clearance),
          fitClear = j.destination.clone().add(j.clearance);
        let targets = [arms[0].rest, arms[1].rest];
        if (j.phase === 0) targets[1] = j.approach;
        else if (j.phase <= 2) targets[1] = j.stock;
        else if (j.phase === 3) targets[1] = j.approach;
        else if (j.phase === 4) targets[1] = j.supply;
        else if (j.phase <= 6) targets = [j.center, j.supply];
        else if (j.phase === 7) targets = [clear, j.supply];
        else if (j.phase === 8) targets = [j.removed, j.supply];
        else if (j.phase === 9) targets = [j.removed, fitClear];
        else if (j.phase <= 11) targets = [j.removed, j.destination];
        arms.forEach((a, i) => {
          a.advance(
            targets[i],
            i === 1
              ? j.phase >= 2 && j.phase < 12
                ? 1
                : 0
              : j.phase >= 6 && j.phase < 12
                ? 1
                : 0,
            j.phase <= 4,
          );
          lastMetrics.maxReachError = Math.max(
            lastMetrics.maxReachError,
            a.reachError,
          );
          lastMetrics.maxSpeed = Math.max(
            lastMetrics.maxSpeed,
            a.velocity.length(),
          );
        });
        j.parts.forEach((m) => (m.visible = j.phase < 7));
        j.out.root.visible = j.phase >= 7;
        if (j.phase >= 7 && j.phase < 12)
          j.out.root.position.copy(arms[0].position);
        if (j.phase >= 3) {
          j.shelf.visible = false;
          j.incoming.root.visible = true;
          if (j.phase < 12) j.incoming.root.position.copy(arms[1].position);
        }
        scanner.visible = j.phase === 5 || j.phase === 11;
        scanner.position
          .copy(j.center)
          .add(V(0, Math.sin(j.elapsed * 5) * 0.2, 0));
        const settled = arms.every(
          (a, i) =>
            a.position.distanceTo(targets[i]) < 0.002 &&
            a.velocity.length() < 0.008,
        );
        if (
          settled &&
          j.elapsed > ([2, 6, 11].includes(j.phase) ? 0.45 : 0.12)
        ) {
          j.elapsed = 0;
          j.phase++;
          if (j.phase >= 13) {
            finish(true);
            break;
          }
        }
        j.progress = Math.min(j.phase / 13, 1);
        onStage(stage, j.progress);
        sound.drive(
          Math.max(...arms.map((a) => a.velocity.length())),
          arms[1].velocity.length() - arms[0].velocity.length(),
        );
      }
      return true;
    },
  };
}
