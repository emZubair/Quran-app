import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import type { SurahMeta } from "../data/quranMeta";
import { useThemeColors } from "../hooks/useThemeColors";

interface SurahListItemProps {
  surah: SurahMeta;
  onPress: (surahNumber: number) => void;
}

export function SurahListItem({ surah, onPress }: SurahListItemProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => onPress(surah.number)}
      style={({ pressed }) => [
        styles.container,
        { borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.surfacePressed },
      ]}
    >
      <View
        style={[styles.numberBadge, { backgroundColor: colors.primaryLighter }]}
      >
        <Text style={[styles.numberText, { color: colors.primary }]}>
          {surah.number}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.englishName, { color: colors.text }]}>
          {surah.englishName}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {surah.englishTranslation} • {surah.numberOfAyahs} Ayahs
        </Text>
      </View>

      <View style={styles.arabicContainer}>
        <Text style={[styles.arabicName, { color: colors.primary }]}>
          {surah.name}
        </Text>
        <Text style={[styles.revelationType, { color: colors.textMuted }]}>
          {surah.revelationType}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  pressed: {
    backgroundColor: "#F5F5F5",
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  numberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  info: {
    flex: 1,
  },
  englishName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B1B1B",
  },
  meta: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  arabicContainer: {
    alignItems: "flex-end",
  },
  arabicName: {
    fontSize: 20,
    color: "#2E7D32",
  },
  revelationType: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});
