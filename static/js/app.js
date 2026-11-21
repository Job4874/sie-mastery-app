/* app.js - boot, click/change delegation (zero inline handlers -> strict script-src 'self' CSP),
   local JSON backup, and keyboard shortcuts. Loaded last. */
let toastTimer=null;
function showToast(msg){ const t=$("toast"); if(!t) return; t.textContent=msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),3200); }
function resetProgress(){ if(!window.confirm("Reset all lessons, scores, FSRS memory history, and saved questions? This cannot be undone.")) return;
 try{ localStorage.removeItem("sie"); }catch(e){} store=loadStore(); LP.picked={}; showToast("Progress reset."); Router.go("#/learn",true); }
function downloadProgressJson(){
 try{
  const blob=new Blob([exportProgressJson()],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download="sie-mastery-progress.json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>{ try{URL.revokeObjectURL(url)}catch(e){} },1000);
  showToast("Progress exported to sie-mastery-progress.json.");
 }catch(e){ showToast("Export unavailable in this browser."); }
}

const ACTIONS={
 "toggle-theme":()=>toggleTheme(),
 "toggle-adhd":()=>{ const next=!isAdhd(); applyAdhd(next); try{localStorage.setItem(ADHD_KEY,next?"1":"0")}catch(e){} showToast(next?"Focus mode on: one thing at a time, no motion.":"Focus mode off."); },
 "start-placement":()=>startPlacement(),
 "skip-placement":()=>{ store.t.placed=true; save(); Router.go("#/learn",true); },
 "unit-quiz":el=>startUnitQuiz(Number(el.getAttribute("data-u"))),
 "weak-unit":()=>Router.go("#/learn/unit/"+weakestUnit()),
 "final-review":()=>startFinalReview(),
 "sprint5":()=>startQuiz("sprint",5),
 "sprint":()=>startQuiz("sprint",10),
 "due":()=>startDueReview(8),
 "contrast":el=>startContrastDrill(el.getAttribute("data-pair")||""),
 "trap":()=>startQuiz("trap",10),
 "missed":()=>startQuiz("missed",10),
 "exam":()=>startQuiz("exam",75),
 "set-level":el=>{ prefs.level=el.getAttribute("data-level"); savePrefs(); LP.screens=null; LP.picked={}; Router.render(); },
 "lesson-check":el=>lessonCheck(Number(el.getAttribute("data-i"))),
 "lesson-prev":()=>lessonGo(-1),
 "lesson-next":()=>lessonGo(1),
 "listen":()=>{ if(AudioMan.playing){ stopAudio(); } else playScreenAudio(); },
 "audio-pause":()=>{ AudioMan.togglePause(); },
 "unit-overview-audio":el=>{ const u=Number(el.getAttribute("data-u")), ov=UNIT_OVERVIEWS[u-1]; if(ov) AudioMan.clip(ov.audio,ov.lesson); },
 "library-audio":el=>{ const l=LESSONS[Number(el.getAttribute("data-i"))]; if(l) AudioMan.clip(l.a,l.b); },
 "quit":()=>quitQuiz(),
 "next":()=>nextQ(),
 "hear-question":()=>{ if(current) AudioMan.say(questionSpeechText(current),true); },
 "answer":(el,ev)=>answer(Number(el.getAttribute("data-i")),el,ev),
 "submit-short":()=>answerShort(),
 "replay":()=>replaySession(),
 "gap-drill":()=>beginGapDrill(window._gapTopic),
 "speak-report":()=>speakReport(),
 "test-voice":()=>testVoice(),
 "verify-voice":()=>{ const v=prefs.voice||"af_heart", nm=VOICES[v]||v; AudioMan.say("Voice allocation check. You selected "+nm+". Federal Reserve Reg T sets fifty percent initial margin, while FINRA Rule 4210 sets twenty five percent maintenance margin.",true); },
 "welcome":()=>playWelcome(),
 "self-check":()=>runSelfCheck(),
 "export-progress":()=>downloadProgressJson(),
 "import-progress":()=>{ const inp=$("importFile"); if(inp) inp.click(); },
 "reset-progress":()=>resetProgress()
};
const CHANGE_ACTIONS={
 "set-level-select":el=>{ if(LEVELS[el.value]){ prefs.level=el.value; savePrefs(); LP.screens=null; LP.picked={}; Router.render(); } },
 "set-voice":el=>{ prefs.voice=el.value; savePrefs(); syncAudioBar(); showToast("Voice set to "+(VOICES[el.value]||el.value)+"."); },
 "set-rate":el=>{ prefs.rate=parseFloat(el.value)||1; savePrefs(); try{audio.playbackRate=getVoiceRate()}catch(e){} syncAudioBar(); },
 "set-voice-on":el=>{ prefs.voiceOn=el.checked; savePrefs(); if(!el.checked) stopAudio(); },
 "set-autoplay":el=>{ prefs.autoplay=el.checked; savePrefs(); },
 "set-qual-highlight":el=>{ prefs.qualHighlight=el.checked; savePrefs(); showToast(el.checked?"NOT / EXCEPT qualifier highlighting on.":"Qualifier highlighting off."); },
 "set-impulse-brake":el=>{ prefs.impulseBrake=el.checked; savePrefs(); showToast(el.checked?"3-second Impulse Brake enabled after fast misses.":"Impulse Brake disabled."); },
 "import-progress-file":el=>{
  const f=el.files&&el.files[0]; if(!f) return;
  const rd=new FileReader();
  rd.onload=()=>{
   const ok=importProgressJson(rd.result);
   showToast(ok?"Progress imported successfully.":"Could not import: invalid JSON progress file.");
   el.value="";
   if(ok) Router.render();
  };
  rd.readAsText(f);
 }
};
document.addEventListener("click",ev=>{
 const el=ev.target&&ev.target.closest?ev.target.closest("[data-action]"):null;
 if(!el||el.disabled) return;
 const fn=ACTIONS[el.getAttribute("data-action")];
 if(fn&&el.tagName!=="SELECT"&&el.tagName!=="INPUT"){ ev.preventDefault(); fn(el,ev); }
});
document.addEventListener("change",ev=>{
 const el=ev.target; const fn=el&&CHANGE_ACTIONS[el.getAttribute&&el.getAttribute("data-action")];
 if(fn) fn(el);
});
document.addEventListener("keydown",e=>{
 const el=e.target; const tag=el&&el.tagName?el.tagName.toLowerCase():"";
 if(tag==="input"||tag==="textarea"||tag==="select"||(el&&el.isContentEditable)) return;
 if(e.metaKey||e.ctrlKey||e.altKey) return;
 if(e.key==="t"||e.key==="T"){ e.preventDefault(); toggleTheme(); return }
 if(e.key==="f"||e.key==="F"){ e.preventDefault(); ACTIONS["toggle-adhd"](); return }
 const idx={"1":0,"2":1,"3":2,"4":3,"a":0,"A":0,"b":1,"B":1,"c":2,"C":2,"d":3,"D":3}[e.key];
 const route=Router.current&&Router.current.route.pattern;
 if(e.key==="l"||e.key==="L"){
  if(route&&route.startsWith("/learn/unit/:u/lesson")&&!LP.done){ e.preventDefault(); ACTIONS.listen(); return }
  if(route==="/quiz"&&session&&!session.finished&&current){ e.preventDefault(); if(AudioMan.playing) stopAudio(); else ACTIONS["hear-question"](); return }
 }
 if(route==="/quiz"&&session&&!session.finished){
  if(!answered&&current&&current.type!=="short"&&idx!==undefined){ const bs=document.querySelectorAll("#opts .opt"); if(bs[idx]){ e.preventDefault(); answer(idx,bs[idx],null); } }
  else if(answered&&(e.key==="Enter"||e.key==="ArrowRight")){ const nb=$("nextBtn"); if(nb&&!nb.classList.contains("hidden")){ e.preventDefault(); nextQ(); } }
  return;
 }
 if(route&&route.startsWith("/learn/unit/:u/lesson")&&!LP.done){
  if(idx!==undefined){ const bs=document.querySelectorAll("[data-action='lesson-check']:not([disabled])"); if(bs[idx]){ e.preventDefault(); lessonCheck(idx); } return }
  if(e.key==="ArrowLeft"){ e.preventDefault(); lessonGo(-1); return }
  if(e.key==="ArrowRight"){ const nb=document.querySelector("[data-action='lesson-next']"); if(nb&&!nb.disabled){ e.preventDefault(); lessonGo(1); } }
 }
});
AudioMan.listeners.push(()=>{ syncListenButtons(); syncAudioBar(); });
initTheme(); initAdhd(); probeVoiceServer(); Router.render();
