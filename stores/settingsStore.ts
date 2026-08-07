import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ArabicFont = "AmiriQuran" | "default";
export type Theme = "mushaf" | "practice";

export const ARABIC_FONT_OPTIONS: { value: ArabicFont; label: string }[] = [
  { value: "AmiriQuran", label: "Amiri Quran" },
  { value: "default", label: "System default" },
];

export const THEME_OPTIONS: { value: Theme; label: string; hint: string }[] = [
  { value: "mushaf", label: "Mushaf", hint: "Warm paper" },
  { value: "practice", label: "Practice", hint: "Near black" },
];

/**
 * Only public-domain editions are bundled — redistribution rights are a
 * store-build constraint, see CLAUDE.md. `available: false` entries are known
 * editions we deliberately do not ship.
 */
export interface TranslationEdition {
  id: string;
  name: string;
  language: string;
  year: string;
}

export const TRANSLATION_EDITIONS: TranslationEdition[] = [
  { id: "en.pickthall", name: "Pickthall", language: "English", year: "1930" },
  { id: "en.yusufali", name: "Yusuf Ali", language: "English", year: "1934" },
  { id: "en.shakir", name: "Shakir", language: "English", year: "1982" },
];

export const DEFAULT_TRANSLATION = "en.pickthall";
export const MAX_TRANSLATIONS = 3;

export const MIN_FONT_SIZE = 18;
export const MAX_FONT_SIZE = 48;

const VALID_FONTS = ARABIC_FONT_OPTIONS.map((o) => o.value);
const VALID_EDITIONS = TRANSLATION_EDITIONS.map((e) => e.id);

function normalizeFont(value: unknown): ArabicFont {
  return VALID_FONTS.includes(value as ArabicFont)
    ? (value as ArabicFont)
    : "AmiriQuran";
}

function clampFontSize(size: number): number {
  if (!Number.isFinite(size)) return 28;
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(size)));
}

/**
 * v1 persisted `darkMode: boolean`. Migrate it to the theme pair rather than
 * dropping the user's preference on upgrade.
 */
function normalizeTheme(value: unknown, legacyDarkMode: unknown): Theme {
  if (value === "mushaf" || value === "practice") return value;
  return legacyDarkMode === true ? "practice" : "mushaf";
}

function normalizeTranslations(value: unknown): string[] {
  if (!Array.isArray(value)) return [DEFAULT_TRANSLATION];
  const kept = value
    .filter((id): id is string => typeof id === "string")
    .filter((id) => VALID_EDITIONS.includes(id))
    .slice(0, MAX_TRANSLATIONS);
  return kept.length > 0 ? kept : [DEFAULT_TRANSLATION];
}

interface SettingsState {
  fontSize: number;
  showTranslation: boolean;
  arabicFont: ArabicFont;
  theme: Theme;
  tajweed: boolean;
  wordMeanings: boolean;
  translations: string[];
  dailyGoalMinutes: number;
  reminder: string | null;

  setFontSize: (size: number) => void;
  setShowTranslation: (show: boolean) => void;
  setArabicFont: (font: ArabicFont) => void;
  setTheme: (theme: Theme) => void;
  setTajweed: (on: boolean) => void;
  setWordMeanings: (on: boolean) => void;
  toggleTranslation: (id: string) => void;
  setDailyGoalMinutes: (minutes: number) => void;
  setReminder: (reminder: string | null) => void;
  loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = "quran_settings";

export const useSettingsStore = create<SettingsState>((set, get) => ({
  fontSize: 28,
  showTranslation: true,
  arabicFont: "AmiriQuran" as ArabicFont,
  theme: "mushaf" as Theme,
  tajweed: false,
  wordMeanings: true,
  translations: [DEFAULT_TRANSLATION],
  dailyGoalMinutes: 10,
  reminder: null,

  setFontSize: (size) => {
    set({ fontSize: clampFontSize(size) });
    persistSettings(get());
  },

  setShowTranslation: (show) => {
    set({ showTranslation: show });
    persistSettings(get());
  },

  setArabicFont: (font) => {
    set({ arabicFont: font });
    persistSettings(get());
  },

  setTheme: (theme) => {
    set({ theme });
    persistSettings(get());
  },

  setTajweed: (on) => {
    set({ tajweed: on });
    persistSettings(get());
  },

  setWordMeanings: (on) => {
    set({ wordMeanings: on });
    persistSettings(get());
  },

  // At least one translation stays enabled, and no more than MAX_TRANSLATIONS.
  toggleTranslation: (id) => {
    const current = get().translations;
    let next: string[];
    if (current.includes(id)) {
      if (current.length === 1) return;
      next = current.filter((t) => t !== id);
    } else {
      if (current.length >= MAX_TRANSLATIONS) return;
      next = [...current, id];
    }
    set({ translations: next });
    persistSettings(get());
  },

  setDailyGoalMinutes: (minutes) => {
    set({ dailyGoalMinutes: Math.max(1, Math.round(minutes)) });
    persistSettings(get());
  },

  setReminder: (reminder) => {
    set({ reminder });
    persistSettings(get());
  },

  loadSettings: async () => {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!json) return;
    const saved = JSON.parse(json);
    set({
      fontSize: clampFontSize(saved.fontSize ?? 28),
      showTranslation: saved.showTranslation ?? true,
      arabicFont: normalizeFont(saved.arabicFont),
      theme: normalizeTheme(saved.theme, saved.darkMode),
      tajweed: saved.tajweed ?? false,
      wordMeanings: saved.wordMeanings ?? true,
      translations: normalizeTranslations(saved.translations),
      dailyGoalMinutes: saved.dailyGoalMinutes ?? 10,
      reminder: saved.reminder ?? null,
    });
  },
}));

function persistSettings(state: SettingsState) {
  AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      fontSize: state.fontSize,
      showTranslation: state.showTranslation,
      arabicFont: state.arabicFont,
      theme: state.theme,
      tajweed: state.tajweed,
      wordMeanings: state.wordMeanings,
      translations: state.translations,
      dailyGoalMinutes: state.dailyGoalMinutes,
      reminder: state.reminder,
    }),
  );
}
