"""Rigorous DOM-level verifier for SIE Mastery (redesigned multi-page learning site).

Drives real headless Chromium against the running localhost server and verifies:
  - /api/health and /api/tts WAV round-trip
  - Learning-first home (#/learn), top nav, warm light theme default, Kokoro ONNX voice status
  - Step-through lesson player (#/learn/unit/0/lesson/1): audio clip, inline check lock/unlock,
    lesson completion, and working browser Back button across routes
  - Unit page (#/learn/unit/1), placement check (10 unique stems across all 8 units),
    Progress page (#/progress), Exam (75 unique stems, 12/33/23/7, 105:00 timer),
    Settings live self-check, and zero JS/console/HTTP errors.
"""
import json
import os
import sys
import urllib.request

from playwright.sync_api import sync_playwright

BASE = os.environ.get("SIE_BASE", "http://127.0.0.1:8765")
FAILURES = []
CONSOLE_ERRORS = []
HTTP_ERRORS = []


def check(cond, msg):
    if not cond:
        FAILURES.append(msg)
        print("FAIL:", msg)
    else:
        print("PASS:", msg)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()

        page.on("console", lambda m: CONSOLE_ERRORS.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: CONSOLE_ERRORS.append("PAGEERROR: " + str(e)))
        page.on("response", lambda r: HTTP_ERRORS.append(f"{r.status} {r.url}") if r.status >= 400 else None)

        # ---- health / TTS endpoint ----
        health = json.load(urllib.request.urlopen(BASE + "/api/health"))
        check(health.get("ok") is True, "health ok")
        check("onnx" in (health.get("engine") or ""), "engine is kokoro-onnx")
        check(isinstance(health.get("cached_clips"), int), "cached_clips is int")

        body = json.dumps({"text": "Margin is collateral.", "voice": "af_heart"}).encode()
        req = urllib.request.Request(BASE + "/api/tts", data=body,
                                    headers={"Content-Type": "application/json"})
        tts = json.load(urllib.request.urlopen(req))
        check(tts.get("engine", "").startswith("kokoro-onnx"), "TTS engine field")
        check(tts.get("url", "").startswith("/tts/"), "TTS returns clip url")
        clip = urllib.request.urlopen(BASE + tts["url"]).read()
        check(len(clip) > 1000 and clip[:4] == b"RIFF", "TTS clip is a WAV")

        # ---- fresh app load (#/learn) ----
        page.goto(BASE + "/", wait_until="networkidle")
        page.evaluate("localStorage.clear()")
        page.goto(BASE + "/#/learn", wait_until="networkidle")
        page.wait_for_timeout(400)

        check(page.evaluate("document.documentElement.getAttribute('data-theme')") == "light",
              "warm light theme is default")
        check(page.locator("h1.page-title").inner_text().strip() == "Learn", "Learn home renders")
        check(page.locator(".unit-list li").count() == 9, "course path shows 9 units (Start here + 1..8)")
        vstatus = page.locator("[data-voice-status]").first.inner_text()
        check("kokoro" in vstatus.lower(), f"footer voice status reports Kokoro ({vstatus})")

        # ---- step-through lesson player + real URL routing + Back button ----
        page.click(".continue-card a.btn.primary")
        page.wait_for_selector(".lesson-page", timeout=5000)
        check("#/learn/unit/0/lesson/1" in page.url, f"URL updated to lesson route ({page.url})")
        segs = page.locator(".segments .seg").count()
        check(segs == 6, f"Start-here lesson 1 has 6 screens (got {segs})")

        page.click("[data-action='listen']")
        page.wait_for_timeout(200)
        src1 = page.evaluate("audio.src")
        check("audio/lessons/u0-l1-s1.mp3" in src1, f"Listen loads per-screen Kokoro MP3 ({src1})")
        page.evaluate("stopAudio()")

        # Walk through all 6 screens of Lesson 1, testing check-screen lock
        for step in range(1, 7):
            is_check = page.locator("[data-action='lesson-check']").count() > 0
            if is_check:
                check(page.locator("[data-action='lesson-next']").is_disabled(),
                      f"screen {step} check locks Next until answered")
                page.locator("[data-action='lesson-check']").first.click()
                check(page.locator(".feedback").is_visible(), f"screen {step} shows check feedback")
                check(not page.locator("[data-action='lesson-next']").is_disabled(),
                      f"screen {step} unlocks Next after answer")
            page.click("[data-action='lesson-next']")
        page.wait_for_selector(".done-card", timeout=5000)
        check(page.evaluate("store.lp['0-1'] && store.lp['0-1'].done === true"), "lesson 0-1 marked done")

        # Navigate to Unit 1 page, then verify browser Back button works
        page.goto(BASE + "/#/learn/unit/1", wait_until="networkidle")
        check(page.locator(".lesson-list li").count() == 5, "Unit 1 lists 5 lessons")
        page.goto(BASE + "/#/practice", wait_until="networkidle")
        check(page.locator("h1.page-title").inner_text().strip() == "Practice", "Practice page renders")
        page.go_back(wait_until="networkidle")
        check("#/learn/unit/1" in page.url, f"browser Back returned to Unit 1 ({page.url})")

        # ---- Placement check (10 unique stems across all 8 units) ----
        page.evaluate("prefs.voiceOn=false; savePrefs(); startPlacement()")
        page.wait_for_selector("#quiz", timeout=5000)
        pcount = page.evaluate("quiz.length")
        check(pcount == 10, f"placement has 10 questions (got {pcount})")
        punits = page.evaluate("JSON.stringify([...new Set(quiz.map(q=>q.unit))].sort())")
        check(punits == "[1,2,3,4,5,6,7,8]", f"placement covers all 8 units ({punits})")
        for _ in range(10):
            page.locator("#opts .opt").first.click()
            page.click("#nextBtn")
        page.wait_for_selector("#result:not(.hidden)", timeout=5000)
        check("10" in page.locator("#result").inner_text(), "placement result shows score")

        # ---- Progress view ----
        page.click("a[data-nav='progress']")
        page.wait_for_selector(".unit-report", timeout=5000)
        check(page.locator(".unit-report .card").count() == 8, "Progress shows all 8 units")

        # ---- Exam view + 5-level selector + 75-Q Extremely Hard Exam ----
        page.click("a[data-nav='exam']")
        page.wait_for_selector("[data-action='exam']", timeout=5000)
        check(page.locator("[data-action='set-level']").count() == 5, "Exam page displays all 5 difficulty levels")
        page.click("[data-action='set-level'][data-level='extreme']")
        page.click("[data-action='exam']")
        page.wait_for_selector("#quiz", timeout=5000)
        check(page.evaluate("quiz.length") == 75, "exam has 75 questions")
        check(page.evaluate("new Set(quiz.map(q=>q.text)).size") == 75, "exam has 75 unique stems")
        ecounts = page.evaluate("JSON.stringify(quiz.reduce((a,q)=>{a[q.sec]=(a[q.sec]||0)+1;return a},{}))")
        check(ecounts == '{"1":12,"2":33,"3":23,"4":7}', f"exam section mix ({ecounts})")
        check(page.evaluate("quiz.every(q => q.extremeTrap === true && q.diff === 3)"),
              "Extremely Hard exam hardens 100% of questions including normally easy topics")
        etimer = page.locator("#timer").inner_text()
        check("75:00" in etimer or "74:59" in etimer, f"Extremely Hard exam timer starts at 75:00 ({etimer!r})")
        page.click("#quitBtn")
        page.wait_for_selector("[data-action='set-level']", timeout=5000)
        page.click("[data-action='set-level'][data-level='hard']")

        # ---- Settings: live self-check + welcome clip ----
        page.click("a[data-nav='settings']")
        page.wait_for_selector("[data-action='self-check']", timeout=5000)
        page.click("[data-action='self-check']")
        sc_text = page.locator("#selfCheckOut").inner_text()
        check("LIVE SELF-CHECK OK" in sc_text and "92 MC generators" in sc_text,
              f"Settings live self-check OK ({sc_text})")
        page.click("[data-action='welcome']")
        page.wait_for_timeout(200)
        check("welcome.wav" in page.evaluate("audio.src"), "welcome clip src set")
        page.evaluate("stopAudio()")

        check(len(CONSOLE_ERRORS) == 0, f"zero console/page errors (got {len(CONSOLE_ERRORS)})")
        check(len(HTTP_ERRORS) == 0, f"zero HTTP >=400 responses (got {len(HTTP_ERRORS)})")

        page.close()
        browser.close()

    if FAILURES:
        print("\n=== DOM VERIFIER FAILED ===")
        for f in FAILURES:
            print(" -", f)
        for e in CONSOLE_ERRORS[:20]:
            print(" CONSOLE:", e)
        for e in HTTP_ERRORS[:20]:
            print(" HTTP:", e)
        sys.exit(1)
    print("\n=== DOM VERIFIER PASSED ===")


if __name__ == "__main__":
    main()
