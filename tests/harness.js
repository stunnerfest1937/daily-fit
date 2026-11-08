'use strict';
/* Loads the app's inline script from index.html into a Node vm with a very small DOM stub.
   No dependencies. The app exposes its internals only when window.__DAILYFIT_TEST__ is set. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const INDEX = process.env.DF_INDEX || path.join(__dirname, '..', 'index.html');

function el() {
  const target = { dataset: {}, style: {}, files: [], value: '', checked: false, hidden: false, innerHTML: '', textContent: '', elements: { color: { value: '' } } };
  const noop = () => undefined;
  return new Proxy(target, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === 'classList') return { add: noop, remove: noop, toggle: noop, contains: () => false };
      if (k === 'closest' || k === 'querySelector') return () => null;
      if (k === 'querySelectorAll') return () => [];
      if (k === 'getContext') return () => new Proxy({}, { get: () => noop });
      if (typeof k === 'symbol') return undefined;
      return noop;
    },
    set(t, k, v) { t[k] = v; return true; },
  });
}

class FakeStorage {
  constructor(seed) { this.map = new Map(Object.entries(seed || {})); this.failWrites = false; this.failPrefix = null; this.writes = 0; }
  get length() { return this.map.size; }
  key(i) { return Array.from(this.map.keys())[i] ?? null; }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) {
    if (this.failWrites) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; }
    if (this.failPrefix && k.startsWith(this.failPrefix)) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; }
    this.writes++; this.map.set(k, String(v));
  }
  removeItem(k) { this.map.delete(k); }
}

/* seed: object of localStorage keys -> string values. Returns {api, storage, run}. */
function loadApp(seed, opts) {
  opts = opts || {};
  const html = fs.readFileSync(INDEX, 'utf8');
  const m = html.match(/<script>([\s\S]*)<\/script>/);
  if (!m) throw new Error('no inline script found');
  const storage = new FakeStorage(seed);
  const els = {};
  const document = {
    getElementById: (id) => els[id] || (els[id] = el()),
    querySelector: () => null, querySelectorAll: () => [],
    createElement: () => el(), addEventListener() {}, hidden: false,
    body: el(),
  };
  const win = { __DAILYFIT_TEST__: {}, scrollTo() {}, addEventListener() {}, matchMedia: () => ({ matches: false }) };
  const ctx = {
    window: win, document, localStorage: storage,
    navigator: { userAgent: 'node-test' }, location: { protocol: 'file:' },
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} }, Blob: class {},
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0,
    fetch: () => Promise.reject(new Error('network disabled in tests')),
    console, Math, Date, JSON, Object, Array, Map, Set, Promise, RegExp, Number, String, Error, parseInt, parseFloat, isFinite, encodeURIComponent,
    FileReader: opts.FileReader, Image: class {},
  };
  vm.createContext(ctx);
  vm.runInContext(m[1], ctx, { filename: 'index.html' });
  const api = win.__DAILYFIT_TEST__.api;
  if (!api) throw new Error('test hook missing');
  return { api, storage, els, window: win };
}

/* Deterministic random numbers for tests. */
function seeded(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dayKey(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/* Values created inside the vm belong to another realm; copy them before deepStrictEqual. */
const plain = (x) => JSON.parse(JSON.stringify(x));

module.exports = { loadApp, seeded, dayKey, FakeStorage, plain };
