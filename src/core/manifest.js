/* Single source of truth for all authored visual/audio files. Replace assets at these paths without editing gameplay. */
(function(root){
"use strict";
const portraits={};
for(let n=1;n<=30;n++){const id=String(n).padStart(2,"0");portraits[id]="assets/portraits/"+id+".webp";}
root.ATWG_MANIFEST=Object.freeze({
 version:"assets-v1",
 room:Object.freeze({main:"assets/room/main.webp"}),
 portraits:Object.freeze(portraits),
 // Optional: leave null until an authored prop replaces the existing in-game SVG.
 props:Object.freeze({folder:null,clip:null,nameplate:null,divider:null,trash:null,tray:null,tabletop:null}),
 // Use original provenance IDs as keys; never fabricate a wirephoto for a private crime.
 wirephoto:Object.freeze({}),
 // Synthesized audio is the fallback; add a file path only after uploading a sample.
 audio:Object.freeze({click:null,key:null,search:null,open:null,print:null,error:null,fax:null})
});
})(window);
