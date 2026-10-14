const { chromium } = require('playwright-core'); const fs = require('fs');
const three = fs.readFileSync('/home/user/reprog/lib/three.min.js', 'utf8');
(async () => {
  const [,, id, mode] = process.argv;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 800, height: 480 } });
  await page.route('**/*', (r) => { const u = r.request().url(); if (u.includes('three.min.js')) return r.fulfill({ contentType: 'application/javascript', body: three }); if (u.startsWith('file://')) return r.continue(); return r.abort(); });
  await page.goto('file:///home/user/reprog/dist/game.html'); await page.waitForTimeout(1000);
  await page.evaluate(([i, m]) => { document.getElementById('menu').hidden = true; window.__game.go(i, m); }, [id, mode]);
  await page.waitForTimeout(3000);
  // passer les dialogues d'intro sans toucher aux interactions
  for (let i = 0; i < 40; i++) { const vis = await page.evaluate(() => !document.getElementById('dlg').hidden); if (vis) { await page.keyboard.press('Space'); await page.waitForTimeout(150); } else break; }
  await page.waitForTimeout(800);
  const p0 = await page.evaluate(() => ({ x: window.__game.P.x, z: window.__game.P.z, m: window.__game.G.mode }));
  for (const k of ['KeyW', 'KeyD', 'KeyS']) { await page.keyboard.down(k); await page.waitForTimeout(700); await page.keyboard.up(k); }
  const p1 = await page.evaluate(() => ({ x: window.__game.P.x, z: window.__game.P.z, m: window.__game.G.mode }));
  console.log(JSON.stringify(p0), '->', JSON.stringify(p1)); await b.close();
})();
