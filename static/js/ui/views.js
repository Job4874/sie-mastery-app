/* views.js - every page of the site. Each view renders into #app and returns its page title.
   Buttons use data-action (handled in js/app.js); navigation uses real links (#/...). */
const SECTION_NAMES={0:"Start here",1:"Section 1 \u00b7 Capital Markets",2:"Section 2 \u00b7 Products and Risks",3:"Section 3 \u00b7 Trading, Accounts and Prohibited Activities",4:"Section 4 \u00b7 Regulatory Framework"};
const LP={u:0,l:1,s:1,lv:"",screens:null,picked:{},done:false};

/* ---------- progress & level helpers ---------- */
function lessonKey(u,l){ return u+"-"+l; }
function lessonDone(u,l){ return Boolean(store.lp[lessonKey(u,l)]); }
function unitLessonProgress(u){ const un=SIE.units[u]; if(!un) return {done:0,total:0}; const total=un.lessons.length; let done=0; for(let l=1;l<=total;l++) if(lessonDone(u,l)) done++; return {done,total}; }
function firstOpenLesson(u){ const un=SIE.units[u]; if(!un) return 0; for(let l=1;l<=un.lessons.length;l++) if(!lessonDone(u,l)) return l; return 0; }
function levelChipHtml(lv){ lv=lv||curLevel(); const L=LEVELS[lv]||LEVELS.hard; return `<span class="chip${lv==="extreme"?" extreme":""}">${esc(L.label)}</span>`; }
function levelNoteFor(ctx,lv){
 const L=LEVELS[lv]||LEVELS.hard;
 if(ctx==="exam"){
  if(lv==="extreme") return "Extremely Hard exam: 75 questions in 75 minutes (1 min each). Even normally easy exam topics are upgraded into multi-step traps.";
  if(lv==="veryhard") return "Very Hard exam: 75 questions in 90 minutes, heavily weighted toward harder scenarios and traps.";
  if(lv==="hard") return "Hard exam: 75 questions in 105 minutes, prioritizing higher-difficulty items across the 16/44/31/9 blueprint.";
  if(lv==="standard") return "Standard exam: 75 questions in 105 minutes matching the balanced FINRA SIE baseline.";
  return "Easy exam: 75 questions in 105 minutes, starting with core definitions and foundational rules.";
 }
 if(ctx==="unit"){
  if(lv==="extreme") return "Extremely Hard lessons add a multi-step exam trap check before every recap, and the unit quiz upgrades easy topics into traps with a 45s clock + written short answer.";
  if(lv==="veryhard") return "Very Hard adds a tougher challenge check to every lesson and mixes written short answers into the unit quiz.";
  if(lv==="hard") return "Hard adds an extra challenge check to every lesson and weights the unit quiz toward trap distractors.";
  if(lv==="standard") return "Standard walks through the core lesson screens and a balanced 5-question unit quiz.";
  return "Easy focuses on foundational lesson screens and core-concept unit quiz questions.";
 }
 return L.desc;
}
function levelPickerHtml(ctx){
 const lv=curLevel(), L=LEVELS[lv]||LEVELS.hard;
 const label=ctx==="exam"?"Exam difficulty":ctx==="unit"?"Lesson & quiz difficulty":"Difficulty";
 return `<div class="level-picker card soft" data-component="level-picker"><div class="level-head"><span id="levelLabel" class="small"><b>${label}</b></span>${levelChipHtml(lv)}</div>
  <div class="segmented" role="radiogroup" aria-labelledby="levelLabel">${Object.keys(LEVELS).map(k=>`<button type="button" role="radio" aria-checked="${k===lv?"true":"false"}" class="${k===lv?(k==="extreme"?"on extreme":"on"):""}" data-action="set-level" data-level="${k}">${esc(LEVELS[k].label)}</button>`).join("")}</div>
  <p class="small muted">${esc(levelNoteFor(ctx,lv))}</p></div>`;
}
function nextStep(){
 const l0=firstOpenLesson(0);
 if(l0&&!(store.zero&&store.zero.done)) return {eyebrow:"Start here",title:SIE.units[0].lessons[l0-1].title,sub:"Lesson "+l0+" of "+SIE.units[0].lessons.length+" \u00b7 "+SIE.units[0].lessons[l0-1].minutes+" min",href:"#/learn/unit/0/lesson/"+l0,cta:l0===1?"Start":"Continue"};
 if(!store.t.placed) return {eyebrow:"Next step",title:"Placement check",sub:"10 questions across all 8 units, so the teacher knows where to start you.",action:"start-placement",cta:"Start the check",skip:true};
 const gaps=Object.keys(store.t.openGaps||{});
 if(gaps.length) return {eyebrow:"Close a gap",title:gaps[0],sub:"You missed this concept more than once. A short re-learn, a worked example, then 3 questions.",href:"#/gap/"+encodeURIComponent(gaps[0]),cta:"Close it"};
 for(const u of UNIT_IDS){ const un=SIE.units[u]; if(!un) continue; const l=firstOpenLesson(u);
  if(l) return {eyebrow:"Unit "+u+" \u00b7 "+un.title,title:un.lessons[l-1].title,sub:"Lesson "+l+" of "+un.lessons.length+" \u00b7 "+un.lessons[l-1].minutes+" min",href:"#/learn/unit/"+u+"/lesson/"+l,cta:l===1?"Start":"Continue"};
  if(!store.t.done[u]) return {eyebrow:"Unit "+u+" \u00b7 "+un.title,title:"Unit quiz",sub:"5 questions. Score 80% to clear the unit.",action:"unit-quiz",u,cta:"Take the quiz"}; }
 return {eyebrow:"All units cleared",title:"Final review",sub:"25 adaptive questions weighted toward your weakest spots.",action:"final-review",cta:"Start final review"};
}
function lessonsTotal(){ let d=0,t=0; SIE.units.forEach((u,i)=>{ if(!u) return; const p=unitLessonProgress(i); d+=p.done; t+=p.total; }); return {done:d,total:t}; }
function pctBar(p,label){ return `<div class="bar" role="progressbar" aria-label="${esc(label||"Progress")}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><i style="width:${p}%"></i></div>`; }
function dailyCount(){ return store.day&&store.day.d===new Date().toDateString()?store.day.n:0; }

/* ---------- Learn (home) ---------- */
function viewLearn(app){
 const ns=nextStep(), lt=lessonsTotal(), rd=readiness(), lv=curLevel();
 const unitRow=u=>{ const un=SIE.units[u]; if(!un) return ""; const p=unitLessonProgress(u); const cleared=u===0?(p.done===p.total):Boolean(store.t.done[u]);
  const status=cleared?`<span class="chip good">Done</span>`:p.done?`<span class="chip">${p.done}/${p.total} lessons</span>`:`<span class="chip muted">${p.total} lessons</span>`;
  return `<li><a class="unit-row${cleared?" cleared":""}" href="#/learn/unit/${u}"><span class="unit-num" aria-hidden="true">${cleared?"\u2713":u}</span><span class="unit-text"><span class="unit-title">${u===0?"":"Unit "+u+": "}${esc(un.title)}</span><span class="unit-sub">${esc(un.summary)}</span></span>${status}</a></li>`; };
 app.innerHTML=`<section class="page">
 <h1 class="page-title">Learn</h1>
 <div class="card continue-card"><div class="row between"><p class="eyebrow">${esc(ns.eyebrow)}</p>${levelChipHtml(lv)}</div><h2>${esc(ns.title)}</h2><p class="muted">${esc(ns.sub)}</p>
  <div class="row">${ns.href?`<a class="btn primary big" href="${ns.href}">${esc(ns.cta)}</a>`:`<button type="button" class="btn primary big" data-action="${ns.action}"${ns.u?` data-u="${ns.u}"`:""}>${esc(ns.cta)}</button>`}${ns.skip?`<button type="button" class="btn ghost" data-action="skip-placement">Skip for now</button>`:""}</div></div>
 <div class="stats-strip" aria-label="Your progress">
  <div><span class="stat">${lt.done}/${lt.total}</span><span class="stat-label">lessons done</span></div>
  <div><span class="stat">${Object.keys(store.t.done).length}/8</span><span class="stat-label">units cleared</span></div>
  <div><span class="stat">${dailyCount()}/10</span><span class="stat-label">answers today</span></div>
  <div><span class="stat">${rd.ready}%</span><span class="stat-label">exam readiness</span></div>
 </div>
 <h2 class="section-title">Course</h2>
 <ol class="unit-list">${unitRow(0)}${UNIT_IDS.map(unitRow).join("")}</ol>
 <div class="card soft"><h2>Why the rules exist</h2><p class="muted">Short deep dives on the history behind SIPC, CMOs, freeriding and more. Knowing why a rule exists makes new questions predictable.</p><a class="btn" href="#/library">Open the library</a></div>
 </section>`;
 return "Learn";
}

/* ---------- Unit page ---------- */
function viewUnit(app,p){
 const u=Number(p.u), un=SIE.units[u]; if(!un){ app.innerHTML=notFound(); return "Not found"; }
 const pr=unitLessonProgress(u), s=u?unitStats(u):null, ov=u?UNIT_OVERVIEWS[u-1]:null, lv=curLevel(), L=LEVELS[lv]||LEVELS.hard;
 const extraStep=(u>=1&&(lv==="hard"||lv==="veryhard"||lv==="extreme"))?1:0;
 app.innerHTML=`<section class="page">
 <nav class="crumbs" aria-label="Breadcrumb"><a href="#/learn">Learn</a><span aria-hidden="true">/</span><span>${u===0?"Start here":"Unit "+u}</span></nav>
 <p class="eyebrow">${esc(SECTION_NAMES[un.section]||"")}</p>
 <h1 class="page-title">${esc(un.title)}</h1>
 <p class="lead">${esc(un.summary)}</p>
 ${pctBar(pr.total?Math.round(pr.done/pr.total*100):0,"Lessons completed")}<p class="muted small">${pr.done} of ${pr.total} lessons done</p>
 ${u?levelPickerHtml("unit"):""}
 <ol class="lesson-list">${un.lessons.map((ls,i)=>{ const l=i+1, d=lessonDone(u,l);
  return `<li><a class="lesson-row${d?" done":""}" href="#/learn/unit/${u}/lesson/${l}"><span class="lesson-check" aria-hidden="true">${d?"\u2713":l}</span><span class="lesson-text"><span class="lesson-title">${esc(ls.title)}</span><span class="lesson-sub">${ls.screens.length+extraStep} steps \u00b7 ${ls.minutes} min${extraStep?(lv==="extreme"?" \u00b7 +Extreme trap":" \u00b7 +Challenge"):""}${d?" \u00b7 done":""}</span></span><span class="lesson-go">${d?"Review":"Start"}</span></a></li>`; }).join("")}</ol>
 ${u?`<div class="card"><div class="row between"><h2>Unit quiz</h2>${levelChipHtml(lv)}</div><p class="muted">5 fresh questions from this unit (${esc(L.label)}). Score 80% to clear it.${store.t.done[u]?" You've cleared this unit.":""}</p>
  <p class="small">Mastery estimate: <b>${Math.round(s.bkt*100)}%</b> \u00b7 ${esc(diagnose(u))}</p>
  <div class="row"><button type="button" class="btn primary" data-action="unit-quiz" data-u="${u}">Take the unit quiz</button>${ov&&ov.audio?`<button type="button" class="btn ghost" data-action="unit-overview-audio" data-u="${u}">Listen to the unit overview</button>`:""}</div></div>`:
 `<div class="card"><h2>Ready?</h2><p class="muted">After these lessons, a 10-question placement check tells the teacher where to start you.</p><button type="button" class="btn primary" data-action="start-placement">Take the placement check</button></div>`}
 </section>`;
 return un.title;
}

/* ---------- Lesson player ---------- */
function buildLessonScreens(u,l){
 const base=SIE.units[u].lessons[l-1].screens.map((sc,idx)=>({...sc,_origIdx:idx}));
 const lv=curLevel();
 if(u<1||lv==="easy"||lv==="standard") return base;
 const pool=gensForUnit(u);
 if(!pool.length) return base;
 let q;
 if(lv==="extreme"){
  const extPool=pool.filter(i=>Boolean(EXTREME_GEN[GEN[i]().topic]));
  const raw=GEN[pick(extPool.length?extPool:pool)]();
  q=prepare(hardenQuestion(raw));
 } else {
  const hardPool=pool.filter(i=>(DIFF_BY_TOPIC[GEN[i]().topic]||2)>=2);
  q=prepare(GEN[pick(hardPool.length?hardPool:pool)]());
 }
 const bonus={
  kind:"check", bonus:true,
  kindTag:lv==="extreme"?"Extreme trap check":(lv==="veryhard"?"Very Hard check":"Hard check"),
  extremeTrap:lv==="extreme",
  title:q.topic, prompt:esc(q.text),
  choices:q.choices.map(esc), answer:q.answer,
  explain:esc(q.explain)+(q.rule?" <b>Rule:</b> "+esc(q.rule):"")
 };
 return [...base.slice(0,-1), bonus, base[base.length-1]];
}
function viewLesson(app,p){
 const u=Number(p.u), l=Number(p.l), un=SIE.units[u], ls=un&&un.lessons[l-1];
 if(!ls){ app.innerHTML=notFound(); return "Not found"; }
 const lv=curLevel();
 if(LP.u!==u||LP.l!==l||LP.lv!==lv||!LP.screens){
  LP.picked={}; LP.u=u; LP.l=l; LP.lv=lv; LP.screens=buildLessonScreens(u,l);
 }
 const s=Math.min(Math.max(1,Number(p.s)||1),LP.screens.length);
 LP.s=s; LP.done=false;
 store.last={u,l}; save();
 renderLessonScreen(app);
 return ls.title;
}
function renderLessonScreen(app){
 app=app||$("app");
 const un=SIE.units[LP.u], ls=un.lessons[LP.l-1], screens=LP.screens||buildLessonScreens(LP.u,LP.l);
 const n=screens.length, sc=screens[LP.s-1], lv=curLevel();
 const picked=LP.picked[LP.s];
 const isCheck=sc.kind==="check", locked=isCheck&&picked===undefined;
 let body="";
 if(sc.kind==="concept"||sc.kind==="example"){
  body=`${sc.kind==="example"?`<p class="kind-tag">Example</p>`:""}<h2 class="screen-title">${esc(sc.title)}</h2><div class="screen-body">${sc.body}</div>`;
 } else if(isCheck){
  const tagText=sc.kindTag||"Check yourself";
  body=`<p class="kind-tag${sc.extremeTrap?" extreme-tag":""}">${esc(tagText)}</p><h2 class="screen-title">${sc.prompt}</h2><div class="opts" role="group" aria-label="Answer choices">${sc.choices.map((c,i)=>{
    let cls="opt"; if(picked!==undefined){ if(i===sc.answer) cls+=" right"; else if(i===picked) cls+=" wrong"; }
    return `<button type="button" class="${cls}" data-action="lesson-check" data-i="${i}"${picked!==undefined?" disabled":""} aria-pressed="${picked===i?"true":"false"}"><span class="opt-key">${"ABCD"[i]}</span><span class="opt-text">${c}</span></button>`; }).join("")}</div>
   ${picked!==undefined?`<div class="feedback ${picked===sc.answer?"good":"bad"}" role="status"><p class="feedback-head">${picked===sc.answer?"Correct.":"Not quite. The answer is "+"ABCD"[sc.answer]+"."}</p><p>${sc.explain}</p></div>`:""}`;
 } else {
  body=`<p class="kind-tag">Recap</p><h2 class="screen-title">${esc(sc.title||"Lock it in")}</h2><ul class="recap">${sc.points.map(pt=>`<li>${pt}</li>`).join("")}</ul>`;
 }
 const segs=screens.map((x,i)=>`<span class="seg${i<LP.s-1?" done":i===LP.s-1?" now":""}"></span>`).join("");
 const last=LP.s===n;
 const lvSel=LP.u>=1?`<select class="lesson-level${lv==="extreme"?" is-extreme":""}" data-action="set-level-select" aria-label="Lesson difficulty">${Object.keys(LEVELS).map(k=>`<option value="${k}"${k===lv?" selected":""}>${esc(LEVELS[k].label)}</option>`).join("")}</select>`:"";
 app.innerHTML=`<section class="page lesson-page">
 <div class="lesson-top"><a class="icon-btn" href="#/learn/unit/${LP.u}" aria-label="Close lesson">\u2715</a>
  <div class="lesson-meta"><span class="small muted">${LP.u===0?"Start here":"Unit "+LP.u} \u00b7 Lesson ${LP.l} of ${un.lessons.length}</span><h1 class="lesson-name">${esc(ls.title)}</h1></div>
  <div class="level-inline">${lvSel}<span class="small muted step-count">Step ${LP.s} of ${n}</span></div></div>
 <div class="segments" role="progressbar" aria-label="Lesson progress" aria-valuemin="1" aria-valuemax="${n}" aria-valuenow="${LP.s}">${segs}</div>
 <article class="card screen" aria-live="polite">${body}
  <div class="screen-tools"><button type="button" class="btn ghost small listen" data-action="listen" aria-pressed="false">Listen</button></div></article>
 <div class="lesson-nav"><button type="button" class="btn ghost" data-action="lesson-prev"${LP.s===1?" disabled":""}>Back</button>
  <button type="button" class="btn primary" data-action="lesson-next"${locked?" disabled":""}>${last?"Finish lesson":isCheck&&locked?"Answer to continue":"Next"}</button></div>
 </section>`;
 syncListenButtons();
 if(prefs.autoplay) playScreenAudio();
}
function screenAudioFor(){
 const screens=LP.screens||buildLessonScreens(LP.u,LP.l), sc=screens[LP.s-1];
 if(sc.bonus){
  const answeredYet=LP.picked[LP.s]!==undefined;
  return answeredYet?{src:null,text:"The answer is "+"ABCD"[sc.answer]+". "+plainText(sc.explain)}:{src:null,text:plainText(sc.prompt)+" "+sc.choices.map((c,i)=>"ABCD"[i]+". "+plainText(c)+".").join(" ")};
 }
 const oi=Number.isInteger(sc._origIdx)?sc._origIdx:(LP.s-1);
 if(sc.kind==="check"){ const answeredYet=LP.picked[LP.s]!==undefined;
  return answeredYet?{src:SIE.screenAudio(LP.u,LP.l-1,oi,"x"),text:"The answer is "+"ABCD"[sc.answer]+". "+sc.explain}:{src:SIE.screenAudio(LP.u,LP.l-1,oi,"q"),text:sc.prompt+" "+sc.choices.map((c,i)=>"ABCD"[i]+". "+c+".").join(" ")}; }
 if(sc.kind==="recap") return {src:SIE.screenAudio(LP.u,LP.l-1,oi),text:(sc.title||"Recap")+". "+sc.points.join(" ")};
 return {src:SIE.screenAudio(LP.u,LP.l-1,oi),text:sc.say||(sc.title+". "+sc.body)}; }
function playScreenAudio(){ const a=screenAudioFor(); if(a.src) AudioMan.clip(a.src,a.text); else AudioMan.say(a.text,true); }
function lessonGo(delta){ const screens=LP.screens||buildLessonScreens(LP.u,LP.l); const ns=LP.s+delta; if(ns<1) return;
 if(ns>screens.length){ finishLesson(); return; }
 stopAudio(); LP.s=ns; Router.replace("#/learn/unit/"+LP.u+"/lesson/"+LP.l+"/"+LP.s); renderLessonScreen(); window.scrollTo(0,0);
 const h=document.querySelector(".screen-title"); if(h){ h.setAttribute("tabindex","-1"); try{h.focus({preventScroll:true})}catch(e){} } }
function lessonCheck(i){ const screens=LP.screens||buildLessonScreens(LP.u,LP.l), sc=screens[LP.s-1]; if(sc.kind!=="check"||LP.picked[LP.s]!==undefined) return;
 LP.picked[LP.s]=i; stopAudio(); renderLessonScreen();
 const fb=document.querySelector(".feedback"); if(fb&&fb.focus){ fb.setAttribute("tabindex","-1"); try{fb.focus({preventScroll:false})}catch(e){} }
 if(prefs.voiceOn&&!prefs.autoplay) playScreenAudio(); }
function finishLesson(){
 const u=LP.u,l=LP.l,un=SIE.units[u], screens=LP.screens||buildLessonScreens(u,l); stopAudio();
 store.lp[lessonKey(u,l)]={done:true,at:Date.now()};
 store.xp+=Math.round(10*(LEVELS[curLevel()]?LEVELS[curLevel()].mult:1));
 if(u===0&&unitLessonProgress(0).done===unitLessonProgress(0).total) store.zero={done:true,at:Date.now()};
 save(); LP.done=true;
 const nextL=l<un.lessons.length?l+1:0;
 const checks=Object.keys(LP.picked).length, right=Object.keys(LP.picked).filter(s=>screens[s-1]&&LP.picked[s]===screens[s-1].answer).length;
 $("app").innerHTML=`<section class="page lesson-page"><div class="card done-card"><p class="eyebrow">Lesson complete \u00b7 ${esc((LEVELS[curLevel()]||LEVELS.hard).label)}</p><h1 class="page-title">${esc(un.lessons[l-1].title)}</h1>
 <p class="muted">${checks?`You got ${right} of ${checks} check question${checks>1?"s":""} right. `:""}+${Math.round(10*(LEVELS[curLevel()]?LEVELS[curLevel()].mult:1))} XP</p>
 <div class="row center">${nextL?`<a class="btn primary big" href="#/learn/unit/${u}/lesson/${nextL}">Next lesson: ${esc(un.lessons[nextL-1].title)}</a>`:
   u===0?`<button type="button" class="btn primary big" data-action="start-placement">Take the placement check</button>`:`<button type="button" class="btn primary big" data-action="unit-quiz" data-u="${u}">Take the unit quiz</button>`}
 <a class="btn ghost" href="#/learn/unit/${u}">Back to ${u===0?"Start here":"Unit "+u}</a></div></div></section>`;
 const h=$("app").querySelector("h1"); if(h){ h.setAttribute("tabindex","-1"); try{h.focus()}catch(e){} }
}
function syncListenButtons(){ document.querySelectorAll("[data-action='listen']").forEach(b=>{ b.textContent=AudioMan.playing?"Stop":"Listen"; b.setAttribute("aria-pressed",AudioMan.playing?"true":"false"); }); }

/* ---------- Practice ---------- */
function viewPractice(app){
 const missed=Object.keys(store.missed).length, gaps=Object.keys(store.t.openGaps||{});
 app.innerHTML=`<section class="page">
 <h1 class="page-title">Practice</h1>
 <p class="lead">Fresh questions every time: numbers, names and dates are re-rolled, so memorized answers won't help.</p>
 ${levelPickerHtml("practice")}
 <div class="grid">
  <div class="card"><h2>Quick sprint</h2><p class="muted">5 questions. Good for a short focus window.</p><button type="button" class="btn primary" data-action="sprint5">Start 5 questions</button></div>
  <div class="card"><h2>Sprint quiz</h2><p class="muted">10 adaptive questions, weighted to what you don't own yet.</p><button type="button" class="btn" data-action="sprint">Start 10 questions</button></div>
  <div class="card"><h2>Trap drill</h2><p class="muted">The classic traps first: SIPC capacity, CMO tranches, freeriding.</p><button type="button" class="btn" data-action="trap">Start trap drill</button></div>
  <div class="card"><h2>Missed questions</h2><p class="muted">${missed?`${missed} saved. Each clears after two correct replays.`:"Nothing saved yet. Questions you miss land here."}</p><button type="button" class="btn" data-action="missed"${missed?"":" disabled"}>Review missed (${missed})</button></div>
 </div>
 <h2 class="section-title">Unit quizzes</h2>
 <ol class="quiz-list">${UNIT_IDS.map(u=>`<li><button type="button" class="quiz-row" data-action="unit-quiz" data-u="${u}"><span>Unit ${u}: ${esc(unitTitle(u))}</span><span class="chip${store.t.done[u]?" good":""}">${store.t.done[u]?"Cleared":Math.round(unitStats(u).bkt*100)+"% mastery"}</span></button></li>`).join("")}</ol>
 ${gaps.length?`<h2 class="section-title">Open gaps</h2><ul class="gap-list">${gaps.map(t=>`<li><a href="#/gap/${encodeURIComponent(t)}">${esc(t)}</a></li>`).join("")}</ul>`:""}
 <p class="small muted">Want a fresh baseline? <button type="button" class="link-btn" data-action="start-placement">Retake the placement check</button></p>
 </section>`;
 return "Practice";
}

/* ---------- Exam ---------- */
function viewExam(app){
 const finalOk=Object.keys(store.t.done).length>=8, lv=curLevel(), L=LEVELS[lv]||LEVELS.hard, mins=L.examMins||105;
 app.innerHTML=`<section class="page">
 <h1 class="page-title">Exam</h1>
 ${levelPickerHtml("exam")}
 <div class="card"><div class="row between"><h2>Practice exam</h2>${levelChipHtml(lv)}</div><p>75 questions \u00b7 ${mins} minutes \u00b7 70% to pass. Weighted like the real SIE:</p>
  <table class="facts"><tbody><tr><td>Capital Markets</td><td>12 questions (16%)</td></tr><tr><td>Products and Risks</td><td>33 questions (44%)</td></tr><tr><td>Trading, Accounts and Prohibited Activities</td><td>23 questions (31%)</td></tr><tr><td>Regulatory Framework</td><td>7 questions (9%)</td></tr></tbody></table>
  <p class="small muted">${lv==="extreme"?"Extremely Hard active: every normally easy exam topic is replaced with a multi-step trap variant, and you have 75 minutes (1 min/question).":"No repeated questions within an exam. The timer starts when you press Start. Leaving the exam page ends the attempt."}</p>
  <button type="button" class="btn primary big" data-action="exam">Start ${esc(L.label)} exam</button></div>
 <div class="card"><h2>Final review</h2><p class="muted">25 adaptive questions aimed at your weakest spots (${esc(L.label)}). ${finalOk?"Unlocked.":"Unlocks when all 8 unit quizzes are cleared ("+Object.keys(store.t.done).length+"/8)."}</p>
  <button type="button" class="btn" data-action="final-review"${finalOk?"":" disabled"}>Start final review</button></div>
 </section>`;
 return "Exam";
}

/* ---------- Quiz session ---------- */
function viewQuiz(app){
 if(!session||!quiz.length){ Router.replace("#/practice"); return viewPractice(app); }
 app.innerHTML=`<section class="page quiz-page">
 <div class="quiz-top"><div><p class="eyebrow">${esc(session.title)}</p><h1 class="sr-only">${esc(session.title)}</h1></div>
  <div class="quiz-status"><span id="progress" class="small"></span><span id="timer" class="chip"></span></div></div>
 <section id="quiz"><div class="bar"><i id="pbar" style="width:0%"></i></div>
  <article class="card question"><p id="qMeta" class="kind-tag"></p><h2 id="qText" class="q" tabindex="-1"></h2><div id="opts" class="opts" role="group" aria-label="Answer choices"></div>
   <div id="explain" class="hidden" role="status"></div></article>
  <div class="lesson-nav"><button type="button" id="quitBtn" class="btn ghost" data-action="quit">Quit</button><button type="button" class="btn ghost" data-action="hear-question">Hear question</button><button type="button" id="nextBtn" class="btn primary hidden" data-action="next">Next question</button></div>
 </section>
 <section id="result" class="hidden" aria-live="polite"></section>
 </section>`;
 if(session.finished){ finish(); } else { showQ(); }
 return session.title;
}

/* ---------- Gap closer ---------- */
function viewGap(app,p){
 const topic=p.topic; window._gapTopic=topic;
 const info=(store.t.openGaps||{})[topic]; let u=info&&Number.isInteger(info.unit)?info.unit:(UNIT_BY_TOPIC[topic]||7); if(!UNIT_IDS.includes(u)) u=7;
 const gi=GEN.map((g,i)=>i).filter(i=>GEN[i]().topic===topic); const ex=gi.length?prepare(GEN[gi[0]]()):null;
 app.innerHTML=`<section class="page">
 <nav class="crumbs" aria-label="Breadcrumb"><a href="#/practice">Practice</a><span aria-hidden="true">/</span><span>Gap closer</span></nav>
 <h1 class="page-title">Close the gap: ${esc(topic)}</h1>
 <ol class="steps">
  <li class="card"><h2>1. Re-learn it</h2><p class="muted">This concept lives in Unit ${u}: ${esc(unitTitle(u))}.</p><a class="btn" href="#/learn/unit/${u}">Open Unit ${u} lessons</a></li>
  ${ex?`<li class="card"><h2>2. Watch the trap spring</h2><p><b>${esc(ex.text)}</b></p><p>Correct answer: <b>${esc(ex.choices[ex.answer])}</b></p><div class="feedback good"><p>${esc(ex.explain)}</p><p class="rule"><b>Rule:</b> ${esc(ex.rule)}</p></div></li>`:""}
  <li class="card"><h2>${ex?3:2}. Prove it's closed</h2><p class="muted">Three fresh questions on this exact concept. Get 2 of 3 and the gap closes. Miss, and we loop. That's the point.</p><button type="button" class="btn primary" data-action="gap-drill">Start the 3 questions</button></li>
 </ol></section>`;
 return "Gap closer";
}

/* ---------- Progress (teacher report) ---------- */
function viewProgress(app){
 const rd=readiness(), secs={1:"Capital Markets",2:"Products and Risks",3:"Trading, Accounts and Prohibited Activities",4:"Regulatory Framework"}, gaps=Object.keys(store.t.openGaps||{});
 app.innerHTML=`<section class="page">
 <h1 class="page-title">Progress</h1>
 <div class="stats-strip">
  <div><span class="stat">${rd.ready}%</span><span class="stat-label">exam readiness</span></div>
  <div><span class="stat">${rd.totA?Math.round(rd.totC/rd.totA*100):0}%</span><span class="stat-label">accuracy (${rd.totA} answers)</span></div>
  <div><span class="stat">${store.t.theta}</span><span class="stat-label">ability rating</span></div>
  <div><span class="stat">${store.xp}</span><span class="stat-label">XP</span></div>
 </div>
 <div class="card"><h2>By exam section</h2>${Object.keys(secs).map(k=>{const s=store.sec[k]||{a:0,c:0};const pc=s.a?Math.round(s.c/s.a*100):0;
  return `<div class="meter"><div class="row between"><span>Section ${k}: ${secs[k]}</span><b>${s.a?pc+"%":"no data"}</b></div>${pctBar(pc,"Section "+k+" accuracy")}</div>`}).join("")}</div>
 <h2 class="section-title">By unit</h2>
 <div class="unit-report">${UNIT_IDS.map(u=>{const s=unitStats(u),pr=prescribe(u);
  return `<div class="card"><div class="row between"><h3>Unit ${u}: ${esc(unitTitle(u))}</h3><span class="chip${store.t.done[u]?" good":""}">${store.t.done[u]?"Cleared":Math.round(s.bkt*100)+"% mastery"}</span></div>
  ${pctBar(Math.round(s.bkt*100),"Unit "+u+" mastery")}<p class="small muted">${s.a?`Accuracy ${Math.round(s.c/s.a*100)}% \u00b7 ${(s.time/s.a/1000).toFixed(1)}s per answer \u00b7 fast misses ${s.fastWrong} \u00b7 slow corrects ${s.slowRight}`:"No answers yet"}</p>
  <p>${esc(diagnose(u))}</p><a class="btn ghost small" href="${pr[1]}">${esc(pr[0])}</a></div>`}).join("")}</div>
 <div class="card soft"><h2>How the teacher reads you</h2><p class="muted">Repeated slow misses mean a concept you don't own yet, so the lessons get assigned. Fast misses mean trap-guessing, so slow down. Slow correct answers mean knowledge without speed, so do timed reps. The model updates after every answer.</p>
  <p class="small">Badges: ${store.t.badges.length?store.t.badges.map(esc).join(" \u00b7 "):"none yet"} \u00b7 Gaps closed: ${store.t.gapsClosed} \u00b7 Open gaps: ${gaps.length} \u00b7 Exam passes: ${store.streak}</p>
  <button type="button" class="btn ghost" data-action="speak-report">Hear my report</button></div>
 </section>`;
 return "Progress";
}
function speakReport(){ const rd=readiness(), weak=weakestUnit();
 AudioMan.say("Progress report. Exam readiness "+rd.ready+" percent. Overall accuracy "+(rd.totA?Math.round(rd.totC/rd.totA*100):0)+" percent across "+rd.totA+" answers. Weakest unit: "+unitTitle(weak)+". "+diagnose(weak)+" Open gaps: "+Object.keys(store.t.openGaps||{}).length+". Units cleared: "+Object.keys(store.t.done||{}).length+" of 8.",true); }

/* ---------- Library ---------- */
function viewLibrary(app){
 app.innerHTML=`<section class="page">
 <nav class="crumbs" aria-label="Breadcrumb"><a href="#/learn">Learn</a><span aria-hidden="true">/</span><span>Library</span></nav>
 <h1 class="page-title">Why the rules exist</h1>
 <p class="lead">Every rule answers a historical abuse. Learn the abuse and the rule's shape becomes predictable.</p>
 ${LESSONS.map((l,i)=>`<article class="card article"><p class="eyebrow">${esc(l.s)}</p><h2>${esc(l.t)}</h2><div class="screen-body"><p>${l.b}</p></div><div class="row"><button type="button" class="btn ghost small" data-action="library-audio" data-i="${i}">Listen</button><button type="button" class="btn ghost small" data-action="trap">Drill traps</button></div></article>`).join("")}
 </section>`;
 return "Library";
}

/* ---------- Settings ---------- */
function viewSettings(app){
 app.innerHTML=`<section class="page">
 <h1 class="page-title">Settings</h1>
 ${levelPickerHtml("settings")}
 <div class="card"><h2>Voice</h2>
  <p class="small">Engine: <b data-voice-status>${esc(VOICE_STATE.label)}</b></p>
  <p class="small muted">Lessons play pre-recorded Kokoro clips. Other speech uses the local Kokoro server (GPU, or the ONNX model on CPU) when <code>python server.py</code> is running, and the browser voice otherwise.</p>
  <div class="form-grid">
   <label for="voiceSel">Voice</label><select id="voiceSel" data-action="set-voice">${Object.keys(VOICES).map(k=>`<option value="${k}"${prefs.voice===k?" selected":""}>${esc(VOICES[k])}</option>`).join("")}</select>
   <label for="voiceRate">Speed</label><select id="voiceRate" data-action="set-rate">${["1","1.15","1.3"].map(r=>`<option value="${r}"${String(prefs.rate)===r?" selected":""}>${r==="1"?"1.0":r}x</option>`).join("")}</select>
   <label for="voiceOn">Read questions aloud</label><input type="checkbox" id="voiceOn" data-action="set-voice-on"${prefs.voiceOn?" checked":""}>
   <label for="autoplay">Auto-play lesson audio</label><input type="checkbox" id="autoplay" data-action="set-autoplay"${prefs.autoplay?" checked":""}>
  </div>
  <div class="row"><button type="button" class="btn ghost" data-action="test-voice">Test voice</button><button type="button" class="btn ghost" data-action="welcome">Play welcome clip</button></div></div>
 <div class="card"><h2>Appearance and focus</h2>
  <div class="row"><button type="button" class="btn ghost" data-action="toggle-theme" aria-pressed="${document.documentElement.getAttribute("data-theme")==="dark"}">Dark theme</button><button type="button" class="btn ghost" data-action="toggle-adhd" aria-pressed="${isAdhd()}">Focus mode</button></div>
  <p class="small muted">Focus mode hides everything but the current step, turns off motion, and enlarges text. Keyboard: <kbd>F</kbd> focus mode, <kbd>T</kbd> theme, <kbd>1</kbd>-<kbd>4</kbd> or <kbd>A</kbd>-<kbd>D</kbd> answer, <kbd>Enter</kbd> or <kbd>\u2192</kbd> next, <kbd>\u2190</kbd> back.</p></div>
 <div class="card"><h2>Troubleshooting</h2><p class="small muted">Checks every question generator, all 33 extreme trap upgrades, the short-answer grader, the 5-level exam mix, the lesson content and storage, right here in your browser.</p>
  <button type="button" class="btn" data-action="self-check">Run self-check</button><p id="selfCheckOut" class="mono small hidden" role="status"></p></div>
 <div class="card"><h2>Your data</h2><p class="small muted">Progress is saved only in this browser (localStorage). Nothing is sent anywhere.</p><button type="button" class="btn danger" data-action="reset-progress">Reset all progress</button></div>
 </section>`;
 return "Settings";
}
function notFound(){ return `<section class="page"><h1 class="page-title">Page not found</h1><p><a class="btn" href="#/learn">Go to Learn</a></p></section>`; }

Router.add("/learn",viewLearn,"learn");
Router.add("/learn/unit/:u",viewUnit,"learn");
Router.add("/learn/unit/:u/lesson/:l",viewLesson,"learn");
Router.add("/learn/unit/:u/lesson/:l/:s",viewLesson,"learn");
Router.add("/library",viewLibrary,"learn");
Router.add("/practice",viewPractice,"practice");
Router.add("/practice/unit/:u",(app,p)=>{ Router.replace("#/practice"); startUnitQuiz(Number(p.u)); return "Unit quiz"; },"practice");
Router.add("/gap/:topic",viewGap,"practice");
Router.add("/exam",viewExam,"exam");
Router.add("/quiz",viewQuiz,"quiz");
Router.add("/progress",viewProgress,"progress");
Router.add("/settings",viewSettings,"settings");
