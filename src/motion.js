import { mountSceneArt, sceneArt } from './scene-art.js';

// A cut belongs to its subject. Dense pages keep their objects in the margins.
const profiles = {
  surface: ['surface-school-departure', 'school', 'hero', 'school'],
  finding: ['ideas-coral-connect', 'coral', 'map', 'branches'],
  defining: ['problem-path-trace', 'route', 'map', 'route'],
  challenge: ['bycatch-net-release', 'net', 'footer', 'net'],
  drivers: ['technology-signal-relay', 'chip', 'footer', 'signal'],
  solution: ['smart-lure-line-cast', 'lure', 'corner', 'cast'],
  'in-action': ['continuous-underwater-encounter', 'sonar', 'hidden', 'encounter'],
  'protected-encounter': ['protected-turtle-departure', 'turtle', 'hidden', 'turtle'],
  strategy: ['strategy-compass-route', 'route', 'corner', 'route'],
  market: ['market-fleet-underway', 'fleet', 'divider', 'fleet'],
  'market-overview': ['market-school-circulation', 'school', 'footer', 'school'],
  'interview-1': ['fisher-voice-ripples', 'listening', 'interview', 'sound'],
  'interview-2': ['learning-voice-response', 'listening', 'interview', 'echo'],
  'interview-3': ['hobbyist-camera-scan', 'focus', 'interview', 'scan'],
  tam: ['total-market-fleet-crossing', 'fleet', 'footer', 'fleet'],
  sam: ['serviceable-market-sonar', 'sonar', 'footer', 'sonar'],
  som: ['obtainable-market-fish-track', 'focus', 'footer', 'track'],
  competition: ['competition-sonar-survey', 'sonar', 'divider', 'sonar'],
  definition: ['product-lure-deployment', 'lure', 'corner', 'drop'],
  swot: ['swot-branching-paths', 'coral', 'corner', 'branches'],
  landscape: ['landscape-course-chart', 'route', 'corner', 'route'],
  comparison: ['comparison-circuit-connect', 'chip', 'footer', 'signal'],
  uvp: ['marine-shield-current', 'shield', 'divider', 'shield'],
  value: ['protected-fish-release', 'turtle', 'value', 'turtle'],
  'visual-value': ['camera-field-of-view', 'focus', 'corner', 'scan'],
  financials: ['funding-coins-distribute', 'funds', 'divider', 'coins'],
  funds: ['funding-return-to-ocean', 'funds', 'footer', 'return']
};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const easing = 'cubic-bezier(.22,.65,.3,1)';
let activeEntrances = [];
let latestEntry = 0;
let finishCut;

export function finishTransition() { finishCut?.(); }

export function prepareMotion(slides) {
  for (const [i, slide] of slides.entries()) {
    const [effect, art, placement, cut] = profiles[slide.id];
    slide.dataset.transition = effect;
    slide.dataset.cut = cut;
    slide.setAttribute('aria-label', `${i + 1}. ${slide.dataset.title}`);
    mountSceneArt(slide, art, placement);
  }
}
export function stopEntrances() {
  latestEntry++;
  activeEntrances.forEach(animation => animation.cancel());
  activeEntrances = [];
  document.querySelectorAll('[data-count]').forEach(element => {
    element.textContent = '$' + Number(element.dataset.count).toLocaleString('en-US');
  });
}
function play(element, frames, options = {}) {
  const animation = element.animate(frames, { duration: 650, easing, fill: 'both', ...options });
  activeEntrances.push(animation);
  return animation;
}
export async function enterSlide(slide, index, paused) {
  stopEntrances();
  const version = latestEntry;
  await Promise.race([
    Promise.all([document.fonts.ready, ...[...slide.querySelectorAll('img')].map(img => img.decode?.().catch(() => {}))]),
    sleep(1000)
  ]);
  if (version !== latestEntry || !slide.classList.contains('is-active') || paused()) return;
  // Reading stays still. Only a quiet dissolve, never word-by-word zooms or rotations.
  slide.querySelectorAll('h1,h2,.map-heading,.calculation-content,.art-frame,.challenge-grid,.numbers-strip,.drivers,.solution-features,.sketch-button,.interview-content,.value-statement,.financial-notes,.demo-aside,.product-definition,.table-scroll,.landscape').forEach(element => {
    if (element.parentElement.closest('.map-heading,.calculation-content')) return;
    play(element, [{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: 40 });
  });
  const object = slide.querySelector('.scene-object');
  play(object, [{ opacity: 0 }, { opacity: getComputedStyle(object).opacity }], { duration: 750 });
  object.querySelectorAll('[data-draw]').forEach((path, i) => {
    path.setAttribute('pathLength', '1');
    play(path, [{ strokeDasharray: '1', strokeDashoffset: 1 }, { strokeDasharray: '1', strokeDashoffset: 0 }], { delay: i * 110, duration: 1100 });
  });
  slide.querySelectorAll('.market-basin').forEach((basin, i) => {
    play(basin, [{ opacity: 0, clipPath: 'inset(100% 0 0)' }, { opacity: 1, clipPath: 'inset(0% 0 0)' }], { duration: 1000, delay: i * 170 });
  });
  slide.querySelectorAll('.market-ledger-row,.funds-ledger-row').forEach((row, i) => {
    play(row, [{ opacity: 0 }, { opacity: 1 }], { delay: 120 + i * 100 });
  });
  slide.querySelectorAll('.fund-arc').forEach((arc, i) => {
    play(arc, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay: i * 140, duration: 1100 });
  });
}

function makeField(overlay, markup) {
  const field = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  field.setAttribute('viewBox', '0 0 1440 810');
  field.setAttribute('preserveAspectRatio', 'none');
  field.classList.add('transition-field');
  field.innerHTML = markup;
  overlay.append(field);
  return field;
}
function carryObject(outgoing, overlay, art) {
  const source = outgoing.querySelector('.scene-object');
  const rect = source.getBoundingClientRect();
  const hidden = getComputedStyle(source).visibility === 'hidden';
  const width = hidden ? Math.min(360, innerWidth * .38) : rect.width;
  const height = hidden ? width * 260 / 360 : rect.height;
  const object = document.createElement('div');
  object.className = `transition-object object-${art}`;
  object.style.cssText = `left:${hidden ? innerWidth * .58 : rect.left}px;top:${hidden ? innerHeight * .32 : rect.top}px;width:${width}px;height:${height}px;`;
  object.innerHTML = sceneArt(art);
  overlay.append(object);
  return object;
}
// Hold the live camera view across the cut, so the turtle enters the same water.
function holdCamera(outgoing, overlay) {
  const source = outgoing.querySelector('.deep-scene');
  const rect = source.getBoundingClientRect();
  const holder = document.createElement('div');
  holder.className = 'transition-camera';
  holder.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;`;
  const camera = source.cloneNode(true);
  camera.style.cssText = `width:${source.offsetWidth}px;height:${source.offsetHeight}px;transform:scale(${rect.width / source.offsetWidth});transform-origin:0 0;`;
  camera.innerHTML = camera.innerHTML.replace(/id="([^"]+)"/g, 'id="cut-$1"').replace(/url\(#([^)]+)\)/g, 'url(#cut-$1)');
  holder.append(camera);
  overlay.append(holder);
  return holder;
}

export async function transitionSlides(outgoing, incoming, overlay, backwards, swap) {
  const [name, art, , cut] = profiles[outgoing.id];
  overlay.replaceChildren();
  overlay.dataset.effect = name;
  overlay.dataset.kind = cut;
  overlay.classList.add('play');
  overlay.classList.toggle('backwards', backwards);
  const animations = [];
  let finishRequested = false;
  let releaseCut;
  const interrupted = new Promise(resolve => { releaseCut = resolve; });
  const animate = (element, frames, options = {}) => {
    const animation = element.animate(frames, { duration: 1000, easing, fill: 'both', ...options });
    animations.push(animation);
    if (finishRequested) animation.finish();
    return animation;
  };
  const draw = field => field.querySelectorAll('path').forEach((path, i) => {
    path.setAttribute('pathLength', '1');
    animate(path, [{ strokeDasharray: '1', strokeDashoffset: 1, opacity: 0 }, { strokeDasharray: '1', strokeDashoffset: 0, opacity: .65, offset: .55 }, { strokeDasharray: '1', strokeDashoffset: -1, opacity: 0 }], { delay: i * 35, duration: 850 });
  });
  let swapped = false;
  let carriedSource;
  let sourceVisibility;
  const swapOnce = () => { if (!swapped) { swapped = true; swap(); } };
  finishCut = () => {
    finishRequested = true;
    swapOnce();
    animations.forEach(animation => { try { animation.finish(); } catch {} });
    releaseCut();
  };
  try {
    const encounter = [outgoing.id, incoming.id].every(id => ['in-action', 'protected-encounter'].includes(id));
    if (encounter) {
      const camera = holdCamera(outgoing, overlay);
      animate(outgoing.querySelector('.demo-aside'), [{ opacity: 1 }, { opacity: 0 }], { duration: 180 });
      await Promise.race([sleep(180), interrupted]);
      swapOnce();
      animate(camera, [{ opacity: 1 }, { opacity: 0 }], { duration: 230 });
    } else {
      outgoing.classList.add('is-departing');
      const object = carryObject(outgoing, overlay, art);
      carriedSource = outgoing.querySelector('.scene-object');
      sourceVisibility = carriedSource.style.visibility;
      carriedSource.style.visibility = 'hidden';
      const sign = backwards ? 1 : -1;
      const distance = innerWidth * sign;
      const depart = (x, y = 0, rotation = 0) => animate(object, [
        { opacity: 1, transform: 'translate(0,0) rotate(0deg)' },
        { opacity: 1, transform: `translate(${x * .25}px,${y * .4}px) rotate(${rotation * .4}deg)`, offset: .4 },
        { opacity: 0, transform: `translate(${x}px,${y}px) rotate(${rotation}deg)` }
      ]);
      if (['school', 'fleet', 'turtle', 'return'].includes(cut)) {
        depart(distance, cut === 'turtle' ? -innerHeight * .18 : -35, cut === 'turtle' ? -8 : 0);
        draw(makeField(overlay, `<g class="cut-current">${[0,1,2].map(i => `<path d="M-100 ${360+i*90}C400 ${200+i*90} 750 ${660-i*70} 1540 ${310+i*90}"/>`).join('')}</g>`));
        if (cut !== 'fleet') for (let i = 0; i < 3; i++) {
          const swimmer = document.createElement('div');
          swimmer.className = 'transition-swimmer';
          swimmer.innerHTML = sceneArt(i === 2 && cut === 'turtle' ? 'turtle' : 'school');
          swimmer.style.cssText = `width:${120+i*45}px;top:${18+i*25}%;left:${backwards ? '-30%' : '110%'};`;
          overlay.append(swimmer);
          animate(swimmer, [{ transform: 'translateX(0)', opacity: 0 }, { opacity: .65, offset: .3 }, { transform: `translateX(${distance*1.7}px)`, opacity: 0 }], { delay: i*70 });
        }
      } else if (['branches', 'route', 'signal'].includes(cut)) {
        depart(sign * 100, -50);
        draw(makeField(overlay, cut === 'signal'
          ? '<g class="cut-circuit"><path d="M0 610H390V220H760V440H1440"/><path d="M0 680H470V300H850V510H1440"/><path d="M0 540H310V145H670V370H1440"/></g>'
          : cut === 'branches'
            ? '<g class="cut-branch"><path d="M100 810V450Q100 370 330 370H690Q760 370 760 230V0"/><path d="M330 370V160H0M690 370v190h750M760 230h440V0"/></g>'
            : '<g class="cut-route"><path d="M-50 650C260 130 570 780 760 350S1200 60 1500 210"/></g>'));
      } else if (cut === 'net') {
        const net = object.querySelector('.art-net');
        net.style.transformOrigin = '50% 0';
        animate(net, [{ opacity: 1, transform: 'rotate(0)' }, { opacity: 0, transform: 'translateY(-200px) rotate(-22deg)' }]);
        depart(distance * .6, -60);
      } else if (['cast', 'drop'].includes(cut)) {
        const x = parseFloat(object.style.left), y = parseFloat(object.style.top);
        object.style.offsetPath = cut === 'cast'
          ? `path("M0 0C${-x*.5} ${-y*.8} ${innerWidth*.35} ${-y*.5} ${distance*.7} ${innerHeight*.5}")`
          : `path("M0 0C-30 60 35 180 0 ${innerHeight}")`;
        object.style.offsetRotate = '0deg';
        animate(object, [{ offsetDistance: '0%', opacity: 1 }, { offsetDistance: '100%', opacity: 0 }]);
        draw(makeField(overlay, '<g class="cut-cast"><path d="M0 720Q480-220 1110 280T1540 810"/></g>'));
      } else if (['sonar', 'scan', 'track', 'shield'].includes(cut)) {
        depart(0, -25);
        if (cut === 'sonar') for (let i = 0; i < 3; i++) {
          const ring = document.createElement('div'); ring.className = 'transition-sonar'; overlay.append(ring);
          animate(ring, [{ transform: 'translate(-50%,-50%) scale(.15)', opacity: 0 }, { opacity: .5, offset: .25 }, { transform: 'translate(-50%,-50%) scale(1.5)', opacity: 0 }], { delay: i*100 });
        } else {
          const field = makeField(overlay, cut === 'shield'
            ? '<g class="cut-protection"><path d="M-50 660Q720 130 1490 660"/><path d="M-50 700Q720 170 1490 700"/></g>'
            : '<g class="cut-scan"><path d="M0 405H1440"/><path d="M80 310v-60h60m1160 0h60v60m0 190v60h-60m-1160 0H80v-60"/></g>');
          draw(field);
          animate(field, [{ opacity: 0, translate: '0 90px' }, { opacity: 1, offset: .4 }, { opacity: 0, translate: '0 -90px' }]);
        }
      } else if (['sound', 'echo'].includes(cut)) {
        depart(sign * 110, 0);
        const field = makeField(overlay, `<g class="cut-sound">${Array.from({ length: 25 }, (_, i) => {
          const h = 22 + Math.sin(i * 1.8) ** 2 * 160;
          return `<path d="M${100+i*52} ${405-h}v${h*2}"/>`;
        }).join('')}</g>`);
        field.querySelectorAll('path').forEach((path, i) => animate(path, [{ opacity: 0, transform: 'scaleY(.1)' }, { opacity: .6, transform: 'scaleY(1)', offset: .45 }, { opacity: 0, transform: 'scaleY(.1)' }], { delay: (cut === 'echo' ? 24-i : i)*14, duration: 650 }));
      } else if (cut === 'coins') {
        depart(sign * 190, -80);
        object.querySelectorAll('[data-part="coin"]').forEach((coin, i) => {
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.append(...coin.childNodes); coin.append(group);
          animate(group, [{ transform: 'translateY(0)' }, { transform: `translate(${(i-1)*100}px,${-140-i*30}px)`, opacity: 0 }], { delay: i*80 });
        });
        draw(makeField(overlay, '<g class="cut-circuit"><path d="M720 700V405H240V180M720 405V100M720 405h480V180"/></g>'));
      }
      animate(outgoing, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, delay: 180 });
      await Promise.race([sleep(330), interrupted]);
      swapOnce();
      animate(incoming, [{ opacity: 0 }, { opacity: 1 }], { duration: 360 });
    }
    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
  } finally {
    swapOnce();
    finishCut = undefined;
    animations.forEach(animation => animation.cancel());
    outgoing.classList.remove('is-departing');
    if (carriedSource) carriedSource.style.visibility = sourceVisibility;
    overlay.classList.remove('play');
    overlay.replaceChildren();
  }
}
