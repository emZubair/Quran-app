# Quran App — Agent Context

## Project Overview

A fully offline, ad-free, cross-platform Quran reader built with Expo (React Native) + TypeScript. Runs on iOS, Android, and Web from a single codebase. Uses Expo Router for file-based navigation and Zustand for state management. The complete Quran text and translation are bundled — there are **zero runtime network requests** by design; keep it that way.

## Tech Stack

- **Framework:** Expo SDK 55, React Native 0.83, React 19
- **Language:** TypeScript (strict mode)
- **Routing:** Expo Router (file-based, under `app/`)
- **State Management:** Zustand (stores in `stores/`)
- **Persistence:** @react-native-async-storage/async-storage
- **Quran Data:** bundled `data/quran-data.json` (~2.4 MB) — Tanzil Imlaei/standard text (`quran-simple`) + Pickthall English translation, compiled at build time via the Al Quran Cloud API. The Imlaei edition writes long ā with a full alef (e.g. الكافرين) rather than the Uthmani fatha+dagger-alef; this was a deliberate choice to avoid the stacked-mark look. Switch editions by passing an arg to the download script.
- **Fonts:** expo-font, all bundled, all SIL OFL (licences in `assets/fonts/OFL-*.txt`). Amiri Quran for Arabic — a Quran-grade Naskh that positions all harakat correctly (the old IndoPak font was removed because it mis-stacked marks: it expected IndoPak-encoded text, not the Tanzil encoding). Newsreader (Regular/SemiBold/Italic) and Plus Jakarta Sans (400–800) for UI, added in the redesign. RN does not synthesise weights, so each weight is its own face — see `lib/fonts.ts` for the keys and never pair `fontWeight` with them. The static instances were cut from the Google variable fonts with `fonttools varLib.instancer` (Newsreader pinned at `opsz=16`); Google's own repo now ships only variable files.

## Architecture

### File-based routing (`app/`)

- `app/_layout.tsx` — Root Stack navigator; loads persisted state and all fonts on mount. `headerShown: false` throughout — screens own their chrome.
- `app/(tabs)/` — Bottom tab navigator with 4 tabs
  - `index.tsx` — Home: greeting + Hijri date, Continue/Resume card, ayah of the day, streak week
  - `read.tsx` — launcher, not a screen: on focus it flips the tab back to Home and pushes the reader at `lastRead`, so dismissing the reader does not re-trigger it
  - `browse.tsx` — juz / surah / page / bookmarks, with search that accepts an `s:a` reference
  - `settings.tsx` — grouped cards; the About/attribution block is load-bearing for store listings
- `app/surah/[id].tsx` — reader (dynamic route), accepts an optional `?ayah=` param

### Components (`components/`)

- `reader/ArabicFlow.tsx` — the core text renderer. Renders a run of ayahs as **one continuous RTL `<Text>`** with each word a nested pressable `<Text>`. This replaced the old flex-row-of-`<Pressable>` approach, which could not line-break. Ayah numerals are inline via U+06DD (Amiri shapes the digits inside the glyph) because a bordered `<View>` cannot sit in a text run and nested-`<Text>` borders do not render on Android.
- `reader/AyahBlock.tsx` — Practice's per-ayah block: reference tag, action marks, Arabic, inline word card, translations.
- `reader/WordSheet.tsx` — Mushaf's bottom sheet for word meanings.
- `reader/ReaderBar.tsx`, `reader/SurahHeader.tsx` — reader chrome.
- `ui/Primitives.tsx` — Card, Overline, Divider, ProgressBar, CheckCircle, Ornament, and `ProgressRing` (two rotated half-discs behind a centre disc; deliberately no `react-native-svg`).
- `ui/Switch.tsx`, `ui/Slider.tsx` — custom controls. The platform `<Switch>` cannot be styled to the 46×28 spec, and the slider is PanResponder-based to avoid a package.

### Data Layer

- `data/quranMeta.ts` — Static array of all 114 surah metadata (name, englishName, ayah count, revelation type). Source of truth for surah info.
- `data/juzMeta.ts` — The 30 juz (Arabic + transliterated name, inclusive start/end refs), plus absolute-ayah arithmetic (`absoluteAyah`, `ayahFromAbsolute`, `juzForAyah`, `juzProgress`). Boundaries were hand-authored and verified against the Al Quran Cloud metadata endpoint — all 30 match, and they tile ayahs 1–6236 with no gap or overlap.
- `data/pageMeta.ts` — Start ref of each of the 604 Madani mushaf pages, generated from the same metadata endpoint. `pageForAyah` binary-searches it.
- `data/quran-data.json` — The complete Quran: Arabic text + English translation for all 6,236 ayahs. Imported statically (bundled into the JS bundle).
- `scripts/download-quran.ts` — Regenerates quran-data.json from alquran.cloud (`bun run scripts/download-quran.ts [translation-edition] [arabic-edition]`, defaults `en.pickthall quran-simple`). Strips the embedded Bismillah from first ayahs, strips BOMs, and validates surah/ayah counts (must be exactly 112 strips) before writing. Excluded from tsconfig (uses Bun globals).
- `hooks/useQuranData.ts` — Reads one surah from the bundled JSON, splits Arabic into word-level tokens. Returns `{ ayahs, loading, error }`. No network.
- `hooks/useThemeColors.ts` — Returns the token set for the active theme, plus `useTajweedColors` and `useThemeMetrics` (gutters, radii, nav-mark geometry). All screen colours flow through this; no component holds a literal hex.
- `hooks/useWordMeaning.ts` — Word-by-word gloss lookup. **Returns `null` by design**: no gloss dataset is bundled yet, because sourcing one with a licence compatible with a closed-source store build is still open (the obvious candidate, the Quranic Arabic Corpus, is GPL). The word sheet and inline card are fully built against it and render an empty state. Adding data later is a drop-in change.
- `lib/fonts.ts` — font family keys, asset map, per-theme display fonts, `arabicLineHeight`, and the mono `overline()` helper.
- `lib/hijri.ts` — tabular ("civil") Islamic calendar conversion for the Home overline. Arithmetic only, no lookup table and no `Intl` — Hermes cannot be relied on for the Umm al-Qura calendar. It can differ from the observed date by a day; fine for a greeting, not for anything canonical.

### State Stores (`stores/`)

- `bookmarkStore.ts` — Ayah-level bookmarks and `lastRead: {surah, ayah}`. Persists on every mutation, and migrates v1 payloads on load (surah-level bookmarks with a hardcoded `pageNumber: 1`, and the old `{surahNumber, pageNumber}` lastRead).
- `settingsStore.ts` — fontSize, showTranslation, arabicFont, theme, tajweed, wordMeanings, translations, dailyGoalMinutes, reminder. `loadSettings` migrates the old `darkMode: true` to `theme: "practice"`.
- `streakStore.ts` — `days: Record<ISO date, seconds>` plus current/longest streak. A day counts once `seconds >= dailyGoalMinutes * 60`. The current streak runs back from today, or from yesterday when today's goal is not met yet, so an unfinished day never reads as a broken streak.

## Conventions

- All components are functional React components with TypeScript interfaces for props.
- Styles use `StyleSheet.create()`; dynamic values (theme colors, safe-area insets) are merged in via style arrays.
- Colors always come from `useThemeColors()`. Two themes ship: **Mushaf** (warm paper, light) and **Practice** (near-black, dark), selected by `settings.theme`. Primary green is #1F5236 (Mushaf) / #4ADE80 (Practice).
- **The old green-status-bar invariant is retired.** There is no filled green header in either theme; screens sit on the page background, pad with `useSafeAreaInsets().top` themselves, and the root layout drives `<StatusBar>` from the active theme (`dark` for Mushaf, `light` for Practice).
- No icon library and no emoji in the UI. Tab and action icons are labelled geometric `<View>` marks — a circle in Mushaf, a rounded square in Practice.
- Arabic text renders RTL using `flexDirection: "row-reverse"` with `flexWrap: "wrap"`.
- Responsive design via `useWindowDimensions()` — adds horizontal padding on screens wider than 768px.
- Emoji used for tab icons and UI elements (no icon library dependency).

## Commands

```bash
bun install                              # Install dependencies
bun start                                # Start dev server (press i/a/w for iOS/Android/Web)
bunx tsc --noEmit                        # Type-check without emitting
bunx eslint .                            # Lint
bunx prettier --check "**/*.{ts,tsx,json,md}"  # Format check
bunx expo export --platform web          # Build static web bundle to dist/
bun run scripts/download-quran.ts        # Regenerate bundled Quran data (default en.pickthall)
```

## Key Design Decisions

1. **Word-level data model** — Arabic text is split into individual word tokens at load time (`splitArabicIntoWords`), so the word-meaning feature can be added later without restructuring.
2. **Fully offline via bundled JSON** — the entire Quran ships in the JS bundle. No expo-sqlite, no runtime fetch. The privacy story ("no data collected, no network") is a product feature; do not add network calls or third-party SDKs casually.
3. **Public-domain translations only** — Pickthall, Yusuf Ali and Shakir are listed in `TRANSLATION_EDITIONS`. This is a redistribution-rights constraint for store builds, not a quality judgement: Saheeh International and Maududi appear in the redesign mockups but are copyrighted and are deliberately **not** bundled. Only Pickthall's text is currently in `quran-data.json`; the other editions need the download script extended before they render.
4. **Minimal native dependencies** — no icon library, no unused native modules; keeps the binary small and the audit surface near zero. Known-remaining `bun audit` findings are dev-toolchain-only (Expo CLI/devtools), none ship in the app.
5. **Zustand over Context** — simpler API, no provider nesting, built-in selector support.

## Store Publishing

- Bundle IDs (set in app.json) **differ per platform** — do not "fix" one to match the other:
  - Android `package`: `quran.impulsivesoft.com`
  - iOS `bundleIdentifier`: `impulsive.soft.quran`
  - Both are locked once that platform's first store submission goes through.
- `eas.json` has development / preview / production profiles; production auto-increments build numbers (remote version source).
- `PRIVACY.md` is the privacy policy — must be hosted and linked in Play Console + App Store Connect.
- Attribution for Tanzil text and Pickthall translation lives in the Settings → About section; keep it if reorganizing Settings.

## Important Patterns

- Bookmark toggle in surah reader header uses `Stack.Screen options.headerRight` for native-feeling integration.
- Navigation uses Expo Router's `router.push(`/surah/${id}`)` pattern.
- All AsyncStorage operations are fire-and-forget (no await in store mutators) to keep UI snappy; data loads on app mount via `loadBookmarks()` and `loadSettings()` in root layout.
- **Bismillah handling:** the bundled data has the Bismillah stripped from every first ayah (the API embeds it). The reader renders the Bismillah as a header for every surah **except** 1 (it IS ayah 1 of Al-Fatiha) and 9 (At-Tawba, skipped by Islamic convention). Both rules are intentional; don't "fix" either. (The download script also tolerates the Uthmani shadda-liaison Bismillah variant in surahs 95/97, which the current `quran-simple` edition does not use but `quran-uthmani` does.)
