GROOVE MAKERS GM-001 - WEB 3D TURNTABLE
Music campaign / competition site

FILES
- dj_rig_web.glb (1.3 MB): use this one. Draco-compressed GLB, PBR textures, record-spin animation.
- dj_rig_web_nodraco.glb (2.8 MB): same model without Draco, only if your loader can't decode Draco.
- rig-controls.js: makes the deck interactive (see below). Upload next to the model.
- dj_rig_embed_example.html: complete working example. Put it in the same folder as the
  .glb and rig-controls.js and open it through a local server to test.
- dj_rig_preview.png: reference render.

SPECS
- Real-world scale: 45 x 44 cm footprint, Y-up (glTF standard), origin centred at floor level.
- ~45k triangles. Animation "SpinnerAction": record + platter, seamless 33 1/3 RPM loop (54 frames @ 30 fps).
- Uses KHR_materials_transmission (acrylic), KHR_materials_emissive_strength (LED glow).

INTERACTION (rig-controls.js + <model-viewer> 3.5.0)
- Start knob: click to start/stop. Spin-up and brake ramps; orange knob glow turns on/off.
- Pitch fader: drag between +8% and -8% (snaps to 0 near centre); record speed follows.
  Keyboard: arrows = 0.5% steps, Page Up/Down = 2%, Home = 0.
- Event: the <model-viewer> fires "rigchange" with detail { spinning, pitch } - handy for
  starting/stopping or pitching an audio track along with the record.
- Hotspot positions in the example are in the model's own coordinates - keep them as-is.

NOTE: the sliding fader cap moves one node of the model through model-viewer's internal
three.js scene (not a public API). Tested on model-viewer 3.5.0 - re-test if you upgrade.
Everything else (spin, start/stop, pitch speed, glow) uses the public API.
