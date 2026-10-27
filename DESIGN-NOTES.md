# White + aura experience

Based on `groove-makers/scroll-preview` at `b47ffb7`. This revision is on `groove-makers/white-aura`.

The archive loader combines a regular printed navy Groove Makers jacket, a black vinyl disc, and a separate contact-sheet insert. The insert is generated illustrative music imagery, not documentary photos of Plunky. Replace it with approved archival photographs when available. The large headline and status are real text; aura, frost and waveform are code.

`white-aura.css` loads after the existing stylesheet to unify the arrival, reveal, collection, player, form and closing sections. It retains the existing scroll timeline, geometry, rotating font pairings, record grid, selection, spotlight editing and form validation. Navy text, cobalt actions and subtle cyan/violet light replace the tan/burgundy interface. Original green vinyl, album covers and sponsor raster assets retain their colors. The existing wooden deck is desaturated and brightened in CSS; it is not a newly rendered pearl-white turntable. Its platter and tonearm coordinates remain intact.

The spotlight preview receives a complementary navy/cool-blue palette. Its existing content and raster branding remain. The form is still preview-only: no entry is registered, submitted or saved. Audio remains unconfigured; playback controls animate the deck until approved audio files are added to `audioSrc` in `app.js`.

## Loading

`archive-loader.js` keeps the existing `GrooveMakersLoader.finish()` / `destroy()` and `groove:ready` contract. App readiness follows decoded hero images and fitted headline fonts. There is no artificial minimum duration and no fake percentage. An 8-second timeout fails open. Reduced motion disables decorative movement and skips the exit fade. Cleanup removes readiness listeners and timers.

## Files to upload

Upload `index.html`, `style.css`, `white-aura.css`, `archive-loader.css`, `archive-loader.js`, `app.js`, `spotlight.html`, and the complete `assets/` directory together into a separate cPanel preview folder. Existing `loader-cosmic/` files are retained as source history but no longer loaded by `index.html`. Do not deploy over the production campaign until its backend integration is accounted for.

## Validation

Run `node --check app.js`, `node --check archive-loader.js`, and `node tests/archive-loader-test.cjs` from the repository root. Structural checks verify all original experience IDs and local asset references. Browser verification remains outstanding: check mobile Safari portrait/landscape, frosted-scroll transition, all 12 records, first-tap selection, play/stop, Join validation, photo preview, and Back/Reset. The pre-existing `tests/flow-test.js` uses a machine-specific Playwright install; it was not used for this revision.

No cPanel deployment is performed by this update.

## Current design revision

Restored the original cosmic turntable loader from b47ffb7 and the original orange CTA / warm text palette at user request. White backgrounds, frost and aura surfaces remain. The archive loader files are retained as an inactive alternative; index.html no longer loads them. The original spotlight palette is restored. No minimum loader duration is enforced in the application; the inline preview holds briefly for review.

## Scroll selection

The Select grid holds for 3.6 screens of scrolling. Progress .47–.60 advances through all 12 choices, in order and in reverse when scrolling back. Each choice updates its ring, accessible pressed state, track title and signup context. Tapping locks that record while the smooth transition opens its player.

## Acrylic player revision

The selected-track section now uses separate acrylic deck, arm, knob and pitch-cap assets. The authentic green record remains the selected track. Platter diameter is .68 of deck width with center (.493, .485); arm overlay offsets (.106, -.046) align its pivot to the pedestal. Mobile layout places the square deck above the title and CTA, hides the rear sleeve to reduce crowding, and retains existing scroll-selection and Join behavior. Alignment and mobile Safari rendering still need browser verification.

## Keep browsing on the player

The selected-track section includes all 12 records in a swipeable, keyboard-accessible carousel. Choosing a record updates its pressed state, title, selection context, counter and Continue CTA without navigating away. Previous/next controls stop at the first/last record. The deck is smaller on mobile to keep the carousel and action visible.

## Current player: tuning ruler

The duplicate vinyl carousel is replaced by a native continuous range input (1–12) over a translating calibrated ruler. Fractional finger movement updates only the ruler transform; crossing a whole-track boundary updates selection, and release snaps to the chosen track. Controls stop at the ends. Two blurred, noninteractive Season 02 / Season 03 Coming soon placeholders appear below the action. These are illustrative placeholders, not announced releases. Node tests cover boundaries, fractional movement without full-scene redraw, snapping, counters and CTA. Browser smoothness and visual touch validation remain outstanding.

## Unified upright listening ring

The selected-track phase is now a normal grid within its stage bounds, with upright perspective Three.js ring surrounding a stationary layered deck and original album sleeve. Track controls, title and CTA form one compact decision area. The native range overlays the art, blocks page movement during drag, supports keyboard navigation, and keeps the HTML ruler as a WebGL fallback. The renderer updates its perspective aspect on resize and sleeps between movements. Motion preview is honestly labeled; audio sources are still absent. The turntable is layered raster artwork, not a full 3D model. The ring is real WebGL geometry. Touch/browser visual validation remains outstanding.


## Discovery effects integration — 2026-10-27
Added discovery-effects source and discovery-build static entry. R3F procedural sax key, ShaderGradient aura, Paper LiquidMetal wordmark, pinned linked-source liquid-glass-js reveal and liquidGL settled controls. Existing artwork used unchanged. See discovery-effects/README.md for exact versions, choreography, device limits and build instructions. Original header links to the new entry; validated grooveTrack URL index returns to selected campaign record. Production build and catalog/motion tests pass; cloud browser confirmed WebGL2 unavailable, so only fallback visual/interaction checks were possible. Full GPU/iPhone QA outstanding. No publish or GitHub push.
