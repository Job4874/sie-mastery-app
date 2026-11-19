/* Objective enterprise-UI assertions derived from measured live Stripe styles
 * (currency-sans stack, 14px controls, 8px radius, restrained elevation) and
 * Microsoft Fluent 2 docs (4px spacing ramp, Body 14/20, sentence case,
 * color reserved for state, consistent control font).
 */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "static", "index.html"), "utf8");
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log("PASS:", m); } else { fail++; console.log("FAIL:", m); } }

// font stack: native system stack (Stripe/Fluent), no Arial-only fallback
ok(/font-family:Inter,-apple-system,BlinkMacSystemFont/.test(html),
   "body uses native system font stack (Stripe/Fluent)");
ok(/button\{cursor:pointer;font-family:inherit/.test(html),
   "buttons inherit app font (no Arial fallback)");
ok(/input,select\{font-family:inherit/.test(html),
   "form controls inherit app font");

// Fluent Body line-height defined (not browser 'normal')
ok(/color:var\(--text-primary\);line-height:1\.5/.test(html),
   "body has explicit Fluent-style line-height");

// radius restrained (Stripe measured 7-8px; Fluent 4px ramp)
const radius = html.match(/--r:(\d+)px/);
ok(radius && parseInt(radius[1]) <= 12, "card radius restrained <=12px (got " + (radius && radius[1]) + ")");

// Stripe color discipline: primary CTA uses accent, not red/orange gradient
ok(/button\.pink\{background:var\(--accent-primary\)/.test(html),
   "primary CTA uses single accent (color reserved for status)");
ok(!/button\.pink\{background:linear-gradient\(90deg,var\(--status-danger\)/.test(html),
   "no red/orange gradient on primary CTA");

// restrained elevation: no oversized 40px blurs
ok(!/0 16px 40px/.test(html) && !/0 8px 24px/.test(html),
   "no oversized shadows (Stripe/Fluent restrained elevation)");
ok(/--shadow-2:0 2px 5px -1px/.test(html),
   "card elevation matches Stripe card shadow (2px 5px -1px)");

// Fluent sentence case: tag content not forced to uppercase via CSS
ok(!/\.tag\{[^}]*text-transform:\s*uppercase/.test(html),
   "tags are not CSS-uppercased (Fluent: sentence case)");

console.log("\n=== UI ENTERPRISE: " + pass + " passed, " + fail + " failed ===");
process.exit(fail ? 1 : 0);
