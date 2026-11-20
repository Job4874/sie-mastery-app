---
name: sie-curriculum-author
description: >-
  Guides authoring and updating FINRA SIE step-through lessons, multiple-choice
  generators, Extremely Hard trap upgrades, rubric-graded short-response prompts,
  and Kokoro ONNX saved MP3/WAV clips in sie-mastery-app. Use this skill when
  adding questions, editing lessons or regulatory rules, or regenerating audio.
---

# SIE Mastery Curriculum Authoring Runbook

Follow these steps whenever adding or revising curriculum content across `static/js/data/`.

## 1. Step-Through Lessons (`static/js/data/units/unit-0.js`..`unit-8.js`)

1. Keep each unit file as strict JSON inside `SIE.registerUnit({...});` (`3–5` lessons per unit, `1–5` for Unit 0).
2. Each lesson uses `3–7` one-idea screens (`concept`, `example`, `check`, `recap`) ending in `recap` with at least one `check` screen, concise screen prose (`<=140` words), and an explicit plain-English `"say"` field on any screen containing `<table>`.
3. Validate schema and clip counts:
   ```powershell
   python tools/validate_content.py
   ```
4. Re-compose modified per-screen Kokoro MP3 clips and refresh `static/audio/lessons/manifest.json`:
   ```powershell
   python tools/compose_audio.py --lessons --only <clip-stem> --force
   python tools/compose_audio.py --lessons --manifest-only
   ```

## 2. Multiple-Choice Generators & Extreme Traps (`questions.js` & `extreme.js`)

1. In [questions.js](../../../static/js/data/questions.js), return `Q(sec, topic, text, choices, 0, explain, rule)` with `sec` strictly in `{1, 2, 3, 4}` (index `0` is the correct answer before `prepare()` shuffles `choices`).
2. Keep all four `choices` unique on every random roll (`tests/app.test.js` runs `200` rolls per generator).
3. Register every new `topic` key in both `UNIT_BY_TOPIC` (`1..8`) and `DIFF_BY_TOPIC` (`1..3`).
4. If a new topic has `DIFF_BY_TOPIC[topic] === 1`, also add a hardened multi-step FINRA trap upgrade in `EXTREME_GEN` inside [extreme.js](../../../static/js/data/extreme.js) so Extremely Hard mode never serves softball items.
5. Double-check FINRA/SEC citations:
   - Reg BI: **SEC Rule 15l-1** (`FINRA Rule 2111` for non-Reg BI suitability; never `Rule 2210`).
   - Gifts vs. entertainment: **FINRA Rule 3220** (`$300`/yr cap effective March 30, 2026 under FINRA Notice 26-05; attended business entertainment exempt; never `Rule 3230`).
   - Cash accounts: **Regulation T freeriding** = single violation triggers `90`-day restriction; **good-faith violations** = `3` violations in `12` months trigger `90`-day restriction.

## 3. Short-Response Prompts (`static/js/data/short.js`)

1. Include `{topic, unit, prompt, groups, model, rule}` (plus optional `num` with `0.1%` numeric tolerance).
2. For swap-trap concepts where two pairs must stay aligned (e.g., `50%` + Federal Reserve + `initial` vs. `25%` + FINRA + `maintenance`), use clause-scoped `bind` objects with `{a, b, notB, role, otherRole}` and add a swapped-input regression assertion in [tests/app.test.js](../../../tests/app.test.js).

## 4. Re-Composing Overview & Library WAV Clips

If you modify text inside [overviews.js](../../../static/js/data/overviews.js) or [library.js](../../../static/js/data/library.js):

1. Preview extracted speech text:
   ```powershell
   python tools/compose_audio.py --list
   ```
2. Regenerate only the changed clip (preferring `kokoro-v1.0.onnx` in `models/`):
   ```powershell
   python tools/compose_audio.py --only <clip-stem> --force
   ```
3. Refresh `static/audio/manifest.json`:
   ```powershell
   python tools/compose_audio.py --manifest-only
   ```

## 5. Validate

Run the `sie-verify` skill ([run_all.ps1](../sie-verify/scripts/run_all.ps1)) to confirm lesson schema validity, exam uniqueness (`75` unique stems, `12 / 33 / 23 / 7` mix across all 5 difficulty tiers), `codespell`, WAV/MP3 byte parity, and `413`-hash `tools/bit_manifest.json` integrity.
