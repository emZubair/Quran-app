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
- **Fonts:** expo-font with bundled Amiri Quran (`assets/fonts/AmiriQuran-Regular.ttf`, SIL OFL — license in `assets/fonts/OFL.txt`). A Quran-grade Naskh font that positions all harakat correctly. The old IndoPak font was removed because it mis-stacked marks (it expected IndoPak-encoded text, not the Tanzil encoding).

## Architecture

### File-based routing (`app/`)

- `app/_layout.tsx` — Root Stack navigator; loads persisted state and the Arabic font on mount
- `app/(tabs)/` — Bottom tab navigator with 3 tabs
  - `index.tsx` — Surah list with search and last-read banner
  - `bookmarks.tsx` — Bookmark management
  - `settings.tsx` — Font size, Arabic font, translation toggle, dark mode, about/attribution
- `app/surah/[id].tsx` — Surah reader screen (dynamic route)

### Components (`components/`)

- `WordToken.tsx` — Single tappable Arabic word. This is the core interaction unit; every Arabic word renders as its own `<Pressable>`. Future word-meaning feature hooks into the `onPress` callback here.
- `AyahView.tsx` — Renders one ayah as a row of WordTokens (RTL flex-wrap) + optional translation text below.
- `SurahListItem.tsx` — Row component for the surah list.

### Data Layer

- `data/quranMeta.ts` — Static array of all 114 surah metadata (name, englishName, ayah count, revelation type). Source of truth for surah info.
- `data/quran-data.json` — The complete Quran: Arabic text + English translation for all 6,236 ayahs. Imported statically (bundled into the JS bundle).
- `scripts/download-quran.ts` — Regenerates quran-data.json from alquran.cloud (`bun run scripts/download-quran.ts [translation-edition] [arabic-edition]`, defaults `en.pickthall quran-simple`). Strips the embedded Bismillah from first ayahs, strips BOMs, and validates surah/ayah counts (must be exactly 112 strips) before writing. Excluded from tsconfig (uses Bun globals).
- `hooks/useQuranData.ts` — Reads one surah from the bundled JSON, splits Arabic into word-level tokens. Returns `{ ayahs, loading, error }`. No network.
- `hooks/useThemeColors.ts` — Returns the light or dark palette based on the darkMode setting. All screen colors flow through this.

### State Stores (`stores/`)

- `bookmarkStore.ts` — Manages bookmarks array and lastRead position. Persists to AsyncStorage on every mutation.
- `settingsStore.ts` — Manages fontSize, showTranslation, translationLanguage, darkMode, arabicFont. Persists to AsyncStorage.

## Conventions

- All components are functional React components with TypeScript interfaces for props.
- Styles use `StyleSheet.create()`; dynamic values (theme colors, safe-area insets) are merged in via style arrays.
- Colors always come from `useThemeColors()` so dark mode works everywhere. Primary green is #2E7D32 (light) / #4CAF50 (dark).
- The status bar always sits on a green header: tab screens extend their green header under the status bar with `useSafeAreaInsets().top` padding, the surah reader uses the native Stack header, and the root layout pins `<StatusBar style="light" />`. Preserve this invariant when adding screens.
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
3. **Pickthall translation** — chosen because it is public domain, avoiding redistribution-rights issues in store builds. Switching editions = rerun the download script.
4. **Minimal native dependencies** — no icon library, no unused native modules; keeps the binary small and the audit surface near zero. Known-remaining `bun audit` findings are dev-toolchain-only (Expo CLI/devtools), none ship in the app.
5. **Zustand over Context** — simpler API, no provider nesting, built-in selector support.

## Store Publishing

- Bundle IDs: `impulsive.soft.quran` (both platforms, set in app.json). Locked once first submitted.
- `eas.json` has development / preview / production profiles; production auto-increments build numbers (remote version source).
- `PRIVACY.md` is the privacy policy — must be hosted and linked in Play Console + App Store Connect.
- Attribution for Tanzil text and Pickthall translation lives in the Settings → About section; keep it if reorganizing Settings.

## Important Patterns

- Bookmark toggle in surah reader header uses `Stack.Screen options.headerRight` for native-feeling integration.
- Navigation uses Expo Router's `router.push(`/surah/${id}`)` pattern.
- All AsyncStorage operations are fire-and-forget (no await in store mutators) to keep UI snappy; data loads on app mount via `loadBookmarks()` and `loadSettings()` in root layout.
- **Bismillah handling:** the bundled data has the Bismillah stripped from every first ayah (the API embeds it). The reader renders the Bismillah as a header for every surah **except** 1 (it IS ayah 1 of Al-Fatiha) and 9 (At-Tawba, skipped by Islamic convention). Both rules are intentional; don't "fix" either. (The download script also tolerates the Uthmani shadda-liaison Bismillah variant in surahs 95/97, which the current `quran-simple` edition does not use but `quran-uthmani` does.)
