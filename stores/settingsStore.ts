import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsState {
  fontSize: number;
  showTranslation: boolean;
  translationLanguage: string;
  darkMode: boolean;
  setFontSize: (size: number) => void;
  setShowTranslation: (show: boolean) => void;
  setTranslationLanguage: (lang: string) => void;
  setDarkMode: (dark: boolean) => void;
  loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = "quran_settings";

export const useSettingsStore = create<SettingsState>((set, get) => ({
  fontSize: 28,
  showTranslation: true,
  translationLanguage: "en",
  darkMode: false,

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

  loadSettings: async () => {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      const { fontSize, showTranslation, translationLanguage, darkMode } =
        JSON.parse(json);
      set({ fontSize, showTranslation, translationLanguage, darkMode: darkMode ?? false });
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
    })
  );
}
