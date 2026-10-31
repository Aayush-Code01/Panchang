# Shubhly native apps (iOS + Android)

The store apps wrap the web app in `../app` with [Capacitor](https://capacitorjs.com).

- `npm install` then `npm run build:web` copies the web app into `www/`.
- Android: every push builds a debug APK in GitHub Actions ("Android test build" → Artifacts).
- iOS (on the Mac): `npm install && npx cap add ios && npm run ios`, then run from Xcode.

## Native extras (`../native.js`)

Loaded only by the store app and active only inside the native shell:

- **Morning reminder**: Settings → Morning reminder. The app schedules its own local notifications for the next 14 days (your day, the longest good stretch, Rahu Kaal to avoid) and tops them up every time it opens or the place changes. No server and no push certificates are needed.
- **Haptics** through `@capacitor/haptics`.

Before the first store build:

- **iOS app icon**: use `../icon-1024.png` as the default App Icon and `icon-1024-dark.png` as the Dark appearance in Xcode's AppIcon set.
- **Android notification icon**: add a white, transparent-background `ic_stat_shubhly` drawable and set `"smallIcon": "ic_stat_shubhly"` under `plugins.LocalNotifications` in `capacitor.config.json`.
