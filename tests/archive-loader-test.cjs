const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=readFileSync('archive-loader.js','utf8');
function setup(reduced=false){
 const timers=new Map(),events=new Map();let id=0,removed=0,announced=0;
 const status={textContent:''},bars=[];
 const root={querySelector:s=>s==='output'?status:{append:b=>bars.push(b)},setAttribute(){},classList:{add(){}},remove(){removed++}};
 const window={addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k),dispatchEvent:()=>announced++};
 vm.runInNewContext(source,{window,document:{getElementById:()=>root,createElement:()=>({style:{setProperty(){}}})},matchMedia:()=>({matches:reduced}),setTimeout:(f,ms)=>{timers.set(++id,{f,ms});return id},clearTimeout:i=>timers.delete(i),Event:class{}});
 return{window,events,timers,status,bars,removed:()=>removed,announced:()=>announced};
}
for(const reduced of [false,true]){
 const s=setup(reduced);assert.equal(s.bars.length,39);
 s.events.get('groove:ready')();s.window.GrooveMakersLoader.finish();
 assert.equal(s.status.textContent,'Ready');assert.equal(s.timers.size,1);
 const timer=[...s.timers.values()][0];assert.equal(timer.ms,reduced?0:650);timer.f();
 assert.equal(s.removed(),1);assert.equal(s.events.size,0);assert.equal(s.announced(),1);
 s.window.GrooveMakersLoader.destroy();assert.equal(s.removed(),1);
}
const fail=setup();const fallback=[...fail.timers.values()].find(t=>t.ms===8000);assert.ok(fallback);fallback.f();assert.equal(fail.status.textContent,'Ready');
const early=setup();early.window.GrooveMakersLoader.destroy();assert.equal(early.timers.size,0);assert.equal(early.events.size,0);
console.log('Loader readiness, fail-open, reduced motion and cleanup checks passed.');
