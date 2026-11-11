# Daily Fit

A local-first outfit chooser for college students. It looks at your own wardrobe, today's classes and the weather, and suggests one outfit for the day. It runs entirely in the browser, installs as a phone app (PWA), and has no account and no server.

Live app: https://stunnerfest1937.github.io/daily-fit/

> Screenshots: _placeholders, to be added_
>
> | Today | Plan | Wardrobe |
> |---|---|---|
> | `docs/screenshots/today.png` | `docs/screenshots/plan.png` | `docs/screenshots/wardrobe.png` |

## Problem and intended users

Deciding what to wear for college every morning takes time, and most people keep wearing the same few pieces. Daily Fit picks an outfit that suits the day's timetable (a lab, a presentation, sports) and the weather, rotates what you wear, and avoids clashing colours. It is aimed at students who want a quick daily decision from clothes they already own. Friends can each use the same link and get their own separate wardrobe.

## Features

- **Daily pick** from your wardrobe, with a one-line reason and a colour-match rating. Shuffle the whole outfit, swap one piece, or lock pieces you want to keep.
- **Timetable awareness**: lectures, labs, presentations, sports and exams change what is chosen (closed shoes for labs, smarter tops for presentations, and so on). A manual occasion override is available.
- **Weather**: optional live temperature and rain chance (Open-Meteo), or choose the weather yourself. A setting controls how much weather matters.
- **Colour and style rules**: classic colour pairings, one bold piece at a time, one pattern at a time, light-against-dark contrast, and matching style (casual, smart, ethnic, sporty).
- **Rotation**: recently worn pieces are avoided, a layer is used at most once a week by default, and the same full outfit is not repeated within a week when alternatives exist.
- **Laundry tracking**: pieces marked "In the wash" are never picked.
- **Learning from you**: like or dislike an outfit and those pieces are nudged up or down.
- **Plan**: a six-day plan, a trip packer, a look-back calendar and saved looks.
- **Wardrobe tools**: search, filters, quick-add basics, edit a piece, optional photos (the colour is guessed from the photo), "Best next buy" and a colour-mix summary.
- **Share**: share the app link, or share an image of today's outfit.
- **Backup and restore**: export everything to a JSON file and restore it on another device.
- **Offline**: after the first visit the app opens without a connection.

## Technology

- One `index.html` file with plain HTML, CSS and JavaScript (ES5 style, no framework, no build step, no runtime dependencies).
- `sw.js`: service worker for offline use. `manifest.webmanifest` and icons: installable PWA.
- Tests use Node's built-in test runner. Optional browser checks use Playwright.
- Hosting: GitHub Pages (any static host works).

## Architecture and data flow

```
 browser (all logic runs here)
 ┌──────────────────────────────────────────────────────────────┐
 │ state { items, history, prefs, timetable, likes, rated, looks }
 │   ├─ normalize()      validates and repairs any loaded data   │
 │   ├─ scoreCombo()     deterministic score for one outfit      │
 │   ├─ generate()       samples candidates, ranks, picks        │
 │   └─ render*()        builds the screens                      │
 │ localStorage ◄── saveLocal()   (only on this device)          │
 └──────────────────────────────────────────────────────────────┘
        │ optional                           │ page load
        ▼                                    ▼
 Open-Meteo (weather, city search)     Google Fonts (typefaces)
```

Everything the user enters stays in `localStorage`. The only outgoing requests are described in [PRIVACY.md](PRIVACY.md).

## How recommendations work

This is a rule-based scoring system. There is no machine learning.

1. **Candidates**: up to 400 random combinations are built from pieces that are not in the wash (top + bottom or a one-piece, shoes, and sometimes a layer). A layer is only considered when the once-a-week rule allows it.
2. **Scoring** (`scoreCombo`, deterministic: the same inputs always give the same score). It adds and subtracts points for:
   - weather fit (weighted by the "weather matters" setting) and rain-safe shoes;
   - the occasion or timetable (style preferences, closed shoes for labs, sporty shoes for sports, a layer for late finishes);
   - style compatibility between pieces;
   - colour harmony, contrast, bold-piece count, palette size and patterns;
   - recent wear (heavy penalty for pieces worn yesterday or the day before, a small bonus for pieces not worn for a while);
   - your likes and your ratings of whole outfits.
3. **Selection** (`pickTop`): the only place randomness is used. The ten best-scoring candidates are sampled with weights that favour higher scores, so the app gives variety without choosing poor outfits.
4. **Hard rules** applied before selection: pieces in the wash are never used, and an outfit identical to one worn or planned in the previous 7 days is excluded when any alternative exists. If the wardrobe is too small to avoid it, the app still gives an outfit and says it repeats a recent look.

In the code these are separate steps: `rankCandidates()` builds and scores candidates, and `chooseOutfit()` applies the repeat rules and makes the one random pick. `generate()` just calls both. Selection settings (number of candidates, how many top outfits to choose from, the no-repeat window) are in the `TUNING` object. The scoring weights are plain numbers inside `scoreCombo` and the `PAIR_FIX` colour table, all in `index.html`. The random source is a single variable (`rand`) so tests can make selection reproducible.

## Local storage and backup

| Key | Content |
|---|---|
| `dailyfit.v1` | Wardrobe, wear history, preferences, timetable, likes, ratings, saved looks (JSON, `v: 2`) |
| `dailyfit.photo.<id>` | Optional photo of one piece (small JPEG data URL) |
| `dailyfit.wx` | Today's cached forecast |
| `dailyfit.v1.prev` | One untouched copy of older or partly invalid data, written before the app first rewrites it |
| `dailyfit.v1.recovery.<time>` | Raw copy of saved data that could not be read, so it is never overwritten |

- Data that cannot be parsed is **not** discarded: a copy is kept and a notice offers a download.
- If a save fails (storage full or blocked) a warning appears at the top of the app. The app never says "saved" when the write failed.
- **Save backup** downloads a JSON file (including photos). **Restore backup** validates the whole file first (types, dates, ids, references between history and pieces, photo format) and then replaces the wardrobe in one step. A bad file changes nothing. If saving the restored data fails, the previous data is put back. "Undo" is offered after a restore.
- Backups from the first versions (fewer fields) still load. Backups from a newer format are refused with a message.

## External services and privacy

See [PRIVACY.md](PRIVACY.md). In short: your wardrobe, photos and backups are not uploaded by the app and there is no cloud sync. Weather and city search send a city name or an approximate location to Open-Meteo only if you use them, and Google Fonts is requested when the page loads. Backup files are not encrypted.

## Beta testing

A plan for a small student beta is in [BETA_TEST_PLAN.md](BETA_TEST_PLAN.md). Supporting files: a [tester guide with an invitation message](docs/beta/TESTER_ONBOARDING.md), a [feedback questionnaire](docs/beta/FEEDBACK_QUESTIONNAIRE.md) and its [Google Form setup](docs/beta/GOOGLE_FORM_SETUP.md), a [bug report template](docs/beta/BUG_REPORT_TEMPLATE.md) and a [screenshot checklist](docs/SCREENSHOT_CHECKLIST.md).

## Run and test locally

```bash
git clone https://github.com/stunnerfest1937/daily-fit
cd daily-fit
python3 -m http.server 8080      # then open http://localhost:8080/
npm test                         # automated tests (Node 18+, no installs needed)
```

Service workers need `http://localhost` or HTTPS. See [TESTING.md](TESTING.md) for the test guide and the manual browser checks.

## Deploy to GitHub Pages

1. Push this folder to a public repository.
2. Settings, Pages, "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The app is served at `https://<user>.github.io/<repo>/`. All paths in the app are relative, so the sub-path works.
4. When you change any cached file, raise `VERSION` in `sw.js` so installed copies update. Users then see "New version ready. Reload".

## Install on a phone

Android Chrome: open the link, then Install app. iPhone Safari: Share, then Add to Home Screen.

## Known limitations

- Data lives on one device. There is no automatic sync between a phone and a laptop; use Save backup and Restore backup.
- Clearing site data or uninstalling the browser removes the wardrobe. Save backups now and then.
- The first visit needs a connection (to cache the app). Offline use afterwards works for everything except live weather.
- Photos are stored in `localStorage`, which has a small quota (about 5 MB), so many photos can fill it.
- Offline typefaces fall back to system fonts until the font files are cached by the browser.
- The recommendation weights are hand-tuned and have not been evaluated with a user study.
- Tested in headless Chromium and a Node harness. Real-device testing (iOS Safari in particular) has not been done.

## Possible future work

- Self-hosted fonts so no third-party request is needed.
- Optional encrypted sync between devices.
- A visual weights editor.
- Automated browser tests in CI.
