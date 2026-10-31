// Groove Makers poster: a glass record floating in front of the title, built in three.js.
// The record is real glass: the crystal rim bends and splits the light (transmission + dispersion),
// the dark grooved face carries brushed, rainbow streaks (anisotropy + iridescence + a groove
// pattern in the normals), and studio strip lights slowly circle it so the streaks sweep across.
// GROOVE and MAKERS are drawn inside the scene, behind the record, so they refract through the
// rim; each letter glitches in through refracted, colour-split slices in the intro, and the small poster type (HTML) slides
// up line by line. Drag to tilt the record.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const poster = document.getElementById('poster'), canvas = document.getElementById('gl');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
// without WebGL the title shows as plain type instead (see .nogl in the page)
if (!document.createElement('canvas').getContext('webgl2')) { document.body.classList.add('nogl'); throw new Error('WebGL2 unavailable'); }
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// the camera sees exactly the 9 x 16 poster on the z = 0 plane
const FOV = 30, D = 8 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const camera = new THREE.PerspectiveCamera(FOV, 9 / 16, 0.1, 100);
camera.position.set(0, 0, D);
// a point on the poster (fx, fy from the top left, 0..1) at depth z, so it lands there on screen
const at = (fx, fy, z) => new THREE.Vector3((fx - 0.5) * 9 * (D - z) / D, (0.5 - fy) * 16 * (D - z) / D, z);
const size = (w, z) => w * (D - z) / D;

// ---- studio light: soft strips (white key, warm and cool sides) for the streaks to reflect
function studio() {
  const env = new THREE.Scene();
  const strip = (w, h, color, k, p) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...p); m.lookAt(0, 0, 0); env.add(m);
  };
  strip(3, 14, 0xffffff, 3.2, [-6, 3, 4]);
  strip(2.4, 12, 0xff9a3c, 3.6, [7, 1, 2]);
  strip(2, 12, 0x2f6bff, 3.0, [-7, -2, -1]);
  strip(12, 1.4, 0xffffff, 2.2, [0, 7, 2]);
  strip(1.2, 10, 0xffffff, 1.8, [4, -3, 6]);
  strip(1.5, 8, 0xc9a2ff, 1.4, [2, 6, -6]);
  const pm = new THREE.PMREMGenerator(renderer), tex = pm.fromScene(env, 0.01).texture;
  pm.dispose();
  return tex;
}
scene.environment = studio();
scene.environmentIntensity = 1;

// ---- the record (radius 1, lying in the x-z plane, top face +y)
const H = 0.016;   // half the disc's thickness
// brushed-groove direction for the anisotropy: around the centre, everywhere
function anisoMap() {
  const n = 256, c = document.createElement('canvas'); c.width = c.height = n;
  const g = c.getContext('2d'), img = g.createImageData(n, n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const u = (x + 0.5) / n - 0.5, v = 1 - (y + 0.5) / n - 0.5, l = Math.hypot(u, v) || 1, k = (y * n + x) * 4;
    img.data[k] = (-v / l * 0.5 + 0.5) * 255; img.data[k + 1] = (u / l * 0.5 + 0.5) * 255; img.data[k + 2] = 255; img.data[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}
const vinyl = new THREE.MeshPhysicalMaterial({
  color: 0xb4bac8, roughness: 0.12, metalness: 0,
  transmission: 1, thickness: 0.16, ior: 1.55, dispersion: 6,
  attenuationColor: new THREE.Color(0x6a7084), attenuationDistance: 4,   // smoky but see-through (world units: the record is scaled ~4.6x)
  anisotropy: 0.9, anisotropyMap: anisoMap(),
  iridescence: 0.75, iridescenceIOR: 1.7, iridescenceThicknessRange: [180, 820],
  clearcoat: 1, clearcoatRoughness: 0.04, specularIntensity: 0.7, envMapIntensity: 0.75,
  side: THREE.DoubleSide,
});
// the grooves: rings in the surface normal, with quiet gaps between the tracks
vinyl.onBeforeCompile = s => {
  s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vObj; varying vec3 vRad;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position; vRad = normalize(normalMatrix * vec3(position.x, 0., position.z));');
  s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vObj; varying vec3 vRad;')
    .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      float rr = length(vObj.xz);
      float gap = exp(-pow((rr - .5) / .007, 2.)) + exp(-pow((rr - .63) / .007, 2.)) + exp(-pow((rr - .78) / .007, 2.));
      float groove = sin(rr * 430.) + .5 * sin(rr * 171. + 1.3);
      normal = normalize(normal + vRad * groove * .07 * (1. - min(gap, 1.)));`);
};
const crystal = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, roughness: 0.03, metalness: 0,
  transmission: 1, thickness: 0.12, ior: 1.6, dispersion: 7, side: THREE.DoubleSide,
  iridescence: 0.25, iridescenceIOR: 1.4,
  clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, envMapIntensity: 1.8,
});
const label = new THREE.MeshPhysicalMaterial({ color: 0x8a8e9a, roughness: 0.1, transmission: 1, thickness: 0.2, ior: 1.55, dispersion: 5,
  attenuationColor: new THREE.Color(0x2a2c36), attenuationDistance: 1.6, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.1, side: THREE.DoubleSide });

const spin = new THREE.Group();
const face = y => { const g = new THREE.RingGeometry(0.045, 0.93, 160, 1); g.rotateX(y > 0 ? -Math.PI / 2 : Math.PI / 2); g.translate(0, y, 0); return g; };
spin.add(new THREE.Mesh(face(H), vinyl), new THREE.Mesh(face(-H), vinyl));
// the outer edge: a band of clear glass the same thickness as the record, rounded off at the edge
const edge = [new THREE.Vector2(0.93, -H), new THREE.Vector2(0.985, -H)];
for (let i = 1; i < 16; i++) { const a = -Math.PI / 2 + Math.PI * i / 16; edge.push(new THREE.Vector2(0.985 + H * Math.cos(a), H * Math.sin(a))); }
edge.push(new THREE.Vector2(0.985, H), new THREE.Vector2(0.93, H));
spin.add(new THREE.Mesh(new THREE.LatheGeometry(edge, 200), crystal));
const hole = new THREE.TorusGeometry(0.046, 0.009, 16, 64); hole.rotateX(Math.PI / 2);
spin.add(new THREE.Mesh(hole, crystal));
for (const y of [H + 0.0015, -H - 0.0015]) {
  const g = new THREE.RingGeometry(0.052, 0.34, 96, 1); g.rotateX(y > 0 ? -Math.PI / 2 : Math.PI / 2); g.translate(0, y, 0);
  spin.add(new THREE.Mesh(g, label));
  const r = new THREE.TorusGeometry(0.341, 0.0035, 10, 160); r.rotateX(Math.PI / 2); r.translate(0, y, 0);
  spin.add(new THREE.Mesh(r, crystal));
}
const record = new THREE.Group();
record.add(spin);
scene.add(record);

// pose: the face turned toward the viewer and tipped back along a diagonal, like the poster
const RZ = 1.5, RC = at(0.515, 0.45, RZ), RS = size(4.95, RZ);
const MAJOR = new THREE.Vector3(Math.cos(-0.6), Math.sin(-0.6), 0);
const base = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
const qTilt = new THREE.Quaternion(), qSway = new THREE.Quaternion(), qa = new THREE.Quaternion();
function pose(tilt, swayX, swayY) {
  qTilt.setFromAxisAngle(MAJOR, tilt);
  qSway.setFromEuler(new THREE.Euler(swayX, swayY, 0));
  record.quaternion.copy(qSway).multiply(qTilt).multiply(base);
}

// ---- GROOVE / MAKERS: big type in the scene, each letter rising out of its mask
const TZ = -2;
function word(text, fy) {
  const W = 0.87 * 9, Hh = 0.205 * 16;
  const c = document.createElement('canvas'); c.width = 2048; c.height = Math.round(2048 * Hh / W);
  const g = c.getContext('2d'), F = 400;
  g.font = `${F}px Anton`;
  const m = g.measureText(text), asc = m.actualBoundingBoxAscent, sx = c.width / m.width, sy = c.height / asc;
  g.setTransform(sx, 0, 0, sy, 0, c.height);
  g.fillStyle = '#fff'; g.fillText(text, 0, 0);
  const edges = [0];
  for (let i = 1; i <= text.length; i++) edges.push(g.measureText(text.slice(0, i)).width * sx / c.width);
  edges[text.length] = 1.01;
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 8;
  const rev = new Array(6).fill(0);
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, rev: { value: rev }, edges: { value: [...edges, ...new Array(7 - edges.length).fill(2)] },
      color: { value: new THREE.Color(0xe6e4dc) }, t: { value: 0 }, burst: { value: 0 }, seed: { value: Math.random() * 50 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    // each letter glitches in: it flickers on, torn into sliding horizontal slices, its colour channels
    // split apart and wavering as if seen through moving glass, then snaps sharp. "burst" replays a
    // brief, weaker glitch across the whole word now and then.
    fragmentShader: `uniform sampler2D map; uniform float rev[6]; uniform float edges[7]; uniform vec3 color; uniform float t, burst, seed; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        float r = 1., li = 0.;
        for (int i = 0; i < 6; i++) if (vUv.x >= edges[i] && vUv.x < edges[i + 1]) { r = rev[i]; li = float(i); }
        float G = max(1. - r, burst);                        // how torn this letter is right now
        float tick = floor(t * 24.);
        if (r <= 0. || r < 1. && h(vec2(li + seed, tick)) > r * 1.6) discard;   // flickering on
        float band = floor(vUv.y * (8. + 10. * h(vec2(tick, li))) + h(vec2(li, tick)) * 3.);
        float shift = (h(vec2(band, tick + seed)) - .5) * .07 * G * step(.45, h(vec2(band + 7., tick)));
        float wave = sin(vUv.y * 38. + t * 26.) * .005 * G;
        float split = .011 * G;
        vec2 uv = vec2(vUv.x + shift + wave, vUv.y);
        float cr = texture2D(map, uv + vec2(split, 0.)).a, cg = texture2D(map, uv).a, cb = texture2D(map, uv - vec2(split, .004 * G)).a;
        vec3 c = vec3(cr, cg, cb);
        if (max(c.r, max(c.g, c.b)) < .01) discard;
        // the split fringes stay at the type's brightness, so nothing blooms
        c *= color * (1. - .25 * G * h(vec2(tick, band)));
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size(W, TZ), size(Hh, TZ)), mat);
  mesh.position.copy(at(0.5, fy, TZ));
  scene.add(mesh);
  return mat.uniforms;
}

// ---- post: a little bloom on the brightest glints
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.35, 0.5, 0.82);
composer.addPass(bloom);
// the exit: the whole frame tears into sliding slices with split colour and scanlines
const glitch = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, amount: { value: 0 }, t: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float amount, t; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main(){
      float tick = floor(t * 30.), a = amount;
      float band = floor(vUv.y * (6. + 24. * h(vec2(tick, 3.))));
      float on = step(1. - a * .9, h(vec2(band, tick)));
      vec2 uv = vUv + vec2((h(vec2(band + 1., tick)) - .5) * .35 * a * on, 0.);
      uv.x += sin(vUv.y * 90. + t * 60.) * .004 * a;
      float sp = .03 * a;
      vec3 c = vec3(texture2D(tDiffuse, uv + vec2(sp, 0.)).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - vec2(sp, 0.)).b);
      c *= 1. - .35 * a * step(.5, fract(vUv.y * 220.));                  // scanlines
      c += a * a * .25 * step(.985, h(vec2(floor(vUv.y * 60.), tick + 9.))); // white tear lines
      gl_FragColor = vec4(c * (1. - a * a * .6), 1.);
    }`,
});
glitch.enabled = false;
composer.addPass(glitch);
composer.addPass(new OutputPass());
let glitchAt = -1, glitchIn = false, glitchMs = 520;
// called by the page: tear the poster apart when the visitor moves on (resolves when it has played out),
// or mend it back together when they return
window.posterGlitch = (ms = 520) => { glitchAt = performance.now(); glitchMs = ms; glitchIn = false; glitch.enabled = true; return new Promise(r => setTimeout(r, ms)); };
window.posterGlitchIn = (ms = 560) => { glitchAt = performance.now(); glitchMs = ms; glitchIn = true; glitch.enabled = true; };
function fit() {
  // the camera is framed on the poster; the canvas fills the window, so the record is never clipped
  const r = poster.getBoundingClientRect(), c = canvas.getBoundingClientRect(), w = c.width, h = c.height;
  if (!w || !h) return;
  renderer.setSize(w, h, false); composer.setSize(w, h);
  camera.setViewOffset(r.width, r.height, c.left - r.left, c.top - r.top, w, h);
}
new ResizeObserver(fit).observe(canvas); fit();

// ---- drag to tilt
let dragX = 0, dragY = 0, tx = 0, ty = 0, down = null;
canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY, tx, ty]; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
canvas.addEventListener('pointermove', e => {
  if (!down) return;
  const w = poster.clientWidth;
  tx = THREE.MathUtils.clamp(down[2] + (e.clientY - down[1]) / w * 1.6, -0.6, 0.6);
  ty = THREE.MathUtils.clamp(down[3] + (e.clientX - down[0]) / w * 1.6, -0.7, 0.7);
});
const release = e => {
  if (down && e.type === 'pointerup' && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 8) showInvite();
  down = null; tx = 0; ty = 0; canvas.style.cursor = ''; };
canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);

// ---- intro timeline (seconds), then the idle float
const easeInOut = x => { x = Math.min(1, Math.max(0, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
function revealHTML() {
  // stagger the poster's small type: top lines first, then "by PLUNKY", then the bottom blocks
  const groups = [['.tl .m>span', 0.15], ['.tr .m>span', 0.25], ['.by .m>span', 1.55], ['.bl .m>span', 1.8], ['.br .m>span', 1.9]];
  for (const [sel, t0] of groups) document.querySelectorAll(sel).forEach((el, i) => { el.style.transitionDelay = (t0 + i * 0.07) + 's'; });
  document.querySelector('.rule').style.transitionDelay = '0.3s';
  document.querySelectorAll('.bl hr,.br hr').forEach(el => { el.style.transitionDelay = '2s'; });
  document.querySelector('.star').style.transitionDelay = '2.1s';
  requestAnimationFrame(() => poster.classList.add('on'));
}

// ---- the invitation card slides in once the poster has settled; it can be closed and reopened
const invite = document.querySelector('.invite');
let inviteTimer, hideTimer;
function showInvite() { clearTimeout(inviteTimer); clearTimeout(hideTimer); if (invite.classList.contains('show')) return; invite.hidden = false; if (window.sfx) sfx('glass'); requestAnimationFrame(() => requestAnimationFrame(() => invite.classList.add('show'))); }
invite.querySelector('.x').addEventListener('click', () => {
  invite.classList.remove('show');
  hideTimer = setTimeout(() => { invite.hidden = true; }, 1100);
  inviteTimer = setTimeout(showInvite, 9000);   // it comes back after a while (or on a tap), so the call to action isn't lost
});
inviteTimer = setTimeout(showInvite, reduced ? 800 : 3600);

const T0 = +((location.search.match(/[?&]at=([\d.]+)/) || [])[1] ?? NaN);   // ?at=3 freezes the clock (for checking frames)
let groove, makers, burstWord = null, burstAt = -1, nextBurst = 5, start = 0, last = performance.now(), clock = 0;
const scenePage = canvas.closest('.scene');
function frame(now) {
  if (scenePage && !scenePage.classList.contains('active')) { last = now; requestAnimationFrame(frame); return; }
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
  clock = isNaN(T0) ? clock + dt : T0;
  const t = reduced ? 10 + clock * 0.2 : clock;
  for (let i = 0; i < 6; i++) {
    groove.rev.value[i] = Math.min(1, Math.max(0, (t - 0.3 - i * 0.09) / 0.75));
    makers.rev.value[i] = Math.min(1, Math.max(0, (t - 1.0 - i * 0.09) / 0.75));
  }
  // now and then a short glitch runs across one of the words
  if (t > nextBurst) { burstWord = Math.random() < 0.5 ? groove : makers; burstAt = t; nextBurst = t + 4 + Math.random() * 4; }
  for (const w of [groove, makers]) { w.t.value = t; w.burst.value = w === burstWord && t - burstAt < 0.22 && !reduced ? 0.6 * (1 - (t - burstAt) / 0.22) : 0; }
  // the record drops in from above, turning over, and settles into its pose
  const k = easeInOut((t - 0.45) / 1.7);
  record.position.copy(RC).add(new THREE.Vector3(0, (1 - k) * 15, (1 - k) * -3));
  record.scale.setScalar(RS);
  dragX += (tx - dragX) * (1 - Math.exp(-dt * (down ? 12 : 3)));
  dragY += (ty - dragY) * (1 - Math.exp(-dt * (down ? 12 : 3)));
  pose(-0.92 + (1 - k) * 2.2 + 0.05 * Math.sin(t * 0.5),
    dragX + 0.06 * Math.sin(t * 0.37 + 1), dragY + 0.08 * Math.sin(t * 0.29));
  spin.rotation.y = -t * 0.35 - (1 - k) * 4;
  // the lights circle slowly, so the streaks and rainbows sweep across the grooves
  scene.environmentRotation.set(0.15 * Math.sin(t * 0.21), t * 0.22, 0);
  if (glitchAt >= 0) {
    const g = (now - glitchAt) / glitchMs;
    glitch.uniforms.amount.value = glitchIn ? Math.max(0, 1 - g) : Math.min(1, g * 1.6);
    glitch.uniforms.t.value = now / 1000;
    if (g > (glitchIn ? 1 : 1.6)) { glitchAt = -1; glitch.enabled = false; glitch.uniforms.amount.value = 0; }   // reset for a return visit
  }
  composer.render();
  requestAnimationFrame(frame);
}

document.fonts.load('400px Anton').then(() => {
  groove = word('GROOVE', 0.215);
  makers = word('MAKERS', 0.68);
  revealHTML();
  requestAnimationFrame(frame);
});
