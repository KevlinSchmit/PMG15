import './style.css';
import { marketContent, interviews } from './content.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduceMotion.matches;
try { paused ||= localStorage.getItem('blue-catch-motion') === 'off'; } catch {}

// Each calculation and interview is a separate slide, with all original wording.
$$('[data-calculation]').forEach(panel => { panel.innerHTML = marketContent[panel.dataset.calculation].html; });
$$('[data-interview-content]').forEach(panel => {
  const interview = interviews[Number(panel.dataset.interviewContent)];
  const label = document.createElement('p'); label.className = 'interview-label mono'; label.textContent = interview.label;
  const list = document.createElement('ul');
  interview.points.forEach(point => { const item = document.createElement('li'); item.textContent = point; list.append(item); });
  panel.append(label, list);
});

const slides = $$('.slide');
const stage = $('.slide-stage');
const transition = $('.transition-ocean');
let current = 0;
let busy = false;
let animationTimer;
let demoTimer;
let transitionVersion = 0;
const initialSlide = Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) - 1;
if (Number.isInteger(initialSlide) && initialSlide >= 0 && initialSlide < slides.length) current = initialSlide;

function fitStage() {
  const portrait = innerWidth < 700 && innerHeight > innerWidth;
  document.body.classList.toggle('portrait', portrait);
  const width = portrait ? 900 : 1440;
  const height = portrait ? 1400 : 810;
  const controlsHeight = innerWidth < 700 ? 66 : 64;
  const availableHeight = Math.max(100, innerHeight - controlsHeight);
  const scale = Math.min(innerWidth / width, availableHeight / height);
  stage.style.setProperty('--slide-width', `${width}px`);
  stage.style.setProperty('--slide-height', `${height}px`);
  stage.style.setProperty('--slide-scale', scale);
  stage.style.top = `${availableHeight / 2}px`;
}
window.addEventListener('resize', fitStage);
window.visualViewport?.addEventListener('resize', fitStage);
fitStage();

function setDemo(state) {
  $('.underwater-demo').dataset.state = state;
  $('.demo-state').textContent = state === 'protected' ? 'HOOKS RETRACTED' : 'HOOKS EXTENDED';
  $$('[data-demo]').forEach(button => {
    const selected = button.dataset.demo === state;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', selected);
  });
}
function playDemo() {
  clearTimeout(demoTimer);
  setDemo('fishing');
  if (!paused) demoTimer = setTimeout(() => { if (slides[current].id === 'in-action') setDemo('protected'); }, 1500);
}
$$('[data-demo]').forEach(button => button.addEventListener('click', () => { clearTimeout(demoTimer); setDemo(button.dataset.demo); }));
$('#play-sequence').addEventListener('click', playDemo);
for (let i = 0; i < 16; i++) {
  const bubble = document.createElement('span');
  bubble.style.cssText = `left:${(i * 37 + 9) % 100}%;animation-delay:${-i * 1.3}s;animation-duration:${7 + i % 5}s`;
  $('.water-particles').append(bubble);
}

function showSlide(index) {
  slides.forEach((slide, i) => {
    const active = i === index;
    slide.classList.toggle('is-active', active);
    slide.inert = !active;
    slide.setAttribute('aria-hidden', String(!active));
  });
  current = index;
  const slide = slides[current];
  document.body.dataset.theme = slide.dataset.theme;
  $('#slide-position').textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
  $('#slide-title').textContent = slide.dataset.title;
  $('#slide-announcement').textContent = `Slide ${current + 1} of ${slides.length}: ${slide.dataset.title}`;
  $('#previous-slide').disabled = current === 0;
  const next = $('#next-slide');
  const last = current === slides.length - 1;
  next.textContent = last ? '↻' : '→';
  next.setAttribute('aria-label', last ? 'Restart presentation' : 'Next slide');
  next.title = last ? 'Restart presentation' : 'Next slide (Right Arrow or Space)';
  $('.slide-progress').style.transform = `scaleX(${(current + 1) / slides.length})`;
  try { history.replaceState(null, '', `#slide-${current + 1}`); } catch {}
  clearTimeout(demoTimer);
  if (slide.id === 'in-action') playDemo();
  // Decode nearby source art before it appears in a transition.
  for (const neighbour of [slides[current], slides[current + 1]]) {
    if (neighbour) $$('img', neighbour).forEach(image => { image.loading = 'eager'; image.decode?.().catch(() => {}); });
  }
}
function goTo(index) {
  index = Math.max(0, Math.min(slides.length - 1, index));
  if (index === current || busy || document.querySelector('dialog[open]')) return;
  clearTimeout(demoTimer);
  if (paused || reduceMotion.matches) { showSlide(index); return; }
  busy = true;
  const version = ++transitionVersion;
  const backwards = index < current;
  transition.dataset.effect = slides[index].dataset.transition;
  transition.classList.toggle('backwards', backwards);
  transition.classList.remove('play'); void transition.offsetWidth;
  transition.classList.add('play');
  stage.classList.add('changing');
  // Swap the scenes while the illustrated water curtain covers the canvas.
  animationTimer = setTimeout(() => {
    if (version !== transitionVersion) return;
    showSlide(index);
    stage.classList.remove('changing');
    animationTimer = setTimeout(() => {
      if (version !== transitionVersion) return;
      transition.classList.remove('play');
      busy = false;
    }, 470);
  }, 430);
}
showSlide(current);
$('#next-slide').addEventListener('click', () => goTo(current === slides.length - 1 ? 0 : current + 1));
$('#previous-slide').addEventListener('click', () => goTo(current - 1));
$$('[data-next]').forEach(button => button.addEventListener('click', () => goTo(current + 1)));

let lastSwipe = 0;
let touchStart;
$('#presentation').addEventListener('click', event => {
  if (Date.now() - lastSwipe < 450 || event.target.closest('button,a,input,textarea,select,summary,dialog')) return;
  if (window.getSelection()?.toString()) return;
  goTo(current + 1);
});
$('#presentation').addEventListener('touchstart', event => { touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }; }, { passive: true });
$('#presentation').addEventListener('touchend', event => {
  if (!touchStart || event.target.closest('button,a,dialog')) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { lastSwipe = Date.now(); goTo(current + (dx < 0 ? 1 : -1)); }
  touchStart = null;
}, { passive: true });

function setMotion(value) {
  paused = value;
  document.body.classList.toggle('motion-paused', paused);
  const button = $('.motion-toggle');
  button.setAttribute('aria-pressed', String(paused));
  button.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
  button.title = paused ? 'Resume animations' : 'Pause animations';
  button.textContent = paused ? '▷' : 'II';
  if (paused) clearTimeout(demoTimer);
  try { localStorage.setItem('blue-catch-motion', paused ? 'off' : 'on'); } catch {}
}
setMotion(paused);
$('.motion-toggle').addEventListener('click', () => setMotion(!paused));
reduceMotion.addEventListener('change', event => { if (event.matches) setMotion(true); });
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

$$('[data-sources]').forEach(button => button.addEventListener('click', () => showDialog(document.getElementById(button.dataset.sources), button)));
const presentButton = $('.present-button');
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { /* Fullscreen can be blocked in an embedded browser; slides already fill the available view. */ }
}
presentButton.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => {
  const active = !!document.fullscreenElement;
  presentButton.setAttribute('aria-label', active ? 'Exit fullscreen presentation' : 'Enter fullscreen presentation');
  presentButton.title = active ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)';
  fitStage();
});
document.addEventListener('keydown', event => {
  if (event.repeat) return;
  if (deckDialog.open) {
    if (['ArrowRight', ' '].includes(event.key)) { event.preventDefault(); selectDeckPage(deckPage + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); selectDeckPage(deckPage - 1); }
    return;
  }
  if (document.querySelector('dialog[open]')) return;
  if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(); return; }
  // Space activates a focused control natively; it advances the slide everywhere else.
  if (event.key === ' ' && event.target.closest('button,a,summary')) return;
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault(); goTo(current + (event.shiftKey && event.key === ' ' ? -1 : 1));
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault(); goTo(current - 1);
  } else if (event.key === 'Home') { event.preventDefault(); goTo(0); }
  else if (event.key === 'End') { event.preventDefault(); goTo(slides.length - 1); }
});
window.addEventListener('hashchange', () => {
  const target = Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) - 1;
  if (Number.isInteger(target) && target >= 0 && target < slides.length) goTo(target);
});
