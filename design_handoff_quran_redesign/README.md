# Handoff: Quran App — full UI redesign (two themes)

## Overview

This package specifies a complete visual and structural redesign of the offline Quran reader
(Expo / React Native / TypeScript, bundle id `impulsive.soft.quran`).

The redesign does three things:

1. **Replaces the current chrome.** The filled `#2E7D32` header bar, emoji tab icons and flat
   white lists are retired.
2. **Restructures navigation** from 3 tabs (Surahs / Bookmarks / Settings) to 4
   (Home / Read / Browse / Settings), with Browse absorbing surah, juz, page and saved.
3. **Adds five roadmap features** to the UI: word-by-word meanings, juz navigation,
   tajweed colour-coding, multiple translations, and reading streaks/goals.

Two complete themes are specified — **Mushaf** (warm paper, light) and **Practice**
(near-black, dark). They share one information architecture, one component set and one set
of screens. **Both are to be shipped**, as the two options behind Settings → Appearance →
Theme, replacing the current boolean `darkMode` setting.

Ship as one release. No phasing.

---

## About the design files

The files in `design_files/` are **design references authored in HTML** — prototypes that show
intended look, spacing and behaviour. They are **not production code and must not be copied
into the app**.

The target codebase is the existing Expo / React Native project. Recreate these designs there
using its established patterns: functional components with TypeScript prop interfaces,
`StyleSheet.create()` with dynamic values merged via style arrays, Zustand stores for state,
Expo Router for navigation, all colours flowing through `useThemeColors()`.

Two hard constraints from the existing project that the redesign does not change:

- **Zero runtime network requests.** The full Quran ships in `data/quran-data.json`. Any new
  data (word meanings, juz boundaries, additional translations, tajweed rules) must also be
  bundled at build time — extend `scripts/download-quran.ts` or add sibling data files. Do not
  add fetch calls, analytics or third-party SDKs.
- **Minimal native dependencies.** The project deliberately has no icon library. The redesign
  removes emoji icons; see "Icons" below for what replaces them without adding a dependency.

`design_files/` opens in a browser directly — open `Quran App - Directions.dc.html`. It needs
`support.js` and `assets/fonts/AmiriQuran-Regular.ttf`, both included, kept at the same
relative paths.

## Fidelity

**High fidelity.** Every colour, type size, weight, radius, padding and gap below is final and
taken from the prototype. Recreate pixel-perfectly at 390 × 844 (iPhone 14) and let it scale
from there. Where a value is not stated, take it from the HTML.

---

## Design tokens

### Theme A — "Mushaf" (light)

| Token | Hex | Use |
|---|---|---|
| `paper` | `#FAF7F0` | screen background |
| `surface` | `#FFFFFF` | cards, sheets |
| `ink` | `#1C1A16` | primary text |
| `inkSecondary` | `#4A463E` | translation text |
| `muted` | `#8A8378` | secondary labels |
| `mutedSoft` | `#9A9081` | overline / meta labels |
| `mutedFaint` | `#B3AA98` | disabled, inactive marks |
| `line` | `#E8E0D1` | card borders, nav border |
| `lineSoft` | `#F0EAE0` | inside-card dividers |
| `lineFaint` | `#EFE8DA` | header rules |
| `fill` | `#F1ECE1` | search field, neutral chips |
| `fillWarm` | `#EDE6D8` | empty streak bars, slider track |
| `green` | `#1F5236` | primary — buttons, active nav, progress |
| `greenSoft` | `#4E8464` | partial state |
| `greenTint` | `#E7EFE9` | green chip background |
| `gold` | `#C9AE72` | ayah-number ring, ornament |
| `goldInk` | `#A8763E` | ayah numeral, root chip text |
| `goldTint` | `#F7EFDE` | root chip background |
| `highlight` | `#EAE0C8` | selected word in Arabic text |

### Theme B — "Practice" (dark)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0C1210` | screen background |
| `surface` | `#111A16` | cards |
| `surfaceAlt` | `#18231E` | chips, avatars, ayah tags |
| `navBg` | `#0F1714` | tab bar, reader footer |
| `line` | `#1D2A24` | borders, dividers |
| `lineAlt` | `#22322B` | chip borders |
| `lineFaint` | `#18231E` | list row dividers |
| `text` | `#F2F5F3` | primary text |
| `textSecondary` | `#9FB0A8` | translation text |
| `muted` | `#6E7B75` | secondary labels |
| `mutedMark` | `#46564F` | inactive nav marks |
| `checkOff` | `#2C3D35` | unchecked circle border |
| `green` | `#4ADE80` | primary — CTAs, active nav, progress |
| `greenDeep` | `#2A7C4E` | partial state |
| `greenTint` | `#1D3A2A` | selected word background |
| `onGreen` | `#0B0F0D` | text/icons on green fills |

### Tajweed palette (theme B reader; theme A uses the same hues at ~20 % lower lightness)

| Rule | Dark hex | Light hex |
|---|---|---|
| idghām | `#F2A649` | `#B26A12` |
| madd | `#5BC8F5` | `#1B7FA8` |
| ghunnah | `#C79BF5` | `#7C4FB8` |
| qalqalah | `#F58A8A` | `#B33B3B` |

Rules are colour on the glyph run only — no background fill, no underline.

### Typography

| Role | Theme A | Theme B |
|---|---|---|
| Arabic (Quran) | `AmiriQuran` (already bundled) | same |
| Display / headings | `Newsreader` 300–600 | `Plus Jakarta Sans` 700–800 |
| UI / labels | `Plus Jakarta Sans` 400–700 | same |
| Overlines & data | system monospace, 10 px, `letter-spacing: .16em`, uppercase | same |

Add `Newsreader` and `Plus Jakarta Sans` as bundled font files via `expo-font` in
`app/_layout.tsx`, alongside the existing `AmiriQuran` load. Do not fetch from Google Fonts at
runtime — that would break the offline guarantee.

**Arabic line-height rule (carried over from `WordToken.tsx`):** Amiri Quran stacks tall vowel
marks, so Arabic runs need `lineHeight = fontSize × 2.0`; system-font Arabic needs `× 1.8`.
Preserve this.

### Scale

- Spacing: 2, 4, 6, 8, 10, 12, 14, 18, 20, 22, 24, 26 px
- Radii: 5 (small chips) · 8–11 (buttons, fields) · 14 (cards) · 18 (hero cards) · 19–46 (circles)
- Screen gutters: **24 px** in theme A, **22 px** in theme B
- Tab bar: 74 px tall, 1 px top border, 10 px top padding
- Status bar area: 47 px reserved at the top of every screen

### Icons

The current app uses emoji (`📖 🔖 ⚙️`). The redesign removes them entirely and uses **labelled
geometric marks** — a 7–8 px `<View>` above a text label. No icon library, no SVG, no new
dependency.

- Theme A: 7 px circle. Active = filled `green`. Inactive = 1.5 px border `mutedFaint`.
- Theme B: 8 px square, 2 px radius. Active = filled `green`. Inactive = 1.5 px border `mutedMark`.

The label under each mark is what identifies the tab, so labels are never hidden.

---

## Navigation structure

Replace `app/(tabs)/` with four routes:

| Route | File | Was |
|---|---|---|
| Home | `app/(tabs)/index.tsx` | (new — surah list moves to Browse) |
| Read | `app/(tabs)/read.tsx` | thin wrapper that pushes `/surah/[id]` at last-read position |
| Browse | `app/(tabs)/browse.tsx` | old `index.tsx` (surah list) + old `bookmarks.tsx` |
| Settings | `app/(tabs)/settings.tsx` | unchanged route, redesigned |

The reader stays at `app/surah/[id].tsx` but loses the native Stack header in favour of a
custom in-screen bar (see below). `headerShown: false` for that route.

**The green-status-bar invariant in `CLAUDE.md` no longer applies.** There is no filled green
header in either theme. Set `<StatusBar style="dark" />` for theme A and `"light"` for theme B,
driven by the active theme.

---

## Screens

Screenshots: `screenshots/1a-*.png` (Mushaf) and `screenshots/1b-*.png` (Practice), 2× PNG.
`screenshots/current-*.png` shows today's UI for comparison.

---

### A1 · Home — Mushaf (`1a-1-today.png`)

**Purpose:** orient the reader, get them back into the text in one tap.

Background `paper`. Vertical stack, 24 px gutters.

1. **Greeting block** (`padding: 12px 24px 0`, gap 2)
   - Overline: `Fri · 22 Safar 1448` — mono 11 px, `.14em`, uppercase, `mutedSoft`.
     Gregorian weekday + Hijri date, computed locally.
   - Title: `Peace be upon you` — Newsreader 30 px / 400, `ink`, `letter-spacing: -.01em`,
     line-height 1.2.

2. **Continue card** — `margin: 22px 24px 0`, background `green`, radius 16, padding 20, gap 16.
   - Left column: overline `CONTINUE` (mono 10 px, `.16em`, `rgba(250,247,240,.6)`);
     surah name Newsreader 25 px `#FAF7F0`; meta `Ayah 45 of 286 · Juz 1` 12.5 px
     `rgba(250,247,240,.72)`.
   - Right: Arabic surah name, Amiri 30 px, `rgba(250,247,240,.9)`.
   - Progress: 3 px track `rgba(250,247,240,.22)`, radius 2, fill `#D8C08A`.
     Below it, 11 px `rgba(250,247,240,.6)`, space-between: `16% complete` / `~24 min left`.
   - Whole card is pressable → reader at last-read ayah.

3. **Ayah of the day** — `margin: 20px 24px 0`.
   - Header row: overline `AYAH OF THE DAY` left, reference `55:13` right (11.5 px, `green`, 600).
   - Card: `surface`, 1 px `line`, radius 14, padding `18px 18px 16px`, gap 12.
     Arabic Amiri 25 px / line-height 2.05, RTL, right-aligned.
     1 px `#EFE8DA` rule.
     Translation Newsreader 15.5 px / 1.55, `inkSecondary`.
   - Deterministic per calendar day (seed from the date so it doesn't change on re-render).

4. **This week** — `margin: 20px 24px 0`, gap 12.
   - Header: overline `THIS WEEK` / `12 day streak` (11.5 px `muted`).
   - Seven equal columns, gap 8. Each: a 34 px-tall bar, radius 8, then a 10 px day letter.
     Bar states — goal met `green`; partial `greenSoft`; missed/future `fillWarm`.
     Today's letter is `ink` / 700; all others `mutedSoft`.

5. Flexible spacer, then the tab bar.

---

### A2 · Reader — Mushaf (`1a-2-reader.png`)

**Purpose:** uninterrupted reading; word meanings on demand.

The most important screen in the redesign. Ayah rows, badges and card borders are gone — the
Arabic is a **single continuous RTL text flow** the way a printed mushaf sets it.

1. **Bar** (48 px, bottom border `lineFaint`, padding 0 20)
   - Left `‹` 15 px `green` 600 → back.
   - Centre, two lines: surah name Newsreader 16 px `ink`; below,
     `JUZ 1 · PAGE 4` mono 9.5 px `.12em` `mutedSoft`.
   - Right: `Aa` (Newsreader 15 px `green`) opens type settings; `◇` opens the ayah/juz jump sheet.

2. **Surah header** (`padding: 26px 24px 20px`, centred, gap 12)
   - Ornamental rule: two 1 px `#E2D9C6` lines flanking a 5 px `gold` square rotated 45°.
   - Arabic surah name Amiri 34 px `ink`.
   - `The Cow · Medinan · 286 ayahs` — Newsreader 14 px italic `muted`, `margin-top: -8px`.
   - Bismillah Amiri 22 px `green`, line-height 2.
     **Keep the existing rule:** rendered for every surah except 1 (it is ayah 1 of Al-Fatiha)
     and 9 (At-Tawba). Do not change either case.

3. **Continuous Arabic** (`padding: 0 24px`, `direction: rtl`, right-aligned)
   - Amiri 26 px, line-height 2.5, `ink`, as inline text — not a flex row of tokens.
   - **Ayah numerals** are inline: 22 × 22 circle, 1 px `gold` border, radius 12, Arabic-Indic
     digit in Plus Jakarta Sans 10 px / 600 `goldInk`, `margin: 0 6px`, `vertical-align: 2px`.
   - Each word remains individually pressable. The existing word-token data model in
     `useQuranData.ts` (`splitArabicIntoWords`) already supports this — keep it, but render the
     tokens inline rather than as separate `<Pressable>` boxes so line breaking works. On RN,
     use nested `<Text>` with `onPress` per word inside one parent `<Text>`.
   - Selected word: background `highlight`, radius 5, padding `1px 4px`,
     `box-decoration-break: clone` (RN: apply the background to the nested `<Text>`).

4. **Translations** — `margin: 18px 24px 0`, 1 px `lineFaint` top rule, 16 px padding-top.
   Each row: ayah number in mono 10 px `mutedFaint` (10 px gap, 4 px top padding) beside
   Newsreader 15.5 px / 1.55 `inkSecondary`. One row per enabled translation.

5. **Word sheet** (bottom sheet, appears on word tap)
   - `surface`, radius `20px 20px 0 0`, 1 px `line` top, padding `14px 24px 26px`, gap 14,
     shadow `0 -10px 30px rgba(28,26,22,.09)`.
   - 36 × 4 grab handle `#E2D9C6`, centred.
   - Row: English gloss Newsreader 22 px `ink` + transliteration Newsreader 12.5 px italic
     `muted`; right, the Arabic word Amiri 28 px `green`.
   - Chip row, gap 8, mono 10.5 px, radius 5, padding `5px 9px`:
     root (`goldInk` on `goldTint`), grammar (`green` on `greenTint`),
     frequency (`#6E6759` on `#F1ECE1`).
   - Definition: 1 px `#F0EAE0` top rule, 12 px padding-top, Newsreader 14.5 px / 1.55
     `inkSecondary`, with the triliteral gloss in italic.
   - Dismiss by swipe-down or tapping elsewhere in the text.

**No tab bar on this screen.** The reader is full height.

---

### A3 · Browse — Mushaf (`1a-3-browse.png`)

Title `Browse` — Newsreader 30 px `ink`, `padding: 14px 24px 0`.

- **Search** — 42 px, radius 10, `fill`, padding 0 14, gap 9. A 12 px circle outline
  (1.5 px `mutedFaint`) stands in for the magnifier. Placeholder
  `Surah, juz, or ayah number`, 14 px `mutedSoft`.
- **Tabs** — `Juz` / `Surah` / `Bookmarks`, gap 26, 1 px `lineFaint` bottom border.
  Active: 14 px / 700 `ink`, 2 px `green` underline (`margin-bottom: -1px`).
  Inactive: 14 px / 500 `mutedSoft`.
- **Juz rows** — 15 px vertical padding, 1 px `lineSoft` divider, gap 14.
  - Index: 38 px circle. Started juz = filled `green`, numeral Newsreader 16 px `#FAF7F0`.
    Untouched = 1 px `#E2D9C6` border, numeral `#6E6759`.
  - Middle: juz name Newsreader 17 px `ink` (`Alif Lām Mīm`, `Sayaqūl`, `Tilka r-Rusul`, …);
    range 12 px `mutedSoft` (`Al-Fatiha 1 — Al-Baqara 141`).
  - Right: percent 11 px `green` 600 over a 44 × 3 progress track `#E2D9C6` / fill `green`;
    or an em dash `mutedFaint` if unstarted.
- The Surah tab reuses the same row geometry with the surah number, English name, translation
  + ayah count, and the Arabic name on the right.

**Juz data is new.** Add a `data/juzMeta.ts` with the 30 juz: number, Arabic name,
transliterated name, start surah/ayah, end surah/ayah. Derive progress from `lastRead`.

---

### A4 · Settings — Mushaf (`1a-4-settings.png`)

Title `Settings` — Newsreader 30 px. Sections are overline + a `surface` card
(1 px `line`, radius 14) with `lineSoft` dividers between rows. Row padding `14px 16px`,
label 14.5 px `ink`, value 13.5 px `muted` with a `›`.

1. **ARABIC TEXT**
   - Live preview `بِسْمِ اللَّهِ` Amiri 28 px, centred.
   - Size slider replacing the current `A−` / `A+` buttons: 3 px `#EDE6D8` track, `green` fill,
     20 px white thumb with a 1.5 px `green` border. Flanked by a 15 px and a 22 px `A`.
     Keep the existing 18–48 clamp from `settingsStore.setFontSize`.
   - `Typeface` → `Amiri Quran ›`
   - `Tajweed colouring` with sub-label `Colour-codes recitation rules` (11.5 px `mutedSoft`)
     and a switch.
2. **TRANSLATIONS** — header shows `2 shown` (11.5 px `green` 600). Rows carry a name and a
   sub-label (`English · 1930`), with a 20 px check circle: on = filled `green` + white ✓,
   off = 1.5 px `#DDD4C2` border. Last row: `Browse all translations ›` in `green` 600.
3. **READING** — `Daily goal` `10 min ›`; `Word meanings on tap` switch; `Night paper` switch
   (this is what selects theme B).

**Switches** are custom, not the RN `<Switch>`: 46 × 28, radius 14, 2.5 px padding, 23 px white
thumb. On = `green` track. Off = `#E5DDCD` track.

The **About / attribution block** from the current `settings.tsx` (Tanzil, Pickthall,
Al Quran Cloud, Amiri Quran OFL, version + "no ads, no tracking") must be preserved verbatim —
move it into a fourth `ABOUT` card at the bottom of the scroll. Store listings depend on it.

---

### B1 · Home — Practice (`1b-1-home.png`)

Background `bg`, 22 px gutters.

1. **Header row** — `Assalamu alaikum` 22 px / 800 `text`, `-.02em`; `Friday · 22 Safar 1448`
   12.5 px `muted`. Right: 38 px circle `surfaceAlt`, 1 px `lineAlt`, initial 13 px / 700 `green`.
2. **Streak card** — `surface`, 1 px `line`, radius 18, padding 20, gap 20, row layout.
   - 92 px progress ring. In HTML this is a conic gradient; in RN use two stacked circular
     views with a rotated half-disc mask, or `react-native-svg` if it is already a transitive
     dependency — **do not add a new package for this**; a simple 8 px-thick arc drawn with two
     rotated half-circles is acceptable. Fill `green`, track `line`. Inner disc `surface`, 72 px,
     with `12` at 22 px / 800 `text` over `DAYS` mono 9 px `.1em` `muted`.
   - Right: `7 of 10 min today` 15 px / 700; `3 minutes to keep the streak` 12 px `muted`;
     then seven 26 px-tall bars, radius 5, gap 5 — `green` / `greenDeep` / `line`.
3. **Resume card** — background `green`, radius 18, padding 20, gap 16.
   `PICK UP WHERE YOU LEFT` mono 10 px `rgba(11,15,13,.55)`; `Al-Baqara 45` 24 px / 800
   `onGreen`; `Juz 1 · page 7 of 49` 12.5 px / 500 `rgba(11,15,13,.65)`; Arabic name Amiri 30 px
   `onGreen` on the right. Below, a 38 px `onGreen` button, radius 10, label
   `Resume reading` 13.5 px / 700 `green`.
4. **Jump back in** — overline, then two equal cards (`surface`, 1 px `line`, radius 14,
   padding 14, gap 8): Arabic name Amiri 22 px `green`, English 13.5 px / 700 `text`,
   context 11.5 px `muted` (`Bookmarked`, `Read 3 days ago`).

---

### B2 · Reader — Practice (`1b-2-reader.png`)

Ayah-per-block layout (unlike A2's continuous flow), because tajweed and multi-translation
need the vertical structure.

1. **Bar** 50 px, bottom border `line`. `‹` 16 px `green`; centre surah name 14.5 px / 700 plus
   `JUZ 1 · 2:1–3` mono 9.5 px `muted`; right `Aa` 14 px / 700 `green` and a 9 px `green` square.
2. **Translation switcher** — horizontal chip strip, padding `12px 18px`, gap 7,
   bottom border `line`. Active chip: `green` fill, `onGreen` 11.5 px / 700, radius 14,
   padding `6px 12px`. Inactive: `surfaceAlt`, 1 px `lineAlt`, `textSecondary` 11.5 px / 600.
   Trailing `+` chip opens the translation picker. Horizontally scrollable.
3. **Surah header** — `surface`, bottom border `line`, padding `20px 18px`, centred:
   Arabic Amiri 30 px `text`; `The Cow · Medinan · 286 ayahs` 12.5 px `muted`;
   Bismillah Amiri 21 px `green`.
4. **Ayah block** — padding 18, bottom border `line`, gap 12.
   - Header row: reference tag `2:2` mono 10 px `green` on `surfaceAlt`, radius 5,
     padding `3px 8px`. Right: two 9 px action marks (circle = bookmark, square = share);
     filled `green` when active, else 1.5 px `mutedMark` border.
   - Arabic Amiri 27 px, line-height 2.3, RTL. Tajweed spans coloured per the palette above.
     Selected word: `greenTint` background, radius 6, padding `2px 5px`, text `green`.
   - **Inline word card** (replaces A2's bottom sheet): `surface`, 1 px `line`, radius 12,
     padding `12px 14px`, gap 10, injected directly beneath the Arabic of the ayah the word
     belongs to. Arabic word Amiri 22 px `green`; gloss 14 px / 700 `text`;
     `li-l-muttaqīn · root و ق ي · 49 occurrences` 11.5 px `muted`.
   - Translation(s) 14.5 px / 1.55 `textSecondary`, one paragraph per enabled translation.
5. **Tajweed legend footer** — 52 px, top border `line`, `navBg`. Left: three mono 10 px rule
   names in their own colours. Right: `TAJWEED ON` mono 10 px `.1em` `muted`. Hidden when
   tajweed is off.

---

### B3 · Browse — Practice (`1b-3-browse.png`)

Title `Browse` 26 px / 800.

- **Search** 42 px, radius 11, `surface`, 1 px `line`; placeholder `Search surah, juz or 2:255`
  14 px `muted`. Accepts an `s:a` reference and jumps straight there.
- **Segmented control** — `surface`, 1 px `line`, radius 11, 4 px padding, four equal segments:
  `Surah` / `Juz` / `Page` / `Saved`. Active: `green` fill, radius 8, `onGreen` 12.5 px / 700.
  Inactive: `textSecondary` 12.5 px / 600, no fill.
- **Filter chips** — `All` / `Meccan` / `Medinan` / `Short`, radius 13, padding `5px 11px`,
  11.5 px. Active `green` / `onGreen` / 700; inactive `surfaceAlt`, 1 px `lineAlt`,
  `textSecondary` / 600.
- **Rows** — 13 px vertical padding, 1 px `lineFaint` divider, gap 13.
  36 px rounded-square index (radius 10, `surfaceAlt`, 1 px `lineAlt`, numeral 13 px / 700
  `green`); English name 15 px / 700 `text`; meta 11.5 px `muted`
  (`The Opening · 7 · Meccan`); Arabic name Amiri 20 px `textSecondary` on the right.
- **Currently-reading row** is highlighted: `surface` background, radius 10, bled 12 px into the
  gutters, index filled `green` with `onGreen` numeral, and meta replaced by
  `Reading · ayah 45 of 286` in `green`.

---

### B4 · Settings — Practice (`1b-4-settings.png`)

Same four-group structure as A4, restyled: overline `muted`, cards `surface` + 1 px `line`,
radius 14, dividers `line`. Labels 14.5 px `text`, values 13.5 px `muted`.

Groups: **ARABIC TEXT** (preview, slider with a solid 20 px `green` thumb on a 4 px track,
`Typeface`, `Tajweed colouring` with sub-label `idghām · madd · ghunnah · qalqalah`) ·
**TRANSLATIONS** (`2 shown` in `green` 700) · **HABIT** (`Daily goal` `10 minutes ›`,
`Reminder` `After Fajr ›`, `Word meanings on tap` switch) · **APPEARANCE** (`Theme` `Dark ›`).

Switches: 46 × 28, `green` track, 23 px `onGreen` thumb when on.

The **About / attribution block** must be preserved here too, verbatim.

---

## Interactions & behaviour

| Trigger | Result |
|---|---|
| Tap a word in the reader | A: bottom sheet slides up, 220 ms ease-out; word gains `highlight`. B: inline card expands beneath the ayah, 180 ms; word gains `greenTint`. Tapping the same word again dismisses. |
| Tap Continue / Resume | Push `/surah/[id]`, scroll to `lastReadAyah`. |
| Tap `Aa` | Type sheet: size slider, typeface, tajweed toggle — same controls as Settings → Arabic text. |
| Tap `◇` (A) / green square (B) | Jump sheet: ayah number, juz, page. |
| Tap a translation chip (B) | Switches the visible translation without a reload; chips reorder so the active one is first. |
| Long-press an ayah | Action row: bookmark, copy, share. |
| Scroll the reader | Persists `lastRead` (surah + ayah), debounced ~1 s, fire-and-forget to AsyncStorage as today. |
| Streak bar tap | Opens that day's reading summary. |
| Pull to refresh | None. The app is offline; there is nothing to refresh. |

Reduce-motion: skip the sheet slide and the ring fill animation; render final state.

RTL: the Arabic runs use `direction: rtl` / `flexDirection: row-reverse`. The surrounding UI
chrome stays LTR unless the device locale is RTL.

---

## State

Extend the existing Zustand stores; do not introduce a new state library.

**`stores/settingsStore.ts`** — add:
- `theme: "mushaf" | "practice"` (migrate the existing `darkMode: boolean` — `true` → `practice`)
- `tajweed: boolean` (default `false`)
- `wordMeanings: boolean` (default `true`)
- `translations: string[]` (default `["en.pickthall"]`, max 3 shown at once)
- `dailyGoalMinutes: number` (default `10`)
- `reminder: string | null` (default `null`)

**`stores/bookmarkStore.ts`** — extend `lastRead` from `{surah, page}` to `{surah, ayah}`;
`Bookmark` gains `ayahNumber` so bookmarks stop being surah-level (today every bookmark reads
`Page 1`).

**New `stores/streakStore.ts`** — `days: Record<string /* ISO date */, number /* seconds read */>`,
`currentStreak`, `longestStreak`. A day counts when `seconds >= dailyGoalMinutes × 60`.
Persisted to AsyncStorage like the others.

**`hooks/useThemeColors.ts`** — returns the token set for the active `theme` rather than a
light/dark boolean. Both palettes above go here. Every colour in the app keeps flowing through
this hook; no component should hold a literal hex.

---

## Known bugs in the current code to fix while rebuilding

1. `components/AyahView.tsx` — the ayah-number badge background is a hardcoded `#2E7D32` and
   never themes. It is the one colour in the app that bypasses `useThemeColors()`.
2. `app/surah/[id].tsx` — the Bismillah and surah title render in the system font, not Amiri,
   so they clash with the ayah text directly below them. Both should use `AmiriQuran`.
3. `stores/bookmarkStore.ts` — bookmarks are hardcoded to `pageNumber: 1`, so every bookmark
   row shows "Page 1". Fixed by the `ayahNumber` change above.

---

## New bundled data required

All build-time, all offline:

| Data | Suggested file | Notes |
|---|---|---|
| Juz boundaries + names | `data/juzMeta.ts` | 30 entries, static |
| Word-by-word glosses | `data/quran-words.json` | keyed `surah:ayah:wordIndex`; gloss, transliteration, root, grammar tag, frequency |
| Extra translations | `data/translations/<edition>.json` | one per edition, lazily `require`d |
| Tajweed spans | `data/tajweed.json` | per-ayah character ranges + rule id |

Extend `scripts/download-quran.ts` in the same defensive style as today: validate counts, fail
loudly, never write partial data. Watch bundle size — the app is already ~2.4 MB of JSON;
consider lazy-requiring anything beyond the default translation.

---

## Assets

- `AmiriQuran-Regular.ttf` (SIL OFL) — already in the project at `assets/fonts/`. Unchanged.
  A copy is included in `design_files/assets/fonts/` so the HTML renders.
- `Newsreader` and `Plus Jakarta Sans` — Google Fonts, OFL. Download the static weights and
  bundle them; do not link at runtime.
- No images, no icon files. All marks are `<View>`s.

---

## Files in this bundle

```
README.md                                  this document
screenshots/
  1a-1-today.png      1a-2-reader.png      1a-3-browse.png      1a-4-settings.png
  1b-1-home.png       1b-2-reader.png      1b-3-browse.png      1b-4-settings.png
  current-1-surah-list.png   current-2-reader.png
  current-3-bookmarks.png    current-4-settings.png
design_files/
  Quran App - Directions.dc.html           the redesign, both themes, 8 screens
  Quran App - Current UI.dc.html           1:1 rebuild of today's UI, for diffing
  support.js                               runtime needed to open the two HTML files
  assets/fonts/AmiriQuran-Regular.ttf
```

Open the two HTML files in any browser. `Quran App - Current UI.dc.html` is a faithful
reconstruction of the app as it stands today (both light and dark, plus the current palette) —
useful for confirming what is actually changing.
