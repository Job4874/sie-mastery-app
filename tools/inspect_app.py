"""Extract and syntax-check the single inline script from static/index.html."""
import re, json, pathlib, subprocess, sys

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "static" / "index.html").read_text(encoding="utf-8")
scripts = re.findall(r"<script\b[^>]*>(.*?)</script>", html, re.S | re.I)
print("script blocks:", len(scripts))
for i, s in enumerate(scripts):
    print(f"  block {i}: {len(s)} chars, first 80:", repr(s.strip()[:80]))
out = root / "_check_app.js"
out.write_text(scripts[-1], encoding="utf-8")
r = subprocess.run(["C:/Users/abdul/H23/data/tools/node-26.12.1-win32-x64/node.exe", "--check", str(out)],
                   capture_output=True, text=True)
print("node --check rc:", r.returncode)
print((r.stdout or "") + (r.stderr or ""))

# Structural counts from the extracted script
js = scripts[-1]
print("\n--- counts ---")
print("Q( occurrences        :", len(re.findall(r"\(\)=>Q\(", js)))
print("UNITS array length    :", (js.count("id:'u") + js.count('id:"u')))
for key in ["UNITS", "GEN", "SHORT", "UNIT_BY_TOPIC", "DIFF_BY_TOPIC"]:
    m = re.search(r"(?:const|let|var)\s+" + key + r"\s*=", js)
    print(f"{key:16s} declared:", bool(m))
print("function names        :", len(re.findall(r"function\s+([A-Za-z0-9_$]+)\s*\(", js)))
print("onclick handlers      :", len(re.findall(r"onclick=", html)))
print("data-view attrs       :", len(re.findall(r"data-view=", html)))
print("data-component attrs  :", len(re.findall(r"data-component=", html)))
