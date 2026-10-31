/* Small asset registry. No eager downloads; every URL must be local and explicit. */
(function(root){
"use strict";
const manifest=root.ATWG_MANIFEST||{};
const acceptable=/^assets\/[A-Za-z0-9_./-]+\.(?:webp|png|jpe?g|svg|mp3|ogg|webm|wav)$/i;
function safePath(value){return typeof value==="string"&&acceptable.test(value)&&!value.includes("..")?value:null;}
function lookup(section,key){return safePath(manifest[section]?.[key]);}
function portrait(id){return lookup("portraits",String(id).padStart(2,"0"));}
function bind(el,section,key,fallback){
 const path=lookup(section,key);
 if(path)el.src=path;
 else if(fallback)el.src=fallback;
 return el;
}
root.ATWG_ASSETS=Object.freeze({
 manifest,url:lookup,portrait,bind,prop:kind=>lookup("props",kind),
 wirephoto:id=>lookup("wirephoto",id),audio:kind=>lookup("audio",kind)
});
})(window);
