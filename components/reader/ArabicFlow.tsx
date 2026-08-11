import { Fragment } from "react";
import { Text, View, StyleProp, TextStyle } from "react-native";
import { useTajweedColors, useThemeColors } from "../../hooks/useThemeColors";
import { useSettingsStore } from "../../stores/settingsStore";
import { FONTS, arabicLineHeight } from "../../lib/fonts";
import type { TajweedColors } from "../../hooks/useThemeColors";
import type { Ayah } from "../../hooks/useQuranData";

const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const ARABIC_LETTER = /^[ء-يٱ-ۓ]$/;
const ARABIC_MARK = /^[ً-ٰٟۖ-ۭ]$/;
const TANWEEN = /[ً-ٌ]/;
const IDGHAM_LETTERS = /^[يرملون]$/;
const QALQALAH_LETTERS = /^[قطبجد]$/;

type TajweedRule = keyof TajweedColors;

interface ArabicCluster {
  text: string;
  letter: string | null;
}

interface TajweedSegment {
  text: string;
  rule?: TajweedRule;
}

/** Keep each Arabic base letter and its harakat in the same coloured run. */
function arabicClusters(text: string): ArabicCluster[] {
  const clusters: ArabicCluster[] = [];

  for (const character of Array.from(text)) {
    const previous = clusters[clusters.length - 1];
    if (ARABIC_MARK.test(character) && previous) {
      previous.text += character;
    } else {
      clusters.push({
        text: character,
        letter: ARABIC_LETTER.test(character) ? character : null,
      });
    }
  }

  return clusters;
}

function firstArabicLetter(text: string | undefined): string | null {
  if (!text) return null;
  return arabicClusters(text).find((cluster) => cluster.letter)?.letter ?? null;
}

/**
 * Derive the rules represented by our four-colour key from the marks already
 * present in the bundled Imlaei text. This intentionally avoids colouring
 * unmarked, context-dependent stopping rules that the source cannot prove.
 */
function tajweedSegments(
  text: string,
  followingText?: string,
): TajweedSegment[] {
  const clusters = arabicClusters(text);

  return clusters.map((cluster, index) => {
    if (!cluster.letter) return { text: cluster.text };

    const previous = clusters.slice(0, index).findLast((item) => item.letter);
    const remainingLetters = clusters
      .slice(index + 1)
      .filter((item) => item.letter);
    const next =
      remainingLetters[0]?.letter ?? firstArabicLetter(followingText);

    if (/^[نم]$/.test(cluster.letter) && cluster.text.includes("ّ")) {
      return { text: cluster.text, rule: "ghunnah" };
    }

    if (QALQALAH_LETTERS.test(cluster.letter) && cluster.text.includes("ْ")) {
      return { text: cluster.text, rule: "qalqalah" };
    }

    const isMadd =
      cluster.letter === "آ" ||
      cluster.text.includes("ٓ") ||
      cluster.text.includes("ٰ") ||
      ((cluster.letter === "ا" || cluster.letter === "ى") &&
        previous?.text.includes("َ")) ||
      (cluster.letter === "و" && previous?.text.includes("ُ")) ||
      (cluster.letter === "ي" && previous?.text.includes("ِ"));
    if (isMadd) return { text: cluster.text, rule: "madd" };

    const hasTanween = TANWEEN.test(cluster.text);
    if ((cluster.letter === "ن" && cluster.text.includes("ْ")) || hasTanween) {
      // Idgham crosses a word boundary. Fathatan may have one silent supporting
      // alif/alif maqsura after it, which does not count as another word letter.
      const endsWord =
        remainingLetters.length === 0 ||
        (hasTanween &&
          remainingLetters.length === 1 &&
          (next === "ا" || next === "ى"));
      const idghamNext = endsWord ? firstArabicLetter(followingText) : null;
      if (idghamNext && IDGHAM_LETTERS.test(idghamNext)) {
        return { text: cluster.text, rule: "idgham" };
      }
    }

    return { text: cluster.text };
  });
}

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
        transform: [{ translateY: -Math.round(fontSize * 0.1) }],
      }}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        allowFontScaling={false}
        style={{
          position: "absolute",
          width: size,
          height: size,
          fontFamily: FONTS.arabic,
          fontSize: Math.round(fontSize * 0.42),
          lineHeight: size,
          color: colors.goldInk,
          textAlign: "center",
          textAlignVertical: "center",
          includeFontPadding: false,
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
  const tajweedColors = useTajweedColors();
  const arabicFont = useSettingsStore((s) => s.arabicFont);
  const family = arabicFont === "AmiriQuran" ? FONTS.arabic : undefined;
  const practice = useSettingsStore((s) => s.theme) === "practice";
  const tajweed = useSettingsStore((s) => s.tajweed);

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
          {ayah.words.map((word, wordIndex) => {
            const isSelected =
              selected?.ayah === ayah.numberInSurah &&
              selected?.word === word.index;
            const segments = tajweed
              ? tajweedSegments(word.text, ayah.words[wordIndex + 1]?.text)
              : [{ text: word.text }];
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
                {segments.map((segment, segmentIndex) =>
                  segment.rule ? (
                    <Text
                      key={segmentIndex}
                      style={{ color: tajweedColors[segment.rule] }}
                    >
                      {segment.text}
                    </Text>
                  ) : (
                    segment.text
                  ),
                )}{" "}
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
