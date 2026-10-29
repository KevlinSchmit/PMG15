# Blue Catch — interactive motion story

A responsive, animated, 27-slide presentation built directly from **Group 16 Blue Catch Pitch Deck.pdf**. The original interviews have separate slides for readability. Two consecutive underwater scenes demonstrate species recognition and hook retraction. At the user's request, the market and funding charts are redrawn in the presentation's palette, and the lure and turtle use detailed vector illustrations. The source wording, figures, and calculation inconsistencies are preserved; original images remain available in the source viewer. The product demonstration is illustrative, not a working AI system.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
cd /workspace/PMG15
npm ci
npm run dev -- --port 5173
```

```sh
npm run build
npm run preview -- --port 5173
```

To create a single downloadable presentation that opens directly in a browser, run `npm run build` followed by `python tools/export-standalone.py`. The resulting `/workspace/Blue-Catch.html` includes the complete site, local fonts, original graphics, all 23 source pages, and the downloadable original PDF. No server or internet connection is required for the presentation itself; the original cited websites and Google Sheets link still require internet access.

## Present

- Click the slide background, press **Right Arrow**, or press **Space** for the next slide. **Left Arrow** or **Shift + Space** goes back. Buttons, links, and zoomable diagrams keep their own interactions.
- Use **Home** / **End** for the first / final slide. The final slide's next button restarts the presentation.
- Swipe left / right on touch screens. The page does not scroll, and there is no top navigation.
- Scenes use topic-related illustrated objects to carry their transitions: schools of fish, branching coral, a releasing net, chip signals, casting lines, sonar, a swimming turtle, compass routes, market fleets, listening waves, a marine shield, and funding coins. Headings and body text stay at a fixed size and position, with a short dissolve. There are no cloned text zooms, spinning screenshots, or word-by-word entrances.
- The same transparent vector objects appear in available scene margins and travel into the transition. Chapter openings give them more space. Dense portrait layouts omit decoration where it would overlap reading. The camera scene extends into its environment, and stays aligned while the turtle encounter begins.
- Use the fullscreen icon at bottom right, or press **F**. Escape exits fullscreen.
- Slide 7 shows the camera lure scanning. Advance normally to slide 8: the turtle approaches, both hooks retract, tracking appears, and the float lights up. No special control or timed auto-advance is required. Going back restores the scanning state.
- The TAM/SAM/SOM chart builds its nested circles and reveals the original market figures. The funds chart draws its four donut segments and reveals the original amounts. Both retain an **Original graphic** link.
- TAM, SAM, SOM, and each interview have their own complete slides.
- Open original diagrams and zoom to 400% for details.
- The original-deck icon opens all 23 source pages, with keyboard navigation and a PDF download. **Sources** opens the original chart citations.
- The pause icon stops motion and makes slide changes immediate for the current visit. Refresh starts motion again unless the system requests reduced motion. A prior saved pause no longer silently disables animation. Reduced motion shows all final chart values and encounter states immediately.
- Each slide has a shareable URL fragment, such as `#slide-14`. Inactive slides are hidden from focus and assistive technology. Portrait screens use a taller, fitted slide layout.

## Content fidelity

`public/Blue-Catch-Pitch-Deck.pdf` is an unchanged copy of the provided PDF. `public/originals/` contains faithful page renders for the source viewer. `public/assets/` contains images extracted from the PDF; `original-waves.svg` preserves the cover's original vector wave artwork. `public/deck-content.json` preserves the extracted source text by page. `src/scene-art.js` contains the new decorative vector illustrations; they are separate from the original diagrams and data. No stock imagery is used. All fonts and assets are served locally.

The page keeps the deck's stated market values and arithmetic exactly as supplied; it does not validate or correct the business assumptions. The original image-based SWOT, mind maps, strategy chart, market infographic, value proposition, and financial graphic are available at full size.

## Browser checks

Run `npm test` for the Playwright regression suite. It checks refresh playback, the two-step turtle encounter, object transitions without moving typography, pausing during a cut, slide focus, exact chart values, original-image access, decorative-art spacing, portrait fitting, and reduced motion. The configuration uses an installed Chromium when available; otherwise install a browser with `npx playwright install chromium`. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select another Chromium binary.
