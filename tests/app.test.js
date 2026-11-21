/* app.test.js - content, curriculum, router, grader, exam, audio and state checks without a browser. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { STATIC, getScriptList, readAllAppJs, createSandbox } = require("./load_app");

const html = fs.readFileSync(path.join(STATIC, "index.html"), "utf8");
const allJs = readAllAppJs().map(s => s.code).join("\n");
const sandbox = createSandbox();

const result = vm.runInContext(`(() => {
  const bad = [];
  GEN.forEach((g, i) => {
    for (let k = 0; k < 50; k++) {
      const q = g(), p = prepare(q);
      if (!q.text || !Array.isArray(q.choices) || q.choices.length !== 4) bad.push([i, "shape"]);
      else if (new Set(q.choices).size !== 4) bad.push([i, "duplicate choices"]);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) bad.push([i, "answer"]);
      else if (p.choices[p.answer] !== q.choices[q.answer]) bad.push([i, "prepare remap"]);
      if (![1, 2, 3, 4].includes(q.sec)) bad.push([i, "section"]);
    }
  });
  const splitBad = [];
  for (let i = 0; i < 200; i++) {
    const q = GEN[23]();
    if (q.topic !== "Stock splits" || q.choices.some(c => c.includes("."))) splitBad.push(q.choices);
  }
  const marginBad = [];
  for (let i = 0; i < 200; i++) {
    const q = GEN[4]();
    const mAmt = (q.text.match(/buys \\$([\\d,]+)/) || [])[1];
    const amt = mAmt ? parseInt(mAmt.replace(/,/g, ""), 10) : 0;
    const mCall = (q.choices[q.answer] || "").match(/\\$([\\d,]+)/);
    const call = mCall ? parseInt(mCall[1].replace(/,/g, ""), 10) : 0;
    if (q.topic !== "Reg T margin" || amt < 6000 || call < 3000) marginBad.push([amt, call]);
  }
  const placements = [];
  for (let i = 0; i < 20; i++) {
    startPlacement();
    const units = new Set(quiz.map(q => UNIT_BY_TOPIC[q.topic]));
    placements.push({
      n: quiz.length,
      unique: new Set(quiz.map(q => q.text)).size,
      all8: [1, 2, 3, 4, 5, 6, 7, 8].every(u => units.has(u))
    });
  }
  const exams = [];
  for (let i = 0; i < 20; i++) {
    const ex = buildExam(75), c = { 1: 0, 2: 0, 3: 0, 4: 0 };
    ex.forEach(q => c[q.sec]++);
    exams.push({ n: ex.length, unique: new Set(ex.map(q => q.text)).size, c });
  }
  const exam150 = buildExam(150);
  const exam150Valid = exam150.length === 150 &&
    exam150.every(q => q && Array.isArray(q.choices) && q.choices.length === 4);
  const allQs = GEN.map(g => g());
  const expectedSecs = [
    ["IPO vs follow-on", 1],
    ["Best efforts vs firm commitment", 1],
    ["Shelf registration", 1],
    ["Long call breakeven", 2],
    ["ETFs vs mutual funds", 2],
    ["SIPC separate capacity", 1],
    ["Communications", 3],
    ["Trusted contact / seniors", 3],
    ["Registration timelines", 1],
    ["Yield ordering", 2],
    ["Callable bonds / yield to worst", 2],
    ["IRA earned income & Social Security", 3],
    ["Roth vs Traditional IRA taxation", 3],
    ["ERISA & qualified retirement plans", 3],
    ["Long put breakeven", 2],
    ["Cumulative preferred stock", 2],
    ["Closed-end vs open-end funds", 2]
  ];
  const secAligned = expectedSecs.every(([t, s]) => {
    const hits = allQs.filter(q => q.topic === t);
    return hits.length > 0 && hits.every(q => q.sec === s);
  });
  const topics = [...new Set(allQs.map(q => q.topic))];
  const maps = {
    unit: topics.filter(t => !(t in UNIT_BY_TOPIC)),
    diff: topics.filter(t => !(t in DIFF_BY_TOPIC))
  };
  const model = SHORT.map(s => gradeShort(prepareShort(s), s.model).verdict);
  const empty = SHORT.map(s => gradeShort(prepareShort(s), "").verdict);
  const swapped = gradeShort(prepareShort(SHORT[4]),
    "Initial margin is 25% set by FINRA and maintenance is 50% set by the Federal Reserve.");
  const swappedBut = gradeShort(prepareShort(SHORT[4]),
    "Initial margin is 25% FINRA, but maintenance is 50% Federal Reserve.");
  const shortRule = gradeShort(prepareShort(SHORT[4]), "Reg T 50% = Fed. Maintenance 25% = FINRA.");
  const bare = gradeShort(prepareShort(SHORT[4]), "50% and 25%");
  const role = gradeShort(prepareShort(SHORT[4]),
    "Initial margin is 50% set by the Federal Reserve and maintenance is 25% set by FINRA.");
  const negCmo = gradeShort(prepareShort(SHORT[1]), "It does not contract and prepayments do not rise.");
  const negSipc = gradeShort(prepareShort(SHORT[0]), "Not $900,000; only $500,000 per separate capacity.");
  const commBoundary = gradeShort(prepareShort(SHORT[6]),
    "Retail communication approved by principal before use for 250 retail investors in 300 days.");

  const unitCount = [0,1,2,3,4,5,6,7,8].filter(i => SIE.units[i]).length;
  let lessonCount = 0, screenCount = 0, badLessons = 0;
  SIE.units.forEach(u => {
    if (!u) return;
    u.lessons.forEach(l => {
      lessonCount++;
      screenCount += l.screens.length;
      if (!l.screens.some(s => s.kind === "check") || l.screens[l.screens.length - 1].kind !== "recap") badLessons++;
    });
  });

  const routeChecks = [
    ["#/learn", "/learn"],
    ["#/learn/unit/3", "/learn/unit/:u"],
    ["#/learn/unit/3/lesson/2/4", "/learn/unit/:u/lesson/:l/:s"],
    ["#/practice", "/practice"],
    ["#/exam", "/exam"],
    ["#/progress", "/progress"],
    ["#/library", "/library"],
    ["#/settings", "/settings"],
    ["#/gap/Reg%20T%20margin", "/gap/:topic"],
    ["#/quiz", "/quiz"]
  ].map(([h, pat]) => {
    const p = Router.parse(h);
    return Boolean(p && p.route.pattern === pat);
  });

  const examByLevel = ["easy", "standard", "hard", "veryhard", "extreme"].map(lv => {
    const ex = buildExam(75, lv), c = { 1: 0, 2: 0, 3: 0, 4: 0 };
    ex.forEach(q => c[q.sec]++);
    return {
      lv, n: ex.length, unique: new Set(ex.map(q => q.text)).size, c,
      allHardened: ex.every(q => q.extremeTrap === true && q.diff === 3)
    };
  });
  const easyTopics = Object.keys(DIFF_BY_TOPIC).filter(t => DIFF_BY_TOPIC[t] === 1);
  const missingExtreme = easyTopics.filter(t => typeof EXTREME_GEN[t] !== "function");
  const extremeBad = [];
  Object.entries(EXTREME_GEN).forEach(([topic, fn]) => {
    for (let k = 0; k < 200; k++) {
      const q = fn(), p = prepare(q);
      if (!q.text || q.choices.length !== 4 || new Set(q.choices).size !== 4) extremeBad.push([topic, "shape"]);
      if (p.choices[p.answer] !== q.choices[q.answer]) extremeBad.push([topic, "prepare"]);
      if (![1, 2, 3, 4].includes(q.sec)) extremeBad.push([topic, "sec"]);
    }
  });
  const baseU1L1 = SIE.units[1].lessons[0].screens.length;
  prefs.level = "easy"; const lsEasy = buildLessonScreens(1, 1);
  prefs.level = "hard"; const lsHard = buildLessonScreens(1, 1);
  prefs.level = "extreme"; const lsExtreme = buildLessonScreens(1, 1);
  prefs.level = "hard";

  return {
    gen: GEN.length, bad, splitBad, marginBad, placements, exams, exam150Valid, secAligned, maps,
    model, empty, swapped, swappedBut, shortRule, bare, role, negCmo, negSipc, commBoundary,
    norm1000k: normNums("$1,000k"), unitCount, lessonCount, screenCount, badLessons, routeChecks,
    levelKeys: Object.keys(LEVELS), examByLevel, easyTopicCount: easyTopics.length,
    missingExtreme, extremeBad, baseU1L1,
    lsEasyLen: lsEasy.length, lsHardLen: lsHard.length, lsExtremeLen: lsExtreme.length,
    lsExtremeHasTrap: lsExtreme.some(s => s.bonus && s.extremeTrap),
    lsExtremeRecapOrig: lsExtreme[lsExtreme.length - 1]._origIdx
  };
})()`, sandbox);

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; } else { fail++; console.log("FAIL: " + name); }
}

(async () => {
  ok(getScriptList().length >= 20, "index.html loads split deferred JS files (got " + getScriptList().length + ")");
  ok(!/<script(?![^>]*src=)/i.test(html), "index.html has zero inline <script> blocks");
  ok(!/\bonclick\s*=/i.test(html) && !/\bonclick\s*=/i.test(allJs), "zero inline onclick handlers in HTML or JS");
  ok(result.unitCount === 9 && result.lessonCount === 42 && result.screenCount >= 260 && result.badLessons === 0,
    `curriculum loaded cleanly (${result.unitCount} units, ${result.lessonCount} lessons, ${result.screenCount} screens, bad=${result.badLessons})`);
  ok(result.routeChecks.every(Boolean), "all 10 hash routes parse cleanly");
  ok(result.gen >= 89, "generator count >= 89 (got " + result.gen + ")");
  ok(result.bad.length === 0, "all generators structurally valid: " + JSON.stringify(result.bad.slice(0, 5)));
  ok(result.splitBad.length === 0, "GEN[23] stock splits produce integer share counts across 200 rolls");
  ok(result.marginBad.length === 0, "GEN[4] Reg T margin avoids $2k collision (amt >= $6k, call >= $3k across 200 rolls)");
  ok(result.placements.length === 20 && result.placements.every(p => p.n === 10 && p.unique === 10 && p.all8),
    "startPlacement yields 10 unique stems covering all 8 units across 20 runs");
  ok(result.exams.length === 20 && result.exams.every(e => e.n === 75), "exam length 75 across 20 runs");
  ok(result.exams.every(e => e.unique === 75), "exam has 75 unique stems across 20 runs");
  ok(result.exams.every(e => e.c[1] === 12 && e.c[2] === 33 && e.c[3] === 23 && e.c[4] === 7), "exam section mix 12/33/23/7 across 20 runs");
  ok(JSON.stringify(result.levelKeys) === JSON.stringify(["easy", "standard", "hard", "veryhard", "extreme"]),
    "all 5 difficulty levels defined (easy -> extreme)");
  ok(result.examByLevel.every(e => e.n === 75 && e.unique === 75 && e.c[1] === 12 && e.c[2] === 33 && e.c[3] === 23 && e.c[4] === 7),
    "buildExam(75, level) yields 75 unique stems with 12/33/23/7 mix across all 5 levels");
  ok(result.examByLevel.find(e => e.lv === "extreme").allHardened,
    "Extremely Hard exam upgrades 100% of items (zero softballs)");
  ok(result.easyTopicCount === 33 && result.missingExtreme.length === 0 && result.extremeBad.length === 0,
    `all ${result.easyTopicCount} normally-easy topics have valid EXTREME_GEN trap upgrades (missing=${result.missingExtreme.join(",")})`);
  ok(result.lsEasyLen === result.baseU1L1 && result.lsHardLen === result.baseU1L1 + 1 &&
    result.lsExtremeLen === result.baseU1L1 + 1 && result.lsExtremeHasTrap &&
    result.lsExtremeRecapOrig === result.baseU1L1 - 1,
    "lesson player injects Hard/Extreme bonus trap check before Recap while preserving Recap audio index");
  ok(result.exam150Valid, "buildExam(150) fallback returns 150 items with 4 choices");
  ok(result.secAligned, "FINRA SIE section tags aligned across original + 2026 Social Security/IRA/ERISA/product topics");
  ok(result.maps.unit.length === 0, "every topic has a unit map: " + JSON.stringify(result.maps.unit));
  ok(result.maps.diff.length === 0, "every topic has a difficulty map: " + JSON.stringify(result.maps.diff));
  ok(result.model.every(v => v === "full"), "all 12 model short answers full credit (got " + JSON.stringify(result.model) + ")");
  ok(result.empty.every(v => v === "wrong"), "all 12 empty short answers zero credit");
  ok(result.swapped.verdict === "wrong", "swapped Reg T regulators score zero (got " + result.swapped.verdict + ")");
  ok(result.swappedBut.verdict === "wrong", "swapped Reg T regulators across 'but' clause score zero (got " + result.swappedBut.verdict + ")");
  ok(result.shortRule.verdict === "full", "concise Reg T rule earns full credit (got " + result.shortRule.verdict + ")");
  ok(result.bare.verdict === "wrong", "bare numbers without regulators score zero (got " + result.bare.verdict + ")");
  ok(result.role.verdict === "full", "correct role-bound Reg T answer is full credit");
  ok(result.negCmo.verdict === "wrong", "negated CMO concepts score zero (got " + result.negCmo.verdict + ")");
  ok(result.negSipc.verdict !== "full", "negated $900k SIPC figure cannot earn full credit (got " + result.negSipc.verdict + ")");
  ok(result.commBoundary.missed.length === 2, "word-boundary prevents 250/300 from matching 25/30 thresholds");
  ok(result.norm1000k.length === 1 && result.norm1000k[0] === 1000000, "normNums('$1,000k') strips comma before k expansion");
  ok(!allJs.includes("am_fenrir"), "invalid voice option removed");
  ok(!allJs.includes("Rule 2210/Exchange Act"), "Reg BI does not cite FINRA Rule 2210");
  ok(!allJs.includes("Rule 3230"), "gift limit does not cite FINRA Rule 3230");
  ok(allJs.includes("Rule 3220"), "gift limit cites FINRA Rule 3220");
  ok(allJs.includes("15l-1"), "Reg BI cites Exchange Act Rule 15l-1");
  ok(!allJs.includes("/[]/g"), "dead /[]/g regex removed");
  ok(!allJs.includes("1%/week"), "Rule 144 states 1% per 3 months rather than 1%/week");
  ok(allJs.includes("Rule 5220"), "backing away cites FINRA Rule 5220");
  ok(allJs.includes("Rule 3270"), "OBA cites FINRA Rule 3270");
  ok(allJs.includes("2150(c)"), "sharing in accounts cites FINRA Rule 2150(c)");
  ok(allJs.includes("26-05"), "gift limit updates reference FINRA Notice 26-05 ($300)");
  ok(allJs.includes("age 46"), "ABLE eligibility reflects SECURE 2.0 age 46 update");
  ok(allJs.includes("REPORTABLE EVENTS"), "REPORTABLE EVENTS heading typo fixed");

  const stSb = createSandbox({
    stateful: true,
    fetch: url =>
      url === "/api/health"
        ? Promise.resolve({ json: () => Promise.resolve({ ok: true, ready: true, engine: "kokoro-onnx" }) })
        : Promise.reject(new Error("offline"))
  });
  const stRes = vm.runInContext(`(() => {
    const adhd0 = isAdhd();
    ACTIONS["toggle-adhd"]();
    const adhd1 = isAdhd();
    ACTIONS["toggle-adhd"]();
    const adhd2 = isAdhd();

    startPlacement();
    showQ();
    const qiBefore = qi;
    nextQ();
    const qiBlocked = qi;
    answered = true;
    nextQ();
    const qiAfter = qi;
    answer(0, null, { detail: 2 });
    const dblBlockedAnswered = answered;

    current = prepareShort(SHORT[4]);
    answered = false;
    $("shortAns").value = "123-45-6789";
    answerShort();
    const ssnBlockedAnswered = answered;

    timeoutShort();
    const shortTimeoutState = {
      answered,
      disabled: $("shortAns").disabled,
      missedType: (store.missed[current.topic + current.text.slice(0, 40)] || {}).type
    };

    const cleaned = cleanMissedMap({
      badShort: { type: "short", text: "incomplete short" },
      badSec: { text: "bad sec", topic: "Reg T margin", sec: 99, choices: ["a", "b"], answer: 0 },
      goodMc: { text: "valid mc", topic: "Reg T margin", sec: 3, choices: ["a", "b"], answer: 0 }
    });
    const cleanedLp = cleanLessonProgress({ "1-1": { done: true, at: 1 }, bad: { done: true }, "2-1": { done: false } });

    const selfCheck = runSelfCheck();
    return { adhd0, adhd1, adhd2, qiBefore, qiBlocked, qiAfter, dblBlockedAnswered,
             ssnBlockedAnswered, shortTimeoutState, cleanedKeys: Object.keys(cleaned),
             cleanedLpKeys: Object.keys(cleanedLp), selfCheck };
  })()`, stSb);
  await new Promise(r => setTimeout(r, 15));
  ok(stRes.adhd0 === false && stRes.adhd1 === true && stRes.adhd2 === false, "toggle-adhd flips isAdhd state cleanly");
  ok(stRes.qiBefore === 0 && stRes.qiBlocked === 0 && stRes.qiAfter === 1, "nextQ blocks advance while !answered");
  ok(stRes.dblBlockedAnswered === false, "answer ignores accidental multi-click bleed-through (event.detail > 1)");
  ok(stRes.ssnBlockedAnswered === false, "answerShort blocks and redacts SSN-only submission");
  ok(stRes.shortTimeoutState.answered && stRes.shortTimeoutState.disabled && stRes.shortTimeoutState.missedType === "short",
    "timeoutShort marks answered, disables shortAns, and records short miss");
  ok(stRes.cleanedKeys.length === 1 && stRes.cleanedKeys[0] === "goodMc", "cleanMissedMap drops incomplete short and invalid sec entries");
  ok(stRes.cleanedLpKeys.length === 1 && stRes.cleanedLpKeys[0] === "1-1", "cleanLessonProgress drops invalid lesson progress entries");
  ok(stRes.selfCheck.ok && stRes.selfCheck.issues.length === 0 && stRes.selfCheck.msg.includes("LIVE SELF-CHECK OK"),
    "runSelfCheck returns ok:true with 0 issues: " + stRes.selfCheck.msg);

  const healthSb = createSandbox({
    fetch: url =>
      url === "/api/health"
        ? Promise.resolve({
          json: () => Promise.resolve({ ok: true, ready: false, engine: "kokoro-onnx:missing-model", cached_clips: 0 })
        })
        : Promise.reject(new Error("offline"))
  });
  await new Promise(r => setTimeout(r, 15));
  const vlabel = vm.runInContext("VOICE_STATE.label", healthSb);
  ok(vlabel === "Browser voice (local TTS unavailable)", "missing-model health sets browser fallback label (got " + JSON.stringify(vlabel) + ")");

  let pagesFetched = 0;
  const pagesSb = createSandbox({
    location: { hostname: "job4874.github.io", protocol: "https:", hash: "#/learn" },
    fetch: () => { pagesFetched++; return Promise.reject(new Error("should not fetch")); }
  });
  await new Promise(r => setTimeout(r, 15));
  ok(pagesFetched === 0 && vm.runInContext("VOICE_STATE.engine", pagesSb) === "browser",
    "GitHub Pages origin skips /api/health probe cleanly with zero fetches");

  async function runAudioRaceCase(shouldReject) {
    let settleTts, ttsSignal, browserSpoke = 0;
    const sb = createSandbox({
      fetch: (url, opts) => {
        if (url === "/api/health") {
          return Promise.resolve({ json: () => Promise.resolve({ ok: true, ready: true, engine: "kokoro-onnx" }) });
        }
        if (url === "/api/tts") {
          ttsSignal = opts && opts.signal;
          return new Promise((res, rej) => { settleTts = shouldReject ? rej : res; });
        }
        return Promise.reject(new Error("offline"));
      },
      extras: {
        AbortController,
        SpeechSynthesisUtterance: function (t) { this.text = t; },
        speechSynthesis: { cancel() { }, speak() { browserSpoke++; } }
      }
    });
    await new Promise(r => setTimeout(r, 10));
    sb.testVoice();
    sb.playWelcome();
    settleTts(shouldReject
      ? new Error("AbortError")
      : { ok: true, json: () => Promise.resolve({ url: "/tts/stale.wav", engine: "kokoro-onnx", cached: false }) });
    await new Promise(r => setTimeout(r, 10));
    return {
      src: vm.runInContext("audio.src", sb),
      gpuFail: vm.runInContext("AudioMan.gpuFail", sb),
      busy: vm.runInContext("AudioMan.busy", sb),
      aborted: Boolean(ttsSignal && ttsSignal.aborted),
      browserSpoke
    };
  }

  const raceResolved = await runAudioRaceCase(false);
  ok(raceResolved.aborted, "playWelcome aborts in-flight /api/tts request");
  ok(raceResolved.src === "audio/welcome.wav", "in-flight /api/tts resolution does not overwrite welcome.wav (got " + JSON.stringify(raceResolved.src) + ")");
  ok(raceResolved.gpuFail === 0 && !raceResolved.busy && raceResolved.browserSpoke === 0,
    "stale /api/tts resolution does not flip busy, gpuFail, or browser fallback");

  const raceRejected = await runAudioRaceCase(true);
  ok(raceRejected.src === "audio/welcome.wav" && raceRejected.gpuFail === 0 && !raceRejected.busy && raceRejected.browserSpoke === 0,
    "aborted /api/tts rejection does not overwrite welcome.wav, bump gpuFail, or trigger browser TTS");

  /* v6.1 ADHD ML, 13 Confusion Pairs, 2026 Reg S-P / SECURE 2.0, Metacognitive Calibration, XSS-safe Highlights & Genuine Voice Allocation */
  const v6Res = vm.runInContext(`(() => {
    const genTopics = new Set(GEN.map(g => g().topic));
    const has2026New = genTopics.has("Reg S-P breach notice") && genTopics.has("529-to-Roth IRA rollover") && genTopics.has("RMD excise penalty (SECURE 2.0)");
    const pairsValid = CONFUSION_PAIRS.length === 13 &&
      CONFUSION_PAIRS.every(p => p.a !== p.b && genTopics.has(p.a) && genTopics.has(p.b) && p.rule.length > 20);
    startContrastDrill("margin-pdt");
    const contrastAlt = quiz.length === 6 &&
      quiz[0].topic === "Reg T margin" && quiz[1].topic === "Pattern day trader" &&
      quiz[2].topic === "Reg T margin" && quiz[3].topic === "Pattern day trader" &&
      quiz[4].topic === "Reg T margin" && quiz[5].topic === "Pattern day trader" &&
      session.pair && session.pair.id === "margin-pdt";

    prefs.qualHighlight = true;
    const xssOut = highlightQualifiersHtml('<img src=x onerror=alert(1)> Which is NOT valid EXCEPT cash?');
    const xssSafe = !xssOut.includes("<img") && xssOut.includes("&lt;img") &&
      xssOut.includes('<mark class="qual">NOT</mark>') && xssOut.includes('<mark class="qual">EXCEPT</mark>');
    prefs.qualHighlight = false;
    const noQualOut = highlightQualifiersHtml("Which is NOT valid?");
    const qualToggleWorks = !noQualOut.includes("<mark");
    prefs.qualHighlight = true;

    store.xp = 420;
    fsrsUpdate("Reg T margin", true, 5000, Date.now() - 10 * DAY_MS);
    fsrsUpdate("Freeriding", true, 5000, Date.now());
    startDueReview(2);
    const dueFirst = quiz.length >= 2 && quiz[0].topic === "Reg T margin";

    const snap = exportProgressJson();
    store.xp = 0; store.t.fsrs = {};
    const impOk = importProgressJson(snap);
    const impBad = importProgressJson("{broken json");
    const impRestored = store.xp === 420 && Boolean(store.t.fsrs["Reg T margin"]);
    return { has2026New, pairsValid, contrastAlt, xssSafe, qualToggleWorks, dueFirst, impOk, impBad, impRestored };
  })()`, stSb);
  ok(v6Res.has2026New, "2026 Reg S-P 30-day breach notice + SECURE 2.0 529-to-Roth & RMD 25%/10% penalty generators present");
  ok(v6Res.pairsValid, "all 13 FINRA CONFUSION_PAIRS map cleanly to distinct GEN topics with rules");
  ok(v6Res.contrastAlt, "startContrastDrill builds 6 strictly alternating A-B-A-B-A-B micro-interleaved items");
  ok(v6Res.xssSafe && v6Res.qualToggleWorks, "highlightQualifiersHtml escapes XSS first and honors prefs.qualHighlight toggle");
  ok(v6Res.dueFirst, "startDueReview prioritizes lowest-retrievability FSRS topic first");
  ok(v6Res.impOk && !v6Res.impBad && v6Res.impRestored, "exportProgressJson / importProgressJson round-trips state and rejects malformed JSON");

  /* Genuine voice allocation: non-af_heart voice on localhost routes AudioMan.clip() via /api/tts */
  let postedVoice = null, ttsCalls = 0;
  const allocSb = createSandbox({
    stateful: true,
    fetch: (url, opts) => {
      if (url === "/api/health") {
        return Promise.resolve({ json: () => Promise.resolve({ ok: true, ready: true, engine: "kokoro-onnx" }) });
      }
      if (url === "/api/tts") {
        ttsCalls++;
        postedVoice = JSON.parse(opts.body).voice;
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ url: "/tts/michael123.wav", engine: "kokoro-onnx" }) });
      }
      return Promise.reject(new Error("offline"));
    },
    extras: { AbortController }
  });
  await new Promise(r => setTimeout(r, 15));
  vm.runInContext(`prefs.voice = "af_heart"; AudioMan.clip("audio/lessons/u0-l1-s1.mp3", "Hello world");`, allocSb);
  await new Promise(r => setTimeout(r, 10));
  const heartSrc = vm.runInContext("audio.src", allocSb);
  const heartCalls = ttsCalls;
  vm.runInContext(`prefs.voice = "am_michael"; AudioMan.clip("audio/lessons/u0-l1-s1.mp3", "Hello world in Michael voice");`, allocSb);
  await new Promise(r => setTimeout(r, 15));
  const michaelSrc = vm.runInContext("audio.src", allocSb);
  const michaelVoice = vm.runInContext("AudioMan.activeVoice", allocSb);
  vm.runInContext(`AudioMan.togglePause();`, allocSb);
  const pausedState = vm.runInContext("AudioMan.paused", allocSb);
  ok(heartSrc === "audio/lessons/u0-l1-s1.mp3" && heartCalls === 0, "af_heart plays saved Kokoro clip directly with 0 /api/tts calls");
  ok(postedVoice === "am_michael" && michaelVoice === "am_michael" && michaelSrc === "/tts/michael123.wav",
     "non-default Kokoro voice (am_michael) genuinely routes AudioMan.clip() through /api/tts");
  ok(pausedState === true, "AudioMan.togglePause() pauses active audio cleanly");

  console.log("app.test: " + pass + " passed, " + fail + " failed");
  if (fail) process.exit(1);
})();
