# Shubhly native apps (iOS + Android)

The store apps wrap the web app in `../app` with [Capacitor](https://capacitorjs.com).

- `npm install` then `npm run build:web` copies the web app into `www/`.
- Android: every push builds a debug APK in GitHub Actions ("Android test build" → Artifacts).
- iOS (on the Mac): `npm install && npx cap add ios && npm run ios`, then run from Xcode.
