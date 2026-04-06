import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WordToken } from "./WordToken";
import { useSettingsStore } from "../stores/settingsStore";
import type { Ayah } from "../hooks/useQuranData";
import { useThemeColors } from "../hooks/useThemeColors";

interface AyahViewProps {
  ayah: Ayah;
  onWordPress?: (wordIndex: number, text: string) => void;
}

export function AyahView({ ayah, onWordPress }: AyahViewProps) {
  const showTranslation = useSettingsStore((s) => s.showTranslation);
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.ayahNumber}>
        <Text style={styles.ayahNumberText}>{ayah.numberInSurah}</Text>
      </View>

      <View style={styles.arabicRow}>
        {ayah.words.map((word) => (
          <WordToken
            key={word.index}
            text={word.text}
            wordIndex={word.index}
            onPress={onWordPress}
          />
        ))}
      </View>

      {showTranslation && ayah.translation && (
        <Text style={[styles.translation, { color: colors.translationText }]}>{ayah.translation}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  ayahNumber: {
    alignSelf: "flex-end",
    backgroundColor: "#2E7D32",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  ayahNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  arabicRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  translation: {
    marginTop: 12,
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
});
