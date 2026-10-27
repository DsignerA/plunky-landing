/* The app owns readiness. No invented loading percentages or forced delay. */
(()=>{
 'use strict';
 const root=document.getElementById('archive-loader');
 if(!root)return;
 const wave=root.querySelector('.gm-wave');
 for(let i=0;i<39;i++){
  const bar=document.createElement('i');
  const h=3+34*Math.exp(-Math.pow((i-13)/6,2))*Math.abs(Math.cos(i*.64))+20*Math.exp(-Math.pow((i-28)/4,2))*Math.abs(Math.sin(i));
  bar.style.setProperty('--height',h+'px');bar.style.setProperty('--delay',(-i*.11)+'s');wave.append(bar);
 }
 let finished=false,destroyed=false,removalTimer;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const destroy=()=>{if(destroyed)return;destroyed=true;clearTimeout(fallback);clearTimeout(removalTimer);window.removeEventListener('groove:ready',finish);root.remove();window.dispatchEvent(new Event('groove:loader-dismissed'))};
 const finish=()=>{if(finished||destroyed)return;finished=true;clearTimeout(fallback);root.setAttribute('aria-busy','false');root.querySelector('output').textContent='Ready';root.classList.add('gm-exit');removalTimer=setTimeout(destroy,motion.matches?0:650)};
 const fallback=setTimeout(finish,8000);
 window.addEventListener('groove:ready',finish);
 window.GrooveMakersLoader={finish,destroy};
 if(window.__grooveReady)finish();
})();
