import { test, expect } from '@playwright/test';

async function idle(page) {
  await expect(page.locator('body')).not.toHaveClass(/is-transitioning/);
}
async function slide(page, number) {
  await expect(page.locator('#slide-position')).toHaveText(`${String(number).padStart(2, '0')} / 15`);
  await idle(page);
}

test('refreshing the final scene restarts at page one with working navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#slide-15');
  await slide(page, 15);
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
  await expect(page.locator('.transition-ocean')).toHaveAttribute('data-effect', 'cover-tide-reveal');
  await slide(page, 2);
  await page.reload();
  await slide(page, 1);
  await expect(page).toHaveURL(/#slide-1$/);
  await expect.poll(() => page.locator('.slide.is-active').evaluate(s => s.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBeGreaterThan(0);
});

test('transitions vary, animate live content, and leave no cloned art or lingering effects', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && message.text().includes('Slide transition failed')) errors.push(message.text()); });
  await page.goto('/');
  const profiles = await page.locator('#presentation .slide').evaluateAll(slides => slides.map(slide => ({ effect: slide.dataset.transition, kind: slide.dataset.cut, duration: +slide.dataset.duration })));
  expect(new Set(profiles.map(profile => profile.kind)).size).toBeGreaterThanOrEqual(9);
  expect(profiles.every(profile => profile.duration <= 650)).toBe(true);
  await expect(page.locator('.scene-object')).toHaveCount(15);
  let movingTextCuts = 0;
  for (let i = 1; i < 15; i++) {
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('body')).toHaveClass(/is-transitioning/);
    const movesText = await page.locator('.slide.is-arriving').evaluate(slide => slide.getAnimations({ subtree: true }).some(animation => {
      const target = animation.effect.target;
      return target !== slide && target.textContent.trim() && animation.effect.getKeyframes().some(frame => frame.transform?.includes('translate'));
    }));
    if (movesText) movingTextCuts++;
    expect(await page.locator('.slide.is-arriving,.slide.is-departing').evaluateAll(slides => slides.flatMap(slide => slide.getAnimations({ subtree: true })).filter(animation => animation.effect.getTiming().iterations !== Infinity).every(animation => animation.effect.getComputedTiming().endTime <= 650))).toBe(true);
    await expect(page.locator('.transition-object,.transition-swimmer,.transition-source')).toHaveCount(0);
    await expect(page.locator('.transition-ocean image,.transition-ocean img')).toHaveCount(0);
    await slide(page, i + 1);
    await expect(page.locator('.transition-ocean')).toHaveAttribute('data-effect', profiles[i - 1].effect);
    await expect(page.locator('.slide.is-arriving,.slide.is-departing')).toHaveCount(0);
    await expect(page.locator('.slide:not([inert])')).toHaveCount(1);
    expect(await page.locator('.slide.is-active').evaluate(scene => scene.style.clipPath === '' && scene.style.opacity === '' && scene.style.transform === '')).toBe(true);
    expect(await page.locator('.slide.is-active h1,.slide.is-active h2,.slide.is-active h3').evaluateAll(headings => headings.every(heading => getComputedStyle(heading).transform === 'none'))).toBe(true);
  }
  expect(movingTextCuts).toBeGreaterThanOrEqual(8);
  await page.getByRole('button', { name: 'Restart presentation' }).click();
  await slide(page, 1);
  expect(errors).toEqual([]);
});

test('pausing a transition finishes navigation and clears the live page effects', async ({ page }) => {
  await page.goto('/#slide-8');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('body')).toHaveClass(/is-transitioning/);
  await page.getByRole('button', { name: 'Pause animations' }).click();
  await slide(page, 9);
  await expect(page.locator('.transition-ocean')).not.toHaveClass(/play/);
  await expect(page.locator('.slide.is-arriving,.slide.is-departing')).toHaveCount(0);
  expect(await page.locator('.slide.is-active').evaluate(scene => scene.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'))).toBe(false);
  await page.keyboard.press('ArrowLeft');
  await slide(page, 8);
  await page.getByRole('button', { name: 'Resume animations' }).click();
  await page.keyboard.press('ArrowRight');
  await slide(page, 9);
});

test('redrawn charts animate to the exact source figures and retain original graphics', async ({ page }) => {
  await page.goto('/#slide-8');
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
  await page.goto('/#slide-8');
  await slide(page, 8);
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'market-overview');
  await page.keyboard.press('ArrowRight');
  await slide(page, 9);
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
    for (let i = 1; i <= 15; i++) {
      if (i > 1) await page.keyboard.press('ArrowRight');
      await slide(page, i);
      const hits = await page.locator('.slide.is-active').evaluate(scene => {
        const art = scene.querySelector('.scene-object');
        if (getComputedStyle(art).visibility === 'hidden') return [];
        const marks = [...art.querySelectorAll('path,circle,ellipse,rect,.art-engraving,.pen-fish image')].map(element => {
          if (!element.matches('.art-engraving')) return element.getBoundingClientRect();
          // A nested SVG's content bounds include the entire image sheet;
          // collision checks need its clipped viewport in screen coordinates.
          const { x, y, width, height } = Object.fromEntries(['x','y','width','height'].map(key => [key, element[key].baseVal.value]));
          const matrix = element.parentElement.getScreenCTM();
          const points = [[x,y],[x+width,y],[x,y+height],[x+width,y+height]].map(([px,py]) => new DOMPoint(px,py).matrixTransform(matrix));
          const left = Math.min(...points.map(point => point.x)), right = Math.max(...points.map(point => point.x));
          const top = Math.min(...points.map(point => point.y)), bottom = Math.max(...points.map(point => point.y));
          return new DOMRect(left,top,right-left,bottom-top);
        });
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
  for (let i = 1; i <= 15; i++) {
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


test('the visual value proposition now follows the solution', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#slide-6');
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'solution');
  await page.keyboard.press('ArrowRight');
  await slide(page, 7);
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'visual-value');
  await page.keyboard.press('ArrowRight');
  await slide(page, 8);
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'market-overview');
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`current deck overview supports direct jumps and keyboard navigation at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/#slide-2');
    const toggle = page.getByRole('button', { name: 'Open slide overview' });
    await toggle.click();
    const overview = page.getByRole('dialog', { name: 'Slide overview' });
    await expect(overview).toBeVisible();
    const cards = overview.locator('.overview-slide');
    await expect(cards).toHaveCount(15);
    await expect(cards.nth(1)).toHaveAttribute('aria-current', 'page');
    await expect(cards.nth(1)).toBeFocused();
    const order = await page.locator('#presentation .slide').evaluateAll(slides => slides.map(slide => slide.dataset.title));
    expect(await cards.locator('.overview-title').allTextContents()).toEqual(order);
    await expect(cards.nth(6)).toHaveAccessibleName('Go to slide 7: Visual Value Proposition');
    await expect(cards.nth(6).locator('img')).toHaveAttribute('src', '/assets/slide-previews/visual-value.png');
    await cards.nth(6).click();
    await expect(overview).not.toBeVisible();
    await slide(page, 7);
    await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'visual-value');
    await expect(page).toHaveURL(/#slide-7$/);
    await toggle.click();
    await expect(cards.nth(6)).toHaveAttribute('aria-current', 'page');
    await page.keyboard.press('End');
    await expect(cards.last()).toBeFocused();
    await expect.poll(() => cards.last().locator('img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    await page.keyboard.press('Enter');
    await slide(page, 15);
    await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'thank-you');
    await toggle.click();
    await expect(cards.last()).toHaveAttribute('aria-current', 'page');
    await page.keyboard.press('Home');
    await page.keyboard.press(' ');
    await slide(page, 1);
    await toggle.click();
    await page.keyboard.press('ArrowRight');
    await expect(cards.nth(1)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(overview).not.toBeVisible();
    await expect(toggle).toBeFocused();
    await slide(page, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}


test('every slide and the embedded product share the same light green background', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const colors = await page.locator('#presentation .slide').evaluateAll(slides => [...new Set(slides.map(slide => getComputedStyle(slide).backgroundColor))]);
  expect(colors).toEqual(['rgb(237, 245, 232)']);
  await expect(page.locator('body')).toHaveCSS('background-color', colors[0]);
  await expect(page.frameLocator('.product-model-embed').locator('body')).toHaveCSS('background-color', colors[0]);
  await expect(page.locator('.hero-waves')).toHaveAttribute('src', '/assets/cover-wave.png');
  await expect.poll(() => page.locator('.hero-waves').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
});

test('cover illustrations move slowly and stop for pause and reduced motion', async ({ page }) => {
  await page.goto('/');
  const movingParts = page.locator('#surface .hero-rod,#surface .hero-waves,#surface .hero-sun,#surface .hero-sun svg,#surface .sea-orbit,#surface .floating-label,#surface .scene-object>svg');
  await expect.poll(() => movingParts.evaluateAll(elements => elements.every(element => element.getAnimations().some(animation => {
    const timing = animation.effect.getTiming();
    return animation.playState === 'running' && timing.duration >= 14000 && timing.iterations === Infinity;
  })))).toBe(true);
  await expect(page.locator('#surface .pen-fish image')).toHaveCount(3);
  await expect(page.locator('#surface h1')).toHaveCSS('transform', 'none');
  await page.getByRole('button', { name: 'Pause animations' }).click();
  expect(await page.locator('#surface').evaluate(slide => slide.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'))).toBe(false);
  await page.getByRole('button', { name: 'Resume animations' }).click();
  await expect.poll(() => movingParts.first().evaluate(element => element.getAnimations().some(animation => animation.playState === 'running'))).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('body')).toHaveClass(/motion-paused/);
  expect(await page.locator('#surface').evaluate(slide => slide.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'))).toBe(false);
});


test('the Pro Forma link opens the supplied spreadsheet from fullscreen, followed by Thank You', async ({ page }) => {
  const spreadsheet = 'https://docs.google.com/spreadsheets/d/1PcS-zDE94jpFI5VOcXDihgA-AtQnOXyXWg-bBoQf8Xo/edit?gid=0#gid=0';
  // Verify the browser navigation without depending on Google account access.
  await page.context().route('https://docs.google.com/spreadsheets/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Pro Forma spreadsheet</title>' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#slide-13');
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'next-step');
  await page.getByRole('button', { name: 'Next slide' }).click();
  await slide(page, 14);
  await expect(page.locator('#pro-forma h2')).toHaveText('Pro Forma & Financial Breakdown');
  const link = page.getByRole('link', { name: 'View Full Pro Forma Spreadsheet →', exact: true });
  await expect(link).toHaveAttribute('href', spreadsheet);
  await expect(link).toHaveAttribute('target', '_blank');
  await page.getByRole('button', { name: 'Enter fullscreen presentation' }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  const popupOpened = page.waitForEvent('popup');
  await link.click();
  const popup = await popupOpened;
  await expect(popup).toHaveURL(spreadsheet);
  await slide(page, 14);
  await popup.close();
  await page.bringToFront();
  await page.getByRole('button', { name: 'Next slide', exact: true }).click();
  await slide(page, 15);
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'thank-you');
  await expect(page.locator('#thank-you h2')).toHaveText('Thank you.');
  await expect(page.getByRole('button', { name: 'Restart presentation' })).toBeVisible();
});


test('reverse navigation and overview interruption restore clean page styles', async ({ page }) => {
  await page.goto('/#slide-15');
  for (let number = 14; number >= 1; number--) {
    await page.keyboard.press('ArrowLeft');
    await slide(page, number);
    await expect(page.locator('.slide.is-arriving,.slide.is-departing')).toHaveCount(0);
    expect(await page.locator('.slide.is-active').evaluate(slide => slide.style.clipPath === '' && slide.style.opacity === '' && slide.style.background === '')).toBe(true);
  }
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('body')).toHaveClass(/is-transitioning/);
  await page.getByRole('button', { name: 'Open slide overview' }).click();
  await page.getByRole('button', { name: 'Go to slide 14: Pro Forma & Financial Breakdown' }).click();
  await slide(page, 14);
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'pro-forma');
  await expect(page.locator('.slide.is-arriving,.slide.is-departing')).toHaveCount(0);
});
