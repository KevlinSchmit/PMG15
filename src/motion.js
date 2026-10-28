const profiles = {
  surface: ['title-zoom','.hero-copy h1','#f16c40','zoom'],
  finding: ['mind-map-fold','.art-frame','#c2d9bd','fold'],
  defining: ['idea-expansion','.map-heading h2','#87b6a4','iris'],
  challenge: ['statistic-tunnel','.big-stat','#a2d7ca','zoom'],
  drivers: ['chip-constellation','.driver-icon','#d1dfc4','tiles'],
  solution: ['fishing-rod-cast','.sketch-button','#88b9af','cast'],
  'in-action': ['camera-lens-dive','.precision-lure','#123b40','dive'],
  'protected-encounter': ['turtle-swim-through','.precision-turtle','#6d9d87','swim'],
  strategy: ['graph-line-flight','.art-frame','#d7e9e0','graph'],
  market: ['market-sun-bloom','.divider-circle','#f16c40','bloom'],
  'market-overview': ['market-orbits-expand','.market-nesting','#91b8a1','orbits'],
  'interview-1': ['professional-quote-sweep','.interview-content','#cad9c1','quote'],
  'interview-2': ['education-card-turn','.interview-label','#c2dfd5','turn'],
  'interview-3': ['hobbyist-words-drift','.interview-content li','#8bb8a8','words'],
  tam: ['tam-number-magnification','.calculation strong','#c6d9c0','number'],
  sam: ['sam-ring-aperture','.market-watermark','#79a995','ring'],
  som: ['som-target-punch','.calculation strong','#f16c40','target'],
  competition: ['competitive-title-split','.divider-copy h2','#153b3e','split'],
  definition: ['product-camera-focus','.sketch-button','#b8d6c8','focus'],
  swot: ['swot-quadrant-unfold','.art-frame','#9bbb9f','quadrants'],
  landscape: ['landscape-axis-rotation','.plot','#b7d6c8','axis'],
  comparison: ['comparison-row-ripple','tbody tr','#91b7a1','rows'],
  uvp: ['bluecatch-type-morph','.divider-copy h2','#f16c40','morph'],
  value: ['value-words-wave','.value-statement','#cbdcc4','ripple'],
  'visual-value': ['product-photo-pan','.art-frame','#729f92','photo'],
  financials: ['financial-ledger-rise','.divider-copy h2','#c1d7bf','ledger'],
  funds: ['funding-donut-portal','.funds-donut','#214f4b','donut']
};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let activeEntrances = [];
let numberFrames = new Set();
let latestEntry = 0;

export function prepareMotion(slides) {
  for (const [i,slide] of slides.entries()) {
    slide.dataset.transition = profiles[slide.id]?.[0] || 'color-expansion';
    slide.setAttribute('aria-label', `${i + 1}. ${slide.dataset.title}`);
    slide.style.setProperty('--scene-index', i);
    slide.querySelectorAll('h1,h2,h3').forEach(heading => {
      if (heading.closest('.regenerated-chart')) return;
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const nodes=[];while(walker.nextNode()) nodes.push(walker.currentNode);
      for(const node of nodes) {
        const fragment=document.createDocumentFragment();
        for(const word of node.textContent.match(/\S+|\s+/g)||[]) {
          if (/^\s+$/.test(word)) fragment.append(document.createTextNode(word));
          else {const span=document.createElement('span');span.className='kinetic-word';span.textContent=word;fragment.append(span);}
        }
        node.replaceWith(fragment);
      }
    });
    const ambient=document.createElement('div');ambient.className='ambient-orbit';ambient.setAttribute('aria-hidden','true');slide.append(ambient);
    slide.querySelectorAll('.art-frame>img,.sketch-button>img,.driver-icon svg,.interview-watermark,.market-watermark,.divider-circle,.precision-lure').forEach((element,j)=>{element.classList.add('idle-drift');element.style.setProperty('--drift-delay',`${-j*1.7}s`);});
  }
}
export function stopEntrances() {
  latestEntry++;
  activeEntrances.forEach(animation=>animation.cancel());activeEntrances=[];
  numberFrames.forEach(cancelAnimationFrame);numberFrames.clear();
  document.querySelectorAll('[data-count]').forEach(element=>{element.textContent='$'+Number(element.dataset.count).toLocaleString('en-US');});
}
function play(element, frames, options={}) {
  const animation=element.animate(frames,{duration:800,easing:'cubic-bezier(.16,.7,.2,1)',fill:'both',...options});
  activeEntrances.push(animation);return animation;
}
export async function enterSlide(slide, index, paused) {
  stopEntrances();
  const version=latestEntry;
  // A font/image race must not leave an entrance in its invisible starting frame.
  await Promise.race([Promise.all([document.fonts.ready,...[...slide.querySelectorAll('img')].map(image=>image.decode?.().catch(()=>{}))]),sleep(1200)]);
  if(version!==latestEntry||!slide.classList.contains('is-active')||paused()) return;
  const words=[...slide.querySelectorAll('h1 .kinetic-word,h2 .kinetic-word')];
  words.forEach((word,i)=>{
    const variants=[
      [{opacity:0,transform:'translateY(50px) rotate(5deg)',filter:'blur(5px)'},{opacity:1,transform:'translateY(0) rotate(0)',filter:'blur(0)'}],
      [{opacity:0,transform:'scale(.65) translateX(-25px)'},{opacity:1,transform:'scale(1) translateX(0)'}],
      [{opacity:0,transform:'perspective(500px) rotateX(-70deg) translateY(25px)'},{opacity:1,transform:'perspective(500px) rotateX(0) translateY(0)'}],
      [{opacity:0,clipPath:'inset(0 100% 0 0)',transform:'translateX(-20px)'},{opacity:1,clipPath:'inset(0 0% 0 0)',transform:'translateX(0)'}]
    ];play(word,variants[index%variants.length],{delay:Math.min(i*65,420),duration:850});
  });
  const content=slide.querySelectorAll('.art-frame,.challenge-grid,.numbers-strip,.driver,.solution-features,.sketch-button,.interview-content,.market-text-grid>div,.calculation,.value-statement,.financial-notes,.demo-aside,.deep-scene');
  content.forEach((element,i)=>play(element,[{opacity:0,transform:`translate${index%2?'X':'Y'}(${index%2?35:28}px) scale(.97)`},{opacity:1,transform:'translate(0,0) scale(1)'}],{delay:100+Math.min(i*90,400),duration:850}));
  // Charts build as live graphics rather than appearing as flat screenshots.
  slide.querySelectorAll('.market-basin').forEach((basin,i)=>play(basin,[{opacity:0,transform:'scale(.15) translateY(80px)'},{opacity:1,transform:'scale(1.04) translateY(-5px)',offset:.78},{opacity:1,transform:'scale(1) translateY(0)'}],{duration:1100,delay:i*190,transformOrigin:'50% 100%'}));
  slide.querySelectorAll('.market-ledger-row,.funds-ledger-row').forEach((row,i)=>play(row,[{opacity:0,transform:'translateX(55px)'},{opacity:1,transform:'translateX(0)'}],{delay:180+i*150,duration:900}));
  slide.querySelectorAll('.fund-arc').forEach((arc,i)=>play(arc,[{strokeDashoffset:1},{strokeDashoffset:0}],{delay:i*170,duration:1350,easing:'cubic-bezier(.25,.5,.3,1)'}));
  slide.querySelectorAll('[data-count]').forEach((element,i)=>{
    const value=Number(element.dataset.count);let start;const delay=180+i*100;
    function frame(time){if(version!==latestEntry)return;start??=time;const progress=Math.max(0,Math.min(1,(time-start-delay)/1200));const eased=1-Math.pow(1-progress,3);element.textContent='$'+Math.round(value*eased).toLocaleString('en-US');if(progress<1){const id=requestAnimationFrame(frame);numberFrames.add(id);}}
    const id=requestAnimationFrame(frame);numberFrames.add(id);
  });
}
function cloneSource(source, layer) {
  const rect=source.getBoundingClientRect();
  const box=document.createElement('div');box.className='transition-source';
  box.style.cssText=`left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;`;
  const clone=source.cloneNode(true);clone.inert=true;clone.removeAttribute('id');
  const scale=rect.width/Math.max(1,source.offsetWidth||rect.width);
  clone.style.cssText=`width:${source.offsetWidth||rect.width}px;height:${source.offsetHeight||rect.height}px;max-width:none;position:relative;inset:auto;margin:0;opacity:1;visibility:visible;transform-origin:0 0;transform:scale(${scale});animation:none;`;
  const computed=getComputedStyle(source);
  for (const property of ['font-family','font-size','font-weight','line-height','letter-spacing','color','text-align']) clone.style.setProperty(property,computed.getPropertyValue(property));
  if(source.classList.contains('market-watermark')) clone.style.color='#173b39';
  // Cloned SVG gradients need unique IDs and matching local references.
  const names=new Map();const prefix='transition-'+Math.random().toString(36).slice(2,8);
  clone.querySelectorAll('[id]').forEach(node=>{const old=node.id;names.set(old,prefix+'-'+old);node.id=prefix+'-'+old;});
  clone.querySelectorAll('*').forEach(node=>{for(const attribute of [...node.attributes]) {let value=attribute.value;for(const [old,id] of names) value=value.replaceAll('url(#'+old+')','url(#'+id+')').replaceAll('href="#'+old+'"','href="#'+id+'"');if(value!==attribute.value)node.setAttribute(attribute.name,value);}node.style.animation='none';});
  box.append(clone);layer.append(box);return box;
}
export async function transitionSlides(outgoing, incoming, overlay, backwards, swap) {
  const [name,selector,color,kind]=profiles[outgoing.id]||['color-expansion','h2','#9cdedc','bloom'];
  overlay.replaceChildren();overlay.dataset.effect=name;overlay.classList.add('play');overlay.classList.toggle('backwards',backwards);
  const backdrop=document.createElement('div');backdrop.className='transition-backdrop';backdrop.style.background=color;overlay.append(backdrop);
  const source=outgoing.querySelector(selector)||outgoing.querySelector('h2,h1');
  const rect=source?.getBoundingClientRect();const origin=rect?`${rect.left+rect.width/2}px ${rect.top+rect.height/2}px`:'50% 50%';
  const isAngular=['fold','tiles','quadrants','axis','rows','split','ledger'].includes(kind);
  const mask=isAngular?['polygon(0 100%,100% 100%,100% 100%,0 100%)','polygon(0 0,100% 0,100% 100%,0 100%)']: [`circle(0% at ${origin})`,`circle(160% at ${origin})`];
  const animations=[];
  animations.push(backdrop.animate([{opacity:0,clipPath:mask[0]},{opacity:1,clipPath:mask[1],offset:.43},{opacity:1,clipPath:mask[1],offset:.56},{opacity:0,clipPath:mask[1]}],{duration:1050,easing:'cubic-bezier(.5,0,.3,1)',fill:'both'}));
  if(source){
    if(['tiles','quadrants','rows'].includes(kind)){
      const pieces=kind==='tiles'?[...outgoing.querySelectorAll(selector)]:kind==='rows'?[...outgoing.querySelectorAll(selector)]:[source,source,source,source];
      pieces.forEach((piece,i)=>{
        const clone=cloneSource(piece,overlay);
        if(kind==='quadrants')clone.style.clipPath=`inset(${i>1?'50%':'0'} ${i%2?'0':'50%'} ${i<2?'50%':'0'} ${i%2?'50%':'0'})`;
        animations.push(clone.animate([{opacity:1,transform:'perspective(800px) rotateY(0) scale(1)'},{opacity:1,transform:`perspective(800px) rotateY(${(i%2?1:-1)*35}deg) translate(${(i%2?1:-1)*80}px,${i*25}px) scale(2)`,offset:.5},{opacity:0,transform:`translate(${(i%2?1:-1)*innerWidth}px,${-innerHeight/3}px) scale(3)`}],{duration:950,delay:i*25,fill:'both',easing:'cubic-bezier(.4,0,.3,1)'}));
      });
    }else{
      const clone=cloneSource(source,overlay);
      const sign=backwards?-1:1;
      const transforms={
        zoom:['scale(1)','scale(3.8) rotate(-3deg)','scale(10) rotate(4deg)'],
        fold:['perspective(900px) rotateY(0)','perspective(900px) rotateY(-65deg) scale(1.4)','perspective(900px) rotateY(-120deg) scale(.4)'],
        iris:['scale(1)','scale(4) rotate(12deg)','scale(12) rotate(35deg)'],
        cast:['rotate(0) translate(0,0)','rotate(-35deg) translate(-200px,-150px) scale(1.5)','rotate(-80deg) translate(-800px,-700px) scale(2)'],
        dive:['scale(1)','scale(4.5) translateY(12%)','scale(15) translateY(12%)'],
        swim:['translateX(0) rotate(0)','translateX(-20vw) rotate(-8deg) scale(1.5)','translateX(-110vw) rotate(-10deg) scale(2)'],
        graph:['rotate(0) scale(1)','rotate(-15deg) scale(1.5) translateX(20vw)','rotate(-35deg) scale(2.5) translateX(90vw)'],
        bloom:['scale(1)','scale(7)','scale(18)'],
        orbits:['scale(1) rotate(0)','scale(2.5) rotate(25deg)','scale(7) rotate(70deg)'],
        quote:['translateX(0)','translateX(-15vw) scale(1.25)','translateX(110vw) scale(2)'],
        turn:['perspective(800px) rotateX(0)','perspective(800px) rotateX(65deg) scale(1.4)','perspective(800px) rotateX(130deg) translateY(-50vh)'],
        words:['translateY(0) rotate(0)','translateY(-10vh) rotate(-7deg) scale(1.4)','translateY(-100vh) rotate(10deg) scale(2)'],
        number:['scale(1)','scale(5) rotate(4deg)','scale(15) rotate(-4deg)'],
        ring:['scale(1)','scale(3) rotate(90deg)','scale(10) rotate(180deg)'],
        target:['scale(1)','scale(.6) rotate(-12deg)','scale(18) rotate(12deg)'],
        split:['scale(1) skewX(0)','scale(1.8) skewX(-15deg) translateX(-10vw)','scale(3) skewX(-25deg) translateX(-100vw)'],
        focus:['scale(1)','scale(2.8) translateY(10vh)','scale(7) translateY(20vh)'],
        axis:['rotate(0) scale(1)','rotate(45deg) scale(1.7)','rotate(90deg) scale(4)'],
        morph:['scale(1) rotate(0)','scale(2.5,.7) rotate(-6deg)','scale(8,2) rotate(3deg)'],
        ripple:['scale(1) translateY(0)','scale(1.3) translateY(-10vh)','scale(2) translateY(80vh)'],
        photo:['scale(1)','scale(1.7) translateX(-8vw)','scale(3) translateX(-60vw)'],
        ledger:['translateY(0)','translateY(-20vh) scale(1.2)','translateY(-110vh) scale(1.6)'],
        donut:['scale(1) rotate(0)','scale(3) rotate(50deg)','scale(12) rotate(120deg)']
      }[kind]||['scale(1)','scale(3)','scale(8)'];
      clone.style.transformOrigin='center';
      animations.push(clone.animate([{opacity:1,transform:transforms[0]},{opacity:1,transform:transforms[1],offset:.46},{opacity:0,transform:transforms[2]}],{duration:1000,easing:'cubic-bezier(.5,0,.25,1)',fill:'both'}));
      if(sign<0 && ['swim','cast'].includes(kind)) clone.style.scale='-1 1';
    }
  }
  let swapped=false;
  try {await sleep(440);swap();swapped=true;await Promise.race([Promise.all(animations.map(animation=>animation.finished.catch(()=>{}))),sleep(1000)]);}
  finally {if(!swapped)swap();animations.forEach(animation=>animation.cancel());overlay.classList.remove('play');overlay.replaceChildren();}
}
