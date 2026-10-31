/* Local, lazy Web Audio engine. Uploaded samples are optional; old synth sounds remain. */
(function(root){
"use strict";
let audioContext=null,lastPrinterSound=-100;
const samples=new Map();
function sample(kind){
 const src=root.ATWG_ASSETS?.audio(kind);
 if(!src||typeof root.Audio!=="function")return false;
 try{
  let a=samples.get(kind);
  if(!a){a=new root.Audio(src);a.preload="none";a.volume=kind==="print"?.9:.75;samples.set(kind,a);}
  a.pause();a.currentTime=0;
  const result=a.play();
  if(result&&typeof result.catch==="function")result.catch(()=>{samples.delete(kind);});
  return true;
 }catch(_){return false;}
}
function printer(ctx,now){
 if(now-lastPrinterSound<.24||!ctx.createBuffer||!ctx.createBufferSource||!ctx.createBiquadFilter)return;
 lastPrinterSound=now;
 const sr=ctx.sampleRate||44100,n=Math.floor(sr*.74);
 const buffer=ctx.createBuffer(1,n,sr),samples=buffer.getChannelData(0);
 for(let i=0;i<n;i++){
  const t=i/sr,env=Math.max(0,Math.min(1,t/.035,(.74-t)/.13));
  const feed=Math.sin(2*Math.PI*67*t)>0?1:.38;
  samples[i]=((Math.random()*2-1)*.77+Math.sin(2*Math.PI*122*t)*.23)*env*feed;
 }
 const source=ctx.createBufferSource();source.buffer=buffer;
 const filter=ctx.createBiquadFilter();filter.type="highpass";filter.frequency.value=240;
 const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,now);
 gain.gain.exponentialRampToValueAtTime(.27,now+.035);
 gain.gain.setValueAtTime(.27,now+.59);
 gain.gain.exponentialRampToValueAtTime(.0001,now+.74);
 source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
 source.start(now);source.stop(now+.75);
}
function play(kind="click",enabled=true){
 if(!enabled)return;
 if(sample(kind))return;
 const Ctx=root.AudioContext||root.webkitAudioContext;
 if(!Ctx)return;
 try{
  if(!audioContext)audioContext=new Ctx();
  if(audioContext.state==="suspended")void audioContext.resume();
  const now=audioContext.currentTime;
  if(kind==="print"){printer(audioContext,now);return;}
  const presets={
   click:[[620,0,.015,.012,"triangle"]],
   key:[[780,0,.009,.006,"square"]],
   search:[[420,0,.045,.018,"triangle"],[630,.055,.036,.015,"triangle"]],
   open:[[520,0,.035,.015,"sine"]],
   error:[[250,0,.085,.02,"sawtooth"],[210,.09,.095,.018,"sawtooth"]],
   fax:[[650,0,.065,.016,"sine"],[920,.07,.08,.014,"sine"]]
  };
  for(const [freq,delay,rawDuration,volume,wave] of (presets[kind]||presets.click)){
   const duration=Math.max(rawDuration,kind==="key"?.035:.04);
   const boostedVolume=volume*3;
   const osc=audioContext.createOscillator(),gain=audioContext.createGain();
   osc.type=wave;osc.frequency.setValueAtTime(freq,now+delay);
   gain.gain.setValueAtTime(.0001,now+delay);
   gain.gain.exponentialRampToValueAtTime(boostedVolume,now+delay+.003);
   gain.gain.exponentialRampToValueAtTime(.0001,now+delay+duration);
   osc.connect(gain);gain.connect(audioContext.destination);
   osc.start(now+delay);osc.stop(now+delay+duration+.005);
  }
 }catch(_){/* Audio is decorative; never break gameplay on a blocked device. */}
}
root.ATWG_AUDIO=Object.freeze({play});
})(window);
