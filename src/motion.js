import { mountSceneArt, mountDetailIcons } from './scene-art.js';

// Each boundary has a subject, a distinct movement, and a short time budget.
const profiles = {
  surface: ['cover-tide-reveal', 'school', 'hero', 'tide', 620],
  'consumer-profile': ['portrait-to-story', 'fleet', 'hidden', 'split', 460],
  challenge: ['prevention-type-rise', 'net', 'footer', 'text-rise', 420],
  value: ['turtle-guided-reveal', 'turtle', 'value', 'illustration', 560],
  drivers: ['technology-sequence', 'chip', 'footer', 'stagger', 480],
  solution: ['product-window-open', 'lure', 'corner', 'focus', 520],
  'visual-value': ['lens-to-market', 'focus', 'corner', 'iris', 540],
  'market-overview': ['analysis-columns', 'school', 'footer', 'columns', 480],
  swot: ['branch-to-navigation', 'coral', 'corner', 'route', 560],
  landscape: ['axis-to-comparison', 'route', 'corner', 'wipe', 460],
  comparison: ['financial-numbers-rise', 'chip', 'footer', 'text-rise', 440],
  funds: ['next-chapter-lift', 'funds', 'footer', 'page-lift', 480],
  'next-step': ['financial-window-open', 'net', 'corner', 'focus', 440],
  'pro-forma': ['thank-you-settle', 'funds', 'closing', 'dissolve', 460],
  'thank-you': ['return-to-cover', 'school', 'closing', 'dissolve', 360]
};
const content = {
  surface: '.hero-copy,.hero-authors',
  'consumer-profile': '.consumer-copy',
  challenge: '.problem-hero,.problem-thesis',
  value: 'h2,.value-statement',
  drivers: 'h2,.driver',
  solution: 'h2,.solution-features',
  'visual-value': 'h2',
  'market-overview': 'h2,.market-ledger-row',
  swot: 'h2,.swot-grid>article',
  landscape: 'h2,.source-trigger',
  comparison: 'h2,.table-scroll',
  funds: 'h2,.funds-subtitle,.funds-ledger-row,.financial-notes,.funds-footnote,.original-chart-button',
  'next-step': '.next-step-copy',
  'pro-forma': '.closing-copy',
  'thank-you': '.closing-copy'
};
const ease = 'cubic-bezier(.22,.7,.25,1)';
const activeEntrances = new Set();
let finishCut;
export function finishTransition() { finishCut?.(); }

export function prepareMotion(slides) {
  for (const [index, slide] of slides.entries()) {
    const [name, art, placement, kind, duration] = profiles[slide.id];
    Object.assign(slide.dataset, { transition: name, cut: kind, duration });
    slide.setAttribute('aria-label', `${index + 1}. ${slide.dataset.title}`);
    mountSceneArt(slide, art, placement);
  }
  mountDetailIcons();
}
export function stopEntrances() {
  activeEntrances.forEach(animation => animation.cancel());
  activeEntrances.clear();
  document.querySelectorAll('[data-count]').forEach(element => {
    element.textContent = '$' + Number(element.dataset.count).toLocaleString('en-US');
  });
}
function parts(slide) { return [...slide.querySelectorAll(content[slide.id] || 'h2')]; }
function chartReveal(slide, animate, delay = 0) {
  slide.querySelectorAll('.market-basin').forEach((basin, index) => {
    animate(basin, [{ clipPath: 'inset(100% 0 0)', opacity: .4 }, { clipPath: 'inset(0% 0 0)', opacity: 1 }], { duration: 360, delay: delay + index * 35 });
  });
  slide.querySelectorAll('.fund-arc').forEach((arc, index) => {
    animate(arc, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 360, delay: delay + index * 28 });
  });
}
// Direct visits and overview jumps enter lightly without delaying navigation.
export function enterSlide(slide, index, paused) {
  stopEntrances();
  if (paused()) return;
  const animate = (element, frames, options = {}) => {
    const animation = element.animate(frames, { duration: 280, easing: ease, fill: 'both', ...options });
    activeEntrances.add(animation);
    animation.finished.then(() => { activeEntrances.delete(animation); animation.cancel(); }, () => {});
    return animation;
  };
  parts(slide).forEach((element, i) => animate(element, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { delay: Math.min(i * 18, 90) }));
  const art = slide.querySelector('.scene-object');
  animate(art, [{ opacity: 0 }, { opacity: getComputedStyle(art).opacity }], { duration: 340 });
  chartReveal(slide, animate, 40);
}
function anchor(slide, selector = '.scene-object') {
  const element = slide.querySelector(selector), bounds = slide.getBoundingClientRect();
  if (!element || getComputedStyle(element).visibility === 'hidden') return { x: 75, y: 65 };
  const rect = element.getBoundingClientRect(), clamp = value => Math.max(5, Math.min(95, value));
  return { x: clamp((rect.left + rect.width / 2 - bounds.left) / bounds.width * 100), y: clamp((rect.top + rect.height / 2 - bounds.top) / bounds.height * 100) };
}
function windowClip(slide) {
  const element = slide.querySelector('.solution-model-stage,.next-step-visual');
  if (!element) return 'inset(25% 35% 25% 35% round 8px)';
  const bounds = slide.getBoundingClientRect(), rect = element.getBoundingClientRect();
  return `inset(${(rect.top-bounds.top)/bounds.height*100}% ${(bounds.right-rect.right)/bounds.width*100}% ${(bounds.bottom-rect.bottom)/bounds.height*100}% ${(rect.left-bounds.left)/bounds.width*100}% round 8px)`;
}

export async function transitionSlides(outgoing, incoming, overlay, backwards, swap) {
  const siblings = [...outgoing.parentElement.querySelectorAll(':scope>.slide')];
  const adjacent = Math.abs(siblings.indexOf(outgoing) - siblings.indexOf(incoming)) === 1;
  const boundary = backwards ? incoming : outgoing;
  const [name, , , configuredKind, configuredDuration] = profiles[boundary.id];
  const kind = adjacent ? configuredKind : 'dissolve', duration = adjacent ? configuredDuration : 340;
  const direction = backwards ? -1 : 1, animations = [];
  const originalStyles = [outgoing, incoming].map(slide => [slide, slide.getAttribute('style')]);
  let swapped = false, finishing = false;
  const swapOnce = () => { if (!swapped) { swapped = true; swap(); } };
  const animate = (element, frames, options = {}) => {
    if (!element) return;
    const delay = Math.min(options.delay || 0, duration - 80);
    const animation = element.animate(frames, { easing: ease, fill: 'both', ...options, delay, duration: Math.min(options.duration || duration, duration - delay) });
    animations.push(animation);
    if (finishing) animation.finish();
    return animation;
  };
  const move = (element, x, y, entering, options = {}) => animate(element,
    entering ? [{ opacity: 0, transform: `translate(${x}px,${y}px)` }, { opacity: 1, transform: 'none' }]
      : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translate(${x}px,${y}px)` }], options);
  const enter = (x = 0, y = 14, delay = 90) => parts(incoming).forEach((element, index) => move(element, x, y, true, { duration: 300, delay: delay + Math.min(index * 24, 120) }));
  const exit = (x = 0, y = -10) => parts(outgoing).forEach((element, index) => move(element, x, y, false, { duration: 180, delay: Math.min(index * 12, 60) }));
  const crossfade = (oldDuration = 220, newDuration = 220, delay = 60) => {
    animate(outgoing, [{ opacity: 1 }, { opacity: 0 }], { duration: oldDuration });
    animate(incoming, [{ opacity: 0 }, { opacity: 1 }], { duration: newDuration, delay });
  };
  overlay.replaceChildren();
  Object.assign(overlay.dataset, { effect: adjacent ? name : 'chapter-jump', kind, duration });
  overlay.classList.add('play');
  outgoing.classList.add('is-departing'); incoming.classList.add('is-arriving');
  outgoing.style.zIndex = '2'; incoming.style.zIndex = '3'; incoming.style.opacity = '0';
  finishCut = () => {
    finishing = true; swapOnce();
    animations.forEach(animation => { try { animation.finish(); } catch {} });
  };
  try {
    switch (kind) {
      case 'tide':
        // The real cover wave stays put as the next page opens above it.
        animate(outgoing, [{ opacity: 1 }, { opacity: 0 }], { duration: 440, delay: 90 });
        animate(incoming, [{ opacity: 1 }, { opacity: 1 }]);
        animate(incoming, [{ clipPath: 'ellipse(110% 0% at 50% 100%)' }, { clipPath: 'ellipse(110% 160% at 50% 100%)' }]);
        exit(0, -14); enter(0, 16, 170);
        break;
      case 'split':
        crossfade(280, 220, 80); exit(-18 * direction, 0);
        move(outgoing.querySelector('.consumer-photo'), 24 * direction, 0, false, { duration: 280 });
        enter(0, 18, 90);
        break;
      case 'text-rise':
        crossfade(180, 180, 60); exit(0, -12 * direction); enter(0, 18 * direction, 75);
        break;
      case 'illustration': {
        const point = anchor(boundary);
        outgoing.style.background = 'transparent'; outgoing.style.zIndex = '4';
        animate(outgoing, [{ opacity: 1 }, { opacity: 0 }], { duration: 320 });
        animate(incoming, [{ opacity: 1 }, { opacity: 1 }]);
        animate(incoming, [{ clipPath: `circle(0% at ${point.x}% ${point.y}%)` }, { clipPath: `circle(150% at ${point.x}% ${point.y}%)` }]);
        animate(outgoing.querySelector('.scene-object'), [{ transform: 'none' }, { transform: `translate(${-24 * direction}px,-6px) rotate(-2deg)` }], { duration: 300 });
        exit(-12 * direction, 0); enter(0, 12, 140);
        break;
      }
      case 'stagger':
        crossfade(250, 220, 80); exit(0, -14);
        incoming.querySelectorAll('h2,.solution-features>.overline,.feature-list>li').forEach((element, index) => move(element, 16 * direction, 0, true, { duration: 260, delay: 75 + index * 35 }));
        break;
      case 'focus':
        crossfade(220, 200, 40);
        animate(incoming, [{ clipPath: windowClip(boundary) }, { clipPath: 'inset(0% 0% 0% 0% round 0px)' }]);
        exit(0, -8); enter(16 * direction, 0, 120);
        break;
      case 'iris': {
        const point = anchor(boundary, '.visual-value-art');
        crossfade(200, 180, 30);
        animate(incoming, [{ clipPath: `circle(0% at ${point.x}% ${point.y}%)` }, { clipPath: `circle(150% at ${point.x}% ${point.y}%)` }]);
        exit(0, -8); enter(0, 12, 80);
        break;
      }
      case 'columns':
        crossfade(200, 190, 60); exit(-12 * direction, 0);
        move(incoming.querySelector('h2'), 0, -10, true, { duration: 240, delay: 90 });
        incoming.querySelectorAll('.swot-grid>article').forEach((element, index) => move(element, (index % 2 ? 18 : -18) * direction, 0, true, { duration: 300, delay: 100 + index * 30 }));
        break;
      case 'route': {
        crossfade(200, 200, 80); exit(0, -8); enter(14 * direction, 0, 100);
        const plot = incoming.querySelector('.plot');
        if (plot) {
          animate(plot, [{ clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }], { delay: 70, duration: 420 });
          const rect = plot.getBoundingClientRect();
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', `0 0 ${innerWidth} ${overlay.clientHeight}`);
          svg.classList.add('transition-rule');
          svg.innerHTML = `<path d="M${rect.left} ${rect.bottom}H${rect.right}" pathLength="1"/>`;
          overlay.append(svg);
          animate(svg.firstElementChild, [{ strokeDasharray: '1', strokeDashoffset: 1, opacity: 0 }, { strokeDasharray: '1', strokeDashoffset: 0, opacity: .65, offset: .55 }, { strokeDasharray: '1', strokeDashoffset: -1, opacity: 0 }]);
        }
        break;
      }
      case 'wipe':
        crossfade(200, 180, 40);
        animate(incoming, [{ clipPath: backwards ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }]);
        exit(-10 * direction, 0);
        move(incoming.querySelector('h2'), 14 * direction, 0, true, { duration: 240, delay: 100 });
        incoming.querySelectorAll('thead,tbody tr').forEach((element, index) => move(element, 0, 6, true, { duration: 240, delay: 80 + index * 32 }));
        break;
      case 'page-lift':
        animate(outgoing, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${-24 * direction}px)` }], { duration: 260 });
        animate(incoming, [{ opacity: 0, transform: `translateY(${20 * direction}px)` }, { opacity: 1, transform: 'none' }]);
        break;
      default:
        crossfade(180, 260, 30); exit(0, -8); enter(0, 12, 90);
        animate(incoming.querySelector('.scene-object'), [{ opacity: 0 }, { opacity: getComputedStyle(incoming.querySelector('.scene-object')).opacity }], { duration: 260, delay: 120 });
    }
    chartReveal(incoming, animate, 80);
    swapOnce();
    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
  } finally {
    swapOnce(); finishCut = undefined;
    animations.forEach(animation => animation.cancel());
    outgoing.classList.remove('is-departing'); incoming.classList.remove('is-arriving');
    originalStyles.forEach(([slide, style]) => { if (style === null) slide.removeAttribute('style'); else slide.setAttribute('style', style); });
    overlay.classList.remove('play'); overlay.replaceChildren();
  }
}
