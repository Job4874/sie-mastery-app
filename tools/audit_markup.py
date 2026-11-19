"""Audit: emoji code points, CSS classes referenced but not defined, absolute asset paths."""
import re, json, pathlib, unicodedata

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "static" / "index.html").read_text(encoding="utf-8")

def is_emoji(ch):
    cp = ord(ch)
    return (0x1F000 <= cp <= 0x1FAFF) or (0x2600 <= cp <= 0x27BF) or cp in (
        0x2B50, 0x2B06, 0x2B07, 0x2B05, 0x2B06, 0x2764, 0x2705, 0x274C, 0x203C,
        0x2049, 0x2122, 0x2139, 0x3030, 0x303D, 0x3297, 0x3299, 0xFE0F, 0x20E3,
    )

lines = html.splitlines()
emoji_hits = []
for i, line in enumerate(lines, 1):
    for ch in line:
        if is_emoji(ch):
            emoji_hits.append((i, repr(ch), unicodedata.name(ch, "?"), line.strip()[:90]))
print("EMOJI HITS:", len(emoji_hits))
for ln, rep, name, ctx in emoji_hits[:40]:
    print("  line %d  %s  %s  %s" % (ln, rep.encode("unicode_escape").decode(), name, ctx.encode("ascii", "replace").decode()))

# classes used
css = "\n".join(re.findall(r"<style>(.*?)</style>", html, re.S))
defined = set(re.findall(r"\.([A-Za-z][A-Za-z0-9_-]*)", css))
used = set()
for m in re.finditer(r'class="([^"]+)"', html):
    for c in m.group(1).split():
        used.add(c)
for m in re.finditer(r"class=\\?[\"']([^\"'`]+)", html):
    for c in m.group(1).split():
        if "${" not in c:
            used.add(c)
missing = sorted(c for c in used if c not in defined)
print("\nCLASSES USED:", len(used), " CSS DEFINED:", len(defined))
print("CLASSES WITHOUT CSS RULE:", missing)

# absolute paths in JS
abs_paths = sorted(set(re.findall(r"['\"](/[A-Za-z0-9_./-]+)['\"]", html)))
print("\nABSOLUTE PATH STRINGS:", abs_paths)

print("\nIDs in HTML:", len(re.findall(r'id="([^"]+)"', html)))
print("getElementById/$ targets:", sorted(set(re.findall(r'\$\("([A-Za-z0-9_]+)"\)', html))))
ids = set(re.findall(r'id="([^"]+)"', html))
targets = set(re.findall(r'\$\("([A-Za-z0-9_]+)"\)', html))
print("MISSING ID TARGETS:", sorted(targets - ids))

print("\ninline event handlers:", sorted(set(re.findall(r'on(?:click|change|input)="([A-Za-z0-9_$]+)\(', html))))
fns = set(re.findall(r"function\s+([A-Za-z0-9_$]+)\s*\(", html))
print("HANDLERS NOT DEFINED:", sorted(set(re.findall(r'on(?:click|change|input)="([A-Za-z0-9_$]+)\(', html)) - fns))
