const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadApp, plain } = require('./harness');

const LS_KEY = 'dailyfit.v1';
const legacy = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'legacy-minimal.json'), 'utf8'));
const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
const item = (id, cat, extra) => Object.assign({ id, name: 'Piece ' + id, cat, color: 'navy', style: 'casual', pattern: 'solid', warm: 2, rain: false }, extra || {});
const basic = () => ({ v: 2, items: [item('t1', 'top'), item('b1', 'bottom'), item('s1', 'shoes')], history: [{ d: '2025-03-01', ids: ['t1', 'b1', 's1'] }], prefs: {}, timetable: {}, likes: {}, rated: {}, looks: [] });

test('a backup exported by the app validates and restores completely', () => {
  const { api } = loadApp({});
  const exported = JSON.parse(JSON.stringify(Object.assign(api.serialize(), { photos: {} })));
  const res = api.validateBackup(exported);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.state.items.length, api.state.items.length);
  assert.strictEqual(plain(res.warnings).length, 0);
});

test('an old backup with only some fields is accepted with defaults', () => {
  const { api } = loadApp({});
  const res = api.validateBackup(legacy);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.state.items.length, 4);
  assert.strictEqual(res.state.prefs.plan, 'regular');
  assert.deepStrictEqual(plain(res.state.timetable), {});
});

test('files that are not objects are rejected', () => {
  const { api } = loadApp({});
  for (const bad of [null, [], 5, 'text', true]) {
    const res = api.validateBackup(bad);
    assert.strictEqual(res.ok, false, JSON.stringify(bad));
    assert.ok(res.error.length > 10);
  }
});

test('wrong types inside a backup are rejected, not half-parsed', () => {
  const { api } = loadApp({});
  for (const patch of [{ items: 'x' }, { items: {} }, { history: 'x' }, { timetable: [] }, { prefs: 3 }, { likes: [] }, { looks: {} }, { photos: [] }]) {
    const res = api.validateBackup(Object.assign(basic(), patch));
    assert.strictEqual(res.ok, false, JSON.stringify(patch));
  }
});

test('empty and unrelated backups are rejected', () => {
  const { api } = loadApp({});
  assert.strictEqual(api.validateBackup({}).ok, false);
  assert.strictEqual(api.validateBackup({ hello: 'world' }).ok, false);
  const empty = api.validateBackup({ v: 2, items: [], history: [], timetable: {} });
  assert.strictEqual(empty.ok, false);
  assert.match(empty.error, /empty/);
});

test('backups from a newer or malformed version are rejected', () => {
  const { api } = loadApp({});
  assert.match(api.validateBackup(Object.assign(basic(), { v: 3 })).error, /newer version/);
  assert.strictEqual(api.validateBackup(Object.assign(basic(), { v: '2' })).ok, false);
});

test('unusable items are skipped with a warning; a backup with only unusable items is rejected', () => {
  const { api } = loadApp({});
  const mixed = basic();
  mixed.items.push({ id: 'x', cat: 'top' }, 7, { id: 'y', name: 'Hat', cat: 'hat' });
  const res = api.validateBackup(mixed);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.state.items.length, 3);
  assert.match(plain(res.warnings).join(' '), /3 items skipped/);
  const allBad = api.validateBackup({ items: [{ id: 'x' }, null] });
  assert.strictEqual(allBad.ok, false);
});

test('duplicate ids and invalid dates are cleaned', () => {
  const { api } = loadApp({});
  const b = basic();
  b.items.push(item('t1', 'top', { name: 'Duplicate' }));
  b.history.push({ d: '2025-02-30', ids: ['t1'] }, { d: 'yesterday', ids: ['t1'] }, { d: '2025-03-02', ids: [] });
  const res = api.validateBackup(b);
  assert.strictEqual(res.state.items.length, 3);
  assert.strictEqual(res.state.items.filter((i) => i.id === 't1')[0].name, 'Piece t1', 'the first one wins');
  assert.strictEqual(res.state.history.length, 1);
});

test('history and saved looks that point at missing pieces are cleaned up', () => {
  const { api } = loadApp({});
  const b = basic();
  b.history.push({ d: '2025-03-05', ids: ['gone1', 'gone2'] }, { d: '2025-03-06', ids: ['t1', 'gone3'] });
  b.looks = [{ ids: ['gone1'] }, { ids: ['t1', 'b1', 's1'] }];
  const res = api.validateBackup(b);
  const dates = plain(res.state.history).map((h) => h.d);
  assert.deepStrictEqual(dates, ['2025-03-01', '2025-03-06']);
  assert.deepStrictEqual(plain(res.state.history[1].ids), ['t1']);
  assert.strictEqual(res.state.looks.length, 1);
  assert.ok(res.warnings.length > 0);
});

test('only valid photos for existing pieces are accepted', () => {
  const { api } = loadApp({});
  const b = basic();
  b.photos = { t1: JPEG, b1: 'javascript:alert(1)', s1: 'data:text/html;base64,AAAA', ghost: JPEG, x: 5 };
  const res = api.validateBackup(b);
  assert.deepStrictEqual(Object.keys(plain(res.photos)), ['t1']);
  assert.match(plain(res.warnings).join(' '), /4 photos skipped/);
});

test('likes and ratings are clamped to valid values', () => {
  const { api } = loadApp({});
  const b = basic();
  b.likes = { t1: 99, b1: 'lots', s1: -50 };
  b.rated = { 'a,b': 1, 'c,d': 7, 'e,f': -1 };
  const res = api.validateBackup(b);
  assert.deepStrictEqual(plain(res.state.likes), { t1: 3, s1: -3 });
  assert.deepStrictEqual(plain(res.state.rated), { 'a,b': 1, 'e,f': -1 });
});

/* ---- applying and importing ---- */
class FakeReader {
  readAsText(f) { this.result = f.text; setTimeout0(() => this.onload && this.onload()); }
}
const setTimeout0 = (fn) => fn();

test('malformed JSON file changes nothing', () => {
  const saved = JSON.stringify(Object.assign(basic(), { items: [item('keep', 'top')] }));
  const { api, storage } = loadApp({ [LS_KEY]: saved }, { FileReader: FakeReader });
  const before = JSON.stringify(plain(api.state));
  api.importData({ size: 10, text: '{"items": [' });
  assert.strictEqual(JSON.stringify(plain(api.state)), before);
  assert.strictEqual(storage.getItem(LS_KEY), saved);
});

test('a valid file replaces the wardrobe and is stored; the previous data is kept as a recovery copy', () => {
  const saved = JSON.stringify(Object.assign(basic(), { items: [item('old', 'top')], history: [] }));
  const { api, storage } = loadApp({ [LS_KEY]: saved }, { FileReader: FakeReader });
  api.importData({ size: 10, text: JSON.stringify(Object.assign(basic(), { photos: { t1: JPEG } })) });
  assert.deepStrictEqual(plain(api.state.items.map((i) => i.id)), ['t1', 'b1', 's1']);
  assert.strictEqual(JSON.parse(storage.getItem(LS_KEY)).items.length, 3);
  assert.strictEqual(storage.getItem('dailyfit.v1.prev'), saved);
  assert.strictEqual(storage.getItem('dailyfit.photo.t1'), JPEG);
});

test('import is atomic: if the wardrobe cannot be saved, nothing changes', () => {
  const saved = JSON.stringify(Object.assign(basic(), { items: [item('old', 'top')], history: [] }));
  const { api, storage } = loadApp({ [LS_KEY]: saved });
  const before = JSON.stringify(plain(api.state));
  storage.failPrefix = LS_KEY;
  const res = api.applyImport(api.validateBackup(basic()));
  assert.strictEqual(res.ok, false);
  assert.strictEqual(JSON.stringify(plain(api.state)), before);
  assert.strictEqual(storage.getItem(LS_KEY), saved);
});

test('import is atomic: if the photos do not fit, the old wardrobe is restored exactly', () => {
  const saved = JSON.stringify(Object.assign(basic(), { items: [item('old', 'top')], history: [] }));
  const { api, storage } = loadApp({ [LS_KEY]: saved });
  const before = JSON.stringify(plain(api.state));
  storage.failPrefix = 'dailyfit.photo.';
  const b = basic(); b.photos = { t1: JPEG };
  const res = api.applyImport(api.validateBackup(b));
  assert.strictEqual(res.ok, false);
  assert.strictEqual(JSON.stringify(plain(api.state)), before);
  assert.strictEqual(storage.getItem(LS_KEY), saved);
  assert.strictEqual(storage.getItem('dailyfit.photo.t1'), null);
});

test('undo after a restore brings the previous wardrobe back', () => {
  const saved = JSON.stringify(Object.assign(basic(), { items: [item('old', 'top')], history: [] }));
  const { api, storage } = loadApp({ [LS_KEY]: saved });
  const res = api.applyImport(api.validateBackup(basic()));
  assert.strictEqual(res.ok, true);
  res.undo();
  assert.deepStrictEqual(plain(api.state.items.map((i) => i.id)), ['old']);
  assert.strictEqual(JSON.parse(storage.getItem(LS_KEY)).items[0].id, 'old');
});
