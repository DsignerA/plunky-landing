SAX KEY TOUCH - WEB 3D MODEL
Music campaign / competition site

FILES
- sax_key_web.glb (0.55 MB): use this one. Draco-compressed GLB, PBR textures.
- sax_key_web_nodraco.glb (1.4 MB): same model without Draco, only if your loader can't decode Draco.
- sax_key_preview.png: reference render.

SPECS
- Real-world scale: ~50 x 33 x 30 mm, Y-up (glTF standard), origin centred at the base.
- ~31k triangles, 1024px textures.
- Materials: chrome/gold body + "Pearl" (abalone texture).
- Uses KHR_materials_iridescence (rainbow sheen on pearl and chrome) and KHR_materials_clearcoat (pearl gloss).
  Both are supported by model-viewer / three.js. Viewers without iridescence support still show
  the abalone colours, just without the colour shift.

EMBED (Google <model-viewer> 3.5.0)
<script type="module"
  src="https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js"></script>

<model-viewer
  src="/assets/sax_key_web.glb"
  alt="Saxophone key touch with abalone pearl"
  camera-controls auto-rotate
  exposure="0.9" tone-mapping="neutral"
  camera-orbit="35deg 60deg auto"
  style="width:100%;height:520px;background:#0c0c12">
</model-viewer>

Designed for a dark background (like the source art); it reads flatter on white.
