import { Fragment } from "react";
import { Text, View, StyleProp, TextStyle } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSettingsStore } from "../../stores/settingsStore";
import { FONTS, arabicLineHeight } from "../../lib/fonts";
import type { Ayah } from "../../hooks/useQuranData";

const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicIndic(n: number): string {
  return String(n)
    .split("")
    .map((d) => ARABIC_INDIC[Number(d)] ?? d)
    .join("");
}

/**
 * Inline ayah numeral: a ring with the Arabic-Indic number centred inside it.
 *
 * This is a real <View> nested in the text run — React Native lays inline
 * views out inside <Text> on both platforms. The U+06DD end-of-ayah marker was
 * tried first and rejected: the shaper does not compose the following digits
 * into the glyph here, so the number rendered beside the ring instead of in it.
 *
 * Geometry scales with the reader's font size so the ring keeps its proportion
 * across the whole 18–48 range rather than only at the design's 26 px.
 */
function AyahMarker({
  number,
  fontSize,
}: {
  number: number;
  fontSize: number;
}) {
  const colors = useThemeColors();
  const size = Math.round(fontSize * 0.85);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: colors.gold,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 6,
        // Nudges the ring off the baseline onto the optical centre of the run.
        transform: [{ translateY: Math.round(fontSize * 0.08) }],
      }}
    >
      <Text
        style={{
          fontFamily: FONTS.arabic,
          fontSize: Math.round(fontSize * 0.42),
          lineHeight: Math.round(fontSize * 0.62),
          color: colors.goldInk,
          textAlign: "center",
        }}
      >
        {toArabicIndic(number)}
      </Text>
    </View>
  );
}

export interface WordRef {
  ayah: number;
  word: number;
}

interface ArabicFlowProps {
  ayahs: Ayah[];
  selected: WordRef | null;
  onWordPress: (ref: WordRef) => void;
  /** Ayah numerals are inline in the continuous flow, omitted in block mode. */
  showMarkers?: boolean;
  fontSize: number;
  lineHeightMultiplier?: number;
  style?: StyleProp<TextStyle>;
}

/**
 * Renders a run of ayahs as one continuous RTL text flow, the way a printed
 * mushaf sets it. Words stay individually pressable via nested <Text> so line
 * breaking still works — a flex row of <Pressable> boxes cannot break lines.
 */
export function ArabicFlow({
  ayahs,
  selected,
  onWordPress,
  showMarkers = true,
  fontSize,
  lineHeightMultiplier,
  style,
}: ArabicFlowProps) {
  const colors = useThemeColors();
  const arabicFont = useSettingsStore((s) => s.arabicFont);
  const family = arabicFont === "AmiriQuran" ? FONTS.arabic : undefined;
  const practice = useSettingsStore((s) => s.theme) === "practice";

  const lineHeight = lineHeightMultiplier
    ? Math.round(fontSize * lineHeightMultiplier)
    : arabicLineHeight(fontSize, family ?? "");

  return (
    <Text
      style={[
        {
          fontFamily: family,
          fontSize,
          lineHeight,
          color: colors.text,
          textAlign: "right",
          writingDirection: "rtl",
        },
        style,
      ]}
    >
      {ayahs.map((ayah) => (
        <Fragment key={ayah.number}>
          {ayah.words.map((word) => {
            const isSelected =
              selected?.ayah === ayah.numberInSurah &&
              selected?.word === word.index;
            return (
              <Text
                key={word.index}
                suppressHighlighting
                onPress={() =>
                  onWordPress({ ayah: ayah.numberInSurah, word: word.index })
                }
                style={
                  isSelected
                    ? {
                        backgroundColor: colors.highlight,
                        color: practice ? colors.green : colors.text,
                      }
                    : undefined
                }
              >
                {word.text}{" "}
              </Text>
            );
          })}
          {showMarkers && (
            <Text>
              <AyahMarker number={ayah.numberInSurah} fontSize={fontSize} />
            </Text>
          )}
        </Fragment>
      ))}
    </Text>
  );
}
