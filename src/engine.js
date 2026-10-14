'use strict';
/* ================= ENGINE ================= */
const T = THREE;
const $ = (s) => document.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
const LEVELS = {};

const canvas = $('#c');
const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
const scene = new T.Scene();
const camera = new T.PerspectiveCamera(72, 1, 0.05, 260);
camera.rotation.order = 'YXZ';
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 0.9 ? 82 : 72;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize); resize();
if (matchMedia('(pointer:coarse)').matches) document.body.classList.add('touch');

const G = {
  mode: 'menu', flags: {}, stats: { honest: 0, ritual: 0, anomalies: 0, kind: 0 },
  world: null, levelId: null, t: 0, glasses: false, canGlasses: false, runToken: 0,
};
const P = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, vx: 0, vz: 0, ghost: false, bob: 0, speed: 3.4, frozen: false };
const cam = { active: false, pos: new T.Vector3(), look: new T.Vector3() };
const keys = {};
let storedMode = 'play';

/* ---------- tweens & update list ---------- */
const tweens = [];
function tween(ms, fn, ease) {
  return new Promise((res) => {
    tweens.push({ t: 0, ms: Math.max(1, ms), fn, res, ease: ease || ((t) => t * t * (3 - 2 * t)) });
  });
}
function updTweens(dt) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    tw.t += dt * 1000;
    const k = Math.min(1, tw.t / tw.ms);
    tw.fn(tw.ease(k));
    if (k >= 1) { tweens.splice(i, 1); tw.res(); }
  }
}

/* ---------- sound ---------- */
let AC = null, master = null, ambNodes = [], muted = false;
function audioInit() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(AC.destination);
    if (G.pendingAmb) ambient(G.pendingAmb);
  } catch (e) { AC = null; }
}
function ambient(p) {
  G.pendingAmb = p;
  if (!AC) return;
  ambNodes.forEach((n) => { try { n.g.gain.linearRampToValueAtTime(0, AC.currentTime + 1.2); setTimeout(() => { try { n.o.stop(); } catch (e) {} }, 1400); } catch (e) {} });
  ambNodes = [];
  if (!p) return;
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = p.cut || 900; lp.connect(master);
  const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = p.lfo || 0.12; lg.gain.value = (p.cut || 900) * 0.4; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
  ambNodes.push({ o: lfo, g: lg });
  p.f.forEach((f, i) => {
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = p.type || 'sawtooth'; o.frequency.value = f; o.detune.value = (i - 1) * 7;
    g.gain.value = 0; g.gain.linearRampToValueAtTime((p.vol || 0.05) / (1 + i * 0.4), AC.currentTime + 2);
    o.connect(g); g.connect(lp); o.start(); ambNodes.push({ o, g });
  });
}
function tone(f, d, type, vol, slide) {
  if (!AC) return;
  const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + d);
  g.gain.setValueAtTime(vol || 0.1, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.02);
}
function noise(d, vol, hp) {
  if (!AC) return;
  const n = AC.sampleRate * d, b = AC.createBuffer(1, n, AC.sampleRate), a = b.getChannelData(0);
  for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter();
  s.buffer = b; f.type = 'highpass'; f.frequency.value = hp || 600; g.gain.value = vol || 0.15;
  s.connect(f); f.connect(g); g.connect(master); s.start();
}
function sfx(k) {
  if (!AC) return;
  if (k === 'blip') tone(rnd(520, 700), 0.05, 'square', 0.025);
  else if (k === 'ok') { tone(660, 0.12, 'triangle', 0.1); setTimeout(() => tone(990, 0.2, 'triangle', 0.1), 90); }
  else if (k === 'tick') tone(1400, 0.03, 'square', 0.04);
  else if (k === 'glitch') { noise(0.5, 0.25, 300); tone(180, 0.5, 'sawtooth', 0.1, 0.2); }
  else if (k === 'chime') { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.9, 'sine', 0.08), i * 110)); }
  else if (k === 'gong') { tone(110, 3, 'sine', 0.25); tone(220, 2.5, 'sine', 0.12); tone(330, 2, 'triangle', 0.06); }
  else if (k === 'step') noise(0.05, 0.03, 200);
  else if (k === 'warn') { tone(300, 0.3, 'sawtooth', 0.08, 0.5); }
}
$('#vol').addEventListener('click', () => {
  muted = !muted; if (master) master.gain.value = muted ? 0 : 0.5;
  $('#vol').textContent = muted ? '♪ son : non' : '♪ son : oui';
});

/* ---------- UI helpers ---------- */
let toastT = 0;
function toast(msg, sub) {
  const t = $('#toast');
  t.innerHTML = (sub ? '<small>' + sub + '</small>' : '') + msg;
  t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 4200);
}
function objective(txt) {
  const o = $('#obj');
  if (!txt) { o.style.opacity = 0; return; }
  o.innerHTML = '<i>Objectif</i>' + txt; o.style.opacity = 1;
}
function place(name, time) {
  const p = $('#place'); p.innerHTML = '<b>' + name + '</b>' + (time || '');
  p.style.opacity = 1; setTimeout(() => (p.style.opacity = 0.55), 5000);
}
function gauge(label, val, text) {
  const g = $('#gauge');
  if (val == null) { g.style.opacity = 0; return; }
  g.style.opacity = 1;
  g.innerHTML = label + ' <b>' + (text || '') + '</b><div class="bar"><span style="width:' + Math.round(val * 100) + '%"></span></div>';
}
async function fade(to, ms) {
  const f = $('#fade'); f.style.transitionDuration = (ms || 900) + 'ms'; f.style.opacity = to ? 1 : 0;
  await sleep((ms || 900) + 30);
}
async function chapter(small, title, sub) {
  const t = $('#title');
  t.innerHTML = '<small>' + small + '</small><h2>' + title + '</h2>' + (sub ? '<p>' + sub + '</p>' : '');
  t.classList.add('on'); await sleep(3600); t.classList.remove('on'); await sleep(900);
}
async function cards(list, ms) {
  const c = $('#cards'); c.classList.add('on');
  for (const it of list) {
    c.style.background = it.bg || 'radial-gradient(ellipse at center,#161a3a,#04050c)';
    c.innerHTML = '<p style="color:' + (it.color || '#fff') + '">' + (it.tag ? '<small>' + it.tag + '</small>' : '') + it.t + '</p>';
    sfx('blip');
    await new Promise((res) => { let d = false; const f = () => { if (!d) { d = true; c.removeEventListener('click', f); res(); } }; c.addEventListener('click', f); setTimeout(f, ms || 3600); });
  }
  c.classList.remove('on'); await sleep(650);
}

/* ---------- dialogue ---------- */
const COL = {
  Ren: '#9ad7ff', Miyako: '#ffa9c9', Aira: '#4de2ff', Issana: '#9be8b0', Odori: '#ffd36e', Naia: '#ff7a8a', Kaito: '#c7b5ff',
  Sakura: '#ffb27a', Hayashi: '#e0e0e0', Serina: '#a9c8ff', Aomi: '#a5e08e', 'Chat roux': '#4de2ff', 'Femme de ReCode': '#b8c4d8', Système: '#ffb84d', '': '#9aa0c8',
};
const dlg = $('#dlg'), whoEl = $('#who'), txtEl = $('#txt'), chEl = $('#choices'), hintEl = $('#hint');
let dlgState = null;
let talkDepth = 0;
function setMode(m) { G.mode = m; }
function beginTalk() { if (talkDepth++ === 0) { storedMode = G.mode === 'talk' ? 'play' : G.mode; G.mode = 'talk'; } }
function endTalk() { if (--talkDepth <= 0) { talkDepth = 0; if (G.mode === 'talk') G.mode = storedMode; } }
const PIC = { Ren: 'ren', Miyako: 'miyako', Aira: 'aira', 'Chat roux': 'aira', Issana: 'issana', Naia: 'naia', Odori: 'odori', Serina: 'serina', Aomi: 'aomi', Hayashi: 'hayashi' };
const picEl = $('#pic');
function setPic(who, col) {
  const k = PIC[who];
  if (k && typeof ART !== 'undefined' && ART[k]) { picEl.src = ART[k].face; picEl.style.borderColor = col; picEl.hidden = false; dlg.classList.add('hp'); }
  else { picEl.hidden = true; dlg.classList.remove('hp'); }
}
let dlgLock = Promise.resolve();
function say(who, text, opts) { const p = dlgLock.then(() => sayNow(who, text, opts)); dlgLock = p.catch(() => {}); return p; }
function ask(prompt, options) { const p = dlgLock.then(() => askNow(prompt, options)); dlgLock = p.catch(() => {}); return p; }
function sayNow(who, text, opts) {
  opts = opts || {};
  audioInit();
  beginTalk();
  return new Promise((res) => {
    dlg.hidden = false; chEl.innerHTML = ''; hintEl.style.display = '';
    const col = COL[who] || '#cfd3f5';
    dlg.style.borderLeftColor = col; whoEl.style.color = col; whoEl.textContent = who || '';
    setPic(who, col);
    txtEl.className = who ? '' : 'nar'; txtEl.textContent = '';
    let i = 0, done = false;
    const iv = setInterval(() => {
      i += 1 + (text.length > 160 ? 1 : 0); txtEl.textContent = text.slice(0, i);
      if (i % 3 === 0 && who) sfx('blip');
      if (i >= text.length) { clearInterval(iv); done = true; }
    }, 22);
    const adv = () => {
      if (!done) { clearInterval(iv); txtEl.textContent = text; done = true; return; }
      dlgState = null; dlg.hidden = true; endTalk(); res();
    };
    dlgState = { adv };
    if (opts.auto) setTimeout(() => { if (dlgState && dlgState.adv === adv) { done = true; clearInterval(iv); txtEl.textContent = text; adv(); } }, opts.auto);
  });
}
async function dialog(list) { for (const l of list) { if (typeof l === 'function') await l(); else await say(l[0], l[1], l[2]); } }
function askNow(prompt, options) {
  audioInit();
  beginTalk();
  return new Promise((res) => {
    dlg.hidden = false; hintEl.style.display = 'none'; chEl.innerHTML = '';
    setPic('', '');
    if (prompt) { dlg.style.borderLeftColor = '#ffb84d'; whoEl.style.color = '#ffb84d'; whoEl.textContent = 'Choix'; txtEl.className = 'nar'; txtEl.textContent = prompt; }
    else { whoEl.textContent = ''; txtEl.textContent = ''; }
    const pick = (i) => { sfx('ok'); dlgState = null; dlg.hidden = true; chEl.innerHTML = ''; endTalk(); res(i); };
    options.forEach((o, i) => {
      const b = document.createElement('button');
      b.innerHTML = '<em>' + (i + 1) + '</em>' + o;
      b.addEventListener('click', (e) => { e.stopPropagation(); pick(i); });
      chEl.appendChild(b);
    });
    dlgState = { choose: pick, n: options.length };
  });
}
dlg.addEventListener('click', () => { if (dlgState && dlgState.adv) dlgState.adv(); });

/* ---------- input ---------- */
let locked = false, dragging = false, dragDist = 0, clickCand = false;
function requestLock() { try { const p = canvas.requestPointerLock && canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; });
window.addEventListener('keydown', (e) => {
  if (e.repeat && !['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyQ'].includes(e.code)) return;
  audioInit();
  keys[e.code] = true;
  if (G.mode === 'menu') return;
  if (e.code === 'Escape') { togglePause(); return; }
  if (dlgState) {
    if (dlgState.choose && /^Digit[1-4]$|^Numpad[1-4]$/.test(e.code)) { const n = +e.code.slice(-1) - 1; if (n < dlgState.n) dlgState.choose(n); }
    else if (dlgState.adv && ['Space', 'Enter', 'KeyE'].includes(e.code)) { e.preventDefault(); dlgState.adv(); }
    return;
  }
  if (G.mode === 'play') {
    if (e.code === 'KeyE' || e.code === 'Enter') tryInteract();
    if (e.code === 'KeyG') toggleGlasses();
    if (e.code === 'Space') e.preventDefault();
  }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
canvas.addEventListener('mousedown', (e) => {
  audioInit();
  if (G.mode === 'play' || G.mode === 'talk') { if (!locked) requestLock(); dragging = true; dragDist = 0; clickCand = true; }
});
window.addEventListener('mouseup', () => { dragging = false; if (clickCand && dragDist < 6 && G.mode === 'play') tryInteract(); clickCand = false; });
window.addEventListener('mousemove', (e) => {
  if (G.mode !== 'play' && G.mode !== 'talk') return;
  if (locked || dragging) {
    dragDist += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
    P.yaw -= (e.movementX || 0) * 0.0023; P.pitch = clamp(P.pitch - (e.movementY || 0) * 0.0023, -1.3, 1.3);
  }
});
/* tactile */
const joy = { on: false, x: 0, y: 0, id: null }, look = { id: null, x: 0, y: 0 };
const joyEl = $('#joy');
joyEl.addEventListener('touchstart', (e) => { const t = e.changedTouches[0]; joy.on = true; joy.id = t.identifier; e.preventDefault(); }, { passive: false });
window.addEventListener('touchmove', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier === joy.id) {
      const r = joyEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      joy.x = clamp((t.clientX - cx) / 50, -1, 1); joy.y = clamp((t.clientY - cy) / 50, -1, 1);
      joyEl.firstElementChild.style.transform = 'translate(' + joy.x * 30 + 'px,' + joy.y * 30 + 'px)';
    } else if (t.identifier === look.id && (G.mode === 'play' || G.mode === 'talk')) {
      P.yaw -= (t.clientX - look.x) * 0.006; P.pitch = clamp(P.pitch - (t.clientY - look.y) * 0.006, -1.3, 1.3); look.x = t.clientX; look.y = t.clientY;
    }
  }
}, { passive: true });
window.addEventListener('touchend', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier === joy.id) { joy.on = false; joy.x = joy.y = 0; joy.id = null; joyEl.firstElementChild.style.transform = ''; }
    if (t.identifier === look.id) look.id = null;
  }
});
canvas.addEventListener('touchstart', (e) => { audioInit(); const t = e.changedTouches[0]; look.id = t.identifier; look.x = t.clientX; look.y = t.clientY; }, { passive: true });
$('#btnE').addEventListener('touchstart', (e) => { e.preventDefault(); audioInit(); if (dlgState && dlgState.adv) dlgState.adv(); else if (G.mode === 'play') tryInteract(); }, { passive: false });
$('#btnG').addEventListener('touchstart', (e) => { e.preventDefault(); if (G.mode === 'play') toggleGlasses(); }, { passive: false });

/* ---------- lunettes ---------- */
const LENS_LINES = [
  'CORTISOL +18%', 'SOMMEIL 5H27', 'NOTIFICATIONS 94', 'RELINK : SYNC', 'HUMIDITÉ 41%', 'TEMP. 23°C', 'RISQUE ÉMOTIONNEL 8/10',
];
function setGlassesAvailable(v, on) {
  G.canGlasses = v; $('#btnG').hidden = !v;
  setGlasses(on === undefined ? G.glasses : on);
}
function setGlasses(on) {
  G.glasses = on; $('#lens').classList.toggle('on', on);
  $('#lensdata').innerHTML = on ? '<b>NEO-IRIS X</b>\n' + LENS_LINES.slice(0, 5).join('\n') : '';
}
async function toggleGlasses() {
  if (!G.canGlasses) return;
  canvas.classList.add('wipe'); G.stats.ritual++; sfx('tick');
  await sleep(280); setGlasses(!G.glasses); canvas.classList.remove('wipe');
  toast(G.glasses ? 'Le monde reprend son voile bleu électrique.' : 'Retirer le filtre. Voir net.', 'Ren');
  if (G.onGlasses) G.onGlasses(G.glasses);
}

/* ---------- monde / niveaux ---------- */
function newWorld() {
  const g = new T.Group(); scene.add(g);
  return { g, col: [], inter: [], upd: [], npcs: [], bounds: null, markers: [] };
}
function disposeWorld(w) {
  if (!w) return;
  scene.remove(w.g);
  w.g.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) { const m = Array.isArray(o.material) ? o.material : [o.material]; m.forEach((mm) => { if (mm.map && mm.map.dispose) mm.map.dispose(); mm.dispose(); }); }
  });
}
function interact(o) {
  // o: {x,z,y,r,label,fn,when,mark}
  const w = G.world;
  o.r = o.r || 2; o.y = o.y == null ? 1.3 : o.y; o.id = w.inter.length;
  if (o.mark !== false) {
    const m = new T.Mesh(new T.OctahedronGeometry(0.1, 0), new T.MeshBasicMaterial({ color: o.color || 0xffd37a, transparent: true, opacity: 0.9, fog: false }));
    m.position.set(o.x, o.y + 0.55, o.z); w.g.add(m); o.marker = m;
  }
  w.inter.push(o); return o;
}
function interactable(o) { return !o.done && (!o.when || o.when()); }
let nearest = null;
function findNearest() {
  nearest = null; if (G.mode !== 'play' || !G.world) return;
  let best = 1e9;
  const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw);
  for (const o of G.world.inter) {
    if (!interactable(o)) continue;
    const dx = o.x - P.x, dz = o.z - P.z, d = Math.hypot(dx, dz);
    if (d > o.r) continue;
    const dot = (d < 0.8 || o.any) ? 1 : (dx * fx + dz * fz) / d;
    if (dot < 0.25) continue;
    const score = d - dot * 0.8;
    if (score < best) { best = score; nearest = o; }
  }
}
async function tryInteract() {
  if (!nearest || G.mode !== 'play' || G.busy || tweens.length) return;
  const o = nearest; sfx('ok');
  if (o.once) o.done = true;
  G.busy = true;
  try { await o.fn(o); } catch (e) { console.error(e); } finally { G.busy = false; }
}
function colliders(x, z, rad) {
  const w = G.world; if (!w || P.ghost) return false;
  for (const c of w.col) {
    if (c.r) { if (Math.hypot(x - c.x, z - c.z) < c.r + rad) return true; }
    else if (x > c.x0 - rad && x < c.x1 + rad && z > c.z0 - rad && z < c.z1 + rad) return true;
  }
  const b = w.bounds;
  if (b) {
    if (b.circle) { if (Math.hypot(x - b.cx, z - b.cz) > b.r - rad) return true; }
    else if (x < b.x0 + rad || x > b.x1 - rad || z < b.z0 + rad || z > b.z1 - rad) return true;
  }
  return false;
}
let stepT = 0;
function updatePlayer(dt) {
  let f = (keys.KeyW || keys.KeyZ || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
  let s = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.KeyQ || keys.ArrowLeft ? 1 : 0);
  if (joy.on) { f -= joy.y; s += joy.x; }
  if (keys.ArrowLeft && !keys.KeyA) { /* flèches gauche/droite tournent */ s -= 0; }
  const n = Math.hypot(f, s); if (n > 1) { f /= n; s /= n; }
  const run = keys.ShiftLeft || keys.ShiftRight || (joy.on && Math.hypot(joy.x, joy.y) > 0.9);
  const sp = P.speed * (run ? 1.55 : 1) * (P.ghost ? 1.15 : 1) * (G.world && G.world.speedMul || 1);
  const tx = (-Math.sin(P.yaw) * f + Math.cos(P.yaw) * s) * sp, tz = (-Math.cos(P.yaw) * f - Math.sin(P.yaw) * s) * sp;
  P.vx = lerp(P.vx, tx, Math.min(1, dt * 12)); P.vz = lerp(P.vz, tz, Math.min(1, dt * 12));
  const nx = P.x + P.vx * dt, nz = P.z + P.vz * dt, rad = 0.32;
  if (!colliders(nx, P.z, rad)) P.x = nx; else P.vx = 0;
  if (!colliders(P.x, nz, rad)) P.z = nz; else P.vz = 0;
  const mv = Math.hypot(P.vx, P.vz);
  P.bob += mv * dt * 2.6;
  if (mv > 1) { stepT -= dt * mv; if (stepT < 0) { stepT = 2.6; sfx('step'); } }
  if (G.world && G.world.floorY) P.y = G.world.floorY(P.x, P.z);
}
function updateCamera(dt) {
  if (cam.active) {
    camera.position.copy(cam.pos); camera.lookAt(cam.look);
  } else {
    const mv = Math.hypot(P.vx, P.vz);
    camera.position.set(P.x, P.y + 1.62 + Math.sin(P.bob) * 0.022 * Math.min(1, mv / 2), P.z);
    camera.rotation.set(P.pitch, P.yaw, 0);
  }
}
function camTo(pos, look, ms) {
  if (!cam.active) {
    const fwd = new T.Vector3(); camera.getWorldDirection(fwd);
    cam.pos.copy(camera.position); cam.look.copy(camera.position).addScaledVector(fwd, 6); cam.active = true;
  }
  const p0 = cam.pos.clone(), l0 = cam.look.clone(), p1 = new T.Vector3(...pos), l1 = new T.Vector3(...look);
  if (!ms) { cam.pos.copy(p1); cam.look.copy(l1); return Promise.resolve(); }
  return tween(ms, (k) => { cam.pos.lerpVectors(p0, p1, k); cam.look.lerpVectors(l0, l1, k); });
}
function camRelease() {
  if (!cam.active) return;
  const d = new T.Vector3().subVectors(cam.look, cam.pos);
  cam.active = false;
}
function setMotion(on) { P.frozen = !on; }
function setPlayer(x, z, yaw, y) { P.x = x; P.z = z; P.yaw = yaw || 0; P.y = y || 0; P.pitch = 0; P.vx = P.vz = 0; }

async function cine(fn) {
  const m = G.mode; G.mode = 'cine';
  try { await fn(); } finally { if (G.mode === 'cine') G.mode = m === 'cine' ? 'play' : m; }
}
function shake(amp, ms) {
  const t0 = performance.now();
  const iv = setInterval(() => {
    const k = 1 - (performance.now() - t0) / ms;
    if (k <= 0) { clearInterval(iv); canvas.style.transform = ''; return; }
    canvas.style.transform = 'translate(' + rnd(-amp, amp) * k + 'px,' + rnd(-amp, amp) * k + 'px)';
  }, 30);
}
async function glitch(ms) {
  canvas.classList.add('glitch'); sfx('glitch'); shake(10, ms || 700);
  await sleep(ms || 700); canvas.classList.remove('glitch');
}

/* ---------- boucle ---------- */
const clock = new T.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05); G.t += dt;
  updTweens(dt);
  const w = G.world;
  if (G.mode === 'play' && !P.frozen) updatePlayer(dt);
  else { P.vx = P.vz = 0; }
  if (w) {
    for (const u of w.upd) u(dt, G.t);
    for (const o of w.inter) if (o.marker) {
      const vis = interactable(o) && o.mark !== false;
      o.marker.visible = vis; if (vis) { o.marker.position.y = o.y + 0.55 + Math.sin(G.t * 2.5 + o.id) * 0.06; o.marker.rotation.y += dt * 2; }
    }
  }
  findNearest();
  const pr = $('#prompt');
  if (nearest && G.mode === 'play') { pr.innerHTML = '<kbd>E</kbd>' + nearest.label; pr.style.opacity = 1; } else pr.style.opacity = 0;
  $('#cross').style.opacity = G.mode === 'play' && !document.body.classList.contains('touch') ? 1 : 0;
  updateCamera(dt);
  if (G.mode !== 'menu') renderer.render(scene, camera);
  else renderer.render(scene, camera);
}
requestAnimationFrame(frame);

/* ---------- pause ---------- */
let pausedFrom = null;
function togglePause() {
  const p = $('#pause');
  if (p.hidden) { pausedFrom = G.mode; G.mode = 'pause'; p.hidden = false; try { document.exitPointerLock(); } catch (e) {} }
  else { p.hidden = true; G.mode = pausedFrom || 'play'; }
}

function yawTo(x, z) { return Math.atan2(-(x - P.x), -(z - P.z)); }
function faceTo(x, z, ms) { const y0 = P.yaw; let y1 = yawTo(x, z); while (y1 - y0 > Math.PI) y1 -= TAU; while (y1 - y0 < -Math.PI) y1 += TAU; return tween(ms || 600, (k) => { P.yaw = lerp(y0, y1, k); }); }
function faceDir(dx, dz) { return Math.atan2(dx, dz); }

function illus(key, caption, ms) { const p = dlgLock.then(() => illusNow(key, caption, ms)); dlgLock = p.catch(() => {}); return p; }
function illusNow(key, caption, ms) {
  return new Promise((res) => {
    const el = $('#ill'), img = el.querySelector('img'), p = el.querySelector('p'), bg = el.querySelector('.bgb');
    img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
    img.src = ILL[key]; bg.style.backgroundImage = 'url(' + ILL[key] + ')'; p.textContent = caption || '';
    el.classList.add('on'); sfx('chime');
    beginTalk();
    let done = false;
    const end = () => { if (done) return; done = true; el.removeEventListener('click', end); window.removeEventListener('keydown', kd, true); el.classList.remove('on'); endTalk(); setTimeout(res, 600); };
    const kd = (e) => { if (['Space', 'Enter', 'KeyE'].includes(e.code)) { e.stopPropagation(); e.preventDefault(); end(); } };
    setTimeout(() => { el.addEventListener('click', end); window.addEventListener('keydown', kd, true); }, 700);
    setTimeout(end, ms || 9000);
  });
}
const texCache = {};
function texFrom(k, rx, ry, mirrored) {
  const key = k + rx + ry;
  if (!texCache[key]) { const t = new T.TextureLoader().load(TEX[k]); t.wrapS = t.wrapT = mirrored ? T.MirroredRepeatWrapping : T.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); t.anisotropy = 4; texCache[key] = t; }
  return texCache[key];
}
