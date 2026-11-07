# Testing

## Automated tests (Node 18+, nothing to install)

```bash
npm test
```

The tests load `index.html`'s script into Node with a small stand-in for the browser (`tests/harness.js`). They do not need a browser or any packages.

| File | What it covers |
|---|---|
| `tests/storage.test.js` | Old saved data, missing or invalid fields, unreadable saved data (kept in a recovery key), failed writes, no write when nothing changed, bad preferences |
| `tests/backup.test.js` | Valid backups, missing fields, wrong types, empty and unrelated files, newer versions, invalid items and dates, references to missing pieces, photo validation, atomic restore, failed-save rollback, undo |
| `tests/recommendation.test.js` | Deterministic scoring, seeded selection, laundry exclusion, recent-wear penalty, no repeated outfit on consecutive days, no duplicates in the weekly plan, tiny wardrobes, missing colours and weather, layer rule, timetable influence |

`tests/fixtures/legacy-minimal.json` is a trimmed-down old-format save used for backward-compatibility tests.

## Browser checks (optional, needs Playwright)

`tests/e2e/browser-checks.js` drives real Chromium against the app served under a sub-path, the way GitHub Pages serves it:

```bash
npm i -D playwright && npx playwright install chromium
mkdir -p /tmp/serve && cp -r . /tmp/serve/daily-fit
(cd /tmp/serve && python3 -m http.server 8080 &)
BASE=http://localhost:8080/daily-fit/ SW_FILE=/tmp/serve/daily-fit/sw.js node tests/e2e/browser-checks.js
```

It checks: service-worker scope, cached shell, offline reload (with a failing weather request), cache cleanup on update without touching other caches, the unreadable-data warning, rejection of malformed backups, no horizontal scroll at 320 px, control sizes, and the list of external hosts contacted.

## Manual checks still needed on real devices

- Install from Chrome on Android and from Safari on iPhone, then open with airplane mode on.
- Allow and deny the location prompt, and search a city.
- Take a photo for a piece on a phone and check the colour guess.
- Save a backup on one device and restore it on another.
- Check the layout with a large system text size and with the keyboard open in the Add form.
- After deploying a new version, confirm the "New version ready" message appears and Reload works.

## Before deploying a change

1. `npm test`
2. Raise `VERSION` in `sw.js` if any cached file changed.
3. Serve locally under a sub-path and run the browser checks (or do the manual list above).
4. Push, wait for Pages to publish, and open the live link once online.
