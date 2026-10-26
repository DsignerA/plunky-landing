const $=s=>document.querySelector(s);
const journey=$('#journey'),sleeve=$('#sleeve'),record=$('#heroRecord'),intro=$('.intro'),scene=$('.scene'),collection=$('#collection'),tracks=$('#tracks'),signupPanel=$('#selection'),selectedInfo=$('.selected-info'),needTrack=$('#need-track');
const stage=$('.stage');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const titles=['African Rhythms','Kazi','Funky Wood','Tarishi','Mashariki','Chants','Don’t Give Up','Incognito','Poo Too','Liberation Dues','African Rhythms (45 Version Parts 1 & 2)','Afrobeat'];
// Approved preview files go here, keyed by track number, e.g. 4:'assets/audio/04-tarishi.mp3'.
const audioSrc={};
let chosen=null,queued=false,confirmed=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function jump(p){window.scrollTo({top:journey.offsetTop+(journey.offsetHeight-stage.offsetHeight)*p,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
function show(el,opacity,active=false){el.style.opacity=opacity;el.inert=!active;el.style.pointerEvents=active?'auto':'none'}
const buttons=[];
for(let i=1;i<=12;i++){
 const n=String(i).padStart(2,'0'),button=document.createElement('button');button.className='track';const title=titles[i-1],short=title.replace(' (45 Version Parts 1 & 2)',' (45)');button.setAttribute('aria-label',`Select track ${n}: ${title}`);
 button.innerHTML=`<div class="record photo"><img src="assets/vinyl.webp" alt="" width="720" height="720" decoding="async"></div><div class="track-meta"><span><small>${n}</small>${short}</span><span>↗︎</span></div>`;
 button.onclick=()=>{chosen=i;confirmed=false;$('#selectionTitle').textContent=`${title}.`;$('#selectionTitle').classList.toggle('long',title.length>20);$('#modalDescription').textContent=`Your starting point: ${n} · ${title}.`;$('#modalTitle').textContent='Make it yours.';closeFinal();buttons.forEach((b,j)=>b.classList.toggle('selected',j===i-1));stopDeck();jump(.76);render()};tracks.append(button);button._meta=button.querySelector('.track-meta');buttons.push(button)
}
// Scroll sets a target; drawn progress eases toward it each frame, which evens out
// irregular mobile scroll events. Reduced motion draws the target directly.
let shown=null,finalT=0,finalShown=0;
const target=()=>clamp((window.scrollY-journey.offsetTop)/(journey.offsetHeight-stage.offsetHeight));
function render(){if(!queued){queued=true;requestAnimationFrame(tick)}}
function tick(){
 const t=target();
 shown=shown===null||reduced.matches||Math.abs(t-shown)<.0005?t:shown+(t-shown)*.28;
 finalShown=reduced.matches||Math.abs(finalT-finalShown)<.002?finalT:finalShown+(finalT-finalShown)*.14;
 draw(shown);
 if(shown!==t||finalShown!==finalT)requestAnimationFrame(tick);else queued=false;
}
const chapterNo=$('#chapterNo'),chapterText=$('#chapterText'),chapter=$('.chapter'),scrollcue=$('.scrollcue'),progress=$('#progress'),collectionTitle=$('.collection-title'),demoNote=$('.demo-note'),navButtons=[...document.querySelectorAll('.scene-nav button')];
const setText=(el,v)=>{if(el.textContent!==v)el.textContent=v};
function draw(p){
 const mobile=innerWidth<701;
 const pull=ease(p/.22),remove=ease((p-.2)/.17),spread=ease((p-.33)/.14),select=ease((p-.63)/.12),form=ease((p-.79)/.06),glassIn=ease((p-.86)/.06);
 const selected=chosen!==null;
 const bounds=tracks.getBoundingClientRect(),stageW=stage.clientWidth,stageH=stage.clientHeight,vw=stageW,vh=stageH,cols=mobile?3:4,rows=mobile?4:3;
 sleeve.style.transform=`translateX(${-remove*125}%) rotateY(${-15-pull*8-remove*20}deg) rotateZ(${-7-remove*13}deg)`;sleeve.style.opacity=1-remove;
 record.style.transform=`translateX(${28+pull*45-remove*73}%) rotate(${-12+pull*70+remove*35}deg) scale(${1-spread*.7})`;record.style.opacity=1-ease((p-.35)/.08);
 scene.style.transform=`translate(calc(-50% + ${-remove*(mobile?-.05:.14)*stageW}px),calc(-50% + ${-remove*(mobile?.11:0)*stageH}px))`;
 intro.style.opacity=1-ease(p/.2);intro.style.transform=`translateY(${-pull*20}px)`;
 const gridVisible=ease((p-.35)/.05)*(1-form);show(collection,gridVisible,p>=.42&&p<.66);
 collectionTitle.style.opacity=1-select;demoNote.style.opacity=1-select;
 const cellW=bounds.width/cols,cellH=bounds.height/rows;
 const size=Math.max(40,Math.min(cellW*(mobile?.73:.7),cellH-(mobile?24:30),mobile?115:165));
 let deckArgs=null;
 buttons.forEach((button,i)=>{
  const col=i%cols,row=Math.floor(i/cols),gridX=(col+.5)*cellW-size/2,gridY=(row+.5)*cellH-size/2;
  const stackX=bounds.width/2-size/2,stackY=bounds.height/2-size/2;
  let x=stackX+(gridX-stackX)*spread,y=stackY+(gridY-stackY)*spread,scale=2.2-1.2*spread,opacity=1;
  if(select>0){if(selected&&i===chosen-1){const desired=mobile?Math.min(vw*.42,vh*.27):Math.min(vw*.18,vh*.32);const targetX=(mobile?vw*.5:vw*.26)-bounds.left-size/2,targetY=(mobile?vh*.39:vh*.5)-bounds.top-size/2;x+=(targetX-x)*select;y+=(targetY-y)*select;scale+=(desired/size-scale)*select;}else{opacity=1-select;scale*=1-select*.2}}
  if(button._size!==size){button._size=size;button.style.width=size+'px';button.style.height=size+24+'px';}button.style.transform=`translate(${x}px,${y}px) rotate(${(1-spread)*(i-5.5)*6}deg) scale(${scale})`;button.style.opacity=opacity;const live=p>=.43&&p<.66;if(button._live!==live){button._live=live;button.style.pointerEvents=live?'auto':'none';button.tabIndex=live?0:-1;}button._meta.style.opacity=1-select;
  if(selected&&i===chosen-1)deckArgs=[bounds.left+x+size/2,bounds.top+y+(size+24)/2-12*scale,size*scale];
 });
 if(deckArgs)placeDeck(...deckArgs,select*(1-form),p>=.68&&p<.83);else{deckBase.style.opacity=deckTop.style.opacity=deckSleeve.style.opacity=0;deckTop.inert=true;stage.classList.remove('deck-shown')}
 // The selected record remains in the same stage while its form arrives.
 if(selected&&p>=.66){collection.inert=false;collection.style.pointerEvents='none';}
 show(selectedInfo,selected?select*(1-form):0,selected&&p>=.68&&p<.83);
 if(finalT&&p<.84)closeFinal();
 placeJoin(selected?form:0,selected?glassIn:0,mobile,vw,vh);
 show(needTrack,!selected?select:0,!selected&&p>=.7);
 if(deckOn&&p<.64)stopDeck();
 const phase=p<.2?0:p<.4?1:p<.66?2:p<.84?3:4;
 setText(chapterNo,['01 / THE ARRIVAL','02 / THE REVEAL','03 / THE COLLECTION','04 / YOUR SELECTION','05 / YOUR NEXT CHAPTER'][phase]);
 setText(chapterText,['Every record holds a story.','Pull something new from the grooves.','Twelve tracks. Where will you take them?','Your sound starts here.',confirmed?'Your record is ready.':'Bring your perspective.'][phase]);
 chapter.style.opacity=p>.39?0:1;scrollcue.style.opacity=p>.42?0:1;progress.style.transform=`scaleX(${p})`;
 navButtons.forEach((b,i)=>b.classList.toggle('active',i===(p<.4?0:p<.8?1:2)));
}
addEventListener('scroll',render,{passive:true});
// Older Safari lacks overflow:clip; undo any focus-driven scroll of the pinned stage.
stage.addEventListener('scroll',()=>{if(stage.scrollTop||stage.scrollLeft){stage.scrollTop=0;stage.scrollLeft=0}});addEventListener('resize',render);
$('#exploreTracks').onclick=e=>{e.preventDefault();jump(.52)};
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>jump(Number(b.dataset.step)));
document.querySelectorAll('.backTracks').forEach(b=>b.onclick=()=>jump(.52));$('.close').onclick=()=>jump(.52);
$('#continueSignup').onclick=()=>jump(.93);
$('#backcoverPick').onclick=()=>jump(.52);
// Turntable: the selected record lands on the platter; play drops the tonearm and spins it.
// With an approved audio file the arm tracks playback across the grooves.
const deckSleeve=$('#deckSleeve'),deckBase=$('#deckBase'),deckTop=$('#deckTop'),deckPlay=$('#deckPlay'),deckStatus=$('#deckStatus'),player=new Audio();
const ARM_REST=-46,ARM_START=-17,ARM_END=2;
let deckOn=false;
const setArm=deg=>deckTop.style.setProperty('--arm',deg+'deg');
function startDeck(){
 if(chosen===null)return;
 deckOn=true;stage.classList.add('deck-on');$('#onDeck').hidden=false;$('#onDeckText').textContent=`${titles[chosen-1]} · on the turntable`;deckPlay.setAttribute('aria-pressed','true');deckPlay.setAttribute('aria-label','Stop this record');setArm(ARM_START);
 const src=audioSrc[chosen];
 if(src){player.src=src;player.currentTime=0;deckStatus.textContent=`Now playing: ${titles[chosen-1]}`;setTimeout(()=>{if(deckOn)player.play().catch(()=>{deckStatus.textContent='Tap play again to start the preview.'})},700)}
 else deckStatus.textContent=`${titles[chosen-1]} · audio preview coming soon`;
}
function stopDeck(){
 if(!deckOn)return;
 deckOn=false;player.pause();stage.classList.remove('deck-on');$('#onDeck').hidden=true;deckPlay.setAttribute('aria-pressed','false');deckPlay.setAttribute('aria-label','Play this record');setArm(ARM_REST);deckStatus.textContent='';
}
// Size and place the deck so its platter sits under the selected record's current position.
function placeDeck(cx,cy,diameter,opacity,active){
 const w=diameter/.4685,left=cx-.4622*w,top=cy-.3027*w,h=w/1.5,mobile=innerWidth<701;
 const sz=mobile?h*.62:h*.94,sx=mobile?left+w*.58:left+w*.8,sy=mobile?top-sz*.45:top+h*.03,slide=(1-opacity)*sz*.35;
 deckSleeve.style.width=sz+'px';deckSleeve.style.transform=`translate(${sx-slide}px,${sy}px) rotate(${mobile?8:3}deg)`;deckSleeve.style.opacity=opacity;
 for(const el of [deckBase,deckTop]){el.style.width=w+'px';el.style.transform=`translate(${left}px,${top}px)`;el.style.opacity=opacity}
 deckTop.inert=!active;stage.classList.toggle('deck-shown',opacity>.5);
}
player.addEventListener('timeupdate',()=>{if(deckOn&&player.duration)setArm(ARM_START+(ARM_END-ARM_START)*player.currentTime/player.duration)});
player.addEventListener('ended',stopDeck);
deckPlay.onclick=()=>deckOn?stopDeck():startDeck();
$('#onDeck').onclick=stopDeck;
// Join step. 1) The DJ Spotlight post (same card as /groove-makers/dj/) arrives large.
// 2) A frosted glass panel with the form slides over it; the form drives the post live.
// 3) Submitting brings the finished post forward as the final view.
const spotStage=$('#spotStage'),spotlight=$('#spotlight'),spotFrame=$('#spotlightFrame'),signup=$('#signup'),finalBar=$('#confirmation');
let spotHeight=640,spotActive=null,photoURL=null;
const toSpot=msg=>{try{spotFrame.contentWindow.postMessage({type:'gm-spotlight',...msg},location.origin)}catch(e){}};
const lerp=(a,b,t)=>a+(b-a)*t;
function placeJoin(cardIn,glassIn,mobile,vw,vh){
 const H=spotHeight,B=400,g=glassIn*(1-finalShown),f=finalShown,top=mobile?72:96,bottom=mobile?64:80;
 // Card size and centre for each layout: large, behind the glass, final.
 const big={s:mobile?Math.min(vw*.86/B,(vh-top-bottom-16)/H):Math.min(1.2,(vh-top-bottom-30)/H)};
 big.x=vw/2;big.y=top+(vh-top-bottom)/2;
 const gl={s:mobile?Math.min(vw*.6/B,vh*.33/H):big.s*.94};
 gl.x=mobile?vw/2:vw/2-Math.min(170,vw*.12);gl.y=mobile?top+6+H*gl.s/2:big.y;
 const fin={s:mobile?Math.min(vw*.78/B,(vh-top-250)/H):big.s};
 fin.x=mobile?vw/2:vw*.4;fin.y=mobile?top+6+H*fin.s/2:big.y;
 const k=['s','x','y'].reduce((o,key)=>(o[key]=lerp(lerp(big[key],gl[key],glassIn),fin[key],f),o),{});
 const w=B*k.s,h=H*k.s;
 spotFrame.style.transform=`scale(${k.s})`;spotlight.style.setProperty('--s',k.s);
 spotlight.style.width=w+'px';spotlight.style.height=h+'px';
 spotStage.style.transform=`translate(${k.x-w/2}px,${k.y-h/2+(1-cardIn)*40}px)`;spotStage.style.opacity=cardIn;
 spotStage.inert=!(cardIn>.9&&(g<.4||f>.9));
 // Glass panel: bottom sheet on phones; on desktop it overlaps the post's right side.
 if(mobile)signupPanel.style.transform=`translateY(${(1-g)*105}%)`;
 else signupPanel.style.transform=`translate(${k.x+w*.18+(1-g)*70}px,-50%)`;
 show(signupPanel,mobile?(g>0?1:0):g,g>.9);
 show(finalBar,f,f>.9);
 stage.classList.toggle('sheet-up',mobile&&g>.05);
 // The post rotates its slides while nobody is filling in the form.
 const a=cardIn>.9&&(glassIn<.2||finalT===1);
 if(a!==spotActive){spotActive=a;toSpot({active:a})}
}
addEventListener('message',e=>{if(e.origin===location.origin&&e.data&&e.data.type==='gm-spotlight-height'){spotHeight=e.data.height;spotFrame.style.height=spotHeight+'px';syncSpotlight();render()}});
const cleanHandle=v=>v.replace(/^@+/,'').replace(/\s+/g,'');
function syncSpotlight(){toSpot({djName:signup.dj.value.trim(),handle:cleanHandle(signup.instagram.value),category:signup.category.value})}
signup.addEventListener('input',e=>{if(e.target.name==='instagram')e.target.value=cleanHandle(e.target.value);if(e.target.name!=='photo')syncSpotlight();$('#formError').hidden=true});
// Fields that change the artwork bring its slide into view.
signup.addEventListener('focusin',e=>{if(['category','photo'].includes(e.target.name))toSpot({slide:0})});
signup.category.addEventListener('change',()=>{toSpot({slide:0});syncSpotlight()});
signup.photo.addEventListener('change',()=>{
 const file=signup.photo.files[0],label=$('#photoLabel');
 if(!file)return;
 if(!file.type.startsWith('image/')){label.textContent='Choose an image';return}
 if(file.size>12*1024*1024){label.textContent='Under 12 MB please';return}
 if(photoURL)URL.revokeObjectURL(photoURL);
 photoURL=URL.createObjectURL(file);label.textContent='✓ '+(file.name.length>16?file.name.slice(0,14)+'…':file.name);
 toSpot({photo:photoURL,slide:0});
});
signup.onsubmit=e=>{
 e.preventDefault();
 const bad=[...signup.querySelectorAll('input[required]')].find(i=>!i.checkValidity());
 if(bad){const err=$('#formError');err.textContent=bad.name==='email'&&bad.value?'Please enter a valid email.':`Please add your ${{dj:'DJ name',email:'email',city:'city or country'}[bad.name]}.`;err.hidden=false;bad.focus({preventScroll:true});return}
 const d=new FormData(signup);
 $('#finalTitle').textContent=`${d.get('dj')}, this is your spotlight.`;
 $('#finalNote').textContent=`${String(chosen).padStart(2,'0')} · ${titles[chosen-1]} · ${d.get('city')}. Preview only. Your entry is not registered yet.`;
 finalBar.hidden=false;confirmed=true;finalT=1;toSpot({slide:0});document.activeElement.blur();setTimeout(()=>$('#editDetails').focus({preventScroll:true}),600);render();
};
function closeFinal(){if(!finalT&&finalBar.hidden)return;finalT=0;confirmed=false;spotActive=null;setTimeout(()=>{if(!finalT)finalBar.hidden=true},700);render()}
$('#editDetails').onclick=()=>{closeFinal();setTimeout(()=>signup.dj.focus({preventScroll:true}),450)};
$('#reset').onclick=()=>{stopDeck();closeFinal();jump(.52)};
setArm(ARM_REST);
// The shared host occasionally drops a request under load: retry an image once.
document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{if(!img.dataset.retried){img.dataset.retried=1;setTimeout(()=>{img.src=img.src.split('?')[0]+'?r='+Date.now()},700)}}));
render();
