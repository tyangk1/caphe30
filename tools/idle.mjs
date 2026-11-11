// Frame times with NO input, parked at a few scroll points: separates page cost from input/harness noise.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../suong/video/node_modules/playwright-core');
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:4516/' + (process.env.Q || ''));
if (process.env.CSS) await page.addStyleTag({ content: process.env.CSS });
await page.waitForTimeout(3500);
const out = {};
for (const p of (process.env.PTS || '0.02,0.15,0.27,0.4,0.7,0.84,0.95').split(',').map(Number)) {
  await page.evaluate((q) => scrollTo(0, (document.getElementById('scroll-track').offsetHeight - innerHeight) * q), p);
  await page.waitForTimeout(2500);
  out[p] = await page.evaluate(() => new Promise((r) => { const ft = []; let last = performance.now(); const t0 = last;
    const f = (t) => { ft.push(t - last); last = t; if (t - t0 < 4000) requestAnimationFrame(f); else { ft.sort((a, b) => a - b); r({ fps: +(1000 * ft.length / 4000).toFixed(0), p50: +ft[ft.length >> 1].toFixed(1), p95: +ft[Math.floor(ft.length * 0.95)].toFixed(1), max: +ft[ft.length - 1].toFixed(1), over33: ft.filter((x) => x > 33.4).length }); } };
    requestAnimationFrame(f); }));
}
out.dprChanges = await page.evaluate(() => window.__dprChanges || 0);
console.log(JSON.stringify(out, null, 0));
await browser.close();
