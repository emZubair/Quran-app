import { View, Text, Pressable, StyleSheet } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import {
  FONTS,
  arabicLineHeight,
  overline,
  useDisplayFonts,
} from "../../lib/fonts";
import { useWordMeaning } from "../../hooks/useWordMeaning";

interface WordSheetProps {
  surah: number;
  ayah: number;
  wordIndex: number;
  arabic: string;
  onDismiss: () => void;
}

function Chip({
  label,
  color,
  background,
}: {
  label: string;
  color: string;
  background: string;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: background }]}>
      <Text style={[overline(10.5, 0), { color, textTransform: "none" }]}>
        {label}
      </Text>
    </View>
  );
}

/** Mushaf word sheet — slides up from the bottom when a word is tapped. */
export function WordSheet({
  surah,
  ayah,
  wordIndex,
  arabic,
  onDismiss,
}: WordSheetProps) {
  const colors = useThemeColors();
  const fonts = useDisplayFonts();
  const meaning = useWordMeaning(surah, ayah, wordIndex);

  return (
    <View
      style={[
        styles.sheet,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          paddingBottom: 26,
        },
      ]}
    >
      <Pressable
        onPress={onDismiss}
        hitSlop={10}
        accessibilityLabel="Dismiss word meaning"
        style={styles.handleTap}
      >
        <View style={[styles.handle, { backgroundColor: colors.lineAlt }]} />
      </Pressable>

      <View style={styles.headRow}>
        <View style={styles.headText}>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 22,
              color: colors.text,
            }}
          >
            {meaning?.gloss ?? "No meaning data yet"}
          </Text>
          {meaning ? (
            <Text
              style={{
                fontFamily: fonts.bodyItalic,
                fontSize: 12.5,
                color: colors.muted,
              }}
            >
              {meaning.transliteration}
            </Text>
          ) : (
            <Text
              style={{
                fontFamily: fonts.bodyItalic,
                fontSize: 12.5,
                color: colors.muted,
              }}
            >
              Word-by-word glosses are not bundled in this build
            </Text>
          )}
        </View>
        <Text
          style={{
            fontFamily: FONTS.arabic,
            fontSize: 28,
            lineHeight: arabicLineHeight(28, FONTS.arabic),
            color: colors.green,
          }}
        >
          {arabic}
        </Text>
      </View>

      {meaning && (
        <>
          <View style={styles.chipRow}>
            <Chip
              label={`root ${meaning.root}`}
              color={colors.goldInk}
              background={colors.goldTint}
            />
            <Chip
              label={meaning.grammar}
              color={colors.green}
              background={colors.greenTint}
            />
            <Chip
              label={`appears ${meaning.frequency}×`}
              color={colors.muted}
              background={colors.fill}
            />
          </View>

          {meaning.definition && (
            <View
              style={[styles.definition, { borderTopColor: colors.lineSoft }]}
            >
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14.5,
                  lineHeight: 14.5 * 1.55,
                  color: colors.textSecondary,
                }}
              >
                {meaning.definition}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    paddingTop: 14,
    paddingHorizontal: 24,
    gap: 14,
    shadowColor: "#1C1A16",
    shadowOpacity: 0.09,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -10 },
    elevation: 12,
  },
  handleTap: {
    alignSelf: "center",
    paddingVertical: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  headText: {
    flex: 1,
    gap: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  definition: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
});
