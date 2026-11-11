// Chrome trace of a scroll through part of the page; prints what the long main-thread tasks were made of.
// node tools/trace.mjs [fromProgress toProgress]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../suong/video/node_modules/playwright-core');
const [from = '0.5', to = '0.8'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:4516/');
await page.waitForTimeout(3500);
const H = await page.evaluate(() => document.getElementById('scroll-track').offsetHeight - innerHeight);
await page.evaluate((y) => scrollTo(0, y), Math.round(H * +from));
await page.waitForTimeout(1500);
const cdp = await page.context().newCDPSession(page);
const events = [];
cdp.on('Tracing.dataCollected', (d) => events.push(...d.value));
const done = new Promise((r) => cdp.once('Tracing.tracingComplete', r));
await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,v8.execute,blink.user_timing,gpu', transferMode: 'ReportEvents' });
await page.mouse.move(600, 450);
const steps = Math.round((+to - +from) * H / 120);
for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(45); }
await page.waitForTimeout(800);
await cdp.send('Tracing.end'); await done;
// top-level main-thread tasks > 50 ms and what they contain
const main = events.filter((e) => e.name === 'RunTask' && e.dur > 50000);
const kids = events.filter((e) => e.ph === 'X' && e.dur > 3000 && e.name !== 'RunTask');
const summary = main.slice(0, 12).map((t) => {
  const inside = kids.filter((k) => k.pid === t.pid && k.tid === t.tid && k.ts >= t.ts && k.ts + k.dur <= t.ts + t.dur);
  const agg = {};
  for (const k of inside) agg[k.name] = (agg[k.name] || 0) + k.dur / 1000;
  return { ms: +(t.dur / 1000).toFixed(1), parts: Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, v]) => `${n} ${v.toFixed(1)}`) };
});
const totals = {};
for (const k of kids) totals[k.name] = (totals[k.name] || 0) + k.dur / 1000;
console.log(JSON.stringify({ longTasks: main.length, summary, totals: Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([n, v]) => `${n} ${v.toFixed(0)}ms`) }, null, 1));
await browser.close();
