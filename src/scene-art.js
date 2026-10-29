// Small, transparent vector sets. The same objects live in the scene and carry its cut.
const fish = (x, y, size = 1, accent = false) => `<g data-part="fish" transform="translate(${x} ${y}) scale(${size})"><g class="art-swimmer ${accent ? 'art-accent' : ''}"><path class="art-fill" d="M-38 0C-15-27 21-25 42 0 21 25-15 27-38 0L-59-18v36Z"/><path class="art-line" d="M8-17Q-1 0 8 17M-27 0H-7M-7-19l9-12 15 13"/><circle class="art-eye" cx="26" cy="-3" r="2.6"/></g></g>`;
const waves = `<path class="art-line art-current" d="M12 194q42-16 84 0t84 0 84 0 84 0M27 211q42-16 84 0t84 0 84 0"/>`;
const boat = (x, y, size = 1) => `<g data-part="boat" transform="translate(${x} ${y}) scale(${size})"><g class="art-bob"><path class="art-fill" d="M-48 8h103L39 32h-69Z"/><path class="art-line" d="M-23 8v-32h37V8m-19-32v-24h35v56M3-48v-21m0 9 23 9H3M-39 22h74"/><circle class="art-port" cx="-11" cy="-9" r="4"/><circle class="art-port" cx="22" cy="-9" r="4"/></g></g>`;

const art = {
  school: `${fish(105, 81, .85)}${fish(237, 124, 1.05, true)}${fish(111, 173, .6)}<path class="art-line art-current" d="M15 114h75m172-36h66M181 197h99"/>`,
  coral: `<g class="art-line art-branches"><path data-draw d="M175 236V113Q175 81 145 64l-32-18M175 143l66-48 35-5M175 195l-67-50-33-4M145 64V28M241 95V54M108 145v-43M175 115l35-59"/><path data-draw d="M175 221l62-43 38-3M237 178v-43M113 46 82 62"/></g>${[ [145,28],[82,62],[75,141],[108,102],[210,56],[241,54],[276,90],[275,175],[237,135] ].map(([x,y],i)=>`<circle data-part="node" class="${i%3 ? 'art-node' : 'art-orange'}" cx="${x}" cy="${y}" r="${i%3 ? 5 : 8}"/>`).join('')}`,
  net: `<g class="art-line art-net" data-part="net"><path d="M66 18q110 46 222 0L251 189q-73 56-148 0Z"/>${[0,1,2,3,4].map(i=>`<path d="M${80+i*48} ${24+i%2*8} ${111+i*31} 198M${80+i*6} ${61+i*28}q95 33 ${196-i*10} 0"/>`).join('')}</g>${fish(178,105,.72,true)}${fish(269,216,.38)}`,
  chip: `<g class="art-line art-circuit">${[0,1,2].map(i=>`<path data-draw d="M${128+i*38} 76V${28+i*9}h${i*13-22}M${128+i*38} 184v${34-i*7}h${22-i*13}M116 ${94+i*30}H${46+i*10}m198 0h${42-i*10}"/>`).join('')}</g><g data-part="chip"><rect class="art-fill" x="116" y="76" width="128" height="108" rx="16"/><rect class="art-line" x="130" y="90" width="100" height="80" rx="8"/>${fish(180,130,.53,true)}</g>`,
  lure: `<path class="art-line" data-draw d="M178 0q-52 20-3 55t3 50"/><g data-part="lure" class="art-bob"><path class="art-fill" d="M180 96q-50 42-20 91l20 16 20-16q30-49-20-91Z"/><path class="art-orange" d="M154 132q26-30 52 0l-7 16h-38Z"/><circle class="art-lens" cx="180" cy="165" r="14"/><circle class="art-eye" cx="180" cy="165" r="6"/><path class="art-line" d="M168 196v23q-18 17-22-2m46-21v23q18 17 22-2"/></g><path class="art-line art-current" d="M44 206h75m121 0h78M66 222h49m136 0h39"/>`,
  sonar: `<g class="art-line art-sonar">${[47,81,115].map(r=>`<circle data-part="ring" cx="180" cy="130" r="${r}"/>`).join('')}<path d="M54 130h252M180 4v252" opacity=".3"/></g><path class="art-line art-scan" d="M180 130 267 55"/><circle class="art-orange" cx="238" cy="92" r="7"/>${fish(180,130,.6)}`,
  turtle: `<g data-part="turtle" class="art-swimmer"><path class="art-fill" d="M110 113q-19-71 24-75l24 69m-38 42q-28 58 3 69l31-54m71-48q-5-65-40-75l-6 68m42 44q-2 60-30 67l-11-54"/><ellipse class="art-fill" cx="171" cy="133" rx="67" ry="48"/><path class="art-line" d="m148 98 40 1 23 30-20 33h-42l-23-32Zm0 0-17-9m57 10 14-12m9 42 25-2m-45 35 13 13m-55-13-16 13m-7-45-22-1"/><path class="art-fill" d="M232 119q48-29 61 1t-57 26"/><circle class="art-eye" cx="276" cy="124" r="3"/><path class="art-line" d="m107 130-24 8 25 7"/></g>${waves}`,
  route: `<path data-draw class="art-line art-route" d="M31 208C65 76 160 243 183 133S276 10 327 68"/>${[[31,208],[183,133],[327,68]].map(([x,y],i)=>`<circle class="${i===1?'art-orange':'art-node'}" cx="${x}" cy="${y}" r="8"/>`).join('')}<g data-part="compass" transform="translate(90 71)"><circle class="art-line" r="38"/><path class="art-fill" d="m-12 18 12-44L12 18 0 10Z"/><path class="art-orange" d="M0-26v36L12 18Z"/></g>`,
  fleet: `${boat(104,130,.83)}${boat(253,155,.65)}${boat(209,71,.45)}${waves}`,
  listening: `<g data-part="listening"><path class="art-fill" d="M155 43a26 26 0 0 1 52 0v88a26 26 0 0 1-52 0Z"/><path class="art-line" d="M137 110v20a44 44 0 0 0 88 0v-20m-44 64v38m-30 0h60m-45-144h29m-29 16h29"/></g>${[0,1,2,3].map(i=>`<path data-part="sound" class="art-line art-sound" style="--part:${i}" d="M${113-i*20} ${91-i*11}q${-13-i*2} ${28+i*11} 0 ${56+i*22}m${136+i*40} ${-56-i*22}q${13+i*2} ${28+i*11} 0 ${56+i*22}"/>`).join('')}`,
  focus: `<g class="art-line" data-part="focus"><path d="M57 92V42h50m146 0h50v50m0 76v50h-50m-146 0H57v-50"/><circle cx="180" cy="130" r="69"/><circle cx="180" cy="130" r="50"/></g>${fish(180,130,.72,true)}<path class="art-line art-scan" d="M121 130h118"/>`,
  shield: `<path data-draw class="art-fill" d="M180 24q-45 31-91 24v78q0 69 91 109 91-40 91-109V48q-46 7-91-24Z"/><path class="art-line" d="M180 40q-40 25-74 24v60q0 55 74 92 74-37 74-92V64q-34 1-74-24Z"/>${fish(178,119,.75,true)}<path data-draw class="art-line art-check" d="m155 172 16 14 34-32"/>`,
  funds: `${[ [103,170],[179,135],[256,94] ].map(([x,y],i)=>`<g data-part="coin" transform="translate(${x} ${y})"><path class="art-fill" d="M-29 0v${32+i*15}c0 18 58 18 58 0V0"/>${[0,1,2].map(n=>`<path class="art-line" d="M-29 ${14+n*11}c0 18 58 18 58 0"/>`).join('')}<ellipse class="${i===1?'art-orange':'art-fill'}" rx="29" ry="12"/><path class="art-line" d="M-12-1h24"/></g>`).join('')}<path data-draw class="art-line art-route" d="m64 99 94-40 49 11 75-46m-29 0h29v29"/>`
};

export function sceneArt(kind) {
  return `<svg viewBox="0 0 360 260" fill="none" aria-hidden="true">${art[kind] || art.school}</svg>`;
}

export function mountSceneArt(slide, kind, placement) {
  const object = document.createElement('div');
  object.className = `scene-object object-${kind} placement-${placement}`;
  object.setAttribute('aria-hidden', 'true');
  object.innerHTML = sceneArt(kind);
  slide.append(object);
  return object;
}
