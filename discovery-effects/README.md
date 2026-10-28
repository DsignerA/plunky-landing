# Groove Makers: glass vinyl journey

New branch `groove-makers/glass-vinyl-journey`, extending the existing `groove-makers/white-aura` discovery implementation at `e59f9d9`. The original campaign entry, signup preview, assets and loader remain intact. Nothing is deployed by this branch.

## Run

Serve the entire repository over HTTP and open `discovery-build/index.html`. The original campaign header already links to that entry. The checked-in build is static; cPanel does not need Node. Keep `assets/` alongside `discovery-build/` because the layered deck reuses campaign artwork.

To edit: Node 24, `cd discovery-effects`, `npm ci`, `npm test`, `npm run build`. Build outputs sibling `discovery-build/`. On restricted machines use `npm ci --cache /tmp/groove-npm-cache`.

## The flow

1. Press the floating sax key. Existing R3F procedural key is reused.
2. Reveal a procedural saxophone with three refractive glass ribbons. This is an art-directed model, not an instrument scan.
3. Original album covers fan out. The journey pauses until **Open African Rhythms** is chosen. The catalogue is not a claim that every album is challenge eligible.
4. African Rhythms vinyl **slides out**, then **rolls into the next scene**, then **lands on the deck**, in that order. Separate reversible motion channels prevent all three actions from running together.
5. Horizontal glass track strip replaces the giant radial dial. Twelve existing selected tracks, next/previous buttons, keyboard-accessible number buttons, swipeable rail and full track list.
6. **Choose this track** opens the information form, retaining the track. Name, email, city/country, optional Instagram; native validation and editable review.

The deck is for listening and choosing, **not recording, mixing or creation**. The current repository has no approved audio URLs or registration endpoint. Play is explicitly disabled and says “Audio preview not connected.” Form review explicitly says nothing is sent or saved. Connect these services before calling this a live registration experience. Form fields stay in memory only; chosen track is preserved in the URL for refresh, not personal information.

## Materials and assets

Deep black, clear/smoked glass and neutral silver deck. No radial dial or colored background aura. Existing deck/arm assets are desaturated; authentic green vinyl and album artwork retain their colors. Real cover images are copied unchanged from official artist/label Bandcamp pages. `public/assets/covers/Sources.json` records source page, CDN URL and SHA256 for each image. Six are displayed; the additional originals are included for future catalogue extension.

The fallback uses the approved no-text key concept and cropped sax/glass reference, plus authentic covers. Full 3D uses procedural geometry. Deck remains layered raster artwork, not a scanned 3D deck. The landing is a short coordinated 3D-to-layered-art crossfade; it is not a physically simulated needle or record.

R3F, Three, liquidGL and pinned existing dependencies are reused. Existing ShaderGradient, Paper LiquidMetal and vendored glass modules remain in the source, but the atmosphere effect is deliberately not mounted because this direction removes the colored aura. No replacement framework was added.

## Accessibility / controls

Native buttons, labels, required/email validation, focus outlines and form/track heading focus. All 12 tracks have meaningful accessible names and selected states. Pause, replay, skip and manual progress remain available. Browser history handles Discover, Collection, Listen and Join. Hidden tabs stop animation; reduced motion jumps between phases. No WebGL2 uses the static-art fallback with all controls available.

## Verification

- Production build passed (Vite reports its existing large Three.js chunk and upstream `use client` warnings).
- Five motion/catalog tests pass, including slide-before-roll-before-land, no aura, sax bridge, bounds and reverse seeking.
- Existing campaign syntax, loader tests and 12-track selector tests pass.
- Source regression tests cover the listening-only UI, track handoff URL, native form constraints and catalogue eligibility.
- Browser execution was attempted but blocked: Chromium's process socket is denied in this execution sandbox; the alternate cloud browser blocks the local preview URL. No claim of mobile visual, GPU, keyboard interaction, glass capture or iPhone Safari QA is made. These remain required before deployment.

Nothing was merged or deployed. This branch is a reviewable implementation, not a live signup service.
