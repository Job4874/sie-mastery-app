/* teacher.js - the recursive ADHD-aware ML teacher:
   1. Corbett-Anderson Bayesian Knowledge Tracing (BKT) per unit (exact reference math)
   2. Elo ability rating (theta 600..1600)
   3. Per-topic FSRS-DSR spaced-repetition memory model (Difficulty, Stability, Retrievability)
   4. Recursive ADHD error-pattern classifier (impulsive miss, negative-qualifier trap,
      post-error cascade, concept gap, speed bottleneck) + 12 FINRA Confusion Pairs
   5. Accelerated ADHD learning path generator & BKT x FSRS x Confusion-Pair adaptive selection */
const UNIT_IDS=[1,2,3,4,5,6,7,8];
const DAY_MS=86400000;
const QUALIFIER_RE=/\b(?:NOT|EXCEPT|LEAST|FALSE|NEVER|UNLESS|CANNOT|ONLY)\b/i;

/* 12 high-frequency FINRA SIE twin-concept confusion pairs for structured ADHD micro-interleaving */
const CONFUSION_PAIRS=[
 {id:"margin-pdt",label:"Reg T 50% vs. PDT $25k / Maintenance",a:"Reg T margin",b:"Pattern day trader",
  rule:"Fed Reg T = 50% initial margin ($2,000 basic min). FINRA Rule 4210 = 25% long maintenance & $25,000 classic PDT equity."},
 {id:"freeride-t1",label:"Freeriding vs. T+1 Settlement & GFV",a:"Freeriding",b:"Settlement T+1",
  rule:"Equities settle T+1. Selling before paying in cash = 1 Freeriding violation -> 90-day freeze (3 GFVs in 12 months = 90-day freeze)."},
 {id:"regbi-suit",label:"SEC Reg BI vs. FINRA Suitability",a:"Best interest (Reg BI)",b:"KYC & suitability",
  rule:"SEC Rule 15l-1 (Reg BI) governs retail recommendations (best interest + care/disclosure/conflict); FINRA Rule 2111 covers non-Reg BI suitability & KYC."},
 {id:"cmo-reinv",label:"CMO Prepayment vs. Reinvestment Risk",a:"CMO tranches",b:"Reinvestment risk",
  rule:"Falling rates trigger refinancing -> CMO support tranches contract AND coupon reinvestment risk rises; rising rates cause extension & price drops."},
 {id:"yield-call",label:"Bond Yield Ordering vs. Yield to Worst",a:"Yield ordering",b:"Callable bonds / yield to worst",
  rule:"Discount: Nominal < CY < YTM (YTM governs). Premium: YTC < YTM < CY < Nominal (YTC = yield to worst governs)."},
 {id:"etf-cef",label:"ETFs vs. Closed-End & Open-End Funds",a:"ETFs vs mutual funds",b:"Closed-end vs open-end funds",
  rule:"Open-end funds price once daily at forward NAV; ETFs and closed-end funds trade intraday (ETFs track NAV via creation/redemption; CEFs can trade at wide discounts/premiums)."},
 {id:"gifts-away",label:"Gifts ($300) vs. Selling Away",a:"Political contributions & gifts",b:"Selling away",
  rule:"FINRA Rule 3220 caps gifts at $300/person/yr (2026); Rule 3280 requires prior written firm notice & approval before private securities transactions."},
 {id:"ira-roth",label:"Roth vs. Traditional IRA & Earned Income",a:"Roth vs Traditional IRA taxation",b:"IRA earned income & Social Security",
  rule:"Contributions require earned income (never Social Security/dividends). Traditional = pre-tax/taxed out; Roth = after-tax/tax-free qualified out."},
 {id:"call-put",label:"Long Call vs. Long Put Breakeven",a:"Long call breakeven",b:"Long put breakeven",
  rule:"Call Up (Strike + Premium = BE). Put Down (Strike - Premium = BE). Buyer's max loss is always the premium paid."},
 {id:"primary-reg",label:"Primary Market vs. 1933 Prospectus Timelines",a:"Primary vs secondary",b:"Registration timelines",
  rule:"Primary = issuer gets proceeds (1933 Act). Cooling-off = 20 days; post-effective prospectus delivery = 25 (listed IPO) / 40 / 90 days."},
 {id:"comm-disc",label:"Rule 2210 Communications vs. Discretion",a:"Communications",b:"Discretionary accounts",
  rule:"Retail communication = >25 retail investors in 30 days (principal pre-approval). Discretion needs BOTH customer & firm written approval."},
 {id:"sipc-prohib",label:"SIPC Separate Capacity vs. Prohibited Acts",a:"SIPC separate capacity",b:"Prohibited activities",
  rule:"SIPC protects $500k per separate capacity ($250k cash) against BD failure — never market loss or rep misconduct like front running/churning."},
 {id:"secure2-529-rmd",label:"SECURE 2.0: 529-to-Roth vs. RMD Penalties",a:"529-to-Roth IRA rollover",b:"RMD excise penalty (SECURE 2.0)",
  rule:"529->Roth IRA: 15-yr account age, $35k lifetime cap, annual Roth limit. Missed RMD penalty dropped from 50% to 25% (10% if timely corrected); Roth 401(k) has no lifetime owner RMDs."}
];

function unitInfo(u){ return (SIE.units&&SIE.units[u])||{id:u,title:"Unit "+u,lessons:[]}; }
function unitTitle(u){ return unitInfo(u).title; }
function unitStats(u){ if(!isPlainObj(store.t.units[u])||!Number.isFinite(store.t.units[u].a)||!Number.isFinite(store.t.units[u].bkt)) store.t.units[u]={a:0,c:0,time:0,bkt:0.15,fastWrong:0,slowRight:0}; return store.t.units[u] }
function hasNegativeQualifier(text){ return QUALIFIER_RE.test(String(text||"")); }
function pairForTopic(topic){ return CONFUSION_PAIRS.find(p=>p.a===topic||p.b===topic)||null; }

/* ---------- FSRS-DSR spaced-repetition memory model ---------- */
function fsrsRetrievability(elapsedDays,stability){
 const s=Math.max(0.1,Number.isFinite(stability)?stability:0.5);
 const t=Math.max(0,Number.isFinite(elapsedDays)?elapsedDays:0);
 return Math.pow(1+t/(9*s),-1); /* exact FSRS identity: R(S, S) === 0.90 */
}
function fsrsNextInterval(stability,targetR){
 const r=Math.max(0.5,Math.min(0.98,targetR||0.90));
 const s=Math.max(0.1,stability||0.5);
 return Math.max(0.1,9*s*(1/r-1));
}
function fsrsState(topic){
 if(!isPlainObj(store.t.fsrs)) store.t.fsrs={};
 const cur=store.t.fsrs[topic];
 if(isPlainObj(cur)&&Number.isFinite(cur.d)&&Number.isFinite(cur.s)) return cur;
 return {d:5.0,s:0.5,reps:0,lapses:0,last:0,due:0};
}
function fsrsUpdate(topic,right,ms,now){
 if(!topic) return null;
 now=now||Date.now();
 const prev=fsrsState(topic);
 const elapsed=prev.last?Math.max(0,(now-prev.last)/DAY_MS):0;
 const R=prev.reps?fsrsRetrievability(elapsed,prev.s):0.5;
 /* Infer FSRS rating G in {1:Again, 2:Hard, 3:Good, 4:Easy} from correctness + response latency */
 const grade=!right?1:(ms>25000?2:(ms<6500?4:3));
 let d=prev.d-0.65*(grade-3);
 d=0.9*d+0.1*5.0; /* mean reversion toward neutral 5.0 */
 d=Math.max(1,Math.min(10,Math.round(d*100)/100));
 let s;
 if(grade===1){
  s=Math.max(0.15,Math.min(prev.s*0.35,prev.reps?prev.s*0.5:0.25));
 } else {
  const baseGain=Math.max(0.15,(11-d)*0.18)*Math.pow(Math.max(0.2,prev.s),-0.2)*(Math.exp(1.1*(1-R))+0.35);
  const gMult=grade===2?0.75:(grade===4?1.35:1.0);
  s=prev.reps===0?(grade===4?2.5:grade===3?1.2:0.6):Math.min(365,prev.s*(1+baseGain*gMult));
 }
 s=Math.round(s*100)/100;
 const intervalDays=grade===1?0:fsrsNextInterval(s,0.90);
 const next={
  d,s,reps:prev.reps+1,lapses:prev.lapses+(grade===1?1:0),
  last:now,due:now+Math.round(intervalDays*DAY_MS)
 };
 if(!isPlainObj(store.t.fsrs)) store.t.fsrs={};
 store.t.fsrs[topic]=next;
 return {state:next,R,grade,intervalDays};
}
function dueTopics(now){
 now=now||Date.now();
 const map=isPlainObj(store.t.fsrs)?store.t.fsrs:{};
 return Object.keys(map).map(topic=>{
  const f=map[topic];
  const elapsed=f.last?Math.max(0,(now-f.last)/DAY_MS):0;
  const R=fsrsRetrievability(elapsed,f.s);
  const justLapsed=Boolean(f.lapses>0&&f.due<=f.last);
  const isDue=(now>=f.due)||R<0.90;
  return {topic,unit:UNIT_BY_TOPIC[topic]||7,d:f.d,s:f.s,reps:f.reps,lapses:f.lapses,last:f.last,R,justLapsed,isDue,due:f.due};
 }).sort((a,b)=>(b.isDue?1:0)-(a.isDue?1:0)||(b.justLapsed?1:0)-(a.justLapsed?1:0)||(a.R-b.R)||(b.lapses-a.lapses));
}
function memorySummary(now){
 const items=dueTopics(now);
 if(!items.length) return {tracked:0,dueCount:0,avgR:100,avgS:0,topRisk:[]};
 const dueCount=items.filter(x=>x.isDue).length;
 const avgR=Math.round(items.reduce((a,x)=>a+x.R,0)/items.length*100);
 const avgS=Math.round(items.reduce((a,x)=>a+x.s,0)/items.length*10)/10;
 return {tracked:items.length,dueCount,avgR,avgS,topRisk:items.slice(0,5)};
}

/* ---------- Core BKT + Elo + FSRS + ADHD pattern & metacognitive calibration update ---------- */
function recordPerf(q,right,ms,conf){
 const s=unitStats(q.unit); s.a++; s.time+=ms; if(right)s.c++;
 if(!right&&ms<8000)s.fastWrong++; if(right&&ms>25000)s.slowRight++;
 const slip=0.10,guess=0.25; let post;
 if(right) post=s.bkt*(1-slip)/(s.bkt*(1-slip)+(1-s.bkt)*guess);
 else post=s.bkt*slip/(s.bkt*slip+(1-s.bkt)*(1-guess));
 s.bkt=Math.min(0.98, post+(1-post)*0.12); s.last=Date.now();
 const rating=650+q.diff*200, exp=1/(1+Math.pow(10,(rating-store.t.theta)/400));
 store.t.theta=Math.max(600,Math.min(1600, Math.round(store.t.theta+24*((right?1:0)-exp))));
 /* FSRS per-topic update */
 if(q.topic) fsrsUpdate(q.topic,right,ms,s.last);
 /* ADHD error-pattern & metacognitive calibration telemetry */
 if(!isPlainObj(store.t.patterns)) store.t.patterns=cleanPatterns({});
 const pat=store.t.patterns;
 if(!isPlainObj(pat.cal)) pat.cal={sureRight:0,sureWrong:0,guessRight:0,guessWrong:0};
 if(conf==="sure"){ if(right) pat.cal.sureRight++; else pat.cal.sureWrong++; }
 else if(conf==="guess"){ if(right) pat.cal.guessRight++; else pat.cal.guessWrong++; }
 const isQual=hasNegativeQualifier(q.text);
 const recentWrong=pat.lastWrongAt&&(s.last-pat.lastWrongAt)<180000;
 if(!right){
  pat.totalMiss++;
  if(ms<6000) pat.impulsiveMiss++;
  if(isQual) pat.qualifierTrap++;
  if(recentWrong&&ms<8000) pat.postErrorCascade++;
  if(ms>=15000) pat.conceptGap++;
  pat.lastWrongAt=s.last;
  window._lastFastMiss=ms<6000;
  const pair=pairForTopic(q.topic);
  if(pair) pat.pairs[pair.id]=(pat.pairs[pair.id]||0)+1;
 } else {
  if(ms>25000) pat.speedBottleneck++;
  window._lastFastMiss=false;
 }
 if(q.topic){
  pat.recent.push({topic:q.topic,unit:q.unit,right:Boolean(right),ms:Math.round(ms),qual:isQual,conf:conf||""});
  if(pat.recent.length>40) pat.recent=pat.recent.slice(-40);
 }
 (window._qt=window._qt||[]).push(ms);
 const today=new Date().toDateString(); if(!store.day||store.day.d!==today) store.day={d:today,n:0}; store.day.n++; save();
}

function calibrationMetrics(){
 const pat=isPlainObj(store.t.patterns)?store.t.patterns:cleanPatterns({});
 const c=isPlainObj(pat.cal)?pat.cal:{sureRight:0,sureWrong:0,guessRight:0,guessWrong:0};
 const sureTot=c.sureRight+c.sureWrong, guessTot=c.guessRight+c.guessWrong, total=sureTot+guessTot;
 const sureAccPct=sureTot?Math.round(c.sureRight/sureTot*100):null;
 const overconfPct=sureTot?Math.round(c.sureWrong/sureTot*100):0;
 /* Brier score using nominal subjective probabilities: sure=0.90, guess=0.35 (0.00 = perfect, lower is better) */
 const brier=total?Math.round(((c.sureRight*0.01+c.sureWrong*0.81+c.guessRight*0.4225+c.guessWrong*0.1225)/total)*1000)/1000:null;
 return {total,sureTot,guessTot,sureRight:c.sureRight,sureWrong:c.sureWrong,guessRight:c.guessRight,guessWrong:c.guessWrong,sureAccPct,overconfPct,brier};
}

function topConfusionPairs(){
 const pat=isPlainObj(store.t.patterns)?store.t.patterns:{pairs:{}};
 return CONFUSION_PAIRS.map(p=>({...p,misses:pat.pairs&&pat.pairs[p.id]||0}))
  .sort((a,b)=>b.misses-a.misses);
}

function adhdCognitiveProfile(){
 const pat=isPlainObj(store.t.patterns)?store.t.patterns:cleanPatterns({});
 const totA=UNIT_IDS.reduce((a,u)=>a+unitStats(u).a,0);
 if(totA<3) return {
  ready:false,
  headline:"Building your cognitive profile",
  detail:"Answer at least 3 questions so the teacher can separate impulsive misses, NOT/EXCEPT skimming traps, post-error cascades, and deep concept gaps.",
  actionLabel:"Take a 5-question sprint",
  actionType:"sprint5",
  signals:pat
 };
 const cal=calibrationMetrics();
 const candidates=[
  {key:"overconfidence",score:(cal.sureWrong>=2&&cal.overconfPct>=30)?cal.sureWrong*2.4:0,headline:"Metacognitive overconfidence (high-confidence misses)",
   detail:`You marked "Sure" on ${cal.sureWrong} missed item${cal.sureWrong>1?"s":""} (${cal.overconfPct}% overconfidence rate). ADHD research shows online confidence blind spots cause premature study stops — drill twin contrast pairs to replace intuition with exact FINRA rule triggers.`,
   actionLabel:"Run a Contrast Drill",actionType:"contrast"},
  {key:"postErrorCascade",score:pat.postErrorCascade*2.2,headline:"Post-error cascade detected",
   detail:"After a miss, your next answer often arrives under 8 seconds and misses again — a classic ADHD inhibitory-control loop. Turn on Impulse Brake in Settings and take a 3-second breath after any red feedback.",
   actionLabel:"Run a calm Contrast Drill",actionType:"contrast"},
  {key:"qualifierTrap",score:pat.qualifierTrap*1.8,headline:"Negative-qualifier traps (NOT / EXCEPT)",
   detail:"You're missing stems with words like NOT, EXCEPT, or LEAST. Keep Qualifier Highlighting on so these words stand out visually before you scan the choices.",
   actionLabel:"Drill high-trap items",actionType:"trap"},
  {key:"impulsiveMiss",score:pat.impulsiveMiss*1.6,headline:"Impulsive fast misses (< 6s)",
   detail:"Answers submitted under 6 seconds are costing you points you already know. Read the full stem once, spot the rule anchor, then pick.",
   actionLabel:"Practice with Contrast Drill",actionType:"contrast"},
  {key:"conceptGap",score:pat.conceptGap*1.3,headline:"Deep concept gaps (slow misses)",
   detail:"You're spending real thinking time (> 15s) and still missing — that's not rushing, it's an unbuilt rule model. Step through the short voiced lessons first, then re-test.",
   actionLabel:"Open weakest unit lessons",actionType:"weak-unit"},
  {key:"speedBottleneck",score:pat.speedBottleneck*1.1,headline:"Accurate but slow (> 25s)",
   detail:"Your rule understanding is solid, but exam pacing needs fluency (1.4 min/Q standard, 1.0 min/Q Extreme). Short timed sprints will lock in automatic recall.",
   actionLabel:"Start 5-question sprint",actionType:"sprint5"}
 ].sort((a,b)=>b.score-a.score);
 const top=candidates[0];
 if(!top||top.score<=0) return {
  ready:true,
  headline:"Calibrated focus & steady pace",
  detail:"No major ADHD error-cascade patterns detected right now. Keep alternating short sprints with FSRS spaced reviews to cement long-term stability.",
  actionLabel:"Start FSRS memory review",
  actionType:"due",
  signals:pat
 };
 return {ready:true,headline:top.headline,detail:top.detail,actionLabel:top.actionLabel,actionType:top.actionType,signals:pat};
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
 const lv=curLevel(), L=LEVELS[lv]||LEVELS.hard; const idxs=GEN.map((_,i)=>i);
 const now=Date.now();
 const patPairs=(store.t.patterns&&store.t.patterns.pairs)||{};
 const w=i=>{ const q0=GEN[i](); const u=UNIT_BY_TOPIC[q0.topic]||7, d=DIFF_BY_TOPIC[q0.topic]||2;
   let weight=(1-unitStats(u).bkt)*3+0.3;
   if(lv==="easy"){ if(d===1) weight*=2.2; else if(d>1) weight*=0.15; }
   else if(lv==="standard"){ if(d===3) weight*=0.65; }
   else if(L.trapOnly&&d<3){ weight*=EXTREME_GEN[q0.topic]?1.4:0.25; }
   else if(d>L.maxDiff) weight*=0.15;
   if(store.t.openGaps&&store.t.openGaps[q0.topic]) weight*=2.5;
   /* FSRS retrievability boost: topics fading below 90% retention resurface proactively */
   const f=store.t.fsrs&&store.t.fsrs[q0.topic];
   if(f&&f.last){
    const R=fsrsRetrievability((now-f.last)/DAY_MS,f.s);
    if(R<0.90) weight*=(1.4+(0.90-R)*3);
   }
   /* Recursive confusion-pair boost */
   const cp=pairForTopic(q0.topic);
   if(cp&&patPairs[cp.id]) weight*=Math.min(2.4,1+patPairs[cp.id]*0.35);
   if(trapFirst&&(i===0||i===1||i===2)) weight*=2;
   return weight };
 const chosen=[]; const pool=[...idxs];
 while(chosen.length<n&&pool.length){ const ws=pool.map(w); const tot=ws.reduce((a,b)=>a+b,0); let r=Math.random()*tot,k=0;
   while(k<ws.length-1&&r>ws[k]){r-=ws[k];k++} chosen.push(pool.splice(k,1)[0]); }
 const arr=chosen.map(i=>{ const raw=GEN[i](); return prepare(L.hardenEasy?hardenQuestion(raw):raw); });
 if(L.shortMix){ const want=lv==="extreme"?Math.ceil(arr.length/2):Math.min(2,arr.length);
   const weak=[...new Set(arr.map(q=>q.unit))].sort((a,b)=>unitStats(a).bkt-unitStats(b).bkt);
   let shorts=shuffle(SHORT.filter(s=>weak.includes(s.unit)).concat(SHORT.filter(s=>!weak.includes(s.unit))));
   for(let k=0;k<want&&k<shorts.length;k++) arr[arr.length-1-k]=prepareShort(shorts[k]); }
 return shuffle(arr);
}

function acceleratedPath(){
 const steps=[];
 const mem=memorySummary();
 const gaps=Object.keys(store.t.openGaps||{});
 const topPair=topConfusionPairs()[0];
 if(mem.dueCount>0){
  steps.push({tag:"FSRS memory review",title:`Lock in ${mem.dueCount} fading topic${mem.dueCount>1?"s":""}`,minutes:3,
   why:`Retrievability dropped below 90% (lowest: ${mem.topRisk[0].topic} at ${Math.round(mem.topRisk[0].R*100)}%).`,
   action:"due",cta:"Review due"});
 }
 if(gaps.length){
  steps.push({tag:"Close open gap",title:gaps[0],minutes:4,
   why:"Missed multiple times — worked example + 3 targeted reps to close the leak.",
   href:"#/gap/"+encodeURIComponent(gaps[0]),cta:"Close gap"});
 }
 if(topPair&&topPair.misses>0){
  steps.push({tag:"Contrast interleaving",title:topPair.label,minutes:4,
   why:`You missed this twin trap ${topPair.misses} time${topPair.misses>1?"s":""}. Alternating A/B builds crisp discrimination.`,
   action:"contrast",pairId:topPair.id,cta:"Drill pair"});
 }
 for(const u of [0,...UNIT_IDS]){
  const un=SIE.units[u]; if(!un) continue;
  const openL=firstOpenLesson(u);
  if(openL){
   const ls=un.lessons[openL-1];
   steps.push({tag:u===0?"Start here":"Unit "+u+" lesson",title:ls.title,minutes:ls.minutes||4,
    why:"One-idea voiced screens with answer-to-continue checks.",
    href:`#/learn/unit/${u}/lesson/${openL}`,cta:"Open lesson"});
   break;
  }
 }
 if(steps.length<3){
  const wu=weakestUnit();
  steps.push({tag:"Adaptive sprint",title:"5-question focus burst ("+unitTitle(wu)+")",minutes:3,
   why:"Short active-retrieval burst calibrated to your BKT & FSRS profile.",
   action:"sprint5",cta:"Start sprint"});
 }
 if(steps.length<3&&topPair&&!steps.some(s=>s.action==="contrast")){
  steps.push({tag:"Contrast interleaving",title:topPair.label,minutes:4,
   why:"Alternating 6 twin-trap questions builds sharp FINRA rule discrimination.",
   action:"contrast",pairId:topPair.id,cta:"Drill pair"});
 }
 return steps.slice(0,3);
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
 if(pct>=80&&curLevel()==="extreme")add("Trap Slayer"); if(pct>=80&&mode==="unit")add("Unit Cleared");
 if(pct>=80&&mode==="contrast")add("Twin Discriminator");
 if(pct>=80&&mode==="due")add("Memory Keeper");
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
 const mem=memorySummary();
 return {totA,totC,dueCount:mem.dueCount,avgR:mem.avgR,ready:totA?Math.max(0,Math.min(100,Math.round((bktAvg*0.5+(totC/totA)*0.25+coverage*0.25)*100))):0};
}
