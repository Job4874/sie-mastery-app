"""Grammar/documentation audit test.

Runs codespell over all user-facing text with domain-specific terms allowed.
Also asserts cross-platform onboarding exists and the research report is present.
Skips gracefully if codespell is not installed.
"""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FAIL = []


def ok(c, m):
    print(("PASS: " if c else "FAIL: ") + m)
    if not c:
        FAIL.append(m)


def main():
    # docs present
    for f in ["RESEARCH_ADHD.md", "README.md", "ARCHITECTURE.md", "PUSH_AUDIO.md"]:
        ok((ROOT / f).is_file(), f"{f} present")

    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    for osname in ["Windows (PowerShell)", "macOS (Terminal)", "Linux (bash)"]:
        ok(osname in readme, f"onboarding instructions: {osname}")
    ok("python server.py" in readme or "python3 server.py" in readme,
       "server start command documented")
    ok("http://127.0.0.1:8765" in readme, "localhost URL documented")

    research = (ROOT / "RESEARCH_ADHD.md").read_text(encoding="utf-8")
    research_lower = research.lower()
    for term in ["bayesian knowledge tracing", "retrieval practice",
                 "stern", "ebu r128", "kokoro", "spaced"]:
        ok(term in research_lower, f"research report covers: {term}")

    # codespell if available
    exe = shutil.which("codespell")
    if exe:
        files = ["static/index.html", "README.md", "ARCHITECTURE.md",
                 "PUSH_AUDIO.md", "RESEARCH_ADHD.md", "AGENTS.md",
                 ".agents/skills/sie-verify/SKILL.md",
                 ".agents/skills/sie-curriculum-author/SKILL.md"]
        r = subprocess.run(
            [exe, "--ignore-words-list=sie,trough,posin",
             "--skip=static/audio,tools/bit_manifest.json,*.pyc"] + files,
            cwd=ROOT, capture_output=True, text=True)
        out = (r.stdout + r.stderr).strip()
        ok(r.returncode == 0, "codespell: no spelling errors" + (" -> " + out[:200] if out else ""))
    else:
        print("SKIP: codespell not installed")

    if FAIL:
        print(f"\n=== GRAMMAR/DOC AUDIT FAILED: {len(FAIL)} ===")
        for f in FAIL:
            print(" -", f)
        sys.exit(1)
    print("\n=== GRAMMAR/DOC AUDIT PASSED ===")


if __name__ == "__main__":
    main()
