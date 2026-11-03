import './style.css';
import './problem.css';
import './consumer.css';
import './pitch-legibility.css';
import './product.css';
import './scene.css';
import './charts.css';
import './motion.css';
import './overview.css';
import './ambient.css';
import { mountScenes, mountCharts } from './visuals.js';
import { prepareMotion, enterSlide, stopEntrances, transitionSlides, finishTransition } from './motion.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduceMotion.matches;
// Pause belongs to this viewing session. A previous visit must not silently disable motion.
try { localStorage.removeItem('blue-catch-motion'); } catch {}
mountScenes();
mountCharts();

const slides = $$('.slide');
prepareMotion(slides);
const stage = $('.slide-stage');
const transition = $('.transition-ocean');
let current = 0;
let busy = false;
let sceneTimer;
const initialSlide = Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) - 1;
const refreshed = performance.getEntriesByType('navigation')[0]?.type === 'reload';
if (!refreshed && Number.isInteger(initialSlide) && initialSlide >= 0 && initialSlide < slides.length) current = initialSlide;

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
  clearTimeout(sceneTimer);
  const scene = slide.querySelector('.deep-scene');
  if (scene) {
    scene.dataset.encounter = 'fishing';
    if (slide.id === 'protected-encounter') {
      if (paused) scene.dataset.encounter = 'protected';
      else sceneTimer = setTimeout(() => { scene.dataset.encounter = 'protected'; }, 120);
    }
  }
  enterSlide(slide, current, () => paused || reduceMotion.matches);
  // Decode nearby original diagrams before the next scene is revealed.
  for (const neighbour of [slides[current], slides[current + 1]]) {
    if (neighbour) $$('img', neighbour).forEach(image => { image.loading = 'eager'; image.decode?.().catch(() => {}); });
  }
}
async function goTo(index, { immediate = false } = {}) {
  index = Math.max(0, Math.min(slides.length - 1, index));
  if (immediate && busy) finishTransition();
  if (index === current || (busy && !immediate) || document.querySelector('dialog[open]')) return;
  clearTimeout(sceneTimer);
  stopEntrances();
  if (immediate || paused || reduceMotion.matches) { showSlide(index); return; }
  busy = true;
  document.body.classList.add('is-transitioning');
  try {
    await transitionSlides(slides[current], slides[index], transition, index < current, () => showSlide(index));
  } catch (error) {
    // Always complete navigation even if the browser cannot animate an effect.
    console.error('Slide transition failed:', error);
    showSlide(index);
  } finally {
    busy = false;
    document.body.classList.remove('is-transitioning');
    stage.classList.remove('changing');
  }
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
  if (paused) {
    clearTimeout(sceneTimer);
    stopEntrances();
    finishTransition();
    const scene = slides[current].querySelector('.deep-scene');
    if (scene) scene.dataset.encounter = slides[current].id === 'protected-encounter' ? 'protected' : 'fishing';
  } else enterSlide(slides[current], current, () => paused || reduceMotion.matches);
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

const overviewGrid = $('.deck-overview-grid');
$('#overview-count').textContent = `${slides.length} SLIDES`;
const overviewButtons = slides.map((slide, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'overview-slide';
  button.setAttribute('aria-label', `Go to slide ${index + 1}: ${slide.dataset.title}`);
  button.innerHTML = `<span class="overview-preview"><img alt="" width="480" height="270" loading="lazy"></span><span class="overview-meta"><span class="overview-number mono">${String(index + 1).padStart(2, '0')}</span><span class="overview-title"></span><span class="overview-current mono">CURRENT</span></span>`;
  $('img', button).src = window.__BLUE_CATCH_PREVIEWS__?.[slide.id] || `/assets/slide-previews/${slide.id}.png`;
  $('.overview-title', button).textContent = slide.dataset.title;
  button.addEventListener('click', () => {
    deckDialog.close();
    goTo(index, { immediate: true });
  });
  overviewGrid.append(button);
  return button;
});
$('.overview-toggle').addEventListener('click', event => {
  finishTransition();
  overviewButtons.forEach((button, index) => {
    if (index === current) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  showDialog(deckDialog, event.currentTarget);
  overviewButtons[current].focus({ preventScroll: true });
  overviewButtons[current].scrollIntoView({ block: 'nearest', behavior: 'instant' });
});
overviewGrid.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const index = overviewButtons.indexOf(event.target);
  if (index < 0) return;
  const columns = getComputedStyle(overviewGrid).gridTemplateColumns.split(' ').length;
  const targets = { ArrowRight: index + 1, ArrowLeft: index - 1, ArrowDown: index + columns, ArrowUp: index - columns, Home: 0, End: slides.length - 1 };
  if (!(event.key in targets)) return;
  event.preventDefault();
  overviewButtons[Math.max(0, Math.min(slides.length - 1, targets[event.key]))].focus();
});

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

// Restore visible animation state after back/forward cache navigation.
window.addEventListener('pageshow', event => { if (event.persisted) showSlide(current); });
