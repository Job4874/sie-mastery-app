"""Adversarial QA chaos stress-test for SIE Mastery (desktop 1280x900 + mobile 360x640).

Exercises corrupted localStorage self-healing, ADHD Focus Filter, F/T/1-4/A-D/Enter/ArrowRight
shortcuts, 5-Q Micro-Sprint, live self-check, voice playbackRate, micro-chunking, Master-mode
60s timeouts (MC + short response) + Missed Bank replay, Run-it-again across all 8 modes,
rage-clicks, mid-flight timer teardown, and zero-NaN/undefined/console-error invariants.
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
    """Record and print a pass/fail assertion."""
    if cond:
        print(f"PASS: {msg}")
    else:
        FAILURES.append(msg)
        print(f"FAIL: {msg}")


def attach_listeners(page, label):
    """Attach console, pageerror, and HTTP >= 400 listeners to a page."""
    def on_console(msg):
        if msg.type == "error":
            CONSOLE_ERRORS.append(f"[{label}] {msg.text}")

    def on_pageerror(err):
        PAGE_ERRORS.append(f"[{label}] {err}")

    def on_response(resp):
        if resp.status >= 400:
            HTTP_ERRORS.append(f"[{label}] {resp.status} {resp.url}")

    page.on("console", on_console)
    page.on("pageerror", on_pageerror)
    page.on("response", on_response)


def assert_clean_visible_views(page, label):
    """Assert no visible app view contains 'undefined' or 'NaN'."""
    bad = page.evaluate("""() => {
        const ids = ["home", "quiz", "result", "units", "report", "lessons"];
        const issues = [];
        for (const id of ids) {
            const el = document.getElementById(id);
            if (!el || el.classList.contains("hidden")) continue;
            const txt = el.innerText || "";
            if (/undefined/i.test(txt)) issues.push(id + ":contains-undefined");
            if (/\\bNaN\\b/.test(txt)) issues.push(id + ":contains-NaN");
        }
        const bar = document.getElementById("adhdBar");
        if (bar && !bar.classList.contains("hidden")) {
            const bt = bar.innerText || "";
            if (/undefined/i.test(bt)) issues.push("adhdBar:contains-undefined");
            if (/\\bNaN\\b/.test(bt)) issues.push("adhdBar:contains-NaN");
        }
        return issues;
    }""")
    check(len(bad) == 0, f"{label}: visible views clean of undefined/NaN ({bad})")


def assert_no_horizontal_overflow(page, vp_name, where):
    """Check viewport does not horizontally overflow."""
    overflow = page.evaluate(
        "() => document.documentElement.scrollWidth - window.innerWidth"
    )
    check(overflow <= 2, f"{vp_name}: no horizontal overflow at {where} (diff={overflow}px)")


def set_voice_enabled(page, enabled):
    """Toggle the #voiceOn checkbox explicitly."""
    page.evaluate("""(on) => {
        const cb = document.getElementById("voiceOn");
        if (cb) cb.checked = !!on;
        if (!on && typeof stopAudio === "function") stopAudio();
    }""", enabled)


def answer_current_question(page, correct=False):
    """Answer whichever question (MC or short response) is active and advance."""
    is_short = page.evaluate("Boolean(current && current.type === 'short')")
    if is_short:
        model = page.evaluate("current.model || 'Initial margin 50% Federal Reserve maintenance 25% FINRA.'")
        page.fill("#shortAns", model)
        page.click("#opts button:has-text('Submit answer')")
    else:
        idx = page.evaluate("current ? current.answer : 0") if correct else 0
        page.locator("#opts .opt").nth(idx).click()
    page.locator("#nextBtn").click()


def complete_quiz(page, expected_len=None, label="quiz", correct=False):
    """Play through the active quiz until #result becomes visible."""
    actual_len = page.evaluate("quiz.length")
    if expected_len is not None:
        check(actual_len == expected_len, f"{label}: quiz.length === {expected_len} (got {actual_len})")
    for idx in range(actual_len):
        if page.locator("#result").is_visible():
            break
        answer_current_question(page, correct=correct)
        if idx % 20 == 19:
            page.wait_for_timeout(10)
    page.wait_for_selector("#result:not(.hidden)", timeout=10000)


def reset_clean(page):
    """Clear localStorage and reload cleanly."""
    page.goto(BASE + "/", wait_until="networkidle")
    page.evaluate("localStorage.clear()")
    page.reload(wait_until="networkidle")
    page.wait_for_selector("#coachHome", state="visible", timeout=10000)


def test_corrupted_local_storage(page, vp_name):
    """Verify loadStore() self-heals from malformed JSON, null, array, and broken missed map."""
    page.goto(BASE + "/", wait_until="networkidle")

    corrupt_payloads = [
        ("bad_json", "{bad_json"),
        ("null_str", "null"),
        ("array_str", "[]"),
        ("broken_missed", json.dumps({
            "xp": "NaN",
            "streak": None,
            "seen": "bad",
            "sec": "corrupt",
            "t": "corrupt",
            "missed": {
                "m1": None,
                "m2": "not-an-obj",
                "m3": {"text": 123, "choices": ["a", "b"], "answer": 0},
                "m4": {"text": "too few", "choices": ["only1"], "answer": 0},
                "m5": {"text": "oob", "choices": ["a", "b"], "answer": 9},
                "m6": {"type": "short", "groups": "bad", "text": "x", "model": "y"},
                "m7": {"type": "short", "groups": [], "text": "missing-model"},
            },
        })),
    ]
    for tag, payload in corrupt_payloads:
        page.evaluate("(val) => localStorage.setItem('sie', val)", payload)
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(200)
        check(page.locator("#home").is_visible(), f"{vp_name}: {tag} renders #home cleanly")
        check(page.locator("#coachHome").is_visible(), f"{vp_name}: {tag} renders #coachHome")
        state = page.evaluate("""() => ({
            xp: document.getElementById("xp").textContent,
            streak: document.getElementById("streak").textContent,
            missedCount: document.getElementById("missedCount").textContent,
            missedKeys: Object.keys(store.missed || {}).length,
            isObj: Boolean(store && typeof store === "object" && !Array.isArray(store)),
            tOk: Boolean(store.t && typeof store.t.units === "object" && typeof store.t.done === "object"),
        })""")
        check(
            state["isObj"] and state["tOk"] and state["missedKeys"] == 0
            and state["xp"] == "0" and state["missedCount"] == "0",
            f"{vp_name}: {tag} self-healed store ({state})",
        )
        assert_clean_visible_views(page, f"{vp_name}:corrupt-{tag}")

    # Adversarial partial corruption: truthy strings inside store.t and incomplete short missed entry
    page.evaluate(
        "(val) => localStorage.setItem('sie', val)",
        json.dumps({"t": {"units": "bad", "done": "bad", "badges": "bad"}}),
    )
    page.reload(wait_until="networkidle")
    t_healed = page.evaluate(
        "() => Boolean(store.t && typeof store.t.units === 'object' && !Array.isArray(store.t.units) && typeof store.t.done === 'object' && !Array.isArray(store.t.done) && Array.isArray(store.t.badges))"
    )
    check(t_healed, f"{vp_name}: partial-corrupt store.t subfields sanitized to object/array")
    try:
        page.click("#home button:has-text('See my report')")
        page.wait_for_selector("#report:not(.hidden)", timeout=3000)
        assert_clean_visible_views(page, f"{vp_name}:report-after-partial-corrupt")
        page.click("#report button[onclick='backHome()']")
    except Exception as exc:
        check(False, f"{vp_name}: showReport crashed after partial-corrupt store.t: {exc}")

    # Incomplete short missed entry missing topic/unit/rule
    page.evaluate(
        "(val) => localStorage.setItem('sie', val)",
        json.dumps({"missed": {"s1": {"type": "short", "text": "Q", "model": "M", "groups": []}}}),
    )
    page.reload(wait_until="networkidle")
    healed_short_missed = page.evaluate("Object.keys(store.missed).length === 0")
    check(healed_short_missed, f"{vp_name}: incomplete short missed entry (no topic/unit) dropped by cleanMissedMap")

    # Reset cleanly and test empty Missed Bank toast
    reset_clean(page)
    page.click("#home button:has-text('Review Missed Bank')")
    page.wait_for_timeout(150)
    toast = page.locator("#toast").inner_text()
    check("empty" in toast.lower(), f"{vp_name}: empty missed bank shows toast ({toast!r})")
    assert_no_horizontal_overflow(page, vp_name, "home-after-heal")


def test_adhd_shortcuts_voice_and_chunks(page, vp_name):
    """Test #adhdToggle, F/T keys, #adhdBar, 5-Q Micro-Sprint, selfCheck, voiceRate, chunking."""
    reset_clean(page)
    page.evaluate("document.activeElement && document.activeElement.blur && document.activeElement.blur()")

    # #adhdToggle button toggle
    page.click("#adhdToggle")
    check(page.evaluate("document.documentElement.getAttribute('data-adhd')") == "focus",
          f"{vp_name}: #adhdToggle turns focus ON")
    check(page.locator("#adhdToggle").get_attribute("aria-pressed") == "true",
          f"{vp_name}: #adhdToggle aria-pressed=true")
    check(page.locator("#adhdBar").is_visible(), f"{vp_name}: #adhdBar visible when ADHD ON")

    page.click("#adhdToggle")
    check(page.evaluate("document.documentElement.getAttribute('data-adhd')") == "off",
          f"{vp_name}: #adhdToggle turns focus OFF")
    check(page.locator("#adhdBar").is_hidden(), f"{vp_name}: #adhdBar hidden when ADHD OFF")

    # F and T keyboard shortcuts
    theme0 = page.evaluate("document.documentElement.getAttribute('data-theme')")
    page.keyboard.press("f")
    check(page.evaluate("document.documentElement.getAttribute('data-adhd')") == "focus",
          f"{vp_name}: key 'f' enables ADHD focus")
    check(page.locator("#adhdBar").is_visible(), f"{vp_name}: #adhdBar visible via 'f'")
    page.keyboard.press("F")
    check(page.evaluate("document.documentElement.getAttribute('data-adhd')") == "off",
          f"{vp_name}: key 'F' disables ADHD focus")
    page.keyboard.press("f")  # leave ON for #adhdBar checks

    page.keyboard.press("t")
    theme1 = page.evaluate("document.documentElement.getAttribute('data-theme')")
    check(theme1 != theme0 and theme1 in ("light", "dark"),
          f"{vp_name}: key 't' toggles theme ({theme0}->{theme1})")
    page.keyboard.press("T")
    theme2 = page.evaluate("document.documentElement.getAttribute('data-theme')")
    check(theme2 == theme0, f"{vp_name}: key 'T' restores theme ({theme2})")

    # Verify App Live inside #adhdBar
    page.click("#adhdBar button:has-text('Verify App Live')")
    page.wait_for_function(
        "() => { const el = document.getElementById('selfCheckOut'); return el && !el.classList.contains('hidden') && el.textContent.includes('LIVE SELF-CHECK OK'); }",
        timeout=10000,
    )
    sc_text = page.locator("#selfCheckOut").inner_text()
    check("LIVE SELF-CHECK OK" in sc_text, f"{vp_name}: selfCheck shows LIVE SELF-CHECK OK ({sc_text!r})")
    check("89 MC generators" in sc_text, f"{vp_name}: selfCheck shows 89 MC generators")

    # voiceRate 1.15 and 1.3 sets audio.playbackRate
    page.select_option("#voiceRate", "1.15")
    check(page.evaluate("audio.playbackRate") == 1.15, f"{vp_name}: voiceRate 1.15 sets audio.playbackRate")
    page.click("button:has-text('Welcome clip')")
    page.wait_for_timeout(150)
    check(abs(page.evaluate("audio.playbackRate") - 1.15) < 0.01,
          f"{vp_name}: Welcome clip keeps audio.playbackRate=1.15")
    check("welcome.wav" in page.evaluate("audio.src"), f"{vp_name}: Welcome clip plays welcome.wav")

    page.select_option("#voiceRate", "1.3")
    check(page.evaluate("audio.playbackRate") == 1.3, f"{vp_name}: voiceRate 1.3 sets audio.playbackRate")
    page.click("button:has-text('Test voice')")
    page.wait_for_timeout(350)
    check(abs(page.evaluate("audio.playbackRate") - 1.3) < 0.01,
          f"{vp_name}: Test voice keeps audio.playbackRate=1.3")
    page.select_option("#voiceRate", "1")
    page.evaluate("stopAudio()")

    # Test voiceSel switch
    page.select_option("#voiceSel", "bf_emma")
    check(page.locator("#voiceSel").input_value() == "bf_emma", f"{vp_name}: voiceSel switched to bf_emma")
    page.select_option("#voiceSel", "af_heart")

    # 5-Q Micro-Sprint from #adhdBar
    page.click("#adhdBar button:has-text('5-Q Micro-Sprint')")
    page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
    check(page.evaluate("quiz.length === 5 && mode === 'sprint'"),
          f"{vp_name}: 5-Q Micro-Sprint has quiz.length === 5")
    assert_clean_visible_views(page, f"{vp_name}:micro-sprint")
    assert_no_horizontal_overflow(page, vp_name, "micro-sprint")
    page.click("#quiz button[onclick='quitQuiz()']")
    page.wait_for_selector("#home:not(.hidden)", timeout=5000)

    # Unit-lesson micro-chunking & live re-render in showUnitLesson(1)
    page.keyboard.press("f")  # turn ADHD OFF first
    check(page.evaluate("!isAdhd()"), f"{vp_name}: ADHD OFF before opening unit lesson")
    page.evaluate("showUnitLesson(1)")
    page.wait_for_selector("#units:not(.hidden)", timeout=5000)
    check(page.locator("#units .chunk-item").count() == 0,
          f"{vp_name}: showUnitLesson(1) has 0 .chunk-item when ADHD OFF")
    assert_clean_visible_views(page, f"{vp_name}:unit1-lesson-off")

    # Live re-render when toggling ADHD Focus ON while lesson is open
    page.click("#adhdToggle")
    chunk_cnt = page.locator("#units .chunk-item").count()
    check(chunk_cnt >= 3, f"{vp_name}: live re-render adds .chunk-item buttons (count={chunk_cnt})")
    assert_no_horizontal_overflow(page, vp_name, "unit1-lesson-chunks")

    first_chunk = page.locator("#units .chunk-item").first
    first_chunk.click()
    check("done" in (first_chunk.get_attribute("class") or ""),
          f"{vp_name}: unit chunk toggles .done ON on click")
    check(first_chunk.get_attribute("aria-pressed") == "true",
          f"{vp_name}: unit chunk sets aria-pressed=true")
    first_chunk.click()
    check("done" not in (first_chunk.get_attribute("class") or ""),
          f"{vp_name}: unit chunk toggles .done OFF on second click")

    page.click("#units button:has-text('Listen')")
    page.wait_for_timeout(100)
    check("lesson-1-regulators.wav" in page.evaluate("audio.src"),
          f"{vp_name}: unit 1 Listen plays saved clip")
    page.evaluate("stopAudio()")

    # Toggle ADHD OFF while unit lesson open -> live re-render back
    page.keyboard.press("f")
    check(page.locator("#units .chunk-item").count() == 0,
          f"{vp_name}: toggling ADHD OFF live-rerenders back to paragraph")

    # Gap-closer micro-chunking & live re-render in startGapClose("SIPC separate capacity")
    page.evaluate("startGapClose('SIPC separate capacity', true)")
    page.wait_for_selector("#units:not(.hidden)", timeout=5000)
    check(page.locator("#units .chunk-item").count() == 0,
          f"{vp_name}: startGapClose has 0 .chunk-item when ADHD OFF")
    page.click("#adhdToggle")
    gap_chunks = page.locator("#units .chunk-item").count()
    check(gap_chunks >= 3, f"{vp_name}: startGapClose live re-renders .chunk-item (count={gap_chunks})")
    g0 = page.locator("#units .chunk-item").first
    g0.click()
    check("done" in (g0.get_attribute("class") or ""), f"{vp_name}: gap chunk toggles .done ON")
    g0.click()
    check("done" not in (g0.get_attribute("class") or ""), f"{vp_name}: gap chunk toggles .done OFF")
    assert_clean_visible_views(page, f"{vp_name}:gap-lesson")

    # Mastery Path (#lessons) live re-render check when toggling ADHD Focus
    page.click("#adhdToggle")  # turn ADHD OFF
    page.evaluate("showLessons()")
    page.wait_for_selector("#lessons:not(.hidden)", timeout=5000)
    check(page.locator("#lessons .chunk-item").count() == 0,
          f"{vp_name}: #lessons has 0 .chunk-item when ADHD OFF")
    page.click("#adhdToggle")  # toggle ON while #lessons is open
    lessons_chunks = page.locator("#lessons .chunk-item").count()
    check(lessons_chunks >= 6,
          f"{vp_name}: #lessons live re-renders .chunk-item when ADHD toggled ON (count={lessons_chunks})")
    if lessons_chunks > 0:
        lc0 = page.locator("#lessons .chunk-item").first
        lc0.click()
        check("done" in (lc0.get_attribute("class") or ""),
              f"{vp_name}: #lessons chunk toggles .done ON")
    page.click("#adhdToggle")  # leave ADHD OFF
    page.evaluate("backHome()")


def test_keyboard_quiz_navigation(page, vp_name):
    """Test 1, 2, A, B, Enter, ArrowRight quiz navigation and guardrails."""
    reset_clean(page)
    set_voice_enabled(page, False)
    page.select_option("#levelSel", "hard")
    page.click("#home button:has-text('Start sprint')")
    page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
    page.evaluate("document.activeElement && document.activeElement.blur && document.activeElement.blur()")

    # Pressing Enter before answering must NOT advance
    page.keyboard.press("Enter")
    check(page.evaluate("qi === 0 && !answered"), f"{vp_name}: Enter ignored before answering")

    seq = [("1", "Enter", 0), ("2", "ArrowRight", 1), ("a", "Enter", 0), ("B", "ArrowRight", 1)]
    for step, (ans_key, next_key, opt_idx) in enumerate(seq):
        check(page.evaluate("qi") == step, f"{vp_name}: keyboard nav at Q{step + 1}")
        page.keyboard.press(ans_key)
        check(page.evaluate("answered === true"), f"{vp_name}: key {ans_key!r} answers Q{step + 1}")
        check(page.locator("#explain").is_visible(), f"{vp_name}: #explain visible after {ans_key!r}")
        check(page.locator("#nextBtn").is_visible(), f"{vp_name}: #nextBtn visible after {ans_key!r}")
        cls = page.locator("#opts .opt").nth(opt_idx).get_attribute("class") or ""
        check(("right" in cls or "wrong" in cls), f"{vp_name}: option {opt_idx} highlighted after {ans_key!r}")
        page.keyboard.press("3")
        check(page.evaluate("qi") == step, f"{vp_name}: extra answer key ignored once answered")
        page.keyboard.press(next_key)
        check(page.evaluate("qi") == step + 1 and page.evaluate("!answered"),
              f"{vp_name}: key {next_key!r} advances to Q{step + 2}")

    page.click("#quiz button[onclick='quitQuiz()']")
    page.wait_for_selector("#home:not(.hidden)", timeout=5000)


def test_master_timeouts_and_missed_replay(ctx, vp_name):
    """Simulate Master-mode 60s timeout on MC and short-response, then replay Missed Bank."""
    page_clk = ctx.new_page()
    attach_listeners(page_clk, f"{vp_name}:clock")
    try:
        page_clk.clock.install()
        page_clk.goto(BASE + "/", wait_until="domcontentloaded")
        page_clk.evaluate("localStorage.clear()")
        page_clk.reload(wait_until="domcontentloaded")
        set_voice_enabled(page_clk, False)

        page_clk.select_option("#levelSel", "master")
        page_clk.click("#home button:has-text('Start sprint')")
        page_clk.wait_for_selector("#quiz:not(.hidden)", timeout=5000)

        mc_timed_out = False
        short_timed_out = False
        q_len = page_clk.evaluate("quiz.length")

        for _ in range(q_len):
            q_type = page_clk.evaluate("current.type || 'mc'")
            timer_init = page_clk.locator("#timer").inner_text()
            check("60s (Master)" in timer_init, f"{vp_name}: Master timer initialized ({timer_init!r})")

            if q_type != "short" and not mc_timed_out:
                page_clk.clock.run_for(61000)
                check(page_clk.evaluate("answered === true"), f"{vp_name}: Master MC timed out via answer(-1)")
                exp = page_clk.locator("#explain").inner_text()
                check("Trap sprung." in exp, f"{vp_name}: MC timeout shows Trap sprung")
                assert_clean_visible_views(page_clk, f"{vp_name}:master-mc-timeout")
                mc_timed_out = True
            elif q_type == "short" and not short_timed_out:
                page_clk.fill("#shortAns", "ft1a")
                check(page_clk.evaluate("!isAdhd()"), f"{vp_name}: typing 'f' in textarea does not toggle ADHD")
                page_clk.clock.run_for(61000)
                check(page_clk.evaluate("answered === true"), f"{vp_name}: Master short timed out via timeoutShort()")
                check(page_clk.locator("#shortAns").is_disabled(), f"{vp_name}: #shortAns disabled after timeout")
                exp = page_clk.locator("#explain").inner_text()
                check("Time expired." in exp and "Model answer:" in exp,
                      f"{vp_name}: Short timeout shows Time expired + Model answer")
                assert_clean_visible_views(page_clk, f"{vp_name}:master-short-timeout")
                short_timed_out = True
            else:
                answer_current_question(page_clk)
                if mc_timed_out and short_timed_out:
                    break
                continue

            if mc_timed_out and short_timed_out:
                break
            page_clk.click("#nextBtn")

        check(mc_timed_out and short_timed_out,
              f"{vp_name}: simulated 60s timeout on both MC ({mc_timed_out}) and short ({short_timed_out})")
        page_clk.evaluate("quitQuiz()")
    finally:
        page_clk.close()

    # Open Review Missed Bank on real-clock page sharing same localStorage
    page = ctx.new_page()
    attach_listeners(page, f"{vp_name}:missed")
    try:
        page.goto(BASE + "/", wait_until="networkidle")
        set_voice_enabled(page, False)
        missed_cnt = int(page.locator("#missedCount").inner_text())
        check(missed_cnt >= 2, f"{vp_name}: Missed Bank populated after timeouts (count={missed_cnt})")

        page.click("#home button:has-text('Review Missed Bank')")
        page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
        types_seen = page.evaluate("quiz.map(q => q.type || 'mc')")
        check("mc" in types_seen and "short" in types_seen,
              f"{vp_name}: Missed Bank contains both MC and short items ({types_seen})")

        q_total = len(types_seen)
        for i in range(q_total):
            assert_clean_visible_views(page, f"{vp_name}:missed-q{i + 1}")
            if page.evaluate("current.type === 'short'"):
                page.click("#opts button:has-text('Submit answer')")
                check(page.evaluate("!answered"), f"{vp_name}: empty short answer rejected")
                model = page.evaluate("current.model")
                page.fill("#shortAns", model)
                page.click("#opts button:has-text('Submit answer')")
                exp = page.locator("#explain").inner_text()
                check("Full credit." in exp, f"{vp_name}: replayed missed short graded Full credit")
            else:
                ans_idx = page.evaluate("current.answer")
                page.locator("#opts .opt").nth(ans_idx).click()
                exp = page.locator("#explain").inner_text()
                check("Correct." in exp, f"{vp_name}: replayed missed MC graded Correct")
            assert_clean_visible_views(page, f"{vp_name}:missed-explain{i + 1}")
            page.click("#nextBtn")

        page.wait_for_selector("#result:not(.hidden)", timeout=5000)
        assert_clean_visible_views(page, f"{vp_name}:missed-result")
        assert_no_horizontal_overflow(page, vp_name, "missed-result")
    finally:
        page.close()


def test_run_it_again_all_8_modes(page, vp_name):
    """Verify 'Run it again' preserves mode and question count across all 8 modes."""
    reset_clean(page)
    set_voice_enabled(page, False)
    page.select_option("#levelSel", "hard")

    def verify_replay(expected_mode, expected_len, extra_fn=None, correct=False):
        complete_quiz(page, expected_len=expected_len, label=f"{vp_name}:{expected_mode}:run1", correct=correct)
        assert_clean_visible_views(page, f"{vp_name}:{expected_mode}:result1")
        assert_no_horizontal_overflow(page, vp_name, f"{expected_mode}:result")
        page.locator("#result button:has-text('Run it again')").click()
        page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
        got = page.evaluate("({mode, len: quiz.length, unit: window._unit, gap: window._gapTopic, timeLeft})")
        check(got["mode"] == expected_mode and got["len"] == expected_len,
              f"{vp_name}: Run it again preserves {expected_mode} ({expected_len} Qs -> {got})")
        if extra_fn:
            extra_fn(got)
        assert_clean_visible_views(page, f"{vp_name}:{expected_mode}:run2")
        page.click("#quiz button[onclick='quitQuiz()']")
        page.wait_for_selector("#home:not(.hidden)", timeout=5000)

    # 1. zero -> 3 Qs (also check primer screen fit & text)
    page.click("#home button:has-text('Start from zero')")
    page.wait_for_selector("#lessons:not(.hidden)", timeout=5000)
    assert_clean_visible_views(page, f"{vp_name}:zero-primer")
    assert_no_horizontal_overflow(page, vp_name, "zero-primer")
    page.click("#lessons button:has-text('3-question')")
    page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
    verify_replay("zero", 3)

    # 2. placement -> 10 Qs
    page.click("#home button:has-text('Take placement check')")
    page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
    verify_replay("placement", 10)

    # 3. sprint 5Q -> 5 Qs
    if not page.evaluate("isAdhd()"):
        page.click("#adhdToggle")
    page.click("#adhdBar button:has-text('5-Q Micro-Sprint')")
    page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
    verify_replay("sprint", 5)
    if page.evaluate("isAdhd()"):
        page.click("#adhdToggle")

    # 4. trap -> 10 Qs
    page.click("#home button:has-text('Start drill')")
    page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
    verify_replay("trap", 10)

    # 5. unit -> 5 Qs same unit (Unit 3)
    page.click("#home button:has-text('Start lesson plan')")
    page.wait_for_selector("#units:not(.hidden)", timeout=5000)
    page.evaluate("showUnitLesson(3)")
    page.click("#units button:has-text('Mini quiz')")
    page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
    verify_replay(
        "unit", 5,
        extra_fn=lambda g: check(
            g["unit"] == 3 and page.evaluate("quiz.every(q => q.unit === 3)"),
            f"{vp_name}: unit replay stayed on Unit 3",
        ),
    )

    # 6. gap -> 3 Qs same gap
    page.evaluate("startGapClose('SIPC separate capacity', true)")
    page.wait_for_selector("#units:not(.hidden)", timeout=5000)
    page.click("#units button:has-text('Start the re-drill')")
    page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
    verify_replay(
        "gap", 3,
        extra_fn=lambda g: check(
            g["gap"] == "SIPC separate capacity",
            f"{vp_name}: gap replay stayed on 'SIPC separate capacity'",
        ),
    )

    # Verify Final Exam Review lock toast before marking 8 units done
    page.evaluate("showUnits()")
    page.evaluate("startFinalReview()")
    check("unlocks after all 8 units" in page.locator("#toast").inner_text(),
          f"{vp_name}: final review locked toast shown when <8 units cleared")

    # 7. final -> 25 Qs after marking 8 units done
    page.evaluate("""() => {
        store.t.done = {1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1};
        save();
        showUnits();
    }""")
    page.wait_for_selector("#units button:has-text('Final Exam Review')", timeout=5000)
    page.click("#units button:has-text('Final Exam Review')")
    page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
    verify_replay("final", 25)

    # 8. exam -> 75 Qs (pass with correct=True to also verify confettiBurst + Perfect Run badge)
    page.click("#home button:has-text('Start exam')")
    page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
    exam_mix = page.evaluate("quiz.reduce((a,q)=>{a[q.sec]=(a[q.sec]||0)+1;return a},{})")
    check(exam_mix == {"1": 12, "2": 33, "3": 23, "4": 7},
          f"{vp_name}: exam mix 12/33/23/7 ({exam_mix})")
    verify_replay(
        "exam", 75,
        extra_fn=lambda g: check(g["timeLeft"] >= 6290, f"{vp_name}: exam replay reset timer ({g['timeLeft']})"),
        correct=True,
    )


def test_rage_clicks_and_teardown_torture(page, vp_name):
    """Rage-click options, Next ->, voice buttons, Quit, and verify timer teardown across all views."""
    reset_clean(page)

    # Exercise all top-level view buttons and check for undefined/NaN + overflow
    page.click("#home button:has-text('Open lessons')")
    page.wait_for_selector("#lessons:not(.hidden)", timeout=5000)
    assert_clean_visible_views(page, f"{vp_name}:lessons-view")
    assert_no_horizontal_overflow(page, vp_name, "lessons-view")
    page.click("#lessons button:has-text('Listen') >> nth=0")
    page.click("#lessons button[onclick='backHome()']")
    page.wait_for_selector("#home:not(.hidden)", timeout=5000)

    page.click("#home button:has-text('See my report')")
    page.wait_for_selector("#report:not(.hidden)", timeout=5000)
    assert_clean_visible_views(page, f"{vp_name}:report-view")
    assert_no_horizontal_overflow(page, vp_name, "report-view")
    page.click("#report button[onclick='backHome()']")
    page.wait_for_selector("#home:not(.hidden)", timeout=5000)

    page.click("#home button:has-text('Start lesson plan')")
    page.wait_for_selector("#units:not(.hidden)", timeout=5000)
    assert_clean_visible_views(page, f"{vp_name}:units-view")
    assert_no_horizontal_overflow(page, vp_name, "units-view")
    page.click("#units button[onclick='backHome()']")
    page.wait_for_selector("#home:not(.hidden)", timeout=5000)

    # Rage-click voice buttons on Home
    for _ in range(6):
        page.click("button:has-text('Test voice')")
    for _ in range(6):
        page.click("button:has-text('Hear coach')")
    for _ in range(6):
        page.click("button:has-text('Welcome clip')")
    page.wait_for_timeout(150)
    check("welcome.wav" in page.evaluate("audio.src"),
          f"{vp_name}: Welcome clip wins cleanly after voice rage-clicks")
    page.evaluate("stopAudio()")

    # Disable TTS during rapid quiz-click & teardown loops
    set_voice_enabled(page, False)

    # Rage-click answer options & Next ->
    page.click("#home button:has-text('Start drill')")
    page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
    seen_before = page.evaluate("store.seen")
    page.evaluate("""() => {
        const opts = document.querySelectorAll("#opts .opt");
        for (let i = 0; i < 12; i++) opts[i % opts.length].click();
    }""")
    page.locator("#opts .opt").nth(1).click(force=True)
    seen_after = page.evaluate("store.seen")
    check(seen_after == seen_before + 1,
          f"{vp_name}: option rage-click only recorded 1 answer ({seen_before}->{seen_after})")
    check(page.evaluate("qi === 0 && answered === true"),
          f"{vp_name}: option rage-click kept qi=0 and answered=true")

    # Pointer double-click on Next ->
    qi_before = page.evaluate("qi")
    page.locator("#nextBtn").dblclick()
    qi_after_dbl = page.evaluate("qi")
    check(qi_after_dbl == qi_before + 1,
          f"{vp_name}: Next -> pointer dblclick advances by 1 ({qi_before}->{qi_after_dbl})")

    # Answer Q2, then fire rapid queued DOM clicks on Next -> (tests nextQ() idempotency guard)
    page.locator("#opts .opt").first.click()
    qi_q2 = page.evaluate("qi")
    page.evaluate("""() => {
        const nb = document.getElementById("nextBtn");
        for (let i = 0; i < 8; i++) nb.click();
    }""")
    qi_after_dom = page.evaluate("qi")
    check(qi_after_dom == qi_q2 + 1,
          f"{vp_name}: Next -> rapid DOM rage-click only advanced by 1 ({qi_q2}->{qi_after_dom})")

    # Rage-click Quit
    for _ in range(4):
        qbtn = page.locator("#quiz button[onclick='quitQuiz()']")
        if qbtn.is_visible():
            qbtn.click(force=True)
    page.wait_for_selector("#home:not(.hidden)", timeout=5000)

    # Mid-flight Exam timer teardown across Quit, backHome, showUnits, showReport, showLessons
    teardowns = [
        ("quitQuiz", "quitQuiz()", "#home"),
        ("backHome", "backHome()", "#home"),
        ("showUnits", "showUnits()", "#units"),
        ("showReport", "showReport()", "#report"),
        ("showLessons", "showLessons()", "#lessons"),
    ]
    for name, cmd, target_sel in teardowns:
        page.evaluate("startQuiz('exam', 75)")
        page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
        t0 = page.evaluate("timeLeft")
        page.wait_for_timeout(1200)
        t_ticked = page.evaluate("timeLeft")
        check(t_ticked < t0, f"{vp_name}: exam timer ticking before {name} ({t0}->{t_ticked})")

        page.evaluate(cmd)
        page.wait_for_selector(f"{target_sel}:not(.hidden)", timeout=5000)
        snap = page.evaluate("({timeLeft, timerText: document.getElementById('timer').textContent})")
        page.wait_for_timeout(1400)
        later = page.evaluate("({timeLeft, timerText: document.getElementById('timer').textContent})")
        check(snap == later, f"{vp_name}: exam timer stopped mutating after {name} ({snap} == {later})")
        check(page.locator("#quiz").is_hidden(), f"{vp_name}: #quiz hidden after {name}")
        assert_clean_visible_views(page, f"{vp_name}:post-exam-{name}")

    # Mid-flight Master per-Q timer teardown across all 5 teardown paths
    page.evaluate("backHome()")
    page.select_option("#levelSel", "master")
    for name, cmd, target_sel in teardowns:
        page.evaluate("startQuiz('trap', 10)")
        page.wait_for_selector("#quiz:not(.hidden)", timeout=5000)
        txt0 = page.locator("#timer").inner_text()
        page.wait_for_timeout(1200)
        txt1 = page.locator("#timer").inner_text()
        check("Master" in txt0 and txt1 != txt0,
              f"{vp_name}: Master perQ timer ticking before {name} ({txt0!r}->{txt1!r})")

        page.evaluate(cmd)
        page.wait_for_selector(f"{target_sel}:not(.hidden)", timeout=5000)
        snap = page.evaluate("({timerText: document.getElementById('timer').textContent, qi, answered})")
        page.wait_for_timeout(1400)
        later = page.evaluate("({timerText: document.getElementById('timer').textContent, qi, answered})")
        check(snap == later,
              f"{vp_name}: Master perQ timer stopped mutating after {name} ({snap} == {later})")
        check(page.locator("#quiz").is_hidden(), f"{vp_name}: #quiz hidden after Master {name}")
        assert_clean_visible_views(page, f"{vp_name}:post-master-{name}")


def run_viewport(browser, vp_name, vp_size):
    """Run the full adversarial chaos suite in one viewport."""
    print(f"\n================ [{vp_name.upper()} {vp_size['width']}x{vp_size['height']}] ================")
    ctx = browser.new_context(viewport=vp_size)
    page = ctx.new_page()
    attach_listeners(page, vp_name)
    try:
        test_corrupted_local_storage(page, vp_name)
        test_adhd_shortcuts_voice_and_chunks(page, vp_name)
        test_keyboard_quiz_navigation(page, vp_name)
        test_master_timeouts_and_missed_replay(ctx, vp_name)
        test_run_it_again_all_8_modes(page, vp_name)
        test_rage_clicks_and_teardown_torture(page, vp_name)
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
