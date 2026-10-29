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
console.log("Archive and dossier rules: 15 checks passed.");
