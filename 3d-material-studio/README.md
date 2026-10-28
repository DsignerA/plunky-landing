# Groove Makers — GM-001 3D Material Studio

This folder contains the actual 3D studio viewer and interactive control script, committed on the isolated branch `groove-makers/3d-material-studio-20261028`. The original Groove Makers site and existing 2D experience remain intact.

## Model

`dj_rig_web.glb` is the supplier's GM-001 model with two fixes: an even 33 1/3 RPM spin (the original animation was eased) and only the record spinning (platter and spindle moved out of the animated `Spinner` node, same positions). Geometry and textures are unchanged. `fader.js` slides the pitch fader cap to match the pitch.

## Realistic look (`realistic/`)

`realistic.js` adds a Realistic / Original switch (Realistic is the default):
- Record: `record-color.webp` (original label, painted vinyl shine removed), `record-grooves-normal.webp` (concentric grooves), `record-roughness.webp` (glossy gaps, satin grooved bands, matte label).
- Start knob: brushed metal with `knob-brushed-normal.webp` in place of the painted knob image.
- Lighting: `studio_small_09_1k.hdr`, Poly Haven "Studio Small 09" by Sergej Majboroda (CC0), with exposure 1.45.
- The deck top keeps its painted texture: its details are part of the image, not modelled. A fully realistic deck needs those details modelled and unlit PBR textures from the model's author.

## Test

From the repository root:

`python3 -m http.server 8000`

Open `http://localhost:8000/3d-material-studio/`.

The app loads `@google/model-viewer@3.5.0` from jsDelivr (network required), uses GLB-embedded PBR materials (Original) or the realistic set (Realistic), acrylic transmission, animated platter, and exposed roughness/exposure controls. Model-viewer custom pitch fader movement may depend on version; validate in desktop/mobile Chrome.

## Source

User-supplied GM-001 files: `dj_rig_web.glb`, `dj_rig_web_nodraco.glb`, and `rig-controls.js`. No changes made to original asset geometry.
