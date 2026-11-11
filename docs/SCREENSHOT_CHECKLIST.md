# Screenshot Checklist

Screenshots must be **real** captures of the real app on a real phone (or a real browser window at phone size). Do not mock them up, edit the content, or use made-up screens.

## How to take good screenshots

- Use the live app on your own phone, at normal text size.
- Capture in **light mode** first, then repeat a few in dark mode if you want.
- Use a tidy demo wardrobe of about 15 pieces with sensible names. Remove anything personal (a real city if you prefer, names, timetable subjects you do not want to show).
- Pick a day with at least two classes so the Today screen looks full.
- Turn on Do Not Disturb. Hide notifications. Full battery and signal icons look better.
- Take them all on the same phone so they look consistent.
- Save them as PNG in `docs/screenshots/` with the names below.

## A. README (GitHub)

Needed now. The README table already expects these three names.

| File name | What to show |
|---|---|
| `today.png` | Today tab: the outfit card with the reason lines and colour-match rating |
| `plan.png` | Plan tab: the 6-day plan |
| `wardrobe.png` | Wardrobe tab: the list with the Wash and Edit buttons |

Nice to add:

| File name | What to show |
|---|---|
| `timetable.png` | Timetable tab with a filled week |
| `add-piece.png` | The add form with the colour swatches |
| `backup.png` | The Save backup and Restore backup buttons |
| `share-image.png` | The shared outfit picture |
| `offline.png` | The app open in airplane mode |

## B. GitHub portfolio presentation

- [ ] A clean hero image: 3 phone screens side by side (Today, Plan, Wardrobe). Build the side-by-side from real screenshots, without changing what is on them.
- [ ] One image that shows the "why": an outfit with the reasons visible (weather, class, colour).
- [ ] One image of the test results (`npm test` output in a terminal). This shows quality, not just looks.
- [ ] A short screen recording (15 to 30 seconds): open the app, shuffle, lock a piece, wear it.
- [ ] A diagram of the architecture (the one in the README is fine as text).
- [ ] The repo social preview image (GitHub Settings): a clean screenshot of the Today screen.
- [ ] Add one line under each image saying what it proves.

## C. Future Play Store listing (later)

Not needed yet. Check Google's current rules before you start, because they change.

- [ ] **Phone screenshots**: at least 2, up to 8. Use portrait screenshots from a real Android phone. Show the main features in order: Today, Plan, Timetable, Wardrobe, Backup.
- [ ] **App icon**: 512 x 512 PNG. The repo has `icon-512.png` already.
- [ ] **Feature graphic**: 1024 x 500. This is a designed banner and needs the real app name and a real screenshot.
- [ ] **Short description** (about 80 characters) and **full description**. The README features list is a good source.
- [ ] **Privacy policy URL**: a public link to the privacy policy. Use the hosted version of `PRIVACY.md`.
- [ ] **Data safety form answers**: use `PRIVACY.md` as the source. Note the external requests (Open-Meteo, Google Fonts).
- [ ] Check whether a new developer account needs a closed test with a minimum number of testers before release, and how long it must run. The beta in this plan could count towards that, but check the current rule first.
- [ ] Wrapping a web app for the Play Store needs an extra step (a Trusted Web Activity). That is a separate project.

## Before you publish any screenshot

- [ ] No real names, phone numbers, email or exact location visible.
- [ ] No other people's clothes or photos without their permission.
- [ ] The screenshot matches the current version of the app.
- [ ] If the app changes visibly, retake the screenshots.
