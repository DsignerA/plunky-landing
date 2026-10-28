/* Slides the GM-001 pitch fader cap to match the pitch from rig-controls.js ("rigchange").
   +8% sits toward the back of the deck, -8% toward the front, 0% in the centre.
   The cap is a node of the model, reached through model-viewer's internal three.js scene
   (not a public API; tested on model-viewer 3.5.0, re-test if you upgrade). */
(function () {
  var TRAVEL = 0.02; // metres from centre to +/-8%, along the deck's z axis
  function init(mv) {
    var cap = null, baseZ = 0, pitch = 0, raf = 0;
    function scene() {
      var sym = Object.getOwnPropertySymbols(mv).find(function (s) { return s.description === 'scene'; });
      return sym ? mv[sym] : null;
    }
    function slideTo(p) {
      var sc = scene();
      if (!cap || !sc) return;
      cancelAnimationFrame(raf);
      var from = cap.position.z, to = baseZ - (p / 8) * TRAVEL, t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, ((now || t0) - t0) / 350), e = 1 - (1 - k) * (1 - k);
        cap.position.z = from + (to - from) * e;
        sc.queueRender();
        if (k < 1) raf = requestAnimationFrame(step);
      })();
    }
    mv.addEventListener('load', function () {
      var sc = scene();
      cap = sc && sc.getObjectByName('Pitch_Fader');
      if (!cap) return;
      baseZ = cap.position.z;
      slideTo(pitch);
    });
    mv.addEventListener('rigchange', function (e) { pitch = e.detail.pitch; slideTo(pitch); });
  }
  document.querySelectorAll('model-viewer[data-rig]').forEach(init);
})();
