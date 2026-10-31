#!/usr/bin/env node
"use strict";
// Verify local paths, budgets and WebP signatures; zero dependencies.
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,"src/core/manifest.js"),"utf8"),ctx);
const m=ctx.window.ATWG_MANIFEST,errors=[];
if(!m)throw Error("Asset manifest missing");
const allowed=/^assets\/[A-Za-z0-9_./-]+\.(webp|png|jpe?g|svg|mp3|ogg|webm|wav)$/i;
let total=0;
function check(uri,max,required,label){
 if(uri==null){if(required)errors.push(label+" missing manifest path");return;}
 if(typeof uri!=="string"||!allowed.test(uri)||uri.includes("..")){errors.push(label+" invalid path "+String(uri));return;}
 const file=path.resolve(root,uri);
 if(!file.startsWith(path.join(root,"assets")+path.sep)||!fs.existsSync(file)){errors.push(label+" missing local asset "+uri);return;}
 const bytes=fs.readFileSync(file);
 if(!bytes.length||bytes.length>max)errors.push(label+" invalid file size "+bytes.length);
 if(uri.endsWith(".webp")&&(bytes.toString("ascii",0,4)!=="RIFF"||bytes.toString("ascii",8,12)!=="WEBP"))errors.push(label+" invalid WebP signature");
 total+=bytes.length;
}
check(m.room?.main,600*1024,true,"room");
const portraitIds=Object.keys(m.portraits||{});
if(portraitIds.length!==30)errors.push("Exactly 30 portrait IDs required, got "+portraitIds.length);
for(let i=1;i<=30;i++){
 const id=String(i).padStart(2,"0"),file=m.portraits?.[id];
 if(file!=="assets/portraits/"+id+".webp")errors.push("Wrong portrait file for #"+id);
 check(file,20*1024,true,"portrait #"+id);
}
for(const [key,p] of Object.entries(m.props||{}))check(p,key==="tabletop"?240*1024:120*1024,false,"prop "+key);
for(const [key,p] of Object.entries(m.ui||{}))check(p,200*1024,false,"ui "+key);
for(const [key,p] of Object.entries(m.audio||{}))check(p,90*1024,false,"audio "+key);
for(const [key,p] of Object.entries(m.wirephoto||{}))check(p,180*1024,false,"wirephoto "+key);
check("assets/ui/terminal-bezel.svg",60*1024,true,"IBM bezel");
console.log("Referenced asset total: "+Math.round(total/1024)+" KiB.");
if(errors.length){for(const e of errors)console.error("FAIL "+e);process.exitCode=1;}
else console.log("PASS 30 independent WebP portraits, room art, provenance image paths and budgets.");
