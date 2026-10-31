/* Crystal look for the first-screen sax key: the brass body becomes clear glass (transmission with
   a little dispersion, a faint ice tint, clearcoat) and the abalone pearl stays as an inlay inside it.
   The materials are changed on model-viewer's internal three.js scene (not a public API; tested on
   model-viewer 3.5.0). Add ?key=metal to the URL to see the original key. */
(function () {
  var mv = document.getElementById('press');
  if (!mv || /[?&]key=metal\b/.test(location.search)) return;
  mv.exposure = 1.15;
  if (mv.dataset.env) mv.environmentImage = mv.dataset.env;
  mv.addEventListener('load', function () {
    var sym = Object.getOwnPropertySymbols(mv).find(function (s) { return s.description === 'scene'; });
    var sc = sym && mv[sym];
    if (!sc) return;
    var size = sc.size ? Math.max(sc.size.x, sc.size.y, sc.size.z) : 1;
    sc.traverse(function (o) {
      if (!o.isMesh || !o.material || !o.material.isMeshPhysicalMaterial) return;
      var m = o.material;
      if (m.name === 'Material_0') {
        m.map = null; m.metalnessMap = null; m.roughnessMap = null;
        m.color.set(0xffffff);
        m.metalness = 0; m.roughness = 0;
        m.transmission = 1; m.ior = 2.0; m.thickness = size * 0.12;
        m.attenuationColor.set(0xd6ecff); m.attenuationDistance = size * 4;
        if ('dispersion' in m) m.dispersion = 5;
        m.clearcoat = 0.5; m.clearcoatRoughness = 0;
        m.iridescence = 0.5; m.iridescenceIOR = 1.8;
        m.specularIntensity = 1; m.envMapIntensity = 1.1;
      } else if (m.name === 'Pearl') {
        m.envMapIntensity = 1.4;
      }
      m.needsUpdate = true;
    });
    sc.queueRender();
  });
})();
