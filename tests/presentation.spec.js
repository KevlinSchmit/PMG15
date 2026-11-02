import { test, expect } from '@playwright/test';

async function idle(page) {
  await expect(page.locator('body')).not.toHaveClass(/is-transitioning/);
}
async function slide(page, number) {
  await expect(page.locator('#slide-position')).toHaveText(`${String(number).padStart(2, '0')} / 13`);
  await idle(page);
}

test('refreshing the final scene restarts at page one with working navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#slide-13');
  await slide(page, 13);
  await page.reload();
  await slide(page, 1);
  await expect(page).toHaveURL(/#slide-1$/);
  await expect(page.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
  await page.keyboard.press('ArrowRight');
  await slide(page, 2);
});
test('a legacy pause and an explicit pause do not silently suppress motion after refresh', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('blue-catch-motion', 'off'));
  await page.reload();
  await expect(page.locator('body')).not.toHaveClass(/motion-paused/);
  await expect.poll(() => page.locator('.slide.is-active').evaluate(s => s.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause animations' }).click();
  await expect(page.locator('body')).toHaveClass(/motion-paused/);
  await page.reload();
  await expect(page.locator('body')).not.toHaveClass(/motion-paused/);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.transition-ocean')).toHaveAttribute('data-effect', 'surface-school-departure');
  await slide(page, 2);
  await page.reload();
  await slide(page, 1);
  await expect(page).toHaveURL(/#slide-1$/);
  await expect.poll(() => page.locator('.slide.is-active').evaluate(s => s.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBeGreaterThan(0);
});

test('all scenes have object transitions, steady typography, and working navigation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const transitions = await page.locator('.slide').evaluateAll(slides => slides.map(s => s.dataset.transition));
  expect(new Set(transitions).size).toBe(13);
  await expect(page.locator('#market,#competition,#definition,#uvp,#financials')).toHaveCount(0);
  await expect(page.locator('.kinetic-word')).toHaveCount(0);
  await expect(page.locator('.scene-object')).toHaveCount(13);
  expect(await page.locator('.slide').evaluateAll(slides => new Set(slides.map(s => s.dataset.cut)).size)).toBeGreaterThanOrEqual(9);
  for (let i = 1; i < 13; i++) {
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.transition-ocean')).toHaveClass(/play/);
    await expect(page.locator('.transition-ocean h1,.transition-ocean h2,.transition-ocean li,.transition-source')).toHaveCount(0);
    await expect(page.locator('.transition-object svg')).toHaveCount(1);
    await slide(page, i + 1);
    await expect(page.locator('.transition-ocean')).toHaveAttribute('data-effect', transitions[i - 1]);
    await expect(page.locator('.slide:not([inert])')).toHaveCount(1);
    expect(await page.locator('.slide.is-active h1,.slide.is-active h2,.slide.is-active h3').evaluateAll(headings => headings.every(h => getComputedStyle(h).transform === 'none'))).toBe(true);
  }
  await expect(page.getByRole('button', { name: 'Restart presentation' })).toBeVisible();
  await page.getByRole('button', { name: 'Restart presentation' }).click();
  await slide(page, 1);
  expect(errors).toEqual([]);
});

test('pausing an object transition finishes navigation and removes its overlay', async ({ page }) => {
  await page.goto('/#slide-7');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.transition-object')).toHaveCount(1);
  await page.getByRole('button', { name: 'Pause animations' }).click();
  await slide(page, 8);
  await expect(page.locator('.transition-ocean')).not.toHaveClass(/play/);
  await expect(page.locator('.transition-object')).toHaveCount(0);
  expect(await page.locator('.slide.is-active').evaluate(scene => scene.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'))).toBe(false);
  await page.keyboard.press('ArrowLeft');
  await slide(page, 7);
  await page.getByRole('button', { name: 'Resume animations' }).click();
  await page.keyboard.press('ArrowRight');
  await slide(page, 8);
});

test('redrawn charts animate to the exact source figures and retain original graphics', async ({ page }) => {
  await page.goto('/#slide-7');
  for (const value of ['$941,300,000', '$740,520,000', '$3,495,000']) {
    await expect(page.locator('#market-chart .market-ledger strong', { hasText: value })).toBeVisible();
  }
  await page.locator('#market-overview .original-chart-button').click();
  await expect(page.locator('.image-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto('/#slide-12');
  await slide(page, 12);
  await expect(page.locator('#funds-chart .donut-center strong')).toHaveText('$1,140,403.97');
  await expect(page.locator('.fund-arc')).toHaveCount(4);
  for (const value of ['$711,250', '$192,858.09', '$126,000', '$110,295.88']) {
    await expect(page.locator('#funds-chart .funds-ledger strong', { hasText: value })).toBeVisible();
  }
  await expect.poll(() => page.locator('.fund-arc').evaluateAll(arcs => arcs.every(arc => parseFloat(getComputedStyle(arc).strokeDashoffset) === 0))).toBe(true);
});

test('requested slide order, product copy, and source dialogs are preserved', async ({ page }) => {
  await page.goto('/#slide-4');
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'value');
  await expect(page.locator('#product-360')).toHaveCount(0);
  await expect(page.locator('#solution .product-model-embed')).toHaveCount(1);
  await page.goto('/#slide-7');
  await slide(page, 7);
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'market-overview');
  await page.keyboard.press('ArrowRight');
  await slide(page, 8);
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'swot');
  await expect(page.locator('#swot .source-trigger')).toBeVisible();
  await page.locator('#swot .source-trigger').click();
  await expect(page.locator('#sources-swot')).toBeVisible();
  await expect(page.locator('#sources-swot li')).toHaveCount(13);
  await expect(page.locator('#next-step .next-step-visual img')).toHaveAttribute('src', '/assets/smart-fishing-net.jpg');
  await expect(page.locator('#next-step .next-step-visual')).not.toContainText('EXPAND');
});

test('decoration leaves reading and source controls clear on desktop and portrait', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const overlaps = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/?spacing=' + width);
    for (let i = 1; i <= 13; i++) {
      if (i > 1) await page.keyboard.press('ArrowRight');
      await slide(page, i);
      const hits = await page.locator('.slide.is-active').evaluate(scene => {
        const art = scene.querySelector('.scene-object');
        if (getComputedStyle(art).visibility === 'hidden') return [];
        const marks = [...art.querySelectorAll('path,circle,ellipse,rect')].map(e => e.getBoundingClientRect());
        const walker = document.createTreeWalker(scene, NodeFilter.SHOW_TEXT);
        const hits = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!node.textContent.trim() || !node.parentElement.closest('h1,h2,h3,h4,p,li,button,a,td,th,.calculation,.slide-kicker')) continue;
          const range = new Range(); range.selectNodeContents(node);
          if ([...range.getClientRects()].some(r => marks.some(q => q.width > 0 && q.height > 0 && q.left < r.right && q.right > r.left && q.top < r.bottom && q.bottom > r.top))) hits.push(node.textContent.slice(0, 50));
        }
        return hits;
      });
      if (hits.length) overlaps.push({ width, slide: i, hits });
    }
  }
  expect(overlaps).toEqual([]);
});

test('portrait slides fit without scrolling and reduced motion shows final content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/motion-paused/);
  const issues = [];
  for (let i = 1; i <= 13; i++) {
    if (i > 1) await page.keyboard.press('ArrowRight');
    await slide(page, i);
    const overflow = await page.locator('.slide.is-active').evaluate(s => {
      const r = s.getBoundingClientRect();
      return [...s.querySelectorAll('h2,h3,h4,p,li,.calculation,.regenerated-chart,.sketch-button')].filter(e => {
        const q=e.getBoundingClientRect();
        return q.bottom>r.bottom+3 || q.right>r.right+3 || q.left<r.left-3;
      }).map(e=>e.textContent.slice(0,45));
    });
    if (overflow.length) issues.push({ slide:i, overflow });
    expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
  expect(issues).toEqual([]);
  await expect(page.locator('#funds-chart .donut-center strong')).toHaveText('$1,140,403.97');
});

test('Andrew’s brief consumer profile follows the cover with a local fishing photo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await slide(page, 2);
  const profile = page.locator('.slide.is-active');
  await expect(profile).toHaveAttribute('id', 'consumer-profile');
  await expect(profile.getByRole('heading')).toHaveText('Meet Andrew.');
  await expect(profile.locator('.consumer-details')).toContainText('fishing at sea');
  await expect(profile.locator('.consumer-details')).toContainText('protected species');
  expect((await profile.locator('.consumer-details').innerText()).split(/\s+/).length).toBeLessThan(55);
  const photo = profile.locator('img');
  await expect(photo).toHaveAttribute('src', '/assets/consumer-angler.jpg');
  await expect.poll(() => photo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.keyboard.press('ArrowRight');
  await slide(page, 3);
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'challenge');
});
