// Hero plate: the phin photo made to breathe (js/plates.js, plate "hero"): steam drifts in the glass,
// the drop swells, lets go and falls; a slow push-in. The <img> paints first; this canvas takes over.
// Desktop uses the landscape photo (subject right, copy left); phones keep the portrait one.
import { createPlates } from './plates.js';

const box = document.getElementById('hero');
const canvas = box && box.querySelector('canvas');
const mq = matchMedia('(max-width: 760px)');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
let stage = null;
try { stage = canvas && createPlates(canvas, { mobile: () => mq.matches, reduced: REDUCED }); } catch (e) { console.error(e); }

if (stage) {
  addEventListener('resize', () => stage.layout());
  const t0 = performance.now();
  let shown = false;
  const frame = (ms) => {
    requestAnimationFrame(frame);
    stage.keep([stage.srcOf('hero')]);
    if (document.hidden || parseFloat(box.style.opacity || '1') <= 0.001) return;
    const t = (ms - t0) / 1000;
    if (stage.render([{ k: 'hero', alpha: 1, zoom: 1 + 0.06 * (1 - Math.exp(-t / 10)) }], t) && !shown) { shown = true; canvas.style.opacity = 1; }
  };
  requestAnimationFrame(frame);
}
