# Privacy

Daily Fit is local-first. There is no account, no server of its own, no analytics and no advertising.

## What stays on your device

Everything you enter is stored in your browser's `localStorage` on the device you use:

- your clothes (names, types, colours, styles, optional photos),
- what you wore and which outfits you liked or saved,
- your timetable and settings,
- your chosen city (name and coordinates rounded to two decimals, about 1 km) if you set one.

None of this is sent anywhere by the app. The backup file is created on your device and only leaves it if you choose to send it.

## What is sent to other services

Only these requests are made. Nothing in them contains your wardrobe, history, ratings, timetable or settings.

| When | Sent to | What is sent | Why |
|---|---|---|---|
| Every time the page loads | Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) | Your IP address and browser details, as with any web request. The referrer is suppressed. | Typefaces |
| You tap "Use my location" | Your browser asks for permission first. The position is rounded to about 1 km and stored. It is then used in forecast requests (last row). | Nothing is sent at this step | Forecast |
| You search for a city | Open-Meteo geocoding (`geocoding-api.open-meteo.com`) | The text you typed | Find coordinates |
| Forecast refresh (about hourly, or when you tap Refresh) | Open-Meteo (`api.open-meteo.com`) | The rounded latitude and longitude | Temperature and rain chance |

Open-Meteo and Google can see your IP address when they receive a request, and they have their own privacy policies. If you never set a location, no weather request is made. You can choose the weather manually instead.

Sharing the app or an outfit image uses your phone's share sheet. Daily Fit does not upload the image.

## Controlling it

- Location is optional. If permission is denied or the weather service is unreachable, pick the weather yourself and the app works as normal.
- To remove your data, clear the site's storage in your browser settings (this deletes the wardrobe, so save a backup first).
- To avoid the Google Fonts request, remove the `fonts.googleapis.com` link near the top of `index.html`. The app then uses your system fonts.

## Storage keys

`dailyfit.v1`, `dailyfit.v1.prev`, `dailyfit.v1.recovery.*`, `dailyfit.wx`, `dailyfit.photo.*`. The service worker keeps the app's own files in a cache named `dailyfit-v<number>` and never stores responses from other sites.

## Limits of these statements

This describes the code in this repository. A browser, extension or device you use may collect data of its own. If you host a copy elsewhere, check that the host does not add tracking.
