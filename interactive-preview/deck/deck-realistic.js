/* Realistic look for the GM-001 deck on the turntable scene (same set as the 3D material studio):
   the black African Rhythms record (label on clean vinyl, groove normal map, roughness map),
   a brushed-metal start knob, and Poly Haven "Studio Small 09" HDRI lighting (CC0, Sergej Majboroda).
   The deck top keeps its original painted texture. */
(function () {
  var mv = document.getElementById('deck');
  var BASE = 'deck/realistic/';
  function mat(name) { return mv.model.materials.find(function (m) { return m.name === name; }); }
  mv.addEventListener('load', async function () {
    var t;
    try {
      t = await Promise.all([
        mv.createTexture(BASE + 'record-color-african-rhythms.webp'),
        mv.createTexture(BASE + 'record-grooves-normal.webp'),
        mv.createTexture(BASE + 'record-roughness.webp'),
        mv.createTexture(BASE + 'knob-brushed-normal.webp'),
      ]);
    } catch (e) { console.warn('Realistic deck textures unavailable', e); return; }
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
    mv.environmentImage = BASE + 'studio_small_09_1k.hdr';
    // the studio HDRI is dimmer than model-viewer's neutral light
    mv.exposure = 1.45;
  });
})();
