import { useState, useEffect } from "react";

const API_BASE = "https://api.alquran.cloud/v1";

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

function splitArabicIntoWords(text: string): AyahWord[] {
  return text
    .trim()
    .split(/\s+/)
    .map((word, index) => ({ index, text: word }));
}

export function useQuranData(surahNumber: number, translationEdition = "en.asad") {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchSurah() {
      try {
        const [arabicRes, translationRes] = await Promise.all([
          fetch(`${API_BASE}/surah/${surahNumber}/quran-uthmani`),
          fetch(`${API_BASE}/surah/${surahNumber}/${translationEdition}`),
        ]);

        const arabicData = await arabicRes.json();
        const translationData = await translationRes.json();

        if (cancelled) return;

        if (arabicData.code !== 200 || translationData.code !== 200) {
          setError("Failed to fetch surah data");
          return;
        }

        const arabicAyahs = arabicData.data.ayahs;
        const translationAyahs = translationData.data.ayahs;

        const merged: Ayah[] = arabicAyahs.map((a: any, i: number) => ({
          number: a.number,
          numberInSurah: a.numberInSurah,
          text: a.text,
          words: splitArabicIntoWords(a.text),
          translation: translationAyahs[i]?.text,
        }));

        setAyahs(merged);
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || "Network error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSurah();
    return () => {
      cancelled = true;
    };
  }, [surahNumber, translationEdition]);

  return { ayahs, loading, error };
}
