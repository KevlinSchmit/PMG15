import { mountSceneArt, motionImage, warmMotionImages } from './scene-art.js';
import { paintTransition, clamp } from './transition-physics.js';

// Every chapter has its own physical action, rather than a shared flying-object exit.
const profiles = {
  surface: ['reel-line-cast','reel','hero','reel-cast',640],
  finding: ['location-pin-impact','pin','map','pin-drop',560],
  defining: ['problem-cable-connection','cable','map','cable-trace',520],
  challenge: ['net-opens-fish-escape','net','footer','net-release',720],
  drivers: ['chip-power-up','chip','footer','chip-boot',540],
  solution: ['lure-enters-water','lure','corner','lure-plunge',720],
  'in-action': ['continuous-underwater-encounter','sonar','hidden','encounter',320],
  'protected-encounter': ['turtle-paddles-away','turtle','hidden','turtle-swim',700],
  strategy: ['compass-sets-course','compass','corner','compass-bearing',540],
  market: ['motorboat-bow-wave','boat','divider','motorboat',780],
  'market-overview': ['market-rings-converge','rings','footer','market-rings',480],
  'interview-1': ['microphone-records-response','microphone','interview','microphone-record',560],
  'interview-2': ['field-notebook-page-turn','book','interview','book-turn',520],
  'interview-3': ['camera-iris-exposure','camera','interview','camera-shutter',560],
  tam: ['market-filter-narrows','funnel','footer','market-filter',580],
  sam: ['sonar-locates-serviceable-market','sonar','footer','sonar-sweep',580],
  som: ['single-fish-target-lock','target','footer','target-lock',480],
  competition: ['sorting-gate-opens','gate','divider','sorting-gate',640],
  definition: ['sensor-optics-separate','camera','corner','sensor-assembly',560],
  swot: ['tradeoffs-balance','scale','corner','balance-settle',520],
  landscape: ['beacons-triangulate','beacon','corner','beacon-triangulate',500],
  comparison: ['bluecatch-column-selects','check','footer','comparison-select',460],
  uvp: ['protection-shell-closes','shield','divider','shield-close',580],
  value: ['hooks-retract-fish-passes','lure','value','hooks-safe',640],
  'visual-value': ['float-signals-green','buoy','corner','buoy-signal',540],
  financials: ['coins-fall-into-budget','coins','divider','coins-budget',660],
  funds: ['return-to-surface','surface','footer','surface-return',560]
};
let entrances=[];
let entry=0;
let finishCut;
export function finishTransition(){finishCut?.();}
export function prepareMotion(slides){
  for(const [i,slide] of slides.entries()){
    const [name,art,placement,cut,duration]=profiles[slide.id];
    Object.assign(slide.dataset,{transition:name,cut,duration:String(duration)});
    slide.setAttribute('aria-label',`${i+1}. ${slide.dataset.title}`);
    mountSceneArt(slide,art,placement);
  }
  warmMotionImages([...Object.values(profiles).map(p=>p[1]),'scale:body','scale:beam','compass:body','compass:needle']).catch(()=>{});
}
export function stopEntrances(){
  entry++;
  entrances.forEach(a=>a.cancel());entrances=[];
  document.querySelectorAll('[data-count]').forEach(e=>{e.textContent='$'+Number(e.dataset.count).toLocaleString('en-US');});
}
export async function enterSlide(slide,index,paused){
  stopEntrances();const version=entry;
  await document.fonts.ready;
  if(version!==entry||!slide.classList.contains('is-active')||paused())return;
  const play=(e,frames,options={})=>entrances.push(e.animate(frames,{duration:450,easing:'ease-out',fill:'both',...options}));
  // A transition already reveals the scene. Avoid a second text entrance on top of it.
  if(!document.body.classList.contains('is-transitioning'))play(slide,[{opacity:0},{opacity:1}],{duration:240});
  slide.querySelectorAll('.market-basin').forEach((e,i)=>play(e,[{clipPath:'inset(100% 0 0)'},{clipPath:'inset(0)'}],{duration:650,delay:i*90}));
  slide.querySelectorAll('.fund-arc').forEach((e,i)=>play(e,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:650,delay:i*90}));
}
function holdCamera(outgoing,overlay){
  const source=outgoing.querySelector('.deep-scene'),rect=source.getBoundingClientRect();
  const holder=document.createElement('div');holder.className='transition-camera';
  holder.style.cssText=`left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;`;
  const clone=source.cloneNode(true);
  clone.style.cssText=`width:${source.offsetWidth}px;height:${source.offsetHeight}px;transform:scale(${rect.width/source.offsetWidth});transform-origin:0 0;`;
  clone.innerHTML=clone.innerHTML.replace(/id="([^"]+)"/g,'id="held-$1"').replace(/url\(#([^)]+)\)/g,'url(#held-$1)');
  holder.append(clone);overlay.append(holder);return holder;
}
export async function transitionSlides(outgoing,incoming,overlay,backwards,swap){
  const [name,art,,profileCut,duration]=profiles[outgoing.id];
  const encounter=[outgoing.id,incoming.id].every(id=>['in-action','protected-encounter'].includes(id));
  const kind=encounter?'encounter':profileCut==='encounter'?'sonar-sweep':profileCut;
  const oldStyle=new Map([outgoing,incoming].map(s=>[s,{clipPath:s.style.clipPath,zIndex:s.style.zIndex,opacity:s.style.opacity}]));
  const source=outgoing.querySelector('.scene-object'),destination=incoming.querySelector('.scene-object');
  const sourceVisibility=source.style.visibility,destinationVisibility=destination.style.visibility;
  let animalSource,animalVisibility;
  let swapped=false,done=false,frameId,resolveRun;
  const swapOnce=()=>{if(!swapped){swapped=true;swap();}};
  const completed=new Promise(resolve=>{resolveRun=resolve;});
  finishCut=()=>{done=true;cancelAnimationFrame(frameId);swapOnce();resolveRun();};
  overlay.replaceChildren();overlay.dataset.effect=name;overlay.dataset.kind=kind;
  overlay.classList.add('play');overlay.classList.toggle('backwards',backwards);
  try{
    if(encounter){
      const camera=holdCamera(outgoing,overlay);
      swapOnce();
      const dissolve=camera.animate([{opacity:1},{opacity:0}],{duration:230,fill:'both'});
      finishCut=()=>{done=true;dissolve.finish();resolveRun();};
      await Promise.race([dissolve.finished.catch(()=>{}),completed]);
      dissolve.cancel();return;
    }
    const part=art==='compass'?'needle':art==='scale'?'beam':null;
    const [img,mechanism]=await Promise.all([motionImage(part?art+':body':art),part?motionImage(art+':'+part):Promise.resolve(null)]);
    if(done)return;
    const W=overlay.clientWidth,H=overlay.clientHeight;
    animalSource=kind==='turtle-swim'?outgoing.querySelector('.precision-turtle'):null;
    const rect=(animalSource||source).getBoundingClientRect();
    const hidden=!animalSource&&getComputedStyle(source).visibility==='hidden';
    const anchor=hidden?{x:W*.7,y:H*.57,w:Math.min(320,W*.55)}:{x:rect.left+rect.width/2,y:rect.top+rect.height/2,w:rect.width};
    const canvas=document.createElement('canvas');canvas.className='transition-action';
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;
    overlay.append(canvas);const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
    outgoing.classList.add('is-departing');outgoing.style.opacity='1';outgoing.style.zIndex='2';
    incoming.style.zIndex='3';incoming.style.clipPath='inset(0 100% 0 0)';
    source.style.visibility='hidden';destination.style.visibility='hidden';
    if(animalSource){animalVisibility=animalSource.style.visibility;animalSource.style.visibility='hidden';}
    let creature;
    if(kind==='turtle-swim'||kind==='hooks-safe'){
      creature=document.createElement('div');creature.className=kind==='turtle-swim'?'transition-animal':'transition-lure';
      creature.innerHTML=(animalSource||source).innerHTML.replace(/id="([^"]+)"/g,'id="actor-$1"').replace(/url\(#([^)]+)\)/g,'url(#actor-$1)');
      creature.style.cssText=`width:${anchor.w}px;height:${anchor.w*260/360}px;`;overlay.append(creature);
    }
    const handoff=kind==='motorboat'?.49:kind==='camera-shutter'?.43:.32;
    let start;
    const frame=now=>{
      if(done)return;
      start??=now;const t=clamp((now-start)/duration);
      const {clip,opacity,phase}=paintTransition(ctx,{W,H,t,kind,img,mechanism,anchor,backwards});
      overlay.dataset.progress=t.toFixed(3);overlay.dataset.phase=phase;
      if(t>=handoff){incoming.style.clipPath=clip;incoming.style.opacity=String(opacity);swapOnce();}
      if(creature){
        const travel=t*t*(3-2*t),direction=backwards?1:-1;
        creature.style.left=`${anchor.x-anchor.w/2+(kind==='turtle-swim'?direction*travel*W*1.1:0)}px`;
        creature.style.top=`${anchor.y-anchor.w*260/720+(kind==='turtle-swim'?Math.sin(t*18)*4:0)}px`;
        if(kind==='hooks-safe'){
          const retract=clamp(t/.23);
          creature.querySelectorAll('.detail-hook').forEach(hook=>{hook.style.transform=`translateY(${-28*retract}px) scale(${1-.6*retract},${1-.94*retract})`;hook.style.opacity=String(1-retract);});
          creature.style.opacity=String(1-clamp((t-.72)/.28));
        }
      }
      if(t<1)frameId=requestAnimationFrame(frame);else{swapOnce();resolveRun();}
    };
    frameId=requestAnimationFrame(frame);
    await completed;
  }finally{
    cancelAnimationFrame(frameId);swapOnce();finishCut=undefined;
    for(const [slide,style]of oldStyle)Object.assign(slide.style,style);
    source.style.visibility=sourceVisibility;destination.style.visibility=destinationVisibility;
    if(animalSource)animalSource.style.visibility=animalVisibility;
    outgoing.classList.remove('is-departing');overlay.classList.remove('play');overlay.replaceChildren();
  }
}
