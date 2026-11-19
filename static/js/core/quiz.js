/* quiz.js - practice / exam engine: question sets, timers, answering, grading, results. */
let quiz=[],qi=0,score=0,mode="trap",timerInt=null,timeLeft=0,current=null,answered=false,lastQuizLen=10,perQInt=null;
let session=null; /* {mode,title,back,backLabel,replay,finished} */
const MODE_TITLES={trap:"Trap drill",sprint:"Sprint quiz",exam:"Practice exam",missed:"Missed questions",unit:"Unit quiz",gap:"Gap closer",final:"Final review",zero:"Start-here check",placement:"Placement check"};

function buildExam(n){
 const weights={1:.16,2:.44,3:.31,4:.09},out=[];
 Object.keys(weights).forEach(s=>{const cnt=Math.round(n*weights[s]);const ids=GEN.map((g,i)=>i).filter(i=>GEN[i]().sec==s);
  if(!ids.length)return; const seen=new Set(),pool=[];let guard=0,cursor=0;
  while(pool.length<cnt&&guard++<cnt*80){const q=GEN[ids[cursor++%ids.length]]();if(!seen.has(q.text)){seen.add(q.text);pool.push(q)}}
  while(pool.length<cnt)pool.push(GEN[pick(ids)]());
  out.push(...pool)});
 while(out.length<n)out.push(GEN[R(0,GEN.length-1)]());
 return shuffle(out).slice(0,n).map(prepare);
}
function prepare(q){const idx=shuffle(q.choices.map((c,i)=>i));return{...q,choices:idx.map(i=>q.choices[i]),answer:idx.indexOf(q.answer),unit:UNIT_BY_TOPIC[q.topic]||7,diff:DIFF_BY_TOPIC[q.topic]||2}}
function haltSession(){ clearInterval(timerInt); clearInterval(perQInt); stopAudio(); }

/* ---------- starting sessions ---------- */
function beginSession(m,questions,opts){
 haltSession();
 opts=opts||{};
 mode=m; quiz=questions; qi=0; score=0; answered=false; current=null; window._qt=[]; window._ms=null;
 session={mode:m,title:opts.title||MODE_TITLES[m]||"Quiz",back:opts.back||"#/practice",backLabel:opts.backLabel||"Practice",replay:opts.replay,finished:false};
 if(m==="exam"){ timeLeft=105*60; timerInt=setInterval(()=>{timeLeft--;tick();if(timeLeft<=0)finish()},1000); }
 Router.go("#/quiz",true);
}
function startQuiz(m,n){ m=m||"trap"; n=n||10; let qs;
 if(m==="missed"){ const miss=Object.values(store.missed); if(!miss.length){ showToast("Your missed-question bank is empty. Miss something first."); return false }
  const ordered=miss.slice().sort((a,b)=>(a._cleared||0)-(b._cleared||0)||(a.ts||0)-(b.ts||0));
  qs=ordered.slice(0,n).map(x=>x.type==="short"?{...x}:prepare(x)) }
 else if(m==="exam"){ qs=buildExam(75); n=75 }
 else if(m==="trap"){ const seeded=[0,1,2].map(i=>prepare(GEN[i]())); const rest=adaptiveSet(n,true).filter(q=>q.type==="short"||!seeded.some(s=>s.topic===q.topic)); while(rest.length<n-3) rest.push(prepare(GEN[R(0,GEN.length-1)]())); qs=[...seeded,...rest.slice(0,Math.max(0,n-3))] }
 else { qs=adaptiveSet(n,false) }
 lastQuizLen=n;
 beginSession(m,qs,{back:m==="exam"?"#/exam":"#/practice",backLabel:m==="exam"?"Exam":"Practice",replay:()=>startQuiz(m,n)});
 return true;
}
function gensForUnit(u){ return GEN.map((g,i)=>i).filter(i=>UNIT_BY_TOPIC[GEN[i]().topic]===u) }
function startUnitQuiz(u){ u=Number(u); if(!UNIT_IDS.includes(u)) return; window._unit=u; const pool=gensForUnit(u);
 let qs=[],seen=new Set(),guard=0; while(qs.length<5&&pool.length&&guard++<100){ const q=GEN[pick(pool)](); if(!seen.has(q.text)){ seen.add(q.text); qs.push(q) } }
 while(qs.length<5) qs.push(GEN[pick(pool.length?pool:GEN.map((_,i)=>i))]());
 qs=shuffle(qs).map(prepare);
 if(curLevel()==="veryhard"||curLevel()==="master"){ const ss=SHORT.filter(s=>s.unit===u); if(ss.length) qs[qs.length-1]=prepareShort(pick(ss)); }
 beginSession("unit",qs,{title:"Unit "+u+" quiz: "+unitTitle(u),back:"#/learn/unit/"+u,backLabel:"Unit "+u,replay:()=>startUnitQuiz(u)}); }
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
 let left=L.perQ; if(el) el.textContent=left+"s (Master)";
 perQInt=setInterval(()=>{ left--; const t=$("timer"); if(t) t.textContent=left+"s (Master)"; if(left<=0){clearInterval(perQInt); if(!answered){ current&&current.type==="short"?timeoutShort():answer(-1) }} },1000); }

/* ---------- one question ---------- */
function showQ(){
 if(!quiz.length||!$("qText")) return;
 answered=false; current=quiz[qi]; window._qStart=Date.now(); startPerQ();
 $("progress").textContent="Question "+(qi+1)+" of "+quiz.length;
 $("pbar").style.width=(qi/quiz.length*100)+"%";
 $("qMeta").textContent=(current.sec?"Section "+current.sec:"Short response")+" \u00b7 "+current.topic;
 $("qText").textContent=current.text; $("explain").classList.add("hidden"); $("explain").innerHTML=""; $("nextBtn").classList.add("hidden");
 if(current.type==="short"){
  $("opts").innerHTML=`<p class="muted">Short response: write the rule in your own words. Key concepts and numbers are graded.</p><label class="sr-only" for="shortAns">Your answer</label><textarea id="shortAns" maxlength="1200" placeholder="Type your answer..."></textarea><div class="row"><button type="button" class="btn primary" data-action="submit-short">Submit answer</button></div>`;
 } else {
  $("opts").innerHTML=current.choices.map((c,i)=>`<button type="button" class="opt" data-action="answer" data-i="${i}" aria-pressed="false"><span class="opt-key">${"ABCD"[i]}</span><span class="opt-text">${esc(c)}</span></button>`).join("");
 }
 if(prefs.voiceOn) speak(current.text);
 const h=$("qText"); if(h&&h.focus) try{h.focus({preventScroll:false})}catch(e){}
}
function answer(i,btn,ev){
 if(answered) return;
 if(ev&&ev.detail>1&&i>=0) return; /* ignore the second click of a double-tap that landed on the next question */
 if(!current||current.type==="short"){ timeoutShort(); return }
 answered=true; clearInterval(perQInt);
 const right=i===current.answer; const ms=Date.now()-(window._qStart||Date.now()); recordPerf(current,right,ms);
 document.querySelectorAll("#opts .opt").forEach((b,j)=>{ b.disabled=true; b.setAttribute("aria-pressed",j===i?"true":"false"); if(j===current.answer) b.classList.add("right"); if(j===i&&!right) b.classList.add("wrong"); });
 store.seen++; store.sec[current.sec]=store.sec[current.sec]||{a:0,c:0}; store.sec[current.sec].a++;
 const key=current.topic+current.text.slice(0,40);
 if(right){ score++; store.xp+=Math.round((mode==="exam"?10:15)*(LEVELS[curLevel()]?LEVELS[curLevel()].mult:1)); store.sec[current.sec].c++; if(store.missed[key]){ store.missed[key]._cleared=(store.missed[key]._cleared||0)+1; if(store.missed[key]._cleared>=2) delete store.missed[key] } }
 else store.missed[key]={sec:current.sec,topic:current.topic,text:current.text,choices:current.choices,answer:current.answer,explain:current.explain,rule:current.rule,ts:Date.now()};
 showFeedback(right?"Correct.":(i<0?"Time's up.":"Not quite."), right, `${esc(current.explain)}`, current.rule);
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
 answered=true; clearInterval(perQInt); if(ta) ta.disabled=true; const ms=Date.now()-(window._qStart||Date.now());
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
 if(answered||!current) return; answered=true; clearInterval(perQInt);
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
function finish(){ clearInterval(timerInt); clearInterval(perQInt); if(!session) return; awardBadges();
 const pct=Math.round(score/quiz.length*100), pass=pct>=70;
 if(mode==="zero"){ store.zero={done:true,at:Date.now()}; }
 if(mode==="placement"){ store.t.placed=true; }
 if(mode==="unit"&&window._unit&&pct>=80){ store.t.done[window._unit]=1; }
 let gapClosed=null;
 if(mode==="gap"&&window._gapTopic&&pct>=66){ delete store.t.openGaps[window._gapTopic]; store.t.gapsClosed=(store.t.gapsClosed||0)+1; gapClosed=window._gapTopic; }
 if(mode==="exam"&&pass) store.streak++;
 save(); session.finished=true;
 const scoreText=Number.isInteger(score)?score:score.toFixed(1);
 const note=mode==="zero"?"Primer check done. Next: a 10-question placement check so the teacher knows where to start you.":
  mode==="placement"?"Calibration done. The teacher now has a baseline, and your next lesson targets your weakest unit.":
  mode==="exam"?(pass?"Pass: at or above the 70% line.":"Below 70%. Your misses are saved, so drill them next."):
  mode==="unit"?(pct>=80?"Unit cleared (80% or better).":"You need 80% to clear the unit. Misses are saved for review."):
  gapClosed?"Gap closed: "+gapClosed+".":"Session complete. Misses were saved to your review bank.";
 const gaps=Object.keys(store.t.openGaps||{});
 $("quiz").classList.add("hidden");
 const res=$("result");
 res.innerHTML=`<div class="card result-card"><p class="eyebrow">${esc(session.title)}</p><p class="big-score">${scoreText} / ${quiz.length}<span>${pct}%</span></p>
 <p>${esc(note)}</p><p class="muted">${esc(coachLine(pct))}</p>${window._newBadges&&window._newBadges.length?`<p class="badge-line">New badge: ${esc(window._newBadges.join(", "))}</p>`:""}
 <div class="row center">${mode==="zero"?`<button type="button" class="btn primary" data-action="start-placement">Take the placement check</button>`:mode==="placement"?`<a class="btn primary" href="#/learn">Start learning</a>`:""}
 ${mode!=="zero"&&mode!=="placement"&&gaps.length?`<a class="btn" href="#/gap/${encodeURIComponent(gaps[0])}">Close a gap (${gaps.length} open)</a>`:""}
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
 const ex=buildExam(75), secC={1:0,2:0,3:0,4:0}; ex.forEach(q=>secC[q.sec]++);
 if(ex.length!==75||new Set(ex.map(q=>q.text)).size!==75||secC[1]!==12||secC[2]!==33||secC[3]!==23||secC[4]!==7) issues.push("buildExam(75)");
 const units=UNIT_IDS.map(u=>SIE.units[u]).filter(Boolean);
 if(units.length!==8||!SIE.units[0]) issues.push("curriculum units ("+units.length+"/8 + start)");
 let screens=0; SIE.units.forEach(u=>u&&u.lessons.forEach(l=>{screens+=l.screens.length}));
 let lsOk=true; try{localStorage.setItem("_sie_chk","1"); lsOk=localStorage.getItem("_sie_chk")==="1"; localStorage.removeItem("_sie_chk");}catch(e){lsOk=false}
 if(!lsOk) issues.push("localStorage");
 const msg=issues.length?"FAILED: "+issues.join(", "):`LIVE SELF-CHECK OK: ${GEN.length} MC generators, ${SHORT.length} short rubrics, ${screens} lesson screens, 75-Q exam mix (12/33/23/7), Reg T swap trap, localStorage, voice: ${VOICE_STATE.label}`;
 const out=$("selfCheckOut"); if(out){ out.textContent=msg; out.classList.remove("hidden") }
 showToast(issues.length?"Self-check found "+issues.length+" issue(s)":"Self-check passed");
 const result={ok:issues.length===0,issues,msg}; if(typeof onDone==="function") onDone(result); return result;
}
