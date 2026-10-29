/* Cinematic opening: carved doors swing open, the camera glides through,
   and velvet curtains with gold zari gather into tie-backs. WebGL / Three.js. */
(() => {
  "use strict";
  const T = window.THREE;
  if (!T) return;

  const ok = (() => {
    try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
  })();
  if (!ok) return;

  const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const easeOut = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const FOV = 40;
  const TAN = Math.tan((FOV / 2) * Math.PI / 180);
  const Z0 = 1 / TAN; // camera distance at which the z=0 plane is exactly 2 units tall

  /* ───────── Shaders ───────── */
  const curtainVS = `
    uniform float uOpen, uTime, uSide, uW, uOuter, uH, uTie, uSway;
    uniform vec4 uPoke;
    varying vec3 vN; varying vec3 vP; varying vec2 vUv; varying float vFold;
    float kf(float v){
      if (v < uTie) return mix(0.70, 0.83, smoothstep(0.0, uTie, v));
      return mix(0.83, 0.64, pow((v - uTie) / (1.0 - uTie), 1.3));
    }
    float fold(float s, float v){ return sin(s * 7.0 * 6.2831 + 0.5 * sin(v * 2.1 + uTime * 0.45) + 0.35 * sin(s * 23.0 + v * 1.7)); }
    vec3 P(float s, float v){
      float g = uOpen * kf(v);
      float sc = s * (1.0 - g);
      float x = uOuter - uSide * sc * uW;
      float y = (v - 0.5) * uH;
      float amp = 0.02 * (1.0 + 2.2 * g);
      float z = amp * fold(s, v);
      z += uSway * 0.014 * sin(uTime * 0.9 + v * 2.5 + s * 2.0) * (1.0 - v);
      z += g * 0.07 * exp(-pow((v - uTie) * 7.0, 2.0)) * s;
      float d = distance(vec2(x, y), uPoke.xy);
      float age = uTime - uPoke.z;
      z += uPoke.w * exp(-d * 4.0) * sin(d * 16.0 - age * 8.0) * exp(-age * 1.4) * step(0.0, age);
      return vec3(x, y, z);
    }
    void main(){
      float s = uSide < 0.0 ? uv.x : 1.0 - uv.x;
      float v = uv.y;
      vec3 p = P(s, v);
      float e = 0.0015;
      vec3 n = normalize(cross(P(s + e, v) - p, P(s, v + e) - p));
      if (n.z < 0.0) n = -n;
      vN = n; vP = p; vUv = vec2(s, v); vFold = fold(s, v);
      gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
    }`;

  const curtainFS = `
    uniform sampler2D uMotif; uniform vec3 uCam; uniform float uGlow; uniform float uDim;
    varying vec3 vN; varying vec3 vP; varying vec2 vUv; varying float vFold;
    void main(){
      vec3 N = normalize(vN); vec3 V = normalize(uCam - vP);
      vec3 L1 = normalize(vec3(0.35, 0.6, 1.0)); vec3 L2 = normalize(vec3(-0.6, 0.1, 0.8));
      float dif = max(dot(N, L1), 0.0) * 0.85 + max(dot(N, L2), 0.0) * 0.25;
      float ao = 0.42 + 0.58 * pow(0.5 + 0.5 * vFold, 0.8);
      float fres = pow(1.0 - max(dot(N, V), 0.0), 2.0);
      float nap = 0.94 + 0.06 * fract(sin(dot(floor(vUv * vec2(900.0, 1400.0)), vec2(12.9898, 78.233))) * 43758.5453);
      vec3 velvet = (vec3(0.33, 0.025, 0.06) * (0.28 + dif) * ao + vec3(0.95, 0.34, 0.40) * fres * 0.55 * ao) * nap;
      vec3 H = normalize(L1 + V);
      float spec = pow(max(dot(N, H), 0.0), 40.0);
      vec3 gold = vec3(0.80, 0.58, 0.24) * (0.30 + 0.80 * dif) * (0.7 + 0.3 * ao) + vec3(1.0, 0.88, 0.58) * spec * 1.4;
      float m = texture2D(uMotif, vec2(vUv.x * 3.0, vUv.y * 9.5)).a;
      float border = smoothstep(0.905, 0.91, vUv.x);
      float bp = 0.55 + 0.45 * step(0.45, fract(vUv.y * 64.0 + abs(vUv.x - 0.955) * 22.0));
      float edgeLine = smoothstep(0.885, 0.89, vUv.x) * (1.0 - smoothstep(0.894, 0.898, vUv.x));
      float hem = 1.0 - smoothstep(0.045, 0.05, vUv.y);
      float hemLine = smoothstep(0.06, 0.064, vUv.y) * (1.0 - smoothstep(0.068, 0.072, vUv.y));
      float gm = max(m * 0.95 * (1.0 - border), max(border * bp, max(edgeLine, max(hem, hemLine))));
      vec3 col = mix(velvet, gold, gm);
      col += vec3(1.0, 0.55, 0.2) * uGlow * 0.12 * smoothstep(0.5, 1.0, vUv.x) * ao;
      gl_FragColor = vec4(col * uDim, 1.0);
    }`;

  const valanceVS = `
    varying vec2 vUv; varying vec3 vP;
    void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

  const valanceFS = `
    uniform float uN, uWid, uHgt, uDim, uStretch;
    varying vec2 vUv; varying vec3 vP;
    void main(){
      vec2 vUv = vec2(vUv.x, vUv.y * uStretch);
      float f = fract(vUv.x * uN);
      float x2 = 2.0 * f - 1.0;
      float edge = 0.50 - 0.40 * (1.0 - x2 * x2);
      float fr = 0.10;
      if (vUv.y < edge - fr) discard;
      float q = clamp((vUv.y - edge) / (1.0 - edge), 0.0, 1.0);
      float fw = q * 3.1416 * 4.5;
      vec3 n = normalize(vec3(x2 * 0.35 * (1.0 - q), -cos(fw) * 0.55, 1.0));
      vec3 L = normalize(vec3(0.3, 0.6, 1.0));
      float dif = max(dot(n, L), 0.0);
      float shade = 0.65 + 0.35 * sin(fw);
      vec3 velvet = vec3(0.40, 0.035, 0.075) * (0.35 + 0.85 * dif) * shade + vec3(0.95, 0.36, 0.42) * pow(1.0 - n.z, 1.5) * 0.5;
      float d = vUv.y - edge;
      float band = smoothstep(0.0, 0.006, d) * (1.0 - smoothstep(0.045, 0.05, d));
      float band2 = smoothstep(0.065, 0.07, d) * (1.0 - smoothstep(0.078, 0.083, d));
      float rod = smoothstep(0.88, 0.89, vUv.y) * (1.0 - smoothstep(0.97, 0.975, vUv.y));
      if (vUv.y > 1.0) { float pl = 0.6 + 0.4 * sin(vUv.x * uN * 30.0); velvet = vec3(0.30, 0.025, 0.055) * pl; }
      float spec = pow(dif, 24.0);
      vec3 gold = vec3(0.82, 0.60, 0.25) * (0.45 + 0.75 * dif) + vec3(1.0, 0.9, 0.6) * spec;
      vec3 col = mix(velvet, gold, max(max(band, band2 * 0.9), rod));
      float a = 1.0;
      if (d < 0.0) {
        float t = -d / fr;
        float th = smoothstep(0.3, 0.55, fract(vUv.x * uN * 46.0));
        col = vec3(0.86, 0.63, 0.27) * (0.65 + 0.35 * th) * (1.0 - 0.45 * t);
        a = th * (1.0 - smoothstep(0.8, 1.0, t));
      }
      float jx = floor(vUv.x * uN + 0.5) / uN;
      float rd = length(vec2((vUv.x - jx) * uWid, (vUv.y - 0.6) * uHgt));
      if (rd < 0.042) {
        float r = rd / 0.042;
        col = vec3(0.86, 0.64, 0.27) * (0.65 + 0.35 * cos(r * 18.0)) * (1.1 - 0.4 * r) + vec3(1.0, 0.9, 0.6) * pow(1.0 - r, 6.0) * 0.6;
        a = 1.0;
      }
      if (a < 0.02) discard;
      gl_FragColor = vec4(col * uDim, a);
    }`;

  /* ───────── Canvas textures ───────── */
  function motifTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    const buti = (cx, cy, r) => {
      g.save(); g.translate(cx, cy);
      for (let i = 0; i < 8; i++) {
        g.rotate(Math.PI / 4);
        g.beginPath(); g.ellipse(0, -r * 0.62, r * 0.2, r * 0.42, 0, 0, Math.PI * 2); g.fill();
      }
      g.beginPath(); g.arc(0, 0, r * 0.2, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        g.beginPath(); g.arc(Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15, r * 0.07, 0, Math.PI * 2); g.fill();
      }
      g.restore();
    };
    const leaf = (cx, cy, s) => {
      g.save(); g.translate(cx, cy);
      for (const dir of [-1, 1]) {
        g.save(); g.scale(dir, 1); g.rotate(-0.6);
        g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.6, -s * 0.5, 0, -s * 1.3); g.quadraticCurveTo(-s * 0.3, -s * 0.5, 0, 0); g.fill();
        g.restore();
      }
      g.beginPath(); g.arc(0, -s * 0.15, s * 0.16, 0, Math.PI * 2); g.fill();
      g.restore();
    };
    buti(64, 64, 22); buti(192, 192, 22);
    leaf(192, 76, 18); leaf(64, 204, 18);
    for (const [x, y] of [[0, 128], [256, 128], [128, 0], [128, 256], [128, 128]]) { g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); }
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    return t;
  }

  function glowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,236,190,1)"); gr.addColorStop(0.35, "rgba(255,180,90,.55)"); gr.addColorStop(1, "rgba(255,120,40,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c);
  }

  function envTexture(renderer) {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 256;
    const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#3a1a10"); gr.addColorStop(0.38, "#ffe2a8"); gr.addColorStop(0.5, "#d8843e"); gr.addColorStop(0.62, "#5a1a12"); gr.addColorStop(1, "#140404");
    g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    g.fillStyle = "rgba(255,248,225,.95)";
    g.fillRect(90, 60, 70, 40); g.fillRect(330, 70, 90, 34);
    g.fillStyle = "rgba(255,200,120,.8)"; g.fillRect(230, 40, 50, 24);
    const tex = new T.CanvasTexture(c);
    tex.mapping = T.EquirectangularReflectionMapping;
    tex.encoding = T.sRGBEncoding;
    const pm = new T.PMREMGenerator(renderer);
    const env = pm.fromEquirectangular(tex).texture;
    tex.dispose(); pm.dispose();
    return env;
  }

  function doorTextures(svg, wPx, hPx, mirror) {
    return new Promise((resolve) => {
      const img = new Image();
      const src = svg.replace("<svg ", `<svg width="${wPx}" height="${hPx}" `);
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = wPx; c.height = hPx;
        const g = c.getContext("2d");
        if (mirror) { g.translate(wPx, 0); g.scale(-1, 1); }
        g.drawImage(img, 0, 0, wPx, hPx);
        g.setTransform(1, 0, 0, 1, 0, 0);
        // sacred red thread across the inner half
        const y = hPx / 2;
        const x0 = mirror ? 0 : wPx * 0.4, x1 = mirror ? wPx * 0.6 : wPx;
        g.save();
        g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = hPx * 0.004; g.shadowOffsetY = hPx * 0.002;
        g.fillStyle = "#b8141b"; g.fillRect(x0, y - hPx * 0.0035, x1 - x0, hPx * 0.007);
        g.restore();
        g.strokeStyle = "rgba(240,170,40,.9)"; g.lineWidth = Math.max(1, hPx * 0.0012);
        for (let x = x0; x < x1; x += hPx * 0.006) { g.beginPath(); g.moveTo(x, y - hPx * 0.0035); g.lineTo(x + hPx * 0.004, y + hPx * 0.0035); g.stroke(); }

        const color = new T.CanvasTexture(c);
        color.encoding = T.sRGBEncoding;
        let mr = null, bump = null;
        try {
          const d = g.getImageData(0, 0, wPx, hPx).data;
          const mc = document.createElement("canvas"); mc.width = wPx; mc.height = hPx;
          const bc = document.createElement("canvas"); bc.width = wPx; bc.height = hPx;
          const mctx = mc.getContext("2d"), bctx = bc.getContext("2d");
          const md = mctx.createImageData(wPx, hPx), bd = bctx.createImageData(wPx, hPx);
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], gg = d[i + 1], b = d[i + 2];
            const gold = Math.max(0, Math.min(1, ((r - b) - 50) / 60)) * Math.max(0, Math.min(1, (gg - 70) / 60));
            md.data[i] = 0; md.data[i + 1] = 255 * (0.82 - 0.55 * gold); md.data[i + 2] = 255 * gold; md.data[i + 3] = 255;
            const lum = 0.3 * r + 0.59 * gg + 0.11 * b;
            bd.data[i] = bd.data[i + 1] = bd.data[i + 2] = Math.min(255, lum * 0.6 + gold * 120); bd.data[i + 3] = 255;
          }
          mctx.putImageData(md, 0, 0); bctx.putImageData(bd, 0, 0);
          mr = new T.CanvasTexture(mc); bump = new T.CanvasTexture(bc);
        } catch { /* canvas not readable; plain material */ }
        resolve({ color, mr, bump });
      };
      img.onerror = () => resolve(null);
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(src)}`;
    });
  }

  /* ───────── Scene ───────── */
  function create({ doorSVG }) {
    const holder = document.createElement("div");
    holder.className = "cinema";
    document.body.appendChild(holder);

    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    holder.appendChild(renderer.domElement);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(FOV, 1, 0.05, 20);
    const env = envTexture(renderer);

    scene.add(new T.AmbientLight(0xffe2c4, 0.35));
    const key = new T.DirectionalLight(0xffe6c0, 1.5);
    key.position.set(1.4, 2.2, 4);
    scene.add(key);
    const inner = new T.PointLight(0xffb45a, 0, 3.5, 2);
    inner.position.set(0, 0.1, 0.55);
    scene.add(inner);

    // Curtains
    const motif = motifTexture();
    const curtainUniforms = (side) => ({
      uOpen: { value: 0 }, uTime: { value: 0 }, uSide: { value: side }, uW: { value: 1 }, uOuter: { value: side },
      uH: { value: 2.1 }, uTie: { value: 0.34 }, uSway: { value: 1 }, uPoke: { value: new T.Vector4(0, 0, -99, 0) },
      uMotif: { value: motif }, uCam: { value: new T.Vector3() }, uGlow: { value: 0 }, uDim: { value: 1 },
    });
    const cGeo = new T.PlaneGeometry(1, 1, 150, 90);
    const curtains = [-1, 1].map((side) => {
      const m = new T.Mesh(cGeo, new T.ShaderMaterial({ vertexShader: curtainVS, fragmentShader: curtainFS, uniforms: curtainUniforms(side), side: T.DoubleSide }));
      m.frustumCulled = false;
      scene.add(m);
      return m;
    });

    // Valance with swags + fringe
    const valance = new T.Mesh(
      new T.PlaneGeometry(1, 1, 1, 1),
      new T.ShaderMaterial({ vertexShader: valanceVS, fragmentShader: valanceFS, transparent: true,
        uniforms: { uN: { value: 3 }, uWid: { value: 1 }, uHgt: { value: 1 }, uDim: { value: 1 }, uStretch: { value: 1 } } })
    );
    scene.add(valance);

    // Dark carved surround (only ever seen around the doorway, never over the page)
    const wallMat = new T.MeshStandardMaterial({ color: 0x2a070d, roughness: 0.8 });
    const walls = [0, 1, 2].map(() => { const m = new T.Mesh(new T.PlaneGeometry(1, 1), wallMat); scene.add(m); return m; });

    // Gold rope tie-backs with tassels
    const tasselTex = (() => {
      const c = document.createElement("canvas"); c.width = 128; c.height = 300;
      const g = c.getContext("2d");
      const gold = (y0, y1) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, "#fff1c4"); gr.addColorStop(.45, "#c9a04a"); gr.addColorStop(1, "#7a5a22"); return gr; };
      g.lineCap = "round";
      g.strokeStyle = "#8a6a2b"; g.lineWidth = 14; g.beginPath(); g.moveTo(10, 30); g.quadraticCurveTo(64, 70, 118, 30); g.stroke();
      g.strokeStyle = "#e9cf8a"; g.lineWidth = 8; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(10, 30); g.quadraticCurveTo(64, 70, 118, 30); g.stroke(); g.setLineDash([]);
      const rg = g.createRadialGradient(56, 70, 4, 64, 78, 26); rg.addColorStop(0, "#fff3c8"); rg.addColorStop(.6, "#c9a04a"); rg.addColorStop(1, "#6b4f1a");
      g.fillStyle = rg; g.beginPath(); g.arc(64, 80, 24, 0, Math.PI * 2); g.fill();
      g.fillStyle = gold(100, 130); g.fillRect(46, 100, 36, 22);
      for (let i = 0; i < 26; i++) {
        const x = 40 + i * 1.9;
        g.strokeStyle = i % 2 ? "#e9cf8a" : "#b8913f"; g.lineWidth = 2.2;
        g.beginPath(); g.moveTo(x + 4, 122); g.quadraticCurveTo(x + (i - 13) * 0.6, 200, x + (i - 13) * 1.4, 288); g.stroke();
      }
      g.fillStyle = "#8a1a2c"; g.fillRect(46, 106, 36, 5);
      const tt = new T.CanvasTexture(c); tt.encoding = T.sRGBEncoding; return tt;
    })();
    const tassels = [0, 1].map(() => { const m = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: tasselTex, transparent: true, opacity: 0, depthWrite: false })); scene.add(m); return m; });

    // Light through the door seam + flood glow
    const glowTex = glowTexture();
    const seam = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: glowTex, transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0.9 }));
    seam.position.z = 0.96;
    scene.add(seam);
    const flood = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: glowTex, transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0 }));
    flood.position.z = 0.45;
    scene.add(flood);

    // Dust motes floating in the light
    const N = 180;
    const dGeo = new T.BufferGeometry();
    const dPos = new Float32Array(N * 3), dSeed = new Float32Array(N);
    dGeo.setAttribute("position", new T.BufferAttribute(dPos, 3));
    const dust = new T.Points(dGeo, new T.PointsMaterial({ size: 0.014, map: glowTex, transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0, color: 0xffd9a0 }));
    scene.add(dust);

    // Doors
    const doors = new T.Group();
    scene.add(doors);
    const pivots = [-1, 1].map(() => { const p = new T.Group(); doors.add(p); return p; });
    const edgeMat = new T.MeshStandardMaterial({ color: 0x3d0a12, roughness: 0.55, metalness: 0.1 });
    const backMat = new T.MeshStandardMaterial({ color: 0x4a0d17, roughness: 0.7 });
    let doorMeshes = [];

    let A = 1, w = 1, h = 1;
    const DOOR_Z = 1, THICK = 0.05, GAP = 0.0035;
    const camStartZ = Z0 + DOOR_Z;

    function layout() {
      w = window.innerWidth; h = window.innerHeight;
      A = w / h;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = w + "px";
      renderer.domElement.style.height = h + "px";
      camera.aspect = A;
      camera.updateProjectionMatrix();
      const W = A * 1.03 + 0.04;
      curtains.forEach((m) => {
        const u = m.material.uniforms;
        u.uW.value = W; u.uOuter.value = u.uSide.value * A * 1.03; u.uH.value = 2.9;
      });
      const vh = 0.36, extra = 0.6;
      valance.scale.set(A * 2.08, vh + extra, 1);
      valance.position.set(0, 1.03 - vh + (vh + extra) / 2, 0.11);
      valance.material.uniforms.uStretch.value = (vh + extra) / vh;
      walls[0].scale.set(A * 4, 6, 1); walls[0].position.set(-A * 1.02 - A * 2, 0, -0.03);
      walls[1].scale.set(A * 4, 6, 1); walls[1].position.set(A * 1.02 + A * 2, 0, -0.03);
      walls[2].scale.set(A * 2.2, 2, 1); walls[2].position.set(0, -1.45 - 1, -0.03);
      const tieY = (0.34 - 0.5) * 2.9, gw = W * 0.17;
      tassels.forEach((m, i) => { const side = i ? 1 : -1; m.scale.set(0.1, 0.235, 1); m.position.set(side * (A * 1.03 - gw * 0.9), tieY - 0.06, 0.16); });
      valance.material.uniforms.uN.value = A < 0.8 ? 3 : A < 1.4 ? 4 : 6;
      valance.material.uniforms.uWid.value = A * 2.08;
      valance.material.uniforms.uHgt.value = vh;
      seam.scale.set(0.09, 2.1, 1);
      flood.scale.set(A * 3.4, 3.2, 1);
      for (let i = 0; i < N; i++) {
        dPos[i * 3] = (Math.random() * 2 - 1) * A;
        dPos[i * 3 + 1] = Math.random() * 2 - 1;
        dPos[i * 3 + 2] = 0.15 + Math.random() * 0.8;
        dSeed[i] = Math.random() * 100;
      }
      dGeo.attributes.position.needsUpdate = true;
      // doors sized so they exactly fill the screen from the starting camera
      const dw = A * 1.0;
      pivots.forEach((p, i) => {
        const side = i === 0 ? -1 : 1;
        p.position.set(side * (dw + GAP / 2), 0, DOOR_Z);
        const mesh = doorMeshes[i];
        if (mesh) {
          mesh.scale.set(dw / mesh.userData.w, 2.02 / mesh.userData.h, 1);
          mesh.position.set(-side * dw / 2, 0, -THICK / 2);
        }
      });
    }

    async function buildDoors() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const hPx = Math.min(2048, Math.round(window.innerHeight * dpr));
      const wPx = Math.max(64, Math.round(hPx * (A * 1.0) / 2.02));
      const sets = await Promise.all([doorTextures(doorSVG(), wPx, hPx, false), doorTextures(doorSVG(), wPx, hPx, true)]);
      sets.forEach((set, i) => {
        const front = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 1, envMap: env, envMapIntensity: 1.25 });
        if (set) {
          front.map = set.color;
          if (set.mr) { front.roughnessMap = set.mr; front.metalnessMap = set.mr; } else { front.metalness = 0.2; front.roughness = 0.6; }
          if (set.bump) { front.bumpMap = set.bump; front.bumpScale = 0.012; }
        } else { front.color.set(0x6e1423); front.metalness = 0.1; front.roughness = 0.6; }
        const geo = new T.BoxGeometry(1, 1, THICK);
        const mesh = new T.Mesh(geo, [edgeMat, edgeMat, edgeMat, edgeMat, front, backMat]);
        mesh.userData = { w: 1, h: 1 };
        doorMeshes[i] = mesh;
        pivots[i].add(mesh);
      });
      layout();
    }

    layout();
    const ready = buildDoors();

    // State
    let tiltX = 0, tiltY = 0, sx = 0, sy = 0;
    let running = false, docked = false, raf = 0, last = 0, playing = null;
    const start = performance.now();
    const state = { door: 0, cam: 0, open: 0, glow: 0 };

    function frame(now) {
      raf = 0;
      if (docked && !playing && now - last < 31) { if (running) raf = requestAnimationFrame(frame); return; }
      last = now;
      const t = (now - start) / 1000;
      if (playing) playing(now);
      sx += (tiltX - sx) * 0.06; sy += (tiltY - sy) * 0.06;
      const cz = camStartZ - state.cam * DOOR_Z;
      camera.position.set(sx * 0.05, sy * 0.035, cz);
      camera.lookAt(0, 0, 0);

      pivots[0].rotation.y = state.door * 1.85;
      pivots[1].rotation.y = -state.door * 1.85;
      doors.visible = state.cam < 0.999;
      seam.visible = state.door < 0.6;
      seam.material.opacity = (0.75 + 0.25 * Math.sin(t * 2.2)) * (1 - state.door * 1.6);
      inner.intensity = 1.6 * state.glow;
      flood.material.opacity = 0.32 * state.glow;
      flood.visible = state.glow > 0.01;

      tassels.forEach((m) => { m.material.opacity = clamp01((state.open - 0.55) / 0.3); m.visible = state.open > 0.5; });
      walls.forEach((m) => (m.visible = state.cam < 0.999));
      const dm = dust.material;
      dm.opacity = 0.85 * state.glow;
      if (state.glow > 0.01) {
        for (let i = 0; i < N; i++) {
          dPos[i * 3 + 1] += 0.0006 * Math.sin(t * 0.7 + dSeed[i]);
          dPos[i * 3] += 0.0004 * Math.cos(t * 0.5 + dSeed[i]);
        }
        dGeo.attributes.position.needsUpdate = true;
      }

      curtains.forEach((m) => {
        const u = m.material.uniforms;
        u.uTime.value = t; u.uOpen.value = state.open; u.uGlow.value = state.glow;
        u.uCam.value.copy(camera.position);
      });
      renderer.render(scene, camera);

      if (running) raf = requestAnimationFrame(frame);
    }
    function loop(on) {
      running = on;
      if (on && !raf) raf = requestAnimationFrame(frame);
    }

    let resizeT;
    window.addEventListener("resize", () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => { layout(); if (!running) requestAnimationFrame(frame); }, 120);
    });

    return {
      ready,
      start() { loop(true); },
      setTilt(x, y) { tiltX = Math.max(-1, Math.min(1, x)); tiltY = Math.max(-1, Math.min(1, y)); },
      poke(clientX, clientY, rect) {
        const x = ((clientX - rect.left) / rect.width * 2 - 1) * A;
        const y = -((clientY - rect.top) / rect.height * 2 - 1);
        const t = (performance.now() - start) / 1000;
        curtains.forEach((m) => m.material.uniforms.uPoke.value.set(x, y, t, 0.035));
      },
      open({ onPass, onReveal, onDone, fast = 1 }) {
        const t0 = performance.now();
        const fired = {};
        const once = (k, fn) => { if (!fired[k]) { fired[k] = true; fn && fn(); } };
        playing = (now) => {
          const t = ((now - t0) / 1000) / fast;
          state.door = ease((t - 0.2) / 2.2);
          state.cam = ease((t - 0.45) / 2.6);
          const openT = (t - 2.5) / 2.6;
          state.open = ease(openT);
          state.glow = clamp01(easeOut((t - 0.25) / 1.2)) * (1 - clamp01((t - 2.9) / 1.6));
          if (t > 2.1) once("pass", onPass);
          if (t > 3.3) once("reveal", onReveal);
          if (t > 5.2) {
            playing = null;
            state.door = 1; state.cam = 1; state.open = 1; state.glow = 0;
            once("done", onDone);
          }
        };
        loop(true);
      },
      dock(hero) {
        docked = true;
        holder.classList.add("docked");
        hero.prepend(holder);
        const io = new IntersectionObserver(([e]) => loop(e.isIntersecting && !document.hidden), { threshold: 0 });
        io.observe(holder);
        document.addEventListener("visibilitychange", () => loop(!document.hidden && holder.getBoundingClientRect().bottom > 0));
      },
    };
  }

  window.Cinema = { create };
})();
