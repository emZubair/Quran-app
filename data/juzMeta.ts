import { SURAH_LIST } from "./quranMeta";

export interface JuzRef {
  surah: number;
  ayah: number;
}

export interface JuzMeta {
  number: number;
  /** Arabic name, taken from the juz's opening words */
  name: string;
  /** Transliterated name as shown in the UI */
  transliteration: string;
  start: JuzRef;
  end: JuzRef;
}

/**
 * The 30 juz of the standard Kufan division. Boundaries are inclusive on both
 * ends; each juz starts at the ayah immediately after the previous one ends.
 */
export const JUZ_LIST: JuzMeta[] = [
  {
    number: 1,
    name: "الم",
    transliteration: "Alif Lām Mīm",
    start: { surah: 1, ayah: 1 },
    end: { surah: 2, ayah: 141 },
  },
  {
    number: 2,
    name: "سيقول",
    transliteration: "Sayaqūl",
    start: { surah: 2, ayah: 142 },
    end: { surah: 2, ayah: 252 },
  },
  {
    number: 3,
    name: "تلك الرسل",
    transliteration: "Tilka r-Rusul",
    start: { surah: 2, ayah: 253 },
    end: { surah: 3, ayah: 92 },
  },
  {
    number: 4,
    name: "لن تنالوا",
    transliteration: "Lan Tanālū",
    start: { surah: 3, ayah: 93 },
    end: { surah: 4, ayah: 23 },
  },
  {
    number: 5,
    name: "والمحصنات",
    transliteration: "Wa-l-Muḥṣanāt",
    start: { surah: 4, ayah: 24 },
    end: { surah: 4, ayah: 147 },
  },
  {
    number: 6,
    name: "لا يحب الله",
    transliteration: "Lā Yuḥibbu-llāh",
    start: { surah: 4, ayah: 148 },
    end: { surah: 5, ayah: 81 },
  },
  {
    number: 7,
    name: "وإذا سمعوا",
    transliteration: "Wa-idhā Samiʿū",
    start: { surah: 5, ayah: 82 },
    end: { surah: 6, ayah: 110 },
  },
  {
    number: 8,
    name: "ولو أننا",
    transliteration: "Wa-law Annanā",
    start: { surah: 6, ayah: 111 },
    end: { surah: 7, ayah: 87 },
  },
  {
    number: 9,
    name: "قال الملأ",
    transliteration: "Qāla l-Mala'u",
    start: { surah: 7, ayah: 88 },
    end: { surah: 8, ayah: 40 },
  },
  {
    number: 10,
    name: "واعلموا",
    transliteration: "Wa-ʿlamū",
    start: { surah: 8, ayah: 41 },
    end: { surah: 9, ayah: 92 },
  },
  {
    number: 11,
    name: "يعتذرون",
    transliteration: "Yaʿtadhirūn",
    start: { surah: 9, ayah: 93 },
    end: { surah: 11, ayah: 5 },
  },
  {
    number: 12,
    name: "وما من دابة",
    transliteration: "Wa-mā min Dābbah",
    start: { surah: 11, ayah: 6 },
    end: { surah: 12, ayah: 52 },
  },
  {
    number: 13,
    name: "وما أبرئ",
    transliteration: "Wa-mā Ubarri'u",
    start: { surah: 12, ayah: 53 },
    end: { surah: 14, ayah: 52 },
  },
  {
    number: 14,
    name: "ربما",
    transliteration: "Rubamā",
    start: { surah: 15, ayah: 1 },
    end: { surah: 16, ayah: 128 },
  },
  {
    number: 15,
    name: "سبحان الذي",
    transliteration: "Subḥāna lladhī",
    start: { surah: 17, ayah: 1 },
    end: { surah: 18, ayah: 74 },
  },
  {
    number: 16,
    name: "قال ألم",
    transliteration: "Qāla alam",
    start: { surah: 18, ayah: 75 },
    end: { surah: 20, ayah: 135 },
  },
  {
    number: 17,
    name: "اقترب للناس",
    transliteration: "Iqtaraba li-n-Nās",
    start: { surah: 21, ayah: 1 },
    end: { surah: 22, ayah: 78 },
  },
  {
    number: 18,
    name: "قد أفلح",
    transliteration: "Qad Aflaḥa",
    start: { surah: 23, ayah: 1 },
    end: { surah: 25, ayah: 20 },
  },
  {
    number: 19,
    name: "وقال الذين",
    transliteration: "Wa-qāla lladhīna",
    start: { surah: 25, ayah: 21 },
    end: { surah: 27, ayah: 55 },
  },
  {
    number: 20,
    name: "أمن خلق",
    transliteration: "A-man Khalaqa",
    start: { surah: 27, ayah: 56 },
    end: { surah: 29, ayah: 45 },
  },
  {
    number: 21,
    name: "اتل ما أوحي",
    transliteration: "Utlu mā Ūḥiya",
    start: { surah: 29, ayah: 46 },
    end: { surah: 33, ayah: 30 },
  },
  {
    number: 22,
    name: "ومن يقنت",
    transliteration: "Wa-man Yaqnut",
    start: { surah: 33, ayah: 31 },
    end: { surah: 36, ayah: 27 },
  },
  {
    number: 23,
    name: "وما لي",
    transliteration: "Wa-mā liya",
    start: { surah: 36, ayah: 28 },
    end: { surah: 39, ayah: 31 },
  },
  {
    number: 24,
    name: "فمن أظلم",
    transliteration: "Fa-man Aẓlamu",
    start: { surah: 39, ayah: 32 },
    end: { surah: 41, ayah: 46 },
  },
  {
    number: 25,
    name: "إليه يرد",
    transliteration: "Ilayhi Yuraddu",
    start: { surah: 41, ayah: 47 },
    end: { surah: 45, ayah: 37 },
  },
  {
    number: 26,
    name: "حم",
    transliteration: "Ḥā Mīm",
    start: { surah: 46, ayah: 1 },
    end: { surah: 51, ayah: 30 },
  },
  {
    number: 27,
    name: "قال فما خطبكم",
    transliteration: "Qāla fa-mā Khaṭbukum",
    start: { surah: 51, ayah: 31 },
    end: { surah: 57, ayah: 29 },
  },
  {
    number: 28,
    name: "قد سمع الله",
    transliteration: "Qad Samiʿa llāh",
    start: { surah: 58, ayah: 1 },
    end: { surah: 66, ayah: 12 },
  },
  {
    number: 29,
    name: "تبارك الذي",
    transliteration: "Tabāraka lladhī",
    start: { surah: 67, ayah: 1 },
    end: { surah: 77, ayah: 50 },
  },
  {
    number: 30,
    name: "عم",
    transliteration: "ʿAmma",
    start: { surah: 78, ayah: 1 },
    end: { surah: 114, ayah: 6 },
  },
];

/** Running total of ayahs before each surah, for absolute ayah arithmetic. */
const AYAH_OFFSETS: number[] = (() => {
  const offsets: number[] = [0];
  for (const surah of SURAH_LIST) {
    offsets[surah.number] = offsets[surah.number - 1] + surah.numberOfAyahs;
  }
  return offsets;
})();

export const TOTAL_AYAHS = AYAH_OFFSETS[114];

/** 1-based absolute index of an ayah within the whole Quran. */
export function absoluteAyah(surah: number, ayah: number): number {
  return AYAH_OFFSETS[surah - 1] + ayah;
}

/** Inverse of `absoluteAyah` — turns a 1-based global index into surah:ayah. */
export function ayahFromAbsolute(index: number): {
  surah: number;
  ayah: number;
} {
  const clamped = Math.min(TOTAL_AYAHS, Math.max(1, index));
  for (let surah = 114; surah >= 1; surah -= 1) {
    if (clamped > AYAH_OFFSETS[surah - 1]) {
      return { surah, ayah: clamped - AYAH_OFFSETS[surah - 1] };
    }
  }
  return { surah: 1, ayah: 1 };
}

export function juzForAyah(surah: number, ayah: number): JuzMeta {
  const target = absoluteAyah(surah, ayah);
  for (let i = JUZ_LIST.length - 1; i >= 0; i -= 1) {
    const juz = JUZ_LIST[i];
    if (target >= absoluteAyah(juz.start.surah, juz.start.ayah)) return juz;
  }
  return JUZ_LIST[0];
}

function surahName(number: number): string {
  return SURAH_LIST[number - 1]?.englishName ?? `Surah ${number}`;
}

/**
 * "Al-Fatiha 1 — Al-Baqara 141", collapsing to "Al-Baqara 142 — 252" when the
 * juz sits inside a single surah.
 */
export function juzRangeLabel(juz: JuzMeta): string {
  const from = `${surahName(juz.start.surah)} ${juz.start.ayah}`;
  const to =
    juz.start.surah === juz.end.surah
      ? `${juz.end.ayah}`
      : `${surahName(juz.end.surah)} ${juz.end.ayah}`;
  return `${from} — ${to}`;
}

/**
 * How far `lastRead` has advanced through a juz, 0–1. Ayah counting is a rough
 * proxy for reading progress, but it is the only signal available offline.
 */
export function juzProgress(
  juz: JuzMeta,
  lastRead: { surah: number; ayah: number } | null,
): number {
  if (!lastRead) return 0;
  const position = absoluteAyah(lastRead.surah, lastRead.ayah);
  const start = absoluteAyah(juz.start.surah, juz.start.ayah);
  const end = absoluteAyah(juz.end.surah, juz.end.ayah);
  if (position < start) return 0;
  if (position >= end) return 1;
  return (position - start + 1) / (end - start + 1);
}
