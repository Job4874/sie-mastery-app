/* tests/bank.js — runs the real question bank outside the browser.
 * Validates every generator across many rolls, section/unit coverage, exam mix,
 * the six Mastery Path lessons, and the short-response rubric.
 * Run: node tests/bank.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'static', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name) {
  if (cond) pass++;
  else { fail++; failures.push(name); }
}

function sliceDecl(name, endMarker) {
  const i = script.indexOf('const ' + name + '=');
  if (i < 0) throw new Error('missing ' + name);
  const j = endMarker ? script.indexOf(endMarker, i) : -1;
  if (j < 0) throw new Error('missing end marker for ' + name);
  return script.slice(i, j);
}
function evalObject(src) {
  return Function('return (' + src + ')')();
}
function evalDecl(name, src) {
  return Function(src + '\n; return ' + name + ';')();
}

/* ---------- question bank ---------- */
const bankSrc = sliceDecl('GEN', 'const UNIT_BY_TOPIC');
const UNIT = evalObject(script.match(/const UNIT_BY_TOPIC\s*=\s*(\{[\s\S]*?\});/)[1]);
const DIFF = evalObject(script.match(/const DIFF_BY_TOPIC\s*=\s*(\{[\s\S]*?\});/)[1]);
const GEN = Function('Q', 'R', 'pick', 'money', 'NAMES', bankSrc + '; return GEN;')(
  (sec, topic, text, choices, answer, explain, rule) => ({ sec, topic, text, choices, answer, explain, rule }),
  (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  a => a[Math.floor(Math.random() * a.length)],
  n => '$' + Number(n).toLocaleString('en-US'),
  ['Maya', 'Jordan', 'Priya', 'Carlos', 'Elena', 'Tom', 'Nadia', 'Chris']
);

ok(GEN.length >= 80, `at least 80 generators (got ${GEN.length})`);

const topics = new Set();
const secCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
const defects = [];
for (let i = 0; i < GEN.length; i++) {
  for (let run = 0; run < 150; run++) {
    let q;
    try { q = GEN[i](); } catch (e) { defects.push(`GEN[${i}] threw: ${e.message}`); break; }
    topics.add(q.topic);
    if (![1, 2, 3, 4].includes(q.sec)) defects.push(`GEN[${i}] invalid section ${q.sec}`);
    if (!q.topic || !q.text) defects.push(`GEN[${i}] empty topic/text`);
    if (!Array.isArray(q.choices) || q.choices.length !== 4) defects.push(`GEN[${i}] choices!=4`);
    if (new Set(q.choices).size !== 4) defects.push(`GEN[${i}] duplicate choices: ${q.choices.join('|')}`);
    if (q.choices.some(c => typeof c !== 'string' || !c.trim())) defects.push(`GEN[${i}] blank choice`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) defects.push(`GEN[${i}] answer out of range`);
    if (!q.explain || !q.rule) defects.push(`GEN[${i}] missing explain/rule`);
    if (/NaN|undefined|null/.test(q.text + q.choices.join('') + q.explain)) defects.push(`GEN[${i}] NaN/undefined in output`);
    if (!UNIT[q.topic]) defects.push(`topic not mapped to a unit: ${q.topic}`);
    if (!DIFF[q.topic]) defects.push(`topic not mapped to a difficulty: ${q.topic}`);
  }
  const q = GEN[i]();
  secCount[q.sec]++;
}
ok(defects.length === 0, `all ${GEN.length} generators x150 rolls clean (${defects.length} defects)`);
if (defects.length) failures.push(...defects.slice(0, 12));

for (const s of [1, 2, 3, 4]) {
  ok(secCount[s] > 0, `section ${s} has generators (${secCount[s]})`);
}
ok(secCount[2] >= 33, `section 2 pool covers 33 exam items (${secCount[2]})`);
ok(secCount[1] >= 12, `section 1 pool covers 12 exam items (${secCount[1]})`);
ok(secCount[3] >= 23, `section 3 pool covers 23 exam items (${secCount[3]})`);
ok(secCount[4] >= 7, `section 4 pool covers 7 exam items (${secCount[4]})`);
ok(topics.size === GEN.length, `one unique topic per generator (${topics.size}/${GEN.length})`);

const unitCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
for (const t of topics) unitCounts[UNIT[t]]++;
for (let u = 1; u <= 8; u++) ok(unitCounts[u] >= 5, `unit ${u} has >=5 topics (${unitCounts[u]})`);

/* ---------- practice exam construction ---------- */
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const buildExam = Function('GEN', 'UNIT_BY_TOPIC', 'DIFF_BY_TOPIC', 'shuffle',
  fnSrc('prepare') + '\n' + fnSrc('buildExam') +
  '\nreturn buildExam;')(GEN, UNIT, DIFF, shuffle);

let examGood = 0, examMix = [], examDup = 0;
for (let t = 0; t < 40; t++) {
  const ex = buildExam(75);
  if (ex.length !== 75) examMix.push(`length ${ex.length}`);
  const seen = new Set(ex.map(q => q.topic));
  if (seen.size !== 75) examDup++;
  const c = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const q of ex) c[q.sec]++;
  if (c[1] !== 12 || c[2] !== 33 || c[3] !== 23 || c[4] !== 7)
    examMix.push(`${c[1]}/${c[2]}/${c[3]}/${c[4]}`);
  if (ex.every(q => q.unit >= 1 && q.unit <= 8 && q.diff >= 1 && q.diff <= 3 &&
      Number.isInteger(q.answer) && q.choices.length === 4)) examGood++;
}
ok(examMix.length === 0, `buildExam(75) section mix is 12/33/23/7 every run ${examMix[0] || ''}`);
ok(examDup === 0, `buildExam(75) never repeats a topic (${examDup}/40 bad)`);
ok(examGood === 40, `buildExam(75) units, difficulty, answers valid (${examGood}/40)`);

/* ---------- lessons + unit audio ---------- */
const LESSONS = evalDecl('LESSONS', sliceDecl('LESSONS', '/* ============ state'));
ok(LESSONS.length === 6, `6 Mastery Path lessons (got ${LESSONS.length})`);
for (const l of LESSONS) {
  ok(!!l.t && !!l.b && !!l.a, `lesson "${l.t}" has title, body, audio`);
  ok(fs.existsSync(path.join(ROOT, 'static', l.a)), `audio exists: ${l.a}`);
}

const UNITS = evalDecl('UNITS', sliceDecl('UNITS', 'function gensForUnit'));
ok(UNITS.length === 8, `8 curriculum units (got ${UNITS.length})`);
for (const u of UNITS) {
  ok(!!u.n && !!u.lesson && !!u.audio, `unit "${u.n}" has name, lesson, audio`);
  ok(fs.existsSync(path.join(ROOT, 'static', u.audio)), `audio exists: ${u.audio}`);
}

/* ---------- short-response rubric ---------- */
const shortSrc = sliceDecl('SHORT', 'function prepareShort');
const SHORT = evalDecl('SHORT', shortSrc);
ok(SHORT.length === 12, `12 short-response prompts (got ${SHORT.length})`);
ok(SHORT.every(s => s.unit >= 1 && s.unit <= 8), 'every short prompt maps to a unit');

function fnSrc(name) {
  const i = script.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('missing ' + name);
  let depth = 0, started = false;
  for (let j = i; j < script.length; j++) {
    if (script[j] === '{') { depth++; started = true; }
    else if (script[j] === '}') { depth--; if (started && depth === 0) return script.slice(i, j + 1); }
  }
  throw new Error('unterminated ' + name);
}
const grade = Function('SHORT', fnSrc('normNums') + '\n' + fnSrc('gradeShort') + '\nreturn gradeShort;')(SHORT);

let full = 0, blank = 0;
for (const s of SHORT) {
  if (grade(s, s.model).verdict === 'full') full++;
  if (grade(s, '').verdict === 'wrong') blank++;
}
ok(full === SHORT.length, `all ${SHORT.length} model answers score full (got ${full})`);
ok(blank === SHORT.length, `all ${SHORT.length} empty answers score wrong (got ${blank})`);

const regT = SHORT.find(s => s.topic === 'Reg T margin');
const swapped = grade(regT, 'Initial margin is 25% set by FINRA. Maintenance is 50% set by the Federal Reserve.');
ok(swapped.verdict !== 'full', 'swapped Reg T numbers/regulators are not full credit');

/* ---------- disk audio refs ---------- */
const htmlRefs = [...html.matchAll(/audio\/([A-Za-z0-9_.-]+\.(?:wav|mp3))/g)].map(m => m[1]);
ok(htmlRefs.length > 0, 'audio references present');
ok(htmlRefs.every(f => fs.existsSync(path.join(ROOT, 'static', 'audio', f))), 'every audio reference exists on disk');
ok(!/\.mp3\b/.test(html), 'no MP3 references remain');

console.log(`bank: ${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log('FAILURES:');
  for (const f of failures.slice(0, 20)) console.log('  - ' + f);
  process.exit(1);
}
