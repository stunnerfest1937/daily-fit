# Daily Fit: Beta Test Plan

A simple plan for testing Daily Fit with about 10 to 15 college students for one week. You do not need any special tools. Everything is done with a phone, a chat app and a short form.

Related files: [Feedback questionnaire](docs/beta/FEEDBACK_QUESTIONNAIRE.md) · [Bug report template](docs/beta/BUG_REPORT_TEMPLATE.md) · [Screenshot checklist](docs/SCREENSHOT_CHECKLIST.md) · [Privacy](PRIVACY.md) · [Testing guide](TESTING.md)

## 1. What we want to learn

1. Can a new person set the app up on their own, and how long does it take?
2. Are the daily outfit suggestions good enough that people actually wear them?
3. Does the app feel reliable on real phones (install, offline, saving, backup)?
4. What confuses people or breaks?

We are **not** testing new features, and we are not trying to prove the app is perfect. Finding problems is a good result.

## 2. Important facts to know before you start

These come from the current code and docs. Check them against the app if anything changes.

- The app is a web app at `https://stunnerfest1937.github.io/daily-fit/` that can be added to the home screen.
- Each person's wardrobe is saved **on their own phone only**. There is **no account and no sync**. Two phones will not share a wardrobe.
- The app has **no analytics**. You cannot see how people use it, so feedback has to come from the testers themselves (see sections 7 and 8).
- Live weather is optional and needs internet. A city name or rounded location goes to Open-Meteo. Fonts are loaded from Google Fonts. See [PRIVACY.md](PRIVACY.md).
- Clearing browser data deletes the wardrobe. **Save backup** exists for this reason.
- Real-phone testing has not been done yet. Android Chrome and iPhone Safari behaviour is exactly what this beta will find out.

## 3. Who and how many

| Stage | Who | How many | How long |
|---|---|---|---|
| Pilot | You and 2 or 3 friends who will be honest | 3 to 4 | 2 days |
| Main beta | Classmates and friends of friends | 10 to 15 | 7 days |

Run the pilot first. It catches embarrassing problems (a broken link, a confusing first screen) before 15 people see them. Fix only serious issues between the pilot and the main beta.

Try to get a mix:
- At least 4 Android phones and at least 3 iPhones if you can.
- Some people with many clothes and some with few.
- At least 2 people who have a busy timetable (labs, presentations) so the timetable feature gets used.
- About half should be people who are *not* in IT. They will find the confusing parts.

Do not recruit people who will say nice things to be polite. Ask them to be blunt.

## 4. How to introduce the app to testers

Send each tester the **invitation message** and the **tester guide** in [docs/beta/TESTER_ONBOARDING.md](docs/beta/TESTER_ONBOARDING.md). The guide covers installing, setting up, daily use, laundry and repeat rules, bug reports and feedback in plain language. The Google Form is described in [docs/beta/GOOGLE_FORM_SETUP.md](docs/beta/GOOGLE_FORM_SETUP.md).

Also tell them how long you need them (one week), how to send feedback (see section 8), and that they can stop at any time.

## 5. First session (about 20 minutes)

Ask testers to do these steps **in order** and note the time they start and finish. Tell them not to ask you for help unless they are stuck for more than 2 minutes. If they ask, write down what they asked. That question is a usability problem.

1. **Open and install.** Open the link and add it to the home screen. Note how many tries it took.
2. **Read the welcome card.** The Today screen shows a short setup guide. Do they understand it without help?
3. **Weather (optional).** Search for their city, or tap "Use my location". Or skip it and pick the weather by hand.
4. **Clear the sample clothes.** The app starts with 23 sample pieces and 11 sample classes so people can try it. Testers can clear both with the **Clear samples** button on the welcome card, or separately with Clear samples in the Wardrobe tab and in the Timetable tab. If they forget, their own pieces get mixed in with the samples. Note who forgets.
5. **Add their own clothes.** Minimum to get an outfit is a top, a bottom and shoes. For a proper test, add at least:
   - 4 tops (include one full-sleeve and one smart shirt if they own them),
   - 3 bottoms,
   - 2 pairs of shoes,
   - 1 layer (jacket or hoodie),
   - one ethnic outfit if they have it.

   They can use the quick-add buttons for common basics, or the add form (name, type, style, colour, fabric weight, optional photo). **Write down the time this step took and how many pieces were added.**
6. **Add classes.** Open the Timetable tab, clear the sample classes if they have not already, and add a typical week (at least 3 days).
7. **Look at today's outfit.** Read the reason lines and the colour-match rating.
8. **Play with it.** Tap Shuffle three times. Lock one piece and shuffle again. Swap a single piece. Tap Like or Not for me.
9. **Wear it.** Tap "Wear this today".
10. **Save a backup.** Wardrobe, Save backup. Check that a file downloads and note where it went.
11. **Close the app and reopen it from the home screen.** Is everything still there?

At the end of the first session, send a screenshot of the Today screen if they are happy to (they should hide anything personal).

## 6. The following 7 days

Each morning the tester should:
1. Open the app from the home screen.
2. Look at the outfit. Decide: *would I really wear this?*
3. Shuffle if they want something else.
4. Tap **Wear this today** when they choose.
5. Fill in the one-minute daily note (below).

Extra tasks, spread across the week:

| Day | Extra task |
|---|---|
| 1 | Setup and first session (section 5). |
| 2 | Mark one piece as **Wash**. Check it never appears in a suggestion. Then tap **Clean**. |
| 3 | Turn on airplane mode and open the app. Does it still open and give an outfit? |
| 4 | Look at the Plan tab. Does the 6-day plan look sensible? Tap Shuffle week once. |
| 5 | Add 2 new clothes (try with a photo). |
| 6 | Try **Save look** on an outfit they love, then use it from the Plan tab. |
| 7 | Save a second backup. Fill in the questionnaire. |

### Daily note (copy this into a chat message or form)

```
Day: _
Opened the app today? Yes / No
Did I wear the suggestion (or something close to it)? Yes / Partly / No
How many times did I tap Shuffle? _
Was today's outfit: Good / OK / Bad     (one line why: ____ )
Anything annoying, confusing or broken? ____
```

Missing a day is fine. Ask them to write "No" rather than skip, because "did not open" is useful information.

### What not to do
Tell testers **not** to clear browser data, uninstall the app, or switch browsers during the week unless they have saved a backup first.

## 7. What you should observe

Because the app collects no data, you learn from what testers tell you and show you. Watch for:

**During setup (ask 2 or 3 testers to do it while you watch, or on a video call)**
- Where do they hesitate or look confused?
- Do they find the Wardrobe tab, the quick-add buttons, the colour picker and the clear-samples step?
- Do they understand fabric weight (light, medium, warm)?
- Do they forget to clear the sample clothes?
- How many pieces do they add before giving up?

**During the week**
- Do they open the app on most days, or only the first two?
- How often do they shuffle? One or two shuffles a day is healthy. Many shuffles every day means the first suggestion is often wrong.
- Do they wear the suggestion?
- Do outfits feel repeated? The app should not repeat a whole outfit within 7 days if other combinations exist. It says so when the wardrobe is too small.
- Do clothes in the wash ever show up? (They should not.)
- Is the colour-match label (Safe / Good / Strong) believable?
- Do layers appear at most once a week?

**Signs of bigger problems**
- Lost wardrobe or history.
- A warning saying "Couldn't save to this phone".
- The app not opening offline.
- Install not working on a certain phone.
- Weather clearly wrong.

## 8. How to collect feedback

Use three simple channels, in this order of importance:

1. **Daily note** (section 6) in a shared chat or a Google Form. 1 minute.
2. **Bug reports** using [the template](docs/beta/BUG_REPORT_TEMPLATE.md) whenever something breaks. Screenshots help a lot.
3. **End-of-week questionnaire** ([questions here](docs/beta/FEEDBACK_QUESTIONNAIRE.md)). A Google Form is easiest. Tell testers it takes 5 minutes.

Then, for 3 to 5 testers, do a **10-minute chat** after the week. Ask: "Show me how you use it on a normal morning." Open questions in a chat give better answers than forms.

Keep it low-pressure. Say thank you after every message. Do not argue with feedback ("but you can just..."). Write it down instead.

### Privacy for the beta itself
- Do not ask testers to send their backup files to you. They contain their clothes and timetable.
- The questionnaire has no name, phone number or exact location. Use a nickname or tester number (T1, T2, ...).
- Screenshots are optional. Ask testers to hide anything personal.
- Delete the raw feedback after you have summarised it if you promised that.

## 9. Sorting what you hear

Put every piece of feedback in a simple table (a spreadsheet works):

| ID | Tester | Type (Bug / Confusing / Wish) | What happened | How many testers | Severity | Decision |
|---|---|---|---|---|---|---|

**Severity**
- **Critical**: lost data, the app will not open, wrong data shown, something that could embarrass or harm a user. Fix immediately and tell testers.
- **High**: a main feature fails for many people (install, adding clothes, outfit never shown).
- **Medium**: confusing or annoying, but there is a workaround.
- **Low**: wording, small layout issues, wishes.

A problem reported by 3 or more testers moves up one level. Do not change the app in the middle of the week for Medium or Low issues. Collect them and decide afterwards. Fix Critical issues at once and tell the testers to reload when "New version ready" appears.

To reproduce a bug: ask for the exact steps, the phone model, the browser and a screenshot. Try the same steps on your own device. If you can reproduce it, add a test in `tests/` if it is something the Node tests can cover.

## 10. Success measures

These are starting targets, not scientific rules. Count them from the daily notes and questionnaire.

| Measure | Target | How to measure |
|---|---|---|
| Setup finished | At least 80% added 8 or more pieces and 3 or more classes | Day 1 report |
| Setup time | Median under 20 minutes | Time noted in session 1 |
| Still using it | At least 60% opened it on 4 or more of the 7 days | Daily notes |
| Suggestion quality | At least 60% of daily ratings are Good or OK | Daily notes |
| Wore the suggestion | At least 40% of days "Yes" or "Partly" | Daily notes |
| Reliability | Zero reports of lost data. Fewer than 2 crashes per 10 testers | Bug reports |
| Install works | At least 90% installed on the first or second try | Day 1 report |
| Would recommend | Average 7 out of 10 or higher | Questionnaire |
| Would keep using | At least 50% answer Yes or Probably | Questionnaire |

If **data loss** happens even once, stop, find the cause, and fix it before inviting anyone else.

## 11. Timeline

| When | What |
|---|---|
| Before day 0 | Check the live link on your own Android and iPhone if possible. Run `npm test`. Make a feedback form. |
| Days 0 to 2 | Pilot with 3 to 4 people. Fix only Critical or High issues. |
| Day 3 | Send the invitation to the 10 to 15 testers. |
| Days 3 to 10 | The 7-day test. Check in on day 2 ("Did it install?") and day 5 ("How is it going?"). |
| Day 10 | Send the questionnaire. Interview 3 to 5 testers. |
| Days 11 to 13 | Sort feedback, decide what to fix, write a short summary. |

## 12. What happens after

Write a one-page summary: the success measures, the top 5 problems, the top 3 things people liked, and what you will change. Share it with the testers. They will be more willing to help again.

Do not add new features until Critical and High bugs are fixed and the success measures are reviewed.
