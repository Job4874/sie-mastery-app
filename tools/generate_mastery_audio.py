"""Generate the six Mastery Path clips with Kokoro (af_heart) and repoint LESSONS."""
import re, pathlib, shutil, html as htmlmod, json, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import tts_engine

P = ROOT / "static" / "index.html"
src = P.read_text(encoding="utf-8")
block = re.search(r"const LESSONS=\[(.*?)\n\];", src, re.S)
if not block:
    sys.exit("LESSONS block not found")
entries = re.findall(r'\{t:"(.*?)",a:"(.*?)",s:"(.*?)",b:`(.*?)`\}', block.group(1), re.S)
print("entries:", len(entries))
slugs = ["sipc", "cmo", "freeriding", "numbers", "prohibited", "master-frame"]
new_paths = []
for i, (title, old, section, body) in enumerate(entries):
    text = re.sub(r"<[^>]+>", " ", body)
    text = htmlmod.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    if i < len(slugs):
        out = ROOT / "static" / "audio" / f"mastery-{i+1}-{slugs[i]}.wav"
    else:
        out = ROOT / "static" / "audio" / f"mastery-{i+1}.wav"
    print(f"\n[{i+1}/{len(entries)}] {title}  ({len(text)} chars)")
    cached = tts_engine.synthesize(text, "af_heart")
    shutil.copyfile(cached, out)
    import soundfile as sf
    info = sf.info(str(out))
    print(f"  -> {out.name}  {out.stat().st_size} bytes  {info.duration:.1f}s")
    new_paths.append((old, "audio/" + out.name))

for old, new in new_paths:
    src = src.replace(f'a:"{old}"', f'a:"{new}"', 1)
P.write_text(src, encoding="utf-8")

# Merge/replace mastery clips in the manifest.
man_p = ROOT / "static" / "audio" / "manifest.json"
man = json.loads(man_p.read_text())
man["clips"] = [c for c in man["clips"] if not c["file"].startswith("mastery-")]
for i, (title, old, section, body) in enumerate(entries):
    p = ROOT / "static" / "audio" / new_paths[i][1].split("/")[-1]
    man["clips"].append({"file": p.name, "title": title, "bytes": p.stat().st_size})
man_p.write_text(json.dumps(man, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("\nmanifest clips:", len(man["clips"]))
