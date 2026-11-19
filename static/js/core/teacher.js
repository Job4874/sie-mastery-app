/* teacher.js - the ML teacher: Bayesian Knowledge Tracing per unit, Elo-style ability,
   speed/accuracy diagnosis, adaptive question selection, and the gap-closing loop. */
const UNIT_IDS=[1,2,3,4,5,6,7,8];
function unitInfo(u){ return (SIE.units&&SIE.units[u])||{id:u,title:"Unit "+u,lessons:[]}; }
function unitTitle(u){ return unitInfo(u).title; }
function unitStats(u){ if(!isPlainObj(store.t.units[u])||!Number.isFinite(store.t.units[u].a)||!Number.isFinite(store.t.units[u].bkt)) store.t.units[u]={a:0,c:0,time:0,bkt:0.15,fastWrong:0,slowRight:0}; return store.t.units[u] }
function recordPerf(q,right,ms){
 const s=unitStats(q.unit); s.a++; s.time+=ms; if(right)s.c++;
 if(!right&&ms<8000)s.fastWrong++; if(right&&ms>25000)s.slowRight++;
 const slip=0.10,guess=0.25; let post;
 if(right) post=s.bkt*(1-slip)/(s.bkt*(1-slip)+(1-s.bkt)*guess);
 else post=s.bkt*slip/(s.bkt*slip+(1-s.bkt)*(1-guess));
 s.bkt=Math.min(0.98, post+(1-post)*0.12); s.last=Date.now();
 const rating=650+q.diff*200, exp=1/(1+Math.pow(10,(rating-store.t.theta)/400));
 store.t.theta=Math.max(600,Math.min(1600, Math.round(store.t.theta+24*((right?1:0)-exp))));
 (window._qt=window._qt||[]).push(ms);
 const today=new Date().toDateString(); if(!store.day||store.day.d!==today) store.day={d:today,n:0}; store.day.n++; save();
}
function diagnose(u){
 const s=unitStats(u); if(s.a<3) return "Not enough data yet. Take this unit's quiz.";
 const acc=s.c/s.a, avg=s.time/s.a/1000;
 if(s.bkt>=0.80&&acc>=0.80) return "Solid. You own this; maintenance reps only.";
 if(acc<0.55&&avg>18) return "True gap: the concept itself isn't owned yet. Redo the lessons, then quiz again.";
 if(acc<0.70&&avg<9) return "Fast and trap-prone: you answer before the trap shows. Add five seconds per question.";
 if(acc>=0.75&&avg>25) return "You know it but you're slow. Timed reps here will bank time on exam day.";
 return "Building. Close. Focused reps on this unit.";
}
function prescribe(u){ const d=diagnose(u);
 if(d.startsWith("True gap")) return ["Redo the lessons","#/learn/unit/"+u];
 if(d.startsWith("Not enough")) return ["Take the unit quiz","#/practice/unit/"+u];
 return ["Unit quiz","#/practice/unit/"+u]; }
function weakestUnit(){ return UNIT_IDS.slice().sort((a,b)=>unitStats(a).bkt-unitStats(b).bkt)[0]; }
function adaptiveSet(n,trapFirst){
 const L=LEVELS[curLevel()]||LEVELS.hard; const idxs=GEN.map((_,i)=>i);
 const w=i=>{ const q0=GEN[i](); const u=UNIT_BY_TOPIC[q0.topic]||7, d=DIFF_BY_TOPIC[q0.topic]||2;
   let weight=(1-unitStats(u).bkt)*3+0.3;
   if(L.trapOnly&&d<3) weight*=0.05; else if(d>L.maxDiff) weight*=0.15;
   if(store.t.openGaps&&store.t.openGaps[q0.topic]) weight*=2.5; if(trapFirst&&(i===0||i===1||i===2)) weight*=2; return weight };
 const chosen=[]; const pool=[...idxs];
 while(chosen.length<n&&pool.length){ const ws=pool.map(w); const tot=ws.reduce((a,b)=>a+b,0); let r=Math.random()*tot,k=0;
   while(k<ws.length-1&&r>ws[k]){r-=ws[k];k++} chosen.push(pool.splice(k,1)[0]); }
 const arr=chosen.map(i=>prepare(GEN[i]()));
 const lv=curLevel();
 if(lv==="veryhard"||lv==="master"){ const want=lv==="master"?Math.ceil(arr.length/2):Math.min(2,arr.length);
   const weak=[...new Set(arr.map(q=>q.unit))].sort((a,b)=>unitStats(a).bkt-unitStats(b).bkt);
   let shorts=shuffle(SHORT.filter(s=>weak.includes(s.unit)).concat(SHORT.filter(s=>!weak.includes(s.unit))));
   for(let k=0;k<want&&k<shorts.length;k++) arr[arr.length-1-k]=prepareShort(shorts[k]); }
 return shuffle(arr);
}
function registerGap(q,correct){
 if(mode==="zero"||mode==="placement") return;
 if(!correct){ store.t.topicMiss[q.topic]=(store.t.topicMiss[q.topic]||0)+1;
   if(unitStats(q.unit).bkt<0.55||store.t.topicMiss[q.topic]>=2){ store.t.openGaps[q.topic]={unit:q.unit,topic:q.topic}; save(); } }
}
function trackMissStreak(right){ if(mode==="zero"||mode==="placement") return; if(!right){ if(window._ms&&window._ms.u===current.unit)window._ms.c++; else window._ms={u:current.unit,c:1} } else window._ms=null }
function awardBadges(){ window._newBadges=[]; const pct=quiz.length?score/quiz.length*100:0;
 const avg=(window._qt&&window._qt.length)?window._qt.reduce((a,b)=>a+b,0)/window._qt.length/1000:999;
 const add=b=>{ if(!store.t.badges.includes(b)){store.t.badges.push(b);window._newBadges.push(b)} };
 if(pct===100)add("Perfect Run"); if(pct>=80&&avg<9)add("Speed Demon");
 if(pct>=80&&curLevel()==="master")add("Trap Slayer"); if(pct>=80&&mode==="unit")add("Unit Cleared");
 window._qt=[]; save(); }
function coachLine(pct){
 const unitsInQuiz=[...new Set(quiz.map(q=>q.unit))].filter(u=>UNIT_IDS.includes(u));
 const weakest=unitsInQuiz.sort((a,b)=>unitStats(a).bkt-unitStats(b).bkt)[0];
 let line = pct>=90 ? "That's mastery-level work." :
   pct>=70 ? "Passing standard. Now we hunt the leak, not the average." :
   pct>=50 ? "Half-built. Your Progress page shows exactly which concept is leaking." :
   "Every miss just told the teacher where to aim. That's data, not failure.";
 if(weakest) line += " Weakest unit in this set: "+unitTitle(weakest)+". "+diagnose(weakest);
 return line;
}
function readiness(){
 const totA=UNIT_IDS.reduce((a,u)=>a+unitStats(u).a,0), totC=UNIT_IDS.reduce((a,u)=>a+unitStats(u).c,0);
 const bktAvg=UNIT_IDS.reduce((a,u)=>a+unitStats(u).bkt,0)/8, coverage=Object.keys(store.t.done||{}).length/8;
 return {totA,totC,ready:totA?Math.max(0,Math.min(100,Math.round((bktAvg*0.5+(totC/totA)*0.25+coverage*0.25)*100))):0};
}
