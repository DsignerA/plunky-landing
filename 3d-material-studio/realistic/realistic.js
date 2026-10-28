/* "Realistic" look for the GM-001 deck, switchable against the original baked textures.
   Record: clean label on flat vinyl, concentric groove normal map for close-ups, and a roughness map
   (glossy gaps, satin grooved bands, matte label) so the track rings read in reflections at any distance.
   Start knob: real brushed metal (concentric normal map) instead of the painted knob image.
   Lighting: Poly Haven "Studio Small 09" HDRI (CC0, Sergej Majboroda) for real reflections.
   The deck top keeps its baked texture: its details are painted, not modelled. */
(function () {
  var mv = document.getElementById('rig');
  var BASE = 'realistic/';
  var ENV = BASE + 'studio_small_09_1k.hdr';
  var orig = null, tex = null, mode = 'realistic';

  function mat(name) { return mv.model.materials.find(function (m) { return m.name === name; }); }

  function snapshot() {
    var rec = mat('Record'), knob = mat('Knob_Top');
    return {
      env: mv.environmentImage,
      recColor: rec.pbrMetallicRoughness.baseColorTexture.texture,
      knobColor: knob.pbrMetallicRoughness.baseColorTexture.texture,
      knobFactor: knob.pbrMetallicRoughness.baseColorFactor.slice(),
      knobMetal: knob.pbrMetallicRoughness.metallicFactor,
      knobRough: knob.pbrMetallicRoughness.roughnessFactor,
      exposure: mv.exposure,
    };
  }

  async function load() {
    var t = await Promise.all([
      mv.createTexture(BASE + 'record-color.webp'),
      mv.createTexture(BASE + 'record-grooves-normal.webp'),
      mv.createTexture(BASE + 'knob-brushed-normal.webp'),
      mv.createTexture(BASE + 'record-roughness.webp'),
    ]);
    return { recColor: t[0], recNormal: t[1], knobNormal: t[2], recRough: t[3] };
  }

  function apply(next) {
    mode = next;
    var rec = mat('Record'), knob = mat('Knob_Top'), real = next === 'realistic';
    rec.pbrMetallicRoughness.baseColorTexture.setTexture(real ? tex.recColor : orig.recColor);
    rec.normalTexture.setTexture(real ? tex.recNormal : null);
    rec.pbrMetallicRoughness.metallicRoughnessTexture.setTexture(real ? tex.recRough : null);
    // the map holds the roughness pattern; the vinyl slider scales it (0.5 -> gaps 0.2, grooves 0.33, label 0.5)
    setSlider('vinyl', real ? 0.5 : 0.32);
    knob.pbrMetallicRoughness.baseColorTexture.setTexture(real ? null : orig.knobColor);
    knob.normalTexture.setTexture(real ? tex.knobNormal : null);
    knob.pbrMetallicRoughness.setBaseColorFactor(real ? [0.8, 0.8, 0.82, 1] : orig.knobFactor);
    knob.pbrMetallicRoughness.setMetallicFactor(real ? 1 : orig.knobMetal);
    knob.pbrMetallicRoughness.setRoughnessFactor(real ? 0.18 : orig.knobRough);
    mv.environmentImage = real ? ENV : orig.env;
    // the studio HDRI is dimmer than model-viewer's neutral light
    setSlider('exposure', real ? 1.45 : orig.exposure);
    document.querySelectorAll('[data-look]').forEach(function (b) { b.classList.toggle('active', b.dataset.look === next); });
  }

  // move a studio slider and let its own handler apply the value
  function setSlider(id, v) {
    var el = document.getElementById(id);
    el.value = v;
    el.dispatchEvent(new Event('input'));
  }

  mv.addEventListener('load', async function () {
    orig = snapshot();
    try { tex = await load(); } catch (e) { console.warn('Realistic textures unavailable', e); return; }
    apply(mode);
  });
  document.querySelectorAll('[data-look]').forEach(function (b) {
    b.addEventListener('click', function () { if (orig && tex) apply(b.dataset.look); });
  });
})();
