import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSettingsStore } from "../../stores/settingsStore";
import { FONTS, arabicLineHeight, useDisplayFonts } from "../../lib/fonts";
import { Ornament } from "../ui/Primitives";
import type { SurahMeta } from "../../data/quranMeta";

export const BISMILLAH = "بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ";

/**
 * The Bismillah is rendered as a header for every surah except 1 — where it is
 * ayah 1 of Al-Fatiha and so already in the text — and 9, which has none by
 * convention. Both rules are intentional; see CLAUDE.md.
 */
export function showsBismillah(surahNumber: number): boolean {
  return surahNumber !== 1 && surahNumber !== 9;
}

export function SurahHeader({ surah }: { surah: SurahMeta }) {
  const colors = useThemeColors();
  const fonts = useDisplayFonts();
  const arabicFont = useSettingsStore((s) => s.arabicFont);
  const practice = useSettingsStore((s) => s.theme) === "practice";

  const family = arabicFont === "AmiriQuran" ? FONTS.arabic : undefined;
  const nameSize = practice ? 30 : 34;
  const bismillahSize = practice ? 21 : 22;

  return (
    <View
      style={[
        styles.container,
        practice
          ? {
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.line,
              paddingVertical: 20,
              paddingHorizontal: 18,
            }
          : { paddingTop: 26, paddingHorizontal: 24, paddingBottom: 20 },
      ]}
    >
      {!practice && <Ornament />}

      <Text
        style={{
          fontFamily: family,
          fontSize: nameSize,
          lineHeight: arabicLineHeight(nameSize, family ?? ""),
          color: colors.text,
        }}
      >
        {surah.name}
      </Text>

      <Text
        style={
          practice
            ? { fontFamily: FONTS.sans, fontSize: 12.5, color: colors.muted }
            : {
                fontFamily: fonts.bodyItalic,
                fontSize: 14,
                color: colors.muted,
                marginTop: -8,
              }
        }
      >
        {surah.englishTranslation} · {surah.revelationType} ·{" "}
        {surah.numberOfAyahs} ayahs
      </Text>

      {showsBismillah(surah.number) && (
        <Text
          style={{
            fontFamily: family,
            fontSize: bismillahSize,
            lineHeight: arabicLineHeight(bismillahSize, family ?? ""),
            color: colors.green,
          }}
        >
          {BISMILLAH}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
  },
});
