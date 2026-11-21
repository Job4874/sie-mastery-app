/* ML verification harness for the SIE Mastery v6 teacher model.
 * Grounded in: Corbett & Anderson (1995) BKT; pyBKT (CAHLR) slip/guess caps 0.3;
 * Elo rating; FSRS-DSR spaced-repetition memory model (Difficulty, Stability, Retrievability);
 * and recursive ADHD error-pattern recognition + confusion-pair micro-interleaving.
 * Loads the real split JS files via tests/load_app.js and property-tests them.
 */
const vm = require("vm");
const { createSandbox } = require("./load_app");

const ctx = createSandbox();

let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log("PASS:", m); } else { fail++; console.log("FAIL:", m); } }
function near(a, b, eps = 1e-9) { return Math.abs(a - b) <= eps; }

// ---------- reference BKT (Corbett & Anderson 1995) ----------
function refBKTPosterior(L, correct, slip, guess) {
  return correct
    ? (L * (1 - slip)) / (L * (1 - slip) + (1 - L) * guess)
    : (L * slip) / (L * slip + (1 - L) * (1 - guess));
}
function refBKTNext(L, correct, slip, guess, T) {
  const post = refBKTPosterior(L, correct, slip, guess);
  return Math.min(0.98, post + (1 - post) * T);
}

const SLIP = 0.10, GUESS = 0.25, T = 0.12;

function freshStore() {
  return vm.runInContext(`(() => {
    store = sanitizeStoreObject({
      xp:0, streak:0, seen:0, sec:{}, missed:{}, lp:{},
      t:{ units:{}, topicMiss:{}, openGaps:{}, done:{}, theta:1000,
         badges:[], gapsClosed:0, placed:true, fsrs:{}, patterns:{} },
      zero:{done:true}, day:null
    });
    window._qt=[]; return true;
  })()`, ctx);
}

// ---------- 1. Corbett-Anderson BKT invariants ----------
freshStore();
let mathOk = true;
for (const L of [0.15, 0.3, 0.5, 0.8, 0.95]) {
  for (const correct of [true, false]) {
    vm.runInContext(`store.t.units[1]={a:0,c:0,time:0,bkt:${L},fastWrong:0,slowRight:0};`, ctx);
    vm.runInContext(`recordPerf({unit:1,diff:2}, ${correct}, 10000);`, ctx);
    const got = vm.runInContext(`store.t.units[1].bkt`, ctx);
    const want = refBKTNext(L, correct, SLIP, GUESS, T);
    if (!near(got, want)) {
      mathOk = false;
      console.log("  mismatch L=", L, "correct=", correct, "got=", got, "want=", want);
    }
  }
}
ok(mathOk, "BKT posterior+transition matches Corbett-Anderson reference across 10 states");

freshStore();
let mono = true;
for (let L = 0.15; L < 0.98; L += 0.1) {
  const afterRight = refBKTNext(L, true, SLIP, GUESS, T);
  const afterWrong = refBKTNext(L, false, SLIP, GUESS, T);
  if (!(afterRight > L)) mono = false;
  if (!(afterWrong < L)) mono = false;
}
ok(mono, "BKT: correct raises mastery, wrong lowers it (monotonic, all states)");

freshStore();
let bounded = true;
for (let i = 0; i < 200; i++) {
  vm.runInContext(`recordPerf({unit:2,diff:2}, true, 10000);`, ctx);
  const b = vm.runInContext(`store.t.units[2].bkt`, ctx);
  if (b < 0 || b > 0.98 || !isFinite(b)) bounded = false;
}
ok(bounded, "BKT: mastery stays bounded [0,0.98] over 200 correct answers");
const finalBkt = vm.runInContext(`store.t.units[2].bkt`, ctx);
ok(finalBkt > 0.95, "BKT: converges toward mastery ceiling after many corrects (got " + finalBkt.toFixed(4) + ")");

freshStore();
vm.runInContext(`store.t.units[3]={a:0,c:0,time:0,bkt:0.90,fastWrong:0,slowRight:0};`, ctx);
vm.runInContext(`recordPerf({unit:3,diff:2}, false, 10000);`, ctx);
const afterOneWrong = vm.runInContext(`store.t.units[3].bkt`, ctx);
ok(afterOneWrong > 0.5, "BKT: one slip on mastered skill does not collapse mastery (got " + afterOneWrong.toFixed(4) + ")");

// ---------- 2. Elo invariants ----------
freshStore();
let eloBounded = true;
for (let i = 0; i < 500; i++) {
  vm.runInContext(`recordPerf({unit:1,diff:${1 + (i % 3)}}, ${i % 2 === 0}, 10000);`, ctx);
  const th = vm.runInContext(`store.t.theta`, ctx);
  if (th < 600 || th > 1600 || !isFinite(th)) eloBounded = false;
}
ok(eloBounded, "Elo: theta stays bounded [600,1600] over 500 updates");
freshStore();
const theta0 = vm.runInContext(`store.t.theta`, ctx);
vm.runInContext(`recordPerf({unit:1,diff:3}, true, 10000);`, ctx);
const thetaWin = vm.runInContext(`store.t.theta`, ctx);
ok(thetaWin > theta0, "Elo: beating a hard item raises theta (" + theta0 + "->" + thetaWin + ")");
freshStore();
vm.runInContext(`recordPerf({unit:1,diff:3}, false, 10000);`, ctx);
const thetaLoss = vm.runInContext(`store.t.theta`, ctx);
ok(thetaLoss < theta0, "Elo: missing a hard item lowers theta (" + theta0 + "->" + thetaLoss + ")");

// ---------- 3. Speed & cold-start diagnosis ----------
freshStore();
vm.runInContext(`recordPerf({unit:4,diff:2}, false, 5000);`, ctx);
ok(vm.runInContext(`store.t.units[4].fastWrong`, ctx) === 1, "Speed: fast wrong increments fastWrong");
vm.runInContext(`recordPerf({unit:4,diff:2}, true, 30000);`, ctx);
ok(vm.runInContext(`store.t.units[4].slowRight`, ctx) === 1, "Speed: slow correct increments slowRight");

freshStore();
ok(vm.runInContext(`diagnose(5).includes("Not enough")`, ctx), "Diagnose: cold start requires >=3 answers");

freshStore();
vm.runInContext(`store.t.units[1]={a:10,c:0,time:0,bkt:0.15,fastWrong:0,slowRight:0};
 store.t.units[2]={a:10,c:10,time:0,bkt:0.95,fastWrong:0,slowRight:0};`, ctx);
const lowMasteryShare = vm.runInContext(`(() => {
  let u1=0; for(let k=0;k<40;k++){ const s=adaptiveSet(20,false);
    s.forEach(q=>{ if(q.unit===1)u1++; }); }
  return u1/800;
})()`, ctx);
ok(lowMasteryShare > 0.10, "Adaptive: weak unit oversampled in question selection (share=" + lowMasteryShare.toFixed(3) + ")");

// ---------- 4. FSRS-DSR spaced-repetition invariants ----------
const fsrsId = vm.runInContext(`(() => {
  const sVals = [0.5, 1, 5, 30, 180];
  const exact90 = sVals.every(s => Math.abs(fsrsRetrievability(s, s) - 0.9) < 1e-9);
  const exact100 = sVals.every(s => Math.abs(fsrsRetrievability(0, s) - 1.0) < 1e-9);
  const decay = fsrsRetrievability(1, 5) > fsrsRetrievability(5, 5) && fsrsRetrievability(5, 5) > fsrsRetrievability(20, 5);
  const inv = sVals.every(s => Math.abs(fsrsRetrievability(fsrsNextInterval(s, 0.90), s) - 0.90) < 1e-9);
  return { exact90, exact100, decay, inv };
})()`, ctx);
ok(fsrsId.exact90 && fsrsId.exact100, "FSRS-DSR: exact identities R(S,S)=0.90 and R(0,S)=1.0 across stability scales");
ok(fsrsId.decay && fsrsId.inv, "FSRS-DSR: monotonic forgetting curve and exact inverse optimal interval I(S, 0.90)");

freshStore();
const fsrsDyn = vm.runInContext(`(() => {
  const t0 = 1700000000000;
  const rFast = fsrsUpdate("Reg T margin", true, 4000, t0);
  const rSlow = fsrsUpdate("Freeriding", true, 30000, t0);
  /* Desirable difficulty: reviewing after 4 days (lower R) vs immediate review (R=1.0) */
  store.t.fsrs["CMO tranches"] = { d: 5, s: 2.0, reps: 2, lapses: 0, last: t0, due: t0 + 2 * DAY_MS };
  store.t.fsrs["Yield ordering"] = { d: 5, s: 2.0, reps: 2, lapses: 0, last: t0, due: t0 + 2 * DAY_MS };
  const sImmediate = fsrsUpdate("CMO tranches", true, 9000, t0).state.s;
  const sSpaced = fsrsUpdate("Yield ordering", true, 9000, t0 + 4 * DAY_MS).state.s;
  /* Lapse contraction */
  const preS = store.t.fsrs["Yield ordering"].s;
  const preD = store.t.fsrs["Yield ordering"].d;
  const lapsed = fsrsUpdate("Yield ordering", false, 9000, t0 + 5 * DAY_MS).state;
  return {
    fastGTslow: rFast.state.s > rSlow.state.s,
    spacedGTimm: sSpaced > sImmediate,
    sImmediate, sSpaced,
    lapseContracted: lapsed.s < preS * 0.6 && lapsed.lapses === 1 && lapsed.d > preD && lapsed.due <= t0 + 5 * DAY_MS
  };
})()`, ctx);
ok(fsrsDyn.fastGTslow, "FSRS-DSR: confident fast recall yields higher initial stability than slow recall");
ok(fsrsDyn.spacedGTimm, "FSRS-DSR: desirable-difficulty spaced recall grows stability more than immediate repeat (" + fsrsDyn.sImmediate + " -> " + fsrsDyn.sSpaced + ")");
ok(fsrsDyn.lapseContracted, "FSRS-DSR: lapse contracts stability, increments lapses, increases difficulty, and marks immediately due");

// ---------- 5. Recursive ADHD Error-Pattern Classifier & Confusion Pairs ----------
freshStore();
const adhdRes = vm.runInContext(`(() => {
  /* Simulate impulsive fast miss + negative-qualifier miss + post-error cascade on a confusion pair */
  recordPerf({ unit: 6, diff: 2, topic: "Reg T margin", text: "Which of the following is NOT true under Reg T?" }, false, 3200);
  recordPerf({ unit: 6, diff: 2, topic: "Pattern day trader", text: "All of the following apply EXCEPT which rule?" }, false, 4100);
  recordPerf({ unit: 2, diff: 2, topic: "CMO tranches", text: "Which tranche contracts first when rates fall?" }, false, 18500);
  recordPerf({ unit: 2, diff: 2, topic: "CMO tranches", text: "Which tranche absorbs extension risk?" }, true, 28000);
  const pat = store.t.patterns;
  const prof = adhdCognitiveProfile();
  const topPair = topConfusionPairs()[0];
  const path = acceleratedPath();
  return { pat, prof, topPair, path };
})()`, ctx);
ok(adhdRes.pat.impulsiveMiss === 2 && adhdRes.pat.qualifierTrap === 2 && adhdRes.pat.postErrorCascade === 1,
   "ADHD classifier: separates impulsive (<6s), NOT/EXCEPT qualifier traps, and post-error cascades");
ok(adhdRes.pat.conceptGap === 1 && adhdRes.pat.speedBottleneck === 1,
   "ADHD classifier: tracks slow deep concept gaps (>=15s) and slow corrects (>25s)");
ok(adhdRes.prof.ready && adhdRes.prof.headline.toLowerCase().includes("qualifier") || adhdRes.prof.headline.toLowerCase().includes("cascade") || adhdRes.prof.headline.toLowerCase().includes("impulsive"),
   "ADHD profile: diagnoses dominant failure pattern (" + adhdRes.prof.headline + ")");
ok(adhdRes.topPair.id === "margin-pdt" && adhdRes.topPair.misses === 2,
   "Confusion pair telemetry: aggregates Reg T + PDT misses into top pair (" + adhdRes.topPair.id + ", misses=" + adhdRes.topPair.misses + ")");
ok(adhdRes.path.length === 3 && adhdRes.path.some(s => s.action === "due") && adhdRes.path.some(s => s.action === "contrast" && s.pairId === "margin-pdt"),
   "Accelerated ADHD path: dynamically prescribes FSRS review + top confusion pair contrast drill");

console.log("\n=== ML VERIFICATION: " + pass + " passed, " + fail + " failed ===");
process.exit(fail ? 1 : 0);
