# Design and asset notes

## Layers, back to front

1. Navy base #040D23 / #030B20.
2. Soft CSS radial lights: cyan and violet; slow drifting ambience.
3. Full-size translucent glass with backdrop-filter and a diagonal sheen.
4. Deck base, CSS ring/LED, vinyl seated on the platter, knob and fader, mounted tonearm.
5. White title image; thin cyan-violet waveform; live “Finding the groove.” text in Instrument Serif Italic.

## Shared turntable coordinates

Percentages refer to the complete square turntable container, including source transparent padding. Use these exact asset versions:

| Layer | Geometry |
| --- | --- |
| deck.webp | full canvas, 100% width/height |
| vinyl.webp seat | center 43.824% x / 48.562% y, width 66.8% |
| Vinyl rotation origin | 49.83% x / 49.91% y within vinyl image |
| tonearm.webp | full canvas, offset left .4%, top -.7% |
| Tonearm pivot | 84.5% x / 25.3% y within arm canvas |
| Tonearm cue | rotation -19deg to +8deg |
| knob.webp | left 9%, top 70.7%, width 6.3% |
| CSS ring | left 8.9%, top 70.6%, width 6.5% |
| fader.webp | left 87.6%, final top 59%, width 4.3%, height 8.7% |
| CSS LED | left 91.4%, top 63% |

The platter rim was fit from the source image rather than relying on its slightly off-center painted spindle. The last knob placement deliberately clears the lower-left structural screw.

## Animation timing

- Deck: 1.4-second depth/position/opacity entrance.
- Arm: 1.4-second cue beginning after 1.1 seconds.
- Fader: 1.3-second travel from top 72% to 59%, delayed 1.3 seconds.
- Lights: fade on after 1.5 seconds.
- Record: 12-second linear revolution beginning at 2.3 seconds.
- Waveform: three thin canvas curves with subtle breathing and phase drift; no audio dependency.
- Production exit: approximately 650ms fade, then cleanup.

Record highlights are part of the raster and rotate with it. Keeping a fixed lighting reflection over a rotating record would require another reflection layer; that is not implemented in this version.

## Asset inventory

- deck.webp — generated base with platter, pivot, fader slot and structural screws; movable knob/cap removed.
- vinyl.webp — cropped circular cosmic record.
- tonearm.webp — full-canvas matching overhead arm.
- knob.webp — separate brushed-silver control.
- fader.webp — separate silver cap.
- title.webp — transparent white “Groove Makers by Plunky” lockup.
- homepage-sleeve.webp — illustrative homepage artwork used only by the replayable demo.

No opaque background asset is required. The “Finding the groove.” line is live text, not an image. No photographic Plunky portrait is included in this final loading design. Earlier portraits and other historical concepts are outside this package.
