/* tests9.js — DOM & CSS dual-theme inspector for the SIE Mastery single-file app.
 * Static + token-level audit: no external dependencies, runs under plain Node.
 * Checks: token blocks, WCAG contrast matrix in both themes, zero raw color leaks,
 * semantic data-* regions, ARIA state, button labels, duplicate ids, theme engine.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'static', 'index.html'), 'utf8');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name) {
  if (cond) pass++;
  else { fail++; failures.push(name); }
}

/* ---------- extraction helpers ---------- */
function extractBlock(src, selector) {
  const i = src.indexOf(selector);
  if (i < 0) return null;
  const start = src.indexOf('{', i);
  if (start < 0) return null;
  let depth = 0, end = -1;
  for (let j = start; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  return end < 0 ? null : src.slice(start + 1, end);
}

function parseTokens(block) {
  const map = {};
  if (!block) return map;
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block))) map[m[1]] = m[2].trim();
  return map;
}

function hexToRgb(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function luminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const f = c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(rgb.r) + 0.7152 * f(rgb.g) + 0.0722 * f(rgb.b);
}

function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  if (la === null || lb === null) return null;
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/* ---------- 1. token blocks ---------- */
const rootBlock = extractBlock(html, ':root');
const darkBlock = extractBlock(html, ':root[data-theme="dark"]');
const lightBlock = extractBlock(html, ':root[data-theme="light"]');
ok(rootBlock !== null, ':root token block exists');
ok(darkBlock !== null, ':root[data-theme="dark"] block exists');
ok(lightBlock !== null, ':root[data-theme="light"] block exists');

const dark = parseTokens(darkBlock);
const light = parseTokens(lightBlock);

const required = [
  '--bg-canvas', '--bg-surface', '--bg-elevated', '--bg-glass',
  '--text-primary', '--text-secondary', '--text-muted',
  '--border-subtle', '--border-focus',
  '--accent-primary', '--accent-subtle', '--accent-border',
  '--status-pass', '--status-pass-bg', '--status-warn', '--status-warn-bg',
  '--status-danger', '--status-danger-bg'
];
for (const t of required) {
  ok(dark[t], `dark token ${t}`);
  ok(light[t], `light token ${t}`);
}

/* legacy aliases survive only as aliases */
ok(/--gold\s*:\s*var\(--accent-primary\)/.test(rootBlock || ''), 'legacy --gold alias');
ok(/--card\s*:\s*var\(--bg-surface\)/.test(rootBlock || ''), 'legacy --card alias');
ok(/--ink\s*:\s*var\(--text-primary\)/.test(rootBlock || ''), 'legacy --ink alias');

/* ---------- 2. dual-theme WCAG matrix ---------- */
const surfaces = ['--bg-canvas', '--bg-surface', '--bg-elevated'];
for (const [name, tokens] of [['dark', dark], ['light', light]]) {
  for (const s of surfaces) {
    const r1 = contrast(tokens['--text-primary'], tokens[s]);
    const r2 = contrast(tokens['--text-secondary'], tokens[s]);
    ok(r1 !== null && r1 >= 7.0, `${name} text-primary on ${s} >= 7.0 (got ${r1 && r1.toFixed(2)})`);
    ok(r2 !== null && r2 >= 7.0, `${name} text-secondary on ${s} >= 7.0 (got ${r2 && r2.toFixed(2)})`);
    const r3 = contrast(tokens['--text-muted'], tokens[s]);
    ok(r3 !== null && r3 >= 4.5, `${name} text-muted on ${s} >= 4.5 (got ${r3 && r3.toFixed(2)})`);
  }
  for (const s of ['--bg-surface', '--bg-elevated']) {
    for (const t of ['--accent-primary', '--status-pass', '--status-warn', '--status-danger']) {
      const r = contrast(tokens[t], tokens[s]);
      ok(r !== null && r >= 4.5, `${name} ${t} on ${s} >= 4.5 (got ${r && r.toFixed(2)})`);
    }
  }
  const rBtn = contrast(tokens['--text-on-accent'], tokens['--accent-primary']);
  ok(rBtn !== null && rBtn >= 4.5, `${name} text-on-accent on accent >= 4.5 (got ${rBtn && rBtn.toFixed(2)})`);
}

/* ---------- 3. zero raw color leaks outside token blocks ---------- */
let scan = html;
scan = scan.replace(/:root\[data-theme="dark"\]\{[\s\S]*?\}/, '');
scan = scan.replace(/:root\[data-theme="light"\]\{[\s\S]*?\}/, '');
scan = scan.replace(/:root\{[\s\S]*?\}/, '');
const hexLeaks = scan.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
ok(hexLeaks.length === 0, `zero raw hex outside token blocks (found ${hexLeaks.length}: ${hexLeaks.slice(0, 5).join(',')})`);
const rgbLeaks = scan.match(/rgba?\(/g) || [];
ok(rgbLeaks.length === 0, `zero raw rgb()/rgba() outside token blocks (found ${rgbLeaks.length})`);
const inlineColorLeaks = (scan.match(/style="[^"]*(?:#[0-9a-fA-F]{3,8}|rgba?\()/g) || []).length;
ok(inlineColorLeaks === 0, `zero inline style colors (found ${inlineColorLeaks})`);

/* ---------- 4. semantic DOM regions ---------- */
for (const v of ['home', 'lessons', 'units', 'report', 'quiz', 'result']) {
  ok(html.includes(`data-view="${v}"`), `data-view="${v}" present`);
}
for (const c of ['options', 'explanation', 'mode-grid', 'coach', 'mastery', 'toast']) {
  ok(html.includes(`data-component="${c}"`), `data-component="${c}" present`);
}
ok(html.includes('data-state="idle"'), 'data-state on quiz options');
ok(html.includes('aria-pressed='), 'aria-pressed states present');
ok(html.includes('aria-live="polite"'), 'aria-live region present');

/* ---------- 5. button labels ---------- */
const bodyOnly = html.slice(html.indexOf('<body>'), html.indexOf('<script>'));
const btnRe = /<button\b[^>]*>([\s\S]*?)<\/button>/g;
let bm, btnTotal = 0, btnBad = 0;
while ((bm = btnRe.exec(bodyOnly))) {
  btnTotal++;
  const raw = bm[0];
  const text = bm[1].replace(/<[^>]+>/g, '').trim();
  const label = /aria-label\s*=\s*"[^"]+"/.test(raw);
  if (!text && !label) btnBad++;
}
ok(btnTotal > 0 && btnBad === 0, `all ${btnTotal} static buttons labeled (bad: ${btnBad})`);

/* ---------- 6. duplicate ids ---------- */
const ids = {};
const idRe = /id="([^"]+)"/g;
let im;
while ((im = idRe.exec(html))) ids[im[1]] = (ids[im[1]] || 0) + 1;
const dupes = Object.entries(ids).filter(([, n]) => n > 1).map(([k]) => k);
ok(dupes.length === 0, `zero duplicate ids (found: ${dupes.join(',') || 'none'})`);

/* ---------- 7. theme engine ---------- */
ok(html.includes('const THEME_KEY="tibin_sie_theme"'), 'THEME_KEY is tibin_sie_theme');
ok(html.includes('id="themeToggle"'), 'themeToggle button present');
ok(html.includes('function applyTheme'), 'applyTheme defined');
ok(html.includes('function toggleTheme'), 'toggleTheme defined');
ok(html.includes('function initTheme'), 'initTheme defined');
ok(html.includes('prefers-color-scheme'), 'prefers-color-scheme fallback present');
ok(html.includes('localStorage.setItem(THEME_KEY'), 'theme persisted to localStorage');
ok(/e\.key==="t"/.test(html), 'T keyboard shortcut wired');
ok(/tagName\.toLowerCase\(\)/.test(html), 'T shortcut ignores typing targets');

/* ---------- 8. targeted updates / no full re-render on answer ---------- */
ok(html.includes('$("timer").textContent') && html.includes('$("pbar").style.width'), 'targeted DOM updates present');
const ansFn = html.slice(html.indexOf('function answer('), html.indexOf('function ', html.indexOf('function answer(') + 1));
ok(!/opts"\)\.innerHTML=/.test(ansFn), 'answer does not re-render options');

/* ---------- report ---------- */
console.log(`tests9: ${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log('FAILURES:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
