/* Stable gameplay-save contract. Asset files and UI caches never enter the save. */
(function(root){
"use strict";
const key="atwg-case01-v43"; // Preserve existing player progress and UID values.
function read(storage){
 try{const value=JSON.parse(storage.getItem(key)||"{}");return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
 catch(_){return {};}
}
function write(storage,state){
 try{storage.setItem(key,JSON.stringify(state));return true;}catch(_){return false;}
}
root.ATWG_SAVE=Object.freeze({key,read,write});
})(window);
