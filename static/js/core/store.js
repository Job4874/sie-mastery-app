/* store.js - on-device progress + settings (localStorage), self-healing against corrupt data. */
function cleanMissedMap(raw){
 const out={}; if(!isPlainObj(raw)) return out;
 Object.keys(raw).forEach(k=>{ const m=raw[k]; if(!isPlainObj(m)) return;
  if(m.type==="short"){ if(Array.isArray(m.groups)&&typeof m.text==="string"&&typeof m.model==="string"&&typeof m.topic==="string"&&m.topic&&Number.isInteger(m.unit)&&m.unit>=1&&m.unit<=8&&typeof m.rule==="string") out[k]=m; }
  else if(typeof m.text==="string"&&typeof m.topic==="string"&&m.topic&&Number.isInteger(m.sec)&&[1,2,3,4].includes(m.sec)&&Array.isArray(m.choices)&&m.choices.length>=2&&m.choices.every(c=>typeof c==="string")&&Number.isInteger(m.answer)&&m.answer>=0&&m.answer<m.choices.length){ out[k]=m; }
 });
 return out;
}
function cleanLessonProgress(raw){
 const out={}; if(!isPlainObj(raw)) return out;
 Object.keys(raw).forEach(k=>{ if(/^\d-\d$/.test(k)&&isPlainObj(raw[k])&&raw[k].done===true) out[k]={done:true,at:Number.isFinite(raw[k].at)?raw[k].at:0}; });
 return out;
}
function loadStore(){
 let s=null; try{ s=JSON.parse(localStorage.getItem("sie")||"{}"); }catch(e){ s=null; }
 if(!isPlainObj(s)) s={};
 const rt=isPlainObj(s.t)?s.t:{};
 const st={
  xp:Number.isFinite(s.xp)?s.xp:0,
  streak:Number.isFinite(s.streak)?s.streak:0,
  seen:Number.isFinite(s.seen)?s.seen:0,
  sec:isPlainObj(s.sec)?s.sec:{},
  missed:cleanMissedMap(s.missed),
  day:isPlainObj(s.day)&&typeof s.day.d==="string"&&Number.isFinite(s.day.n)?s.day:undefined,
  zero:isPlainObj(s.zero)?s.zero:undefined,
  lp:cleanLessonProgress(s.lp),
  last:isPlainObj(s.last)&&Number.isInteger(s.last.u)&&Number.isInteger(s.last.l)?{u:s.last.u,l:s.last.l}:undefined,
  t:{
   units:isPlainObj(rt.units)?rt.units:{},
   theta:Number.isFinite(rt.theta)?rt.theta:1000,
   badges:Array.isArray(rt.badges)?rt.badges.filter(b=>typeof b==="string"):[],
   done:isPlainObj(rt.done)?rt.done:{},
   placed:typeof rt.placed==="boolean"?rt.placed:undefined,
   openGaps:isPlainObj(rt.openGaps)?rt.openGaps:{},
   topicMiss:isPlainObj(rt.topicMiss)?rt.topicMiss:{},
   gapsClosed:Number.isFinite(rt.gapsClosed)?rt.gapsClosed:0
  }
 };
 if(st.zero===undefined&&Object.values(st.t.units).some(u=>u&&u.a>0)) st.zero={done:true,at:Date.now()};
 if(st.t.placed===undefined) st.t.placed=Object.values(st.t.units).some(u=>u&&u.a>0);
 return st;
}
let store=loadStore();
const SIE_HOOKS={afterSave:[]};
function save(){ try{localStorage.setItem("sie",JSON.stringify(store))}catch(e){} SIE_HOOKS.afterSave.forEach(fn=>{try{fn()}catch(e){}}); }

/* ---------- settings (separate keys so a corrupt progress blob never resets preferences) ---------- */
const THEME_KEY="tibin_sie_theme", ADHD_KEY="tibin_sie_adhd", VRATE_KEY="tibin_sie_vrate", PREFS_KEY="tibin_sie_prefs";
const VOICES={af_heart:"Heart (US, female)",af_bella:"Bella (US, female)",am_michael:"Michael (US, male)",bf_emma:"Emma (UK, female)"};
function loadPrefs(){
 let p={}; try{ p=JSON.parse(localStorage.getItem(PREFS_KEY)||"{}"); }catch(e){ p={}; }
 if(!isPlainObj(p)) p={};
 let rate=null; try{ rate=localStorage.getItem(VRATE_KEY); }catch(e){}
 const rawLv=p.level==="master"?"extreme":p.level;
 return {
  level:["easy","standard","hard","veryhard","extreme"].includes(rawLv)?rawLv:"hard",
  voice:Object.prototype.hasOwnProperty.call(VOICES,p.voice)?p.voice:"af_heart",
  voiceOn:p.voiceOn!==false,
  autoplay:p.autoplay===true,
  rate:["1","1.15","1.3"].includes(rate)?parseFloat(rate):1
 };
}
let prefs=loadPrefs();
function savePrefs(){ try{ localStorage.setItem(PREFS_KEY,JSON.stringify({level:prefs.level,voice:prefs.voice,voiceOn:prefs.voiceOn,autoplay:prefs.autoplay})); localStorage.setItem(VRATE_KEY,String(prefs.rate)); }catch(e){} }
function curLevel(){ return prefs.level; }
function getVoiceRate(){ const v=prefs.rate; return Number.isFinite(v)&&v>=0.75&&v<=1.6?v:1; }

function applyTheme(t){ document.documentElement.setAttribute("data-theme",t); document.querySelectorAll("[data-action='toggle-theme']").forEach(b=>b.setAttribute("aria-pressed",t==="dark"?"true":"false")); }
function toggleTheme(){ const next=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"; applyTheme(next); try{localStorage.setItem(THEME_KEY,next)}catch(e){} }
function initTheme(){ let t=null; try{t=localStorage.getItem(THEME_KEY)}catch(e){} if(t!=="dark"&&t!=="light") t="light"; applyTheme(t); }
function isAdhd(){ return document.documentElement.getAttribute("data-adhd")==="focus"; }
function applyAdhd(on){
 document.documentElement.setAttribute("data-adhd",on?"focus":"off");
 document.querySelectorAll("[data-action='toggle-adhd']").forEach(b=>b.setAttribute("aria-pressed",on?"true":"false"));
}
function initAdhd(){ let v=null; try{v=localStorage.getItem(ADHD_KEY)}catch(e){} const pref=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches; applyAdhd(v==="1"||(v===null&&pref)); }
