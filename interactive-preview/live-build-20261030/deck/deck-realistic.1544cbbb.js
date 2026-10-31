/* Realistic look for the GM-001 deck on the turntable scene (same set as the 3D material studio):
   the black African Rhythms record (label on clean vinyl, groove normal map, roughness map),
   a brushed-metal start knob, and Poly Haven "Studio Small 09" HDRI lighting (CC0, Sergej Majboroda).
   The deck top keeps its original painted texture. */
(function () {
  var mv = document.getElementById('deck');
  var BASE = 'deck/realistic/';
  function mat(name) { return mv.model.materials.find(function (m) { return m.name === name; }); }
  // The deck builds in stages (model, then these textures and the studio lighting), and each stage
  // compiles shaders that block the page for a moment. window.deckReady resolves once all of it has
  // rendered, so the page can keep that work away from the record-roll video.
  var ready;
  window.deckReady = new Promise(function (r) { ready = r; });
  function settle() { requestAnimationFrame(function () { requestAnimationFrame(function () { setTimeout(ready, 150); }); }); }
  mv.addEventListener('error', function () { ready(); });
  mv.addEventListener('environment-change', function () { if (/studio_small/.test(mv.environmentImage || '')) settle(); });
  window.loadDeck = function () { if (!mv.getAttribute('src')) mv.setAttribute('src', mv.dataset.src); };
  mv.addEventListener('load', async function () {
    var t;
    try {
      t = await Promise.all([
        mv.createTexture(BASE + 'record-color-african-rhythms.96d854f8.webp'),
        mv.createTexture(BASE + 'record-grooves-normal.5226937d.webp'),
        mv.createTexture(BASE + 'record-roughness.73958b5f.webp'),
        mv.createTexture(BASE + 'knob-brushed-normal.9ec6ffef.webp'),
      ]);
    } catch (e) { console.warn('Realistic deck textures unavailable', e); settle(); return; }
    var rec = mat('Record'), knob = mat('Knob_Top');
    rec.pbrMetallicRoughness.baseColorTexture.setTexture(t[0]);
    rec.normalTexture.setTexture(t[1]);
    // the map holds the roughness pattern; 0.5 -> gaps 0.2, grooves 0.33, label 0.5
    rec.pbrMetallicRoughness.metallicRoughnessTexture.setTexture(t[2]);
    rec.pbrMetallicRoughness.setRoughnessFactor(0.5);
    knob.pbrMetallicRoughness.baseColorTexture.setTexture(null);
    knob.normalTexture.setTexture(t[3]);
    knob.pbrMetallicRoughness.setBaseColorFactor([0.8, 0.8, 0.82, 1]);
    knob.pbrMetallicRoughness.setMetallicFactor(1);
    knob.pbrMetallicRoughness.setRoughnessFactor(0.18);
    mv.environmentImage = BASE + 'studio_small_09_1k.e7cfda5f.hdr';
    // the studio HDRI is dimmer than model-viewer's neutral light
    mv.exposure = 1.45;
  });
})();
