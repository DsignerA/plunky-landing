# Groove Makers — Glass Saxophone

Interactive gold saxophone and three clear, beveled crystal bands on black. This is live 3D geometry, including the saxophone body, hollow bell, mouthpiece, keys, pearl touches, mechanical rods, and guards. The saxophone is a procedural interpretation of the visual reference, not a scanned or uploaded instrument model.

## View the ready-built experience

From the **repository root**, run:

```sh
python3 -m http.server 8000
```

Open **http://localhost:8000/glass-saxophone/dist/** in Chrome or Safari with WebGL2 / hardware acceleration enabled. No npm install or build is required to view it. Do not open index.html directly with file://.

The collection button opens the existing `discovery-build/index.html` in this branch. Serve the whole repository so that link works.

For cPanel, copy the complete `glass-saxophone/` folder into the existing campaign directory. Visit `glass-saxophone/dist/`. The existing `discovery-build/` directory should remain alongside `glass-saxophone/`.

## Interaction

- Drag: orbit around the sculpture. Pinch or scroll: zoom.
- Arrows and dots: three composed camera angles.
- Glass on/off: inspect the metalwork unobstructed.
- Pause motion: stop automatic rotation. Reset view: restore the first camera.
- Reduced-motion preferences are respected; rendering pauses while the tab is hidden.

## Rebuild

Node 18+ recommended for development. The prebuilt files do not require Node.

```sh
cd glass-saxophone && npm ci && npm run build
```

Edit `src/main.js` for geometry, lighting, camera, and materials. Edit `dist/style.css` and `dist/index.html` for presentation. `npm run build` bundles the renderer into `dist/app.js`; it preserves HTML and CSS.

## Materials

Three.js 0.180.0 `MeshPhysicalMaterial`: transmission 1, opacity 1, IOR 1.52, roughness 0.025, thickness 0.34, and dispersion 1.0. Glass is a closed extruded annulus with beveled edges, not a transparent image or CSS blur. A reflection-only PMREM studio keeps the visible background black while illuminating glass edges and gold. Bundled JavaScript needs no external CDN or remote model files.

Real-time raster transmission approximates refraction; overlapping transmissive surfaces do not reproduce full path-traced multiple scattering. Device performance and GPU support vary. Pixel ratio is capped on mobile. The pill-shaped collection button uses a separate CSS treatment.

## Validation

The production bundle built successfully. HTML, local references, package lock, and material/geometry construction were checked. The supplied remote preview browser reports WebGL unavailable, so GPU rendering, prism strength, visual fidelity, and mobile frame rate have **not** been visually verified. Check those in a hardware-accelerated browser before treating this as a pixel-matched production render.

Three.js is MIT licensed; see THIRD-PARTY-NOTICES.txt.
