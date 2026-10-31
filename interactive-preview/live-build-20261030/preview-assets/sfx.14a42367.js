// Groove Makers interface sounds, synthesised with Web Audio (no sound files).
// window.sfx(name, ...args) plays one; sfx.slide(speed) drives the record-sliding friction;
// sfx.duck(on) lowers everything while the deck is playing music; sfx.muted / sfx.setMuted(on).
// Browsers only allow sound after a tap, so nothing plays until the first pointerdown or key press.
(function () {
  let ctx = null, master, bus, crush, verb, noiseBuf, slideSrc = null, slideGain, lastDetent = 0;
  let muted = false;
  try { muted = localStorage.getItem('gm-sound') === 'off'; } catch (e) {}
  const VOL = 0.7;

  function setup() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = muted ? 0 : VOL; master.connect(comp);
    bus = ctx.createGain(); bus.connect(master);
    // a short airy room for the glassy sounds
    verb = ctx.createConvolver();
    const len = ctx.sampleRate * 1.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    verb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.35; verb.connect(wet); wet.connect(master);
    // a bit-crusher for the glitches: boost into a stepped curve that quantises the wave, then back down
    // (the boost matters: quiet sounds would otherwise round to silence)
    crush = ctx.createGain(); crush.gain.value = 10;
    const shaper = ctx.createWaveShaper(), post = ctx.createGain();
    const n = 2048, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; curve[i] = Math.round(x * 5) / 5; }
    shaper.curve = curve; post.gain.value = 0.16;
    crush.connect(shaper); shaper.connect(post); post.connect(bus);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, setup, { capture: true, passive: true }));

  // ---- building blocks
  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function tone({ type = 'sine', f = 440, f2 = null, t = 0, a = 0.004, d = 0.2, g = 0.1, out = bus, send = 0, detune = 0 }) {
    const o = ctx.createOscillator(), v = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune;
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + a + d);
    env(v, t, a, g, d); o.connect(v); v.connect(out);
    if (send) { const s = ctx.createGain(); s.gain.value = send; v.connect(s); s.connect(verb); }
    o.start(t); o.stop(t + a + d + 0.05);
  }
  function noise({ t = 0, a = 0.003, d = 0.05, g = 0.1, type = 'highpass', f = 3000, f2 = null, q = 0.8, out = bus, send = 0 }) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), v = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true;
    fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + a + d);
    env(v, t, a, g, d); s.connect(fl); fl.connect(v); v.connect(out);
    if (send) { const x = ctx.createGain(); x.gain.value = send; v.connect(x); x.connect(verb); }
    s.start(t, Math.random() * 1.5); s.stop(t + a + d + 0.05);
  }
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ---- the sounds
  const S = {
    // a button press: a small glassy click
    tick(t) { tone({ f: 2600, f2: 1700, t, d: 0.045, g: 0.12, send: 0.15 }); noise({ t, d: 0.018, g: 0.08, f: 5000 }); },
    // back: the same click, lower and falling
    back(t) { tone({ f: 1500, f2: 800, t, d: 0.06, g: 0.11, send: 0.1 }); noise({ t, d: 0.02, g: 0.06, f: 3500 }); },
    // a frosted card appears: airy swell with high crystal partials
    glass(t) {
      noise({ t, a: 0.22, d: 0.5, g: 0.035, type: 'bandpass', f: 5200, q: 0.9, send: 0.6 });
      [1318.5, 1975.5, 2637, 3951].forEach((f, i) => tone({ f, t: t + 0.05 + i * 0.045, a: 0.01, d: 1.1 - i * 0.15, g: 0.035 - i * 0.005, detune: rnd(-6, 6), send: 0.7 }));
    },
    // the screen tears: crushed stutters and a falling sweep
    glitchOut(t, ms = 520) {
      const dur = ms / 1000;
      tone({ type: 'sawtooth', f: 420, f2: 55, t, a: 0.01, d: dur, g: 0.05, out: crush });
      for (let x = 0; x < dur * 0.9;) {
        const len = rnd(0.018, 0.06);
        if (Math.random() < 0.55) tone({ type: Math.random() < 0.5 ? 'square' : 'sawtooth', f: rnd(90, 1400), t: t + x, a: 0.002, d: len, g: rnd(0.03, 0.07), out: crush });
        else noise({ t: t + x, d: len, g: rnd(0.04, 0.09), type: 'bandpass', f: rnd(600, 6000), q: 3, out: crush });
        x += len + rnd(0.005, 0.04);
      }
    },
    // the new screen snaps in: one crushed fragment repeating faster and faster like a skipping CD, then a hard cut
    glitchIn(t, ms = 560) {
      const dur = Math.min(0.42, ms / 1000), f = rnd(120, 420), nf = rnd(1500, 5000);
      let x = 0, gap = 0.075, i = 0;
      while (x < dur - 0.03) {
        const len = Math.max(0.012, gap * 0.55), jump = [1, 1, 1.5, 0.75, 2][i % 5];
        tone({ type: 'square', f: f * jump, t: t + x, a: 0.001, d: len, g: 0.06, out: crush });
        noise({ t: t + x, a: 0.001, d: len * 0.8, g: 0.07, type: 'bandpass', f: nf * jump, q: 2.5, out: crush });
        x += gap; gap = Math.max(0.018, gap * 0.78); i++;
      }
      noise({ t: t + x, a: 0.001, d: 0.025, g: 0.12, type: 'highpass', f: 1200, out: crush });   // the cut
    },
    // a word on the poster flickers
    burst(t) { for (let i = 0; i < 3; i++) noise({ t: t + i * rnd(0.02, 0.05), d: 0.015, g: 0.025, type: 'bandpass', f: rnd(2000, 7000), q: 5, out: crush }); },
    // the sax assembles: a warm swell under the video, a clink as each crystal band settles, a shimmer at the end
    sax(t, dur = 6.9) {
      const v = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(260, t); lp.frequency.exponentialRampToValueAtTime(1600, t + dur * 0.85); lp.Q.value = 0.7;
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(0.05, t + dur * 0.5);
      v.gain.setValueAtTime(0.05, t + dur * 0.85); v.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
      lp.connect(v); v.connect(bus);
      [110, 164.81, 220.5].forEach((f, i) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = (i - 1) * 7; o.connect(lp); o.start(t); o.stop(t + dur + 0.7); });
      const notes = [1318.5, 1567.98, 1760, 1975.5, 2349.3];
      [0.3, 0.45, 0.58, 0.7, 0.8].forEach((k, i) => tone({ type: 'triangle', f: notes[i], t: t + dur * k, a: 0.003, d: 0.9, g: 0.05, send: 0.6 }));
      S.glass(t + dur - 0.35);
    },
    // a cover passes the front of the ring: a soft detent click
    detent(t) {
      if (t - lastDetent < 0.05) return; lastDetent = t;
      noise({ t, d: 0.012, g: 0.045, f: 2800 }); tone({ f: 950, f2: 700, t, d: 0.018, g: 0.025 });
    },
    // the ring fans out / the rack flips: a cardboard swish that lands with a thump
    rack(t, dir = 1) {
      noise({ t, a: 0.12, d: 0.32, g: 0.11, type: 'bandpass', f: dir > 0 ? 450 : 2600, f2: dir > 0 ? 2600 : 450, q: 1.1, send: 0.2 });
      tone({ f: 95, f2: 48, t: t + 0.32, a: 0.004, d: 0.18, g: 0.22 });
      noise({ t: t + 0.32, d: 0.03, g: 0.05, type: 'lowpass', f: 1200 });
    },
    // a locked album: a muted low knock
    locked(t) {
      tone({ f: 190, f2: 120, t, d: 0.13, g: 0.24 }); tone({ f: 250, t: t + 0.07, d: 0.09, g: 0.1 });
      noise({ t, d: 0.04, g: 0.06, type: 'lowpass', f: 900 });
    },
    // the unlocked album opens: a rising three-note chime
    open(t) { [659.25, 987.77, 1318.5].forEach((f, i) => tone({ type: 'triangle', f, t: t + i * 0.07, a: 0.004, d: 0.8, g: 0.07, send: 0.5 })); },
    // the record clears the sleeve: a quick swoosh and a pop
    pullOut(t) { noise({ t, a: 0.03, d: 0.22, g: 0.09, type: 'bandpass', f: 900, f2: 3200, q: 0.9 }); tone({ f: 130, f2: 60, t: t + 0.12, d: 0.12, g: 0.22 }); },
    // arriving at the deck: a low landing, a little needle crackle and a shimmer
    land(t) {
      tone({ f: 72, f2: 40, t, a: 0.006, d: 0.5, g: 0.3 });
      for (let i = 0; i < 14; i++) noise({ t: t + 0.08 + rnd(0, 0.6), d: 0.004, g: rnd(0.02, 0.06), f: 2500 });
      S.glass(t + 0.05);
    },
    // joined: a bright two-note confirmation
    join(t) { [783.99, 1174.66].forEach((f, i) => { tone({ type: 'triangle', f, t: t + i * 0.09, d: 0.6, g: 0.08, send: 0.4 }); tone({ f: f * 2, t: t + i * 0.09, d: 0.3, g: 0.02 }); }); },
    // something is missing in the form: two soft low taps
    error(t) { [0, 0.1].forEach(x => tone({ f: 300, f2: 240, t: t + x, d: 0.06, g: 0.12 })); },
  };

  function play(name, ...args) {
    if (muted || !S[name]) return;
    setup(); if (!ctx || ctx.state !== 'running') return;
    try { S[name](ctx.currentTime + 0.005, ...args); } catch (e) {}
  }
  // the friction of the record sliding out of its sleeve, following how fast it moves (0..1)
  play.slide = speed => {
    if (muted || !ctx || ctx.state !== 'running') return;
    if (!slideSrc) {
      slideSrc = ctx.createBufferSource(); slideSrc.buffer = noiseBuf; slideSrc.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = 0.6;
      slideGain = ctx.createGain(); slideGain.gain.value = 0;
      slideSrc.connect(bp); bp.connect(slideGain); slideGain.connect(bus); slideSrc.start();
    }
    slideGain.gain.setTargetAtTime(Math.min(1, speed) * 0.09, ctx.currentTime, 0.04);
  };
  play.duck = on => { if (ctx && !muted) master.gain.setTargetAtTime(on ? VOL * 0.35 : VOL, ctx.currentTime, 0.15); };
  play.setMuted = on => {
    muted = !!on;
    try { localStorage.setItem('gm-sound', muted ? 'off' : 'on'); } catch (e) {}
    if (ctx) master.gain.setTargetAtTime(muted ? 0 : VOL, ctx.currentTime, 0.05);
    if (muted && slideGain) slideGain.gain.value = 0;
  };
  Object.defineProperty(play, 'muted', { get: () => muted });
  play.names = Object.keys(S);
  window.sfx = play;
})();
