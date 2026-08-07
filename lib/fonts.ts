import { Platform } from "react-native";
import { useSettingsStore } from "../stores/settingsStore";

/**
 * Font family keys as registered with expo-font in app/_layout.tsx.
 *
 * React Native does not synthesise weights from a family name the way CSS
 * does, so every weight is its own bundled face and its own key. Never set
 * `fontWeight` alongside these — pick the face instead.
 */
export const FONTS = {
  arabic: "AmiriQuran",

  serif: "Newsreader",
  serifSemiBold: "Newsreader-SemiBold",
  serifItalic: "Newsreader-Italic",

  sans: "PlusJakartaSans",
  sansMedium: "PlusJakartaSans-Medium",
  sansSemiBold: "PlusJakartaSans-SemiBold",
  sansBold: "PlusJakartaSans-Bold",
  sansExtraBold: "PlusJakartaSans-ExtraBold",
} as const;

export const FONT_ASSETS = {
  [FONTS.arabic]: require("../assets/fonts/AmiriQuran-Regular.ttf"),
  [FONTS.serif]: require("../assets/fonts/Newsreader-Regular.ttf"),
  [FONTS.serifSemiBold]: require("../assets/fonts/Newsreader-SemiBold.ttf"),
  [FONTS.serifItalic]: require("../assets/fonts/Newsreader-Italic.ttf"),
  [FONTS.sans]: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
  [FONTS.sansMedium]: require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
  [FONTS.sansSemiBold]: require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  [FONTS.sansBold]: require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
  [FONTS.sansExtraBold]: require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
};

/** Amiri stacks tall vowel marks; system Arabic does not. See CLAUDE.md. */
export function arabicLineHeight(fontSize: number, font: string): number {
  return Math.round(fontSize * (font === FONTS.arabic ? 2.0 : 1.8));
}

export interface DisplayFonts {
  /** headings and display type */
  display: string;
  displayStrong: string;
  /** body copy — translations, definitions */
  body: string;
  bodyItalic: string;
}

/**
 * Mushaf sets display and body in Newsreader; Practice uses Plus Jakarta Sans
 * for display and keeps the serif only for the Arabic. UI labels are Plus
 * Jakarta Sans in both themes, so they use FONTS.sans* directly.
 */
const mushafFonts: DisplayFonts = {
  display: FONTS.serif,
  displayStrong: FONTS.serifSemiBold,
  body: FONTS.serif,
  bodyItalic: FONTS.serifItalic,
};

const practiceFonts: DisplayFonts = {
  display: FONTS.sansBold,
  displayStrong: FONTS.sansExtraBold,
  body: FONTS.sans,
  bodyItalic: FONTS.sans,
};

export function useDisplayFonts(): DisplayFonts {
  const theme = useSettingsStore((s) => s.theme);
  return theme === "practice" ? practiceFonts : mushafFonts;
}

/** Overlines and numeric meta are monospace in both themes. */
export const MONO_FAMILY = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

/**
 * Overline style at a given size. The design specifies tracking in em
 * (.10–.16); RN wants absolute points, so it is resolved against the size.
 */
export function overline(fontSize: number, em = 0.16) {
  return {
    fontFamily: MONO_FAMILY,
    fontSize,
    letterSpacing: fontSize * em,
    textTransform: "uppercase" as const,
  };
}
