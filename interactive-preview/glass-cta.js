// Real glass pill behind each .glass-cta, drawn with the vendored liquid-glass renderer.
// The button keeps its CSS glass look until WebGL is ready, and keeps it if WebGL fails.
import { drawLiquidRect } from './vendor/liquid-glass.js';

// Visible world height at z=0 for the renderer's fixed camera (fov 25, z 2.35).
const VIEW_H = 2 * Math.tan((25 / 2) * Math.PI / 180) * 2.35;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Plain dark backdrop for the glass to refract; color comes only from the pressed-state rim.
function backdrop() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#040406';
  g.fillRect(0, 0, 512, 512);
  return c.toDataURL('image/png');
}

// The layer is clipped to the button's pill, so the pill mesh fills the whole canvas.
// RoundedBoxGeometry caps the corner radius at depth/2, so the tube is built full depth and
// flattened in z: pill outline, flat dark face, light concentrated on the rim.
function pillShape(layer) {
  const height = VIEW_H * 0.99;
  return { width: VIEW_H * (layer.clientWidth / layer.clientHeight) * 0.995, height, depth: height, borderRadius: height / 2, borderRadiusSegments: 12, dilationZ: 0.32 };
}

function mount(button, bg) {
  const layer = button.querySelector('.glass-layer');
  const glass = drawLiquidRect(layer, {
    dpr: [1, 2],
    // Opaque near-black clear: the pill is wider than the renderer's backdrop plane, and a
    // transparent clear would refract as milky white at the ends. The layer clip hides the rest.
    bgColor: '#040406',
    bgOpacity: 1,
    shape: pillShape(layer),
    material: { color: '#ffffff', roughness: 0.02, ior: 1.3, thickness: 0.6, reflectivity: 0.08, clearcoat: 0, clearcoatRoughness: 0.04, iridescence: 0, iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 640], attenuationColor: '#ffffff', attenuationDistance: 2 },
    background: { type: 'image', imageUrl: bg },
  });
  new ResizeObserver(() => glass.update({ shape: pillShape(layer) })).observe(button);
  button.classList.add('is-glass');
  // Plain at rest; the prismatic rim lights up on a tap and fades out with the scene change.
  let unlight = 0;
  button.addEventListener('click', () => { button.classList.add('lit'); clearTimeout(unlight); unlight = setTimeout(() => button.classList.remove('lit'), 900); });
  if (reduced) return;
  // Tilt toward the pointer and dip on press: the glass catches new light without a render loop.
  let frame = 0, tilt = { x: 0, y: 0 }, press = 1;
  const draw = () => { frame = 0; glass.setShapeTransform({ rotationXDeg: tilt.y, rotationYDeg: tilt.x, dilationX: press, dilationY: press }); };
  const queue = () => { if (!frame) frame = requestAnimationFrame(draw); };
  button.addEventListener('pointermove', e => {
    const r = button.getBoundingClientRect();
    tilt = { x: ((e.clientX - r.left) / r.width - 0.5) * 14, y: ((e.clientY - r.top) / r.height - 0.5) * -22 };
    queue();
  });
  button.addEventListener('pointerleave', () => { tilt = { x: 0, y: 0 }; press = 1; queue(); });
  button.addEventListener('pointerdown', () => { press = 0.97; queue(); });
  button.addEventListener('pointerup', () => { press = 1; queue(); });
}

const bg = backdrop();
// .glass-lite buttons (Back/Next) keep the CSS-only glass.
for (const button of document.querySelectorAll('.glass-cta:not(.glass-lite)')) {
  try { mount(button, bg); } catch (err) { console.warn('glass-cta: CSS fallback', err); }
}
