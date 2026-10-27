const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('app.js','utf8');
const start=source.indexOf('const trackTuner=');const end=source.indexOf('// Scroll sets a target;',start);
const nodes=new Map();function element(){return{value:1,style:{setProperty(k,v){this[k]=v}},children:[],events:{},dispatchEvent(){},append(n){this.children.push(n)},setAttribute(k,v){this[k]=v},addEventListener(k,f){this.events[k]=f}}}
function get(s){if(!nodes.has(s))nodes.set(s,element());return nodes.get(s)}
let updates=0;const ctx={chosen:8,titles:Array.from({length:12},(_,i)=>'Track '+(i+1)),$:get,document:{createElement:element},manualPick:false,Event:class{},clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),render(){updates++},chooseRecord(i){if(ctx.chosen!==i){ctx.chosen=i;ctx.syncPlayerBrowser()}}};
vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);ctx.syncPlayerBrowser();
assert.equal(get('#tunerScale').children.length,89);
for(let i=1;i<=12;i++){
 get('#trackTuner').value=i;get('#trackTuner').events.input();assert.equal(ctx.chosen,i);
 assert.equal(get('#playerRecordCount').textContent,String(i).padStart(2,'0')+' / 12');
 assert.ok(get('#continueSignup').textContent.includes('Track '+i+' '));
 assert.equal(get('#tunerScale').style['--dial-offset'],((i-1)/11*704)+'px');
}
const before=updates;get('#trackTuner').value=11.9;get('#trackTuner').events.input();assert.equal(updates,before,'Fractional movement should not redraw the whole scene');
assert.notEqual(get('#tunerScale').style['--dial-offset'],'704px');
get('#trackTuner').events.change();assert.equal(get('#trackTuner').value,12);
assert.equal(get('#tunerScale').style['--dial-offset'],'704px');
ctx.stepPlayer(1);assert.equal(ctx.chosen,12);ctx.chosen=1;ctx.stepPlayer(-1);assert.equal(ctx.chosen,1);
console.log('12 track boundaries, continuous fractional movement without scene redraw, release snapping, labels and endpoints passed.');
