/* Shubh Vivah — interactive wedding invitation */
(() => {
  "use strict";

  const W = window.WEDDING;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;
  const svgURI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  /* ═════════════ Generated ornaments ═════════════ */
  function mandalaSVG(color, sw = 1.2) {
    let g = "";
    const petals = (r, len, w, n, off = 0) => {
      for (let i = 0; i < n; i++) {
        const a = (i * 360) / n + off;
        g += `<path transform="rotate(${a.toFixed(2)})" d="M0 ${-r}Q${w} ${-(r + len * 0.55)} 0 ${-(r + len)}Q${-w} ${-(r + len * 0.55)} 0 ${-r}Z"/>`;
      }
    };
    const dots = (r, n, rad) => {
      for (let i = 0; i < n; i++) {
        const a = (i * 2 * Math.PI) / n;
        g += `<circle cx="${(Math.sin(a) * r).toFixed(1)}" cy="${(-Math.cos(a) * r).toFixed(1)}" r="${rad}" fill="${color}"/>`;
      }
    };
    const ring = (r) => (g += `<circle r="${r}"/>`);
    ring(12); petals(12, 26, 10, 8); petals(12, 18, 7, 8, 22.5); ring(42);
    dots(50, 24, 2); petals(58, 34, 11, 16); petals(58, 22, 6, 16, 11.25);
    ring(96); ring(102); petals(102, 30, 13, 24); dots(140, 48, 1.6);
    ring(148); petals(148, 40, 9, 32); petals(148, 25, 4.5, 32, 5.625); ring(192);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><g transform="translate(200 200)" fill="none" stroke="${color}" stroke-width="${sw}">${g}</g></svg>`;
  }

  const jaaliTile = (c, op = 1) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46"><g fill="none" stroke="${c}" stroke-opacity="${op}" stroke-width="1.2"><circle cx="0" cy="0" r="23"/><circle cx="46" cy="0" r="23"/><circle cx="0" cy="46" r="23"/><circle cx="46" cy="46" r="23"/><circle cx="23" cy="23" r="23"/><circle cx="23" cy="23" r="5"/></g></svg>`;

  const dividerSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 34"><g fill="none" stroke="#B8913F" stroke-width="1.2"><path d="M4 17H112"/><path d="M208 17H316"/><path d="M112 17l8-5 8 5-8 5z" fill="#C9A04A"/><path d="M192 17l8-5 8 5-8 5z" fill="#C9A04A"/></g><g transform="translate(160 18)" fill="#C9A04A"><path d="M0-15C6-8 7-2 0 6C-7-2-6-8 0-15z"/><path d="M0 6C-3-3-11-6-17-5C-14 2-7 7 0 6z" opacity=".85"/><path d="M0 6C3-3 11-6 17-5C14 2 7 7 0 6z" opacity=".85"/><path d="M0 6C-8 1-18 2-24 5C-17 9-8 9 0 6z" opacity=".6"/><path d="M0 6C8 1 18 2 24 5C17 9 8 9 0 6z" opacity=".6"/></g></svg>`;

  const knotSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60"><g fill="none" stroke="#C9A04A" stroke-width="2.2"><circle cx="20" cy="22" r="10"/><circle cx="20" cy="38" r="10"/></g><path d="M20 4l3 4-3 3-3-3z" fill="#A4161A"/></svg>`;

  const lotusSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="#8a1a2c"><path d="M24 8c5 6 6 12 0 22-6-10-5-16 0-22z"/><path d="M24 30c-2-8-9-13-17-13 1 8 8 14 17 13z" opacity=".85"/><path d="M24 30c2-8 9-13 17-13-1 8-8 14-17 13z" opacity=".85"/><path d="M24 31c-6-4-15-4-21-1 6 5 15 6 21 1z" opacity=".6"/><path d="M24 31c6-4 15-4 21-1-6 5-15 6-21 1z" opacity=".6"/></g><path d="M10 38h28" stroke="#5b1219" stroke-width="2" stroke-linecap="round"/></svg>`;

  const swipeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 14"><path d="M1 7h18M14 2l5 5-5 5" fill="none" stroke="#6D4B3E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const noiseSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .45 0 0 0 0 .28 0 0 0 0 .12 0 0 0 .07 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;

  // Mughal arch outline as a responsive polygon
  function archClip() {
    const pts = [];
    const N = 28;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const y = 0.36 * (1 - Math.sqrt(1 - (1 - t) ** 2)) * 0.82 + 0.07 * (1 - t ** 4);
      pts.push([t * 50, y * 100]);
    }
    const left = pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`);
    const right = pts.slice(0, -1).reverse().map(([x, y]) => `${(100 - x).toFixed(2)}% ${y.toFixed(2)}%`);
    return `polygon(0% 100%, ${left.join(",")}, ${right.join(",")}, 100% 100%)`;
  }

  root.style.setProperty("--mandala", svgURI(mandalaSVG("#9C7A2E", 1.1)));
  root.style.setProperty("--mandala-dark", svgURI(mandalaSVG("#6b3a12", 1.6)));
  root.style.setProperty("--mandala-gold", svgURI(mandalaSVG("rgba(233,207,138,.35)", 1)));
  root.style.setProperty("--mandala-white", svgURI(mandalaSVG("#ffffff", 1.4)));
  root.style.setProperty("--jaali-gold", svgURI(jaaliTile("#E9CF8A")));
  root.style.setProperty("--divider", svgURI(dividerSVG));
  root.style.setProperty("--knot", svgURI(knotSVG));
  root.style.setProperty("--lotus", svgURI(lotusSVG));
  root.style.setProperty("--swipe", svgURI(swipeSVG));
  root.style.setProperty("--paper", svgURI(noiseSVG));
  root.style.setProperty("--arch-clip", archClip());

  /* ═════════════ Content from config ═════════════ */
  const initials = `${W.groom.first[0]} <i>&amp;</i> ${W.bride.first[0]}`;
  const couple = `${W.groom.first} & ${W.bride.first}`;
  const wedDate = new Date(W.weddingDate);
  const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };

  $("#sealMono").innerHTML = initials;
  setText("gateNames", couple);
  setText("groomName", W.groom.first);
  setText("brideName", W.bride.first);
  setText("groomFull", W.groom.full);
  setText("brideFull", W.bride.full);
  setText("groomParents", W.groom.parents);
  setText("brideParents", W.bride.parents);
  setText("heroBlessing", W.invitation.blessing);
  setText("invBlessing", W.invitation.blessing);
  setText("invHosts", W.invitation.hosts);
  $("#invLines").innerHTML = W.invitation.lines.map((l) => `<p>${esc(l)}</p>`).join("");
  setText("invClosing", W.invitation.closing);
  setText("heroWeekday", W.dateLabel.weekday);
  setText("heroCity", W.city.split(",")[0]);
  const mm = String(wedDate.toLocaleString("en-IN", { month: "numeric", timeZone: "Asia/Kolkata" })).padStart(2, "0");
  setText("heroDate", `${W.dateLabel.day} · ${mm} · ${W.dateLabel.year}`);
  setText("cDay", W.dateLabel.day);
  setText("cMonth", W.dateLabel.month);
  setText("cYear", W.dateLabel.year);
  const longDate = wedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  setText("revealLine", `${longDate} · ${W.city.split(",")[0]}`);
  setText("storyText", W.story);
  setText("venueName", W.venue.name);
  setText("venueArea", W.venue.area);
  setText("venueAddr", W.venue.address);
  $("#mapBtn").href = W.venue.mapsUrl;
  setText("rsvpDeadline", W.rsvp.deadline);
  setText("hashtag", W.hashtag);
  setText("footHosts", W.invitation.hosts.replace(/^The /, "the "));
  document.title = `${couple} · Shubh Vivah`;

  // Personal greeting: ?to=Sharma%20Family  or  #for-Sharma-Family
  const guest = (() => {
    const q = new URLSearchParams(location.search).get("to");
    if (q) return q.trim().slice(0, 60);
    const m = location.hash.match(/^#for-(.+)$/);
    return m ? decodeURIComponent(m[1]).replace(/-/g, " ").trim().slice(0, 60) : "";
  })();
  if (guest) {
    $("#gateDear").innerHTML = `Dear <b>${esc(guest)}</b>you are warmly invited`;
    $("#rName").value = guest;
  }

  /* ═════════════ Toast / clipboard ═════════════ */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function copy(text, okMsg) {
    const done = () => toast(okMsg);
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch { toast("Select and copy the text manually"); }
      ta.remove();
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  /* ═════════════ Door artwork ═════════════ */
  function doorSVG() {
    let studs = "";
    for (let y = 60; y < 880; y += 52) studs += `<circle cx="26" cy="${y}" r="4.2" fill="url(#stud)"/><circle cx="274" cy="${y}" r="4.2" fill="url(#stud)"/>`;
    let lotusRing = "";
    for (let i = 0; i < 12; i++) lotusRing += `<path transform="rotate(${i * 30})" d="M0 -18Q9 -34 0 -54Q-9 -34 0 -18Z"/>`;
    return `<svg viewBox="0 0 300 900" preserveAspectRatio="xMaxYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="vel" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#5c0f1c"/><stop offset=".5" stop-color="#7a1626"/><stop offset="1" stop-color="#3d0812"/></linearGradient>
  <linearGradient id="gld" x1="0" x2="1"><stop offset="0" stop-color="#8a6a2b"/><stop offset=".35" stop-color="#f3d99b"/><stop offset=".6" stop-color="#b8913f"/><stop offset="1" stop-color="#e9cf8a"/></linearGradient>
  <radialGradient id="stud" cx=".35" cy=".35"><stop offset="0" stop-color="#fff3c4"/><stop offset=".5" stop-color="#c9a04a"/><stop offset="1" stop-color="#6b4f1a"/></radialGradient>
  <pattern id="jl" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#2a060d"/><g fill="none" stroke="#c9a04a" stroke-width="1.3"><circle cx="0" cy="0" r="15"/><circle cx="30" cy="0" r="15"/><circle cx="0" cy="30" r="15"/><circle cx="30" cy="30" r="15"/><circle cx="15" cy="15" r="15"/></g><circle cx="15" cy="15" r="2" fill="#e9cf8a"/></pattern>
  <radialGradient id="glowIn" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#ffb347" stop-opacity=".35"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
</defs>
<rect width="300" height="900" fill="url(#vel)"/>
<rect x="10" y="10" width="280" height="880" fill="none" stroke="url(#gld)" stroke-width="4"/>
<rect x="18" y="18" width="264" height="864" fill="none" stroke="#c9a04a" stroke-width="1" opacity=".7"/>
${studs}
<path d="M48 440V210Q48 150 102 128Q140 112 150 64Q160 112 198 128Q252 150 252 210V440Z" fill="url(#jl)" stroke="url(#gld)" stroke-width="4"/>
<path d="M48 440V210Q48 150 102 128Q140 112 150 64Q160 112 198 128Q252 150 252 210V440Z" fill="url(#glowIn)"/>
<path d="M60 428V214Q60 162 108 142Q142 128 150 88Q158 128 192 142Q240 162 240 214V428Z" fill="none" stroke="#e9cf8a" stroke-width="1" opacity=".8"/>
<circle cx="150" cy="58" r="6" fill="url(#stud)"/>
<rect x="48" y="476" width="204" height="372" rx="4" fill="#4a0b16" stroke="url(#gld)" stroke-width="3"/>
<rect x="60" y="488" width="180" height="348" rx="2" fill="none" stroke="#c9a04a" stroke-width="1" opacity=".6"/>
<g transform="translate(150 662)" fill="none" stroke="#e9cf8a" stroke-width="1.6">${lotusRing}<circle r="16" fill="#c9a04a" stroke="none"/><circle r="64"/><circle r="72" stroke-dasharray="2 5"/></g>
<g fill="#c9a04a"><path d="M60 488l18 0-18 18z"/><path d="M240 488l-18 0 18 18z"/><path d="M60 836l18 0-18-18z"/><path d="M240 836l-18 0 18-18z"/></g>
<g transform="translate(282 452)"><rect x="-8" y="-40" width="14" height="80" rx="7" fill="url(#gld)"/><circle cx="-14" cy="0" r="16" fill="none" stroke="url(#gld)" stroke-width="5"/><circle cx="-1" cy="-30" r="3" fill="#5c0f1c"/><circle cx="-1" cy="30" r="3" fill="#5c0f1c"/></g>
</svg>`;
  }
  $$(".door-art").forEach((el) => (el.innerHTML = doorSVG()));

  /* ═════════════ Marigold garland curtain ═════════════ */
  function buildGarlands() {
    const host = $("#garlands");
    const vw = innerWidth, vh = innerHeight;
    const count = Math.max(12, Math.round(vw / 30));
    const per = Math.ceil((vh * 1.15) / 21);
    const frag = document.createDocumentFragment();
    for (let s = 0; s < count; s++) {
      const st = document.createElement("div");
      st.className = "strand " + (s < count / 2 ? "left" : "right");
      st.style.setProperty("--sw", `${3 + Math.random() * 2.5}s`);
      st.style.animationDelay = `${-Math.random() * 4}s`;
      const dist = Math.abs(s - (count - 1) / 2);
      st.style.transitionDelay = `${(((count / 2) - dist) * 45).toFixed(0)}ms`;
      let html = '<i class="leaf"></i>';
      for (let i = 0; i < per; i++) {
        const k = (i + s) % 9;
        const cls = k === 4 ? "rose" : k === 8 ? "jas" : (i + s) % 2 ? "m1" : "m2";
        html += `<span class="bloom ${cls}" style="--r:${(Math.random() * 20).toFixed(0)}deg"></span>`;
      }
      html += '<i class="tassel"></i>';
      st.innerHTML = html;
      frag.appendChild(st);
    }
    host.appendChild(frag);
  }
  buildGarlands();

  /* ═════════════ Toran (door hanging) ═════════════ */
  function buildToran() {
    const el = $("#toran");
    const w = Math.max(320, el.clientWidth || innerWidth);
    const h = el.clientHeight || 92;
    const n = Math.max(3, Math.round(w / 120));
    const span = w / n;
    const sag = h * 0.48;
    let blooms = "", leaves = "";
    for (let i = 0; i < n; i++) {
      const x0 = i * span, x1 = x0 + span;
      const steps = Math.round(span / 10);
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        const x = x0 + t * span;
        const y = 10 + sag * 4 * t * (1 - t);
        const mid = Math.abs(t - 0.5) < 0.04;
        const fill = mid ? "url(#tr)" : j % 2 ? "url(#t1)" : "url(#t2)";
        blooms += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${mid ? 8 : 6.4}" fill="${fill}" stroke="${mid ? "#7a0a18" : "#cf6a00"}" stroke-width="1.6" stroke-dasharray="1.3 1.1"/>`;
      }
      // leaf cluster + bell at each joint
      const jx = x1;
      if (i < n - 1) {
        leaves += `<g transform="translate(${jx.toFixed(1)} 10)">
          <path d="M0 0C-9 14-8 30 0 44C8 30 9 14 0 0z" fill="#4f6b2a"/><path d="M0 2V42" stroke="#86a13c" stroke-width="1"/>
          <path d="M0 0C-18 8-22 22-18 34C-8 26-3 14 0 0z" fill="#5f7d30"/><path d="M0 0C18 8 22 22 18 34C8 26 3 14 0 0z" fill="#5f7d30"/>
          <line x1="0" y1="44" x2="0" y2="${h * 0.62}" stroke="#9c7a2e" stroke-width="1"/>
          <g transform="translate(0 ${h * 0.62})"><path d="M-7 10Q-7 0 0 0Q7 0 7 10L9 13H-9Z" fill="url(#bl)"/><circle cy="15" r="2.2" fill="#9c7a2e"/></g>
        </g>`;
      }
    }
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="t1" cx=".4" cy=".35"><stop offset="0" stop-color="#ffd27a"/><stop offset=".6" stop-color="#f59d0c"/><stop offset="1" stop-color="#d06a00"/></radialGradient>
        <radialGradient id="t2" cx=".4" cy=".35"><stop offset="0" stop-color="#fff0a0"/><stop offset=".6" stop-color="#ffc21a"/><stop offset="1" stop-color="#e09000"/></radialGradient>
        <radialGradient id="tr" cx=".4" cy=".35"><stop offset="0" stop-color="#ff6a7a"/><stop offset=".6" stop-color="#c3122c"/><stop offset="1" stop-color="#7a0a18"/></radialGradient>
        <linearGradient id="bl" x1="0" x2="1"><stop offset="0" stop-color="#8a6a2b"/><stop offset=".45" stop-color="#fff1c4"/><stop offset="1" stop-color="#9c7a2e"/></linearGradient>
        <linearGradient id="rb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a1520"/><stop offset="1" stop-color="#4a0b16"/></linearGradient>
      </defs>
      <rect width="${w}" height="12" fill="url(#rb)"/><rect y="11" width="${w}" height="2" fill="#c9a04a"/>
      ${leaves}${blooms}
    </svg>`;
  }

  /* ═════════════ Palace skyline ═════════════ */
  function palaceSVG(lit = true) {
    const win = (x, y, w, h) => `<path d="M${x} ${y + h}V${y + w * 0.6}Q${x} ${y} ${x + w / 2} ${y}Q${x + w} ${y} ${x + w} ${y + w * 0.6}V${y + h}Z"/>`;
    let wins = "";
    const row = (x0, x1, y, w, h, gap) => { for (let x = x0; x + w <= x1; x += w + gap) wins += win(x, y, w, h); };
    row(452, 750, 128, 16, 26, 14);
    row(170, 410, 146, 12, 18, 16);
    row(790, 1030, 146, 12, 18, 16);
    row(20, 140, 160, 10, 14, 14);
    row(1060, 1190, 160, 10, 14, 14);
    const dome = (cx, base, r, hgt) => `<path d="M${cx - r} ${base}C${cx - r} ${base - hgt * 0.55} ${cx - r * 0.35} ${base - hgt * 0.7} ${cx} ${base - hgt}C${cx + r * 0.35} ${base - hgt * 0.7} ${cx + r} ${base - hgt * 0.55} ${cx + r} ${base}Z"/><line x1="${cx}" y1="${base - hgt}" x2="${cx}" y2="${base - hgt - 14}" stroke="#c9a04a" stroke-width="2"/><circle cx="${cx}" cy="${base - hgt - 16}" r="3" fill="#c9a04a"/>`;
    const chhatri = (cx, base, r) => `<rect x="${cx - r}" y="${base}" width="${r * 2}" height="18"/>${dome(cx, base, r, r * 1.6)}`;
    return `<svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a1a2a"/><stop offset="1" stop-color="#3b0a12"/></linearGradient>
      <linearGradient id="wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a3"/><stop offset="1" stop-color="#ff9d2e"/></linearGradient></defs>
      <g fill="url(#pl)">
        <rect x="0" y="152" width="150" height="70"/><rect x="1050" y="152" width="150" height="70"/>
        <rect x="150" y="134" width="280" height="90"/><rect x="770" y="134" width="280" height="90"/>
        ${chhatri(220, 116, 20)}${chhatri(360, 116, 20)}${chhatri(840, 116, 20)}${chhatri(980, 116, 20)}
        <rect x="430" y="112" width="340" height="110"/>
        <rect x="402" y="56" width="22" height="166"/><rect x="776" y="56" width="22" height="166"/>
        ${dome(413, 58, 15, 30)}${dome(787, 58, 15, 30)}
        <rect x="520" y="100" width="160" height="14"/>
        ${dome(600, 102, 74, 92)}
        ${dome(470, 112, 22, 36)}${dome(730, 112, 22, 36)}
      </g>
      <g fill="${lit ? "url(#wl)" : "#2a060d"}" opacity=".95">${wins}</g>
      <path d="M560 222V170Q560 146 600 136Q640 146 640 170V222Z" fill="${lit ? "url(#wl)" : "#2a060d"}"/>
      <rect x="0" y="206" width="1200" height="16" fill="#2a060d"/>
      <rect x="0" y="205" width="1200" height="1.5" fill="#c9a04a" opacity=".7"/>
    </svg>`;
  }

  function buildSkyline() {
    $("#palace").innerHTML = palaceSVG();
    const d = $("#diyas");
    const n = innerWidth < 600 ? 7 : 13;
    d.innerHTML = Array.from({ length: n }, () => `<span class="diya" style="--fl:${(1 + Math.random() * 0.8).toFixed(2)}s"></span>`).join("");
  }

  buildToran();
  buildSkyline();
  let rT;
  addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(buildToran, 200); });

  /* ═════════════ Photo slots ═════════════ */
  function fillSlot(el, src) {
    const ph = () => {
      el.classList.add("ph");
      if (el.dataset.palace) el.innerHTML = `<div class="ph-palace">${palaceSVG()}</div>`;
      else el.innerHTML = `<div class="ph-mono"><span>${initials}</span><small>${esc(W.groom.first)} · ${esc(W.bride.first)}</small></div>`;
    };
    if (!src) return ph();
    const img = new Image();
    img.onload = () => { el.classList.remove("ph"); el.innerHTML = ""; el.style.backgroundImage = `url("${src}")`; };
    img.onerror = ph;
    img.src = src;
  }
  $$(".photo-slot[data-photo]").forEach((el) => {
    const key = el.dataset.photo;
    fillSlot(el, key === "venue" ? W.venue.photo : W.photos[key]);
  });

  /* ═════════════ Audio: bell, whoosh, music ═════════════ */
  const Sound = {
    ctx: null, master: null, wet: null, droneOn: false, droneTimer: 0, melTimer: 0, track: null, usingTrack: false,
    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = (this.ctx = new AC());
      this.master = ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(ctx.destination);
      const conv = ctx.createConvolver();
      const len = ctx.sampleRate * 3.2, buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      conv.buffer = buf;
      this.wet = ctx.createGain(); this.wet.gain.value = 0.55;
      conv.connect(this.wet); this.wet.connect(this.master);
      this.reverb = conv;
      this.musicBus = ctx.createGain(); this.musicBus.gain.value = 0;
      this.musicBus.connect(this.master); this.musicBus.connect(conv);
    },
    out(g, wet = true) { g.connect(this.master); if (wet) g.connect(this.reverb); },
    bell(base = 680, vol = 0.32) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [[1, 1], [2.0, 0.5], [2.76, 0.42], [5.4, 0.22], [8.93, 0.12], [1.006, 0.7]].forEach(([r, a], i) => {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = "sine"; o.frequency.value = base * r;
        const dec = 4.2 / (1 + i * 0.5);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * a, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
        o.connect(g); this.out(g); o.start(t); o.stop(t + dec + 0.1);
      });
    },
    whoosh(dur = 1.8, vol = 0.18) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime, n = this.ctx.sampleRate * dur;
      const b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const s = this.ctx.createBufferSource(); s.buffer = b;
      const f = this.ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.8;
      f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2200, t + dur * 0.6); f.frequency.exponentialRampToValueAtTime(500, t + dur);
      const g = this.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.4); g.gain.linearRampToValueAtTime(0, t + dur);
      s.connect(f); f.connect(g); this.out(g); s.start(t);
    },
    chimes() { [0, 0.12, 0.24, 0.36, 0.5].forEach((d, i) => setTimeout(() => this.bell(1200 + i * 180, 0.08), d * 1000)); },
    // tanpura-like drone (Sa Pa) + gentle santoor notes in raag Bhupali
    pluck(freq, when, vol = 0.07) {
      const c = this.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
      o.type = "sawtooth"; o.frequency.value = freq;
      f.type = "lowpass"; f.Q.value = 9;
      f.frequency.setValueAtTime(freq * 6, when); f.frequency.exponentialRampToValueAtTime(freq * 2.2, when + 3.5);
      g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(vol, when + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, when + 4.2);
      o.connect(f); f.connect(g); g.connect(this.musicBus); o.start(when); o.stop(when + 4.3);
    },
    note(freq, when, vol = 0.05) {
      const c = this.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
      o.type = "triangle"; o.frequency.value = freq; o2.type = "sine"; o2.frequency.value = freq * 2.01;
      g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(vol, when + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, when + 2.2);
      o.connect(g); o2.connect(g); g.connect(this.musicBus); o.start(when); o2.start(when); o.stop(when + 2.3); o2.stop(when + 2.3);
    },
    startSynth() {
      const Sa = 138.59, cyc = [Sa * 0.75, Sa, Sa, Sa / 2];
      let k = 0;
      const tick = () => {
        const t = this.ctx.currentTime + 0.05;
        this.pluck(cyc[k % 4], t, k % 4 === 3 ? 0.09 : 0.06);
        k++;
      };
      tick(); this.droneTimer = setInterval(tick, 1150);
      const scale = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2];
      let last = 3;
      const mel = () => {
        last = Math.max(0, Math.min(scale.length - 1, last + Math.round((Math.random() - 0.5) * 3)));
        this.note(Sa * 4 * scale[last], this.ctx.currentTime + 0.02, 0.035 + Math.random() * 0.02);
        this.melTimer = setTimeout(mel, 600 + Math.random() * 1400);
      };
      this.melTimer = setTimeout(mel, 2500);
    },
    stopSynth() { clearInterval(this.droneTimer); clearTimeout(this.melTimer); },
    startMusic() {
      if (!this.ctx) return;
      this.droneOn = true;
      const fadeIn = () => { const t = this.ctx.currentTime; this.musicBus.gain.cancelScheduledValues(t); this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, t); this.musicBus.gain.linearRampToValueAtTime(1, t + 3); };
      if (this.usingTrack && this.track) { this.track.play().catch(() => {}); fadeIn(); return; }
      if (W.music && !this.triedTrack) {
        this.triedTrack = true;
        const a = new Audio();
        a.loop = true; a.preload = "auto"; a.src = W.music;
        let decided = false;
        const useSynth = () => { if (decided) return; decided = true; if (this.droneOn) this.startSynth(); };
        a.addEventListener("error", useSynth, { once: true });
        a.addEventListener("canplay", () => {
          if (decided) return; decided = true;
          try { this.ctx.createMediaElementSource(a).connect(this.musicBus); } catch { /* fallback to direct */ }
          this.track = a; this.usingTrack = true;
          if (this.droneOn) a.play().catch(() => {});
        }, { once: true });
        setTimeout(useSynth, 2500);
        fadeIn();
        return;
      }
      this.startSynth();
      fadeIn();
    },
    stopMusic() {
      if (!this.ctx) return;
      this.droneOn = false;
      const t = this.ctx.currentTime;
      this.musicBus.gain.cancelScheduledValues(t); this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, t); this.musicBus.gain.linearRampToValueAtTime(0, t + 0.8);
      setTimeout(() => { if (!this.droneOn) { this.stopSynth(); this.track?.pause(); } }, 900);
    },
  };

  const musicBtn = $("#musicBtn");
  musicBtn.addEventListener("click", () => {
    const on = musicBtn.getAttribute("aria-pressed") === "true";
    musicBtn.setAttribute("aria-pressed", String(!on));
    musicBtn.setAttribute("aria-label", on ? "Play music" : "Pause music");
    if (on) Sound.stopMusic(); else { Sound.init(); Sound.ctx?.resume(); Sound.startMusic(); }
  });
  document.addEventListener("visibilitychange", () => {
    if (!Sound.ctx) return;
    if (document.hidden) Sound.ctx.suspend(); else if (Sound.droneOn) Sound.ctx.resume();
    if (Sound.track) { if (document.hidden) Sound.track.pause(); else if (Sound.droneOn) Sound.track.play().catch(() => {}); }
  });

  /* ═════════════ FX canvas: petals, confetti, sparkles ═════════════ */
  const FX = (() => {
    const cv = $("#fx"), ctx = cv.getContext("2d");
    let w = 0, h = 0, dpr = 1, parts = [], ambient = false, running = false, last = 0, spawnAcc = 0;
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = innerWidth; h = innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); addEventListener("resize", resize);

    // pre-rendered petal sprites
    const sprite = (draw, s = 40) => { const c = document.createElement("canvas"); c.width = c.height = s; draw(c.getContext("2d"), s); return c; };
    const petal = (c1, c2) => sprite((g, s) => {
      const gr = g.createRadialGradient(s * 0.4, s * 0.35, 1, s / 2, s / 2, s / 2);
      gr.addColorStop(0, c1); gr.addColorStop(1, c2);
      g.fillStyle = gr; g.beginPath();
      g.moveTo(s / 2, s * 0.06);
      g.bezierCurveTo(s * 0.95, s * 0.25, s * 0.85, s * 0.8, s / 2, s * 0.95);
      g.bezierCurveTo(s * 0.15, s * 0.8, s * 0.05, s * 0.25, s / 2, s * 0.06);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 1; g.beginPath(); g.moveTo(s / 2, s * 0.15); g.lineTo(s / 2, s * 0.85); g.stroke();
    });
    const sprites = [
      petal("#ff8fa0", "#c3122c"), petal("#ff6b81", "#9c0f25"), petal("#ffd27a", "#e37808"),
      petal("#fff0a0", "#f0a20a"), petal("#ffc0cb", "#d9667a"),
    ];
    const golds = ["#f3d99b", "#e9cf8a", "#c9a04a", "#fff1c4", "#b8913f", "#e8710a", "#c3122c"];

    function add(p) { parts.push(p); if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } }
    function spawnPetal(x, y, vx = 0, vy = 0, big = 1) {
      add({ k: "petal", x, y, vx, vy, s: (10 + Math.random() * 12) * big, img: sprites[(Math.random() * sprites.length) | 0],
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 2.4, ph: Math.random() * 6.28, vph: 1.5 + Math.random() * 2.5,
        sway: 18 + Math.random() * 30, life: 1, g: 22 + Math.random() * 20, drag: 0.6 });
    }
    function burst(x, y, n = 60, power = 1) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = (180 + Math.random() * 420) * power;
        if (i % 3 === 0) spawnPetal(x, y, Math.cos(a) * sp * 0.7, Math.sin(a) * sp * 0.7 - 160, 1);
        else add({ k: "conf", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 220, w: 5 + Math.random() * 5, h: 3 + Math.random() * 4,
          c: golds[(Math.random() * golds.length) | 0], rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 14, ph: Math.random() * 6.28, life: 1, g: 520, drag: 1.6 });
      }
    }
    function sparkle(x, y, n = 1, spread = 10) {
      for (let i = 0; i < n; i++) add({ k: "spark", x: x + (Math.random() - 0.5) * spread, y: y + (Math.random() - 0.5) * spread,
        vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60 - 20, s: 2 + Math.random() * 3.5, life: 1, decay: 1.4 + Math.random(), g: 30, drag: 2 });
    }
    function rain(n = 50) {
      for (let i = 0; i < n; i++) setTimeout(() => spawnPetal(Math.random() * w, -30, (Math.random() - 0.5) * 60, 80 + Math.random() * 120, 1.15), i * 28);
    }
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, w, h);
      if (ambient && !document.hidden) {
        spawnAcc += dt * (w < 600 ? 0.55 : 1.1);
        while (spawnAcc > 1) { spawnAcc--; spawnPetal(Math.random() * w, -30, 0, 30 + Math.random() * 30, 0.9); }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vx -= p.vx * p.drag * dt; p.vy -= p.vy * p.drag * dt; p.vy += p.g * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.k === "petal") {
          p.ph += p.vph * dt; p.rot += p.vr * dt;
          const sx = p.x + Math.sin(p.ph) * p.sway * 0.4;
          ctx.save(); ctx.translate(sx, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.cos(p.ph)) * 0.8 + 0.2);
          ctx.globalAlpha = Math.min(1, p.life) * 0.85;
          ctx.drawImage(p.img, -p.s / 2, -p.s / 2, p.s, p.s);
          ctx.restore();
          if (p.y > h + 40) parts.splice(i, 1);
        } else if (p.k === "conf") {
          p.rot += p.vr * dt; p.ph += dt * 8;
          if (p.vy > 60) { p.vy = 60 + (p.vy - 60) * 0.9; }
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.ph));
          ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
          if (p.y > h + 20) parts.splice(i, 1);
        } else {
          p.life -= p.decay * dt;
          if (p.life <= 0) { parts.splice(i, 1); continue; }
          const s = p.s * p.life;
          ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = p.life;
          ctx.fillStyle = "#ffe9a8"; ctx.shadowColor = "#ffb52e"; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.moveTo(0, -s * 2); ctx.quadraticCurveTo(0, 0, s * 2, 0); ctx.quadraticCurveTo(0, 0, 0, s * 2); ctx.quadraticCurveTo(0, 0, -s * 2, 0); ctx.quadraticCurveTo(0, 0, 0, -s * 2); ctx.fill();
          ctx.restore();
        }
      }
      if (parts.length || ambient) requestAnimationFrame(loop); else { running = false; ctx.clearRect(0, 0, w, h); }
    }
    return {
      burst, sparkle, rain, spawnPetal,
      ambient(on) { ambient = on && !reduceMotion; if (ambient && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); } },
    };
  })();

  if (finePointer && !reduceMotion) {
    let lastSp = 0;
    addEventListener("pointermove", (e) => {
      if (!document.body.classList.contains("revealed")) return;
      const now = performance.now();
      if (now - lastSp > 45) { lastSp = now; FX.sparkle(e.clientX, e.clientY, 1, 4); }
    }, { passive: true });
  }
  addEventListener("pointerdown", (e) => {
    if (!document.body.classList.contains("revealed")) return;
    if (e.target.closest("button, a, input, textarea, label, .coin, .card, .ev")) return;
    FX.sparkle(e.clientX, e.clientY, 7, 18);
  }, { passive: true });

  /* ═════════════ Opening sequence ═════════════ */
  const gate = $("#gate"), garlands = $("#garlands");
  document.body.classList.add("preopen");
  let opened = false;

  function openInvite() {
    if (opened) return;
    opened = true;
    Sound.init(); Sound.ctx?.resume();
    navigator.vibrate?.(30);
    gate.classList.add("opening");
    Sound.bell(660, 0.34);
    setTimeout(() => Sound.bell(990, 0.16), 260);
    const fast = reduceMotion ? 0.3 : 1;

    setTimeout(() => {
      gate.classList.add("open");
      Sound.whoosh(1.9, 0.14);
      FX.burst(innerWidth / 2, innerHeight / 2, reduceMotion ? 0 : 50, 0.8);
    }, 450 * fast);

    setTimeout(() => {
      gate.classList.add("gone");
      garlands.classList.add("part");
      Sound.whoosh(1.6, 0.1);
      Sound.chimes();
      Sound.startMusic();
      musicBtn.setAttribute("aria-pressed", "true");
    }, 2200 * fast);

    setTimeout(() => {
      document.body.classList.remove("preopen", "locked");
      document.body.classList.add("revealed");
      FX.ambient(true);
      FX.rain(reduceMotion ? 0 : 36);
    }, 2900 * fast);

    setTimeout(() => {
      garlands.classList.add("gone");
      gate.remove();
      setTimeout(() => garlands.remove(), 1000);
    }, 4300 * fast);
  }
  $("#seal").addEventListener("click", openInvite);
  scrollTo(0, 0);

  /* ═════════════ Reveal on scroll ═════════════ */
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove("pending"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  function armReveals(scope = document) {
    $$(".reveal", scope).forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight * 0.95) { el.classList.add("pending"); io.observe(el); }
    });
  }

  /* ═════════════ Scratch coins ═════════════ */
  function setupCoins() {
    const coins = $$(".coin");
    let doneCount = 0;
    coins.forEach((coin, idx) => {
      const cv = $("canvas", coin), ctx = cv.getContext("2d", { willReadFrequently: true });
      let size = 0, dpr = 1, drawing = false, lx = 0, ly = 0, moves = 0, done = false;
      const paint = () => {
        dpr = Math.min(2, devicePixelRatio || 1);
        size = coin.clientWidth;
        cv.width = cv.height = Math.round(size * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const c = size / 2;
        ctx.globalCompositeOperation = "source-over";
        const gr = ctx.createLinearGradient(0, 0, size, size);
        gr.addColorStop(0, "#8a6a2b"); gr.addColorStop(0.25, "#e9cf8a"); gr.addColorStop(0.45, "#b8913f");
        gr.addColorStop(0.55, "#fff1c4"); gr.addColorStop(0.75, "#b48a3a"); gr.addColorStop(1, "#7a5a22");
        ctx.fillStyle = gr; ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < size * 3; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,248,220,.55)" : "rgba(90,60,15,.25)";
          ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
        }
        ctx.strokeStyle = "rgba(90,60,15,.45)"; ctx.lineWidth = 1;
        [0.46, 0.4, 0.22].forEach((r) => { ctx.beginPath(); ctx.arc(c, c, size * r, 0, 6.283); ctx.stroke(); });
        ctx.save(); ctx.translate(c, c);
        for (let i = 0; i < 16; i++) {
          ctx.rotate(Math.PI / 8);
          ctx.beginPath(); ctx.moveTo(0, -size * 0.22);
          ctx.quadraticCurveTo(size * 0.05, -size * 0.31, 0, -size * 0.39);
          ctx.quadraticCurveTo(-size * 0.05, -size * 0.31, 0, -size * 0.22); ctx.stroke();
        }
        ctx.restore();
        ctx.fillStyle = "rgba(90,40,10,.75)"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = `${Math.max(9, size * 0.085)}px "Marcellus SC", Georgia, serif`;
        ctx.fillText("SCRATCH", c, c);
      };
      const ro = new ResizeObserver(() => { if (!done && coin.clientWidth !== size) paint(); });
      ro.observe(coin);
      document.fonts?.ready.then(() => { if (!done) paint(); });

      const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const scratch = (x, y) => {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = size * 0.24; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke();
        lx = x; ly = y;
        const r = cv.getBoundingClientRect();
        if (Math.random() < 0.5) FX.sparkle(r.left + x, r.top + y, 1, 8);
        if (++moves % 6 === 0) check();
      };
      const check = () => {
        const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
        let clear = 0, total = 0;
        const R = cv.width / 2;
        for (let y = 0; y < cv.height; y += 6) for (let x = 0; x < cv.width; x += 6) {
          if ((x - R) ** 2 + (y - R) ** 2 > R * R) continue;
          total++; if (d[(y * cv.width + x) * 4 + 3] < 40) clear++;
        }
        if (clear / total > 0.48) finish();
      };
      const finish = () => {
        if (done) return;
        done = true; coin.classList.add("done");
        navigator.vibrate?.(25);
        Sound.bell(1100 + idx * 220, 0.12);
        const r = coin.getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + r.height / 2, 24, 0.5);
        if (++doneCount === coins.length) allDone();
      };
      cv.addEventListener("pointerdown", (e) => {
        if (done) return;
        Sound.init(); Sound.ctx?.resume();
        drawing = true; cv.setPointerCapture(e.pointerId);
        [lx, ly] = pos(e); scratch(lx + 0.1, ly + 0.1);
      });
      cv.addEventListener("pointermove", (e) => { if (drawing) { const [x, y] = pos(e); scratch(x, y); } });
      const end = () => { if (drawing) { drawing = false; check(); } };
      cv.addEventListener("pointerup", end);
      cv.addEventListener("pointercancel", end);
      coin.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); finish(); } });
      coin.tabIndex = 0;
      coin.setAttribute("role", "button");
      coin.setAttribute("aria-label", `Scratch to reveal the ${coin.dataset.k}`);
    });

    function allDone() {
      const box = $("#coins").getBoundingClientRect();
      setTimeout(() => {
        FX.burst(box.left + box.width / 2, box.top + box.height / 2, 110, 1.1);
        FX.rain(40);
        Sound.chimes();
        setTimeout(() => Sound.bell(660, 0.2), 200);
        $("#revealedMsg").classList.add("show");
      }, 350);
    }
  }
  setupCoins();

  /* ═════════════ Calendar links ═════════════ */
  const gcalStamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  function gcal({ title, start, end, location, details }) {
    const p = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${gcalStamp(new Date(start))}/${gcalStamp(new Date(end))}`, location, details });
    return `https://calendar.google.com/calendar/render?${p}`;
  }
  const mainEvent = W.events.find((e) => e.theme === "wedding") || W.events[0];
  $("#calBtn").href = gcal({
    title: `${couple} · Wedding`,
    start: W.weddingDate,
    end: mainEvent?.end || W.weddingDate,
    location: `${W.venue.name}, ${W.venue.address}`,
    details: `${W.invitation.hosts} invite you to celebrate the wedding of ${W.groom.full} & ${W.bride.full}. ${location.href.split("#")[0]}`,
  });

  /* ═════════════ Countdown ═════════════ */
  function setupCountdown() {
    const cells = { d: $('[data-u="d"]'), h: $('[data-u="h"]'), m: $('[data-u="m"]'), s: $('[data-u="s"]') };
    const prev = {};
    const tick = () => {
      let diff = Math.max(0, wedDate - Date.now());
      if (diff === 0) { setText("timerNote", "They're married! Thank you for your blessings."); }
      const v = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
      for (const k in v) {
        const txt = String(v[k]).padStart(2, "0");
        if (prev[k] !== txt) {
          cells[k].textContent = txt;
          if (prev[k] !== undefined && !reduceMotion) { cells[k].classList.remove("flip"); void cells[k].offsetWidth; cells[k].classList.add("flip"); }
          prev[k] = txt;
        }
      }
    };
    tick(); setInterval(tick, 1000);
  }
  setupCountdown();

  /* ═════════════ Photo deck + lightbox ═════════════ */
  function setupDeck() {
    const deck = $("#deck"), list = W.photos.gallery;
    if (!list.length) { deck.closest("section").querySelector(".deck-hint").hidden = true; return; }
    const cards = list.map((p, i) => {
      const f = document.createElement("figure");
      f.className = "card";
      f.innerHTML = `<span class="tape"></span><div class="photo-slot"></div><figcaption>${esc(p.caption || "")}</figcaption>`;
      fillSlot($(".photo-slot", f), p.src);
      f.dataset.i = i;
      f.rot = (Math.random() * 10 - 5).toFixed(1);
      deck.appendChild(f);
      return f;
    });
    let order = cards.map((_, i) => i);
    const layout = () => {
      order.forEach((ci, pos) => {
        const c = cards[ci];
        c.style.zIndex = String(100 - pos);
        c.style.opacity = pos < 4 ? "1" : "0";
        c.style.transform = `translateY(${pos * 9}px) scale(${1 - pos * 0.045}) rotate(${pos === 0 ? c.rot * 0.4 : c.rot}deg)`;
        c.style.pointerEvents = pos === 0 ? "auto" : "none";
      });
    };
    layout();

    let sx = 0, sy = 0, dx = 0, dy = 0, active = null, moved = false;
    deck.addEventListener("pointerdown", (e) => {
      const c = e.target.closest(".card");
      if (!c || c !== cards[order[0]]) return;
      active = c; sx = e.clientX; sy = e.clientY; dx = dy = 0; moved = false;
      c.classList.add("dragging"); c.setPointerCapture(e.pointerId);
    });
    deck.addEventListener("pointermove", (e) => {
      if (!active) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      if (Math.abs(dx) > 6) moved = true;
      active.style.transform = `translate(${dx}px, ${dy * 0.25}px) rotate(${dx * 0.07}deg)`;
    });
    const release = () => {
      if (!active) return;
      const c = active; active = null; c.classList.remove("dragging");
      if (Math.abs(dx) > 80) {
        const dir = Math.sign(dx);
        c.style.transform = `translate(${dir * 140}%, ${dy * 0.3}px) rotate(${dir * 24}deg)`;
        Sound.whoosh(0.5, 0.06);
        setTimeout(() => { order.push(order.shift()); layout(); }, 260);
      } else {
        layout();
        if (!moved) openLB(+c.dataset.i);
      }
    };
    deck.addEventListener("pointerup", release);
    deck.addEventListener("pointercancel", release);

    // lightbox
    const lb = $("#lightbox"), lbImg = $("#lbImg");
    let cur = 0;
    const show = (i) => {
      cur = (i + list.length) % list.length;
      lbImg.removeAttribute("style"); lbImg.className = "lb-img photo-slot";
      fillSlot(lbImg, list[cur].src);
      setText("lbCap", list[cur].caption || "");
    };
    function openLB(i) { show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lbClose").focus(); }
    const close = () => { lb.hidden = true; document.body.style.overflow = ""; };
    $("#lbClose").onclick = close;
    $("#lbPrev").onclick = () => show(cur - 1);
    $("#lbNext").onclick = () => show(cur + 1);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
    let tx = 0;
    lb.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1)); });
  }
  setupDeck();

  /* ═════════════ Events ═════════════ */
  const ICONS = {
    haldi: '<svg viewBox="0 0 48 48"><path d="M8 24h32a16 13 0 0 1-32 0z"/><path d="M14 40h20"/><circle cx="24" cy="12" r="4"/><path d="M24 3v2M33 6l-1.5 1.5M15 6l1.5 1.5M36 13h-2M12 13h2"/></svg>',
    mehendi: '<svg viewBox="0 0 48 48"><path d="M26 6c10 3 15 13 12 23s-14 15-21 11-6-12 0-15 11 1 9 6"/><circle cx="24" cy="30" r="2"/><path d="M20 20c2-2 5-3 8-2M18 26c-2-1-3-3-3-5"/></svg>',
    sangeet: '<svg viewBox="0 0 48 48"><path d="M8 16h22l-3 22H11z"/><ellipse cx="19" cy="16" rx="11" ry="3"/><path d="M12 22l14 10M26 22L12 32"/><path d="M36 8v16"/><ellipse cx="33" cy="25" rx="3.5" ry="2.6"/><path d="M36 8l6 3"/></svg>',
    wedding: '<svg viewBox="0 0 48 48"><path d="M24 6c6 7 9 12 9 17a9 9 0 0 1-18 0c0-5 3-10 9-17z"/><path d="M24 18c3 3 4 6 4 8a4 4 0 0 1-8 0c0-2 1-5 4-8z"/><path d="M8 36h32l-3 6H11z"/><path d="M12 36v-3h24v3"/></svg>',
    reception: '<svg viewBox="0 0 48 48"><path d="M14 6h8l-1 10a3 3 0 0 1-6 0zM18 19v15M13 36h10"/><path d="M26 6h8l-1 10a3 3 0 0 1-6 0zM30 19v15M25 36h10"/><path d="M40 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM8 22l.8 2 2 .8-2 .8L8 28l-.8-2.4-2-.8 2-.8z"/></svg>',
  };
  const PIN = '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';
  const CAL = '<svg viewBox="0 0 24 24"><path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2zm-2 7h14v10H5z"/></svg>';
  const CLOCK = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.4 3.5 2.1-1 1.7L11 13V7h2z"/></svg>';
  const DRESS = '<svg viewBox="0 0 24 24"><path d="M9 2h6l-1 4 4 4-2 2 3 10H5l3-10-2-2 4-4z"/></svg>';

  function setupEvents() {
    const tl = $("#timeline");
    W.events.forEach((ev) => {
      const el = document.createElement("article");
      el.className = `ev ${ev.theme} reveal`;
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `${ev.name}. Tap to see dress code`);
      const link = gcal({ title: `${ev.name} · ${couple}`, start: ev.start, end: ev.end, location: ev.venue, details: `Dress code: ${ev.dress}` });
      el.innerHTML = `
        <span class="knot" aria-hidden="true"></span>
        <div class="ev-inner">
          <div class="ev-face">
            <div class="ev-head">
              <div class="ev-icon">${ICONS[ev.theme] || ICONS.wedding}</div>
              <span class="ev-local">${esc(ev.local || "")}</span>
              <h3 class="ev-name">${esc(ev.name)}</h3>
            </div>
            <div class="ev-body">
              <div class="ev-row">${CAL}<span>${esc(ev.date)}</span></div>
              <div class="ev-row">${CLOCK}<span>${esc(ev.time)}</span></div>
              <div class="ev-row">${PIN}<span>${esc(ev.venue)}</span></div>
              <div class="ev-row">${DRESS}<span>${esc(ev.dress)}</span></div>
              <span class="ev-more">Tap for dress code →</span>
            </div>
          </div>
          <div class="ev-back" aria-hidden="true">
            <h4>Dress code</h4>
            <p class="dress">${esc(ev.dress)}</p>
            <div class="swatches">${(ev.palette || []).map((c) => `<i style="background:${esc(c)}"></i>`).join("")}</div>
            <p>${esc(ev.note || "")}</p>
            <a href="${link}" target="_blank" rel="noopener">+ Add to calendar</a>
          </div>
        </div>`;
      const flip = () => {
        const f = el.classList.toggle("flipped");
        $(".ev-back", el).setAttribute("aria-hidden", String(!f));
        $(".ev-face", el).setAttribute("aria-hidden", String(f));
        Sound.init(); Sound.whoosh(0.4, 0.04);
      };
      el.addEventListener("click", (e) => { if (!e.target.closest("a")) flip(); });
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
      if (finePointer && !reduceMotion) {
        el.addEventListener("pointermove", (e) => {
          if (el.classList.contains("flipped")) return;
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          $(".ev-inner", el).style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        });
        el.addEventListener("pointerleave", () => { $(".ev-inner", el).style.transform = ""; });
      }
      tl.appendChild(el);
    });

    // gold thread drawn as you scroll
    const svg = $(".thread", tl), path = $("#threadPath");
    svg.insertAdjacentHTML("afterbegin", '<defs><linearGradient id="threadGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f29f05"/><stop offset=".5" stop-color="#c9a04a"/><stop offset="1" stop-color="#a4161a"/></linearGradient></defs>');
    let len = 1;
    const size = () => {
      const h = tl.offsetHeight;
      svg.setAttribute("viewBox", `0 0 4 ${h}`);
      path.setAttribute("d", `M2 0V${h}`);
      len = h; path.style.strokeDasharray = `${len}`;
      draw();
    };
    const draw = () => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
      path.style.strokeDashoffset = String(len * (1 - p));
    };
    new ResizeObserver(size).observe(tl);
    addEventListener("scroll", draw, { passive: true });
  }
  setupEvents();

  /* ═════════════ Stay, contacts, venue ═════════════ */
  const INFO_ICONS = [
    '<svg viewBox="0 0 48 48"><path d="M6 40V22a18 14 0 0 1 36 0v18"/><path d="M18 40V28a6 6 0 0 1 12 0v12"/><path d="M24 4v4M4 40h40"/></svg>',
    '<svg viewBox="0 0 48 48"><path d="M44 22c0-2-2-3-4-3H30L20 4h-5l5 15h-9l-4-5H3l3 9-3 9h4l4-5h9l-5 15h5l10-15h10c2 0 4-1 4-3z"/></svg>',
    '<svg viewBox="0 0 48 48"><circle cx="18" cy="18" r="7"/><path d="M18 4v3M18 29v3M4 18h3M29 18h3M8 8l2 2M28 8l-2 2M8 28l2-2"/><path d="M20 40h18a7 7 0 0 0 0-14 10 10 0 0 0-19 3 6 6 0 0 0 1 11z"/></svg>',
  ];
  $("#infoGrid").innerHTML = W.stay.map((s, i) => `<article class="info reveal"><div class="info-ico">${INFO_ICONS[i % INFO_ICONS.length]}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join("");
  $("#contacts").innerHTML = W.contacts.map((c) => `<a class="contact reveal" href="tel:${esc(c.phone.replace(/\s/g, ""))}"><span class="av">${esc(c.name[0])}</span><span><b>${esc(c.name)}</b><small>${esc(c.role)} · ${esc(c.phone)}</small></span></a>`).join("");
  $("#copyAddr").addEventListener("click", () => copy(`${W.venue.name}, ${W.venue.address}`, "Address copied"));
  $("#hashtag").addEventListener("click", () => copy(W.hashtag, "Hashtag copied"));

  /* ═════════════ RSVP ═════════════ */
  function setupRSVP() {
    const form = $("#rsvpForm"), sec = $("#rsvp"), chips = $("#eventChips");
    chips.innerHTML = W.events.map((e, i) => `<label><input type="checkbox" id="ev${i}" value="${esc(e.name)}" checked><span>${esc(e.name)}</span></label>`).join("");
    let guests = 2;
    const setG = (n) => { guests = Math.max(1, Math.min(12, n)); $("#gCount").textContent = guests; };
    $("#gMinus").onclick = () => setG(guests - 1);
    $("#gPlus").onclick = () => setG(guests + 1);
    form.addEventListener("change", () => sec.classList.toggle("declined", $("#rNo").checked));

    const draft = store.get("rsvp-draft", null);
    if (draft && !guest) { $("#rName").value = draft.name || ""; $("#rMsg").value = draft.msg || ""; }
    form.addEventListener("input", () => store.set("rsvp-draft", { name: $("#rName").value, msg: $("#rMsg").value }));

    let message = "";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#rName").value.trim();
      if (!name) { $("#formErr").hidden = false; $("#rName").focus(); return; }
      $("#formErr").hidden = true;
      const yes = $("#rYes").checked;
      const fns = $$("input:checked", chips).map((i) => i.value);
      message = [
        `🙏 RSVP for ${couple}'s wedding`,
        `Name: ${name}`,
        yes ? `Attending: Yes, ${guests} ${guests === 1 ? "guest" : "guests"}` : "Attending: Sorry, can't make it",
        yes && fns.length ? `Functions: ${fns.join(", ")}` : "",
        $("#rMsg").value.trim() ? `Message: ${$("#rMsg").value.trim()}` : "",
      ].filter(Boolean).join("\n");
      $("#waLink").href = `https://wa.me/${W.rsvp.whatsapp}?text=${encodeURIComponent(message)}`;
      form.hidden = true; $("#rsvpDone").hidden = false;
      const r = $("#rsvpDone").getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top + 60, yes ? 80 : 20, 0.9);
      if (yes) Sound.chimes();
    });
    $("#copyRsvp").onclick = () => copy(message, "RSVP copied");
    $("#editRsvp").onclick = () => { form.hidden = false; $("#rsvpDone").hidden = true; };
  }
  setupRSVP();

  /* ═════════════ Blessings ═════════════ */
  let blessings = store.get("blessings", 0);
  setText("blessCount", blessings);
  $("#blessBtn").addEventListener("click", (e) => {
    blessings++; store.set("blessings", blessings);
    setText("blessCount", blessings);
    Sound.init(); Sound.ctx?.resume(); Sound.bell(880 + Math.random() * 300, 0.1);
    FX.rain(26);
    const r = e.currentTarget.getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top, 22, 0.6);
    navigator.vibrate?.(15);
  });

  /* ═════════════ Dock: active section + hide on scroll ═════════════ */
  const dock = $("#dock");
  const navLinks = $$("a", dock);
  const secIO = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle("on", a.dataset.nav === e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["home", "date", "events", "venue", "rsvp"].forEach((id) => secIO.observe(document.getElementById(id)));
  let lastY = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    dock.classList.toggle("hide", y > lastY + 4 && y > 400);
    if (y < lastY - 4) dock.classList.remove("hide");
    lastY = y;
  }, { passive: true });

  armReveals();
})();
