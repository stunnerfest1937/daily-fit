# Google Form Setup: End-of-Week Feedback

Instructions for creating the feedback form by hand. The questions are the same as in [FEEDBACK_QUESTIONNAIRE.md](FEEDBACK_QUESTIONNAIRE.md), in the same order. Nothing has been removed.

## Form settings (do these first)

| Setting | Choose |
|---|---|
| Collect email addresses | **Off** (Settings, Responses) |
| Require sign-in / Limit to 1 response | **Off**. These force a Google sign-in and would identify people |
| Allow response editing | Off |
| Show progress bar | On |
| Send responders a copy | Off |
| Confirmation message | "Thank you! Your feedback will help decide what gets fixed first." |
| Link to Google Sheet | On, so you can sort answers (keep the sheet private) |

## Title

**Daily Fit: Beta Feedback (7-day test)**

## Description

> Thanks for testing Daily Fit! This takes about 5 minutes. Please be honest. Negative answers help the most. Taking part is voluntary and you can skip any question except the ones marked with a star.
>
> This form does not ask for your name, email, phone number or location. Use your tester number if you were given one, or a nickname. Please don't write anything in the answers that could identify you or other people.

## Questions, in order

Use "Required" only where marked. Keep the rest optional so people can finish even if they are unsure.

### Section 1: About your phone

| # | Question | Google Forms type | Required | Options |
|---|---|---|---|---|
| 0 | Tester number or nickname (optional) | Short answer | No | |
| A | Which phone and browser did you use? | Short answer | **Yes** | Hint text: "For example: Samsung, Chrome" |
| B | Roughly how many pieces of clothing did you add? | Multiple choice | **Yes** | Under 8 · 8 to 15 · 16 to 30 · More than 30 |

### Section 2: Setup

| # | Question | Type | Required | Options |
|---|---|---|---|---|
| 1 | How easy was the first setup (installing, clearing sample clothes, adding clothes and classes)? | Linear scale 1 to 5 | **Yes** | 1 = "Very hard", 5 = "Very easy" |
| 2 | About how many minutes did it take to add your clothes and classes? | Multiple choice | **Yes** | Under 5 · 5 to 10 · 10 to 20 · 20 to 30 · More than 30 |
| 3a | Was there a moment where you got stuck or did not know what to do? | Multiple choice | No | Yes · No |
| 3b | If yes, where? | Paragraph | No | |

### Section 3: Outfit suggestions

| # | Question | Type | Required | Options |
|---|---|---|---|---|
| 4 | How useful were the daily outfit suggestions? | Linear scale 1 to 5 | **Yes** | 1 = "Not useful", 5 = "Very useful" |
| 5 | How often did a suggestion look right for the day (weather, classes, how you wanted to look)? | Multiple choice | **Yes** | Almost never · Sometimes · About half the time · Often · Almost always |
| 6 | How was the variety of outfits over the week? | Linear scale 1 to 5 | **Yes** | 1 = "Too repetitive", 5 = "Great variety" |
| 7a | Did the app ever suggest something you thought was wrong? (a bad colour mix, wrong for the weather, wrong for your class, clothes that were in the wash, something you wore very recently) | Multiple choice | No | Yes · No |
| 7b | If yes, what was it? | Paragraph | No | |

### Section 4: Laundry, repeats and rotation

| # | Question | Type | Required | Options |
|---|---|---|---|---|
| 8 | How well did the "Wash" button and repeat handling work for you? (Did clothes marked in the wash stay out of suggestions? Did it avoid repeating the same outfit?) | Linear scale 1 to 5 | **Yes** | 1 = "Confusing or broken", 5 = "Worked well" |

### Section 5: Phone experience and reliability

| # | Question | Type | Required | Options |
|---|---|---|---|---|
| 9 | How was the app on your phone (speed, buttons, text size, layout)? | Linear scale 1 to 5 | **Yes** | 1 = "Frustrating", 5 = "Smooth" |
| 10a | Did anything fail or feel unreliable? (the app not opening, not saving, losing something, not working offline, a wrong weather reading) | Multiple choice | **Yes** | Yes · No |
| 10b | If yes, what happened? (Please also send a bug report.) | Paragraph | No | |

### Section 6: Overall

| # | Question | Type | Required | Options |
|---|---|---|---|---|
| 11 | Will you keep using Daily Fit after this test? | Multiple choice | **Yes** | No · Probably not · Not sure · Probably · Yes |
| 12 | How likely are you to recommend it to a friend? | Linear scale 0 to 10 | **Yes** | 0 = "Not at all", 10 = "Definitely" |

### Section 7: In your own words (all optional)

| # | Question | Type |
|---|---|---|
| 13 | What did you like most? | Paragraph |
| 14 | What annoyed or confused you most? | Paragraph |
| 15 | If you could change one thing, what would it be? | Paragraph |
| 16 | Anything else? | Paragraph |

## Optional: daily check-in form (a second, tiny form)

Only if you prefer a form to WhatsApp messages. Same settings as above (no email, no sign-in).

| Question | Type | Required |
|---|---|---|
| Tester number or nickname | Short answer | **Yes** |
| Day (1 to 7) | Dropdown | **Yes** |
| Did you open the app today? | Multiple choice: Yes · No | **Yes** |
| Did you wear the suggestion (or something close)? | Multiple choice: Yes · Partly · No | No |
| How many times did you tap Shuffle? | Dropdown: 0 · 1 · 2 · 3 · 4 or more | No |
| Was today's outfit | Multiple choice: Good · OK · Bad | No |
| Anything annoying, confusing or broken? | Paragraph | No |

## Privacy note for you, the organiser

- Google Forms is run by Google. Answers are stored in the Google account that owns the form. You and anyone you share the form or sheet with can read them. Don't share the results sheet widely.
- The form asks for no name, email, phone number or location. A phone model and browser are the only technical details.
- Free-text answers could include personal details by accident. Skim them before you quote anything.
- Tell testers the form is voluntary and what you will do with it (improve the app, write a summary).
- If you promised it, delete the responses after you have written the summary.
- Keep the form separate from the app. The app does not send any data to the form.

## Checklist before you share the form

- [ ] "Collect email addresses" is off and sign-in is not required.
- [ ] All 12 numbered questions plus A, B and 0 are present and in order.
- [ ] Only the starred questions are required.
- [ ] You tested the form on a phone.
- [ ] The results sheet is private.
