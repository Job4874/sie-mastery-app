/* quiz.js - practice / exam engine: question sets, FSRS due reviews, confusion-pair contrast
   interleaving, ADHD qualifier highlighting + impulse brake, timers, rubric grading, self-check. */
let quiz=[],qi=0,score=0,mode="trap",timerInt=null,timeLeft=0,current=null,answered=false,lastQuizLen=10,perQInt=null,brakeInt=null;
let session=null; /* {mode,title,back,backLabel,replay,finished,pair} */
const MODE_TITLES={trap:"Trap drill",sprint:"Sprint quiz",exam:"Practice exam",missed:"Missed questions",unit:"Unit quiz",gap:"Gap closer",final:"Final review",zero:"Start-here check",placement:"Placement check",due:"FSRS memory review",contrast:"Contrast drill"};

function buildExam(n,lv){
 lv=lv||curLevel(); const L=LEVELS[lv]||LEVELS.hard;
 const weights={1:.16,2:.44,3:.31,4:.09},out=[];
 Object.keys(weights).forEach(s=>{
  const cnt=Math.round(n*weights[s]);
  let ids=shuffle(GEN.map((g,i)=>i).filter(i=>GEN[i]().sec==s));
  if(!ids.length) return;
  if(lv==="easy") ids.sort((a,b)=>(DIFF_BY_TOPIC[GEN[a]().topic]||2)-(DIFF_BY_TOPIC[GEN[b]().topic]||2));
  else if(lv==="hard"||lv==="veryhard") ids.sort((a,b)=>(DIFF_BY_TOPIC[GEN[b]().topic]||2)-(DIFF_BY_TOPIC[GEN[a]().topic]||2));
  const seen=new Set(),pool=[]; let guard=0,cursor=0;
  while(pool.length<cnt&&guard++<cnt*80){
   let q=GEN[ids[cursor++%ids.length]]();
   if(L.hardenEasy) q=hardenQuestion(q);
   if(!seen.has(q.text)){ seen.add(q.text); pool.push(q); }
  }
  while(pool.length<cnt){ let q=GEN[pick(ids)](); if(L.hardenEasy) q=hardenQuestion(q); pool.push(q); }
  out.push(...pool);
 });
 while(out.length<n){ let q=GEN[R(0,GEN.length-1)](); if(L.hardenEasy) q=hardenQuestion(q); out.push(q); }
 return shuffle(out).slice(0,n).map(prepare);
}
function prepare(q){const idx=shuffle(q.choices.map((c,i)=>i));return{...q,choices:idx.map(i=>q.choices[i]),answer:idx.indexOf(q.answer),unit:UNIT_BY_TOPIC[q.topic]||7,diff:q.diff||DIFF_BY_TOPIC[q.topic]||2}}
function haltSession(){ clearInterval(timerInt); clearInterval(perQInt); clearInterval(brakeInt); stopAudio(); }

/* Escape first (zero XSS), then highlight negative/boundary qualifiers for ADHD visual anchoring. */
function highlightQualifiersHtml(text){
 const safe=esc(text);
 if(!prefs.qualHighlight) return safe;
 return safe.replace(/\b(NOT|EXCEPT|LEAST|FALSE|NEVER|UNLESS|CANNOT|ONLY|MOST)\b/g,'<mark class="qual">$1</mark>');
}
function questionSpeechText(q){
 if(!q) return "";
 if(q.type==="short") return plainText(q.text);
 return plainText(q.text)+" "+q.choices.map((c,i)=>"ABCD"[i]+". "+plainText(c)+".").join(" ");
}

/* ---------- starting sessions ---------- */
function beginSession(m,questions,opts){
 haltSession();
 opts=opts||{};
 const L=LEVELS[curLevel()]||LEVELS.hard;
 mode=m; quiz=questions; qi=0; score=0; answered=false; current=null; window._qt=[]; window._ms=null; window._lastFastMiss=false;
 window._sessFastMiss=0; window._sessStart=Date.now();
 const baseTitle=opts.title||(m==="exam"?"Practice exam \u00b7 "+L.label:MODE_TITLES[m]||"Quiz");
 session={mode:m,title:baseTitle,back:opts.back||"#/practice",backLabel:opts.backLabel||"Practice",replay:opts.replay,finished:false,pair:opts.pair||null};
 if(m==="exam"){ timeLeft=(L.examMins||105)*60; timerInt=setInterval(()=>{timeLeft--;tick();if(timeLeft<=0)finish()},1000); }
 Router.go("#/quiz",true);
}
function startQuiz(m,n){ m=m||"trap"; n=n||10; let qs; const L=LEVELS[curLevel()]||LEVELS.hard;
 if(m==="missed"){ const miss=Object.values(store.missed); if(!miss.length){ showToast("Your missed-question bank is empty. Miss something first."); return false }
  const ordered=miss.slice().sort((a,b)=>(a._cleared||0)-(b._cleared||0)||(a.ts||0)-(b.ts||0));
  qs=ordered.slice(0,n).map(x=>x.type==="short"?{...x}:prepare(x)) }
 else if(m==="exam"){ qs=buildExam(75); n=75 }
 else if(m==="trap"){ const seeded=[0,1,2].map(i=>prepare(L.hardenEasy?hardenQuestion(GEN[i]()):GEN[i]())); const rest=adaptiveSet(n,true).filter(q=>q.type==="short"||!seeded.some(s=>s.topic===q.topic)); while(rest.length<n-3){ const raw=GEN[R(0,GEN.length-1)](); rest.push(prepare(L.hardenEasy?hardenQuestion(raw):raw)); } qs=[...seeded,...rest.slice(0,Math.max(0,n-3))] }
 else { qs=adaptiveSet(n,false) }
 lastQuizLen=n;
 beginSession(m,qs,{back:m==="exam"?"#/exam":"#/practice",backLabel:m==="exam"?"Exam":"Practice",replay:()=>startQuiz(m,n)});
 return true;
}
function startDueReview(n){
 n=n||8;
 const L=LEVELS[curLevel()]||LEVELS.hard;
 const ranked=dueTopics();
 if(!ranked.length){
  showToast("No FSRS history yet. Starting a 5-question calibration sprint.");
  return startQuiz("sprint",5);
 }
 const topics=ranked.slice(0,n).map(x=>x.topic);
 const qs=[]; const seen=new Set();
 topics.forEach(tp=>{
  const idxs=GEN.map((g,i)=>i).filter(i=>GEN[i]().topic===tp);
  if(!idxs.length) return;
  const raw=GEN[pick(idxs)]();
  const q=prepare(L.hardenEasy?hardenQuestion(raw):raw);
  if(!seen.has(q.text)){ seen.add(q.text); qs.push(q); }
 });
 while(qs.length<Math.min(n,Math.max(3,topics.length))){
  const raw=GEN[R(0,GEN.length-1)]();
  const q=prepare(L.hardenEasy?hardenQuestion(raw):raw);
  if(!seen.has(q.text)){ seen.add(q.text); qs.push(q); }
 }
 beginSession("due",qs,{title:"FSRS memory review ("+L.label+")",back:"#/practice",backLabel:"Practice",replay:()=>startDueReview(n)});
 return true;
}
function startContrastDrill(pairId){
 const pair=pairId?CONFUSION_PAIRS.find(p=>p.id===pairId):topConfusionPairs()[0];
 if(!pair) return startQuiz("trap",6);
 const L=LEVELS[curLevel()]||LEVELS.hard;
 const genFor=tp=>GEN.map((g,i)=>i).filter(i=>GEN[i]().topic===tp);
 const poolA=genFor(pair.a), poolB=genFor(pair.b);
 const draw=(pool,seen)=>{
  let guard=0;
  while(pool.length&&guard++<40){
   const raw=GEN[pick(pool)]();
   const q=prepare(L.hardenEasy?hardenQuestion(raw):raw);
   if(!seen.has(q.text)){ seen.add(q.text); return q; }
  }
  const fallback=pool.length?GEN[pick(pool)]():GEN[R(0,GEN.length-1)]();
  return prepare(L.hardenEasy?hardenQuestion(fallback):fallback);
 };
 /* Structured A-B-A-B-A-B micro-interleaving for ADHD discrimination */
 const qs=[], seen=new Set();
 for(let k=0;k<3;k++){
  qs.push(draw(poolA,seen));
  qs.push(draw(poolB,seen));
 }
 beginSession("contrast",qs,{title:"Contrast drill: "+pair.label,back:"#/practice",backLabel:"Practice",pair,replay:()=>startContrastDrill(pair.id)});
 return true;
}
function gensForUnit(u){ return GEN.map((g,i)=>i).filter(i=>UNIT_BY_TOPIC[GEN[i]().topic]===u) }
function startUnitQuiz(u){ u=Number(u); if(!UNIT_IDS.includes(u)) return; window._unit=u; const pool=gensForUnit(u); const L=LEVELS[curLevel()]||LEVELS.hard;
 let qs=[],seen=new Set(),guard=0; while(qs.length<5&&pool.length&&guard++<100){ let q=GEN[pick(pool)](); if(L.hardenEasy) q=hardenQuestion(q); if(!seen.has(q.text)){ seen.add(q.text); qs.push(q) } }
 while(qs.length<5){ let q=GEN[pick(pool.length?pool:GEN.map((_,i)=>i))](); if(L.hardenEasy) q=hardenQuestion(q); qs.push(q); }
 qs=shuffle(qs).map(prepare);
 if(L.shortMix){ const ss=SHORT.filter(s=>s.unit===u); if(ss.length) qs[qs.length-1]=prepareShort(pick(ss)); }
 beginSession("unit",qs,{title:"Unit "+u+" quiz ("+L.label+"): "+unitTitle(u),back:"#/learn/unit/"+u,backLabel:"Unit "+u,replay:()=>startUnitQuiz(u)}); }
function startFinalReview(){ if(Object.keys(store.t.done||{}).length<8){ showToast("Final review unlocks after you pass all 8 unit quizzes."); return false }
 beginSession("final",adaptiveSet(25,false),{back:"#/exam",backLabel:"Exam",replay:startFinalReview}); return true; }
function beginGapDrill(topic){ topic=topic||window._gapTopic; window._gapTopic=topic; const gi=GEN.map((g,i)=>i).filter(i=>GEN[i]().topic===topic);
 let qs=[]; if(gi.length){ let guard=0; while(qs.length<3&&guard++<80){ const q=GEN[pick(gi)](); if(!qs.some(x=>x.text===q.text))qs.push(q) } }
 while(qs.length<3) qs.push(GEN[R(0,GEN.length-1)]());
 beginSession("gap",qs.map(prepare),{title:"Gap closer: "+topic,back:"#/practice",backLabel:"Practice",replay:()=>beginGapDrill(topic)}); }
function startZeroQuiz(){ const ids=GEN.map((g,i)=>i).filter(i=>{const q=GEN[i]();return q.sec>=1&&q.sec<=3&&(DIFF_BY_TOPIC[q.topic]||2)<=1}); const picks=shuffle(ids).slice(0,3); while(picks.length<3)picks.push(R(0,GEN.length-1));
 beginSession("zero",picks.map(i=>prepare(GEN[i]())),{back:"#/learn",backLabel:"Learn",replay:startZeroQuiz}); }
function startPlacement(){ const ids=[]; for(let u=1;u<=8;u++){ const pool=GEN.map((g,i)=>i).filter(i=>{const q=GEN[i]();return (UNIT_BY_TOPIC[q.topic]||7)===u&&!ids.includes(i)}); if(pool.length)ids.push(pick(pool)); }
 const rest=shuffle(GEN.map((_,i)=>i).filter(i=>!ids.includes(i))); while(ids.length<10&&rest.length)ids.push(rest.pop());
 beginSession("placement",shuffle(ids).slice(0,10).map(i=>prepare(GEN[i]())),{back:"#/learn",backLabel:"Learn",replay:startPlacement}); }

/* ---------- timers ---------- */
function tick(){ const el=$("timer"); if(el) el.textContent=Math.floor(timeLeft/60)+":"+String(timeLeft%60).padStart(2,"0")+" left" }
function startPerQ(){ clearInterval(perQInt); const L=LEVELS[curLevel()]; const el=$("timer");
 if(mode==="exam"){ tick(); return }
 if(!L||!L.perQ||mode==="zero"||mode==="placement"){ if(el) el.textContent="Untimed"; return }
 let left=L.perQ; if(el) el.textContent=left+"s ("+(L.short||L.label)+")";
 perQInt=setInterval(()=>{ left--; const t=$("timer"); if(t) t.textContent=left+"s ("+(L.short||L.label)+")"; if(left<=0){clearInterval(perQInt); if(!answered){ current&&current.type==="short"?timeoutShort():answer(-1) }} },1000); }

/* ---------- one question ---------- */
function showQ(){
 if(!quiz.length||!$("qText")) return;
 clearInterval(brakeInt);
 answered=false; current=quiz[qi]; window._qStart=Date.now(); window._qConf=""; startPerQ();
 document.querySelectorAll("[data-action='set-conf']").forEach(b=>{ b.setAttribute("aria-pressed","false"); b.classList.remove("active"); });
 $("progress").textContent="Question "+(qi+1)+" of "+quiz.length;
 $("pbar").style.width=(qi/quiz.length*100)+"%";
 const meta=$("qMeta");
 const fState=current.topic&&store.t.fsrs&&store.t.fsrs[current.topic];
 const rBadge=fState&&fState.last?(" \u00b7 "+Math.round(fsrsRetrievability((Date.now()-fState.last)/DAY_MS,fState.s)*100)+"% retention"):"";
 meta.textContent=(current.sec?"Section "+current.sec:"Short response")+" \u00b7 "+current.topic+(current.extremeTrap?" \u00b7 Extreme trap":"")+rBadge;
 meta.className=current.extremeTrap?"kind-tag extreme-tag":"kind-tag";
 $("qText").innerHTML=highlightQualifiersHtml(current.text);
 $("explain").classList.add("hidden"); $("explain").innerHTML=""; $("nextBtn").classList.add("hidden");
 const cue=$("brakeCue");
 if(cue){
  if(window._lastFastMiss&&mode!=="exam"){
   cue.textContent=prefs.impulseBrake?"Impulse brake (3s): read the full stem and watch for qualifiers before picking.":"Quick breath: your last miss was under 6s — read qualifiers like NOT / EXCEPT before picking.";
   cue.classList.remove("hidden");
  } else {
   cue.classList.add("hidden"); cue.textContent="";
  }
 }
 if(current.type==="short"){
  $("opts").innerHTML=`<p class="muted">Short response: write the rule in your own words. Key concepts and numbers are graded.</p><label class="sr-only" for="shortAns">Your answer</label><textarea id="shortAns" maxlength="1200" placeholder="Type your answer..."></textarea><div class="row"><button type="button" class="btn primary" data-action="submit-short">Submit answer</button></div>`;
 } else {
  const holdBrake=Boolean(prefs.impulseBrake&&window._lastFastMiss&&mode!=="exam");
  $("opts").innerHTML=current.choices.map((c,i)=>`<button type="button" class="opt" data-action="answer" data-i="${i}" aria-pressed="false"${holdBrake?" disabled":""}><span class="opt-key">${"ABCD"[i]}</span><span class="opt-text">${esc(c)}</span></button>`).join("");
  if(holdBrake){
   let rem=3;
   brakeInt=setInterval(()=>{
    rem--;
    if(rem<=0){
     clearInterval(brakeInt);
     document.querySelectorAll("#opts .opt").forEach(b=>{ if(!answered) b.disabled=false; });
     if(cue) cue.textContent="Ready — choose your answer.";
    } else if(cue){ cue.textContent="Impulse brake ("+rem+"s): read the full stem and watch for qualifiers before picking."; }
   },1000);
  }
 }
 if(prefs.voiceOn) speak(current.text);
 const h=$("qText"); if(h&&h.focus) try{h.focus({preventScroll:false})}catch(e){}
}
function answer(i,btn,ev){
 if(answered) return;
 if(ev&&ev.detail>1&&i>=0) return; /* ignore the second click of a double-tap that landed on the next question */
 if(!current||current.type==="short"){ timeoutShort(); return }
 answered=true; clearInterval(perQInt); clearInterval(brakeInt);
 const right=i===current.answer; const ms=Date.now()-(window._qStart||Date.now()); const conf=window._qConf||"";
 if(!right&&ms<6000) window._sessFastMiss=(window._sessFastMiss||0)+1;
 recordPerf(current,right,ms,conf);
 document.querySelectorAll("#opts .opt").forEach((b,j)=>{ b.disabled=true; b.setAttribute("aria-pressed",j===i?"true":"false"); if(j===current.answer) b.classList.add("right"); if(j===i&&!right) b.classList.add("wrong"); });
 store.seen++; store.sec[current.sec]=store.sec[current.sec]||{a:0,c:0}; store.sec[current.sec].a++;
 const key=current.topic+current.text.slice(0,40);
 if(right){ score++; store.xp+=Math.round((mode==="exam"?10:15)*(LEVELS[curLevel()]?LEVELS[curLevel()].mult:1)); store.sec[current.sec].c++; if(store.missed[key]){ store.missed[key]._cleared=(store.missed[key]._cleared||0)+1; if(store.missed[key]._cleared>=2) delete store.missed[key] } }
 else store.missed[key]={sec:current.sec,topic:current.topic,text:current.text,choices:current.choices,answer:current.answer,explain:current.explain,rule:current.rule,ts:Date.now()};
 const head=right?(conf==="guess"?"Correct (lucky guess — lock in the rule below).":"Correct."):(i<0?"Time's up.":(conf==="sure"?"High-confidence miss — update this rule anchor now.":(ms<6000?"Fast miss ("+(ms/1000).toFixed(1)+"s) — pause before clicking.":"Not quite.")));
 showFeedback(head, right, `${esc(current.explain)}`, current.rule);
 registerGap(current,right); trackMissStreak(right); save();
 if(!right||mode!=="trap") speak((right?"Correct. ":"")+current.explain);
}
function showFeedback(head,good,bodyHtml,rule){
 const ex=$("explain"); ex.className="feedback "+(good?"good":"bad");
 ex.innerHTML=`<p class="feedback-head">${esc(head)}</p><p>${bodyHtml}</p>${rule?`<p class="rule"><b>Rule:</b> ${esc(rule)}</p>`:""}`;
 $("nextBtn").classList.remove("hidden"); $("nextBtn").textContent=qi<quiz.length-1?"Next question":"See results";
 try{$("nextBtn").focus({preventScroll:true})}catch(e){}
}
function answerShort(){ if(answered) return; const ta=$("shortAns"); const raw=redactSSN((ta&&ta.value||"").trim());
 if(raw.replace(/\[REDACTED-SSN\]/g,"").trim().length<3){ showToast(raw.includes("[REDACTED-SSN]")?"Please don't enter Social Security numbers. Your answer was redacted.":"Write an answer first. Even a wrong one teaches the teacher something."); if(ta) ta.focus(); return }
 answered=true; clearInterval(perQInt); clearInterval(brakeInt); if(ta) ta.disabled=true; const ms=Date.now()-(window._qStart||Date.now());
 const g=gradeShort(current,raw); const full=g.verdict==="full";
 recordPerf(current,full,ms);
 if(full){score++;store.xp+=Math.round(20*(LEVELS[curLevel()]?LEVELS[curLevel()].mult:1))}
 else if(g.verdict==="partial"){score+=0.5;store.xp+=8}
 const key=current.topic+current.text.slice(0,40);
 if(full){ const m=store.missed[key]; if(m){ m._cleared=(m._cleared||0)+1; if(m._cleared>=2) delete store.missed[key] } }
 else store.missed[key]={sec:0,topic:current.topic,unit:current.unit,diff:current.diff,text:current.text,choices:["(short response) "+current.model],answer:0,explain:current.model,rule:current.rule,type:"short",groups:current.groups,num:current.num,model:current.model,ts:Date.now()};
 showFeedback(full?"Full credit.":g.verdict==="partial"?"Partial credit: the shape is there, a piece is missing.":"Not yet. This is exactly the gap the teacher hunts.", full,
  `You covered: ${esc(g.hits.length?g.hits.join(" \u00b7 "):"nothing yet")}<br>Missing: ${esc(g.missed.length?g.missed.join(" \u00b7 "):"nothing")}<br><br><b>Model answer:</b> ${esc(current.model)}`, current.rule);
 save(); registerGap(current,full); trackMissStreak(full);
 speak((full?"Full credit. ":g.verdict==="partial"?"Partial credit. ":"Not yet. ")+"The model answer is: "+current.model);
}
function timeoutShort(){
 if(answered||!current) return; answered=true; clearInterval(perQInt); clearInterval(brakeInt);
 const ta=$("shortAns"); if(ta) ta.disabled=true;
 recordPerf(current,false,(LEVELS[curLevel()]&&LEVELS[curLevel()].perQ||60)*1000);
 const key=current.topic+current.text.slice(0,40);
 store.missed[key]={sec:0,topic:current.topic,unit:current.unit,diff:current.diff,text:current.text,choices:["(short response) "+current.model],answer:0,explain:current.model,rule:current.rule,type:"short",groups:current.groups,num:current.num,model:current.model,ts:Date.now()};
 showFeedback("Time's up.",false,`Here is the model answer to lock in.<br><br><b>Model answer:</b> ${esc(current.model)}`,current.rule);
 registerGap(current,false); trackMissStreak(false); save();
 speak("Time's up. The model answer is: "+current.model);
}
function nextQ(){ if(!answered) return;
 if(window._ms&&window._ms.c>=2&&qi<quiz.length-1&&mode!=="exam"){ const pool=GEN.map((g,i)=>i).filter(i=>{const q=GEN[i]();return UNIT_BY_TOPIC[q.topic]===window._ms.u&&(DIFF_BY_TOPIC[q.topic]||2)===1});
   if(pool.length){ quiz[qi+1]=prepare(GEN[pick(pool)]()); showToast("Two misses in a row. Here's a confidence rep, then we climb back."); } window._ms=null; }
 qi++; qi<quiz.length?showQ():finish(); }
function quitQuiz(){ haltSession(); const back=session?session.back:"#/practice"; session=null; quiz=[]; Router.go(back,true); }

/* ---------- results ---------- */
function finish(){ clearInterval(timerInt); clearInterval(perQInt); clearInterval(brakeInt); if(!session) return;
 const avgPace=(window._qt&&window._qt.length)?(window._qt.reduce((a,b)=>a+b,0)/window._qt.length/1000).toFixed(1):null;
 awardBadges();
 const pct=Math.round(score/quiz.length*100), pass=pct>=70;
 if(mode==="zero"){ store.zero={done:true,at:Date.now()}; }
 if(mode==="placement"){ store.t.placed=true; }
 if(mode==="unit"&&window._unit&&pct>=80){ store.t.done[window._unit]=1; }
 let gapClosed=null;
 if(mode==="gap"&&window._gapTopic&&pct>=66){ delete store.t.openGaps[window._gapTopic]; store.t.gapsClosed=(store.t.gapsClosed||0)+1; gapClosed=window._gapTopic; }
 if(mode==="exam"&&pass) store.streak++;
 if(!Array.isArray(store.sessions)) store.sessions=[];
 store.sessions.push({
  id:"s-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),
  mode,
  title:session.title,
  score:Number(score),
  total:quiz.length,
  pct,
  at:Date.now(),
  unit:mode==="unit"?Number(window._unit||0):0,
  level:curLevel()
 });
 if(store.sessions.length>60) store.sessions=store.sessions.slice(-60);
 save(); session.finished=true;
 const scoreText=Number.isInteger(score)?score:score.toFixed(1);
 const note=mode==="zero"?"Primer check done. Next: a 10-question placement check so the teacher knows where to start you.":
  mode==="placement"?"Calibration done. The teacher now has a baseline, and your next lesson targets your weakest unit.":
  mode==="exam"?(pass?"Pass: at or above the 70% line.":"Below 70%. Your misses are saved, so drill them next."):
  mode==="unit"?(pct>=80?"Unit cleared (80% or better).":"You need 80% to clear the unit. Misses are saved for review."):
  mode==="due"?"FSRS memory review complete. Stability intervals updated from your live accuracy and pace.":
  mode==="contrast"?"Contrast drill complete. Alternating twin traps sharpens discrimination under exam pressure.":
  gapClosed?"Gap closed: "+gapClosed+".":"Session complete. Misses were saved to your review bank.";
 const gaps=Object.keys(store.t.openGaps||{});
 const mem=memorySummary(), topPair=topConfusionPairs()[0];
 $("quiz").classList.add("hidden");
 const res=$("result");
 res.innerHTML=`<div class="card result-card"><p class="eyebrow">${esc(session.title)}</p><p class="big-score">${scoreText} / ${quiz.length}<span>${pct}%</span></p>
 <div class="result-metrics"><span>${avgPace?avgPace+"s avg pace":"Completed"}</span><span>Fast misses: ${window._sessFastMiss||0}</span><span>Memory retention: ${mem.avgR}%</span><span>Ability: ${store.t.theta}</span></div>
 <p>${esc(note)}</p><p class="muted">${esc(coachLine(pct))}</p>${window._newBadges&&window._newBadges.length?`<p class="badge-line">New badge: ${esc(window._newBadges.join(", "))}</p>`:""}
 <div class="row center">${mode==="zero"?`<button type="button" class="btn primary" data-action="start-placement">Take the placement check</button>`:mode==="placement"?`<a class="btn primary" href="#/learn">Start learning</a>`:""}
 ${mode!=="zero"&&mode!=="placement"&&gaps.length?`<a class="btn primary" href="#/gap/${encodeURIComponent(gaps[0])}">Close a gap (${gaps.length} open)</a>`:""}
 ${mode!=="zero"&&mode!=="placement"&&topPair&&topPair.misses>0&&!gaps.length?`<button type="button" class="btn primary" data-action="contrast" data-pair="${esc(topPair.id)}">Drill twin trap: ${esc(topPair.label)}</button>`:""}
 <button type="button" class="btn" data-action="replay">Run it again</button><a class="btn ghost" href="${esc(session.back)}">Back to ${esc(session.backLabel)}</a></div></div>`;
 res.classList.remove("hidden");
 const h=res.querySelector(".big-score"); if(h){ h.setAttribute("tabindex","-1"); try{h.focus()}catch(e){} }
 speak(`You scored ${scoreText} out of ${quiz.length}. ${pct} percent. ${mode==="exam"?(pass?"That is a pass.":"That is below the seventy percent pass line."):""}`);
}
function replaySession(){ if(session&&typeof session.replay==="function") session.replay(); }

/* ---------- troubleshooting: verify the engine live in the browser ---------- */
function runSelfCheck(onDone){
 const issues=[];
 GEN.forEach((g,idx)=>{ const q=g(),p=prepare(q);
  if(!q.text||!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices).size!==4) issues.push("GEN["+idx+"] shape");
  if(![1,2,3,4].includes(q.sec)) issues.push("GEN["+idx+"] sec");
  if(!(q.topic in UNIT_BY_TOPIC)||!(q.topic in DIFF_BY_TOPIC)) issues.push("GEN["+idx+"] map");
  if(p.choices[p.answer]!==q.choices[q.answer]) issues.push("GEN["+idx+"] prepare");
 });
 SHORT.forEach((s,idx)=>{ if(gradeShort(prepareShort(s),s.model).verdict!=="full") issues.push("SHORT["+idx+"]"); });
 if(gradeShort(prepareShort(SHORT[4]),"Initial margin is 25% set by FINRA and maintenance is 50% set by the Federal Reserve.").verdict!=="wrong") issues.push("RegT swap trap");
 if(gradeShort(prepareShort(SHORT[4]),"Reg T 50% = Fed. Maintenance 25% = FINRA.").verdict!=="full") issues.push("RegT short rule");
 const ex=buildExam(75,"standard"), secC={1:0,2:0,3:0,4:0}; ex.forEach(q=>secC[q.sec]++);
 if(ex.length!==75||new Set(ex.map(q=>q.text)).size!==75||secC[1]!==12||secC[2]!==33||secC[3]!==23||secC[4]!==7) issues.push("buildExam(75)");
 const exE=buildExam(75,"extreme"), secE={1:0,2:0,3:0,4:0}; exE.forEach(q=>secE[q.sec]++);
 if(exE.length!==75||new Set(exE.map(q=>q.text)).size!==75||secE[1]!==12||secE[2]!==33||secE[3]!==23||secE[4]!==7||!exE.every(q=>q.extremeTrap)) issues.push("buildExam(75,extreme)");
 Object.keys(DIFF_BY_TOPIC).filter(t=>DIFF_BY_TOPIC[t]===1).forEach(t=>{ if(!EXTREME_GEN[t]) issues.push("EXTREME_GEN missing "+t); else { const q=EXTREME_GEN[t](); if(!q.text||q.choices.length!==4||new Set(q.choices).size!==4) issues.push("EXTREME_GEN "+t); } });
 /* FSRS DSR mathematical identity & Confusion Pairs integrity */
 if(Math.abs(fsrsRetrievability(5,5)-0.9)>1e-9) issues.push("FSRS R(S,S)!=0.9");
 const genTopics=new Set(GEN.map(g=>g().topic));
 CONFUSION_PAIRS.forEach(cp=>{ if(!genTopics.has(cp.a)||!genTopics.has(cp.b)) issues.push("CONFUSION_PAIR "+cp.id); });
 const units=UNIT_IDS.map(u=>SIE.units[u]).filter(Boolean);
 if(units.length!==8||!SIE.units[0]) issues.push("curriculum units ("+units.length+"/8 + start)");
 let screens=0; SIE.units.forEach(u=>u&&u.lessons.forEach(l=>{screens+=l.screens.length}));
 let lsOk=true; try{localStorage.setItem("_sie_chk","1"); lsOk=localStorage.getItem("_sie_chk")==="1"; localStorage.removeItem("_sie_chk");}catch(e){lsOk=false}
 if(!lsOk) issues.push("localStorage");
 const msg=issues.length?"FAILED: "+issues.join(", "):`LIVE SELF-CHECK OK: ${GEN.length} MC generators, ${Object.keys(EXTREME_GEN).length} extreme traps, ${SHORT.length} short rubrics, ${CONFUSION_PAIRS.length} confusion pairs, FSRS-DSR, ${screens} lesson screens, 75-Q exam mix (12/33/23/7) across 5 levels, Reg T swap trap, localStorage, voice: ${VOICE_STATE.label}`;
 const out=$("selfCheckOut"); if(out){ out.textContent=msg; out.classList.remove("hidden") }
 showToast(issues.length?"Self-check found "+issues.length+" issue(s)":"Self-check passed");
 const result={ok:issues.length===0,issues,msg}; if(typeof onDone==="function") onDone(result); return result;
}
