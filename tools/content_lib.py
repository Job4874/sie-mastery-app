"""Shared parser for SIE Mastery lesson content (static/js/data/units/unit-*.js).

Each unit file wraps a strict JSON object in SIE.registerUnit( ... ); so the same
source drives the browser and the audio composer. This module extracts the JSON,
validates the schema, and produces the speech script for every lesson screen.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UNITS_DIR = ROOT / "static" / "js" / "data" / "units"
CALL_RE = re.compile(r"SIE\.registerUnit\(\s*(\{.*\})\s*\);?\s*$", re.S)
TAG_RE = re.compile(r"<[/!]?[a-zA-Z][^>]*>")
ALLOWED_TAGS = {"p", "b", "strong", "em", "i", "ul", "ol", "li", "br", "table", "thead",
                "tbody", "tr", "th", "td", "span", "code", "small"}
TAG_NAME_RE = re.compile(r"</?([a-zA-Z0-9]+)([^>]*)>")
KINDS = {"concept", "example", "check", "recap"}


def load_unit_file(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    body = text.split("SIE.registerUnit(", 1)
    if len(body) != 2:
        raise ValueError(f"{path.name}: missing SIE.registerUnit(")
    match = CALL_RE.search("SIE.registerUnit(" + body[1])
    if not match:
        raise ValueError(f"{path.name}: could not find registerUnit({{...}}); wrapper")
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError as exc:
        raise ValueError(f"{path.name}: invalid strict JSON: {exc}") from exc


def load_units() -> list:
    units = [load_unit_file(p) for p in sorted(UNITS_DIR.glob("unit-*.js"))]
    return sorted(units, key=lambda u: u["id"])


def to_speech(raw: str) -> str:
    text = re.sub(r"</(p|li|tr|h\d)>", ". ", raw)
    text = re.sub(r"<br\s*/?>", ". ", text)
    text = re.sub(r"</t[dh]>", ", ", text)
    text = TAG_RE.sub(" ", text)
    text = html.unescape(text)
    text = (text.replace(" \u2022 ", ". ").replace(" \u2014 ", ", ").replace("\u2014", ", ")
            .replace(" = ", " equals ").replace("\u2192", " to ").replace("\u2190", " from ")
            .replace("\u2264", " at most ").replace("\u2265", " at least ")
            .replace("&", " and ").replace("%", " percent"))
    text = re.sub(r"\bT\+(\d)\b", lambda m: "T plus " + ["zero", "one", "two", "three"][int(m.group(1))]
                  if int(m.group(1)) < 4 else "T plus " + m.group(1), text)
    text = re.sub(r"\s+([,.:;!?])", r"\1", text)
    text = re.sub(r":\s*[.,]", ":", text)
    text = re.sub(r"\s*\.\s*(\.\s*)+", ". ", text)
    text = re.sub(r"([,.])\s*\.", r"\1", text)
    return re.sub(r"\s+", " ", text).strip(" ,")


def audio_stem(unit_id: int, lesson_idx: int, screen_idx: int, part: str = "") -> str:
    return f"u{unit_id}-l{lesson_idx + 1}-s{screen_idx + 1}" + (f"-{part}" if part else "")


def screen_scripts(unit: dict):
    """Yield (stem, title, speech) for every audio clip a unit needs."""
    for li, lesson in enumerate(unit["lessons"]):
        for si, screen in enumerate(lesson["screens"]):
            kind = screen["kind"]
            title = f"Unit {unit['id']} - {lesson['title']} - {screen.get('title', kind)}"
            if kind in ("concept", "example"):
                say = screen.get("say") or f"{to_speech(screen['title'])}. {to_speech(screen['body'])}"
                yield audio_stem(unit["id"], li, si), title, say
            elif kind == "check":
                letters = "ABCD"
                opts = " ".join(f"{letters[i]}. {to_speech(c)}." for i, c in enumerate(screen["choices"]))
                yield audio_stem(unit["id"], li, si, "q"), title + " (question)", \
                    f"Check yourself. {to_speech(screen['prompt'])} {opts}"
                yield audio_stem(unit["id"], li, si, "x"), title + " (explanation)", \
                    f"The answer is {letters[screen['answer']]}. {to_speech(screen['explain'])}"
            elif kind == "recap":
                pts = " ".join(f"{to_speech(p).rstrip('.')}." for p in screen["points"])
                yield audio_stem(unit["id"], li, si), title, f"{screen.get('title', 'Recap')}. {pts}"


def _check_html(where: str, value: str, errors: list):
    for name, attrs in TAG_NAME_RE.findall(value):
        if name.lower() not in ALLOWED_TAGS:
            errors.append(f"{where}: tag <{name}> not allowed")
        if attrs.strip() and not re.fullmatch(r"\s*class='[a-z0-9 -]+'\s*/?", attrs):
            errors.append(f"{where}: only class='...' attributes allowed (got {attrs.strip()!r})")
    if re.search(r"\bon\w+\s*=|javascript:|<script", value, re.I):
        errors.append(f"{where}: script/handler content not allowed")


def validate_unit(unit: dict) -> list:
    errors = []
    uid = unit.get("id")
    for key in ("id", "title", "section", "summary", "lessons"):
        if key not in unit:
            errors.append(f"unit {uid}: missing {key}")
    if errors:
        return errors
    if not isinstance(uid, int) or not 0 <= uid <= 8:
        errors.append(f"unit {uid}: id must be int 0..8")
    if unit["section"] not in (0, 1, 2, 3, 4):
        errors.append(f"unit {uid}: section must be 0..4")
    lessons = unit["lessons"]
    lo = 1 if uid == 0 else 3
    if not lo <= len(lessons) <= 5:
        errors.append(f"unit {uid}: needs {lo}-5 lessons (got {len(lessons)})")
    for li, lesson in enumerate(lessons):
        where = f"unit {uid} lesson {li + 1}"
        for key in ("title", "minutes", "screens"):
            if key not in lesson:
                errors.append(f"{where}: missing {key}")
        screens = lesson.get("screens", [])
        if not 3 <= len(screens) <= 7:
            errors.append(f"{where}: needs 3-7 screens (got {len(screens)})")
        kinds = [s.get("kind") for s in screens]
        if "check" not in kinds:
            errors.append(f"{where}: needs at least one check screen")
        if kinds and kinds[-1] != "recap":
            errors.append(f"{where}: last screen must be a recap")
        for si, s in enumerate(screens):
            w = f"{where} screen {si + 1}"
            kind = s.get("kind")
            if kind not in KINDS:
                errors.append(f"{w}: bad kind {kind!r}")
                continue
            if kind in ("concept", "example"):
                if not s.get("title") or not s.get("body"):
                    errors.append(f"{w}: concept/example needs title and body")
                else:
                    _check_html(w, s["body"], errors)
                    words = len(to_speech(s["body"]).split())
                    if words > 140:
                        errors.append(f"{w}: body too long ({words} words > 140) - split it")
                    if "<table" in s["body"] and not s.get("say"):
                        errors.append(f"{w}: screens with a <table> need a plain-English \"say\" narration")
            elif kind == "check":
                ch = s.get("choices")
                if not s.get("prompt") or not isinstance(ch, list) or len(ch) != 4 or len(set(ch)) != 4:
                    errors.append(f"{w}: check needs prompt and 4 unique choices")
                if s.get("answer") not in (0, 1, 2, 3):
                    errors.append(f"{w}: answer must be 0..3")
                if not s.get("explain"):
                    errors.append(f"{w}: check needs explain")
                for part in [s.get("prompt", ""), s.get("explain", "")] + list(ch or []):
                    _check_html(w, part, errors)
            elif kind == "recap":
                pts = s.get("points")
                if not isinstance(pts, list) or not 2 <= len(pts) <= 6:
                    errors.append(f"{w}: recap needs 2-6 points")
                for p in pts or []:
                    _check_html(w, p, errors)
    return errors
