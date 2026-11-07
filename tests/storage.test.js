const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadApp, plain } = require('./harness');

const LS_KEY = 'dailyfit.v1';
const legacy = fs.readFileSync(path.join(__dirname, 'fixtures', 'legacy-minimal.json'), 'utf8');

test('legacy data without optional fields loads with safe defaults and nothing is lost', () => {
  const { api, storage } = loadApp({ [LS_KEY]: legacy });
  const s = api.state;
  assert.strictEqual(s.items.length, 4);
  assert.deepStrictEqual(plain(s.items.map((i) => i.name)), ['Navy polo', 'Blue jeans', 'White sneakers', 'Grey hoodie']);
  assert.strictEqual(s.items[0].pattern, 'solid', 'missing pattern defaults to solid');
  assert.strictEqual(s.items[3].dirty, true, 'laundry flag is kept');
  assert.strictEqual(s.history.length, 1);
  assert.deepStrictEqual(plain(s.looks), []);
  assert.deepStrictEqual(plain(s.likes), {});
  assert.strictEqual(storage.getItem('dailyfit.v1.prev'), legacy, 'the untouched old data is kept as a recovery copy');
});

test('loading never rewrites the stored wardrobe until the user changes something', () => {
  const current = JSON.stringify({ v: 2, items: [{ id: 'a1', name: 'Tee', cat: 'top', color: 'white', style: 'casual', pattern: 'solid', warm: 1, rain: false }], history: [], prefs: { weather: 'warm', plan: 'regular' }, timetable: {}, likes: {}, rated: {}, looks: [] });
  const { storage } = loadApp({ [LS_KEY]: current });
  assert.strictEqual(storage.getItem(LS_KEY), current);
});

test('unreadable saved data is preserved under a recovery key, not overwritten', () => {
  const broken = '{"items":[{"id":"a1","name":"Tee"';
  const { api, storage } = loadApp({ [LS_KEY]: broken });
  assert.strictEqual(api.loadInfo.status, 'unreadable');
  const key = api.loadInfo.recoveryKey;
  assert.ok(key && key.startsWith('dailyfit.v1.recovery.'));
  assert.strictEqual(storage.getItem(key), broken);
  assert.strictEqual(storage.getItem(LS_KEY), broken, 'original is untouched until the user acts');
  assert.ok(api.state.items.length > 0, 'the app still opens');
});

test('stored JSON of the wrong shape (array, string) is treated as unreadable but kept', () => {
  for (const bad of ['[1,2,3]', '"hello"', 'null']) {
    const { api, storage } = loadApp({ [LS_KEY]: bad });
    assert.notStrictEqual(api.loadInfo.status, 'ok', bad);
    assert.strictEqual(storage.getItem(LS_KEY), bad);
  }
});

test('items with bad metadata are repaired, items without id/name/category are dropped but backed up', () => {
  const raw = JSON.stringify({ items: [
    { id: 'ok', name: 'Fine', cat: 'top', color: 'nope', style: 'weird', warm: 9, pattern: 7 },
    { id: 'noname', cat: 'top' },
    { name: 'noid', cat: 'top' },
    { id: 'badcat', name: 'X', cat: 'hat' },
    'junk', null, 5,
  ] });
  const { api, storage } = loadApp({ [LS_KEY]: raw });
  assert.strictEqual(api.state.items.length, 1);
  const it = api.state.items[0];
  assert.deepStrictEqual([it.color, it.style, it.warm, it.pattern], ['grey', 'casual', 2, 'solid']);
  assert.strictEqual(storage.getItem('dailyfit.v1.prev'), raw, 'dropped data stays recoverable');
});

test('a failed write is reported, not hidden, and clears once storage works again', () => {
  const { api, storage, els } = loadApp({});
  storage.failWrites = true;
  api.ui.current = api.ui.current; // no-op
  api.state.prefs.weather = 'mild';
  assert.strictEqual(api.saveLocal(), false);
  assert.strictEqual(api.ui.saveFailed, true);
  assert.match(els.notice.innerHTML, /Couldn’t save to this phone/);
  storage.failWrites = false;
  api.state.prefs.weather = 'cool';
  assert.strictEqual(api.saveLocal(), true);
  assert.strictEqual(api.ui.saveFailed, false);
  assert.strictEqual(els.notice.innerHTML, '');
});

test('unchanged state is not written twice', () => {
  const { api, storage } = loadApp({});
  api.saveLocal();
  const n = storage.writes;
  api.saveLocal();
  api.saveLocal();
  assert.strictEqual(storage.writes, n);
});

test('storage that throws on read does not stop the app from opening', () => {
  const { FakeStorage } = require('./harness');
  const orig = FakeStorage.prototype.getItem;
  FakeStorage.prototype.getItem = function () { throw new Error('blocked'); };
  try {
    const { api } = loadApp({});
    assert.ok(api.state.items.length > 0);
  } finally { FakeStorage.prototype.getItem = orig; }
});

test('bad preferences fall back to defaults instead of breaking weather or plan logic', () => {
  const raw = JSON.stringify({ items: [{ id: 'a', name: 'T', cat: 'top' }], prefs: { weather: 'blizzard', plan: 'nonsense', wxWeight: 'x', layerRule: 5, loc: { lat: 'a', lon: 5 } } });
  const { api } = loadApp({ [LS_KEY]: raw });
  const p = api.state.prefs;
  assert.deepStrictEqual([p.weather, p.plan, p.loc], ['warm', 'regular', null]);
  assert.strictEqual(p.wxWeight, undefined);
  assert.strictEqual(p.layerRule, undefined);
});
