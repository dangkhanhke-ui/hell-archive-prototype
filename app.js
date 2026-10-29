(function () {
  "use strict";
  const D = window.ATWG_DATA, R = window.ATWG_RULES;
  const key = "atwg-case01-v02";
  const byId = id => document.getElementById(id);
  let old = {};
  try { old = JSON.parse(localStorage.getItem(key) || "{}"); } catch (_) { old = {}; }
  const state = {
    tab:"brief", scope:"government", query:"", selected:null, suspect:"09",
    readIds:Array.isArray(old.readIds)?old.readIds:[],
    papers:Array.isArray(old.papers)?old.papers.filter(p=>p && typeof p.uid==="string" && typeof p.id==="string"):[],
    admitted:Array.isArray(old.admitted)?old.admitted:[], lastPhoto:null
  };
  const findItem = id => D.records.find(r=>r.id===id) || D.photos.find(p=>p.id===id);
  const save = () => { try { localStorage.setItem(key,JSON.stringify({readIds:state.readIds,papers:state.papers,admitted:state.admitted})); } catch (_) {} };
  const node = (tag,cls,text) => {const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
  const btn = (label,action) => {const el=node("button",null,label);el.type="button";el.addEventListener("click",action);return el};
  function navigate(tab) {
    state.tab=tab;
    document.querySelectorAll(".view").forEach(el=>el.classList.toggle("hidden",el.id!==tab));
    document.querySelectorAll("[data-tab]").forEach(el=>{
      if(el.dataset.tab===tab)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current");
    });
    if(tab==="archive")renderArchive();
    if(tab==="desk")renderDesk();
    if(tab==="wire")renderWire();
    byId("paper-count").textContent=state.papers.length?`(${state.papers.length})`:"";
  }
  document.querySelectorAll("[data-tab]").forEach(el=>el.addEventListener("click",()=>navigate(el.dataset.tab)));
  document.querySelectorAll("[data-go]").forEach(el=>el.addEventListener("click",()=>navigate(el.dataset.go)));
  document.querySelectorAll(".scope").forEach(el=>el.addEventListener("click",()=>{
    state.scope=el.dataset.scope;state.selected=null;state.query="";byId("query").value="";renderArchive();
  }));
  byId("search-form").addEventListener("submit",ev=>{ev.preventDefault();state.query=byId("query").value;state.selected=null;renderArchive()});
  byId("browse").addEventListener("click",()=>{state.query="";state.selected=null;byId("query").value="";renderArchive()});

  function meta(item) {
    const box=node("div","doc-meta");
    box.append(node("span",null,`MÃ: ${item.id}`),node("span",null,`NGÀY: ${item.date}`),node("span",null,`NGUỒN: ${item.origin}`));
    return box;
  }
  function paragraphs(item,target){item.body.forEach(line=>target.append(node("p",null,line)))}
  function renderArchive() {
    document.querySelectorAll(".scope").forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.scope===state.scope)));
    byId("results-title").textContent=`${state.query.trim()?"Kết quả":"Mục lục"} · ${state.scope==="press"?"Báo chí lưu trữ":"Hồ sơ chính phủ"}`;
    const results=R.search(state.scope,state.query),container=byId("results");container.replaceChildren();
    if(!results.length)container.append(node("p","muted","Không có bản ghi trong mục từ này. Chỉ mục tìm theo metadata, không tìm toàn văn."));
    for(const item of results){
      const el=btn(item.title,()=>{state.selected=item.id;if(!state.readIds.includes(item.id))state.readIds.push(item.id);save();renderArchive()});
      el.className="result-item";el.setAttribute("aria-pressed",String(item.id===state.selected));
      el.append(node("small",null,`${item.date} · ${item.origin} · ${item.id}`));container.append(el);
    }
    const reader=byId("reader"),item=D.records.find(r=>r.id===state.selected && r.scope===state.scope);reader.replaceChildren();
    if(!item){reader.append(node("p","muted","Chọn một bản ghi. IBM hiển thị giấy gốc, không gợi ý giấy nào cần đọc tiếp."));return;}
    reader.append(node("small","doc-id",item.id),node("h2",null,item.title),meta(item));paragraphs(item,reader);
    reader.append(btn("IN MỘT BẢN GIẤY",()=>printPaper(item.id)));
  }
  function printPaper(id){
    state.papers.push({uid:`${Date.now()}-${Math.random().toString(36).slice(2)}`,id,location:null});save();
    byId("paper-count").textContent=`(${state.papers.length})`;
    byId("status").textContent=`ĐÃ IN ${id} · ${state.papers.length} BẢN TRÊN BÀN`;
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
  renderArchive();navigate("brief");
})();
