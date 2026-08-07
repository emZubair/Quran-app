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
  onTypePress: () => void;
  onJumpPress: () => void;
}

/**
 * Replaces the native Stack header. The reader owns its chrome in the redesign
 * so the bar can carry the juz/page line and the two sheet triggers.
 */
export function ReaderBar({
  title,
  context,
  onBack,
  onTypePress,
  onJumpPress,
}: ReaderBarProps) {
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
          height: (practice ? 50 : 48) + insets.top,
          borderBottomColor: practice ? colors.line : colors.lineFaint,
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Side slots are the same width so the title stays optically centred. */}
      <Pressable
        onPress={onBack}
        hitSlop={12}
        accessibilityLabel="Back"
        style={styles.side}
      >
        <Text
          style={{
            color: colors.green,
            fontSize: practice ? 16 : 15,
            fontFamily: FONTS.sansSemiBold,
          }}
        >
          ‹
        </Text>
      </Pressable>

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
          style={[
            overline(9.5, 0.12),
            { color: practice ? colors.muted : colors.mutedSoft, marginTop: 1 },
          ]}
        >
          {context}
        </Text>
      </View>

      <View style={[styles.actions, styles.side]}>
        <Pressable
          onPress={onTypePress}
          hitSlop={12}
          accessibilityLabel="Text settings"
        >
          <Text
            style={{
              color: colors.green,
              fontSize: practice ? 14 : 15,
              fontFamily: practice ? FONTS.sansBold : fonts.display,
            }}
          >
            Aa
          </Text>
        </Pressable>
        <Pressable
          onPress={onJumpPress}
          hitSlop={12}
          accessibilityLabel="Jump to ayah, juz or page"
        >
          {practice ? (
            <View
              style={[styles.jumpSquare, { backgroundColor: colors.green }]}
            />
          ) : (
            <Text style={{ color: colors.green, fontSize: 15 }}>◇</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  centre: {
    flex: 1,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    justifyContent: "flex-end",
  },
  side: {
    minWidth: 52,
  },
  jumpSquare: {
    width: 9,
    height: 9,
  },
});
