/* audio.js - AudioMan: one voice at a time.
   Fallback chain (kept on purpose):
     1. saved clip  (pre-composed Kokoro WAV/MP3 shipped with the site - works on GitHub Pages too)
     2. /api/tts    (local server: Kokoro on the GPU, or the small ONNX model on the CPU; disk-cached)
     3. browser     (speechSynthesis) when no local server is reachable or it fails twice.
   Generation counter + AbortController guarantee a stale request can never hijack newer audio. */
let audio=new Audio();
const VOICE_STATE={server:null,engine:"checking",label:"Checking voice engine..."};
const AudioMan={q:[],busy:false,gpuFail:0,gen:0,_ac:null,playing:false,listeners:[],
 _emit(){ this.listeners.forEach(fn=>{try{fn(this.playing)}catch(e){}}); },
 _setPlaying(on){ if(this.playing!==on){ this.playing=on; this._emit(); } },
 stop(){ this.gen++; this.q=[]; if(this._ac){try{this._ac.abort()}catch(e){} this._ac=null} audio.onended=null; audio.onerror=null; try{audio.pause()}catch(e){} try{speechSynthesis.cancel()}catch(e){} this.busy=false; this._setPlaying(false); },
 /* Play a saved clip; if the file is missing or blocked, speak the fallback text instead. */
 clip(path,fallbackText){ this.stop(); const myGen=this.gen;
  audio.onended=()=>{ if(myGen===this.gen) this._setPlaying(false) };
  audio.onerror=()=>{ if(myGen!==this.gen) return; audio.onerror=null; this._setPlaying(false); if(fallbackText) this.say(fallbackText,true); };
  audio.src=path; audio.playbackRate=getVoiceRate(); this._setPlaying(true);
  const p=audio.play(); if(p&&p.catch) p.catch(()=>{ if(myGen===this.gen) this._setPlaying(false) });
 },
 /* Speak dynamic text (questions, feedback). force=true ignores the Read-aloud preference (explicit Listen click). */
 say(text,force){ if(!force&&!prefs.voiceOn) return; const t=plainText(text); if(!t) return; this.q.push(t); this._pump(); },
 _browser(text,done){ try{ const u=new SpeechSynthesisUtterance(text); u.rate=getVoiceRate(); u.onend=done; u.onerror=done; speechSynthesis.speak(u) }catch(e){ done() } },
 async _pump(){ if(this.busy||!this.q.length) return; this.busy=true; this._setPlaying(true); const myGen=this.gen, text=this.q.shift();
  const done=()=>{ if(myGen!==this.gen) return; this.busy=false; if(this.q.length) this._pump(); else this._setPlaying(false) };
  if(!VOICE_STATE.server||this.gpuFail>=2){ this._browser(text,done); return }
  const ac=typeof AbortController!=="undefined"?new AbortController():null; this._ac=ac;
  try{ const opts={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:redactSSN(text).slice(0,1200),voice:prefs.voice})};
   if(ac) opts.signal=ac.signal;
   const r=await fetch("/api/tts",opts);
   if(myGen!==this.gen) return;
   if(!r.ok) throw 0; const d=await r.json();
   if(myGen!==this.gen) return;
   if(this._ac===ac) this._ac=null;
   this.gpuFail=0;
   audio.src=d.url; audio.playbackRate=getVoiceRate(); audio.onended=done; audio.onerror=done; await audio.play();
  }catch(e){ if(this._ac===ac) this._ac=null; if(myGen!==this.gen) return; audio.onended=null; audio.onerror=null; this.gpuFail++;
   if(this.gpuFail>=2) setVoiceState(VOICE_STATE.server,"browser","Browser voice (local TTS unavailable)");
   this._browser(text,done); }
 }
};
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
function playWelcome(){ AudioMan.clip("audio/welcome.wav","Welcome to SIE Mastery.") }
function testVoice(){ AudioMan.say("S I P C covers each separate capacity, not each person. Five hundred thousand dollars, including a two hundred fifty thousand dollar cash limit.",true) }
