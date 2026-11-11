// Screenshot the page at scroll progress points, scrolling in small steps so the simulation keeps up.
// node tools/shots.mjs <outDir> [width height] [p1,p2,...]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../suong/video/node_modules/playwright-core');

const [out, w = '1440', h = '900', list] = process.argv.slice(2);
const points = (list || '0.12,0.17,0.25,0.31,0.36,0.45,0.53,0.62,0.71,0.77,0.85,0.97').split(',').map(Number);
const browser = await chromium.launch({ channel: 'chrome', args: ['--hide-scrollbars', '--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, hasTouch: +w < 800, isMobile: +w < 800 });
const errs = [];
page.on('pageerror', (e) => errs.push('PE ' + e.message));
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ' ' + m.text().slice(0, 220)); });
await page.goto('http://127.0.0.1:4516/?v=' + Date.now());
await page.waitForTimeout(4200);
await page.screenshot({ path: `${out}/s000.png` });
const prog = () => page.evaluate(() => scrollY / (document.getElementById('scroll-track').offsetHeight - innerHeight));
for (const p of points) {
  const from = await prog();
  for (let i = 1; i <= 25; i++) {
    await page.evaluate((q) => scrollTo(0, (document.getElementById('scroll-track').offsetHeight - innerHeight) * q), from + (p - from) * i / 25);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${out}/s${String(Math.round(p * 1000)).padStart(3, '0')}.png` });
}
const fps = await page.evaluate(() => new Promise((r) => { let c = 0; const t0 = performance.now(); const f = () => { c++; performance.now() - t0 < 1000 ? requestAnimationFrame(f) : r(c); }; f(); }));
console.log(JSON.stringify({ fps, errs: errs.slice(0, 20) }));
await browser.close();
