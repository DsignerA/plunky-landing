# Groove Makers — Cosmic Turntable Loading Screen

Final design handoff, October 26, 2026. Prepared for Groove Makers by Plunky / N.A.M.E. Brand Records.

## Start here

- **demo.html**: the replayable approved design. Open in a browser, then use “Replay loading screen” or “Preview homepage reveal.” The homepage in this demo is an illustrative transition preview, not the actual application.
- **index.html**: standalone production-loading integration example. It dismisses immediately when the page, loading images, and fonts are ready; it can therefore be brief. Use demo.html for visual review.
- **loader-markup.html**, **loader.css**, **loader.js**: component files for the existing website.
- **INTEGRATION.md**: instructions for Claude and cPanel integration.
- **DESIGN-NOTES.md**: visual decisions, coordinates, animations, and asset handling.
- **source/preview.html**: exact self-contained in-chat source with embedded WebP assets. demo.html is its standalone export.
- **assets/**: all seven separate image layers used by the demo/component, with transparency preserved.

## Run locally

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/demo.html`. No package installation or build step is needed. The demo can also open directly as a file. Google Fonts requires connectivity; system fallbacks remain available.

## Final approved changes included

- Midnight navy / cyan / violet palette; background, frosting, light, and glow are code.
- Full-screen glass with no hard horizontal seam or floor boundary.
- Independently layered deck, vinyl, tonearm, knob, fader cap, and CSS LEDs.
- Vinyl aligned to the geometric platter rim; mounted tonearm cues inward.
- Left control moved upward and inward to clear the corner screw.
- Thin, layered, softly breathing waveform **above “Finding the groove.”**
- “Cueing the experience…” removed entirely.
- Replayable deck entrance, fader travel, power lights, cue motion, and record rotation.
- Static reduced-motion rendering.

## Status

This package is ready for integration and review; it does not modify the repository's existing landing page or deploy to cPanel. Image assets are generated raster artwork; small mechanical asymmetries remain in their source geometry. The waveform is decorative and is not audio-reactive. No music plays automatically.

Validation performed: asset references, transparent image decoding, JavaScript syntax, HTML structure, build consistency, and mathematical platter/record placement. A raster composition was inspected for alignment. Browser playback remains to be checked in target Safari/Chrome; the environment did not have a browser executable installed.
