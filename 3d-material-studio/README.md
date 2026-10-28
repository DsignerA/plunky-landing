# Groove Makers — GM-001 3D Material Studio

This folder contains the actual 3D studio viewer and interactive control script, committed on the isolated branch `groove-makers/3d-material-studio-20261028`. The original Groove Makers site and existing 2D experience remain intact.

## Required model file

**Important:** `dj_rig_web.glb` and `dj_rig_web_nodraco.glb` are binary model files provided in the ChatGPT download `groove-makers-3d-studio.zip`. They could not be uploaded by the available GitHub connector, so the model files are **not yet committed**. The viewer will not show the turntable until you copy at least `dj_rig_web.glb` into this folder.

Download and unzip the [studio bundle from the ChatGPT conversation] and copy the model file to:

`3d-material-studio/dj_rig_web.glb`

Optionally also copy `dj_rig_web_nodraco.glb` as the no-Draco fallback. Then `git add 3d-material-studio/*.glb && git commit -m "Add 3D turntable models" && git push origin groove-makers/3d-material-studio-20261028`.

## Test

From the repository root:

`python3 -m http.server 8000`

Open `http://localhost:8000/3d-material-studio/`.

The app loads `@google/model-viewer@3.5.0` from jsDelivr (network required), uses GLB-embedded PBR materials, acrylic transmission, animated platter, and exposed roughness/exposure controls. Model-viewer custom pitch fader movement may depend on version; validate in desktop/mobile Chrome.

## Source

User-supplied GM-001 files: `dj_rig_web.glb`, `dj_rig_web_nodraco.glb`, and `rig-controls.js`. No changes made to original asset geometry.
