/* Room is a hub, not a separate save. Its hotspots navigate existing gameplay screens. */
(function(root){
"use strict";
function setup(navigate,sound){
 document.querySelectorAll("[data-room-target]").forEach(marker=>marker.addEventListener("click",()=>{
  sound?.("open");navigate(marker.dataset.roomTarget);
 }));
 document.getElementById("room-return")?.addEventListener("click",()=>{sound?.("click");navigate("room");});
 document.addEventListener?.("keydown",event=>{
  if(event.key!=="Escape"||document.getElementById("room")?.classList.contains("hidden")===false)return;
  if(document.getElementById("paper-dialog")?.open)return;
  navigate("room");
 });
}
root.ATWG_ROOM=Object.freeze({setup});
})(window);
