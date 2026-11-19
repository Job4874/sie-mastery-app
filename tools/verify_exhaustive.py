"""Exhaustive DOM + interaction verifier for SIE Mastery across desktop and mobile."""
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


def complete_active_quiz(page):
    n = page.evaluate("quiz.length")
    for _ in range(n):
        if page.locator("#result:not(.hidden)").count():
            break
        if page.evaluate("current && current.type === 'short'"):
            page.fill("#shortAns", page.evaluate("current.model"))
            page.click("[data-action='submit-short']")
        else:
            page.locator("#opts .opt").first.click()
        page.click("#nextBtn")
    page.wait_for_selector("#result:not(.hidden)", timeout=8000)


def run_viewport(page, vp_name):
    size = {"width": 390, "height": 844} if vp_name == "mobile" else {"width": 1280, "height": 900}
    page.set_viewport_size(size)
    page.goto(BASE + "/#/learn", wait_until="networkidle")
    page.evaluate("localStorage.clear()")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(300)

    # Theme & Focus toggles
    page.click("[data-action='toggle-theme']")
    check(page.evaluate("document.documentElement.getAttribute('data-theme')") == "dark",
          f"{vp_name}: dark theme toggled on")
    page.click("[data-action='toggle-theme']")
    check(page.evaluate("document.documentElement.getAttribute('data-theme')") == "light",
          f"{vp_name}: light theme restored")
    page.click("[data-action='toggle-adhd']")
    check(page.evaluate("isAdhd()"), f"{vp_name}: focus mode toggled on")
    page.click("[data-action='toggle-adhd']")
    check(not page.evaluate("isAdhd()"), f"{vp_name}: focus mode toggled off")

    # Disable read-aloud during rapid clicks
    page.evaluate("prefs.voiceOn=false; savePrefs()")

    # Walk Unit 0 Lesson 1 and Lesson 2 via real links
    for lnum in (1, 2):
        page.goto(f"{BASE}/#/learn/unit/0/lesson/{lnum}", wait_until="networkidle")
        total = page.evaluate(f"SIE.units[0].lessons[{lnum - 1}].screens.length")
        page.click("[data-action='listen']")
        page.wait_for_timeout(150)
        check(f"audio/lessons/u0-l{lnum}-s1.mp3" in page.evaluate("audio.src"),
              f"{vp_name}: u0-l{lnum}-s1.mp3 audio src set")
        page.evaluate("stopAudio()")
        for _ in range(total):
            if page.locator("[data-action='lesson-check']").count():
                page.locator("[data-action='lesson-check']").first.click()
            page.click("[data-action='lesson-next']")
        page.wait_for_selector(".done-card", timeout=5000)
    check(page.evaluate("store.zero && store.zero.done === true"), f"{vp_name}: Start here completed")

    # Library route & saved WAV clip
    page.goto(BASE + "/#/library", wait_until="networkidle")
    check(page.locator("article.article").count() == 6, f"{vp_name}: Library shows 6 articles")
    page.locator("[data-action='library-audio']").first.click()
    page.wait_for_timeout(150)
    check("audio/lesson-1-sipc.wav" in page.evaluate("audio.src"), f"{vp_name}: Library WAV plays")
    page.evaluate("stopAudio()")

    # Unit 1 page & overview WAV + Unit 1 quiz
    page.goto(BASE + "/#/learn/unit/1", wait_until="networkidle")
    check(page.locator(".lesson-list li").count() == 5, f"{vp_name}: Unit 1 lists 5 lessons")
    page.click("[data-action='unit-overview-audio']")
    page.wait_for_timeout(150)
    check("audio/lesson-1-regulators.wav" in page.evaluate("audio.src"), f"{vp_name}: Unit 1 overview WAV plays")
    page.evaluate("stopAudio()")
    page.click("[data-action='unit-quiz']")
    page.wait_for_selector("#quiz", timeout=5000)
    complete_active_quiz(page)
    check(page.locator("#result").is_visible(), f"{vp_name}: Unit 1 quiz result visible")

    # Practice page: switch difficulty + 5-Q Quick sprint + Missed review
    page.click("a[data-nav='practice']")
    page.wait_for_selector(".level-picker", timeout=5000)
    page.click("[data-action='set-level'][data-level='veryhard']")
    check(page.evaluate("curLevel()") == "veryhard", f"{vp_name}: difficulty switched to veryhard")
    page.click("[data-action='set-level'][data-level='hard']")
    page.click("[data-action='sprint5']")
    page.wait_for_selector("#quiz", timeout=5000)
    check(page.evaluate("quiz.length") == 5, f"{vp_name}: Quick sprint is 5 questions")
    complete_active_quiz(page)

    # Progress page
    page.click("a[data-nav='progress']")
    page.wait_for_selector(".unit-report", timeout=5000)
    check(page.locator(".unit-report .card").count() == 8, f"{vp_name}: Progress shows 8 units")

    # Exam page -> 75 Qs -> answer 5 -> Quit
    page.click("a[data-nav='exam']")
    page.click("[data-action='exam']")
    page.wait_for_selector("#quiz", timeout=5000)
    check(page.evaluate("quiz.length") == 75, f"{vp_name}: Exam has 75 questions")
    for _ in range(5):
        page.locator("#opts .opt").first.click()
        page.click("#nextBtn")
    page.click("#quitBtn")
    page.wait_for_selector("[data-action='exam']", timeout=5000)

    # Settings persistence + self-check
    page.click("a[data-nav='settings']")
    page.select_option("#voiceRate", "1.15")
    page.click("[data-action='self-check']")
    check("LIVE SELF-CHECK OK" in page.locator("#selfCheckOut").inner_text(), f"{vp_name}: Settings self-check passed")
    xp_before = page.evaluate("store.xp")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(200)
    check(page.evaluate("store.xp") == xp_before and page.evaluate("getVoiceRate()") == 1.15,
          f"{vp_name}: localStorage persists XP ({xp_before}) and voice rate (1.15)")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for vp in ("desktop", "mobile"):
            ctx = browser.new_context()
            page = ctx.new_page()
            page.on("console", lambda m, v=vp: CONSOLE_ERRORS.append(f"[{v}] {m.text}") if m.type == "error" else None)
            page.on("pageerror", lambda e, v=vp: CONSOLE_ERRORS.append(f"[{v}] PAGEERROR: {e}"))
            page.on("response", lambda r, v=vp: HTTP_ERRORS.append(f"[{v}] {r.status} {r.url}") if r.status >= 400 else None)
            try:
                run_viewport(page, vp)
            except Exception as exc:
                check(False, f"{vp}: uncaught exception: {exc}")
            page.close()
            ctx.close()

        health = json.load(urllib.request.urlopen(BASE + "/api/health"))
        check(health.get("ok") is True and "onnx" in (health.get("engine") or ""), "health ok with onnx")
        body = json.dumps({"text": "Margin is collateral.", "voice": "af_heart"}).encode()
        req = urllib.request.Request(BASE + "/api/tts", data=body, headers={"Content-Type": "application/json"})
        tts = json.load(urllib.request.urlopen(req))
        clip = urllib.request.urlopen(BASE + tts["url"]).read()
        check(len(clip) > 1000 and clip[:4] == b"RIFF", "TTS clip is a WAV")
        browser.close()

    check(len(CONSOLE_ERRORS) == 0, f"zero console/page errors (got {len(CONSOLE_ERRORS)})")
    check(len(HTTP_ERRORS) == 0, f"zero HTTP >=400 responses (got {len(HTTP_ERRORS)})")
    if FAILURES:
        print("\n=== EXHAUSTIVE VERIFIER FAILED ===")
        for f in FAILURES:
            print(" -", f)
        for e in CONSOLE_ERRORS[:20]:
            print(" CONSOLE:", e)
        for e in HTTP_ERRORS[:20]:
            print(" HTTP:", e)
        sys.exit(1)
    print("\n=== EXHAUSTIVE VERIFIER PASSED ===")


if __name__ == "__main__":
    main()
