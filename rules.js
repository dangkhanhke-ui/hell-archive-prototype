(function(root){
"use strict";
const D=root.ATWG_DATA;
function normalize(value){return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").toLowerCase().replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");}
function parseQuery(value){
 const raw=String(value||"").trim();
 if(!raw)return {ok:false,error:"Nhập tên người, sự kiện, cơ quan hoặc số hồ sơ."};
 const headings=raw.split(/\s*\+\s*/).map(x=>x.trim());
 if(headings.some(x=>!x)||headings.length>2)return {ok:false,error:"Dùng một hoặc hai đề mục, nối bằng dấu +."};
 let year=null;
 const last=headings.length-1;const m=headings[last].match(/(?:^|\s)(19\d{2}|20\d{2})$/);
 if(m){year=m[1];headings[last]=headings[last].slice(0,m.index).trim();if(!headings[last])headings.pop();}
 return {ok:true,headings,year};
}
function indexedFields(record){
 return [record.id,record.title,record.origin,record.docket,record.publicId,...(record.terms||[])].filter(Boolean).map(normalize);
}
function matchesHeading(record,heading){
 const needle=normalize(heading);if(!needle)return true;
 const fields=indexedFields(record);
 if(fields.some(x=>x===needle||x.startsWith(needle+" ")||x.endsWith(" "+needle)||x.includes(" "+needle+" ")))return true;
 const indexed=" "+fields.join(" ")+" ";
 return needle.split(" ").every(token=>indexed.includes(" "+token+" ")||fields.some(x=>x.includes(token)));
}
function queryArchive(input,scope="all"){
 const parsed=parseQuery(input);
 if(!parsed.ok)return {...parsed,records:[]};
 const records=D.records.filter(r=>(scope==="all"||r.scope===scope)&&(!parsed.year||r.date.endsWith(parsed.year))&&parsed.headings.every(h=>matchesHeading(r,h)));
 return {...parsed,records};
}
function search(scope,query){return query?queryArchive(query,scope).records:D.records.filter(r=>scope==="all"||r.scope===scope);}
function photoFor(code,readIds){
 const raw=String(code||"").trim();
 const photo=D.photos.find(p=>p.id.toUpperCase()===raw.toUpperCase());if(!photo)return null;
 return readIds.some(id=>D.records.some(r=>r.id===id&&(r.refs||[]).some(ref=>ref.kind==="photo"&&ref.code===photo.id)))?photo:null;
}
const layerRules={
 "27":[{required:["A12"],allow:["A02","A03","A05","CAT-STREET"]},
       {required:["A07"],oneOf:[["A06","A05","IMG-HF-STREET","CAT-STREET"]],allow:["A06","A05","IMG-HF-STREET","CAT-STREET","B-R1"]},
       {required:["A08","A09","A10","A11"],allow:["B-R2"]}],
 "14":[{required:["A17","A20"],allow:["IMG-HF-NEWSROOM"]},
       {required:["A18","A19"],allow:["A20","B-P1"]}],
 "05":[{required:["B-L1","A23"],allow:["B-L2"]},
       {required:["A24"],allow:["A23","B-L2"]},
       {required:["A22","A22-L"],allow:["A21-P","B-L1"]}]
};
function evaluate(suspect,room,papers){
 const s=D.suspects[suspect];if(!s)return "invalid";
 if(s.room!==room)return "jurisdiction";
 if(s.open)return "incomplete";
 const layers=layerRules[suspect];if(!layers)return "incomplete";
 const placed=(papers||[]).filter(p=>p.location&&p.location.suspect===suspect);
 const idsAt=i=>new Set(placed.filter(p=>p.location.layer===i).map(p=>p.id));
 const valid=layers.every((layer,i)=>{
  const ids=idsAt(i);
  if(!layer.required.every(id=>ids.has(id)))return false;
  if((layer.oneOf||[]).some(group=>!group.some(id=>ids.has(id))))return false;
  return [...ids].every(id=>layer.required.includes(id)||(layer.allow||[]).includes(id)||(layer.oneOf||[]).some(g=>g.includes(id)));
 });
 return valid?"admitted":"incomplete";
}
function availableExchange(who,readId){
 return (D.exchanges||[]).filter(x=>x.who===who&&x.trigger.includes(readId));
}
root.ATWG_RULES={normalize,parseQuery,indexedFields,matchesHeading,queryArchive,search,photoFor,evaluate,availableExchange,layerRules};
})(window);
