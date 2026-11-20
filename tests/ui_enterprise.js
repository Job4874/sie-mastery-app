/* ui_enterprise.js - calm study UI discipline audit for SIE Mastery
 * Verifies typography, warm light default, restrained elevation, single accent,
 * touch targets, focus outlines, reduced motion, and ADHD focus-mode CSS rules.
 */
const fs = require("fs");
const path = require("path");
const { STATIC } = require("./load_app");

const html = fs.readFileSync(path.join(STATIC, "index.html"), "utf8");
const css = fs.readFileSync(path.join(STATIC, "css", "app.css"), "utf8");

let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log("PASS:", m); } else { fail++; console.log("FAIL:", m); } }

ok(/data-theme="light"/.test(html), "warm light theme is the default on <html>");
ok(/font\s*:\s*400 17px\/1\.6 system-ui,\s*-apple-system/.test(css), "body uses readable 17px/1.6 native system font stack");
ok(/\.btn\s*\{[^}]*font\s*:\s*inherit/.test(css) && /select\s*\{[^}]*font\s*:\s*inherit/.test(css) && /textarea\s*\{[^}]*font\s*:\s*inherit/.test(css), "buttons and form controls inherit app font");
const radius = css.match(/--r\s*:\s*(\d+)px/);
ok(radius && parseInt(radius[1], 10) <= 12, "card radius restrained <=12px (got " + (radius && radius[1]) + ")");
ok(/\.btn\.primary\s*\{[^}]*background\s*:\s*var\(--accent\)/.test(css), "primary CTA uses single calm accent");
ok(!/linear-gradient/i.test(css), "no noisy gradients on study UI surfaces");
ok(!/0 16px 40px/.test(css) && !/0 8px 24px/.test(css), "no oversized shadows (restrained elevation)");
ok(!/text-transform:\s*uppercase/i.test(css), "no CSS ALL-CAPS transforms (calm sentence case)");
ok(/min-height\s*:\s*44px/.test(css) && /min-height\s*:\s*52px/.test(css), "accessible button/option touch targets (>=44px)");
ok(/:focus-visible\s*\{[^}]*outline\s*:\s*3px solid var\(--focus\)/.test(css), "visible keyboard focus indicator defined");
ok(/@media\s*\(prefers-reduced-motion\s*:\s*reduce\)/.test(css) && /:root\[data-adhd="focus"\]/.test(css), "reduced-motion and ADHD focus rules defined");

console.log("\n=== UI ENTERPRISE: " + pass + " passed, " + fail + " failed ===");
process.exit(fail ? 1 : 0);
