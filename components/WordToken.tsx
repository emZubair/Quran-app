import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useSettingsStore } from "../stores/settingsStore";
import { useThemeColors } from "../hooks/useThemeColors";

interface WordTokenProps {
  text: string;
  wordIndex: number;
  onPress?: (wordIndex: number, text: string) => void;
}

export function WordToken({ text, wordIndex, onPress }: WordTokenProps) {
  const fontSize = useSettingsStore((s) => s.fontSize);
  const arabicFont = useSettingsStore((s) => s.arabicFont);
  const colors = useThemeColors();

  const fontFamily = arabicFont === "default" ? undefined : arabicFont;
  const lineHeight = arabicFont === "default" ? fontSize * 1.8 : fontSize * 2.2;

  return (
    <Pressable
      onPress={() => onPress?.(wordIndex, text)}
      style={({ pressed }) => [styles.word, pressed && styles.wordPressed]}
    >
      <Text style={[styles.wordText, { fontSize, color: colors.text, fontFamily, lineHeight }]}>
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  word: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  wordPressed: {
    backgroundColor: "rgba(46, 125, 50, 0.15)",
  },
  wordText: {},
});
