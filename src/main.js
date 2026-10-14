/* ================= FLOW / MENU ================= */
const CHAPTERS = [
  { id: 'apt', mode: 'morning', label: 'Prologue — L’Aube Artificielle' },
  { id: 'hyper', mode: 'ride', label: 'Prologue — L’Inspiration' },
  { id: 'lab', mode: 'ch1', label: 'Ch. 1 — On a du boulot' },
  { id: 'hall', mode: 'intro', label: 'Ch. 2-3 — Evergaze' },
  { id: 'train', mode: 'recode', label: 'Ch. 4 — Erreur Phoenix' },
  { id: 'neocorp', mode: 'main', label: 'Ch. 5 — Miyako & Naia' },
  { id: 'cantine', mode: 'main', label: 'Ch. 6 — Serina & Aomi' },
  { id: 'home', mode: 'main', label: 'Ch. 7 — Une vie hors des souvenirs' },
  { id: 'lab', mode: 'proposal', label: 'Ch. 8 — Et si c’étaient les miens ?' },
  { id: 'sim', mode: 'main', label: 'Ch. 9-10 — Oh, la belle vie' },
  { id: 'corridor', mode: 'main', label: 'Ch. 11 — Tu es mien' },
  { id: 'epilogue', mode: 'main', label: 'Épilogue — Ce que Hayashi sait' },
];
let unlocked = 0;
try { unlocked = +(localStorage.getItem('reprog.unlocked') || 0); } catch (e) {}
let curIdx = 0;
function saveProgress(i) {
  if (i > unlocked) { unlocked = i; try { localStorage.setItem('reprog.unlocked', String(i)); } catch (e) {} }
}
let loading = false;
async function go(id, mode, opts) {
  if (loading) return;
  loading = true;
  const token = ++G.runToken;
  G.mode = 'cine';
  $('#dlg').hidden = true; dlgState = null; talkDepth = 0;
  $('#prompt').style.opacity = 0;
  await fade(true, opts && opts.fast ? 350 : 800);
  if (token !== G.runToken) { loading = false; return; }
  camRelease(); cam.active = false; tweens.length = 0;
  disposeWorld(G.world); clearMatCache();
  G.world = newWorld(); G.levelId = id; G.lvMode = mode || 'main';
  P.ghost = false; P.frozen = false; P.speed = 3.4; P.y = 0; canvas.style.filter = ''; canvas.classList.remove('glitch', 'wipe'); canvas.style.transform = '';
  setGlassesAvailable(false, false); gauge(null); objective(null); G.onGlasses = null;
  scene.fog = null; scene.background = new T.Color(0x05060d);
  const idx = CHAPTERS.findIndex((c) => c.id === id && (c.mode === mode || !mode));
  if (idx >= 0) { curIdx = idx; saveProgress(idx); }
  const L = LEVELS[id];
  L.build(G.lvMode);
  $('#menu').hidden = true; $('#end').hidden = true;
  loading = false;
  G.mode = 'play';
  try { await L.run(G.lvMode, token); } catch (e) { console.error(e); }
}
function startGame(i) {
  audioInit();
  const c = CHAPTERS[i || 0];
  $('#menu').hidden = true;
  go(c.id, c.mode);
}
function buildMenuList() {
  const el = $('#chaps'); el.innerHTML = '';
  CHAPTERS.forEach((c, i) => {
    const b = document.createElement('button'); b.textContent = c.label; b.disabled = i > unlocked;
    b.addEventListener('click', () => startGame(i)); el.appendChild(b);
  });
}
$('#bStart').addEventListener('click', () => startGame(0));
$('#bCont').addEventListener('click', () => startGame(unlocked));
$('#bChaps').addEventListener('click', () => { $('#chaps').classList.toggle('on'); });
$('#bResume').addEventListener('click', togglePause);
function toMenu() {
  G.runToken++; G.mode = 'menu'; loading = false; $('#pause').hidden = true; $('#end').hidden = true;
  $('#dlg').hidden = true; dlgState = null; talkDepth = 0; cards_off();
  ambient(null);
  buildMenuList(); if (unlocked > 0) $('#bCont').hidden = false;
  $('#menu').hidden = false; fade(false, 600);
  disposeWorld(G.world); G.world = newWorld(); menuScene();
}
function cards_off() { $('#cards').classList.remove('on'); $('#title').classList.remove('on'); objective(null); gauge(null); $('#lens').classList.remove('on'); $('#place').style.opacity = 0; }
$('#bMenu').addEventListener('click', toMenu);
function menuScene() {
  env(0x05060d, 10, 90); clearMatCache();
  city(30, 60, { spread: 40, hmin: 30, hmax: 120 });
  particles(160, { x: 0, y: 0, z: 0, w: 14, h: 10, d: 14 }, 0x4de2ff, 0.05, { x: 0, y: 0.15, z: 0 });
  ambientL(0x3a4a9a, 0.9);
  light(0xff4fa3, 1.2, 6, 5, 4, 40); light(0x4de2ff, 1.2, -6, 6, -4, 40);
  P.x = 0; P.y = 8; P.z = 0; P.yaw = 0; P.pitch = 0;
  G.world.upd.push((dt, t) => { P.yaw = t * 0.06; P.y = 8 + Math.sin(t * 0.2) * 0.5; });
}
function endScreen() {
  G.mode = 'menu'; ambient({ f: [110, 165, 220], cut: 600, vol: 0.04, type: 'sine' });
  const e = $('#end'); e.hidden = false;
  e.innerHTML = '<div class="tome" style="letter-spacing:.34em;color:var(--amber);font-size:12px;text-transform:uppercase">Fin du Tome 1</div><h2>« On ne peut vivre que le présent. »</h2>' +
    '<ul><li>Vérités dites à Miyako : <b>' + G.stats.honest + '</b></li><li>Degrés de trop repérés dans la simulation d’Issana : <b>' + G.stats.anomalies + ' / 5</b></li><li>Fois où Ren a frotté ses lunettes : <b>' + G.stats.ritual + '</b></li><li>Gestes de bienveillance : <b>' + G.stats.kind + '</b></li></ul>' +
    '<div style="color:var(--muted);font-size:13px;max-width:520px;line-height:1.6">Tome 2 : Phoenix est actif, Tanaka est libre, Miyako est dans le système.<br>Exactement comme prévu.</div>' +
    '<button class="btn" id="bAgain">Retour au menu</button>';
  $('#bAgain').addEventListener('click', toMenu);
}
window.addEventListener('keydown', (e) => { if (e.code === 'F2' && location.hash === '#debug') window.DBG = { go, G, P, LEVELS }; });
window.__game = { go, G, P, toMenu, LEVELS, CHAPTERS, startGame };
window.__game.dbg = () => ({ talkDepth, hasDlg: !!dlgState, mode: G.mode, loading, cam: cam.active, frozen: P.frozen, inter: G.world.inter.map((o) => [o.label, !!o.done, o.when ? !!o.when() : '-']), tw: tweens.length });
