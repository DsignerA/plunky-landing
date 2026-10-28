# Groove Makers interactive preview

This is a lightweight tap-driven prototype on a separate branch, based on `groove-makers/glass-vinyl-journey`. It does not alter the existing live Groove Makers site.

## Open locally

Run `git switch groove-makers/interactive-preview-20261028 && python3 -m http.server 8000`, then visit `http://localhost:8000/interactive-preview/`.

The preview reuses the verified original sleeve, vinyl and acrylic turntable assets already in `assets/`.

## Artwork

`preview-assets/sax.webp` is the sax image from the ChatGPT preview package, cropped to the instrument and glass ribbons so the page's real caption and button are the only ones shown.

## 3D key and deck (`deck/`)

- `sax_key_web.glb`: the first scene's 3D sax key (supplier README in `README-sax-key.txt`). Tap or Enter dips it, flashes it and sends ripple rings, then opens the sax scene.
- `dj_rig_web.glb`: GM-001 turntable (supplier README in `README-dj-rig.txt`), with two fixes to the supplied file: the spin animation is an even 33 1/3 RPM (the original was eased and nearly stopped once per turn), and only the record spins (platter and spindle moved out of the animated `Spinner` node, same positions).
- `rig-controls.js`: supplier start/stop and pitch controls, unchanged. `fader.js` slides the `Pitch_Fader` cap to match the pitch (uses model-viewer's internal scene; tested on 3.5.0).
- The camera distance follows the viewer's aspect so the deck isn't cut off on phones.
- model-viewer 3.5.0 loads from jsdelivr; its Draco decoder loads from gstatic.

## Glass button

"Explore the collection" is a `.glass-cta`, plain silver glass at rest with a prismatic rim only while pressed: `glass-cta.js` draws a WebGL glass pill behind the label with the vendored `vendor/liquid-glass.js` (MIT, see `vendor/liquid-glass-LICENSE`; Three.js 0.170.0 from jsdelivr via the page's import map). CSS adds the prismatic rim. Without WebGL the button keeps a CSS-only glass look. On bisonboost.com, deploy JS and images under content-hashed names because the CDN caches stale copies.

The prototype includes: SVG-filter ripple on key press; key-to-sax navigation; sleeve gallery; draggable vinyl extraction; animated record on turntable; 12-track selector; and an **unconnected** registration form.

Note: this is a new, compact GitHub implementation of the flow, **not** the large self-contained HTML bundle created in ChatGPT. It is suitable for iterative development, and the source artwork still needs to be imported before it fully matches the visual references.