/* Mehendi card illustrations: hennaed palm, couple on a swing, umbrellas, garlands.
   Everything is generated as SVG strings so it stays crisp and easy to animate. */
(() => {
  "use strict";
  const HENNA = "#7A2E0E";

  /* ───────── Palm (fingers up, palm facing viewer) ───────── */
  const HAND = "M95 420 C93 380 88 350 80 330 C65 310 45 285 35 255 C28 236 36 214 52 216 C66 218 74 236 84 256 C92 270 98 270 98 255 L96 110 C96 82 124 82 125 110 L128 210 C130 214 131 214 132 205 L131 85 C131 54 162 54 163 85 L165 205 C166 210 168 210 169 205 L169 100 C169 72 198 72 199 100 L201 215 C203 220 205 220 206 214 L205 140 C205 116 230 116 231 142 L232 250 C236 300 222 340 210 370 C206 390 205 405 205 420 Z";
  const FINGERS = [
    { x0: 96, x1: 125, top: 82 }, { x0: 131, x1: 163, top: 54 },
    { x0: 169, x1: 199, top: 72 }, { x0: 205, x1: 231, top: 116 },
  ];

  // returns { svg, count } – every drawable stroke has class "hs" and a --i order index
  function hennaHand({ id = "h", hidden = null, mono = null, skin = "#F1C8A0" } = {}) {
    let i = 0;
    const s = (d, extra = "") => `<path class="hs" style="--i:${i++}" pathLength="1" d="${d}" ${extra}/>`;
    const fill = (d) => `<path class="hf" style="--i:${i++}" d="${d}"/>`;
    const parts = [];
    // centre mandala
    const cx = 150, cy = 292;
    if (!mono) {
      parts.push(s(`M${cx - 9} ${cy} a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0`));
      parts.push(fill(`M${cx - 4} ${cy} a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0`));
    }
    const petalRing = (r, len, w, n, off = 0) => {
      let d = "";
      for (let k = 0; k < n; k++) {
        const a = ((k * 360) / n + off) * Math.PI / 180;
        const px = (rr) => (cx + Math.sin(a) * rr).toFixed(1), py = (rr) => (cy - Math.cos(a) * rr).toFixed(1);
        const nx = Math.cos(a), ny = Math.sin(a);
        const mid = r + len * 0.55;
        d += `M${px(r)} ${py(r)} Q${(cx + Math.sin(a) * mid + nx * w).toFixed(1)} ${(cy - Math.cos(a) * mid + ny * w).toFixed(1)} ${px(r + len)} ${py(r + len)} Q${(cx + Math.sin(a) * mid - nx * w).toFixed(1)} ${(cy - Math.cos(a) * mid - ny * w).toFixed(1)} ${px(r)} ${py(r)} `;
      }
      return s(d);
    };
    if (!mono) parts.push(petalRing(10, 16, 6, 8));
    parts.push(s(`M${cx - 30} ${cy} a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0`));
    parts.push(petalRing(30, 18, 7, 12, 15));
    let dots = "";
    for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; dots += `M${(cx + Math.sin(a) * 54).toFixed(1)} ${(cy - Math.cos(a) * 54).toFixed(1)} h0.01 `; }
    parts.push(s(dots, 'stroke-width="3.2"'));
    parts.push(s(`M${cx - 60} ${cy} a60 60 0 1 0 120 0 a60 60 0 1 0 -120 0`));
    let scallop = "";
    for (let k = 0; k < 20; k++) {
      const a0 = k * Math.PI / 10, a1 = (k + 1) * Math.PI / 10, am = (a0 + a1) / 2;
      scallop += `M${(cx + Math.sin(a0) * 60).toFixed(1)} ${(cy - Math.cos(a0) * 60).toFixed(1)} Q${(cx + Math.sin(am) * 72).toFixed(1)} ${(cy - Math.cos(am) * 72).toFixed(1)} ${(cx + Math.sin(a1) * 60).toFixed(1)} ${(cy - Math.cos(a1) * 60).toFixed(1)} `;
    }
    parts.push(s(scallop));

    // fingers: filled tips + bands
    FINGERS.forEach((f) => {
      const w = f.x1 - f.x0, cxf = (f.x0 + f.x1) / 2;
      parts.push(fill(`M${f.x0 - 2} ${f.top + 26} L${f.x0 - 2} ${f.top - 4} L${f.x1 + 2} ${f.top - 4} L${f.x1 + 2} ${f.top + 26} Q${cxf} ${f.top + 18} ${f.x0 - 2} ${f.top + 26} Z`));
      const b1 = f.top + 46, b2 = f.top + 92;
      parts.push(s(`M${f.x0} ${b1} H${f.x1} M${f.x0} ${b1 + 7} H${f.x1}`));
      let sc = "";
      for (let x = f.x0 + 1; x < f.x1 - 3; x += 6) sc += `M${x} ${b1 + 7} q3 6 6 0 `;
      parts.push(s(sc));
      parts.push(s(`M${cxf - 6} ${b2} q6 -12 12 0 q-6 12 -12 0 M${f.x0} ${b2 + 12} H${f.x1}`));
      let dd = "";
      for (let y = b2 + 22; y < f.top + 140 && y < 200; y += 9) dd += `M${cxf} ${y} h0.01 `;
      parts.push(s(dd, 'stroke-width="3"'));
      void w;
    });

    // thumb tip + bands
    parts.push(fill("M30 236 C30 214 52 208 62 222 L56 236 C48 230 38 232 30 236 Z"));
    parts.push(s("M44 250 L70 236 M48 258 L74 244 M52 266 q8 -8 14 -10"));

    // vines from palm to wrist
    parts.push(s("M110 350 C100 368 118 380 106 400 M190 350 C200 368 182 380 194 400"));
    parts.push(s("M104 372 q-10 -4 -12 6 q8 4 12 -6 M196 372 q10 -4 12 6 q-8 4 -12 -6"));
    // paisleys on palm sides
    parts.push(s("M86 300 C76 278 100 262 106 282 C110 296 96 300 92 292"));
    parts.push(s("M214 300 C224 278 200 262 194 282 C190 296 204 300 208 292"));
    // wrist bracelet bands
    parts.push(s("M98 402 H204 M98 410 H204"));
    let wb = "";
    for (let x = 100; x < 202; x += 8) wb += `M${x} 410 q4 7 8 0 `;
    parts.push(s(wb));
    let wd = "";
    for (let x = 104; x < 200; x += 8) wd += `M${x} 424 h0.01 `;
    parts.push(s(wd, 'stroke-width="3"'));
    // little leaves around mandala
    parts.push(s("M150 214 q-8 -14 0 -26 q8 12 0 26 M150 214 V230 M104 250 q-14 -4 -16 -16 q12 2 16 16 M196 250 q14 -4 16 -16 q-12 2 -16 16"));

    const extra = [];
    if (hidden) extra.push(`<g class="hidden-name" transform="translate(${hidden.x} ${hidden.y}) rotate(${hidden.rot || 0})"><text text-anchor="middle" dominant-baseline="middle" font-size="${hidden.size || 11}" fill="${HENNA}" font-family="Amita, 'Pinyon Script', serif" font-weight="700">${hidden.text}</text></g>`);
    if (mono) extra.push(`<text class="hand-mono" x="150" y="296" text-anchor="middle" dominant-baseline="middle" font-size="17" font-family="Amita, 'Pinyon Script', serif" font-weight="700" fill="${HENNA}">${mono}</text>`);

    return {
      count: i,
      svg: `<svg viewBox="20 40 230 400" xmlns="http://www.w3.org/2000/svg" class="hand-svg">
        <defs>
          <clipPath id="${id}-clip"><path d="${HAND}"/></clipPath>
          <linearGradient id="${id}-skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${skin}"/><stop offset="1" stop-color="#E2A97E"/></linearGradient>
        </defs>
        <path d="${HAND}" fill="url(#${id}-skin)" stroke="#C98B62" stroke-width="1.4"/>
        <g clip-path="url(#${id}-clip)" fill="none" stroke="${HENNA}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="henna">${parts.join("")}${extra.join("")}</g>
      </svg>`,
    };
  }

  /* ───────── Umbrella (hanging mehendi decor) ───────── */
  function umbrella(c1, c2, accent) {
    const r = 46, h = 38;
    let stripes = "";
    for (let k = -3; k <= 3; k++) stripes += `<path d="M0 ${-h} L${k * 14} 0" stroke="${c2}" stroke-width="5" opacity=".9"/>`;
    let scal = "", tas = "", mir = "";
    for (let k = 0; k < 9; k++) {
      const x = -r + k * (2 * r / 9);
      scal += `<path d="M${x.toFixed(1)} 0 q${(r / 9).toFixed(1)} 9 ${(2 * r / 9).toFixed(1)} 0 Z" fill="${accent}"/>`;
      const xm = x + r / 9;
      tas += `<line x1="${xm.toFixed(1)}" y1="6" x2="${xm.toFixed(1)}" y2="18" stroke="${accent}" stroke-width="1.4"/><circle cx="${xm.toFixed(1)}" cy="20" r="2.6" fill="${k % 2 ? "#F2B705" : "#D6246E"}"/>`;
    }
    for (let k = -2; k <= 2; k++) mir += `<circle cx="${k * 16}" cy="${-12 + Math.abs(k) * 3}" r="2.4" fill="#fff" opacity=".85"/>`;
    return `<svg viewBox="-60 -240 120 270" class="umb-svg" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="-240" x2="0" y2="${-h - 6}" stroke="#8a6a2b" stroke-width="1.2"/>
      <circle cx="0" cy="${-h - 5}" r="3.5" fill="#E9B949"/>
      <path d="M${-r} 0 Q${-r} ${-h * 1.15} 0 ${-h} Q${r} ${-h * 1.15} ${r} 0 Z" fill="${c1}"/>
      <clipPath id="u${c1.slice(1)}${c2.slice(1)}"><path d="M${-r} 0 Q${-r} ${-h * 1.15} 0 ${-h} Q${r} ${-h * 1.15} ${r} 0 Z"/></clipPath>
      <g clip-path="url(#u${c1.slice(1)}${c2.slice(1)})">${stripes}</g>
      ${mir}${scal}${tas}
    </svg>`;
  }

  /* ───────── Marigold string (vertical) ───────── */
  function marigoldString(n = 14) {
    let s = "";
    for (let k = 0; k < n; k++) {
      const y = 10 + k * 13;
      const col = k % 5 === 4 ? "#D6246E" : k % 2 ? "#F29F05" : "#FFC21A";
      s += `<circle cx="10" cy="${y}" r="6.2" fill="${col}" stroke="${k % 5 === 4 ? "#8f0a3e" : "#cf6a00"}" stroke-width="1.4" stroke-dasharray="1.2 1"/>`;
      if (k % 4 === 2) s += `<path d="M10 ${y + 4} q8 2 10 9 q-8 0 -10 -9z" fill="#4F7A28"/>`;
    }
    return `<svg viewBox="0 0 24 ${n * 13 + 20}" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="0" x2="10" y2="${n * 13 + 8}" stroke="#8a5a1a" stroke-width="1"/>${s}<path d="M7 ${n * 13 + 8} h6 l-3 10z" fill="#E9B949"/></svg>`;
  }

  /* ───────── Couple on a jhoola (swing) ───────── */
  function coupleSwing({ brideSkin = "#EDBA8F", groomSkin = "#D9A06F" } = {}) {
    let rope = "";
    const ropeBeads = (x) => {
      let b = "";
      for (let y = -190, k = 0; y < 286; y += 13, k++) {
        const col = k % 6 === 5 ? "#D6246E" : k % 2 ? "#F29F05" : "#FFC21A";
        b += `<circle cx="${x}" cy="${y}" r="5.4" fill="${col}" stroke="#c96400" stroke-width="1.1" stroke-dasharray="1.2 1"/>`;
        if (k % 5 === 2) b += `<path d="M${x} ${y + 3} q7 2 9 8 q-7 0 -9 -8z" fill="#4F7A28"/>`;
      }
      return b;
    };
    rope = ropeBeads(84) + ropeBeads(316);
    const bridePalm = (x, y) => `<g transform="translate(${x} ${y})"><ellipse rx="9.5" ry="12" fill="${brideSkin}"/><circle r="3.2" fill="none" stroke="${HENNA}" stroke-width="1.2"/><circle r="1.2" fill="${HENNA}"/><path d="M-6 -6 q6 -4 12 0 M-5 7 q5 3 10 0" stroke="${HENNA}" stroke-width="1" fill="none"/><rect x="-8" y="-17" width="16" height="6" rx="3" fill="${HENNA}"/></g>`;
    return `<svg viewBox="0 -40 400 420" xmlns="http://www.w3.org/2000/svg" class="couple-svg">
  <g class="swing">
    ${rope}
    <rect x="62" y="286" width="276" height="18" rx="7" fill="#8B4A1E" stroke="#5a2e10" stroke-width="1.5"/>
    <rect x="66" y="293" width="268" height="4" fill="#E9B949"/>
    <g fill="#E9B949">${Array.from({ length: 12 }, (_, k) => `<path d="M${76 + k * 22} 304 l4 0 l-2 14z"/>`).join("")}</g>

    <!-- groom (right) -->
    <g class="groom">
      <rect x="236" y="298" width="17" height="52" rx="6" fill="#F5ECD7"/>
      <rect x="264" y="298" width="17" height="52" rx="6" fill="#F5ECD7"/>
      <path d="M232 348 q-2 10 12 10 q14 0 18 -6 q-14 -6 -30 -4z" fill="#C9A04A"/>
      <path d="M262 348 q-2 10 12 10 q14 0 18 -6 q-14 -6 -30 -4z" fill="#C9A04A"/>
      <path d="M220 160 C236 150 280 150 296 160 L306 300 C282 312 234 312 210 300 Z" fill="#F2C14E"/>
      <path d="M220 160 L236 156 L247 246 L214 270 Z" fill="#C2185B"/>
      <path d="M296 160 L280 156 L269 246 L302 270 Z" fill="#C2185B"/>
      <g fill="#FFD76A">${[[226, 190], [232, 222], [222, 250], [290, 190], [284, 222], [294, 250]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join("")}</g>
      <g fill="#C9A04A">${[172, 186, 200, 214].map((y) => `<circle cx="258" cy="${y}" r="2"/>`).join("")}</g>
      <path d="M228 158 C240 200 250 232 252 304 L262 304 C258 232 248 196 238 155 Z" fill="#3E8A2E" opacity=".92"/>
      <path d="M226 172 Q212 212 224 244" stroke="#F2C14E" stroke-width="14" stroke-linecap="round" fill="none"/>
      <circle cx="226" cy="250" r="7.5" fill="${groomSkin}"/>
      <rect x="250" y="134" width="16" height="22" fill="${groomSkin}"/>
      <path d="M244 152 Q258 164 272 152" stroke="#C9A04A" stroke-width="3" fill="none"/>
      <circle cx="224" cy="108" r="6" fill="${groomSkin}"/><circle cx="292" cy="108" r="6" fill="${groomSkin}"/>
      <circle cx="258" cy="104" r="34" fill="${groomSkin}"/>
      <path d="M224 100 C222 66 294 64 292 98 C288 84 278 78 264 80 C252 72 232 78 224 100 Z" fill="#1E140E"/>
      <path d="M252 72 q10 -12 24 -4 q-12 0 -16 8z" fill="#1E140E"/>
      <g class="g-eyes"><circle cx="246" cy="106" r="3.4" fill="#1E140E"/><circle cx="270" cy="106" r="3.4" fill="#1E140E"/><circle cx="247.2" cy="104.8" r="1" fill="#fff"/><circle cx="271.2" cy="104.8" r="1" fill="#fff"/></g>
      <path d="M240 97 q6 -4 12 0 M264 97 q6 -4 12 0" stroke="#1E140E" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M248 118 q10 4 20 0 q-4 4 -10 3 q-6 1 -10 -3z" fill="#1E140E"/>
      <path d="M247 123 Q258 136 269 123 Q258 128 247 123 Z" fill="#8B2A2A"/>
      <circle cx="238" cy="118" r="5" fill="#F28B8B" opacity=".35"/><circle cx="278" cy="118" r="5" fill="#F28B8B" opacity=".35"/>
      <g class="wave">
        <path d="M292 168 Q314 150 318 120" stroke="#F2C14E" stroke-width="14" stroke-linecap="round" fill="none"/>
        <circle cx="319" cy="111" r="8" fill="${groomSkin}"/>
        <path d="M313 104 l-1 -7 M318 102 l0 -8 M323 104 l2 -7" stroke="${groomSkin}" stroke-width="3.4" stroke-linecap="round"/>
      </g>
    </g>

    <!-- bride (left) -->
    <g class="bride">
      <path d="M110 222 C130 216 172 216 190 222 L230 344 C190 360 110 360 70 344 Z" fill="#3E8A2E"/>
      <path d="M70 344 C110 360 190 360 230 344 L226 330 C188 345 112 345 74 330 Z" fill="#F2B705"/>
      <g fill="#FFD76A">${[[110, 262], [150, 258], [190, 262], [96, 296], [136, 300], [176, 300], [212, 296], [120, 324], [180, 324]].map(([x, y]) => `<path d="M${x} ${y - 4} l3 4 l-3 4 l-3 -4z"/>`).join("")}</g>
      <g fill="#fff" opacity=".7">${Array.from({ length: 14 }, (_, k) => `<circle cx="${80 + k * 11}" cy="${338 + Math.sin(k) * 1.5}" r="1.4"/>`).join("")}</g>
      <path d="M120 160 C130 152 170 152 180 160 L190 224 L110 224 Z" fill="#D6246E"/>
      <path d="M110 222 H190" stroke="#F2B705" stroke-width="4"/><path d="M90 300 C120 290 180 290 212 300 M84 316 C120 306 182 306 218 316" stroke="#F2B705" stroke-width="1.6" fill="none" opacity=".8"/>
      <path d="M138 158 Q150 174 162 158 Z" fill="${brideSkin}"/>
      <rect x="142" y="136" width="16" height="22" fill="${brideSkin}"/>
      <path d="M138 156 Q150 168 162 156" stroke="#E9B949" stroke-width="3" fill="none"/>
      <circle cx="150" cy="166" r="3" fill="#D6246E" stroke="#E9B949" stroke-width="1.4"/>
      <path class="dupatta" d="M112 98 C100 140 102 204 120 246 L134 244 C120 204 118 150 126 104 Z" fill="#F29F05" opacity=".88"/>
      <path d="M120 168 C150 190 176 206 198 238 L190 246 C170 216 146 200 118 184 Z" fill="#F29F05" opacity=".85"/>
      <path d="M120 120 C110 136 112 150 120 160 L128 152 C122 140 122 126 124 112 Z" fill="#2A1810"/>
      <path d="M180 120 C190 136 188 150 180 160 L172 152 C178 140 178 126 176 112 Z" fill="#2A1810"/>
      <circle cx="150" cy="110" r="34" fill="${brideSkin}"/>
      <path d="M116 108 C114 76 186 76 184 108 C178 92 160 86 150 92 C140 86 122 92 116 108 Z" fill="#2A1810"/>
      <path d="M106 114 C100 58 200 58 194 114 L186 112 C188 72 112 72 114 112 Z" fill="#F29F05" opacity=".92"/>
      <g fill="#E9B949">${Array.from({ length: 11 }, (_, k) => { const a = Math.PI + (k / 10) * Math.PI; return `<circle cx="${(150 + Math.cos(a) * 42).toFixed(1)}" cy="${(108 + Math.sin(a) * 44).toFixed(1)}" r="1.8"/>`; }).join("")}</g>
      <path d="M150 80 V92" stroke="#E9B949" stroke-width="1.6"/><circle cx="150" cy="95" r="3.8" fill="#E9B949"/><circle cx="150" cy="95" r="1.6" fill="#D6246E"/>
      <circle cx="150" cy="101.5" r="2" fill="#C3122C"/>
      <g class="b-eyes"><path d="M133 112 Q139 106 145 112 M155 112 Q161 106 167 112" stroke="#2A1810" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M133 112 l-3 -2 M167 112 l3 -2" stroke="#2A1810" stroke-width="1.6" stroke-linecap="round"/></g>
      <circle cx="133" cy="122" r="5.5" fill="#F28B8B" opacity=".45"/><circle cx="167" cy="122" r="5.5" fill="#F28B8B" opacity=".45"/>
      <circle cx="144" cy="121" r="4.5" fill="none" stroke="#E9B949" stroke-width="1.4"/>
      <path d="M142 128 Q150 136 158 128" stroke="#9B2335" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M114 118 q-4 6 0 10 q4 -4 0 -10z M186 118 q4 6 0 10 q-4 -4 0 -10z" fill="#E9B949"/>
      <path d="M120 170 Q98 160 100 132" stroke="${brideSkin}" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M180 170 Q202 160 200 132" stroke="${brideSkin}" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M93 140 h14 M93 144 h14 M193 140 h14 M193 144 h14" stroke="#C3122C" stroke-width="2.6"/>
      <path d="M93 148 h14 M193 148 h14" stroke="#3F7A2E" stroke-width="2.6"/>
      ${bridePalm(100, 120)}${bridePalm(200, 120)}
    </g>

    <!-- parrot -->
    <g class="parrot" transform="translate(316 30)">
      <path d="M-6 6 q-8 22 -2 34 l6 -4 q-4 -14 2 -26z" fill="#2E8B3E"/>
      <ellipse cx="0" cy="0" rx="10" ry="15" fill="#3FA34D"/>
      <circle cx="4" cy="-16" r="8" fill="#3FA34D"/>
      <path d="M10 -18 q8 2 4 9 q-3 -4 -6 -4z" fill="#E8512A"/>
      <circle cx="6" cy="-18" r="1.8" fill="#1E140E"/>
      <path d="M-2 -10 q6 4 10 0" stroke="#D6246E" stroke-width="2" fill="none"/>
    </g>
  </g>
  <g class="hearts"></g>
</svg>`;
  }


  /* ───────── Hanging bird cage (pinjra) with a little bird ───────── */
  function birdCage() {
    let bars = "";
    for (let k = -3; k <= 3; k++) bars += `<path d="M${k * 7} -28 Q${k * 9} 0 ${k * 8} 26" stroke="#C9A04A" stroke-width="1.4" fill="none"/>`;
    return `<svg viewBox="-34 -240 68 290" xmlns="http://www.w3.org/2000/svg" class="cage-svg">
      <line x1="0" y1="-240" x2="0" y2="-46" stroke="#8a6a2b" stroke-width="1.2"/>
      <circle cx="0" cy="-44" r="5" fill="none" stroke="#C9A04A" stroke-width="2"/>
      <path d="M-26 -10 Q-26 -40 0 -40 Q26 -40 26 -10" fill="none" stroke="#C9A04A" stroke-width="2"/>
      ${bars}
      <ellipse cx="0" cy="26" rx="28" ry="5" fill="#C9A04A"/>
      <path d="M-22 -2 h44" stroke="#C9A04A" stroke-width="1.4"/>
      <g class="cage-bird"><ellipse cx="0" cy="6" rx="7" ry="9" fill="#F2B705"/><circle cx="3" cy="-4" r="5" fill="#F2B705"/><path d="M7 -5 l5 1 l-5 2z" fill="#E8512A"/><circle cx="4" cy="-5" r="1.2" fill="#1E140E"/><path d="M-6 10 l-6 6" stroke="#D6246E" stroke-width="3" stroke-linecap="round"/></g>
      <path d="M-10 -2 q4 -8 8 0 q4 -8 8 0" fill="#D6246E" opacity=".8"/>
      <circle cx="0" cy="34" r="3" fill="#D6246E"/><line x1="0" y1="31" x2="0" y2="44" stroke="#D6246E" stroke-width="1.5"/>
    </svg>`;
  }

  /* ───────── Twinkling string lights (catenary) ───────── */
  function stringLights(w = 400, n = 3) {
    let path = "", bulbs = "";
    const span = w / n;
    for (let i = 0; i < n; i++) {
      const x0 = i * span, x1 = x0 + span, sag = 34;
      path += `M${x0} 4 Q${x0 + span / 2} ${4 + sag * 2} ${x1} 4 `;
      for (let k = 1; k < 8; k++) {
        const tt = k / 8, x = x0 + tt * span, y = 4 + sag * 4 * tt * (1 - tt);
        const c = ["#FFE08A", "#FFC2D6", "#C8F0A0", "#FFE08A"][k % 4];
        bulbs += `<circle class="bulb" style="--bd:${((i * 8 + k) * 0.37 % 2).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${(y + 5).toFixed(1)}" r="3.2" fill="${c}"/>`;
      }
    }
    return `<svg viewBox="0 0 ${w} 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" class="lights-svg"><path d="${path}" stroke="#5a4a1a" stroke-width="1" fill="none"/>${bulbs}</svg>`;
  }

  /* ───────── Lotus flower ───────── */
  function lotus(c1 = "#F28BB2", c2 = "#D6246E") {
    return `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><path d="M30 6 C36 14 36 24 30 32 C24 24 24 14 30 6Z" fill="${c1}"/><path d="M30 32 C24 22 14 18 6 20 C10 28 20 34 30 32Z" fill="${c2}"/><path d="M30 32 C36 22 46 18 54 20 C50 28 40 34 30 32Z" fill="${c2}"/><path d="M30 32 C26 26 20 22 14 22 C18 28 24 32 30 32Z M30 32 C34 26 40 22 46 22 C42 28 36 32 30 32Z" fill="${c1}"/><ellipse cx="30" cy="35" rx="20" ry="4" fill="#3F7A2E"/></svg>`;
  }

  window.MehendiArt = { hennaHand, umbrella, marigoldString, coupleSwing, birdCage, stringLights, lotus, HENNA };
})();
