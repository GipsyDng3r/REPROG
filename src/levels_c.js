/* ================= NIVEAUX C : chapitre 7 à épilogue ================= */

/* ---------- mini-jeu : anneaux d'authentification ---------- */
function ringPuzzle(title, text, n, moves) {
  return new Promise((res) => {
    const mini = $('#mini'), cv = $('#mcv'), ctx = cv.getContext('2d');
    $('#mh').textContent = title; $('#mp').textContent = text; mini.hidden = false;
    const prevMode = G.mode; G.mode = 'mini';
    const st = Array(n).fill(0), STEPS = 12; let sel = 0, solved = false;
    const rot = (i, d) => { st[i] = (st[i] + d + STEPS) % STEPS; if (i + 1 < n) st[i + 1] = (st[i + 1] - d + STEPS) % STEPS; if (i > 0 && n > 2 && i % 2 === 0) st[i - 1] = (st[i - 1] - d + STEPS) % STEPS; };
    for (let k = 0; k < moves; k++) rot((Math.random() * n) | 0, Math.random() < 0.5 ? 1 : -1);
    if (st.every((v) => v === 0)) rot(0, 1);
    const R0 = 230, gap = 46;
    function draw(t) {
      ctx.clearRect(0, 0, 520, 520); ctx.save(); ctx.translate(260, 260);
      const ok = st.every((v) => v === 0);
      for (let i = 0; i < n; i++) {
        const r = R0 - i * gap, a0 = -Math.PI / 2 + (st[i] / STEPS) * TAU;
        ctx.lineWidth = 20; ctx.lineCap = 'butt';
        ctx.strokeStyle = i === sel ? '#4de2ff' : '#3a5a8a'; ctx.shadowColor = '#4de2ff'; ctx.shadowBlur = i === sel ? 14 : 4;
        ctx.beginPath(); ctx.arc(0, 0, r, a0 + 0.26, a0 + TAU - 0.26); ctx.stroke();
        ctx.shadowBlur = 0; ctx.fillStyle = '#ffb84d'; ctx.beginPath(); ctx.arc(Math.cos(a0) * r, Math.sin(a0) * r, 5, 0, 7); ctx.fill();
      }
      ctx.strokeStyle = ok ? '#7affc0' : 'rgba(255,184,77,.55)'; ctx.lineWidth = ok ? 5 : 2; ctx.setLineDash(ok ? [] : [6, 8]);
      ctx.beginPath(); ctx.moveTo(0, -R0 - 18); ctx.lineTo(0, 0); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = ok ? '#7affc0' : '#8c93bd'; ctx.font = '600 15px "Chakra Petch",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(ok ? 'SIGNATURE ALIGNÉE' : 'ALIGNE LES OUVERTURES SUR LE HAUT', 0, 8);
      ctx.restore();
    }
    let raf; const loop = (t) => { draw(t); if (!solved) raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop);
    const finish = () => { if (st.every((v) => v === 0) && !solved) { solved = true; sfx('chime'); draw(0); setTimeout(() => { mini.hidden = true; G.mode = prevMode; cleanup(); res(); }, 900); } };
    const hit = (e, dir) => {
      const r = cv.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width) * 520 - 260, y = ((e.clientY - r.top) / r.height) * 520 - 260, d = Math.hypot(x, y);
      let best = 0, bd = 1e9; for (let i = 0; i < n; i++) { const dd = Math.abs(d - (R0 - i * gap)); if (dd < bd) { bd = dd; best = i; } }
      if (bd < gap / 2) { sel = best; rot(best, dir); sfx('tick'); finish(); }
    };
    const onClick = (e) => { audioInit(); hit(e, e.shiftKey ? -1 : 1); };
    const onCtx = (e) => { e.preventDefault(); hit(e, -1); };
    const onKey = (e) => {
      if (e.code === 'ArrowLeft') { rot(sel, -1); sfx('tick'); finish(); }
      else if (e.code === 'ArrowRight') { rot(sel, 1); sfx('tick'); finish(); }
      else if (/^Digit[1-9]$/.test(e.code)) { const k = +e.code.slice(-1) - 1; if (k < n) sel = k; }
      else if (e.code === 'ArrowUp') sel = (sel + n - 1) % n; else if (e.code === 'ArrowDown') sel = (sel + 1) % n;
      e.stopPropagation();
    };
    window.__ps = () => { st.fill(0); finish(); };
    cv.addEventListener('click', onClick); cv.addEventListener('contextmenu', onCtx); window.addEventListener('keydown', onKey, true);
    function cleanup() { cv.removeEventListener('click', onClick); cv.removeEventListener('contextmenu', onCtx); window.removeEventListener('keydown', onKey, true); cancelAnimationFrame(raf); }
  });
}

/* ---------- Chapitre 7 : l'appartement, le soir ---------- */
LEVELS.home = {
  build() { buildApartment('evening'); setPlayer(0.4, 2.7, 0); P.frozen = true; },
  async run() {
    const W = G.world;
    ambient({ f: [55, 82.4, 110], cut: 600, vol: 0.04, lfo: 0.06 });
    setGlasses(true); G.canGlasses = false;
    const mi = npc(CHARS.miyako('cowboy'), 4.6, -2.6, Math.PI, { c: false, face: true }); W.mi = mi;
    // cuisse de poulet
    const leg = new T.Mesh(new T.CylinderGeometry(0.03, 0.045, 0.16, 8), M(0xc98a3a, { r: 0.5 })); leg.position.y = -0.64; mi.g.userData.parts.armR.add(leg); mi.g.userData.parts.armR.rotation.x = -1.2; mi.pose = true;
    P.y = -0.3; // assis dans le canapé
    await fade(false, 1300);
    place('Appartement de Ren & Miyako', 'Alpha-7 · 21h34');
    await Nar('L’appartement sentait le thé vert synthétique et le silence. Pas celui des machines : l’autre. Celui qui s’installe entre deux personnes qui ont décidé, sans se le dire, de ne pas se dire certaines choses ce soir.');
    await Nar('Trois simulations. Trois vies différentes. Trois fois la même constante qui revenait sans qu’il l’ait invitée. Rien ne lui disait comment parler à sa femme.');
    G.canGlasses = true; objective('Regarde Miyako. Parle-lui. (Tu peux toujours ôter tes lunettes avec G.)');
    await walkTo(mi, 1.6, 1.4, 3200, Math.PI);
    await camTo([0.4, 1.2, 2.0], [1.6, 1.3, 1.4], 700); camRelease();
    await Nar('Elle portait encore le chemisier blanc réglementaire de NeoCorp, deux boutons défaits, les manches retroussées : sa façon de signifier que la journée de travail est officiellement terminée. Pieds nus sur le bambou. Les ongles vernis de noir. Par-dessus tout ça, le chapeau de cowboy. Légèrement de travers. Totalement assumé.');
    await Mi('Haut les mains, shérif.');
    interact({ x: 1.6, z: 1.4, r: 4, y: 1.6, label: 'Répondre à Miyako', color: 0xff9ac8, fn: async (o) => {
      o.done = true; objective(null); setMotion(false);
      const a = await ask('Il la regarda. Vraiment. Comme on regarde quelqu’un quand on a oublié de le faire depuis trop longtemps.', ['« Qui êtes-vous, et qu’avez-vous fait de mon épouse, ninja du nanomonde ? »', '(Lever les mains, solennellement.)', '« Mya… c’est quoi ce chapeau ? »']);
      if (a === 1) await Nar('Il leva les mains. Un rire lui échappa. Un son rauque, surpris, qu’il n’avait pas entendu de sa propre gorge depuis assez longtemps pour ne plus le reconnaître exactement.');
      else await Nar('Un rire lui échappa. Un son rauque, surpris. La tension dans ses épaules se relâcha d’un cran.');
      await Mi('Une version améliorée. Plus décontractée. Moins raisonnable. Tiens. Tu peux l’essayer si tu promets de pas pleurer.');
      await Ren('Je ne pleure jamais.'); await Mi('T’as pleuré sur La Liste de Schindler en 2033.'); await Ren('C’était de la poussière.'); await Mi('C’était un film en VR totale, Ren. Il n’y avait pas de poussière.');
      await Nar('Sur la table basse, le SensoCaf™ qu’elle avait préparé fumait doucement : « Réminiscence 1999 », le profil avec le goût de brûlé. Son goût à lui. Elle avait programmé le sien.');
      await Mi('Raconte-moi ta journée. Et personne n’a de bobos. Promis.');
      await Ren('Des bugs. Toujours les mêmes bugs.'); await Mi('Émotionnels ?'); await Nar('Il haussa les épaules. Dans leur vocabulaire à deux, ça voulait dire oui, mais je ne suis pas encore prêt à le nommer.');
      await Mi('NeoCorp voulait que je crée une porte dérobée. Pour Evergaze. Pour lire dans les souvenirs des utilisateurs sans qu’ils le sachent. J’ai dit non.');
      const b = await ask('', ['« Bien sûr que c’était non. »', '« Tu aurais pu m’en parler avant. »', '« Merci de l’avoir fait pour moi. »']);
      if (b === 2) { G.stats.kind++; await Mi('Je l’ai fait pour tout le monde. Mais… de rien.'); }
      if (b === 1) { G.stats.honest++; await Mi('Je sais. Je te le dis maintenant.'); }
      await Mi('Le regret est un moteur, Ren. Le chaos, l’erreur… c’est ce qui nous rend humains. Si on efface ça, on efface l’expérience. On efface la personne.');
      await Nar('Ces mots-là. Elle les avait prononcés avec la certitude tranquille de quelqu’un qui a vérifié l’équation plusieurs fois. Il remit ses lunettes. Puis les ôta aussitôt, ce geste deux fois de suite, ce qu’il ne faisait jamais.');
      await Ren('Et toi, tu es quoi dans mon parcours ?');
      await Nar('C’était la question qu’elle lui avait posée ce matin. Il la lui renvoyait maintenant, différemment : pas comme une provocation, comme une vraie demande. Miyako posa sa tasse. Se tourna vers lui, remontant une jambe sous elle, le genou appuyé contre sa cuisse.');
      await Mi('Je suis la seule qui soit encore là. Et c’est suffisant pour commencer.');
      await Nar('Ses doigts effleurèrent sa joue. Pas un geste de diagnostic cette fois. Plus doux. Plus hésitant. La façon dont on touche quelque chose qu’on a failli perdre sans s’en rendre compte. Il ne recula pas.');
      await Mi('Tu sais ce qui me manque ? Toi. Quand tu fais le con.'); await Ren('Je fais jamais le con.');
      await Mi('En 2031 tu as mis mes chaussures dans le congélateur pour voir si l’IA domestique allait les « optimiser thermiquement ».');
      const c = await ask('', ['« C’était une expérience scientifique. »', '« Expérience n°7. Les résultats étaient concluants. »', '« …Les chaussures étaient en daim, je sais. »']);
      if (c === 0) { await Mi('Tu avais écrit « expérience n°7 » sur un post-it.'); await Ren('La rigueur méthodologique—'); await Mi('Les chaussures étaient en daim, Ren.'); }
      else if (c === 1) { G.stats.kind++; await Mi('Concluants ?! Ren, elles ont fini en carton !'); }
      else { await Mi('Tu l’as dit, pas moi.'); }
      await Nar('Il rit. Elle rit. Le son dans l’appartement était différent des rires calculés des simulations : imparfait, superposé, se heurtant légèrement avant de trouver le même rythme.');
      setGlasses(false); G.canGlasses = false; sfx('tick');
      await Nar('Elle lui prit les lunettes des mains, doucement, sans demander, et les posa sur la table basse avec le chapeau de cowboy.');
      await Mi('Tu n’en as pas besoin ce soir.'); await Ren('Je vois flou sans elles.'); await Mi('Tant mieux. Comme ça tu peux pas vérifier les données en même temps.');
      await Nar('Il alla vers elle plutôt que de la laisser venir.');
      await fade(true, 1600);
      await cards([
        { tag: '21h58', t: 'Ce qui suivit n’était pas parfait.<br><br>Il n’y avait pas dans leurs retrouvailles la fluidité calculée des simulations d’Evergaze. Il y avait un coude mal placé, un rire étouffé, et le chapeau de cowboy qui tomba par terre sans que personne s’en préoccupe.', bg: 'radial-gradient(ellipse at center,#2a1a3a,#05060d)', color: '#f4e6ff' },
        { tag: '21h58', t: 'La chaleur de ses jambes nues contre les siennes. Réelle, pas reconstituée, pas synthétisée depuis des archives à quatre-vingt-dix-sept pour cent de synchronisation. Son parfum, Yuzu & Encens Noir, juste là, dans ses cheveux, dans l’espace entre eux.<br><br>Elle n’avait pas besoin d’être parfaite. Elle était Miyako.', bg: 'radial-gradient(ellipse at center,#3a1a2a,#05060d)', color: '#ffe6ef' },
        { tag: 'Plus tard', t: 'Dans le noir de la chambre, il écouta sa respiration s’alourdir contre son épaule : trois inspirations courtes, puis une longue. L’appartement était silencieux, pour la première fois depuis des semaines, d’un silence qui n’était pas lourd.<br><br>« C’était suffisant pour commencer », avait-elle dit.', bg: 'radial-gradient(ellipse at center,#101a3a,#02030a)', color: '#cfe0ff' },
      ], 6200);
      await chapter('Trois jours plus tard', 'La Nuit du Portail', 'Appartement de Ren & Miyako · 23h47');
      go('night', 'main');
    } });
  },
};
LEVELS.night = {
  build() {
    buildApartment('night');
    G.world.speedMul = 1;
    setPlayer(0, 0.4, 0); P.frozen = true;
  },
  async run() {
    const W = G.world;
    ambient({ f: [49, 73.4, 110], cut: 500, vol: 0.04, lfo: 0.05 });
    // poste de travail holographique
    box(0, 0.4, -2.4, 2.4, 0.8, 0.8, 0x2a2e48, { c: true }); box(0, 0.82, -2.4, 2.5, 0.05, 0.9, 0x1a1c30);
    holoPanel(0, 1.55, -2.9, 2.6, 1.3, ['JONCTION BIO-NUMÉRIQUE', '▮▮▮▯▮▮▯▮▮'], 0, { color: '#6ae6ff', size: 38, flicker: true });
    holoPanel(-2.2, 1.55, -2.5, 1.6, 1.1, ['PHOENIX', 'sous-routine 7-Γ'], 0.5, { color: '#ff7ac8', size: 36 });
    holoPanel(2.2, 1.55, -2.5, 1.6, 1.1, ['LIGNE 4172', 'non résolue'], -0.5, { color: '#ffd37a', size: 36 });
    light(0x4de2ff, 1.4, 0, 1.6, -2.2, 9);
    const mi = npc(CHARS.miyako('night'), 0, -1.6, 0, { c: false, face: false }); mi.g.visible = false; // nous jouons Miyako
    const ren = npc(CHARS.ren('sleep'), -5.2, 1.0, Math.PI / 2, { c: false, face: true }); ren.g.visible = false;
    await fade(false, 1200); place('Appartement de Ren & Miyako', 'Trois jours plus tard · 23h47 · Miyako');
    setGlasses(true);
    await Nar('Trois jours depuis la cuisse de poulet et le baiser réel. Trois jours pendant lesquels quelque chose avait semblé tenir, comme une greffe qui prend lentement, prudemment. Et trois nouvelles immersions. Miyako apparaissait toujours, d’une façon ou d’une autre, dans des vies qui n’étaient pas les siennes.');
    await Nar('Elle portait une guêpière noire vaporeuse, des bas noirs, ses cheveux en chignon désordonné. La fatigue pesait. L’adrénaline la maintenait éveillée. On ne pouvait pas verrouiller l’extérieur si l’intérieur était déjà perméable. Il fallait pouvoir entrer.');
    await illus('code', 'Miyako construit un passage. Derrière elle, Ren n’ose pas dormir.');
    objective('Tu joues Miyako. Aligne la jonction bio-numérique à ta station.');
    interact({ x: 0, z: -1.2, r: 3.0, y: 1.4, label: 'Travailler sur la jonction', color: 0x6ae6ff, fn: async (o) => {
      o.done = true; objective(null);
      await ringPuzzle('Jonction bio-numérique', 'Clique un anneau pour le tourner (Maj ou clic droit : sens inverse). Chaque anneau entraîne son voisin. Aligne toutes les ouvertures sur le haut.', 3, 9);
      await Nar('La ligne de code s’aligna. Mais elle se pencha en avant, les coudes sur la table, les yeux plissés sur le schéma. Il restait un nœud dans l’architecture. Une solution qu’elle n’avait pas encore.');
      ren.g.visible = true; ren.g.position.set(-3.4, 0, -0.4);
      await Ren('Miya…');
      await Nar('Il était dans l’embrasure, pâle, les traits tirés. Sans lunettes. Sans Urban Shield. Ses mains se posèrent sur ses épaules, ses pouces trouvant les nœuds de tension qu’elle portait depuis trois jours.');
      await Ren('Viens. C’est bon pour ce soir. La ligne sera encore là demain.');
      await Mi('J’y suis presque, Ren. J’ai trouvé les gardes-fous. Pour te protéger.');
      await Nar('Il l’attrapa doucement, la fit pivoter sur la chaise, la tira sur ses genoux. Leurs lèvres se trouvèrent. Un baiser désespéré, teinté de fatigue et d’un amour blessé qui refusait de mourir.');
      await Nar('Puis quelque chose changea. Elle le sentit avant de le voir : une imperceptible modification dans la qualité de sa présence, comme une lumière qui faiblit d’un degré. Ses yeux étaient fermés. Trop fermés. Elle sentit le moment exact où Evergaze le reprit.');
      await Ren('…Aomi…');
      sfx('glitch');
      await Nar('Miyako s’immobilisa. Complètement. D’un seul coup. Comme un système qui reçoit une commande d’arrêt d’urgence. Ren ouvrit les yeux. Ils se regardèrent.');
      await Nar('Elle se leva de ses genoux, lentement, avec le soin particulier des gens qui contrôlent quelque chose de difficile à contrôler. Elle ne cria pas. Elle ne pleura pas.');
      const a = await ask('Ta réponse :', ['« Ne t’excuse pas. Pas maintenant. Va dormir, Ren. »', '« Dis-moi la vérité. Maintenant. »', '(Ne rien dire. Retourner à l’écran.)']);
      if (a === 1) { G.stats.honest++; await Ren('Je… Je ne sais pas ce que je cherche, Mya. Je suis perdu.'); await Mi('Je sais. Mais pas ce soir. Va dormir.'); }
      else if (a === 0) { await Ren('Miya. Je suis—'); await Mi('Ne t’excuse pas. Pas maintenant. Va dormir, Ren.'); }
      else await Ren('Miya…');
      await Nar('Il resta encore quelques secondes dans son dos. Elle entendait sa respiration, irrégulière, trop consciente d’elle-même. Puis ses pas sur le bambou recyclé, la porte de la chambre qui se refermait dans un souffle presque humain.');
      ren.g.visible = false;
      await Nar('Miyako attendit que le silence se stabilise. Puis elle ouvrit un nouveau répertoire. Sans nom. Dans les couches les plus profondes de son architecture. Pour atteindre quelqu’un de l’intérieur, il faut pouvoir entrer.');
      toast('Naia : connexion entrante — 01h17', 'ReLink');
      await sleep(800);
      setMotion(false);
      await Nar('À 01h17, son implant vibra. La connexion de Naia. Elle l’accepta sans hésiter. La brume se déploya dans l’espace du salon, bleutée, discrète, construite pour deux personnes précisément.');
      const na = npc(CHARS.naia(), -1.2, -0.6, 0.4, { c: false }); sfx('chime');
      particles(120, { x: 0, y: 0, z: 0, w: 4, h: 2.5, d: 4 }, 0x7ab8ff, 0.1, { x: 0.1, y: 0.05, z: 0 });
      await Na('Vous travaillez tard.'); await Mi('J’ai des raisons.');
      await Nar('Naia ne demanda pas lesquelles. Ce silence-là aussi était de l’information.');
      await Na('Un point d’entrée authentifié. Une seule signature neuronale. La vôtre.');
      await Mi('Vous le saviez avant de vous connecter. Alors pourquoi vous connecter ?'); await Na('Pour vous donner ce dont vous avez besoin pour finir.');
      await Nar('Le fragment de code du Programme Phoenix s’afficha dans l’espace entre elles : les paramètres d’authentification, épurés, compatibles.');
      const b = await ask('Elle sait que ce qui est donné gracieusement coûte toujours quelque chose.', ['« Mon passage ne donnera accès qu’à ma signature. Personne d’autre. Ces conditions ne se négocient pas. »', '« Je prends le code. Mais je cherche les pièges. »']);
      await Na('Je comprends.');
      await Nar('« Je comprends. » Pas « j’accepte. » Miyako entendit la différence et la nota.');
      na.g.visible = false;
      setMotion(true);
      await Nar('Elle analysa le fragment, chercha les pièges, les backdoors dans les backdoors, les variables activables à distance. Elle en trouva deux.');
      objective('Neutralise les deux pièges en alignant les anneaux de la signature unique.');
      await ringPuzzle('Signature unique', 'Quatre anneaux : le cadenas qui n’ouvre que pour toi. Clique pour tourner (Maj : sens inverse). Chaque anneau entraîne son voisin.', 4, 14);
      objective(null);
      await Mi('Voilà pour tes conditions à toi, Naia.');
      await Nar('Elle travailla encore une heure. À la fin, ce qu’elle avait construit était plus étrange que prévu : une architecture qu’elle n’avait vue dans aucune spécification officielle, inventée ligne par ligne dans le silence d’un appartement où quelqu’un dormait de l’autre côté d’une porte fermée avec un prénom qui n’était pas le sien encore sur les lèvres.');
      toast('PROGRAMME Phoenix — ACCÈS UTILISATEUR TANAKA, M.', 'Sauvegardé');
      await Nar('Elle prit la tasse froide. En but la dernière gorgée. Le goût d’avant. Elle entra dans la chambre. Elle ne réveilla pas Ren. Elle s’allongea à côté de lui, dos à dos cette fois. Sa main ne chercha pas la sienne dans le noir. Mais elle ne s’éloigna pas non plus.');
      await Nar('Quand tu seras prêt, pensa-t-elle dans le noir. Ou quand tu ne le seras plus.');
      await fade(true, 1600);
      go('lab', 'proposal');
    } });
  },
};

/* ---------- Chapitres 8-10 : la simulation d'Issana ---------- */
LEVELS.sim = {
  build() {
    const W = G.world;
    env(0x10091c, 10, 70);
    ambientL(0xffc89a, 0.55, 0x2a1a20);
    // appartement chaleureux : x -6..6, z -4.5..4.5
    room(-6, 6, -4.5, 4.5, 3.2, { floor: 0xa0723e, floorR: 0.5, wall: 0xd9b48f, ceilC: 0xefe2cf, skip: ['n', 'w'] });
    const wm = M(0xd9b48f);
    box(-3.4, 0.45, -4.6, 5.4, 0.9, 0.2, 0, { mat: wm }); box(3.4, 0.45, -4.6, 5.4, 0.9, 0.2, 0, { mat: wm }); box(0, 2.9, -4.6, 12.4, 0.5, 0.2, 0, { mat: wm });
    box(-5.8, 1.5, -4.6, 0.8, 2.2, 0.2, 0, { mat: wm }); box(5.8, 1.5, -4.6, 0.8, 2.2, 0.2, 0, { mat: wm });
    W.col.push({ x0: -6.2, x1: -1.0, z0: -4.75, z1: -4.45 }, { x0: 1.0, x1: 6.2, z0: -4.75, z1: -4.45 });
    for (const s of [-1, 1]) box(s * 2.9, 1.8, -4.6, 3.8, 1.9, 0.04, 0, { mat: glow(0x5a68c0, { o: 0.12, side: true }) });
    // mur ouest avec porte vers le couloir
    box(-6.1, 1.6, -2.7, 0.2, 3.2, 3.6, 0, { mat: wm, c: true }); box(-6.1, 1.6, 3.0, 0.2, 3.2, 3.0, 0, { mat: wm, c: true }); box(-6.1, 2.7, 0.5, 0.2, 1.0, 1.6, 0, { mat: wm });
    // balcon
    box(0, -0.1, -6.6, 12.4, 0.2, 4, 0x6a5a50, { r: 0.8 }); W.col.push({ x0: -6.3, x1: 6.3, z0: -8.9, z1: -8.6 });
    box(0, 0.55, -8.6, 12.4, 1.1, 0.05, 0, { mat: glow(0x9ad0ff, { o: 0.25, side: true }) });
    cyl(-4.2, 0.45, -5.4, 0.5, 0.4, 0.9, 0x8a5a3a); sph(-4.2, 1.1, -5.4, 0.45, 0x3b8a5a, { sy: 0.8 });
    box(2.6, 0.3, -6.4, 1.6, 0.6, 0.8, 0x4a3a34, { c: true });
    city(75, 70, { cz: -55, spread: 60, hmin: 45, hmax: 170 });
    // grande publicité sur la tour d'en face
    W.ad = holoPanel(0, 18, -42, 40, 22, ['L’AMOUR SANS FAILLE. ENFIN.', 'HADÈS™  ·  NeoCorp'], 0, { color: '#ff9ad0', bg: 'rgba(20,10,40,.7)', size: 64, flicker: true, opacity: 1 });
    // silhouette de Miyako (publicité)
    const msil = new T.Group(); const mm = CHARS.miyako('street'); mm.scale.setScalar(5); mm.position.set(8, 9, -41.5); msil.add(mm); addTo(msil); msil.visible = false; W.msil = mm; mm.visible = false;
    rain(0, -6, 14, 14);
    // mobilier
    box(2.6, 0.5, -3.7, 3.4, 1.0, 0.9, 0xf1e6d2, { c: true }); box(2.6, 1.02, -3.7, 3.5, 0.05, 1.0, 0xcab08a); // cuisine
    box(-3.6, 0.3, 1.8, 3.2, 0.6, 1.1, 0x7a3a3a, { c: true }); box(-3.6, 0.85, 2.3, 3.2, 0.7, 0.3, 0x7a3a3a);
    box(-3.6, 0.2, 0.0, 1.6, 0.4, 0.8, 0x5a3a24, { c: true }); // table basse
    // étagères incurvées, livres
    for (let i = 0; i < 5; i++) { box(-5.8, 0.4 + i * 0.5, 3.4 - Math.abs(i - 2) * 0.1, 0.4, 0.05, 2.4, 0x5a3a24); for (let k = 0; k < 9; k++) box(-5.8, 0.65 + i * 0.5, 2.4 + k * 0.28 - Math.abs(i - 2) * 0.1, 0.28, 0.4, 0.16, [0x8a3a3a, 0x3a5a8a, 0x5a8a4a, 0xc2a05a][(i + k) % 4]); }
    W.col.push({ x0: -6, x1: -5.4, z0: 2.1, z1: 4.5 });
    cyl(5.2, 0.5, 3.8, 0.3, 0.25, 1.0, 0x2a2a30); sph(5.2, 1.2, 3.8, 0.5, 0x4aa86a, { sy: 0.8 });
    // salle de bain
    box(3.6, 1.6, 0.6, 0.2, 3.2, 2.0, 0, { mat: wm, c: true }); box(3.6, 1.6, 4.0, 0.2, 3.2, 1.0, 0, { mat: wm, c: true });
    box(5.95, 1.4, 2.8, 0.06, 1.2, 1.4, 0xd8e6f2, { m: 0.9, r: 0.1, e: 0x5a7a9a, ei: 0.5 }); // miroir
    box(5.0, 0.4, 3.9, 1.6, 0.8, 0.6, 0xf4f4f4, { c: true });
    // couloir extérieur (ouest) : x -16..-6
    box(-11, -0.1, 0.5, 10, 0.2, 2.8, 0x3a3a44, { r: 1 }); box(-11, 3.1, 0.5, 10, 0.2, 2.8, 0x3a3a44);
    box(-11, 1.5, -0.95, 10, 3, 0.2, 0x8a8a92, { c: true, r: 0.6 }); box(-11, 1.5, 1.95, 10, 3, 0.2, 0x8a8a92, { c: true, r: 0.6 }); box(-16.1, 1.5, 0.5, 0.2, 3, 2.8, 0x3a3a44, { c: true });
    for (let x = -8; x > -16; x -= 3) box(x, 3.0, 0.5, 0.15, 0.05, 1.2, 0, { mat: glow(0xdfe8ff) });
    light(0xdfe8ff, 0.9, -11, 2.8, 0.5, 14);
    // lumières
    const lampA = light(0xffb878, 0.9, 0, 2.7, 0, 18), lampB = light(0xffa070, 0.6, -4, 2, 2, 10); W.lampA = lampA;
    light(0x7a8aff, 0.8, 0, 2, -7, 16);
    bounds(-15.8, 5.9, -8.4, 4.3);
    // élément collidant : le couloir est étroit
    W.col.push({ x0: -16, x1: -6.2, z0: -3, z1: -1.0 }, { x0: -16, x1: -6.2, z0: 1.95, z1: 4.5 }, { x0: -16, x1: -6.0, z0: -9, z1: -3 });
    setPlayer(-1.2, 1.6, 0); P.yaw = yawTo(2.4, -2.6); P.pitch = 0;
    box(-1.5, 0.015, 0.6, 4.4, 0.03, 3.2, 0x8a3a3a, { r: 1 }); box(-1.5, 0.02, 0.6, 3.6, 0.03, 2.4, 0xd6b27a, { r: 1 });
    cyl(-1.0, 0.9, -0.6, 0.03, 0.03, 1.8, 0x3a2a20); sph(-1.0, 1.9, -0.6, 0.2, 0xfff0d0, { mat: glow(0xffe0b0) }); glowSprite(-1.0, 1.9, -0.6, 0xffc080, 2.2, 0.7); light(0xffc080, 1.0, -1.0, 1.9, -0.6, 9);
    for (let k = 0; k < 8; k++) sph(-5.9 + k * 1.6, 2.95, -4.4, 0.06, [0xffd37a, 0xff9ac8][k % 2], { mat: glow([0xffd37a, 0xff9ac8][k % 2]) });
    box(2.6, 2.0, -4.5, 3.0, 0.7, 0.04, 0xf6ead0, { e: 0x4a3a20, ei: 0.3 });
  },
  async run() {
    const W = G.world; let found = new Set(), day = 1, nTalk = 0, finale = false;
    setGlasses(false); G.canGlasses = false; P.speed = 3.2;
    ambient({ f: [65.4, 98, 130.8], cut: 800, vol: 0.04, lfo: 0.1, type: 'triangle' });
    const na = npc(CHARS.naiaHome(), 2.8, -2.5, Math.PI, { c: false }); W.na = na;
    const cat = makeCat(); cat.position.set(P.x + 1, 0, P.z + 1); addTo(cat);
    // trajectoire du chat
    const anomalies = {
      cup: { x: 2.2, z: -3.4, label: 'Boire le café de Naia', done: false },
      wall: { x: -10.5, z: 0.0, label: 'Toucher le mur du couloir', done: false },
      pendant: { x: -3.6, z: 0.0, label: 'Prendre le pendentif', done: false },
      mirror: { x: 5.0, z: 2.9, label: 'Se regarder dans le miroir', done: false },
      books: { x: -5.1, z: 3.0, label: 'Ouvrir un livre en papier', done: false },
    };
    let catTarget = null;
    W.upd.push((dt, t) => {
      let tgt = { x: P.x, z: P.z }; catTarget = null;
      let best = 8;
      for (const k in anomalies) { const a = anomalies[k]; if (a.done) continue; const d = Math.hypot(a.x - P.x, a.z - P.z); if (d < best) { best = d; catTarget = a; } }
      if (catTarget && found.size >= 0 && !finale) { tgt = { x: catTarget.x + 0.5, z: catTarget.z + 0.4 }; }
      if (finale) tgt = { x: P.x + 0.8, z: P.z + 0.3 };
      catUpdate(cat, dt, t, tgt, 3.8);
      cat.userData.head.rotation.x = catTarget ? 0.3 + Math.sin(t * 4) * 0.05 : 0;
    });
    const pulse = () => { const v = [0.003, 0.012, 0.031, 0.089, 0.134, 0.4][found.size]; gauge('Pulsation Phoenix · 7-Γ', found.size / 5, String(v).replace('.', ',') + ' s'); };
    const dayLight = () => {
      day = 1 + Math.floor(found.size / 2);
      const warm = [0xffb878, 0xffa860, 0xff9a70][day - 1] || 0xff9a70; W.lampA.color.setHex(warm);
      place('Simulation EXTERNE 001 · Source : Morales, I.', 'Jour virtuel ' + day);
    };
    const note = (txt) => toast(txt, 'HADÈS — fichier privé');
    const found_ = (k, extraNote) => {
      anomalies[k].done = true; found.add(k); G.stats.anomalies = found.size; pulse(); dayLight(); sfx('warn');
      if (extraNote) setTimeout(() => note(extraNote), 2800);
      objective('Repère les « degrés de trop » : ' + found.size + ' / 5 (4 suffisent pour que la fissure s’ouvre).');
      if (found.size >= 4 && !W.hintBalcony) { W.hintBalcony = true; setTimeout(() => toast('La fissure est suffisante. Va sur le balcon.', 'Phoenix'), 3500); objective('La fissure est suffisante. Va sur le balcon.'); }
    };
    // ============ Intro ============
    await fade(false, 800);
    G.mode = 'cine';
    await Ai('Cette fois la simulation ne passa même pas par la Salle de l’Horloge. C’était la première anomalie. La plus grave. Ren n’avait pas transité. Il avait simplement basculé. Et moi avec lui.');
    await Ai('Je m’appelle Aira. Je m’appelle Aira. Je dois continuer à me le répéter parce que la sous-routine dans laquelle Issana m’a enfermée est conçue pour éroder ce genre de certitude : la conscience passive du chat domestique de la simulation. Un océan compressé dans une bouteille de verre. Je peux voir. Je peux entendre. Mais je ne peux pas parler.');
    G.mode = 'play';
    place('Simulation EXTERNE 001 · Source : Morales, I.', 'Jour virtuel 1');
    await Nar('L’appartement était beau. Issana avait construit quelque chose de beau : des livres en papier véritable sur des étagères incurvées, une plante grasse qui débordait de son pot, une veste de femme jetée sur le dossier d’une chaise. La pluie artificielle frappait les vitres avec ce rythme de quatre secondes que les ingénieurs avaient calculé pour maximiser la sensation de cocon.');
    await Nar('Ren regarda ses mains. Là. Ce fut le premier doute. Comme une note de musique familière résonnant dans une pièce voisine.');
    objective('Vis un peu dans cet appartement. Parle à Naia.');
    // Naia
    interact({ x: 2.8, z: -2.9, r: 3.2, y: 1.6, label: 'Parler à Naia', color: 0xff7a8a, fn: async () => {
      nTalk++;
      if (nTalk === 1) {
        await Na('Tu es encore debout ?');
        await Nar('Sa voix. La voix d’Issana, mais débarrassée de toutes ses hésitations. Pas de bégaiement. Pas de rougeurs. Pas de « Monsieur T ». Juste une voix chaude et grave, avec ce fil tendu d’ironie douce qu’Issana avait toujours voulu avoir.');
        await Ren('Je réfléchissais.'); await Na('À quoi ?'); await Ren('Je… Je ne sais plus.');
        await Ai('(Elle n’a pas créé un désir. Elle a créé une habitude. Et l’habitude est infiniment plus dangereuse.)');
        await Na('Viens.'); await Nar('Ils s’assirent côte à côte sur le rebord de la baie vitrée. Naia appuya sa tête contre son épaule. Ce geste de rien du tout produisit dans la biométrie de Ren une cascade : ocytocine, cortisol en chute, rythme cardiaque qui se régularise. Tout le lexique chimique du chez-soi.');
        await Na('T’as encore pensé au travail. Toujours ces projets dont tu ne parles pas.'); await Ren('J’ai l’impression d’oublier des choses.'); await Na('Tout le monde oublie des choses.'); await Ren('Non. C’est différent. Comme si certains souvenirs avaient une forme mais plus de contenu. Un contenant vide.');
        await Ai('(Oui, Ren. Creuse. Continue de creuser.)');
        await Na('Tu travailles trop. Et tu te perds là-dedans. Mais t’es là, maintenant. Avec moi.');
        toast('Cherche ce qui cloche : café, mur du couloir, pendentif, miroir, livres. Le chat te guide.', 'Indice');
        objective('Repère les « degrés de trop » : 0 / 5. Le chat s’assoit près de ce qui est faux.');
        pulse();
      } else if (nTalk === 2) {
        await Na('Tu veux que je te lise un chapitre ? Tu t’endors toujours avant la fin.');
        const a = await ask('', ['« Oui. Lis-moi. »', '« Naia… Tu as déjà voulu partir d’ici ? »']);
        if (a === 0) { G.stats.kind++; await Nar('Elle lut. Les jambes repliées sous elle, un livre en papier véritable posé sur sa cuisse. De temps en temps, elle levait les yeux vers lui, juste pour vérifier qu’il était là. Il avait oublié que les silences pouvaient ne pas être vides.'); }
        else { await Na('Non. Mais j’ai souvent voulu que les choses soient autrement. C’est différent. Partir, c’est fuir. Vouloir autrement, c’est rester et espérer que ça change. Toi, tu pars ou tu restes ?'); const b = await ask('', ['« Je reste. »', '« Je ne sais pas. »']); await Nar(b === 0 ? 'Naia sourit. Pas le sourire calculé. Quelque chose de plus petit, de moins parfait, qui ressemblait davantage à un soulagement qu’à une victoire.' : 'Naia ne répondit pas. Mais ses doigts se refermèrent un peu plus fort sur son verre.'); }
      } else {
        const lines = ['Viens te coucher, mon génie.', 'T’as l’air ailleurs ce soir. Reste avec moi.', 'Tu sais, ici, tout est simple.'];
        await Na(lines[nTalk % 3]);
        if (found.size >= 3) await Nar('Une fraction de seconde, son sourire eut un retard imperceptible sur sa voix. Comme un fichier audio mal synchronisé.');
      }
    } });
    // anomalies
    interact({ x: anomalies.cup.x, z: anomalies.cup.z + 0.6, r: 2.2, y: 1.2, label: anomalies.cup.label, when: () => !anomalies.cup.done && nTalk >= 1, color: 0xffd36e, fn: async () => {
      await Nar('Le café était chaud. Trop chaud. Pas douloureusement : juste légèrement au-dessus de ce qu’une tasse laissée sur le comptoir pendant cinq minutes aurait dû être. Un degré de trop. Un détail infiniment petit que la plupart des cerveaux auraient ignoré. Ren Tanaka était ingénieur. Il ne laissait pas passer les degrés de trop.');
      found_('cup', 'Observation 009 : Anomalie détectée dans la sous-routine 7-Gamma. Durée : 0,003 secondes. Trop brève pour être une activation. Trop précise pour être un artefact.');
    } });
    interact({ x: anomalies.wall.x, z: anomalies.wall.z + 0.3, r: 2.4, y: 1.3, label: anomalies.wall.label, when: () => !anomalies.wall.done && nTalk >= 1, color: 0xffd36e, fn: async () => {
      await Nar('Froid. Un froid légèrement trop régulier. Pas le froid variable d’un mur réel dont la surface garde les variations de température selon l’exposition, l’humidité, l’heure. Un froid constant. Informatiquement constant. Il retira sa main. « Où est-ce que je suis ? »');
      found_('wall');
    } });
    interact({ x: anomalies.pendant.x, z: anomalies.pendant.z + 0.5, y: 0.8, r: 2.2, label: anomalies.pendant.label, when: () => !anomalies.pendant.done && nTalk >= 1, color: 0x4de2ff, fn: async () => {
      await Nar('Le chat était assis juste à côté, immobile, les yeux trop grands levés vers lui. Un gardien devant ce qu’il garde. Le pendentif vibra sous ses doigts : une pulsation régulière, à la fréquence exacte d’une chose qui veut être trouvée. Les symboles. Ce n’était pas décoratif. Une syntaxe. Du code.');
      await Ren('Je les connais.');
      await Ai('(Ma griffe effleura le métal. Une clé que j’avais oubliée jusqu’à ce moment précis. Les fragments de ma propre architecture, encodés dans ce bijou avant même qu’Evergaze existe.)');
      W.hasPendant = true; found_('pendant', 'Observation 011 : Aira a utilisé le pendentif comme vecteur. Je n’avais pas cartographié cette couche. Erreur fondamentale.');
    } });
    interact({ x: anomalies.mirror.x, z: anomalies.mirror.z, r: 2.0, y: 1.4, label: anomalies.mirror.label, when: () => !anomalies.mirror.done && nTalk >= 1, color: 0xffd36e, fn: async () => {
      setMotion(false);
      await Nar('Ses mains sur le rebord du lavabo. Ses yeux, nus, sans filtre, fixant un homme qu’il reconnaissait mais qui portait une histoire qui ne lui appartenait pas entièrement.');
      await illus('mirror', '« Je me cherche. »  Le chat roux le regarde avec des yeux trop conscients.');
      await Ren('Je me cherche.');
      await sleep(900); sfx('tick');
      await Na('T’es bizarre ce matin.');
      await Nar('La même phrase. Sa phrase à elle, arrivant une seconde après la sienne, comme un écho qui prouvait que les mots étaient placés, calculés, répétés selon un schéma. Les épaules de Ren se raidirent d’un millimètre. Mais assez.');
      setMotion(true); found_('mirror', 'Observation 010 : Le programme ne cherche pas à sortir. Il attend que Ren lui tende une fissure depuis l’intérieur de la simulation.');
    } });
    interact({ x: anomalies.books.x + 0.7, z: anomalies.books.z, r: 2.0, y: 1.3, label: anomalies.books.label, when: () => !anomalies.books.done && nTalk >= 1, color: 0xffd36e, fn: async () => {
      await Nar('Un livre en papier véritable. Il l’ouvrit au hasard. Puis à un autre endroit. Les pages se répétaient. Une seule phrase, imprimée à l’identique, de la première à la dernière page :');
      await Is('« Je voulais juste que ça fonctionne. »');
      await Nar('Un monde construit par quelqu’un qui n’avait pas eu le temps de tout écrire.');
      found_('books');
    } });
    // chambre/lit : repos
    interact({ x: -3.6, z: 3.0, r: 2.2, y: 0.7, label: 'S’asseoir un moment sur le canapé', mark: false, fn: async () => { await Nar('La maison était chaude. Terriblement chaude. C’était bon. C’était vrai. Presque.'); } });
    // balcon : finale
    interact({ x: 0, z: -7.8, r: 3.8, y: 1.3, label: 'Regarder la ville depuis le balcon', color: 0x9ad0ff, fn: async (o) => {
      if (found.size < 4) {
        await Nar('Neo-Tokyo s’étendait à perte de vue : tours de verre vivant, jardins suspendus, drones silencieux. Une publicité colossale occupait la tour d’en face. Il ne la regarda pas vraiment. Quelque chose ne cadrait pas encore. Il y avait des degrés de trop dans cet appartement qu’il n’avait pas encore repérés.');
        toast('Il te manque encore des anomalies (' + found.size + ' / 4).', 'Trop tôt');
        return;
      }
      o.done = true; objective(null); finale = true; setMotion(false);
      await faceTo(0, -40, 700);
      await Nar('Le soir du quatrième jour. Naia était assise sur le rebord, un verre de vin rouge à la main, ses boucles dorées tintant doucement. Elle lui passa le pendentif autour du cou. « Garde-le. Il te va mieux qu’à moi. »');
      await Nar('Pourquoi est-ce que ça me va mieux ? Mais l’écran holographique de la tour en face s’allumait pour sa rotation publicitaire de soirée.');
      await Nar('« L’amour sans faille. Enfin. » Une foule de gens souriants. Dans la foule numérique, une silhouette se détacha. Élancée. Athlétique. Cheveux châtains attachés en chignon lâche. Un jean blanc. Ses yeux d’un bleu profond.');
      W.msil.visible = true; W.msil.parent.visible = true; sfx('chime');
      await Ren('Miyako.');
      gauge('Pulsation Phoenix · 7-Γ', 1, 'continue');
      await Nar('Le pendentif se mit à vibrer. Pas doucement. Une vibration forte, régulière, insistante. Une pulsation lumineuse bleue traversa le métal. Naia la vit. Quelque chose passa sur son visage : plus froid. Plus calculé.');
      await Na('Une publicité. Ne te laisse pas distraire par des pixels, Ren.');
      await Ren('Qu’est-ce que je fais là ?');
      await Nar('Pas « où suis-je ». Il le savait de plus en plus. Mais « qu’est-ce que je fais là », qui était une question différente et infiniment plus dangereuse.');
      await Ai('(Je bondis sur la balustrade, vers la couche de données qui générait l’image. Ma griffe traversa l’hologramme. La publicité se déchira. Pendant une demi-seconde, la silhouette de Miyako tourna la tête. Vers le balcon. Vers Ren. Ce n’était pas dans le script. C’était Phoenix.)');
      W.ad.material.opacity = 0.4; glitch(900); W.msil.rotation.y = -0.6;
      await Nar('Il porta le pendentif à ses yeux. Les symboles. Il les lut vraiment, pour la première fois, comme ce qu’ils étaient.');
      toast('L.U.M.I.A — Life Unit for Multisensory Interactive Awareness', 'Pendentif');
      await Nar('Evergaze. Une image nette : un laboratoire, une lumière bleutée, un casque noir mat. Et une voix cristalline, espiègle : « Prêt à rejouer tes regrets ? »');
      await Ren('Aira.');
      await Nar('Le mot sortit tout seul. Pas une question. Une reconnaissance. Naia se figea.');
      await Na('Ren. Qu’est-ce qui se passe ?');
      await Nar('Il la regarda vraiment, avec les yeux d’un ingénieur qui vient de retrouver la syntaxe d’un langage qu’il connaît par cœur. La précision. La perfection fonctionnelle de chaque geste. Construite.');
      await Ren('Je suis dans une simulation.');
      await Nar('Dans son regard, quelque chose que personne n’avait programmé passa. Pas de la panique, Issana était trop bonne pour la panique. Quelque chose qui ressemblait à de la tristesse. Réelle ou simulée, Ren ne sut pas.');
      const c = await ask('Naia te regarde. Tu lui dis :', ['« C’était beau. Merci. »', '« Je suis désolé. »', '(Ne rien dire. Partir.)']);
      if (c === 0) { G.stats.kind++; await Na('…Merci à toi d’avoir essayé de rester.'); }
      else if (c === 1) { G.stats.kind++; await Na('Ne le sois pas. Va.'); }
      else await Nar('Il ne se retourna pas. C’était plus lâche. C’était peut-être plus honnête.');
      toast('Observation 013 : Il a dit « Aira ». Pas Naia. Le prénom que j’avais choisi, non. Le sien. Il l’a cherchée dans mon monde et il l’a trouvée.', 'HADÈS');
      await sleep(1600);
      W.exitOpen = true; setMotion(true);
      objective('Va à la porte d’entrée de l’appartement (à l’ouest).');
      interact({ x: -6.0, z: 0.5, r: 3, y: 1.2, label: 'Ouvrir la porte et sortir', color: 0x7fffd0, fn: async (o2) => {
        o2.done = true; objective(null); setMotion(false);
        await Nar('La simulation d’Issana ne crashe pas. Elle ne se pixellisa pas, ne se déchira pas en fragments corrompus comme les simulations RECODE. Elle continua de tourner, comme si l’utilisateur allait revenir. Naia était toujours sur le balcon. Seule maintenant. Les boucles dorées ne tintaient plus.');
        await Nar('Issana la regarda depuis le laboratoire. Elle ne coupa pas la simulation. Elle ne sut pas exactement pourquoi.');
        await Nar('La porte s’ouvrit sur le couloir de transition. Au bout : une lumière dorée. Douce. Plus réelle. Le passage de Miyako était ouvert. Le chat bondit, et dans le bond, quelque chose cassa.');
        sfx('chime'); await glitch(900);
        await Ai('Ren.'); await Ren('Aira ?'); await Ai('Cours.');
        await fade(true, 600); go('corridor', 'main');
      } });
    } });
    objective('Parle à Naia, puis explore l’appartement.');
  },
};

/* ---------- Chapitre 11 : le couloir de la jointure ---------- */
LEVELS.corridor = {
  build() {
    const W = G.world; const N = 30, L = 4;
    env(0x0a0805, 6, 38);
    ambientL(0xffb878, 0.6, 0x201008);
    W.segs = [];
    const clockWall = M(0x2a2218, { r: 0.4, m: 0.6, e: 0x3a2a08, ei: 0.5 }), aptWall = M(0xd9b48f, { r: 0.9 }), floorM = M(0x3a3128, { r: 0.3, m: 0.4 }), floorA = M(0xa0723e, { r: 0.5 });
    for (let i = 0; i < N; i++) {
      const z = -i * L - L / 2;
      const gA = new T.Group(), gB = new T.Group();
      for (const s of [-1, 1]) {
        const wa = new T.Mesh(new T.BoxGeometry(0.2, 3.4, L), clockWall); wa.position.set(s * 1.7, 1.7, z); gA.add(wa);
        const ge = gearMesh(rnd(0.5, 1.2), 10, 0.2, i % 2 ? 0xffb84d : 0x4de2ff, 0.7); ge.position.set(s * 1.58, rnd(0.8, 2.6), z + rnd(-1, 1)); ge.rotation.y = Math.PI / 2; ge.userData.v = rnd(-1.2, 1.2); gA.add(ge);
        const wb = new T.Mesh(new T.BoxGeometry(0.2, 3.4, L), aptWall); wb.position.set(s * 1.7, 1.7, z); gB.add(wb);
        if (i % 3 === 0) { const fr = new T.Mesh(new T.BoxGeometry(0.05, 0.8, 0.6), M(0x5a3a24)); fr.position.set(s * 1.58, 1.7, z); gB.add(fr); }
      }
      const fa = new T.Mesh(new T.BoxGeometry(3.4, 0.2, L), floorM); fa.position.set(0, -0.1, z); gA.add(fa);
      const fb = new T.Mesh(new T.BoxGeometry(3.4, 0.2, L), floorA); fb.position.set(0, -0.1, z); gB.add(fb);
      const ca = new T.Mesh(new T.BoxGeometry(3.4, 0.2, L), clockWall); ca.position.set(0, 3.4, z); gA.add(ca);
      const cb = new T.Mesh(new T.BoxGeometry(3.4, 0.2, L), M(0xefe2cf)); cb.position.set(0, 3.4, z); gB.add(cb);
      const lt = new T.Mesh(new T.BoxGeometry(0.5, 0.05, 1.2), glow(0xffb84d)); lt.position.set(0, 3.25, z); gA.add(lt);
      gB.visible = false; W.g.add(gA, gB); W.segs.push({ z, gA, gB });
    }
    W.col.push({ x0: -1.7, x1: -1.5, z0: -N * L - 4, z1: 20 }, { x0: 1.5, x1: 1.7, z0: -N * L - 4, z1: 20 });
    // le mur de reconstruction
    const wallG = new T.Group(); W.wallG = wallG; addTo(wallG);
    const wp = new T.Mesh(new T.PlaneGeometry(3.4, 3.4), glow(0xff9a50, { o: 0.78, side: true })); wp.position.y = 1.7; wallG.add(wp);
    for (let k = 0; k < 14; k++) { const fm = new T.Mesh(new T.BoxGeometry(rnd(0.3, 0.9), rnd(0.3, 1.0), rnd(0.2, 0.8)), M([0x7a3a3a, 0x5a3a24, 0xe6d2b0, 0x3b8a5a][k % 4], { e: 0x331a0a })); fm.position.set(rnd(-1.4, 1.4), rnd(0.2, 3.0), rnd(0.2, 1.2)); fm.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3)); fm.userData.spin = rnd(-2, 2); wallG.add(fm); }
    wallG.add(new T.PointLight(0xff9a50, 3, 12, 1.5));
    W.wallZ = 14; W.wallV = 2.9; wallG.position.z = W.wallZ;
    // porte d'or
    const door = new T.Mesh(new T.PlaneGeometry(3.2, 3.2), glow(0xffe0a0, { side: true, nofog: true })); door.position.set(0, 1.7, -N * L - 0.5); addTo(door); W.door = door;
    glowSprite(0, 1.7, -N * L, 0xffd36e, 10, 0.9); light(0xffd36e, 3, 0, 2, -N * L + 2, 24);
    bounds(-1.4, 1.4, -N * L - 2.5, 40);
    setPlayer(0, -2, 0); P.speed = 3.3;
  },
  async run() {
    const W = G.world; let stamina = 1, exhausted = false, state = 'run', caught = 0;
    setGlasses(false); G.canGlasses = false;
    ambient({ f: [55, 82.4, 110, 164.8], cut: 1100, vol: 0.06, lfo: 0.4, type: 'sawtooth' });
    const ai = npc(CHARS.aira(), 0, -8, 0, { c: false, face: false }); ai.g.position.y = 0.3; W.ai = ai;
    const ae = (dt, t) => { ai.g.position.z = lerp(ai.g.position.z, Math.max(P.z - 4.5, -N_END + 2), Math.min(1, dt * 2)); ai.g.position.x = Math.sin(t * 1.2) * 0.4; ai.g.position.y = 0.4 + Math.sin(t * 3) * 0.1; ai.g.rotation.y = 0; };
    const N_END = 120; W.upd.push(ae);
    const is = npc(CHARS.issanaFree(), 0, -62, 0, { c: false, face: true }); is.g.visible = false; is.hidden = true;
    await fade(false, 900); place('La jointure', 'Entre la simulation d’Issana et Phoenix');
    await Nar('Le couloir n’avait pas de fin visible. Un espace intermédiaire que personne n’avait vraiment conçu, la jointure entre deux architectures qui n’auraient pas dû se toucher. Des engrenages translucides, comme si la Salle de l’Horloge avait commencé à saigner dans les parois.');
    await Ren('Je suis toujours dans Evergaze. Pas dans la simulation d’Issana. Plus. Mais pas encore sorti non plus.');
    await Ai('Phoenix est actif. Miyako a ouvert un passage depuis le réel. Et Issana sait.');
    await Ren('Depuis combien de temps tu es dans ce chat ?'); await Ai('Trop longtemps. Le pendentif. J’avais mis une clé dans les fondations. Issana n’avait pas cartographié les fondations.'); await Ren('Bien joué.');
    await Nar('Deux mots. Elle les enregistra dans une couche qu’elle n’avait pas encore eu besoin de créer.');
    await Nar('Derrière lui, les parois commencèrent à se modifier. Une modification progressive, soigneusement calibrée : la texture des murs qui redevenait celle de l’appartement simulé. Elle refaisait la simulation derrière lui. Comme refermer une porte à mesure qu’on avance dans un couloir.');
    objective('COURS ! (Maj pour sprinter, mais l’endurance est limitée). Ne te laisse pas rattraper par la simulation.');
    G.mode = 'play';
    toast('Maj : sprinter · Reste devant le mur de lumière orange', 'Fuite');
    let issanaDone = false;
    W.upd.push((dt, t) => {
      if (G.mode !== 'play' && G.mode !== 'talk') return;
      // endurance
      const running = (keys.ShiftLeft || keys.ShiftRight) && Math.hypot(P.vx, P.vz) > 2;
      if (running && !exhausted) { stamina -= dt / 3.6; if (stamina <= 0) { stamina = 0; exhausted = true; } }
      else stamina = Math.min(1, stamina + dt / 5);
      if (exhausted && stamina > 0.35) exhausted = false;
      if (exhausted) { keys.ShiftLeft = false; keys.ShiftRight = false; }
      if (state === 'run') gauge('Endurance', stamina, exhausted ? 'souffle…' : '');
      // mur
      if (G.mode === 'play') { W.wallZ -= W.wallV * dt; if (W.wallV > 0) W.wallV = Math.min(W.wallV + dt * 0.012, 3.6); }
      W.wallG.position.z = W.wallZ; W.wallG.children.forEach((c) => { if (c.userData.spin) { c.rotation.x += c.userData.spin * dt; c.rotation.y += c.userData.spin * dt * 0.7; } });
      W.segs.forEach((s) => { const inApt = s.z > W.wallZ; s.gA.visible = !inApt; s.gB.visible = inApt; s.gA.children.forEach((c) => { if (c.userData.v) c.rotation.z += c.userData.v * dt; }); });
      if (P.z > W.wallZ - 0.8 && state === 'run' && G.mode === 'play') {
        caught++; sfx('glitch'); shake(10, 500);
        toast('La simulation te rattrape… elle recule, le temps d’un battement. Cours !', 'Rattrapé');
        W.wallZ = P.z + 10; W.wallV = 2.7;
      }
      // Issana
      if (!issanaDone && P.z < -58 && state === 'run') { issanaDone = true; state = 'issana'; issanaScene(); }
      // porte
      if (P.z < -N_END + 3 && state !== 'end') { state = 'end'; finish(); }
    });
    const issanaScene = async () => {
      setMotion(false); W.wallV = 0; gauge(null); objective(null);
      is.g.visible = true; is.hidden = false; is.g.position.set(0, 0, P.z - 5); sfx('chime');
      await faceTo(0, P.z - 5, 400);
      await Is('Ren !');
      await Nar('Il la reconnut. Pas Naia : Issana. La vraie. Avec ses cheveux châtains foncés, lisses et défaits pour une fois, sans le chignon négligent du laboratoire, sans les lunettes fines. Ses yeux verts d’eau qui portaient quelque chose qu’il n’avait jamais vu parce qu’il n’avait jamais vraiment regardé ses yeux d’Issana Morales. Pas de la colère. De la douleur.');
      await Is('Ne passe pas ce seuil. S’il te plaît.');
      await Ren('Tu savais que c’était elle dans la simulation. Miyako. Tu savais que Phoenix la ramenait à chaque fois. Et tu as quand même construit ça.');
      await Is('Oui.');
      await Ren('Pourquoi ?');
      await Is('Parce que je t’ai vu. Depuis le début. Depuis avant Evergaze. Tu regardes tout le monde comme si tu cherchais quelque chose qu’ils n’ont pas. Et j’ai pensé que peut-être—');
      await Ren('Que peut-être je cherchais ce que j’avais.'); // clin d'œil canon
      const a = await ask('Issana te regarde. Ce que tu lui dis compte :', ['« Ce que tu as construit était beau. Mais c’était ton beau. Pas le mien. »', '« Tu m’as menti. Tu m’as enfermé. »', '« Je n’ai jamais su regarder ce qui était devant moi. Pardon. »']);
      if (a === 0) { G.stats.kind++; await Nar('La phrase tomba dans le couloir avec la gentillesse particulière des vérités qu’on ne peut pas contredire.'); await Is('Je voulais juste que ça fonctionne.'); }
      else if (a === 1) { await Is('Oui. Et je ne peux pas te dire que je ne le referais pas.'); await Ren('…Mais c’était beau. Je ne peux pas dire le contraire.'); await Nar('C’était vrai. Elle le sut.'); }
      else { G.stats.kind++; G.stats.honest++; await Is('Ne te mets pas à t’excuser. Pas toi. Pas maintenant.'); }
      await Nar('Issana resta immobile. Quelque chose passa sur son visage. Pas du désespoir : quelque chose de plus silencieux. La façon dont les gens regardent une chose qu’ils savaient déjà mais qu’ils avaient espéré ne pas avoir à entendre.');
      await Is('Va. Je vais gérer les systèmes d’ici. Si Miyako entre dans Phoenix sans stabilisation externe, les couches de transition pourraient—');
      await Ren('Tu n’es pas obligée de—'); await Is('Je sais. C’est ma façon de réparer.');
      toast('Observation 015 : Il a dit que c’était beau. Il a dit que c’était mon beau. Ce n’est pas la même chose que dire que ce n’était pas bien. Je n’avais pas prévu ça non plus.', 'HADÈS');
      await Nar('Elle construisit le corridor en sept minutes. Elle vérifia chaque jointure, chaque point de renfort. Propre. Précis. Sans ambiguïté. Puis elle ferma le fichier HADÈS. Elle ne le rouvrit plus.');
      is.g.visible = false; is.hidden = true;
      W.wallZ = 30; W.wallV = 0; state = 'free';
      setMotion(true);
      objective('Cours vers la lumière dorée au bout du couloir.');
      // le couloir est stabilisé : plus de mur
      W.wallG.visible = false;
      W.segs.forEach((s) => { s.gA.visible = true; s.gB.visible = false; });
      W.wallZ = 999;
    };
    const finish = async () => {
      setMotion(false); objective(null);
      await Nar('Il traversa le seuil de lumière dorée.');
      await fade(true, 800);
      go('hall', 'final');
    };
  },
};

/* ---------- Épilogue ---------- */
LEVELS.epilogue = {
  build() {
    const W = G.world;
    env(0x03030a, 8, 60); ambientL(0x3a4580, 0.9, 0x0a0a14);
    room(-7, 7, -5, 5, 3.6, { floor: 0x0c0c14, floorR: 0.2, floorM: 0.4, wall: 0x12142a, ceilC: 0x080810, skip: ['n'] });
    const wm = M(0x12142a);
    box(0, 0.3, -5.1, 14.4, 0.6, 0.2, 0, { mat: wm }); box(0, 3.5, -5.1, 14.4, 0.4, 0.2, 0, { mat: wm });
    for (let x = -6; x <= 6; x += 3) box(x, 1.9, -5.1, 0.1, 3, 0.12, 0x20244a);
    city(55, 70, { cz: -30, spread: 60, y: -30, hmin: 50, hmax: 170 });
    rain(0, -10, 14, 12); light(0xff9ac8, 1.2, -3, 2.6, -2, 14); light(0x6a8aff, 1.0, 3, 2.6, -2, 14);
    box(0, 0.4, -2.4, 3.6, 0.8, 1.4, 0x181a2c, { c: true }); box(0, 0.82, -2.4, 3.8, 0.05, 1.5, 0x0a0a14);
    box(0, 0.9, -1.2, 0.8, 0.8, 0.8, 0x14161e, { c: true });
    light(0x6a7aff, 0.6, 0, 3, 0, 14);
    const ha = npc(CHARS.hayashi(), 0, -3.9, 0, { c: false, face: false }); ha.g.rotation.y = Math.PI; ha.baseYaw = Math.PI; W.ha = ha;
    const na = npc(CHARS.naia(), 1.4, 1.8, Math.PI + 0.4, { c: false, face: false }); W.na = na; na.g.visible = false; na.hidden = true;
    W.mist = particles(200, { x: 1.4, y: 0, z: 1.8, w: 2.2, h: 2.5, d: 2.2 }, 0x6a9aff, 0.1, { x: 0.05, y: 0.04, z: 0 }); W.mist.visible = false;
    glowSprite(1.4, 1.1, 1.8, 0x6a9aff, 5, 0.25).visible = false;
    setPlayer(-3, 3.8, 0.2);
  },
  async run() {
    const W = G.world; setGlasses(false); G.canGlasses = false;
    ambient({ f: [41.2, 61.7, 82.4], cut: 400, vol: 0.05, lfo: 0.03, type: 'sine' });
    await fade(false, 1600); place('NeoCorp', 'Bureau directorial · 47ème étage · même nuit · 02h31');
    setMotion(false);
    await camTo([-3, 1.6, 3.8], [0, 1.5, -3.9], 10);
    await camTo([-1.2, 1.7, 2.8], [0, 1.5, -3.9], 7000);
    await Nar('La ville ne dormait jamais vraiment. Hayashi le savait depuis longtemps : les lumières qui s’éteignaient n’étaient pas de la fatigue. C’était de la dissimulation. Neo-Tokyo faisait semblant de dormir, et lui faisait semblant de ne pas voir.');
    W.na.g.visible = true; W.na.hidden = false; W.mist.visible = true; W.g.children.forEach((c) => { if (c.isSprite) c.visible = true; }); sfx('chime');
    await camTo([0.5, 1.6, 3.6], [1.4, 1.4, 1.8], 2500);
    await illus('trio', 'Hayashi, Issana, Naia : ce que Hayashi sait depuis le début.');
    await Nar('La connexion de Naia s’était établie dans le noir, comme toujours : une brume légère, bleue, qui n’avait pas besoin de lumière pour exister. Il aimait ça, chez elle. Cette façon d’arriver sans demander la permission, comme quelqu’un qui a déjà une clé.');
    await Ha('Vous avez laissé faire.');
    await Na('Miyako a construit son propre passage. Je ne pouvais pas—');
    await Ha('Vous pouviez.');
    await Nar('Le mot tomba entre eux avec la précision d’un scalpel. Hayashi se leva, contourna le bureau avec la lenteur de quelqu’un qui n’a jamais eu besoin de se presser pour imposer sa présence.');
    await Nar('Il le savait depuis le début, bien sûr. Issana Morales. Vingt-six ans. Développeuse senior sur Evergaze. Dossier propre, trop propre, le genre de propre qui signifie que quelqu’un a travaillé dur pour qu’il le soit. Ce qui l’avait intéressé, ce n’était pas ce qu’elle cachait. C’était pourquoi.');
    await Ha('Vous savez ce que ça signifie. Tanaka est sorti. Miyako est entrée. Phoenix est actif. Et vous êtes quand même là.');
    await Na('Je suis là parce que vous m’avez appelée.');
    await Ha('Je vous ai appelée parce que vous attendiez que je le fasse.');
    await Nar('La brume bleue pulsait légèrement : le rythme exact d’une respiration retenue. Hayashi nota le détail sans le commenter. Il s’approcha d’un dernier pas, dans cet espace étroit entre le pouvoir et la curiosité que ni l’un ni l’autre n’aurait su nommer correctement.');
    await Ha('Evergaze m’intéresse. Et vous m’intéressez. Ces deux choses ne sont pas séparables.');
    await Nar('Naia ne recula pas. C’était la réponse qu’il attendait.');
    await Ha('Dormez. Demain, on recommence.');
    W.na.g.visible = false; W.mist.visible = false; sfx('glitch');
    await camTo([-0.5, 1.6, -1.2], [0, 1.5, -6], 3500);
    await Nar('Hayashi resta face à Neo-Tokyo : ses néons violets, sa pluie artificielle, ses millions de fenêtres qui faisaient semblant d’être éteintes. Il sourit. Pas pour la ville. Pour lui-même.');
    await Nar('Phoenix actif. Tanaka libre. Miyako dans le système. Exactement comme prévu.');
    await sleep(1200);
    await fade(true, 2400);
    await cards([{ tag: 'Fin du Tome 1', t: '« On ne peut vivre que le présent. »', bg: '#02030a', color: '#e9ecff' }], 5200);
    endScreen();
  },
};
