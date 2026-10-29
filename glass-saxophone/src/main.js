import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const host = document.querySelector('#scene');
const status = document.querySelector('#status');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
} catch (e) {
  status.textContent = 'The 3D scene needs WebGL. Open this page in a browser with hardware acceleration enabled.';
  document.body.classList.add('unavailable');
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x000000);
host.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label', 'Gold saxophone encircled by three clear beveled crystal bands. Drag to rotate.');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
camera.position.set(6.7, 3.6, 15.6);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.35, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 11;
controls.maxDistance = 23;
controls.minPolarAngle = 0.45;
controls.maxPolarAngle = 2.5;
controls.autoRotate = !motion.matches;
controls.autoRotateSpeed = 0.22;

// Reflection-only studio. Black remains black in the visible scene.
const studio = new THREE.Scene();
studio.background = new THREE.Color(0x101217);
const card = (x,y,z,w,h,color,power) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({color, side:THREE.DoubleSide}));
  m.material.color.multiplyScalar(power); m.position.set(x,y,z); m.lookAt(0,0,0); studio.add(m);
};
card(-5,3,3,1.1,11,0xffffff,6);
card(4,2,1,0.5,10,0xffe1b0,6);
card(0,7,-1,7,2,0xffffff,5);
card(0,1,-6,6,1.3,0xe1edff,5);
card(-3,-2,-4,0.5,7,0x9fc6ff,3);
card(5,-2,-2,0.4,6,0xffd59d,2);
const pmrem = new THREE.PMREMGenerator(renderer);
const env = pmrem.fromScene(studio, 0.02, 0.1, 50);
scene.environment = env.texture;
pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xdce6ff,0x443017,0.5));
const key = new THREE.DirectionalLight(0xffedd2,3.2);key.position.set(-4,6,6);scene.add(key);
const rim = new THREE.DirectionalLight(0xb8d4ff,2);rim.position.set(4,3,-4);scene.add(rim);

const sculpture = new THREE.Group(); scene.add(sculpture);
const sax = new THREE.Group(); sculpture.add(sax); sax.rotation.z = 0.13;
const gold = new THREE.MeshPhysicalMaterial({color:0xd9a449,metalness:1,roughness:0.19,clearcoat:0.3,clearcoatRoughness:0.12,envMapIntensity:1.35});
const polished = gold.clone(); polished.color.set(0xf2c76f);polished.roughness=0.12;
const darkGold = gold.clone();darkGold.color.set(0x76521b);darkGold.roughness=0.27;
const black = new THREE.MeshPhysicalMaterial({color:0x080b0e,metalness:0.1,roughness:0.18,clearcoat:1});
const pearl = new THREE.MeshPhysicalMaterial({color:0xe5ddc8,roughness:0.23,metalness:0.05,clearcoat:0.8});
const pad = new THREE.MeshStandardMaterial({color:0x3a2112,roughness:0.7});
function mesh(geo,mat,parent=sax){const o=new THREE.Mesh(geo,mat);parent.add(o);return o;}
function rod(a,b,r=0.025,mat=polished,parent=sax){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
  const o=mesh(new THREE.CylinderGeometry(r,r,delta.length(),12),mat,parent);
  o.position.copy(start).add(end).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;
}
function sphere(p,r,mat=polished,parent=sax){const o=mesh(new THREE.SphereGeometry(r,16,12),mat,parent);o.position.set(...p);return o;}
function tube(points,r,mat=gold,parent=sax){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,100,r,20,false),mat,parent);}
function torus(p,r,t=.02,mat=polished,parent=sax){const o=mesh(new THREE.TorusGeometry(r,t,10,64),mat,parent);o.position.set(...p);return o;}

// Tapered body, rising neck, and the characteristic bowed lower section.
const body=mesh(new THREE.CylinderGeometry(.155,.32,4.75,64,1,true),gold);body.position.set(-.25,.25,0);
const neckPoints=[[-.25,2.62,0],[-.3,3.0,0],[-.55,3.35,0],[-1.04,3.56,0],[-1.58,3.59,0],[-2.0,3.68,0]];
tube(neckPoints,.13,polished);
tube([[-.25,-2.10,0],[-.16,-2.62,0],[.25,-2.91,0],[.79,-2.73,0],[1.02,-2.21,0],[1.04,-1.60,0]],.31,gold);
const mouth=mesh(new THREE.ConeGeometry(.17,.83,32),black);mouth.rotation.z=Math.PI/2+.13;mouth.position.set(-2.3,3.74,0);
const reed=mesh(new THREE.BoxGeometry(.53,.035,.19),darkGold);reed.position.set(-2.22,3.62,.015);
for(const x of [-1.96,-1.83]){const o=torus([x,3.67,0],.153,.022);o.rotation.y=Math.PI/2;}
rod([-1.95,3.84,.12],[-1.76,3.86,.12],.025);sphere([-1.84,3.86,.13],.055);
for(const y of [2.48,2.62]){const o=torus([-.25,y,0],.17,.025);o.rotation.x=Math.PI/2;}
// Hollow bell: the profile travels up the outer wall and down the inner wall.
const profile=[ [.28,-1.75],[.31,-1.4],[.33,-1.05],[.37,-.73],[.44,-.4],[.58,-.1],[.79,.13],[.87,.20],[.88,.24],[.85,.27],[.78,.23],[.56,.00],[.42,-.33],[.35,-.7],[.30,-1.1],[.27,-1.5] ];
const bellGroup=new THREE.Group();sax.add(bellGroup);bellGroup.position.set(1.02,-.02,0);bellGroup.rotation.z=-.29;bellGroup.rotation.x=.18;
mesh(new THREE.LatheGeometry(profile.map(([x,y])=>new THREE.Vector2(x,y)),96),gold,bellGroup);
const lip=torus([0,.235,0],.852,.035,polished,bellGroup);lip.rotation.x=Math.PI/2;
const throat=mesh(new THREE.CircleGeometry(.27,48),darkGold,bellGroup);throat.rotation.x=-Math.PI/2;throat.position.y=-1.48;
// Bell brace and engraved ornamental flourishes.
rod([-.12,-1.20,0],[.94,-1.05,0],.045,darkGold);
for(let i=0;i<6;i++){
  const a=i*.5;
  tube([[1.25+Math.sin(a)*.08,-.90+i*.1,.36],[1.38+Math.sin(a+1)*.09,-.84+i*.1,.39],[1.42+Math.sin(a+2)*.09,-.76+i*.1,.36]],.006,darkGold);
}
// Tone holes, key cups, pearl touches, rods, hinges, springs, and guards.
rod([-.48,-1.94,.24],[-.48,2.31,.24],.037);
rod([.04,-1.93,.18],[.04,2.37,.18],.025);
const keys=[];
for(let i=0;i<12;i++){
  const y=2.22-i*.34,r=.12+i*.006,x=-.22+(i%2 ? .10 : -.03),z=.20+i*.003;
  const hole=mesh(new THREE.CylinderGeometry(r*.87,r*.87,.055,32),pad);hole.rotation.x=Math.PI/2;hole.position.set(x,y,z);
  const ring=torus([x,y,z+.04],r,.016);ring.rotation.z=.1;
  const cup=mesh(new THREE.CylinderGeometry(r,r*.9,.055,40),polished);cup.rotation.x=Math.PI/2;cup.position.set(x,y+.035,z+.095);keys.push(cup);
  rod([-.48,y+.1,.24],[x,y+.035,z+.12],.021);
  const hinge=mesh(new THREE.CylinderGeometry(.052,.052,.11,16),gold);hinge.position.set(-.48,y+.09,.24);
  sphere([-.48,y+.15,.24],.035,darkGold);
  if([1,2,3,5,6,7].includes(i)){
    const touch=mesh(new THREE.SphereGeometry(.083,24,12),pearl);touch.scale.set(1,1,.25);touch.position.set(x,y+.035,z+.14);
  }
  rod([.04,y-.09,.18],[x,y-.05,z+.06],.012,darkGold);
}
for(let i=0;i<4;i++){
  const y=.4-i*.24;
  rod([.04,y,.1],[.27,y+.03,.14],.02);
  const side=mesh(new RoundedBoxGeometry(.19,.1,.05,2,.02),polished);side.position.set(.27,y+.03,.14);side.rotation.z=.2;
}
for(let i=0;i<3;i++){
  const y=-1.16-i*.45,x=.49+i*.08;
  const c=mesh(new THREE.CylinderGeometry(.19,.19,.05,40),gold);c.rotation.x=Math.PI/2;c.position.set(x,y,.30);
  torus([x,y,.34],.19,.023);
  tube([[x-.22,y-.24,.32],[x-.28,y,.48],[x,y+.27,.50],[x+.28,y,.48],[x+.23,y-.23,.32]],.025,polished);
}
tube([[-.28,2.76,.13],[-.05,3.1,.17],[-.50,3.54,.15],[-1.39,3.73,.14]],.018,polished);
for(let i=0;i<4;i++){sphere([-.51,2.9+i*.15,.13],.04);}
const strap=torus([-.45,.6,-.24],.095,.022);strap.rotation.y=.4;
sax.position.y=.15;

// Crystal bands: closed rectangular glass frames with straight chamfered corners and flat-bevelled
// edges (faceted, not rounded), tall thick walls, tilted down to the right like the reference art.
const BAND={w:5.7,d:1.6,wall:.36,height:.42,corner:.3,bevel:.08};
function chamferPath(path,w,h,c,reverse=false){
  const x=w/2,y=h/2,pts=[[-x+c,-y],[x-c,-y],[x,-y+c],[x,y-c],[x-c,y],[-x+c,y],[-x,y-c],[-x,-y+c]];
  if(reverse)pts.reverse();
  path.moveTo(...pts[0]);for(const q of pts.slice(1))path.lineTo(...q);path.closePath();return path;
}
const shape=chamferPath(new THREE.Shape(),BAND.w,BAND.d,BAND.corner);
shape.holes.push(chamferPath(new THREE.Path(),BAND.w-2*BAND.wall,BAND.d-2*BAND.wall,BAND.corner*.55,true));
const glassGeometry=new THREE.ExtrudeGeometry(shape,{depth:BAND.height,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:BAND.bevel,bevelThickness:BAND.bevel,curveSegments:1});
glassGeometry.center();glassGeometry.rotateX(Math.PI/2);
// Glass-only studio: many bright strip lights (warm, cool and white) so every facet catches a highlight.
// The visible background stays black; the gold keeps the original studio.
const glassStudio=new THREE.Scene();glassStudio.background=new THREE.Color(0x05060a);
// soft fall-off so flat faces show a gradient, not a solid block of light
const falloff=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,4,64,64,64);r.addColorStop(0,'#fff');r.addColorStop(.45,'#bbb');r.addColorStop(1,'#000');g.fillStyle=r;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const strip=(x,y,z,w,h,color,power,soft=false)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,map:soft?falloff:null}));m.material.color.multiplyScalar(power);m.position.set(x,y,z);m.lookAt(0,0,0);glassStudio.add(m);};
strip(-6,2,4,1.2,12,0xffffff,14);strip(6,1,3,.8,12,0xffffff,12);strip(0,8,2,10,1.4,0xffffff,12);
strip(0,-7,3,10,1,0xdfe9ff,8);strip(-4,-1,-6,.7,9,0x8fb8ff,9);strip(5,-1,-5,.7,9,0xffb15a,9);
strip(3,5,-5,6,.6,0xffe6c0,8);strip(-6,-4,1,.6,6,0xff9a3c,7);strip(2,-3,7,.5,6,0x9cc4ff,7);
// large softboxes: the broad glow the glass shows in the reference
// saturated warm/cool strips toward the band ends: the rainbow fringes
strip(-7,0,2,.35,8,0xff6a1a,10);strip(-7,1,-1,.35,8,0x2f7bff,10);strip(7,0,1,.35,8,0xff8a2a,10);strip(7,-1,-2,.35,8,0x3a8cff,10);strip(-3,6,4,5,.3,0xb06bff,8);strip(3,-6,4,5,.3,0xffb030,8);
strip(-5,4,6,7,7,0xffffff,7,true);strip(6,3,5,6,8,0xfff1de,6,true);strip(0,-5,6,9,4,0xe8f0ff,5,true);strip(0,4,-7,10,5,0xdde8ff,5,true);
const glassPmrem=new THREE.PMREMGenerator(renderer);const glassEnv=glassPmrem.fromScene(glassStudio,0,.1,50).texture;glassPmrem.dispose();
const glassMaterial=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:0,transmission:1,opacity:1,ior:1.55,thickness:.6,dispersion:3,
  attenuationColor:0xffffff,attenuationDistance:Infinity,envMap:glassEnv,envMapIntensity:2.4,specularIntensity:1,
  iridescence:.85,iridescenceIOR:1.8,iridescenceThicknessRange:[250,900]});
// Real-time transmission doesn't bounce light inside the glass, so the bands would refract black.
// This additive back-face layer stands in for those internal reflections: inner faces mirror the
// strip-light studio, black stays black wherever nothing reflects.
const innerLight=new THREE.MeshPhysicalMaterial({color:0x8a8a8a,metalness:1,roughness:.08,envMap:glassEnv,envMapIntensity:1,
  iridescence:.6,iridescenceIOR:1.8,iridescenceThicknessRange:[250,900],side:THREE.BackSide,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
// Edge glow: the reference's bright, colour-fringed bevels. Faces seen edge-on (bevels, band ends,
// inner walls) light up white with an amber/blue tint; faces seen square-on keep only a faint grey fill.
const edgeGlow=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
  uniforms:{fill:{value:.08},power:{value:2.1},gain:{value:1.5}},
  vertexShader:`varying vec3 vN;varying vec3 vV;varying vec3 vP;
    void main(){vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);vP=position;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader:`uniform float fill,power,gain;varying vec3 vN;varying vec3 vV;varying vec3 vP;
    void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),power);
      // dispersion-like fringe: warm amber against cool blue, as in the reference (no greens)
      float s=.5+.5*sin(f*7.+vP.x*1.1);
      vec3 spec=mix(vec3(1.,.55,.18),vec3(.35,.6,1.),s);
      vec3 c=mix(vec3(1.),spec,.5*smoothstep(.15,.6,f));
      gl_FragColor=vec4(c*(fill+gain*f),1.);}`});
const bands=new THREE.Group();sculpture.add(bands);
const bandLayout=[{x:-.25,y:2.1,rz:-.4},{x:.05,y:.05,rz:-.37},{x:.3,y:-1.95,rz:-.39}];
for(const L of bandLayout){
  const ring=mesh(glassGeometry,glassMaterial,bands);
  ring.position.set(L.x,L.y,0);
  ring.rotation.set(.28,.22,L.rz);
  const inner=mesh(glassGeometry,innerLight,ring);inner.renderOrder=1;
  const glow=mesh(glassGeometry,edgeGlow,ring);glow.renderOrder=2;
}
sculpture.rotation.y=-.16;

let paused=motion.matches, glassVisible=true, view=0, lastInteraction=0;
const views=[{pos:[6.7,3.6,15.6],target:[0,.35,0],name:'THE ORIGINAL'},{pos:[-8.6,4.6,14.4],target:[0,.35,0],name:'ANOTHER PERSPECTIVE'},{pos:[4.0,2.4,11.5],target:[.0,.45,0],name:'IN THE DETAILS'}];
let transition=null;
function selectView(n){
  view=(n+views.length)%views.length;const v=views[view];
  transition={start:performance.now(),from:camera.position.clone(),to:new THREE.Vector3(...v.pos),targetFrom:controls.target.clone(),targetTo:new THREE.Vector3(...v.target)};
  document.querySelector('#chapter').textContent=`0${view+1} / ${v.name}`;
  document.querySelectorAll('.dot').forEach((d,i)=>{d.classList.toggle('active',i===view);d.setAttribute('aria-pressed',String(i===view));});
}
document.querySelector('#next').addEventListener('click',()=>selectView(view+1));
document.querySelector('#back').addEventListener('click',()=>selectView(view-1));
document.querySelectorAll('.dot').forEach((d,i)=>d.addEventListener('click',()=>selectView(i)));
document.querySelector('#pause').setAttribute('aria-pressed',String(paused));
document.querySelector('#pause').textContent=paused?'Resume motion':'Pause motion';
document.querySelector('#pause').addEventListener('click',e=>{paused=!paused;e.currentTarget.textContent=paused?'Resume motion':'Pause motion';e.currentTarget.setAttribute('aria-pressed',String(paused));});
document.querySelector('#glass').addEventListener('click',e=>{glassVisible=!glassVisible;bands.visible=glassVisible;e.currentTarget.setAttribute('aria-pressed',String(glassVisible));e.currentTarget.textContent=glassVisible?'Glass on':'Glass off';});
document.querySelector('#reset').addEventListener('click',()=>selectView(0));
controls.addEventListener('start',()=>{lastInteraction=performance.now();transition=null;});
controls.addEventListener('end',()=>lastInteraction=performance.now());
function resize(){const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();
let hidden=document.hidden;
document.addEventListener('visibilitychange',()=>{hidden=document.hidden;});
motion.addEventListener('change',()=>{paused=motion.matches;document.querySelector('#pause').textContent=paused?'Resume motion':'Pause motion';document.querySelector('#pause').setAttribute('aria-pressed',String(paused));});
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();status.textContent='The graphics session paused. Reload to restore the scene.';document.body.classList.remove('ready');});
const clock=new THREE.Clock();
renderer.setAnimationLoop(()=>{
  if(hidden)return;
  const delta=Math.min(clock.getDelta(),.05),now=performance.now();
  if(transition){const t=motion.matches?1:Math.min(1,(now-transition.start)/1200),s=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,s);controls.target.lerpVectors(transition.targetFrom,transition.targetTo,s);if(t===1)transition=null;}
  controls.autoRotate=!paused&&!transition&&now-lastInteraction>3000;
  controls.update(delta);renderer.render(scene,camera);
  if(!document.body.classList.contains('ready')){document.body.classList.add('ready');status.textContent='';window.__GROOVE_READY__={meshes:renderer.info.render.calls,triangles:renderer.info.render.triangles,three:THREE.REVISION};}
});
