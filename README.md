# SIE Mastery

**Goal:** Not just pass the FINRA SIE — actually understand financial regulation, one calm step at a time.

SIE Mastery is a free, open-source (**MIT License**) adaptive learning platform designed for deep focus and ADHD-friendly cognition. It combines short voiced lessons, **Corbett-Anderson BKT** mastery tracking, **FSRS-DSR** spaced-repetition memory scheduling, **recursive ADHD error-pattern recognition & metacognitive Brier-score calibration**, **13 FINRA confusion-pair contrast drills**, and full **75-question exam simulation**.

**Host it anywhere under the MIT License** — on **localhost** (`python server.py`), offline from disk (`static/index.html`), on **GitHub Pages / Netlify / Cloudflare Pages** (all 355 Kokoro voice clips shipped), or on your **own self-hosted server** behind Caddy/Nginx. See **[HOSTING.md](HOSTING.md)** for full localhost, static, and HTTPS server deployment instructions.

## Quick start — pick your OS

**Zero install needed to study.** Open `static/index.html` in any modern browser (double-click it) or deploy `static/` to GitHub Pages. Every lesson screen plays its pre-recorded Kokoro MP3 voice clip; dynamic re-rolled questions fall back cleanly to your browser's built-in voice. All progress stays strictly on-device in `localStorage` (with local JSON export/import).

**Recommended (adds local GPU/CPU live Kokoro multi-voice synthesis + hardened server):** Python 3.10+ only, no Node/build step.

**Windows (PowerShell):**
```powershell
git clone https://github.com/Job4874/sie-mastery-app.git
cd sie-mastery-app
py -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
# open http://127.0.0.1:8765
```

**macOS (Terminal):**
```bash
git clone https://github.com/Job4874/sie-mastery-app.git
cd sie-mastery-app
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 server.py
# open http://127.0.0.1:8765
```

**Linux (bash):**
```bash
git clone https://github.com/Job4874/sie-mastery-app.git
cd sie-mastery-app
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 server.py
# open http://127.0.0.1:8765
```

For persistent background localhost startup (`python tools/launch.py`) or self-hosting on your own domain with Caddy/Nginx (`SIE_BIND`, `SIE_ALLOWED_HOSTS`, `SIE_ALLOWED_ORIGINS`, `SIE_HTTPS=1`), see **[HOSTING.md](HOSTING.md)**.

**Research:** see [RESEARCH_ADHD.md](RESEARCH_ADHD.md) for the peer-reviewed cognitive science (W3C COGA, FSRS-DSR, Barkley executive-function failure modes, post-error slowing, and micro-interleaving) behind every adaptive feature.

## v6 — Recursive ADHD ML, FSRS Memory Engine, Genuine Voice Allocation & Editorial Redesign (Nov 2026)

- **Recursive ADHD Error-Pattern Recognition (`teacher.js`):** After every answer, the on-device ML teacher classifies *why* a miss happened — separating **impulsive fast misses (`<6s`)**, **negative-qualifier skimming traps (`NOT` / `EXCEPT` / `LEAST`)**, **post-error cascades** (second fast miss within 3 minutes), **deep concept gaps (`>15s` misses)**, and **speed bottlenecks (`>25s` corrects)** — surfacing a live **ADHD Cognitive Pattern Profile** on `#/progress` with 1-click prescribed interventions.
- **FSRS-DSR Spaced-Repetition Memory Engine:** Per-topic **Difficulty ($D \in [1,10]$), Stability ($S$ in days), and Retrievability ($R(t,S) = (1 + t/(9S))^{-1}$)** forgetting-curve scheduling with exact $R(S,S) = 0.90$ identity, lapse contraction, desirable-difficulty growth, an **FSRS Memory Review** mode, and a live retention queue on `#/progress`.
- **12 FINRA Confusion Pairs & Structured A/B Micro-Interleaving:** Dedicated 6-question **Contrast Drills** strictly alternate twin FINRA traps (`A-B-A-B-A-B`) — such as *Reg T 50% vs. PDT $25k*, *SEC Reg BI vs. FINRA Suitability*, *Freeriding vs. T+1 Settlement*, *CMO Prepayment vs. Reinvestment Risk*, *Gifts ($300) vs. Selling Away*, and *ETFs vs. Closed-End Funds* — directly countering ADHD look-alike interference.
- **ADHD Executive-Function Scaffolds:** Automatic high-contrast highlighting of exam negative qualifiers (`<mark class="qual">NOT</mark>`, `EXCEPT`, `LEAST`, `FALSE`), an automatic calm slow-down cue plus opt-in **3-second Impulse Brake** after fast misses, an **Accelerated 3-Step ADHD Study Path** on `#/learn`, and local **JSON Progress Export/Import** in Settings.
- **Genuine Multi-Voice Allocation & Calm Audio Deck (`audio.js`):** Fixed static-clip voice override — `af_heart` plays instant pre-recorded Kokoro clips everywhere while choosing **Bella (`af_bella`)**, **Michael (`am_michael`)**, or **Emma (`bf_emma`)** on localhost genuinely routes lesson and quiz speech through local Kokoro ONNX/GPU synthesis. Lesson screens now include a calm audio bar with **Listen/Stop**, **Pause/Resume**, live progress bar, elapsed/total time, active voice allocation badge, and `L` keyboard toggle.
- **W3C COGA Editorial Redesign (`app.css`, `views.js`):** Refined warm light and dark themes with WCAG AAA body contrast (`>= 7:1`), zero raw colors outside `:root` tokens, semantic inline SVG screen icons, FINRA section weight pills, inline BKT mastery bars on all 9 units, and zero-distraction Focus mode (`F`).

## Core Curriculum, ML Teacher & Security Highlights

- **5 difficulty levels across Lessons, Practice, and Exams:** Choose **Easy**, **Standard**, **Hard**, **Very Hard** (90-minute exam + short responses), or **Extremely Hard** (`extreme.js`: 75-minute 1-min/Q exam, 45s drill clock, extreme lesson trap checks, and all 33 normally easy exam topics upgraded into multi-step FINRA trap scenarios so zero softballs appear).
- **Content (2026 audited):** **42 step-through lessons (266 screens)** + **92 dynamic MC generators** + **33 Extremely Hard trap upgrades** (`16 / 34 / 34 / 8` across Sections 1–4, zero repeats in 75-Q exams) + **12 rubric-graded short-response prompts** (clause-scoped regulator/role bindings and negation guards) + **13 Confusion-Pair contrast drills** + **6 "Why the rules exist" library deep dives** + **2026 Rapid Rule Anchors** cheat sheet.
  - Updated for 2026 rules: FINRA Rule 3220 `$300`/person/year gift cap effective March 30, 2026 (Notice 26-05), modernized **SEC Reg S-P written incident response & 30-day customer breach notification**, **SECURE 2.0** ABLE disability onset **age 46**, **529-to-Roth IRA rollover (`$35,000` lifetime, 15-year age)**, **RMD missed-withdrawal excise penalty lowered to `25%` (`10%` timely corrected)** and no lifetime Roth 401(k) RMDs, PDT `$25,000` transition note, Rule 144 `1%` per 3 months limit, SEC Rule 15l-1 Reg BI vs. FINRA Rule 2111 suitability, Rule 5220 backing away, Rule 3270 OBA, Rule 3280 selling away, Rule 2150(c) sharing, Social Security/IRA earned income, Roth vs. Traditional IRA taxation, and ERISA qualified plans.
- **ADHD Metacognitive Calibration:** Optional low-friction `Guess` / `Sure` confidence check on quiz items computes an **Overconfidence Rate** and **Brier Calibration Score** on `#/progress`, puncturing the ADHD illusion-of-competence blind spot.
- **Troubleshooting & shortcuts:** Settings includes an in-browser **Run self-check** button verifying all 89 generators, 33 extreme traps, 12 short rubrics, 12 confusion pairs, FSRS-DSR math, 266 lesson screens, 75-Q exam weights, Reg T swap traps, and `localStorage`, plus a **Verify voice allocation** check. Keyboard: `F` focus mode, `T` dark theme, `L` listen/stop, `1–4` / `A–D` answer, `Enter` / `→` next, `←` back.
- **Security ([SECURITY.md](SECURITY.md)):** Loopback-only default bind (`127.0.0.1`), explicit opt-in self-hosting allowlists (`HOSTING.md`), strict `script-src 'self'` CSP, single-header `Host` allowlist, Origin/`Sec-Fetch-Site` JSON-only POST checks, 64 KB body cap, thread-safe 30/min rate limiter, SSN PII rejection & client-side `[REDACTED-SSN]` scrubbing, symlink-contained `translate_path`, and RFC 9110 `Range` streaming for `.wav` and `.mp3`.

## Voice / Audio Clips & Acoustic Audit

All 355 curriculum voice clips (`340` lesson MP3s + `15` overview/library/welcome WAVs, `165.3` minutes total) are composed directly from `static/js/data/` and acoustically verified (`24 kHz` mono, consistent EBU-R128 loudness `-22.9..-22.0 dBFS`, zero silent/corrupt streams):

```powershell
# Audit every single one of the 355 shipped voice clips acoustically
python tools/audit_audio.py

# Re-compose all 340 per-screen lesson MP3 clips in parallel (needs models/kokoro-v1.0.onnx + voices-v1.0.bin)
python tools/compose_audio.py --lessons --workers 6

# Re-compose a single lesson screen clip
python tools/compose_audio.py --lessons --only u0-l1-s1 --force

# Re-compose the 15 overview / library / welcome WAV clips
python tools/compose_audio.py --force
```

## Verification

All checks run locally and in CI (`.github/workflows/compile.yml`):

```powershell
python tools/validate_content.py       # strict-JSON schema check on all 9 unit files
python tools/verify.py                 # split files + manifests + content integrity
python tools/audit_audio.py            # full 355-clip acoustic loudness, sample-rate & WPM audit
python -m unittest tests.test_security -v
node tests/app.test.js                 # 89 generators, 12 pairs, FSRS/contrast, XSS-safe highlights, voice allocation
node tests/tests9.js                   # dual-theme WCAG contrast, zero color leaks, zero inline JS
node tests/ml_verify.js                # BKT + Elo + FSRS-DSR + ADHD error-pattern classifier math
node tests/ui_enterprise.js            # calm study UI discipline
python tests/grammar_audit.py          # docs + codespell across all static JS/CSS/HTML/docs
powershell -ExecutionPolicy Bypass -File .agents/skills/sie-verify/scripts/run_all.ps1
```

## Layout

```
server.py                      # stdlib server (loopback default + opt-in self-hosting) + /api/tts + Range streaming
security.py                    # validation, SSN PII checks, clip routing, rate limiter
tts_engine.py                  # Kokoro GPU / ONNX CPU / optional XTTS, atomic cache
HOSTING.md                     # localhost, offline, GitHub Pages, and Caddy/Nginx HTTPS self-hosting guide
SECURITY.md                    # threat model & disclosure policy
ARCHITECTURE.md                # split-file architecture & runtime layers
RESEARCH_ADHD.md               # peer-reviewed ADHD learning science, FSRS-DSR, W3C COGA & audio research
static/
  index.html                   # zero-inline-script app shell
  css/app.css                  # light/dark tokens + calm editorial UI + Focus mode
  js/core/                     # util, store, audio, teacher, quiz
  js/data/                     # registry, units/unit-0..8, questions, extreme, short, library, overviews
  js/ui/                       # hash router + views
  js/app.js                    # boot, data-action delegation, JSON backup, keyboard shortcuts
  audio/                       # 15 overview/library WAVs + 340 lessons/*.mp3 Kokoro clips
tests/                         # load_app, app, tests9, test_security, ml_verify, ui_enterprise, grammar_audit
tools/                         # content_lib, validate_content, audit_audio, verify_*, compose_audio, launch
.github/workflows/             # compile.yml (CI) + pages.yml (GitHub Pages deploy)
```

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Abdulwahab Tibin. Free to use, study, modify, and self-host anywhere.
