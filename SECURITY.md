# Security Policy & Architecture — SIE Mastery

SIE Mastery is released under the MIT License as a localhost-first study application. All learning history, adaptive BKT/Elo state, and missed-question banks remain on-device inside browser `localStorage`, and no telemetry, analytics, or external assets leave your machine.

## Localhost Security Model

- **Loopback-only binding**: `server.py` binds exclusively to `127.0.0.1` (`PORT`, default `8765`), preventing LAN exposure.
- **DNS-rebinding defense**: Every `GET`, `HEAD`, `POST`, and disallowed method handler validates the `Host` header against an exact loopback allowlist (`127.0.0.1:<PORT>`, `localhost:<PORT>`, `127.0.0.1`, `localhost`), returning `421 Misdirected Request` otherwise.
- **Cross-site mutation defense**: `POST /api/tts` enforces:
  - `Origin` allowlist (`http://127.0.0.1:<PORT>` / `http://localhost:<PORT>` when present) and `Sec-Fetch-Site` blocking (`cross-site`, `same-site`), returning `403`.
  - Strict `Content-Type: application/json` (`415 Unsupported Media Type` for `text/plain` or form payloads, forcing a CORS preflight cross-origin while `OPTIONS` returns `405`).
- **Path-traversal and symlink-escape containment**:
  - `Handler.translate_path` resolves every requested static filesystem target and verifies `relative_to(STATIC.resolve())`, blocking symlinks that escape `static/`.
  - `/audio/<path>.(wav|mp3)` resolves inside `(STATIC / "audio").resolve()` (supporting both overview WAVs and `audio/lessons/*.mp3` with RFC 9110 `Range` streaming), and `/tts/<32hex>.wav` strictly matches 32-character lowercase hex IDs inside `tts_cache.resolve()`. Directory listings return `404`.
- **PII / SSN protection**:
  - `security.valid_text` rejects text matching US SSN patterns (`NNN-NN-NNNN`) so sensitive numbers typed accidentally are never synthesized or cached on disk, and `security.redact_pii` plus client-side redaction scrub SSN patterns from short-response inputs before grading or saving.
- **Resource & cache safety**:
  - `64 KB` request body cap (`413`), `1200`-char normalized text cap, control-character blocking, voice allowlist (`VOICES`), thread-safe sliding-window `RateLimiter` (`30` requests / `60s`, `Retry-After` computed via `math.ceil(window - (now - hits[0]))`), generic error payloads (no stack trace leaks), and atomic `.tmp` to `os.replace` WAV writes.
- **Strict response headers**:
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`, `Cross-Origin-Resource-Policy: same-origin`, and strict `Content-Security-Policy` with `script-src 'self'` (no `'unsafe-inline'`, zero inline scripts or `onclick` handlers), `object-src 'none'`, `form-action 'none'`, `frame-ancestors 'none'`, and `connect-src 'self'`.

## Reporting a Vulnerability

If you discover a security or privacy issue in `sie-mastery-app`, please open a GitHub issue or private security advisory on `Job4874/sie-mastery-app` with reproduction steps (never include real personal or Social Security data in reports). Verify local fixes using `python -m unittest discover -s tests -p "test_*.py" -v` and `run_all.ps1`.
