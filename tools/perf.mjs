// Frame-time audit: wheel-scroll the whole page like a person (through Lenis) and record every frame.
// node tools/perf.mjs [width height]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../suong/video/node_modules/playwright-core');
const [w = '1440', h = '900'] = process.argv.slice(2);
const HEADED = process.env.HEADED === '1';
const browser = await chromium.launch({ channel: 'chrome', headless: !HEADED, args: ['--use-angle=d3d11', '--enable-gpu', '--disable-frame-rate-limit'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
await page.goto('http://127.0.0.1:4516/?perf=' + Date.now());
if (process.env.CSS) await page.addStyleTag({ content: process.env.CSS });
await page.waitForTimeout(3500);
const gpu = await page.evaluate(() => { const g = document.getElementById('gl').getContext('webgl2') || document.getElementById('gl').getContext('webgl'); const e = g && g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'n/a'; });
console.error('GPU', gpu);
await page.evaluate(() => {
  window.__ft = []; let last = performance.now();
  const tick = (t) => { const p = scrollY / (document.getElementById('scroll-track').offsetHeight - innerHeight); window.__ft.push([t - last, p]); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  new PerformanceObserver((l) => { window.__lt = (window.__lt || []).concat(l.getEntries().map((e) => [e.duration, scrollY])); }).observe({ type: 'longtask', buffered: true });
});
await page.mouse.move(+w * 0.4, +h * 0.5);
const total = await page.evaluate(() => document.getElementById('scroll-track').offsetHeight);
for (let y = 0; y < total; y += 120) { await page.mouse.wheel(0, 120); await page.waitForTimeout(45); }
await page.waitForTimeout(1500);
const res = await page.evaluate(() => {
  const ft = window.__ft.slice(5).map((f) => f[0]);
  const s = [...ft].sort((a, b) => a - b), q = (k) => s[Math.floor(s.length * k)];
  const chapters = { hero: [0, 0.05], dat: [0.05, 0.19], lua: [0.19, 0.32], recipe: [0.32, 0.5], pour: [0.5, 0.55], nuoc: [0.55, 0.8], milk: [0.8, 0.88], stir: [0.88, 1] };
  const per = {};
  for (const [k, [a, b]] of Object.entries(chapters)) {
    const xs = window.__ft.filter((f) => f[1] >= a && f[1] < b).map((f) => f[0]).sort((x, y) => x - y);
    if (xs.length) per[k] = { n: xs.length, p50: +xs[Math.floor(xs.length * 0.5)].toFixed(1), p95: +xs[Math.floor(xs.length * 0.95)].toFixed(1), max: +xs[xs.length - 1].toFixed(1), over33: xs.filter((x) => x > 33.4).length };
  }
  const js = [...(window.__js || [])].sort((a, b) => a - b);
  const jsq = { p50: +js[Math.floor(js.length * 0.5)].toFixed(2), p95: +js[Math.floor(js.length * 0.95)].toFixed(2), max: +js[js.length - 1].toFixed(1), over16: js.filter((x) => x > 16).length };
  const lt = (window.__lt || []).map((x) => Math.round(x[0]));
  return { jsq, lt, frames: ft.length, avgFps: +(1000 / (ft.reduce((a, b) => a + b, 0) / ft.length)).toFixed(1), p50: +q(0.5).toFixed(1), p95: +q(0.95).toFixed(1), p99: +q(0.99).toFixed(1), max: +s[s.length - 1].toFixed(1), over33: ft.filter((x) => x > 33.4).length, longTasks: (window.__lt || []).length, per };
});
console.log(JSON.stringify(res, null, 1));
await browser.close();
