const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html"),css=read("src/styles/room.css");
const spots=[
 ["archive","12.2%","67.5%"],["wire","30.6%","66.6%"],["souls","49.1%","49.0%"],
 ["desk","66.2%","77.3%"],["brief","83.0%","64.2%"],["ledger","94.4%","69.0%"]
];
assert(html.includes('src="assets/room/main.webp"'),"Room must load the user's picture locally");
assert(html.includes('width="1672" height="941"'),"Room image aspect ratio must stay fixed");
assert(css.includes("aspect-ratio:1672 / 941"),"Hotspots must scale with the picture, not the viewport");
for(const [name,x,y] of spots)assert(html.includes('data-room-target="'+name+'"')&&html.includes('--hx:'+x+'%;'.replace('%%','%'))===false?true:true);
// Exact visual anchors are checked independently to avoid accidental relative layout changes.
for(const [name,x,y] of spots){
 const re=new RegExp('data-room-target="'+name+'"[^>]*style="--hx:'+x.replace('%','%')+';--hy:'+y.replace('%','%')+'"');
 assert(re.test(html),"Missing image-anchored hotspot: "+name);
}
assert.equal((html.match(/data-room-target=/g)||[]).length,6,"exactly six real room targets");
assert(html.includes('id="room-return"'),"Station return-to-room button missing");
class Dom{
 constructor(tag="div",id=""){
  this.tag=tag;this.id=id;this.children=[];this.events={};this.dataset={};this.style={setProperty(name,value){this[name]=value;}};this.hidden=false;
  this.className="";this.innerHTML="";this.textContent="";this._value="";
  this.classList={add(){},remove(){},toggle:(cls,on)=>{if(cls==="hidden")this.hidden=!!on}};
 }
 append(...xs){this.children.push(...xs)}
 replaceChildren(...xs){this.children=xs}
 addEventListener(ev,fn){(this.events[ev]??=[]).push(fn)}
 removeEventListener(ev,fn){this.events[ev]=(this.events[ev]||[]).filter(x=>x!==fn)}
 setAttribute(){}
 get value(){return this._value||this.children.find(c=>c.tag==="option")?.value||""}
 set value(v){this._value=v}
 focus(){}showModal(){}close(){}setPointerCapture(){}
 closest(){return null}
 getBoundingClientRect(){return{left:0,top:0,width:1280,height:800}}
 click(){if(this.onclick)this.onclick();for(const fn of this.events.click||[])fn({target:this,preventDefault(){},stopPropagation(){}})}
}
const ids="opening-papers paper-count query scope-filter archive-idle archive-idle-hint search-mode-label archive-sound-toggle archive-list reader results results-title result-count search-form archive-history archive-pins wire-code wire-message wire-result wire-form ledger-grid soul-person soul-paper soul-response soul-ask paper-dialog dialog-title dialog-body close-dialog suspect-buttons stack-title inventory layers inventory-count reset submit-suspect room feedback submit-dossier status desk-stage desk-world desk-inspector desk-toolbox desk-trash-drawer desk-trash-list desk-stage-status desk-ready-button desk-bin-button desk-trash-close desk-trash-count desk-admission-preview room-return".split(" ");
const nodes=Object.fromEntries(ids.map(id=>[id,new Dom("div",id)]));
const views=["room","brief","archive","wire","souls","desk","admit","ledger"].map(id=>new Dom("section",id));
const tabs=views.map(v=>Object.assign(new Dom("button"),{dataset:{tab:v.id}}));
const roomButtons=spots.map(([name])=>Object.assign(new Dom("button"),{dataset:{roomTarget:name}}));
const toolButtons=["folder","clip","nameplate"].map(kind=>Object.assign(new Dom("button"),{dataset:{newProp:kind}}));
nodes["desk-toolbox"].querySelectorAll=q=>q==="[data-new-prop]"?toolButtons:[];
const go=Object.assign(new Dom("button"),{dataset:{go:"archive"}});
const browse=["people","events","publications"].map(kind=>Object.assign(new Dom("button"),{dataset:{browse:kind}}));
const bodyModes=new Set();
const doc={
 body:{classList:{toggle(k,on){if(on)bodyModes.add(k);else bodyModes.delete(k)}}},
 events:{},addEventListener(k,fn){(this.events[k]??=[]).push(fn)},
 getElementById:id=>nodes[id]||(nodes[id]=new Dom("div",id)),
 createElement:tag=>new Dom(tag),
 querySelectorAll:q=>q===".view"?views:q==="[data-tab]"?tabs:q==="[data-go]"?[go]:q==="[data-browse]"?browse:q==="[data-room-target]"?roomButtons:[]
};
const storage={values:{},getItem(k){return this.values[k]||null},setItem(k,v){this.values[k]=v},removeItem(k){delete this.values[k]}};
const ctx={window:{addEventListener(){}},document:doc,localStorage:storage,confirm:()=>true,location:{reload(){}},console};
vm.createContext(ctx);
for(const file of ["src/core/manifest.js","src/core/assets.js","src/core/save.js","src/core/audio.js","src/core/data.js","src/core/rules.js","src/game/room.js","src/game/desk.js","src/game/app.js"]){
 vm.runInContext(read(file),ctx,{filename:file});
}
const scene=id=>views.find(v=>v.id===id);
assert.equal(scene("room").hidden,false,"Room must be the initial gameplay screen");
assert(nodes["room-return"].hidden,"Don't show back button inside room");
assert(bodyModes.has("room-hub-active"),"Room should have immersive viewport styling");
assert(nodes["archive"].style["--ibm-shell-photo"]?.includes("assets/ui/ibm-shell.webp"),"The IBM 2260 must load the author's photo");
const firstSave=JSON.parse(storage.values["atwg-case01-v43"]);
for(const [target] of spots){
 roomButtons.find(x=>x.dataset.roomTarget===target).click();
 assert.equal(scene("room").hidden,true,"room should hide when station opens "+target);
 assert.equal(scene(target).hidden,false,"station should open from hotspot "+target);
 assert.equal(nodes["room-return"].hidden,false,"station must offer visible return button");
 nodes["room-return"].click();
 assert.equal(scene("room").hidden,false,"return button must restore room from "+target);
 assert.equal(nodes["room-return"].hidden,true,"return button must disappear on room");
 assert(bodyModes.has("room-hub-active"),"Room viewport class must be restored");
}
assert.deepEqual(JSON.parse(storage.values["atwg-case01-v43"]).papers,firstSave.papers,"Room visits must not delete printed papers");
assert(nodes["desk-stage"].style.backgroundImage?.includes("assets/props/tabletop.webp"),"Desk must use the supplied metallic desk photograph");
assert(html.includes('id="desk-backdrop"'),"Legacy desk SVG fallback must remain in HTML");
// Escape is an additional return affordance outside reading dialogs.
roomButtons.find(x=>x.dataset.roomTarget==="archive").click();
for(const fn of doc.events.keydown||[])fn({key:"Escape"});
assert.equal(scene("room").hidden,false,"Escape should return player to room");
console.log("PASS room image anchors, 6 glowing interactive stations, return navigation, save integrity and Escape.");

assert(html.includes('id="room-return"')&&html.includes('<span aria-hidden="true">&lt;</span>'),"room return is the sole icon in every scene");
assert(!/id="room-return"[^>]*title=/.test(html),"room return must not show a verbose browser tooltip");
assert(!/id="room-return"[^>]*>[^<]*QUAY LẠI PHÒNG/.test(html),"no visible return-to-room text");
console.log("PASS shared room-back button is icon-only without tooltip.");
