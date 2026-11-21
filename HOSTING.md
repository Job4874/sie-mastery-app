# Self-Hosting & Deployment Guide (MIT License)

**SIE Mastery** is 100% open source under the **MIT License** ([LICENSE](LICENSE)). You can run it locally on `localhost`, open it offline from disk, publish `static/` to any static host (GitHub Pages, Netlify, Cloudflare Pages), or self-host the Python server behind Nginx or Caddy on your own machine or VPS — with zero build steps, zero database dependencies, and zero learner telemetry leaving the user's browser.

---

## Option 1 — Localhost (Recommended: Full 4-Voice Kokoro TTS + Hardened Server)

Runs strictly on loopback (`127.0.0.1:8765`) by default so no ports are exposed on your LAN or the public Internet.

### Windows (PowerShell)
```powershell
git clone https://github.com/Job4874/sie-mastery-app.git
cd sie-mastery-app
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
# Open http://127.0.0.1:8765/#/learn
```

To keep `127.0.0.1:8765` running silently in the background (with optional Desktop / Start Menu shortcuts):
```powershell
python tools/launch.py                 # starts background server & opens browser
python tools/launch.py --no-browser    # starts background server only
python tools/launch.py --stop          # cleanly stops background server
```

### macOS & Linux
```bash
git clone https://github.com/Job4874/sie-mastery-app.git
cd sie-mastery-app
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 server.py
# Open http://127.0.0.1:8765/#/learn
```

> **Note:** On localhost with Kokoro ONNX (or CUDA GPU) installed, `af_heart` plays instant pre-recorded clips while selecting **Bella**, **Michael**, or **Emma** in **Settings** genuinely synthesizes live Kokoro audio in that chosen voice and caches clips locally in `tts_cache/`.

---

## Option 2 — Zero-Install Offline Mode (`file://`)

No Python, no Node, no Internet required:
1. Download or clone the repository.
2. Double-click `static/index.html`.
3. All **340 pre-recorded Kokoro MP3 lesson clips**, all **15 overview/library/welcome WAV clips**, the full **89-generator + 33-extreme-trap quiz engine**, **BKT + FSRS-DSR + ADHD diagnostics**, and **localStorage JSON backup** work immediately offline. Dynamic re-rolled quiz questions fall back seamlessly to the browser's built-in speech engine.

---

## Option 3 — Static Web Hosting (GitHub Pages / Netlify / Cloudflare Pages)

Publish the `static/` directory as your site root:
- **GitHub Pages:** Already wired via `.github/workflows/pages.yml` — fork the repo, enable **Settings → Pages → Source: GitHub Actions**, and push to `main`.
- **Netlify / Cloudflare Pages / Vercel:** Set Publish Directory to `static` and Build Command to empty (zero build step).
- **Static behavior:** The app automatically detects non-localhost origins, skips `/api/health` probes cleanly (zero console/network errors), serves all 355 Kokoro audio clips directly over HTTPS, and uses browser `speechSynthesis` for dynamically re-rolled quiz questions.

---

## Option 4 — Self-Hosted Server with HTTPS (Linux / VPS / Reverse Proxy)

By default, `server.py` binds strictly to `127.0.0.1` and only accepts `Host` headers for `127.0.0.1` and `localhost` (preventing DNS rebinding). When self-hosting behind a reverse proxy (Caddy or Nginx) for your own domain or classroom server, configure the explicit opt-in environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `SIE_BIND` | `127.0.0.1` | Bind address. Keep `127.0.0.1` when running behind Nginx/Caddy on the same host. |
| `PORT` | `8765` | TCP port to listen on. |
| `SIE_ALLOWED_HOSTS` | *(empty)* | Comma-separated extra `Host` values to allow (e.g. `sie.example.org,sie.example.org:443`). |
| `SIE_ALLOWED_ORIGINS` | *(empty)* | Comma-separated extra `Origin` headers allowed for `POST /api/tts` (e.g. `https://sie.example.org`). |
| `SIE_HTTPS` | `0` | Set to `1` behind TLS termination to emit `Strict-Transport-Security` (`HSTS`). |

### Example: Caddy Reverse Proxy (Automatic HTTPS)
```caddyfile
sie.example.org {
    reverse_proxy 127.0.0.1:8765
}
```

### Example: Linux `systemd` Unit
```ini
[Unit]
Description=SIE Mastery Study Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/sie-mastery-app
Environment=PORT=8765
Environment=SIE_BIND=127.0.0.1
Environment=SIE_ALLOWED_HOSTS=sie.example.org
Environment=SIE_ALLOWED_ORIGINS=https://sie.example.org
Environment=SIE_HTTPS=1
ExecStart=/opt/sie-mastery-app/.venv/bin/python server.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Security & Privacy Checklist for Self-Hosters
- **Keep `SIE_BIND=127.0.0.1`** whenever Nginx/Caddy terminates TLS on the same host so the Python server is never exposed raw on port 8765.
- **Zero server-side PII:** Learner progress, BKT mastery, FSRS memory intervals, and ADHD error patterns are stored exclusively in the learner's browser (`localStorage`), with optional local JSON export/import in **Settings**.
- **Built-in guardrails:** `server.py` enforces strict `script-src 'self'` CSP, 30 req/min rate limiting on `/api/tts`, 64 KB body limit, SSN PII blocking, and symlink-safe static file serving.
- **License:** MIT — fork, deploy, translate, or adapt freely for schools, study groups, or personal exam prep.
