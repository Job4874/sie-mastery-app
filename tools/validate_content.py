"""Validate lesson content in static/js/data/units/unit-*.js.

Usage:
  python tools/validate_content.py            # all units
  python tools/validate_content.py unit-3.js  # specific files
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from content_lib import UNITS_DIR, load_unit_file, screen_scripts, validate_unit  # noqa: E402


def main():
    names = sys.argv[1:]
    paths = [UNITS_DIR / n for n in names] if names else sorted(UNITS_DIR.glob("unit-*.js"))
    total_err, clips = 0, 0
    for path in paths:
        try:
            unit = load_unit_file(path)
        except (OSError, ValueError) as exc:
            print(f"FAIL {path.name}: {exc}")
            total_err += 1
            continue
        errors = validate_unit(unit)
        n_clips = sum(1 for _ in screen_scripts(unit))
        clips += n_clips
        screens = sum(len(lesson["screens"]) for lesson in unit.get("lessons", []))
        if errors:
            total_err += len(errors)
            for err in errors:
                print(f"FAIL {path.name}: {err}")
        else:
            print(f"PASS {path.name}: unit {unit['id']} '{unit['title']}' - "
                  f"{len(unit['lessons'])} lessons, {screens} screens, {n_clips} audio clips")
    print(f"\ncontent: {len(paths)} files, {clips} audio clips, {total_err} errors")
    sys.exit(1 if total_err else 0)


if __name__ == "__main__":
    main()
