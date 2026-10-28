import { test, expect } from '@playwright/test';

async function idle(page) {
  await expect(page.locator('body')).not.toHaveClass(/is-transitioning/);
}
async function slide(page, number) {
  await expect(page.locator('#slide-position')).toHaveText(`${String(number).padStart(2, '0')} / 27`);
  await idle(page);
}

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
  await expect(page.locator('.transition-ocean')).toHaveAttribute('data-effect', 'title-zoom');
  await slide(page, 2);
  await page.reload();
  await slide(page, 2);
  await expect.poll(() => page.locator('.slide.is-active').evaluate(s => s.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBeGreaterThan(0);
});

test('normal navigation brings in the turtle and retracts the detailed hooks', async ({ page }) => {
  await page.goto('/#slide-7');
  await expect(page.locator('#in-action .precision-lure svg')).toBeVisible();
  await expect(page.locator('#in-action .deep-scene')).toHaveAttribute('data-encounter', 'fishing');
  await expect(page.locator('#in-action button')).toHaveCount(0);
  await expect(page.locator('#in-action .precision-turtle')).toHaveCSS('opacity', '0');
  await page.keyboard.press(' ');
  await slide(page, 8);
  await expect(page.locator('#protected-encounter .deep-scene')).toHaveAttribute('data-encounter', 'protected');
  await expect(page.locator('#protected-encounter .precision-turtle')).toHaveCSS('opacity', '1');
  await expect(page.locator('#protected-encounter .detail-hook').first()).toHaveCSS('opacity', '0');
  await page.reload();
  await slide(page, 8);
  await expect(page.locator('#protected-encounter .precision-turtle')).toHaveCSS('opacity', '1');
  await page.keyboard.press('ArrowLeft');
  await slide(page, 7);
  await expect(page.locator('#in-action .deep-scene')).toHaveAttribute('data-encounter', 'fishing');
});

test('all slides have distinct element transitions, live movement, and working navigation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const transitions = await page.locator('.slide').evaluateAll(slides => slides.map(s => s.dataset.transition));
  expect(new Set(transitions).size).toBe(27);
  for (let i = 1; i < 27; i++) {
    await page.keyboard.press('ArrowRight');
    await slide(page, i + 1);
    await expect(page.locator('.transition-ocean')).toHaveAttribute('data-effect', transitions[i - 1]);
    await expect(page.locator('.slide:not([inert])')).toHaveCount(1);
    await expect.poll(() => page.locator('.slide.is-active').evaluate(s => s.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBeGreaterThan(0);
  }
  await expect(page.getByRole('button', { name: 'Restart presentation' })).toBeVisible();
  await page.getByRole('button', { name: 'Restart presentation' }).click();
  await slide(page, 1);
  expect(errors).toEqual([]);
});

test('redrawn charts animate to the exact source figures and retain original graphics', async ({ page }) => {
  await page.goto('/#slide-11');
  for (const value of ['$230,000,000', '$117,967,200', '$1,179,672']) {
    await expect(page.locator('#market-chart .market-ledger strong', { hasText: value })).toBeVisible();
  }
  await page.locator('#market-overview .original-chart-button').click();
  await expect(page.locator('.image-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('End');
  await slide(page, 27);
  await expect(page.locator('#funds-chart .donut-center strong')).toHaveText('$737,649');
  await expect(page.locator('.fund-arc')).toHaveCount(4);
  for (const value of ['$357,268', '$153,115', '$126,000', '$101,266']) {
    await expect(page.locator('#funds-chart .funds-ledger strong', { hasText: value })).toBeVisible();
  }
  await expect.poll(() => page.locator('.fund-arc').evaluateAll(arcs => arcs.every(arc => parseFloat(getComputedStyle(arc).strokeDashoffset) === 0))).toBe(true);
});

test('portrait slides fit without scrolling and reduced motion shows final content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/motion-paused/);
  const issues = [];
  for (let i = 1; i <= 27; i++) {
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
  await expect(page.locator('#funds-chart .donut-center strong')).toHaveText('$737,649');
});
