"""Exhaustive DOM + interaction verifier for SIE Mastery."""
import json, os, sys, urllib.request
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


def run_viewport(page, viewport_name):
    global CONSOLE_ERRORS
    page.set_viewport_size({"width": 390, "height": 844} if viewport_name == "mobile" else {"width": 1280, "height": 900})
    page.goto(BASE + "/", wait_until="networkidle")
    page.evaluate("localStorage.clear()")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(800)

    page.click("#themeToggle")
    page.wait_for_timeout(200)
    theme = page.evaluate("document.documentElement.getAttribute('data-theme')")
    check(theme in ("light", "dark"), f"{viewport_name}: theme toggled ({theme})")
    page.click("#themeToggle")
    page.wait_for_timeout(200)

    check(page.locator("#coachHome").is_visible(), f"{viewport_name}: home visible")

    page.click("button.pink", timeout=10000)
    page.wait_for_timeout(500)
    check(page.locator("#lessons").is_visible(), f"{viewport_name}: primer visible")

    for i in range(min(2, page.locator("#lessons button:has-text('Listen')").count())):
        page.locator("#lessons button:has-text('Listen')").nth(i).click(force=True)
        page.wait_for_timeout(200)
    page.evaluate("playUnitAudio(1)")
    page.wait_for_timeout(200)
    page.evaluate("playLesson(0)")
    page.wait_for_timeout(200)
    audio_src = page.evaluate("audio.src")
    check("audio/" in audio_src, f"{viewport_name}: lesson audio src set ({audio_src})")

    page.click("#lessons button:has-text('3-question')", timeout=10000)
    page.wait_for_timeout(500)
    check(page.locator("#quiz").is_visible(), f"{viewport_name}: quiz visible")
    for i in range(3):
        opts = page.locator("#opts .opt")
        if opts.count():
            opts.first.click()
        nb = page.locator("#nextBtn")
        if nb.is_visible():
            nb.click()
        page.wait_for_timeout(120)
    page.wait_for_timeout(500)
    check(page.locator("#result").is_visible(), f"{viewport_name}: result visible")

    pb = page.locator("#result button:has-text('placement')")
    if pb.count():
        try:
            pb.first.click(timeout=5000)
        except Exception:
            page.evaluate("startPlacement()")
    page.wait_for_timeout(500)
    check(page.locator("#quiz").is_visible(), f"{viewport_name}: placement quiz visible")
    for i in range(10):
        opts = page.locator("#opts .opt")
        if opts.count():
            opts.first.click()
        nb = page.locator("#nextBtn")
        if nb.is_visible():
            nb.click()
        page.wait_for_timeout(120)
    page.wait_for_timeout(500)
    check(page.locator("#result").is_visible(), f"{viewport_name}: placement result visible")

    try:
        page.evaluate("showReport()")
    except Exception:
        pass
    page.wait_for_timeout(800)
    check(page.locator("#report").is_visible(), f"{viewport_name}: report visible")
    page.evaluate("backHome()")
    page.wait_for_timeout(400)

    page.evaluate("showUnits()")
    page.wait_for_timeout(500)
    check(page.locator("#units").is_visible(), f"{viewport_name}: units visible")
    page.evaluate("showUnitLesson(1)")
    page.wait_for_timeout(500)
    check(page.locator("#units h3").is_visible(), f"{viewport_name}: unit lesson heading visible")

    page.evaluate("startUnitQuiz(1)")
    page.wait_for_timeout(500)
    check(page.locator("#quiz").is_visible(), f"{viewport_name}: unit quiz visible")
    for i in range(5):
        opts = page.locator("#opts .opt")
        if opts.count():
            opts.first.click()
        nb = page.locator("#nextBtn")
        if nb.is_visible():
            nb.click()
        page.wait_for_timeout(120)
    page.wait_for_timeout(500)
    check(page.locator("#result").is_visible(), f"{viewport_name}: unit quiz result visible")
    page.evaluate("quitQuiz()")
    page.wait_for_timeout(300)

    page.evaluate("startQuiz('exam',75)")
    page.wait_for_timeout(500)
    check(page.locator("#quiz").is_visible(), f"{viewport_name}: exam visible")
    ecount = page.evaluate("quiz.length")
    check(ecount == 75, f"{viewport_name}: exam 75q (got {ecount})")
    for i in range(5):
        opts = page.locator("#opts .opt")
        if opts.count():
            opts.first.click()
        nb = page.locator("#nextBtn")
        if nb.is_visible():
            nb.click()
        page.wait_for_timeout(120)
    page.evaluate("quitQuiz()")
    page.wait_for_timeout(300)

    try:
        page.evaluate("startQuiz('missed',10)")
        page.wait_for_timeout(300)
        page.evaluate("quitQuiz()")
    except Exception as e:
        check(False, f"{viewport_name}: missed bank crash: {e}")

    page.evaluate("testVoice()")
    page.wait_for_timeout(300)
    page.evaluate("playWelcome()")
    page.wait_for_timeout(300)
    ws = page.evaluate("audio.src")
    check("welcome.wav" in ws, f"{viewport_name}: welcome clip src")

    xp_before = page.evaluate("store.xp")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(500)
    xp_after = page.evaluate("store.xp")
    check(xp_before == xp_after, f"{viewport_name}: localStorage persists (xp {xp_before}->{xp_after})")


def main():
    global CONSOLE_ERRORS
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for vp in ("desktop", "mobile"):
            ctx = browser.new_context()
            page = ctx.new_page()

            def on_console(m):
                if m.type == "error":
                    CONSOLE_ERRORS.append(f"[{vp}] {m.text}")

            page.on("console", on_console)
            page.on("pageerror", lambda e: CONSOLE_ERRORS.append(f"[{vp}] PAGEERROR: {e}"))
            try:
                run_viewport(page, vp)
            except Exception as e:
                check(False, f"{vp}: uncaught exception: {e}")
            page.close()
            ctx.close()

        health = json.load(urllib.request.urlopen(BASE + "/api/health"))
        check(health.get("ok") is True, "health ok")
        check("onnx" in (health.get("engine") or ""), "engine is kokoro-onnx")
        body = json.dumps({"text": "Margin is collateral.", "voice": "af_heart"}).encode()
        req = urllib.request.Request(BASE + "/api/tts", data=body, headers={"Content-Type": "application/json"})
        tts = json.load(urllib.request.urlopen(req))
        check(tts.get("engine", "").startswith("kokoro-onnx"), "TTS engine field")
        clip = urllib.request.urlopen(BASE + tts["url"]).read()
        check(len(clip) > 1000 and clip[:4] == b"RIFF", "TTS clip is a WAV")

        browser.close()

    hard = [e for e in CONSOLE_ERRORS if "PAGEERROR" in e or "TypeError" in e or "ReferenceError" in e or "SyntaxError" in e]
    check(len(hard) == 0, f"no JS page errors (got {len(hard)})")
    check(len(CONSOLE_ERRORS) == 0, f"no console errors (got {len(CONSOLE_ERRORS)})")
    if FAILURES:
        print("\n=== EXHAUSTIVE VERIFIER FAILED ===")
        for f in FAILURES:
            print(" -", f)
        print("console errors:", len(CONSOLE_ERRORS))
        for e in CONSOLE_ERRORS[:30]:
            print("   ", e)
        sys.exit(1)
    print("\n=== EXHAUSTIVE VERIFIER PASSED ===")
    print("console errors:", len(CONSOLE_ERRORS))
    for e in CONSOLE_ERRORS[:30]:
        print("   ", e)


if __name__ == "__main__":
    main()
