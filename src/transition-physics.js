// Foreground actions drive the reveal. Coordinates are CSS pixels, not slide text.
export const clamp = value => Math.max(0, Math.min(1, value));
const smooth = x => { x=clamp(x); return x*x*(3-2*x); };
const ink = '#204c50', orange = '#ef8658';
function path(ctx, points, stroke, width=1) {
  ctx.beginPath();points(ctx);ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();
}
function ellipse(ctx,x,y,rx,ry,color) {ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function image(ctx,img,x,y,w,angle=0,alpha=1) {
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(img,-w/2,-w*260/720,w,w*260/360);ctx.restore();
}
function fish(ctx,x,y,size,time,dir=1) {
  ctx.save();ctx.translate(x,y);ctx.scale(dir*size,size);ctx.rotate(Math.sin(time*18)*.025);
  const fill=ctx.createLinearGradient(0,-20,0,20);fill.addColorStop(0,'#34646a');fill.addColorStop(.48,'#a8c2b6');fill.addColorStop(.65,'#d5ddd0');fill.addColorStop(1,'#577f7a');
  const tail=Math.sin(time*40)*10;
  ctx.beginPath();ctx.moveTo(-33,0);ctx.bezierCurveTo(-6,-25,26,-20,43,0);ctx.bezierCurveTo(23,22,-8,22,-33,0);ctx.lineTo(-58,-19+tail);ctx.lineTo(-53,tail);ctx.lineTo(-58,19+tail);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#2a5359';ctx.lineWidth=.7;ctx.stroke();
  path(ctx,c=>{c.moveTo(3,-17);c.quadraticCurveTo(-6,0,4,16);c.moveTo(-9,-18);c.lineTo(4,-29);c.lineTo(17,-17);},'#48736f',1);
  for(let i=0;i<7;i++)path(ctx,c=>{c.moveTo(-25+i*7,-8);c.quadraticCurveTo(-20+i*7,0,-25+i*7,8);},'#e0eee43d',.6);
  ellipse(ctx,28,-3,2.8,2.8,'#142e35');ellipse(ctx,28.8,-3.8,.8,.8,'#dbe8da');ctx.restore();
}
function ocean(ctx,W,H,y,t,opacity=1) {
  ctx.save();ctx.globalAlpha=opacity;
  const gradient=ctx.createLinearGradient(0,y,0,H);gradient.addColorStop(0,'#76a99c');gradient.addColorStop(.15,'#386f70');gradient.addColorStop(1,'#123941');
  ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,y);
  for(let x=0;x<=W+20;x+=20)ctx.lineTo(x,y+Math.sin(x/70+t*9)*3+Math.sin(x/31-t*15)*1.5);
  ctx.lineTo(W,H);ctx.closePath();ctx.fillStyle=gradient;ctx.fill();
  for(let i=0;i<12;i++) {
    const yy=y+10+i*14;
    path(ctx,c=>{c.moveTo(0,yy);for(let x=0;x<=W;x+=30)c.lineTo(x,yy+Math.sin(x/55+i+t*8)*2);},`rgba(195,226,211,${.12-i*.008})`,1);
  }
  ctx.restore();
}
function splash(ctx,x,y,t,scale=1) {
  for(let i=0;i<23;i++) {
    const angle=-Math.PI*(.12+(i%11)/13), speed=(70+i%5*27)*scale;
    const age=t*.8;
    const xx=x+Math.cos(angle)*speed*age, yy=y+Math.sin(angle)*speed*age+260*scale*age*age;
    ellipse(ctx,xx,yy,(1+i%3*.5)*scale,(1.6+i%3)*scale,`rgba(212,236,221,${clamp(1-t)})`);
  }
}
function circleMask(r,x=50,y=50) {return `circle(${Math.max(0,r)*150}% at ${x}% ${y}%)`;}
const leftMask = r => `inset(0 ${100*(1-clamp(r))}% 0 0)`;
const bottomMask = r => `inset(${100*(1-clamp(r))}% 0 0)`;
function mesh(ctx,x,y,w,h,open) {
  ctx.save();ctx.strokeStyle='#7eaaa2';ctx.lineWidth=1.3;
  for(let side of [-1,1]) {
    const shift=side*open*w*.65;
    ctx.save();ctx.beginPath();ctx.rect(x+(side<0?-w/2:0)+shift,y,w/2,h);ctx.clip();
    for(let i=-h;i<w+h;i+=22)path(ctx,c=>{c.moveTo(x-w/2+i+shift,y);c.lineTo(x-w/2+i+h+shift,y+h);c.moveTo(x-w/2+i+shift,y+h);c.lineTo(x-w/2+i+h+shift,y);},'#8eb3a8',1);
    ctx.restore();path(ctx,c=>{c.moveTo(x+shift,y);c.lineTo(x+shift,y+h);},'#d1d8bf',3);
  }ctx.restore();
}

export function paintTransition(ctx, state) {
  const {W,H,t,kind,img,mechanism,anchor,backwards}=state;
  const {x,y,w}=anchor;
  const r=smooth((t-.32)/.6), fade=1-smooth((t-.72)/.28);
  let clip=leftMask(r), opacity=1, phase=t<.32?'actuate':t<.7?'handoff':'settle';
  ctx.clearRect(0,0,W,H);
  const fixed=(alpha=fade)=>image(ctx,img,x,y,w,0,alpha);
  switch(kind) {
    case 'reel-cast': {
      fixed();
      const spool=.24*w;
      path(ctx,c=>{c.arc(x-w*.12,y,spool*.36,t*24,t*24+Math.PI*1.5);},'#f79c60',2);
      const head=clamp(t/.7)*W*1.45;
      path(ctx,c=>{c.moveTo(x-w*.23,y-w*.06);c.quadraticCurveTo(x-head*.4,y-H*.32,W-head,H*.35);},'#c9875c',1.5);
      ellipse(ctx,W-head,H*.35,3,3,orange);
      clip=`inset(0 0 0 ${100*(1-r)}%)`;break;
    }
    case 'pin-drop': {
      const impact=clamp(t/.27);
      image(ctx,img,x,y-(1-impact*impact)*Math.min(150,H*.2)+Math.sin(clamp((t-.27)/.25)*Math.PI)*-8,w,0,fade);
      if(t>.27)for(let i=0;i<3;i++) {
        const radius=clamp((t-.27-i*.06)/.65)*Math.max(W,H)*1.15;
        ctx.save();ctx.globalAlpha=(1-r)*.6;path(ctx,c=>c.ellipse(x,y+w*.27,radius,radius*.45,0,0,Math.PI*2),'#8ba994',1.2);ctx.restore();
      }
      clip=circleMask(r,x/W*100,(y+w*.27)/H*100);break;
    }
    case 'cable-trace': {
      fixed();const reach=smooth(t/.7);
      path(ctx,c=>{c.moveTo(x,y);c.lineTo(W*.55,y);c.lineTo(W*.55,H*.32);c.lineTo(W*.55+W*.5*reach,H*.32);},'#638f85',3);
      ellipse(ctx,W*.55+W*.5*reach,H*.32,6,6,orange);clip=leftMask(r);break;
    }
    case 'net-release': {
      const open=smooth((t-.12)/.55);const netW=Math.min(W*.62,520), netH=H*.48;
      const tension=smooth(t/.25);
      mesh(ctx,x+(W*.46-x)*tension,y-w*.3+(H*.24-y+w*.3)*tension,w*.64+(netW-w*.64)*tension,w*.48+(netH-w*.48)*tension,open);
      if(t>.2)for(let i=0;i<4;i++)fish(ctx,W*.43+(t-.2)**1.3*W*1.7-i*57,H*(.39+i*.075),.7+i*.12,t+i,1);
      clip=circleMask(r,48,53);break;
    }
    case 'chip-boot': {
      fixed();
      for(let i=0;i<7;i++) {
        const yy=H*(.18+i*.105), reach=clamp((t-i*.025)/.65);
        path(ctx,c=>{c.moveTo(x,y);c.lineTo(x-W*.14,y);c.lineTo(x-W*.14,yy);c.lineTo((x-W*.14)*(1-reach),yy);},'#7a9e91',1.8);
        ellipse(ctx,(x-W*.14)*(1-reach),yy,3,3,orange);
      }
      clip=`inset(0 0 0 ${100*(1-r)}%)`;break;
    }
    case 'lure-plunge': {
      const water=H*.66, fall=clamp(t/.42);
      const lureY=y+(water-y)*fall*fall;
      image(ctx,img,x,lureY,w,Math.sin(t*12)*.035,1-smooth((t-.5)/.2));
      ocean(ctx,W,H,water,t,clamp(t/.2)*(1-r));
      path(ctx,c=>{c.moveTo(x,0);c.quadraticCurveTo(x-14,lureY*.5,x,lureY-w*.3);},'#9ebeb1',1);
      if(t>.4)splash(ctx,x,water,(t-.4)*1.7,Math.min(1.4,W/800));
      clip=bottomMask(r);break;
    }
    case 'turtle-swim': {
      // The detailed DOM turtle supplies articulated flippers; this is its displaced water.
      const tx=x+(backwards?1:-1)*smooth(t)*W*1.1;
      for(let i=0;i<5;i++)path(ctx,c=>{c.moveTo(tx+(backwards?-1:1)*(w*.2+i*17),y+15+i*7);c.quadraticCurveTo(tx+(backwards?-1:1)*(w*.4+i*17),y+25+i*7,tx+(backwards?-1:1)*(w*.6+i*17),y+13+i*7);},`rgba(127,173,156,${fade*.35})`,1);
      clip='inset(0)';opacity=r;break;
    }
    case 'compass-bearing': {
      fixed();
      const turn=smooth(t/.45)*Math.PI*.6;
      image(ctx,mechanism,x,y,w,turn,fade);
      const reach=smooth((t-.25)/.65);
      path(ctx,c=>{c.moveTo(x,y);c.lineTo(x+(W-x)*reach,y-(y-H*.22)*reach);},'#729684',2);
      ellipse(ctx,x+(W-x)*reach,y-(y-H*.22)*reach,4,4,orange);clip=`polygon(0 0,${r*200}% 0,0 ${r*200}%)`;break;
    }
    case 'motorboat': {
      // The hull stays on the water; acceleration produces a stern wake and bow spray.
      const speed=clamp((t-.05)/.68), travel=speed*speed;
      const boatW=Math.min(W*.6,Math.max(w,340));
      const water=Math.min(H*.8,y+boatW*.28);
      const bx=x+travel*(W+boatW-x);
      const dive=smooth((t-.27)/.24), emerge=smooth((t-.55)/.4);
      const level=water-dive*(water+35)+emerge*(H+45);
      const hullY=water-boatW*.28;
      image(ctx,img,bx,hullY,boatW,-Math.sin(speed*Math.PI)*.025,1);
      // Foreground water cuts the lower hull at the waterline and occludes it as the wave arrives.
      ocean(ctx,W,H,level,t,1);
      const stern=bx-boatW*.45;
      if(level>water-8&&t<.5)for(let i=0;i<9;i++) {
        const len=(45+i*15)*speed;
        path(ctx,c=>{c.moveTo(stern,water-i*.5);c.quadraticCurveTo(stern-len*.4,water+8+i*2,stern-len,water+3+i*3);},`rgba(224,242,228,${.7-i*.05})`,1.7);
      }
      if(level>water-8&&t<.5)splash(ctx,bx+boatW*.43,water,clamp(speed*.8),.35);
      phase=t<.27?'accelerate':t<.55?'bow-wave':'wake-clears';clip=t<.49?leftMask(0):'inset(0)';break;
    }
    case 'market-rings': {
      const radius=Math.min(W,H)*(.35-.28*smooth(t/.4));
      for(let i=0;i<3;i++)path(ctx,c=>c.arc(W*.46,H*.52,radius+i*13,0,Math.PI*2),i===2?'#d78a61':'#638d80',2+i);
      ellipse(ctx,W*.46,H*.52,4,4,orange);clip=circleMask(r,46,52);break;
    }
    case 'microphone-record': {
      fixed();
      for(let i=0;i<48;i++) {
        const beat=Math.sin(i*1.8-t*26)**2;
        const amp=(10+beat*H*.13)*Math.sin(Math.PI*clamp(t/.85));
        const xx=i/47*W;
        path(ctx,c=>{c.moveTo(xx,H*.58-amp);c.lineTo(xx,H*.58+amp);},i%6===0?orange:'#779f90',2);
      }
      clip=bottomMask(r);break;
    }
    case 'book-turn': {
      fixed();
      const flip=smooth(t/.65)*Math.PI;
      ctx.save();ctx.translate(x,y);ctx.scale(Math.cos(flip),1);ctx.fillStyle='#e3e6d5';ctx.fillRect(0,-w*.22,w*.34,w*.44);path(ctx,c=>{c.moveTo(0,-w*.22);c.lineTo(0,w*.22);},'#8d9f8b',2);ctx.restore();
      clip=leftMask(r);break;
    }
    case 'camera-shutter': {
      const close=smooth(t/.42), reopen=smooth((t-.5)/.45), iris=1-close+reopen;
      const radius=Math.hypot(W,H)*.65;
      ctx.save();ctx.fillStyle='#173b42';ctx.beginPath();ctx.rect(0,0,W,H);ctx.arc(W*.5,H*.5,Math.max(.01,radius*iris),0,Math.PI*2,true);ctx.fill('evenodd');
      for(let i=0;i<7;i++) {
        const a=i*Math.PI*2/7+close*.45;
        path(ctx,c=>{c.moveTo(W/2+Math.cos(a)*radius*iris,H/2+Math.sin(a)*radius*iris);c.lineTo(W/2+Math.cos(a+.65)*radius,H/2+Math.sin(a+.65)*radius);},'#64827b',1.2);
      }ctx.restore();clip=t>.43?'inset(0)':leftMask(0);break;
    }
    case 'market-filter': {
      fixed();
      for(let i=0;i<32;i++) {
        const age=((t*1.7+i*.037)%1), xx=x+(i%2?1:-1)*(1-age)*w*.26;
        const yy=y-w*.3+age*age*w*.65;
        ellipse(ctx,xx,yy,2,2,i%4===0?orange:'#8eab98');
      }
      clip=bottomMask(r);break;
    }
    case 'sonar-sweep': {
      fixed();
      const angle=t*Math.PI*2;
      const reach=Math.max(W,H)*1.2;
      ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,reach,angle-.3,angle);ctx.closePath();ctx.fillStyle='#83b9a51b';ctx.fill();
      path(ctx,c=>{c.moveTo(0,0);c.lineTo(Math.cos(angle)*reach,Math.sin(angle)*reach);},'#80b49e',1.5);ctx.restore();
      clip=circleMask(r,x/W*100,y/H*100);break;
    }
    case 'target-lock': {
      const fx=W*.45+Math.sin(t*3)*W*.12, fy=H*.48;
      fish(ctx,fx,fy,Math.min(1.7,W/600),t,1);
      const box=90-30*smooth(t/.4);
      ctx.strokeStyle=t>.4?'#80a975':'#c89b68';ctx.lineWidth=2;
      for(let [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]])path(ctx,c=>{c.moveTo(fx+sx*(box-14),fy+sy*box);c.lineTo(fx+sx*box,fy+sy*box);c.lineTo(fx+sx*box,fy+sy*(box-14));},ctx.strokeStyle,2);
      clip=circleMask(r,fx/W*100,48);break;
    }
    case 'sorting-gate': {
      const opening=smooth((t-.12)/.65);
      for(const side of [-1,1]){
        ctx.save();ctx.beginPath();ctx.rect(x+(side<0?-w:0)+side*opening*w*.3,y-w,w,w*2);ctx.clip();image(ctx,img,x+side*opening*w*.3,y,w,0,fade);ctx.restore();
      }
      fish(ctx,W*(.15+smooth(t)*1.05),y,1.3,t,1);clip=`inset(0 ${50*(1-r)}% 0 ${50*(1-r)}%)`;break;
    }
    case 'sensor-assembly': {
      for(let i=-1;i<=1;i++){
        const shift=i*w*.14*smooth(t/.45);
        ctx.save();ctx.beginPath();ctx.rect(x-w/2+(i+1)*w/3+shift,y-w,w/3,w*2);ctx.clip();image(ctx,img,x+shift,y,w,0,fade);ctx.restore();
      }
      for(let i=0;i<3;i++)path(ctx,c=>c.ellipse(x+(i-1)*w*.22*smooth(t/.45),y,w*(.2-i*.035),w*.26,0,0,Math.PI*2),i===1?orange:'#6c9288',2);
      clip=circleMask(r,x/W*100,y/H*100);break;
    }
    case 'balance-settle': {
      const angle=Math.exp(-t*6)*Math.sin(t*22)*.25;
      fixed();ctx.save();ctx.translate(x,y-w*56/360);ctx.rotate(angle);image(ctx,mechanism,0,w*56/360,w,0,fade);ctx.restore();clip=`polygon(0 0,100% 0,100% ${r*100}%,0 ${r*100}%)`;break;
    }
    case 'beacon-triangulate': {
      fixed();
      for(const [xx,yy] of [[W*.2,H*.7],[W*.42,H*.35],[W*.7,H*.25]]) {
        path(ctx,c=>{c.moveTo(x,y);c.lineTo(x+(xx-x)*smooth(t/.55),y+(yy-y)*smooth(t/.55));},'#8ea899',1.5);
        ellipse(ctx,xx,yy,5,5,t>.35?orange:'#86a294');
      }
      clip=circleMask(r,70,25);break;
    }
    case 'comparison-select': {
      const xx=W*.81;
      for(let i=0;i<4;i++) {
        const alpha=clamp((t-i*.075)/.2)*fade;
        ctx.fillStyle=`rgba(144,183,152,${alpha*.3})`;ctx.fillRect(xx-W*.07,H*(.35+i*.11),W*.17,H*.09);
        path(ctx,c=>{c.moveTo(xx,H*(.39+i*.11));c.lineTo(xx+7,H*(.4+i*.11));c.lineTo(xx+20,H*(.375+i*.11));},`rgba(68,119,87,${alpha})`,2);
      }
      clip=`inset(0 ${(1-r)*19}% 0 ${(1-r)*81}%)`;break;
    }
    case 'shield-close': {
      const close=smooth(t/.4);
      ctx.save();ctx.beginPath();ctx.rect(x-w,y-w,w,w*2);ctx.clip();image(ctx,img,x-(1-close)*w*.25,y,w,0,fade);ctx.restore();
      ctx.save();ctx.beginPath();ctx.rect(x,y-w,w,w*2);ctx.clip();image(ctx,img,x+(1-close)*w*.25,y,w,0,fade);ctx.restore();
      if(t>.4)path(ctx,c=>c.arc(x,y,clamp((t-.4)/.5)*Math.max(W,H),0,Math.PI*2),'#88aa91',1);
      clip=circleMask(r,x/W*100,y/H*100);break;
    }
    case 'hooks-safe': {
      fish(ctx,W*(1.1-smooth(t)*1.3),y,1.2,t,-1);clip=`inset(0 0 0 ${(1-r)*100}%)`;break;
    }
    case 'buoy-signal': {
      const water=y+w*.18;
      ocean(ctx,W,H,water,t,(1-r)*.55);
      image(ctx,img,x,y+Math.sin(t*12)*3,w,Math.sin(t*12)*.015,fade);
      const on=t>.25;
      ellipse(ctx,x,y-w*.275,4,4,on?'#bce0a2':orange);
      if(on)for(let i=0;i<3;i++)path(ctx,c=>c.arc(x,y-w*.275,clamp((t-.25-i*.07)/.6)*W*.65,Math.PI*1.1,Math.PI*1.9),'#a0bb91',1);
      clip=bottomMask(r);break;
    }
    case 'coins-budget': {
      const cy=H*.6,cx=W*.47,rad=Math.min(W,H)*.19;
      ctx.strokeStyle='#8ea99a';ctx.lineWidth=20;ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<4;i++) {
        const drop=clamp((t-i*.065)/.42), yy=-30+(cy-26)*drop*drop;
        ellipse(ctx,cx+(i-1.5)*18,yy,11,5,'#c9b88d');path(ctx,c=>{c.ellipse(cx+(i-1.5)*18,yy,11,5,0,0,Math.PI*2);},'#856e4a',1);
        if(drop===1)path(ctx,c=>c.arc(cx,cy,rad,-Math.PI/2+i*Math.PI/2,-Math.PI/2+(i+1)*Math.PI/2-.08),['#295550','#8ab49c','#ee8256','#c6d5b7'][i],20);
      }
      clip=circleMask(r,cx/W*100,cy/H*100);break;
    }
    case 'surface-return': {
      for(let i=0;i<24;i++) {
        const age=(t+i*.027)%1, xx=(i*139%Math.max(1,W)), yy=H*(1-age*1.7);
        path(ctx,c=>c.arc(xx,yy,3+i%5,0,Math.PI*2),'#9abeb0',1);
      }
      clip=`inset(0 0 ${(1-r)*100}% 0)`;break;
    }
    default: fixed();clip=leftMask(r);
  }
  return {clip,opacity,phase};
}
