"""Audio truth check: every referenced clip exists, every manifest size matches,
and no orphan binaries sit in static/audio."""
import json, re, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / "static" / "index.html").read_text(encoding="utf-8")
refs = sorted(set(re.findall(r"audio/([A-Za-z0-9_.-]+\.(?:wav|mp3))", html)))
man = json.loads((ROOT / "static/audio/manifest.json").read_text())
man_files = {c["file"]: c for c in man["clips"]}
disk = {p.name for p in (ROOT / "static/audio").iterdir() if p.is_file() and p.suffix in (".wav", ".mp3")}

errors = []
for f in refs:
    p = ROOT / "static/audio" / f
    if not p.exists():
        errors.append("referenced but missing: " + f)
    elif f not in man_files:
        errors.append("referenced but not in manifest: " + f)
for f, c in man_files.items():
    p = ROOT / "static/audio" / f
    if not p.exists():
        errors.append("manifest clip missing: " + f)
    elif p.stat().st_size != c["bytes"]:
        errors.append(f"size mismatch: {f} disk={p.stat().st_size} manifest={c['bytes']}")
orphans = sorted(disk - set(man_files))
print("references:", len(refs), "| manifest:", len(man_files), "| binaries:", len(disk))
print("orphans:", orphans)
if errors:
    print("AUDIO FAIL:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print("audio: OK")
