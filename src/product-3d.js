import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Built as solids, including the back of the display and reel. No rotating image planes.
function buildRod() {
  const assembly = new THREE.Group();
  const rod = new THREE.Group();
  rod.rotation.z = -.34;
  rod.position.x = -.7;
  assembly.add(rod);
  const metal = new THREE.MeshStandardMaterial({ color: 0xbfcbd2, metalness: 1, roughness: .21 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x303b44, metalness: .92, roughness: .27 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x009ed1, metalness: .74, roughness: .22 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x171d21, roughness: .88, bumpScale: .022 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0c1720, metalness: .65, roughness: .26 });
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf4f8f6, metalness: .1, roughness: .19, clearcoat: 1 });
  const orange = new THREE.MeshPhysicalMaterial({ color: 0xf0440b, roughness: .19, clearcoat: 1 });
  const texture = document.createElement('canvas');
  texture.width = texture.height = 128;
  const tx = texture.getContext('2d');
  tx.fillStyle = '#3b4248'; tx.fillRect(0, 0, 128, 128);
  for (let x = -128; x < 256; x += 8) {
    tx.strokeStyle = '#222a30'; tx.lineWidth = 4;
    tx.beginPath(); tx.moveTo(x, 0); tx.lineTo(x + 128, 128); tx.stroke();
    tx.strokeStyle = '#58616a'; tx.lineWidth = 1;
    tx.beginPath(); tx.moveTo(x + 3, 0); tx.lineTo(x + 131, 128); tx.stroke();
  }
  const carbonMap = new THREE.CanvasTexture(texture);
  carbonMap.wrapS = carbonMap.wrapT = THREE.RepeatWrapping;
  carbonMap.repeat.set(3, 18);
  carbonMap.colorSpace = THREE.SRGBColorSpace;
  const carbon = new THREE.MeshPhysicalMaterial({ map: carbonMap, metalness: .72, roughness: .29, clearcoat: 1, clearcoatRoughness: .18 });
  const noise = document.createElement('canvas'); noise.width = noise.height = 128;
  const n = noise.getContext('2d'); const data = n.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 70 + ((i * 7919 % 101) / 101) * 90;
    data.data.set([v, v, v, 255], i);
  }
  n.putImageData(data, 0, 0);
  rubber.bumpMap = new THREE.CanvasTexture(noise);
  rubber.bumpMap.wrapS = rubber.bumpMap.wrapT = THREE.RepeatWrapping;
  rubber.bumpMap.repeat.set(3, 12);

  function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  const cylinder = (parent, x, y, z, top, bottom, length, material) => mesh(new THREE.CylinderGeometry(top, bottom, length, 40), material, parent, x, y, z);
  const sphere = (parent, x, y, z, radius, material, scale = [1, 1, 1]) => {
    const s = mesh(new THREE.SphereGeometry(radius, 32, 24), material, parent, x, y, z); s.scale.set(...scale); return s;
  };
  const box = (parent, x, y, z, w, h, d, material) => mesh(new THREE.BoxGeometry(w, h, d), material, parent, x, y, z);
  function tube(parent, points, radius, material, smooth = true) {
    const curve = smooth ? new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))) : new THREE.LineCurve3(new THREE.Vector3(...points[0]), new THREE.Vector3(...points[1]));
    return mesh(new THREE.TubeGeometry(curve, smooth ? 64 : 1, radius, 8, false), material, parent);
  }
  function ring(parent, x, y, z, radius, thickness, material) {
    return mesh(new THREE.TorusGeometry(radius, thickness, 12, 48), material, parent, x, y, z);
  }
  // Telescopic carbon blank, machined collars and textured EVA grips.
  cylinder(rod, 0, .1, 0, .021, .092, 8.2, carbon);
  cylinder(rod, 0, -3.17, 0, .151, .173, 1.64, rubber);
  cylinder(rod, 0, -4.025, 0, .17, .145, .13, blue);
  cylinder(rod, 0, -4.1, 0, .15, .14, .065, darkMetal);
  sphere(rod, 0, -4.14, 0, .14, black, [1, .25, 1]);
  cylinder(rod, 0, -1.76, 0, .119, .142, .57, rubber);
  for (const [y, r, len, mat] of [[-2.29,.144,.1,blue],[-2.18,.13,.1,metal],[-1.43,.12,.1,blue],[-1.36,.108,.08,metal],[-.7,.095,.12,metal],[-.6,.095,.035,black],[1.1,.065,.07,metal],[2.68,.045,.06,metal],[3.73,.029,.04,metal]]) {
    cylinder(rod, 0, y, 0, r, r, len, mat);
  }
  for (let i = 0; i < 14; i++) cylinder(rod, 0, -2.12 + i * .035, 0, .126, .126, .013, i % 2 ? metal : darkMetal);
  // Six real guide rings and ceramic inserts, with double-foot supports.
  const guides = [[-.35,.19],[1.12,.15],[2.65,.105],[3.67,.075],[4.15,.052]];
  const linePoints = [[.31, -1.45, .22]];
  for (const [y, radius] of guides) {
    const x = .13 + radius;
    const guide = ring(rod, x, y, .015, radius, .013, metal); guide.rotation.x = Math.PI / 2;
    const ceramic = ring(rod, x, y, .015, radius - .016, .008, black); ceramic.rotation.x = Math.PI / 2;
    tube(rod, [[.05,y-.16,0],[x*.8,y-.03,-radius*.65],[x,y,-radius]], .012, metal);
    tube(rod, [[.05,y-.16,0],[x*.8,y-.03,radius*.65],[x,y,radius]], .012, metal);
    linePoints.push([x, y, .02]);
    cylinder(rod, 0, y - .14, 0, .023 + (4-y)*.01, .023 + (4-y)*.01, .1, black);
  }
  const fishingLine = new THREE.MeshPhysicalMaterial({ color: 0x25b7e2, metalness: .25, roughness: .3, transparent: true, opacity: .85 });
  tube(rod, linePoints, .006, fishingLine);

  // Reel: spool, tightly wound line, rotor, bail wire, vented housing and crank.
  const reel = new THREE.Group(); reel.position.set(.47, -1.64, .02); rod.add(reel);
  tube(rod, [[.05,-1.1,0],[.38,-1.21,0],[.46,-1.61,0]], .06, darkMetal);
  sphere(reel, 0, -.18, 0, .245, metal, [.75, 1.2, .75]);
  cylinder(reel, 0, .17, 0, .205, .19, .44, blue);
  cylinder(reel, 0, .17, 0, .174, .174, .5, darkMetal);
  cylinder(reel, 0, .16, 0, .205, .205, .3, blue);
  for (let i = 0; i < 36; i++) {
    const winding = ring(reel, 0, .015 + i * .0083, 0, .205, .0038, i % 3 ? blue : metal);
    winding.rotation.x = Math.PI / 2;
  }
  cylinder(reel, 0, .365, 0, .24, .24, .045, metal);
  cylinder(reel, 0, -.025, 0, .235, .235, .05, metal);
  cylinder(reel, 0, .407, 0, .14, .19, .045, darkMetal);
  sphere(reel, 0, .44, 0, .115, black, [1, .3, 1]);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    sphere(reel, Math.cos(a)*.17, -.16, Math.sin(a)*.17, .055, black, [.5, 1.8, .5]);
  }
  tube(reel, [[-.25,-.06,0],[-.31,.19,.1],[-.2,.51,.17],[.12,.56,.17],[.31,.32,.09],[.26,-.06,0]], .023, metal);
  tube(reel, [[0,-.19,-.1],[.32,-.24,-.12],[.4,-.54,-.12],[.61,-.6,-.08]], .045, metal);
  sphere(reel, .66, -.6, -.08, .13, rubber, [1.4,.7,.75]);
  sphere(reel, .77, -.6, -.03, .065, blue);
  for (const z of [-.16, .16]) cylinder(reel, 0, -.32, z, .04, .04, .08, black);

  // Screen has a machined enclosure, back vents, mount and luminous fish display.
  const screen = new THREE.Group(); screen.position.set(-.32, -1.16, .2); screen.rotation.y = -.12; rod.add(screen);
  box(screen, .15, 0, -.15, .27, .13, .2, black);
  const enclosure = box(screen, -.16, 0, 0, .82, .54, .12, darkMetal);
  const bevel = new THREE.EdgesGeometry(enclosure.geometry, 20);
  const edges = new THREE.LineSegments(bevel, new THREE.LineBasicMaterial({ color: 0x90a5af })); edges.position.copy(enclosure.position); screen.add(edges);
  box(screen, -.16, 0, .068, .73, .45, .025, black);
  const display = document.createElement('canvas'); display.width = 512; display.height = 320;
  const ctx = display.getContext('2d');
  const bg = ctx.createLinearGradient(0,0,512,320); bg.addColorStop(0,'#082a41'); bg.addColorStop(1,'#03121f'); ctx.fillStyle=bg;ctx.fillRect(0,0,512,320);
  ctx.strokeStyle='#12425c'; ctx.lineWidth=1;
  for(let i=0;i<512;i+=32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,320);ctx.stroke();}
  for(let i=0;i<320;i+=32){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke();}
  ctx.shadowColor='#25d8ff';ctx.shadowBlur=20;ctx.strokeStyle='#5fe2ff';ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(95,158);ctx.bezierCurveTo(180,65,300,89,350,153);ctx.lineTo(414,104);ctx.lineTo(401,202);ctx.lineTo(350,169);ctx.bezierCurveTo(260,238,170,227,95,158);ctx.stroke();
  ctx.beginPath();ctx.moveTo(190,112);ctx.lineTo(240,76);ctx.lineTo(265,105);ctx.moveTo(190,116);ctx.quadraticCurveTo(220,157,191,203);ctx.stroke();
  ctx.fillStyle='#caf8ff';ctx.beginPath();ctx.arc(146,148,7,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.font='18px monospace';ctx.fillStyle='#81d6e9';ctx.fillText('BLUE CATCH',24,31);ctx.fillText('LIVE  •  CAMERA',24,294);
  const displayMap = new THREE.CanvasTexture(display); displayMap.colorSpace=THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(.68,.408),new THREE.MeshBasicMaterial({map:displayMap}),screen,-.16,0,.083);
  for (let i=0;i<5;i++) box(screen,-.35+i*.095,0,-.066,.035,.28,.008,black);
  for (const x of [-.5,.18]) for (const y of [-.21,.21]) sphere(screen,x,y,.072,.017,metal,[1,1,.25]);
  box(screen,-.16,-.23,.08,.17,.012,.012,new THREE.MeshBasicMaterial({color:0x24d8ff}));

  // The hanging rig stays in the same turntable coordinate system as the rod.
  rod.updateMatrixWorld(true);
  const tip = new THREE.Vector3(...linePoints.at(-1)).applyMatrix4(rod.matrix);
  const rig = new THREE.Group(); rig.position.set(1.43,0,.03); assembly.add(rig);
  tube(assembly, [[tip.x,tip.y,tip.z],[1.43,3.85,.03],[1.43,2.28,.03]], .0045, metal);
  cylinder(rig, 0, 2.0, 0, .014, .014, .85, black);
  const redLight = new THREE.MeshStandardMaterial({color:0xff451b, emissive:0xff2400,emissiveIntensity:2,roughness:.3});
  const greenLight = new THREE.MeshStandardMaterial({color:0x52ff92, emissive:0x00ff55,emissiveIntensity:1.6,roughness:.3});
  cylinder(rig,0,2.28,0,.023,.023,.13,redLight);
  cylinder(rig,0,2.02,0,.023,.023,.13,greenLight);
  cylinder(rig,0,1.78,0,.023,.023,.13,redLight);
  sphere(rig,0,1.36,0,.14,white,[1,1.55,1]);
  sphere(rig,0,1.21,0,.136,orange,[1,1.25,1]);
  cylinder(rig,0,1.055,0,.05,.025,.11,black);
  cylinder(rig,0,.81,0,.008,.014,.4,metal);
  tube(rig,[[0,.65,0],[.015,-.65,.01],[0,-1.79,0]],.0045,metal);
  for (let i=0;i<3;i++) ring(rig,0,-1.86-i*.065,0,.028,.009,metal);
  const lure = new THREE.Group();lure.position.y=-2.32;rig.add(lure);
  sphere(lure,0,0,0,.16,metal,[.85,1.85,.72]);
  sphere(lure,0,.12,.025,.12,blue,[.65,1.5,.9]);
  cylinder(lure,0,.27,0,.035,.08,.12,darkMetal);
  ring(lure,0,.355,0,.027,.008,metal);
  const lens = cylinder(lure,0,-.16,.105,.063,.063,.04,black);lens.rotation.x=Math.PI/2;
  const glass=new THREE.MeshPhysicalMaterial({color:0x05283e,metalness:.4,roughness:.06,clearcoat:1});
  sphere(lure,0,-.16,.132,.05,glass,[1,1,.25]);
  ring(lure,0,-.16,.13,.063,.009,blue);
  sphere(lure,-.015,-.145,.145,.009,white);
  for (let i=0;i<7;i++) {
    tube(lure,[[-.08,.16-i*.04,.09],[0,.13-i*.04,.119],[.08,.16-i*.04,.09]],.0025,darkMetal);
  }
  ring(lure,0,-.33,0,.027,.009,metal);
  for (let i=0;i<3;i++) {
    const a=i*Math.PI*2/3;const dx=Math.cos(a),dz=Math.sin(a);
    tube(lure,[[0,-.36,0],[0,-.52,0],[dx*.09,-.59,dz*.09],[dx*.13,-.53,dz*.13],[dx*.12,-.46,dz*.12]],.012,metal);
    const barb=mesh(new THREE.ConeGeometry(.02,.07,12),metal,lure,dx*.12,-.45,dz*.12);barb.rotation.z=-dx*.3;
  }
  assembly.userData.materials = { redLight, greenLight };
  return assembly;
}

export function mountProduct(slide) {
  const host=slide.querySelector('#rod-viewport');
  const spinButton=slide.querySelector('#rod-spin');
  const angleLabel=slide.querySelector('[data-rod-angle]');
  let active=false,paused=false,userPaused=false,detail=false,renderer,scene,camera,model,frame=0,last=0,angle=.18,tilt=0,drag,dirty=true;
  const initialAngle=.18;
  function render(now=0) {
    const dt=Math.min((now-last)/1000,.3);last=now;
    if(active&&!paused&&!userPaused&&!drag) angle+=dt*Math.PI*2/16;
    if(model) {
      if(dirty||model.rotation.x!==tilt||model.rotation.y!==angle){
        model.rotation.set(tilt,angle,0);renderer.render(scene,camera);dirty=false;
      }
      host.dataset.angle=angle.toFixed(4);
      angleLabel.textContent=String(Math.floor(((angle-initialAngle)*180/Math.PI%360+360)%360)).padStart(3,'0')+'°';
    }
    frame=active&&!document.hidden?requestAnimationFrame(render):0;
  }
  function resize() {
    if(!renderer)return;
    const r=host.getBoundingClientRect();
    if(!r.width||!r.height)return;
    renderer.setSize(r.width,r.height,false);
    camera.aspect=r.width/r.height;
    camera.position.z=detail?6.3:camera.aspect<.78?15.5:13.5;
    camera.position.y=detail?-1.5:.15;
    camera.lookAt(0,detail?-1.5:.05,0);
    camera.updateProjectionMatrix();
    dirty=true;
    if(!frame)render(performance.now());
  }
  function init() {
    if(renderer)return;
    try {
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio,2));
      renderer.setClearColor(0x000000,0);
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.12;
      host.append(renderer.domElement);
      scene=new THREE.Scene();
      camera=new THREE.PerspectiveCamera(41,1,.1,80);camera.position.set(0,.15,13.5);camera.lookAt(0,.05,0);
      const pmrem=new THREE.PMREMGenerator(renderer);
      const room=new RoomEnvironment();
      scene.environment=pmrem.fromScene(room,.02).texture;room.dispose();pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xe5f5ff,0x46616a,1.35));
      for(const [color,intensity,x,y,z] of [[0xffffff,55,-3,7,5],[0x8adcff,38,4,3,-4],[0xffffff,25,0,1,5]]) {
        const light=new THREE.PointLight(color,intensity,30,2);light.position.set(x,y,z);scene.add(light);
      }
      model=buildRod();scene.add(model);
      host.dataset.ready='true';slide.querySelector('.product-loading').hidden=true;
      resize();
    } catch(error) {
      renderer?.dispose();renderer=undefined;
      host.dataset.ready='false';
      slide.querySelector('.product-loading').textContent='3D VIEW UNAVAILABLE — WEBGL IS REQUIRED';
      spinButton.disabled=true;
      console.warn('Product renderer unavailable:',error);
    }
  }
  new ResizeObserver(resize).observe(host);
  spinButton.addEventListener('click',()=>{
    userPaused=!userPaused;spinButton.setAttribute('aria-pressed',String(userPaused));
    spinButton.setAttribute('aria-label',userPaused?'Resume product rotation':'Pause product rotation');
    spinButton.innerHTML=`<span aria-hidden="true">${userPaused?'▷':'Ⅱ'}</span> ${userPaused?'ROTATION PAUSED':'AUTO ROTATE'}`;
  });
  const detailButton=slide.querySelector('#rod-detail');
  detailButton.addEventListener('click',()=>{
    detail=!detail;detailButton.setAttribute('aria-pressed',String(detail));
    detailButton.textContent=detail?'− FULL VIEW':'+ DETAIL VIEW';resize();
  });
  slide.querySelector('#rod-reset').addEventListener('click',()=>{angle=initialAngle;tilt=0;detail=false;detailButton.setAttribute('aria-pressed','false');detailButton.textContent='+ DETAIL VIEW';resize();});
  host.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY,angle,tilt};host.setPointerCapture(event.pointerId);host.classList.add('is-dragging');});
  host.addEventListener('pointermove',event=>{
    if(!drag)return;
    angle=drag.angle+(event.clientX-drag.x)*.012;tilt=THREE.MathUtils.clamp(drag.tilt+(event.clientY-drag.y)*.004,-.3,.3);
  });
  function release(){drag=undefined;host.classList.remove('is-dragging');}
  host.addEventListener('pointerup',release);host.addEventListener('pointercancel',release);
  host.addEventListener('lostpointercapture',release);
  // Product interaction must not also advance the presentation or trigger a swipe.
  for(const type of ['click','touchstart','touchend'])host.addEventListener(type,event=>event.stopPropagation());
  document.addEventListener('visibilitychange',()=>{if(active&&!document.hidden&&!frame){last=performance.now();render(last);}});
  return {
    setActive(value){active=value;if(value){init();if(!frame){last=performance.now();render(last);}}else{cancelAnimationFrame(frame);frame=0;}},
    setPaused(value){paused=value;}
  };
}
