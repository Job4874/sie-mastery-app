from playwright.sync_api import sync_playwright
import os
OUT = r"C:\Users\abdul\AppData\Local\Temp\opencode\shots"
os.makedirs(OUT, exist_ok=True)
BASE = "http://127.0.0.1:8765"
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1280, "height": 900}, device_scale_factor=1)
    pg.goto(BASE + "/", wait_until="networkidle")
    pg.evaluate("localStorage.clear()")
    pg.reload(wait_until="networkidle")
    pg.wait_for_timeout(1000)
    styles = pg.evaluate("""() => {
      const g = s => { const e=document.querySelector(s); if(!e)return null; const c=getComputedStyle(e); return {
        sel:s, font:c.fontFamily, size:c.fontSize, weight:c.fontWeight, lh:c.lineHeight,
        color:c.color, radius:c.borderRadius, pad:c.padding, shadow:c.boxShadow, bg:c.backgroundColor};};
      return { body:g('body'), h1:g('h1'), h2:g('h2'), h3:g('h3'),
               button:g('button'), card:g('.card'), logo:g('.logo'), sub:g('.sub') };
    }""")
    for k, v in styles.items():
        print(k, v)
    pg.screenshot(path=os.path.join(OUT, "app_home.png"), full_page=True)
    # capture quiz view
    pg.click("button.pink")
    pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(OUT, "app_primer.png"), full_page=True)
    # dark + light
    pg.evaluate("backHome()")
    pg.evaluate("applyTheme('light')")
    pg.wait_for_timeout(400)
    pg.screenshot(path=os.path.join(OUT, "app_light.png"), full_page=True)
    b.close()
print("done")
