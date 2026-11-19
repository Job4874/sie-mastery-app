/* app.test.js - content, grader, exam and onboarding checks without a browser. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "static", "index.html"), "utf8");
const js = html.match(/<script>([\s\S]*)<\/script>/)[1];

function makeEl(id) {
  return {
    id, textContent: "", innerHTML: "", className: "", checked: true, value: "af_heart",
    disabled: false, style: {}, dataset: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {},
    appendChild() {}, querySelectorAll() { return []; }, remove() {}, focus() {},
    play() { return Promise.resolve(); }, pause() {}
  };
}

function createAppSandbox(fetchImpl, extras) {
  const elements = new Map();
  const document = {
    documentElement: { setAttribute() {}, getAttribute() { return "dark"; } },
    getElementById(id) { if (!elements.has(id)) elements.set(id, makeEl(id)); return elements.get(id); },
    querySelectorAll() { return []; }, createElement(tag) { return makeEl(tag); },
    addEventListener() {}, body: makeEl("body")
  };
  const sandbox = {
    console, document, localStorage: { getItem() { return null; }, setItem() {} },
    Audio: function () { return makeEl("audio"); },
    SpeechSynthesisUtterance: function (t) { this.text = t; },
    speechSynthesis: { cancel() {}, speak() {} },
    fetch: fetchImpl || (() => Promise.reject(new Error("offline"))),
    alert() {}, setInterval() { return 0; }, clearInterval() {}, setTimeout() { return 0; },
    clearTimeout() {}, matchMedia: () => ({ matches: false }),
    Date, Math, JSON, Number, Object, Array, String, RegExp, parseInt, parseFloat, isNaN,
    ...extras
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(js, sandbox, { filename: "index.js" });
  return sandbox;
}

function createStatefulSandbox(fetchImpl) {
  const elements = new Map();
  const storage = new Map();
  const attrs = new Map([["data-theme", "dark"], ["data-adhd", "off"]]);
  const makeStatefulEl = id => {
    const classes = new Set();
    const elAttrs = new Map();
    const el = makeEl(id);
    el.classList = {
      add: (...cs) => cs.forEach(c => classes.add(c)),
      remove: (...cs) => cs.forEach(c => classes.delete(c)),
      contains: c => classes.has(c)
    };
    el.setAttribute = (k, v) => elAttrs.set(k, String(v));
    el.getAttribute = k => (elAttrs.has(k) ? elAttrs.get(k) : null);
    return el;
  };
  const document = {
    documentElement: {
      setAttribute: (k, v) => attrs.set(k, String(v)),
      getAttribute: k => (attrs.has(k) ? attrs.get(k) : null)
    },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, makeStatefulEl(id));
      return elements.get(id);
    },
    querySelectorAll() { return []; },
    createElement(tag) { return makeStatefulEl(tag); },
    addEventListener() {},
    body: makeStatefulEl("body")
  };
  const localStorage = {
    getItem: k => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: k => storage.delete(k)
  };
  const sandbox = {
    console, document, localStorage,
    Audio: function () { return makeStatefulEl("audio"); },
    SpeechSynthesisUtterance: function (t) { this.text = t; },
    speechSynthesis: { cancel() {}, speak() {} },
    fetch: fetchImpl || (() => Promise.reject(new Error("offline"))),
    alert() {}, setInterval() { return 0; }, clearInterval() {}, setTimeout() { return 0; },
    clearTimeout() {}, matchMedia: () => ({ matches: false }),
    Date, Math, JSON, Number, Object, Array, String, RegExp, parseInt, parseFloat, isNaN
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(js, sandbox, { filename: "index.js" });
  return sandbox;
}

const sandbox = createAppSandbox();

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
  const commBoundary = gradeShort(prepareShort(SHORT[6]), "Retail communication approved by principal before use for 250 retail investors in 300 days.");
  return { gen: GEN.length, bad, splitBad, marginBad, placements, exams, exam150Valid, secAligned, maps, model, empty,
           swapped, swappedBut, shortRule, bare, role, negCmo, negSipc, commBoundary,
           norm1000k: normNums("$1,000k"), zero: typeof startZero, placement: typeof startPlacement };
})()`, sandbox);

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; } else { fail++; console.log("FAIL: " + name); }
}

(async () => {
  ok(result.gen >= 89, "generator count >= 89 (got " + result.gen + ")");
  ok(result.bad.length === 0, "all generators structurally valid: " + JSON.stringify(result.bad.slice(0, 5)));
  ok(result.splitBad.length === 0, "GEN[23] stock splits produce integer share counts across 200 rolls");
  ok(result.marginBad.length === 0, "GEN[4] Reg T margin avoids $2k collision (amt >= $6k, call >= $3k across 200 rolls)");
  ok(result.placements.length === 20 && result.placements.every(p => p.n === 10 && p.unique === 10 && p.all8),
     "startPlacement yields 10 unique stems covering all 8 units across 20 runs");
  ok(result.exams.length === 20 && result.exams.every(e => e.n === 75), "exam length 75 across 20 runs");
  ok(result.exams.every(e => e.unique === 75), "exam has 75 unique stems across 20 runs");
  ok(result.exams.every(e => e.c[1] === 12 && e.c[2] === 33 && e.c[3] === 23 && e.c[4] === 7), "exam section mix 12/33/23/7 across 20 runs");
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
  ok(result.zero === "function", "zero-to-first-trade primer exists");
  ok(result.placement === "function", "placement diagnostic exists");
  ok(!html.includes("am_fenrir"), "invalid voice option removed");
  ok(html.includes("ZERO → FIRST TRADE"), "zero path is visible in the app");
  ok(!html.includes("Rule 2210/Exchange Act"), "Reg BI does not cite FINRA Rule 2210");
  ok(!html.includes("Rule 3230"), "gift limit does not cite FINRA Rule 3230");
  ok(html.includes("Rule 3220"), "gift limit cites FINRA Rule 3220");
  ok(html.includes("15l-1"), "Reg BI cites Exchange Act Rule 15l-1");
  ok(!html.includes("/[]/g"), "dead /[]/g regex removed");
  ok(!html.includes("1%/week"), "Rule 144 states 1% per 3 months rather than 1%/week");
  ok(html.includes("Rule 5220"), "backing away cites FINRA Rule 5220");
  ok(html.includes("Rule 3270"), "OBA cites FINRA Rule 3270");
  ok(html.includes("2150(c)"), "sharing in accounts cites FINRA Rule 2150(c)");
  ok(html.includes("26-05"), "gift limit updates reference FINRA Notice 26-05 ($300)");
  ok(html.includes("age 46"), "ABLE eligibility reflects SECURE 2.0 age 46 update");
  ok(html.includes("REPORTABLE EVENTS"), "REPORTABLE EVENTS heading typo fixed");

  const stSb = createStatefulSandbox(url =>
    url === "/api/health"
      ? Promise.resolve({ json: () => Promise.resolve({ ok: true, ready: true, engine: "kokoro-onnx" }) })
      : Promise.reject(new Error("offline"))
  );
  const stRes = vm.runInContext(`(() => {
    const adhd0 = isAdhd();
    toggleAdhd();
    const adhd1 = isAdhd();
    const chunkHtml = renderLessonBody("First sentence explains accounts. Second sentence covers settlement. Third covers margin. Fourth wraps up orders.");
    toggleAdhd();
    const adhd2 = isAdhd();
    const plainHtml = renderLessonBody("First sentence explains accounts. Second sentence covers settlement.");

    startPlacement();
    const qiBefore = qi;
    nextQ();
    const qiBlocked = qi;
    answered = true;
    nextQ();
    const qiAfter = qi;
    window.event = { detail: 2 };
    answer(0, null);
    window.event = undefined;
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

    const selfCheck = runSelfCheck();
    return { adhd0, adhd1, adhd2, chunkHtml, plainHtml, qiBefore, qiBlocked, qiAfter, dblBlockedAnswered,
             ssnBlockedAnswered, shortTimeoutState, cleanedKeys: Object.keys(cleaned), selfCheck };
  })()`, stSb);
  await new Promise(r => setTimeout(r, 15));
  const selfCheckOut = stSb.document.getElementById("selfCheckOut").textContent;
  ok(stRes.adhd0 === false && stRes.adhd1 === true && stRes.adhd2 === false, "toggleAdhd flips isAdhd state cleanly");
  ok(stRes.chunkHtml.includes('class="chunk-list"') && stRes.chunkHtml.includes('class="chunk-item"') &&
     stRes.plainHtml.startsWith("<p>"), "renderLessonBody switches between <p> and .chunk-list micro-chunks");
  ok(stRes.qiBefore === 0 && stRes.qiBlocked === 0 && stRes.qiAfter === 1, "nextQ blocks advance while !answered");
  ok(stRes.dblBlockedAnswered === false, "answer ignores accidental multi-click bleed-through (event.detail > 1)");
  ok(stRes.ssnBlockedAnswered === false, "answerShort blocks and redacts SSN-only submission");
  ok(stRes.shortTimeoutState.answered && stRes.shortTimeoutState.disabled && stRes.shortTimeoutState.missedType === "short",
     "timeoutShort marks answered, disables shortAns, and records short miss");
  ok(stRes.cleanedKeys.length === 1 && stRes.cleanedKeys[0] === "goodMc", "cleanMissedMap drops incomplete short and invalid sec entries");
  ok(stRes.selfCheck.ok && stRes.selfCheck.issues.length === 0 && selfCheckOut.includes("LIVE SELF-CHECK OK"),
     "runSelfCheck returns ok:true with 0 issues and populates #selfCheckOut");

  const healthSandbox = createAppSandbox(url =>
    url === "/api/health"
      ? Promise.resolve({
          json: () => Promise.resolve({ ok: true, ready: false, engine: "kokoro-onnx:missing-model", cached_clips: 0 })
        })
      : Promise.reject(new Error("offline"))
  );
  await new Promise(r => setTimeout(r, 10));
  const pill = healthSandbox.document.getElementById("gpuPill").textContent;
  ok(pill === "Voice: browser (local TTS unavailable)", "missing-model health sets browser fallback pill (got " + JSON.stringify(pill) + ")");

  async function runAudioRaceCase(shouldReject) {
    let settleTts, ttsSignal, browserSpoke = 0;
    const sb = createAppSandbox((url, opts) => {
      if (url === "/api/tts") {
        ttsSignal = opts && opts.signal;
        return new Promise((res, rej) => { settleTts = shouldReject ? rej : res; });
      }
      return Promise.reject(new Error("offline"));
    }, {
      AbortController,
      SpeechSynthesisUtterance: function (t) { this.text = t; },
      speechSynthesis: { cancel() {}, speak() { browserSpoke++; } }
    });
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

  console.log("app.test: " + pass + " passed, " + fail + " failed");
  if (fail) process.exit(1);
})();
