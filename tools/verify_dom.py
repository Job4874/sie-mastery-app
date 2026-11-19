"""Rigorous DOM-level verifier for SIE Mastery.

Drives a real headless Chromium against the running localhost server and
inspects the actual rendered DOM, not just source markers. Exits non-zero on
any assertion failure or uncaught page error.
"""
import json
import os
import sys
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = os.environ.get("SIE_BASE", "http://127.0.0.1:8765")
FAILURES = []
CONSOLE_ERRORS = []


def check(cond, msg):
    if not cond:
        FAILURES.append(msg)
        print("FAIL:", msg)
    else:
        print("PASS:", msg)


def main():
    global CONSOLE_ERRORS
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context()
        page = ctx.new_page()

        def on_console(m):
            if m.type == "error":
                CONSOLE_ERRORS.append(m.text)

        page.on("console", on_console)
        page.on("pageerror", lambda e: CONSOLE_ERRORS.append("PAGEERROR: " + str(e)))

        # ---- health / TTS endpoint ----
        health = json.load(urllib.request.urlopen(BASE + "/api/health"))
        check(health.get("ok") is True, "health ok")
        check("onnx" in (health.get("engine") or ""), "engine is kokoro-onnx")
        check(isinstance(health.get("cached_clips"), int), "cached_clips is int")

        # TTS round-trip
        body = json.dumps({"text": "Margin is collateral.", "voice": "af_heart"}).encode()
        req = urllib.request.Request(BASE + "/api/tts", data=body,
                                    headers={"Content-Type": "application/json"})
        tts = json.load(urllib.request.urlopen(req))
        check(tts.get("engine", "").startswith("kokoro-onnx"), "TTS engine field")
        check(tts.get("url", "").startswith("/tts/"), "TTS returns clip url")
        clip = urllib.request.urlopen(BASE + tts["url"]).read()
        check(len(clip) > 1000 and clip[:4] == b"RIFF", "TTS clip is a WAV")

        # ---- fresh app load ----
        page.goto(BASE + "/", wait_until="networkidle")
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(500)

        check(page.locator("#coachHome").is_visible(), "coach home visible")
        check(page.locator("#gpuPill").inner_text().lower().find("kokoro onnx") >= 0
              or "onnx" in page.locator("#gpuPill").inner_text().lower(),
              "gpuPill reports ONNX (" + page.locator("#gpuPill").inner_text() + ")")
        check(page.locator("#streak").is_visible(), "streak pill visible")
        check(page.locator("#xp").is_visible(), "xp pill visible")

        # ---- Zero -> First Trade primer ----
        page.click("text=Start from zero")
        page.wait_for_timeout(300)
        check(page.locator("#lessons").is_visible(), "lessons view visible")
        cards = page.locator("#lessons .card").count()
        check(cards >= 6, "primer shows >=6 cards (got %d)" % cards)

        page.click("#lessons button:has-text('3-question')")
        page.wait_for_timeout(300)
        check(page.locator("#quiz").is_visible(), "quiz view visible after primer")
        check(page.locator("#quiz").locator(".opt").count() >= 2, "quiz has options")
        qcount = page.evaluate("quiz.length")
        check(qcount == 3, "primer quiz has 3 questions (got %d)" % qcount)
        timer = page.locator("#timer").inner_text()
        check("untimed" in timer.lower(), "primer quiz untimed (got %r)" % timer)
        tag = page.locator("#qTag").inner_text()
        check("Section" in tag, "primer qTag has section (got %r)" % tag)

        # answer all 3
        for i in range(3):
            opts = page.locator("#opts .opt")
            if opts.count():
                opts.first.click()
            nb = page.locator("#nextBtn")
            if nb.is_visible():
                nb.click()
            page.wait_for_timeout(150)
        page.wait_for_timeout(400)
        check(page.locator("#result").is_visible(), "result view after primer")
        res_text = page.locator("#result").inner_text()
        check("/3" in res_text or "3" in res_text, "result shows score")
        check("Take placement check" in res_text or "placement" in res_text.lower(),
              "result offers placement")

        # ---- Placement (10 questions, all 8 units) ----
        btn = page.locator("#result button:has-text('Take placement check')")
        if btn.count():
            btn.first.click()
        page.wait_for_timeout(300)
        check(page.locator("#quiz").is_visible(), "placement quiz visible")
        pcount = page.evaluate("quiz.length")
        check(pcount == 10, "placement has 10 questions (got %d)" % pcount)
        punits = page.evaluate("JSON.stringify([...new Set(quiz.map(q=>q.unit))].sort())")
        check(punits == "[1,2,3,4,5,6,7,8]", "placement covers all 8 units (got %s)" % punits)

        for i in range(10):
            opts = page.locator("#opts .opt")
            if opts.count():
                opts.first.click()
            nb = page.locator("#nextBtn")
            if nb.is_visible():
                nb.click()
            page.wait_for_timeout(150)
        page.wait_for_timeout(500)
        check(page.locator("#result").is_visible(), "placement result visible")
        pres = page.locator("#result").inner_text()
        check("placed" in pres.lower() or "report" in pres.lower() or "Run it again" in pres,
              "placement result has next actions")

        # ---- Report view ----
        rbtn = page.locator("#report button:has-text('Back'), #result button:has-text('report')")
        if not rbtn.count():
            rbtn = page.locator("button:has-text('See my report')")
        if rbtn.count():
            rbtn.first.click()
        page.wait_for_timeout(300)
        check(page.locator("#report").is_visible(), "report view visible")
        report_text = page.locator("#report").inner_text()
        check("Teacher Report" in report_text or "Ability rating" in report_text,
              "report renders content")
        # back home
        page.evaluate("backHome()")
        page.wait_for_timeout(300)

        # ---- Curriculum view ----
        page.evaluate("showUnits()")
        page.wait_for_timeout(300)
        check(page.locator("#units").is_visible(), "units view visible")
        unit_cards = page.locator("#units .card").count()
        check(unit_cards >= 9, "curriculum shows >=9 cards (got %d)" % unit_cards)
        # open unit 1 lesson
        page.evaluate("showUnitLesson(1)")
        page.wait_for_timeout(300)
        check(page.locator("#units").is_visible(), "unit lesson view visible")
        heading = page.locator("#units h3").inner_text()
        check(len(heading) > 0, "unit lesson has heading (%r)" % heading)
        check(page.locator("#units").locator("button").count() >= 2,
              "unit lesson has action buttons")

        # ---- Exam mode ----
        page.evaluate("quitQuiz()")
        page.wait_for_timeout(200)
        page.evaluate("startQuiz('exam',75)")
        page.wait_for_timeout(300)
        check(page.locator("#quiz").is_visible(), "exam quiz visible")
        ecount = page.evaluate("quiz.length")
        check(ecount == 75, "exam has 75 questions (got %d)" % ecount)
        eunique = page.evaluate("new Set(quiz.map(q=>q.text)).size")
        check(eunique == 75, "exam has 75 unique stems (got %d)" % eunique)
        ecounts = page.evaluate("JSON.stringify(quiz.reduce((a,q)=>{a[q.sec]=(a[q.sec]||0)+1;return a},{}))")
        check(ecounts == '{"1":12,"2":33,"3":23,"4":7}', "exam section mix (got %s)" % ecounts)
        etimer = page.locator("#timer").inner_text()
        check("105:00" in etimer, "exam timer 105:00 (got %r)" % etimer)
        ebad = page.evaluate("quiz.filter(q=>![1,2,3,4].includes(q.sec)).length")
        check(ebad == 0, "no invalid section codes (got %d)" % ebad)

        # ---- Saved clip playback (welcome) ----
        page.evaluate("playWelcome()")
        page.wait_for_timeout(300)
        audio_src = page.evaluate("audio.src")
        check("welcome.wav" in audio_src, "welcome clip src set (%r)" % audio_src)

        # ---- Console errors ----
        # Filter out expected resource 404s for legacy clips we don't ship.
        hard_errors = [e for e in CONSOLE_ERRORS
                       if "PAGEERROR" in e or "TypeError" in e or "ReferenceError" in e
                       or "SyntaxError" in e]
        check(len(hard_errors) == 0,
              "no JS page errors (got %s)" % (hard_errors[:5] if hard_errors else "none"))

        page.close()
        browser.close()

    if FAILURES:
        print("\n=== DOM VERIFIER FAILED ===")
        for f in FAILURES:
            print(" -", f)
        print("console errors seen:", len(CONSOLE_ERRORS))
        for e in CONSOLE_ERRORS[:20]:
            print("   ", e)
        sys.exit(1)
    print("\n=== DOM VERIFIER PASSED ===")
    print("console messages (errors only):", len(CONSOLE_ERRORS))
    for e in CONSOLE_ERRORS[:20]:
        print("   ", e)


if __name__ == "__main__":
    main()
