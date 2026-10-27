# Claude integration handoff

Integrate this finalized loading screen into the existing Groove Makers website. Preserve the existing application and chapter navigation.

1. Copy assets/ and loader.css/loader.js into the website. Adjust image URLs in loader-markup.html to the actual subdirectory, keeping relative paths for cPanel deployment under /groovemakers/.
2. Add the markup immediately after `<body>`, above the existing homepage. Include loader.css and load loader.js using `defer`. Include the DM Sans and Instrument Serif Google Fonts link from index.html, or self-host those fonts.
3. Keep the background entirely in code. The old frosted-background.png is not used.
4. Use the supplied dimensions and source padding. Do not crop deck.webp or tonearm.webp independently. Their shared square canvas establishes mounting coordinates. Do not rotate or resize layers separately to fit a new screen size; resize their common `.gc-turntable` container.
5. Default behavior dismisses when window load, loading images, and fonts are ready. For an application with its own readiness logic, set `data-ready-mode="app"` on `#gc-merged-loader`, then call:

```js
window.GrooveMakersLoader?.finish();
// Or, after loader.js initializes:
window.dispatchEvent(new Event('groove:ready'));
```

Call finish only after the first useful homepage content is ready. The API is idempotent. The 8-second fail-open timeout applies in either mode. There is no artificial minimum delay.

6. The production overlay and its listeners/observers are removed on completion. Existing homepage markup is revealed underneath. The controls and illustrative homepage in demo.html are for review only and must not be installed as the real site.
7. Set `<meta name="theme-color" content="#040d23">`, body background #040d23, and viewport-fit=cover. Verify iPhone safe-area spacing and short screens. The overlay permits vertical overflow rather than hiding content if the viewport is short.
8. Test Safari and Chrome: clear first visit, warm cache, slow/failed image, timeout, reduced motion, narrow phone, landscape, and repeat finish calls. Confirm the overlay removes, underlying controls work, and there is no horizontal scrolling.

The loading screen uses an opaque navy base, CSS lights, CSS backdrop-filter glass, then crisp raster hardware and live text. It contains no embedded portrait or background photograph. LEDs are CSS; small studio highlights on the supplied hardware images are intrinsic to those assets.

## Do not reintroduce

- Warm cream/orange/burgundy styling.
- A seam near the tagline.
- “Cueing the experience…” text.
- Equalizer-style thick bars or a conventional progress line.
- Changes to the measured platter center or tonearm transform origin.

## Review

Use demo.html as the visual reference. Integrate on the existing project's development branch; deploy only through its normal release process.
