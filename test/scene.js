const { chromium } = require('playwright-core'); const fs = require('fs');
const three = fs.readFileSync('/home/user/reprog/lib/three.min.js', 'utf8');
(async () => {
  const [,, id, mode, out, js, w1, w2, vw, vh] = process.argv;
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: +vw || 1100, height: +vh || 650 } });
  const errs = []; page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_FAILED')) errs.push(m.text()); }); page.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  await page.route('**/*', (r) => { const u = r.request().url(); if (u.includes('three.min.js')) return r.fulfill({ contentType: 'application/javascript', body: three }); if (u.startsWith('file://')) return r.continue(); return r.abort(); });
  await page.goto('file:///home/user/reprog/dist/game.html'); await page.waitForTimeout(1000);
  await page.evaluate(([i, m]) => { document.getElementById('menu').hidden = true; window.__game.go(i, m === 'x' ? undefined : m); }, [id, mode || 'x']);
  await page.waitForTimeout(+w1 || 3000);
  if (js && js !== '-') { await page.evaluate(js); await page.waitForTimeout(+w2 || 2500); }
  await page.screenshot({ path: '/home/user/reprog/shots/' + out + '.png' });
  console.log('ERRS', errs.length ? errs.join('\n') : 'none'); await browser.close();
})();
