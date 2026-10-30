const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
class E{
 constructor(tag="div"){
  this.tag=tag;this.id="";this.children=[];this.events={};this.dataset={};
  this.classList={toggle(){},add(){}};this.style={};this.textContent="";this.innerHTML="";this._value="";
 }
 append(...xs){this.children.push(...xs)}
 replaceChildren(...xs){this.children=xs}
 addEventListener(k,f){(this.events[k]??=[]).push(f)}
 setAttribute(){}
 get value(){return this._value||this.children.find(x=>x.tag==="option")?.value||""}
 set value(v){this._value=v}
 focus(){}showModal(){}
 closest(tag){return this.tag===tag?this:null}
 click(){for(const f of this.events.click||[])f({target:this,preventDefault(){}})}
 submit(){for(const f of this.events.submit||[])f({preventDefault(){}})}
 drop(uid){for(const f of this.events.drop||[])f({preventDefault(){},dataTransfer:{getData(){return uid}}})}
}
const ids=["archive","brief","opening-papers","paper-count","query","scope-filter","archive-idle","archive-idle-hint","search-mode-label","archive-sound-toggle","archive-list","reader","results","results-title","result-count","search-form","archive-history","archive-pins","wire-code","wire-message","wire-result","wire-form","ledger-grid","soul-person","soul-paper","soul-response","soul-ask","paper-dialog","dialog-title","dialog-body","close-dialog","suspect-buttons","stack-title","inventory","layers","inventory-count","reset","submit-suspect","room","feedback","submit-dossier","status","trash-bin","trash-count","trash-papers"];
const tabs=["brief","archive","wire","souls","desk","admit","ledger"];
const storage={values:{"atwg-case01-v43":JSON.stringify({
 serial:3,readIds:["A01","A02","A17"],history:[],pins:[],
 papers:[
  {uid:"paper-1",id:"A01",location:null},
  {uid:"paper-2",id:"A01",location:null},
  {uid:"paper-3",id:"A17",location:{suspect:"14",layer:0}}
 ],transcripts:[],admitted:[]
})},getItem(k){return this.values[k]||null},setItem(k,v){this.values[k]=v},removeItem(k){delete this.values[k]}};
const audioEvents=[];
class MockAudio{
 constructor(){this.currentTime=5;this.sampleRate=8000;this.state="running";this.destination={}}
 createBuffer(ch,n,sr){audioEvents.push({type:"buffer",ch,n,sr});return{getChannelData(){return new Float32Array(n)}}}
 createBufferSource(){const event={type:"source"};audioEvents.push(event);return{
  set buffer(b){event.hasBuffer=Boolean(b)},connect(){},start(t){event.start=t},stop(t){event.stop=t}
 }}
 createBiquadFilter(){return{type:"highpass",frequency:{value:0},connect(){}}}
 createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(v){audioEvents.push({type:"ramp",v})}},connect(){}}}
 createOscillator(){return{frequency:{setValueAtTime(){}},connect(){},start(){audioEvents.push({type:"beep"})},stop(){}}}
}
const ctx={window:{AudioContext:MockAudio},localStorage:storage,confirm:()=>true,location:{reload(){}},console};
vm.createContext(ctx);
for(const name of ["data.js","rules.js","portraits.js"]){
 vm.runInContext(fs.readFileSync(path.join(__dirname,name),"utf8"),ctx,{filename:name});
}
function start(){
 const db=Object.fromEntries(ids.map(id=>[id,Object.assign(new E(),{id})]));
 const nav=tabs.map(tab=>Object.assign(new E("button"),{dataset:{tab}}));
 const browse=["people","events","publications"].map(name=>Object.assign(new E("button"),{dataset:{browse:name}}));
 const views=tabs.map(id=>Object.assign(new E("section"),{id}));
 const go=Object.assign(new E("button"),{dataset:{go:"archive"}});
 ctx.document={
  getElementById:id=>db[id]||(db[id]=new E()),
  createElement:tag=>new E(tag),
  querySelectorAll:q=>q===".view"?views:q==="[data-tab]"?nav:q==="[data-go]"?[go]:q==="[data-browse]"?browse:[]
 };
 vm.runInContext(fs.readFileSync(path.join(__dirname,"app.js"),"utf8"),ctx,{filename:"app.js"});
 return {
  db,nav,
  papers:()=>JSON.parse(storage.values["atwg-case01-v43"]).papers,
  tab:name=>nav.find(x=>x.dataset.tab===name).click(),
  action:(card,name)=>card.children.find(x=>x.className==="card-actions")?.children.find(x=>x.textContent===name)
 };
}
let ui=start();ui.tab("desk");
assert.equal(ui.db["inventory"].children.length,2);
assert.equal(ui.db["trash-count"].textContent,"0");
ui.action(ui.db["inventory"].children[0],"BỎ VÀO THÙNG").click();
assert.equal(ui.papers().find(p=>p.uid==="paper-1").location.zone,"trash");
assert.equal(ui.db["inventory"].children.length,1,"duplicate copy must remain");
assert.equal(ui.db["paper-count"].textContent,"(2)","counter excludes trash");
ui.db["suspect-buttons"].children.find(x=>x.textContent.includes("#14")).click();
const layerCard=ui.db["layers"].children[0].children.find(x=>x.className==="paper-card");
assert(layerCard,"dossier copy should exist");
ui.action(layerCard,"BỎ VÀO THÙNG").click();
assert.equal(ui.papers().find(p=>p.uid==="paper-3").location.zone,"trash");
assert.equal(ui.db["trash-count"].textContent,"2");
let bin=ui.db["trash-papers"].children;
const dossierSheet=bin.find(c=>c.children.find(x=>x.tag==="strong")?.textContent.includes("La Linterna"));
assert(dossierSheet,"discarded dossier sheet must be in bin");
ui.action(dossierSheet,"LẤY RA BÀN").click();
assert.equal(ui.papers().find(p=>p.uid==="paper-3").location,null,"restores to references");
ui.db["trash-bin"].drop("paper-2");
assert.equal(ui.papers().find(p=>p.uid==="paper-2").location.zone,"trash");
ui.tab("archive");ui.tab("desk");
assert.equal(ui.db["trash-count"].textContent,"2","keeps bin after navigation");
ui=start();ui.tab("desk");
assert.equal(ui.db["trash-count"].textContent,"2","keeps bin after reload");
assert.equal(ui.db["inventory"].children.length,1);
ui.action(ui.db["trash-papers"].children[0],"LẤY RA BÀN").click();
assert.equal(ui.db["trash-count"].textContent,"1");
assert.equal(ui.papers().length,3,"no paper deleted permanently");
ui.tab("archive");
ui.db["query"].value="San Aurelio";ui.db["search-form"].submit();
ui.db["results"].children.find(x=>x.tag==="button").click();
const print=ui.db["reader"].children.find(x=>x.tag==="button"&&x.textContent.includes("IN BẢN"));
assert(print);
const before=audioEvents.length,count=ui.papers().length;
print.click();
assert.equal(ui.papers().length,count+1,"print adds one physical copy");
const events=audioEvents.slice(before);
assert(events.some(e=>e.type==="buffer"&&e.n===5920),"740 ms printer buffer");
assert(events.some(e=>e.type==="ramp"&&e.v===.27),"printer motor volume");
assert(!events.some(e=>e.type==="beep"),"no legacy print beep");
console.log("PASS desk bin: per-copy discard, dossier trash, drag-drop, restore, save/reload, source reprint, mechanical printer.");
