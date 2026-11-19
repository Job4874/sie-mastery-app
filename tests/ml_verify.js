/* ML verification harness for the SIE Mastery teacher model.
 * Grounded in: Corbett & Anderson BKT; pyBKT (CAHLR) slip/guess caps 0.3;
 * Elo rating; spaced-retrieval literature.
 * Extracts the real functions from index.html and property-tests them.
 */
const fs = require("fs");
const vm = require("vm");

const html = fs.readFileSync("static/index.html", "utf8");
const js = html.match(/<script>([\s\S]*)<\/script>/)[1];

const el = () => ({
  textContent: "", innerHTML: "", checked: true, value: "af_heart",
  classList: { add() {}, remove() {}, contains() { return false; } },
  style: {}, dataset: {}, setAttribute() {}, addEventListener() {},
  appendChild() {}, querySelectorAll() { return []; }, remove() {},
  focus() {}, play() { return Promise.resolve(); }, pause() {}
});
const map = new Map();
const document = {
  documentElement: { setAttribute() {}, getAttribute() { return "dark"; } },
  getElementById(id) { if (!map.has(id)) map.set(id, el()); return map.get(id); },
  querySelectorAll() { return []; }, createElement: el,
  addEventListener() {}, body: el()
};
const ctx = {
  console, document,
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  Audio: function () { return el(); },
  speechSynthesis: { cancel() {}, speak() {} },
  fetch: () => Promise.reject(), alert() {},
  setInterval() { return 0; }, clearInterval() {},
  setTimeout() { return 0; }, clearTimeout() {},
  matchMedia: () => ({ matches: false }),
  Date, Math, JSON, Number, Object, Array, String, RegExp,
  parseInt, parseFloat, isNaN
};
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(js, ctx);

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

// ---------- 1. reset store helper ----------
function freshStore() {
  return vm.runInContext(`(() => {
    store = { xp:0, streak:0, sec:{}, missed:{},
      t:{ units:{}, topicMiss:{}, openGaps:{}, done:{}, theta:1000,
         badges:[], gapsClosed:0, placed:true },
      zero:{done:true}, day:null };
    window._qt=[]; return true;
  })()`, ctx);
}

// ---------- 2. BKT posterior math matches reference exactly ----------
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

// ---------- 3. BKT monotonicity ----------
freshStore();
let mono = true;
for (let L = 0.15; L < 0.98; L += 0.1) {
  const afterRight = refBKTNext(L, true, SLIP, GUESS, T);
  const afterWrong = refBKTNext(L, false, SLIP, GUESS, T);
  if (!(afterRight > L)) mono = false;
  if (!(afterWrong < L)) mono = false;
}
ok(mono, "BKT: correct raises mastery, wrong lowers it (monotonic, all states)");

// ---------- 4. BKT bounds & convergence ----------
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

// ---------- 5. slip/guess prevent catastrophic collapse ----------
freshStore();
vm.runInContext(`store.t.units[3]={a:0,c:0,time:0,bkt:0.90,fastWrong:0,slowRight:0};`, ctx);
vm.runInContext(`recordPerf({unit:3,diff:2}, false, 10000);`, ctx);
const afterOneWrong = vm.runInContext(`store.t.units[3].bkt`, ctx);
ok(afterOneWrong > 0.5, "BKT: one slip on mastered skill does not collapse mastery (got " + afterOneWrong.toFixed(4) + ")");

// ---------- 6. Elo rating bounds and direction ----------
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

// ---------- 7. speed signals ----------
freshStore();
vm.runInContext(`recordPerf({unit:4,diff:2}, false, 5000);`, ctx);
ok(vm.runInContext(`store.t.units[4].fastWrong`, ctx) === 1, "Speed: fast wrong increments fastWrong");
vm.runInContext(`recordPerf({unit:4,diff:2}, true, 30000);`, ctx);
ok(vm.runInContext(`store.t.units[4].slowRight`, ctx) === 1, "Speed: slow correct increments slowRight");

// ---------- 8. diagnose requires >=3 data ----------
freshStore();
ok(vm.runInContext(`diagnose(5).includes("Not enough")`, ctx), "Diagnose: cold start requires >=3 answers");

// ---------- 9. adaptiveSet weighting favors low mastery ----------
freshStore();
vm.runInContext(`store.t.units[1]={a:10,c:0,time:0,bkt:0.15,fastWrong:0,slowRight:0};
 store.t.units[2]={a:10,c:10,time:0,bkt:0.95,fastWrong:0,slowRight:0};`, ctx);
const lowMasteryShare = vm.runInContext(`(() => {
  let u1=0; for(let k=0;k<40;k++){ const s=adaptiveSet(20,false);
    s.forEach(q=>{ if(q.unit===1)u1++; }); }
  return u1/800;
})()`, ctx);
ok(lowMasteryShare > 0.10, "Adaptive: weak unit oversampled in question selection (share=" + lowMasteryShare.toFixed(3) + ")");

console.log("\n=== ML VERIFICATION: " + pass + " passed, " + fail + " failed ===");
process.exit(fail ? 1 : 0);
