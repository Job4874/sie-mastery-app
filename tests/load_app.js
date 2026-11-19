/* load_app.js - loads SIE Mastery's split deferred scripts into a Node vm sandbox
   in the exact <script defer src="..."> order declared in static/index.html. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const STATIC = path.join(ROOT, "static");

function getScriptList() {
  const html = fs.readFileSync(path.join(STATIC, "index.html"), "utf8");
  const scripts = [];
  const re = /<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g;
  let m;
  while ((m = re.exec(html))) scripts.push(m[1]);
  return scripts;
}

function readAllAppJs() {
  return getScriptList()
    .map(rel => ({ rel, code: fs.readFileSync(path.join(STATIC, rel), "utf8") }));
}

function makeEl(id, stateful) {
  const classes = new Set();
  const attrs = new Map();
  const el = {
    id, textContent: "", innerHTML: "", className: "", checked: true, value: "af_heart",
    disabled: false, style: {}, dataset: {},
    classList: stateful
      ? {
          add: (...cs) => cs.forEach(c => classes.add(c)),
          remove: (...cs) => cs.forEach(c => classes.delete(c)),
          contains: c => classes.has(c),
          toggle: (c, f) => { const on = f === undefined ? !classes.has(c) : Boolean(f); on ? classes.add(c) : classes.delete(c); return on; }
        }
      : { add() {}, remove() {}, contains() { return false; }, toggle() { return false; } },
    setAttribute: stateful ? (k, v) => attrs.set(k, String(v)) : () => {},
    getAttribute: stateful ? k => (attrs.has(k) ? attrs.get(k) : null) : () => null,
    removeAttribute: stateful ? k => attrs.delete(k) : () => {},
    addEventListener() {}, appendChild() {}, querySelector() { return null; },
    querySelectorAll() { return []; }, remove() {}, focus() {},
    play() { return Promise.resolve(); }, pause() {}
  };
  return el;
}

function createSandbox(opts) {
  opts = opts || {};
  const stateful = Boolean(opts.stateful);
  const elements = new Map();
  const storage = new Map();
  const docAttrs = new Map([["data-theme", "light"], ["data-adhd", "off"]]);
  const document = {
    title: "",
    documentElement: {
      setAttribute: (k, v) => docAttrs.set(k, String(v)),
      getAttribute: k => (docAttrs.has(k) ? docAttrs.get(k) : null)
    },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, makeEl(id, stateful));
      return elements.get(id);
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement(tag) { return makeEl(tag, stateful); },
    addEventListener() {},
    body: makeEl("body", stateful)
  };
  const localStorage = stateful
    ? {
        getItem: k => (storage.has(k) ? storage.get(k) : null),
        setItem: (k, v) => storage.set(k, String(v)),
        removeItem: k => storage.delete(k)
      }
    : { getItem() { return null; }, setItem() {}, removeItem() {} };
  const location = Object.assign(
    { hostname: "127.0.0.1", protocol: "http:", hash: "#/learn", replace(h) { this.hash = h; } },
    opts.location || {}
  );
  const sandbox = {
    console, document, localStorage, location,
    history: { replaceState(s, t, h) { location.hash = h; } },
    Audio: function () { return makeEl("audio", stateful); },
    SpeechSynthesisUtterance: function (t) { this.text = t; },
    speechSynthesis: { cancel() {}, speak() {} },
    fetch: opts.fetch || (() => Promise.reject(new Error("offline"))),
    alert() {}, confirm() { return true; }, scrollTo() {},
    addEventListener() {},
    setInterval() { return 0; }, clearInterval() {},
    setTimeout() { return 0; }, clearTimeout() {},
    matchMedia: () => ({ matches: false }),
    Date, Math, JSON, Number, Object, Array, String, RegExp, parseInt, parseFloat, isNaN,
    encodeURIComponent, decodeURIComponent,
    ...(opts.extras || {})
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const { rel, code } of readAllAppJs()) {
    vm.runInContext(code, sandbox, { filename: rel });
  }
  return sandbox;
}

module.exports = { ROOT, STATIC, getScriptList, readAllAppJs, createSandbox };
