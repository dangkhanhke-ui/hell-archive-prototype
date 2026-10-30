/* All Thirty Were Guilty: Dossier Desk physical sandbox v1.
 * A sheet's screen z-order is deliberately independent of its proof depth.
 * Existing per-copy paper UIDs and a saved 1965 archive are never replaced.
 */
(function(root){
'use strict';
const W=1280,H=800;
const bounds={paper:[225,300],folder:[308,386],clip:[78,60],nameplate:[178,62]};
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const elt=(tag,cl,txt)=>{const n=document.createElement(tag);if(cl)n.className=cl;if(txt!==undefined)n.textContent=txt;return n;};
const btn=(label,fn,cl)=>{const b=elt('button',cl,label);b.type='button';b.addEventListener('click',fn);return b;};
const take=(array,uid)=>array.find(x=>x.uid===uid);
const icons={
 folder:'<svg viewBox="0 0 308 386" aria-hidden="true"><defs><linearGradient id="folder-paper" x2=".94" y2="1"><stop stop-color="#bcab83"/><stop offset="1" stop-color="#8e7550"/></linearGradient></defs><path d="M6 34H111l24-25h121q12 0 12 12v29h27q8 0 8 9v312q0 10-10 10H16q-12 0-12-12V44q0-10 2-10" fill="url(#folder-paper)" stroke="#55472f" stroke-width="4"/><path d="M12 67h280v298H12z" fill="#a8926b" stroke="#d2bf94" stroke-width="2"/><path d="M21 75h264M21 358h264" stroke="#725d40" stroke-opacity=".5" stroke-width="2"/><rect x="30" y="95" width="225" height="58" rx="3" fill="#d1c3a0" stroke="#877a5d"/><path d="M42 113h154M42 125h199M42 137h177" stroke="#9f916e" stroke-width="2"/><circle cx="278" cy="345" r="15" fill="#72593a" opacity=".45"/></svg>',
 clip:'<svg viewBox="0 0 80 60" aria-hidden="true"><path d="M18 31q-4-15 8-21 12-7 23 6l7 9q11 13-2 23-10 8-20-2L22 33q-7-8 1-16 7-7 15 0l12 13" fill="none" stroke="#222b2d" stroke-width="10" stroke-linecap="round"/><path d="M18 31q-4-15 8-21 12-7 23 6l7 9q11 13-2 23-10 8-20-2L22 33q-7-8 1-16 7-7 15 0l12 13" fill="none" stroke="#aeb8a8" stroke-width="6" stroke-linecap="round"/></svg>',
 nameplate:'<svg viewBox="0 0 178 62" aria-hidden="true"><rect x="4" y="5" width="170" height="53" rx="5" fill="#473b2a" stroke="#a28e60" stroke-width="4"/><rect x="14" y="14" width="150" height="34" fill="#c7b88d" stroke="#564d39" stroke-width="2"/><path d="M20 20h136M20 43h136" stroke="#766849" opacity=".5"/></svg>'
};
function make(api){
 const {state,save,getItem,openPaper,navigate}=api;
 const rootEl=document.getElementById('desk-stage'),world=document.getElementById('desk-world');
 const inspector=document.getElementById('desk-inspector'),tools=document.getElementById('desk-toolbox');
 const trashDrawer=document.getElementById('desk-trash-drawer'),trashList=document.getElementById('desk-trash-list');
 const status=document.getElementById('desk-stage-status'),readyBtn=document.getElementById('desk-ready-button');
 const scene=state.scene||(state.scene={items:[],seq:0,z:20,active:null,pending:null});
 const paperIds=()=>new Set(state.papers.map(p=>p.uid));
 const newId=prefix=>prefix+'-'+(++scene.seq);
 const folderById=uid=>scene.items.find(x=>x.uid===uid&&x.kind==='folder');
 const itemById=uid=>scene.items.find(x=>x.uid===uid);
 const trash=p=>Boolean(p.location&&p.location.zone==='trash');
 const activeFolder=()=>folderById(scene.active);
 function persist(){save(); const badge=document.getElementById('paper-count');if(badge)badge.textContent='('+state.papers.filter(p=>!trash(p)).length+')';}
 function msg(text){status.textContent=text;}
 function addItem(kind,x,y,meta={}){
  const item={uid:newId(kind),kind,x,y,rot:(kind==='folder'?-1.7:kind==='clip'?8:0),z:++scene.z,...meta};
  scene.items.push(item);persist();return item;
 }
 function ensure(){
  if(scene.initialized){
   for(const p of state.papers){if(!take(scene.items,p.uid)){const i=scene.items.length;scene.items.push({kind:'paper',uid:p.uid,x:140+(i%6)*31,y:112+(i%7)*24,rot:(i%5-2)*2,z:++scene.z});}}
   return;
  }
  scene.initialized=true;
  const legacy=new Map();let offset=0;
  for(const paper of state.papers){
   if(paper.location&&paper.location.suspect && !paper.location.folderId){
    const suspect=paper.location.suspect;
    if(!legacy.has(suspect)){
     const f=addItem('folder',360+(offset%3)*185,105+Math.floor(offset/3)*85,{stack:[],nameId:suspect,clipped:false});legacy.set(suspect,f);offset++;
    }
   }
  }
  const byFolder=new Map();
  for(const [suspect,f] of legacy){
   const old=state.papers.filter(p=>p.location?.suspect===suspect).sort((a,b)=>(a.location.layer||0)-(b.location.layer||0));
   let lastLayer=0;
   for(const p of old){
    const layer=Math.max(0,Number(p.location.layer)||0);
    for(let k=lastLayer;k<layer;k++)f.stack.push({kind:'divider',uid:newId('divider')});
    lastLayer=layer;f.stack.push({kind:'paper',uid:p.uid});p.location={folderId:f.uid};
   }
   byFolder.set(f.uid,true);
  }
  let i=0;
  for(const p of state.papers){
   if(!take(scene.items,p.uid)){
    scene.items.push({kind:'paper',uid:p.uid,x:142+(i%7)*34,y:115+(i%7)*25,rot:(i%5-2)*2,z:++scene.z});i++;
   }
  }
  scene.active=scene.active||legacy.values().next().value?.uid||null;
  persist();
 }
 ensure();
 function resize(){const r=rootEl.getBoundingClientRect();if(!r.width)return;world.style.transform='scale('+(r.width/W)+')';}
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(rootEl);
 window.addEventListener('resize',resize);
 function space(ev){const r=rootEl.getBoundingClientRect();return{x:(ev.clientX-r.left)*W/(r.width||W),y:(ev.clientY-r.top)*W/(r.width||W)};}
 function raise(item){item.z=++scene.z;persist();}
 function getPose(item){return {x:item.x,y:item.y};}
 function sheetText(item,compact){
  const doc=getItem(item.id);if(!doc)return elt('div','desk-document-missing','Không tìm thấy bản giấy.');
  const sheet=elt('div','desk-page-paper');
  sheet.append(elt('div','desk-page-overline',doc.scope==='press'?'MONTELARA · NHẬT BÁO':doc.scope==='government'?'VĂN KHỐ CÔNG VỤ':doc.kind?'ẢNH TƯ LIỆU':'BIÊN BẢN ĐỐI CHẤT'));
  sheet.append(elt('h3','desk-page-headline',doc.title));
  sheet.append(elt('div','desk-page-dateline',(doc.date||'')+' · '+(doc.origin||'')));
  const body=elt('div','desk-page-excerpt');
  if(doc.kind){body.append(elt('p',null,'[ ẢNH TƯ LIỆU · '+doc.id+' ]'),elt('p',null,doc.caption||''));}
  else for(const p of (doc.body||[]).slice(0,compact?2:5))body.append(elt('p',null,p));
  sheet.append(body);sheet.append(elt('div','desk-page-foot','ARCHIVE · '+(doc.publicId||doc.id)));
  return sheet;
 }
 function inspectorButton(label,fn){inspector.append(btn(label,()=>{fn();render();},'desk-action'));}
 function showInspector(){
  inspector.replaceChildren();
  if(scene.virtualDivider?.uid===scene.selected){const f=folderById(scene.virtualDivider.folderId),tok=f?.stack.find(t=>t.uid===scene.selected);if(f&&tok){showDividerInspector(f,tok);return;}}
  const selected=scene.selected&&itemById(scene.selected);
  if(!selected){inspector.append(elt('p',null,'Nhấp một tờ giấy hoặc bìa hồ sơ để thao tác. Giữ chuột và kéo để đặt tự do.'));return;}
  const paper=state.papers.find(p=>p.uid===selected.uid);
  if(selected.kind==='paper'&&paper){
   const record=getItem(paper.id);inspector.append(elt('strong',null,record?.title||'Bản giấy'));
   const f=paper.location?.folderId&&folderById(paper.location.folderId);
   if(f){
    inspector.append(elt('small',null,'Đang nằm trong bìa '+f.uid+'. Thứ tự trong bìa: dưới → trên.'));
    inspectorButton('ĐỌC PHÓNG TO',()=>openPaper(paper.id));
    if(!f.clipped){
     inspectorButton('RÚT RA BÀN',()=>detach(paper,selected,f));
     inspectorButton('ĐƯA LÊN 1 TỜ',()=>reorder(f,paper.uid,1));
     inspectorButton('ĐƯA XUỐNG 1 TỜ',()=>reorder(f,paper.uid,-1));
     inspectorButton('CHÈN NGĂN TRƯỚC',()=>insertDivider(f,paper.uid));
    }else inspector.append(elt('small',null,'Hồ sơ đã kẹp. Tháo kẹp trước khi đổi giấy.'));
   }else{
    inspectorButton('ĐỌC PHÓNG TO',()=>openPaper(paper.id));
    if(activeFolder()&&!activeFolder().clipped)inspectorButton('ĐƯA VÀO BÌA ĐANG CHỌN',()=>attach(paper,activeFolder()));
    inspectorButton('BỎ VÀO THÙNG',()=>discard(paper));
   }
  }else if(selected.kind==='folder'){
   inspector.append(elt('strong',null,'BÌA HỒ SƠ · '+selected.uid));
   scene.active=selected.uid;
   inspector.append(elt('small',null,'Bên trong: '+selected.stack.filter(t=>t.kind==='paper').length+' tờ giấy. Chồng giấy xếp từ đáy (lớp ngoài) lên trên (lớp sâu).'));
   if(selected.nameId){const name=api.data.people.find(p=>p.id===selected.nameId);inspector.append(elt('small',null,'Bảng tên: #'+selected.nameId+' · '+(name?.name||'')));}
   if(selected.clipped)inspectorButton('THÁO KẸP',()=>{selected.clipped=false;msg('Đã mở kẹp, có thể sửa chồng.');});
   else inspector.append(elt('small',null,'Kéo chiếc kẹp từ góc bàn thả lên bìa để chốt.'));
   if(selected.clipped&&selected.nameId&&selected.stack.some(t=>t.kind==='paper'))inspectorButton('→ TIẾP NHẬN',()=>submitFolder(selected));
   if(!selected.clipped)inspectorButton('CHÈN NGĂN Ở ĐỈNH',()=>selected.stack.push({kind:'divider',uid:newId('divider')}));
  }else if(selected.kind==='clip'){
   inspector.append(elt('strong',null,'KẸP KIM LOẠI'));
   inspector.append(elt('small',null,'Kéo kẹp đặt vào bìa có giấy để chốt. Có thể tạo thêm bao nhiêu kẹp tùy ý.'));
   if(activeFolder())inspectorButton('KẸP BÌA ĐANG CHỌN',()=>fasten(selected,activeFolder()));
  }else if(selected.kind==='nameplate'){
   inspector.append(elt('strong',null,'BẢNG TÊN HỒ SƠ'));
   const select=elt('select','desk-name-select');select.setAttribute('aria-label','Chọn một trong 30 linh hồn');
   const first=elt('option',null,'CHỌN LINH HỒN');first.value='';select.append(first);
   for(const person of api.data.people){const opt=elt('option',null,'#'+person.id+' · '+person.name);opt.value=person.id;select.append(opt);}
   select.value=selected.nameId||'';select.addEventListener('change',ev=>{selected.nameId=ev.target.value;persist();});inspector.append(select);
   if(activeFolder())inspectorButton('GẮN LÊN BÌA ĐANG CHỌN',()=>markName(selected,activeFolder()));
  }else if(selected.kind==='divider'){
   inspector.append(elt('strong',null,'NGĂN PHÂN LỚP'));
   inspector.append(elt('small',null,'Ngăn này tách lớp chứng cứ ngoài ở dưới và lớp sâu hơn ở trên.'));
   const f=folderById(selected.folderId);
   if(f&&!f.clipped)inspectorButton('RÚT NGĂN',()=>{f.stack=f.stack.filter(t=>t.uid!==selected.uid);scene.selected=f.uid;});
  }
 }
 function placeStyle(el,item,w,h){el.style.left=item.x+'px';el.style.top=item.y+'px';el.style.width=w+'px';el.style.height=h+'px';el.style.transform='rotate('+item.rot+'deg)';el.style.zIndex=String(item.z);}
 function bindPointer(el,item,opts={}){
  el.addEventListener('pointerdown',ev=>{
   if(ev.button!==undefined&&ev.button!==0)return;
   if(ev.target.closest?.('button,select'))return;
   ev.preventDefault();ev.stopPropagation();
   scene.selected=item.uid; if(item.kind==='folder')scene.active=item.uid; if(item.kind==='paper')scene.focusedPaper=item.uid;
   raise(item);el.style.zIndex=String(item.z);
   const origin=space(ev),attachedFolder=opts.attached&&folderById(opts.attached);
   const base=attachedFolder?{x:attachedFolder.x+26,y:attachedFolder.y+65}:getPose(item),startX=ev.clientX,startY=ev.clientY;
   let moved=false;
   el.setPointerCapture?.(ev.pointerId);
   const move=e=>{
    const coord=space(e),dx=coord.x-origin.x,dy=coord.y-origin.y;
    if(!moved&&Math.hypot(e.clientX-startX,e.clientY-startY)<5)return;
    moved=true;el.classList.add('desk-grabbing');
    const size=bounds[item.kind]||bounds.paper;
    const x=clamp(base.x+dx,-size[0]*.55,W-size[0]*.45);
    const y=clamp(base.y+dy,-size[1]*.55,H-size[1]*.45);
    item.x=x;item.y=y;
    if(opts.attached){el.style.translate=dx+'px '+dy+'px';}
    else{el.style.left=x+'px';el.style.top=y+'px';}
   };
   const end=e=>{
    el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',end);el.removeEventListener('pointercancel',cancel);
    el.classList.remove('desk-grabbing');
    if(moved){
     if(opts.attached){const paper=state.papers.find(p=>p.uid===item.uid),f=folderById(opts.attached);if(paper&&f&&!f.clipped)detach(paper,item,f,true);}
     if(item.kind==='clip')tryDropClip(item);
     if(item.kind==='nameplate')tryDropPlate(item);
     if(item.kind==='paper'&&!opts.attached)tryDropTrash(item);
     persist();render();
    }else{
     if(item.kind==='paper'){const p=state.papers.find(p=>p.uid===item.uid);if(p)openPaper(p.id);}
     render();
    }
   };
   const cancel=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',end);el.removeEventListener('pointercancel',cancel);item.x=base.x;item.y=base.y;render();};
   el.addEventListener('pointermove',move);el.addEventListener('pointerup',end);el.addEventListener('pointercancel',cancel);
  });
 }
 function attach(paper,folder){if(folder.clipped)return false;
  for(const item of scene.items.filter(x=>x.kind==='folder'))item.stack=item.stack.filter(t=>t.uid!==paper.uid);
  folder.stack.push({kind:'paper',uid:paper.uid});paper.location={folderId:folder.uid};scene.active=folder.uid;msg('Đã thêm giấy vào bìa. Tờ mới nằm trên cùng.');persist();return true;
 }
 function detach(paper,item,folder,moving=false){
  if(folder.clipped)return;
  folder.stack=folder.stack.filter(t=>t.uid!==paper.uid);
  paper.location=null;
  if(!moving){item.x=clamp(folder.x+330,15,W-140);item.y=folder.y+25;}
  scene.selected=item.uid;persist();msg('Đã rút giấy, chồng còn lại giữ nguyên.');
 }
 function reorder(folder,uid,dir){const i=folder.stack.findIndex(t=>t.uid===uid);if(i<0)return;
  const j=i+dir;if(j<0||j>=folder.stack.length)return;
  const a=folder.stack[i];folder.stack[i]=folder.stack[j];folder.stack[j]=a;
  persist();msg('Đã thay đổi thứ tự giấy trong bìa.');
 }
 function insertDivider(folder,paperUid){const i=folder.stack.findIndex(t=>t.uid===paperUid);if(i<1)return;
  if(folder.stack[i-1]?.kind==='divider')return;
  folder.stack.splice(i,0,{kind:'divider',uid:newId('divider')});persist();
 }
 function tryDropClip(item){const f=hitFolder(item.x+38,item.y+25);if(f)fasten(item,f);}
 function fasten(item,folder){if(folder.clipped||!folder.stack.some(x=>x.kind==='paper')){msg('Bìa cần có giấy và chưa bị kẹp.');return;}
  folder.clipped=true;scene.items=scene.items.filter(x=>x.uid!==item.uid);scene.selected=folder.uid;scene.active=folder.uid;
  msg('Đã kẹp hồ sơ. Có thể tháo kẹp nếu cần sửa.');persist();
 }
 function tryDropPlate(item){const f=hitFolder(item.x+78,item.y+30);if(f)markName(item,f);}
 function markName(item,folder){if(!item.nameId){msg('Chọn một trong 30 cái tên trên bảng tên trước.');return;}
  folder.nameId=item.nameId;scene.items=scene.items.filter(x=>x.uid!==item.uid);scene.selected=folder.uid;scene.active=folder.uid;
  msg('Đã gắn bảng tên vào bìa.');persist();
 }
 function hitFolder(x,y){return scene.items.filter(o=>o.kind==='folder').sort((a,b)=>b.z-a.z).find(o=>x>=o.x+22&&x<=o.x+290&&y>=o.y+38&&y<=o.y+345);}
 function tryDropTrash(item){if(item.x+112>1085 && item.y+150>675){const paper=state.papers.find(p=>p.uid===item.uid);if(paper)discard(paper);}}
 function discard(paper){const old=paper.location?.folderId&&folderById(paper.location.folderId);
  if(old){if(old.clipped){msg('Tháo kẹp trước khi bỏ giấy khỏi bìa.');return;}old.stack=old.stack.filter(t=>t.uid!==paper.uid);}
  paper.location={zone:'trash'};scene.selected=null;msg('Giấy vào thùng rác. Có thể phục hồi.');persist();
 }
 function restore(paper){paper.location=null;
  const item=itemById(paper.uid);if(item){item.x=270+scene.z%6*28;item.y=80+scene.z%5*26;item.z=++scene.z;}
  msg('Giấy trở lại bàn.');persist();render();
 }
 function submitFolder(folder){if(!folder||!folder.clipped||!folder.nameId||!folder.stack.some(t=>t.kind==='paper'))return;
  scene.pending=folder.uid;scene.active=folder.uid;persist();navigate('admit');
 }
 function getSubmission(){
  const folder=folderById(scene.pending);if(!folder||!folder.clipped||!folder.nameId)return null;
  const papers=[],segments=[];let layer=0;
  for(const token of folder.stack){if(token.kind==='divider'){layer++;continue;}
   const p=state.papers.find(p=>p.uid===token.uid);if(!p||trash(p))continue;
   papers.push({id:p.id,location:{suspect:folder.nameId,layer}});segments.push(layer);
  }
  return {folder,subject:folder.nameId,papers,layers:1+folder.stack.filter(t=>t.kind==='divider').length};
 }
 function renderFolder(item){
  const el=elt('div','desk-object desk-folder'+(scene.active===item.uid?' desk-active':'')+(item.clipped?' desk-sealed':''));
  el.dataset.uid=item.uid;el.innerHTML=icons.folder;placeStyle(el,item,...bounds.folder);
  const caption=elt('div','desk-folder-caption',item.nameId?('#'+item.nameId+' '+(api.data.people.find(x=>x.id===item.nameId)?.name||'')):'HỒ SƠ CHƯA GẮN TÊN');el.append(caption);
  // Each page covers the previous physically; no auto-flow or cards laid in rows.
  let visualIndex=0;
  for(const tok of item.stack){
   if(tok.kind==='divider'){
    const tab=elt('div','desk-file-divider','NGĂN');tab.style.left=18+(visualIndex%5)*12+'px';tab.style.top=33+(visualIndex%5)*5+'px';tab.style.zIndex=String(80+visualIndex*2);tab.addEventListener('click',ev=>{ev.stopPropagation();scene.selected=tok.uid;scene.active=item.uid;scene.virtualDivider={uid:tok.uid,kind:'divider',folderId:item.uid};showDividerInspector(item,tok);});el.append(tab);visualIndex++;continue;
   }
   const p=state.papers.find(x=>x.uid===tok.uid),obj=itemById(tok.uid);if(!p||!obj)continue;
   const paperEl=elt('div','desk-object desk-page desk-contained');
   paperEl.dataset.uid=p.uid;paperEl.style.left=26+(visualIndex%5)*7+'px';paperEl.style.top=65+(visualIndex%5)*7+'px';paperEl.style.width='230px';paperEl.style.height='283px';paperEl.style.zIndex=String(scene.focusedPaper===p.uid?900:100+visualIndex*3);
   paperEl.append(sheetText(p));
   bindPointer(paperEl,obj,{attached:item.uid});el.append(paperEl);visualIndex++;
  }
  if(item.clipped){const clip=elt('div','desk-folder-fastener');clip.innerHTML=icons.clip;el.append(clip);}
  if(item.nameId){el.append(elt('div','desk-folder-name',('#'+item.nameId+' · '+(api.data.people.find(x=>x.id===item.nameId)?.name||''))));}
  if(item.clipped&&item.nameId&&item.stack.some(t=>t.kind==='paper')){
   const ready=btn('→ TIẾP NHẬN',()=>submitFolder(item),'desk-folder-ready');el.append(ready);
  }
  bindPointer(el,item);return el;
 }
 function showDividerInspector(folder,token){
  inspector.replaceChildren();inspector.append(elt('strong',null,'NGĂN PHÂN LỚP'));
  inspector.append(elt('p',null,'Các tờ bên dưới thuộc lớp ngoài, phía trên thuộc lớp sâu hơn.'));
  if(!folder.clipped)inspectorButton('RÚT NGĂN',()=>{folder.stack=folder.stack.filter(x=>x.uid!==token.uid);scene.selected=folder.uid;});
 }
 function renderItem(item){if(item.kind==='folder')return renderFolder(item);
  if(item.kind==='paper'){
   const paper=state.papers.find(p=>p.uid===item.uid);if(!paper||trash(paper)||paper.location?.folderId)return null;
   const element=elt('div','desk-object desk-page');element.dataset.uid=item.uid;
   placeStyle(element,item,...bounds.paper);element.append(sheetText(paper));bindPointer(element,item);return element;
  }
  const element=elt('div','desk-object desk-prop desk-'+item.kind+(scene.selected===item.uid?' desk-active':''));
  placeStyle(element,item,...(bounds[item.kind]||bounds.clip));element.innerHTML=icons[item.kind]||'';
  if(item.kind==='nameplate'&&item.nameId){element.append(elt('span','desk-prop-label','#'+item.nameId));}
  bindPointer(element,item);return element;
 }
 function renderTrash(){trashList.replaceChildren();const papers=state.papers.filter(trash);document.getElementById('desk-trash-count').textContent=String(papers.length);
  if(!scene.trashOpen){trashDrawer.hidden=true;return;}
  trashDrawer.hidden=false;
  if(!papers.length){trashList.append(elt('p',null,'Thùng đang trống.'));return;}
  for(const p of papers){const doc=getItem(p.id);const row=elt('div','desk-trash-row');row.append(elt('span',null,doc?.title||p.id));row.append(btn('LẤY RA',()=>restore(p)));trashList.append(row);}
 }
 function render(){ensure();resize();world.replaceChildren();
  for(const obj of [...scene.items].sort((a,b)=>a.z-b.z)){const e=renderItem(obj);if(e)world.append(e);}
  showInspector();renderTrash();
  const f=activeFolder();readyBtn.hidden=!(f?.clipped&&f.nameId&&f.stack.some(t=>t.kind==='paper'));
  if(!readyBtn.hidden)readyBtn.onclick=()=>submitFolder(f);
 }
 // The object tray is unlimited supply, not a grid where objects must remain.
 for(const tool of tools.querySelectorAll('[data-new-prop]')){
  tool.addEventListener('click',()=>{
   const kind=tool.dataset.newProp;
   const item=addItem(kind,kind==='folder'?400+scene.seq%5*65:kind==='clip'?760+scene.seq%5*45:560+scene.seq%5*55,
    kind==='folder'?100+scene.seq%6*37:kind==='clip'?160+scene.seq%7*38:120+scene.seq%6*51,
    kind==='folder'?{stack:[],nameId:null,clipped:false}:{});
   scene.selected=item.uid;if(kind==='folder')scene.active=item.uid;
   msg(kind==='folder'?'Đặt bìa ở nơi mày muốn.':'Đã lấy đạo cụ, kéo nó tới bất kỳ chỗ nào.');render();
  });
 }
 document.getElementById('desk-bin-button').addEventListener('click',()=>{scene.trashOpen=!scene.trashOpen;persist();renderTrash();});
 document.getElementById('desk-trash-close').addEventListener('click',()=>{scene.trashOpen=false;persist();renderTrash();});
 rootEl.addEventListener('pointerdown',ev=>{if(ev.target!==rootEl&&ev.target!==world)return;scene.selected=null;render();});
 return {render,getSubmission,submitFolder,scene,trash:discard,restore};
}
root.ATWG_DESK={create:make};
})(window);