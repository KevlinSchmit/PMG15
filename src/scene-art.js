// A shared engraved illustration sheet keeps all small ornaments consistent.
const sheet = '/assets/pen-ornaments.png';
const cells = { net: [0, 0], lure: [1, 0], chip: [2, 0], turtle: [0, 1], coral: [1, 1], compass: [2, 1], coins: [0, 2], boat: [1, 2], lens: [2, 2] };
function engraving(kind, x = 0, y = 0, width = 360, height = 260) {
  const [column, row] = cells[kind];
  return `<svg class="art-engraving" data-detail="${kind}" x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${column * 512} ${row * 1024 / 3} 512 ${1024 / 3}" preserveAspectRatio="xMidYMid meet" style="overflow:hidden"><image href="${sheet}" width="1536" height="1024"/></svg>`;
}
const fish = (x, y, size = 1) => `<g data-part="fish" transform="translate(${x} ${y}) scale(${size})"><g class="art-swimmer pen-fish"><image href="/assets/pen-fish.png" x="-59" y="-23" width="118" height="46" preserveAspectRatio="xMidYMid meet"/></g></g>`;
const water = `<g class="art-line art-current"><path d="M20 222c36-8 58 9 91 1m22 13c38-7 61 8 96-2m27-13c31-6 50 6 79 0"/><path d="M43 232c17-3 29 1 45 0m153 6 28-1" opacity=".6"/></g>`;
const art = {
  school: `${fish(105, 81, .85)}${fish(237, 124, 1.05)}${fish(111, 173, .6)}<g class="art-line art-current"><path d="M15 116c21-6 37 3 58 0m182-40c26-6 45 2 71-2M170 205c25-7 51 6 76-1"/><path d="M27 123c11-2 19 1 31 0m219-42 22-1" opacity=".55"/></g>`,
  net: `<g data-part="net" class="art-bob">${engraving('net', 12, 10, 330, 230)}</g>${water}`,
  lure: `<path class="art-line" d="M180 0c-20 17-31 38-9 48 12 5 21 9 16 22"/> <g data-part="lure" class="art-bob">${engraving('lure', 30, 32, 300, 200)}</g>${water}`,
  chip: `${engraving('chip', 20, 15, 320, 225)}<path class="art-line art-circuit" d="M35 233h35v-13m250-174h-21V30" opacity=".45"/>`,
  coral: `${engraving('coral', 20, 5, 320, 245)}`,
  turtle: `<g data-part="turtle" class="art-swimmer">${engraving('turtle', 20, 5, 320, 232)}</g>${water}`,
  route: `${engraving('compass', 26, 3, 250, 193)}<path class="art-line art-route" d="M45 232c70-84 116 45 180-19s83-71 105-30"/><circle class="art-node" cx="45" cy="232" r="3"/><circle class="art-node" cx="330" cy="183" r="3"/>`,
  fleet: `${engraving('boat', 8, 73, 227, 160)}${engraving('boat', 180, 104, 170, 120)}${engraving('boat', 138, 3, 137, 97)}${water}`,
  focus: `${engraving('lens', 44, 22, 272, 204)}<path class="art-line" d="M27 72V25h45m216 0h45v47m0 115v47h-45m-216 0H27v-47" opacity=".45"/>`,
  sonar: `${engraving('lens', 28, 9, 304, 228)}<path class="art-line art-scan" d="M180 130 250 65" opacity=".45"/>`,
  funds: `${engraving('coins', 13, 33, 334, 220)}<path class="art-line art-route" d="M51 62c50-46 93 4 144-19s71-30 102-31m-20 0 20 0-2 20"/>`,
  model: `<g class="art-line detail-wireframe"><path d="m180 31 118 63v118l-118 46-118-46V94Zm0 113L62 94m118 50 118-50m-118 50v114M100 74l118 65v104M141 52l117 64v111M62 133l118 61 118-61M62 173l118 61 118-61"/><path d="m180 31 3 4m-62 134 16-24 42 21-15 26ZM222 96l27 15-20 20-26-15Z" opacity=".6"/><path d="m70 104 12 6m-12 4 18 10m-18-1 25 13m-25-3 31 17m-31-5 31 16m92 34 90-42m-90 53 90-43m-90 54 90-43" opacity=".4"/></g>`,
  shield: `${engraving('turtle', 46, 21, 268, 202)}<path class="art-line" d="M180 10c-41 28-89 31-133 26v97c0 62 63 102 133 126 70-24 133-64 133-126V36c-44 5-92 2-133-26Z"/>`,
  listening: `${engraving('lens', 44, 22, 272, 204)}`
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
export function mountDetailIcons() {
  const subjects = ['chip', 'focus', 'model'];
  document.querySelectorAll('#drivers .driver-icon').forEach((icon, index) => {
    icon.innerHTML = sceneArt(subjects[index]);
  });
}
