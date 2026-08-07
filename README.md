# القرآن الكريم — Quran App

[![CI](https://github.com/emZubair/Quran-app/actions/workflows/ci.yml/badge.svg)](https://github.com/emZubair/Quran-app/actions/workflows/ci.yml)

A **fully offline**, ad-free, cross-platform Quran reader built with **Expo (React Native)** that runs on iOS, Android, and Web from a single codebase. The complete Quran text and English translation are bundled inside the app — no network connection is ever used at runtime. Features tappable word-level Arabic text (designed for future word-by-word meanings), bookmarking, search, dark mode, and a responsive layout.

---

## Features

- **100% offline** — the complete Quran (Arabic text + English translation) ships inside the app; zero runtime network requests
- **Full Quran** — all 114 surahs, 6,236 ayahs
- **English translation** — Marmaduke Pickthall (1930, public domain), toggleable
- **Word-level tapping** — every Arabic word is an individual pressable element (word meanings planned)
- **Correct Arabic typography** — bundled Amiri Quran font renders the vowel marks (shadda/tanwin stacks, superscript alefs, small high marks) correctly on every platform; a system-font option is also available
- **Dark mode** — full light/dark theming
- **Bookmarks** — save and manage bookmarks, persisted locally
- **Last-read tracking** — automatically remembers your position with a "Continue Reading" banner
- **Search** — filter surahs by name (English or Arabic) or number
- **Adjustable font size** — increase/decrease Arabic text size from Settings
- **Responsive layout** — adapts to phones, tablets, foldables, and desktop browsers
- **No ads, no tracking, no permissions** — see [PRIVACY.md](PRIVACY.md)

---

## Tech Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Framework   | [Expo](https://expo.dev) SDK 55 (React Native 0.83) |
| Language    | TypeScript (strict mode)                            |
| Navigation  | [Expo Router](https://docs.expo.dev/router)         |
| State       | [Zustand](https://zustand.docs.pmnd.rs)             |
| Persistence | AsyncStorage                                        |
| Quran Data  | Bundled JSON (`data/quran-data.json`), ~2.4 MB      |
| Fonts       | expo-font + bundled Amiri Quran (SIL OFL)           |

---

## Project Structure

```
quran-app/
├── app/                          # Expo Router — file-based routing
│   ├── _layout.tsx               # Root layout: loads stores, fonts, Stack navigator
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── _layout.tsx           # Tab bar configuration (Surahs, Bookmarks, Settings)
│   │   ├── index.tsx             # Surah list screen — search, last-read banner
│   │   ├── bookmarks.tsx         # Bookmarks screen — list with delete
│   │   └── settings.tsx          # Settings — fonts, translation, dark mode, about
│   └── surah/
│       └── [id].tsx              # Surah reader — ayahs with tappable words, bookmark button
│
├── components/                   # Reusable UI components
│   ├── AyahView.tsx              # Renders a single ayah: word tokens + translation
│   ├── SurahListItem.tsx         # Row in the surah list
│   └── WordToken.tsx             # Single tappable Arabic word (Pressable)
│
├── data/
│   ├── quranMeta.ts              # Static metadata for all 114 surahs
│   └── quran-data.json           # Complete bundled Quran text + translation
│
├── hooks/
│   ├── useQuranData.ts           # Loads a surah from the bundled data, splits into words
│   └── useThemeColors.ts         # Light/dark theme palette
│
├── scripts/
│   └── download-quran.ts         # Regenerates data/quran-data.json from alquran.cloud
│
├── stores/                       # Zustand state stores (persisted via AsyncStorage)
│   ├── bookmarkStore.ts          # Bookmarks + last-read position
│   └── settingsStore.ts          # Font size/family, translation, dark mode
│
├── assets/                       # App icon, adaptive icon, splash, favicon
│   └── fonts/                    # Amiri Quran font + OFL license
│
├── app.json                      # Expo configuration (bundle IDs, icons, splash)
├── eas.json                      # EAS Build profiles
├── PRIVACY.md                    # Privacy policy (no data collected)
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## Quran Data & Attribution

The app ships with a prebuilt `data/quran-data.json` containing the complete Quran:

- **Arabic text:** Imlaei / modern-standard script from the [Tanzil project](https://tanzil.net) (`quran-simple` edition)
- **English translation:** Marmaduke Pickthall, _The Meaning of the Glorious Koran_ (1930, public domain)
- Compiled via the [Al Quran Cloud API](https://alquran.cloud/api) at build time — never at runtime

To regenerate the data file (e.g., to switch translation edition):

```bash
bun run scripts/download-quran.ts              # default: en.pickthall
bun run scripts/download-quran.ts en.sahih     # any alquran.cloud edition id
```

The script strips the Bismillah embedded in each surah's first ayah (the app renders it as a header instead), validates all 114 surahs / 6,236 ayahs, and fails loudly rather than writing incomplete data.

---

## Prerequisites

- **Node.js** ≥ 18
- **[Bun](https://bun.sh)** ≥ 1.0 (package manager and runtime)
- For iOS: macOS with [Xcode](https://developer.apple.com/xcode/) installed
- For Android: [Android Studio](https://developer.android.com/studio) with an emulator or physical device
- For builds/publishing: an [Expo](https://expo.dev) account (free)

---

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Start the development server

```bash
bun start
```

This opens the Expo Dev Tools. From there:

| Platform | Command                        | Requirement                         |
| -------- | ------------------------------ | ----------------------------------- |
| iOS      | Press `i` or `bun run ios`     | macOS + Xcode + iOS Simulator       |
| Android  | Press `a` or `bun run android` | Android Studio + Emulator or device |
| Web      | Press `w` or `bun run web`     | Any modern browser                  |

### 3. Run on a physical device

Install the **Expo Go** app from the App Store or Google Play, then scan the QR code shown in the terminal.

---

## Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/); build profiles live in `eas.json`, and bundle identifiers (`impulsive.soft.quran`) are set in `app.json`.

### One-time setup

```bash
# Install the EAS CLI globally
bun add -g eas-cli

# Log in to your Expo account
eas login

# Link this project to your Expo account (adds extra.eas.projectId to app.json)
eas init
```

### Build for iOS

```bash
# Development build (runs on simulator or device with dev tools)
eas build --platform ios --profile development

# Production build (.ipa for App Store)
eas build --platform ios --profile production
```

> **Note:** Production iOS builds require an [Apple Developer Program](https://developer.apple.com/programs/) membership ($99/year). EAS handles provisioning profiles and certificates automatically.

### Build for Android

```bash
# Preview build (.apk for testing)
eas build --platform android --profile preview

# Production build (.aab for Google Play)
eas build --platform android --profile production
```

### Build for Web

```bash
# Export static web build
bunx expo export --platform web

# Output is in the `dist/` folder — deploy to any static host
```

---

## Publishing to App Stores

Both stores require a **privacy policy URL** — host [PRIVACY.md](PRIVACY.md) (e.g., GitHub Pages) and paste the URL into each console. Since the app collects no data, the Play Data Safety form and Apple privacy questionnaire are both "no data collected."

### iOS — Apple App Store

```bash
# Submit the latest iOS build to App Store Connect
eas submit --platform ios
```

You'll need:

- Apple Developer account
- App created in [App Store Connect](https://appstoreconnect.apple.com)
- App metadata (description, screenshots — including iPad, since tablet support is enabled)

### Android — Google Play Store

```bash
# Submit the latest Android build to Google Play
eas submit --platform android
```

You'll need:

- Google Play Developer account ($25 one-time fee)
- App created in [Google Play Console](https://play.google.com/console)
- A service account JSON key for automated uploads (see [EAS Submit docs](https://docs.expo.dev/submit/android/))

### Web — Static Hosting

Deploy the `dist/` folder to any static host:

```bash
# Netlify
bunx netlify deploy --prod --dir dist

# Vercel
bunx vercel --prod dist

# GitHub Pages, AWS S3, Firebase Hosting, etc.
```

---

## Over-the-Air Updates

Push JavaScript updates without a new store submission:

```bash
eas update --branch production --message "Fix bookmark bug"
```

Users receive the update on next app launch. See [EAS Update docs](https://docs.expo.dev/eas-update/introduction/).

---

## Environment & Configuration

| File            | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| `app.json`      | Expo config: name, bundle IDs, icons, splash, platform bits |
| `eas.json`      | EAS Build profiles (development, preview, production)       |
| `tsconfig.json` | TypeScript with strict mode, extends Expo's base config     |
| `PRIVACY.md`    | Privacy policy — host it and link it in both store consoles |

---

## Roadmap

- [ ] Word-by-word meanings popup on tap
- [ ] Audio recitation playback (expo-audio)
- [x] Offline mode with bundled Quran data
- [ ] Multiple translation languages
- [x] Dark mode / theming
- [ ] Juz / Para navigation
- [ ] Tajweed color-coded text
- [x] Correct Arabic font rendering (Amiri Quran)

---

## License

Private project. All rights reserved.

Quran text: Tanzil project (tanzil.net) — used with attribution per Tanzil terms.
English translation: Marmaduke Pickthall (public domain).
Arabic font: Amiri Quran by the Amiri Project — [SIL Open Font License 1.1](assets/fonts/OFL.txt).
