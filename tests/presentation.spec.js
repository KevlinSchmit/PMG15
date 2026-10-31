import { test, expect } from '@playwright/test';

async function idle(page) {
  await expect(page.locator('body')).not.toHaveClass(/is-transitioning/);
}
async function slide(page, number) {
  await expect(page.locator('#slide-position')).toHaveText(`${String(number).padStart(2, '0')} / 17`);
  await idle(page);
}

test('refreshing the final scene restarts at page one with working navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#slide-17');
  await slide(page, 17);
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
  await expect(page.locator('.transition-ocean')).toHaveAttribute('data-effect', 'breaking-cover-wave');
  await slide(page, 2);
  await page.reload();
  await slide(page, 1);
  await expect(page).toHaveURL(/#slide-1$/);
  await expect.poll(() => page.locator('.slide.is-active').evaluate(s => s.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBeGreaterThan(0);
});

test('normal navigation brings in the turtle and retracts the detailed hooks', async ({ page }) => {
  await page.goto('/#slide-7');
  await expect(page.locator('#in-action .precision-lure svg')).toBeVisible();
  await expect(page.locator('#in-action .deep-scene')).toHaveAttribute('data-encounter', 'fishing');
  await expect(page.locator('#in-action button')).toHaveCount(0);
  await expect(page.locator('#in-action .precision-turtle')).toHaveCSS('opacity', '0');
  const camera = await page.locator('#in-action .deep-scene').boundingBox();
  await page.keyboard.press(' ');
  await slide(page, 8);
  expect(await page.locator('#protected-encounter .deep-scene').boundingBox()).toEqual(camera);
  await expect(page.locator('#protected-encounter .deep-scene')).toHaveAttribute('data-encounter', 'protected');
  await expect(page.locator('#protected-encounter .precision-turtle')).toHaveCSS('opacity', '1');
  await expect(page.locator('#protected-encounter .detail-hook').first()).toHaveCSS('opacity', '0');
  await page.reload();
  await slide(page, 1);
  await page.goto('/?encounter-revisit#slide-8');
  await slide(page, 8);
  await expect(page.locator('#protected-encounter .precision-turtle')).toHaveCSS('opacity', '1');
  await page.keyboard.press('ArrowLeft');
  await slide(page, 7);
  await expect(page.locator('#in-action .deep-scene')).toHaveAttribute('data-encounter', 'fishing');
});

test('all scenes have object transitions, steady typography, and working navigation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const transitions = await page.locator('.slide').evaluateAll(slides => slides.map(s => s.dataset.transition));
  expect(new Set(transitions).size).toBe(17);
  await expect(page.locator('#market,#competition,#definition,#uvp,#financials')).toHaveCount(0);
  await expect(page.locator('.kinetic-word')).toHaveCount(0);
  await expect(page.locator('.scene-object')).toHaveCount(17);
  expect(await page.locator('.slide').evaluateAll(slides => new Set(slides.map(s => s.dataset.cut)).size)).toBeGreaterThan(12);
  for (let i = 1; i < 17; i++) {
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.transition-ocean')).toHaveClass(/play/);
    await expect(page.locator('.transition-ocean h1,.transition-ocean h2,.transition-ocean li,.transition-source')).toHaveCount(0);
    if (i === 7) await expect(page.locator('.transition-camera')).toHaveCount(1);
    else if (i === 1) await expect(page.locator('.breaking-wave')).toHaveCount(1);
    else if (i === 4) await expect(page.locator('#solution')).toHaveClass(/is-morph-source/);
    else await expect(page.locator('.transition-object svg')).toHaveCount(1);
    await slide(page, i + 1);
    await expect(page.locator('.transition-ocean')).toHaveAttribute('data-effect', transitions[i - 1]);
    await expect(page.locator('.slide:not([inert])')).toHaveCount(1);
    await expect.poll(() => page.locator('.slide.is-active').evaluate(s => s.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBeGreaterThan(0);
    expect(await page.locator('.slide.is-active h1,.slide.is-active h2,.slide.is-active h3').evaluateAll(headings => headings.every(h => getComputedStyle(h).transform === 'none'))).toBe(true);
  }
  await expect(page.getByRole('button', { name: 'Restart presentation' })).toBeVisible();
  await page.getByRole('button', { name: 'Restart presentation' }).click();
  await slide(page, 1);
  expect(errors).toEqual([]);
});

test('pausing an object transition finishes navigation and removes its overlay', async ({ page }) => {
  await page.goto('/#slide-9');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.transition-object')).toHaveCount(1);
  await page.getByRole('button', { name: 'Pause animations' }).click();
  await slide(page, 10);
  await expect(page.locator('.transition-ocean')).not.toHaveClass(/play/);
  await expect(page.locator('.transition-object')).toHaveCount(0);
  expect(await page.locator('.slide.is-active').evaluate(scene => scene.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'))).toBe(false);
  await page.keyboard.press('ArrowLeft');
  await slide(page, 9);
  await page.getByRole('button', { name: 'Resume animations' }).click();
  await page.keyboard.press('ArrowRight');
  await slide(page, 10);
});

test('redrawn charts animate to the exact source figures and retain original graphics', async ({ page }) => {
  await page.goto('/#slide-9');
  for (const value of ['$230,000,000', '$117,967,200', '$1,179,672']) {
    await expect(page.locator('#market-chart .market-ledger strong', { hasText: value })).toBeVisible();
  }
  await page.locator('#market-overview .original-chart-button').click();
  await expect(page.locator('.image-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('End');
  await slide(page, 17);
  await expect(page.locator('#funds-chart .donut-center strong')).toHaveText('$737,649');
  await expect(page.locator('.fund-arc')).toHaveCount(4);
  for (const value of ['$357,268', '$153,115', '$126,000', '$101,266']) {
    await expect(page.locator('#funds-chart .funds-ledger strong', { hasText: value })).toBeVisible();
  }
  await expect.poll(() => page.locator('.fund-arc').evaluateAll(arcs => arcs.every(arc => parseFloat(getComputedStyle(arc).strokeDashoffset) === 0))).toBe(true);
});

test('decoration leaves reading and source controls clear on desktop and portrait', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const overlaps = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/?spacing=' + width);
    for (let i = 1; i <= 17; i++) {
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
  for (let i = 1; i <= 17; i++) {
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

test('the new product and original visual proposition follow the concept slide', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#slide-4');
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'solution');
  await page.keyboard.press('ArrowRight');
  await slide(page, 5);
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'product-360');
  await expect(page.locator('#rod-viewport')).toHaveAttribute('data-ready', 'true');
  await page.keyboard.press('ArrowRight');
  await slide(page, 6);
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'visual-value');
  await page.keyboard.press('ArrowRight');
  await slide(page, 7);
  await expect(page.locator('.slide.is-active')).toHaveAttribute('id', 'in-action');
});

test('the cover wave leaves the original artwork stationary and can be interrupted cleanly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-waves')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.breaking-wave')).toBeVisible();
  const before=await page.locator('.hero-rod,.hero-waves').evaluateAll(elements=>elements.map(e=>({transform:getComputedStyle(e).transform,rect:e.getBoundingClientRect().toJSON()})));
  await page.waitForTimeout(250);
  const during=await page.locator('.hero-rod,.hero-waves').evaluateAll(elements=>elements.map(e=>({transform:getComputedStyle(e).transform,rect:e.getBoundingClientRect().toJSON()})));
  expect(during).toEqual(before);
  expect(await page.locator('.hero-rod').evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause animations', exact: true }).click();
  await slide(page, 2);
  await expect(page.locator('.breaking-wave')).toHaveCount(0);
  await page.keyboard.press('ArrowLeft');
  await slide(page, 1);
  expect(await page.locator('.hero-copy h1>.word').first().evaluate(e => e.getAnimations().length)).toBe(0);
  await expect(page.locator('.hero-copy h1')).toBeVisible();
});

test('the solid product rotates, pauses, drags to a different view and resets without advancing', async ({ page }) => {
  await page.goto('/#slide-5');
  const viewport = page.locator('#rod-viewport');
  await expect(viewport).toHaveAttribute('data-ready', 'true');
  const firstAngle = Number(await viewport.getAttribute('data-angle'));
  await expect.poll(async () => Number(await viewport.getAttribute('data-angle'))).toBeGreaterThan(firstAngle + .15);
  await page.getByRole('button', { name: 'Pause product rotation' }).click();
  const pausedAngle = await viewport.getAttribute('data-angle');
  await page.waitForTimeout(250);
  await expect(viewport).toHaveAttribute('data-angle', pausedAngle);
  const front = await viewport.screenshot();
  const bounds = await viewport.boundingBox();
  const x=bounds.x+bounds.width*.4, y=bounds.y+bounds.height*.4;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+200,y+20,{steps:10});await page.mouse.up();
  await expect.poll(async () => Number(await viewport.getAttribute('data-angle'))).toBeGreaterThan(Number(pausedAngle)+2);
  const back = await viewport.screenshot();
  expect(front.equals(back)).toBe(false);
  await slide(page,5);
  await page.getByRole('button', { name: 'Toggle product detail view' }).click();
  await expect(page.getByRole('button', { name: 'Toggle product detail view' })).toHaveAttribute('aria-pressed','true');
  const detail = await viewport.screenshot();
  expect(detail.equals(back)).toBe(false);
  await page.getByRole('button', { name: 'Reset product view' }).click();
  await expect(viewport).toHaveAttribute('data-angle','0.0000');
  await expect(page.getByRole('button', { name: 'Toggle product detail view' })).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button', { name: 'Resume product rotation' }).click();
  await page.getByRole('button', { name: 'Pause animations', exact: true }).click();
  const globalPause = await viewport.getAttribute('data-angle');
  await page.waitForTimeout(250);
  await expect(viewport).toHaveAttribute('data-angle',globalPause);
});

test('the concept becomes a solid at the same anchors before rotation starts on desktop and portrait', async ({ page }) => {
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:width===390?844:900});
    await page.goto(`/?alignment=${width}#slide-4`);
    const viewport=page.locator('#rod-viewport');
    await expect(viewport).toHaveAttribute('data-ready','true');
    const source=await page.locator('#solution .sketch-button img').evaluate(img=>{
      const r=img.getBoundingClientRect(),scale=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight);
      const x=r.left+(r.width-img.naturalWidth*scale)/2,y=r.top+(r.height-img.naturalHeight*scale)/2;
      return {rect:r.toJSON(),background:getComputedStyle(img.closest('.slide')).backgroundColor.match(/\d+/g).slice(0,3).map(Number),tip:{x:x+902*scale,y:y+44*scale},butt:{x:x+182*scale,y:y+1462*scale}};
    });
    await page.keyboard.press('ArrowRight');
    await page.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
    await expect(page.locator('#solution .sketch-button img')).toBeVisible();
    await expect(page.locator('.transition-ocean img')).toHaveCount(0);
    const carried=await page.locator('#solution .sketch-button img').boundingBox();
    for(const field of ['x','y','width','height'])expect(carried[field]).toBeCloseTo(source.rect[field],1);
    await expect(page.locator('#product-360')).toHaveClass(/is-active/);
    await expect(viewport).toHaveAttribute('data-angle','0.0000');
    const projected=JSON.parse(await viewport.getAttribute('data-landmarks'));
    for(const name of ['tip','butt'])for(const axis of ['x','y'])expect(projected[name][axis]).toBeCloseTo(source[name][axis],0);
    const slot=await viewport.boundingBox();
    await page.waitForTimeout(250);
    expect(await viewport.boundingBox()).toEqual(slot);
    await expect(viewport).toHaveAttribute('data-angle','0.0000');
    // Sample a blank paper margin in the actual composited frame. The sketch
    // must keep the sage page color throughout the dissolve, never flash white.
    for(const time of [150,450,800]) {
      await page.evaluate(time=>document.getAnimations().filter(a=>a.effect.target.matches('#solution .sketch-button img,#rod-viewport')).forEach(a=>{a.currentTime=time;}),time);
      const shot=await page.screenshot({clip:{x:Math.round(source.rect.x+source.rect.width*.2),y:Math.round(source.rect.y+source.rect.height*.15),width:1,height:1}});
      const rgb=await page.evaluate(async data=>{
        const image=new Image();image.src=data;await image.decode();
        const c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);
        return [...ctx.getImageData(0,0,1,1).data].slice(0,3);
      },'data:image/png;base64,'+shot.toString('base64'));
      rgb.forEach((value,i)=>expect(Math.abs(value-source.background[i])).toBeLessThan(8));
    }
    await page.evaluate(()=>document.getAnimations().forEach(a=>a.play()));
    await idle(page);
    await expect(viewport).toHaveAttribute('data-morphing','false');
    await expect.poll(async()=>Number(await viewport.getAttribute('data-angle'))).toBeGreaterThan(.03);
  }
});
