/* True WebGL ring; the native range remains the keyboard/touch control and fallback. */
(async()=>{
 const host=document.getElementById('tuner3d'),input=document.getElementById('trackTuner');
 if(!host||!input)return;
 let THREE,renderer;
 try{
  THREE=await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 }catch{return;}
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,30);
 camera.position.set(0,.12,8.1);camera.lookAt(0,0,0);
 renderer.setClearColor(0xffffff,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
 const tilt=new THREE.Group(),dial=new THREE.Group();tilt.rotation.x=.08;tilt.rotation.y=.56;tilt.rotation.z=-.16;tilt.add(dial);scene.add(tilt);
 const resources=[];const trackCount=12,tau=Math.PI*2;
 const material=new THREE.LineBasicMaterial({color:0x38332e,transparent:true,opacity:.78});resources.push(material);
 function loop(radius,opacity){
  const points=Array.from({length:257},(_,i)=>new THREE.Vector3(Math.cos(i/256*tau)*radius,Math.sin(i/256*tau)*radius,0));
  const geometry=new THREE.BufferGeometry().setFromPoints(points),mat=material.clone();mat.opacity=opacity;
  resources.push(geometry,mat);dial.add(new THREE.Line(geometry,mat));
 }
 loop(2.68,.25);loop(2.3,.15);
 const points=[];
 for(let i=0;i<144;i++){
  const a=i/144*tau-Math.PI/2,major=i%12===0,r0=major?2.39:2.52;
  points.push(new THREE.Vector3(Math.cos(a)*r0,Math.sin(a)*r0,0),new THREE.Vector3(Math.cos(a)*2.68,Math.sin(a)*2.68,0));
 }
 const ticks=new THREE.BufferGeometry().setFromPoints(points);resources.push(ticks);dial.add(new THREE.LineSegments(ticks,material));
 for(let i=0;i<trackCount;i++){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,128,64);ctx.fillStyle='#52473b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='400 40px monospace';ctx.fillText(String(i+1).padStart(2,'0'),64,32);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const geometry=new THREE.PlaneGeometry(.39,.25),mat=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false});
  const label=new THREE.Mesh(geometry,mat),angle=i/trackCount*tau-Math.PI/2;
  label.position.set(Math.cos(angle)*2.08,Math.sin(angle)*2.08,.008);label.rotation.z=angle+Math.PI/2;
  dial.add(label);resources.push(texture,geometry,mat);
 }
 let target=-(Number(input.value)-1)/trackCount*tau,current=target,raf=null,visible=false,disposed=false,lastTime=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function render(time=0){
  raf=null;if(disposed||!visible)return;
  const dt=lastTime?Math.min(.05,(time-lastTime)/1000):1/60;lastTime=time;
  current=reduced.matches?target:current+(target-current)*(1-Math.exp(-20*dt));
  if(Math.abs(target-current)<.00005)current=target;
  dial.rotation.z=current;renderer.render(scene,camera);
  if(current!==target)raf=requestAnimationFrame(render);
 }
 function wake(){if(!disposed&&visible&&raf===null)raf=requestAnimationFrame(render)}
 function change(){target=-(Number(input.value)-1)/trackCount*tau;wake()}
 function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);wake()}
 function contextLost(event){event.preventDefault();host.parentElement.classList.remove('three-ready');dispose()}
 function dispose(){if(disposed)return;disposed=true;if(raf!==null)cancelAnimationFrame(raf);resize.disconnect();intersection.disconnect();input.removeEventListener('input',change);input.removeEventListener('change',change);input.removeEventListener('tuner:move',change);window.removeEventListener('pagehide',dispose);renderer.domElement.removeEventListener('webglcontextlost',contextLost);resources.forEach(r=>r.dispose());renderer.dispose();host.replaceChildren()}
 const resize=new ResizeObserver(size);resize.observe(host);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){target=-(Number(input.value)-1)/trackCount*tau;lastTime=0;wake()}else if(raf!==null){cancelAnimationFrame(raf);raf=null}});intersection.observe(host);
 input.addEventListener('input',change);input.addEventListener('change',change);input.addEventListener('tuner:move',change);
 window.addEventListener('pagehide',dispose,{once:true});renderer.domElement.addEventListener('webglcontextlost',contextLost);
 size();dial.rotation.z=current;renderer.render(scene,camera);host.parentElement.classList.add('three-ready');
})();
