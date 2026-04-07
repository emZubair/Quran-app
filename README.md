# القرآن الكريم — Quran App

[![CI](https://github.com/emZubair/Quran-app/actions/workflows/ci.yml/badge.svg)](https://github.com/emZubair/Quran-app/actions/workflows/ci.yml)

A cross-platform Quran reader built with **Expo (React Native)** that runs on iOS, Android, and Web from a single codebase. Features tappable word-level Arabic text (designed for future word-by-word meanings), bookmarking, search, and a responsive layout that adapts to any screen size.

---

## Features

- **Full Quran** — all 114 surahs with Uthmanic Arabic text
- **Word-level tapping** — every Arabic word is an individual pressable element (word meanings to be added in a future release)
- **English translation** — powered by the [Al Quran Cloud API](https://alquran.cloud/api)
- **Bookmarks** — save and manage bookmarked pages, persisted locally
- **Last-read tracking** — automatically remembers your last position with a "Continue Reading" banner
- **Search** — filter surahs by name (English or Arabic) or number
- **Adjustable font size** — increase/decrease Arabic text size from Settings
- **Translation toggle** — show or hide English translation
- **Responsive layout** — flexbox-based design adapts to phones, tablets, foldables, and desktop browsers

---

## Tech Stack

| Layer              | Technology                                  |
| ------------------ | ------------------------------------------- |
| Framework          | [Expo](https://expo.dev) (SDK 54)           |
| Language           | TypeScript (strict mode)                    |
| Navigation         | [Expo Router](https://docs.expo.dev/router) |
| State              | [Zustand](https://zustand.docs.pmnd.rs)     |
| Persistence        | AsyncStorage                                |
| Quran Data API     | [alquran.cloud](https://alquran.cloud/api)  |
| Audio (planned)    | expo-av                                     |
| Local DB (planned) | expo-sqlite                                 |

---

## Project Structure

```
quran-app/
├── app/                          # Expo Router — file-based routing
│   ├── _layout.tsx               # Root layout: loads stores, configures Stack navigator
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── _layout.tsx           # Tab bar configuration (Surahs, Bookmarks, Settings)
│   │   ├── index.tsx             # Surah list screen — search, last-read banner
│   │   ├── bookmarks.tsx         # Bookmarks screen — list with delete
│   │   └── settings.tsx          # Settings screen — font size, translation toggle
│   └── surah/
│       └── [id].tsx              # Surah reader — ayahs with tappable words, bookmark button
│
├── components/                   # Reusable UI components
│   ├── AyahView.tsx              # Renders a single ayah: word tokens + translation
│   ├── SurahListItem.tsx         # Row in the surah list
│   └── WordToken.tsx             # Single tappable Arabic word (Pressable)
│
├── data/
│   └── quranMeta.ts              # Static metadata for all 114 surahs
│
├── hooks/
│   └── useQuranData.ts           # Fetches Arabic text + translation, splits into words
│
├── stores/                       # Zustand state stores (persisted via AsyncStorage)
│   ├── bookmarkStore.ts          # Bookmarks + last-read position
│   └── settingsStore.ts          # Font size, translation visibility
│
├── assets/                       # App icons, splash screen, fonts
│   └── fonts/                    # (reserved for Uthmanic script fonts)
│
├── app.json                      # Expo configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

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

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for creating production binaries.

### One-time setup

```bash
# Install the EAS CLI globally
bun add -g eas-cli

# Log in to your Expo account
eas login

# Initialize EAS in the project (creates eas.json)
eas build:configure
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
# Development build (.apk for testing)
eas build --platform android --profile development

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

### iOS — Apple App Store

```bash
# Submit the latest iOS build to App Store Connect
eas submit --platform ios
```

You'll need:

- Apple Developer account
- App created in [App Store Connect](https://appstoreconnect.apple.com)
- App metadata (description, screenshots, etc.) filled in

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

| File            | Purpose                                                 |
| --------------- | ------------------------------------------------------- |
| `app.json`      | Expo config: app name, icons, splash, platform settings |
| `eas.json`      | EAS Build profiles (created by `eas build:configure`)   |
| `tsconfig.json` | TypeScript with strict mode, extends Expo's base config |

---

## API

The app fetches Quran data from the **Al Quran Cloud API** (free, no API key required):

- Arabic text: `GET https://api.alquran.cloud/v1/surah/{number}/quran-uthmani`
- Translation: `GET https://api.alquran.cloud/v1/surah/{number}/en.asad`

[Full API documentation →](https://alquran.cloud/api)

---

## Roadmap

- [ ] Word-by-word meanings popup on tap
- [ ] Audio recitation playback (expo-av)
- [x] Offline mode with bundled Quran data
- [ ] Multiple translation languages
- [x] Dark mode / theming
- [ ] Juz / Para navigation
- [ ] Tajweed color-coded text
- [ ] Custom Uthmanic script fonts

---

## License

Private project. All rights reserved.
