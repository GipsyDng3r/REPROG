/* ================= BUILDERS ================= */
const matCache = new Map();
function M(color, o) {
  o = o || {};
  const k = color + '|' + (o.e || '') + '|' + (o.ei || '') + '|' + (o.r == null ? '' : o.r) + '|' + (o.m || '') + '|' + (o.o || '') + '|' + (o.flat ? 1 : 0) + '|' + (o.side || '');
  if (matCache.has(k)) return matCache.get(k);
  const m = new T.MeshStandardMaterial({
    color, roughness: o.r == null ? 0.78 : o.r, metalness: o.m || 0, flatShading: !!o.flat,
    emissive: o.e || 0x000000, emissiveIntensity: o.ei == null ? 1 : o.ei,
    transparent: o.o != null && o.o < 1, opacity: o.o == null ? 1 : o.o, side: o.side ? T.DoubleSide : T.FrontSide,
  });
  matCache.set(k, m); return m;
}
function glow(color, o) { // matériau émissif plein, non éclairé
  return new T.MeshBasicMaterial({ color, transparent: !!(o && o.o), opacity: o && o.o != null ? o.o : 1, side: o && o.side ? T.DoubleSide : T.FrontSide, fog: !(o && o.nofog) });
}
function clearMatCache() { matCache.clear(); }
function addTo(m, parent) { (parent || G.world.g).add(m); return m; }
function box(cx, cy, cz, w, h, d, color, o) {
  o = o || {};
  const m = new T.Mesh(new T.BoxGeometry(w, h, d), o.mat || M(color, o));
  m.position.set(cx, cy, cz); if (o.ry) m.rotation.y = o.ry;
  addTo(m, o.parent);
  if (o.c) G.world.col.push({ x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2 });
  return m;
}
function cyl(cx, cy, cz, rt, rb, h, color, o) {
  o = o || {};
  const m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, o.seg || 20), o.mat || M(color, o));
  m.position.set(cx, cy, cz); addTo(m, o.parent);
  if (o.c) G.world.col.push({ x: cx, z: cz, r: Math.max(rt, rb) });
  return m;
}
function sph(cx, cy, cz, r, color, o) {
  o = o || {};
  const m = new T.Mesh(new T.SphereGeometry(r, o.seg || 18, o.seg ? o.seg * 0.7 : 12), o.mat || M(color, o));
  m.position.set(cx, cy, cz); if (o.sy) m.scale.y = o.sy; if (o.sx) m.scale.x = o.sx; if (o.sz) m.scale.z = o.sz;
  addTo(m, o.parent); return m;
}
function plane(cx, cy, cz, w, h, mat, rx, ry) {
  const m = new T.Mesh(new T.PlaneGeometry(w, h), mat);
  m.position.set(cx, cy, cz); m.rotation.x = rx || 0; m.rotation.y = ry || 0; addTo(m); return m;
}
function light(color, inten, x, y, z, dist) {
  const l = new T.PointLight(color, inten, dist || 14, 1.6); l.position.set(x, y, z); addTo(l); return l;
}
function ambientL(color, i, groundColor) {
  const h = new T.HemisphereLight(color, groundColor == null ? 0x151525 : groundColor, i); addTo(h); return h;
}
function env(bg, fogNear, fogFar) {
  scene.background = new T.Color(bg); scene.fog = new T.Fog(bg, fogNear == null ? 8 : fogNear, fogFar == null ? 60 : fogFar);
}
/* pièce rectangulaire avec murs collidants. coordonnées x0..x1, z0..z1 */
function room(x0, x1, z0, z1, h, o) {
  o = o || {};
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, t = 0.2;
  const fm = o.floorMat || M(o.floor || 0x2a2d3c, { r: o.floorR == null ? 0.6 : o.floorR, m: o.floorM || 0 });
  const wm = o.wallMat || M(o.wall || 0x2a2f48, { r: 0.9 });
  box(cx, -0.1, cz, w, 0.2, d, 0, { mat: fm });
  if (o.ceil !== false) box(cx, h + 0.1, cz, w, 0.2, d, 0, { mat: o.ceilMat || M(o.ceilC || 0x1a1c2b, { r: 1, e: o.ceilE || 0x000000, ei: 1 }) });
  const walls = o.skip || [];
  if (!walls.includes('n')) box(cx, h / 2, z0 - t / 2, w + t * 2, h, t, 0, { mat: wm, c: true });
  if (!walls.includes('s')) box(cx, h / 2, z1 + t / 2, w + t * 2, h, t, 0, { mat: wm, c: true });
  if (!walls.includes('w')) box(x0 - t / 2, h / 2, cz, t, h, d, 0, { mat: wm, c: true });
  if (!walls.includes('e')) box(x1 + t / 2, h / 2, cz, t, h, d, 0, { mat: wm, c: true });
  return { cx, cz, w, d };
}
function bounds(x0, x1, z0, z1) { G.world.bounds = { x0, x1, z0, z1 }; }
/* mur vitré : bande lumineuse bleutée */
function windowWall(x, y, z, w, h, axis, color) {
  const m = new T.Mesh(new T.PlaneGeometry(w, h), glow(color || 0x2a3b7a, { o: 0.35, side: true }));
  m.position.set(x, y, z); if (axis === 'x') m.rotation.y = Math.PI / 2; addTo(m); return m;
}

/* textures canvas */
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); draw(ctx, w, h);
  const t = new T.CanvasTexture(c); t.anisotropy = 2; t.needsUpdate = true; t.userData = { c, ctx };
  return t;
}
function wrapText(ctx, text, x, y, mw, lh) {
  const words = text.split(' '); let line = '';
  for (const w of words) {
    const t = line + w + ' ';
    if (ctx.measureText(t).width > mw && line) { ctx.fillText(line, x, y); line = w + ' '; y += lh; } else line = t;
  }
  ctx.fillText(line, x, y);
}
function holoPanel(x, y, z, w, h, lines, ry, o) {
  o = o || {};
  const col = o.color || '#6ae6ff';
  const tex = canvasTex(512, Math.round(512 * h / w), (ctx, cw, ch) => {
    ctx.fillStyle = o.bg || 'rgba(10,30,60,0.55)'; ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.strokeRect(6, 6, cw - 12, ch - 12);
    ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const n = lines.length;
    lines.forEach((ln, i) => {
      const big = i === 0;
      ctx.font = (big ? 'bold ' + (o.size || 44) : '' + (o.size ? o.size * 0.6 : 28)) + 'px "Chakra Petch",sans-serif';
      ctx.fillText(ln, cw / 2, ch * ((i + 1) / (n + 1)));
    });
  });
  const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: o.opacity || 0.9, side: T.DoubleSide, fog: false }));
  m.position.set(x, y, z); m.rotation.y = ry || 0; addTo(m);
  if (o.flicker) G.world.upd.push((dt, t) => { m.material.opacity = 0.75 + Math.sin(t * 9 + x) * 0.08 + (Math.random() < 0.02 ? -0.3 : 0); });
  return m;
}
function glowSprite(x, y, z, color, size, op) {
  if (!glowSprite.tex) glowSprite.tex = canvasTex(64, 64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  });
  const s = new T.Sprite(new T.SpriteMaterial({ map: glowSprite.tex, color, transparent: true, opacity: op == null ? 0.8 : op, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
  s.position.set(x, y, z); s.scale.set(size, size, 1); addTo(s); return s;
}
function particles(n, box3, color, size, drift) {
  const geo = new T.BufferGeometry(), arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = box3.x + rnd(-box3.w, box3.w); arr[i * 3 + 1] = box3.y + rnd(0, box3.h); arr[i * 3 + 2] = box3.z + rnd(-box3.d, box3.d); }
  geo.setAttribute('position', new T.BufferAttribute(arr, 3));
  const p = new T.Points(geo, new T.PointsMaterial({ color, size: size || 0.05, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
  addTo(p);
  const dr = drift || { x: 0, y: 0.1, z: 0 };
  G.world.upd.push((dt) => {
    const a = geo.attributes.position.array;
    for (let i = 0; i < n; i++) {
      a[i * 3] += dr.x * dt + Math.sin(G.t + i) * 0.002; a[i * 3 + 1] += dr.y * dt; a[i * 3 + 2] += dr.z * dt;
      if (a[i * 3 + 1] > box3.y + box3.h) a[i * 3 + 1] = box3.y; if (a[i * 3 + 1] < box3.y) a[i * 3 + 1] = box3.y + box3.h;
    }
    geo.attributes.position.needsUpdate = true;
  });
  return p;
}
function rain(cx, cz, w, h, color) {
  return particles(500, { x: cx, y: 0, z: cz, w, h, d: w }, color || 0x8fb4ff, 0.04, { x: 0, y: -9, z: 0 });
}
/* ville au loin */
let cityTex = null;
function city(radius, count, o) {
  o = o || {};
  if (!cityTex) cityTex = canvasTex(64, 128, (ctx, w, h) => {
    ctx.fillStyle = '#0a0c1e'; ctx.fillRect(0, 0, w, h);
    for (let y = 4; y < h; y += 8) for (let x = 4; x < w; x += 8) if (Math.random() < 0.38) { ctx.fillStyle = ['#ffd37a', '#6ae6ff', '#ff6fb5', '#b9a6ff'][(Math.random() * 4) | 0]; ctx.fillRect(x, y, 4, 5); }
  });
  const tex = cityTex.clone(); tex.needsUpdate = true;
  const neon = [0xff4fa3, 0x4de2ff, 0xa97bff, 0xffb84d];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU + rnd(-0.05, 0.05), r = radius + rnd(0, o.spread || 40), h = rnd(o.hmin || 25, o.hmax || 110), w = rnd(7, 16);
    const mat = new T.MeshBasicMaterial({ map: tex, color: new T.Color().setHSL(rnd(0.55, 0.75), 0.5, rnd(0.45, 0.8)) });
    const m = new T.Mesh(new T.BoxGeometry(w, h, w), mat);
    m.position.set(Math.cos(a) * r + (o.cx || 0), h / 2 + (o.y || 0), Math.sin(a) * r + (o.cz || 0)); addTo(m);
    if (Math.random() < 0.35) {
      const s = new T.Mesh(new T.BoxGeometry(w + 0.4, 0.5, w + 0.4), new T.MeshBasicMaterial({ color: neon[(Math.random() * 4) | 0] }));
      s.position.set(m.position.x, (o.y || 0) + h * rnd(0.5, 0.95), m.position.z); addTo(s);
    }
  }
}
/* engrenage (forme extrudée) */
function gearMesh(r, teeth, thick, color, op) {
  const s = new T.Shape(), n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU, tooth = (i % 4 === 1 || i % 4 === 2) ? 1.14 : 1, rr = r * tooth;
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  const hole = new T.Path(); hole.absarc(0, 0, r * 0.55, 0, TAU, true); s.holes.push(hole);
  for (let k = 0; k < 4; k++) { /* rayons: on laisse le trou plein, simplification */ }
  const geo = new T.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false });
  geo.translate(0, 0, -thick / 2);
  return new T.Mesh(geo, new T.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25, transparent: true, opacity: op == null ? 0.38 : op, roughness: 0.4, metalness: 0.6, side: T.DoubleSide }));
}

/* ================= PERSONNAGES ================= */
/* o : skin, hair, style, eye, top, bottom, shoes, skirt(bool), coat(bool), wings, hat, glasses, pendant, anklets, headband, scale, glow */
function makeChar(o) {
  const g = new T.Group(), P_ = {};
  const skin = M(o.skin || 0xf3cfb3, { r: 0.7 });
  const top = M(o.top || 0x445, { r: 0.8 }), bot = M(o.bottom || 0x223, { r: 0.8 }), hairM = M(o.hair || 0x3a2a22, { r: 0.55 });
  const sc = o.scale || 1; g.scale.setScalar(sc);
  const add = (m, par) => { (par || g).add(m); return m; };
  // jambes
  const leg = (sx) => {
    const p = new T.Group(); p.position.set(sx * 0.095, 0.86, 0); add(p);
    const l = new T.Mesh(new T.CylinderGeometry(0.075, 0.062, 0.8, 10), o.skirt ? skin : bot); l.position.y = -0.4; p.add(l);
    if (o.stockings) { l.material = M(o.stockings); }
    const sh = new T.Mesh(new T.BoxGeometry(0.11, 0.07, 0.2), M(o.shoes || 0x151520, { r: 0.5 })); sh.position.set(0, -0.82, 0.04); p.add(sh);
    if (o.anklets) { const a = new T.Mesh(new T.TorusGeometry(0.068, 0.009, 6, 14), M(0xffcf5a, { m: 0.8, r: 0.3, e: 0x553300 })); a.rotation.x = Math.PI / 2; a.position.y = -0.7; p.add(a); }
    return p;
  };
  P_.legL = leg(-1); P_.legR = leg(1);
  // torse
  const torso = new T.Mesh(new T.CylinderGeometry(0.17, 0.15, 0.62, 14), top); torso.position.y = 1.16; add(torso); P_.torso = torso;
  if (o.coat || o.skirt) {
    const sk = new T.Mesh(new T.CylinderGeometry(0.15, o.coat ? 0.27 : 0.33, o.coat ? 0.5 : 0.38, 18, 1, true), o.skirt ? M(o.bottom || o.top, { side: 1, r: 0.8 }) : top);
    sk.material = sk.material.clone(); sk.material.side = T.DoubleSide;
    sk.position.y = o.coat ? 0.78 : 0.7; add(sk);
  }
  if (o.collar) { const c = new T.Mesh(new T.TorusGeometry(0.1, 0.03, 8, 16), M(o.collar)); c.rotation.x = Math.PI / 2; c.position.y = 1.46; add(c); }
  // bras
  const arm = (sx) => {
    const p = new T.Group(); p.position.set(sx * 0.225, 1.42, 0); add(p);
    const a = new T.Mesh(new T.CylinderGeometry(0.052, 0.045, 0.62, 8), o.sleeves === false ? skin : (o.coat ? top : (o.sleeve || top))); a.position.y = -0.3; p.add(a);
    const h = new T.Mesh(new T.SphereGeometry(0.05, 8, 8), skin); h.position.y = -0.64; p.add(h);
    return p;
  };
  P_.armL = arm(-1); P_.armR = arm(1);
  // tête
  const head = new T.Group(); head.position.y = 1.62; add(head); P_.head = head;
  const hm = new T.Mesh(new T.SphereGeometry(0.14, 20, 16), skin); hm.scale.set(0.95, 1.08, 1); head.add(hm);
  const neck = new T.Mesh(new T.CylinderGeometry(0.045, 0.05, 0.12, 8), skin); neck.position.y = -0.14; head.add(neck);
  const eyeM = new T.MeshStandardMaterial({ color: o.eye || 0x2a2018, emissive: o.glowEyes ? (o.eye || 0x4de2ff) : 0x000000, emissiveIntensity: 0.9, roughness: 0.3 });
  [-1, 1].forEach((s) => {
    const w = new T.Mesh(new T.SphereGeometry(0.028, 10, 8), M(0xf6f6f6)); w.position.set(s * 0.052, 0.0, 0.118); w.scale.set(1, 1.15, 0.6); head.add(w);
    const e = new T.Mesh(new T.SphereGeometry(0.019, 10, 8), eyeM); e.position.set(s * 0.052, 0.0, 0.132); e.scale.set(1, 1.15, 0.6); head.add(e);
    if (o.brows !== false) { const b = new T.Mesh(new T.BoxGeometry(0.05, 0.008, 0.01), hairM); b.position.set(s * 0.052, 0.045, 0.13); head.add(b); }
  });
  const mouth = new T.Mesh(new T.BoxGeometry(0.04, 0.008, 0.01), M(o.lips || 0xa05a5a)); mouth.position.set(0, -0.06, 0.133); head.add(mouth); P_.mouth = mouth;
  // cheveux
  const st = o.style || 'short';
  const cap = new T.Mesh(new T.SphereGeometry(0.153, 20, 14, 0, TAU, 0, Math.PI * 0.5), hairM); cap.rotation.x = -0.28; cap.position.set(0, 0.012, -0.012); cap.scale.set(1, 1.05, 1.02); head.add(cap);
  const fr = new T.Mesh(new T.BoxGeometry(0.2, 0.05, 0.05), hairM); fr.position.set(0, 0.09, 0.115); fr.rotation.x = 0.3; head.add(fr);
  const hb = (geo, x, y, z, rx, rz) => { const m = new T.Mesh(geo, hairM); m.position.set(x, y, z); if (rx) m.rotation.x = rx; if (rz) m.rotation.z = rz; head.add(m); return m; };
  if (st === 'bun2') { hb(new T.SphereGeometry(0.075, 12, 10), -0.1, 0.17, -0.04); hb(new T.SphereGeometry(0.075, 12, 10), 0.1, 0.17, -0.04); }
  if (st === 'bun') { hb(new T.SphereGeometry(0.085, 12, 10), 0, 0.17, -0.07); }
  if (st === 'long') { hb(new T.BoxGeometry(0.3, 0.55, 0.1), 0, -0.2, -0.1); hb(new T.BoxGeometry(0.03, 0.34, 0.12), -0.14, -0.1, 0.0); hb(new T.BoxGeometry(0.03, 0.34, 0.12), 0.14, -0.1, 0.0); }
  if (st === 'bob') { hb(new T.BoxGeometry(0.3, 0.2, 0.14), 0, -0.04, -0.07); }
  if (st === 'ponytail') { hb(new T.CylinderGeometry(0.035, 0.02, 0.4, 8), 0, -0.14, -0.17, 0.35); }
  if (st === 'braids') { [-1, 1].forEach((s) => { for (let i = 0; i < 4; i++) hb(new T.SphereGeometry(0.036, 8, 6), s * 0.135, -0.03 - i * 0.075, 0.0 + i * 0.01); }); hb(new T.BoxGeometry(0.28, 0.1, 0.08), 0, 0.0, -0.1); }
  if (st === 'slick') { hb(new T.BoxGeometry(0.28, 0.06, 0.2), 0, 0.12, -0.02); }
  if (o.headband) { const b = new T.Mesh(new T.TorusGeometry(0.15, 0.012, 6, 24), M(o.headband)); b.rotation.x = Math.PI / 2 - 0.2; b.position.set(0, 0.06, -0.005); head.add(b); }
  if (o.glasses) {
    const gm = M(0x222a3a, { m: 0.6 });
    [-1, 1].forEach((s) => { const r = new T.Mesh(new T.TorusGeometry(0.035, 0.005, 6, 16), gm); r.position.set(s * 0.052, 0.0, 0.136); head.add(r); });
    const br = new T.Mesh(new T.BoxGeometry(0.03, 0.005, 0.005), gm); br.position.set(0, 0.005, 0.138); head.add(br);
  }
  if (o.hat) { // chapeau de cowboy
    const hm2 = M(o.hat, { r: 0.8 });
    const brim = new T.Mesh(new T.CylinderGeometry(0.27, 0.27, 0.015, 24), hm2); brim.position.y = 0.15; head.add(brim);
    const crown = new T.Mesh(new T.CylinderGeometry(0.1, 0.13, 0.14, 16), hm2); crown.position.y = 0.23; head.add(crown);
    head.rotation.z = 0.0; brim.rotation.z = 0.12; crown.rotation.z = 0.12;
  }
  if (o.earpiece) { const e = new T.Mesh(new T.SphereGeometry(0.018, 8, 6), glow(o.earpiece)); e.position.set(-0.135, 0.0, 0.0); head.add(e); }
  if (o.pendant) { const p = new T.Mesh(new T.BoxGeometry(0.05, 0.06, 0.012), new T.MeshStandardMaterial({ color: 0x4de2ff, emissive: 0x4de2ff, emissiveIntensity: 1.2 })); p.position.set(0, 1.4, 0.17); add(p); P_.pendant = p; }
  if (o.wings) {
    const wm = new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaad8ff, emissiveIntensity: 0.35, transparent: true, opacity: 0.55, side: T.DoubleSide });
    P_.wings = [];
    [-1, 1].forEach((s) => {
      const w = new T.Group(); w.position.set(s * 0.1, 1.38, -0.12);
      for (let i = 0; i < 5; i++) {
        const f = new T.Mesh(new T.PlaneGeometry(0.12, 0.62 - i * 0.07), wm); f.position.set(s * (0.12 + i * 0.1), 0.2 - i * 0.04, 0); f.rotation.z = -s * (0.5 + i * 0.12); w.add(f);
      }
      add(w); P_.wings.push(w); w.userData.s = s;
    });
  }
  if (o.glow) { const l = new T.PointLight(o.glow, 0.7, 5, 2); l.position.set(0, 1.4, 0.3); g.add(l); }
  g.userData = { parts: P_, o, phase: Math.random() * 10 };
  return g;
}
function npc(g, x, z, yaw, o) {
  o = o || {}; g.position.set(x, o.y || 0, z); g.rotation.y = yaw || 0; addTo(g);
  const n = { g, face: o.face !== false, baseYaw: yaw || 0, walk: 0, talk: false, lookMax: o.lookMax || 1.1, anim: o.anim };
  G.world.npcs.push(n);
  G.world.upd.push((dt, t) => animChar(n, dt, t));
  if (o.c !== false) G.world.col.push({ x, z, r: 0.38 });
  return n;
}
let animChar = function (n, dt, t) {
  const g = n.g, u = g.userData, p = u.parts, ph = u.phase;
  if (n.hidden) { g.visible = false; return; }
  const br = Math.sin(t * 1.8 + ph);
  p.torso.scale.set(1 + br * 0.012, 1 + br * 0.012, 1);
  if (n.walk > 0.01) {
    const s = Math.sin(t * 8 + ph) * 0.7 * n.walk;
    p.legL.rotation.x = s; p.legR.rotation.x = -s; p.armL.rotation.x = -s * 0.8; p.armR.rotation.x = s * 0.8;
  } else {
    p.legL.rotation.x *= 0.85; p.legR.rotation.x *= 0.85;
    if (!n.pose) { p.armL.rotation.x = Math.sin(t * 1.4 + ph) * 0.04; p.armR.rotation.x = -Math.sin(t * 1.4 + ph) * 0.04; p.armL.rotation.z = 0.05; p.armR.rotation.z = -0.05; }
  }
  if (n.dance) { const s = Math.sin(t * 3.2 + ph); g.position.y = Math.abs(s) * 0.04; p.armL.rotation.z = 0.5 + s * 0.4; p.armR.rotation.z = -0.5 - s * 0.4; g.rotation.y = n.baseYaw + Math.sin(t * 1.6 + ph) * 0.4; p.head.rotation.z = s * 0.06; }
  if (n.talk) p.mouth.scale.y = 1 + Math.abs(Math.sin(t * 14)) * 1.8; else p.mouth.scale.y = 1;
  if (p.wings) p.wings.forEach((w) => { w.rotation.y = w.userData.s * (0.35 + Math.sin(t * 2.2 + ph) * 0.08); });
  if (p.pendant) p.pendant.material.emissiveIntensity = 1 + Math.sin(t * 3) * 0.5;
  if (n.face && !n.dance) {
    const dx = P.x - g.position.x, dz = P.z - g.position.z, d = Math.hypot(dx, dz);
    if (d < 9 && !cam.active) {
      let target = Math.atan2(dx, dz) - n.baseYaw;
      target = Math.atan2(Math.sin(target), Math.cos(target));
      const tl = clamp(target, -n.lookMax, n.lookMax);
      p.head.rotation.y = lerp(p.head.rotation.y, tl * 0.7, Math.min(1, dt * 4));
      g.rotation.y = lerp(g.rotation.y, n.baseYaw + (Math.abs(target) > n.lookMax ? target - tl : 0) * 0.5 + tl * 0.35, Math.min(1, dt * 2.5));
    } else { p.head.rotation.y *= 0.95; g.rotation.y = lerp(g.rotation.y, n.baseYaw, Math.min(1, dt * 2)); }
  }
};
/* déplacer un PNJ en douceur */
function walkTo(n, x, z, ms, face) {
  const x0 = n.g.position.x, z0 = n.g.position.z, ang = Math.atan2(x - x0, z - z0);
  n.face = false; n.g.rotation.y = ang; n.walk = 1;
  return tween(ms, (k) => { n.g.position.x = lerp(x0, x, k); n.g.position.z = lerp(z0, z, k); }, (t) => t).then(() => { n.walk = 0; n.baseYaw = face == null ? ang : face; n.g.rotation.y = n.baseYaw; n.face = true; });
}
/* prefabs de personnages */
const CHARS = {
  ren: (v) => makeChar({ skin: 0xf0cdb0, hair: 0x5a4636, style: 'short', top: v === 'sleep' ? 0x4a4a62 : 0x2b3350, bottom: 0x1c2030, glasses: v !== 'sleep' && v !== 'young', coat: false, eye: 0x30251c, scale: 1.0 }),
  renYoung: () => makeChar({ skin: 0xf3d3b8, hair: 0x5a4636, style: 'short', top: 0x38486a, bottom: 0x20243a, scale: 0.93 }),
  miyako: (v) => makeChar({ skin: 0xf2d1b6, hair: 0x7a5238, style: v === 'loose' ? 'long' : 'bun', top: v === 'office' ? 0xf4f6ff : v === 'night' ? 0x16161e : v === 'cowboy' ? 0xf4f6ff : 0x15151c, bottom: v === 'office' ? 0x2d3350 : v === 'night' ? 0x16161e : v === 'street' ? 0xf4f4f4 : v === 'cowboy' ? 0xf4f6ff : 0x15151c, skirt: v === 'night' || v === 'cowboy', stockings: v === 'night' ? 0x101018 : null, eye: 0x2d8cff, glowEyes: true, hat: v === 'cowboy' ? 0x8a5a2b : null, scale: 0.97, sleeves: v === 'night' ? false : true }),
  aira: () => makeChar({ skin: 0xf6dcc6, hair: 0xf3d77a, style: 'bun2', headband: 0x15151c, top: 0x14141c, bottom: 0x14141c, skirt: true, stockings: 0x0a0a10, shoes: 0x0a0a10, eye: 0x4de2ff, glowEyes: true, wings: true, collar: 0x2a2a38, glow: 0x4de2ff, scale: 0.95, lips: 0xb87b86 }),
  odori: () => makeChar({ skin: 0xf4d8bf, hair: 0xe8c66a, style: 'braids', top: 0xf4f4f4, coat: true, bottom: 0x2a6f8f, eye: 0x7f9fb8, shoes: 0xdddddd, scale: 0.96 }),
  serina: () => makeChar({ skin: 0xe9c3a6, hair: 0x8a6143, style: 'ponytail', top: 0x8fa2c2, bottom: 0x39425a, eye: 0x3b2a20, scale: 0.95 }),
  aomi: () => makeChar({ skin: 0xf3d3b8, hair: 0x3a2a24, style: 'long', top: 0x6b7a3a, skirt: true, bottom: 0x6b7a3a, eye: 0x30251c, scale: 0.96 }),
  naia: () => makeChar({ skin: 0xb98562, hair: 0x20141a, style: 'long', top: 0x7a1a2e, skirt: true, bottom: 0x7a1a2e, eye: 0x1a1010, anklets: true, scale: 0.98, lips: 0x8a2a3a, pendant: true }),
  naiaHome: () => makeChar({ skin: 0xb98562, hair: 0x20141a, style: 'long', top: 0xe8e8ee, bottom: 0x101018, skirt: false, eye: 0x1a1010, anklets: true, scale: 0.98, lips: 0x8a2a3a, pendant: true }),
  issana: () => makeChar({ skin: 0xf2d3bd, hair: 0x4a3a30, style: 'bun', top: 0xf4f6ff, coat: true, bottom: 0x30334a, glasses: true, eye: 0x7fc4a8, scale: 0.94, pendant: true }),
  issanaFree: () => makeChar({ skin: 0xf2d3bd, hair: 0x4a3a30, style: 'long', top: 0xe9ecf6, coat: false, bottom: 0x30334a, eye: 0x7fc4a8, scale: 0.94 }),
  kaito: () => makeChar({ skin: 0xeccaa6, hair: 0x1a1a24, style: 'short', top: 0xe6ecff, bottom: 0x2a3050, eye: 0x20202a, scale: 1.02 }),
  sakura: () => makeChar({ skin: 0xf3d3b8, hair: 0x15151c, style: 'bob', top: 0xe6ecff, bottom: 0x2a3050, eye: 0x20202a, scale: 0.95 }),
  hayashi: () => makeChar({ skin: 0xe6c4a2, hair: 0xc8c8d0, style: 'slick', top: 0x20222c, bottom: 0x20222c, coat: true, eye: 0x20202a, scale: 1.03 }),
  femmeRC: () => makeChar({ skin: 0xe9cdb4, hair: 0x20202a, style: 'slick', top: 0x303a50, bottom: 0x303a50, skirt: true, eye: 0x20202a, scale: 0.98 }),
  extra: (c) => makeChar({ skin: [0xf3d3b8, 0xe9c3a6, 0xc99a74][(Math.random() * 3) | 0], hair: [0x2a2018, 0x6a4a30, 0xb99a50, 0x1a1a24][(Math.random() * 4) | 0], style: ['short', 'long', 'bob', 'ponytail'][(Math.random() * 4) | 0], top: c || new T.Color().setHSL(Math.random(), 0.45, 0.45).getHex(), bottom: 0x232637, scale: rnd(0.9, 1.03) }),
};
/* chat roux (Aira) */
function makeCat() {
  const g = new T.Group(), orange = M(0xd9762a, { r: 0.9 }), light_ = M(0xf0b070, { r: 0.9 });
  const body = new T.Mesh(new T.SphereGeometry(0.17, 14, 10), orange); body.scale.set(0.8, 0.7, 1.5); body.position.y = 0.22; g.add(body);
  const head = new T.Group(); head.position.set(0, 0.34, 0.26); g.add(head);
  head.add(new T.Mesh(new T.SphereGeometry(0.12, 14, 10), orange));
  [-1, 1].forEach((s) => {
    const ear = new T.Mesh(new T.ConeGeometry(0.045, 0.1, 4), orange); ear.position.set(s * 0.075, 0.12, 0); head.add(ear);
    const eye = new T.Mesh(new T.SphereGeometry(0.03, 10, 8), new T.MeshStandardMaterial({ color: 0x40ff9a, emissive: 0x40ff9a, emissiveIntensity: 1 })); eye.position.set(s * 0.05, 0.02, 0.1); eye.scale.z = 0.6; head.add(eye);
  });
  const muzzle = new T.Mesh(new T.SphereGeometry(0.05, 8, 6), light_); muzzle.position.set(0, -0.03, 0.1); head.add(muzzle);
  [[-0.08, 0.2], [0.08, 0.2], [-0.08, -0.2], [0.08, -0.2]].forEach(([x, z]) => { const l = new T.Mesh(new T.CylinderGeometry(0.035, 0.03, 0.2, 6), orange); l.position.set(x, 0.1, z); g.add(l); });
  const tail = new T.Group(); tail.position.set(0, 0.25, -0.26); g.add(tail);
  const tm = new T.Mesh(new T.CylinderGeometry(0.025, 0.04, 0.4, 6), orange); tm.position.set(0, 0.17, -0.07); tm.rotation.x = -0.5; tail.add(tm);
  g.userData = { head, tail };
  return g;
}
function catUpdate(cat, dt, t, target, speed) {
  const p = cat.position, dx = target.x - p.x, dz = target.z - p.z, d = Math.hypot(dx, dz);
  if (d > 1.6) { const s = Math.min(speed || 3.6, d * 2.2) * dt; p.x += (dx / d) * s; p.z += (dz / d) * s; cat.rotation.y = Math.atan2(dx, dz); cat.position.y = Math.abs(Math.sin(t * 12)) * 0.03; }
  else { cat.position.y = 0; }
  cat.userData.tail.rotation.y = Math.sin(t * 3) * 0.5; cat.userData.head.rotation.y = Math.sin(t * 0.8) * 0.2;
}

/* ================= VISUELS FOURNIS : panneaux face caméra ================= */
const ARTMAP = { ren: 'ren', renYoung: 'ren', miyako: 'miyako', aira: 'aira', odori: 'odori', serina: 'serina', aomi: 'aomi', naia: 'naia', naiaHome: 'naia', issana: 'issana', issanaFree: 'issana', hayashi: 'hayashi' };
const ART_H = { ren: 1.8, miyako: 1.75, aira: 1.95, odori: 1.65, serina: 1.7, aomi: 1.9, naia: 1.8, issana: 1.75, hayashi: 1.75 };
const ART_RING = { ren: 0x4de2ff, miyako: 0xff9ac8, aira: 0x4de2ff, odori: 0xffd36e, serina: 0xa9c8ff, aomi: 0xa5e08e, naia: 0xff5a6a, issana: 0x9be8b0, hayashi: 0x9aa6c8 };
const artTex = {};
function artTexture(k) {
  if (!artTex[k]) { const t = new T.TextureLoader().load(ART[k].img); t.anisotropy = 4; artTex[k] = t; }
  return artTex[k];
}
function applyArt(g, k, hMul) {
  g.traverse((o) => { if (o.isMesh) o.visible = false; });
  const a = ART[k], H = (ART_H[k] || 1.75) * (hMul || 1);
  const mat = new T.MeshLambertMaterial({ map: artTexture(k), emissive: 0xffffff, emissiveMap: artTexture(k), emissiveIntensity: 0.55, transparent: true, alphaTest: 0.04, side: T.DoubleSide });
  const bb = new T.Mesh(new T.PlaneGeometry(H * a.ar, H), mat);
  bb.position.y = (k === 'aira' ? 0.03 : 0.2) + H / 2; g.add(bb);
  const ring = new T.Mesh(new T.RingGeometry(0.38, 0.46, 32), new T.MeshBasicMaterial({ color: ART_RING[k] || 0x4de2ff, transparent: true, opacity: 0.55, side: T.DoubleSide, fog: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; g.add(ring);
  g.userData.bb = bb; g.userData.ring = ring; g.userData.artKey = k;
}
Object.keys(ARTMAP).forEach((name) => {
  const f = CHARS[name];
  CHARS[name] = (...args) => { const g = f(...args); if (ART[ARTMAP[name]]) applyArt(g, ARTMAP[name], name === 'renYoung' ? 0.93 : 1); return g; };
});
const _animChar = animChar;
animChar = function (n, dt, t) {
  _animChar(n, dt, t);
  const bb = n.g.userData.bb; if (!bb) return;
  const wp = n.g.getWorldPosition(new T.Vector3());
  bb.rotation.y = Math.atan2(camera.position.x - wp.x, camera.position.z - wp.z) - n.g.rotation.y;
  n.g.userData.ring.rotation.z = t * 0.6;
};

/* ================= PERSONNAGES EN VRAIE 3D (maillages reconstruits depuis les fiches de modélisation) ================= */
const MESH3D = { miyako: { d: () => (typeof M3D_miyako !== 'undefined' ? M3D_miyako : null), s: 1.72, ring: 0xff9ac8 }, odori: { d: () => (typeof M3D_odori !== 'undefined' ? M3D_odori : null), s: 1.66, ring: 0xffd36e }, aira: { d: () => (typeof M3D_aira !== 'undefined' ? M3D_aira : null), s: 1.62, ring: 0x4de2ff }, issana: { d: () => (typeof M3D_issana !== 'undefined' ? M3D_issana : null), s: 1.64, ring: 0x9be8b0 } };
const meshCache = {};
function b64buf(s) { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
function meshAssets(k) {
  if (meshCache[k]) return meshCache[k];
  const D = MESH3D[k].d(), pos16 = new Int16Array(b64buf(D.pos)), uv16 = new Uint16Array(b64buf(D.uv)), nor8 = new Int8Array(b64buf(D.nor));
  const idx = D.idx32 ? new Uint32Array(b64buf(D.idx)) : new Uint16Array(b64buf(D.idx));
  const n = D.n, p = new Float32Array(n * 3), uv = new Float32Array(n * 2), no = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) { p[i] = pos16[i] / 12000; no[i] = nor8[i] / 127; }
  for (let i = 0; i < n; i++) { uv[i * 2] = uv16[i * 2] / 65535; uv[i * 2 + 1] = 1 - uv16[i * 2 + 1] / 65535; }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(p, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.setAttribute('normal', new T.BufferAttribute(no, 3));
  g.setIndex(new T.BufferAttribute(idx, 1)); g.computeBoundingSphere();
  const tex = new T.TextureLoader().load(D.atlas); tex.anisotropy = 4;
  const mat = new T.MeshLambertMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.5, side: T.DoubleSide, transparent: true, alphaTest: 0.02 });
  return (meshCache[k] = { g, mat });
}
function applyMesh3D(g, k, variant) {
  const A = meshAssets(k), sc = MESH3D[k].s;
  g.traverse((o) => { if (o.isMesh) o.visible = false; });
  if (g.userData.bb) { g.remove(g.userData.bb); g.userData.bb = null; }
  if (g.userData.ring) g.remove(g.userData.ring);
  const m = new T.Mesh(A.g, A.mat); m.scale.setScalar(sc); g.add(m);
  if (variant === 'cowboy') {
    const hm = M(0x8a5a2b, { r: 0.8 });
    const brim = new T.Mesh(new T.CylinderGeometry(0.27, 0.27, 0.015, 24), hm); brim.position.set(0, 1.74, 0); brim.rotation.z = 0.12;
    const crown = new T.Mesh(new T.CylinderGeometry(0.1, 0.13, 0.14, 16), hm); crown.position.set(0, 1.81, 0); crown.rotation.z = 0.12; g.add(brim, crown);
  }
  const ring = new T.Mesh(new T.RingGeometry(0.38, 0.46, 32), new T.MeshBasicMaterial({ color: MESH3D[k].ring, transparent: true, opacity: 0.4, side: T.DoubleSide, fog: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; g.add(ring);
  g.userData.mesh3d = m; g.userData.ring = ring; g.userData.m3k = k;
}
[['odori', 'odori'], ['miyako', 'miyako'], ['issana', 'issana'], ['issanaFree', 'issana']].forEach(([name, key]) => {
  const f = CHARS[name];
  CHARS[name] = (...a) => { const g = f(...a); if (MESH3D[key].d()) applyMesh3D(g, key, a[0]); return g; };
});
const _animChar2 = animChar;
animChar = function (n, dt, t) {
  _animChar2(n, dt, t);
  const m = n.g.userData.mesh3d; if (!m) return;
  const sc = MESH3D[n.g.userData.m3k].s, br = Math.sin(t * 1.8 + n.g.userData.phase);
  m.scale.y = sc * (1 + br * 0.004);
  m.rotation.z = n.walk > 0.01 ? Math.sin(t * 8) * 0.035 * n.walk : 0;
  m.position.y = n.walk > 0.01 ? Math.abs(Math.sin(t * 8)) * 0.035 * n.walk : 0;
  n.g.userData.ring.rotation.z = t * 0.6;
};
