/* Mehendi card — interactive invitation (English / Hindi) */
(() => {
  "use strict";
  const W = window.WEDDING, M = W.mehendi, ART = window.MehendiArt;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svgURI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* unavailable */ } },
  };
  const params = new URLSearchParams(location.search);
  let L = params.get("lang") === "hi" ? "hi" : params.get("lang") === "en" ? "en" : store.get("site-lang", "en");
  if (L !== "hi") L = "en";
  const t = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v[L] ?? v.en : v ?? "");

  const UI = {
    mehendi: { hi: "मेहंदी", en: "Mehendi" },
    tapHand: { hi: "हथेली पर टैप करके मेहंदी लगाएँ", en: "Tap the hand to apply mehendi" },
    applying: { hi: "मेहंदी रच रही है…", en: "Applying mehendi…" },
    sound: { hi: "आवाज़ चालू रखें", en: "Best with sound on" },
    invitedPlain: { hi: "आपको सस्नेह आमंत्रण", en: "You're invited to the" },
    dear: { hi: "प्रिय", en: "Dear" },
    invited: { hi: "आपको सस्नेह आमंत्रण", en: "you're invited to the" },
    joinUs: { hi: "रंग, रौनक और रस्मों के साथ", en: "Join us for the" },
    tapCouple: { hi: "जोड़ी पर टैप करें", en: "Tap the couple to say hello" },
    hostsLine: { hi: "समस्त खण्डेलवाल परिवार", en: "The Khandelwal family" },
    invBody: { hi: "हर्षोल्लास के साथ आपको मेहंदी की रस्म में सादर आमंत्रित करता है", en: "joyfully invites you to the Mehendi celebration of" },
    gameEye: { hi: "मेहंदी की परंपरा", en: "A mehendi tradition" },
    gameH: { hi: "नाम खोजिए!", en: "Find his name!" },
    gameLede: { hi: "दुल्हन की मेहंदी में दूल्हे का नाम छुपा होता है। क्या आप सोनल की मेहंदी में “मोहित” ढूँढ सकते हैं? नाम पर टैप करें।", en: "The groom's name is hidden in the bride's mehendi. Can you find “Mohit” in Sonal's mehendi before he does? Tap on it." },
    gameStart: { hi: "हथेली पर कहीं भी टैप करें", en: "Tap anywhere on the hand" },
    gameMiss: [{ hi: "यहाँ नहीं… फिर देखिए!", en: "Not there… look closer!" }, { hi: "थोड़ा और ध्यान से!", en: "Almost! Keep looking." }, { hi: "उँगलियों की तरफ देखिए", en: "Try the fingers" }],
    gameFound: { hi: "मिल गया! अब मोहित को आपको लड्डू खिलाना होगा।", en: "Found it! Now Mohit owes you a laddoo." },
    hint: { hi: "संकेत दिखाएँ", en: "Show me a hint" },
    whenWhere: { hi: "कब और कहाँ", en: "When & where" },
    detailsH: { hi: "समारोह", en: "The celebration" },
    when: { hi: "दिनांक", en: "When" }, where: { hi: "स्थान", en: "Where" }, dress: { hi: "पहनावा", en: "Dress code" },
    addCal: { hi: "कैलेंडर में जोड़ें", en: "Add to calendar" },
    map: { hi: "गूगल मैप्स पर देखें", en: "Open in Google Maps" },
    cdEye: { hi: "मेहंदी की रात में बाकी", en: "Counting down to mehendi" },
    uD: { hi: "दिन", en: "Days" }, uH: { hi: "घंटे", en: "Hours" }, uM: { hi: "मिनट", en: "Minutes" }, uS: { hi: "सेकंड", en: "Seconds" },
    rsvpEye: { hi: "क्या आप आएँगे?", en: "Will you join us?" },
    rsvpH: { hi: "आपकी उपस्थिति", en: "RSVP" },
    fName: { hi: "आपका नाम", en: "Your name" }, fNamePh: { hi: "जैसे: सुनीता गुप्ता", en: "e.g. Sunita Gupta" },
    fAttend: { hi: "क्या आप आएँगे?", en: "Will you attend?" },
    fYes: { hi: "अवश्य आएँगे", en: "Joyfully yes" }, fNo: { hi: "नहीं आ पाएँगे", en: "Sadly no" },
    fGuests: { hi: "कितने सदस्य?", en: "Number of guests" },
    fMsg: { hi: "वर-वधु के लिए संदेश", en: "A message for the couple" }, fMsgPh: { hi: "आपकी शुभकामनाएँ…", en: "Your wishes…" },
    fErr: { hi: "कृपया अपना नाम लिखें।", en: "Please add your name." },
    fSubmit: { hi: "जवाब तैयार करें", en: "Prepare my RSVP" },
    doneH: { hi: "धन्यवाद!", en: "Thank you!" },
    doneP: { hi: "आपका जवाब तैयार है। नीचे टैप करके व्हाट्सऐप पर भेजें।", en: "Your reply is ready. Tap below to send it on WhatsApp." },
    doneWa: { hi: "व्हाट्सऐप पर भेजें", en: "Send on WhatsApp" },
    doneCopy: { hi: "संदेश कॉपी करें", en: "Copy message instead" }, doneEdit: { hi: "जवाब बदलें", en: "Edit my reply" },
    seeYou: { hi: "मेहंदी पर मिलते हैं!", en: "See you at the mehendi!" },
    petals: { hi: "फूल बरसाएँ", en: "Shower petals" },
    sign: { hi: "आपके आगमन की प्रतीक्षा में · समस्त खण्डेलवाल परिवार", en: "Awaiting your presence · the Khandelwal family" },
    contact: { hi: "संपर्क", en: "Contact" },
    rsvpFor: { hi: "मोहित संग सोनल की मेहंदी हेतु उपस्थिति", en: "RSVP for Mohit & Sonal's Mehendi" },
    nameLbl: { hi: "नाम", en: "Name" },
    yesLine: { hi: "उपस्थिति: अवश्य आएँगे", en: "Attending: Yes" }, noLine: { hi: "उपस्थिति: क्षमा करें, नहीं आ पाएँगे", en: "Attending: Sorry, can't make it" },
    members: { hi: "सदस्य", en: "guests" }, msgLbl: { hi: "संदेश", en: "Message" },
    copied: { hi: "कॉपी हो गया", en: "Copied" }, copyFail: { hi: "कृपया स्वयं कॉपी करें", en: "Select and copy manually" },
    sang: { hi: "संग", en: "&" },
  };
  const u = (k) => t(UI[k]);

  /* ═════════════ Ornaments as CSS variables ═════════════ */
  const paisley = (c, op) => `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><g fill="none" stroke="${c}" stroke-opacity="${op}" stroke-width="1.2" stroke-linecap="round"><path d="M30 44 C14 30 30 10 44 20 C56 30 46 48 36 42 C30 38 34 30 40 32"/><path d="M90 104 C74 90 90 70 104 80 C116 90 106 108 96 102 C90 98 94 90 100 92"/><circle cx="90" cy="30" r="3"/><circle cx="30" cy="94" r="3"/><path d="M84 30 h-6 M96 30 h6 M90 24 v-6 M90 36 v6 M24 94 h-6 M36 94 h6"/></g></svg>`;
  const scallop = (c, down) => `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="22" viewBox="0 0 34 22"><path d="${down ? "M0 0 H34 V4 Q17 26 0 4 Z" : "M0 22 Q17 -4 34 22 Z"}" fill="${c}"/>${down ? `<circle cx="17" cy="15" r="2.2" fill="${c === "#FFF6D9" ? "#F2B705" : "#F2B705"}"/>` : ""}</svg>`;
  const lace = () => {
    let p = "";
    for (let k = 0; k < 9; k++) { const a = (k / 8) * 90; p += `<g transform="rotate(${a} 0 0)"><path d="M0 0 L0 -150" /><path d="M0 -60 q-14 -16 0 -32 q14 16 0 32 M0 -100 q-10 -12 0 -24 q10 12 0 24"/><circle cx="0" cy="-140" r="5"/></g>`; }
    let rings = "";
    for (const r of [40, 70, 118, 160]) rings += `<path d="M${r} 0 A${r} ${r} 0 0 1 0 ${r}" />`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 200 200"><g transform="translate(0 0) rotate(90)" fill="none" stroke="#F2B705" stroke-width="1.6" stroke-linecap="round">${p}</g><g fill="none" stroke="#F2B705" stroke-width="1.2" stroke-dasharray="3 5">${rings}</g></svg>`;
  };
  const cone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 54"><path d="M17 54 L4 14 Q17 4 30 14 Z" fill="#E9B949" stroke="#9c7a2e" stroke-width="1.5"/><path d="M6 20 Q17 14 28 20" stroke="#D6246E" stroke-width="3" fill="none"/><path d="M8 28 Q17 23 26 28" stroke="#3F7A2E" stroke-width="2" fill="none"/><path d="M4 14 Q17 0 30 14 Q17 8 4 14Z" fill="#F29F05"/><circle cx="17" cy="52" r="2.2" fill="#7A2E0E"/></svg>`;
  const hennaRule = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 36"><g fill="none" stroke="#7A2E0E" stroke-width="1.4" stroke-linecap="round"><path d="M10 18 H120 M200 18 H310"/><path d="M120 18 q8 -10 16 0 q-8 10 -16 0 M184 18 q8 -10 16 0 q-8 10 -16 0"/><path d="M160 4 C176 14 170 32 160 32 C150 32 144 14 160 4 Z"/><path d="M160 12 C166 18 164 26 160 26 C156 26 154 18 160 12 Z"/></g><g fill="#7A2E0E">${[30, 50, 70, 90, 230, 250, 270, 290].map((x) => `<circle cx="${x}" cy="${18}" r="2.4"/>`).join("")}</g></svg>`;
  [
    ["--paisley-light", svgURI(paisley("#3F7A2E", 0.12))],
    ["--paisley-dark", svgURI(paisley("#F2B705", 0.12))],
    ["--scallop-top", svgURI(scallop("#FFF6D9", true))],
    ["--scallop-cream", svgURI(scallop("#1C3519", true))],
    ["--scallop-green", svgURI(scallop("#1C3519", false))],
    ["--lace", svgURI(lace())],
    ["--cone", svgURI(cone)],
    ["--henna-rule", svgURI(hennaRule)],
  ].forEach(([k, v]) => root.style.setProperty(k, v));

  /* ═════════════ Helpers ═════════════ */
  let toastT;
  const toast = (m) => { const e = $("#toast"); e.textContent = m; e.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove("show"), 2200); };
  function copy(text) {
    const fb = () => { const a = document.createElement("textarea"); a.value = text; a.style.position = "fixed"; a.style.opacity = "0"; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); toast(u("copied")); } catch { toast(u("copyFail")); } a.remove(); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast(u("copied")), fb); else fb();
  }
  const stamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const gcal = () => {
    const p = new URLSearchParams({ action: "TEMPLATE", text: `${u("mehendi")} · ${t(W.groom.name)} ${u("sang")} ${t(W.bride.name)}`, dates: `${stamp(new Date(M.start))}/${stamp(new Date(M.end))}`, location: `${t(M.venue.name).replace(/[‘’']/g, "")}, ${t(M.venue.address)}`, details: t(M.note) });
    return `https://calendar.google.com/calendar/render?${p}`;
  };
  const guest = (params.get("to") || "").trim().slice(0, 60);

  /* ═════════════ Sound: bell, brush, dholak ═════════════ */
  const Sound = {
    ctx: null, master: null, on: false, timer: 0, next: 0, step: 0,
    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = 0.8; this.master.connect(this.ctx.destination);
      this.drums = this.ctx.createGain(); this.drums.gain.value = 0; this.drums.connect(this.master);
    },
    noise(dur) { const n = this.ctx.sampleRate * dur, b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; const s = this.ctx.createBufferSource(); s.buffer = b; return s; },
    bell(f = 1200, v = 0.12) {
      if (!this.ctx) return; const c = this.ctx, t0 = c.currentTime;
      [[1, 1], [2.76, 0.4], [5.4, 0.18]].forEach(([r, a]) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f * r; g.gain.setValueAtTime(v * a, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6); o.connect(g); g.connect(this.master); o.start(t0); o.stop(t0 + 1.7); });
    },
    brush(dur = 3) {
      if (!this.ctx) return; const c = this.ctx, t0 = c.currentTime, s = this.noise(dur), f = c.createBiquadFilter(), g = c.createGain();
      f.type = "bandpass"; f.frequency.value = 3200; f.Q.value = 0.7;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.05, t0 + 0.2); g.gain.setValueAtTime(0.05, t0 + dur - 0.4); g.gain.linearRampToValueAtTime(0, t0 + dur);
      s.connect(f); f.connect(g); g.connect(this.master); s.start(t0);
    },
    dha(t0, v = 0.5) { const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t0); o.frequency.exponentialRampToValueAtTime(62, t0 + 0.28); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.42); o.connect(g); g.connect(this.drums); o.start(t0); o.stop(t0 + 0.45); },
    ta(t0, v = 0.28) { const c = this.ctx, s = this.noise(0.14), f = c.createBiquadFilter(), g = c.createGain(); f.type = "bandpass"; f.frequency.value = 1900; f.Q.value = 1.4; g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12); s.connect(f); f.connect(g); g.connect(this.drums); s.start(t0);
      const o = c.createOscillator(), g2 = c.createGain(); o.frequency.value = 360; g2.gain.setValueAtTime(v * 0.5, t0); g2.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09); o.connect(g2); g2.connect(this.drums); o.start(t0); o.stop(t0 + 0.1); },
    jingle(t0) { const c = this.ctx, s = this.noise(0.25), f = c.createBiquadFilter(), g = c.createGain(); f.type = "highpass"; f.frequency.value = 6500; g.gain.setValueAtTime(0.08, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22); s.connect(f); f.connect(g); g.connect(this.drums); s.start(t0); },
    // keherwa-style 8-step groove
    start() {
      if (!this.ctx || this.on) return; this.on = true;
      const t0 = this.ctx.currentTime; this.drums.gain.cancelScheduledValues(t0); this.drums.gain.setValueAtTime(this.drums.gain.value, t0); this.drums.gain.linearRampToValueAtTime(0.75, t0 + 1.5);
      const pat = ["D", "", "T", "t", "D", "D", "T", ""], beat = 60 / 96 / 2;
      this.next = this.ctx.currentTime + 0.1;
      const sched = () => {
        while (this.next < this.ctx.currentTime + 0.25) {
          const p = pat[this.step % 8];
          if (p === "D") this.dha(this.next, this.step % 8 === 0 ? 0.55 : 0.4);
          if (p === "T") this.ta(this.next); if (p === "t") this.ta(this.next, 0.14);
          if (this.step % 16 === 0) this.jingle(this.next);
          this.step++; this.next += beat;
        }
      };
      sched(); this.timer = setInterval(sched, 60);
    },
    stop() {
      if (!this.ctx) return; this.on = false; const t0 = this.ctx.currentTime;
      this.drums.gain.cancelScheduledValues(t0); this.drums.gain.setValueAtTime(this.drums.gain.value, t0); this.drums.gain.linearRampToValueAtTime(0, t0 + 0.6);
      setTimeout(() => { if (!this.on) clearInterval(this.timer); }, 700);
    },
  };
  const musicBtn = $("#musicBtn");
  musicBtn.addEventListener("click", () => {
    const on = musicBtn.getAttribute("aria-pressed") === "true";
    musicBtn.setAttribute("aria-pressed", String(!on));
    if (on) Sound.stop(); else { Sound.init(); Sound.ctx?.resume(); Sound.start(); }
  });
  document.addEventListener("visibilitychange", () => { if (!Sound.ctx) return; if (document.hidden) Sound.ctx.suspend(); else if (Sound.on) Sound.ctx.resume(); });

  /* ═════════════ FX canvas ═════════════ */
  const FX = (() => {
    const cv = $("#fx"), ctx = cv.getContext("2d");
    let w = 0, h = 0, parts = [], ambient = false, running = false, last = 0, acc = 0;
    const resize = () => { const d = Math.min(2, devicePixelRatio || 1); w = innerWidth; h = innerHeight; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    resize(); addEventListener("resize", resize);
    const sprite = (c1, c2, leaf) => { const s = 40, c = document.createElement("canvas"); c.width = c.height = s; const g = c.getContext("2d"); const gr = g.createRadialGradient(s * .4, s * .35, 1, s / 2, s / 2, s / 2); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.beginPath();
      if (leaf) { g.moveTo(s / 2, 2); g.quadraticCurveTo(s, s / 2, s / 2, s - 2); g.quadraticCurveTo(0, s / 2, s / 2, 2); } else { g.moveTo(s / 2, s * .06); g.bezierCurveTo(s * .95, s * .25, s * .85, s * .8, s / 2, s * .95); g.bezierCurveTo(s * .15, s * .8, s * .05, s * .25, s / 2, s * .06); }
      g.fill(); return c; };
    const sprites = [sprite("#ffd27a", "#e37808"), sprite("#fff0a0", "#f0a20a"), sprite("#ff8fb5", "#D6246E"), sprite("#b7d67a", "#3F7A2E", true), sprite("#ffd27a", "#F29F05")];
    const cols = ["#F2B705", "#F29F05", "#D6246E", "#3F7A2E", "#fff1c4"];
    const add = (p) => { parts.push(p); if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } };
    const petal = (x, y, vx = 0, vy = 0, big = 1) => add({ k: "p", x, y, vx, vy, s: (10 + Math.random() * 12) * big, img: sprites[(Math.random() * sprites.length) | 0], rot: Math.random() * 6.3, vr: (Math.random() - .5) * 2.4, ph: Math.random() * 6.3, vph: 1.5 + Math.random() * 2.5, g: 24 + Math.random() * 20, drag: .6 });
    function burst(x, y, n = 50, pw = 1) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, sp = (160 + Math.random() * 380) * pw; if (i % 3 === 0) petal(x, y, Math.cos(a) * sp * .7, Math.sin(a) * sp * .7 - 150); else add({ k: "c", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 200, w: 5 + Math.random() * 5, h: 3 + Math.random() * 4, c: cols[(Math.random() * cols.length) | 0], rot: Math.random() * 6.3, vr: (Math.random() - .5) * 14, ph: Math.random() * 6.3, g: 520, drag: 1.6 }); } }
    function hearts(x, y, n = 10) { for (let i = 0; i < n; i++) add({ k: "h", x: x + (Math.random() - .5) * 40, y, vx: (Math.random() - .5) * 60, vy: -80 - Math.random() * 90, s: 8 + Math.random() * 10, life: 1, g: -10, drag: .4, c: Math.random() > .5 ? "#D6246E" : "#F2B705" }); }
    function rain(n = 40) { for (let i = 0; i < n; i++) setTimeout(() => petal(Math.random() * w, -30, (Math.random() - .5) * 60, 80 + Math.random() * 120, 1.1), i * 28); }
    function loop(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now; ctx.clearRect(0, 0, w, h);
      if (ambient && !document.hidden) { acc += dt * (w < 600 ? .5 : 1); while (acc > 1) { acc--; petal(Math.random() * w, -30, 0, 30 + Math.random() * 30, .9); } }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vx -= p.vx * p.drag * dt; p.vy -= p.vy * p.drag * dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.k === "p") { p.ph += p.vph * dt; p.rot += p.vr * dt; ctx.save(); ctx.translate(p.x + Math.sin(p.ph) * 8, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.cos(p.ph)) * .8 + .2); ctx.globalAlpha = .88; ctx.drawImage(p.img, -p.s / 2, -p.s / 2, p.s, p.s); ctx.restore(); if (p.y > h + 40) parts.splice(i, 1); }
        else if (p.k === "c") { p.rot += p.vr * dt; p.ph += dt * 8; if (p.vy > 60) p.vy = 60 + (p.vy - 60) * .9; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.ph)); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); if (p.y > h + 20) parts.splice(i, 1); }
        else { p.life -= dt * .6; if (p.life <= 0) { parts.splice(i, 1); continue; } const s = p.s; ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = Math.min(1, p.life * 1.5); ctx.fillStyle = p.c; ctx.beginPath(); ctx.moveTo(0, s * .3); ctx.bezierCurveTo(-s, -s * .4, -s * .4, -s, 0, -s * .4); ctx.bezierCurveTo(s * .4, -s, s, -s * .4, 0, s * .3); ctx.fill(); ctx.restore(); }
      }
      if (parts.length || ambient) requestAnimationFrame(loop); else { running = false; ctx.clearRect(0, 0, w, h); }
    }
    return { burst, hearts, rain, ambient(on) { ambient = on && !reduceMotion; if (ambient && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); } } };
  })();

  /* ═════════════ Static art ═════════════ */
  const gateHand = ART.hennaHand({ id: "g", mono: "" });
  const umbColors = [["#D6246E", "#F2B705", "#3F7A2E"], ["#3F7A2E", "#F2C14E", "#D6246E"], ["#F29F05", "#D6246E", "#2F6B3A"], ["#2A9D8F", "#F2B705", "#D6246E"], ["#D6246E", "#3F7A2E", "#F2B705"], ["#F2B705", "#3F7A2E", "#D6246E"], ["#7E2462", "#F29F05", "#3F7A2E"]];
  function buildHero() {
    const n = innerWidth < 600 ? 5 : 7;
    $("#umbrellas").innerHTML = umbColors.slice(0, n).map((c, i) => `<button class="umb" type="button" aria-label="Spin umbrella" style="height:${[78, 100, 66, 92, 74, 96, 70][i]}%;--sw:${(2.8 + (i % 3) * .5).toFixed(1)}s;animation-delay:${-i * .6}s">${ART.umbrella(...c)}</button>`).join("");
    $("#garlandL").innerHTML = ART.marigoldString(18);
    $("#garlandR").innerHTML = ART.marigoldString(18);
    $("#couple").innerHTML = ART.coupleSwing();
  }
  buildHero();
  $("#umbrellas").addEventListener("click", (e) => {
    const b = e.target.closest(".umb"); if (!b) return;
    Sound.init(); Sound.ctx?.resume(); Sound.bell(1300 + Math.random() * 500, .08);
    b.classList.remove("spin"); void b.offsetWidth; b.classList.add("spin");
    const r = b.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.bottom - 20, 14, .4);
  });
  $("#scene").addEventListener("click", (e) => {
    const s = e.currentTarget; Sound.init(); Sound.ctx?.resume();
    if (Sound.ctx) { const t0 = Sound.ctx.currentTime; Sound.drums.gain.value = Math.max(Sound.drums.gain.value, .6); Sound.dha(t0 + .01, .5); Sound.ta(t0 + .16); Sound.dha(t0 + .32, .5); }
    s.classList.remove("cheer"); void s.offsetWidth; s.classList.add("cheer");
    const r = s.getBoundingClientRect(); FX.hearts(r.left + r.width / 2, r.top + r.height * .25, 14);
    navigator.vibrate?.(15);
  });

  // Tilt parallax
  (() => {
    if (reduceMotion) return;
    const hero = $("#home"); let tx = 0, cx = 0, raf = 0, gyro = false;
    const tick = () => { raf = 0; cx += (tx - cx) * .08; hero.style.setProperty("--tx", cx.toFixed(3)); if (Math.abs(tx - cx) > .002) raf = requestAnimationFrame(tick); };
    addEventListener("deviceorientation", (e) => { if (e.gamma == null) return; gyro = true; tx = Math.max(-1, Math.min(1, e.gamma / 22)); if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
    addEventListener("pointermove", (e) => { if (gyro || e.pointerType === "touch") return; tx = e.clientX / innerWidth * 2 - 1; if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  })();

  /* ═════════════ Gate: apply mehendi ═════════════ */
  const handBtn = $("#handBtn"), gate = $("#gate"), coneEl = $("#cone");
  // anchor points (SVG coords) the cone visits, in drawing order
  const ANCHORS = [[150, 292], [150, 240], [110, 125], [147, 100], [184, 115], [218, 160], [48, 236], [100, 380], [200, 380], [150, 410]];
  let opened = false;
  function openInvite() {
    if (opened) return; opened = true;
    Sound.init(); Sound.ctx?.resume();
    try { const DO = window.DeviceOrientationEvent; if (DO && typeof DO.requestPermission === "function") DO.requestPermission().catch(() => {}); } catch { /* none */ }
    navigator.vibrate?.(20);
    handBtn.classList.add("applied");
    $("#gateCta").textContent = u("applying");
    const total = gateHand.count * 52 + 900;
    Sound.brush(total / 1000);
    if (!reduceMotion) {
      coneEl.style.opacity = "1";
      const rect = () => handBtn.getBoundingClientRect();
      ANCHORS.forEach(([x, y], i) => setTimeout(() => {
        const r = rect(); const px = (x - 20) / 230 * r.width, py = (y - 40) / 400 * r.height;
        coneEl.style.left = `${px - 17}px`; coneEl.style.top = `${py - 54}px`;
        coneEl.style.transform = `rotate(${i % 2 ? 12 : -10}deg)`;
      }, (i / ANCHORS.length) * total));
      setTimeout(() => (coneEl.style.opacity = "0"), total);
    }
    setTimeout(() => { Sound.bell(1100, .12); setTimeout(() => Sound.bell(1480, .1), 160); const r = handBtn.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height * .63, 40, .6); }, total + 200);
    const fast = reduceMotion ? .3 : 1;
    setTimeout(() => {
      gate.classList.add("opening");
      handBtn.classList.add("zoom");
      Sound.start(); musicBtn.setAttribute("aria-pressed", "true");
    }, (total + 1500) * fast);
    setTimeout(() => {
      gate.classList.add("gone");
      document.body.classList.remove("locked", "preopen");
      document.body.classList.add("revealed");
      FX.ambient(true); FX.rain(30);
      setTimeout(() => gate.remove(), 1000);
    }, (total + 2300) * fast);
  }
  handBtn.addEventListener("click", openInvite);
  scrollTo(0, 0);

  /* ═════════════ Find-the-name game ═════════════ */
  const HIDE = { x: 184, y: 186, rot: -90, size: 10 };
  let found = false, misses = 0;
  function renderGame() {
    const word = L === "hi" ? "मोहित" : "Mohit";
    $("#gameHand").innerHTML = ART.hennaHand({ id: "gm", hidden: { ...HIDE, text: word } }).svg;
    $("#gameHand").classList.toggle("found", found);
  }
  function gameTap(clientX, clientY) {
    const svg = $("#gameHand svg"); if (!svg || found) return;
    const pt = svg.createSVGPoint(); pt.x = clientX; pt.y = clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const host = $("#gameHand"), hr = host.getBoundingClientRect();
    Sound.init(); Sound.ctx?.resume();
    if (Math.hypot(p.x - HIDE.x, p.y - HIDE.y) < 24) {
      found = true; host.classList.add("found"); $(".hint-ring", host)?.remove();
      $("#gameStatus").textContent = u("gameFound"); $("#hintBtn").hidden = true;
      FX.burst(clientX, clientY, 90, 1); FX.hearts(clientX, clientY, 12);
      Sound.bell(1200, .14); setTimeout(() => Sound.bell(1600, .12), 150); setTimeout(() => Sound.bell(2000, .1), 300);
      navigator.vibrate?.([20, 40, 20]);
    } else {
      const m = document.createElement("span"); m.className = "miss"; m.style.left = `${clientX - hr.left}px`; m.style.top = `${clientY - hr.top}px`; host.appendChild(m); setTimeout(() => m.remove(), 700);
      $("#gameStatus").textContent = t(UI.gameMiss[Math.min(misses, UI.gameMiss.length - 1)]);
      if (++misses >= 3) $("#hintBtn").hidden = false;
      Sound.ta(Sound.ctx ? Sound.ctx.currentTime : 0, .2);
    }
  }
  $("#gameHand").addEventListener("click", (e) => gameTap(e.clientX, e.clientY));
  $("#hintBtn").addEventListener("click", () => {
    const host = $("#gameHand"), svg = $("svg", host); if (!svg || found) return;
    const pt = svg.createSVGPoint(); pt.x = HIDE.x + 6; pt.y = HIDE.y - 10;
    const s = pt.matrixTransform(svg.getScreenCTM()); const hr = host.getBoundingClientRect();
    $(".hint-ring", host)?.remove();
    const ring = document.createElement("span"); ring.className = "hint-ring"; ring.style.left = `${s.x - hr.left}px`; ring.style.top = `${s.y - hr.top}px`; host.appendChild(ring);
  });

  /* ═════════════ Countdown ═════════════ */
  (() => {
    const target = new Date(M.start), prev = {};
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const v = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
      for (const k in v) { const el = $(`[data-u="${k}"]`), txt = String(v[k]).padStart(2, "0"); if (prev[k] !== txt) { el.textContent = txt; if (prev[k] !== undefined && !reduceMotion) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); } prev[k] = txt; } }
    };
    tick(); setInterval(tick, 1000);
  })();

  /* ═════════════ RSVP ═════════════ */
  let guests = 2, rsvpMsg = "";
  (() => {
    const form = $("#rsvpForm"), sec = $("#rsvp");
    const setG = (n) => { guests = Math.max(1, Math.min(15, n)); $("#gCount").textContent = guests; };
    $("#gMinus").onclick = () => setG(guests - 1); $("#gPlus").onclick = () => setG(guests + 1);
    form.addEventListener("change", () => sec.classList.toggle("declined", $("#rNo").checked));
    if (guest) $("#rName").value = guest;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#rName").value.trim();
      if (!name) { $("#formErr").hidden = false; $("#rName").focus(); return; }
      $("#formErr").hidden = true;
      const yes = $("#rYes").checked, msg = $("#rMsg").value.trim();
      rsvpMsg = [`🌿 ${u("rsvpFor")}`, `${u("nameLbl")}: ${name}`, yes ? `${u("yesLine")} · ${guests} ${u("members")}` : u("noLine"), msg ? `${u("msgLbl")}: ${msg}` : ""].filter(Boolean).join("\n");
      $("#waLink").href = `https://wa.me/${W.rsvp.whatsapp}?text=${encodeURIComponent(rsvpMsg)}`;
      form.hidden = true; $("#rsvpDone").hidden = false;
      const r = $("#rsvpDone").getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + 40, yes ? 70 : 16, .8);
    });
    $("#copyRsvp").onclick = () => copy(rsvpMsg);
    $("#editRsvp").onclick = () => { form.hidden = false; $("#rsvpDone").hidden = true; };
  })();

  /* ═════════════ Petals ═════════════ */
  let petals = store.get("mehendi-petals", 0);
  $("#petalCount").textContent = petals;
  $("#petalBtn").addEventListener("click", (e) => {
    petals++; store.set("mehendi-petals", petals); $("#petalCount").textContent = petals;
    Sound.init(); Sound.ctx?.resume(); Sound.bell(900 + Math.random() * 400, .08);
    FX.rain(26); const r = e.currentTarget.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top, 20, .6);
  });
  $("#finaleHands").innerHTML = `<div class="l">${ART.hennaHand({ id: "f1" }).svg}</div><div class="r">${ART.hennaHand({ id: "f2" }).svg}</div>`;

  /* ═════════════ Language ═════════════ */
  const T = {
    ganeshLine: () => t(W.ganeshLine), dateLabel: () => t(M.dateLabel), time: () => t(M.time),
    coupleLine: () => `${t(W.groom.name)} ${u("sang")} ${t(W.bride.name)}`,
    blessing: () => t(W.invitation.blessing), note: () => t(M.note),
    venueName: () => t(M.venue.name), venueAddr: () => t(M.venue.address), dress: () => t(M.dress),
  };
  function applyLang() {
    root.lang = L;
    document.title = `${u("mehendi")} · ${T.coupleLine()}`;
    $$("[data-i18n]").forEach((el) => { const v = UI[el.dataset.i18n]; if (v && !Array.isArray(v)) el.textContent = t(v); });
    $$("[data-t]").forEach((el) => { const f = T[el.dataset.t]; if (f) el.textContent = f(); });
    $$("[data-lang-toggle]").forEach((b) => (b.textContent = L === "hi" ? "English" : "हिंदी"));
    if ($("#gateDear")) $("#gateDear").innerHTML = guest ? `${esc(u("dear"))}<b>${esc(guest)}</b>${esc(u("invited"))}` : esc(u("invitedPlain"));
    if ($("#gateHand") && !opened) $("#gateHand").innerHTML = ART.hennaHand({ id: "g", mono: L === "hi" ? "मो ♥ सो" : "M ♥ S" }).svg;
    if (opened && handBtn.classList.contains("applied")) $("#gateCta").textContent = u("applying");
    $("#rName").placeholder = u("fNamePh"); $("#rMsg").placeholder = u("fMsgPh");
    $("#calLink").href = gcal(); $("#mapLink").href = M.venue.mapsUrl;
    $("#swatches").innerHTML = M.palette.map((c) => `<i style="background:${esc(c)}"></i>`).join("");
    $("#contact").innerHTML = `${esc(u("contact"))}: ${esc(t(W.sender.name))} · ${W.sender.phones.map((p) => `<a href="tel:${esc(p.replace(/\s/g, ""))}">${esc(p)}</a>`).join(" · ")}`;
    $("#gameStatus").textContent = found ? u("gameFound") : u("gameStart");
    renderGame();
  }
  $$("[data-lang-toggle]").forEach((b) => b.addEventListener("click", () => { L = L === "hi" ? "en" : "hi"; store.set("site-lang", L); applyLang(); }));

  /* ═════════════ Reveal on scroll ═════════════ */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove("pending"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => { if (el.getBoundingClientRect().top > innerHeight * .95) { el.classList.add("pending"); io.observe(el); } });

  applyLang();
})();
