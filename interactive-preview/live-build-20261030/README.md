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
