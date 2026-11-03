# Blue Catch — interactive motion story

A responsive, animated, 13-slide presentation built from **Group 16 Blue Catch Pitch Deck.pdf**. Andrew’s brief consumer profile follows the cover, introducing a weekend sea angler who encounters unwanted bycatch. The solution slide combines an interactive 360° product view with species recognition, automatic hook retraction, a rod-mounted display, and a signaling float. TAM, SAM, and SOM are consolidated into one market slide with headline values and calculation takeaways. A final Next Step slide introduces the smart fishing net expansion. The market and funding charts are redrawn in the presentation's palette. Original images remain available in the source viewer. The product demonstration is illustrative, not a working AI system.

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

To create a single downloadable presentation that opens directly in a browser, run `npm run build` followed by `python tools/export-standalone.py`. The resulting `/workspace/Blue-Catch.html` includes the presentation, local fonts, graphics, and current slide overview. The original cited websites and Google Sheets link still require internet access.

## Present

- Click the slide background, press **Right Arrow**, or press **Space** for the next slide. **Left Arrow** or **Shift + Space** goes back. Buttons, links, and zoomable diagrams keep their own interactions.
- Use **Home** / **End** for the first / final slide. The final slide's next button restarts the presentation.
- Swipe left / right on touch screens. The page does not scroll, and there is no top navigation.
- Scenes use topic-related illustrated objects to carry their transitions: schools of fish, branching coral, a releasing net, chip signals, casting lines, sonar, a swimming turtle, compass routes, market fleets, listening waves, a marine shield, and funding coins. Headings and body text stay at a fixed size and position, with a short dissolve. There are no cloned text zooms, spinning screenshots, or word-by-word entrances.
- The same transparent illustrations appear in available scene margins and travel into the transition. Chapter openings give them more space. Dense portrait layouts omit decoration where it would overlap reading.
- Every slide shares the very light green `#edf5e8`. Cover art and decorative objects drift slowly while headings, body text, and data stay anchored. Pause and system reduced-motion settings stop the ambient movement.
- Use the fullscreen icon at bottom right, or press **F**. Escape exits fullscreen.
- Andrew’s consumer profile is slide 2. It keeps the deck’s pale green background and summarizes his interests, bycatch problem, and need for earlier species recognition.
- The Our Solution slide includes the interactive product view. Use **Close up** to magnify details, **Full view** to return, or pause and reset the model.
- The TAM/SAM/SOM chart builds its nested circles and reveals the original market figures. The funds chart draws its four donut segments and reveals the original amounts. Both retain an **Original graphic** link.
- TAM, SAM, and SOM are summarized together on one market slide.
- Open original diagrams and zoom to 400% for details.
- The middle icon at bottom right opens an overview of all 13 current slides. Select any preview to jump directly there. The current slide is highlighted; arrow keys move between previews, Home / End select the first / last preview, and Enter or Space opens it. Escape closes the overview and restores focus. **Sources** opens the original chart citations.
- Visual Value Proposition follows Our Solution as slide 7.
- The pause icon stops motion and makes slide changes immediate for the current visit. Refresh starts motion again unless the system requests reduced motion. A prior saved pause no longer silently disables animation. Reduced motion shows all final chart values and encounter states immediately.
- Refresh always returns to page 1 and updates the URL to `#slide-1`. Opening a direct URL such as `#slide-5` still works. Inactive slides are hidden from focus and assistive technology. Portrait screens use a taller, fitted slide layout.

## Content fidelity

`public/Blue-Catch-Pitch-Deck.pdf` is an unchanged copy of the provided PDF. `public/originals/` contains faithful page renders for reference. `public/assets/` contains presentation images; `original-waves.svg` preserves the original vector wave artwork. The cover uses the completed transparent ink illustration `cover-wave.png`; `pen-fish.png` supplies the matching engraved fish throughout the decorative scenes. Both are generated illustrations based on the original pen style. `public/deck-content.json` preserves the extracted source text by page. `src/scene-art.js` contains the new decorative vector illustrations; they are separate from the original diagrams and data. All fonts and assets are served locally.

Andrew is an illustrative consumer persona. His representative fishing photograph, `public/assets/consumer-angler.jpg`, is an unmodified public-domain U.S. Army photograph by Staff Sgt. Emily Russell: [Reel Adventure; Troopers Fish With Pro Salt Water Angler](https://commons.wikimedia.org/wiki/File:Reel_Adventure;_Troopers_Fish_With_Pro_Salt_Water_Angler_DVIDS122093.jpg). The photographed people are not being identified as Andrew or presented as interviewed customers.

The page keeps the deck's stated market values and arithmetic exactly as supplied; it does not validate or correct the business assumptions. The original image-based SWOT, mind maps, strategy chart, market infographic, value proposition, and financial graphic are available at full size.

## Browser checks

Run `npm test` for the Playwright regression suite. It checks the shared green palette, slow illustration motion and pause/reduced-motion controls, Andrew’s profile and photo, slide order, overview previews and keyboard/direct navigation on desktop and portrait, refresh playback, object transitions without moving typography, pausing during a cut, slide focus, exact chart values, original-image access, decorative-art spacing, portrait fitting, and reduced motion. The configuration uses an installed Chromium when available; otherwise install a browser with `npx playwright install chromium`. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select another Chromium binary.

Overview previews are keyed by slide ID, so numbering and order follow the current deck automatically. After changing slide content, run the dev server and `node tools/capture-slide-previews.mjs` to refresh the local previews before building.
