const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const three = fs.readFileSync('/home/user/reprog/lib/three.min.js', 'utf8');
(async () => {
  const [,, id, mode, waitMs, tag, auto] = process.argv;
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 650 } });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
  await page.route('**/*', (r) => {
    const u = r.request().url();
    if (u.includes('three.min.js')) return r.fulfill({ contentType: 'application/javascript', body: three });
    if (u.startsWith('file://')) return r.continue();
    return r.abort();
  });
  await page.goto('file:///home/user/reprog/dist/game.html');
  await page.waitForTimeout(1500);
  if (!id || id === 'menu') {
    await page.screenshot({ path: `/home/user/reprog/shots/menu.png` });
  } else {
    await page.evaluate(([i, m]) => { document.getElementById('menu').hidden = true; window.__game.go(i, m === 'x' ? undefined : m); }, [id, mode || 'x']);
    const total = +waitMs || 4000;
    const steps = Math.ceil(total / 500);
    for (let k = 0; k < steps; k++) {
      await page.waitForTimeout(500);
      if (auto) {
        await page.keyboard.press('Space');
        await page.evaluate(() => { const b = document.querySelector('#choices button'); if (b) b.click(); });
      }
    }
    await page.screenshot({ path: `/home/user/reprog/shots/${tag || id}.png` });
  }
  console.log('ERRORS:', errs.length ? '\n' + errs.slice(0, 12).join('\n') : 'none');
  await browser.close();
})();
