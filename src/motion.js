import { mountSceneArt, mountDetailIcons } from './scene-art.js';

const profiles = {
  surface: ['wave-sweeps-the-title', 'school', 'hero', 'wave-cast', 1650],
  'consumer-profile': ['portrait-splits-the-scene', 'fleet', 'hidden', 'portrait-split', 1350],
  challenge: ['prevention-slingshot', 'net', 'footer', 'type-slingshot', 1250],
  value: ['turtle-clears-the-page', 'turtle', 'value', 'turtle-flight', 1550],
  drivers: ['components-become-a-system', 'chip', 'footer', 'component-fold', 1450],
  solution: ['camera-travels-through-product', 'lure', 'corner', 'camera-shutter', 1500],
  'visual-value': ['lens-releases-market-bubbles', 'focus', 'corner', 'market-bubbles', 1550],
  'market-overview': ['circles-unfold-into-quadrants', 'school', 'footer', 'quadrant-unfold', 1450],
  swot: ['compass-swings-the-map', 'coral', 'corner', 'map-swing', 1500],
  landscape: ['coordinates-become-table-rows', 'route', 'corner', 'row-weave', 1350],
  comparison: ['spending-wheel-assembles', 'chip', 'footer', 'funding-orbit', 1550],
  funds: ['cast-into-the-next-chapter', 'funds', 'footer', 'net-cast', 1500],
  'next-step': ['net-unrolls-the-financials', 'net', 'corner', 'paper-unroll', 1400],
  'pro-forma': ['school-joins-the-finale', 'funds', 'closing', 'school-finale', 1650],
  'thank-you': ['whirlpool-returns-to-cover', 'school', 'closing', 'whirlpool', 1450]
};
const content = {
  surface: '.hero-copy,.hero-authors', 'consumer-profile': '.consumer-copy,.consumer-photo',
  challenge: '.problem-hero,.problem-thesis', value: 'h2,.value-statement',
  drivers: 'h2,.driver', solution: 'h2,.solution-features', 'visual-value': 'h2',
  'market-overview': 'h2,.market-ledger-row', swot: 'h2,.swot-grid>article',
  landscape: 'h2,.source-trigger', comparison: 'h2,.table-scroll',
  funds: 'h2,.funds-subtitle,.funds-ledger-row,.financial-notes,.funds-footnote,.original-chart-button',
  'next-step': '.next-step-copy', 'pro-forma': '.closing-copy', 'thank-you': '.closing-copy'
};
const spring = 'cubic-bezier(.18,.8,.25,1)';
const accelerate = 'cubic-bezier(.5,.05,.8,.45)';
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
  const coverArt = document.querySelector('#surface .hero-art');
  if (coverArt && !coverArt.querySelector('.hero-glow')) {
    const glow = document.createElement('div'); glow.className = 'hero-glow'; glow.setAttribute('aria-hidden', 'true'); coverArt.prepend(glow);
  }
  const heading = document.querySelector('#thank-you h2');
  if (heading?.firstChild?.nodeType === Node.TEXT_NODE) {
    const first = document.createElement('span');
    first.className = 'thank-first'; first.textContent = heading.firstChild.textContent.trim();
    heading.firstChild.replaceWith(first, document.createTextNode(' '));
  }
  mountDetailIcons();
}
export function stopEntrances() {
  activeEntrances.forEach(animation => animation.cancel()); activeEntrances.clear();
  document.querySelectorAll('[data-count]').forEach(element => { element.textContent = '$' + Number(element.dataset.count).toLocaleString('en-US'); });
}
const parts = slide => [...slide.querySelectorAll(content[slide.id] || 'h2')];
const pose = ({ x = 0, y = 0, z = 0, r = 0, rx = 0, ry = 0, s = 1 } = {}) => `perspective(1200px) translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${r}deg) scale(${s})`;
export function enterSlide(slide, index, paused) {
  stopEntrances(); if (paused()) return;
  parts(slide).forEach((element, i) => {
    const animation = element.animate([{ transform: pose({ y: 55, r: -1.5, s: .97 }) }, { transform: pose({ y: -5, r: .2 }), offset: .8 }, { transform: 'none' }], { duration: 650, delay: Math.min(i * 28, 100), easing: spring, fill: 'both' });
    activeEntrances.add(animation);
    animation.finished.then(() => { activeEntrances.delete(animation); animation.cancel(); }, () => {});
  });
}

export async function transitionSlides(outgoing, incoming, overlay, backwards, swap) {
  const slides = [...outgoing.parentElement.querySelectorAll(':scope>.slide')];
  const adjacent = Math.abs(slides.indexOf(outgoing) - slides.indexOf(incoming)) === 1;
  const restart = outgoing.id === 'thank-you' && incoming.id === 'surface';
  const reverse = adjacent && backwards;
  const from = reverse ? incoming : outgoing, to = reverse ? outgoing : incoming;
  const [name, , , configuredKind, configuredDuration] = profiles[from.id];
  const kind = adjacent || restart ? configuredKind : 'camera-jump';
  const duration = adjacent || restart ? configuredDuration : 1000;
  const width = from.clientWidth, height = from.clientHeight;
  const plan = [], animations = [], moving = new Set(), styles = new Map();
  let swapped = false;
  const swapOnce = () => { if (!swapped) { swapped = true; swap(); } };
  const remember = element => { if (element && !styles.has(element)) styles.set(element, element.getAttribute('style')); };
  const style = (element, values) => { if (element) { remember(element); Object.assign(element.style, values); } };
  const queue = (element, frames) => {
    if (!element) return;
    plan.push([element, frames]);
    if (frames.some(frame => frame.transform !== undefined || frame.translate !== undefined)) moving.add(element);
  };
  const covered = element => [...moving].some(actor => actor === element || actor.contains(element) || element.contains(actor));
  const arrive = (element, { x = 0, y = height * .7, r = 0, rx = 0, ry = 0, s = .9, begin = .3, end = .97 } = {}) => {
    const initial = pose({ x, y, r, rx, ry, s });
    queue(element, [
      { transform: initial, offset: 0 }, { transform: initial, offset: begin, easing: spring },
      { transform: pose({ x: -x * .022, y: -y * .018, r: -r * .08, rx: -rx * .06, ry: -ry * .06, s: 1.025 }), offset: begin + (end - begin) * .78, easing: 'ease-in-out' },
      { transform: pose(), offset: end }, { transform: pose(), offset: 1 }
    ]);
  };
  const depart = (element, { x = -width * 1.15, y = -height * .15, r = -8, rx = 0, ry = 0, s = .85, begin = .12, end = .67 } = {}) => queue(element, [
    { transform: pose(), offset: 0, easing: 'ease-in-out' },
    { transform: pose({ x: -x * .025, y: -y * .025, r: -r * .08, s: 1.015 }), offset: begin, easing: accelerate },
    { transform: pose({ x, y, r, rx, ry, s }), offset: end }, { transform: pose({ x, y, r, rx, ry, s }), offset: 1 }
  ]);
  const cast = (element, { x = -width, y = -height * .6, r = -18, begin = .35 } = {}) => queue(element, [
    { transform: pose({ x, y, r, s: .65 }), offset: 0 }, { transform: pose({ x, y, r, s: .65 }), offset: begin, easing: spring },
    { transform: pose({ x: -70, y: -100, r: -6, s: 1.07 }), offset: .72, easing: 'ease-in-out' },
    { transform: pose({ x: 10, y: 8, r: 1.2 }), offset: .88, easing: 'ease-in-out' }, { transform: pose(), offset: 1 }
  ]);
  const select = (slide, selector) => [...slide.querySelectorAll(selector)];
  const clip = (frames, element = to) => queue(element, frames.map(([clipPath, offset]) => ({ clipPath, offset, easing: 'ease-in-out' })));
  const sourcePoint = selector => {
    const bounds = from.getBoundingClientRect(), rect = (from.querySelector(selector) || from).getBoundingClientRect();
    return { x: (rect.left + rect.width / 2 - bounds.left) / bounds.width * 100, y: (rect.top + rect.height / 2 - bounds.top) / bounds.height * 100 };
  };
  const pointDelta = (element, point) => {
    const bounds = to.getBoundingClientRect(), rect = element.getBoundingClientRect(), scale = bounds.width / to.clientWidth;
    return { x: (bounds.left + bounds.width * point.x / 100 - rect.left - rect.width / 2) / scale, y: (bounds.top + bounds.height * point.y / 100 - rect.top - rect.height / 2) / scale };
  };
  overlay.replaceChildren(); Object.assign(overlay.dataset, { effect: adjacent || restart ? name : 'animated-chapter-jump', kind, duration }); overlay.classList.add('play');
  outgoing.classList.add('is-departing'); incoming.classList.add('is-arriving');
  const opaqueSource = !!from.querySelector('.product-model-embed,.visual-value-art,.next-step-visual');
  style(from, { zIndex: '4', ...(opaqueSource ? {} : { background: 'transparent' }) });
  style(to, { zIndex: '3', opacity: '1' });
  queue(from, [{ opacity: 1, offset: 0 }, { opacity: 1, offset: .999 }, { opacity: 0, offset: 1 }]);
  queue(to, [{ opacity: 1 }, { opacity: 1 }]);

  try {
    switch (kind) {
      case 'wave-cast':
        depart(from.querySelector('.hero-copy .word'), { x: -width * 1.2, y: -height * .45, r: -15, end: .68 });
        depart(from.querySelector('.hero-copy .second-word'), { x: -width * 1.3, y: height * .35, r: 12, end: .72 });
        depart(from.querySelector('.hero-caption'), { x: -width, y: height * .2, r: 8, begin: .2, end: .72 });
        depart(from.querySelector('.hero-rod'), { x: width * .65, y: -height * 1.2, r: 22, begin: .16, end: .84 });
        queue(from.querySelector('.hero-waves'), [
          { transform: pose(), offset: 0 }, { transform: pose({ x: 35, y: 20, r: 2 }), offset: .15, easing: spring },
          { transform: pose({ x: -width * .3, y: -height * .35, r: -10, s: 2.35 }), offset: .55, easing: accelerate },
          { transform: pose({ x: -width, y: -height * 1.7, r: -18, s: 3.1 }), offset: .93 }, { transform: pose({ x: -width, y: -height * 1.7, r: -18, s: 3.1 }), offset: 1 }
        ]);
        depart(from.querySelector('.hero-glow'), { x: width*.45, y: -height*1.3, r: 15, s: 1.8, begin: .2, end: .92 });
        select(from, '.floating-label,.hero-sun,.sea-orbit').forEach((element, i) => depart(element, { x: width * (i % 2 ? 1.2 : -.9), y: -height * .8, r: i % 2 ? 24 : -18, begin: .15 + i * .02, end: .82 }));
        arrive(to.querySelector('.consumer-copy'), { x: -width * .85, y: 40, r: -5, begin: .36 });
        arrive(to.querySelector('.consumer-photo'), { x: width * .25, y: height, r: 12, s: .76, begin: .3 });
        break;
      case 'portrait-split':
        depart(from.querySelector('.consumer-copy'), { x: -width * 1.1, y: height * .15, r: -10, end: .64 });
        depart(from.querySelector('.consumer-photo'), { x: width * 1.1, y: -height * .3, r: 18, end: .72 });
        cast(to.querySelector('.problem-hero'), { x: width * .25, y: -height * .9, r: 9, begin: .32 });
        arrive(to.querySelector('.thesis-before'), { x: -width, y: height * .15, r: -9, begin: .42 });
        arrive(to.querySelector('.thesis-after'), { x: width, y: height * .35, r: 12, begin: .48 });
        arrive(to.querySelector('.thesis-arrow'), { y: height * .9, r: -110, s: .4, begin: .5 });
        break;
      case 'type-slingshot':
        depart(from.querySelector('.problem-hero'), { x: -width * .25, y: -height, r: -7 });
        depart(from.querySelector('.thesis-before'), { x: -width * 1.2, y: -height * .15, r: -12 });
        depart(from.querySelector('.thesis-after'), { x: width * 1.2, y: -height * .2, r: 12, begin: .18 });
        depart(from.querySelector('.thesis-arrow'), { x: width, y: -height, r: -140, s: 1.8 });
        arrive(to.querySelector('h2'), { x: width * .65, y: -height * .55, r: 13, s: 1.5, begin: .28 });
        arrive(to.querySelector('.value-statement'), { x: -width * .2, y: height, r: -7, rx: 28, s: .8, begin: .4 });
        break;
      case 'turtle-flight':
        select(from, 'h2,.value-statement').forEach((element, i) => depart(element, { x: -width * 1.25, y: -height * (.25 + i * .2), r: -10 - i * 3, begin: .12 + i * .08, end: .74 }));
        queue(from.querySelector('.scene-object'), [
          { transform: pose(), offset: 0 }, { transform: pose({ x: 30, y: 15, r: 5 }), offset: .15, easing: spring },
          { transform: pose({ x: -width * .52, y: -height * .5, r: -12, s: 1.7 }), offset: .54, easing: accelerate },
          { transform: pose({ x: -width * 1.35, y: -height * .9, r: -20, s: 1.3 }), offset: .92 }, { transform: pose({ x: -width * 1.35, y: -height * .9, r: -20, s: 1.3 }), offset: 1 }
        ]);
        arrive(to.querySelector('h2'), { x: width * .7, y: -height * .5, r: 8, begin: .32 });
        select(to, '.driver').forEach((element, i) => arrive(element, { x: (i - 1) * width * .16, y: height, r: [10,-9,7][i], ry: [18,-18,15][i], begin: .35 + i * .08 }));
        break;
      case 'component-fold':
        select(from, '.driver').forEach((element, i) => {
          style(element, { transformOrigin: i === 1 ? '50% 100%' : '50% 50%', backfaceVisibility: 'hidden' });
          queue(element, [
            { transform: pose(), offset: 0 }, { transform: pose({ y: -20, r: (i-1)*3 }), offset: .14 + i*.025, easing: spring },
            { transform: pose({ x: (1-i)*width*.26, y: height*.18, ry: (i-1)*65, rx: -30, r: (i-1)*14, s: .28 }), offset: .53 + i*.035, easing: accelerate },
            { transform: pose({ x: width*1.1, y: -height*.7, ry: 75, r: 22, s: .12 }), offset: .83 }, { transform: pose({ x: width*1.1, y: -height*.7, ry: 75, r: 22, s: .12 }), offset: 1 }
          ]);
        });
        depart(from.querySelector('.scene-object'), { x: width * .7, y: -height, r: 25, s: 2.2, begin: .28, end: .86 });
        arrive(to.querySelector('.solution-model-stage'), { x: width*.2, y: height*.15, ry: -24, r: -8, s: .18, begin: .38 });
        arrive(to.querySelector('h2'), { y: -height*.6, r: -8, begin: .32 });
        select(to, '.solution-features>.overline,.feature-list>li').forEach((element,i)=>arrive(element,{x:width,y:60,ry:-35,r:3,begin:.36+i*.065}));
        break;
      case 'camera-shutter':
        style(to,{zIndex:'5'});
        queue(from,[{transform:pose(),offset:0},{transform:pose({x:-width*.12,y:height*.05,r:-3,s:1.15}),offset:.25,easing:spring},{transform:pose({x:-width*.35,y:height*.15,r:-8,s:1.85}),offset:1}]);
        clip([['polygon(49% 0%,49% 0%,51% 100%,51% 100%)',0],['polygon(49% 0%,49% 0%,51% 100%,51% 100%)',.22],['polygon(0% 0%,100% 0%,100% 100%,0% 100%)',.9],['polygon(0% 0%,100% 0%,100% 100%,0% 100%)',1]]);
        arrive(to.querySelector('h2'),{x:-width*.8,y:-height*.3,r:-12,begin:.36});
        arrive(to.querySelector('.visual-value-art img'),{x:width*.8,y:height*.12,r:8,s:1.2,begin:.32});
        break;
      case 'market-bubbles': {
        const point=sourcePoint('.visual-value-art');style(to,{zIndex:'5'});
        queue(from,[{transform:pose(),offset:0},{transform:pose({x:width*.2,y:-height*.12,r:7,s:1.5}),offset:1}]);
        clip([[`circle(0% at ${point.x}% ${point.y}%)`,0],[`circle(0% at ${point.x}% ${point.y}%)`,.18],[`circle(150% at ${point.x}% ${point.y}%)`,.86],[`circle(150% at ${point.x}% ${point.y}%)`,1]]);
        select(to,'.market-basin').forEach((element,i)=>{const delta=pointDelta(element,point);arrive(element,{...delta,r:[-100,90,-160][i],s:.025,begin:.25+i*.09});});
        select(to,'.market-orbit').forEach((element,i)=>arrive(element,{x:0,y:0,r:i?140:-140,s:.02,begin:.3+i*.08}));
        arrive(to.querySelector('h2'),{x:-width*.3,y:-height*.7,r:-8,begin:.3});
        select(to,'.market-ledger-row').forEach((element,i)=>arrive(element,{x:width,y:80,r:8-i*3,begin:.4+i*.08}));
        break;
      }
      case 'quadrant-unfold':
        select(from,'.market-orbit').forEach((element,i)=>depart(element,{x:(i?1:-1)*width,y:-height*.9,r:i?180:-180,s:.2,begin:.12,end:.74}));
        select(from,'.market-basin').forEach((element,i)=>depart(element,{x:[-width*1.2,width*1.2,-width*.5][i],y:[-height*.8,-height*.6,height*1.2][i],r:[-110,130,-180][i],s:.55,begin:.12+i*.045,end:.74}));
        select(to,'.swot-grid>article').forEach((element,i)=>{style(element,{transformOrigin:['100% 100%','0% 100%','100% 0%','0% 0%'][i],backfaceVisibility:'hidden'});arrive(element,{x:(i%2?1:-1)*width*.25,y:(i<2?-1:1)*height*.28,rx:i<2?-82:82,ry:i%2?-65:65,r:i%2?8:-8,s:.65,begin:.3+i*.055});});
        arrive(to.querySelector('h2'),{x:-width*.9,y:-height*.15,r:-10,begin:.36});
        break;
      case 'map-swing':
        select(from,'.swot-grid>article').forEach((element,i)=>depart(element,{x:(i%2?1:-1)*width*1.15,y:(i<2?-1:1)*height*.85,r:[-18,20,16,-16][i],s:.75,begin:.1+i*.035,end:.76}));
        depart(from.querySelector('.scene-object'),{x:-width*.7,y:-height*.8,r:-30,s:1.8,begin:.2,end:.87});
        style(to.querySelector('.landscape'),{transformOrigin:'12% 90%'});
        cast(to.querySelector('.landscape'),{x:width*.5,y:height,r:-24,begin:.3});
        select(to,'.plot-point').forEach((element,i)=>arrive(element,{y:180,r:i%2?14:-14,s:.1,begin:.6+i*.05}));
        arrive(to.querySelector('h2'),{x:-width,y:0,r:-7,begin:.38});
        break;
      case 'row-weave':
        depart(from.querySelector('.landscape'),{x:-width,y:height*.3,ry:80,r:-15,s:.4,begin:.1,end:.72});
        select(to,'thead,tbody tr').forEach((element,i)=>arrive(element,{x:(i%2?1:-1)*width*1.1,y:75,r:i%2?7:-7,ry:i%2?-18:18,s:1.05,begin:.28+i*.075}));
        arrive(to.querySelector('h2'),{x:width*.5,y:-height*.55,r:10,begin:.28});
        break;
      case 'funding-orbit':
        select(from,'thead,tbody tr').forEach((element,i)=>depart(element,{x:(i%2?1:-1)*width*1.1,y:-height*.6,r:i%2?20:-18,rx:-35,s:.65,begin:.08+i*.04,end:.72}));
        arrive(to.querySelector('.funds-donut'),{x:-width*.9,y:height*.35,r:-240,ry:-35,s:.45,begin:.3});
        select(to,'.fund-arc').forEach((element,i)=>queue(element,[{strokeDashoffset:1,offset:0},{strokeDashoffset:1,offset:.35+i*.07,easing:spring},{strokeDashoffset:0,offset:.95},{strokeDashoffset:0,offset:1}]));
        select(to,'.funds-ledger-row').forEach((element,i)=>arrive(element,{x:width*.4,y:height,r:12-i*5,begin:.42+i*.07}));
        arrive(to.querySelector('h2'),{x:width*.8,y:-height*.25,r:12,begin:.32});
        break;
      case 'net-cast':
        depart(from.querySelector('.funds-donut'),{x:width*1.15,y:-height*.35,r:270,s:.4,begin:.15,end:.78});
        select(from,'.funds-ledger-row').forEach((element,i)=>depart(element,{x:-width*.35,y:-height*1.1,r:-12-i*3,rx:45,begin:.08+i*.045,end:.77}));
        depart(from.querySelector('.scene-object'),{x:-width*.7,y:-height,r:-25,s:2,begin:.22,end:.88});
        cast(to.querySelector('.next-step-copy'),{x:-width,y:-height*.8,r:-22,begin:.3});
        arrive(to.querySelector('.next-step-visual img'),{x:width*1.1,y:height*.4,ry:-38,r:13,s:.7,begin:.38});
        arrive(to.querySelector('.next-step-image-label'),{y:height*.6,r:-12,begin:.64});
        break;
      case 'paper-unroll':
        style(to,{zIndex:'5'});
        depart(from.querySelector('.next-step-visual img'),{x:width*.7,y:-height*1.1,r:-18,s:1.15,begin:.14,end:.8});
        clip([['inset(100% 0% 0% 0%)',0],['inset(100% 0% 0% 0%)',.18],['inset(0% 0% 0% 0%)',.88],['inset(0% 0% 0% 0%)',1]]);
        style(to.querySelector('.closing-copy'),{transformOrigin:'0% 0%'});
        arrive(to.querySelector('.closing-copy'),{x:width*.15,y:height*.8,rx:-78,r:7,s:.85,begin:.28});
        break;
      case 'school-finale':
        depart(from.querySelector('.closing-copy'),{x:-width*.25,y:-height,r:-12,rx:20,s:.8,begin:.14,end:.75});
        depart(from.querySelector('.scene-object'),{x:width*.6,y:height,r:60,rx:70,s:.65,begin:.2,end:.82});
        arrive(to.querySelector('.thank-first'),{x:-width,y:-height*.25,r:-18,s:.8,begin:.3});
        arrive(to.querySelector('.thank-you-copy h2>em'),{x:width,y:height*.2,r:18,s:.8,begin:.4});
        arrive(to.querySelector('.closing-lead'),{y:height*.7,r:-5,begin:.58});
        select(to,'.pen-fish').forEach((element,i)=>{
          const distance=width*360/(to.querySelector('.scene-object').clientWidth||340)*1.35;
          queue(element,[{transform:pose({x:-distance,y:(i-1)*280,r:-15}),offset:0},{transform:pose({x:-distance,y:(i-1)*280,r:-15}),offset:.22+i*.07,easing:spring},{transform:pose({x:100,y:-80-i*25,r:8}),offset:.66+i*.06,easing:'ease-in-out'},{transform:pose(),offset:1}]);
        });
        break;
      case 'whirlpool':
        depart(from.querySelector('.closing-copy'),{x:width*.5,y:height,r:25,s:.25,begin:.15,end:.8});
        depart(from.querySelector('.scene-object'),{x:width*1.3,y:-height*.5,r:-24,s:1.8,begin:.1,end:.88});
        arrive(to.querySelector('.hero-copy'),{x:-width*.9,y:-height*.15,r:-14,s:1.35,begin:.25});
        cast(to.querySelector('.hero-art'),{x:width*.7,y:height*.6,r:18,begin:.28});
        break;
      default:
        // Overview and nonadjacent jumps still travel straight to the selected page.
        queue(from,[{transform:pose(),offset:0,easing:spring},{transform:pose({x:-width*.12,y:-height*.1,r:-4,s:.92}),offset:.25,easing:accelerate},{transform:pose({x:-width*1.2,y:-height*.2,r:-8,s:.88}),offset:1}]);
        queue(to,[{transform:pose({x:width,y:height*.15,r:6,s:.9}),offset:0},{transform:pose({x:width,y:height*.15,r:6,s:.9}),offset:.12,easing:spring},{transform:pose({x:-15,y:-5,r:-.4,s:1.015}),offset:.84,easing:'ease-in-out'},{transform:pose(),offset:1}]);
    }
    // Any remaining copy gets a substantial journey too, never an opacity-only cut.
    if(!moving.has(from)) parts(from).forEach((element,i)=>{if(!covered(element))depart(element,{x:-width*.85,y:-height*.45,r:-8,begin:.1+Math.min(i*.035,.12),end:.76});});
    if(!moving.has(to)) parts(to).forEach((element,i)=>{if(!covered(element))arrive(element,{x:width*.7,y:height*.45,r:7,begin:.34+Math.min(i*.035,.2)});});
    const art=to.querySelector('.scene-object');
    if(art&&!covered(art)&&getComputedStyle(art).visibility!=='hidden')arrive(art,{x:width*.5,y:height*.65,r:-18,s:.55,begin:.48});
    const oldArt=from.querySelector('.scene-object');
    if(oldArt&&!covered(oldArt))depart(oldArt,{x:-width,y:height*.4,r:-18,s:1.3,begin:.2,end:.82});
    const oldHeader=from.querySelector('.slide-kicker'),newHeader=to.querySelector('.slide-kicker');
    if(!covered(oldHeader))depart(oldHeader,{x:0,y:-140,r:0,s:1,begin:.1,end:.42});
    if(!covered(newHeader))arrive(newHeader,{x:0,y:-140,r:0,s:1,begin:.6,end:.96});
    finishCut=()=>{swapOnce();animations.forEach(animation=>{try{animation.finish();}catch{}});};
    plan.forEach(([element,frames])=>animations.push(element.animate(frames,{duration,easing:'linear',fill:'both',direction:reverse?'reverse':'normal'})));
    swapOnce();
    await Promise.all(animations.map(animation=>animation.finished.catch(()=>{})));
  } finally {
    swapOnce();finishCut=undefined;animations.forEach(animation=>animation.cancel());
    outgoing.classList.remove('is-departing');incoming.classList.remove('is-arriving');
    styles.forEach((original,element)=>{if(original===null)element.removeAttribute('style');else element.setAttribute('style',original);});
    overlay.classList.remove('play');overlay.replaceChildren();
  }
}
