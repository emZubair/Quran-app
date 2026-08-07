import { useState, useEffect } from "react";
import quranData from "../data/quran-data.json";

export interface AyahWord {
  index: number;
  text: string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  words: AyahWord[];
  translation?: string;
}

interface RawSurah {
  number: number;
  ayahs: {
    number: number;
    numberInSurah: number;
    text: string;
    translation: string;
  }[];
}

// quran-simple omits maddah from the disconnected opening letters. Preserve
// their marks from the Uthmani text while retaining Imlaei spelling elsewhere.
const MUQATTAAT_WITH_MADDAH: Record<string, string> = {
  "2:1": "الٓمٓ",
  "3:1": "الٓمٓ",
  "7:1": "الٓمٓصٓ",
  "10:1": "الٓر",
  "11:1": "الٓر",
  "12:1": "الٓر",
  "13:1": "الٓمٓر",
  "14:1": "الٓر",
  "15:1": "الٓر",
  "19:1": "كٓهيعٓصٓ",
  "26:1": "طسٓمٓ",
  "27:1": "طسٓ",
  "28:1": "طسٓمٓ",
  "29:1": "الٓمٓ",
  "30:1": "الٓمٓ",
  "31:1": "الٓمٓ",
  "32:1": "الٓمٓ",
  "36:1": "يسٓ",
  "38:1": "صٓ",
  "40:1": "حمٓ",
  "41:1": "حمٓ",
  "42:1": "حمٓ",
  "42:2": "عٓسٓقٓ",
  "43:1": "حمٓ",
  "44:1": "حمٓ",
  "45:1": "حمٓ",
  "46:1": "حمٓ",
  "50:1": "قٓ",
  "68:1": "نٓ",
};

function normalizeArabicText(
  text: string,
  surahNumber: number,
  ayahNumber: number,
): string {
  const markedMuqattaat = MUQATTAAT_WITH_MADDAH[`${surahNumber}:${ayahNumber}`];
  const textWithMaddah = markedMuqattaat
    ? text.replace(/^\S+/, markedMuqattaat)
    : text;

  // U+0670 already represents the standing fatha (superscript alef).
  // Some source text prefixes it with U+064E, causing both marks to render.
  return textWithMaddah.replace(/\u064E\u0670/g, "\u0670");
}

const ARABIC_LETTER = /[ؠ-يٱ-ۓ]/;
const ARABIC_DIACRITIC = /[ً-ْٰۖ-ۭ]/g;
/**
 * Proclitic particles that stand alone in the Imlaei text but are written
 * joined to the next word in Uthmani-based word-by-word data, undiacritised:
 * يا (350×), ويا (11×) and ها (4×). Counted Quran-wide — these three forms
 * never occur as standalone words in their own right, so merging is safe.
 */
const PROCLITICS = new Set(["يا", "ويا", "ها"]);

/**
 * Splits an ayah into tappable word tokens.
 *
 * Naive whitespace splitting is wrong in two ways, and both corrupt the word
 * indices that word-by-word gloss data is keyed to:
 *
 * 1. Waqf, sajda and hizb marks (ۚ ۖ ۗ ۞ …) are standalone tokens in the
 *    source text — 4,578 of them. They are not words: they rendered as
 *    tappable "words" and shifted the index of everything after them in the
 *    ayah. They are appended to the preceding word instead, so they still
 *    render (they are meaningful in a mushaf) but are neither selectable nor
 *    index-bearing.
 * 2. Proclitic particles (يا, ويا, ها) stand alone in Imlaei but are joined to
 *    the following word in Uthmani-based data (يَٰٓأَيُّهَا, هَٰٓأَنتُمْ). They merge forward.
 *
 * With both applied, token counts agree exactly with the quran.com Imlaei
 * word list across 1,730 ayahs spanning 19 surahs (27.7 % of the Quran), and
 * the Quran-wide total lands on 77,432 words. Rejoining the tokens reproduces
 * the source text exactly for all 6,236 ayahs, so nothing is dropped. That
 * alignment is what any future word-by-word gloss data depends on.
 */
function splitArabicIntoWords(text: string): AyahWord[] {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const words: string[] = [];
  // Marks that open an ayah (۞ rub-el-hizb, 199 of them) have no preceding
  // word, so they are carried forward onto the first real word instead.
  let pendingPrefix = "";
  let pendingProclitic: string | null = null;

  const push = (word: string) => {
    words.push(pendingPrefix ? `${pendingPrefix}${word}` : word);
    pendingPrefix = "";
  };

  for (const token of tokens) {
    if (!ARABIC_LETTER.test(token)) {
      if (words.length > 0 && !pendingProclitic) {
        words[words.length - 1] += ` ${token}`;
      } else {
        pendingPrefix += `${token} `;
      }
      continue;
    }

    if (PROCLITICS.has(token.replace(ARABIC_DIACRITIC, ""))) {
      if (pendingProclitic) push(pendingProclitic);
      pendingProclitic = token;
      continue;
    }

    push(pendingProclitic ? `${pendingProclitic} ${token}` : token);
    pendingProclitic = null;
  }

  if (pendingProclitic) push(pendingProclitic);
  // An ayah that is nothing but marks would otherwise drop its text.
  if (pendingPrefix) words.push(pendingPrefix.trim());

  return words.map((word, index) => ({ index, text: word }));
}

/** Single-ayah lookup for callers that do not need a whole surah loaded. */
export function getAyah(surahNumber: number, ayahNumber: number): Ayah | null {
  const surah = (quranData as Record<string, RawSurah>)[surahNumber.toString()];
  const raw = surah?.ayahs.find((a) => a.numberInSurah === ayahNumber);
  if (!raw) return null;
  const text = normalizeArabicText(raw.text, surahNumber, raw.numberInSurah);
  return {
    number: raw.number,
    numberInSurah: raw.numberInSurah,
    text,
    words: splitArabicIntoWords(text),
    translation: raw.translation,
  };
}

export function useQuranData(surahNumber: number) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const surah = (quranData as Record<string, RawSurah>)[
        surahNumber.toString()
      ];

      if (!surah) {
        setError("Surah not found");
        setLoading(false);
        return;
      }

      const merged: Ayah[] = surah.ayahs.map((a) => {
        const text = normalizeArabicText(a.text, surahNumber, a.numberInSurah);
        return {
          number: a.number,
          numberInSurah: a.numberInSurah,
          text,
          words: splitArabicIntoWords(text),
          translation: a.translation,
        };
      });

      setAyahs(merged);
    } catch (e: any) {
      setError(e.message || "Failed to load surah");
    } finally {
      setLoading(false);
    }
  }, [surahNumber]);

  return { ayahs, loading, error };
}
