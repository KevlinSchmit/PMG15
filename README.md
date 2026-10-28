# Blue Catch — interactive presentation

A responsive, animated, 26-slide presentation built directly from **Group 16 Blue Catch Pitch Deck.pdf**. The source images, wording, figures, and calculation inconsistencies are preserved. The original interviews have separate slides for readability, and an additional concept animation demonstrates the hooks. Interface labels and decorative animations support the presentation; the hook demonstration is illustrative, not a working AI system.

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
- Wave, fishing-rod, and swimming-fish transitions use the deck's ocean theme and original illustrations. Each slide's text and artwork animate into place.
- Use the fullscreen icon at bottom right, or press **F**. Escape exits fullscreen.
- Choose **Protected species** to see hooks retract and the float light up; **Fishing** resets it.
- The product demonstration plays its fishing-to-protected-species sequence automatically once on entry; **Play sequence** replays it.
- TAM, SAM, SOM, and each interview have their own complete slides.
- Open original diagrams and zoom to 400% for details.
- The original-deck icon opens all 23 source pages, with keyboard navigation and a PDF download. **Sources** opens the original chart citations.
- The pause icon pauses animations and makes slide changes immediate. System reduced-motion preferences are respected, including disabling automatic demonstration playback.
- Each slide has a shareable URL fragment, such as `#slide-14`. Inactive slides are hidden from focus and assistive technology. Portrait screens use a taller, fitted slide layout.

## Content fidelity

`public/Blue-Catch-Pitch-Deck.pdf` is an unchanged copy of the provided PDF. `public/originals/` contains faithful page renders for the source viewer. `public/assets/` contains images extracted from the PDF; `original-waves.svg` preserves the cover's original vector wave artwork. `public/deck-content.json` preserves the extracted source text by page. No external image generation or stock imagery is used. All fonts and assets are served locally.

The page keeps the deck's stated market values and arithmetic exactly as supplied; it does not validate or correct the business assumptions. The original image-based SWOT, mind maps, strategy chart, market infographic, value proposition, and financial graphic are available at full size.
