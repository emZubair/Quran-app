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

      const merged: Ayah[] = surah.ayahs.map((a) => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        text: a.text,
        words: splitArabicIntoWords(a.text),
        translation: a.translation,
      }));

      setAyahs(merged);
    } catch (e: any) {
      setError(e.message || "Failed to load surah");
    } finally {
      setLoading(false);
    }
  }, [surahNumber]);

  return { ayahs, loading, error };
}
