const { chromium } = require('playwright-core');
const fs = require('fs');
const three = fs.readFileSync('/home/user/reprog/lib/three.min.js', 'utf8');
(async () => {
  const start = +process.argv[2] || 0;
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 480 } });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_FAILED')) errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join('|')));
  await page.route('**/*', (r) => { const u = r.request().url(); if (u.includes('three.min.js')) return r.fulfill({ contentType: 'application/javascript', body: three }); if (u.startsWith('file://')) return r.continue(); return r.abort(); });
  await page.goto('file:///home/user/reprog/dist/game.html'); await page.waitForTimeout(1200);
  await page.evaluate((s) => {
    const { G, P } = window.__game; window.__log = []; window.__use = {}; let lastLvl = null; let t0 = Date.now(); let stuck = 0, lastSig = '';
    const R = () => Math.random();
    setInterval(() => {
      const lv = G.levelId + ':' + G.lvMode; if (lv !== lastLvl) { lastLvl = lv; window.__log.push(((Date.now() - t0) / 1000 | 0) + 's ' + lv); }
      const dlg = document.getElementById('dlg');
      if (!document.getElementById('mini').hidden) { if (window.__ps) window.__ps(); return; }
      if (document.getElementById('cards').classList.contains('on')) { document.getElementById('cards').click(); return; }
      if (document.getElementById('ill').classList.contains('on')) { document.getElementById('ill').click(); return; }
      if (!dlg.hidden) {
        const bs = dlg.querySelectorAll('#choices button');
        if (bs.length) bs[(R() * bs.length) | 0].click(); else dlg.click();
        return;
      }
      if (G.mode !== 'play') return;
      const W = G.world; if (!W) return;
      const avail = W.inter.filter((o) => !o.done && (!o.when || o.when()));
      const key = (o) => o.label; 
      const marked = avail.filter((o) => o.mark !== false);
      const pool = marked.length ? marked : avail;
      if (pool.length) {
        pool.sort((a, b) => (window.__use[key(a)] || 0) - (window.__use[key(b)] || 0));
        const o = pool[0]; window.__use[key(o)] = (window.__use[key(o)] || 0) + 1;
        const d = o.any ? 0 : 1.0;
        P.x = o.x - 0.0; P.z = o.z + d; P.yaw = Math.atan2(-(o.x - P.x), -(o.z - P.z)); P.ghost = true;
        setTimeout(() => { P.ghost = G.levelId === 'fete'; }, 50);
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
        return;
      }
      // rien d'interactable : avancer
      if (G.levelId === 'corridor') { P.z -= 0.9; if (G.world.wallZ < 100) {} }
      else if (G.levelId === 'hall' && G.lvMode === 'final') { P.x += (9 - P.x) * 0.3; P.z += (-1 - P.z) * 0.3; }
      else if (G.levelId === 'hall') { P.x *= 0.7; P.z *= 0.8; }
      else if (G.levelId === 'cantine' && W.sil) { P.x = lerpv(P.x, W.sil.g.position.x, 0.2); P.z -= 0.6; }
      function lerpv(a, b, t) { return a + (b - a) * t; }
    }, 140);
    window.__game.startGame(s);
  }, start);
  const t0 = Date.now(); let last = '';
  while (Date.now() - t0 < 1000 * (+process.argv[3] || 600)) {
    await page.waitForTimeout(5000);
    const st = await page.evaluate(() => ({ log: window.__log.slice(-3), end: !document.getElementById('end').hidden, mode: window.__game.G.mode, lvl: window.__game.G.levelId, txt: (document.getElementById('txt') || {}).textContent.slice(0, 60) }));
    const sig = JSON.stringify(st); if (sig !== last) { console.log(((Date.now() - t0) / 1000 | 0) + 's', JSON.stringify(st)); last = sig; }
    if (st.end) { console.log('REACHED END'); break; }
    if (errs.length) { console.log('ERRORS', errs); break; }
  }
  console.log('DBG', await page.evaluate(() => JSON.stringify(window.__game.dbg()))); console.log('LOG', await page.evaluate(() => window.__log.join(' | ')));
  console.log('ERRS', errs.length ? errs.join('\n') : 'none');
  await page.screenshot({ path: '/home/user/reprog/shots/bot_last.png' });
  await browser.close();
})();
