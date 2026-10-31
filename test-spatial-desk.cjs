const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
class Dom {
 constructor(tag='div',id='') {this.tag=tag;this.id=id;this.children=[];this.events={};this.dataset={};this.style={};this.hidden=false;this.textContent='';this.className='';this.innerHTML='';this._value='';this.classList={add(){},remove(){},toggle(){}};}
 append(...xs){this.children.push(...xs)}replaceChildren(...xs){this.children=xs}addEventListener(n,f){(this.events[n]||=[]).push(f)}removeEventListener(n,f){this.events[n]=(this.events[n]||[]).filter(x=>x!==f)}setAttribute(){}focus(){}showModal(){}setPointerCapture(){}
 get value(){return this._value||this.children.find(x=>x.tag==='option')?.value||''}set value(v){this._value=v}
 getBoundingClientRect(){return{left:0,top:0,width:1280,height:800}}
 closest(){return null}
 click(){if(this.onclick)this.onclick();for(const fn of this.events.click||[])fn({target:this,preventDefault(){},stopPropagation(){}})}
 pointer(ev,props={}){for(const fn of this.events[ev]||[])fn({button:0,clientX:props.x??200,clientY:props.y??200,pointerId:1,target:this,preventDefault(){},stopPropagation(){}})}
 submit(){for(const fn of this.events.submit||[])fn({preventDefault(){}})}
}
const ids='opening-papers paper-count query scope-filter archive-idle archive-idle-hint search-mode-label archive-sound-toggle archive-list reader results results-title result-count search-form archive-history archive-pins wire-code wire-message wire-result wire-form ledger-grid soul-person soul-paper soul-response soul-ask paper-dialog dialog-title dialog-body close-dialog suspect-buttons stack-title inventory layers inventory-count reset submit-suspect room feedback submit-dossier status desk-stage desk-world desk-inspector desk-toolbox desk-trash-drawer desk-trash-list desk-stage-status desk-ready-button desk-bin-button desk-trash-close desk-trash-count desk-admission-preview'.split(' ');
const store={values:{},getItem(k){return this.values[k]||null},setItem(k,v){this.values[k]=v},removeItem(k){delete this.values[k]}};
function start(oldSave){if(oldSave)store.values['atwg-case01-v43']=JSON.stringify(oldSave);
const nodes=Object.fromEntries(ids.map(id=>[id,new Dom('div',id)]));
const tabs=['brief','archive','wire','souls','desk','admit','ledger'].map(tab=>Object.assign(new Dom('button'),{dataset:{tab}}));
const views=tabs.map(b=>new Dom('section',b.dataset.tab));
const browse=['people','events','publications'].map(x=>Object.assign(new Dom('button'),{dataset:{browse:x}}));
const tools=['folder','clip','nameplate'].map(x=>Object.assign(new Dom('button'),{dataset:{newProp:x}}));
const nav=Object.assign(new Dom('button'),{dataset:{go:'archive'}});
const doc={getElementById:id=>nodes[id]||(nodes[id]=new Dom('div',id)),createElement:tag=>new Dom(tag),querySelectorAll:q=>q==='.view'?views:q==='[data-tab]'?tabs:q==='[data-go]'?[nav]:q==='[data-browse]'?browse:[]};
nodes['desk-toolbox'].querySelectorAll=q=>q==='[data-new-prop]'?tools:[];
const context={window:{addEventListener(){}},document:doc,localStorage:store,confirm:()=>true,location:{reload(){}},console};vm.createContext(context);
for(const file of ['data.js','rules.js','portraits.js','desk-scene.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context,{filename:file});
const scene=()=>JSON.parse(store.values['atwg-case01-v43']).scene;
const papers=()=>JSON.parse(store.values['atwg-case01-v43']).papers;
return{nodes,tabs,tools,context,scene,papers,nav(tab){tabs.find(x=>x.dataset.tab===tab).click()},button(label){return nodes['desk-inspector'].children.find(x=>x.textContent===label)},objects:()=>nodes['desk-world'].children};
}
function run(){let a=start();a.nav('desk');assert.equal(a.objects().filter(x=>x.className.includes('desk-page')).length,2);
assert(a.objects().every(x=>!x.draggable),'no native drag ghost');
const first=a.objects().find(x=>x.dataset.uid==='paper-1');assert(first);
first.pointer('pointerdown',{x:150,y:150});first.pointer('pointermove',{x:300,y:250});first.pointer('pointerup',{x:300,y:250});
const pose=a.scene().items.find(x=>x.uid==='paper-1');assert(pose.x>200&&pose.y>175,'free drag preserves drop coordinates');
// Inspect via click, no drag.
let sheet=a.objects().find(x=>x.dataset.uid==='paper-1');sheet.pointer('pointerdown',{x:300,y:250});sheet.pointer('pointerup',{x:300,y:250});
assert(a.nodes['dialog-title'].textContent.includes('San Aurelio'),'click-to-zoom document');
// Unlimited props, re-position freely.
a.tools[0].click();a.tools[0].click();a.tools[1].click();a.tools[2].click();
let f=a.scene().items.filter(x=>x.kind==='folder');assert.equal(f.length,2);const clip=a.scene().items.find(x=>x.kind==='clip');
assert.equal(a.scene().items.filter(x=>x.kind==='nameplate').length,1);
// Select first folder then paper, move it into dossier through explicit action.
let folderObj=a.objects().find(x=>x.dataset.uid===f[0].uid);folderObj.pointer('pointerdown',{x:430,y:150});folderObj.pointer('pointerup',{x:430,y:150});
sheet=a.objects().find(x=>x.dataset.uid==='paper-1');sheet.pointer('pointerdown',{x:300,y:250});sheet.pointer('pointerup',{x:300,y:250});
assert(a.button('ĐƯA VÀO BÌA ĐANG CHỌN'),'explicit folder action exists');a.button('ĐƯA VÀO BÌA ĐANG CHỌN').click();
assert.equal(a.papers().find(x=>x.uid==='paper-1').location.folderId,f[0].uid);
assert.equal(a.scene().items.find(x=>x.uid===f[0].uid).stack.length,1);
// Put another sheet into folder; the pages should be nested and overlapped.
sheet=a.objects().find(x=>x.dataset.uid==='paper-2');sheet.pointer('pointerdown',{x:220,y:170});sheet.pointer('pointerup',{x:220,y:170});a.button('ĐƯA VÀO BÌA ĐANG CHỌN').click();
assert.equal(a.scene().items.find(x=>x.uid===f[0].uid).stack.length,2);
folderObj=a.objects().find(x=>x.dataset.uid===f[0].uid);assert(folderObj.children.filter(x=>x.className?.includes('desk-contained')).length===2,'physical overlap in folder');
// Pin nameplate via explicit select.
const plate=a.scene().items.find(x=>x.kind==='nameplate');let plateObj=a.objects().find(x=>x.dataset.uid===plate.uid);
plateObj.pointer('pointerdown',{x:620,y:220});plateObj.pointer('pointerup',{x:620,y:220});
const select=a.nodes['desk-inspector'].children.find(x=>x.tag==='select');assert(select);select.value='27';for(const change of select.events.change||[])change({target:select});
assert(a.button('GẮN LÊN BÌA ĐANG CHỌN'));a.button('GẮN LÊN BÌA ĐANG CHỌN').click();
assert.equal(a.scene().items.find(x=>x.uid===f[0].uid).nameId,'27');
// Clip the actual physical folder from inspector.
let clipObj=a.objects().find(x=>x.dataset.uid===clip.uid);clipObj.pointer('pointerdown',{x:720,y:250});clipObj.pointer('pointerup',{x:720,y:250});
assert(a.button('KẸP BÌA ĐANG CHỌN'));a.button('KẸP BÌA ĐANG CHỌN').click();
assert(a.scene().items.find(x=>x.uid===f[0].uid).clipped);
assert.equal(a.nodes['desk-ready-button'].hidden,false,'admission arrow appears only after clip and nameplate');
a.nodes['desk-ready-button'].click();assert(a.scene().pending===f[0].uid);
assert(a.nodes['desk-admission-preview'].children.some(x=>x.textContent?.includes('Rojas')),'submission bound to nameplate');
assert.equal(a.nodes['submit-dossier'].disabled,false);
a.nodes['room'].value='VII';a.nodes['submit-dossier'].click();assert(a.nodes['feedback'].children.some(x=>x.textContent?.includes('OUTSIDE')),'room check not bypassed');
// Save and restore paper poses + props + sealed folder.
a=start();a.nav('desk');assert.equal(a.scene().items.filter(x=>x.kind==='folder').length,2);
assert.equal(a.scene().items.find(x=>x.uid===f[0].uid).nameId,'27');
assert(a.scene().items.find(x=>x.uid===f[0].uid).clipped);
console.log('PASS spatial desk: free pointer dragging, overlapping pages, click zoom, unlimited props, explicit stack, named/clipped dossier, guarded admission, save/reload.');
}
run();
// Migrate original saved layer assignments into a physical folder, preserving printed UIDs.
const legacy={serial:4,readIds:['A17','A20','A18','A19'],history:[],pins:[],papers:[
 {uid:'paper-1',id:'A17',location:{suspect:'14',layer:0}},
 {uid:'paper-2',id:'A20',location:{suspect:'14',layer:0}},
 {uid:'paper-3',id:'A18',location:{suspect:'14',layer:1}},
 {uid:'paper-4',id:'A19',location:{suspect:'14',layer:1}}],transcripts:[],admitted:[]};
const b=start(legacy);b.nav('desk');
const folder=b.scene().items.find(o=>o.kind==='folder'&&o.nameId==='14');assert(folder,'old dossier migrated');
assert.equal(folder.stack.filter(o=>o.kind==='divider').length,1,'old layer boundary retained');
assert.equal(folder.stack.filter(o=>o.kind==='paper').length,4);
assert(b.papers().every(p=>p.location?.folderId===folder.uid),'old paper copies not lost');
console.log('PASS old-save migration preserves paper ownership, identity and evidence layers.');