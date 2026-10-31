// Plunky's albums on a tilted, swipeable ring (after the pmndrs "cards" example), drawn with the
// page's three.js. Swipe or drag spins it and it settles on the nearest cover; the front cover lifts.
// The albums sit in racks, one per catalogue (window.RACKS). The tabs above the ring, a vertical swipe
// or the up/down keys flip to the next rack: the current ring tips away and folds in while the next one
// drops in and fans out.
// Tapping the front cover opens it (only African Rhythms is unlocked this season: it glows and carries
// an UNLOCKED tag, the others show a lock); tapping another spins to it. The fanned-out cards stay in the page as the fallback if WebGL or a cover fails to load.
import * as THREE from 'three';

const scene0 = document.getElementById('gallery');
const wrap = document.getElementById('ring');
const titleEl = document.getElementById('ringTitle');
const subEl = document.getElementById('ringSub');
const tabsEl = document.getElementById('racks');
const defs = window.RACKS;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = k => 1 - Math.pow(1 - k, 3);
const clamp01 = k => THREE.MathUtils.clamp(k, 0, 1);
// the 10-album ring has a radius of 1.55; bigger racks get a wider ring so the covers keep their spacing
const radiusFor = n => Math.max(1.55, 1.55 * n / 10);
const SWITCH_MS = 650;

// card: unit plane bent to follow the ring's curve
function cardGeometry(R, w = 1, h = 1) {
  const g = new THREE.PlaneGeometry(w, h, 24, 1), p = g.attributes.position;
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

// the unlocked album's glow: a soft frame just outside the cover that pulses
const GLOW_FRAG = `uniform float glow,fade;varying vec2 vUv;
void main(){vec2 q=abs((vUv-.5)*1.16)-.44;float d=length(max(q,0.))-.06;
float a=(exp(-max(d,0.)/.035)*.8+exp(-abs(d)/.006))*step(-.004,d)*glow*fade;gl_FragColor=vec4(vec3(1.,.54,.16)*a,a);}`;

// small flat labels drawn on a canvas: the lock on locked covers, the UNLOCKED tag on the open one
function labelTexture(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const lockTexture = () => labelTexture(128, 128, g => {
  g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.fillStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 7;
  g.beginPath(); g.moveTo(49, 62); g.lineTo(49, 54); g.arc(64, 54, 15, Math.PI, 0); g.lineTo(79, 62); g.stroke();
  g.beginPath(); g.roundRect(40, 60, 48, 36, 6); g.fill();
});
const tagTexture = () => labelTexture(512, 160, g => {
  g.fillStyle = '#ff8a2a'; g.beginPath(); g.roundRect(56, 8, 400, 96, 48); g.fill();
  g.beginPath(); g.moveTo(232, 102); g.lineTo(256, 138); g.lineTo(280, 102); g.fill();   // points down at the cover
  g.fillStyle = '#0b0b0e'; g.font = '700 46px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('UNLOCKED', 256, 58);
});

// banner text around the ring, one per rack
function bannerTexture(words) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 96;
  const g = c.getContext('2d');
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
  const loadRack = d => Promise.all(d.albums.map(a => loader.loadAsync(a.u)));
  const firstMaps = await loadRack(defs[0]);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const tilt = new THREE.Group(); tilt.rotation.set(0.2, 0, 0.1); scene.add(tilt);
  const lockTex = lockTexture(), lockGeo = new THREE.PlaneGeometry(0.3, 0.3);
  let glow = null, tag = null;

  function buildRack(def, maps) {
    const N = maps.length, R = radiusFor(N), STEP = Math.PI * 2 / N;
    const group = new THREE.Group(), ring = new THREE.Group();
    group.add(ring); tilt.add(group);
    // a wider ring is drawn a little smaller so it fits the same space; the camera frames it by its drawn size
    const scale = Math.sqrt(1.55 / R); group.scale.setScalar(scale);
    const geo = cardGeometry(R);
    const lockMat = new THREE.MeshBasicMaterial({ map: lockTex, transparent: true, depthWrite: false });
    const rec = def.albums.findIndex(a => a.rec);
    const cards = maps.map((map, i) => {
      map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
      const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({
        uniforms: { map: { value: map }, zoom: { value: 1.12 }, dim: { value: 0.5 }, fade: { value: 1 } },
        vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: THREE.DoubleSide,
      }));
      const a = i * STEP;
      m.rotation.y = a; m.userData = { i, a, k: 1 };
      if (i !== rec) { const l = new THREE.Mesh(lockGeo, lockMat); l.position.z = 0.01; l.renderOrder = 1; m.add(l); }
      ring.add(m);
      return m;
    });
    // the indicator on the one open album
    if (rec >= 0) {
      glow = new THREE.Mesh(cardGeometry(R, 1.16, 1.16), new THREE.ShaderMaterial({
        uniforms: { glow: { value: 1 }, fade: { value: 1 } }, vertexShader: VERT, fragmentShader: GLOW_FRAG,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.position.z = -0.012; glow.renderOrder = -1; cards[rec].add(glow);
      tag = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.1625),
        new THREE.MeshBasicMaterial({ map: tagTexture(), transparent: true, depthWrite: false }));
      tag.renderOrder = 2; cards[rec].add(tag);
    }
    const banner = new THREE.Mesh(
      new THREE.CylinderGeometry(R * 1.1, R * 1.1, 0.13, 96, 1, true),
      new THREE.MeshBasicMaterial({ map: bannerTexture(def.words), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    banner.position.y = -0.74; group.add(banner);
    const home = rec >= 0 ? rec : 0;
    return { def, N, R, STEP, size: R * scale, group, ring, cards, banner, lockMat, rec, home,
      pos: home, target: home, intro: reduced ? 1 : 0, introT0: 0, introMs: 1700, enter: 1, leave: -1, leaveT0: 0 };
  }

  const racks = [buildRack(defs[0], firstMaps)];
  let cur = racks[0], camR = cur.size, switchedAt = -1e9;

  // camera distance that fits the ring: on phones the sides of the ring run off the edges and the
  // front cover stays the same size whatever the rack's radius
  function place() {
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), fitH = 2.1;
    const d = camera.aspect < 1
      ? Math.max(2.15 / 2 / (t * camera.aspect), fitH / 2 / t) + camR - 0.65 * 1.55
      : Math.max((2 * camR + 0.7) / 2 / (t * camera.aspect), fitH / 2 / t) + camR * 0.35;
    camera.position.set(0, 0.25, d); camera.lookAt(0, -0.08, 0);
  }
  function fit() {
    const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix(); place();
  }
  new ResizeObserver(fit).observe(wrap); fit();

  let front = -1, hover = -1, raf = 0, last = 0;
  const wrapIdx = (r, i) => ((Math.round(i) % r.N) + r.N) % r.N;
  const near = (r, i) => r.target + ((((i - r.target) % r.N) + r.N + r.N / 2) % r.N - r.N / 2);  // closest pos showing card i

  function setFront(f, force) {
    if (f === front && !force) return;
    if (!force && front >= 0 && cur.intro >= 1 && window.sfx) sfx('detent');   // a click as each cover passes the front
    front = f;
    titleEl.textContent = cur.def.albums[f].t;
    subEl.textContent = f === cur.rec ? 'UNLOCKED · TAP THE COVER TO START' : 'LOCKED THIS SEASON · SWIPE FOR MORE';
  }
  function open(i) {
    if (i === cur.rec) { if (window.sfx) sfx('open'); window.go(3); return; }
    if (window.sfx) sfx('locked');
    subEl.textContent = 'LOCKED THIS SEASON · TRY AFRICAN RHYTHMS';
    window.dispatchEvent(new CustomEvent('ring:locked'));   // the page explains which album is open
  }

  // the rack tabs
  const tabs = defs.map((d, n) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.rack = n;
    b.setAttribute('aria-selected', String(n === 0)); b.disabled = n !== 0;
    b.innerHTML = '<span></span><small></small>';
    b.firstChild.textContent = d.name; b.lastChild.textContent = d.albums.length + ' albums';
    b.addEventListener('click', () => switchRack(n));
    tabsEl.appendChild(b);
    return b;
  });
  function markTabs() {
    const n = racks.indexOf(cur);
    tabs.forEach((b, k) => b.setAttribute('aria-selected', String(k === n)));
    tabsEl.style.setProperty('--on', n);
    wrap.setAttribute('aria-label', cur.def.name + ': Plunky albums. Arrow keys to browse, up and down to change rack, Enter to open');
  }

  // flip to another rack: the current one tips away and folds in, the next drops in and fans out
  function switchRack(n, instant) {
    const next = racks[n];
    if (!next || next === cur) return;
    const now = performance.now();
    if (!instant && now - switchedAt < SWITCH_MS * 0.6) return;
    switchedAt = now;
    const dir = n > racks.indexOf(cur) ? 1 : -1, prev = cur;
    cur = next; hover = -1;
    racks.forEach(r => { if (r !== cur && r !== prev) { r.group.visible = false; r.leave = -1; } });
    cur.group.visible = true; cur.leave = -1; cur.dir = dir;
    cur.target = cur.home; cur.pos = cur.home - (reduced ? 0 : dir * cur.N * 0.25);
    if (instant || reduced) { prev.group.visible = false; prev.leave = -1; cur.intro = 1; cur.enter = 1; camR = cur.size; place(); }
    else {
      prev.leave = 0; prev.leaveT0 = now; prev.dir = dir;
      cur.intro = 0; cur.introT0 = now + 120; cur.introMs = 1100; cur.enter = 0;
    }
    setFront(wrapIdx(cur, cur.pos), true); markTabs(); wake();
    if (!instant && window.sfx) sfx('rack', dir);
  }

  // the page's "Open African Rhythms" button: go to its rack and spin to it, then open it
  window.ringExplore = () => {
    const home = racks.find(r => r.rec >= 0);
    if (cur === home && front === home.rec) { window.go(3); return; }
    if (cur !== home) switchRack(racks.indexOf(home)); else home.target = near(home, home.rec);
    // open it once it has landed in front (or after 2.5 s whatever happens)
    const t0 = performance.now();
    (function landed() {
      if (!scene0.classList.contains('active')) return;
      const done = cur === home && front === home.rec && home.intro >= 1 && Math.abs(home.pos - home.target) < 0.05;
      if (done || performance.now() - t0 > 2500) window.go(3); else setTimeout(landed, 80);
    })();
  };

  // drag / swipe with a little momentum, then settle on a cover; a mostly vertical swipe changes rack
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(cur.cards)[0];
    return hit ? hit.object.userData.i : -1;
  }
  let drag = null;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => {
    drag = { x: e.clientX, x0: e.clientX, y0: e.clientY, t0: performance.now(), t: performance.now(), v: 0, moved: false, vertical: false, pos0: cur.pos };
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!drag) { if (e.pointerType === 'mouse') { hover = pick(e); el.style.cursor = hover < 0 ? 'grab' : 'pointer'; } return; }
    const now = performance.now(), dx = e.clientX - drag.x, k = 2.6 / wrap.clientWidth;
    const ax = Math.abs(e.clientX - drag.x0), ay = Math.abs(e.clientY - drag.y0);
    if (!drag.moved && ay > 14 && ay > ax * 1.4) drag.vertical = true;
    if (ax > 6 || ay > 6) drag.moved = true;
    if (drag.vertical) { cur.pos = cur.target = drag.pos0; return; }
    cur.pos -= dx * k; cur.target = cur.pos;
    drag.v = -dx * k / Math.max(8, now - drag.t) * 1000; drag.x = e.clientX; drag.t = now;
  });
  const end = e => {
    if (!drag) return;
    const d = drag; drag = null;
    if (d.vertical) {
      const dy = e.clientY - d.y0, n = racks.indexOf(cur) + (dy < 0 ? 1 : -1);
      if (Math.abs(dy) > 40) switchRack(n);
      cur.target = Math.round(cur.pos);
      return;
    }
    if (!d.moved && performance.now() - d.t0 < 500) {
      const i = pick(e);
      if (i >= 0) { if (i === front) open(i); else cur.target = near(cur, i); }
      return;
    }
    cur.target = Math.round(cur.pos + THREE.MathUtils.clamp(d.v, -12, 12) * 0.18);
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('pointerleave', () => { hover = -1; });
  // trackpad or mouse wheel: either scroll axis turns the ring sideways, then it settles
  let snap = 0;
  el.addEventListener('wheel', e => {
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    cur.pos += d * (e.deltaMode ? 0.12 : 0.0035); cur.target = cur.pos;
    clearTimeout(snap); snap = setTimeout(() => { cur.target = Math.round(cur.pos); }, 140);
  }, { passive: false });
  wrap.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') cur.target = Math.round(cur.target) + 1;
    else if (e.key === 'ArrowLeft') cur.target = Math.round(cur.target) - 1;
    else if (e.key === 'ArrowDown') switchRack(racks.indexOf(cur) + 1);
    else if (e.key === 'ArrowUp') switchRack(racks.indexOf(cur) - 1);
    else if (e.key === 'Enter' || e.key === ' ') open(front);
    else return;
    e.preventDefault();
  });

  function stepRack(r, dt, now) {
    const active = r === cur;
    if (!(active && drag)) r.pos += (r.target - r.pos) * (1 - Math.exp(-dt * (r.intro < 1 ? 3.2 : 7)));
    // intro: the covers start stacked in the middle and fan out into the ring, front cover first
    if (r.intro < 1) r.intro = clamp01((now - r.introT0) / r.introMs);
    // the rack coming in drops into place; the one leaving tips back and sinks as it folds in
    const enter = active ? (r.enter = Math.max(r.enter, ease(clamp01((now - r.introT0 + 120) / 700)))) : 1;
    let out = 0;
    if (r.leave >= 0) {
      r.leave = clamp01((now - r.leaveT0) / SWITCH_MS); out = ease(r.leave);
      if (r.leave >= 1) { r.leave = -1; r.group.visible = false; return; }
    }
    const dir = r.dir || 1;
    r.group.position.y = dir * 0.9 * (1 - enter) - dir * 1.1 * out;
    r.group.rotation.x = -dir * 0.5 * (1 - enter) + dir * 0.55 * out;
    const fold = r.leave >= 0 ? 1 - out : 1;
    r.cards.forEach((c, i) => {
      const off = Math.abs(((i - r.target) % r.N + r.N + r.N / 2) % r.N - r.N / 2) / (r.N / 2);
      const k = (r.intro >= 1 ? 1 : ease(clamp01((r.intro - off * 0.3) / 0.7))) * (0.25 + 0.75 * fold);
      const rad = r.R * k, a = c.userData.a;
      c.position.set(Math.sin(a) * rad, -0.5 * (1 - k), Math.cos(a) * rad);
      c.material.uniforms.fade.value = Math.min(1, k * 2.5) * (1 - out);
      c.userData.k = k;
    });
    r.lockMat.opacity = (1 - out) * Math.min(1, enter * 1.5);
    r.banner.material.opacity = ease(clamp01((r.intro - 0.5) / 0.5)) * (1 - out);
    r.ring.rotation.y = -r.pos * r.STEP;
    const f = active ? wrapIdx(r, r.pos) : -1;
    if (active) setFront(f);
    r.cards.forEach((c, i) => {
      const on = i === f && !drag ? 1 : 0, hv = active && i === hover ? 1 : 0, u = c.material.uniforms;
      const s = (1 + on * 0.16 + hv * 0.06) * (0.35 + 0.65 * c.userData.k), k = r.intro < 1 || out ? 1 : 1 - Math.exp(-dt * 9);
      c.scale.setScalar(c.scale.x + (s - c.scale.x) * k);
      u.zoom.value += ((on ? 1 : 1.12) - u.zoom.value) * k;
      u.dim.value += ((on ? 1 : hv ? 0.8 : 0.5) - u.dim.value) * k;
    });
    r.banner.material.map.offset.x -= dt * 0.025;
    // the open album breathes and its tag bobs, pointing down at it
    if (r.rec >= 0) {
      const c = r.cards[r.rec], beat = now / 1000;
      glow.material.uniforms.glow.value = reduced ? 0.8 : 0.6 + 0.4 * Math.sin(beat * 3);
      glow.material.uniforms.fade.value = c.material.uniforms.fade.value; tag.material.opacity = c.material.uniforms.fade.value;
      tag.position.set(0, 0.64 + (reduced ? 0 : 0.025 * Math.sin(beat * 4)), 0.02);
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    racks.forEach(r => { if (r.group.visible) stepRack(r, dt, now); });
    if (Math.abs(cur.size - camR) > 1e-4) { camR += (cur.size - camR) * (1 - Math.exp(-dt * 5)); place(); }
    renderer.render(scene, camera);
    raf = scene0.classList.contains('active') && !document.hidden ? requestAnimationFrame(frame) : 0;
  }
  function wake() {
    if (raf || !scene0.classList.contains('active')) return;
    last = 0; raf = requestAnimationFrame(frame);
  }
  // arriving on the collection: back on the first rack, a quick spin that lands on African Rhythms
  new MutationObserver(() => {
    if (!scene0.classList.contains('active')) return;
    if (!raf) {
      if (cur !== racks[0]) switchRack(0, true);
      if (!reduced) { const r = cur; r.target = near(r, r.home); r.pos = r.target - r.N * 0.5; r.intro = 0; r.introMs = 1700; r.introT0 = performance.now(); if (window.sfx) sfx('rack', 1); }
    }
    wake();
  }).observe(scene0, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', wake);

  setFront(cur.home, true); markTabs();
  scene0.classList.add('has-ring');
  if (scene0.classList.contains('active') && !reduced) { cur.pos = cur.home - cur.N * 0.5; cur.introT0 = performance.now(); }
  wake();

  // the other racks load after the first is showing; each tab turns on when its covers are in
  for (let n = 1; n < defs.length; n++) {
    loadRack(defs[n]).then(maps => {
      const r = buildRack(defs[n], maps);
      r.group.visible = false; r.intro = 1; r.enter = 1;
      racks[n] = r; tabs[n].disabled = false;
    }).catch(e => console.warn('Rack unavailable: ' + defs[n].name, e));
  }
}

if (wrap && defs && defs.length) init().catch(e => console.warn('Album ring unavailable', e));
