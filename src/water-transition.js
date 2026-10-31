// Broad sage silhouettes and a few flowing contours keep the cover wipe graphic.
const TAU = Math.PI * 2;
const clamp = n => Math.min(1, Math.max(0, n));
function random(seed) {
  let n = seed;
  return () => { n = Math.imul(1664525, n) + 1013904223 | 0; return (n >>> 0) / 4294967296; };
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
  const rand = random(316);
  const foam = Array.from({length: full ? 0 : 130}, () => ({y:rand(),spread:rand(),r:rand(),phase:rand()*TAU,speed:rand(),drift:rand()}));
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
      const front = y => head + Math.sin(y/h*3.5-t*1.5)*w*.085;
      function sheet(offset, width, color) {
        ctx.beginPath();
        ctx.moveTo(front(-20)-offset,-20);
        for(let y=-20;y<=h+20;y+=10)ctx.lineTo(front(y)-offset,y);
        for(let y=h+20;y>=-20;y-=10)ctx.lineTo(front(y)-offset-width,y);
        ctx.closePath();ctx.fillStyle=color;ctx.fill();
      }
      // One opaque wave hides the page swap at its midpoint.
      const body=ctx.createLinearGradient(head-w,0,head,0);
      body.addColorStop(0,'#799885');body.addColorStop(1,'#9eb69e');
      sheet(0,w*1.7,body);
      sheet(0,w*.022,'#edf1e3');
      sheet(w*.022,w*.045,'#c9dac3');
      for(let j=0;j<3;j++) {
        ctx.beginPath();
        for(let y=-20;y<=h+20;y+=10) {
          const x=front(y)-w*(.1+j*.047)+Math.sin(y/h*4+j)*w*.009;
          y===-20?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.lineWidth=1.5;ctx.strokeStyle='rgba(233,240,222,.35)';ctx.stroke();
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
