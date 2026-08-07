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

function splitArabicIntoWords(text: string): AyahWord[] {
  return text
    .trim()
    .split(/\s+/)
    .map((word, index) => ({ index, text: word }));
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
