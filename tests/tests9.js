/* tests9.js — DOM, CSS, token, and dual-theme WCAG contrast inspector for SIE Mastery.
 * Audits static/index.html, static/css/app.css, and static/js/ under plain Node.
 */
const fs = require("fs");
const path = require("path");
const { STATIC, readAllAppJs } = require("./load_app");

const html = fs.readFileSync(path.join(STATIC, "index.html"), "utf8");
const css = fs.readFileSync(path.join(STATIC, "css", "app.css"), "utf8");
const allJs = readAllAppJs().map(s => s.code).join("\n");
const quizJs = fs.readFileSync(path.join(STATIC, "js", "core", "quiz.js"), "utf8");

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name) {
  if (cond) pass++;
  else { fail++; failures.push(name); }
}

function extractBlock(src, selectorRe) {
  const m = selectorRe instanceof RegExp ? selectorRe.exec(src) : null;
  const i = m ? m.index : (typeof selectorRe === "string" ? src.indexOf(selectorRe) : -1);
  if (i < 0) return null;
  const start = src.indexOf("{", i);
  if (start < 0) return null;
  let depth = 0, end = -1;
  for (let j = start; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") { depth--; if (depth === 0) { end = j; break; } }
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
  if (typeof hex !== "string") return null;
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
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
const lightBlock = extractBlock(css, /:root\s*,\s*:root\[data-theme="light"\]\s*\{/);
const darkBlock = extractBlock(css, /:root\[data-theme="dark"\]\s*\{/);
ok(lightBlock !== null, ':root,:root[data-theme="light"] token block exists');
ok(darkBlock !== null, ':root[data-theme="dark"] token block exists');

const light = parseTokens(lightBlock);
const dark = parseTokens(darkBlock);

const required = [
  "--bg", "--surface", "--surface-2", "--surface-3",
  "--text", "--text-2", "--muted",
  "--border", "--border-strong",
  "--accent", "--accent-hover", "--accent-soft", "--on-accent",
  "--good", "--good-bg", "--bad", "--bad-bg", "--warn", "--focus"
];
for (const t of required) {
  ok(Boolean(light[t]), `light token ${t}`);
  ok(Boolean(dark[t]), `dark token ${t}`);
}

/* ---------- 2. dual-theme WCAG contrast matrix ---------- */
const surfaces = ["--bg", "--surface", "--surface-2"];
for (const [name, tokens] of [["light", light], ["dark", dark]]) {
  for (const s of surfaces) {
    const r1 = contrast(tokens["--text"], tokens[s]);
    const r2 = contrast(tokens["--text-2"], tokens[s]);
    const r3 = contrast(tokens["--muted"], tokens[s]);
    ok(r1 !== null && r1 >= 7.0, `${name} --text on ${s} >= 7.0 (got ${r1 && r1.toFixed(2)})`);
    ok(r2 !== null && r2 >= 7.0, `${name} --text-2 on ${s} >= 7.0 (got ${r2 && r2.toFixed(2)})`);
    ok(r3 !== null && r3 >= 4.5, `${name} --muted on ${s} >= 4.5 (got ${r3 && r3.toFixed(2)})`);
  }
  for (const s of ["--bg", "--surface", "--surface-2"]) {
    const rAcc = contrast(tokens["--accent"], tokens[s]);
    ok(rAcc !== null && rAcc >= 4.5, `${name} --accent on ${s} >= 4.5 (got ${rAcc && rAcc.toFixed(2)})`);
  }
  const rBtn = contrast(tokens["--on-accent"], tokens["--accent"]);
  ok(rBtn !== null && rBtn >= 4.5, `${name} --on-accent on --accent >= 4.5 (got ${rBtn && rBtn.toFixed(2)})`);
  const rGood = contrast(tokens["--good"], tokens["--good-bg"]);
  ok(rGood !== null && rGood >= 4.5, `${name} --good on --good-bg >= 4.5 (got ${rGood && rGood.toFixed(2)})`);
  const rBad = contrast(tokens["--bad"], tokens["--bad-bg"]);
  ok(rBad !== null && rBad >= 4.5, `${name} --bad on --bad-bg >= 4.5 (got ${rBad && rBad.toFixed(2)})`);
}

/* ---------- 3. zero raw color leaks outside token blocks ---------- */
let scanCss = css
  .replace(/:root\s*,\s*:root\[data-theme="light"\]\s*\{[\s\S]*?\}/, "")
  .replace(/:root\[data-theme="dark"\]\s*\{[\s\S]*?\}/, "");
const hexLeaks = scanCss.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
ok(hexLeaks.length === 0, `zero raw hex outside CSS token blocks (found ${hexLeaks.length}: ${hexLeaks.slice(0, 5).join(",")})`);
const rgbLeaks = scanCss.match(/rgba?\(/g) || [];
ok(rgbLeaks.length === 0, `zero raw rgb()/rgba() outside CSS token blocks (found ${rgbLeaks.length})`);
const inlineColorLeaks = ((html + allJs).match(/style="[^"]*(?:#[0-9a-fA-F]{3,8}|rgba?\()/g) || []).length;
ok(inlineColorLeaks === 0, `zero inline style colors (found ${inlineColorLeaks})`);

/* ---------- 4. semantic landmarks, nav, ARIA, and zero inline script/handlers ---------- */
for (const nav of ["learn", "practice", "exam", "progress", "settings"]) {
  ok(html.includes(`data-nav="${nav}"`), `top nav data-nav="${nav}" present`);
}
for (const tag of ["<header", "<nav", "<main id=\"app\"", "<footer", "class=\"skip-link\""]) {
  ok(html.includes(tag), `semantic landmark ${tag} present`);
}
ok(html.includes('aria-live="polite"'), "aria-live toast region present");
ok(!/<script(?![^>]*src=)/i.test(html), "zero inline <script> blocks in index.html");
ok(!/\bonclick\s*=/i.test(html) && !/\bonclick\s*=/i.test(allJs), "zero inline onclick handlers");

/* ---------- 5. static button labels & duplicate ids ---------- */
const btnRe = /<button\b[^>]*>([\s\S]*?)<\/button>/g;
let bm, btnTotal = 0, btnBad = 0;
while ((bm = btnRe.exec(html))) {
  btnTotal++;
  const text = bm[1].replace(/<[^>]+>/g, "").trim();
  const label = /aria-label\s*=\s*"[^"]+"/.test(bm[0]);
  if (!text && !label) btnBad++;
}
ok(btnTotal > 0 && btnBad === 0, `all ${btnTotal} static buttons labeled (bad: ${btnBad})`);

const ids = {};
const idRe = /id="([^"]+)"/g;
let im;
while ((im = idRe.exec(html))) ids[im[1]] = (ids[im[1]] || 0) + 1;
const dupes = Object.entries(ids).filter(([, n]) => n > 1).map(([k]) => k);
ok(dupes.length === 0, `zero duplicate ids in index.html (found: ${dupes.join(",") || "none"})`);

/* ---------- 6. theme, focus mode & keyboard engine ---------- */
ok(/const\s+THEME_KEY\s*=\s*"tibin_sie_theme"/.test(allJs), "THEME_KEY is tibin_sie_theme");
ok(/ADHD_KEY\s*=\s*"tibin_sie_adhd"/.test(allJs), "ADHD_KEY is tibin_sie_adhd");
ok(html.includes('data-action="toggle-theme"'), "theme toggle control present");
ok(html.includes('data-action="toggle-adhd"'), "focus mode toggle control present");
ok(allJs.includes("function applyTheme") && allJs.includes("function toggleTheme") && allJs.includes("function initTheme"), "theme functions defined");
ok(allJs.includes("localStorage.setItem(THEME_KEY"), "theme persisted to localStorage");
ok(/e\.key\s*===\s*"t"/.test(allJs) && /e\.key\s*===\s*"f"/.test(allJs), "T and F keyboard shortcuts wired");
ok(/tagName\.toLowerCase\(\)/.test(allJs), "keyboard shortcuts ignore typing targets");

/* ---------- 7. targeted updates / no full option re-render on answer ---------- */
ok(quizJs.includes('$("pbar").style.width'), "targeted progress bar DOM updates present");
const ansStart = quizJs.indexOf("function answer(");
const ansEnd = quizJs.indexOf("\nfunction ", ansStart + 1);
const ansFn = quizJs.slice(ansStart, ansEnd > 0 ? ansEnd : undefined);
ok(!/opts"\)\.innerHTML=/.test(ansFn), "answer() does not re-render options");

console.log(`tests9: ${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log("FAILURES:");
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
