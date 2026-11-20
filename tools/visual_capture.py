"""Capture desktop visual verification screenshots of the SIE Mastery learning site."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(os.environ.get("SIE_SHOTS", str(ROOT / ".shots")))
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get("SIE_BASE", "http://127.0.0.1:8765")

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1280, "height": 900}, device_scale_factor=1)
    pg.goto(BASE + "/#/learn", wait_until="networkidle")
    pg.evaluate("localStorage.clear()")
    pg.goto(BASE + "/#/learn", wait_until="networkidle")
    pg.wait_for_timeout(600)
    styles = pg.evaluate("""() => {
      const g = s => { const e=document.querySelector(s); if(!e)return null; const c=getComputedStyle(e); return {
        sel:s, font:c.fontFamily, size:c.fontSize, weight:c.fontWeight, lh:c.lineHeight,
        color:c.color, radius:c.borderRadius, pad:c.padding, shadow:c.boxShadow, bg:c.backgroundColor};};
      return { body:g('body'), h1:g('h1'), h2:g('h2'), h3:g('h3'),
               button:g('button'), card:g('.card'), nav:g('.topbar') };
    }""")
    for k, v in styles.items():
        print(k, v)
    pg.screenshot(path=str(OUT / "app_home_light.png"), full_page=True)

    # Capture step-through lesson player
    pg.goto(BASE + "/#/learn/unit/0/lesson/1", wait_until="networkidle")
    pg.wait_for_timeout(400)
    pg.screenshot(path=str(OUT / "app_lesson.png"), full_page=True)

    # Capture dark theme on Learn home
    pg.goto(BASE + "/#/learn", wait_until="networkidle")
    pg.click("[data-action='toggle-theme']")
    pg.wait_for_timeout(400)
    pg.screenshot(path=str(OUT / "app_home_dark.png"), full_page=True)
    b.close()

print(f"done -> {OUT}")
