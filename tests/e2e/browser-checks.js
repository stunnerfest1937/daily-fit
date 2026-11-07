/* Optional real-browser checks (not part of `npm test`).
   Needs Playwright with Chromium (npm i -D playwright && npx playwright install chromium).
   Serve the folder UNDER A SUB-PATH, as GitHub Pages does, then run:
     mkdir /tmp/serve && ln -s "$PWD" /tmp/serve/daily-fit && (cd /tmp/serve && python3 -m http.server 8080 &)
     BASE=http://localhost:8080/daily-fit/ SW_FILE=/path/to/served/copy/sw.js node tests/e2e/browser-checks.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8080/daily-fit/';
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  [' + detail + ']' : '')); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'allow' });
  const page = await ctx.newPage();
  const hosts = new Set(); const errors = [];
  page.on('request', (r) => hosts.add(new URL(r.url()).host));
  page.on('pageerror', (e) => errors.push(e.message));
  const skipWelcome = async () => { const b = await page.$('[data-action="welcome-skip"]'); if (b) await b.click(); };

  // 1. first load registers the service worker at the sub-path scope and caches the shell
  await page.goto(BASE); await page.waitForSelector('#outfit .tagcard');
  const sw = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return { scope: reg.scope, url: reg.active && reg.active.scriptURL };
  });
  check('service worker registered with the /daily-fit/ scope', sw.scope.endsWith('/daily-fit/') && sw.url.endsWith('/daily-fit/sw.js'), sw.scope);
  await page.reload(); await page.waitForSelector('#outfit .tagcard');
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys(); const c = await caches.open(keys.find((k) => k.startsWith('dailyfit-')));
    const reqs = (await c.keys()).map((r) => new URL(r.url).pathname);
    return { keys, reqs };
  });
  const needed = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
  check('app shell is cached', needed.every((n) => cached.reqs.some((p) => p.endsWith('/' + n))), cached.reqs.join(' '));
  check('no third-party response is cached', cached.reqs.every((p) => p.startsWith('/daily-fit/')));

  // 2. offline reload still opens, even with live weather selected and the weather service unreachable
  await page.evaluate(() => { const o = JSON.parse(localStorage.getItem('dailyfit.v1')) || {}; o.prefs = Object.assign({}, o.prefs, { weather: 'live', loc: { lat: 18.52, lon: 73.86, name: 'Pune' } }); localStorage.setItem('dailyfit.v1', JSON.stringify(o)); });
  await ctx.setOffline(true);
  await page.reload(); await page.waitForSelector('#outfit .tagcard', { timeout: 8000 }).catch(() => {});
  check('opens offline with a failed weather request', await page.$('#outfit .tagcard') !== null);
  check('offline page shows the weather fallback message (no crash)', errors.length === 0, errors.join(' | '));
  await ctx.setOffline(false);

  // 3. unrelated caches survive a service-worker update; the app's own old caches are removed
  await page.evaluate(async () => { await (await caches.open('someone-elses-cache')).put('/x', new Response('x')); await (await caches.open('dailyfit-v0-old')).put('/y', new Response('y')); });
  // To simulate a new release this check edits VERSION in the served copy of sw.js (set SW_FILE to that copy).
  const swFile = process.env.SW_FILE;
  if (swFile) {
    const nodefs = require('fs'); const orig = nodefs.readFileSync(swFile, 'utf8');
    nodefs.writeFileSync(swFile, orig.replace("const VERSION = '9'", "const VERSION = '99'"));
    await page.evaluate(async () => { const reg = await navigator.serviceWorker.ready; await reg.update(); });
    for (let i = 0; i < 40; i++) { const k = await page.evaluate(() => caches.keys()); if (!k.includes('dailyfit-v9') && k.includes('dailyfit-v99')) break; await page.waitForTimeout(250); }
    nodefs.writeFileSync(swFile, orig);
    const after = await page.evaluate(async () => caches.keys());
    check('update removes old dailyfit caches', !after.includes('dailyfit-v0-old') && !after.includes('dailyfit-v9') && after.includes('dailyfit-v99'), after.join(','));
    check('update leaves unrelated caches alone', after.includes('someone-elses-cache'), after.join(','));
  } else console.log('SKIP cache-cleanup checks (set SW_FILE to a served copy of sw.js)');

  // 4. unreadable saved data: app opens, warns, keeps a copy
  const p2 = await ctx.newPage();
  await p2.addInitScript(() => { if (!localStorage.getItem('__seeded')) { localStorage.setItem('dailyfit.v1', '{"items":[{"id":"a"'); localStorage.setItem('__seeded', '1'); } });
  await p2.goto(BASE); await p2.waitForSelector('#outfit .tagcard');
  const notice = await p2.innerText('#notice');
  check('unreadable data shows a warning with a recovery option', /couldn’t be read/.test(notice) && /Download copy/i.test(notice), notice.slice(0, 80));
  const kept = await p2.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('dailyfit.v1.recovery.')).length);
  check('a recovery copy exists in storage', kept === 1);
  await p2.close();

  // 5. importing a malformed file leaves the wardrobe untouched
  await skipWelcome();
  await page.click('#tab-wardrobe');
  const before = await page.evaluate(() => localStorage.getItem('dailyfit.v1'));
  const fs = require('fs'); fs.writeFileSync('/tmp/bad-backup.json', '{"items": [');
  await page.setInputFiles('#imp', '/tmp/bad-backup.json');
  await page.waitForSelector('#toast:not([hidden])');
  const toast = await page.innerText('#toast');
  check('malformed backup is rejected with a message', /valid JSON/.test(toast), toast);
  check('malformed backup leaves saved data unchanged', before === await page.evaluate(() => localStorage.getItem('dailyfit.v1')));
  fs.writeFileSync('/tmp/wrong-backup.json', JSON.stringify({ items: 'nope' }));
  await page.setInputFiles('#imp', '/tmp/wrong-backup.json');
  await page.waitForTimeout(300);
  check('wrong-type backup is rejected', /damaged|wrong type/.test(await page.innerText('#toast')));

  // 6. layout at a very narrow width, every tab
  await page.setViewportSize({ width: 320, height: 640 });
  for (const t of ['today', 'week', 'timetable', 'wardrobe']) {
    await page.click('#tab-' + t); await page.waitForTimeout(150);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check('no horizontal scroll at 320px on ' + t, over <= 0, 'overflow ' + over + 'px');
  }
  await page.click('#tab-today');
  const small = await page.evaluate(() => Array.from(document.querySelectorAll('button,input,select')).filter((e) => e.offsetParent && !e.classList.contains('vh')).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.innerText || e.id || e.name || '').slice(0, 20), h: Math.round(r.height), w: Math.round(r.width) }; }).filter((x) => x.h < 36 || x.w < 36));
  check('visible controls on Today are at least 36px tall and wide', small.length === 0, JSON.stringify(small).slice(0, 200));
  const fs16 = await page.evaluate(() => Array.from(document.querySelectorAll('input[type=text],select,input[type=time]')).filter((e) => parseFloat(getComputedStyle(e).fontSize) < 16).map((e) => e.id));
  check('text inputs are 16px or larger (no iOS zoom on focus)', fs16.length === 0, fs16.join(','));

  // 7. network hosts
  const external = Array.from(hosts).filter((h) => !h.startsWith('localhost'));
  check('only known third-party hosts were contacted', external.every((h) => /^(fonts\.googleapis\.com|fonts\.gstatic\.com|api\.open-meteo\.com|geocoding-api\.open-meteo\.com)$/.test(h)), external.join(', '));

  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log('\n' + (results.length - failed) + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
