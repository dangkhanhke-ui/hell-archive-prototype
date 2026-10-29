const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const ctx = {window:{}};
vm.createContext(ctx);
for (const file of ["data.js","rules.js"]) vm.runInContext(fs.readFileSync(path.join(__dirname,file),"utf8"),ctx,{filename:file});
const {ATWG_DATA:D,ATWG_RULES:R} = ctx.window;

const government = R.search("government","Serrano").map(x=>x.id);
assert(government.includes("S04"),"Name-indexed final approval must not be hidden");
assert(!government.includes("T05"),"A criminal receipt indexed under its seizure must not be magically indexed under another name");
assert(R.search("press","tomas").some(x=>x.id==="C02"),"Accent-free search must work");
assert(R.search("government","N17").some(x=>x.id==="T08")===false,"Do not silently reinterpret codes: N-17 is the indexed form");
assert(R.search("government","N-17").some(x=>x.id==="T08"));
assert.equal(R.photoFor("WP-12B",[]),null,"A valid photo needs a read source document");
assert.equal(R.photoFor("wp 12b",["S02"]).id,"WP-12B");
assert.equal(R.photoFor("invented",["S02"]),null);

const make = (suspect,ids) => ids.map(([id,layer],i)=>({id,uid:String(i),location:{suspect,layer}}));
const serrano = make("09",[["C03",0],["C01",1],["S02",2],["WP-12B",2],["WP-12TX",2],["S03",3],["S04",3]]);
assert.equal(R.evaluate("09","VIII",serrano),"admitted");
assert.equal(R.evaluate("09","VII",serrano),"jurisdiction");
assert.equal(R.evaluate("09","VIII",serrano.filter(p=>p.id!=="WP-12TX")),"incomplete");
assert.equal(R.evaluate("09","VIII",serrano.map(p=>p.id==="S04"?{...p,location:{suspect:"09",layer:0}}:p)),"incomplete");
assert.equal(R.evaluate("09","VIII",[...serrano,...make("09",[["S01",2]])]),"admitted","Context can support a valid layer");

const ledesma = make("05",[["T08",0],["T05",1],["T09",1],["T04",2],["T07",2],["T01",3],["T02",3]]);
assert.equal(R.evaluate("05","IX",ledesma),"admitted");
assert.equal(R.evaluate("05","IX",ledesma.filter(p=>p.id!=="T02")),"incomplete","Death plus address sale does not prove the personal trust criterion");
assert.equal(R.evaluate("05","IX",[...ledesma,...make("05",[["T03",2],["T06",1]])]),"admitted");
assert.equal(R.evaluate("05","IX",[...ledesma,...make("05",[["C01",3]])]),"incomplete","Irrelevant filler must not count as a deeper explanation");
assert.equal(D.records.filter(x=>x.scope==="government").length + D.records.filter(x=>x.scope==="press").length,D.records.length);


// Unified IBM index / filing navigation contract.
const ids = (q,scope="all") => R.queryArchive(q,scope).records.map(r=>r.id);
for(const query of ["Serrano","Serrano_1962","Ledesma_Tomás Aguirre","Ledesma_Tomás Aguirre_1962"]) {
  assert.equal(R.parseQuery(query).ok,true,"Documented syntax should parse: "+query);
}
for(const query of ["Serrano__1962","Serrano_Tomás_1962_1963","_Serrano","Serrano_"]) {
  assert.equal(R.parseQuery(query).ok,false,"Malformed underscore grammar must be rejected: "+query);
}
assert(ids("Serrano").includes("S04"),"Unified lookup must include government documents");
assert(ids("Serrano").includes("C01"),"Unified lookup must include newspaper records");
assert(ids("Serrano_1962").includes("S04"),"Year metadata should match");
assert.equal(ids("Serrano_1963").length,0,"Document filing year, not event speculation");
assert(ids("Ledesma_Tomás Aguirre").includes("T01"),"Two-heading intersection must work");
assert(!ids("Ledesma_Tomás Aguirre").includes("T05"),"A document may not inherit links from another folder");
assert(ids("Chiến dịch San Aurelio").includes("C03"),"Published event aliases must resolve");
assert(ids("La Linterna").includes("C02"),"Publication headings should work");
assert(ids("N-17").includes("T08"),"Exact recorded case identifier must work");
assert.equal(ids("N17").length,0,"A misspelled code must not be silently accepted");
assert.equal(ids("Serrano__1962").length,0);
assert.equal(D.folders.flatMap(f=>f.records).length,D.records.length,"Every Case 01 record should belong to exactly one folder");
assert.equal(new Set(D.folders.flatMap(f=>f.records)).size,D.records.length);
for(const refs of Object.values(D.references))for(const ref of refs){
  if(ref.folder)assert(D.folders.some(folder=>folder.id===ref.folder),"All linked folders must exist");
  if(ref.photo)assert(D.photos.some(photo=>photo.id===ref.photo),"All linked photos must exist");
}

console.log("Archive, filing references, and dossier rules: all checks passed.");
