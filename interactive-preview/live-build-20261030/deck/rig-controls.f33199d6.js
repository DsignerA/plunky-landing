/* Groove Makers GM-001: clickable deck controls for <model-viewer>.
   Needs: <model-viewer data-rig ...> with two hotspot buttons inside it:
     slot="hotspot-start"  (start/stop knob)
     slot="hotspot-pitch"  (pitch fader)
   Start knob: starts/stops the record with a real-deck spin-up and brake, and turns the orange glow on/off.
   Pitch fader: steps 0% -> +8% -> -8%, changing the record speed. */
(function () {
  function init(mv) {
    var knob = mv.querySelector('[slot="hotspot-start"]');
    var fader = mv.querySelector('[slot="hotspot-pitch"]');
    var STEPS = [0, 8, -8], idx = 0, raf = 0, glow = [];
    var spinning = mv.hasAttribute('autoplay');
    var ON = [1, 0.33, 0.04], OFF = [0.05, 0.015, 0];

    mv.addEventListener('load', function () {
      glow = mv.model.materials.filter(function (m) { return m.name === 'Orange_Glow'; });
      setGlow(spinning);
      if (!spinning) mv.pause();
    });
    function setGlow(on) { glow.forEach(function (m) { m.setEmissiveFactor(on ? ON : OFF); }); }
    function speed() { return 1 + STEPS[idx] / 100; }
    function rampTo(target, ms, done) {
      cancelAnimationFrame(raf);
      var from = mv.timeScale, t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, ((now || t0) - t0) / ms), e = 1 - (1 - k) * (1 - k);
        mv.timeScale = from + (target - from) * e;
        if (k < 1) raf = requestAnimationFrame(step); else if (done) done();
      })();
    }
    function start() {
      spinning = true;
      if (mv.paused) { mv.timeScale = 0; mv.play(); }
      rampTo(speed(), 700); setGlow(true); update();
    }
    function stop() {
      spinning = false;
      rampTo(0, 1200, function () { if (!spinning) mv.pause(); });
      setGlow(false); update();
    }
    function toggle() { spinning ? stop() : start(); }
    function nextPitch() {
      idx = (idx + 1) % STEPS.length;
      if (spinning) rampTo(speed(), 400);
      update();
    }
    function update() {
      var p = STEPS[idx], txt = (p > 0 ? '+' : '') + p + '%';
      knob.setAttribute('aria-pressed', String(spinning));
      knob.setAttribute('aria-label', spinning ? 'Stop the record' : 'Start the record');
      knob.dataset.label = spinning ? 'Stop' : 'Start';
      fader.dataset.label = 'Pitch ' + txt;
      fader.setAttribute('aria-label', 'Pitch ' + txt + '. Click to change');
      mv.dispatchEvent(new CustomEvent('rigchange', { detail: { spinning: spinning, pitch: p } }));
    }
    knob.addEventListener('click', toggle);
    fader.addEventListener('click', nextPitch);
    mv.rig = { start: start, stop: stop, toggle: toggle, nextPitch: nextPitch };
    update();
  }
  function boot() { document.querySelectorAll('model-viewer[data-rig]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
