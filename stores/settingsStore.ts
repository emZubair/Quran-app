import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ArabicFont = "default" | "IndopakNastaleeq";

export const ARABIC_FONT_OPTIONS: { value: ArabicFont; label: string }[] = [
  { value: "default", label: "Default (Uthmani)" },
  { value: "IndopakNastaleeq", label: "IndoPak Nastaleeq" },
];

interface SettingsState {
  fontSize: number;
  showTranslation: boolean;
  translationLanguage: string;
  darkMode: boolean;
  arabicFont: ArabicFont;
  setFontSize: (size: number) => void;
  setShowTranslation: (show: boolean) => void;
  setTranslationLanguage: (lang: string) => void;
  setDarkMode: (dark: boolean) => void;
  setArabicFont: (font: ArabicFont) => void;
  loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = "quran_settings";

export const useSettingsStore = create<SettingsState>((set, get) => ({
  fontSize: 28,
  showTranslation: true,
  translationLanguage: "en",
  darkMode: false,
  arabicFont: "default" as ArabicFont,

  setFontSize: (size) => {
    set({ fontSize: size });
    persistSettings(get());
  },

  setShowTranslation: (show) => {
    set({ showTranslation: show });
    persistSettings(get());
  },

  setTranslationLanguage: (lang) => {
    set({ translationLanguage: lang });
    persistSettings(get());
  },

  setDarkMode: (dark) => {
    set({ darkMode: dark });
    persistSettings(get());
  },

  setArabicFont: (font) => {
    set({ arabicFont: font });
    persistSettings(get());
  },

  loadSettings: async () => {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      const { fontSize, showTranslation, translationLanguage, darkMode, arabicFont } =
        JSON.parse(json);
      set({
        fontSize,
        showTranslation,
        translationLanguage,
        darkMode: darkMode ?? false,
        arabicFont: arabicFont ?? "default",
      });
    }
  },
}));

function persistSettings(state: SettingsState) {
  AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      fontSize: state.fontSize,
      showTranslation: state.showTranslation,
      translationLanguage: state.translationLanguage,
      darkMode: state.darkMode,
      arabicFont: state.arabicFont,
    })
  );
}
