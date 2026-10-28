# Groove Makers interactive preview

This is a lightweight tap-driven prototype on a separate branch, based on `groove-makers/glass-vinyl-journey`. It does not alter the existing live Groove Makers site.

## Open locally

Run `git switch groove-makers/interactive-preview-20261028 && python3 -m http.server 8000`, then visit `http://localhost:8000/interactive-preview/`.

The preview reuses the verified original sleeve, vinyl and acrylic turntable assets already in `assets/`.

## Required key/sax image imports

The exact uploaded images from ChatGPT are not yet checked into this branch. To enable the first two scenes, copy `key.webp` and `sax.webp` from the downloadable Groove Makers preview package into `interactive-preview/preview-assets/`. The prototype shows a plain-text fallback if either is unavailable.

The prototype includes: SVG-filter ripple on key press; key-to-sax navigation; sleeve gallery; draggable vinyl extraction; animated record on turntable; 12-track selector; and an **unconnected** registration form.

Note: this is a new, compact GitHub implementation of the flow, **not** the large self-contained HTML bundle created in ChatGPT. It is suitable for iterative development, and the source artwork still needs to be imported before it fully matches the visual references.