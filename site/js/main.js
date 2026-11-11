// MỘT GIỌT · concept. One fixed WebGL stage driven by scroll progress.
// ĐẤT → LỬA → (Sáng Tạo 1–5) → pour → NƯỚC → SỮA → stir.
import * as THREE from 'three';
import Lenis from 'lenis';

const MOBILE = matchMedia('(max-width: 760px)').matches;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const win = (a, b, v, f = 0.012) => smooth(a, a + f, v) * (1 - smooth(b - f, b, v)); // 0→1→0 window
const lerp = (a, b, t) => a + (b - a) * t;
const track = (e) => { try { window.umami && window.umami.track(e); } catch (_) { /* stats are optional */ } };

// chapter map on the scroll track (0..1)
const T = { hero: [0, 0.05], dat: [0.05, 0.19], lua: [0.19, 0.32], recipe: [0.32, 0.5], pour: [0.5, 0.55], nuoc: [0.55, 0.8], milk: [0.8, 0.88], stir: [0.88, 1] };
const span = (k, p) => clamp((p - T[k][0]) / (T[k][1] - T[k][0]));

// ---------- renderer ----------
const canvas = $('#gl');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !location.search.includes('noaa'), alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.add('no-gl');
  throw e;
}
const DPR_MAX = Math.min(devicePixelRatio, MOBILE ? 1.5 : 1.75);
let dpr = DPR_MAX;
renderer.setPixelRatio(dpr);
renderer.setClearColor(0x000000, 0);
renderer.autoClear = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 400);
camera.position.set(0, 0, 60);
const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const overlay = new THREE.Scene();
const quad = new THREE.PlaneGeometry(2, 2);
const viewH = () => 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
const viewW = () => viewH() * camera.aspect;
const toWorld = (sx, sy, out) => out.set((sx / innerWidth - 0.5) * viewW(), (0.5 - sy / innerHeight) * viewH(), 0);

// ---------- lenis ----------
let lenis = null;
if (!REDUCED) { lenis = new Lenis({ lerp: 0.085, smoothWheel: true }); }

// ---------- textures ----------
const loader = new THREE.TextureLoader();
const tex = (u) => { const t = loader.load(u); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; return t; };
const beanTex = tex('assets/img/beans.webp');
const cremaTex = tex('assets/img/crema.webp'); cremaTex.wrapS = cremaTex.wrapT = THREE.MirroredRepeatWrapping;

// ---------- bean swarm (instanced sprites from the photo atlas) ----------
const N = MOBILE ? 420 : 1100;
const ROWS = { green: 0, robusta: 1, arabica: 2, excelsa: 3, catimor: 4, culi: 5 };
const geo = new THREE.PlaneGeometry(1, 1);
const aCol = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
const aRow = new THREE.InstancedBufferAttribute(new Float32Array(N).fill(1), 1);
const aShade = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
for (let i = 0; i < N; i++) { aCol.array[i] = i % 9; aShade.array[i] = (Math.random() - 0.5) * 0.18; }
geo.setAttribute('aCol', aCol); geo.setAttribute('aRow', aRow); geo.setAttribute('aShade', aShade);
const beanMat = new THREE.ShaderMaterial({
  uniforms: { map: { value: beanTex }, uRoast: { value: 0 }, uRamp: { value: new THREE.Color('#a8834a') }, uGlow: { value: 0 } },
  alphaToCoverage: true,
  vertexShader: /* glsl */`
    attribute float aCol; attribute float aRow; attribute float aShade;
    varying vec2 vUvG; varying vec2 vUvR; varying float vShade; varying float vFog;
    void main() {
      vUvG = vec2((aCol + uv.x) / 9.0, 1.0 - (1.0 - uv.y) / 6.0);
      vUvR = vec2((aCol + uv.x) / 9.0, 1.0 - (aRow + 1.0 - uv.y) / 6.0);
      vShade = aShade;
      vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      vFog = clamp(1.0 - (-mv.z - 56.0) / 26.0, 0.5, 1.0);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */`
    uniform sampler2D map; uniform float uRoast; uniform vec3 uRamp; uniform float uGlow;
    varying vec2 vUvG; varying vec2 vUvR; varying float vShade; varying float vFog;
    void main() {
      vec4 g = texture2D(map, vUvG);
      vec4 r = texture2D(map, vUvR);
      float L = dot(g.rgb, vec3(0.3, 0.59, 0.11));
      float s1 = smoothstep(0.04, 0.42, uRoast), s2 = smoothstep(0.6, 0.96, uRoast);
      vec3 col = mix(g.rgb, uRamp * L * 1.85, s1);
      col = mix(col, r.rgb, s2);
      float a = mix(g.a, r.a, s2);
      if (a < 0.5) discard;
      col *= (1.0 + vShade) * vFog;
      col += uGlow * vec3(0.55, 0.28, 0.08) * a;
      gl_FragColor = vec4(col, 1.0);
    }`,
});
const beans = new THREE.InstancedMesh(geo, beanMat, N);
beans.frustumCulled = false; // instances travel far from their first bounds
beans.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(beans);

const S = { // per-bean state, struct of arrays
  p: new Float32Array(N * 3), v: new Float32Array(N * 3), t: new Float32Array(N * 3),
  ang: new Float32Array(N), angV: new Float32Array(N), ph: new Float32Array(N), phV: new Float32Array(N),
  size: new Float32Array(N), orb: new Float32Array(N), rad: new Float32Array(N), dep: new Float32Array(N), delay: new Float32Array(N), gone: new Float32Array(N),
};
for (let i = 0; i < N; i++) {
  S.p[i * 3] = (Math.random() - 0.5) * 70; S.p[i * 3 + 1] = -40 - Math.random() * 25; S.p[i * 3 + 2] = (Math.random() - 0.5) * 8;
  S.ang[i] = Math.random() * 6.28; S.angV[i] = (Math.random() - 0.5) * 2.4;
  S.ph[i] = Math.random() * 6.28; S.phV[i] = 0.6 + Math.random() * 2.2;
  S.size[i] = (MOBILE ? 0.78 : 0.92) * (0.85 + Math.random() * 0.3);
  S.orb[i] = Math.random() * 6.28; S.rad[i] = 0.3 + Math.random() * 0.7; S.dep[i] = (Math.random() - 0.5) * 10;
  S.delay[i] = Math.random();
}

// digit targets sampled from text drawn with the display font
function sample(text, aspect) {
  const H = 260, W = Math.round(H * aspect), c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const lines = text.split('|'), fs = H * 0.98 / lines.length;
  x.font = `800 ${fs}px "Bricolage Grotesque", "Arial Black", sans-serif`;
  lines.forEach((l, k) => x.fillText(l, W / 2, fs * (k + 0.54)));
  const d = x.getImageData(0, 0, W, H).data, pts = [];
  for (let j = 0; j < H; j += 2) for (let i = 0; i < W; i += 2) if (d[(j * W + i) * 4 + 3] > 140) pts.push([i / H - aspect / 2, 0.5 - j / H]);
  for (let i = pts.length - 1; i > 0; i--) { const k = (Math.random() * (i + 1)) | 0; [pts[i], pts[k]] = [pts[k], pts[i]]; }
  return pts;
}
const RECIPES = [
  { n: '1', mix: [['culi', 1]], line: 'Culi Robusta: chỉ những hạt culi tròn, mỗi quả cà phê chỉ có một hạt.' },
  { n: '2', mix: [['robusta', 0.5], ['arabica', 0.5]], line: 'Robusta và Arabica.' },
  { n: '3', mix: [['arabica', 1]], line: 'Arabica.' },
  { n: '4', mix: [['robusta', 0.25], ['arabica', 0.25], ['excelsa', 0.25], ['catimor', 0.25]], line: 'Bốn giống: Robusta, Arabica, Excelsa và Catimor.' },
  { n: '5', mix: [['culi', 1]], line: 'Culi Arabica.' },
];
let PTS = null; // filled once the font is ready

// ---------- the opening drop + ripples ----------
const drop = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 24), new THREE.MeshBasicMaterial({ color: '#3a1d0c' }));
drop.scale.set(0.8, 1.15, 0.8); scene.add(drop);
const dropHi = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), new THREE.MeshBasicMaterial({ color: '#d9a46a', transparent: true, opacity: 0.8 }));
scene.add(dropHi);
const rings = Array.from({ length: 4 }, () => {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 128), new THREE.MeshBasicMaterial({ color: '#c9a24b', transparent: true, opacity: 0, side: THREE.DoubleSide }));
  m.rotation.x = -1.28; scene.add(m); return m;
});


// ---------- splash crown for the opening drop ----------
const SPL = 26;
const splashMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: '#4a2610', transparent: true, opacity: 0 }), SPL);
splashMesh.frustumCulled = false; scene.add(splashMesh);
const spl = Array.from({ length: SPL }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), s: 1 }));
let splT = -1;
function splash() {
  if (REDUCED) return;
  const y = -viewH() * 0.3;
  spl.forEach((d, i) => { const a = (i / SPL) * Math.PI * 2; d.p.set(0, y, 0); d.v.set(Math.cos(a) * (4 + Math.random() * 4), 8 + Math.random() * 7, Math.sin(a) * 3); d.s = 0.5 + Math.random() * 0.9; });
  splT = 0;
}
function stepSplash(dt) {
  if (splT < 0) return;
  splT += dt;
  spl.forEach((d, i) => { d.v.y -= 30 * dt; d.p.addScaledVector(d.v, dt); const k = d.s * clamp(1 - splT / 1.1); splashMesh.setMatrixAt(i, M.compose(d.p, Q.identity(), SC.set(k, k * 1.3, k))); });
  splashMesh.instanceMatrix.needsUpdate = true;
  splashMesh.material.opacity = clamp(1 - splT / 1.1);
  if (splT > 1.2) { splT = -1; splashMesh.material.opacity = 0; }
}

// ---------- chaff at first crack ----------
const CH = MOBILE ? 220 : 520;
const chaffGeo = new THREE.BufferGeometry();
chaffGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CH * 3), 3));
const flake = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 15); g.addColorStop(0, 'rgba(235,200,150,1)'); g.addColorStop(0.6, 'rgba(215,170,115,.7)'); g.addColorStop(1, 'rgba(200,150,100,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(16, 16, 15, 9, 0.6, 0, 6.3); x.fill(); return new THREE.CanvasTexture(c); })();
const chaff = new THREE.Points(chaffGeo, new THREE.PointsMaterial({ map: flake, color: '#ffffff', size: 0.34, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true }));
scene.add(chaff);
const chaffV = new Float32Array(CH * 3);
let chaffT = -1, shakeT = -1, cracked = false;
function crack() {
  const a = chaffGeo.attributes.position.array;
  for (let i = 0; i < CH; i++) {
    const b = ((Math.random() * N) | 0) * 3;
    a[i * 3] = S.p[b]; a[i * 3 + 1] = S.p[b + 1]; a[i * 3 + 2] = S.p[b + 2];
    const th = Math.random() * 6.28, sp = 8 + Math.random() * 16;
    chaffV[i * 3] = Math.cos(th) * sp; chaffV[i * 3 + 1] = Math.abs(Math.sin(th)) * sp; chaffV[i * 3 + 2] = (Math.random() - 0.5) * sp;
  }
  chaffGeo.attributes.position.needsUpdate = true;
  chaffT = 0; if (!REDUCED) shakeT = 0;
  for (let i = 0; i < N * 3; i++) S.v[i] += (Math.random() - 0.5) * 1.6;
  track('first-crack');
}

// ---------- liquid (NƯỚC + SỮA) as a full-screen pass ----------
function textTexture(lines, size) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  lines.forEach(([s, sz, y, w = 800]) => { x.font = `${w} ${sz}px "Bricolage Grotesque", "Arial Black", sans-serif`; x.fillText(s, 1024, y); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}
const liquidMat = new THREE.ShaderMaterial({
  transparent: true, depthTest: false, depthWrite: false,
  uniforms: {
    uLevel: { value: 0 }, uTime: { value: 0 }, uAspect: { value: 1 }, uText: { value: null }, uText2: { value: null }, uTextMix: { value: 0 },
    uTextOn: { value: 0 }, uMilk: { value: 0 }, uPour: { value: 0 }, uFade: { value: 1 }, uSlosh: { value: 0 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: /* glsl */`
    varying vec2 vUv;
    uniform float uLevel, uTime, uAspect, uTextMix, uTextOn, uMilk, uPour, uFade, uSlosh;
    uniform sampler2D uText, uText2;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
    // the 2:1 text canvas spans the screen width; its height follows the screen's aspect
    float textA(vec2 uv){
      vec2 q = uv - 0.5; vec2 t = vec2(q.x + 0.5, q.y * 2.0 / uAspect + 0.5);
      if (t.y < 0.0 || t.y > 1.0) return 0.0;
      return mix(texture2D(uText, t).a, texture2D(uText2, t).a, uTextMix); }
    void main(){
      vec2 uv = vUv;
      float amp = 1.0 + uSlosh * 3.0;
      float wave = amp * (0.008 * sin(uv.x * 8.0 + uTime * 1.5) + 0.004 * sin(uv.x * 21.0 - uTime * 2.2)) + uSlosh * 0.02 * sin(uv.x * 3.1 - uTime * 3.0);
      float surf = uLevel + wave * smoothstep(0.0, 0.05, uLevel) * (1.0 - smoothstep(0.95, 1.0, uLevel));
      float below = step(uv.y, surf);
      // text above the coffee: crisp cream; under it: refracted and tinted
      float ta = textA(uv) * uTextOn;
      vec2 off = vec2(sin(uv.y * 38.0 + uTime * 2.0), sin(uv.x * 29.0 + uTime * 1.7)) * 0.007;
      float tb = textA(uv + off) * uTextOn;
      float depth = clamp((surf - uv.y) / max(surf, 0.001), 0.0, 1.0);
      vec3 coffee = mix(vec3(0.24, 0.12, 0.05), vec3(0.06, 0.028, 0.014), pow(depth, 0.6));
      // crema band and a bright meniscus line
      float band = 1.0 - smoothstep(0.0, 0.035, surf - uv.y);
      coffee = mix(coffee, vec3(0.62, 0.40, 0.22), band * 0.75 * smoothstep(0.02, 0.1, uLevel));
      float line = exp(-pow((uv.y - surf) * 260.0, 2.0));
      // condensed milk: a falling stream, then clouds that curl into the coffee
      vec2 c = uv - vec2(0.5, surf * 0.55);
      float r = length(c * vec2(uAspect, 1.0)), th = atan(c.y, c.x);
      vec2 sw = vec2(cos(th + r * 6.0 - uTime * 0.6), sin(th + r * 6.0 - uTime * 0.6)) * r * 3.0;
      float clouds = 0.0;
      if (uMilk > 0.001) clouds = smoothstep(0.52, 0.72, fbm(sw * 1.6 + uTime * 0.05)) * uMilk * smoothstep(0.65, 0.0, r * (1.15 - uMilk * 0.5));
      vec3 milk = vec3(0.93, 0.86, 0.74);
      coffee = mix(coffee, mix(milk, vec3(0.78, 0.6, 0.42), 0.35), clouds);
      float stream = (1.0 - smoothstep(0.004, 0.009, abs(uv.x - 0.5 + 0.004 * sin(uv.y * 30.0 + uTime * 4.0)))) * step(surf, uv.y) * uPour;
      vec3 col = mix(vec3(0.0), coffee, below);
      col = mix(col, vec3(0.95, 0.9, 0.82) * 0.5, tb * 0.5 * below);
      col += vec3(0.9, 0.7, 0.45) * line * 0.6 * below;
      float a = below + (1.0 - below) * max(ta, stream);
      col = mix(col, vec3(0.95, 0.92, 0.86), (1.0 - below) * ta);
      col = mix(col, milk, (1.0 - below) * stream);
      gl_FragColor = vec4(col, a * uFade);
      #ifdef SIMPLE
      gl_FragColor = vec4(0.2, 0.1, 0.05, below);
      #endif
    }`,
});
if (location.search.includes('simple')) liquidMat.defines = { SIMPLE: 1 };
const liquid = new THREE.Mesh(quad, liquidMat); liquid.frustumCulled = false; overlay.add(liquid);

// ---------- stir (final top-down cup) ----------
const SIM = 256;
const rtOpts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
let rtA = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts), rtB = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts);
const simMat = new THREE.ShaderMaterial({
  uniforms: { uPrev: { value: null }, uPoint: { value: new THREE.Vector2(-9, -9) }, uForce: { value: new THREE.Vector2() }, uTime: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: /* glsl */`
    varying vec2 vUv; uniform sampler2D uPrev; uniform vec2 uPoint, uForce; uniform float uTime;
    void main(){
      vec2 d = texture2D(uPrev, vUv).xy;
      vec2 adv = texture2D(uPrev, vUv - d * 0.012).xy * 0.988;
      vec2 q = vUv - uPoint; float g = exp(-dot(q, q) / 0.006);
      adv += uForce * g;
      // a slow rim current keeps the cup alive
      vec2 c = vUv - 0.5; adv += vec2(-c.y, c.x) * 0.0016;
      gl_FragColor = vec4(adv, 0.0, 1.0);
    }`,
});
const simScene = new THREE.Scene(); const simQuad = new THREE.Mesh(quad, simMat); simQuad.frustumCulled = false; simScene.add(simQuad);
// latte art: "30" drawn soft, then pushed around by the same field
const artCanvas = document.createElement('canvas'); artCanvas.width = artCanvas.height = 512;
const artTex = new THREE.CanvasTexture(artCanvas); artTex.colorSpace = THREE.NoColorSpace;
function drawArt() {
  const x = artCanvas.getContext('2d'); x.clearRect(0, 0, 512, 512);
  x.filter = 'blur(5px)'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '800 250px "Bricolage Grotesque", "Arial Black", sans-serif'; x.fillText('30', 256, 270);
  x.filter = 'none'; artTex.needsUpdate = true;
}
const stirMat = new THREE.ShaderMaterial({
  transparent: true, depthTest: false, depthWrite: false,
  uniforms: { uField: { value: null }, uCrema: { value: cremaTex }, uArt: { value: artTex }, uArtOn: { value: 0 }, uCenter: { value: new THREE.Vector2() }, uR: { value: 100 }, uOn: { value: 0 }, uTime: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: /* glsl */`
    uniform sampler2D uField, uCrema, uArt; uniform float uArtOn, uR, uOn, uTime; uniform vec2 uCenter;
    void main(){
      vec2 px = gl_FragCoord.xy - uCenter; float d = length(px);
      vec2 luv = px / (2.0 * uR) + 0.5;
      vec2 f = texture2D(uField, luv).xy;
      vec2 cuv = luv - f * 0.09;
      float rot = 0.04 * sin(uTime * 0.2);
      cuv = (mat2(cos(rot), -sin(rot), sin(rot), cos(rot)) * (cuv - 0.5)) * 0.92 + 0.5;
      vec3 crema = texture2D(uCrema, cuv).rgb;
      // foam has a soft but defined edge, a light brown halo where it meets the crema, and a little texture
      float raw = texture2D(uArt, luv - f * 0.09).a;
      float art = smoothstep(0.32, 0.6, raw) * uArtOn;
      float halo = smoothstep(0.12, 0.34, raw) * (1.0 - smoothstep(0.34, 0.6, raw)) * uArtOn;
      vec3 milk = vec3(0.96, 0.91, 0.82) * (0.9 + 0.1 * dot(crema, vec3(0.6)));
      vec3 col = mix(crema, vec3(0.78, 0.58, 0.38), halo * 0.55);
      col = mix(col, milk, art * 0.95);
      // the cup: coffee inside, a porcelain rim, soft shadow outside
      float inside = 1.0 - smoothstep(uR - 1.5, uR + 0.5, d);
      float rim = smoothstep(uR - 1.0, uR, d) * (1.0 - smoothstep(uR + uR * 0.09, uR + uR * 0.09 + 1.5, d));
      vec3 porcelain = mix(vec3(0.93, 0.91, 0.87), vec3(0.72, 0.69, 0.64), clamp((px.y / uR) * 0.5 + 0.5, 0.0, 1.0));
      col *= 1.0 - 0.35 * smoothstep(uR * 0.6, uR, d);
      vec3 outc = mix(col, porcelain, rim);
      float a = max(inside, rim);
      float shadow = (1.0 - smoothstep(uR * 1.09, uR * 1.4, d)) * 0.5 * (1.0 - a);
      gl_FragColor = vec4(outc * a, max(a, shadow) * uOn);
    }`,
});
const stirQuad = new THREE.Mesh(quad, stirMat); stirQuad.frustumCulled = false; overlay.add(stirQuad);

// ---------- DOM bits ----------
const beatsEl = Object.fromEntries([...document.querySelectorAll('.beat')].map((b) => [b.dataset.beat, b]));
const bubbles = [...document.querySelectorAll('.bub')].map((el, i) => ({ el, at: +el.dataset.at, lane: i % 2 }));
const phinEl = $('#phin'), sachet = $('#sachet'), bgDat = $('#bg-dat'), dripDot = $('#drip i'), cursor = $('#cursor'), zone = $('#stir-zone');
const flyBox = $('#flyers');
const luaH2 = beatsEl.lua.querySelector('h2');
const FLY = [];
fetch('assets/flyers.json').then((r) => r.json()).then((f) => {
  const add = (kind, n, count, w0, w1) => {
    for (let k = 0; k < count; k++) {
      const img = new Image(); img.src = `assets/img/fly-${kind}-${k % n}.webp`; img.alt = '';
      const w = lerp(w0, w1, Math.random()) * (MOBILE ? 0.6 : 1); img.style.width = w + 'px';
      flyBox.appendChild(img); img.decode && img.decode().catch(() => {});
      FLY.push({ img, kind, x: Math.random(), y: 0.2 + Math.random() * 1.2, z: Math.random(), rot: (Math.random() - 0.5) * 80, rv: (Math.random() - 0.5) * 40 });
    }
  };
  add('cherry', f.cherry, MOBILE ? 5 : 9, 60, 150); add('leaf', f.leaf, MOBILE ? 3 : 6, 110, 230); add('ice', f.ice, MOBILE ? 4 : 7, 70, 130);
});

// pointer
const mouse = { x: -1e4, y: -1e4, nx: 9, ny: 9 };
const mouseW = new THREE.Vector3(1e4, 1e4, 0);
addEventListener('pointermove', (e) => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
}, { passive: true });
document.querySelectorAll('a').forEach((a) => { a.addEventListener('pointerenter', () => cursor.classList.add('big')); a.addEventListener('pointerleave', () => cursor.classList.remove('big')); });
$('#cta').addEventListener('click', () => track('official-click'));
$('#logo').addEventListener('click', (e) => { e.preventDefault(); lenis ? lenis.scrollTo(0, { duration: 2.2 }) : scrollTo({ top: 0, behavior: 'smooth' }); });

// stirring
const stir = { last: null, energy: 0, art: 0, done: false, idle: 0, auto: 0 };
function stirAt(lx, ly, fx, fy) {
  simMat.uniforms.uPoint.value.set(lx, ly);
  simMat.uniforms.uForce.value.set(fx, fy);
  stir.energy += Math.hypot(fx, fy);
}
zone.addEventListener('pointermove', (e) => {
  const r = zone.getBoundingClientRect();
  const lx = (e.clientX - r.left) / r.width, ly = 1 - (e.clientY - r.top) / r.height;
  if (stir.last) stirAt(lx, ly, (lx - stir.last[0]) * 3.2, (ly - stir.last[1]) * 3.2);
  stir.last = [lx, ly]; stir.idle = 0;
});
zone.addEventListener('pointerenter', () => cursor.classList.add('big'));
zone.addEventListener('pointerleave', () => { stir.last = null; cursor.classList.remove('big'); });

// ---------- resize ----------
const rects = { phin: null, zone: null };
function measure() { rects.phin = phinEl.getBoundingClientRect(); rects.zone = zone.getBoundingClientRect(); }
function resize() {
  const w = innerWidth, h = innerHeight;
  measure();
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  liquidMat.uniforms.uAspect.value = w / h;
}
addEventListener('resize', resize); resize();

// ---------- once the display font is in ----------
let text30, text89;
document.fonts.load('800 200px "Bricolage Grotesque"').catch(() => {}).then(() => {
  PTS = { y1996: MOBILE ? sample('19|96', 0.95) : sample('1996', 2.6), d: RECIPES.map((r) => sample(r.n, 0.75)) };
  text30 = textTexture([['30 NĂM', 260, 480], ['1996 — 2026', 56, 660, 600]]);
  text89 = textTexture([['89%', 330, 480], ['thử mù G7, 2003', 56, 680, 600]]);
  liquidMat.uniforms.uText.value = text30; liquidMat.uniforms.uText2.value = text89;
  drawArt();
  warmUp();
});


// ---------- warm-up: compile all shaders and decode all images up front, so no chapter stalls on first sight ----------
function warmUp() {
  const vis = [beans.visible, liquid.visible, stirQuad.visible];
  beans.visible = liquid.visible = stirQuad.visible = true;
  renderer.compile(scene, camera); renderer.compile(overlay, ortho); renderer.compile(simScene, ortho);
  renderer.initTexture && [beanTex, cremaTex, artTex].forEach((t) => renderer.initTexture(t));
  [beans.visible, liquid.visible, stirQuad.visible] = vis;
  document.querySelectorAll('#bubbles img, #phin, #sachet, #bg-dat img').forEach((i) => i.decode && i.decode().catch(() => {}));
}

// ---------- the loop ----------
const clock = new THREE.Clock();
const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), SC = new THREE.Vector3(), Z = new THREE.Vector3(0, 0, 1);
const RAY = new THREE.Raycaster(), NDC = new THREE.Vector2(), PLANE = new THREE.Plane(Z, 0), PHINW = new THREE.Vector3();
const RAMP = [[0, '#7d8a5c'], [0.3, '#a39c62'], [0.5, '#a8834a'], [0.68, '#7a4a28'], [0.85, '#56341e'], [1, '#2b170d']].map(([t, c]) => [t, new THREE.Color(c)]);
const rampAt = (t, out) => { for (let i = 1; i < RAMP.length; i++) if (t <= RAMP[i][0]) return out.copy(RAMP[i - 1][1]).lerp(RAMP[i][1], (t - RAMP[i - 1][0]) / (RAMP[i][0] - RAMP[i - 1][0])); return out.copy(RAMP[RAMP.length - 1][1]); };
let slosh = 0, landT = 0, lastRecipe = -2, seen = {}, recipeT = 0, prevRi = 0, curRi = 0;
const show = (el, v) => { const o = v.toFixed(3); if (el.__o !== o) { el.__o = o; el.style.opacity = o; el.style.visibility = v > 0.001 ? 'visible' : 'hidden'; } };
const once = (k) => { if (!seen[k]) { seen[k] = 1; track(k); } };

function setRecipe(i) {
  const r = RECIPES[i];
  $('#r-k').textContent = `0${r.n} / 05`; $('#r-h').textContent = `Sáng Tạo ${r.n}`; $('#r-p').textContent = r.line;
  let acc = 0; const cuts = r.mix.map(([k, f]) => [k, (acc += f)]);
  for (let b = 0; b < N; b++) { const u = (b + 0.5) / N; aRow.array[b] = ROWS[cuts.find(([, c]) => u <= c + 1e-9)[0]]; }
  aRow.needsUpdate = true;
}

const fstat = { n: 0, sum: 0 };
const PERF = location.search.includes('perf'); if (PERF) window.__js = [];
function frame(ms) {
  const t0 = PERF ? performance.now() : 0;
  if (lenis) lenis.raf(ms);
  const dt = Math.min(clock.getDelta(), 1 / 30), now = clock.elapsedTime;
  const max = document.getElementById('scroll-track').offsetHeight - innerHeight;
  const p = clamp(scrollY / Math.max(1, max));
  dripDot.style.top = `calc(${p * 100}% - ${p * 11}px)`;
  const W = viewW(), H = viewH();

  // --- hero drop ---
  const fall = REDUCED ? 1 : clamp((now - 0.3) / 1.25);
  const sy = -H * 0.3;
  drop.position.set(0, lerp(H * 0.62, sy, fall * fall), 0); dropHi.position.set(-0.22, drop.position.y + 0.35, 0.6);
  drop.visible = dropHi.visible = fall < 1;
  if (fall >= 1 && !landT) { landT = now; splash(); }
  const heroP = span('hero', p);
  rings.forEach((r, i) => {
    const k = landT ? clamp((now - landT - i * 0.3) / 2.8) : 0;
    r.position.set(0, sy, 0); r.scale.setScalar(0.5 + k * W * 0.6);
    r.material.opacity = landT ? (1 - k) * 0.5 * (1 - heroP) : 0;
  });
  const heroIn = landT ? clamp((now - landT) / 1.1) : 0;
  beatsEl.hero.style.opacity = heroIn * (1 - smooth(0.02, 0.05, p));
  beatsEl.hero.style.transform = `translateY(${-p * 600}px)`;

  stepSplash(dt);

  // --- chapter progress ---
  const dat = span('dat', p), lua = span('lua', p), rec = span('recipe', p), pour = span('pour', p), nuoc = span('nuoc', p), milk = span('milk', p), stirP = span('stir', p);
  if (dat > 0.05) once('ch-dat'); if (lua > 0.05) once('ch-lua'); if (nuoc > 0.05) once('ch-nuoc'); if (stirP > 0.05) once('ch-sua');

  show(bgDat, smooth(0.04, 0.08, p) * (1 - smooth(0.18, 0.22, p)));
  bgDat.style.transform = `scale(${1.08 - dat * 0.08}) translateY(${dat * -2}%)`;
  beatsEl.dat.style.opacity = win(0.085, 0.185, p);
  beatsEl.lua.style.opacity = win(0.205, 0.315, p);
  beatsEl.recipe.style.opacity = win(0.325, 0.5, p);
  beatsEl.nuoc.style.opacity = win(0.5, 0.585, p);
  beatsEl.sua.style.opacity = smooth(0.9, 0.93, p);

  // roast: 0 in ĐẤT, rises through LỬA, stays roasted for the recipes
  const roast = p < T.lua[0] ? 0 : lua;
  beanMat.uniforms.uRoast.value = roast;
  rampAt(roast, beanMat.uniforms.uRamp.value);
  const tempC = 25 + roast * 205;
  if (tempC >= 196 && !cracked && p < T.recipe[0]) { cracked = true; crack(); }
  if (tempC < 185) cracked = false;
  const luaTxt = p >= T.lua[0] && p < T.recipe[0] ? `Rang · ${Math.round(tempC)}°C` : 'Rang';
  if (luaTxt !== luaH2.textContent) luaH2.textContent = luaTxt;

  // which recipe digit
  const ri = p >= T.recipe[0] && p < T.recipe[1] ? Math.min(4, Math.floor(rec * 5)) : -1;
  if (ri !== lastRecipe) {
    lastRecipe = ri;
    if (ri >= 0) { setRecipe(ri); prevRi = curRi; curRi = ri; recipeT = now; }
    else { aRow.array.fill(1); aRow.needsUpdate = true; }
  }

  // --- bean targets ---
  const cx = MOBILE ? 0 : -W * 0.13, cy = MOBILE ? H * 0.1 : 0;
  NDC.set(mouse.x / innerWidth * 2 - 1, -(mouse.y / innerHeight) * 2 + 1); RAY.setFromCamera(NDC, camera);
  RAY.ray.intersectPlane(PLANE, mouseW);
  const phinR = rects.phin; const phinW = toWorld(phinR.left + phinR.width / 2, phinR.top + phinR.height * 0.55, PHINW);
  const visible = PTS && p > T.dat[0] - 0.01 && p < T.pour[1] + 0.01;
  beans.visible = !!visible;
  if (visible) {
    const digitH = H * (MOBILE ? 0.46 : 0.74);
    const drumR = Math.min(W, H) * (MOBILE ? 0.32 : 0.3);
    for (let i = 0; i < N; i++) {
      const o = i * 3;
      let tx, ty, tz;
      if (p < T.lua[0] + 0.01 && dat < 0.93) {
        // ĐẤT: rise from the soil, staggered, into "1996"
        const s = PTS.y1996[i % PTS.y1996.length], k = smooth(S.delay[i] * 0.3, S.delay[i] * 0.3 + 0.3, dat);
        const w = MOBILE ? Math.min(H * 0.4, W * 0.85 / 0.95) : H * 0.34;
        tx = lerp((S.delay[i] - 0.5) * W, s[0] * w + (MOBILE ? 0 : -W * 0.13), k); ty = lerp(-H * 0.75, s[1] * w + cy, k); tz = S.dep[i] * 0.3;
      } else if (ri < 0 && p < T.pour[0]) {
        // LỬA: the roaster drum, beans lifted and dropped
        // a real drum: paddles carry beans up the wall at different depths, then they pour back down in a wide cascade
        const u = (S.orb[i] / 6.2832 + now * (0.14 + lua * 0.2) * (0.85 + S.rad[i] * 0.3)) % 1;
        const R = drumR, ri2 = R * (0.42 + 0.58 * S.rad[i]);
        const a0 = -2.5, a1 = 0.95;
        if (u < 0.58) {
          const a = lerp(a0, a1, u / 0.58);
          tx = cx + Math.cos(a) * ri2; ty = cy + Math.sin(a) * ri2 * 0.92;
        } else {
          const f = (u - 0.58) / 0.42;
          const x0 = cx + Math.cos(a1) * ri2, y0 = cy + Math.sin(a1) * ri2 * 0.92;
          const x1 = cx + Math.cos(a0) * ri2 - S.delay[i] * R * 0.25, y1 = cy + Math.sin(a0) * ri2 * 0.92;
          tx = lerp(x0, x1, f); ty = y0 + (y1 - y0) * (f * f * 0.8 + f * 0.2);
        }
        tz = S.dep[i];
      } else if (ri >= 0) {
        const ready = now - recipeT > S.delay[i] * 0.45; // staggered: a wave, not a block
        const s = PTS.d[ready ? ri : Math.max(0, prevRi)][i % PTS.d[ri].length] || PTS.d[ri][i % PTS.d[ri].length];
        tx = cx + s[0] * digitH; ty = cy + s[1] * digitH; tz = S.dep[i] * 0.3;
      } else {
        // pour: a stream into the phin
        const k = smooth(S.delay[i] * 0.55, S.delay[i] * 0.55 + 0.4, pour);
        tx = lerp(cx + (S.delay[i] - 0.5) * 4, phinW.x, k); ty = lerp(cy, phinW.y, k); tz = 0;
      }
      S.t[o] = tx; S.t[o + 1] = ty; S.t[o + 2] = tz;
      // cursor pushes beans aside
      const dx = S.p[o] - mouseW.x, dy = S.p[o + 1] - mouseW.y, d = Math.hypot(dx, dy);
      if (d < 4.5 && d > 0.01) { const f = (4.5 - d) * 9 * dt; S.v[o] += dx / d * f; S.v[o + 1] += dy / d * f; }
      const k = ri >= 0 ? 7 : 4.2, damp = Math.pow(0.012, dt);
      for (let a = 0; a < 3; a++) { S.v[o + a] = (S.v[o + a] + (S.t[o + a] - S.p[o + a]) * k * dt) * damp; S.p[o + a] += S.v[o + a] * dt * 6; }
      // spin and the coin-flip that sells the 3D
      const calm = ri >= 0 ? 0.15 : 1;
      S.ang[i] += S.angV[i] * dt * calm; S.ph[i] += S.phV[i] * dt * calm;
      const near = ri < 0 && p >= T.pour[0] ? clamp(Math.hypot(S.p[o] - phinW.x, S.p[o + 1] - phinW.y) / 3) : 1;
      const sz = S.size[i] * near;
      SC.set(sz * (0.6 + 0.4 * Math.abs(Math.cos(S.ph[i]))), sz, 1);
      Q.setFromAxisAngle(Z, S.ang[i]);
      P.set(S.p[o], S.p[o + 1], S.p[o + 2]);
      beans.setMatrixAt(i, M.compose(P, Q, SC));
    }
    beans.instanceMatrix.needsUpdate = true;
  }
  beanMat.uniforms.uGlow.value = chaffT >= 0 ? clamp(1 - chaffT / 0.9) * 0.6 : 0;

  // chaff
  if (chaffT >= 0) {
    chaffT += dt;
    const a = chaffGeo.attributes.position.array;
    const drag = Math.pow(0.18, dt);
    for (let i = 0; i < CH * 3; i += 3) {
      chaffV[i + 1] -= 4 * dt; chaffV[i] *= drag; chaffV[i + 1] *= drag; chaffV[i + 2] *= drag;
      a[i] += (chaffV[i] + Math.sin(now * 5 + i) * 1.2) * dt; a[i + 1] += chaffV[i + 1] * dt; a[i + 2] += chaffV[i + 2] * dt;
    }
    chaffGeo.attributes.position.needsUpdate = true;
    chaff.material.opacity = clamp(1 - chaffT / 1.8) * 0.9;
    if (chaffT > 2) chaffT = -1;
  }
  camera.position.x = camera.position.y = 0;
  if (shakeT >= 0) { shakeT += dt; const s = Math.max(0, 0.32 - shakeT) * 1.5; camera.position.x = (Math.random() - 0.5) * s; camera.position.y = (Math.random() - 0.5) * s; if (shakeT > 0.35) shakeT = -1; }

  // --- flyers: cherries and leaves in ĐẤT, ice in SỮA ---
  const fd = win(0.05, 0.2, p, 0.03), fi = win(0.79, 0.9, p, 0.02);
  for (const f of FLY) {
    const on = f.kind === 'ice' ? fi : fd;
    if (on <= 0) { show(f.img, 0); continue; }
    const prog = f.kind === 'ice' ? milk : dat;
    const speed = 0.35 + f.z * 0.9;
    const y = f.kind === 'ice' ? lerp(-0.3 - f.y * 0.2, 0.2 + f.y * 0.45, smooth(0, 0.7, prog)) : f.y - prog * speed * 1.4;
    const x = f.kind === 'ice' ? 0.12 + f.x * 0.72 : (f.x < 0.5 ? f.x * 0.35 : 0.65 + (f.x - 0.5) * 0.7);
    show(f.img, on * (0.55 + f.z * 0.45));
    if (!f.blurSet) { f.blurSet = 1; f.img.style.filter = f.z < 0.35 ? 'blur(2px)' : 'none'; }
    f.img.style.transform = `translate(${x * innerWidth}px, ${y * innerHeight}px) rotate(${f.rot + prog * f.rv}deg) scale(${0.6 + f.z * 0.6})`;
  }

  // --- phin + liquid ---
  show(phinEl, smooth(T.pour[0] - 0.01, T.pour[0] + 0.02, p) * (1 - smooth(0.6, 0.72, nuoc)));
  const level = smooth(0, 0.86, nuoc);
  const L = liquidMat.uniforms;
  L.uTime.value = now; L.uLevel.value = level;
  slosh = lerp(slosh, clamp(Math.abs(lenis ? lenis.velocity : 0) / 40), 1 - Math.pow(0.04, dt)); L.uSlosh.value = slosh;
  L.uTextOn.value = smooth(0.12, 0.22, nuoc) * (1 - smooth(0.0, 0.3, milk));
  L.uTextMix.value = win(0.36, 0.52, nuoc, 0.04);
  L.uMilk.value = smooth(0.15, 0.85, milk); L.uPour.value = win(0.0, 0.55, milk, 0.08);
  L.uFade.value = 1 - smooth(0.0, 0.25, stirP);
  liquid.visible = nuoc > 0 && stirP < 0.3;
  // G7: the sachet bursts as the 89% rises
  const g7 = win(0.36, 0.5, nuoc, 0.02);
  show(sachet, g7);
  sachet.style.transform = `translate(-50%, -50%) scale(${0.7 + g7 * 0.35}) rotate(${-12 + nuoc * 30}deg)`;
  // milestone bubbles rise through the coffee
  for (const b of bubbles) {
    const k = (nuoc - (b.at - 0.14)) / 0.28;
    if (k <= 0 || k >= 1 || nuoc <= 0 || p > T.nuoc[1]) { show(b.el, 0); continue; }
    const x = MOBILE ? (b.lane ? 0.56 : 0.06) : (b.lane ? 0.8 : 0.05);
    const y = lerp(1.05, -0.35, k);
    show(b.el, smooth(0, 0.15, k) * (1 - smooth(0.85, 1, k)));
    b.el.style.transform = `translate(${x * innerWidth + Math.sin(k * 9 + b.at * 20) * 14}px, ${y * innerHeight}px)`;
  }

  // --- stir ---
  const sOn = smooth(0.0, 0.3, stirP);
  stirMat.uniforms.uOn.value = sOn;
  stirQuad.visible = sOn > 0;
  zone.classList.toggle('on', sOn > 0.8);
  if (sOn > 0) {
    const r = rects.zone, dpr = renderer.getPixelRatio();
    stirMat.uniforms.uCenter.value.set((r.left + r.width / 2) * dpr, (innerHeight - (r.top + r.height / 2)) * dpr);
    stirMat.uniforms.uR.value = r.width / 2 * dpr;
    stirMat.uniforms.uTime.value = now;
    // nobody stirring for a while (or on a phone): the spoon moves by itself
    stir.idle += dt;
    if (sOn > 0.8 && (stir.idle > 1.8 || REDUCED) && !stir.done) {
      stir.auto += dt * 2.2;
      const ax = 0.5 + Math.cos(stir.auto) * 0.24, ay = 0.5 + Math.sin(stir.auto) * 0.24;
      stirAt(ax, ay, -Math.sin(stir.auto) * 0.05, Math.cos(stir.auto) * 0.05);
    }
    simMat.uniforms.uPrev.value = rtA.texture;
    renderer.setRenderTarget(rtB); renderer.render(simScene, ortho); renderer.setRenderTarget(null);
    [rtA, rtB] = [rtB, rtA];
    stirMat.uniforms.uField.value = rtA.texture;
    simMat.uniforms.uForce.value.multiplyScalar(0.5);
    if (stir.energy > 5 && !stir.done) { stir.done = true; beatsEl.sua.classList.add('done'); track('stir-30'); }
    stir.art = clamp(stir.art + (stir.done ? dt / 1.6 : 0));
    stirMat.uniforms.uArtOn.value = smooth(0, 1, stir.art);
  }

  renderer.clear();
  renderer.render(scene, camera);
  renderer.render(overlay, ortho);
  if (PERF) window.__js.push(performance.now() - t0);
  // keep motion smooth on weak GPUs: trade a little sharpness for frame rate
  fstat.n++; fstat.sum += dt;
  if (fstat.n >= 45 && !location.search.includes('noadapt')) {
    const avg = fstat.sum / fstat.n * 1000; fstat.n = fstat.sum = 0;
    const next = avg > 21 ? Math.max(0.75, dpr - 0.25) : avg < 15 ? Math.min(DPR_MAX, dpr + 0.25) : dpr;
    if (next !== dpr) { dpr = next; renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight, false); window.__dprChanges = (window.__dprChanges || 0) + 1; }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
