# Groove Makers interactive preview

This is a lightweight tap-driven prototype on a separate branch, based on `groove-makers/glass-vinyl-journey`. It does not alter the existing live Groove Makers site.

## Open locally

Run `git switch groove-makers/interactive-preview-20261028 && python3 -m http.server 8000`, then visit `http://localhost:8000/interactive-preview/`.

The preview reuses the verified original sleeve, vinyl and acrylic turntable assets already in `assets/`.

## Artwork

`preview-assets/key.webp` and `preview-assets/sax.webp` are the key and sax images from the ChatGPT preview package (`groove-two-scenes.zip`). The sax image is cropped to the instrument and glass ribbons; its drawn-in title, button and nav were removed so the page's real caption and button are the only ones shown.

## Glass button

"Explore the collection" is a `.glass-cta`: `glass-cta.js` draws a WebGL glass pill behind the label with the vendored `vendor/liquid-glass.js` (MIT, see `vendor/liquid-glass-LICENSE`; Three.js 0.170.0 from jsdelivr via the page's import map). CSS adds the prismatic rim. Without WebGL the button keeps a CSS-only glass look. On bisonboost.com, deploy JS and images under content-hashed names because the CDN caches stale copies.

The prototype includes: SVG-filter ripple on key press; key-to-sax navigation; sleeve gallery; draggable vinyl extraction; animated record on turntable; 12-track selector; and an **unconnected** registration form.

Note: this is a new, compact GitHub implementation of the flow, **not** the large self-contained HTML bundle created in ChatGPT. It is suitable for iterative development, and the source artwork still needs to be imported before it fully matches the visual references.