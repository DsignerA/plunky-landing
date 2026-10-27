# Groove Makers — discovery effects

An additional discovery entry in the existing campaign, with the original select/join experience retained.

## Open and deploy

Serve the **whole campaign directory** over HTTP. Open `discovery-build/index.html`, or use the new Discover link in the original campaign header. The build is static and ready for cPanel; Node is needed only to edit/rebuild, never to host it. Keep the folder structure intact: Choose this track navigates to `../index.html?grooveTrack=1` (1–12). The original app validates that index and opens the corresponding selection.

Source lives in `discovery-effects/`. With Node 24, run `npm ci`, `npm run test`, and `npm run build` there. The build writes to sibling `discovery-build/`. Versions and transitive dependencies are pinned in package-lock.json. In a development server scoped to `discovery-effects/`, the link back to the full campaign requires serving the parent campaign; use the complete packaged preview for that handoff.

## Choreography

One reversible progress value drives the entire discovery. Press to begin advances it over 8.5 seconds; pause, scroll, vertical touch drag, or the native range can control it manually. Replay and Skip to records remain available.

| Progress | Action | Implementation |
| --- | --- | --- |
| 0–24% | Floating sax key, lever press | React Three Fiber, procedural geometry and real lever pivot |
| 4–51% | Restrained cobalt/magenta/brass light | ShaderGradient, low pixel density; unmounted outside its interval |
| 10–42% | Brief liquid-metal wordmark | Paper Shaders LiquidMetal with the existing Groove Makers logo |
| 26–37% | Glass reflection of sleeve artwork | Exact linked liquid-glass-js implementation; desktop only |
| 32–82% | Sleeves fan into depth and chosen sleeve settles | R3F meshes with existing unaltered artwork textures |
| 78–98% | Record slides out from behind the sleeve | Same record mesh and continuous position; no replacement fade |
| 91–100% | Glass selection bar appears | liquidGL; controls and text remain DOM content |

The procedural sax key is an art-directed assembly (rod, posts, pivot, cup, pearl), not a scan of a particular saxophone. It supports actual rotation and a lever press; replace it with an approved GLB later for instrument-specific fidelity.

The three sleeves are the existing Groove Makers front/back and the actual African Rhythms sleeve. They are packaging and album views, not three invented albums. The 12 selectable songs use the existing catalog. There is no audio source in the current campaign: the UI explicitly labels this as motion preview, and Spin record controls visual rotation only.

## Exact library identity

- React Three Fiber: @react-three/fiber 9.8.2, React/React DOM 19.3.1, Three 0.186.1.
- ShaderGradient: @shadergradient/react 2.4.20.
- Paper's Liquid Logo repository is an application, not a reusable npm logo component. This integration uses its underlying Paper Shaders LiquidMetal component, @paper-design/shaders-react 0.0.82, on our own existing logo.
- The supplied Train-Case/liquid-glass-js URL redirects to JadenV15/liquid-glass-js. Its exact src/index.js is vendored under src/vendor/liquid-glass.js at commit b7402ac7b4c424167c682548f9513985abd7effb, with MIT license retained. The similarly named npm package belongs to another author and was removed.
- liquidGL: liquid-gl 3.0.0 from naughtyduk/liquidGL. This is separate from both the shape library and Liquid Logo.

Upstream licenses are retained in installed packages; the vendored source license is included in src/vendor. The MIT libraries are used as dependencies, not copied application branding.

## Performance and fallback

- Main scene uses a capped 1.5 device-pixel ratio, demand rendering after the reveal, and no idle record spin.
- The aura, wordmark and prism appear only during their reveal intervals. The prism is omitted on coarse pointers; the persistent bar uses one glass treatment.
- Hidden-tab handling stops the journey and pauses the scene; decorative shader components unmount. Replay resumes from the current progress value.
- Reduced-motion mode disables autoplay, floating, spinning and decorative shaders. Users can jump to records or use the progress input. All selection controls remain available.
- If WebGL2 is unavailable, an artwork composition replaces the scene; the native controls, track selection and continuation remain usable.
- liquidGL captures the page; refraction of a live R3F canvas is **not guaranteed**. The bar is deliberately introduced after the main scene settles. No preserveDrawingBuffer workaround is enabled, and no claim of live 3D refraction is made.

## Validation

Production build and motion/selection tests pass. The tests cover reversible progress, effect bounds, final record continuity, control ordering, and catalog clamping. The existing campaign's 12-track tuner test also passes.

The cloud browser reports WebGL2 unavailable. Browser checks confirmed the fallback artwork, Skip, next-track selection, count/title update and selected-track URL. Continuation was verified to open the original campaign at Kazi with its correct count and Continue action. Full GPU effects, iPhone rendering, glass capture quality and frame pacing still require device testing. This build has not been published or pushed to GitHub.
