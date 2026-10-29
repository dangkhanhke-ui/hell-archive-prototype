(function () {
  "use strict";
  const D = window.ATWG_DATA, R = window.ATWG_RULES;
  const key = "atwg-case01-v02";
  const byId = id => document.getElementById(id);
  let old = {};
  try { old = JSON.parse(localStorage.getItem(key) || "{}"); } catch (_) { old = {}; }

  const state = {
    tab:"archive",scope:"all",query:"",selected:null,suspect:"09",
    archiveMode:"idle",browseKind:"people",activeFolder:null,backStack:[],
    readIds:Array.isArray(old.readIds)?old.readIds:[],
    historyIds:Array.isArray(old.historyIds)?old.historyIds:[],
    pins:Array.isArray(old.pins)?old.pins:[],
    papers:Array.isArray(old.papers)?old.papers.filter(p=>p && typeof p.uid==="string" && typeof p.id==="string"):[],
    admitted:Array.isArray(old.admitted)?old.admitted:[],lastPhoto:null
  };
  const findItem = id => D.records.find(r=>r.id===id) || D.photos.find(p=>p.id===id);
  const folderById = id => D.folders.find(f=>f.id===id);
  const folderFor = id => D.folders.find(f=>f.records.includes(id));
  const save = () => {
    try { localStorage.setItem(key,JSON.stringify({
      readIds:state.readIds,historyIds:state.historyIds,pins:state.pins,
      papers:state.papers,admitted:state.admitted
    })); } catch (_) {}
  };
  const node = (tag,cls,value) => {
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(value!==undefined)el.textContent=value;
    return el;
  };
  const btn = (value,action) => {
    const el=node("button",null,value);el.type="button";el.addEventListener("click",action);return el;
  };
  function navigate(tab) {
    state.tab=tab;
    document.querySelectorAll(".view").forEach(el=>el.classList.toggle("hidden",el.id!==tab));
    document.querySelectorAll("[data-tab]").forEach(el=>{
      if(el.dataset.tab===tab)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current");
    });
    if(tab==="archive")renderArchive();
    if(tab==="desk")renderDesk();
    if(tab==="wire")renderWire();
    byId("paper-count").textContent=state.papers.length?"("+state.papers.length+")":"";
  }
  document.querySelectorAll("[data-tab]").forEach(el=>el.addEventListener("click",()=>navigate(el.dataset.tab)));
  document.querySelectorAll("[data-go]").forEach(el=>el.addEventListener("click",()=>navigate(el.dataset.go)));
  function snapshot() {
    return {archiveMode:state.archiveMode,selected:state.selected,activeFolder:state.activeFolder,
      browseKind:state.browseKind,query:state.query,scope:state.scope};
  }
  function enter(mode,values) {
    state.backStack.push(snapshot());
    Object.assign(state,values||{},{archiveMode:mode});
    renderArchive();
  }
  function backArchive() {
    const previous=state.backStack.pop();
    if(previous)Object.assign(state,previous);
    else Object.assign(state,{archiveMode:"idle",selected:null,activeFolder:null});
    renderArchive();
  }
  function searchNow(query) {
    const value=String(query||"").trim();
    byId("query").value=value;
    enter(value?"search":"idle",{query:value,selected:null,activeFolder:null});
  }
  byId("search-form").addEventListener("submit",ev=>{
    ev.preventDefault();searchNow(byId("query").value);
  });
  document.querySelectorAll("[data-browse]").forEach(el=>el.addEventListener("click",()=>{
    enter("browse",{browseKind:el.dataset.browse,selected:null});
  }));
  byId("scope-filter").addEventListener("change",ev=>{
    state.scope=ev.target.value;
    if(state.archiveMode==="search"||state.archiveMode==="browse")renderArchive();
  });
  byId("archive-history").addEventListener("click",()=>enter("history",{selected:null}));
  byId("archive-pins").addEventListener("click",()=>enter("pins",{selected:null}));

  function meta(item) {
    const box=node("div","doc-meta");
    box.append(node("span",null,"MÃ: "+item.id),
      node("span",null,"NGÀY: "+(item.date||"KHÔNG GHI")),
      node("span",null,"NGUỒN: "+item.origin));
    return box;
  }
  function paragraphs(item,target) {
    item.body.forEach(line=>target.append(node("p",null,line)));
  }
  function openFolder(id) {
    if(folderById(id))enter("folder",{activeFolder:id,selected:null});
  }
  function openRecord(id) {
    const record=D.records.find(r=>r.id===id);
    if(!record)return;
    state.historyIds=[id,...state.historyIds.filter(x=>x!==id)].slice(0,30);
    if(!state.readIds.includes(id))state.readIds.push(id);
    save();
    enter("reader",{selected:id,activeFolder:folderFor(id)?.id||null});
  }
  function togglePin(id) {
    state.pins=state.pins.includes(id)?state.pins.filter(x=>x!==id):[id,...state.pins];
    save();renderArchive();
  }
  function resultButton(title,subtitle,action,number) {
    const el=btn("",action);el.className="result-item";
    el.append(node("span","result-index",number||"□"));
    const info=node("span","result-info");
    info.append(node("strong",null,title),node("small",null,subtitle));
    el.append(info,node("span","result-arrow","↗"));
    return el;
  }
  function readerExtra(item,reader) {
    const folder=folderFor(item.id);
    if(folder) {
      const pin=btn(state.pins.includes(folder.id)?"BỎ GHIM TẬP":"GHIM TẬP NÀY",()=>togglePin(folder.id));
      pin.className="archive-reader-tool";reader.append(pin);
    }
    const refs=D.references[item.id]||[];
    if(refs.length) {
      const section=node("div","archive-reference-list");
      section.append(node("h3",null,"THAM CHIẾU GHI TRÊN GIẤY"));
      refs.forEach(ref=>{
        if(ref.folder&&!folderById(ref.folder))return;
        const action=ref.folder?()=>openFolder(ref.folder):()=>{
          byId("wire-code").value=ref.photo;
          byId("wire-message").textContent="Mã "+ref.photo+" đã được điền từ phiếu. Nhấn GỌI 000 để yêu cầu ảnh.";
          navigate("wire");
        };
        section.append(btn(ref.label+" ↗",action));
      });
      reader.append(section);
    }
    const names=D.lookups[item.id]||[];
    if(names.length) {
      const section=node("div","archive-reference-list");
      section.append(node("h3",null,"TRA NHANH TÊN ĐƯỢC GHI"));
      names.forEach(name=>section.append(btn("TRA: "+name,()=>searchNow(name))));
      reader.append(section);
    }
  }
  function renderArchive() {
    byId("scope-filter").value=state.scope;
    byId("query").value=state.query;
    const mode=state.archiveMode,results=byId("results"),reader=byId("reader");
    byId("archive-idle").classList.toggle("hidden",mode!=="idle");
    byId("archive-list").classList.toggle("hidden",mode==="idle"||mode==="reader");
    reader.classList.toggle("hidden",mode!=="reader");
    if(mode==="idle")return;
    if(mode==="reader") {
      const item=D.records.find(r=>r.id===state.selected);
      reader.replaceChildren();
      if(!item){backArchive();return;}
      const back=btn("← QUAY LẠI",backArchive);back.className="reader-back";
      reader.append(back,node("small","doc-id",item.id),node("h2",null,item.title),meta(item));
      paragraphs(item,reader);readerExtra(item,reader);
      reader.append(btn("IN BẢN SAO → BÀN GIẤY",()=>printPaper(item.id)),node("p","print-feedback"));
      reader.scrollTop=0;return;
    }
    results.replaceChildren();
    const heading=byId("results-title"),counter=byId("result-count");
    if(state.backStack.length){
      const back=btn("← QUAY LẠI",backArchive);back.className="archive-list-back";results.append(back);
    }
    if(mode==="search") {
      const response=R.queryArchive(state.query,state.scope),found=response.records||[];
      heading.textContent="TRA CỨU: "+state.query;
      counter.textContent=response.ok?found.length+" BẢN GHI":"SAI CÚ PHÁP";
      if(!response.ok){results.append(node("p","empty-results",response.error));return;}
      const folders=D.folders.filter(f=>f.records.some(id=>found.some(r=>r.id===id)));
      if(!folders.length)results.append(node("p","empty-results",
        "Không có mục lục khớp. Thử tên ngắn hơn hoặc duyệt Người / Sự việc / Ấn phẩm."));
      folders.forEach((folder,i)=>{
        const hits=folder.records.filter(id=>found.some(r=>r.id===id)).length;
        results.append(resultButton(folder.title,
          folder.origin+" · "+hits+" mục khớp · "+folder.records.length+" tờ trong tập",
          ()=>openFolder(folder.id),String(i+1).padStart(2,"0")));
      });
    } else if(mode==="browse") {
      const name={people:"NGƯỜI",events:"SỰ VIỆC",publications:"ẤN PHẨM"}[state.browseKind];
      const items=D.catalog[state.browseKind]||[];
      heading.textContent="SỔ MỤC LỤC / "+name;
      counter.textContent=items.length+" ĐỀ MỤC";
      items.forEach((item,i)=>{
        const n=R.queryArchive(item.query,state.scope).records.length;
        results.append(resultButton(item.label,n+" bản ghi · chọn để tra cứu",
          ()=>searchNow(item.query),String(i+1).padStart(2,"0")));
      });
    } else if(mode==="folder") {
      const folder=folderById(state.activeFolder);
      if(!folder){backArchive();return;}
      heading.textContent=folder.title;
      counter.textContent=folder.records.length+" TỜ · "+folder.origin.toUpperCase();
      const pin=btn(state.pins.includes(folder.id)?"BỎ GHIM TẬP":"GHIM TẬP HỒ SƠ",()=>togglePin(folder.id));
      pin.className="archive-list-pin";results.append(pin);
      folder.records.forEach((id,i)=>{
        const record=D.records.find(r=>r.id===id);
        if(record)results.append(resultButton(record.title,
          (record.date||"Không ghi ngày")+" · "+record.origin+" · "+record.id+
          (state.readIds.includes(id)?" · ĐÃ ĐỌC":""),
          ()=>openRecord(id),String(i+1).padStart(2,"0")));
      });
    } else if(mode==="history") {
      heading.textContent="TÀI LIỆU ĐÃ XEM";counter.textContent=state.historyIds.length+" BẢN GHI";
      if(!state.historyIds.length)results.append(node("p","empty-results","Chưa đọc tờ giấy nào."));
      state.historyIds.forEach((id,i)=>{
        const record=D.records.find(r=>r.id===id);
        if(record)results.append(resultButton(record.title,record.origin+" · "+id,
          ()=>openRecord(id),String(i+1).padStart(2,"0")));
      });
    } else if(mode==="pins") {
      heading.textContent="TẬP HỒ SƠ ĐÃ GHIM";counter.textContent=state.pins.length+" TẬP";
      if(!state.pins.length)results.append(node("p","empty-results","Mở một tập rồi chọn GHIM TẬP."));
      state.pins.forEach((id,i)=>{
        const folder=folderById(id);
        if(folder)results.append(resultButton(folder.title,folder.origin+" · "+folder.records.length+" tờ",
          ()=>openFolder(id),String(i+1).padStart(2,"0")));
      });
    }
    results.scrollTop=0;
  }
  function printPaper(id){
    state.papers.push({uid:`${Date.now()}-${Math.random().toString(36).slice(2)}`,id,location:null});save();
    byId("paper-count").textContent=`(${state.papers.length})`;
    byId("status").textContent=`ĐÃ IN ${id} · ${state.papers.length} BẢN TRÊN BÀN`;
    if(state.tab==="archive")byId("reader").querySelector(".print-feedback").textContent="Đã gửi một bản tới Bàn giấy.";
  }

  function photoFrame(kind) {
    // Identical chipped paint on the same left door panel; the broadcast crop changes its framing.
    const aired=kind==="broadcast";
    return `<svg viewBox="0 0 560 270" role="img" aria-label="Cửa kho với vệt sơn trắng hình móc ở cánh trái">
      <rect width="560" height="270" fill="#858b83"/><path d="M0 225H560" stroke="#484e49" stroke-width="30"/>
      <rect x="108" y="27" width="344" height="194" fill="#616960" stroke="#313a35" stroke-width="12"/>
      <path d="M280 28V217" stroke="#242b28" stroke-width="7"/><path d="M247 115h12m43 0h12" stroke="#c4c5bc" stroke-width="7"/>
      <path d="M141 119q20-16 31 0q-13 4-8 18" fill="none" stroke="#d9d8c6" stroke-width="8" stroke-linecap="round"/>
      <path d="M60 33h50M58 34v34M500 33h-48M501 34v34M60 185v38h50M500 185v38h-48" fill="none" stroke="#e1e0d3" stroke-width="3" opacity=".7"/>
      ${aired?'<rect x="0" y="230" width="560" height="40" fill="#282c2b"/><text x="15" y="255" fill="#ece9db" font-size="16" font-family="monospace">TRUY BẮT / HÌNH TẠI HIỆN TRƯỜNG · 15:20</text>':'<rect x="5" y="228" width="256" height="36" fill="#282c2b"/><text x="15" y="251" fill="#ece9db" font-size="16" font-family="monospace">12/B · 08/09 · TAKE 03</text>'}
      <path d="M0 53H560M0 121H560M0 178H560" stroke="#ebece5" opacity=".07" stroke-width="4"/>
    </svg>`;
  }
  function photoView(photo){
    const fig=node("figure","photo");
    // Only the fixed locally authored SVG string is inserted as markup.
    fig.innerHTML=photoFrame(photo.kind);
    fig.append(node("figcaption",null,`${photo.id} · ${photo.origin} · ${photo.caption}`));
    return fig;
  }
  function renderWire(){
    const view=byId("wire-result");view.replaceChildren();
    if(state.lastPhoto){view.append(photoView(state.lastPhoto));view.append(node("p","photo-label",`Bản ${state.lastPhoto.id} đã in và đặt trên bàn.`));}
  }
  byId("wire-form").addEventListener("submit",ev=>{
    ev.preventDefault();const photo=R.photoFor(byId("wire-code").value,state.readIds);
    if(!photo){byId("wire-message").textContent="Không tìm được ảnh theo mã đã nhập trong những phiếu mày đã đọc.";state.lastPhoto=null;renderWire();return;}
    state.lastPhoto=photo;printPaper(photo.id);byId("wire-message").textContent=`Tổng đài xác nhận ${photo.id}. Bản ảnh vừa được truyền và in.`;renderWire();
  });

  function paperCard(p,assigned){
    const item=findItem(p.id),card=node("div",`paper-card ${D.photos.some(photo=>photo.id===p.id)?"wire-card":""}`);
    card.draggable=true;card.addEventListener("dragstart",ev=>{ev.dataTransfer.setData("text/plain",p.uid);ev.dataTransfer.effectAllowed="move"});
    card.append(node("strong",null,`${item.id} · ${item.title}`),node("small",null,item.origin));
    const actions=node("div","card-actions");actions.append(btn("ĐỌC",()=>openPaper(p.id)));
    if(assigned){actions.append(btn("THÁO RA",()=>movePaper(p.uid,null)));}
    else {
      const select=node("select");select.setAttribute("aria-label",`Lớp cho ${p.id}`);
      for(let i=0;i<D.suspects[state.suspect].layers;i++){let opt=node("option",null,`LỚP ${i+1}`);opt.value=String(i);select.append(opt);}
      actions.append(select,btn("ĐẶT VÀO LỚP",()=>movePaper(p.uid,Number(select.value))));
    }
    card.append(actions);return card;
  }
  function openPaper(id){
    const item=findItem(id),body=byId("dialog-body");body.replaceChildren();byId("dialog-title").textContent=item.title;
    body.append(meta(item));
    if(item.body)paragraphs(item,body);else body.append(photoView(item));
    byId("paper-dialog").showModal();
  }
  byId("close-dialog").addEventListener("click",()=>byId("paper-dialog").close());
  function movePaper(uid,layer){
    const paper=state.papers.find(p=>p.uid===uid);if(!paper)return;
    paper.location=layer===null?null:{suspect:state.suspect,layer};save();renderDesk();
  }
  function renderDesk(){
    document.querySelectorAll(".suspect").forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.suspect===state.suspect)));
    byId("stack-title").textContent=D.suspects[state.suspect].name;
    byId("inventory-count").textContent=String(state.papers.filter(p=>!p.location).length);
    const inventory=byId("inventory"),layers=byId("layers");inventory.replaceChildren();layers.replaceChildren();
    const loose=state.papers.filter(p=>!p.location);
    if(!loose.length)inventory.append(node("p","empty","Chưa có giấy chưa xếp. Mở IBM để in, hoặc gọi Wirephoto khi đã có mã."));
    loose.forEach(p=>{if(findItem(p.id))inventory.append(paperCard(p,false))});
    for(let i=0;i<D.suspects[state.suspect].layers;i++){
      const layer=node("div","layer");layer.dataset.layer=String(i);
      layer.append(node("h3",null,`LỚP ${String(i+1).padStart(2,"0")} · ${i===0?"BỀ MẶT":i===3?"SÂU NHẤT":"ĐI SÂU HƠN"}`));
      const placed=state.papers.filter(p=>p.location && p.location.suspect===state.suspect && p.location.layer===i);
      if(!placed.length)layer.append(node("small","empty","Thả giấy vào đây hoặc dùng nút ĐẶT VÀO LỚP."));
      placed.forEach(p=>{if(findItem(p.id))layer.append(paperCard(p,true))});
      layer.addEventListener("dragover",ev=>{ev.preventDefault();layer.dataset.over="true"});
      layer.addEventListener("dragleave",()=>{layer.dataset.over="false"});
      layer.addEventListener("drop",ev=>{ev.preventDefault();layer.dataset.over="false";movePaper(ev.dataTransfer.getData("text/plain"),i)});
      layers.append(layer);
    }
  }
  document.querySelectorAll(".suspect").forEach(el=>el.addEventListener("click",()=>{state.suspect=el.dataset.suspect;renderDesk()}));
  byId("reset").addEventListener("click",()=>{if(!confirm("Xóa giấy đã in, tài liệu đã đọc và dossier của bản thử này?"))return;state.readIds=[];state.papers=[];state.admitted=[];state.lastPhoto=null;save();byId("status").textContent="BẢN THỬ ĐÃ ĐẶT LẠI";renderDesk();byId("paper-count").textContent=""});
  byId("submit-dossier").addEventListener("click",()=>{
    const suspect=byId("submit-suspect").value,room=byId("room").value,feedback=byId("feedback");
    if(!room){feedback.textContent="Chọn một phòng tiếp nhận trước khi nộp.";feedback.classList.remove("hidden");return;}
    const result=R.evaluate(suspect,room,state.papers);feedback.replaceChildren();feedback.classList.remove("hidden");
    const messages={jurisdiction:["KHÔNG THUỘC THẨM QUYỀN", "Quầy này không nhận hồ sơ cho bản chất tội lỗi đã nộp. Giấy được trả lại nguyên vẹn."],incomplete:["HỒ SƠ CHƯA ĐỦ", "Quầy có thẩm quyền, nhưng chồng giấy chưa chứng minh trọn hành vi và căn cứ cho tầng này, hoặc có giấy đang nằm ở lớp không được nó giải thích."],admitted:["ĐƯỢC TIẾP NHẬN", `${D.suspects[suspect].name}: hồ sơ có đủ chuỗi chứng cứ từ sự kiện ngoài cùng tới quyết định và bản chất sâu nhất.`]};
    const [title,detail]=messages[result]||["LỖI", "Hồ sơ không hợp lệ."];
    feedback.append(node("strong",null,title),node("p",null,detail));
    if(result==="admitted"&&!state.admitted.includes(suspect)){state.admitted.push(suspect);save();}
  });
  renderArchive();navigate("archive");
})();
