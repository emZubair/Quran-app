import { View, Text, Pressable, StyleSheet } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSettingsStore } from "../../stores/settingsStore";
import { FONTS, arabicLineHeight, overline } from "../../lib/fonts";
import { useWordMeaning } from "../../hooks/useWordMeaning";
import { ArabicFlow, WordRef } from "./ArabicFlow";
import type { Ayah } from "../../hooks/useQuranData";

interface AyahBlockProps {
  surah: number;
  ayah: Ayah;
  selected: WordRef | null;
  onWordPress: (ref: WordRef) => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
}

function ActionButton({
  kind,
  active,
  onPress,
  label,
}: {
  kind: "bookmark" | "share";
  active: boolean;
  onPress: () => void;
  label: string;
}) {
  const colors = useThemeColors();
  const buttonBackground = active ? colors.greenTint : "transparent";
  const iconColor = active ? colors.green : colors.muted;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={
        kind === "bookmark" ? { selected: active } : undefined
      }
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: buttonBackground,
          borderColor: active ? colors.greenSoft : colors.lineAlt,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      {kind === "bookmark" ? (
        <View
          style={[
            styles.bookmarkIcon,
            {
              backgroundColor: active ? iconColor : "transparent",
              borderColor: iconColor,
            },
          ]}
        >
          <View
            style={[
              styles.bookmarkNotch,
              {
                backgroundColor: buttonBackground,
                borderColor: iconColor,
              },
            ]}
          />
        </View>
      ) : (
        <View style={styles.shareIcon}>
          <View style={[styles.shareBox, { borderColor: iconColor }]} />
          <View style={[styles.shareShaft, { backgroundColor: iconColor }]} />
          <View style={[styles.shareArrow, { borderColor: iconColor }]} />
        </View>
      )}
    </Pressable>
  );
}

/** Inline word card, injected beneath the Arabic of the ayah it belongs to. */
function WordCard({
  surah,
  ayah,
  wordIndex,
  arabic,
}: {
  surah: number;
  ayah: number;
  wordIndex: number;
  arabic: string;
}) {
  const colors = useThemeColors();
  const meaning = useWordMeaning(surah, ayah, wordIndex);

  return (
    <View
      style={[
        styles.wordCard,
        { backgroundColor: colors.surface, borderColor: colors.line },
      ]}
    >
      <Text
        style={{
          fontFamily: FONTS.arabic,
          fontSize: 22,
          lineHeight: arabicLineHeight(22, FONTS.arabic),
          color: colors.green,
        }}
      >
        {arabic}
      </Text>
      <View style={styles.wordCardText}>
        <Text
          style={{
            fontFamily: FONTS.sansBold,
            fontSize: 14,
            color: colors.text,
          }}
        >
          {meaning?.gloss ?? "No meaning data yet"}
        </Text>
        <Text
          style={{
            fontFamily: FONTS.sans,
            fontSize: 11.5,
            color: colors.muted,
          }}
        >
          {meaning
            ? `${meaning.transliteration} · root ${meaning.root} · ${meaning.frequency} occurrences`
            : "Word-by-word glosses are not bundled in this build"}
        </Text>
      </View>
    </View>
  );
}

export function AyahBlock({
  surah,
  ayah,
  selected,
  onWordPress,
  bookmarked,
  onToggleBookmark,
  onShare,
}: AyahBlockProps) {
  const colors = useThemeColors();
  const fontSize = useSettingsStore((s) => s.fontSize);
  const showTranslation = useSettingsStore((s) => s.showTranslation);

  const selectedHere = selected?.ayah === ayah.numberInSurah ? selected : null;
  const arabicSize = Math.round(fontSize * 0.96);

  return (
    <View style={[styles.block, { borderBottomColor: colors.line }]}>
      <View style={styles.headRow}>
        <View style={[styles.refTag, { backgroundColor: colors.surfaceAlt }]}>
          <Text
            style={[
              overline(10, 0),
              { color: colors.green, textTransform: "none" },
            ]}
          >
            {surah}:{ayah.numberInSurah}
          </Text>
        </View>
        <View style={styles.actions}>
          <ActionButton
            kind="bookmark"
            active={bookmarked}
            onPress={onToggleBookmark}
            label={bookmarked ? "Remove bookmark" : "Bookmark ayah"}
          />
          <ActionButton
            kind="share"
            active={false}
            onPress={onShare}
            label="Share ayah"
          />
        </View>
      </View>

      <ArabicFlow
        ayahs={[ayah]}
        selected={selected}
        onWordPress={onWordPress}
        showMarkers={false}
        fontSize={arabicSize}
        lineHeightMultiplier={2.3}
      />

      {selectedHere && (
        <WordCard
          surah={surah}
          ayah={ayah.numberInSurah}
          wordIndex={selectedHere.word}
          arabic={ayah.words[selectedHere.word]?.text ?? ""}
        />
      )}

      {showTranslation && ayah.translation && (
        <Text
          style={{
            fontFamily: FONTS.sans,
            fontSize: 14.5,
            lineHeight: 14.5 * 1.55,
            color: colors.textSecondary,
          }}
        >
          {ayah.translation}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    padding: 18,
    borderBottomWidth: 1,
    gap: 12,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  refTag: {
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkIcon: {
    width: 13,
    height: 17,
    borderWidth: 1.5,
    borderRadius: 2,
    overflow: "hidden",
  },
  bookmarkNotch: {
    position: "absolute",
    width: 8,
    height: 8,
    bottom: -5,
    left: 1,
    borderWidth: 1.5,
    transform: [{ rotate: "45deg" }],
  },
  shareIcon: {
    width: 18,
    height: 18,
  },
  shareBox: {
    position: "absolute",
    width: 13,
    height: 12,
    left: 1,
    bottom: 1,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  shareShaft: {
    position: "absolute",
    width: 11,
    height: 1.5,
    right: 0,
    top: 5,
    transform: [{ rotate: "-45deg" }],
  },
  shareArrow: {
    position: "absolute",
    width: 7,
    height: 7,
    right: 0,
    top: 0,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
  },
  wordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  wordCardText: {
    flex: 1,
    gap: 2,
  },
});
