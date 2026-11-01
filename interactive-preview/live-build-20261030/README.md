# Live build snapshot — 2026-10-30

Exact copy of what is deployed at
https://www.bisonboost.com/groove-makers/interactive-preview-20261028/
(`/home/striurym/bisonboost.com/groove-makers/interactive-preview-20261028` on the `otaku` cPanel host).

Why this exists: the live page had been edited after the last commit on this branch
(poster-record, sfx, audio player, name-brand covers, etc.) and its unbuilt source was
not in git. This snapshot preserves it. `index.html` here matches the live file
(sha256 7c78c9aa…08a8) after the Firefox fix below.

Left out on purpose: `preview-assets/track-01…12.*.m4a` (Plunky's music; this repo is
public) and server `.bak` files. They remain on the server only.

## Firefox fix (2026-10-30)

Firefox ignores an import map that appears after a module script has started loading
("Import maps are not allowed after a module load or preload has started"), so `three`
never resolved and the poster/record/glass CTA did not render — black screen.
Fix: the `<script type="importmap">` now comes before the model-viewer module script.
Keep it first in `<head>` in any future build.

## No-3D fallback (2026-10-31)

Browsers that can't create a WebGL2 context (old GPUs, hardware acceleration off,
some locked-down machines) used to get a black screen. Now:

- An inline probe at the top of `<body>` adds `body.nogl` before any 3D script runs;
  `poster-record.cf73e245.js` also falls back if the renderer fails to start.
- Poster: plain GROOVE / MAKERS type, the small poster type slides in, and the
  invitation card still appears (darker, since there is no blurred 3D scene behind it).
- Turntable: the 2D acrylic deck from the first preview (commit 7ea6bbb:
  `assets/acrylic/deck.webp`, `assets/vinyl-v2.webp`, `assets/acrylic/tonearm.webp`)
  replaces the model-viewer deck. It spins on the existing `rigchange` event, follows pitch.
- The gallery already fell back to the flat album cards.

Test with 3D off: Firefox pref `webgl.disabled=true`, or Chromium `--disable-3d-apis`.
