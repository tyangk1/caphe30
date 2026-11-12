// Photo plates: every chapter is one photograph, made to breathe on a single WebGL canvas.
// Nothing is drawn that is not in the photo: steam drifts (the photo's own dark air is displaced
// along a rising flow field), fire light flickers (only the orange pixels), liquid marbles, a water
// stream shimmers, a drop swells, lets go and falls. Scroll sets which plate shows and a slow push-in.
// All coordinates are in full-source UVs (x right, y down); the mobile file is a 9:16 crop of the
// same source, mapped back through `crop`, so one set of masks serves both.

const M = (x0, cw) => [x0, 0, cw, 1];
const STEAM = [0.30, 0.24, 0.19];

export const PLATES = {
  hero: {
    d: { src: 'assets/img/p-phin-giot-169.webp', pos: [1, 0.5] },
    m: { src: 'assets/img/hero-phin-m.webp', pos: [0.76, 0.5], own: true },
    // desktop (landscape phin over a glass)
    fx: {
      focus: [0.829, 0.56], steam: [[0.62, 0.535, 1.05, 0.77]], flow: [0.012, 0.007], wisp: 0.2, wispC: STEAM, vel: [0, 0.16, 0, 0.11],
      drip: { tip: [0.829, 0.515], dc: [0.829, 0.552], dr: [0.026, 0.05], c0: [0.829, 0.566], fr: [0.017, 0.021], y1: 0.78, fall: 0.18 },
      scrim: [0, 0, 0, 0],
    },
    // mobile keeps its own portrait photo (1536x2560 source, the first hero)
    fxm: {
      focus: [0.701, 0.6], steam: [[-0.2, -0.2, 0.3, 0.35], [-0.2, -0.2, 0.135, 0.53], [-0.2, 0.565, 1.2, 0.79], [-0.2, -0.2, 1.2, 0.045]],
      flow: [0.022, 0.012], wisp: 0.32, wispC: STEAM, vel: [0, 0.16, 0, 0.11], feather: 0.045,
      drip: { tip: [0.701, 0.567], dc: [0.701, 0.628], dr: [0.056, 0.088], c0: [0.701, 0.648], fr: [0.036, 0.027], y1: 0.9, fall: 0.24 },
      scrim: [0, 0, 0, 0], // the top shade comes from #hero::after (css)
    },
  },
  dat: {
    d: { src: 'assets/img/p-dat-do.webp', pos: [0.3, 0.5] },
    m: { src: 'assets/img/p-dat-do-m.webp', crop: M(0.1806, 0.2386) },
    // morning mist drifts sideways through the valley
    fx: { focus: [0.42, 0.62], steam: [[-0.1, 0.1, 1.1, 0.43]], flow: [0.012, 0.003], wisp: 0.16, wispC: [0.34, 0.27, 0.24], vel: [-0.05, 0, -0.025, 0], wispS: [1.4, 7], scrim: [1, 0, 0.78, -0.25], scrimM: [0, 1, 0.75, 0.05] },
  },
  lua: {
    d: { src: 'assets/img/p-rang.webp', pos: [0.5, 0.5] },
    m: { src: 'assets/img/p-rang-m.webp', crop: M(0.4629, 0.314) },
    // smoke through the dark air, fire light breathing on the drum; the beans stay put
    fx: { focus: [0.6, 0.45], steam: [[0.36, -0.1, 0.97, 0.66]], flow: [0.012, 0.01], darkOnly: 1, wisp: 0.2, wispC: [0.2, 0.22, 0.27], vel: [0, 0.2, 0, 0.13], warm: [0.05, -0.1, 1.1, 0.9], warmK: 0.5, scrim: [-1, 0, 0.6, 0.0], scrimM: [0, 1, 0.75, 0.05] },
  },
  recipe: {
    d: { src: 'assets/img/p-hat-rang.webp', pos: [0.5, 0.5] },
    m: { src: 'assets/img/p-hat-rang-m.webp', crop: M(0.403, 0.314) },
    fx: { focus: [0.55, 0.6], steam: [[0.48, -0.1, 0.92, 0.42]], flow: [0.014, 0.008], darkOnly: 1, wisp: 0.22, wispC: STEAM, vel: [0, 0.14, 0, 0.1], scrim: [1, 0, 0.55, 0.0], scrimM: [0, 1, 0.75, 0.05] },
  },
  nuoc: {
    d: { src: 'assets/img/p-rot-nuoc.webp', pos: [0.5, 0.5] },
    m: { src: 'assets/img/p-rot-nuoc-m.webp', crop: M(0.343, 0.314) },
    fx: {
      focus: [0.52, 0.42], steam: [[0.53, -0.1, 0.76, 0.3]], flow: [0.016, 0.009], darkOnly: 1, wisp: 0.24, wispC: STEAM, vel: [0, 0.18, 0, 0.12],
      stream: [0.455, 0.12, 0.545, 0.47], streamK: 0.0011, liq: [0.38, 0.37, 0.65, 0.58], liqK: [0.0035, 0.003], liqV: 0.9,
      scrim: [1, 0, 0.5, 0.0], scrimM: [0, 1, 0.75, 0.05],
    },
  },
  sua: {
    d: { src: 'assets/img/p-sua-dac.webp', pos: [0.5, 0.5] },
    m: { src: 'assets/img/p-sua-dac-m.webp', crop: M(0.343, 0.314) },
    fx: {
      focus: [0.5, 0.36], steam: [[0.24, -0.1, 0.78, 0.2]], flow: [0.012, 0.006], darkOnly: 1, wisp: 0.14, wispC: STEAM, vel: [0, 0.14, 0, 0.1],
      liq: [0.26, 0.48, 0.75, 0.79], liqK: [0.006, 0.003], liqV: 0.1,
      drip: { tip: [0.5, 0.137], dc: [0.5, 0.163], dr: [0.02, 0.042], c0: [0.5, 0.166], fr: [0.013, 0.024], y1: 0.46, fall: 0.2 },
      scrim: [-1, 0, 0.6, 0.0], scrimM: [0, 1, 0.75, 0.05],
    },
  },
  da: {
    d: { src: 'assets/img/p-da-roi.webp', pos: [0.5, 0.5] },
    m: { src: 'assets/img/p-da-roi-m.webp', crop: M(0.343, 0.314) },
    fx: { focus: [0.5, 0.3], scrim: [-1, 0, 0.55, 0.0], scrimM: [0, 1, 0.75, 0.05], push: 0.12 },
  },
  stir: {
    d: { src: 'assets/img/p-ly-sua-da-toi.webp', pos: [0.5, 0.5] },
    m: { src: 'assets/img/p-ly-sua-da-toi-m.webp', crop: M(0.3481, 0.314) },
    fx: {
      focus: [0.505, 0.5], steam: [[0.4, -0.1, 0.63, 0.15]], flow: [0.01, 0.006], darkOnly: 1, wisp: 0.12, wispC: STEAM, vel: [0, 0.14, 0, 0.1],
      liq: [0.398, 0.34, 0.6, 0.86], liqK: [0.004, 0.0015], liqV: 0.12,
      scrim: [0, 1, 0.7, 0.1], scrimM: [0, 1, 0.8, 0.05], push: 0.05,
    },
  },
};
export const GLASS = [0.39, 0.14, 0.625, 0.93]; // the final glass, for the stir zone

const VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
const FS = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes, uOff, uSize, uFocus;
uniform vec4 uCrop;
uniform float uTime, uZoom, uAlpha, uDim;
uniform vec4 uSteam[4];
uniform vec4 uSteamK;   // flow amp xy, wisp amount, dark-only
uniform vec4 uVel;      // flow velocity xy, wisp velocity xy
uniform vec4 uWispS;    // wisp scale xy, mask feather
uniform vec3 uWispC;
uniform vec4 uLiq, uLiqK;  // rect; amp xy, phase
uniform vec4 uStream; uniform float uStreamK;
uniform vec4 uWarm; uniform float uWarmK;
uniform float uDrip, uGrow, uFallY, uFallA, uStretch;
uniform vec2 uTip, uDC, uDR, uC0, uFR;
uniform vec4 uScrim;    // direction xy (screen), strength, start
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a*n(p); p = p*2.03 + 7.1; a *= 0.5; } return s; }
vec3 tex(vec2 uv){ return texture2D(uTex, clamp((uv - uCrop.xy) / uCrop.zw, vec2(0.0), vec2(1.0))).rgb; }
float rm(vec4 r, vec2 p, float f){
  return smoothstep(r.x - f, r.x + f, p.x) * (1.0 - smoothstep(r.z - f, r.z + f, p.x))
       * smoothstep(r.y - f, r.y + f, p.y) * (1.0 - smoothstep(r.w - f, r.w + f, p.y)); }
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 s = px / uRes;
  vec2 uv = uCrop.xy + (px - uOff) / uSize * uCrop.zw;
  uv = uFocus + (uv - uFocus) / uZoom;
  float t = uTime;

  // where the air is: steam regions, kept clear of the drop and (optionally) of anything lit
  float m = 0.0;
  for (int i = 0; i < 4; i++) m = max(m, rm(uSteam[i], uv, uWispS.z));
  if (uDrip > 0.5) m *= smoothstep(1.2, 2.2, length((uv - uDC) / uDR));
  if (uSteamK.w > 0.5) m *= 1.0 - smoothstep(0.09, 0.26, dot(tex(uv), vec3(0.3, 0.55, 0.15)));

  vec2 q = uv * vec2(3.2, 2.0);
  vec2 flow = vec2(fbm(q + uVel.xy * t), fbm(q + vec2(4.7, 2.1) + uVel.xy * t)) - 0.5;
  vec2 suv = uv + flow * uSteamK.xy * m;

  // liquid that keeps marbling
  float lm = rm(uLiq, uv, 0.02);
  vec2 lq = uv * vec2(9.0, 14.0);
  vec2 lf = vec2(fbm(lq + vec2(uLiqK.z, 0.0)), fbm(lq + vec2(3.3, 1.7) + vec2(uLiqK.z * 0.7, uLiqK.z * 0.2))) - 0.5;
  suv += lf * uLiqK.xy * lm;

  // a thin water stream: ripples run down it
  suv.x += sin(uv.y * 260.0 - t * 24.0) * uStreamK * rm(uStream, uv, 0.008);

  vec3 col = tex(suv);

  // new wisps that rise (or drift) and thin out
  float w = fbm(vec2(uv.x * uWispS.x + fbm(uv * 2.5 + vec2(0.0, t * 0.07)) * 2.2 + uVel.z * t, uv.y * uWispS.y + uVel.w * t));
  col += smoothstep(0.52, 0.86, w) * m * uWispC * uSteamK.z;

  // fire light: only the orange pixels breathe
  float warm = clamp((col.r - col.b) * 2.2 - 0.35, 0.0, 1.0) * rm(uWarm, uv, 0.05);
  float fl = (n(vec2(t * 5.0, 0.0)) - 0.5) * 0.6 + (n(vec2(t * 1.3, 4.0)) - 0.5) * 0.9;
  col *= 1.0 + warm * fl * uWarmK;

  if (uDrip > 0.5) {
    // the hanging drop swells: its own pixels, scaled about the tip
    float dm = 1.0 - smoothstep(0.75, 1.0, length((uv - uDC) / uDR));
    vec2 grown = uTip + (uv - uTip) / vec2(0.82 + 0.18 * uGrow, uGrow);
    col = mix(col, tex(grown), dm);
    // the drop that let go: the bulb's pixels, stretched by speed
    vec2 c = vec2(uC0.x, uFallY);
    vec2 r = vec2(uFR.x, uFR.y * uStretch);
    float fm = (1.0 - smoothstep(0.7, 1.0, length((uv - c) / r))) * uFallA;
    col = mix(col, tex(uC0 + (uv - c) * vec2(1.0, 1.0 / uStretch)), fm);
  }

  // keep the copy side readable, and a soft lens falloff
  float sd = dot(s - 0.5, uScrim.xy) * 2.0;
  col *= 1.0 - uScrim.z * smoothstep(uScrim.w, 1.0, sd);
  vec2 v = s - 0.5; col *= 1.0 - 0.32 * dot(v, v);
  gl_FragColor = vec4(col * uDim, uAlpha);
}`;

const NAMES = ['uTex', 'uRes', 'uOff', 'uSize', 'uFocus', 'uCrop', 'uTime', 'uZoom', 'uAlpha', 'uDim', 'uSteam', 'uSteamK', 'uVel', 'uWispS', 'uWispC', 'uLiq', 'uLiqK', 'uStream', 'uStreamK', 'uWarm', 'uWarmK', 'uDrip', 'uGrow', 'uFallY', 'uFallA', 'uStretch', 'uTip', 'uDC', 'uDR', 'uC0', 'uFR', 'uScrim'];
const ZERO4 = [0, 0, 0, 0];

export function createPlates(canvas, { mobile, reduced }) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; NAMES.forEach((k) => { U[k] = gl.getUniformLocation(prog, k); });
  gl.uniform1i(U.uTex, 0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(14 / 255, 9 / 255, 7 / 255, 1);

  // textures: load on demand, keep only those near the current chapter
  const cache = new Map();
  function want(src) {
    let e = cache.get(src);
    if (e) return e;
    e = { tex: null, w: 0, h: 0 };
    cache.set(src, e);
    const im = new Image(); im.decoding = 'async'; im.src = src;
    (im.decode ? im.decode() : new Promise((r) => { im.onload = r; })).then(() => {
      if (cache.get(src) !== e) return;
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      e.tex = t; e.w = im.naturalWidth; e.h = im.naturalHeight;
    }).catch(() => cache.delete(src));
    return e;
  }
  function keep(srcs) {
    for (const [src, e] of cache) if (!srcs.includes(src)) { if (e.tex) gl.deleteTexture(e.tex); cache.delete(src); }
    srcs.forEach(want);
  }

  let W = 1, H = 1, dpr = 1;
  const dprMax = Math.min(devicePixelRatio || 1, 1.5);
  function layout(scale = 1) {
    dpr = dprMax * scale;
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  layout();

  const variant = (k) => { const P = PLATES[k]; const v = mobile() ? P.m : P.d; return { v, fx: (mobile() && P.fxm) || P.fx }; };
  const srcOf = (k) => variant(k).v.src;
  // cover + object-position for a plate's file, in css px
  function cover(k) {
    const { v } = variant(k); const e = cache.get(v.src);
    if (!e || !e.tex) return null;
    const pos = mobile() ? [0.5, 0.5] : v.pos;
    const sc = Math.max(W / e.w, H / e.h), dw = e.w * sc, dh = e.h * sc;
    return { e, v, off: [(W - dw) * pos[0], (H - dh) * (mobile() && v.own ? 0.5 : pos[1])], size: [dw, dh], crop: v.crop || [0, 0, 1, 1], pos };
  }
  // mobile hero keeps its own object-position (76% 50%)
  function coverFor(k) {
    const c = cover(k); if (!c) return null;
    if (mobile() && c.v.own) { const sc = Math.max(W / c.e.w, H / c.e.h), dw = c.e.w * sc, dh = c.e.h * sc; c.off = [(W - dw) * c.v.pos[0], (H - dh) * c.v.pos[1]]; }
    return c;
  }
  // source uv -> css px on screen, for laying DOM over a plate (zoom about focus included)
  function project(k, u, v, zoom = 1) {
    const c = coverFor(k); if (!c) return null;
    const { fx } = variant(k); const F = fx.focus;
    const zu = F[0] + (u - F[0]) * zoom, zv = F[1] + (v - F[1]) * zoom;
    return [c.off[0] + (zu - c.crop[0]) / c.crop[2] * c.size[0], c.off[1] + (zv - c.crop[1]) / c.crop[3] * c.size[1]];
  }

  const f4 = (a) => (a ? a : ZERO4);
  function drawPlate(k, alpha, zoom, t, extra, dim = 1) {
    const c = coverFor(k); if (!c) return false;
    const { fx } = variant(k);
    gl.bindTexture(gl.TEXTURE_2D, c.e.tex);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform2f(U.uOff, c.off[0] * dpr, c.off[1] * dpr);
    gl.uniform2f(U.uSize, c.size[0] * dpr, c.size[1] * dpr);
    gl.uniform4fv(U.uCrop, c.crop);
    gl.uniform2fv(U.uFocus, fx.focus);
    gl.uniform1f(U.uTime, t);
    gl.uniform1f(U.uZoom, zoom);
    gl.uniform1f(U.uAlpha, alpha);
    gl.uniform1f(U.uDim, dim);
    const st = new Float32Array(16); (fx.steam || []).slice(0, 4).forEach((r, i) => st.set(r, i * 4));
    gl.uniform4fv(U.uSteam, st);
    const flow = fx.flow || [0, 0];
    gl.uniform4f(U.uSteamK, flow[0], flow[1], fx.wisp || 0, fx.darkOnly || 0);
    gl.uniform4fv(U.uVel, fx.vel || ZERO4);
    const ws = fx.wispS || [5, 2.4];
    gl.uniform4f(U.uWispS, ws[0], ws[1], fx.feather || 0.04, 0);
    gl.uniform3fv(U.uWispC, fx.wispC || [0, 0, 0]);
    gl.uniform4fv(U.uLiq, f4(fx.liq));
    const lk = fx.liqK || [0, 0]; const boost = (extra && extra.liqBoost) || 0;
    gl.uniform4f(U.uLiqK, lk[0] * (1 + boost * 2.2), lk[1] * (1 + boost * 1.2), (extra && extra.liqPhase) || t * (fx.liqV || 0), 0);
    gl.uniform4fv(U.uStream, f4(fx.stream));
    gl.uniform1f(U.uStreamK, reduced ? 0 : fx.streamK || 0);
    gl.uniform4fv(U.uWarm, f4(fx.warm));
    gl.uniform1f(U.uWarmK, reduced ? 0 : fx.warmK || 0);
    const sc = (mobile() ? fx.scrimM : null) || fx.scrim || ZERO4;
    gl.uniform4fv(U.uScrim, sc);
    const d = fx.drip;
    gl.uniform1f(U.uDrip, d ? 1 : 0);
    if (d) {
      // drip cycle: swell, let go, fall (gravity), a short pause
      const PERIOD = 2.8, SWELL = PERIOD - d.fall - 0.11;
      const ph = reduced ? 0 : t % PERIOD;
      const grow = reduced ? 1 : ph < SWELL ? 0.62 + 0.38 * Math.pow(ph / SWELL, 1.6) : 0.62;
      const ft = ph - SWELL, falling = !reduced && ft >= 0 && ft < d.fall, kk = falling ? ft / d.fall : 0;
      gl.uniform2fv(U.uTip, d.tip); gl.uniform2fv(U.uDC, d.dc); gl.uniform2fv(U.uDR, d.dr); gl.uniform2fv(U.uC0, d.c0); gl.uniform2fv(U.uFR, d.fr);
      gl.uniform1f(U.uGrow, grow);
      gl.uniform1f(U.uFallY, d.c0[1] + (d.y1 - d.c0[1]) * kk * kk);
      gl.uniform1f(U.uFallA, falling ? 1 - Math.max(0, (kk - 0.55) / 0.45) : 0);
      gl.uniform1f(U.uStretch, 1 + 1.6 * kk);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  }

  // layers: [{ k, alpha, zoom, extra }], bottom first
  function render(layers, t) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    let drew = false;
    for (const L of layers) if (L.alpha > 0.001) drew = drawPlate(L.k, drew ? L.alpha : 1, L.zoom, reduced ? 0 : t, L.extra, L.dim ?? 1) || drew;
    return drew;
  }
  const ready = (k) => { const e = cache.get(srcOf(k)); return !!(e && e.tex); };
  return { render, layout, keep, srcOf, ready, project, fxOf: (k) => variant(k).fx };
}
