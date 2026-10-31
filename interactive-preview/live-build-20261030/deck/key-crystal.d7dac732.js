/* Crystal look for the first-screen sax key: the whole key (brass body and pearl touch) becomes
   clear glass that the page background shows through, with only its reflections, clearcoat and
   iridescent sheen added on top. Transmission is not used: three.js fills the empty space behind
   transmissive glass with half-white, which reads as milky on this page.
   Blending: colour is added unscaled (One) while alpha stays low, so the page background stays
   visible behind the key and the highlights light it up.
   The materials are changed on model-viewer's internal three.js scene (not a public API; tested on
   model-viewer 3.5.0). Add ?key=metal to the URL to see the original key. */
(function () {
  // three.js constants (model-viewer bundles its own three.js)
  var CustomBlending = 5, OneFactor = 201, OneMinusSrcAlphaFactor = 205;
  var mv = document.getElementById('press');
  if (!mv || /[?&]key=metal\b/.test(location.search)) return;
  mv.exposure = 1.15;
  if (mv.dataset.env) mv.environmentImage = mv.dataset.env;
  function crystal(m, sheen) {
    m.map = null; m.metalnessMap = null; m.roughnessMap = null;
    m.color.set(0x0d1626);            // little diffuse light: the glass body stays clear
    m.metalness = 0; m.roughness = 0.03;
    m.transmission = 0;
    m.clearcoat = 1; m.clearcoatRoughness = 0;
    m.iridescence = sheen; m.iridescenceIOR = 1.8;
    m.specularIntensity = 1; m.envMapIntensity = 2.2;
    m.transparent = true; m.opacity = 0.16; m.depthWrite = false;
    m.premultipliedAlpha = false;
    m.blending = CustomBlending;
    m.blendSrc = OneFactor; m.blendDst = OneMinusSrcAlphaFactor;
    m.blendSrcAlpha = OneFactor; m.blendDstAlpha = OneMinusSrcAlphaFactor;
    m.needsUpdate = true;
  }
  mv.addEventListener('load', function () {
    var sym = Object.getOwnPropertySymbols(mv).find(function (s) { return s.description === 'scene'; });
    var sc = sym && mv[sym];
    if (!sc) return;
    sc.traverse(function (o) {
      if (!o.isMesh || !o.material || !o.material.isMeshPhysicalMaterial) return;
      // the pearl touch becomes the key's cut face: same glass, stronger rainbow sheen
      crystal(o.material, o.material.name === 'Pearl' ? 1 : 0.45);
    });
    sc.queueRender();
  });
})();
