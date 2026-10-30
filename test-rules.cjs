const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const ctx={window:{}};vm.createContext(ctx);
for(const f of ["data.js","rules.js"])vm.runInContext(fs.readFileSync(path.join(__dirname,f),"utf8"),ctx,{filename:f});
const {ATWG_DATA:D,ATWG_RULES:R}=ctx.window;
const ids=(q,s="all")=>R.queryArchive(q,s).records.map(x=>x.id);
const papers=(suspect,layers)=>layers.flatMap(([layer,items])=>items.map(id=>({id,location:{suspect,layer}})));
assert.equal(D.people.length,30,"30 ledger identities, no roles/circles exposed there");
assert.deepEqual(Array.from(D.opening),["A01","A02"],"exactly two public opening papers");
for(let i=1;i<=24;i++)assert(D.records.some(x=>x.id==="A"+String(i).padStart(2,"0")),"A evidence "+i);
for(const id of ["B-R1","B-R2","B-V1","B-V2","B-V3","B-P1","B-L1","B-L2"])assert(D.records.some(x=>x.id===id));
assert.equal(D.photos.length,4);
assert(ids("Viedma","press").includes("A12"));
assert(ids("Viedma","government").includes("B-R2"),"independent prosecution route");
assert(ids("Cobre Films Servicios","government").includes("A08"));
assert(ids("Cobre Films Servicios","government").includes("B-R2"));
assert(ids("Rojas","government").includes("A10"),"legitimate indexed subject not hidden");
assert(ids("Rojas","government").includes("BIO-27"));
assert(ids("Samuel Olmedo","press").includes("B-V2"));
assert(ids("Samuel Olmedo","government").includes("B-V3"));
assert(ids("Samuel Olmedo","government").includes("A14"));
assert(ids("Rafael Córdova","government").includes("A15"));
assert(ids("Rafael Córdova","government").includes("A23"));
assert(ids("215/VP","government").includes("A19"));
assert(ids("INV-HF-SAFE","government").includes("B-L2"));
assert(ids("La Linterna bồi thường","government").includes("A20"));
assert(ids("Lễ ghi công Plaza del Reloj","press").includes("A21"));
assert(ids("phụ lục lễ ghi công","government").includes("A21-P"));
assert(!ids("Tomás Aguirre","press").includes("A01"),"T1: no protected identity in opening paper");
assert(!ids("Tomás Aguirre","press").includes("A21"),"T1: no name in public honor photo catalog");
assert(ids("Tomás Aguirre","government").includes("A21-P"));
assert(ids("Elisa thư Tomás","government").includes("A22-L"),"private letter only archived after submission");
assert(!ids("Elisa thư Tomás","press").includes("A22-L"));
assert(ids("Viedma 1962","press").includes("A12"));
assert(!ids("Viedma 1963","press").includes("A12"));
assert(ids("La Linterna + Ponce","press").includes("A18"));
assert.equal(R.parseQuery("A+B+C").ok,false);
for(const record of D.records)for(const ref of record.refs||[]){
 if(ref.kind==="search")assert(ids(ref.query).length>0,record.id+" broken discovery: "+ref.query);
 if(ref.kind==="photo")assert(D.photos.some(x=>x.id===ref.code),record.id+" broken image: "+ref.code);
}
for(const p of D.photos){
 assert.equal(R.photoFor(p.id,[]),null,"image not freely guessed");
 assert.equal(R.photoFor(p.id,[p.source]).id,p.id,"document unlocks its authored image reference");
}
assert.equal(R.photoFor("WRONG",D.records.map(r=>r.id)),null);
assert.equal(R.availableExchange("09","A12").length,1);
assert.equal(R.availableExchange("28","A22").length,1);
assert.equal(R.availableExchange("09","A23").length,0,"unrelated soul does not know the secret");
const rojas=papers("27",[[0,["A12"]],[1,["A07","A06"]],[2,["A08","A09","A10","A11"]]]);
assert.equal(R.evaluate("27","VIII",rojas),"admitted");
assert.equal(R.evaluate("27","VIII",rojas.filter(x=>x.id!=="A11")),"incomplete","a payment alone cannot convict");
assert.equal(R.evaluate("27","VII",rojas),"jurisdiction");
const rojasAlt=papers("27",[[0,["A12"]],[1,["A07","IMG-HF-STREET"]],[2,["A11","A08","A10","A09"]]]);
assert.equal(R.evaluate("27","VIII",rojasAlt),"admitted","alternative mid proof and shuffled same-layer order");
const ponce=papers("14",[[0,["A20","A17"]],[1,["A19","A18"]]]);
assert.equal(R.evaluate("14","V",ponce),"admitted");
assert.equal(R.evaluate("14","V",ponce.filter(x=>x.id!=="A20")),"incomplete");
const ledesma=papers("05",[[0,["A23","B-L1"]],[1,["A24"]],[2,["A22-L","A22"]]]);
assert.equal(R.evaluate("05","IX",ledesma),"admitted");
assert.equal(R.evaluate("05","IX",ledesma.filter(x=>x.id!=="A22-L")),"incomplete","reliance matters");
assert.equal(R.evaluate("05","IX",ledesma.filter(x=>x.id!=="A24")),"incomplete","access does not prove sale");
assert.equal(R.evaluate("07","VII",papers("07",[[0,["A15","A16"]]])),"jurisdiction","deepest IX not solved in Case01");
assert.equal(R.evaluate("07","IX",papers("07",[[0,["A15","A16"]]])),"incomplete","Case01 cannot finish Varela");
assert.equal(R.evaluate("14","V",[...ponce,{id:"A02",location:{suspect:"14",layer:1}}]),"incomplete","wrong causal evidence must not count");
console.log("PASS Case 01 V4.3: sources, indexed routes, photo provenance, soul knowledge and dossier validation.");


// Index category buttons must never populate an unrestricted entity list.
assert.equal(R.queryByKind("","people").ok,false,"people requires a typed search");
assert.equal(R.queryByKind("","events").ok,false,"events requires a typed search");
assert.equal(R.queryByKind("","publications").ok,false,"publications requires a typed search");
assert(R.queryByKind("Viedma","events").records.some(r=>r.id==="B-R2"),"event search still finds judicial dossier");
assert(R.queryByKind("Rojas","people").records.some(r=>r.id==="A10"),"person search finds named records");
assert.equal(R.queryByKind("San Aurelio","people").records.length,0,"person filter should not be event list");
assert(R.queryByKind("La Linterna","publications").records.some(r=>r.id==="A02"),"publication search finds the newspaper");
assert(!R.queryByKind("La Linterna","publications").records.some(r=>r.id==="A19"),"publication mode does not return government mentions of a newspaper");
assert.equal(R.queryByKind("Viedma","publications").records.length,0,"event name is not automatically a publication");

// The IBM must not expose unrestricted GOV+PRESS browse results from any UI control.
const html=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
const app=fs.readFileSync(path.join(__dirname,"app.js"),"utf8");
assert.equal((html.match(/data-browse=/g)||[]).length,3,"only person / event / publication");
assert(!html.includes('value="all"'),"no ALL source option");
assert(!html.includes("TRA CHUNG"),"no general browse control");
assert(html.includes('id="archive-sound-toggle"'),"IBM volume toggle present");
assert(html.includes('src="portraits.js?v='),"portrait scripts loaded");
assert(app.includes("function ibmSound("),"Web Audio mechanical feedback wired");
vm.runInContext(fs.readFileSync(path.join(__dirname,"portraits.js"),"utf8"),ctx,{filename:"portraits.js"});
const rows=ctx.window.ATWG_FACE_ROWS;
assert.equal(rows.length,3,"30 portraits arranged in three 10-face rows");
for(const row of rows){
 const bytes=Buffer.from(row,"base64");
 assert.equal(bytes.toString("ascii",0,4),"RIFF","WebP RIFF header");
 assert.equal(bytes.toString("ascii",8,12),"WEBP","WebP image header");
 assert(bytes.length>12000,"retain detail in cropped images");
}
console.log("PASS IBM GOV/PRESS, 3 query modes, 30 identity portraits and sound wiring.");
