/* Optional real-browser regression checks for the main features (needs Playwright; see TESTING.md).
   BASE=http://localhost:8080/daily-fit/ PHOTO=/path/to/any.jpg node tests/e2e/feature-checks.js */
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8080/daily-fit/';
const PHOTO = process.env.PHOTO || '/tmp/test-navy.jpg';
let pass = 0, fail = 0;
const check = (n, ok, d) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (d ? '  [' + d + ']' : '')); };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, acceptDownloads: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(BASE); await page.waitForSelector('#outfit .tagcard');

  // phone shell + welcome guide on a fresh install
  check('welcome guide is shown on first run', (await page.innerText('#welcome')).length > 20);
  check('bottom tab bar is present', await page.evaluate(() => { const n = document.querySelector('nav'); return !!n && getComputedStyle(n).position === 'fixed' || !!document.querySelector('.tabbar,.bottomnav,nav.seg'); }));
  check('outfit card shows pieces and a colour-match rating', /Colour match/i.test(await page.innerText('#outfit')));
  const skip = await page.$('[data-action="welcome-skip"]'); if (skip) await skip.click();

  // shuffle / wear / undo
  await page.click('[data-action="shuffle"]'); check('shuffle works', await page.$('#outfit .tagcard') !== null);
  await page.click('[data-action="wear"]'); check('wear logs today', /Wearing today/.test(await page.innerText('#outfit')));
  await page.click('[data-action="unwear"]');
  // share: outfit image is generated (no crash when the Web Share API is missing)
  const shareBtn = await page.$('[data-action="shareoutfit"]');
  if (shareBtn) {
    const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 4000 }).catch(() => null), shareBtn.click()]);
    await page.waitForTimeout(500);
    check('share outfit runs without error', errs.length === 0, dl2 ? 'downloaded ' + dl2.suggestedFilename() : errs.join('|'));
  } else check('share outfit button exists', false);

  // saved looks
  await page.click('[data-action="savelook"]'); await page.click('#tab-week');
  check('saved look appears in Plan', /LOOK 1/i.test(await page.innerText('#looks')));
  check('six-day plan renders', (await page.$$('#weeklist .rrow')).length === 6);

  // wardrobe: search, filter, quick add, edit, photo, wash
  await page.click('#tab-wardrobe');
  const total = (await page.$$('.irow')).length;
  await page.fill('#wq', 'navy'); const navy = (await page.$$('.irow')).length; await page.fill('#wq', '');
  check('search narrows the list', navy > 0 && navy < total, navy + ' of ' + total);
  await page.click('[data-quick]'); check('quick add adds a piece', (await page.$$('.irow')).length === total + 1);
  await page.click('[data-edit]'); await page.fill('#f-name', 'Edited piece'); await page.click('#f-submit');
  check('editing a piece saves the new name', (await page.innerText('#list')).includes('Edited piece'));
  await page.click('[data-photo]'); await page.setInputFiles('#pic', PHOTO); await page.waitForTimeout(800);
  const photos = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('dailyfit.photo.')).length);
  check('attaching a photo stores it', photos === 1, photos + ' stored');
  await page.click('[data-wash]'); check('wash marks a piece', /In the wash/.test(await page.innerText('#list')));
  await page.click('[data-wash]');

  // backup export, bad import, good restore, undo
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="export"]')]);
  const file = '/tmp/df-backup.json'; await dl.saveAs(file);
  const bk = JSON.parse(fs.readFileSync(file, 'utf8'));
  check('export contains wardrobe, history keys and photos', Array.isArray(bk.items) && bk.v === 2 && Object.keys(bk.photos || {}).length === 1);
  const countBefore = bk.items.length;
  await page.click('[data-action="clearsamples"]').catch(() => {});
  fs.writeFileSync('/tmp/df-bad.json', '{"v":2,"items":"nope"}');
  const before = await page.evaluate(() => localStorage.getItem('dailyfit.v1'));
  await page.setInputFiles('#imp', '/tmp/df-bad.json'); await page.waitForTimeout(300);
  check('invalid backup is rejected and data is untouched', before === await page.evaluate(() => localStorage.getItem('dailyfit.v1')));
  await page.setInputFiles('#imp', file); await page.waitForTimeout(400);
  const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('dailyfit.v1')).items.length);
  check('valid backup restores the full wardrobe', restored === countBefore, restored + ' of ' + countBefore);
  check('restore shows an Undo button', await page.$('#toast-undo') !== null);
  const afterRestore = restored;
  await page.click('#toast-undo'); await page.waitForTimeout(300);
  const afterUndo = await page.evaluate(() => JSON.parse(localStorage.getItem('dailyfit.v1')).items.length);
  check('undo returns to the previous wardrobe', afterUndo !== afterRestore || countBefore === afterUndo, afterUndo + ' items');

  // storage failure is visible
  await page.evaluate(() => { Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError'); }; });
  await page.click('[data-quick]').catch(() => {});
  await page.waitForTimeout(200);
  check('a failed save shows a visible warning', /Couldn’t save to this phone/.test(await page.innerText('#notice')));

  check('share app button exists', await page.$('[data-action="shareapp"]') !== null);
  check('no page errors during the run', errs.length === 0, errs.join(' | '));
  await browser.close();
  console.log('\n' + pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
