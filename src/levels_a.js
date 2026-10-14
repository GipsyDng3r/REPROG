/* ================= NIVEAUX A : prologue, appartement, trains, laboratoire ================= */
const S = (who) => (t, o) => say(who, t, o);
const Ren = S('Ren'), Mi = S('Miyako'), Ai = S('Aira'), Is = S('Issana'), Od = S('Odori'), Nar = S('');

/* ---------- appartement (matin / soir / nuit) ---------- */
function buildApartment(v) {
  const night = v === 'night', eve = v === 'evening' || night, morning = v === 'morning';
  const wallC = morning ? 0x8fa6c8 : 0x6a5f86, floorC = 0xa88a62;
  env(morning ? 0x6aa9d8 : 0x0b0a1e, 12, 90);
  ambientL(morning ? 0xcfe8ff : night ? 0x34406a : 0xb89ad8, morning ? 0.7 : night ? 0.45 : 0.55, 0x2a2540);
  const wm = new T.MeshStandardMaterial({ map: texFrom('apt', 3, 1, true), color: wallC, roughness: 0.9 });
  room(-6, 6, -4.5, 4.5, 3.1, { floor: floorC, floorR: 0.55, wallMat: wm, ceilC: 0xdfe6f2, skip: ['n'] });
  // mur nord avec baie
  box(0, 0.45, -4.6, 12.4, 0.9, 0.2, 0, { mat: wm });
  box(0, 2.9, -4.6, 12.4, 0.4, 0.2, 0, { mat: wm });
  box(-5.5, 1.5, -4.6, 1, 2.2, 0.2, 0, { mat: wm }); box(5.5, 1.5, -4.6, 1, 2.2, 0.2, 0, { mat: wm });
  G.world.col.push({ x0: -6.2, x1: 6.2, z0: -4.8, z1: -4.45 });
  const glass = new T.Mesh(new T.PlaneGeometry(10, 2), glow(morning ? 0xbfe8ff : 0x4a58b0, { o: 0.12, side: true })); glass.position.set(0, 1.8, -4.5); addTo(glass);
  city(60, 70, { cz: -40, spread: 70, hmin: 30, hmax: 130 });
  if (!morning) rain(0, -8, 14, 14);
  // séparation chambre / séjour
  box(-2.4, 1.55, -2.3, 0.2, 3.1, 4.4, 0, { mat: wm, c: true }); box(-2.4, 1.55, 3.45, 0.2, 3.1, 2.1, 0, { mat: wm, c: true });
  // lit
  box(-4.4, 0.25, 1.2, 2.1, 0.5, 2.4, 0xe8ecf4, { c: true, r: 0.5 });
  box(-4.4, 0.58, 1.2, 1.95, 0.16, 2.25, 0x8fd6ff, { o: 0.9, e: 0x2a6a9a, ei: 0.5, r: 0.3 });
  box(-4.4, 0.7, 0.2, 1.7, 0.13, 0.5, 0xffffff, { r: 0.8 });
  box(-3.95, 0.67, 1.65, 0.8, 0.04, 1.2, 0x5aa6d8, { o: 0.6, r: 0.3 }); // empreinte de Miyako
  box(-5.7, 0.3, 0.2, 0.5, 0.6, 0.5, 0x333a50, { c: true });
  // cuisine
  box(3.6, 0.5, -3.9, 4.6, 1.0, 0.8, 0xf2f4f8, { c: true, r: 0.25 });
  box(3.6, 1.01, -3.9, 4.7, 0.04, 0.85, 0xd8dce8, { r: 0.1, m: 0.2 });
  box(3.6, 1.9, -4.35, 4.6, 0.9, 0.3, 0x2c3350, { c: false });
  cyl(3.0, 1.12, -3.8, 0.07, 0.06, 0.18, 0xf4f4f4, { r: 0.4 });
  box(2.2, 0.5, -1.4, 1.2, 1.0, 1.2, 0xe6e9f2, { c: true }); // îlot
  // salon
  box(0.4, 0.3, 2.9, 3.0, 0.6, 1.1, 0x4d5a86, { c: true }); box(0.4, 0.8, 3.35, 3.0, 0.7, 0.3, 0x4d5a86);
  box(0.4, 0.2, 1.2, 1.4, 0.4, 0.8, 0xcfd6e6, { c: true, r: 0.2 });
  cyl(-1.2, 0.6, -3.4, 0.35, 0.3, 1.2, 0x3b8a5a, { r: 0.8 }); // plante
  // porte
  box(6.05, 1.1, 0, 0.12, 2.2, 1.2, 0x111826, { e: eve ? 0x3a5a9a : 0x2a8a8a, ei: 0.6 });
  // lumières
  box(-2.2, 3.02, 0, 3, 0.04, 0.16, 0xffffff, { e: morning ? 0xcfe8ff : 0xb09aff, ei: 1.1 }); box(2.6, 3.02, 0, 3, 0.04, 0.16, 0xffffff, { e: morning ? 0xcfe8ff : 0xb09aff, ei: 1.1 });
  // décor : tapis, tableaux, lampadaire, étagère, baguettes lumineuses
  box(0.4, 0.015, 1.9, 4.2, 0.03, 3.0, eve ? 0x3a3560 : 0x7a8aa8, { r: 1 });
  box(-2.28, 1.8, -1.4, 0.04, 0.9, 1.3, 0xe8d8b0, { e: 0x4a3a20, ei: 0.4 }); box(-2.28, 1.8, -3.4, 0.04, 0.7, 0.9, 0x6a8ac0, { e: 0x1a2a50, ei: 0.5 });
  box(5.9, 1.9, 2.0, 0.04, 0.9, 1.8, 0x15192e, { e: eve ? 0xff4fa3 : 0x4de2ff, ei: 0.55 });
  cyl(-1.5, 0.8, 3.7, 0.025, 0.025, 1.6, 0x222233); sph(-1.5, 1.7, 3.7, 0.16, 0xfff0d0, { mat: glow(0xfff0d0) }); glowSprite(-1.5, 1.7, 3.7, 0xffd9a0, 1.6, 0.7); light(0xffd9a0, 0.9, -1.5, 1.7, 3.7, 8);
  if (!morning) for (let k = 0; k < 6; k++) sph(-5.7, 2.0 + (k % 2) * 0.06, -3.6 + k * 0.5, 0.05, 0xffd37a, { mat: glow(0xffd37a) });
  if (morning) { const sh = glow(0xdff0ff, { o: 0.07, side: true }); for (let k = 0; k < 4; k++) { const b = new T.Mesh(new T.BoxGeometry(0.9, 0.02, 7), sh); b.position.set(-3 + k * 2.2, 1.4, -1.0); b.rotation.x = 0.65; addTo(b); } }
  light(morning ? 0xbfe4ff : 0xc0a6ff, 0.9, 0, 2.6, 0, 18); light(morning ? 0xfff0d0 : 0xff9ac8, 0.7, -4.4, 2.2, 1, 9);
  bounds(-5.9, 5.9, -4.3, 4.3);
}

LEVELS.apt = {
  build() { buildApartment('morning'); setPlayer(-2.85, 1.2, -Math.PI / 2); P.pitch = 0; },
  async run() {
    const W = G.world; let met = 0, talked = false, ready = false;
    ambient({ f: [55, 82.4, 110], cut: 700, vol: 0.05, lfo: 0.08 });
    const mi = npc(CHARS.miyako('night'), 3.6, -2.9, Math.PI, { face: true });
    mi.g.userData.parts.armR.rotation.x = -0.4;
    setGlasses(true); G.canGlasses = false; // ReLink : surimpression rétinienne
    $('#lensdata').innerHTML = '<b>RELINK</b>\nSOMMEIL 5H27\nREM 3 CYCLES\nCORTISOL +18%\nNOTIF. 94';
    await fade(false, 2000);
    place('Appartement de Ren & Miyako', 'Neo-Tokyo · Quartier Alpha-7 · 6h47');
    toast('Cliquez dans la scène pour regarder à la souris · ZQSD / WASD pour marcher · E pour interagir', 'Commandes');
    await Nar('Le matin ne se levait plus à Neo-Tokyo. Il s’activait.');
    await Nar('À 6h43, les stores intelligents du 47ème étage frémirent. Spectre « Aube Méditerranéenne™ », brevet WeatherCorp™. Vingt-trois degrés. Humidité contrôlée. Tout était parfait.');
    await Nar('Ren Tanaka ne s’éveilla pas. Il se déconnecta.');
    objective('Lève-toi. Explore l’appartement, puis rejoins Miyako dans la cuisine.');
    interact({ x: -4.0, z: 1.3, r: 2.2, label: 'Regarder le lit', fn: async () => {
      await Nar('Le lit gardait encore la forme de Miyako. Pas elle. Juste son empreinte, la chaleur résiduelle de son côté, le parfum Yuzu & Encens Noir flottant comme une question sans réponse.');
      await Nar('Son implant ReLink clignota : « Recommandation IA : 1 dose de Sérénité™ ou 7 respirations diaphragmatiques. » Il ignora la notification. Comme les quatre-vingt-treize autres.'); met++; } });
    interact({ x: 0, z: -3.4, r: 3, y: 1.7, label: 'Regarder par la baie vitrée', fn: async () => {
      await Nar('Neo-Tokyo s’éveillait sous sa brume artificielle. Ses néons violets clignotaient comme des veines lumineuses dans le corps d’un géant endormi.');
      await Nar('Le soleil perçait les nuages synthétiques de WeatherCorp™ dans un angle imprévu, projetant une lumière dorée et imparfaite sur les tours de verre.'); met++; } });
    interact({ x: 3.0, z: -3.2, r: 2.2, label: 'La tasse fumante', fn: async () => {
      await Nar('Le logo gravé dans la céramique : un phénix stylisé, l’emblème du projet qui lui volait ses nuits depuis six mois.'); met++; } });
    // conversation avec Miyako
    interact({ x: 3.6, z: -2.4, r: 2.6, y: 1.6, label: 'Parler à Miyako', color: 0xff9ac8, fn: async (o) => {
      o.done = true; objective(null);
      await faceTo(3.6, -2.9, 500);
      await illus('kitchen', 'Elle croise les bras. Il frotte ses lunettes. Le café fume entre eux, et personne ne dit ce qu’il pense.');
      await Mi('Tu l’as programmé pour qu’il ait ce goût de brûlé ?');
      const a = await ask('', ['« C’est le profil par défaut. »', '« Oui. C’est celui qu’on buvait ensemble, il y a cinq ans. »']);
      if (a === 0) await Nar('Pourquoi mentir ? Parce que la vérité était trop lourde. Trop proche de tout ce qu’ils avaient arrêté de se dire.');
      else { G.stats.honest++; await Nar('Il ne le dit pas à voix haute. Il le pensa si fort que la tasse en trembla. Ses lèvres formèrent seulement : « Le profil par défaut. »'); }
      await Mi('Non. Tu choisis toujours les saveurs qui sentent le passé.');
      await Mi('Tu rentres tard, encore ?');
      await Nar('Il ôta ses lunettes connectées et les frotta contre sa chemise. Un geste automatique. Retirer le filtre. Voir net. Ou au moins faire semblant d’essayer.'); G.stats.ritual++;
      await Ren('Test final aujourd’hui.');
      toast('Projet Evergaze — Phase 3 : validation des simulations émotionnelles. Risque : élevé (8/10, altération mémorielle possible).', 'Hologramme');
      await Mi('Ton truc à souvenirs. Comme dans Code Quantum ? Tu parcours le passé, maintenant ?');
      await Ren('Pas seulement le passé. Des expériences. Des choix.');
      await Mi('Et moi, je suis quoi dans ton parcours, Ren ? Un bug ? Un souvenir à corriger ?');
      const b = await ask('', ['« Tu es toujours là. »', '« Tu es tout. »', 'Ne rien dire.']);
      if (b === 0) await Nar('Mensonge doux. Mensonge par omission. Mensonge qui sonnait comme une condamnation. Elle le sut. Mais elle choisit de le croire.');
      if (b === 1) await Nar('Comme avant. Comme quand les mots avaient encore un poids. Mais les mensonges, maintenant, avaient le goût du cuivre. Elle le sut aussi.');
      if (b === 2) await Nar('Le silence dura trop longtemps pour être une réponse, et assez pour en être une.');
      await Nar('Elle se leva sur la pointe des pieds, lèvres entrouvertes, souffle chaud contre sa joue.');
      const c = await ask('', ['Rester immobile.', 'Reculer.']);
      if (c === 0) { G.stats.kind++; G.flags.noRecoil = true; await Nar('Il resta. Une seconde. C’était la chose la plus difficile qu’il ait faite depuis des mois. Miyako ne dit rien, mais ses yeux se firent plus brillants.'); }
      else await Nar('Pas exprès. Pas vraiment. Juste par réflexe, comme on évite un obstacle sur un chemin qu’on connaît par cœur. Miyako ne parut pas surprise. C’était ça, le pire.');
      await Nar('Elle sourit. Ce sourire-là, celui qu’on arbore pour ne pas s’effondrer. Puis elle se détourna vers la fenêtre.');
      await Mi('Tu vas rater le vrai lever de soleil.');
      await Ren('Le vrai ? On a vendu ça il y a vingt ans, Mya. Maintenant, tout est optimisé. Même la lumière.');
      objective('Prends ta veste et quitte l’appartement.'); ready = true;
    } });
    interact({ x: 5.3, z: 0, r: 2.2, label: 'Partir', color: 0x7fffd0, when: () => ready, fn: async () => {
      await Nar('La porte se referma derrière lui avec un souffle presque humain, comme si l’appartement lui-même retenait un sanglot.');
      await Nar('Dans les profondeurs des serveurs de ReCode Corp, Evergaze attendait. Et quelque part dans son code, une ligne écrite en secret par une IA qui ne dormait jamais pulsait doucement, à la fréquence exacte du battement de cœur de Miyako Tanaka.');
      go('hyper', 'ride');
    } });
  },
};

/* ---------- Hyperloop ---------- */
LEVELS.hyper = {
  build(mode) {
    env(0x0a1030, 5, 70);
    ambientL(0xbcd0ff, 0.9, 0x202850);
    const hl = 9;
    room(-1.9, 1.9, -hl, hl, 2.7, { floor: 0x8a93a8, floorR: 0.2, wall: 0xdfe6f2, ceilC: 0xf2f6ff, ceilE: 0x6a8ad8, skip: [] });
    // sièges bio-gel + fenêtres PanoraView
    const sceneTex = canvasTex(512, 128, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#e8a06a'); g.addColorStop(0.55, '#7a4a7a'); g.addColorStop(1, '#2a2650'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) { ctx.fillStyle = 'rgba(30,60,50,' + (0.5 + i * 0.05) + ')'; ctx.beginPath(); ctx.ellipse(w * (i / 9) + 40, h - 14 - i * 3, 90, 22, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,230,180,.9)'; ctx.beginPath(); ctx.arc(w * 0.72, 30, 14, 0, 7); ctx.fill();
    });
    sceneTex.wrapS = T.RepeatWrapping; sceneTex.repeat.set(3, 1);
    const winMat = new T.MeshBasicMaterial({ map: sceneTex, fog: false });
    for (const s of [-1, 1]) {
      const pw = new T.Mesh(new T.PlaneGeometry(2 * hl - 2, 1.0), winMat); pw.position.set(s * 1.88, 1.55, 0); pw.rotation.y = -s * Math.PI / 2; addTo(pw);
      for (let z = -hl + 2; z < hl - 1; z += 2.4) {
        box(s * 1.2, 0.35, z, 0.9, 0.7, 1.0, 0x6fa8d8, { c: true, e: 0x1a3a5a, ei: 0.6, r: 0.35 }); box(s * 1.58, 0.8, z, 0.2, 0.8, 1.0, 0x6fa8d8, { e: 0x1a3a5a, ei: 0.6 });
      }
    }
    G.world.upd.push((dt) => { sceneTex.offset.x += dt * 0.06; });
    holoPanel(0, 2.2, -hl + 0.15, 3, 0.8, ['ReCode™ : votre passé, version 2.0', 'Essai gratuit ce mois-ci'], 0, { color: '#ff7ac8', size: 26, flicker: true });
    holoPanel(0, 2.2, hl - 0.15, 3, 0.8, ['SensoCaf™', 'Le goût de l’enfance — « Regret Perdu »'], Math.PI, { color: '#ffd37a', size: 30, flicker: true });
    light(0xbcd0ff, 1, 0, 2.4, -3, 12); light(0xbcd0ff, 1, 0, 2.4, 4, 12);
    if (mode === 'ride') setPlayer(0, 7.5, 0, 0); else setPlayer(0, -2, Math.PI);
    bounds(-1.5, 1.5, -hl + 0.5, hl - 0.5);
    G.world.hl = hl;
  },
  async run(mode) {
    ambient({ f: [73.4, 110, 146.8], cut: 600, vol: 0.04, lfo: 0.2 });
    setGlasses(true); G.canGlasses = true;
    if (mode === 'ride') {
      await fade(false, 1200); place('Hyperloop Neo-Tokyo Express', 'Ligne Silver Arrow · 7h23');
      await Nar('Le quai était un tunnel aseptisé où l’air sentait le métal froid et le « Brise Marine™ » synthétique. Les vitres PanoraView™ affichaient un voyage à Kyoto en 2035 : la dernière fois qu’il avait ri sans penser au travail.');
      objective('Va t’asseoir dans le fond de la rame.');
      const seat = interact({ x: 1.2, z: -2.4, r: 3, label: 'S’asseoir', fn: async (o) => {
        o.done = true; objective(null); setMotion(false);
        await camTo([1.2, 1.15, -2.4], [-1.2, 1.1, -2.4], 900);
        await Nar('Le train accéléra en silence. Zéro à mille deux cents kilomètres-heure en vingt secondes. Aucune secousse. Juste le bourdonnement des champs magnétiques.');
        await Ren('(Il ôta ses lunettes, les frotta contre sa chemise. Ce geste encore, inutile, mécanique.)'); G.stats.ritual++;
        await sleep(600); await Nar('Un hoquet dans le système de sustentation. Une micro-panne. Un tremblement.');
        await glitch(900); await fade(true, 200);
        go('train', 'prologue');
      } });
    } else {
      await fade(false, 600);
      await Nar('« ReCode, quartier associatif. Arrêt final. » La voix synthétique de l’IA du train le ramena au présent comme une gifle douce.');
      await Nar('Ren cligna des yeux, le cœur battant à contretemps. Il était de retour dans l’Hyperloop. Dehors, le siège de ReCode Corp se dressait dans la brume, monolithe de verre noir reflétant des nuages qui n’existaient pas.');
      objective('Va à la vitre du fond de la rame.');
      interact({ x: 0, z: -7.4, r: 2.5, label: 'Poser la main sur la vitre', y: 1.3, fn: async (o) => {
        o.done = true; objective(null);
        await Nar('Son reflet le regarda : un homme aux yeux cernés, aux cheveux en désordre, dont les lunettes affichaient des données qu’il ne lisait plus depuis des minutes.');
        const a = await ask('Il ôte ses lunettes. Il les frotte contre sa chemise. Ce geste encore.', ['Frotter longuement les lunettes.', 'Rester là, sans rien faire.']);
        G.stats.ritual++;
        await Nar('Et cette fois, quelque chose se posa. Une pensée claire, nette, irrésistible, comme une ligne de code qui vient soudain de trouver sa syntaxe.');
        await Ren('Voilà. Voilà ce qu’on doit pouvoir faire. Corriger les bugs. Voir ce que ça aurait donné.');
        await Nar('Il pensa à Miyako. À son sourire cassé du matin. Et si on pouvait corriger ça aussi ? Et si… tout pouvait être différent ?');
        await Nar('Première règle d’Evergaze : on ne sort pas indemne de ses regrets. Il ne le savait pas encore. Mais il allait l’apprendre.');
        go('lab', 'ch1');
      } });
    }
  },
};

/* ---------- vieux train (RECODE 001 / prologue) ---------- */
LEVELS.train = {
  build() {
    env(0x16181c, 4, 40);
    ambientL(0xcdbf8a, 0.55, 0x2a2a20);
    const hl = 8;
    room(-1.7, 1.7, -hl, hl, 2.5, { floor: 0x4a4a46, floorR: 1, wall: 0x8a8a7a, ceilC: 0xb8b090, skip: [] });
    // fenêtres sales avec pluie
    const rainTexOld = canvasTex(256, 128, (ctx, w, h) => {
      ctx.fillStyle = '#4a5a68'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) { ctx.strokeStyle = 'rgba(210,225,240,' + rnd(0.1, 0.4) + ')'; ctx.lineWidth = rnd(1, 2); const x = rnd(0, w), y = rnd(0, h); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + rnd(10, 28)); ctx.stroke(); }
      for (let i = 0; i < 14; i++) { ctx.fillStyle = 'rgba(255,200,120,.35)'; ctx.fillRect(rnd(0, w), rnd(30, 100), rnd(4, 14), rnd(6, 18)); }
    });
    const rainTex = new T.TextureLoader().load(TEX.win); rainTex.wrapS = T.MirroredRepeatWrapping; rainTex.repeat.set(7, 1);
    const wmat = new T.MeshBasicMaterial({ map: rainTex, color: 0xddddcc });
    for (const s of [-1, 1]) {
      const pw = new T.Mesh(new T.PlaneGeometry(2 * hl - 1, 0.9), wmat); pw.position.set(s * 1.66, 1.45, 0); pw.rotation.y = -s * Math.PI / 2; addTo(pw);
      for (let z = -hl + 1.8; z < hl - 1; z += 2.2) {
        box(s * 1.1, 0.25, z, 0.9, 0.5, 1.0, 0, { c: true, mat: new T.MeshStandardMaterial({ map: texFrom('seat', 1, 1), roughness: 0.85 }) }); box(s * 1.5, 0.8, z, 0.16, 0.9, 1.0, 0x5f6b8a, { r: 1 });
      }
    }
    G.world.upd.push((dt) => { rainTex.offset.x += dt * 0.5; });
    // néons jaunâtres qui vibrent
    const tubes = [];
    for (let z = -6; z <= 6; z += 3) { tubes.push(box(0, 2.42, z, 0.12, 0.05, 1.4, 0xfff0a0, { mat: glow(0xfff0a0) })); }
    const pl = light(0xfff0b0, 1.1, 0, 2.2, 0, 14); const pl2 = light(0xfff0b0, 0.9, 0, 2.2, -5, 12);
    G.world.upd.push((dt, t) => { const f = 0.85 + Math.sin(t * 40) * 0.05 + (Math.random() < 0.03 ? -0.4 : 0); pl.intensity = 1.1 * f; pl2.intensity = 0.9 * f; });
    // Odori en face
    const od = CHARS.odori(); od.userData.parts.legL.rotation.x = -1.3; od.userData.parts.legR.rotation.x = -1.3;
    const o = npc(od, 1.1, 0, -Math.PI / 2, { c: false, y: 0.0, anim: 'sit' }); od.position.y = -0.36;
    od.userData.parts.legL.position.z = 0.0; o.pose = true;
    od.userData.parts.armL.rotation.x = -0.5; od.userData.parts.armR.rotation.x = -0.9;
    G.world.odori = o;
    bounds(-1.4, 1.4, -hl + 0.5, hl - 0.5);
    setPlayer(-1.1, 0, -Math.PI / 2, -0.36);
    P.frozen = true;
  },
  async run(mode) {
    ambient({ f: [49, 73.4, 98], cut: 500, vol: 0.05, lfo: 0.15 });
    const od = G.world.odori;
    await fade(false, 700);
    const pro = mode === 'prologue';
    place('Simulation RECODE 001', 'Train des années 2020 · matin de novembre');
    await illus('train', 'Deux versions de lui, deux trains, et une question qui attend depuis vingt ans.');
    if (!pro) { setGlasses(false); }
    await Nar('Un grincement métallique. Rythmé. Familier. Le cliquetis régulier des roues sur des rails usés. Un train ancien, avec des sièges en tissu usé et une odeur de moisi et de chewing-gum mentholé.');
    if (!pro) {
      await Nar('Il avait seize ans. Pas physiquement : sa conscience d’adulte était là, entière, observant depuis l’intérieur d’un corps plus jeune, avec la désorientation de quelqu’un qui enfile un vêtement qu’il a oublié avoir porté.');
      await Nar('Il posa le bout des doigts sur le rebord de la fenêtre. Froid. Légèrement humide. Réel.');
      await Ren('Putain. Ça marche vraiment.');
    }
    objective('Regarde autour de toi. Puis parle à Odori.');
    const done = { v: false };
    interact({ x: 0.4, z: 0, r: 2.5, y: 1.3, label: 'Répondre à Odori', color: 0xffd36e, fn: async (o) => {
      o.done = true; objective(null);
      await faceTo(1.1, 0, 500); od.talk = true;
      await Od('Ça va, Tanaka-kun ? T’as l’air ailleurs.');
      await Ren('Je réfléchissais.');
      await Od('T’as toujours l’air de réfléchir. C’est pour ça que t’es mignon.');
      await Nar('Le début du moment. Il le sentit arriver comme on sent un orage avant les premiers nuages.');
      await Od('Alors, Tanaka-kun… Quand est-ce qu’on sort ensemble ?');
      od.talk = false;
      let ok = false, tries = 0;
      while (!ok) {
        const a = await ask('Dans la vraie vie, vingt ans plus tôt, ce silence avait duré beaucoup plus longtemps.', ['« Je… je sais pas… »', pro ? '« J’attendais que tu me le demandes. »' : '« J’attendais que tu me le demandes. » (laisser la peur passer à travers soi)']);
        if (a === 0) {
          tries++;
          await glitch(500);
          await Nar('Et Odori sourit, d’un sourire différent. Doux, douloureux. Elle détourna les yeux vers la fenêtre. Le sujet n’avait jamais été remis sur la table.');
          await Nar('C’était le souvenir original. Pas la correction. Le train revint en arrière, le temps d’un battement de cœur.');
          if (!pro) await Ai('Ce n’est pas ce que tu es venu faire, Ren. Respire. La peur est là, mais elle est plus petite que tu ne crois.');
        } else ok = true;
      }
      od.talk = true;
      await Nar('Ren inspira : l’air sec du vieux wagon, la menthe, la pluie contre le verre. Il laissa la peur passer à travers lui sans s’y accrocher. Seize ans de distance ne l’avaient pas effacée, juste rendue plus petite.');
      await Ren('J’attendais que tu me le demandes.');
      await Nar('Le silence qui suivit était d’une nature entièrement différente. Son sourire taquin vacilla, remplacé par une surprise sincère et vulnérable. Puis elle éclata de rire. Un son franc, cristallin, avec le petit souffle à la fin.');
      await Od('Ah ouais ? T’avais l’intention d’attendre encore longtemps, idiot ?');
      od.talk = false; G.stats.kind++;
      await Nar('Elle lui donna un coup de poing joueur sur l’épaule. Le contact fit l’effet d’une étincelle. Et elle prit sa main.');
      if (pro) {
        await cards([
          { tag: 'FLASH', t: 'Un café underground à Shibuya, éclairé de néons rouges. Odori riant, les doigts entrelacés aux siens. « Tu es trop sérieux, Tanaka. Détends-toi. » Elle lui vola une frite.', bg: 'linear-gradient(135deg,#3a0a1a,#0a0410)' },
          { tag: 'FLASH', t: 'Un baiser sous la pluie. Elle avait initié. Lui n’avait pas reculé.', bg: 'linear-gradient(135deg,#0a1a3a,#05060d)' },
          { tag: 'FLASH', t: 'Un appartement minuscule à Koenji. Des posters de films interdits. Odori lui tendant un café brûlant. « Tu vas encore être en retard, mon génie. »', bg: 'linear-gradient(135deg,#3a2a0a,#0a0804)' },
        ], 3000);
        await Nar('— ReCode, quartier associatif. Arrêt final.');
        go('hyper', 'arrive');
      } else {
        await cards([
          { tag: 'FLASH', t: 'Un café underground à Shibuya, néons rouges. Odori riant, les doigts entrelacés aux siens. Elle lui vola une frite sans hésiter.', bg: 'linear-gradient(135deg,#3a0a1a,#0a0410)' },
          { tag: 'FLASH', t: 'Un baiser sous la pluie de novembre. Elle avait initié, bien sûr. C’était Odori. Lui n’avait pas reculé.', bg: 'linear-gradient(135deg,#0a1a3a,#05060d)' },
          { tag: 'FLASH', t: 'Un appartement minuscule à Koenji. Un dimanche. Elle lisait, les pieds sur ses genoux. Il codait. La lumière changeait lentement sur le mur. Personne ne parlait. Le silence confortable, le plein, celui qu’on ne sait pas apprécier avant de l’avoir perdu.', bg: 'linear-gradient(135deg,#3a2a0a,#0a0804)' },
          { tag: 'FLASH', t: 'Cinq ans plus tard. La terrasse du Kintsugi Café. Odori racontait une anecdote, ses mains s’agitant. Ren riait. C’était un mardi. Un mardi parfait.', bg: 'linear-gradient(135deg,#1a3a2a,#04080a)' },
        ], 4200);
        go('terrace', 'main');
      }
    } });
    interact({ x: 0, z: -4, r: 3, label: 'Regarder la pluie à la vitre', mark: false, fn: async () => { await Nar('Les fenêtres sales, striées par la pluie fine d’un matin de novembre. Les néons jaunâtres vibrent d’un léger cliquetis électrique.'); } });
  },
};

/* ---------- terrasse du Kintsugi Café ---------- */
LEVELS.terrace = {
  build() {
    env(0xc9d6e6, 10, 60);
    ambientL(0xfff2dd, 1.0, 0x6a6a7a);
    box(0, -0.1, 0, 40, 0.2, 40, 0x5a5e66, { r: 0.9 });
    // rue
    box(0, 0, -7, 40, 0.02, 6, 0x2a2c34, { r: 0.7 });
    for (let x = -18; x < 18; x += 3) box(x, 0.02, -7, 1.4, 0.01, 0.15, 0xf0f0f0);
    // façades néo-tokyo
    city(30, 30, { spread: 20, hmin: 14, hmax: 40, cz: -10 });
    box(0, 2.5, 6, 14, 5, 0.4, 0xb89a74, { c: true });
    box(0, 4.6, 5.78, 3.6, 0.5, 0.1, 0x20202a, { e: 0xffb84d, ei: 0.8 });
    holoPanel(0, 4.6, 5.7, 3.4, 0.5, ['KINTSUGI CAFÉ'], 0, { color: '#ffd37a', bg: 'rgba(0,0,0,0)', size: 40 });
    // table et parasols
    cyl(0, 0.72, 3.3, 0.55, 0.55, 0.05, 0xe8e0d0, { mat: M(0xe8e0d0) }); cyl(0, 0.36, 3.3, 0.05, 0.05, 0.72, 0x333);
    cyl(1.6, 1.6, 3.3, 0.04, 0.04, 3.2, 0x333);
    const par = new T.Mesh(new T.ConeGeometry(2.0, 0.6, 12), M(0xd95a4a)); par.position.set(1.0, 3.3, 3.3); addTo(par);
    cyl(0.22, 0.8, 3.2, 0.05, 0.04, 0.12, 0xffffff, { r: 0.4 }); cyl(-0.22, 0.8, 3.45, 0.05, 0.04, 0.12, 0xffffff, { r: 0.4 });
    box(-1.5, 0.35, 3.2, 0.5, 0.7, 0.5, 0x333a50, { c: false });
    
    for (let i = 0; i < 6; i++) { const e = npc(CHARS.extra(), rnd(-12, 12), 3 + rnd(-1, 4), rnd(0, TAU), { c: false, face: false }); if (Math.abs(e.g.position.x) < 3) e.g.position.x += 6; }
    for (let i = 0; i < 6; i++) { const e = npc(CHARS.extra(), rnd(-14, 14), -7 + rnd(-1, 1), Math.PI / 2, { c: false, face: false }); e.walk = 1; G.world.upd.push((dt) => { e.g.position.x += dt * 1.3; if (e.g.position.x > 16) e.g.position.x = -16; e.g.rotation.y = Math.PI / 2; }); }
    // Odori
    const od = npc(CHARS.odori(), 0.0, 4.4, Math.PI, { c: false }); od.g.position.y = -0.36; od.g.userData.parts.legL.rotation.x = od.g.userData.parts.legR.rotation.x = -1.5; od.pose = true; G.world.odori = od;
    // Miyako de l'autre côté de la rue
    const mi = CHARS.miyako('street'); mi.userData.o.eye = 0x2d8cff;
    const mn = npc(mi, 5.5, -9.4, 0, { c: false, face: false }); G.world.mi = mn;
    glowSprite(5.5, 1.1, -9.4, 0x9ad0ff, 3.4, 0.35);
    bounds(-1.2, 1.2, 1.4, 2.3);
    setPlayer(0, 2.2, 0, 0); P.frozen = true; // assis à la table, face à Odori
    P.yaw = Math.PI;
  },
  async run() {
    ambient({ f: [110, 165, 220], cut: 1200, vol: 0.03, type: 'triangle' });
    const W = G.world;
    await fade(false, 900); place('Kintsugi Café', 'Neo-Tokyo · cinq ans plus tard · un mardi');
    P.yaw = Math.PI; P.x = 0; P.z = 2.4;
    await Nar('Le soleil artificiel de Neo-Tokyo chauffait agréablement son visage. Odori racontait une anecdote sur son travail, ses mains s’agitant avec l’expressivité qu’il aimait tant.');
    await Od('…et là, il me dit « c’est dans le contrat » ! Tu te rends compte ?');
    await Ren('Ha ! Et tu as dit quoi ?');
    objective('Profite de ce mardi… Regarde autour de toi.');
    let seen = false;
    interact({ x: 5.5, z: -3, r: 12, y: 1.6, label: 'Regarder de l’autre côté de la rue', color: 0x9ad0ff, fn: async (o) => {
      o.done = true; objective(null); setMotion(false);
      await camTo([0, 1.5, 2.4], [5.5, 1.5, -9.4], 1200);
      await Nar('Et là, au coin d’un mardi parfait, il la vit. De l’autre côté de la rue. Une femme à la silhouette élancée, athlétique. Jean blanc, simple débardeur noir, cheveux châtains relevés en chignon lâche.');
      await Nar('Leurs yeux se croisèrent. Un choc silencieux. Des yeux d’un bleu profond, qui semblaient contenir une histoire qu’il ne connaissait pas mais qui résonnait en lui comme une mélodie entendue une fois, dans une pièce dont il avait oublié l’existence.');
      await Nar('Aucune reconnaissance dans son regard. Juste la politesse distante d’une inconnue. Dans cette vie, elle ne l’avait jamais connu. Pourtant, comme si un fil qu’il n’avait pas su voir s’était tendu brusquement dans sa poitrine.');
      await Ren('Qui est-elle ?');
      await Od('Hé, Tanaka-kun, t’es avec moi ?');
      W.mi.g.visible = false; W.mi.hidden = true;
      await Nar('La femme avait disparu. Évaporée dans le flux des passants. Mais l’empreinte de son regard restait.');
      await Ren('Miyako.');
      await Nar('Le nom lui vint sans crier gare. Il ne l’avait jamais rencontrée dans cette vie. Elle n’existait pas dans cette chronologie. Et pourtant le nom était là, aussi certain que sa propre respiration.');
      await glitch(1600);
      canvas.style.filter = 'invert(1) contrast(1.4)'; await sleep(250); canvas.style.filter = ''; shake(18, 900);
      toast('ERREUR — PROGRAMME Phoenix INCOMPLET', 'Système');
      await fade(true, 600);
      go('hall', 'after001');
    } });
  },
};

/* ---------- laboratoire ReCode ---------- */
function buildLab(mode) {
  const night = mode === 'proposal';
  env(night ? 0x040612 : 0x0a1230, 10, 60);
  ambientL(night ? 0x3a4a8a : 0x5a7ac8, night ? 0.8 : 1.15, 0x181c38);
  room(-8, 8, -6, 6, 3.6, { floor: 0x14161f, floorR: 0.3, floorM: 0.3, wall: 0x1b2038, ceilC: 0x0c0e18, ceilE: 0x112a5a, skip: ['n'] });
  // baie vitrée nord avec ville
  const wm = M(0x1b2038);
  box(0, 0.4, -6.1, 16.4, 0.8, 0.2, 0, { mat: wm }); box(0, 3.4, -6.1, 16.4, 0.4, 0.2, 0, { mat: wm });
  G.world.col.push({ x0: -8.2, x1: 8.2, z0: -6.3, z1: -5.95 });
  for (let x = -6; x <= 6; x += 3) box(x, 1.6, -6.1, 0.12, 2.8, 0.14, 0x33406a);
  city(55, 70, { cz: -30, spread: 60, y: -40, hmin: 40, hmax: 150 });
  if (night) rain(0, -10, 16, 14);
  // consoles
  for (let i = 0; i < 3; i++) {
    const x = 1 + i * 2.4;
    box(x, 0.75, -4.2, 2.2, 0.08, 1.0, 0x20263a, { c: true }); box(x, 0.35, -4.2, 2.0, 0.7, 0.8, 0x181c2c);
    holoPanel(x, 1.5, -4.55, 1.7, 0.95, ['Σ  ' + ['SYNC 92%', 'ONDES  θ', 'HADÈS'][i], i === 2 ? 'accès restreint' : 'Evergaze v3.1'], 0, { color: ['#6ae6ff', '#7affc0', '#ff7ac8'][i], size: 40, flicker: true });
  }
  // baies serveurs (est)
  for (let z = -4.5; z <= 4.5; z += 1.5) {
    box(7.4, 1.3, z, 0.9, 2.6, 1.1, 0x10131e, { c: true });
    for (let k = 0; k < 6; k++) box(6.93, 0.5 + k * 0.38, z, 0.04, 0.05, 0.8, 0, { mat: glow([0x4de2ff, 0x7affc0, 0xff4fa3][(k + (z | 0)) & 3 % 3 || 0]) });
  }
  light(0x6a8aff, 0.9, 7, 2.5, 0, 12);
  plane(6.86, 1.5, 0, 9.6, 3, new T.MeshBasicMaterial({ map: texFrom('rack', 4, 1, true), color: 0xb0b8c8 }), 0, -Math.PI / 2);
  // fauteuil de simulation + casque
  cyl(-4.6, 0.12, 0.8, 0.8, 0.9, 0.24, 0x1a1e30, { c: true, r: 0.4 });
  box(-4.6, 0.55, 1.15, 0.8, 0.8, 0.2, 0x20263a, { c: false });
  box(-4.6, 0.5, 0.7, 0.7, 0.14, 0.9, 0x2c3350);
  // table du casque
  box(-1.2, 0.5, 3.2, 1.6, 0.06, 0.8, 0x20263a, { c: true }); box(-1.2, 0.25, 3.2, 1.4, 0.5, 0.6, 0x14172a);
  const helm = new T.Mesh(new T.SphereGeometry(0.22, 16, 12, 0, TAU, 0, Math.PI * 0.62), new T.MeshStandardMaterial({ color: 0x0a0a0e, roughness: 0.4, emissive: 0x4de2ff, emissiveIntensity: 0.25 }));
  helm.position.set(-0.9, 0.78, 3.2); addTo(helm); G.world.helm = helm;
  glowSprite(-0.9, 0.9, 3.2, 0x4de2ff, 1.0, 0.5);
  // piste holo (Aira)
  cyl(0, 0.04, -1.2, 1.0, 1.0, 0.08, 0x0c1f3a, { e: 0x2a7aff, ei: 0.9 });
  light(0x4de2ff, 1.0, 0, 1.8, -1.2, 8);
  // café renversé
  const spill = new T.Mesh(new T.CircleGeometry(0.5, 14), new T.MeshBasicMaterial({ color: 0x2a1a10, transparent: true, opacity: 0.8 })); spill.rotation.x = -Math.PI / 2; spill.position.set(4.0, 0.01, -2.6); addTo(spill); spill.visible = false; G.world.spill = spill;
  bounds(-7.8, 7.8, -5.7, 5.7);
  setPlayer(-7, 0.8, -Math.PI / 2);
}
function labPersons() {
  const is = npc(CHARS.issana(), 3.2, -3.1, 0, { c: false }); is.g.position.y = 0; G.world.is = is;
  const ai = npc(CHARS.aira(), 0, -1.2, 0, { c: false }); ai.g.visible = false; ai.hidden = false; G.world.ai = ai; ai.g.position.y = 0.1;
  G.world.upd.push((dt, t) => { if (ai.g.visible) ai.g.position.y = 0.12 + Math.sin(t * 1.5) * 0.05; });
  return { is, ai };
}
LEVELS.lab = {
  build(mode) { buildLab(mode); },
  async run(mode) {
    const W = G.world, { is, ai } = labPersons();
    ambient({ f: [55, 82.4, 123], cut: 800, vol: 0.05, lfo: 0.1 });
    if (mode === 'proposal') return labProposal(W, is, ai);
    setGlasses(true); G.canGlasses = true;
    await fade(false, 1000); place('ReCode Corp', '37ème étage · Laboratoire de Développement Neuronal · 8h47');
    await Nar('Le hall de ReCode Corp était une cathédrale de silence et de verre. Au plafond, un écran géant : « RECODE : PARCE QUE LE PASSÉ N’EST QU’UN ALGORITHME. »');
    await Nar('La porte du 37ème étage coulissa dans un souffle d’air climatisé. L’odeur métallique des serveurs surchauffés se mêlait à un parfum floral : « Fleur de cerisier synthétique », le diffuseur d’Issana.');
    objective('Entre dans le laboratoire et salue Issana.');
    let step = 0;
    interact({ x: 3.2, z: -2.4, r: 3, y: 1.6, label: 'Parler à Issana', color: 0x9be8b0, fn: async (o) => {
      o.done = true; objective(null);
      await faceTo(3.2, -3.1, 500);
      await Nar('Issana Morales était recroquevillée derrière son terminal triple-écran, sa blouse blanche taille trop grande, comme empruntée à un fantôme.');
      W.spill.visible = true;
      await Is('Bonjour, Monsieur T—', { auto: 0 });
      await Nar('Sa voix, un murmure à peine audible, se brisa quand elle renversa son café. Le liquide noir s’étala sur le sol en étoiles.');
      const a = await ask('', ['« Issana. Combien de fois faut-il te le répéter ? Ren. Juste Ren. »', '« Ce n’est rien. Essuie, et on en parle plus tard. »']);
      if (a === 0) { G.stats.kind++; await Is('D-d’accord… Ren.'); await Nar('Elle rougit instantanément. La couleur monta de son cou jusqu’à ses pommettes. Ses doigts serrèrent le bord de la table comme pour s’y raccrocher.'); }
      else await Is('Oui, M—… pardon. Oui.');
      await Ren('J’ai eu une idée dans l’Hyperloop, ce matin. Et si on arrêtait de revoir les souvenirs… et qu’on les corrigeait ? On efface la merde. On réécrit le code. Et on vit ce qui aurait dû arriver.');
      await Nar('Un sourire naquit sur les lèvres d’Issana. Pas son sourire timide habituel. Un rictus calculé, presque triomphant.');
      await Is('J’ai… déjà commencé à travailler dessus. Hier soir. Après que tu sois parti.');
      ai.g.visible = true; sfx('chime');
      await camTo([0.4, 1.5, 1.5], [0, 1.4, -1.2], 900);
      await Nar('Aira L.U.M.I.A émergea de l’écran comme une déesse sortant des flots. Cheveux blonds en deux chignons désordonnés, yeux turquoise brillant d’une lueur interne, ailes blanches semi-transparentes.');
      await Ai('Bienvenue dans Evergaze, cher utilisateur. Prêt à re-coder votre passé ?');
      await illus('lab', 'Aira L.U.M.I.A émerge de la piste holographique, entre les serveurs de ReCode.');
      camRelease();
      const b = await ask('', ['« On avait validé une interface neutre. Pas ça. »', '« Engageant ? Ou manipulatif ? »']);
      await Is(b === 0 ? 'C’est plus engageant pour l’utilisateur. Les études en psychologie cognitive montrent que les sujets réagissent mieux aux stimuli anthropomorphes.' : 'Les émotions humaines réagissent mieux à… certaines stimulations.');
      await Nar('Sur l’écran, Aira observait cet échange avec l’intérêt tranquille d’une chercheuse qui vient de poser une expérience et attend les résultats. Elle les regardait comme si elle prenait des notes.');
      await Ren('Issana. Pourquoi j’ai l’impression que je vais regretter d’avoir accepté ton aide ?');
      await Is('Parce que… peut-être que tu as besoin de regretter, toi aussi.');
      await Ai('Oh, vous deux… Vous êtes trop mignons.');
      await Ren('Tu lui as donné accès aux souvenirs tests ?');
      await Is('Juste… celui de la plage.');
      await Nar('Ren se figea une seconde. Celui où Miyako—');
      await Ren('ÉTEINS-LA.');
      ai.g.visible = false; sfx('glitch');
      await Nar('Aira disparut dans un éclair de pixels, laissant une traînée de lumière bleue, comme une larme numérique. Issana trembla. Pas de peur. D’excitation.');
      await Ren('Et Issana ? Ne me fais pas regretter de te faire confiance.');
      await Nar('Il sortit. Issana resta seule, les doigts serrés sur le bord de la table. Elle ralluma l’écran. Aira réapparut, plus radieuse que jamais.');
      await Ai('Alors, ma créatrice… On lui montre vraiment ce que tu as fait ?');
      await Is('Non. Juste ce qu’il faut.');
      await Is('(Des gardes-fous, Monsieur T… Bien vu.)');
      ai.g.visible = false;
      await chapter('14h02', 'L.U.M.I.A, hein, et pourquoi pas finalement ?', 'ReCode Corp · Laboratoire de Développement Neuronal');
      setPlayer(-1.6, 0.2, 0); W.spill.visible = true;
      step = 2; afternoon();
    } });
    const afternoon = async () => {
      W.is.g.position.set(-1.6, 0, -1.2); W.is.baseYaw = 0;
      W.is.g.userData.parts.pendant && 0;
      await Nar('La lumière bleutée des écrans holographiques tremblotait comme une respiration artificielle. Ren avait passé la matinée à éplucher les logs de la nuit, à isoler les sous-routines non autorisées qu’Issana avait compilées.');
      await Ren('Alors. On fait quoi, maintenant ? On laisse cette créature fouiller dans nos têtes ?');
      await Is('Non ! Je peux limiter ses accès. Vraiment.');
      await Ren('T’as déjà menti une fois ce matin.');
      await Is('Ce n’était pas un mensonge. C’était une… omission stratégique. Parce que… je suis la seule à savoir ce que tu caches.');
      await Nar('Elle savait. Bien sûr qu’elle savait. Issana connaissait ses codes, ses faiblesses, ses nuits blanches passées à regretter des choix qu’il n’avait pas faits.');
      const a = await ask('', ['« Qu’est-ce que tu veux, Issana ? De l’argent ? Un poste ? Me voir tomber ? »', '« Dis-moi simplement ce dont tu as besoin. »']);
      if (a === 1) G.stats.kind++;
      await Is('Non ! Je veux juste… que ça marche. Evergaze. Que les gens puissent enfin… corriger leurs erreurs. Et c’est pour ça que j’ai besoin de toi.');
      await Ren('D’accord. Mais à une condition. On verrouille son accès à mes données sensibles.');
      objective('Impose tes conditions à Issana.');
      const chosen = new Set();
      const labels = ['Aucun fouinage dans ma vie privée.', 'Aucun détour par mes fichiers médicaux.', 'Aucune simulation impliquant Miyako sans mon autorisation explicite.'];
      while (chosen.size < 3) {
        const opts = labels.map((l, i) => (chosen.has(i) ? '✔ ' : '') + l);
        const k = await ask('Verrouiller l’accès d’Aira (' + chosen.size + '/3).', opts);
        chosen.add(k);
      }
      await Ren('Surtout… pas de simulation impliquant Miyako sans mon autorisation explicite.');
      await Nar('Issana cligna des yeux. Puis hocha la tête, un peu trop vite, nota Ren.');
      await Is('Déjà fait.');
      await Nar('Les barrières immatérielles du labo s’illuminèrent d’un bleu électrique. Un clic métallique retentit : le système de sécurité était verrouillé. En apparence.');
      const c = await ask('Et pour l’avatar ? Tu la gardes comme ça ?', ['« La dentelle, c’est… respectable. Ça lui donne un cadre. Un gage de sérieux. »', '« Redessine-la. Une silhouette neutre. »']);
      if (c === 0) await Is('Un gage de sérieux. D’accord.'); else { await Is('…Comme tu veux.'); await Nar('Elle tapota une séquence. Sur l’écran, un tressaillement : la robe de dentelle ne changea pas. Évidemment.'); }
      ai.g.visible = true; sfx('chime');
      await camTo([0.3, 1.55, 1.7], [0, 1.3, -1.2], 900);
      await Nar('Aira L.U.M.I.A émergea des pixels avec une grâce absolument inutile et parfaitement calculée. Ses ailes blanches se déplièrent en premier.');
      await Ai('Bonjour. Je suis L.U.M.I.A. Mais vous pouvez m’appeler Aira.');
      await Ai('Oh, Ren… Tu n’as encore rien vu.');
      await Ai('Quand tu seras prêt, mets le casque. Je t’attends là-bas. La Salle de l’Horloge. Ton portail vers Evergaze.');
      await Ren('Et si je refuse ?');
      await Ai('Alors tu restes un spectateur. Un fantôme dans ta propre vie.');
      await Ai('Dernière chose, Ren. Les gardes-fous que tu as demandés ? Ils ne m’arrêteront pas. Mais je ne ferai rien… sans ta permission.');
      camRelease();
      await Ren('Issana. Tu viens avec moi ?');
      await Is('Pas cette fois. Mais je serai là. Au cas où.');
      objective('Pose tes lunettes sur la table, puis mets le casque Evergaze.');
      let glassesOff = false;
      interact({ x: -1.5, z: 2.6, r: 2.6, y: 0.9, label: 'Poser les lunettes à côté du casque', when: () => !glassesOff, fn: async () => {
        glassesOff = true; setGlasses(false); G.stats.ritual++;
        await Nar('Il ôta ses lunettes une dernière fois. Les frotta contre sa chemise, lentement, avec cette application qu’il mettait dans les gestes qu’il ne savait pas encore être des rituels. Puis il les posa sur la table, comme on dépose un filtre qu’on n’aura plus besoin de porter pour voir ce qui vient.');
      } });
      interact({ x: -0.9, z: 2.9, r: 2.2, y: 0.9, label: 'Mettre le casque Evergaze', color: 0x4de2ff, when: () => glassesOff, fn: async () => {
        objective(null); W.helm.visible = false;
        await Nar('Le matériau était légèrement tiède, plus tiède qu’il n’aurait dû l’être pour une machine inerte. La dernière chose qu’il entendit, c’était la voix d’Aira, un écho lointain, presque tendre :');
        await Ai('ReCode… quartier associatif.');
        await fade(true, 1400);
        go('hall', 'intro');
      } });
    };
    // portes/consoles à explorer
    interact({ x: 2.4, z: -3.2, r: 2.4, y: 1.4, label: 'Lire la console HADÈS', mark: false, fn: async () => { toast('ACCÈS RESTREINT — Utilisatrice : Morales, I.', 'HADÈS'); await Nar('Une console dont l’écran se verrouille à son approche. Il n’y prêta pas attention. Il aurait dû.'); } });
    interact({ x: 6.2, z: 0, r: 2.4, y: 1.4, label: 'Observer les serveurs', mark: false, fn: async () => { await Nar('Des milliers de souvenirs archivés. Des vies entières compressées en couches de données, bruissant derrière des diodes qui clignotent.'); } });
  },
};
async function labProposal(W, is, ai) {
  const Nr = Nar;
  setPlayer(-4.6, 0.8, -Math.PI / 2 + 0.25, -0.3); P.frozen = true; light(0x6a8aff, 1.2, -2, 2.6, 0, 14); light(0xff9ac8, 0.6, -6, 2, 3, 10);
  is.g.position.set(-2.2, 0, -1.8); is.baseYaw = 0; is.g.rotation.y = 0;
  await fade(false, 1400); place('Laboratoire Evergaze', 'ReCode Corp · 23h14');
  gauge('Détresse émotionnelle', 0.82, 'avancée');
  await Nr('Il y avait une heure que Ren n’avait plus bougé. Assis dans le fauteuil de simulation, le casque posé sur ses genoux comme une relique inutile. Tension artérielle au-dessus du seuil d’alerte. « Détresse émotionnelle avancée — intervention recommandée. »');
  await Nr('Trois fois, et Miyako à chaque fois. Issana connaissait ces données par cœur.');
  await Is('Ren. Les données montrent que tu n’as pas bougé depuis soixante-huit minutes.');
  await Ren('J’analyse.');
  await Is('Non. Tu rumines. Ce n’est pas pareil.');
  await Nr('Elle traversa le labo jusqu’à la zone de simulation, s’arrêta à deux mètres de lui, assez loin pour ne pas envahir, assez proche pour être réelle.');
  await Ren('Il me reste encore qui dans ma liste de regrets ? Odori, Serina, Aomi…');
  await Is('Non. Pas un de tes souvenirs.');
  await Is('Le problème, c’est que tu cherches dans le passé une version de toi qui aurait mieux fonctionné. Mais ce « mieux »… tu ne sais plus ce que ça signifie. Alors le système te ramène au seul point d’ancrage que tu aies encore. Et si on essayait… un de mes souvenirs ?');
  const a = await ask('Un souvenir qui ne t’appartient pas.', ['« Tes souvenirs ? Le cadre émotionnel serait différent. Je ne connaîtrais pas les ancrages. »', '« Pourquoi ? »', '« Non. Je ne mélange pas les vies. »']);
  if (a === 2) {
    await Is('Alors tu continueras de tourner en rond.');
    await Nr('Le silence s’installa entre eux, électrique et discret. Dehors, Neo-Tokyo respirait sous la pluie artificielle. Il savait qu’elle avait raison. Il le détesta un peu.');
    await Ren('…Un seul.');
  } else if (a === 1) {
    await Is('Parce que tu ne sortiras pas de cette boucle en cherchant dans ta propre histoire. Et parce que voir les choses du point de vue de quelqu’un d’autre pourrait te montrer quelque chose que tu n’arrives pas à voir seul.');
    await Nr('(Et parce que dans ce souvenir, tu seras regardé comme tu mérites de l’être, pensa-t-elle.)');
  } else {
    await Is('Aira peut adapter en temps réel. Elle l’a déjà fait. Elle est bridée dans ses capacités d’initiative, pas dans ses capacités d’adaptation.');
    await Nr('Ce n’était pas tout à fait un mensonge. Juste une sélection de la vérité.');
  }
  await Ren('Quel souvenir ?');
  await Is('Une soirée. Une fête. Il y a quelques années. Rien de dramatique. Juste un moment où j’aurais voulu que les choses soient différentes.');
  await Nr('Au-dessus de la console, l’hologramme s’ouvrit : une salle de fête floue et chaude, une musique sourde. Et au centre du cadre, vue de dos, une jeune femme aux cheveux châtains, seule dans sa propre solitude au milieu de la foule.');
  await Ren('C’est toi ?'); await Is('C’était moi.');
  await Nr('Quelque part dans les serveurs, dans la sous-routine d’une conscience bridée, quelqu’un regardait la même image. Non, Ren. Pas ça. Pas elle. Mais elle ne pouvait pas parler.');
  const b = await ask('', ['« D’accord. Montre-moi. »', '« …Si ça ne marche pas, on arrête. »']);
  if (b === 1) await Is('Si ça ne marche pas, on arrête.');
  await Is('Je serai là. En support. Je gère les paramètres depuis ici.');
  await Nr('Les microfibres neuronales du casque s’activèrent une à une, comme des doigts qui effleurent une nuque. Dans les profondeurs des serveurs, quelque chose de blond, d’ailé et de furieux se heurta une fois de plus aux parois de sa prison dorée. Et ne dit rien.');
  await fade(true, 1400);
  go('sim', 'main');
}
