import { useSettingsStore } from "../stores/settingsStore";

export interface ThemeColors {
  background: string;
  surface: string;
  surfacePressed: string;
  primary: string;
  primaryLight: string;
  primaryLighter: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  searchBg: string;
  translationText: string;
}

const lightColors: ThemeColors = {
  background: "#fff",
  surface: "#fff",
  surfacePressed: "#F5F5F5",
  primary: "#2E7D32",
  primaryLight: "#C8E6C9",
  primaryLighter: "#E8F5E9",
  text: "#1B1B1B",
  textSecondary: "#555",
  textMuted: "#888",
  border: "#E0E0E0",
  searchBg: "#F5F5F5",
  translationText: "#555",
};

const darkColors: ThemeColors = {
  background: "#121212",
  surface: "#1E1E1E",
  surfacePressed: "#2A2A2A",
  primary: "#4CAF50",
  primaryLight: "#1B3A1D",
  primaryLighter: "#1A2E1A",
  text: "#E8E8E8",
  textSecondary: "#B0B0B0",
  textMuted: "#888",
  border: "#333",
  searchBg: "#2A2A2A",
  translationText: "#A0A0A0",
};

export function useThemeColors(): ThemeColors {
  const darkMode = useSettingsStore((s) => s.darkMode);
  return darkMode ? darkColors : lightColors;
}
