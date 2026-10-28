import lure from './art/lure.svg?raw';
import turtle from './art/turtle.svg?raw';

// Scope SVG paint servers when the same illustration appears in consecutive scenes.
function scopedSvg(svg, prefix) {
  return svg.replace(/id="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}-${id})`);
}
export function mountScenes() {
  document.querySelectorAll('.deep-scene').forEach((scene, i) => {
    scene.innerHTML = `<div class="scene-rays"></div><div class="scene-caustics"></div>
      <svg class="reef" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true"><path d="M0 150q80-20 160 5t160-8 170 9 160-15 200 20 150-12v50H0Z" fill="#12383a"/><path d="M90 180v-60m0 15-22-20m22 36 30-30m580 59v-80m0 35-30-20m30 0 20-25m-10 90v-35m-330 35v-50m0 20-20-20m20 5 20-25" stroke="#346864" stroke-width="8" fill="none"/><path d="M830 180q-35-70-10-100m-30 100q-10-60-30-90M200 180q-25-90-8-110m18 110q25-70 15-90" stroke="#285a56" stroke-width="5" fill="none"/></svg>
      <div class="scene-particles" aria-hidden="true">${Array.from({length:20},(_,n)=>`<i style="--x:${(n*37+13)%100}%;--delay:${-n*.7}s;--duration:${8+n%6}s"></i>`).join('')}</div>
      <div class="scene-readout mono"><span><i></i> CAMERA VIEW</span><span>BLUE CATCH</span></div>
      <div class="precision-lure">${scopedSvg(lure,`lure-${i}`)}<div class="lens-ripple"></div></div>
      <div class="precision-turtle">${scopedSvg(turtle,`turtle-${i}`)}</div>
      <div class="species-tracking"><i></i><i></i><i></i><i></i><span class="tracking-line"></span><span class="mono">PROTECTED SPECIES</span></div>
      <div class="scene-status mono" aria-live="polite">${i ? 'HOOKS RETRACTED' : 'HOOKS EXTENDED'}</div>
      <div class="scene-footer mono"><span>CONCEPT VISUALIZATION</span><span class="float-signal"><i></i> FLOAT LIGHT</span></div>`;
  });
}

const marketRows = [
  ['TAM','Total Addressable Market',230000000,'Based on U.S. recreational and commercial fishing assumptions.'],
  ['SAM','Serviceable Available Market',117967200,'Based on 52% serviceability / integration feasibility.'],
  ['SOM','Serviceable Obtainable Market',1179672,'Based on 1% market capture assumption.']
];
const currency = n => '$' + n.toLocaleString('en-US');
export function mountCharts() {
  document.querySelector('#market-chart').innerHTML = `<div class="market-nesting" role="img" aria-label="TAM $230,000,000; SAM $117,967,200; SOM $1,179,672">
    <div class="market-orbit orbit-a"></div><div class="market-orbit orbit-b"></div>
    <div class="market-basin basin-tam"><span class="mono">TAM</span><strong>${currency(230000000)}</strong><small>Total Addressable Market</small></div>
    <div class="market-basin basin-sam"><span class="mono">SAM</span><strong>${currency(117967200)}</strong><small>Serviceable Available Market</small></div>
    <div class="market-basin basin-som"><span class="mono">SOM</span><strong>${currency(1179672)}</strong><small>Serviceable Obtainable Market</small></div>
  </div><div class="market-ledger">${marketRows.map(([key,label,value,description],i)=>`<div class="market-ledger-row" style="--row:${i}"><span class="ledger-key mono">${key}</span><div><h3>${key} – ${label}</h3><strong data-count="${value}">${currency(value)}</strong><p>${description}</p></div><span class="ledger-dot dot-${key.toLowerCase()}"></span></div>`).join('')}</div>`;
  const items = [
    ['Materials',357268,'Cameras, AI chips, screens and rod components','#224f4b'],
    ['Labor & manufacturing',153115,'Rod assembly and system integration','#82b6a4'],
    ['Marketing',126000,'Online advertising and offline promotions','#f16c40'],
    ['Operations & distribution',101266,'Rent, storage, packaging, shipping and fees','#c5d8bc']
  ];
  let start = -90;
  const paths=items.map(([label,value,,color],i)=>{
    const sweep=value/737649*360;
    const point=angle=>[260+184*Math.cos(angle*Math.PI/180),260+184*Math.sin(angle*Math.PI/180)];
    const a=point(start+1),b=point(start+sweep-1);
    const d=`M${a.join(' ')}A184 184 0 ${sweep>180?1:0} 1 ${b.join(' ')}`;
    start+=sweep;
    return `<path class="fund-arc" d="${d}" stroke="${color}" pathLength="1" style="--arc:${i}" data-label="${label}" aria-label="${label}: ${currency(value)}"/>`;
  }).join('');
  document.querySelector('#funds-chart').innerHTML = `<div class="funds-donut"><svg viewBox="0 0 520 520" role="img" aria-label="Planned spending: $737,649. Materials $357,268; labor and manufacturing $153,115; marketing $126,000; operations and distribution $101,266."><circle class="fund-track" cx="260" cy="260" r="184"/>${paths}<circle class="funds-inner-orbit" cx="260" cy="260" r="140"/></svg><div class="donut-center"><span class="mono">PLANNED SPENDING</span><strong data-count="737649">$737,649</strong><span>Blue Catch</span></div><span class="donut-coordinate mono">2025 / PROJECTED SPENDING</span></div>
    <div class="funds-ledger">${items.map(([label,value,description,color],i)=>`<div class="funds-ledger-row" style="--row:${i};--fund-color:${color}"><span class="funds-swatch"></span><div><h3>${label}</h3><p>${description}</p></div><strong data-count="${value}">${currency(value)}</strong></div>`).join('')}</div>`;
}
