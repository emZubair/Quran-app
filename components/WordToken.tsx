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
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => onPress?.(wordIndex, text)}
      style={({ pressed }) => [styles.word, pressed && styles.wordPressed]}
    >
      <Text style={[styles.wordText, { fontSize, color: colors.text }]}>{text}</Text>
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
  wordText: {
    fontFamily: "System",
    color: "#1B1B1B",
    lineHeight: 50,
  },
});
