# Blue Catch — interactive presentation

A responsive, animated presentation website built directly from **Group 16 Blue Catch Pitch Deck.pdf**. The source images, wording, figures, and calculation inconsistencies are preserved. Interface labels and decorative concept animations support the presentation; the hook demonstration is an illustrative animation, not a working AI system.

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

- Scroll through six continuous chapters; use the side markers or the top navigation to jump.
- Use Left / Right arrows to move between chapters when no control has focus.
- Use **Present** in the bottom-right corner for fullscreen. Escape exits.
- Choose **Protected species** to see hooks retract and the float light up; **Fishing** resets it.
- Select TAM, SAM, or SOM to reveal the original assumptions and calculations.
- Select an interview to read its complete feedback.
- Open original diagrams and zoom to 400% for details.
- **Original deck** opens all 23 original pages, with keyboard navigation and a PDF download.
- **Motion on/off** pauses animations. System reduced-motion preferences are respected.

## Content fidelity

`public/Blue-Catch-Pitch-Deck.pdf` is an unchanged copy of the provided PDF. `public/originals/` contains faithful page renders for the source viewer. `public/assets/` contains images extracted from the PDF; `original-waves.svg` preserves the cover's original vector wave artwork. `public/deck-content.json` preserves the extracted source text by page. No external image generation or stock imagery is used. All fonts and assets are served locally.

The page keeps the deck's stated market values and arithmetic exactly as supplied; it does not validate or correct the business assumptions. The original image-based SWOT, mind maps, strategy chart, market infographic, value proposition, and financial graphic are available at full size.
