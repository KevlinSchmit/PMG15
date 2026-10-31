// Illustrated sage water: a rolling face, a curled crest and a restrained foam edge.
const TAU = Math.PI * 2;
const clamp = n => Math.min(1, Math.max(0, n));
function random(seed) {
  let n = seed;
  return () => { n = Math.imul(1664525, n) + 1013904223 | 0; return (n >>> 0) / 4294967296; };
}

let waterMaps;
function makeWaterMaps() {
  if (waterMaps) return waterMaps;
  const size=192, height=384;
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
  const foam = Array.from({length: full ? 180 : 130}, () => ({y:rand(),spread:rand(),r:rand(),phase:rand()*TAU,speed:rand(),drift:rand()}));
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
      const head = (-.28 + t*3.1)*w;
      const front = y => head + Math.sin(y/h*3.5-t*1.5)*w*.085 + Math.sin(y/h*10-t*2)*w*.012+w*.05*Math.exp(-Math.pow((y/h-.39)*7,2));
      function sheet(offset, width, color) {
        ctx.beginPath();
        ctx.moveTo(front(-20)-offset,-20);
        for(let y=-20;y<=h+20;y+=10)ctx.lineTo(front(y)-offset,y);
        for(let y=h+20;y>=-20;y-=10)ctx.lineTo(front(y)-offset-width,y);
        ctx.closePath();ctx.fillStyle=color;ctx.fill();
      }
      // One opaque wave hides the page swap at its midpoint.
      const body=ctx.createLinearGradient(head-w,0,head,0);
      body.addColorStop(0,'#5e806d');body.addColorStop(.65,'#85a28a');body.addColorStop(1,'#b2c7aa');
      sheet(0,w*1.7,body);
      // Long, tapering water lines follow the rolling face, instead of uniform bands.
      ctx.save();ctx.clip();
      // Soft, low-contrast water grain adds a rolling surface while the broad
      // color shapes remain dominant. No lens effects or fine specular noise.
      ctx.globalAlpha=.52;
      for(let y=0;y<h;y+=2) {
        const sourceY=(y/h*300+t*60)%375;
        ctx.drawImage(maps.surface,0,sourceY,192,600/h,front(y)-w*.7,y,w*.7,2.1);
      }
      ctx.globalAlpha=1;
      for(const p of foam.slice(0,10)) {
        const y=p.y*h,x=front(y)-w*(.08+p.spread*.62),length=w*(.045+p.r*.15);
        ctx.beginPath();ctx.moveTo(x-length,y+18);
        ctx.bezierCurveTo(x-length*.55,y-18-p.r*22,x-length*.2,y-12,x,y);
        ctx.lineWidth=.8+p.r*2;
        ctx.strokeStyle=`rgba(224,236,210,${.12+p.r*.2})`;ctx.stroke();
      }
      for(let j=0;j<5;j++) {
        ctx.beginPath();
        for(let y=-20;y<=h+20;y+=10) {
          const x=front(y)-w*(.035+j*.025)+Math.sin(y/h*6+j-t*2)*w*.008;
          y===-20?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.lineWidth=j===0?9:1.7;
        ctx.strokeStyle=j===0?'rgba(202,222,188,.38)':'rgba(233,240,222,.35)';ctx.stroke();
      }
      ctx.restore();
      // A slightly irregular, connected foam lip defines the breaking water.
      ctx.beginPath();
      for(let y=-20;y<=h+20;y+=5) {
        const x=front(y)+Math.sin(y*.065+t*4)*3;
        y===-20?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      for(let y=h+20;y>=-20;y-=5) {
        const thickness=5+w*.004+(Math.sin(y*.021-t*3)+1)**2*5;
        ctx.lineTo(front(y)-thickness,y);
      }
      ctx.closePath();ctx.fillStyle='#edf1e0';ctx.fill();

      // Broken, connected foam rolls back into the wave face instead of
      // projecting as a separate spiral-shaped object.
      ctx.globalAlpha=.65;
      for(let y=0;y<h;y+=2) {
        const sourceY=(y/h*300+t*60)%375;
        ctx.drawImage(maps.froth,0,sourceY,192,600/h,front(y)-w*.14,y,w*.145,2.1);
      }
      ctx.globalAlpha=1;
      const cy=h*.4,cx=front(cy)-Math.min(w*.035,h*.04),r=Math.min(h*.075,w*.06);
      ctx.save();
      for(let j=0;j<3;j++) {
        ctx.beginPath();
        ctx.moveTo(cx+r*.4,cy+r);
        ctx.bezierCurveTo(cx-r*1.15,cy+r*.9,cx-r*1.25,cy-r*.9,cx-r*.15,cy-r*.8);
        ctx.bezierCurveTo(cx+r*.55,cy-r*.75,cx+r*.55,cy-r*.05,cx+r*.1,cy-r*.1);
        ctx.lineWidth=j===0?3.5:1.2;ctx.strokeStyle=`rgba(239,243,224,${.5-j*.13})`;ctx.stroke();
        ctx.translate(-3,4);
      }
      ctx.restore();

      for(const p of foam) {
        const y=p.y*h+Math.sin(p.phase+t*3)*6;
        const x=front(y)-p.spread*p.spread*w*.043+Math.sin(p.phase+t*4)*5;
        ctx.beginPath();ctx.ellipse(x,y,1+p.r*3.5,.6+p.r*1.7,-.6,0,TAU);
        ctx.fillStyle=`rgba(244,246,229,${(.3+p.r*.5)*fade})`;ctx.fill();
        // A few small drops leave the crest; no close-up lens droplets or noise.
        if(p.spread>.85) {
          const life=(t*1.7+p.drift)%1;
          const sx=front(y)+10+Math.sin(life*Math.PI)*(15+p.speed*38);
          const sy=y-life*28+life*life*45;
          ctx.beginPath();ctx.ellipse(sx,sy,.7+p.r*1.1,1.5+p.r*2,-.5,0,TAU);
          ctx.fillStyle=`rgba(239,243,224,${(1-life)*fade*.75})`;ctx.fill();
        }
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
