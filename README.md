# athena

iPhone companion for athena, Mars's reading system on ares: what's being read on the Kindle (live kosync progress), reading paths and sections, stats, Kindle highlights and New Yorker issues. Status changes, pins and send-to-kindle go back to calibre on ares through the athena api. Built with Expo (SDK 57, Expo Router), iOS only.

## screens

- home: date, sync state, reading now, last 30 days / reading days / books read, continue a path, latest New Yorker issue; settings behind the gear
- paths: cross-paths and sections, path/section detail with every book (in library or to find), pin/unpin; library search from the search button
- stats: this year's hours and days, hours per month, library by status, recent sessions
- highlights: all Kindle highlights and notes, search, recent / by book / with notes, share
- issues: kept New Yorker issues and the next delivery
- book: cover, kindle state and send, status (tbr/ongoing/read/dnf saved to calibre), progress, paths, highlights, tags

Offline, the app shows the last saved copy; changes made meanwhile wait and sync on the next refresh.

## api address and token

On first launch the app opens "connect to ares": the api address (default `http://ares:8087`, reached over Tailscale) and the bearer token (`TOKEN=` in `/srv/config/athena/api.env` on ares). "test connection" calls `/hello`. Both are stored in the iPhone keychain (expo-secure-store); change them later in settings → connection. Plain http is allowed for `ares`, `*.ts.net` and local hosts (App Transport Security exceptions in `app.json`).

## build and install

The GitHub workflow `build-ios.yml` (manual run or a `v*` tag) builds an unsigned `Athena.ipa` on macos and publishes it as the release `latest`. ares downloads that .ipa and installs it with marsign, which signs it with the free Apple ID and re-signs it daily:

```bash
cd ~/marsign && MARSIGN_DATA=/srv/config/marsign .venv/bin/python marsign.py install <path to Athena.ipa>
```

## development

```bash
npm install
npx expo start          # dev server; needs a development build for native modules
npx tsc --noEmit
npx expo lint
```

The app icon (owl, gold palette, light and dark) is rendered from `scripts/icon.js`: `npm i --no-save @resvg/resvg-js && node scripts/icon.js`.
