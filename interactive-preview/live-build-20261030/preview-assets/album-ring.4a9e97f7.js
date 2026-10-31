// Plunky's albums on a tilted, swipeable ring (after the pmndrs "cards" example), drawn with the
// page's three.js. Swipe or drag spins it and it settles on the nearest cover; the front cover lifts.
// Tapping the front cover opens it (only African Rhythms has a record so far); tapping another spins
// to it. The fanned-out cards stay in the page as the fallback if WebGL or a cover fails to load.
import * as THREE from 'three';

const scene0 = document.getElementById('gallery');
const wrap = document.getElementById('ring');
const titleEl = document.getElementById('ringTitle');
const subEl = document.getElementById('ringSub');
const albums = window.ALBUMS;
const N = albums.length, R = 1.55, STEP = Math.PI * 2 / N;
const REC = albums.findIndex(a => a.rec);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = k => 1 - Math.pow(1 - k, 3);

// card: unit plane bent to follow the ring's curve
function cardGeometry() {
  const g = new THREE.PlaneGeometry(1, 1, 24, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, -(R - Math.sqrt(R * R - x * x))); }
  p.needsUpdate = true;
  return g;
}

// rounded corners, a slight zoom on covers that are not in front, darker sides and backs
const VERT = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const FRAG = `uniform sampler2D map;uniform float zoom,dim,fade;varying vec2 vUv;
void main(){vec2 q=abs(vUv-.5)-.44;float d=length(max(q,0.))-.06;float a=1.-smoothstep(-.006,.006,d);
vec3 c=texture2D(map,(vUv-.5)/zoom+.5).rgb*dim*(gl_FrontFacing?1.:.3);gl_FragColor=vec4(c,a*fade);
#include <colorspace_fragment>
}`;

// banner text around the ring
function bannerTexture() {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 96;
  const g = c.getContext('2d'), words = ['GROOVE MAKERS', 'PLUNKY', 'NAME BRAND RECORDS', 'AFRICAN RHYTHMS'];
  g.font = '600 46px Arial, sans-serif'; g.textBaseline = 'middle';
  let x = 0; const w = c.width / words.length;
  words.forEach(t => {
    g.fillStyle = 'rgba(255,255,255,.82)'; g.fillText(t, x + 40, 50);
    g.fillStyle = '#ff8a2a'; g.beginPath(); g.arc(x + w - 24, 48, 7, 0, 7); g.fill();
    x += w;
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.x = 3; t.anisotropy = 4;
  return t;
}

async function init() {
  const loader = new THREE.TextureLoader();
  const maps = await Promise.all(albums.map(a => loader.loadAsync(a.u)));
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  const tilt = new THREE.Group(); tilt.rotation.set(0.2, 0, 0.1); scene.add(tilt);
  const ring = new THREE.Group(); tilt.add(ring);

  const geo = cardGeometry();
  const cards = maps.map((map, i) => {
    map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
    const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      uniforms: { map: { value: map }, zoom: { value: 1.12 }, dim: { value: 0.5 }, fade: { value: 1 } },
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: THREE.DoubleSide,
    }));
    const a = i * STEP;
    m.rotation.y = a; m.userData = { i, a };
    ring.add(m);
    return m;
  });
  const banner = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 1.1, R * 1.1, 0.13, 96, 1, true),
    new THREE.MeshBasicMaterial({ map: bannerTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  banner.position.y = -0.74; tilt.add(banner);

  // camera distance that fits the ring: on phones the sides of the ring run off the edges
  function fit() {
    const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fitW = camera.aspect < 1 ? 2.15 : 2 * R + 0.7, fitH = 2.1;
    const d = Math.max(fitW / 2 / (t * camera.aspect), fitH / 2 / t) + R * 0.35;
    camera.position.set(0, 0.25, d); camera.lookAt(0, -0.08, 0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(fit).observe(wrap); fit();

  let pos = REC, target = REC, front = -1, hover = -1, raf = 0, last = 0, intro = reduced ? 1 : 0, introT0 = 0;
  const wrapIdx = i => ((Math.round(i) % N) + N) % N;
  const near = i => target + ((((i - target) % N) + N + N / 2) % N - N / 2);  // closest pos showing card i

  function setFront(f) {
    if (f === front) return; front = f;
    titleEl.textContent = albums[f].t;
    subEl.textContent = albums[f].rec ? 'TAP THE COVER TO PULL THE RECORD' : 'PREVIEW COMING SOON · SWIPE FOR MORE';
  }
  function open(i) {
    if (albums[i].rec) { window.go(3); return; }
    subEl.textContent = 'PREVIEW COMING SOON · TRY AFRICAN RHYTHMS';
  }
  // the page's "Explore the record" button: spin to African Rhythms first if it is not in front
  window.ringExplore = () => {
    if (front === REC) { window.go(3); return; }
    target = near(REC); setTimeout(() => { if (scene0.classList.contains('active')) window.go(3); }, 650);
  };

  // drag / swipe with a little momentum, then settle on a cover
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(cards)[0];
    return hit ? hit.object.userData.i : -1;
  }
  let drag = null;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => {
    drag = { x: e.clientX, x0: e.clientX, t0: performance.now(), t: performance.now(), v: 0, moved: false };
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!drag) { if (e.pointerType === 'mouse') { hover = pick(e); el.style.cursor = hover < 0 ? 'grab' : 'pointer'; } return; }
    const now = performance.now(), dx = e.clientX - drag.x, k = 2.6 / wrap.clientWidth;
    if (Math.abs(e.clientX - drag.x0) > 6) drag.moved = true;
    pos -= dx * k; target = pos;
    drag.v = -dx * k / Math.max(8, now - drag.t) * 1000; drag.x = e.clientX; drag.t = now;
  });
  const end = e => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!d.moved && performance.now() - d.t0 < 500) {
      const i = pick(e);
      if (i >= 0) { if (i === front) open(i); else target = near(i); }
      return;
    }
    target = Math.round(pos + THREE.MathUtils.clamp(d.v, -12, 12) * 0.18);
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('pointerleave', () => { hover = -1; });
  // trackpad or mouse wheel: either scroll axis turns the ring sideways, then it settles
  let snap = 0;
  el.addEventListener('wheel', e => {
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    pos += d * (e.deltaMode ? 0.12 : 0.0035); target = pos;
    clearTimeout(snap); snap = setTimeout(() => { target = Math.round(pos); }, 140);
  }, { passive: false });
  wrap.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') target = Math.round(target) + 1;
    else if (e.key === 'ArrowLeft') target = Math.round(target) - 1;
    else if (e.key === 'Enter' || e.key === ' ') open(front);
    else return;
    e.preventDefault();
  });

  function frame(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!drag) pos += (target - pos) * (1 - Math.exp(-dt * (intro < 1 ? 3.2 : 7)));
    // intro: the covers start stacked in the middle and fan out into the ring, front cover first
    if (intro < 1) intro = Math.min(1, (now - introT0) / 1700);
    cards.forEach((c, i) => {
      const off = Math.abs(((i - target) % N + N + N / 2) % N - N / 2) / (N / 2);
      const k = intro >= 1 ? 1 : ease(THREE.MathUtils.clamp((intro - off * 0.3) / 0.7, 0, 1));
      const r = R * k, a = c.userData.a;
      c.position.set(Math.sin(a) * r, -0.5 * (1 - k), Math.cos(a) * r);
      c.material.uniforms.fade.value = Math.min(1, k * 2.5);
      c.userData.k = k;
    });
    banner.material.opacity = ease(THREE.MathUtils.clamp((intro - 0.5) / 0.5, 0, 1));
    ring.rotation.y = -pos * STEP;
    setFront(wrapIdx(pos));
    cards.forEach((c, i) => {
      const on = i === front && !drag ? 1 : 0, hv = i === hover ? 1 : 0, u = c.material.uniforms;
      const s = (1 + on * 0.16 + hv * 0.06) * (0.35 + 0.65 * c.userData.k), k = intro < 1 ? 1 : 1 - Math.exp(-dt * 9);
      c.scale.setScalar(c.scale.x + (s - c.scale.x) * k);
      u.zoom.value += ((on ? 1 : 1.12) - u.zoom.value) * k;
      u.dim.value += ((on ? 1 : hv ? 0.8 : 0.5) - u.dim.value) * k;
    });
    banner.material.map.offset.x -= dt * 0.025;
    renderer.render(scene, camera);
    raf = scene0.classList.contains('active') && !document.hidden ? requestAnimationFrame(frame) : 0;
  }
  function wake() {
    if (raf || !scene0.classList.contains('active')) return;
    last = 0; raf = requestAnimationFrame(frame);
  }
  // arriving on the collection: a quick spin that lands on African Rhythms
  new MutationObserver(() => {
    if (!scene0.classList.contains('active')) return;
    if (!raf && !reduced) { target = near(REC); pos = target - N * 0.5; intro = 0; introT0 = performance.now(); }
    wake();
  }).observe(scene0, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', wake);

  setFront(REC);
  scene0.classList.add('has-ring');
  if (scene0.classList.contains('active') && !reduced) { pos = REC - N * 0.5; introT0 = performance.now(); }
  wake();
}

if (wrap && albums && albums.length) init().catch(e => console.warn('Album ring unavailable', e));
