import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSettingsStore } from "../../stores/settingsStore";
import { FONTS, overline, useDisplayFonts } from "../../lib/fonts";

interface ReaderBarProps {
  title: string;
  /** e.g. "JUZ 1 · PAGE 4" */
  context: string;
  onBack: () => void;
}

function BackButton({ onPress }: { onPress: () => void }) {
  const colors = useThemeColors();
  const practice = useSettingsStore((s) => s.theme) === "practice";

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel="Back"
      style={({ pressed }) => [
        styles.headerButton,
        {
          backgroundColor: practice ? colors.surface : "transparent",
          borderColor: colors.lineAlt,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.backIcon}>
        <View style={[styles.backShaft, { backgroundColor: colors.green }]} />
        <View style={[styles.backHeadTop, { backgroundColor: colors.green }]} />
        <View
          style={[styles.backHeadBottom, { backgroundColor: colors.green }]}
        />
      </View>
    </Pressable>
  );
}

/**
 * Replaces the native Stack header. The reader owns its chrome in the redesign
 * so the bar can carry the current surah and juz/page context.
 */
export function ReaderBar({ title, context, onBack }: ReaderBarProps) {
  const colors = useThemeColors();
  const fonts = useDisplayFonts();
  const insets = useSafeAreaInsets();
  const practice = useSettingsStore((s) => s.theme) === "practice";

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: insets.top,
          height: (practice ? 60 : 58) + insets.top,
          borderBottomColor: practice ? colors.line : colors.lineFaint,
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Side slots are the same width so the title stays optically centred. */}
      <View style={styles.sideLeft}>
        <BackButton onPress={onBack} />
      </View>

      <View style={styles.centre}>
        <Text
          numberOfLines={1}
          style={{
            color: colors.text,
            fontSize: practice ? 14.5 : 16,
            fontFamily: practice ? FONTS.sansBold : fonts.display,
          }}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            overline(9.5, 0.12),
            { color: practice ? colors.muted : colors.mutedSoft, marginTop: 1 },
          ]}
        >
          {context}
        </Text>
      </View>

      <View style={styles.sideRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  centre: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  sideLeft: {
    width: 36,
    alignItems: "flex-start",
  },
  sideRight: {
    width: 36,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 18,
    height: 16,
  },
  backShaft: {
    position: "absolute",
    width: 15,
    height: 1.8,
    left: 2,
    top: 7,
    borderRadius: 1,
  },
  backHeadTop: {
    position: "absolute",
    width: 9,
    height: 1.8,
    left: 0,
    top: 4,
    borderRadius: 1,
    transform: [{ rotate: "-45deg" }],
  },
  backHeadBottom: {
    position: "absolute",
    width: 9,
    height: 1.8,
    left: 0,
    bottom: 4,
    borderRadius: 1,
    transform: [{ rotate: "45deg" }],
  },
});
