/* registry.js - curriculum registry.
   Each file in js/data/units/ calls SIE.registerUnit({...}) with a STRICT JSON object
   (double-quoted keys and strings, no trailing commas, no comments inside the object)
   so tools/content_lib.py can parse the same source to compose lesson audio. */
var SIE = window.SIE || {};
window.SIE = SIE;
SIE.units = SIE.units || [];
SIE.registerUnit = function (unit) {
  if (!unit || typeof unit.id !== "number") return;
  SIE.units[unit.id] = unit;
};
/* Deterministic audio path for a lesson screen; part is "" (main), "q" (check prompt) or "x" (check explanation). */
SIE.screenAudio = function (unitId, lessonIdx, screenIdx, part) {
  return "audio/lessons/u" + unitId + "-l" + (lessonIdx + 1) + "-s" + (screenIdx + 1) + (part ? "-" + part : "") + ".mp3";
};
