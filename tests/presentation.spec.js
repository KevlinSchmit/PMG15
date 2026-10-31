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
    if(i===4) await expect(page.locator('#solution')).toHaveClass(/is-morph-source/);
    else await expect(page.locator('.transition-object svg')).toHaveCount(1);
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
  await page.goto('/#slide-6');
  for (const value of ['$941,300,000', '$740,520,000', '$3,495,000']) {
    await expect(page.locator('#market-chart .market-ledger strong', { hasText: value })).toBeVisible();
  }
  await page.locator('#market-overview .original-chart-button').click();
  await expect(page.locator('.image-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto('/#slide-12');
  await slide(page, 12);
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
  await expect(page.locator('#funds-chart .donut-center strong')).toHaveText('$737,649');
});

test('the sketch and solid retain their pose through the cut, then rotate; close up zooms without advancing', async ({page})=>{
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:width===390?844:900});
    await page.goto(`/?rod=${width}#slide-4`);
    const viewport=page.locator('#rod-viewport');
    await expect(viewport).toHaveAttribute('data-ready','true');
    await expect(page.locator('#product-360 iframe')).toHaveCount(0);
    const expected=await page.locator('#solution .sketch-button img').evaluate(img=>{
      const r=img.getBoundingClientRect(),s=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight);
      const x=r.left+(r.width-img.naturalWidth*s)/2,y=r.top+(r.height-img.naturalHeight*s)/2;
      return {rect:r.toJSON(),background:getComputedStyle(img.closest('.slide')).backgroundColor.match(/\d+/g).slice(0,3).map(Number),tip:{x:x+902*s,y:y+44*s},butt:{x:x+182*s,y:y+1462*s}};
    });
    const shot=await page.screenshot({clip:{x:Math.round(expected.rect.x+expected.rect.width*.2),y:Math.round(expected.rect.y+expected.rect.height*.15),width:1,height:1}});
    const pixel=await page.evaluate(async data=>{
      const img=new Image();img.src=data;await img.decode();
      const c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
      return [...ctx.getImageData(0,0,1,1).data].slice(0,3);
    },'data:image/png;base64,'+shot.toString('base64'));
    pixel.forEach((value,i)=>expect(Math.abs(value-expected.background[i])).toBeLessThan(8));
    await expect(viewport).toHaveAttribute('data-angle','0.0000');
    await page.keyboard.press('ArrowRight');
    await page.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
    await expect(page.locator('#product-360')).toHaveClass(/is-active/);
    await expect(page.locator('.transition-ocean img')).toHaveCount(0);
    await expect(viewport).toHaveAttribute('data-angle','0.0000');
    const rect=await viewport.boundingBox();
    for(const k of ['x','y','width','height'])expect(rect[k]).toBeCloseTo(expected.rect[k],1);
    const actual=JSON.parse(await viewport.getAttribute('data-landmarks'));
    for(const p of ['tip','butt'])for(const k of ['x','y'])expect(actual[p][k]).toBeCloseTo(expected[p][k],0);
    await page.waitForTimeout(180);
    await expect(viewport).toHaveAttribute('data-angle','0.0000');
    await page.evaluate(()=>document.getAnimations().forEach(a=>a.play()));
    await idle(page);
    await expect.poll(async()=>Number(await viewport.getAttribute('data-angle'))).toBeGreaterThan(.05);
    await page.getByRole('button',{name:'Pause product rotation',exact:true}).click();
    const before=JSON.parse(await viewport.getAttribute('data-landmarks'));
    const distance=p=>Math.hypot(p.tip.x-p.butt.x,p.tip.y-p.butt.y);
    const button=await page.getByRole('button',{name:'Close up',exact:true}).boundingBox();
    const scene=await page.locator('#product-360').boundingBox();
    expect(button.y+button.height).toBeLessThan(scene.y+scene.height-4);
    await page.getByRole('button',{name:'Close up',exact:true}).click();
    expect(await page.locator('#product-360').evaluate(e=>e.scrollTop)).toBe(0);
    await expect(page.getByRole('button',{name:'Full view',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect.poll(async()=>distance(JSON.parse(await viewport.getAttribute('data-landmarks')))).toBeGreaterThan(distance(before)*1.9);
    await expect(page.locator('#slide-position')).toHaveText('05 / 13');
    await page.getByRole('button',{name:'Full view',exact:true}).click();
    await expect(page.getByRole('button',{name:'Close up',exact:true})).toHaveAttribute('aria-pressed','false');
    await expect.poll(async()=>distance(JSON.parse(await viewport.getAttribute('data-landmarks')))).toBeCloseTo(distance(before),0);
  }
});
