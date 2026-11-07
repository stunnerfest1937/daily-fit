const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./harness');
test('app boots with sample data on a fresh install', () => {
  const { api } = loadApp({});
  assert.ok(api.state.items.length > 10);
  assert.ok(api.ui.current, 'an outfit is chosen');
});
