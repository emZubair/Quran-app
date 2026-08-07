/**
 * Downloads the full Quran (Arabic + English translation) from the
 * Al Quran Cloud API and saves it as a single bundled JSON file.
 *
 * The Arabic editions embed the Bismillah inside ayah 1 of every surah
 * except 1 (where it IS ayah 1) and 9 (which has none). The app renders
 * the Bismillah as a header instead, so it is stripped here.
 *
 * The default Arabic edition is "quran-simple" (Imlaei / modern standard
 * orthography: long ā written with a full alef). Pass "quran-uthmani" for
 * the traditional mushaf rasm (long ā as fatha + superscript dagger-alef).
 *
 * Usage: bun run scripts/download-quran.ts [translation-edition] [arabic-edition]
 *   e.g. bun run scripts/download-quran.ts en.pickthall quran-simple
 */

const API_BASE = "https://api.alquran.cloud/v1";
const OUTPUT_PATH = "./data/quran-data.json";
const TRANSLATION_EDITION = process.argv[2] ?? "en.pickthall";
const ARABIC_EDITION = process.argv[3] ?? "quran-simple";

const TOTAL_SURAHS = 114;
const TOTAL_AYAHS = 6236;
// Surah 1: Bismillah is ayah 1 itself. Surah 9: has no Bismillah.
const SURAHS_WITHOUT_BISMILLAH_PREFIX = new Set([1, 9]);

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

function stripBom(text: string): string {
  return text.replace(/^\uFEFF/, "");
}

async function fetchJsonWithRetry(url: string, attempts = 4): Promise<any> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      if (attempt >= attempts) throw e;
      const delayMs = 2000 * attempt;
      console.log(`  ↻ retry ${attempt} for ${url} in ${delayMs}ms`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function fetchSurah(surahNumber: number): Promise<SurahData> {
  const [arabicData, translationData] = await Promise.all([
    fetchJsonWithRetry(`${API_BASE}/surah/${surahNumber}/${ARABIC_EDITION}`),
    fetchJsonWithRetry(
      `${API_BASE}/surah/${surahNumber}/${TRANSLATION_EDITION}`,
    ),
  ]);

  if (arabicData.code !== 200 || translationData.code !== 200) {
    throw new Error(`Failed to fetch surah ${surahNumber}`);
  }

  const arabicAyahs: AyahRaw[] = arabicData.data.ayahs;
  const translationAyahs: AyahRaw[] = translationData.data.ayahs;

  if (arabicAyahs.length !== translationAyahs.length) {
    throw new Error(
      `Surah ${surahNumber}: Arabic has ${arabicAyahs.length} ayahs but translation has ${translationAyahs.length}`,
    );
  }

  return {
    number: surahNumber,
    ayahs: arabicAyahs.map((a, i) => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      text: stripBom(a.text).trim(),
      translation: stripBom(translationAyahs[i]?.text ?? "").trim(),
    })),
  };
}

/**
 * Removes the embedded Bismillah from ayah 1 of every surah that renders
 * it as a header. The canonical Bismillah string is taken from surah 1
 * ayah 1, so this stays correct even if the API's exact diacritics change.
 *
 * In surahs 95 and 97 the Bismillah's initial ب carries a shadda (U+0651)
 * because the preceding surahs end in ب (recitation liaison), so both
 * spellings are accepted.
 */
function stripEmbeddedBismillah(allSurahs: Record<string, SurahData>): number {
  const bismillah = allSurahs["1"].ayahs[0].text;
  const bismillahWithShadda = bismillah[0] + "\u0651" + bismillah.slice(1);
  let stripped = 0;

  for (let n = 2; n <= TOTAL_SURAHS; n++) {
    const firstAyah = allSurahs[n.toString()].ayahs[0];
    const prefix = [bismillah, bismillahWithShadda].find((p) =>
      firstAyah.text.startsWith(p),
    );

    if (SURAHS_WITHOUT_BISMILLAH_PREFIX.has(n)) {
      if (prefix) {
        throw new Error(`Surah ${n} unexpectedly starts with the Bismillah`);
      }
      continue;
    }

    if (!prefix) {
      throw new Error(
        `Surah ${n} ayah 1 does not start with the Bismillah — API format changed?`,
      );
    }
    firstAyah.text = firstAyah.text.slice(prefix.length).trimStart();
    if (!firstAyah.text) {
      throw new Error(`Surah ${n} ayah 1 is empty after stripping Bismillah`);
    }
    stripped++;
  }

  if (stripped !== TOTAL_SURAHS - SURAHS_WITHOUT_BISMILLAH_PREFIX.size) {
    throw new Error(`Expected 112 Bismillah strips, got ${stripped}`);
  }
  return stripped;
}

function validate(allSurahs: Record<string, SurahData>): void {
  const surahCount = Object.keys(allSurahs).length;
  if (surahCount !== TOTAL_SURAHS) {
    throw new Error(`Expected ${TOTAL_SURAHS} surahs, got ${surahCount}`);
  }

  let ayahCount = 0;
  for (const key in allSurahs) {
    for (const ayah of allSurahs[key].ayahs) {
      ayahCount++;
      if (!ayah.text) throw new Error(`Empty text in surah ${key}`);
      if (!ayah.translation) {
        throw new Error(
          `Empty translation in surah ${key} ayah ${ayah.numberInSurah}`,
        );
      }
      if (/\uFEFF/.test(ayah.text) || /\uFEFF/.test(ayah.translation)) {
        throw new Error(`BOM found in surah ${key} ayah ${ayah.numberInSurah}`);
      }
    }
  }
  if (ayahCount !== TOTAL_AYAHS) {
    throw new Error(`Expected ${TOTAL_AYAHS} ayahs, got ${ayahCount}`);
  }
}

async function main() {
  console.log(`Arabic edition:      ${ARABIC_EDITION}`);
  console.log(`Translation edition: ${TRANSLATION_EDITION}\n`);
  const allSurahs: Record<string, SurahData> = {};

  // Fetch one at a time with delay to avoid rate limiting
  for (let i = 1; i <= TOTAL_SURAHS; i++) {
    const surah = await fetchSurah(i);
    allSurahs[surah.number.toString()] = surah;
    console.log(`✓ Surah ${surah.number} — ${surah.ayahs.length} ayahs`);
    await new Promise((r) => setTimeout(r, 300));
  }

  const stripped = stripEmbeddedBismillah(allSurahs);
  validate(allSurahs);

  const json = JSON.stringify(allSurahs);
  await Bun.write(OUTPUT_PATH, json);

  const sizeMB = (new TextEncoder().encode(json).length / 1024 / 1024).toFixed(
    2,
  );
  console.log(
    `\n✅ Saved ${OUTPUT_PATH} (${sizeMB} MB) — ${TOTAL_SURAHS} surahs, ${TOTAL_AYAHS} ayahs, ${stripped} Bismillah prefixes stripped`,
  );
}

main().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});
