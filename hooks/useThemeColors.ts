import { useSettingsStore } from "../stores/settingsStore";

/**
 * Two complete themes share one token shape so components never branch on the
 * active theme. Where a theme has no natural equivalent for a token, the
 * nearest role-compatible colour is used rather than a new token.
 */
export interface ThemeColors {
  /** screen background */
  background: string;
  /** cards, sheets */
  surface: string;
  /** chips, avatars, ayah tags — theme A folds this into `fill` */
  surfaceAlt: string;
  /** tab bar, reader footer */
  navBg: string;

  /** primary text */
  text: string;
  /** translation text */
  textSecondary: string;
  /** secondary labels */
  muted: string;
  /** overline / meta labels */
  mutedSoft: string;
  /** disabled, inactive marks */
  mutedFaint: string;

  /** card borders, nav border */
  line: string;
  /** inside-card dividers */
  lineSoft: string;
  /** header rules, list row dividers */
  lineFaint: string;
  /** chip borders */
  lineAlt: string;

  /** search field, neutral chips */
  fill: string;
  /** empty streak bars, slider track */
  fillWarm: string;

  /** primary — buttons, active nav, progress */
  green: string;
  /** partial state */
  greenSoft: string;
  /** green chip / selected-word background */
  greenTint: string;
  /** text and icons on green fills */
  onGreen: string;

  /** ayah-number ring, ornament */
  gold: string;
  /** ayah numeral, root chip text */
  goldInk: string;
  /** root chip background */
  goldTint: string;

  /** selected word in Arabic text */
  highlight: string;
  /** unchecked circle border */
  checkOff: string;
}

export interface TajweedColors {
  idgham: string;
  madd: string;
  ghunnah: string;
  qalqalah: string;
}

const mushaf: ThemeColors = {
  background: "#FAF7F0",
  surface: "#FFFFFF",
  surfaceAlt: "#F1ECE1",
  navBg: "#FAF7F0",

  text: "#1C1A16",
  textSecondary: "#4A463E",
  muted: "#8A8378",
  mutedSoft: "#9A9081",
  mutedFaint: "#B3AA98",

  line: "#E8E0D1",
  lineSoft: "#F0EAE0",
  lineFaint: "#EFE8DA",
  lineAlt: "#E2D9C6",

  fill: "#F1ECE1",
  fillWarm: "#EDE6D8",

  green: "#1F5236",
  greenSoft: "#4E8464",
  greenTint: "#E7EFE9",
  onGreen: "#FAF7F0",

  gold: "#C9AE72",
  goldInk: "#A8763E",
  goldTint: "#F7EFDE",

  highlight: "#EAE0C8",
  checkOff: "#DDD4C2",
};

const practice: ThemeColors = {
  background: "#0C1210",
  surface: "#111A16",
  surfaceAlt: "#18231E",
  navBg: "#0F1714",

  text: "#F2F5F3",
  textSecondary: "#9FB0A8",
  muted: "#6E7B75",
  mutedSoft: "#6E7B75",
  mutedFaint: "#46564F",

  line: "#1D2A24",
  lineSoft: "#1D2A24",
  lineFaint: "#18231E",
  lineAlt: "#22322B",

  fill: "#18231E",
  fillWarm: "#1D2A24",

  green: "#4ADE80",
  greenSoft: "#2A7C4E",
  greenTint: "#1D3A2A",
  onGreen: "#0B0F0D",

  // Practice has no gold accent; the ayah ring and numerals ride the green.
  gold: "#2A7C4E",
  goldInk: "#4ADE80",
  goldTint: "#18231E",

  highlight: "#1D3A2A",
  checkOff: "#2C3D35",
};

const tajweedMushaf: TajweedColors = {
  idgham: "#B26A12",
  madd: "#1B7FA8",
  ghunnah: "#7C4FB8",
  qalqalah: "#B33B3B",
};

const tajweedPractice: TajweedColors = {
  idgham: "#F2A649",
  madd: "#5BC8F5",
  ghunnah: "#C79BF5",
  qalqalah: "#F58A8A",
};

export function useThemeColors(): ThemeColors {
  const theme = useSettingsStore((s) => s.theme);
  return theme === "practice" ? practice : mushaf;
}

export function useTajweedColors(): TajweedColors {
  const theme = useSettingsStore((s) => s.theme);
  return theme === "practice" ? tajweedPractice : tajweedMushaf;
}

/**
 * Screen gutters differ between the themes (24 px Mushaf, 22 px Practice), as
 * do a handful of geometry choices. Screens read this instead of branching on
 * the theme name inline.
 */
export interface ThemeMetrics {
  gutter: number;
  /** nav marks: circle in Mushaf, rounded square in Practice */
  markRadius: number;
  markSize: number;
  cardRadius: number;
  heroRadius: number;
}

const metricsMushaf: ThemeMetrics = {
  gutter: 24,
  markRadius: 4,
  markSize: 7,
  cardRadius: 14,
  heroRadius: 16,
};

const metricsPractice: ThemeMetrics = {
  gutter: 22,
  markRadius: 2,
  markSize: 8,
  cardRadius: 14,
  heroRadius: 18,
};

export function useThemeMetrics(): ThemeMetrics {
  const theme = useSettingsStore((s) => s.theme);
  return theme === "practice" ? metricsPractice : metricsMushaf;
}
