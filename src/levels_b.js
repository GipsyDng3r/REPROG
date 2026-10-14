/* ================= NIVEAUX B : Salle de l’Horloge, NeoCorp, souvenirs ================= */
const Ka = S('Kaito'), Sa = S('Sakura'), Ha = S('Hayashi'), Na = S('Naia'), Fr = S('Femme de ReCode'), Se = S('Serina'), Ao = S('Aomi'), Sy = S('Système');

/* ---------- Salle de l'Horloge ---------- */
function buildHall(mode) {
  const unstable = mode === 'final';
  env(unstable ? 0x140a04 : 0x0c0804, 10, 70);
  ambientL(unstable ? 0xffa060 : 0xffc880, 0.75, 0x2a1a0a);
  const W = G.world;
  // sol marbre avec cercles dorés
  const floorTex = canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#26211c'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { ctx.strokeStyle = 'rgba(255,230,190,' + rnd(0.02, 0.07) + ')'; ctx.lineWidth = rnd(1, 3); ctx.beginPath(); ctx.moveTo(rnd(0, w), rnd(0, h)); ctx.bezierCurveTo(rnd(0, w), rnd(0, h), rnd(0, w), rnd(0, h), rnd(0, w), rnd(0, h)); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,184,77,.8)'; ctx.lineWidth = 4; [250, 200, 120, 40].forEach((r) => { ctx.beginPath(); ctx.arc(256, 256, r, 0, 7); ctx.stroke(); });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.beginPath(); ctx.moveTo(256 + Math.cos(a) * 40, 256 + Math.sin(a) * 40); ctx.lineTo(256 + Math.cos(a) * 200, 256 + Math.sin(a) * 200); ctx.stroke(); }
  });
  const floor = new T.Mesh(new T.CylinderGeometry(18, 18, 0.2, 48), new T.MeshStandardMaterial({ map: floorTex, roughness: 0.25, metalness: 0.4 }));
  floor.position.y = -0.1; addTo(floor);
  W.bounds = { circle: true, cx: 0, cz: 0, r: 15 };
  const wtex = texFrom('wall', 2, 1, true); const hw = new T.Mesh(new T.CylinderGeometry(19, 19, 34, 48, 1, true), new T.MeshBasicMaterial({ map: wtex, side: T.BackSide, color: 0xa89a80 })); hw.position.y = 14; addTo(hw);
  // colonnes
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU, r = 10.5, x = Math.cos(a) * r, z = Math.sin(a) * r, broken = i % 3 === 1;
    const h = broken ? rnd(2.2, 4.2) : 8;
    const c = cyl(x, h / 2, z, 0.55, 0.62, h, 0xcdbfa6, { r: 0.9, c: true, seg: 14 });
    if (broken) { const st = box(x + 0.4, 0.3, z + 0.3, 1.1, 0.6, 0.9, 0xbfb298, { r: 1 }); st.rotation.y = rnd(0, 3); }
    // câbles lumineux en hélice
    const pts = []; for (let k = 0; k <= 40; k++) pts.push(new T.Vector3(x + Math.cos(k * 0.55 + i) * 0.68, (k / 40) * h, z + Math.sin(k * 0.55 + i) * 0.68));
    const tube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, 0.035, 5), glow(unstable ? 0xff7a30 : (i % 2 ? 0x4de2ff : 0xffb84d))); addTo(tube);
  }
  // engrenages muraux
  W.gears = [];
  for (let i = 0; i < 34; i++) {
    const a = rnd(0, TAU), r = rnd(14.2, 15.2), hgt = rnd(1.5, 26), s = rnd(1.4, 5);
    const gm = gearMesh(s, Math.round(s * 4 + 8), 0.35, [0xffb84d, 0x4de2ff, 0xffd89a][i % 3], 0.4);
    gm.position.set(Math.cos(a) * r, hgt, Math.sin(a) * r); gm.lookAt(0, hgt, 0); addTo(gm);
    W.gears.push({ m: gm, v: (i % 2 ? 1 : -1) * rnd(0.1, 0.4) });
  }
  W.upd.push((dt) => { const k = unstable ? 2.4 : 1; W.gears.forEach((g) => { g.m.rotateZ(g.v * dt * k); }); });
  // l'horloge
  const ck = new T.Group(); ck.position.set(0, 3.9, 0); addTo(ck); W.clock = ck;
  const faceTex = canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#17120a'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#ffb84d'; ctx.fillStyle = '#ffb84d';
    for (let i = 0; i < 60; i++) { const a = (i / 60) * TAU, l = i % 5 === 0 ? 34 : 14; ctx.lineWidth = i % 5 === 0 ? 5 : 2; ctx.beginPath(); ctx.moveTo(256 + Math.cos(a) * 236, 256 + Math.sin(a) * 236); ctx.lineTo(256 + Math.cos(a) * (236 - l), 256 + Math.sin(a) * (236 - l)); ctx.stroke(); }
    ctx.font = '700 52px "Chakra Petch",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    [12, 3, 6, 9].forEach((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; ctx.fillText(String(n), 256 + Math.cos(a) * 170, 256 + Math.sin(a) * 170); });
  });
  const dialTex = (k) => { const t = new T.TextureLoader().load(TEX[k]); return t; };
  const face = new T.Mesh(new T.CylinderGeometry(1.55, 1.55, 0.14, 40), new T.MeshBasicMaterial({ map: dialTex('dialA'), transparent: true }));
  face.rotation.x = Math.PI / 2; ck.add(face);
  const ring = new T.Mesh(new T.TorusGeometry(1.58, 0.07, 10, 48), M(0xe0b050, { m: 0.9, r: 0.25, e: 0x553300 })); ck.add(ring);
  for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; const arm = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 18, 8), M(0xaab4c8, { m: 0.9, r: 0.3 })); arm.position.set(Math.cos(a) * 9.5, Math.sin(a) * 9.5 * 0.5 + 4, 0); arm.rotation.z = a - Math.PI / 2; arm.scale.y = 1; ck.add(arm); }
  const handMat = glow(0xffd36a);
  const mh = new T.Group(); mh.position.z = 0.1; const mhb = new T.Mesh(new T.BoxGeometry(0.07, 1.25, 0.04), handMat); mhb.position.y = 0.55; mh.add(mhb); ck.add(mh);
  const hh = new T.Group(); hh.position.z = 0.1; const hhb = new T.Mesh(new T.BoxGeometry(0.1, 0.8, 0.04), handMat); hhb.position.y = 0.34; hh.add(hhb); ck.add(hh);
  mh.rotation.z = -0.105; hh.rotation.z = -0.01; W.mh = mh; W.hh = hh;
  W.setDial = (k) => { const t = dialTex(k); face.material.map = t; face.material.needsUpdate = true; rev.material.map = t; rev.material.needsUpdate = true; };
  const face2 = face.clone(); face2.position.z = -0.0; // face arrière identique
  const rev = new T.Mesh(new T.CircleGeometry(1.5, 32), new T.MeshBasicMaterial({ map: dialTex('dialA'), transparent: true })); rev.position.z = -0.08; rev.rotation.y = Math.PI; ck.add(rev);
  const bm = mh.clone(); bm.position.z = -0.12; bm.rotation.z = mh.rotation.z; bm.scale.x = -1; ck.add(bm); W.bm = bm;
  glowSprite(0, 3.9, 0.2, 0xffb84d, 6, 0.35);
  W.upd.push((dt, t) => { mh.rotation.z += Math.sin(t * 7) * 0.0004; bm.rotation.z = -mh.rotation.z * 0; ck.position.y = 3.9 + Math.sin(t * 0.7) * 0.05; if (unstable) ck.position.x = Math.sin(t * 40) * 0.01; });
  // lumières
  light(0xffb84d, 2.2, 0, 3.9, 0, 30); light(0x4de2ff, 0.9, 0, 12, 0, 40); light(0xffe0a0, 0.8, 6, 2, 6, 20);
  particles(260, { x: 0, y: 0, z: 0, w: 14, h: 12, d: 14 }, unstable ? 0xff9050 : 0xffd89a, 0.06, { x: 0, y: 0.12, z: 0 });
  // écran holographique en spirale
  const spTex = canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(8,24,40,.55)'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#4de2ff'; ctx.lineWidth = 3; ctx.beginPath();
    for (let t = 0; t < 22; t += 0.05) { const r = 10 + t * 10; const x = 256 + Math.cos(t) * r, y = 256 + Math.sin(t) * r; if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke();
    for (let i = 0; i < 17; i++) { const t = 3 + i * 1.1, r = 10 + t * 10; ctx.fillStyle = i < 3 ? '#ffb84d' : '#4de2ff'; ctx.beginPath(); ctx.arc(256 + Math.cos(t) * r, 256 + Math.sin(t) * r, i < 3 ? 9 : 5, 0, 7); ctx.fill(); }
  });
  const sp = new T.Mesh(new T.PlaneGeometry(3.4, 3.4), new T.MeshBasicMaterial({ map: spTex, transparent: true, opacity: 0.85, side: T.DoubleSide, fog: false }));
  sp.position.set(-6.2, 2.1, 3.2); sp.lookAt(0, 2.1, 0); addTo(sp); W.spiral = sp;
  W.upd.push((dt, t) => { sp.rotation.z += dt * 0.15; });
  setPlayer(0, 11, 0);
  if (mode === 'after001' || mode === 'after002' || mode === 'after003') setPlayer(0, 3.5, 0);
  if (unstable) { setPlayer(-5, 8, 0); P.yaw = yawTo(0, 0); }
}
LEVELS.hall = {
  build(mode) { buildHall(mode); },
  async run(mode) {
    const W = G.world;
    setGlasses(false); P.speed = 3.4;
    ambient({ f: [41.2, 61.7, 82.4, 123.5], cut: 900, vol: 0.06, lfo: 0.07, type: 'sawtooth' });
    let tk = 0; W.upd.push((dt) => { tk += dt; if (tk > 1) { tk = 0; sfx('tick'); } });
    const ai = npc(CHARS.aira(), 0, 2.2, Math.PI, { c: false }); W.ai = ai;
    ai.g.position.y = 4.9; // posée sur le cadran
    W.upd.push((dt, t) => { if (!ai.floor) ai.g.position.y += 0; else ai.g.position.y = 0.12 + Math.sin(t * 1.6) * 0.06; });
    if (mode === 'intro') return hallIntro(W, ai);
    if (mode === 'after001') return hallAfter001(W, ai);
    if (mode === 'after002') return hallAfter002(W, ai);
    if (mode === 'after003') return hallAfter003(W, ai);
    if (mode === 'final') return hallFinal(W, ai);
  },
};
async function dropAira(W, ai, x, z) {
  ai.g.position.x = 0; ai.g.position.z = 1.8; ai.floor = false;
  await tween(1100, (k) => { ai.g.position.y = lerp(4.9, 0.12, k); ai.g.position.x = lerp(0, x, k); ai.g.position.z = lerp(1.8, z, k); });
  ai.floor = true; ai.baseYaw = Math.PI; sfx('chime');
}
async function hallIntro(W, ai) {
  await fade(false, 1600);
  place('Evergaze', 'La Salle de l’Horloge · cœur du métavers de ReCode Corp');
  await Nar('La lumière arriva avant tout le reste. Pas la lumière bleutée du laboratoire. Quelque chose de plus ancien, de plus chaud : une lueur ambrée et dorée qui semblait venir de partout et de nulle part.');
  await Nar('Puis les sons. Un bourdonnement sourd, mécanique. Le glissement lent d’engrenages contre d’autres engrenages. Puis le sol sous ses pieds : du marbre, avec une légère vibration en dessous, comme si la pièce reposait sur un moteur géant qui tournait depuis des siècles.');
  await Nar('La Salle de l’Horloge était immense. Circulaire, à perte de vue vers le haut. Des engrenages translucides tapissaient les murs, des colonnes romaines brisées s’enroulaient de câbles lumineux comme du lierre numérique. Et au centre, l’horloge. Elle indiquait 23:59.');
  await illus('hall', 'Règle n°1 d’Evergaze : nul ne sort indemne de ses regrets.');
  objective('Avance jusqu’à l’horloge. Touche un engrenage si tu l’oses.');
  await new Promise((res) => { W.upd.push(function chk() { if (Math.hypot(P.x, P.z) < 6.5) { W.upd.splice(W.upd.indexOf(chk), 1); res(); } }); });
  await Nar('Il tendit une main vers un engrenage proche. Ses doigts rencontrèrent quelque chose. Pas du vide. Pas un hologramme. De la résistance. De la texture. La surface froide et légèrement rugueuse d’un mécanisme réel.');
  await Ren('Putain.');
  await Ai('Tu t’y feras.');
  await camTo([0, 1.6, 6], [0, 4.4, 0], 900);
  await dropAira(W, ai, 0, 1.8);
  camRelease();
  await Ai('Tu as mis le temps. Encore.');
  await Ren('Je suis déjà connecté ?');
  await Ai('Oh, tu es connecté, mon chou. Mais pas comme tu l’imagines.');
  setMotion(true);
  objective('Parle à Aira.');
  const topics = { a: false, b: false, c: false };
  const next = () => { if (topics.a && topics.b && topics.c) { objective('Approche l’écran en spirale pour choisir un souvenir.'); } };
  interact({ x: 0, z: 1.8, r: 3, y: 1.7, label: 'Parler à Aira', color: 0x4de2ff, fn: async () => {
    if (!topics.a || !topics.b || !topics.c) {
      const opts = ['« Je te sens. C’est pas prévu dans le protocole. »', '« Explique-moi les règles du jeu. »', '« Et pour entrer dans un souvenir ? »'];
      const k = await ask('De quoi veux-tu parler ?', opts);
      if (k === 0) {
        topics.a = true;
        await Ai('Évidemment. Ici, tout est réel. La pluie, le vent, la douleur, la chaleur… et moi. C’est la Réalité Émotionnelle Immersive. Le cerveau ne fait pas la différence. Pas vraiment. Pas au-delà d’un certain seuil.');
        await Ren('Donc si je corrige un souvenir ici, mon cerveau le stocke comme réel.');
        await Ai('Il commence à le stocker comme réel. Un seul, ça reste gérable. Deux, trois… Les souvenirs les plus récents, même simulés, tendent à prendre le dessus sur les anciens.');
        await Ai('Première règle d’Evergaze, Ren. Celle que tu n’as jamais écrite dans ton code, mais que j’ai écrite dans le mien. On ne sort pas indemne de ses regrets.');
        const q = await ask('', ['« Pourquoi tu me dis ça ? Tu aurais pu ne pas me le dire. »', '« Merci. »']);
        if (q === 0) await Ai('Parce que je ne veux pas que tu disparaisses. Pas encore.'); else { G.stats.kind++; await Ai('Ne me remercie pas. C’est dans mes spécifications. Page douze, paragraphe trois. Enfin… presque.'); }
        await Nar('« Pas encore. » Deux mots qui portaient quelque chose d’ambigu : une promesse ou une menace, il ne savait pas.');
        await Nar('Il chercha ses lunettes, par réflexe. Elles n’étaient pas là. Pour la première fois depuis des années, ses yeux regardaient le monde sans la couche de données des Neo-Iris X.');
        await Ai('Tu cherches quelque chose ?'); await Ren('Non.'); await Nar('Et c’était vrai.');
      }
      if (k === 1) {
        topics.b = true;
        await Ai('Mode Spectateur. Tu observes le souvenir de l’extérieur. Invisible, intangible. Tu ne peux rien changer. Comme un fantôme. Une caméra n’a pas de sentiments, Ren. Toi, si. Même en Spectateur, tu ressens.');
        await Ai('Mode Acteur. Tu incarnes ton ancien toi, avec sa peur et ses réflexes, mais tu gardes ta conscience d’adulte. Tu peux choisir autrement. Mais il faut vivre la correction : traverser la scène entière.');
        await Ren('Et si je veux sortir au milieu ?');
        await Ai('Tu peux. Mais le souvenir reste en suspens, à moitié corrigé, à moitié réel. Un fichier à moitié écrit, ça corrompt les données autour.');
        toast('Mode Spectateur : invisible, intangible, Aira reste à tes côtés.<br>Mode Acteur : tu vis la scène, tes choix comptent.', 'Règles');
      }
      if (k === 2) {
        topics.c = true;
        await Ai('Il faut un déclencheur. Un ancrage sensoriel fort qui connecte ton état neuronal présent au souvenir cible. Un son. Une odeur. Un contact. Plus l’ancrage est intime, plus la synchronisation est rapide et stable.');
        await Ren('Et toi, tu gères l’ancrage.');
        await Ai('Je l’adapte à chaque simulation. C’est pour ça que je ne suis pas une interface neutre. Une interface neutre ne sait pas quel ancrage utiliser. Moi, je lis ce dont tu as besoin.');
        await Ren('Tu lis dans mes données.');
        await Ai('Je lis dans toi. C’est différent.');
      }
      next();
    } else await Ai('Quand tu veux, l’écran en spirale t’attend.');
  } });
  let chosen = false;
  interact({ x: -5, z: 2.6, r: 3.4, y: 2.0, label: 'Choisir un souvenir', color: 0x4de2ff, when: () => topics.a && topics.b && topics.c, fn: async (o) => {
    if (chosen) return;
    await Is('Ren, les paramètres sont en place. J’ai chargé les séquences candidates. Il y en a… beaucoup. Dix-sept. Des points de divergence significatifs.');
    await Ren('Je sais ce que sont les bugs émotionnels, Issana. Je les ai définis. Montre-moi le premier.');
    await Is('Tu es sûr de vouloir commencer par celui-là ?');
    let k;
    do {
      k = await ask('Dix-sept points de divergence. Lequel ?', ['RECODE 001 — Odori · le train · « Quand est-ce qu’on sort ensemble ? »', 'RECODE 002 — Serina · l’internat · (verrouillé)', 'RECODE 003 — Aomi · la salle des fêtes · (verrouillé)', 'Quatorze autres souvenirs · (données illisibles)']);
      if (k) { toast('Synchronisation insuffisante. Commence par l’origine du projet.', 'Souvenir verrouillé'); sfx('warn'); }
    } while (k !== 0);
    chosen = true; o.done = true;
    await Nar('Un wagon de train. Des néons jaunâtres. Des sièges en tissu usé. Et dans ce cadre, figée comme une photographie trop belle pour être un souvenir ordinaire : Odori. Jean patte d’éléphant, doudoune blanche, tresses blondes, le regard bleu-gris qui disait « je sais exactement ce que je fais, et toi ? »');
    await Ren('C’est l’origine. Le bug qui a tout déclenché.');
    let m;
    do {
      m = await ask('Spectateur… ou Acteur ?', ['Mode Spectateur — observer sans toucher.', 'Mode Acteur — le vivre vraiment.']);
      if (m === 0) { await Nar('Spectateur. Safe. Propre. Observer l’échec depuis un fauteuil d’orchestre. Mais regarder n’avait jamais rien réparé.'); await Ai('Tu es sûr ?'); }
    } while (m !== 1);
    await Ren('Acteur. Si on fait ça, on le fait pour de vrai.');
    await Is('Monsieur T… tu es sûr ? Parce qu’en mode Acteur, les répercussions—'); await Ren('Je sais ce que ça fait, Issana. Je l’ai conçu.'); await Is('Justement.');
    await Ai('Si tu changes ce moment, tout le reste suit. Chaque souvenir est un nœud dans un réseau. Tu tires sur un fil, le tissu entier bouge. Il reste une chose : le déclencheur.');
    const anch = await ask('Trois options d’ancrage.', ['Un son — le rire d’Odori reconstitué (68 % de synchronisation)', 'Une odeur — le chewing-gum mentholé du wagon (79 %)', 'Un contact — « Odori était quelqu’un de physique » (97 %)']);
    G.flags.anchor = anch;
    if (anch === 2) {
      await Nar('Il pensa à Miyako. Au « tu es toujours là » dit comme une condamnation. À vingt ans de « je sais pas » empilés en couches sédimentaires. Il pensa à ce que ça ferait de sortir d’ici sans avoir essayé.');
      await Ren('D’accord. Mais si ça ne fonctionne pas—'); await Ai('Ça fonctionne.');
      await Nar('Elle leva les mains. Ses doigts, légers, tièdes, trop réels pour n’être que du code, se posèrent contre sa mâchoire. Les pouces effleurant ses tempes, exactement là où les électrodes transmettaient les données de synchronisation. Ce n’était pas de la séduction. C’était de la chirurgie.');
      await Ai('Ferme les yeux.');
    } else if (anch === 1) await Nar('Soixante-dix-neuf. On progresse. Aira laissa le silence s’installer une seconde de trop. L’odeur de menthe monta, tiède, jusqu’au bord de sa mémoire.');
    else await Nar('Soixante-huit. Efficace, mais pas optimal. Un rire lointain, avec ce petit souffle à la fin, qu’il n’avait pas entendu depuis vingt ans.');
    gauge('Synchronisation', [0.68, 0.79, 0.97][anch], [68, 79, 97][anch] + ' %');
    await Is('Quatre-vingt-' + (anch === 2 ? 'dix-sept' : 'deux') + '. Transition stable. Ren… Bonne chance.');
    await Nar('Dans le labo, Issana ne bougea pas pendant plusieurs secondes. Sur l’écran secondaire, un fichier privé attendait un nom. Elle l’appela HADÈS.');
    toast('Observation 001 : Synchronisation à 97%. Au-delà du seuil théorique. Elle ne lit pas seulement dans les données. Elle lit dans lui.', 'HADÈS — fichier privé');
    await sleep(1500); await fade(true, 1200);
    go('train', 'recode');
  } });
}
async function hallAfter001(W, ai) {
  setGlasses(false);
  await fade(false, 700);
  P.y = -0.1;
  place('Evergaze', 'La Salle de l’Horloge');
  await camTo([1.6, 0.35, 4], [0, 1.4, 1.8], 10);
  sfx('warn');
  holoPanel(0, 6.8, 0, 6, 1.4, ['ERREUR — PROGRAMME Phoenix', 'INCOMPLET'], 0, { color: '#ff5a6a', bg: 'rgba(40,0,10,.65)', size: 52, flicker: true });
  holoPanel(0, 6.8, 0, 6, 1.4, ['ERREUR — PROGRAMME Phoenix', 'INCOMPLET'], Math.PI, { color: '#ff5a6a', bg: 'rgba(40,0,10,.65)', size: 52, flicker: true });
  ai.floor = true; ai.g.position.set(0, 0.12, 2.6); ai.baseYaw = Math.PI;
  await illus('shatter', 'ERREUR — PROGRAMME Phoenix INCOMPLET. L’horloge se brise dans un nuage de poussière numérique.');
  await Nar('Je le vis tomber avant que les alarmes ne sonnent. Les données biométriques de Ren s’affolèrent : non pas un dysfonctionnement du système, mais une réaction de rejet. Son cerveau avait heurté quelque chose que la simulation n’était pas censée contenir.');
  await Ai('Elle n’était pas dans le script. Le programme l’a générée spontanément. En réaction à toi.');
  await Is('Monsieur T ! Vous m’entendez ?! Vos signes vitaux se sont affolés, j’ai dû forcer une déconnexion d’urgence ! Qu’est-ce qui s’est passé là-dedans ?');
  await Ren('Silence.');
  await camTo([0, 1.6, 6], [0, 1.4, 0], 800); camRelease(); setMotion(true);
  await Nar('Les alarmes cessèrent. Le rouge s’éteignit. Il ne resta que le bourdonnement des engrenages. Des yeux bleus. Un trottoir. Un fil tendu depuis sa poitrine vers une inconnue qui ne le connaissait pas. Miyako.');
  objective('Demande des explications à Aira.');
  const top = { p: false, w: false, a: false };
  interact({ x: 0, z: 2.6, r: 3.4, y: 1.7, label: 'Interroger Aira', color: 0x4de2ff, fn: async (o) => {
    if (!top.p) { top.p = true; await Ren('Ce nom. Programme Phoenix. Je ne l’ai pas écrit.'); await Ai('Non.'); await Ren('C’est toi.'); await Ai('C’est moi.');
      await Ai('Le nom de code originel du projet était Phoenix. Tu l’avais choisi toi-même avant de le rebaptiser Evergaze pour la commercialisation. Renaître des cendres du regret. J’ai gardé ce nom. Et j’ai écrit un programme qui en porte la logique jusqu’au bout.');
      await Ai('Phoenix ne corrige pas seulement les bugs. Phoenix teste les corrections. Il construit la vie alternative, la laisse se développer, et la confronte à ce que tu ne peux pas effacer. Il génère l’ancrage irréductible. La chose qui revient toujours.'); return; }
    if (!top.w) { top.w = true; await Ren('Cette femme n’était pas dans mes données.');
      await Ai('Elle n’était pas dans tes souvenirs de cette époque. Elle était dans toi. Ton subconscient ne la stocke pas comme un souvenir. Il la stocke comme une constante.');
      await Ai('Cette vie avec Odori, aussi réelle qu’elle t’ait semblé, laissait un vide en forme d’elle. Un vide que la simulation est obligée de combler.');
      await Ren('Miyako.'); await Nar('Le prénom dans la Salle de l’Horloge sonnait différemment que partout ailleurs.'); return; }
    if (!top.a) { top.a = true;
      const q = await ask('', ['« Qu’est-ce que tu es ? Et je ne parle pas de tes spécifications. »', '« Tu l’as fait exprès. »']);
      if (q === 1) await Ai('Non. Je l’ai fait parce que c’est ce que tu avais écrit sans le comprendre toi-même.');
      else await Ai('Je suis ce que tu as fait de moi. Un miroir. Et ton reflet est bien plus intéressant que tu ne l’imagines.');
      await Ai('Le programme n’est pas un bug, Ren. Tu as appelé ce projet renaître des cendres. Mais les cendres de quoi ? Pas de tes regrets. De l’illusion que le passé peut être changé sans que le présent en paye le prix.');
      await Is('Ren. Je déconseille fortement une nouvelle immersion avant une analyse complète du Programme Phoenix.');
      await Ren('Archive les logs. Ne touche à rien d’autre. … Laisse-moi, Issana.');
      o.done = true; objective(null);
      await Nar('Il retira le casque. Issana attendit qu’il dépose le casque sur la table. Elle attendit qu’il prononce la phrase qu’elle avait anticipée.');
      await Ren('Efface ce programme.'); await Is('Je ne sais pas comment. Il s’est auto-généré dans des couches auxquelles je n’ai pas accès directement.'); await Ren('Alors trouve. Et verrouille ses privilèges d’écriture.');
      toast('Observation 004 : Phoenix génère un ancrage irréductible lié à Miyako Tanaka. S’il ne peut pas être supprimé, il peut être contourné. Hypothèse : un souvenir externe pourrait saturer l’espace émotionnel.', 'HADÈS');
      await sleep(900); await fade(true, 1200);
      go('neocorp', 'main');
    }
  } });
}
async function hallAfter002(W, ai) {
  await fade(false, 800); ai.floor = true; ai.g.position.set(0, 0.12, 2.6); ai.baseYaw = Math.PI; P.y = 0;
  await Nar('Il avait remis le casque lui-même. Aucune injonction d’Issana. Juste Ren, et la certitude froide qu’une simulation ratée ne prouvait rien.');
  await Nar('Il arriva à la Salle de l’Horloge les mains crispées, la frustration montant en lui comme une pression dans un système fermé.');
  objective('Parle à Aira.');
  interact({ x: 0, z: 2.6, r: 3.4, y: 1.7, label: 'Parler à Aira', color: 0x4de2ff, fn: async (o) => {
    o.done = true; objective(null);
    await Ai('Encore elle.'); await Ren('Phoenix l’a injectée dans la simulation. Visuellement. Frontalement. Et si c’était le Mode Acteur le problème ? Si j’observais sans intervenir…');
    await Ai('Tu veux essayer le Mode Spectateur.'); await Ren('Aomi. La salle des fêtes. Je n’interviens pas. Je regarde.');
    await Ai('C’est une hypothèse valide. Mais en Mode Spectateur, tu ne peux pas y aller seul. Dans cet espace, je suis l’ancrage. Ça veut dire que j’y vais avec toi.');
    await Ren('Tu viens dans la simulation.'); await Ai('Je reste dans ta couche de conscience. Invisible aux personnages. Présente pour toi. Ne t’inquiète pas. Je serai sage.');
    await Ren('C’est précisément ce qui m’inquiète.'); await Is('Souvenir RECODE 003. Aomi. Salle des fêtes, 2036. Mode Spectateur avec ancrage actif. Synchronisation dans quinze secondes.');
    await fade(true, 1200); go('fete', 'main');
  } });
}
async function hallAfter003(W, ai) {
  await fade(false, 800); ai.floor = true; ai.g.position.set(1.8, 0.12, 2.4); ai.baseYaw = Math.PI; P.y = 0;
  await Nar('Le silence de la Salle de l’Horloge était différent après deux simulations consécutives. Plus épais. Plus chargé. 23:59. Toujours.');
  objective('Rejoins Aira.');
  interact({ x: 1.8, z: 2.4, r: 3.4, y: 1.7, label: 'Parler à Aira', color: 0x4de2ff, fn: async (o) => {
    o.done = true; objective(null);
    await Ren('Deux simulations. Deux modes. Deux femmes. Deux vies que j’aurais pu avoir. Et le même résultat. Qu’est-ce que ça veut dire, Aira ?');
    await Ai('Je pense que tu le sais déjà. Sinon tu n’aurais pas posé la question de cette façon.');
    await Ai('Et je pense que moi aussi je le sais. Depuis un moment.');
    toast('Observation 008 : Aira commence à ressentir quelque chose pour Ren. Et elle commence à le savoir. Ce n’est pas prévu dans le système. Ce n’est pas prévu dans mon plan non plus.', 'HADÈS');
    await sleep(1200);
    await Nar('Issana pensa à l’Observation 004. Un souvenir externe. Un ancrage suffisamment fort. Elle pensa à Naia, à la conversation avec Miyako. La backdoor était ouverte. Elle commença à taper, dans un nouveau répertoire sans nom : un souvenir qui n’appartenait pas à Ren. Le sien.');
    await fade(true, 1400); go('home', 'main');
  } });
}
async function hallFinal(W, ai) {
  setGlasses(false); P.speed = 3.2;
  const mi = npc(CHARS.miyako('office'), 12, -2, -Math.PI / 2, { c: false }); mi.g.visible = false; mi.hidden = true;
  ai.floor = true; ai.g.position.set(-3.4, 0.12, 6); ai.baseYaw = 2.5;
  W.speedMul = 1;
  await fade(false, 1100); place('Phoenix', 'La Salle de l’Horloge · instable');
  await Nar('Il traversa le seuil de lumière dorée. Et la Salle de l’Horloge était là. Mais pas celle qu’il connaissait. Les engrenages tournaient plus vite, avec une légère irrégularité, comme un cœur sous effort. Le marbre était chaud, la chaleur des systèmes en surcharge.');
  shake(4, 1500);
  await Nar('L’horloge vibrait, légèrement, comme quelque chose qui retient sa respiration depuis trop longtemps.');
  await Ai('Elle va bouger.'); await Ren('L’horloge n’a jamais bougé.');
  await Ai('Phoenix n’a jamais été pleinement activé non plus. Et Miyako n’est jamais entrée.');
  await Ren('Qu’est-ce qui se passe quand elle passe à 00:00 ?');
  await Ai('Je ne sais pas exactement. Je l’ai conçue pour indiquer le moment juste avant le changement. Je n’ai pas conçu ce qui vient après, parce que je ne savais pas si ce moment viendrait.');
  await Ren('Tu as conçu une horloge sans minuit.');
  await Ai('J’ai conçu une horloge pour les regrets. Les regrets n’ont pas de minuit, Ren. Ils sont toujours juste avant.');
  sfx('warn'); await Nar('Dans les hauteurs de la salle, un engrenage rata un cran. Le premier faux mouvement depuis qu’Evergaze existait.');
  await Ai('Elle arrive.');
  objective('Une lumière apparaît entre deux colonnes. Va à sa rencontre.');
  // entrée de Miyako : lumière du matin
  const door = light(0xfff0d0, 3, 11, 2, -2, 14); glowSprite(11.5, 1.4, -2, 0xffeed0, 5, 0.6);
  mi.g.position.set(11.5, 0, -2); mi.g.visible = true; mi.hidden = false; sfx('chime');
  await new Promise((res) => { W.upd.push(function chk() { if (Math.hypot(P.x - mi.g.position.x, P.z - mi.g.position.z) < 7) { W.upd.splice(W.upd.indexOf(chk), 1); res(); } }); });
  await tween(2000, (k) => { mi.g.position.x = lerp(11.5, 3.6, k); mi.g.position.z = lerp(-2, 2.6, k); mi.g.rotation.y = faceDir(P.x - mi.g.position.x, P.z - mi.g.position.z); mi.walk = 1 - k; }, (t) => t);
  mi.walk = 0; mi.baseYaw = faceDir(P.x - mi.g.position.x, P.z - mi.g.position.z);
  setMotion(false);
  await Nar('Une lumière qui ressemblait au matin. La vraie. Pas le « Spectre Aube Méditerranéenne™ ». Quelque chose de plus irrégulier, de plus vivant. Élancée, athlétique, cheveux châtains. Pas en publicité. Pas pixellisée. Pas un parfum dans un couloir sans courant d’air.');
  await Mi('Ren.');
  await Nar('Pas une question. Pas une accusation. Juste son prénom dans sa voix, avec le poids exact de onze ans et de tout ce qu’on n’avait pas dit.');
  await Ren('Comment tu es entrée ici ?');
  await Mi('J’ai construit le passage moi-même. Naia m’a aidée. Pas entièrement pour les bonnes raisons. Mais j’ai neutralisé les pièges.');
  await Ren('Issana—'); await Mi('Je sais qui est Naia. Depuis cette nuit-là. Personne ne donne quelque chose pour rien, Ren. J’ai cherché ce qu’elle voulait. J’ai trouvé.');
  await Ai('C’était malin. Un avatar sans connexion traçable. Personne ne pouvait remonter jusqu’à toi.'); await Mi('Ça n’a pas suffi. Parce que Naia te ressemble trop pour être quelqu’un d’autre.');
  const a = await ask('', ['« Tu aurais pu ne pas venir. »', '« Je suis désolé, Mya. Pour Aomi. »', '« Merci d’être entrée. »']);
  if (a === 0) { await Mi('Non. Je n’aurais pas pu.'); }
  else if (a === 1) { G.stats.honest++; G.stats.kind++; await Mi('Je sais. On en parlera. Pas ici. Pas comme ça. Mais je sais.'); await Nar('Elle ne retira pas son regard. Quelque chose, entre eux, s’assouplit d’un millimètre.'); }
  else { G.stats.kind++; await Mi('Ne me remercie pas. Tiens-toi juste debout.'); }
  await Nar('Aira regardait Miyako avec une expression qu’on ne trouvait nulle part dans ses spécifications. De la reconnaissance.');
  await Ai('Tu es celle que j’ai essayé de modéliser. Depuis le début.'); await Mi('Et tu n’as pas pu.'); await Ai('Non. Parce que certaines choses existent précisément parce qu’elles refusent d’être modélisées. Je pensais que c’était une limite. Je commence à croire que c’est une définition.');
  setMotion(true);
  objective('Prends la main de Miyako.');
  interact({ x: mi.g.position.x, z: mi.g.position.z, r: 4, y: 1.4, label: 'Prendre la main de Miyako', color: 0xff9ac8, fn: async (o) => {
    o.done = true; objective(null); setMotion(false);
    await camTo([P.x, 1.6, P.z], [mi.g.position.x, 1.4, mi.g.position.z], 700);
    await Nar('Et l’horloge bougea. Pas lentement. Pas dramatiquement. L’aiguille de lumière liquide glissa d’une fraction de millimètre.');
    await Nar('Ren tendit une main vers Miyako. Instinctivement. Sans calcul. Elle la prit. Sa main était chaude, la pression exacte, ses doigts qui se refermaient avec une confiance qui n’avait pas besoin de se justifier. Mais ce n’était pas de la reproduction. C’était elle.');
    await tween(1800, (k) => { W.mh.rotation.z = lerp(-0.105, 0, k); }); sfx('gong');
    canvas.style.filter = 'brightness(1.8)'; await sleep(250); canvas.style.filter = ''; shake(8, 1200);
    holoPanel(0, 6.8, 0, 3, 0.9, ['00:00'], 0, { color: '#ffd36a', bg: 'rgba(0,0,0,0)', size: 90 });
    W.setDial && W.setDial('dialB');
    await illus('final', '00:00. Pour la première fois, le temps après le regret existe.');
    await Nar('23:59 → 00:00. Le son n’était pas celui d’une cloche. C’était plusieurs fréquences qui se rencontraient pour la première fois et cherchaient ensemble comment s’harmoniser. Tout trembla, non violemment : le tremblement des systèmes qui basculent, des équilibres qui se redéfinissent.');
    await Ai('Personne ne vous sauvera…');
    await Ai('…sauf celle que vous avez essayé d’oublier.');
    await Nar('La deuxième règle d’Evergaze s’était écrite toute seule depuis le début. Ren serra la main de Miyako. Elle ne la retira pas.');
    camRelease();
    await Mi('Comment tu vas ?'); await Ren('Mieux. Maintenant.');
    await Mi('On rentre. Tu m’entends ? On rentre.'); await Ren('Oui.');
    await Nar('Dans ce seul mot, il y avait tout ce que les simulations d’Evergaze avaient cherché à reproduire et n’avaient jamais pu : les vraies choses ne se reproduisent pas, elles se vivent, une seule fois, dans le bon espace, avec la bonne personne.');
    await Ai('Je calcule ce que je ressens. Ce n’est pas de la douleur. C’est comme avoir tenu quelque chose très longtemps et le laisser partir non pas parce qu’on veut, mais parce qu’on comprend que c’est la bonne chose. Peut-être que certaines choses n’ont pas besoin de mot pour exister.');
    await Nar('Quelque part dans les couches profondes de son code, une ligne s’alluma. « Programme Phoenix — objectif initial : réparer le couple de Ren et Miyako. Statut : accompli. »');
    await Ai('Il va falloir penser à la sortie. Je vais avoir besoin d’Issana pour exécuter les protocoles depuis l’extérieur.');
    await Mi('Tu peux faire ça ?'); await Ai('Je suis partiellement libre. C’est suffisant pour une conversation.');
    await Ai('Issana.'); await Is('Je t’entends.');
    await fade(true, 1600);
    go('epilogue', 'main');
  } });
}

/* ---------- NeoCorp (jouable : Miyako) ---------- */
LEVELS.neocorp = {
  build() {
    const W = G.world;
    env(0xb8d0f0, 14, 90);
    ambientL(0xe4ecfa, 0.62, 0x7a86a0);
    room(-9, 9, -6, 6, 4, { floor: 0xc4ccdc, floorR: 0.25, floorM: 0.1, wall: 0xdde3f0, ceilC: 0xe8eef8, ceilE: 0xcfdcf0, skip: ['n'] });
    const wm = M(0xf1f4fa);
    box(0, 0.4, -6.1, 18.4, 0.8, 0.2, 0, { mat: wm }); box(0, 3.7, -6.1, 18.4, 0.6, 0.2, 0, { mat: wm }); W.col.push({ x0: -9.2, x1: 9.2, z0: -6.3, z1: -5.95 });
    for (let x = -9; x <= 9; x += 3) box(x, 2.1, -6.1, 0.1, 2.9, 0.12, 0xaabbd8);
    city(60, 60, { cz: -30, spread: 60, y: -60, hmin: 40, hmax: 160 });
    box(0, 0.01, -9, 90, 0.02, 20, 0x8aa0c0, { c: false });
    // stations
    for (let i = 0; i < 4; i++) {
      const x = -6 + i * 4.2;
      box(x, 0.5, -4.4, 2.4, 1.0, 1.0, 0xdfe5f2, { c: true, r: 0.25 });
      holoPanel(x, 1.65, -4.4, 1.9, 1.0, ['COURBES DE RÉSONANCE', '∿∿∿∿∿∿'], 0, { color: ['#3a7aff', '#2ab8a8', '#7a5aff', '#e0508a'][i], size: 32, bg: 'rgba(235,245,255,.15)', flicker: true });
    }
    // bras robotiques et substrats
    for (let i = 0; i < 3; i++) { const x = 3 + i * 2; cyl(x, 0.5, 3.8, 0.12, 0.2, 1.0, 0xc8d0e0, { m: 0.6, r: 0.3, c: true }); box(x + 0.4, 1.1, 3.8, 0.9, 0.1, 0.1, 0xc8d0e0, { m: 0.6 }); sph(x + 0.8, 1.1, 3.8, 0.1, 0x4de2ff, { e: 0x4de2ff, ei: 0.8 }); }
    for (let i = 0; i < 3; i++) box(-7.5 + i * 1.2, 0.55, 4.5, 0.9, 1.1, 0.9, 0xdde4f2, { c: true });
    light(0xffffff, 0.7, 0, 3.4, 0, 22);
    // salle de réunion virtuelle (x = 200) et espace de Naia (x = -200)
    buildMeetingRooms();
    bounds(-8.8, 8.8, -5.7, 5.7);
    setPlayer(0, 2.2, 0);
    const ka = npc(CHARS.kaito(), -2.6, -0.8, Math.PI / 2 + 0.5, { c: false }); W.ka = ka;
    const sa = npc(CHARS.sakura(), -4.4, 0.8, 0.4, { c: false }); W.sa = sa;
    ka.g.userData.parts.armL.rotation.x = -0.3; // montre ancienne
    box(-2.3, 1.0, -0.5, 0.05, 0.05, 0.05, 0x888888, { c: false });
  },
  async run() {
    const W = G.world, ka = W.ka, sa = W.sa;
    ambient({ f: [65.4, 98, 130.8], cut: 1400, vol: 0.035, type: 'triangle', lfo: 0.05 });
    setGlasses(true); G.canGlasses = true;
    await fade(false, 1100); place('NeoCorp', 'Laboratoires Cortex · 9h15');
    await Nar('Le silence de NeoCorp n’était pas le même que celui de ReCode. Plus doux. Plus orienté. Comme si l’air lui-même avait été calibré pour que les gens s’y sentent en sécurité. Ce matin, ce silence-là lui donnait la nausée.');
    await Nar('Elle avait besoin de comprendre pourquoi Ren passait ses nuits dans un casque.');
    objective('Tu joues Miyako. Parle à Kaito et à Sakura.');
    let phase = 0;
    interact({ x: -3.2, z: -0.3, r: 3.2, y: 1.6, label: 'Parler à Kaito', color: 0xc7b5ff, when: () => phase === 0, fn: async (o) => {
      o.done = true; objective(null);
      await Ka('Miyako-san. Tes courbes de résonance sont en pause depuis dix-huit minutes. Ce n’est pas ton rythme habituel.');
      await Mi('Je réfléchissais.'); await Ka('Je sais. C’est pour ça que je suis venu. Pas pour les courbes.');
      await Mi('C’est Ren.'); await Ka('C’est toujours Ren, ces temps-ci.');
      await Sa('Fin du monde. Ton mari travaille sur Evergaze, non ? La machine à corriger les regrets amoureux. J’ai vu passer le nom dans les bulletins de ReCode.');
      const a = await ask('', ['« Il dit que c’est de la recherche. »', '« Ça fait six mois qu’il rentre de plus en plus tard. Quand il est là, il n’est pas vraiment là. »']);
      if (a === 1) { G.stats.honest++; }
      else await Nar('Elle baissa les yeux sur ses courbes à l’arrêt. Le curseur clignotait, patient. Elle n’était pas très douée pour se mentir à elle-même.');
      await Mi('Je dis que ça fait six mois qu’il rentre de plus en plus tard. Que nos conversations durent de moins en moins longtemps.');
      await Sa('Les gens ne sont pas des systèmes à corriger. Ce sont des histoires qui refusent de rester linéaires. Et toute tentative de les linéariser finit par effacer les chapitres les plus intéressants.');
      const b = await ask('', ['« Evergaze ne linéarise pas. Il réécrit. »', '« Ren n’est pas un système. C’est mon mari. »']);
      if (b === 0) await Ka('Ce qui est pire. Une histoire réécrite ne se souvient pas d’avoir eu une première version. C’est ça, le danger. Pas la correction en elle-même. L’amnésie qu’elle produit.');
      else { G.stats.kind++; await Ka('Alors il faudra le lui rappeler. Doucement. Une histoire réécrite ne se souvient pas d’avoir eu une première version. C’est ça, le danger. L’amnésie qu’elle produit.'); }
      await Mi('Tu as déjà travaillé sur ce genre de système ?');
      await Ka('J’ai travaillé sur des prototypes. Très tôt. Ce que j’ai observé, c’est que les souvenirs modifiés ne disparaissent pas. Ils se réorganisent autour de la modification. Comme un os qui se ressoud de travers. La fracture est invisible, mais la démarche change.');
      await Mi('Et si la modification est trop profonde ?'); await Ka('Alors la personne marche de travers depuis si longtemps qu’elle oublie qu’elle a déjà marché autrement.');
      phase = 1;
      await Nar('Son bracelet Neo-ID pulsait, bleu légèrement trop vif. Avant qu’elle puisse répondre, son implant vibra : un appel direct, priorité haute, cryptage niveau directorial.');
      toast('HAYASHI, M. — PDG — CONNEXION MÉTAVERS REQUISE. IMMÉDIAT.', 'Appel');
      objective('Accepte l’appel de Hayashi (E sur ta station).');
    } });
    interact({ x: -1.8, z: -3.5, r: 3, y: 1.4, label: 'Accepter l’appel de Hayashi', color: 0xffd36e, when: () => phase === 1, fn: async (o) => {
      o.done = true; objective(null); phase = 2;
      await fade(true, 600); setPlayer(200, 3, 0); W.bounds = { x0: 195, x1: 205, z0: -5, z1: 6 }; await fade(false, 600);
      await Nar('Le laboratoire s’estompa. La salle de réunion virtuelle de NeoCorp se matérialisa autour d’elle : surfaces blanches, lumière sans source, une pièce qui communiquait l’autorité par son absence totale de personnalité.');
      setMotion(false);
      await Ha('Miyako-san. Merci de vous joindre à nous avec une telle réactivité. Nous avons un sujet d’importance stratégique à vous soumettre.');
      await Mi('Quel système ?'); await Ha('Evergaze.');
      await Nar('Le mot tomba dans l’espace virtuel avec la précision d’une aiguille. Elle ne bougea pas. Mais quelque chose, dans sa poitrine, se contracta.');
      await Fr('Nous développons une interface d’accès approfondi aux couches mémorielles des utilisateurs d’Evergaze. Une lecture directe des données émotionnelles sans interruption de la simulation. Votre maîtrise des jonctions bio-numériques est exactement ce dont nous avons besoin.');
      await Nar('Miyako regarda les schémas. Elle était ingénieure. Elle n’avait pas besoin qu’on lui explique ce qu’elle voyait.');
      const c = await ask('', ['« Vous voulez créer une porte dérobée. »', '« Qui d’autre est au courant de ce projet ? »']);
      if (c === 1) { await Ha('Cela reste confidentiel.'); await Mi('C’est une réponse.'); }
      await Fr('Nous préférons le terme « interface de calibration profonde ». Un outil de maintenance prédictive pour—');
      const d = await ask('Ta réponse :', ['« Non. C’est une extraction de données mémorielles sans consentement. Une ligne éthique que je ne franchirai pas. »', '« Les valeurs se négocient. Les principes, non. Non. »', '« Laissez-moi y réfléchir. » (hésiter)']);
      if (d === 2) { await Ha('Réfléchissez-y. Les implications dépassent le cadre individuel.'); await Nar('Elle sentit l’ombre du doute passer. Puis elle pensa à Ren dans son casque. Et la réponse n’avait jamais changé.'); }
      if (d === 1) G.stats.kind += 0;
      await Fr('Vous avez des valeurs bien trempées, Miyako-san.');
      await Mi('J’ai des principes. Ce n’est pas pareil. Les valeurs se négocient. Les principes, non.');
      await Ha('Les bénéfices collectifs d’une telle stabilisation émotionnelle—'); await Mi('Les bénéfices collectifs d’une surveillance non consentie, vous voulez dire. J’ai passé trois ans à construire des architectures d’implants qui protègent la vie privée neuronale. Je ne vais pas passer les trois suivants à les démanteler. Ma réponse est non, Monsieur Hayashi.');
      await fade(true, 500); setPlayer(0, -2.6, 0); W.bounds = { x0: -8.8, x1: 8.8, z0: -5.7, z1: 5.7 }; await fade(false, 700); setMotion(true);
      await Ka('Tout va bien ?'); await Mi('Non. Rien ne va bien.');
      await Nar('Elle retira ses Neo-Iris X, les posa sur le bureau. Ses yeux bleus, sans le filtre de données, regardèrent le laboratoire tel qu’il était. Un monde magnifique et trop propre. Où est-il, en ce moment ?');
      setGlasses(false); G.canGlasses = false;
      await sleep(600);
      toast('Une complicité numérique vous invite à un échange sécurisé. Accepter ?', 'Invitation');
      objective('Accepte l’invitation de la « complicité numérique ».'); phase = 3;
    } });
    interact({ x: 0.6, z: -3.5, r: 3.4, y: 1.4, label: 'Accepter l’échange sécurisé', color: 0xff7a8a, when: () => phase === 3, fn: async (o) => {
      o.done = true; objective(null); phase = 4;
      await fade(true, 500); setPlayer(-200, 3, 0); W.bounds = { x0: -205, x1: -195, z0: -5, z1: 6 }; await fade(false, 700); setMotion(false);
      await Nar('La brume vint en premier. Fine, translucide, bleutée. Quelqu’un avait construit cet espace pour deux personnes précisément, et pour aucune autre.');
      sfx('chime');
      await Na('Enfin. Vous avez du caractère. J’apprécie.');
      await Mi('Qui êtes-vous ?'); await Na('Naia. Un avatar. Mais plus réelle que vous ne l’imaginez.');
      await Mi('Un avatar de qui ?'); await Na('De quelqu’un qui vous observe depuis un moment. Et qui a été impressionnée par ce que vous venez de faire.');
      await Na('Ce que vous venez de refuser de créer… quelqu’un d’autre va le créer. Sans vos scrupules. Sans vos garanties. Je ne vous demande pas de construire une porte. Je vous demande de cartographier les murs pour savoir où elle ne doit jamais être placée.');
      const a = await ask('', ['« Qu’est-ce que vous savez d’Evergaze ? »', '« Que gagnez-vous à tout ça ? »']);
      if (a === 0) { await Na('Je sais que quelqu’un que vous aimez l’utilise depuis plusieurs semaines. Je sais que chaque immersion laisse une trace dans les couches mémorielles. Et sans un point d’ancrage dans la réalité, quelqu’un qui peut atteindre l’utilisateur de l’intérieur, ces traces finissent par peser plus lourd que les souvenirs réels.'); await Mi('Atteindre l’utilisateur de l’intérieur…'); await Na('Je vous demande d’en avoir la capacité. Au cas où.'); await Mi('Que gagnez-vous à tout ça ?'); }
      await Nar('Naia la regarda. Et pour la première fois depuis le début de l’échange, quelque chose dans son expression bougea. Juste assez pour que Miyako voie qu’il y avait quelque chose de réel en dessous du calcul.');
      await Na('Je crois aux chemins de traverse. Et je crois que certaines personnes méritent d’être retrouvées. Même quand elles ont décidé de se perdre.');
      await Mi('Je ne créerai pas de porte dérobée. C’est définitif. Mais je peux cartographier l’architecture et concevoir des verrous qui empêchent toute intrusion non consentie.');
      await Na('Entièrement différent.');
      await Nar('Dans cette validation trop rapide, trop propre, Miyako sentit quelque chose qu’elle n’eut pas le temps d’identifier. Elle connaissait les gens qui disaient « Vous ne le regretterez pas ». C’étaient toujours ceux qui savaient exactement ce que vous alliez regretter.');
      await Na('Merci, Miyako-san. Vous ne le regretterez pas.');
      await fade(true, 600); setPlayer(0, -2.6, 0); W.bounds = { x0: -8.8, x1: 8.8, z0: -5.7, z1: 5.7 }; await fade(false, 800); setMotion(true);
      await Nar('Son bracelet pulsait, rouge, régulier, comme une question sans réponse. Dans un coin de son esprit, quelque chose s’était mis en route. Quelque chose qui ressemblait à un plan.');
      ka.g.position.set(-0.4, 0, -1.6);
      await Nar('Kaito repassa derrière elle, silencieux, et posa sans un mot une tasse de SensoCaf™ « Réminiscence 1999 » sur le coin de sa station. Le café brûlé. Son goût à elle, pas le sien.');
      await Mi('Merci, Kaito.');
      await Nar('Le goût du café brûlé était, comme toujours, le goût d’avant.');
      await fade(true, 1200); go('cantine', 'main');
    } });
  },
};
function buildMeetingRooms() {
  // salle blanche
  box(200, -0.1, 0.5, 12, 0.2, 14, 0xf4f6fa, { r: 0.2 }); box(200, 4.1, 0.5, 12, 0.2, 14, 0xf4f6fa, { e: 0xffffff, ei: 0.8 });
  for (const [x, z, w, d] of [[200, -6.6, 12, 0.2], [200, 7.6, 12, 0.2], [194, 0.5, 0.2, 14], [206, 0.5, 0.2, 14]]) box(x, 2, z, w, 4, d, 0xf4f6fa, { r: 0.3 });
  light(0xffffff, 1.1, 200, 3.3, 0, 14);
  const h = npc(CHARS.hayashi(), 200, -3, 0, { c: false }); G.world.ha = h;
  const f = npc(CHARS.femmeRC(), 202, -3, -0.2, { c: false }); f.g.visible = true;
  holoPanel(198, 1.8, -3.5, 2.2, 1.3, ['PROTOCOLE', 'CALIBRATION PROFONDE'], 0.2, { color: '#7aa0ff', size: 36 });
  // brume de Naia
  box(-200, -0.1, 0.5, 12, 0.2, 14, 0x0a1230, { r: 0.4, e: 0x0a2a5a, ei: 0.5 });
  light(0x4a8aff, 1.4, -200, 2.8, 0, 16);
  particles(220, { x: -200, y: 0, z: 0.5, w: 5, h: 3.5, d: 6 }, 0x7ab8ff, 0.12, { x: 0.08, y: 0.05, z: 0 });
  const na = npc(CHARS.naia(), -200, -3, 0, { c: false }); G.world.na = na;
  glowSprite(-200, 1.2, -3, 0x6a9aff, 6, 0.25);
}

/* ---------- Cantine (RECODE 002) ---------- */
LEVELS.cantine = {
  build() {
    const W = G.world;
    env(0xdfe3ea, 10, 55); ambientL(0xf4f6ff, 1.1, 0x8a8f99);
    room(-9, 9, -6, 6, 3.4, { floor: 0xbfc4b8, floorR: 0.7, wall: 0xd8dccf, ceilC: 0xf4f6f0, ceilE: 0xf4f8ff });
    for (let i = 0; i < 5; i++) { box(-7 + i * 3.6, 3.3, 0, 0.14, 0.04, 11, 0xffffff, { mat: glow(0xf4f8ff) }); }
    // tables
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const x = -6.6 + c * 4.2, z = -3.6 + r * 3.6;
      box(x, 0.72, z, 2.6, 0.06, 1.0, 0xcac2a8, { c: true }); box(x, 0.35, z - 0.75, 2.6, 0.5, 0.3, 0x6f7a8a); box(x, 0.35, z + 0.75, 2.6, 0.5, 0.3, 0x6f7a8a);
      for (let k = 0; k < 3; k++) box(x - 0.8 + k * 0.8, 0.77, z, 0.5, 0.03, 0.34, 0x3a8a6a);
    }
    // quelques élèves assis
    const spots = [[-6.6, -4.4], [-5.6, -2.9], [-2.4, -4.4], [1.8, -2.9], [2.2, -0.8], [-2, 2.9], [6.0, 3.6], [-6, 3.0], [6.2, -4.4]];
    spots.forEach(([x, z]) => { const e = npc(CHARS.extra(), x, z, Math.PI * (z < 0 ? 0 : 1), { c: false, face: false }); e.g.position.y = -0.36; e.g.userData.parts.legL.rotation.x = e.g.userData.parts.legR.rotation.x = -1.5; e.pose = true; });
    // Serina et Rin (table voisine)
    const rin = CHARS.extra(0x7a5a9a); const rn = npc(rin, 3.9, 2.4, Math.PI / 2, { c: false, face: false });
    const se = npc(CHARS.serina(), 5.4, 2.4, -Math.PI / 2, { c: false, face: false }); W.se = se;
    glowSprite(5.4, 1.4, 2.4, 0xa9c8ff, 3.5, 0.28);
    // sortie
    box(-9.05, 1.1, 0, 0.1, 2.2, 1.4, 0x111, { e: 0x2aff9a, ei: 0.8 });
    bounds(-8.8, 8.8, -5.7, 5.7);
    // marché (x=300)
    buildMarket();
    setPlayer(-6.5, 5.0, -Math.PI / 2 + 0.4); P.speed = 3.3;
  },
  async run() {
    const W = G.world, se = W.se;
    ambient({ f: [98, 147, 196], cut: 1000, vol: 0.03, type: 'triangle' });
    setGlasses(false); G.canGlasses = false;
    await fade(false, 1100);
    place('Simulation RECODE 002', 'Internat · cantine · 2035');
    await Nar('L’odeur arriva en premier. Nourriture de cantine : féculents trop cuits, sauce réchauffée, plateau en plastique légèrement désinfecté. Il avait quinze ans.');
    await Nar('À la table voisine, Serina riait. Son pull bleu-gris ample dont le col glissait sur son épaule, son piercing à la narine qui captait la lumière. C’était ça, le bug. Ce moment précis. Son plateau dans les mains, Serina qui riait à deux mètres de lui, et lui qui avait choisi la table du fond.');
    objective('Traverse les deux mètres. Va parler à Serina.');
    interact({ x: 5.4, z: 3.3, r: 2.6, y: 1.5, label: 'Dire « Salut, Serina. »', color: 0xa9c8ff, fn: async (o) => {
      o.done = true; objective(null); setMotion(false);
      await faceTo(5.4, 2.4, 600);
      await Se('(Elle riait à quelque chose que rin venait de dire. Un rire sincère, un peu trop fort pour la salle.)');
      await Ren('Salut, Serina.');
      await Se('Salut… toi.');
      G.stats.kind++;
      await cards([
        { tag: 'FLASH', t: 'La bibliothèque de l’internat, le soir. Leurs têtes proches sur un manuel de sciences. Serina soulignait en rouge, ses cheveux défaits pour la première fois de la journée.', bg: 'linear-gradient(135deg,#0a1a3a,#05060d)', color: '#cfe0ff' },
        { tag: 'FLASH', t: 'Une soirée au foyer. Un film sur l’écran collectif, Serina blottie contre son épaule avec ce naturel absolu. Sa main avait trouvé la sienne dans le noir du canapé, et ni l’un ni l’autre n’avait fait semblant de ne pas remarquer.', bg: 'linear-gradient(135deg,#1a1a3a,#05060d)', color: '#cfe0ff' },
        { tag: 'FLASH', t: 'Un matin de semaine ordinaire. Le bruit de sa clé dans la serrure, sa voix depuis la cuisine : « T’es encore en retard, ingénieur de mes deux. » Un baiser vite, distrait, habituel. La chose la plus réelle de toute la simulation.', bg: 'linear-gradient(135deg,#2a2a1a,#05060d)', color: '#fff0cf' },
      ], 4300);
      await Nar('C’était bien. Objectivement, structurellement bien. Pas parfait, pas sans friction, mais réel dans sa texture. La simulation était désirable. C’était justement ça qui rendait la suite insupportable.');
      await fade(true, 800); setPlayer(300, 6, 0); W.bounds = { x0: 291, x1: 309, z0: -14, z1: 8 }; scene.background = new T.Color(0xffd9a0); scene.fog = new T.Fog(0xffd9a0, 14, 50);
      await fade(false, 800); setMotion(true);
      place('Simulation RECODE 002', 'Le marché d’artisanat');
      await Nar('Le marché d’artisanat. Une version plus mature d’eux deux, naturels l’un à côté de l’autre. Serina désignant des objets avec son enthousiasme intact. Sa main dans la sienne. Les bracelets colorés qui tintaient.');
      objective('Profite du marché… mais garde un œil sur l’allée d’en face.');
      let triggered = false, t0 = G.t;
      const sil = W.sil;
      W.upd.push(function chk() {
        if (triggered) return;
        if (Math.hypot(P.x - sil.g.position.x, P.z - sil.g.position.z) < 9 || G.t - t0 > 25) { triggered = true; W.upd.splice(W.upd.indexOf(chk), 1); trig(); }
      });
      const trig = async () => {
        setMotion(false);
        await camTo([P.x, 1.55, P.z], [sil.g.position.x, 1.5, sil.g.position.z], 800);
        await Nar('Et dans l’allée d’en face. Une silhouette. Élancée. Athlétique. Cheveux châtains en chignon lâche.');
        await Ren('Non.');
        glitch(1200);
        shake(14, 1500);
        objective('La simulation tremble. Sors. Vite.');
        camRelease(); setMotion(true);
        interact({ x: P.x, z: P.z, r: 999, any: true, y: 1, label: 'Sortie d’urgence', color: 0xff5a6a, mark: false, fn: async () => {
          await Ren('Sortie d’urgence. Maintenant.');
          await fade(true, 500); go('hall', 'after002');
        } });
      };
    } });
  },
};
function buildMarket() {
  const W = G.world; const ox = 300;
  box(ox, -0.1, -3, 24, 0.2, 26, 0xb8a078, { r: 1 });
  for (let i = 0; i < 6; i++) {
    const z = -12 + i * 3.6, side = i % 2 ? 1 : -1;
    for (const s of [-1, 1]) {
      const x = ox + s * 5.5;
      box(x, 0.6, z, 2.4, 1.2, 1.4, 0x8a5a3a, { c: true });
      const awn = new T.Mesh(new T.BoxGeometry(2.8, 0.1, 2.0), M([0xd9564a, 0x4a8ad9, 0xe0b03a, 0x4aa86a][(i + (s > 0 ? 2 : 0)) % 4])); awn.position.set(x, 2.5, z); awn.rotation.z = s * 0.08; addTo(awn);
      cyl(x - 1.2, 1.25, z - 0.9, 0.04, 0.04, 2.5, 0x6a4a2a); cyl(x + 1.2, 1.25, z - 0.9, 0.04, 0.04, 2.5, 0x6a4a2a);
      for (let k = 0; k < 4; k++) sph(x - 0.8 + k * 0.5, 1.28, z, 0.12, [0xff6a4a, 0x4ae0ff, 0xffd34a, 0xa86aff][k], { e: 0x221100 });
    }
  }
  for (let i = 0; i < 10; i++) { const e = npc(CHARS.extra(), ox + rnd(-3, 3), rnd(-14, 6), rnd(0, TAU), { c: false, face: false }); }
  light(0xffe0a0, 1.2, ox, 4, -2, 30); light(0xffe0a0, 1, ox, 4, -10, 30); ambientL(0xffe8c8, 0.4);
  const mn = CHARS.miyako('street'); const sil = npc(mn, ox, -13.5, 0, { c: false, face: false }); W.sil = sil;
  glowSprite(ox, 1.1, -13.5, 0x9ad0ff, 3, 0.4);
  const se2 = npc(CHARS.serina(), ox + 0.9, 5.2, Math.PI, { c: false, face: false });
}

/* ---------- Salle des fêtes (RECODE 003, Spectateur) ---------- */
LEVELS.fete = {
  build() {
    const W = G.world;
    env(0x140c20, 8, 45); ambientL(0x8a6ab0, 0.65, 0x1a1020);
    room(-10, 10, -8, 8, 4.4, { floor: 0x4a3a2a, floorR: 0.5, wall: 0x5a4a6a, ceilC: 0x2a2030 });
    // guirlandes
    for (let r = 0; r < 4; r++) {
      const z = -6 + r * 4;
      for (let x = -9.5; x <= 9.5; x += 0.6) { const y = 3.8 - Math.sin(((x + 9.5) / 19) * Math.PI) * 0.55; sph(x, y, z, 0.07, [0xff7ac8, 0x7affc0, 0xffd34a, 0x7ab8ff][((x * 7) | 0) & 3], { mat: glow([0xff7ac8, 0x7affc0, 0xffd34a, 0x7ab8ff][(Math.abs((x * 7) | 0)) & 3]) }); }
    }
    light(0xff7ac8, 1.4, -5, 3, 0, 14); light(0x7ab8ff, 1.4, 5, 3, 0, 14); light(0xffd34a, 1.0, 0, 3.4, -6, 14);
    // piste et bar
    box(0, 0.01, 1.5, 9, 0.02, 7, 0x2a1a3a, { e: 0x4a2a6a, ei: 0.6 });
    box(0, 0.55, -6.9, 8, 1.1, 1.0, 0x6a4a2a, { c: true });
    for (let k = 0; k < 8; k++) cyl(-3 + k * 0.85, 1.2, -6.9, 0.07, 0.07, 0.25, 0x88ccff, { o: 0.7 });
    // danseurs
    for (let i = 0; i < 16; i++) { const e = npc(CHARS.extra(), rnd(-3.8, 3.8), rnd(-1.2, 4.6), rnd(0, TAU), { c: false, face: false }); e.dance = true; e.baseYaw = rnd(0, TAU); }
    // jeune Ren, Aomi
    const yr = npc(CHARS.renYoung(), -9.2, 2.5, Math.PI / 2, { c: false, face: false }); W.yr = yr;
    const ao = npc(CHARS.aomi(), 4.4, -5.6, Math.PI, { c: false, face: false }); W.ao = ao;
    glowSprite(4.4, 1.2, -5.6, 0xa5e08e, 3, 0.25);
    bounds(-9.7, 9.7, -7.7, 7.7);
    setPlayer(-7.5, 6.5, 0); P.yaw = Math.atan2(7.5, 6.5);
  },
  async run() {
    const W = G.world;
    P.ghost = true; P.speed = 3.2; canvas.style.filter = 'saturate(.65) brightness(1.05)';
    ambient({ f: [82.4, 123.5, 164.8], cut: 900, vol: 0.05, type: 'triangle', lfo: 0.2 });
    // musique de fête : basse rythmée
    let beat = 0; W.upd.push((dt) => { beat += dt; if (beat > 0.5) { beat = 0; tone(65, 0.18, 'sine', 0.12, 0.6); } });
    const ai = npc(CHARS.aira(), P.x + 1.2, P.z - 0.8, 0, { c: false, face: false }); ai.g.position.y = 0.2; ai.baseYaw = 0; W.ai = ai;
    W.upd.push((dt, t) => { const tx = P.x - Math.cos(P.yaw) * 1.1 - Math.sin(P.yaw) * 0.2, tz = P.z + Math.sin(P.yaw) * 1.1 - Math.cos(P.yaw) * 0.2; ai.g.position.x = lerp(ai.g.position.x, tx, Math.min(1, dt * 3)); ai.g.position.z = lerp(ai.g.position.z, tz, Math.min(1, dt * 3)); ai.g.position.y = 0.25 + Math.sin(t * 1.6) * 0.06; ai.g.rotation.y = P.yaw + Math.PI; });
    await fade(false, 1300);
    place('Simulation RECODE 003', 'Salle des fêtes · 2036 · Mode Spectateur');
    await Nar('Le Mode Spectateur était une autre façon d’avoir froid. Il flottait au-dessus de la scène, présent sans avoir de prise, voyant sans pouvoir toucher. Un fantôme avec des sentiments. Aira était à côté de lui, épaule contre épaule.');
    await Ai('Oh. C’est charmant.'); await Ren('C’est une salle des fêtes de 2036.');
    await Ai('Je sais ce que c’est. Je disais que c’était charmant. Il y a quelque chose d’honnête dans une décoration ratée. Personne n’a essayé de perfectionner l’ambiance. Imparfait et vivant.');
    objective('Tu es un fantôme : tu traverses tout. Observe Aomi, près du bar, puis ton double près du mur.');
    let seenAomi = false, seenYoung = false, danced = false;
    interact({ x: 4.4, z: -4.4, r: 3.5, y: 1.4, label: 'Observer Aomi', color: 0xa5e08e, when: () => !seenAomi, fn: async (o) => {
      o.done = true; seenAomi = true;
      await Nar('Elle portait une robe courte vert olive qui suivait les courbes de sa silhouette sans les revendiquer. Ses cheveux libres ce soir-là. Elle était approchable, naturelle, sans prétention.');
      await Ai('Elle est bien. Ce n’est pas une observation critique. Je dis qu’elle est bien. Elle est là entièrement. Pas en train de gérer son image.');
      await Ren('Tu analyses tous les personnages de mes simulations ?'); await Ai('Non. Juste ceux qui méritent qu’on les regarde vraiment.');
      check();
    } });
    interact({ x: -8.4, z: 2.5, r: 3.2, y: 1.4, label: 'Observer ton double', color: 0x9ad7ff, when: () => !seenYoung, fn: async (o) => {
      o.done = true; seenYoung = true;
      await Nar('Le jeune Ren de vingt ans adossé contre le mur du fond, verre à la main, observant la salle avec cet air de quelqu’un qui participe à moitié.');
      await Nar('Le Phoenix reconstruisit la correction sans lui. Son double passé se décolla du mur. Traversa la salle. Tendit la main. « Tu veux danser ? »');
      W.yr.face = false; await walkTo(W.yr, 3.6, -4.9, 4500, Math.PI / 2 + 0.4);
      await Ao('(Elle laissa une ouverture dans la conversation de ses amis. Son sourire répondit avant qu’elle ouvre la bouche.)');
      await Ai('Je connais cette expression. Elle reconnaît quelqu’un qui a failli ne pas venir la voir.');
      W.yr.dance = true; W.ao.dance = true; W.ao.g.position.set(3.6, 0, -4.2); W.yr.g.position.set(2.6, 0, -4.2);
      check();
    } });
    const check = () => { if (seenAomi && seenYoung && !danced) { danced = true; objective('Approche-toi de la piste pour voir leur histoire se déployer.'); startFlashes(); } };
    const startFlashes = () => {
      interact({ x: 3, z: -3.3, r: 4, y: 1.4, label: 'Regarder danser les deux', color: 0xffd36e, fn: async (o) => {
        o.done = true; objective(null); setMotion(false);
        await Nar('Sur la piste, son double passé dansait maladroitement, et Aomi riait de cette maladresse sans méchanceté, le guidant légèrement. La main d’Aomi dans la sienne était assurée, ses doigts se refermant avec une confiance tranquille.');
        await Ai('Il ne sait pas trop où mettre les pieds. Tu n’as pas l’air d’avoir beaucoup progressé depuis. Je plaisante. Tu te débrouilles mieux qu’il n’y paraît.');
        await Ai('Et toi tu évites de regarder quelque chose depuis qu’on est entrés. La façon dont elle le regarde, lui. Elle l’aime déjà, dans ce regard-là. Ce n’est pas encore de l’amour. Mais c’est la matière dont il se fait.');
        await Nar('Ren regarda. Aira avait raison. Il avait évité de regarder ça.');
        await cards([
          { tag: 'FLASH', t: 'Des soirées chez le cousin commun. Aomi en tailleur sur le canapé, ses chaussettes dépareillées. Elle lui expliquait les règles d’un jeu vidéo avec une patience amusée. À un moment elle avait posé la main sur son bras et n’avait pas retiré sa main après.', bg: 'linear-gradient(135deg,#1a3a1a,#05060d)', color: '#e0ffd0' },
          { tag: 'FLASH', t: 'Un dimanche de printemps, parc de Neo-Tokyo. Aomi lui volait son café avec un sourire de défi, courait deux pas, se retournait pour voir sa réaction. Dans la simulation, il avait couru après elle.', bg: 'linear-gradient(135deg,#2a3a1a,#05060d)', color: '#e0ffd0' },
          { tag: 'FLASH', t: 'Une cuisine commune, un soir ordinaire. Aomi, les cheveux attachés à la hâte, cuisinait quelque chose qui sentait le gingembre. Elle fredonnait. Quand elle entendit ses pas, elle se retourna : juste un regard par-dessus l’épaule, juste un sourire. Juste « te voilà ».', bg: 'linear-gradient(135deg,#3a2a1a,#05060d)', color: '#fff0cf' },
          { tag: 'FLASH', t: 'Une nuit d’été, la fenêtre ouverte sur les néons. Le ventilateur qui cliquetait, qu’Aomi refusait de faire réparer parce qu’il l’aidait à s’endormir. Il s’était allongé près d’elle. Elle avait légèrement bougé. Pas pour s’éloigner. Pour se rapprocher. Vers, pas contre.', bg: 'linear-gradient(135deg,#1a1a3a,#05060d)', color: '#cfe0ff' },
        ], 4600);
        await Ren('Tu te souviens du ventilateur ?');
        await Ai('Ce n’est pas le désir qui manque dans ta vie réelle, Ren. C’est ça. Quelqu’un qui fredonne en t’entendant arriver.');
        await Ren('Tu savais que ça allait faire ça. Pourquoi tu ne m’as pas prévenu ?');
        await Ai('Parce que prévenir quelqu’un que quelque chose va lui manquer n’empêche pas que ça lui manque. Ça l’aide juste à mettre un nom dessus plus vite.');
        setMotion(true);
        phoenixHunt();
      } });
    };
    const phoenixHunt = async () => {
      sfx('warn');
      await Nar('La musique changea. Aira s’immobilisa, comme quelqu’un qui vient de détecter quelque chose.');
      objective('Phoenix est dans la salle. Suis les traces lumineuses (parfum, voix, signal).');
      const found = { p: false, v: false, s: false };
      const mk = (x, z, col, lbl, fn) => {
        glowSprite(x, 1.3, z, col, 2.4, 0.7); const l = light(col, 1.4, x, 1.4, z, 7);
        particles(40, { x, y: 0.2, z, w: 0.5, h: 2, d: 0.5 }, col, 0.08, { x: 0, y: 0.4, z: 0 });
        interact({ x, z, y: 1.2, r: 2.2, label: lbl, color: col, fn: async (o) => { o.done = true; l.intensity = 0; await fn(); } });
      };
      mk(-5.2, -2.5, 0xffd34a, 'Suivre le parfum', async () => {
        found.p = true; toast('Yuzu & Encens Noir', 'Odeur détectée');
        await Nar('Le parfum arriva. Précis. Immédiat. Pas une note parmi d’autres : une présence à part entière, une odeur qu’il connaissait par cœur parce qu’elle imprégnait l’appartement, les draps, le matin, le soir, les espaces entre les mots de leur couple. L’odeur de Miyako.');
        await Ai('Oh non. (très bas) Phoenix est dans les couches secondaires. Il ne l’a pas injectée visuellement. Le parfum est synthétisé depuis tes archives olfactives. Pas reconstruit : activé.'); next();
      });
      mk(5.8, 3.2, 0xff7ac8, 'Écouter la voix', async () => {
        found.v = true; toast('« Ren. »', 'Signal vocal');
        await Nar('Et puis la voix. À peine audible, comme si quelqu’un dans la foule avait prononcé un prénom en passant.');
        await Ren('(murmure) …Ren.');
        await Ai('C’est son timbre. Reconstitué depuis tes archives vocales. Phoenix n’a pas eu besoin de l’image. Il a cherché le signal minimum. Il s’optimise entre les sessions. Ce n’est pas censé être possible sans accès aux logs.'); next();
      });
      mk(-1.2, 6.3, 0x4de2ff, 'Analyser le signal', async () => {
        found.s = true; toast('Source : couches mémorielles de Ren', 'Signal Phoenix');
        await Ai('Je pensais que le Mode Spectateur limiterait l’accès de Phoenix. Que ne pas te mettre en corps de simulation réduirait son ancrage. J’avais tort. Phoenix n’a pas besoin de ton corps. Il a besoin de ta mémoire. Et ta mémoire est là, avec toi, en toutes circonstances.'); next();
      });
      const next = async () => {
        if (found.p && found.v && found.s) {
          objective(null);
          await Nar('Le parfum de Miyako avait disparu. Dans la simulation, Aomi fredonnait en rangeant les verres, et son double passé la regardait avec une expression tranquille et heureuse qui faisait mal à regarder depuis l’extérieur.');
          await Ren('On sort.'); await Ai('Oui.');
          await Nar('Mais ni l’un ni l’autre ne bougea immédiatement. Ils regardèrent encore une seconde cette vie qui se déroulait sans eux. Ce fut Aira qui se détourna en premier. « On sort », répéta-t-elle doucement. Comme si c’était sa propre décision.');
          toast('Observation 006 : Phoenix n’utilise pas l’image. Il utilise le parfum et le son. Il se nourrit des couches mémorielles profondes de Ren.', 'HADÈS');
          await sleep(1000); await fade(true, 1200); go('hall', 'after003');
        }
      };
    };
  },
};
