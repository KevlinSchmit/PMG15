import './style.css';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduceMotion.matches;

const marketContent = {
  tam: {
    label: 'TOTAL ADDRESSABLE MARKET',
    value: '$230,000,000',
    description: 'Based on U.S. recreational and commercial fishing assumptions.',
    html: `<h3>TAM - Total Addressable Market</h3>
      <div class="market-text-grid"><div><p>As our products currently targets to U.S market, number of people who participates in the recreational fishing industry and the number of people who employs in the commercial fishing industry is taking into accountability for the calculation of the total addressable market.</p>
      <ul><li>57 Million U.S. Citizens participated in recreational fishing until 2025</li><li>51,902 U.S. Citizens are employed in the commercial fishing industry until 2025</li></ul></div>
      <div><h4>Assumptions:</h4><ul><li>Assuming 20% of the people who once fished is an amateur angler</li><li>Assuming 10% of the amateur angler would purchase our product</li><li>Assuming 30% of the commercial angler would purchase our product</li><li>Assuming all customer would spend 199$ annually on our product (the retail price of a fishing rod)</li></ul></div></div>
      <div class="calculation"><small>Calculations:</small>TAM = (5700,000,0 * 0.2 * 0.1 + 51902 * 0.3) * 199 = <strong>$ 230,000,000</strong></div>`
  },
  sam: {
    label: 'SERVICEABLE AVAILABLE MARKET',
    value: '$117,967,200',
    description: 'Based on 52% serviceability / integration feasibility.',
    html: `<h3>SAM - Serviceable Available Market</h3>
      <div class="market-text-grid"><div><p><b>Total number of potential customers:</b> 1.14 million - Established based on previous assumption</p><p><b>Average Annual Revenue per Customer:</b> $199 - The retail price of a single fishing rod</p><h4>Percentage of Customers we can serve:</h4><p>The statistics of serviceable customers in the market is highly dependent on the availability of the technology. Our product makes usage of a combination of three types of exponential technology: Artificial Intelligence, Miniaturized camera technology, and Real-time 3D visualization</p></div>
      <div><h4>Assumptions:</h4><ul><li>Existing technology of AI tool - Fishial - has an identification ability of detecting over 865 types of fish, while real life oceanic environment is still needed to be trained. Percentage availability: 70%</li><li>Waterproof, high resolution, and mini underwater camera is highly available, but short delay of image still needs to be explored. Percentage availability: 76%</li><li>Mature technology like Apple AR Quick look can demonstrate 3D models. Percentage availability: 90%</li></ul></div></div>
      <div class="calculation"><small>Calculation: (70% + 76% + 90%) / 3 = 52%</small>SAM = 1,140,000 customers * $199 * 52% = <strong>$ 117,967,200</strong></div>`
  },
  som: {
    label: 'SERVICE OBTAINABLE MARKET',
    value: '$1,179,672',
    description: 'Based on 1% market capture assumption.',
    html: `<h3>SOM - Service Obtainable Market</h3>
      <div class="market-text-grid"><div><p><b>Number potential customers:</b> 1.14 million / <b>Average Annual Revenue per Customer:</b> $199</p><p><b>Percentage of Customers we can serve:</b> 52%</p><h4>Percentage of market you can capture:</h4><p>The capture rate is calculated by using the percentage of potential customers who has the desire to purchase over the total number who had the opportunity.</p></div>
      <div><p>To this end, based on our estimated production, distribution, and early adoption capacity, we assume that 5,000 customers would purchase our product annually in the first three years. Therefore, percentage of market captured is calculated by:</p><p>5000 / 592800 = 0.84%</p><p>Rounding up the percentage to 1%, the number for our SOM is:</p></div></div>
      <div class="calculation">SOM = 1,140,000 * 52% * 1% * $199 = <strong>$1,179,672</strong></div>`
  }
};

function selectMarket(key) {
  const content = marketContent[key];
  if (!content) return;
  $$('[data-market]').forEach(button => {
    const active = button.dataset.market === key;
    button.classList.toggle('active', active);
    if (button.matches('[role="tab"]')) {
      button.setAttribute('aria-selected', active);
      button.tabIndex = active ? 0 : -1;
    } else button.setAttribute('aria-pressed', active);
  });
  $('#market-label').textContent = content.label;
  $('#market-value').textContent = content.value;
  $('#market-description').textContent = content.description;
  const panel = $('#market-panel');
  panel.innerHTML = content.html;
  panel.setAttribute('aria-labelledby', `tab-${key}`);
  panel.classList.remove('panel-enter');
  void panel.offsetWidth;
  panel.classList.add('panel-enter');
}
$$('[data-market]').forEach(button => button.addEventListener('click', () => selectMarket(button.dataset.market)));
selectMarket('tam');
$('#market-detail-link').addEventListener('click', () => $('#market-detail').scrollIntoView({ behavior: paused ? 'instant' : 'smooth', block: 'start' }));

const interviews = [
  {
    label: '#1 Interviewee: professional fisher / Interview date: September 26, 2026',
    points: [
      'Agreed the idea of using a camera and AI to identify fish before they are hooked is really useful',
      'He liked that the system would immediately retract the hooks when it detects a protected species rather than relying on humans to recognize the animal after the damage already happened.',
      'However, he was concerned about how accurately the AI could identify fish underwater, especially in low-light conditions. In addition, he was more interested if the product offered everyday fishing benefits.'
    ]
  },
  {
    label: '#2: Interviewee: occasional fisher / Interview date: September 27, 2026',
    points: [
      'The interviewee doesn’t fish too often, but she liked how the concept adds a layer of education to fishing.',
      'She thought showing the protected fishes on screen with 3D models and fun facts could make fishing more interesting for people who are not experienced anglers.',
      'concerned that the technology might be complicated for people who are not familiar with more technical devices (such as seniors), so she suggested making the interface simple and easy to understand.'
    ]
  },
  {
    label: '#3: Interviewee: amateur fishing hobbyist / Interview date: September 29, 2026',
    points: [
      'Passionate about fishing and is interested in the concept. He has personal experience on the issue, where he had accidentally caught an endangered species while fishing and had to set it free, though it was already injured and likely had a hard time surviving afterwards.',
      'Interviewee also mentioned that he would prefer to see the camera’s view on the screen, as it would help him see if there is actually any fish in that location.'
    ]
  }
];
function selectInterview(index) {
  const interview = interviews[index];
  const panel = $('#interview-panel');
  panel.replaceChildren();
  const title = document.createElement('p'); title.className = 'mono'; title.textContent = interview.label;
  const list = document.createElement('ul');
  interview.points.forEach(text => { const item = document.createElement('li'); item.textContent = text; list.append(item); });
  panel.append(title, list);
  panel.setAttribute('aria-labelledby', `interview-tab-${index}`);
  panel.classList.remove('panel-enter'); void panel.offsetWidth; panel.classList.add('panel-enter');
  $$('[data-interview]').forEach(button => {
    const active = Number(button.dataset.interview) === index;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active);
    button.tabIndex = active ? 0 : -1;
  });
}
$$('[data-interview]').forEach(button => button.addEventListener('click', () => selectInterview(Number(button.dataset.interview))));
selectInterview(0);

// All tab lists support the standard arrow-key / Home / End interactions.
$$('[role="tablist"]').forEach(list => list.addEventListener('keydown', event => {
  const tabs = $$('[role="tab"]', list);
  const current = tabs.indexOf(document.activeElement);
  if (current === -1) return;
  let next;
  if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (current + 1) % tabs.length;
  if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (current - 1 + tabs.length) % tabs.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = tabs.length - 1;
  if (next !== undefined) { event.preventDefault(); tabs[next].focus(); tabs[next].click(); }
}));

$$('[data-demo]').forEach(button => button.addEventListener('click', () => {
  const state = button.dataset.demo;
  $('.underwater-demo').dataset.state = state;
  $('.demo-state').textContent = state === 'protected' ? 'HOOKS RETRACTED' : 'HOOKS EXTENDED';
  $$('[data-demo]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', active); });
}));
// Decorative bubbles are deterministic, so the same scene is shown on each visit.
for (let i = 0; i < 16; i++) {
  const bubble = document.createElement('span');
  bubble.style.left = `${(i * 37 + 9) % 100}%`;
  bubble.style.animationDelay = `${-i * 1.3}s`;
  bubble.style.animationDuration = `${7 + i % 5}s`;
  $('.water-particles').append(bubble);
}

function setMotion(value) {
  paused = value;
  document.body.classList.toggle('motion-paused', paused);
  document.documentElement.style.scrollBehavior = paused ? 'auto' : '';
  const button = $('.motion-toggle');
  button.setAttribute('aria-pressed', paused);
  button.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
  button.innerHTML = `<span class="pause-icon">${paused ? '▷' : 'Ⅱ'}</span> MOTION ${paused ? 'OFF' : 'ON'}`;
  try { localStorage.setItem('blue-catch-motion', paused ? 'off' : 'on'); } catch {}
}
try { paused = localStorage.getItem('blue-catch-motion') === 'off' || reduceMotion.matches; } catch {}
setMotion(paused);
$('.motion-toggle').addEventListener('click', () => setMotion(!paused));
reduceMotion.addEventListener('change', event => { if (event.matches) setMotion(true); });

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
}, { threshold: 0.06, rootMargin: '0px 0px -15px 0px' });
$$('.reveal').forEach(element => revealObserver.observe(element));
document.documentElement.classList.add('js-ready');

const chapters = $$('.chapter');
let activeChapter = 0;
let scrollTicking = false;
function updateScroll() {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  $('.reading-progress').style.transform = `scaleX(${scrollable > 0 ? scrollY / scrollable : 0})`;
  let current = 0;
  chapters.forEach((chapter, i) => { if (chapter.getBoundingClientRect().top < innerHeight * .45) current = i; });
  activeChapter = current;
  $$('.chapter-rail a').forEach((link, i) => {
    link.classList.toggle('active', i === current);
    if (i === current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
  scrollTicking = false;
}
window.addEventListener('scroll', () => { if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(updateScroll); } }, { passive: true });
updateScroll();

const menuToggle = $('.menu-toggle');
menuToggle.addEventListener('click', () => {
  const open = $('.site-header').classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', open);
  menuToggle.setAttribute('aria-label', open ? 'Close chapter menu' : 'Open chapter menu');
});
$$('.site-header nav a').forEach(link => link.addEventListener('click', () => {
  $('.site-header').classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', false);
  menuToggle.setAttribute('aria-label', 'Open chapter menu');
}));

// Native dialogs retain focus, trap it while open, and restore it to the trigger.
const imageDialog = $('.image-dialog');
const deckDialog = $('.deck-dialog');
let dialogTrigger;
function showDialog(dialog, trigger) {
  dialogTrigger = trigger;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
$$('dialog').forEach(dialog => {
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    dialogTrigger?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
let zoom = 1;
let baseImageWidth = 0;
let baseImageHeight = 0;
function fitImage() {
  const img = $('#dialog-image');
  const stage = $('.image-stage');
  if (!img.naturalWidth) return;
  const ratio = Math.min((stage.clientWidth - 50) / img.naturalWidth, (stage.clientHeight - 50) / img.naturalHeight, 1);
  baseImageWidth = img.naturalWidth * ratio;
  baseImageHeight = img.naturalHeight * ratio;
  applyZoom();
}
function applyZoom() {
  const img = $('#dialog-image');
  img.style.width = `${baseImageWidth * zoom}px`;
  img.style.height = `${baseImageHeight * zoom}px`;
  img.style.maxHeight = 'none';
  $('#zoom-level').textContent = `${Math.round(zoom * 100)}%`;
  $('#zoom-out').disabled = zoom <= 1;
  $('#zoom-in').disabled = zoom >= 4;
}
$$('[data-image]').forEach(button => button.addEventListener('click', () => {
  zoom = 1;
  const img = $('#dialog-image');
  img.style.width = ''; img.style.height = '';
  img.alt = button.dataset.caption;
  $('#image-caption').textContent = button.dataset.caption;
  img.onload = fitImage;
  img.src = button.dataset.image;
  showDialog(imageDialog, button);
  if (img.complete) fitImage();
}));
$('#zoom-in').addEventListener('click', () => { zoom = Math.min(4, zoom + .5); applyZoom(); });
$('#zoom-out').addEventListener('click', () => { zoom = Math.max(1, zoom - .5); applyZoom(); });
window.addEventListener('resize', () => { if (imageDialog.open) fitImage(); });

let deckPage = 1;
const pagePath = number => window.__BLUE_CATCH_PAGES__?.[number - 1] || `/originals/page-${String(number).padStart(2, '0')}.webp`;
for (let i = 1; i <= 23; i++) {
  const button = document.createElement('button');
  button.setAttribute('aria-label', `Show original page ${i}`);
  button.innerHTML = `<img src="${pagePath(i)}" alt="" loading="lazy"><span>${String(i).padStart(2, '0')}</span>`;
  button.addEventListener('click', () => selectDeckPage(i));
  $('.deck-thumbnails').append(button);
}
function selectDeckPage(number) {
  deckPage = Math.max(1, Math.min(23, number));
  $('#deck-page').src = pagePath(deckPage);
  $('#deck-page').alt = `Original Blue Catch pitch deck page ${deckPage} of 23`;
  $('#deck-position').textContent = `${String(deckPage).padStart(2, '0')} / 23`;
  $('#deck-prev').disabled = deckPage === 1;
  $('#deck-next').disabled = deckPage === 23;
  $$('.deck-thumbnails button').forEach((button, i) => {
    button.classList.toggle('active', i + 1 === deckPage);
    if (i + 1 === deckPage) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  const thumbnail = $$('.deck-thumbnails button')[deckPage - 1];
  thumbnail.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
}
$$('[data-deck]').forEach(button => button.addEventListener('click', () => {
  showDialog(deckDialog, button);
  selectDeckPage(Number(button.dataset.deck));
}));
$('#deck-prev').addEventListener('click', () => selectDeckPage(deckPage - 1));
$('#deck-next').addEventListener('click', () => selectDeckPage(deckPage + 1));

const presentButton = $('.present-button');
function updatePresentationMode() {
  const presenting = !!document.fullscreenElement;
  document.body.classList.toggle('presentation-mode', presenting);
  presentButton.setAttribute('aria-label', presenting ? 'Exit fullscreen presentation' : 'Enter fullscreen presentation');
  $('.present-label').textContent = presenting ? 'EXIT' : 'PRESENT';
}
presentButton.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    // Some embedded browsers block fullscreen; keep a useful distraction-free mode.
    const presenting = document.body.classList.toggle('presentation-mode');
    presentButton.setAttribute('aria-label', presenting ? 'Exit presentation mode' : 'Enter presentation mode');
    $('.present-label').textContent = presenting ? 'EXIT' : 'PRESENT';
  }
});
document.addEventListener('fullscreenchange', updatePresentationMode);
document.addEventListener('keydown', event => {
  if (deckDialog.open) {
    if (event.key === 'ArrowRight') { event.preventDefault(); selectDeckPage(deckPage + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); selectDeckPage(deckPage - 1); }
    return;
  }
  if (imageDialog.open) return;
  if (event.key === 'Escape' && !document.fullscreenElement) {
    document.body.classList.remove('presentation-mode');
    $('.present-label').textContent = 'PRESENT';
    presentButton.setAttribute('aria-label', 'Enter fullscreen presentation');
  }
  // Chapter navigation is deliberately separate from normal vertical scrolling.
  if (event.target.closest('button, a, input, textarea, [role="tablist"], summary')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    const next = Math.max(0, Math.min(chapters.length - 1, activeChapter + (event.key === 'ArrowRight' ? 1 : -1)));
    chapters[next].scrollIntoView({ behavior: paused ? 'instant' : 'smooth' });
  }
});
