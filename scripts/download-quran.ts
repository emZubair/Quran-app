/**
 * Downloads the full Quran (Arabic + English translation) from the
 * Al Quran Cloud API and saves it as a single bundled JSON file.
 *
 * Usage: bun run scripts/download-quran.ts
 */

const API_BASE = "https://api.alquran.cloud/v1";
const OUTPUT_PATH = "./data/quran-data.json";

interface AyahRaw {
  number: number;
  numberInSurah: number;
  text: string;
}

interface SurahData {
  number: number;
  ayahs: {
    number: number;
    numberInSurah: number;
    text: string;
    translation: string;
  }[];
}

async function fetchSurah(surahNumber: number): Promise<SurahData> {
  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${API_BASE}/surah/${surahNumber}/quran-uthmani`),
    fetch(`${API_BASE}/surah/${surahNumber}/en.asad`),
  ]);

  const arabicData = await arabicRes.json();
  const translationData = await translationRes.json();

  if (arabicData.code !== 200 || translationData.code !== 200) {
    throw new Error(`Failed to fetch surah ${surahNumber}`);
  }

  const arabicAyahs: AyahRaw[] = arabicData.data.ayahs;
  const translationAyahs: AyahRaw[] = translationData.data.ayahs;

  return {
    number: surahNumber,
    ayahs: arabicAyahs.map((a, i) => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      text: a.text,
      translation: translationAyahs[i]?.text ?? "",
    })),
  };
}

async function main() {
  const allSurahs: Record<string, SurahData> = {};

  // Fetch one at a time with delay to avoid rate limiting
  for (let i = 1; i <= 114; i++) {
    const surah = await fetchSurah(i);
    allSurahs[surah.number.toString()] = surah;
    console.log(`✓ Surah ${surah.number} — ${surah.ayahs.length} ayahs`);
    await new Promise((r) => setTimeout(r, 300));
  }

  const json = JSON.stringify(allSurahs);
  await Bun.write(OUTPUT_PATH, json);

  const sizeMB = (new TextEncoder().encode(json).length / 1024 / 1024).toFixed(
    2,
  );
  console.log(
    `\n✅ Saved ${OUTPUT_PATH} (${sizeMB} MB) — 114 surahs, 6236 ayahs`,
  );
}

main().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});
