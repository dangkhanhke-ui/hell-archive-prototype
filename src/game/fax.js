/* Physical MAX FAX keypad. This module does not alter Wirephoto provenance rules. */
(function(root){
"use strict";
const stage=document.getElementById("fax-stage");
if(!stage)return;
const output=document.getElementById("fax-display"),dialog=document.getElementById("fax-dialogue");
const code=document.getElementById("wire-code"),form=document.getElementById("wire-form");
const voice=document.getElementById("fax-voice"),message=document.getElementById("wire-message");
let digits="",connected=false;
function sound(kind){root.ATWG_AUDIO?.play(kind,true);}
function pressAnimation(button){
 button.classList.add("fax-pressed");
 setTimeout(()=>button.classList.remove("fax-pressed"),125);
}
function display(){output.textContent=connected?"0000":(digits.padEnd(4,"–"));}
function disconnect(){digits="";connected=false;dialog.hidden=true;voice.textContent="Alo, bộ phận tổng đài truyền ảnh xin nghe. Mã ảnh bạn yêu cầu là";message.textContent="";code.value="";display();}
function connect(){
 if(digits!=="0000"){message.textContent="";output.textContent="----";digits="";sound("error");return;}
 connected=true;dialog.hidden=false;display();sound("fax");code.focus();
}
stage.querySelectorAll("[data-fax-key]").forEach(button=>button.addEventListener("click",()=>{
 const digit=button.dataset.faxKey;
 pressAnimation(button);sound("key");
 if(connected)return;
 if(digit==="*"){digits=digits.slice(0,-1);display();return;}
 if(digit==="#"){connect();return;}
 if(!/^[0-9]$/.test(digit))return;
 digits=(digits+digit).slice(0,4);display();
 if(digits.length===4&&digits==="0000")connect();
}));
stage.querySelectorAll("[data-fax-action]").forEach(button=>button.addEventListener("click",()=>{
 pressAnimation(button);
 if(button.dataset.faxAction==="stop"){sound("click");disconnect();}
 else connect();
}));
form.addEventListener("submit",()=>{
 if(!connected){message.textContent="Gọi 0000 trước.";return;}
 // Existing app.js listener verifies author-indexed photo codes and prints the
 // resulting paper. Only reflect the line status here, never bypass its rules.
 const requested=code.value.trim();
 if(requested)voice.textContent="Tổng đài đang tra mã: "+requested;
});
display();
root.ATWG_FAX=Object.freeze({disconnect});
})(window);
