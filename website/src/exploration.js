import * as THREE from "three";

export function createExploration({
  camera,
  controls,
  canvas,
  onChange,
  onEnter,
}) {
  let active = false,
    drag = null;
  const keys = new Set(),
    angles = new THREE.Euler(0, 0, 0, "YXZ");
  const button = document.getElementById("explore"),
    hud = document.getElementById("explore-help");
  function setActive(value) {
    active = value;
    keys.clear();
    drag = null;
    controls.enabled = !value;
    button.setAttribute("aria-pressed", String(value));
    button.textContent = value ? "Exit free roam" : "Free roam";
    hud.hidden = !value;
    document.body.classList.toggle("free-roam", value);
    if (value) {
      onEnter();
      angles.setFromQuaternion(camera.quaternion);
      canvas.focus();
    } else {
      const direction = camera.getWorldDirection(new THREE.Vector3());
      controls.target.copy(camera.position).addScaledVector(direction, 2);
    }
    onChange();
  }
  button.onclick = () => setActive(!active);
  const editable = (e) => e.target.closest?.("input,select,textarea,button");
  addEventListener("keydown", (e) => {
    if (!active || editable(e)) return;
    if (e.code === "Escape") {
      setActive(false);
      return;
    }
    if (
      [
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "KeyQ",
        "KeyE",
        "ShiftLeft",
        "ShiftRight",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(e.code)
    ) {
      e.preventDefault();
      keys.add(e.code);
    }
  });
  addEventListener("keyup", (e) => keys.delete(e.code));
  addEventListener("blur", () => {
    keys.clear();
    drag = null;
  });
  document.addEventListener("visibilitychange", () => keys.clear());
  canvas.addEventListener("pointerdown", (e) => {
    if (!active) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!active || drag?.id !== e.pointerId) return;
    angles.y -= (e.clientX - drag.x) * 0.003;
    angles.x = THREE.MathUtils.clamp(
      angles.x - (e.clientY - drag.y) * 0.003,
      -Math.PI / 2 + 0.02,
      Math.PI / 2 - 0.02,
    );
    camera.quaternion.setFromEuler(angles);
    drag.x = e.clientX;
    drag.y = e.clientY;
    onChange();
  });
  const release = () => {
    drag = null;
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener(
    "wheel",
    (e) => {
      if (!active) return;
      e.preventDefault();
      camera.position.addScaledVector(
        camera.getWorldDirection(new THREE.Vector3()),
        -Math.sign(e.deltaY) * 0.24,
      );
      onChange();
    },
    { passive: false },
  );
  for (const control of document.querySelectorAll("[data-travel]")) {
    control.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      control.setPointerCapture(e.pointerId);
      keys.add(control.dataset.travel);
    });
    for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
      control.addEventListener(event, () =>
        keys.delete(control.dataset.travel),
      );
  }
  return {
    get active() {
      return active;
    },
    exit() {
      if (active) setActive(false);
    },
    update(dt) {
      if (!active) return false;
      const forward = camera.getWorldDirection(new THREE.Vector3()),
        right = new THREE.Vector3()
          .crossVectors(forward, camera.up)
          .normalize(),
        move = new THREE.Vector3();
      const held = (...codes) => codes.some((c) => keys.has(c));
      if (held("KeyW", "ArrowUp")) move.add(forward);
      if (held("KeyS", "ArrowDown")) move.sub(forward);
      if (held("KeyD", "ArrowRight")) move.add(right);
      if (held("KeyA", "ArrowLeft")) move.sub(right);
      if (held("KeyE")) move.y++;
      if (held("KeyQ")) move.y--;
      if (!move.lengthSq()) return false;
      camera.position.addScaledVector(
        move.normalize(),
        dt * (held("ShiftLeft", "ShiftRight") ? 4 : 1.6),
      );
      return true;
    },
  };
}
