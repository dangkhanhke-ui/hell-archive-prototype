(function(){
"use strict";
const D=window.ATWG_DATA,R=window.ATWG_RULES,key=window.ATWG_SAVE.key;
const $=id=>document.getElementById(id);
// The photographic IBM shell is a backdrop; the live CRT stays real HTML.
const shellPhoto=window.ATWG_ASSETS.ui("ibmShell");
if(shellPhoto&&$("archive").style.setProperty)$("archive").style.setProperty("--ibm-shell-photo",'url("'+shellPhoto+'")');

const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
const button=(text,fn,cls="")=>{const b=el("button",cls,text);b.type="button";b.addEventListener("click",fn);return b;};
const stored=window.ATWG_SAVE.read(localStorage);
let serial=Number(stored.serial)||0;
const newPaper=id=>({uid:"paper-"+(++serial),id,location:null});
const state={
 tab:"brief",scope:"press",query:"",mode:"idle",readIds:Array.isArray(stored.readIds)?stored.readIds:["A01","A02"],
 history:Array.isArray(stored.history)?stored.history:[],pins:Array.isArray(stored.pins)?stored.pins:[],
 papers:Array.isArray(stored.papers)?stored.papers:[newPaper("A01"),newPaper("A02")],
 transcripts:Array.isArray(stored.transcripts)?stored.transcripts:[],
 admitted:Array.isArray(stored.admitted)?stored.admitted:[],
 suspect:"27",lastPhotoId:null,selected:null,browse:"events",scene:stored.scene||null
};
function save(){window.ATWG_SAVE.write(localStorage,{serial,readIds:state.readIds,history:state.history,pins:state.pins,papers:state.papers,transcripts:state.transcripts,admitted:state.admitted,scene:state.scene});}
const isTrashed=p=>Boolean(p.location&&p.location.zone==="trash");
const activePaperCount=()=>state.papers.filter(p=>!isTrashed(p)).length;
function updatePaperCount(){$("paper-count").textContent="("+activePaperCount()+")";}
function trashPaper(uid){
 const paper=state.papers.find(p=>p.uid===uid);if(!paper||isTrashed(paper))return;
 paper.location={zone:"trash"};save();updatePaperCount();
 $("status").textContent="Một bản giấy đã vào thùng rác.";if(state.tab==="desk")renderDesk();
}
function restorePaper(uid){
 const paper=state.papers.find(p=>p.uid===uid);if(!paper||!isTrashed(paper))return;
 paper.location=null;save();updatePaperCount();
 $("status").textContent="Đã phục hồi giấy về khu tham khảo.";if(state.tab==="desk")renderDesk();
}
// Sound synthesis and sample loading live in the lazy core/audio service.
const SOUND_KEY="atwg-ibm-sound-v1";
let soundOn=localStorage.getItem(SOUND_KEY)!=="off",lastKeySound=0;
const ibmSound=kind=>window.ATWG_AUDIO.play(kind,soundOn);
function updateSoundToggle(){
 const toggle=$("archive-sound-toggle");
 toggle.textContent=soundOn?"ÂM THANH: BẬT":"ÂM THANH: TẮT";
 toggle.setAttribute("aria-pressed",String(soundOn));
}
$("archive-sound-toggle").addEventListener("click",()=>{
 soundOn=!soundOn;localStorage.setItem(SOUND_KEY,soundOn?"on":"off");
 updateSoundToggle();if(soundOn)ibmSound("open");
});
$("archive").addEventListener("click",event=>{
 if(event.target.closest && event.target.closest("button") && event.target.id!=="archive-sound-toggle")ibmSound("click");
});
$("query").addEventListener("keydown",event=>{
 if(!event.key||event.key.length!==1)return;
 const now=Date.now();if(now-lastKeySound<48)return;
 lastKeySound=now;ibmSound("key");
});
const getItem=id=>D.records.find(x=>x.id===id)||D.photos.find(x=>x.id===id)||state.transcripts.find(x=>x.id===id);
const sourceLabel=item=>item.scope==="press"?"PRESS":item.scope==="government"?"GOV":item.scope==="D"?"HẬU TỬ":"WIREPHOTO";
function metadata(item,box){
 const m=el("div","doc-meta");m.append(el("span",null,"NGÀY: "+(item.date||"KHÔNG GHI")),el("span",null,"NGUỒN: "+item.origin),el("span",null,"KHO: "+sourceLabel(item)),el("span",null,"THAM CHIẾU: "+(item.publicId||item.id)));
 box.append(m);
}
function paragraphs(item,box){(item.body||[]).forEach(x=>box.append(el("p",null,x)));}
function navigate(tab){
 state.tab=tab;
 document.querySelectorAll(".view").forEach(x=>x.classList.toggle("hidden",x.id!==tab));
 document.querySelectorAll("[data-tab]").forEach(x=>x.setAttribute("aria-current",x.dataset.tab===tab?"page":"false"));
 if(document.body?.classList)document.body.classList.toggle("room-hub-active",tab==="room");
 const back=$("room-return");if(back)back.hidden=tab==="room";
 if(tab==="archive")renderArchive();if(tab==="desk")renderDesk();if(tab==="souls")renderSouls();if(tab==="wire")renderWire();if(tab==="admit")renderAdmit();if(tab==="ledger")renderLedger();
 updatePaperCount();
}
document.querySelectorAll("[data-tab]").forEach(x=>x.addEventListener("click",()=>navigate(x.dataset.tab)));
document.querySelectorAll("[data-go]").forEach(x=>x.addEventListener("click",()=>navigate(x.dataset.go)));
window.ATWG_ROOM.setup(navigate,ibmSound);
function printPaper(id){if(!getItem(id))return;ibmSound("print");state.papers.push(newPaper(id));save();updatePaperCount();$("status").textContent="Đã in một bản: "+getItem(id).title;}
function renderOpening(){const box=$("opening-papers");box.replaceChildren();
 D.opening.forEach(id=>{const x=getItem(id),article=el("article","paper opening-sheet");article.append(el("small","eyebrow","BẢN BÁO / "+x.date),el("h2",null,x.title));paragraphs(x,article);
 article.append(button("ĐỌC TRONG IBM →",()=>{openRecord(id);navigate("archive");}));box.append(article);});
}
function searchNow(q,kindOverride){
 if(kindOverride)state.browse=kindOverride;
 state.query=String(q||"").trim();state.mode=state.query?"search":"idle";
 state.selected=null;$("query").value=state.query;
 const response=state.query?R.queryByKind(state.query,state.browse,state.scope):null;
 ibmSound(response&&!response.records.length?"error":"search");
 renderArchive();
}
const indexModes={
 people:{label:"TRA THEO NGƯỜI",hint:"Gõ tên người mày đã biết từ hồ sơ hoặc Grand Ledger. Không có danh sách gợi ý sẵn.",placeholder:"Gõ tên người..."},
 events:{label:"TRA THEO SỰ VIỆC",hint:"Gõ tên vụ, địa điểm hoặc số hồ sơ mày đã thấy trên giấy.",placeholder:"Gõ tên sự việc hoặc tham chiếu..."},
 publications:{label:"TRA THEO ẤN PHẨM",hint:"Gõ tên tờ báo hoặc chương trình đã thấy. Không có danh mục ấn phẩm mở sẵn.",placeholder:"Gõ tên ấn phẩm..."}
};
function setIndexMode(kind){
 state.browse=kind;if(kind==="publications")state.scope="press";
 state.query="";state.selected=null;state.mode="idle";
 $("query").value="";renderArchive();$("query").focus();
}
function openRecord(id){const x=D.records.find(r=>r.id===id);if(!x)return;ibmSound("open");state.selected=id;state.mode="reader";state.history=[id,...state.history.filter(v=>v!==id)].slice(0,80);if(!state.readIds.includes(id))state.readIds.push(id);save();renderArchive();}
function togglePin(id){state.pins=state.pins.includes(id)?state.pins.filter(x=>x!==id):[id,...state.pins];save();renderArchive();}
$("search-form").addEventListener("submit",ev=>{ev.preventDefault();searchNow($("query").value);});
$("scope-filter").addEventListener("change",ev=>{state.scope=ev.target.value;if(state.mode==="reader")state.mode="search";renderArchive();});
document.querySelectorAll("[data-browse]").forEach(x=>x.addEventListener("click",()=>setIndexMode(x.dataset.browse)));
$("archive-history").addEventListener("click",()=>{state.mode="history";renderArchive();});
$("archive-pins").addEventListener("click",()=>{state.mode="pins";renderArchive();});
function result(title,detail,act){
 const b=button("",act,"result-item");const info=el("span","result-info");info.append(el("strong",null,title),el("small",null,detail));b.append(el("span","result-index","□"),info,el("span","result-arrow","↗"));return b;
}
function readerRefs(item,where){
 if(!(item.refs||[]).length)return;
 const box=el("div","archive-reference-list");box.append(el("h3",null,"THAM CHIẾU GHI TRÊN GIẤY"));
 item.refs.forEach(ref=>{
  if(ref.kind==="search")box.append(button(ref.label,()=>{
  // A printed cross-reference can point into the other provenance catalogue.
  const matches=R.queryArchive(ref.query,state.scope).records;
  if(!matches.length){
   if(R.queryArchive(ref.query,"government").records.length)state.scope="government";
   else if(R.queryArchive(ref.query,"press").records.length)state.scope="press";
  }
  searchNow(ref.query,"events");
 }));
  if(ref.kind==="photo")box.append(button(ref.label,()=>{$("wire-code").value=ref.code;$("wire-message").textContent="Mã ghi trên giấy đã chuyển sang tổng đài. Nhấn GỌI 000.";navigate("wire");}));
 });where.append(box);
}
function renderArchive(){
 $("scope-filter").value=state.scope;
 $("scope-filter").disabled=state.browse==="publications";
 $("query").value=state.query;updateSoundToggle();
 $("query").placeholder=indexModes[state.browse].placeholder;
 $("search-mode-label").textContent=indexModes[state.browse].label;
 $("archive-idle-hint").textContent=indexModes[state.browse].hint;
 document.querySelectorAll("[data-browse]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.browse===state.browse)));
 const mode=state.mode;$("archive-idle").classList.toggle("hidden",mode!=="idle");
 $("archive-list").classList.toggle("hidden",mode==="idle"||mode==="reader");
 $("reader").classList.toggle("hidden",mode!=="reader");
 if(mode==="idle")return;
 if(mode==="reader"){
  const x=D.records.find(r=>r.id===state.selected);if(!x){state.mode="idle";return renderArchive();}
  const box=$("reader");box.replaceChildren();
  box.append(button("← KẾT QUẢ / TRA TIẾP",()=>{state.mode=state.query?"search":"idle";renderArchive();},"reader-back"),el("small","eyebrow",sourceLabel(x)),el("h2",null,x.title));metadata(x,box);paragraphs(x,box);readerRefs(x,box);
  box.append(button("IN BẢN SAO → BÀN GIẤY",()=>{printPaper(x.id);box.append(el("p","print-feedback","Đã gửi một bản tới bàn giấy."));}));
  box.scrollTop=0;return;
 }
 const out=$("results");out.replaceChildren();
 const head=$("results-title"),count=$("result-count");
 if(mode==="search"){
  const res=R.queryByKind(state.query,state.browse,state.scope),found=res.records||[];
  head.textContent=indexModes[state.browse].label+" · "+state.query;count.textContent=res.ok?found.length+" HỒ SƠ":"LỖI";
  if(!res.ok){out.append(el("p","empty-results",res.error));return;}
  if(!found.length){out.append(el("p","empty-results","Không có đề mục được biên mục. Thử tên người, cơ quan, sự kiện hoặc tham chiếu thấy trên giấy."));return;}
  found.forEach(x=>out.append(result(x.title,
   sourceLabel(x)+" · "+x.date+" · "+x.origin+" · "+(x.docket||x.publicId),
   ()=>openRecord(x.id))));
 }else if(mode==="history"||mode==="pins"){
  const ids=mode==="history"?state.history:state.pins;head.textContent=mode==="history"?"TÀI LIỆU ĐÃ XEM":"TÀI LIỆU ĐÃ GHIM";count.textContent=ids.length+" MỤC";
  if(!ids.length)out.append(el("p","empty-results","Chưa có mục nào."));
  ids.forEach(id=>{const x=D.records.find(r=>r.id===id);if(x)out.append(result(x.title,sourceLabel(x)+" · "+x.origin,()=>openRecord(id)));});
 }
 out.scrollTop=0;
}
function vectorPhoto(photo){
 const actual=window.ATWG_ASSETS.wirephoto(photo.id);
 if(actual){
  const frame=el("figure","photo"),image=el("img","wirephoto-asset");
  image.src=actual;image.alt=photo.title+" · "+photo.origin;image.loading="lazy";image.decoding="async";
  image.addEventListener("error",()=>{
   image.remove?.();
   const fallback=vectorPhoto({...photo,id:photo.id+"-missing"});
   frame.prepend?.(fallback.firstElementChild||fallback);
  });
  frame.append(image,el("figcaption",null,photo.title+" · "+photo.origin+" · "+photo.date));
  return frame;
 }
 const presets={
 rescue:'<rect x="25" y="82" width="320" height="122" fill="#7f857b"/><path d="M130 204V105h65v99" stroke="#30352f" stroke-width="8" fill="#bbc0b4"/><circle cx="245" cy="135" r="14"/><path d="M245 150v52m-30-35 30-7 30 13" stroke="#252a26" stroke-width="12" fill="none"/>',
 street:'<path d="M0 225h520" stroke="#30352e" stroke-width="30"/><rect x="25" y="55" width="190" height="145" fill="#93988e"/><rect x="300" y="35" width="160" height="165" fill="#707870"/><path d="M228 208v-65m-10 12h52l-20 20h-30" stroke="#252a27" stroke-width="11" fill="none"/><circle cx="226" cy="132" r="15" fill="#252a27"/>',
 newsroom:'<rect x="50" y="105" width="430" height="25" fill="#686e64"/><path d="M75 130l-20 110m390-110 15 110" stroke="#32372f" stroke-width="12"/><path d="M125 88h100l20 50H115z" fill="#353b34"/><rect x="140" y="43" width="80" height="58" fill="#d1d0be" transform="rotate(10 170 65)"/><path d="M305 75l90 15 -30 65 -80-20z" fill="#c3c2b1"/>',
 honor:'<rect x="20" y="55" width="460" height="155" fill="#888c7f"/><rect x="225" y="108" width="70" height="90" fill="#484d47"/><path d="M0 225h520" stroke="#343a34" stroke-width="26"/><g fill="#323a33"><circle cx="80" cy="200" r="13"/><circle cx="140" cy="200" r="13"/><circle cx="375" cy="200" r="13"/><circle cx="430" cy="200" r="13"/></g>'
 };
 const fig=el("figure","photo");const svg='<svg viewBox="0 0 520 270" role="img" aria-label="Ảnh minh họa placeholder, không phải ảnh production"><rect width="520" height="270" fill="#b0b3a7"/>'+presets[photo.kind]+'<text x="12" y="258" fill="#333b33" font-family="monospace" font-size="15">WORKING / VISUAL PLACEHOLDER</text></svg>';
 fig.innerHTML=svg;fig.append(el("figcaption",null,photo.title+" · "+photo.origin+" · "+photo.date+" · Minh họa thay thế (chưa là asset ảnh lịch sử)."));return fig;
}
function renderWire(){const area=$("wire-result");area.replaceChildren();if(state.lastPhotoId){const photo=D.photos.find(x=>x.id===state.lastPhotoId);if(photo)area.append(vectorPhoto(photo));}}
$("wire-form").addEventListener("submit",ev=>{ev.preventDefault();
 const photo=R.photoFor($("wire-code").value,state.readIds);
 if(!photo){$("wire-message").textContent="Không tìm thấy ảnh trong những mã đã ghi trên hồ sơ mày đọc. Máy không tự đoán mã.";state.lastPhotoId=null;renderWire();return;}
 state.lastPhotoId=photo.id;ibmSound("fax");printPaper(photo.id);$("wire-message").textContent="ĐÃ TRUYỀN VÀ IN: "+photo.id;renderWire();
});
let ledgerRendered=false;
function renderLedger(){
 if(ledgerRendered)return;
 ledgerRendered=true;
 const box=$("ledger-grid");box.replaceChildren();
 D.people.forEach(p=>{
  const card=el("div","ledger-person"),face=el("img","ledger-face ledger-portrait");
  face.alt="Chân dung #"+p.id+" · "+p.name;
  face.width=192;face.height=256;face.loading="lazy";face.decoding="async";
  const source=window.ATWG_ASSETS.portrait(p.id);
  if(source)face.src=source;
  else{face.classList.add("portrait-missing");face.alt="Chưa có chân dung #"+p.id;}
  face.addEventListener("error",()=>{face.removeAttribute?.("src");face.classList.add("portrait-missing");});
  card.append(face,el("small",null,"#"+p.id),el("strong",null,p.name));box.append(card);
 });
}
function renderSouls(){
 const person=$("soul-person"),paper=$("soul-paper"),oldPerson=person.value,oldPaper=paper.value;
 person.replaceChildren();D.people.forEach(p=>{const o=el("option",null,"#"+p.id+" · "+p.name);o.value=p.id;person.append(o);});
 if(oldPerson&&D.people.some(p=>p.id===oldPerson))person.value=oldPerson;
 paper.replaceChildren();const seen=new Set();state.papers.filter(p=>!isTrashed(p)).forEach(p=>{if(seen.has(p.id)||!getItem(p.id))return;seen.add(p.id);const o=el("option",null,getItem(p.id).title);o.value=p.id;paper.append(o);});
 if(oldPaper&&seen.has(oldPaper))paper.value=oldPaper;
 if(!seen.size){const o=el("option",null,"Chưa có giấy để đưa");o.value="";paper.append(o);}
}
$("soul-ask").addEventListener("click",()=>{
 const who=$("soul-person").value,id=$("soul-paper").value,out=$("soul-response");out.replaceChildren();if(!id)return;
 const name=D.people.find(p=>p.id===who)?.name||"Linh hồn";
 const exchanges=R.availableExchange(who,id);
 if(!exchanges.length){out.append(el("p",null,name+": Tôi không có điều gì kiểm chứng được về giấy này."));return;}
 const x=exchanges[0];out.append(el("h3",null,x.topic),el("blockquote","soul-quote",x.quote),el("small",null,"Lời nói chỉ xác nhận phản ứng sau khi chết. Kiểm lại hồ sơ lịch sử."));
 const transcriptId="D-"+who+"-"+id+"-"+D.exchanges.indexOf(x);
 let t=state.transcripts.find(t=>t.id===transcriptId);
 if(!t){t={id:transcriptId,title:"Đối chất: "+name+" / "+x.topic,date:"SAU NĂM 1965",origin:"Phòng đối chất địa ngục · #"+who,scope:"D",publicId:"POSTHUMOUS / "+who,body:["LỜI KHAI SAU KHI CHẾT",x.quote,"Chủ đề được đưa xem: "+getItem(id).title,"Bản ghi này chỉ chứng minh lời nói tại phòng đối chất, không phải lời khai lịch sử."]};state.transcripts.push(t);save();}
 out.append(button("IN LỜI KHAI SAU KHI CHẾT",()=>{printPaper(t.id);out.append(el("small",null,"Đã in transcript."));}));
});
function openPaper(id){const item=getItem(id);if(!item)return;const body=$("dialog-body");body.replaceChildren();$("dialog-title").textContent=item.title;metadata(item,body);if(item.kind)body.append(vectorPhoto(item));else paragraphs(item,body);$("paper-dialog").showModal();}
$("close-dialog").addEventListener("click",()=>$("paper-dialog").close());
// The physical tabletop is an independent 2D world with its own saved spatial state.
const desk=window.ATWG_DESK.create({state,save,getItem,openPaper,navigate,data:D});
function renderDesk(){desk.render();}
$("reset").addEventListener("click",()=>{if(!confirm("Xóa tiến độ Case 01 V4.3 trên trình duyệt này?"))return;localStorage.removeItem(key);location.reload();});
function renderAdmit(){
 const pack=desk.getSubmission(),preview=$("desk-admission-preview"),send=$("submit-dossier");
 preview.replaceChildren();
 if(!pack){preview.append(el("strong",null,"CHƯA CÓ HỒ SƠ ĐÃ KẸP"),el("p",null,"Trở về Bàn: lấy bìa, xếp giấy, gắn bảng tên và đặt kẹp lên hồ sơ trước khi nộp."));send.disabled=true;return;}
 send.disabled=false;
 const person=D.people.find(p=>p.id===pack.subject);
 preview.append(el("strong",null,"#"+pack.subject+" · "+(person?.name||"HỒ SƠ KHÔNG RÕ TÊN")));
 preview.append(el("small",null,pack.papers.length+" tờ giấy · "+pack.layers+" lớp suy luận · ĐÃ KẸP"));
 preview.append(el("p",null,"Chọn phòng tiếp nhận. Hồ sơ chỉ được kiểm tra khi nộp; không báo đúng/sai trong lúc xếp."));
}
$("submit-dossier").addEventListener("click",()=>{
 const pack=desk.getSubmission(),room=$("room").value,feedback=$("feedback");
 feedback.replaceChildren();feedback.classList.remove("hidden");
 if(!pack){feedback.append(el("strong",null,"CHƯA ĐÓNG HỒ SƠ"),el("p",null,"Kẹp và gắn tên lên bìa tại Bàn trước."));return;}
 if(!room){feedback.append(el("strong",null,"CHƯA CHỌN PHÒNG"));return;}
 const raw=R.evaluate(pack.subject,room,pack.papers);
 const result=raw==="invalid"?"jurisdiction":raw;
 const msg={jurisdiction:["OUTSIDE OUR JURISDICTION","Phòng này không nhận bản chất tội trong hồ sơ. Giấy và kẹp trả lại nguyên vẹn."],
 incomplete:["HỒ SƠ CHƯA ĐỦ","Các lớp chứng cứ hoặc bản chất tội chưa được chứng minh. Hồ sơ vẫn giữ nguyên để chỉnh sửa."],
 admitted:["ĐƯỢC TIẾP NHẬN","Chứng cứ và chiều sâu trách nhiệm đáp ứng phòng tiếp nhận."]};
 const lines=msg[result]||["HỒ SƠ KHÔNG HỢP LỆ","Cần tiếp tục điều tra."];
 feedback.append(el("strong",null,lines[0]),el("p",null,lines[1]));
 if(result==="admitted"&&!state.admitted.includes(pack.subject)){state.admitted.push(pack.subject);save();}
});
renderOpening();save();navigate("room");
})();
