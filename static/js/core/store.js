/* store.js - on-device progress + settings (localStorage), self-healing against corrupt data.
   Stores BKT unit mastery, Elo theta, per-topic FSRS-DSR memory states, and ADHD error patterns. */
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
function cleanSessions(raw){
 if(!Array.isArray(raw)) return [];
 return raw.filter(x=>isPlainObj(x)&&typeof x.id==="string"&&x.id&&typeof x.title==="string"&&Number.isFinite(x.total)&&x.total>0&&Number.isFinite(x.score)&&x.score>=0).slice(-60).map(x=>({
  id:String(x.id).slice(0,48),
  mode:typeof x.mode==="string"?x.mode:"quiz",
  title:String(x.title).slice(0,120),
  score:Math.max(0,Math.min(x.total,Number(x.score))),
  total:Math.max(1,Math.round(Number(x.total))),
  pct:Number.isFinite(x.pct)?Math.max(0,Math.min(100,Math.round(x.pct))):Math.round(x.score/x.total*100),
  at:Number.isFinite(x.at)&&x.at>0?x.at:0,
  unit:Number.isInteger(x.unit)&&x.unit>=0&&x.unit<=8?x.unit:0,
  level:typeof x.level==="string"?x.level:"hard"
 }));
}
function cleanFsrsMap(raw){
 const out={}; if(!isPlainObj(raw)) return out;
 Object.keys(raw).forEach(k=>{
  const f=raw[k]; if(!isPlainObj(f)||!k) return;
  const d=Number.isFinite(f.d)?Math.max(1,Math.min(10,f.d)):5;
  const s=Number.isFinite(f.s)?Math.max(0.1,Math.min(3650,f.s)):0.5;
  const reps=Number.isInteger(f.reps)&&f.reps>=0?f.reps:0;
  const lapses=Number.isInteger(f.lapses)&&f.lapses>=0?f.lapses:0;
  const last=Number.isFinite(f.last)&&f.last>0?f.last:0;
  const due=Number.isFinite(f.due)&&f.due>0?f.due:0;
  out[k]={d,s,reps,lapses,last,due};
 });
 return out;
}
function cleanPatterns(raw){
 const p=isPlainObj(raw)?raw:{};
 const num=v=>Number.isInteger(v)&&v>=0?v:0;
 const pairs={};
 if(isPlainObj(p.pairs)) Object.keys(p.pairs).forEach(k=>{ if(Number.isInteger(p.pairs[k])&&p.pairs[k]>0) pairs[k]=p.pairs[k]; });
 const recent=Array.isArray(p.recent)?p.recent.filter(x=>isPlainObj(x)&&typeof x.topic==="string"&&typeof x.right==="boolean"&&Number.isFinite(x.ms)).slice(-40):[];
 const rc=isPlainObj(p.cal)?p.cal:{};
 return {
  impulsiveMiss:num(p.impulsiveMiss),
  qualifierTrap:num(p.qualifierTrap),
  postErrorCascade:num(p.postErrorCascade),
  conceptGap:num(p.conceptGap),
  speedBottleneck:num(p.speedBottleneck),
  totalMiss:num(p.totalMiss),
  lastWrongAt:Number.isFinite(p.lastWrongAt)?p.lastWrongAt:0,
  pairs,
  recent,
  cal:{
   sureRight:num(rc.sureRight),
   sureWrong:num(rc.sureWrong),
   guessRight:num(rc.guessRight),
   guessWrong:num(rc.guessWrong)
  }
 };
}
function sanitizeStoreObject(s){
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
  sessions:cleanSessions(s.sessions),
  last:isPlainObj(s.last)&&Number.isInteger(s.last.u)&&Number.isInteger(s.last.l)?{u:s.last.u,l:s.last.l}:undefined,
  t:{
   units:isPlainObj(rt.units)?rt.units:{},
   theta:Number.isFinite(rt.theta)?rt.theta:1000,
   badges:Array.isArray(rt.badges)?rt.badges.filter(b=>typeof b==="string"):[],
   done:isPlainObj(rt.done)?rt.done:{},
   placed:typeof rt.placed==="boolean"?rt.placed:undefined,
   openGaps:isPlainObj(rt.openGaps)?rt.openGaps:{},
   topicMiss:isPlainObj(rt.topicMiss)?rt.topicMiss:{},
   gapsClosed:Number.isFinite(rt.gapsClosed)?rt.gapsClosed:0,
   fsrs:cleanFsrsMap(rt.fsrs),
   patterns:cleanPatterns(rt.patterns)
  }
 };
 if(st.zero===undefined&&Object.values(st.t.units).some(u=>u&&u.a>0)) st.zero={done:true,at:Date.now()};
 if(st.t.placed===undefined) st.t.placed=Object.values(st.t.units).some(u=>u&&u.a>0);
 return st;
}
function loadStore(){
 let s=null; try{ s=JSON.parse(localStorage.getItem("sie")||"{}"); }catch(e){ s=null; }
 return sanitizeStoreObject(s);
}
let store=loadStore();
const SIE_HOOKS={afterSave:[]};
function save(){ try{localStorage.setItem("sie",JSON.stringify(store))}catch(e){} SIE_HOOKS.afterSave.forEach(fn=>{try{fn()}catch(e){}}); }
function exportProgressJson(){ return JSON.stringify({schema:"sie-mastery-v6",exportedAt:new Date().toISOString(),store,prefs},null,2); }
function importProgressJson(raw){
 try{
  const parsed=JSON.parse(String(raw||""));
  const candidate=isPlainObj(parsed)&&isPlainObj(parsed.store)?parsed.store:parsed;
  if(!isPlainObj(candidate)) return false;
  store=sanitizeStoreObject(candidate);
  save();
  return true;
 }catch(e){ return false; }
}

/* ---------- granular & full reset helpers (strictly localStorage) ---------- */
function resetLessonProgress(u,l){
 u=Number(u); l=Number(l);
 const key=u+"-"+l;
 const existed=Boolean(store.lp[key]);
 delete store.lp[key];
 if(u===0) store.zero=undefined;
 if(store.last&&store.last.u===u&&store.last.l===l) store.last=undefined;
 if(typeof LP!=="undefined"&&LP.u===u&&LP.l===l){ LP.picked={}; LP.s=1; LP.done=false; }
 save();
 return existed;
}
function resetUnitProgress(u){
 u=Number(u);
 const un=typeof SIE!=="undefined"&&SIE.units?SIE.units[u]:null;
 const nLessons=un&&Array.isArray(un.lessons)?un.lessons.length:6;
 for(let l=1;l<=nLessons;l++) delete store.lp[u+"-"+l];
 if(u===0) store.zero=undefined;
 if(store.last&&store.last.u===u) store.last=undefined;
 if(store.t&&store.t.units) delete store.t.units[u];
 if(store.t&&store.t.done) delete store.t.done[u];
 const map=(typeof UNIT_BY_TOPIC!=="undefined")?UNIT_BY_TOPIC:{};
 const isUnitTopic=tp=>map[tp]===u;
 if(store.t&&store.t.fsrs) Object.keys(store.t.fsrs).forEach(tp=>{ if(isUnitTopic(tp)) delete store.t.fsrs[tp]; });
 if(store.t&&store.t.openGaps) Object.keys(store.t.openGaps).forEach(tp=>{ if(isUnitTopic(tp)||(store.t.openGaps[tp]&&store.t.openGaps[tp].unit===u)) delete store.t.openGaps[tp]; });
 if(store.t&&store.t.topicMiss) Object.keys(store.t.topicMiss).forEach(tp=>{ if(isUnitTopic(tp)) delete store.t.topicMiss[tp]; });
 if(store.missed) Object.keys(store.missed).forEach(k=>{ const m=store.missed[k]; if(m&&(m.unit===u||isUnitTopic(m.topic))) delete store.missed[k]; });
 if(Array.isArray(store.sessions)) store.sessions=store.sessions.filter(s=>s.unit!==u);
 if(store.t&&store.t.patterns&&Array.isArray(store.t.patterns.recent)) store.t.patterns.recent=store.t.patterns.recent.filter(r=>r.unit!==u);
 if(typeof LP!=="undefined"&&LP.u===u){ LP.picked={}; LP.s=1; LP.done=false; }
 save();
 return true;
}
function resetSessionById(id){
 if(!id||!Array.isArray(store.sessions)) return false;
 const before=store.sessions.length;
 store.sessions=store.sessions.filter(s=>s.id!==id);
 save();
 return store.sessions.length<before;
}
function resetSessionsHistory(){
 store.sessions=[];
 store.missed={};
 store.sec={};
 store.day=undefined;
 store.streak=0;
 store.seen=0;
 store.t={units:{},theta:1000,badges:[],done:{},placed:false,openGaps:{},topicMiss:{},gapsClosed:0,fsrs:{},patterns:cleanPatterns({})};
 save();
 return true;
}
function resetLessonsHistory(){
 store.lp={};
 store.zero=undefined;
 store.last=undefined;
 if(typeof LP!=="undefined"){ LP.picked={}; LP.screens=null; LP.s=1; LP.done=false; }
 save();
 return true;
}
function resetAllData(includePrefs){
 try{ localStorage.removeItem("sie"); }catch(e){}
 if(includePrefs){
  [THEME_KEY,ADHD_KEY,VRATE_KEY,PREFS_KEY].forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} });
  prefs=loadPrefs();
  applyTheme("light");
  applyAdhd(false);
 }
 store=loadStore();
 if(typeof LP!=="undefined"){ LP.picked={}; LP.screens=null; LP.s=1; LP.done=false; }
 if(typeof haltSession==="function") haltSession();
 if(typeof session!=="undefined") session=null;
 if(typeof quiz!=="undefined") quiz=[];
 return true;
}

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
  qualHighlight:p.qualHighlight!==false,
  impulseBrake:p.impulseBrake===true,
  rate:["0.9","1","1.15","1.3"].includes(rate)?parseFloat(rate):1
 };
}
let prefs=loadPrefs();
function savePrefs(){ try{ localStorage.setItem(PREFS_KEY,JSON.stringify({level:prefs.level,voice:prefs.voice,voiceOn:prefs.voiceOn,autoplay:prefs.autoplay,qualHighlight:prefs.qualHighlight,impulseBrake:prefs.impulseBrake})); localStorage.setItem(VRATE_KEY,String(prefs.rate)); }catch(e){} }
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
