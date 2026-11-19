/* app.test.js - content, grader, exam and onboarding checks without a browser. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "static", "index.html"), "utf8");
const js = html.match(/<script>([\s\S]*)<\/script>/)[1];

function makeEl(id) {
  const el = {
    id, textContent: "", innerHTML: "", className: "", checked: true, value: "af_heart",
    disabled: false, style: {}, dataset: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {},
    appendChild() {}, querySelectorAll() { return []; }, remove() {}, focus() {},
    play() { return Promise.resolve(); }, pause() {}
  };
  return el;
}
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
  speechSynthesis: { cancel() {}, speak() {} },
  fetch: () => Promise.reject(new Error("offline")),
  alert() {}, setInterval() { return 0; }, clearInterval() {}, setTimeout() { return 0; },
  clearTimeout() {}, matchMedia: () => ({ matches: false }),
  Date, Math, JSON, Number, Object, Array, String, RegExp, parseInt, parseFloat, isNaN
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(js, sandbox, { filename: "index.js" });

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
  const exams = [];
  for (let i = 0; i < 5; i++) {
    const ex = buildExam(75), c = { 1: 0, 2: 0, 3: 0, 4: 0 };
    ex.forEach(q => c[q.sec]++);
    exams.push({ n: ex.length, unique: new Set(ex.map(q => q.text)).size, c });
  }
  const topics = [...new Set(GEN.map(g => g().topic))];
  const maps = {
    unit: topics.filter(t => !(t in UNIT_BY_TOPIC)),
    diff: topics.filter(t => !(t in DIFF_BY_TOPIC))
  };
  const model = SHORT.map(s => gradeShort(prepareShort(s), s.model).verdict);
  const empty = SHORT.map(s => gradeShort(prepareShort(s), "").verdict);
  const swapped = gradeShort(prepareShort(SHORT[4]),
    "Initial margin is 25% set by FINRA and maintenance is 50% set by the Federal Reserve.");
  const bare = gradeShort(prepareShort(SHORT[4]), "50% and 25%");
  const role = gradeShort(prepareShort(SHORT[4]),
    "Initial margin is 50% set by the Federal Reserve and maintenance is 25% set by FINRA.");
  return { gen: GEN.length, bad, exams, maps, model, empty, swapped, bare, role,
           zero: typeof startZero, placement: typeof startPlacement };
})()`, sandbox);

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; } else { fail++; console.log("FAIL: " + name); }
}
ok(result.gen >= 83, "generator count >= 83 (got " + result.gen + ")");
ok(result.bad.length === 0, "all generators structurally valid: " + JSON.stringify(result.bad.slice(0, 5)));
ok(result.exams.every(e => e.n === 75), "exam length 75");
ok(result.exams.every(e => e.unique === 75), "exam has 75 unique stems");
ok(result.exams.every(e => e.c[1] === 12 && e.c[2] === 33 && e.c[3] === 23 && e.c[4] === 7), "exam section mix 12/33/23/7");
ok(result.maps.unit.length === 0, "every topic has a unit map: " + JSON.stringify(result.maps.unit));
ok(result.maps.diff.length === 0, "every topic has a difficulty map: " + JSON.stringify(result.maps.diff));
ok(result.model.every(v => v === "full"), "all 12 model short answers full credit");
ok(result.empty.every(v => v === "wrong"), "all 12 empty short answers zero credit");
ok(result.swapped.verdict === "wrong", "swapped Reg T regulators score zero (got " + result.swapped.verdict + ")");
ok(result.bare.verdict === "wrong", "bare numbers without regulators score zero (got " + result.bare.verdict + ")");
ok(result.role.verdict === "full", "correct role-bound Reg T answer is full credit");
ok(result.zero === "function", "zero-to-first-trade primer exists");
ok(result.placement === "function", "placement diagnostic exists");
ok(!html.includes("am_fenrir"), "invalid voice option removed");
ok(html.includes("ZERO → FIRST TRADE"), "zero path is visible in the app");

console.log("app.test: " + pass + " passed, " + fail + " failed");
if (fail) process.exit(1);
