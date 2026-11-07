const test = require('node:test');
const assert = require('node:assert');
const { loadApp, seeded, dayKey, plain } = require('./harness');

const mk = (id, cat, color, extra) => Object.assign({ id, name: id, cat, color, style: 'casual', pattern: 'solid', warm: 2, rain: false }, extra || {});
function app(items, history, prefs) {
  const a = loadApp({});
  a.api.state = { items, history: history || [], prefs: Object.assign({ weather: 'mild', plan: 'regular' }, prefs || {}), timetable: {}, likes: {}, rated: {}, looks: [] };
  a.api.ui.current = null; a.api.ui.locks = {}; a.api.ui.seen.clear();
  return a;
}
const wardrobe = () => [
  mk('top-white', 'top', 'white'), mk('top-navy', 'top', 'navy'), mk('top-olive', 'top', 'olive'), mk('top-sky', 'top', 'sky'),
  mk('bot-denim', 'bottom', 'denim'), mk('bot-black', 'bottom', 'black'), mk('bot-beige', 'bottom', 'beige'),
  mk('sh-white', 'shoes', 'white'), mk('sh-brown', 'shoes', 'brown'),
  mk('lay-grey', 'layer', 'grey', { warm: 3 }),
];
const combo = (api, ids) => {
  const c = {};
  ids.forEach((id) => { const it = api.state.items.find((i) => i.id === id); c[it.cat] = it; });
  return c;
};

test('scoring is deterministic: identical inputs always give identical results', () => {
  const { api } = app(wardrobe());
  const c = combo(api, ['top-white', 'bot-denim', 'sh-white']);
  const ctx = api.makeCtx();
  const first = plain(api.scoreCombo(c, ctx));
  for (let i = 0; i < 25; i++) {
    api.setRandom(seeded(i + 1)); // different random streams must not matter for scoring
    assert.deepStrictEqual(plain(api.scoreCombo(c, ctx)), first);
  }
});

test('randomness only affects selection, and the same seed gives the same pick', () => {
  const { api } = app(wardrobe());
  const run = (seed) => { api.setRandom(seeded(seed)); api.ui.seen.clear(); const r = api.generate(); return Object.keys(r.c).sort().map((k) => r.c[k].id).join('|'); };
  assert.strictEqual(run(7), run(7));
  const picks = new Set(); for (let s = 1; s <= 40; s++) picks.add(run(s));
  assert.ok(picks.size > 3, 'different seeds still give variety (' + picks.size + ' outfits)');
});

test('laundry items never appear in a pick, in shuffles or in the weekly plan', () => {
  const items = wardrobe();
  items.find((i) => i.id === 'top-navy').dirty = true;
  items.find((i) => i.id === 'sh-brown').dirty = true;
  items.find((i) => i.id === 'lay-grey').dirty = true;
  const { api } = app(items);
  const bad = new Set(['top-navy', 'sh-brown', 'lay-grey']);
  for (let s = 1; s <= 60; s++) {
    api.setRandom(seeded(s)); api.ui.seen.clear();
    const r = api.generate({ free: true });
    Object.keys(r.c).forEach((k) => assert.ok(!bad.has(r.c[k].id), 'picked ' + r.c[k].id));
  }
  api.setRandom(seeded(3));
  api.planWeek().forEach((d) => d.ids.forEach((id) => assert.ok(!bad.has(id), 'planned ' + id)));
});

test('a locked piece that went to the wash is not kept', () => {
  const { api } = app(wardrobe());
  api.setRandom(seeded(1));
  const r = api.generate();
  const cur = {}; Object.keys(r.c).forEach((k) => { cur[k] = r.c[k].id; });
  api.ui.current = cur; api.ui.locks = { shoes: true };
  api.state.items.find((i) => i.id === cur.shoes).dirty = true;
  for (let s = 1; s <= 20; s++) { api.setRandom(seeded(s)); assert.notStrictEqual(api.generate().c.shoes.id, cur.shoes); }
});

test('pieces worn recently score lower than the same outfit with fresh pieces', () => {
  const items = wardrobe();
  const yesterday = [{ d: dayKey(-1), ids: ['top-white'] }];
  const withHistory = app(items, yesterday).api;
  const noHistory = app(items, []).api;
  const ids = ['top-white', 'bot-denim', 'sh-white'];
  const worn = withHistory.scoreCombo(combo(withHistory, ids), withHistory.makeCtx()).s;
  const fresh = noHistory.scoreCombo(combo(noHistory, ids), noHistory.makeCtx()).s;
  assert.ok(worn < fresh - 3, 'worn ' + worn + ' vs fresh ' + fresh);
});

test('the same complete outfit is never chosen two days in a row when alternatives exist', () => {
  const { api } = app(wardrobe(), [{ d: dayKey(-1), ids: ['top-white', 'bot-denim', 'sh-white'] }]);
  const banned = api.outfitKey(['top-white', 'bot-denim', 'sh-white']);
  for (let s = 1; s <= 80; s++) {
    api.setRandom(seeded(s)); api.ui.seen.clear();
    const r = api.generate();
    const key = api.outfitKey(Object.keys(r.c).map((k) => r.c[k].id));
    assert.notStrictEqual(key, banned);
    assert.strictEqual(!!r.repeat, false);
  }
});

test('the weekly plan has no duplicate outfits when the wardrobe allows it', () => {
  for (let s = 1; s <= 15; s++) {
    const { api } = app(wardrobe(), [{ d: dayKey(0), ids: ['top-white', 'bot-denim', 'sh-white'] }]);
    api.setRandom(seeded(s));
    const plan = api.planWeek();
    assert.strictEqual(plan.length, 6);
    const keys = plan.map((d) => api.outfitKey(plain(d.ids)));
    assert.strictEqual(new Set(keys).size, 6, 'seed ' + s);
    assert.ok(!keys.includes(api.outfitKey(['top-white', 'bot-denim', 'sh-white'])), 'does not repeat today');
    plan.forEach((d) => assert.strictEqual(d.repeat, false));
  }
});

test('a tiny wardrobe is told honestly that it must repeat', () => {
  const items = [mk('t', 'top', 'white'), mk('b', 'bottom', 'denim'), mk('s', 'shoes', 'white')];
  const { api } = app(items, [{ d: dayKey(-1), ids: ['t', 'b', 's'] }]);
  api.setRandom(seeded(1));
  const r = api.generate();
  assert.ok(r, 'still gives an outfit');
  assert.strictEqual(r.repeat, true);
  const plan = api.planWeek();
  assert.strictEqual(plan.length, 6);
  assert.ok(plan.every((d) => d.repeat === true));
});

test('a wardrobe with two valid outfits alternates instead of repeating', () => {
  const items = [mk('t1', 'top', 'white'), mk('t2', 'top', 'navy'), mk('b', 'bottom', 'denim'), mk('s', 'shoes', 'white')];
  const { api } = app(items, [{ d: dayKey(-1), ids: ['t1', 'b', 's'] }]);
  api.setRandom(seeded(2));
  const r = api.generate();
  assert.strictEqual(r.c.top.id, 't2');
  assert.strictEqual(r.repeat, false);
});

test('no outfit can be built without shoes or without a top and bottom', () => {
  assert.strictEqual(app([mk('t', 'top', 'white'), mk('b', 'bottom', 'denim')]).api.generate(), null);
  assert.strictEqual(app([mk('t', 'top', 'white'), mk('s', 'shoes', 'white')]).api.generate(), null);
  assert.strictEqual(app([]).api.generate(), null);
});

test('a one-piece plus shoes is enough', () => {
  const { api } = app([mk('o', 'one', 'teal', { style: 'ethnic' }), mk('s', 'shoes', 'brown')]);
  const r = api.generate();
  assert.ok(r && r.c.one);
});

test('colour scoring copes with missing or unknown colours and metadata', () => {
  const { api } = app(wardrobe());
  const a = { id: 'x', name: 'x', cat: 'top' };                 // no colour, warm, style or pattern at all
  const b = { id: 'y', name: 'y', cat: 'bottom', color: 'not-a-colour' };
  const s = { id: 'z', name: 'z', cat: 'shoes', color: undefined };
  const e = api.colorEval(a, b, null, s);
  assert.ok(Number.isFinite(e.score));
  const r = api.scoreCombo({ top: a, bottom: b, shoes: s }, api.makeCtx());
  assert.ok(Number.isFinite(r.s));
});

test('colour theory: classic pairs beat clashing pairs', () => {
  const { api } = app(wardrobe());
  const p = (c1, c2) => api.pairScore(mk('a', 'top', c1), mk('b', 'bottom', c2));
  assert.ok(p('navy', 'beige') > p('red', 'pink'));
  assert.ok(p('white', 'denim') > p('red', 'green'));
  assert.strictEqual(p('navy', 'beige'), p('beige', 'navy'), 'order does not matter');
});

test('missing weather information falls back safely', () => {
  const { api } = app(wardrobe(), [], { weather: 'live' });   // live selected but no forecast loaded
  assert.ok(api.generate());
  const { api: b } = app(wardrobe(), [], { weather: 'unknown-value' });
  assert.ok(b.generate());
});

test('layers respect the once-a-week rule', () => {
  const { api } = app(wardrobe(), [{ d: dayKey(-3), ids: ['top-white', 'bot-denim', 'sh-white', 'lay-grey'] }], { weather: 'cool' });
  assert.strictEqual(api.layerWait(), 4);
  for (let s = 1; s <= 30; s++) { api.setRandom(seeded(s)); assert.ok(!api.generate({ layerOK: undefined }).c.layer, 'no layer before day 7'); }
});

test('timetable-driven planning still works: a presentation day picks smart tops more often than a free day', () => {
  const items = wardrobe().concat([mk('top-smart', 'top', 'white', { style: 'smart', name: 'smart shirt' }), mk('bot-smart', 'bottom', 'black', { style: 'smart' }), mk('sh-smart', 'shoes', 'brown', { style: 'smart' })]);
  const share = (withClass) => {
    const { api } = app(items, [], { plan: 'auto' });
    if (withClass) api.state.timetable = { [String(new Date().getDay())]: [{ id: 'c1', name: 'Seminar', type: 'present', start: '10:00', end: '11:00' }] };
    let smart = 0;
    for (let s = 1; s <= 100; s++) { api.setRandom(seeded(s)); api.ui.seen.clear(); if (api.generate().c.top.style === 'smart') smart++; }
    return smart;
  };
  const free = share(false), present = share(true);
  assert.ok(present >= free + 10, 'presentation day ' + present + '/100 vs free day ' + free + '/100');
});
