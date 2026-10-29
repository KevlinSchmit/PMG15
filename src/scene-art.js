import atlas from './art/motion-objects.png';
import lure from './art/lure.svg?raw';
import turtle from './art/turtle.svg?raw';

export const atlasRegions = { boat: [0, 0, 748, 548], camera: [748, 56, 532, 520], microphone: [130, 580, 460, 660], reel: [650, 585, 630, 640] };
const photo = kind => {
  const [x,y,w,h] = atlasRegions[kind];
  const width = kind === 'boat' ? 352 : 210;
  const height = Math.min(242, width * h / w);
  return `<svg x="${180-width/2}" y="${130-height/2}" width="${width}" height="${height}" viewBox="${x} ${y} ${w} ${h}"><image href="${atlas}" width="1280" height="1280"/></svg>`;
};
const defs = `<defs><linearGradient id="metal" x2=".8" y2="1"><stop stop-color="#d4e1de"/><stop offset=".23" stop-color="#f3f6ed"/><stop offset=".4" stop-color="#7a9b97"/><stop offset=".6" stop-color="#d2ddda"/><stop offset="1" stop-color="#274c50"/></linearGradient><linearGradient id="dark" x2=".7" y2="1"><stop stop-color="#4c7d7d"/><stop offset=".35" stop-color="#173e48"/><stop offset=".7" stop-color="#285c64"/><stop offset="1" stop-color="#0e2632"/></linearGradient><radialGradient id="glass"><stop stop-color="#427c87"/><stop offset=".4" stop-color="#122f40"/><stop offset=".8" stop-color="#071c2c"/><stop offset="1" stop-color="#6c989b"/></radialGradient><linearGradient id="orange" x2=".3" y2="1"><stop stop-color="#ffb77a"/><stop offset=".4" stop-color="#ed7852"/><stop offset="1" stop-color="#b6452c"/></linearGradient><pattern id="mesh" width="16" height="16" patternUnits="userSpaceOnUse"><path d="m0 8 8-8 8 8-8 8Z" fill="none" stroke="#82a7a0" stroke-width=".85"/></pattern><pattern id="knurl" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h1v4H0Z" fill="#e2ece5" opacity=".22"/></pattern></defs>`;
const screw = (x,y) => `<circle cx="${x}" cy="${y}" r="3.5" fill="url(#metal)" stroke="#254548"/><path d="m${x-1.5} ${y+1.5} 3-3" stroke="#23454a"/>`;
const lens = `<circle cx="180" cy="130" r="77" fill="url(#dark)" stroke="url(#metal)" stroke-width="7"/><circle cx="180" cy="130" r="63" fill="url(#glass)" stroke="#cc8759" stroke-width="3"/><circle cx="180" cy="130" r="40" fill="#122e3d" stroke="#709592"/><ellipse cx="166" cy="111" rx="20" ry="11" fill="#d2f3e9" opacity=".15"/>`;
const hardware = {
  pin: `<path d="m179 151 5 76" stroke="url(#metal)" stroke-width="6"/><path d="M127 77q0-55 53-55t53 55c0 34-53 90-53 90s-53-56-53-90Z" fill="url(#orange)" stroke="#9f4e38"/><circle cx="180" cy="75" r="23" fill="url(#metal)"/><circle cx="180" cy="75" r="15" fill="url(#dark)"/>`,
  cable: `<g fill="none" stroke="url(#metal)" stroke-width="5"><path d="M25 180h90V70h90v80h130"/><path d="M25 200h110V90h50v80h150"/></g><g fill="url(#dark)">${[25,335].map(x=>`<rect x="${x-12}" y="164" width="24" height="45" rx="5"/>`).join('')}</g><g fill="#ed8058"><circle cx="115" cy="70" r="6"/><circle cx="205" cy="150" r="6"/></g>`,
  net: `<path d="M65 28q115 35 230 0L270 196q-90 66-180 0Z" fill="url(#mesh)" stroke="url(#metal)" stroke-width="5"/><path d="M65 28q115 35 230 0" fill="none" stroke="#cfbfa0" stroke-width="6"/>${[0,1,2,3,4,5,6].map(i=>`<ellipse cx="${68+i*37}" cy="${31+Math.sin(i/6*Math.PI)*17}" rx="9" ry="6" fill="url(#orange)" stroke="#91553c"/>`).join('')}`,
  chip: `<rect x="85" y="43" width="190" height="174" rx="11" fill="url(#dark)" stroke="#7b9b94" stroke-width="2"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${108+i*21} 44V28m0 189v16M85 ${61+i*20}H68m207 0h17" stroke="url(#metal)" stroke-width="8"/>`).join('')}<rect x="112" y="72" width="136" height="114" rx="5" fill="url(#metal)"/><rect x="126" y="85" width="108" height="88" rx="3" fill="url(#dark)"/><path d="M147 152V106h66v46Z" fill="none" stroke="#a9c9bf"/><circle cx="244" cy="58" r="4" fill="#f38a55"/>${screw(97,55)}${screw(263,204)}`,
  compass: `<circle cx="180" cy="130" r="102" fill="url(#dark)" stroke="url(#metal)" stroke-width="12"/><circle cx="180" cy="130" r="86" fill="#dce5da"/>${Array.from({length:36},(_,i)=>`<path d="M180 48v${i%3?5:11}" transform="rotate(${i*10} 180 130)" stroke="#496e65"/>`).join('')}<g data-mechanism="needle"><path d="m180 58-15 72 15 72 15-72Z" fill="url(#metal)"/><path d="m180 58-15 72h30Z" fill="url(#orange)"/><circle cx="180" cy="130" r="7" fill="url(#dark)"/></g>`,
  rings: `<g fill="none" stroke="url(#metal)"><circle cx="180" cy="130" r="108" stroke-width="4"/><circle cx="180" cy="130" r="78" stroke-width="9"/><circle cx="180" cy="130" r="45" stroke="#df845a" stroke-width="10"/></g><circle cx="180" cy="130" r="23" fill="url(#dark)"/>`,
  sonar: `${lens}<path d="M180 130 226 87" stroke="#c2dfb5" stroke-width="3"/><path d="M180 67v126m-63-63h126" stroke="#a4bcb4" opacity=".4"/><circle cx="211" cy="102" r="4" fill="#ed8058"/>`,
  book: `<path d="M40 58q70-20 140 8 70-28 140-8v160q-70-20-140 3-70-23-140-3Z" fill="url(#dark)" stroke="#234645" stroke-width="3"/><path d="M48 49q68-14 132 14 64-28 132-14v158q-64-17-132 9-68-26-132-9Z" fill="#e8eadc" stroke="#b7c1b2"/><path d="M180 63v153" stroke="#9aa897" stroke-width="3"/>${[0,1,2,3,4,5,6].map(i=>`<path d="M63 ${78+i*16}q49-3 98 12m37-2q49-13 98-10" stroke="#aab8a6" stroke-width="1.1"/>`).join('')}`,
  funnel: `<path d="M56 42h248L208 158v57l-56 21v-78Z" fill="url(#metal)" stroke="#78958d" stroke-width="2"/><ellipse cx="180" cy="42" rx="124" ry="21" fill="url(#dark)" stroke="#b7ccc3" stroke-width="4"/><ellipse cx="180" cy="41" rx="105" ry="13" fill="#173e42"/>`,
  target: `${lens}<g fill="none" stroke="#d8e8cd" stroke-width="2"><path d="M74 81V39h43m126 0h43v42m0 98v42h-43m-126 0H74v-42"/></g>`,
  gate: `<rect x="53" y="26" width="254" height="211" rx="10" fill="url(#dark)" stroke="url(#metal)" stroke-width="8"/><rect x="70" y="43" width="220" height="176" fill="url(#mesh)"/>${[0,1,2,3,4,5,6].map(i=>`<path d="M${86+i*31} 44v174" stroke="url(#metal)" stroke-width="4"/>`).join('')}${screw(62,37)}${screw(297,226)}`,
  scale: `<path d="M121 229h118l-21-13h-76Z" fill="url(#dark)"/><path d="M180 214V45" stroke="url(#metal)" stroke-width="10"/><g data-mechanism="beam"><path d="M83 74h194" stroke="url(#metal)" stroke-width="10"/><path d="m83 74-33 89h66Zm194 0-33 89h66Z" fill="none" stroke="#9aac9e" stroke-width="2"/><path d="M43 163h80q-40 53-80 0m194 0h80q-40 53-80 0" fill="url(#dark)" stroke="url(#metal)" stroke-width="2"/><circle cx="180" cy="74" r="13" fill="url(#orange)"/></g>`,
  beacon: `<path d="M140 226h80l-10-121h-60Z" fill="url(#dark)" stroke="url(#metal)" stroke-width="3"/><path d="M139 107v-38a41 41 0 0 1 82 0v38Z" fill="url(#orange)" stroke="#ba7756" stroke-width="3"/><path d="M132 106h96" stroke="url(#metal)" stroke-width="7"/><path d="M149 69h62m-62 12h62m-62 12h62" stroke="#ffe1ad" opacity=".4"/>`,
  check: `<rect x="73" y="31" width="214" height="199" rx="15" fill="url(#dark)" stroke="url(#metal)" stroke-width="5"/>${[0,1,2].map(i=>`<path d="m104 ${73+i*57} 12 13 23-28" fill="none" stroke="#b9d7a5" stroke-width="6"/><path d="M159 ${75+i*57}h97" stroke="#6e9790" stroke-width="4"/>`).join('')}`,
  shield: `<path d="M180 20q-48 32-103 27v86q5 66 103 110 98-44 103-110V47q-55 5-103-27Z" fill="url(#dark)" stroke="url(#metal)" stroke-width="8"/><path d="M180 37q-42 27-85 26v68q6 55 85 93 79-38 85-93V63q-43 1-85-26Z" fill="none" stroke="#70988f" stroke-width="2"/><path d="m139 130 27 26 55-62" fill="none" stroke="#a9c994" stroke-width="11"/>`,
  buoy: `<path d="M180 175v66" stroke="url(#metal)" stroke-width="3"/><ellipse cx="180" cy="176" rx="69" ry="20" fill="url(#dark)"/><path d="M125 166q0-68 55-101 55 33 55 101Z" fill="url(#orange)" stroke="#b5633f" stroke-width="2"/><path d="M132 128h96l5 22H127Z" fill="url(#metal)"/><path d="M172 67V30h16v37" fill="url(#dark)"/><ellipse cx="180" cy="30" rx="8" ry="5" fill="#b5d5a5"/><path d="M145 100q12-20 22-25" stroke="#ffe1b4" stroke-width="5" opacity=".45"/>`,
  coins: `${[0,1,2].map(i=>`<g transform="translate(${92+i*88} ${167-i*35})"><path d="M-34 0v45q34 24 68 0V0" fill="url(#metal)" stroke="#6d8d7d"/>${[1,2,3,4].map(j=>`<path d="M-34 ${j*9}q34 24 68 0" fill="none" stroke="#638679"/>`).join('')}<ellipse rx="34" ry="13" fill="${i===1?'url(#orange)':'url(#metal)'}" stroke="#7c9985"/></g>`).join('')}`,
  surface: `<path d="M22 154q55-35 110 0t110 0 100 0" fill="none" stroke="#789e91" stroke-width="3"/><circle cx="180" cy="88" r="42" fill="url(#orange)"/>`
};
function scoped(svg, prefix) {
  return svg.replace(/id="([^"]+)"/g,(_,id)=>`id="${prefix}-${id}"`).replace(/url\(#([^)]+)\)/g,(_,id)=>`url(#${prefix}-${id})`);
}
export function sceneArt(kind, prefix = 'object') {
  if (kind === 'lure' || kind === 'turtle') {
    const raw = kind === 'lure' ? lure : turtle;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="520" viewBox="0 0 360 260" fill="none" aria-hidden="true"><svg x="${kind==='lure'?105:12}" y="5" width="${kind==='lure'?150:336}" height="250" viewBox="${kind==='lure'?'0 0 320 600':'0 0 640 480'}">${scoped(raw.trim().replace(/^<svg[^>]*>|<\/svg>$/g,''),prefix)}</svg></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="520" viewBox="0 0 360 260" fill="none" aria-hidden="true">${scoped(atlasRegions[kind] ? photo(kind) : defs + (hardware[kind] || hardware.target), prefix)}</svg>`;
}
export function mountSceneArt(slide, kind, placement) {
  const object = document.createElement('div');
  object.className = `scene-object object-${kind} placement-${placement}`;
  object.setAttribute('aria-hidden','true');
  object.innerHTML = sceneArt(kind, slide.id);
  slide.append(object);
}
const imageCache = new Map();
let embeddedAtlas;
function canvasAtlas() {
  // SVG images painted to canvas must contain their raster dependencies.
  // Keep the web bundle small, and share one cached PNG fetch between all four cutouts.
  if(atlas.startsWith('data:')) return Promise.resolve(atlas);
  return embeddedAtlas ??= fetch(atlas).then(response=>{
    if(!response.ok) throw new Error('Unable to load motion objects');
    return response.blob();
  }).then(blob=>new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);
  }));
}
export async function motionImage(kind) {
  if (!imageCache.has(kind)) imageCache.set(kind, (async () => {
    const img = new Image();
    const [base, layer] = kind.split(':');
    let markup=sceneArt(base, 'canvas-'+base);
    if(atlasRegions[base]) markup=markup.replaceAll(atlas,await canvasAtlas());
    const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
    const root = doc.documentElement;
    if(layer === 'body') root.querySelectorAll('[data-mechanism]').forEach(node=>node.remove());
    else if(layer) {
      const part = root.querySelector(`[data-mechanism="${layer}"]`);
      const definitions = [...root.querySelectorAll('defs')].map(node=>node.cloneNode(true));
      root.replaceChildren(...definitions, part.cloneNode(true));
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(root));
    await img.decode();
    return img;
  })());
  return imageCache.get(kind);
}
export function warmMotionImages(kinds) { return Promise.all([...new Set(kinds)].map(motionImage)); }
