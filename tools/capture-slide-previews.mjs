// Capture the current presentation, keyed by slide ID so reordering stays in sync.
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../public/assets/slide-previews/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
  // Previews are still images and do not need a WebGL context.
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-webgl']
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 874 },
    deviceScaleFactor: 1 / 3,
    reducedMotion: 'reduce'
  });
  await page.goto(process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:5173');
  await page.evaluate(() => document.fonts.ready);
  // Use the existing product render for the embedded 3D viewer in still previews.
  // This changes only the capture page, never the presentation source.
  await page.locator('.product-model-embed').evaluateAll(frames => {
    frames.forEach(frame => {
      const poster = document.createElement('img');
      poster.src = '/assets/product-360-stage.png';
      poster.className = frame.className;
      poster.alt = frame.title;
      poster.style.objectFit = 'contain';
      frame.replaceWith(poster);
    });
  });
  const ids = await page.locator('#presentation .slide').evaluateAll(slides => slides.map(slide => slide.id));
  for (const [index, id] of ids.entries()) {
    await page.evaluate(number => { location.hash = `slide-${number}`; }, index + 1);
    const slide = page.locator(`#presentation #${id}.is-active`);
    await slide.waitFor({ state: 'visible' });
    await slide.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
    await slide.screenshot({ path: `${output}/${id}.png`, type: 'png', scale: 'device', animations: 'disabled' });
    console.log(`Captured ${index + 1}/${ids.length}: ${id}`);
  }
} finally {
  await browser.close();
}
