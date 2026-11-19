---
name: sie-curriculum-author
description: >-
  Guides authoring and updating FINRA SIE multiple-choice generators, rubric-graded
  short-response prompts, curriculum lessons, and Kokoro ONNX saved WAV clips in
  sie-mastery-app. Use this skill when adding questions, editing regulatory rules,
  or regenerating lesson audio.
---

# SIE Mastery Curriculum Authoring Runbook

Follow these steps whenever adding or revising exam content inside [static/index.html](../../../static/index.html).

## 1. Multiple-Choice Generators (`GEN`)

1. Return `Q(sec, topic, text, choices, 0, explain, rule)` with `sec` strictly in `{1, 2, 3, 4}` (the `0` index is the correct answer before `prepare()` shuffles `choices`).
2. Keep all four `choices` unique on every random roll (`tests/app.test.js` runs 50 rolls per generator).
3. Register every new `topic` key in both `UNIT_BY_TOPIC` (`1..8`) and `DIFF_BY_TOPIC` (`1..3`).
4. Double-check FINRA/SEC citations:
   - Reg BI: **SEC Rule 15l-1** (`FINRA Rule 2111` for non-Reg BI suitability; never `Rule 2210`).
   - Gifts vs. entertainment: **FINRA Rule 3220** (`$100`/yr cap; attended business entertainment exempt; never `Rule 3230`).
   - Cash accounts: **Regulation T freeriding** = single violation triggers `90`-day restriction; **good-faith violations** = `3` violations in `12` months trigger `90`-day restriction.

## 2. Short-Response Prompts (`SHORT`)

1. Include `{topic, unit, prompt, groups, model, rule}` (plus optional `num` with 0.1% numeric tolerance).
2. For swap-trap concepts where two pairs must stay aligned (e.g. `50%` + Federal Reserve + `initial` vs. `25%` + FINRA + `maintenance`), use sentence-scoped `bind` objects with `{a, b, notB, role, otherRole}` and add a swapped-input regression assertion in [tests/app.test.js](../../../tests/app.test.js).

## 3. Re-Composing Lesson WAV Clips

If you modify text inside `UNITS` or `LESSONS`:

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

## 4. Validate

Run the `sie-verify` skill ([run_all.ps1](../sie-verify/scripts/run_all.ps1)) to confirm exam uniqueness (`75` unique stems, `12 / 33 / 23 / 7` mix), `codespell`, WAV header/byte parity, and `tools/bit_manifest.json` integrity.
