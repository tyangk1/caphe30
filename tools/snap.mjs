// node tools/snap.mjs <url-path> <out.png> [width height] [selector]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../suong/video/node_modules/playwright-core');
const [path, out, w = '1500', h = '1100', sel] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
await p.goto('http://127.0.0.1:4516/' + path); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
if (sel) await p.locator(sel).screenshot({ path: out, omitBackground: true }); else await p.screenshot({ path: out, fullPage: true });
await b.close();
