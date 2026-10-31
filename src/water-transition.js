// Screen-space water is painted at the display's resolution: shaded water body,
// breaking lip, entrained foam and separate ballistic spray. Seeded, never flickering.
const TAU = Math.PI * 2;
const clamp = n => Math.min(1, Math.max(0, n));
function random(seed) {
  let n = seed;
  return () => { n = Math.imul(1664525, n) + 1013904223 | 0; return (n >>> 0) / 4294967296; };
}

let waterMaps;
function makeWaterMaps() {
  if (waterMaps) return waterMaps;
  const size=384, height=768;
  const surface=document.createElement('canvas'), froth=document.createElement('canvas');
  surface.width=froth.width=size;surface.height=froth.height=height;
  const sc=surface.getContext('2d'),fc=froth.getContext('2d');
  const pixels=sc.createImageData(size,height),foam=fc.createImageData(size,height);
  const hash=(x,y)=>{let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
  function noise(x,y){
    const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
    const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);
    return a+(b-a)*fx+(c-a)*fy*(1-fx)+(d-b)*fx*fy;
  }
  const fbm=(x,y)=>noise(x,y)*.5+noise(x*2.03+8,y*2.03)*.27+noise(x*4.1,y*4.1+6)*.15+noise(x*8.2,y*8.2)*.08;
  for(let y=0;y<height;y++) for(let x=0;x<size;x++) {
    const u=x/size;
    const warp=noise(x*.013,y*.015)*7;
    const n=fbm(x*.057+warp,y*.033+warp);
    const fine=noise(x*.8,y*.8);
    const slope=fbm(x*.057+warp+.08,y*.033+warp)-n;
    const shine=Math.min(1,Math.pow(Math.max(0,slope*14+.42),4));
    const crest=Math.exp(-Math.pow((u-.94)*8,2));
    const light=n*.4+shine*.5+crest*.25;
    const i=(y*size+x)*4;
    // Muted sage shadows and warm highlights match the deck's mint/ink palette.
    pixels.data.set([49+light*107,73+light*112,67+light*94,clamp(u*2)*210],i);
    // Multiscale ridges produce connected, torn foam rather than circular confetti.
    const ridge=1-Math.abs(n*2-1);
    const coverage=clamp((u-.66+(noise(x*.022,y*.024)-.5)*.48)*4);
    const lace=clamp((ridge-.61)*4.2)*(fine*.35+.65);
    const alpha=coverage*lace*235;
    foam.data.set([232+fine*11,237+fine*10,220+fine*14,alpha],i);
  }
  sc.putImageData(pixels,0,0);fc.putImageData(foam,0,0);
  waterMaps={surface,froth};return waterMaps;
}

export function waterSweep(overlay, animate, { duration = 2200, backwards = false, full = false, deep = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = full ? 'breaking-wave' : 'transition-atmosphere';
  overlay.append(canvas);
  const w = overlay.clientWidth, h = overlay.clientHeight;
  const dpr = Math.min(devicePixelRatio, 1.6);
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const maps=full?makeWaterMaps():undefined;
  const rand = random(316);
  const foam = Array.from({length: full ? 1600 : 130}, () => ({y:rand(),spread:rand(),r:rand(),phase:rand()*TAU,speed:rand(),drift:rand()}));
  const clock = animate(canvas, [{opacity:1},{opacity:1}], {duration,easing:'linear'});
  let frame, stopped = false;
  function draw() {
    if(stopped)return;
    const t = clamp(Number(clock.currentTime || 0) / duration);
    ctx.clearRect(0,0,w,h);
    ctx.save();
    if(backwards){ctx.translate(w,0);ctx.scale(-1,1);}
    const fade = Math.sin(Math.PI*t) ** .6;
    if(full) {
      const head = (-.44 + t*2.08)*w;
      const front = y => head + Math.sin(y/h*3.7-t*3)*w*.105 + Math.sin(y/h*10+t*2)*w*.018;
      // A rolling, curved wall of water. The tail is transparent so the next page
      // emerges from the receding water rather than appearing above it.
      const body=ctx.createLinearGradient(head-w*1.05,0,head+w*.13,0);
      for(const [p,c] of [[0,'#365a4800'],[.18,'#365a4835'],[.46,'#264c42e8'],[.70,'#537969f7'],[.86,'#9bb8a0e8'],[.94,'#dde7d2da'],[1,'#f3f4e900']])body.addColorStop(p,c);
      ctx.beginPath();ctx.moveTo(head-w*1.2,-30);
      ctx.lineTo(front(-30),-30);
      for(let y=-30;y<=h+30;y+=9)ctx.lineTo(front(y),y);
      ctx.lineTo(head-w*1.2,h+30);ctx.closePath();ctx.fillStyle=body;ctx.fill();
      ctx.save();ctx.clip();
      // Refractive surface normals and foam are advected through a curved sheet.
      for(let y=0;y<h;y+=2){
        const sourceY=(y/h*600+t*140)%760;
        ctx.globalAlpha=.8;
        ctx.drawImage(maps.surface,0,sourceY,384,1200/h,front(y)-w*.8,y,w*.8,2.1);
      }
      ctx.globalAlpha=1;
      // Long curved subsurface highlights and darker troughs follow the current.
      for(let j=0;j<19;j++) {
        const y=h*j/18;
        ctx.beginPath();ctx.moveTo(head-w*1.1,y+Math.sin(j)*35);
        ctx.bezierCurveTo(head-w*.65,y-h*.15,head-w*.23,y+h*.15,front(y),y);
        ctx.lineWidth=.6+(j%4)*.7;ctx.strokeStyle=`rgba(${j%3?'176,205,178':'24,53,46'},${.025+(j%3)*.025})`;ctx.stroke();
      }
      for(let j=0;j<13;j++) {
        ctx.beginPath();
        for(let y=-20;y<=h+20;y+=8){const x=front(y)-j*13-12+Math.sin(y*.022+j*.7-t*6)*(8+j);if(y===-20)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
        ctx.lineWidth=2+j*.6;ctx.strokeStyle=`rgba(199,217,189,${.21-j*.012})`;ctx.stroke();
      }
      ctx.restore();
      for(let y=0;y<h;y+=2){
        const sourceY=(y/h*600+t*140)%760;
        ctx.drawImage(maps.froth,0,sourceY,384,1200/h,front(y)-w*.26,y,w*.27,2.1);
      }
      // The lip folds back into itself, with a glassy dark core and sunlit crest.
      for(let j=7;j>=0;j--) {
        ctx.beginPath();
        for(let y=-20;y<h+30;y+=6){const x=front(y)-j*5+Math.sin(y*.027-t*8)*7;if(y===-20)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
        ctx.strokeStyle=j>4?'rgba(43,73,60,.16)':`rgba(244,246,229,${.18+(4-j)*.1})`;
        ctx.lineWidth=j*4+2;ctx.stroke();
      }
      // Dense foam vortices along the breaking lip; bubbles retain their identities.
      for(const p of foam) {
        const y=p.y*h;
        const curl=Math.sin(p.phase+t*(6+p.speed*5));
        const x=front(y)-p.spread*p.spread*w*.19 + curl*18;
        const yy=y+Math.cos(p.phase+t*7)*12;
        const r=.25+p.r*p.r*1.8;
        ctx.beginPath();ctx.ellipse(x,yy,r*(1+p.speed),r*.65, -.5,0,TAU);
        ctx.fillStyle=`rgba(243,246,230,${(.15+p.r*.6)*fade})`;ctx.fill();
        // Spray leaves the lip with momentum, then falls under gravity.
        if(p.spread>.74) {
          const life=(t*2+p.drift)%1;
          const sx=front(y)+life*(40+p.speed*100);
          const sy=y-life*70+life*life*120;
          ctx.beginPath();ctx.ellipse(sx,sy,Math.max(.5,r*.35),Math.max(1,r*.8),-.6,0,TAU);
          ctx.fillStyle=`rgba(241,244,228,${(1-life)*fade*.8})`;ctx.fill();
        }
      }
      // Close-to-lens droplets move more slowly, giving a second depth plane.
      for(let i=0;i<18;i++) {
        const p=foam[i];const x=front(p.y*h)+p.spread*140;
        const r=2+p.r*7;const y=p.y*h+t*t*70;
        const g=ctx.createRadialGradient(x-r*.3,y-r*.3,.2,x,y,r);
        g.addColorStop(0,`rgba(246,247,232,${fade*.8})`);g.addColorStop(.4,`rgba(143,168,140,${fade*.1})`);g.addColorStop(1,`rgba(218,230,205,${fade*.5})`);
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
      }
    } else {
      // A slower, translucent refractive current connects every other scene.
      const x = (-.45+t*1.9)*w;
      const light=ctx.createRadialGradient(x,h*.45,0,x,h*.45,w*.65);
      light.addColorStop(0,deep?`rgba(117,230,230,${fade*.19})`:`rgba(64,172,185,${fade*.15})`);
      light.addColorStop(.5,`rgba(120,218,210,${fade*.05})`);light.addColorStop(1,'rgba(120,218,210,0)');
      ctx.fillStyle=light;ctx.fillRect(0,0,w,h);
      ctx.globalCompositeOperation='screen';
      for(let j=0;j<9;j++) {
        ctx.beginPath();
        for(let y=-20;y<=h+20;y+=15){const xx=x+Math.sin(y/h*4.2+t*3+j*.11)*w*.16+j*7; y===-20?ctx.moveTo(xx,y):ctx.lineTo(xx,y);}
        ctx.lineWidth=1+j*.5;ctx.strokeStyle=`rgba(128,222,220,${fade*(.12-j*.009)})`;ctx.stroke();
      }
      for(const p of foam){const xx=(p.spread*w+t*w*.28)%w, yy=p.y*h-Math.sin(t*Math.PI)*p.speed*60;
        ctx.fillStyle=`rgba(${deep?'181,245,240':'85,159,159'},${fade*.45})`;ctx.beginPath();ctx.arc(xx,yy,.5+p.r*1.8,0,TAU);ctx.fill();}
    }
    ctx.restore();
    if(clock.playState==='running'||clock.playState==='pending')frame=requestAnimationFrame(draw);
  }
  frame=requestAnimationFrame(draw);
  return ()=>{stopped=true;cancelAnimationFrame(frame);};
}
