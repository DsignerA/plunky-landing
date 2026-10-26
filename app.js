const $=s=>document.querySelector(s);
const journey=$('#journey'),sleeve=$('#sleeve'),record=$('#heroRecord'),intro=$('.intro'),scene=$('.scene'),collection=$('#collection'),tracks=$('#tracks'),signupPanel=$('#selection'),selectedInfo=$('.selected-info'),needTrack=$('#need-track');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const colors=['#c55b2b','#a87543','#984232','#d09444','#ac6a47','#bd6c37','#9f563d','#a88850','#c27a42','#874b3c','#b58c56','#c65a35'];
const titles=['African Rhythms','Kazi','Funky Wood','Tarishi','Mashariki','Chants','Don’t Give Up','Incognito','Poo Too','Liberation Dues','African Rhythms (45 Version Parts 1 & 2)','Afrobeat'];
let chosen=null,queued=false,confirmed=false;
function jump(p){window.scrollTo({top:journey.offsetTop+(journey.offsetHeight-innerHeight)*p,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
function show(el,opacity,active=false){el.style.opacity=opacity;el.inert=!active;el.style.pointerEvents=active?'auto':'none'}
const buttons=[];
for(let i=1;i<=12;i++){
 const n=String(i).padStart(2,'0'),button=document.createElement('button');button.className='track';const title=titles[i-1],short=title.replace(' (45 Version Parts 1 & 2)',' (45)');button.setAttribute('aria-label',`Select track ${n}: ${title}`);
 button.innerHTML=`<div class="record"><div class="label" style="background:${colors[i-1]}"><small>NAME BRAND RECORDS</small><b>${n}</b><span>GROOVE MAKERS</span><i></i></div></div><div class="track-meta"><span><small>${n}</small>${short}</span><span>↗</span></div>`;
 button.onclick=()=>{chosen=i;confirmed=false;$('#selectedNumber').textContent=n;$('#selectionTitle').textContent=`${title}.`;$('#selectionTitle').classList.toggle('long',title.length>20);$('#modalDescription').textContent=`Your starting point: ${n} · ${title}.`;$('#modalTitle').textContent='Make it yours.';$('.modal-record .label').style.background=colors[i-1];$('#signup').hidden=false;$('#confirmation').hidden=true;buttons.forEach((b,j)=>b.classList.toggle('selected',j===i-1));jump(.76);render()};tracks.append(button);buttons.push(button)
}
function render(){
 const p=clamp((window.scrollY-journey.offsetTop)/(journey.offsetHeight-innerHeight)),mobile=innerWidth<701;
 const pull=ease(p/.22),remove=ease((p-.2)/.17),spread=ease((p-.33)/.14),select=ease((p-.63)/.12),form=ease((p-.79)/.08);
 const selected=chosen!==null;
 sleeve.style.transform=`translateX(${-remove*125}%) rotateY(${-15-pull*8-remove*20}deg) rotateZ(${-7-remove*13}deg)`;sleeve.style.opacity=1-remove;
 record.style.transform=`translateX(${28+pull*45-remove*73}%) rotate(${-12+pull*70+remove*35}deg) scale(${1-spread*.7})`;record.style.opacity=1-ease((p-.35)/.08);
 scene.style.left=`${(mobile?45:64)-remove*(mobile?-5:14)}%`;scene.style.top=`${(mobile?62:48)-remove*(mobile?11:0)}%`;
 intro.style.opacity=1-ease(p/.2);intro.style.transform=`translateY(${-pull*20}px)`;
 const gridVisible=ease((p-.35)/.05)*(1-form);show(collection,gridVisible,p>=.42&&p<.66);
 $('.collection-title').style.opacity=1-select;$('.demo-note').style.opacity=1-select;
 const bounds=tracks.getBoundingClientRect(),cols=mobile?3:4,rows=mobile?4:3;
 const cellW=bounds.width/cols,cellH=bounds.height/rows;
 const size=Math.max(40,Math.min(cellW*(mobile?.73:.7),cellH-(mobile?24:30),mobile?115:165));
 buttons.forEach((button,i)=>{
  const col=i%cols,row=Math.floor(i/cols),gridX=(col+.5)*cellW-size/2,gridY=(row+.5)*cellH-size/2;
  const stackX=bounds.width/2-size/2,stackY=bounds.height/2-size/2;
  let x=stackX+(gridX-stackX)*spread,y=stackY+(gridY-stackY)*spread,scale=2.2-1.2*spread,opacity=1;
  if(select>0){if(selected&&i===chosen-1){const desired=mobile?Math.min(innerWidth*.45,innerHeight*.27):Math.min(innerWidth*.28,innerHeight*.43);const targetX=(mobile?innerWidth*.5:innerWidth*.32)-bounds.left-size/2,targetY=(mobile?innerHeight*.39:innerHeight*.5)-bounds.top-size/2;x+=(targetX-x)*select;y+=(targetY-y)*select;scale+=(desired/size-scale)*select;}else{opacity=1-select;scale*=1-select*.2}}
  button.style.width=size+'px';button.style.height=size+24+'px';button.style.transform=`translate(${x}px,${y}px) rotate(${(1-spread)*(i-5.5)*6}deg) scale(${scale})`;button.style.opacity=opacity;button.style.pointerEvents=p>=.43&&p<.66?'auto':'none';button.tabIndex=p>=.43&&p<.66?0:-1;button.querySelector('.track-meta').style.opacity=1-select;
 });
 // The selected record remains in the same stage while its form arrives.
 if(selected&&p>=.66){collection.inert=false;collection.style.pointerEvents='none';}
 show(selectedInfo,selected?select*(1-form):0,selected&&p>=.68&&p<.83);
 show(signupPanel,selected?form:0,selected&&p>=.84);
 show(needTrack,!selected?select:0,!selected&&p>=.7);
 const phase=p<.2?0:p<.4?1:p<.66?2:p<.84?3:4;
 $('#chapterNo').textContent=['01 / THE ARRIVAL','02 / THE REVEAL','03 / THE COLLECTION','04 / YOUR SELECTION','05 / YOUR NEXT CHAPTER'][phase];
 $('#chapterText').textContent=['Every record holds a story.','Pull something new from the grooves.','Twelve tracks. Where will you take them?','Your sound starts here.',confirmed?'Your record is ready.':'Bring your perspective.'][phase];
 $('.chapter').style.opacity=p>.39?0:1;$('.scrollcue').style.opacity=p>.42?0:1;$('#progress').style.width=p*100+'%';
 document.querySelectorAll('.scene-nav button').forEach((b,i)=>b.classList.toggle('active',i===(p<.4?0:p<.8?1:2)));queued=false;
}
addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(render)}},{passive:true});addEventListener('resize',render);
$('#exploreTracks').onclick=e=>{e.preventDefault();jump(.52)};
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>jump(Number(b.dataset.step)));
document.querySelectorAll('.backTracks').forEach(b=>b.onclick=()=>jump(.52));$('.close').onclick=()=>jump(.52);
$('#continueSignup').onclick=()=>jump(.91);
$('#signup').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target);$('#modalTitle').textContent=`${data.get('dj')}, meet your record.`;$('#modalDescription').textContent=`${String(chosen).padStart(2,'0')} · ${titles[chosen-1]} / ${data.get('city')}`;$('#signup').hidden=true;$('#confirmation').hidden=false;confirmed=true;render()};$('#reset').onclick=()=>jump(.52);$('#backcoverPick').onclick=()=>jump(.52);
render();
