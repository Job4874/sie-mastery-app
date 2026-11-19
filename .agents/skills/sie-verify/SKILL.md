---
name: sie-verify
description: >-
  Runs the complete 11-suite SIE Mastery verification pipeline (Python compile,
  JS unit/ML/UI/theme tests, security probes, grammar/codespell audit, headless
  Playwright DOM/mobile checks, and idempotent SHA-256 bit-manifest validation).
  Use this skill when verifying, auditing, or preparing commits in sie-mastery-app.
---

# SIE Mastery Verification Pipeline

Run the automated 11-suite pipeline before committing changes or pushing to GitHub.

## Steps

1. Execute the bundled helper script from the repository root:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .agents/skills/sie-verify/scripts/run_all.ps1
   ```
   Script location: [run_all.ps1](./scripts/run_all.ps1)

2. Confirm all 11 checks pass cleanly:
   - **Static & Unit (Suites 1–8)**: `py_compile`, `tests/app.test.js`, `tests/tests9.js`, `tests/ml_verify.js`, `tests/ui_enterprise.js`, `tools/verify.py`, `tests/grammar_audit.py` (including `codespell`), and `unittest` (`tests/test_security.py`).
   - **Live Localhost Server (Suites 9–11)**: The script launches `python server.py` on `127.0.0.1:8765`, waits for `/api/health`, runs `tools/verify_dom.py`, `tools/verify_exhaustive.py` (`0` console errors across desktop and mobile), and runs `tools/verify_bits.py` twice to verify `tools/bit_manifest.json` is byte-identical across runs, then stops the server in `finally`.

3. If any tracked source file or WAV asset changed, verify `git diff -- tools/bit_manifest.json` reflects only expected updates and commit `tools/bit_manifest.json` alongside your changes.
