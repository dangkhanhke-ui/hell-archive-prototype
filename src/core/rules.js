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
 // No one-letter guesses or year-only queries that return an entire archive.
 if(!headings.length || headings.some(h=>normalize(h).replace(/ /g,"").length<3)){
   return {ok:false,error:"Đề mục quá ngắn. Gõ ít nhất 3 ký tự và dùng tên/từ khóa có trên giấy (vd: Viedma, Rojas, 215/VP)."};
 }
 return {ok:true,headings,year};
}
function indexedFields(record){
 // Filing aliases are authored metadata, not fuzzy full-text search.
 return [record.title,record.origin,record.docket,record.publicId,...(record.terms||[]),...(record.aliases||[])].filter(Boolean).map(normalize);
}
function matchesHeading(record,heading){
 const needle=normalize(heading);if(!needle)return true;
 // Only complete indexed words and consecutive phrases match.
 // Never fall back to arbitrary character substrings across metadata fields.
 return indexedFields(record).some(value=>(" "+value+" ").includes(" "+needle+" "));
}
function queryArchive(input,scope="all"){
 const parsed=parseQuery(input);
 if(!parsed.ok)return {...parsed,records:[]};
 const records=D.records.filter(r=>(scope==="all"||r.scope===scope)&&(!parsed.year||r.date.endsWith(parsed.year))&&parsed.headings.every(h=>matchesHeading(r,h)));
 return {...parsed,records};
}
// Each category is a way to SEARCH, never a browsable all-record directory.
function queryByKind(input,kind="all",scope="all"){
 const result=queryArchive(input,scope);
 if(!result.ok)return result;
 if(kind==="all")return result;
 const needle=normalize(result.headings.join(" "));
 if(kind==="publications"){
   return {...result,records:result.records.filter(r=>r.scope==="press" && normalize(r.origin).includes(needle))};
 }
 if(kind==="events"){
   return {...result,records:result.records.filter(r=>!r.id.startsWith("BIO-"))};
 }
 if(kind==="people"){
   const people=[...D.people.map(p=>p.name),"Tomás Aguirre","Elisa Aguirre","Samuel Olmedo","Rafael Córdova","Funes","Viedma"];
   const matchesPerson=people.some(p=>normalize(p).includes(needle)||needle.includes(normalize(p)));
   return {...result,records:matchesPerson?result.records:[]};
 }
 return {...result,records:[]};
}
function search(scope,query){return query?queryArchive(query,scope).records:D.records.filter(r=>scope==="all"||r.scope===scope);}
function photoFor(code,readIds){
 const raw=String(code||"").trim();
 const photo=D.photos.find(p=>p.id.toUpperCase()===raw.toUpperCase());if(!photo)return null;
 return readIds.some(id=>D.records.some(r=>r.id===id&&(r.refs||[]).some(ref=>ref.kind==="photo"&&ref.code===photo.id)))?photo:null;
}
const layerRules={
 "27":[{required:["A12"],allow:["A02","A03","A05","CAT-STREET"]},
       {required:["A07"],oneOf:[["A06","A05","IMG-HF-STREET","CAT-STREET"]],allow:["A06","A05","IMG-HF-STREET","CAT-STREET","B-R1","A08","A09","A10"]},
       {required:["A11"],allow:["A08","A09","A10","B-R2"]}],
 "14":[{required:["A17"],allow:["A20","IMG-HF-NEWSROOM"]},
       {required:["A18","A19"],allow:["A20","B-P1"]}],
 "05":[{required:["B-L1"],allow:["A23","B-L2"]},
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
 const shared={ "27":{ids:["A08","A09","A10"],layers:[1,2]}, "14":{ids:["A20"],layers:[0,1]}, "05":{ids:["A23"],layers:[0,1]} }[suspect];
 const sharedValid=!shared||shared.ids.every(id=>placed.some(p=>p.id===id&&shared.layers.includes(p.location.layer)));
 return valid&&sharedValid?"admitted":"incomplete";
}
function availableExchange(who,readId){
 return (D.exchanges||[]).filter(x=>x.who===who&&x.trigger.includes(readId));
}
root.ATWG_RULES={normalize,parseQuery,indexedFields,matchesHeading,queryArchive,queryByKind,search,photoFor,evaluate,availableExchange,layerRules};
})(window);
