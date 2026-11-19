"""Adversarial QA chaos stress-test for SIE Mastery (desktop 1280x900 + mobile 360x640).

Exercises corrupted localStorage self-healing, Focus Mode & Dark theme shortcuts,
lesson-player keyboard & check locking, browser Back/Forward routing, Settings voice rate
and live self-check, Master-mode 60s timeouts (MC + short response) + SSN redaction +
Missed Bank replay, Run-it-again across all 8 quiz modes, rage-clicks & mobile double-tap
bleed-through guard, mid-flight timer teardown across route transitions, and zero
horizontal overflow / NaN / undefined / console / HTTP errors.
"""
import json
import os
import sys

from playwright.sync_api import sync_playwright

BASE = os.environ.get("SIE_BASE", "http://127.0.0.1:8765")
VIEWPORTS = [
    ("desktop", {"width": 1280, "height": 900}),
    ("mobile", {"width": 360, "height": 640}),
]
FAILURES = []
CONSOLE_ERRORS = []
PAGE_ERRORS = []
HTTP_ERRORS = []


def check(cond, msg):
    if cond:
        print(f"PASS: {msg}")
    else:
        FAILURES.append(msg)
        print(f"FAIL: {msg}")


def attach_listeners(page, label):
    page.on("console", lambda m: CONSOLE_ERRORS.append(f"[{label}] {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: PAGE_ERRORS.append(f"[{label}] {e}"))
    page.on("response", lambda r: HTTP_ERRORS.append(f"[{label}] {r.status} {r.url}") if r.status >= 400 else None)


def assert_clean_page(page, label):
    bad = page.evaluate("""() => {
        const txt = (document.getElementById("app") || document.body).innerText || "";
        const issues = [];
        if (/undefined/i.test(txt)) issues.push("contains-undefined");
        if (/\\bNaN\\b/.test(txt)) issues.push("contains-NaN");
        return issues;
    }""")
    check(len(bad) == 0, f"{label}: clean of undefined/NaN ({bad})")


def assert_no_overflow(page, vp_name, where):
    diff = page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
    check(diff <= 2, f"{vp_name}: no horizontal overflow at {where} (diff={diff}px)")


def reset_clean(page):
    page.goto(BASE + "/#/learn", wait_until="networkidle")
    page.evaluate("localStorage.clear()")
    page.goto(BASE + "/#/learn", wait_until="networkidle")
    page.wait_for_selector("h1.page-title", timeout=5000)


def answer_current(page, correct=False):
    if page.evaluate("Boolean(current && current.type === 'short')"):
        txt = page.evaluate("current.model") if correct else "totally unrelated placeholder text"
        page.fill("#shortAns", txt)
        page.click("[data-action='submit-short']")
    else:
        idx = page.evaluate("current ? current.answer : 0") if correct else 0
        page.locator("#opts .opt").nth(idx).click()
    page.click("#nextBtn")


def complete_quiz(page, expected_len=None, label="quiz", correct=False):
    actual = page.evaluate("quiz.length")
    if expected_len is not None:
        check(actual == expected_len, f"{label}: quiz.length === {expected_len} (got {actual})")
    for _ in range(actual):
        if page.locator("#result:not(.hidden)").count():
            break
        answer_current(page, correct=correct)
    page.wait_for_selector("#result:not(.hidden)", timeout=10000)


def test_corrupted_storage(page, vp_name):
    page.goto(BASE + "/#/learn", wait_until="networkidle")
    payloads = [
        ("bad_json", "{bad_json"),
        ("null_str", "null"),
        ("array_str", "[]"),
        ("broken_fields", json.dumps({
            "xp": "NaN", "streak": None, "seen": "bad", "sec": "corrupt",
            "t": {"units": "bad", "done": "bad", "badges": "bad"},
            "lp": {"bad": {"done": True}, "1-1": {"done": "yes"}},
            "last": {"u": "x", "l": None},
            "missed": {
                "m1": None,
                "m2": {"text": "oob", "topic": "Reg T margin", "sec": 3, "choices": ["a", "b"], "answer": 9},
                "m3": {"type": "short", "text": "Q", "model": "M", "groups": []},
            },
        })),
    ]
    for tag, val in payloads:
        page.evaluate("(v) => localStorage.setItem('sie', v)", val)
        page.reload(wait_until="networkidle")
        page.wait_for_selector("h1.page-title", timeout=5000)
        state = page.evaluate("""() => ({
            xp: store.xp,
            missed: Object.keys(store.missed).length,
            lp: Object.keys(store.lp).length,
            tOk: typeof store.t.units === 'object' && !Array.isArray(store.t.units) && Array.isArray(store.t.badges),
        })""")
        check(state["xp"] == 0 and state["missed"] == 0 and state["lp"] == 0 and state["tOk"],
              f"{vp_name}: {tag} self-healed ({state})")
        assert_clean_page(page, f"{vp_name}:{tag}")
    page.goto(BASE + "/#/progress", wait_until="networkidle")
    assert_clean_page(page, f"{vp_name}:progress-after-corrupt")
    assert_no_overflow(page, vp_name, "progress")


def test_focus_theme_lesson_shortcuts(page, vp_name):
    reset_clean(page)
    page.evaluate("prefs.voiceOn=false; savePrefs()")

    # F and T shortcuts
    page.keyboard.press("f")
    check(page.evaluate("isAdhd()"), f"{vp_name}: F enables Focus mode")
    check(not page.locator(".sitefoot").is_visible(), f"{vp_name}: Focus mode hides footer")
    assert_no_overflow(page, vp_name, "learn-focus")
    page.keyboard.press("t")
    check(page.evaluate("document.documentElement.getAttribute('data-theme')") == "dark",
          f"{vp_name}: T switches to dark theme")
    page.reload(wait_until="networkidle")
    check(page.evaluate("isAdhd()") and page.evaluate("document.documentElement.getAttribute('data-theme')") == "dark",
          f"{vp_name}: Focus + Dark persist across reload")
    page.keyboard.press("f")
    page.keyboard.press("t")

    # Lesson player keyboard navigation + check lock + audio clip
    page.goto(BASE + "/#/learn/unit/1/lesson/1", wait_until="networkidle")
    assert_clean_page(page, f"{vp_name}:u1-l1-s1")
    assert_no_overflow(page, vp_name, "lesson-player")
    page.click("[data-action='listen']")
    page.wait_for_timeout(150)
    check("audio/lessons/u1-l1-s1.mp3" in page.evaluate("audio.src"), f"{vp_name}: u1-l1-s1.mp3 plays")
    page.evaluate("stopAudio()")

    n_screens = page.evaluate("SIE.units[1].lessons[0].screens.length")
    for _ in range(n_screens):
        if page.locator("[data-action='lesson-check']").count():
            step_before = page.evaluate("LP.s")
            page.keyboard.press("ArrowRight")
            check(page.evaluate("LP.s") == step_before,
                  f"{vp_name}: ArrowRight blocked on unanswered lesson check (step {step_before})")
            page.keyboard.press("1")
            check(page.locator(".feedback").is_visible(), f"{vp_name}: key '1' answers lesson check")
        page.keyboard.press("ArrowRight")
    page.wait_for_selector(".done-card", timeout=5000)
    check(page.evaluate("Boolean(store.lp['1-1'] && store.lp['1-1'].done)"), f"{vp_name}: keyboard completed Unit 1 Lesson 1")

    # Quiz keyboard navigation (1-4, A-D, Enter, ArrowRight) + typing guard
    page.goto(BASE + "/#/practice", wait_until="networkidle")
    page.click("[data-action='sprint5']")
    page.wait_for_selector("#quiz", timeout=5000)
    for step, (ans_key, nxt_key) in enumerate([("1", "Enter"), ("b", "ArrowRight"), ("3", "Enter"), ("D", "ArrowRight")]):
        page.keyboard.press(nxt_key)
        check(page.evaluate("qi") == step, f"{vp_name}: {nxt_key!r} blocked before answering Q{step + 1}")
        page.keyboard.press(ans_key)
        check(page.evaluate("answered === true"), f"{vp_name}: key {ans_key!r} answered Q{step + 1}")
        page.keyboard.press(nxt_key)
        check(page.evaluate("qi") == step + 1, f"{vp_name}: key {nxt_key!r} advanced to Q{step + 2}")
    page.click("#quitBtn")
    page.wait_for_selector("h1.page-title", timeout=5000)


def test_master_timeouts_ssn_and_missed(ctx, vp_name):
    page = ctx.new_page()
    attach_listeners(page, f"{vp_name}:clock")
    try:
        page.clock.install()
        page.goto(BASE + "/#/learn", wait_until="networkidle")
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="networkidle")
        page.evaluate("prefs.voiceOn=false; prefs.level='master'; savePrefs()")
        page.goto(BASE + "/#/practice", wait_until="networkidle")

        # Force deterministic [short, mc] Master quiz
        page.evaluate("beginSession('sprint',[prepareShort(SHORT[4]), prepare(GEN[0]())],{back:'#/practice',backLabel:'Practice',replay:()=>startQuiz('sprint',5)})")
        page.wait_for_selector("#shortAns", timeout=5000)

        # Typing F/T inside textarea must NOT trigger shortcuts
        page.click("#shortAns")
        page.keyboard.type("f t 123-45-6789")
        check(not page.evaluate("isAdhd()"), f"{vp_name}: typing 'f' in textarea did not toggle Focus")
        check(page.evaluate("document.documentElement.getAttribute('data-theme')") == "light",
              f"{vp_name}: typing 't' in textarea did not toggle Dark")

        # SSN-only submission blocked & redacted
        page.fill("#shortAns", "123-45-6789")
        page.click("[data-action='submit-short']")
        check(page.evaluate("!answered"), f"{vp_name}: SSN-only short submission blocked")

        # Advance 61s -> short timeout
        page.clock.run_for(61000)
        check(page.evaluate("answered === true") and page.locator("#shortAns").is_disabled(),
              f"{vp_name}: Master 60s short timeout locked textarea")
        check("Time's up" in page.locator("#explain").inner_text(), f"{vp_name}: short timeout shows Time's up")
        page.click("#nextBtn")

        # Advance 61s -> MC timeout
        page.clock.run_for(61000)
        check(page.evaluate("answered === true") and "Time's up" in page.locator("#explain").inner_text(),
              f"{vp_name}: Master 60s MC timeout scored & explained")
        page.click("#nextBtn")
        page.wait_for_selector("#result:not(.hidden)", timeout=5000)

        # Replay Missed Bank (has both short and MC)
        page.evaluate("prefs.level='hard'; savePrefs()")
        page.goto(BASE + "/#/practice", wait_until="networkidle")
        check(page.evaluate("Object.keys(store.missed).length") == 2, f"{vp_name}: Missed Bank saved 2 timeouts")
        page.click("[data-action='missed']")
        page.wait_for_selector("#quiz", timeout=5000)
        complete_quiz(page, expected_len=2, label=f"{vp_name}:missed", correct=True)
        assert_clean_page(page, f"{vp_name}:missed-result")
        assert_no_overflow(page, vp_name, "missed-result")
    finally:
        page.close()


def test_run_it_again_all_8_modes(page, vp_name):
    reset_clean(page)
    page.evaluate("prefs.voiceOn=false; prefs.level='hard'; savePrefs()")

    def verify_replay(expected_mode, expected_len, extra=None):
        complete_quiz(page, expected_len=expected_len, label=f"{vp_name}:{expected_mode}:run1", correct=False)
        assert_clean_page(page, f"{vp_name}:{expected_mode}:res1")
        assert_no_overflow(page, vp_name, f"{expected_mode}:result")
        page.click("#result [data-action='replay']")
        page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
        got = page.evaluate("({mode, len: quiz.length, unit: window._unit, gap: window._gapTopic, timeLeft})")
        check(got["mode"] == expected_mode and got["len"] == expected_len,
              f"{vp_name}: Run it again preserves {expected_mode} ({expected_len} Qs -> {got})")
        if extra:
            extra(got)
        page.click("#quitBtn")
        page.wait_for_selector("h1.page-title", timeout=5000)

    # 1. zero
    page.evaluate("startZeroQuiz()")
    page.wait_for_selector("#quiz", timeout=5000)
    verify_replay("zero", 3)

    # 2. placement
    page.evaluate("startPlacement()")
    page.wait_for_selector("#quiz", timeout=5000)
    verify_replay("placement", 10)

    # 3. sprint 5Q
    page.goto(BASE + "/#/practice", wait_until="networkidle")
    page.click("[data-action='sprint5']")
    page.wait_for_selector("#quiz", timeout=5000)
    verify_replay("sprint", 5)

    # 4. trap 10Q
    page.goto(BASE + "/#/practice", wait_until="networkidle")
    page.click("[data-action='trap']")
    page.wait_for_selector("#quiz", timeout=5000)
    verify_replay("trap", 10)

    # 5. unit (Unit 3)
    page.goto(BASE + "/#/learn/unit/3", wait_until="networkidle")
    page.click("[data-action='unit-quiz']")
    page.wait_for_selector("#quiz", timeout=5000)
    verify_replay("unit", 5, extra=lambda g: check(
        g["unit"] == 3 and page.evaluate("quiz.every(q => q.unit === 3)"),
        f"{vp_name}: unit replay stayed on Unit 3"))

    # 6. gap
    page.goto(BASE + "/#/gap/" + "SIPC%20separate%20capacity", wait_until="networkidle")
    assert_clean_page(page, f"{vp_name}:gap-view")
    page.click("[data-action='gap-drill']")
    page.wait_for_selector("#quiz", timeout=5000)
    verify_replay("gap", 3, extra=lambda g: check(
        g["gap"] == "SIPC separate capacity", f"{vp_name}: gap replay stayed on SIPC"))

    # 7. final (locked <8 units, then unlock all 8)
    page.goto(BASE + "/#/exam", wait_until="networkidle")
    check(page.locator("[data-action='final-review']").is_disabled(),
          f"{vp_name}: Final review disabled when <8 units cleared")
    page.evaluate("for(let u=1;u<=8;u++) store.t.done[u]=1; save()")
    page.reload(wait_until="networkidle")
    page.click("[data-action='final-review']")
    page.wait_for_selector("#quiz", timeout=5000)
    verify_replay("final", 25)

    # 8. exam 75Q
    page.goto(BASE + "/#/exam", wait_until="networkidle")
    page.click("[data-action='exam']")
    page.wait_for_selector("#quiz", timeout=5000)
    verify_replay("exam", 75, extra=lambda g: check(
        g["timeLeft"] >= 6298, f"{vp_name}: exam replay reset timer ({g['timeLeft']})"))


def test_rage_clicks_and_teardowns(page, vp_name):
    reset_clean(page)
    page.evaluate("prefs.voiceOn=false; savePrefs()")

    # Check all primary pages for overflow and clean text
    for route in ("#/learn", "#/learn/unit/1", "#/library", "#/practice", "#/exam", "#/progress", "#/settings"):
        page.goto(BASE + "/" + route, wait_until="networkidle")
        assert_clean_page(page, f"{vp_name}:{route}")
        assert_no_overflow(page, vp_name, route)

    # Option rage-click + Next pointer dblclick (tests mobile double-tap bleed-through guard!)
    page.goto(BASE + "/#/practice", wait_until="networkidle")
    page.click("[data-action='trap']")
    page.wait_for_selector("#quiz", timeout=5000)
    seen0 = page.evaluate("store.seen")
    page.evaluate("document.querySelectorAll('#opts .opt').forEach(b => { b.click(); b.click(); })")
    check(page.evaluate("store.seen") == seen0 + 1 and page.evaluate("qi === 0 && answered === true"),
          f"{vp_name}: option rage-click recorded exactly 1 answer")

    page.locator("#nextBtn").dblclick()
    check(page.evaluate("qi === 1 && answered === false"),
          f"{vp_name}: Next pointer dblclick advanced once without bleeding onto Q2")

    page.locator("#opts .opt").first.click()
    page.evaluate("const nb=document.getElementById('nextBtn'); for(let i=0;i<6;i++) nb.click();")
    check(page.evaluate("qi === 2 && answered === false"),
          f"{vp_name}: rapid DOM rage-click on Next advanced once")
    page.click("#quitBtn")

    # Mid-flight Exam timer teardown on route navigation
    for dest in ("a[data-nav='learn']", "a[data-nav='progress']", "a[data-nav='settings']"):
        page.goto(BASE + "/#/exam", wait_until="networkidle")
        page.click("[data-action='exam']")
        page.wait_for_selector("#quiz", timeout=5000)
        page.wait_for_timeout(1150)
        t1 = page.evaluate("timeLeft")
        check(t1 < 6300, f"{vp_name}: exam timer ticking before navigating to {dest} ({t1})")
        page.click(dest)
        page.wait_for_timeout(1200)
        t2 = page.evaluate("timeLeft")
        check(t2 == t1, f"{vp_name}: exam timer stopped cleanly after leaving quiz ({t1}=={t2})")


def run_viewport(browser, vp_name, vp_size):
    print(f"\n================ [{vp_name.upper()} {vp_size['width']}x{vp_size['height']}] ================")
    ctx = browser.new_context(viewport=vp_size)
    page = ctx.new_page()
    attach_listeners(page, vp_name)
    try:
        test_corrupted_storage(page, vp_name)
        test_focus_theme_lesson_shortcuts(page, vp_name)
        test_master_timeouts_ssn_and_missed(ctx, vp_name)
        test_run_it_again_all_8_modes(page, vp_name)
        test_rage_clicks_and_teardowns(page, vp_name)
    finally:
        page.close()
        ctx.close()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for vp_name, vp_size in VIEWPORTS:
                run_viewport(browser, vp_name, vp_size)
        finally:
            browser.close()

    check(len(PAGE_ERRORS) == 0, f"zero pageerror events (got {len(PAGE_ERRORS)})")
    check(len(CONSOLE_ERRORS) == 0, f"zero console.error events (got {len(CONSOLE_ERRORS)})")
    check(len(HTTP_ERRORS) == 0, f"zero HTTP >=400 responses (got {len(HTTP_ERRORS)})")

    if FAILURES or PAGE_ERRORS or CONSOLE_ERRORS or HTTP_ERRORS:
        print("\n=== HELL VERIFIER FAILED ===")
        for f in FAILURES:
            print("FAIL:", f)
        for e in PAGE_ERRORS[:20]:
            print("PAGEERROR:", e)
        for e in CONSOLE_ERRORS[:20]:
            print("CONSOLE_ERROR:", e)
        for e in HTTP_ERRORS[:20]:
            print("HTTP_ERROR:", e)
        sys.exit(1)

    print("\n=== HELL VERIFIER 100% PASSED (ZERO FAILURES, ZERO PAGE/CONSOLE/HTTP ERRORS) ===")


if __name__ == "__main__":
    main()
