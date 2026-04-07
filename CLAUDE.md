# Quran App — Agent Context

## Project Overview

A cross-platform Quran reader built with Expo (React Native) + TypeScript. Runs on iOS, Android, and Web from a single codebase. Uses Expo Router for file-based navigation and Zustand for state management.

## Tech Stack

- **Framework:** Expo SDK 54, React Native 0.81, React 19
- **Language:** TypeScript (strict mode)
- **Routing:** Expo Router (file-based, under `app/`)
- **State Management:** Zustand (stores in `stores/`)
- **Persistence:** @react-native-async-storage/async-storage
- **Quran Data:** Al Quran Cloud API (https://api.alquran.cloud/v1) — no API key needed
- **Planned:** expo-av (audio), expo-sqlite (offline DB)

## Architecture

### File-based routing (`app/`)

- `app/_layout.tsx` — Root Stack navigator, loads persisted state on mount
- `app/(tabs)/` — Bottom tab navigator with 3 tabs
  - `index.tsx` — Surah list with search and last-read banner
  - `bookmarks.tsx` — Bookmark management
  - `settings.tsx` — Font size and translation toggle
- `app/surah/[id].tsx` — Surah reader screen (dynamic route)

### Components (`components/`)

- `WordToken.tsx` — Single tappable Arabic word. This is the core interaction unit; every Arabic word renders as its own `<Pressable>`. Future word-meaning feature hooks into the `onPress` callback here.
- `AyahView.tsx` — Renders one ayah as a row of WordTokens (RTL flex-wrap) + optional translation text below.
- `SurahListItem.tsx` — Row component for the surah list.

### Data Layer

- `data/quranMeta.ts` — Static array of all 114 surah metadata (name, englishName, ayah count, revelation type). This is the source of truth for surah info; no API call needed for listing.
- `hooks/useQuranData.ts` — React hook that fetches Arabic text + English translation from the API, splits Arabic into word-level tokens. Returns `{ ayahs, loading, error }`.

### State Stores (`stores/`)

- `bookmarkStore.ts` — Manages bookmarks array and lastRead position. Persists to AsyncStorage on every mutation.
- `settingsStore.ts` — Manages fontSize, showTranslation, translationLanguage. Persists to AsyncStorage.

## Conventions

- All components are functional React components with TypeScript interfaces for props.
- Styles use `StyleSheet.create()` — no external styling library.
- Color scheme: green primary (#2E7D32), light green accents (#E8F5E9, #C8E6C9), white backgrounds.
- Arabic text renders RTL using `flexDirection: "row-reverse"` with `flexWrap: "wrap"`.
- Responsive design via `useWindowDimensions()` — adds horizontal padding on screens wider than 768px.
- Emoji used for tab icons and UI elements (no icon library dependency).
- No inline styles — all styles defined in `const styles = StyleSheet.create({...})` at bottom of file.

## Commands

```bash
bun install                        # Install dependencies
bun start                          # Start dev server (press i/a/w for iOS/Android/Web)
bunx tsc --noEmit                  # Type-check without emitting
bunx expo export --platform web    # Build static web bundle to dist/
```

## Key Design Decisions

1. **Word-level data model from day one** — Arabic text is split into individual word tokens at fetch time (`splitArabicIntoWords`), so the word-meaning feature can be added later without restructuring.
2. **API-first, offline later** — Currently fetches from alquran.cloud on each surah open. Plan is to add expo-sqlite with a bundled database for offline access.
3. **No external icon library** — Uses emoji for icons to avoid native dependencies. Can be swapped for a vector icon library later.
4. **Zustand over Context** — Chosen for simpler API, no provider nesting, and built-in selector support for performance.

## Important Patterns

- Bookmark toggle in surah reader header uses `Stack.Screen options.headerRight` for native-feeling integration.
- Navigation uses Expo Router's `router.push(`/surah/${id}`)` pattern.
- All AsyncStorage operations are fire-and-forget (no await in store mutators) to keep UI snappy; data loads on app mount via `loadBookmarks()` and `loadSettings()` in root layout.
- Surah 9 (At-Tawba) intentionally skips Bismillah rendering — this is correct Islamic convention.
