/* audio.js - AudioMan: genuine single-channel voice allocation with pause/resume & live telemetry.
   Fallback chain (kept on purpose):
     1. saved clip  (pre-composed Kokoro af_heart WAV/MP3 shipped with the site - works on GitHub Pages too)
     2. /api/tts    (local server: Kokoro on the GPU, or the small ONNX model on the CPU; disk-cached;
                     also honored on lessons/overviews when the learner selects a non-default Kokoro voice!)
     3. browser     (speechSynthesis) when no local server is reachable or it fails twice.
   Generation counter + AbortController guarantee a stale request can never hijack newer audio. */
let audio=new Audio();
const VOICE_STATE={server:null,engine:"checking",label:"Checking voice engine..."};
function fmtAudioTime(sec){
 if(!Number.isFinite(sec)||sec<0) return "0:00";
 const s=Math.floor(sec), m=Math.floor(s/60);
 return m+":"+String(s%60).padStart(2,"0");
}
const AudioMan={
 q:[],busy:false,gpuFail:0,gen:0,_ac:null,playing:false,paused:false,
 activeSource:"",activeVoice:"af_heart",activeLabel:"",
 curTime:0,durTime:0,listeners:[],
 _emit(){ this.listeners.forEach(fn=>{try{fn(this)}catch(e){}}); },
 _setState(playing,paused){
  const changed=this.playing!==playing||this.paused!==paused;
  this.playing=playing; this.paused=Boolean(paused);
  if(changed) this._emit();
 },
 stop(){
  this.gen++; this.q=[];
  if(this._ac){try{this._ac.abort()}catch(e){} this._ac=null}
  audio.onended=null; audio.onerror=null;
  try{audio.pause(); audio.currentTime=0;}catch(e){}
  try{speechSynthesis.cancel()}catch(e){}
  this.busy=false; this.curTime=0; this.durTime=0;
  this._setState(false,false);
 },
 togglePause(){
  if(!this.playing&&!this.paused) return false;
  if(this.activeSource==="browser"){
   try{
    if(this.paused){ speechSynthesis.resume(); this._setState(true,false); }
    else { speechSynthesis.pause(); this._setState(true,true); }
    return true;
   }catch(e){ return false; }
  }
  try{
   if(audio.paused){
    const p=audio.play(); if(p&&p.catch) p.catch(()=>{});
    this._setState(true,false);
   } else {
    audio.pause();
    this._setState(true,true);
   }
   return true;
  }catch(e){ return false; }
 },
 /* Play a saved clip; if the learner chose a non-default Kokoro voice on localhost and fallbackText fits,
    genuinely synthesize with their chosen voice first, falling back seamlessly to the saved af_heart clip. */
 clip(path,fallbackText){
  this.stop();
  const cleanFallback=fallbackText?plainText(fallbackText):"";
  if(VOICE_STATE.server&&this.gpuFail<2&&prefs.voice&&prefs.voice!=="af_heart"&&cleanFallback&&cleanFallback.length<=1200){
   this._liveWithFallback(cleanFallback,path);
   return;
  }
  this._playStatic(path,cleanFallback);
 },
 _playStatic(path,fallbackText){
  const myGen=this.gen;
  this.activeSource="saved";
  this.activeVoice="af_heart";
  this.activeLabel="Saved Kokoro · Heart";
  audio.onended=()=>{ if(myGen===this.gen){ this.curTime=this.durTime; this._setState(false,false); } };
  audio.onerror=()=>{ if(myGen!==this.gen) return; audio.onerror=null; this._setState(false,false); if(fallbackText) this.say(fallbackText,true); };
  audio.src=path; audio.playbackRate=getVoiceRate();
  this._setState(true,false);
  const p=audio.play();
  if(p&&p.catch) p.catch(()=>{ if(myGen===this.gen&&!this.paused) this._setState(false,false); });
 },
 async _liveWithFallback(text,fallbackClipPath){
  const myGen=this.gen, voice=prefs.voice||"af_heart";
  const ac=typeof AbortController!=="undefined"?new AbortController():null; this._ac=ac;
  this.activeSource="kokoro-live";
  this.activeVoice=voice;
  this.activeLabel="Live Kokoro \u00b7 "+(VOICES[voice]||voice).split(" ")[0];
  this._setState(true,false);
  try{
   const opts={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:redactSSN(text).slice(0,1200),voice})};
   if(ac) opts.signal=ac.signal;
   const r=await fetch("/api/tts",opts);
   if(myGen!==this.gen) return;
   if(!r.ok) throw 0;
   const d=await r.json();
   if(myGen!==this.gen) return;
   if(this._ac===ac) this._ac=null;
   this.gpuFail=0;
   audio.onended=()=>{ if(myGen===this.gen){ this.curTime=this.durTime; this._setState(false,false); } };
   audio.onerror=()=>{ if(myGen===this.gen){ audio.onerror=null; this._playStatic(fallbackClipPath,""); } };
   audio.src=d.url; audio.playbackRate=getVoiceRate();
   if(!this.paused){
    try{ await audio.play(); }catch(pe){ if(myGen===this.gen&&!this.paused) throw pe; }
   }
  }catch(e){
   if(this._ac===ac) this._ac=null;
   if(myGen!==this.gen||this.paused) return;
   this.gpuFail++;
   this._playStatic(fallbackClipPath,"");
  }
 },
 /* Speak dynamic text (questions, feedback). force=true ignores the Read-aloud preference (explicit Listen click). */
 say(text,force){ if(!force&&!prefs.voiceOn) return; const t=plainText(text); if(!t) return; this.q.push(t); this._pump(); },
 _browser(text,done){
  this.activeSource="browser";
  this.activeVoice="browser";
  this.activeLabel="Browser voice";
  this._emit();
  try{ const u=new SpeechSynthesisUtterance(text); u.rate=getVoiceRate(); u.onend=done; u.onerror=done; speechSynthesis.speak(u) }catch(e){ done() }
 },
 async _pump(){
  if(this.busy||!this.q.length) return;
  this.busy=true; this._setState(true,false);
  const myGen=this.gen, text=this.q.shift(), voice=prefs.voice||"af_heart";
  const done=()=>{ if(myGen!==this.gen) return; this.busy=false; if(this.q.length) this._pump(); else this._setState(false,false); };
  if(!VOICE_STATE.server||this.gpuFail>=2){ this._browser(text,done); return }
  const ac=typeof AbortController!=="undefined"?new AbortController():null; this._ac=ac;
  this.activeSource="kokoro-live";
  this.activeVoice=voice;
  this.activeLabel="Live Kokoro · "+(VOICES[voice]||voice).split(" ")[0];
  this._emit();
  try{
   const opts={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:redactSSN(text).slice(0,1200),voice})};
   if(ac) opts.signal=ac.signal;
   const r=await fetch("/api/tts",opts);
   if(myGen!==this.gen) return;
   if(!r.ok) throw 0; const d=await r.json();
   if(myGen!==this.gen) return;
   if(this._ac===ac) this._ac=null;
   this.gpuFail=0;
   audio.src=d.url; audio.playbackRate=getVoiceRate(); audio.onended=done; audio.onerror=done;
   if(!this.paused){
    try{ await audio.play(); }catch(pe){ if(myGen===this.gen&&!this.paused) throw pe; }
   }
  }catch(e){
   if(this._ac===ac) this._ac=null;
   if(myGen!==this.gen||this.paused) return;
   audio.onended=null; audio.onerror=null; this.gpuFail++;
   if(this.gpuFail>=2) setVoiceState(VOICE_STATE.server,"browser","Browser voice (local TTS unavailable)");
   this._browser(text,done);
  }
 }
};
if(audio&&typeof audio.addEventListener==="function"){
 audio.addEventListener("loadedmetadata",()=>{ AudioMan.durTime=Number.isFinite(audio.duration)?audio.duration:0; AudioMan._emit(); });
 audio.addEventListener("timeupdate",()=>{ AudioMan.curTime=Number.isFinite(audio.currentTime)?audio.currentTime:0; AudioMan.durTime=Number.isFinite(audio.duration)?audio.duration:AudioMan.durTime; AudioMan._emit(); });
}
function speak(text){ AudioMan.say(text) }
function stopAudio(){ AudioMan.stop() }
function setVoiceState(server,engine,label){ VOICE_STATE.server=server; VOICE_STATE.engine=engine; VOICE_STATE.label=label; document.querySelectorAll("[data-voice-status]").forEach(el=>{el.textContent=label}); }
/* Only probe the local server when served from localhost; GitHub Pages / file:// go straight to saved clips + browser voice. */
function probeVoiceServer(){
 const local=typeof location!=="undefined"&&/^(127\.0\.0\.1|localhost)$/.test(location.hostname)&&location.protocol.startsWith("http");
 if(!local||typeof fetch!=="function"){ setVoiceState(null,"browser","Saved lesson voice + browser voice"); return Promise.resolve(VOICE_STATE); }
 return fetch("/api/health").then(r=>r.json()).then(d=>{
  const eng=String(d.engine||""), ready=d.ok&&d.ready!==false&&!eng.includes("missing");
  if(ready&&d.gpu&&d.gpu.cuda) setVoiceState(true,"gpu","Kokoro on GPU ("+d.gpu.device+")");
  else if(ready&&eng.includes("onnx")) setVoiceState(true,"onnx","Kokoro ONNX on CPU");
  else if(ready) setVoiceState(true,"local","Local voice ("+eng+")");
  else setVoiceState(null,"browser","Browser voice (local TTS unavailable)");
  return VOICE_STATE;
 }).catch(()=>{ setVoiceState(null,"browser","Browser voice (server offline)"); return VOICE_STATE; });
}
function playWelcome(){ AudioMan.clip("audio/welcome.wav","Welcome to SIE Mastery. Built for deep focus, clear rules, and real exam readiness.") }
function testVoice(){ AudioMan.say("S I P C covers each separate capacity, not each person. Five hundred thousand dollars, including a two hundred fifty thousand dollar cash limit.",true) }
