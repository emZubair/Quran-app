export interface WordMeaning {
  /** English gloss, e.g. "the God-fearing" */
  gloss: string;
  /** e.g. "li-l-muttaqīn" */
  transliteration: string;
  /** triliteral root, spaced, e.g. "و ق ي" */
  root: string;
  /** e.g. "noun · genitive" */
  grammar: string;
  /** occurrences across the Quran */
  frequency: number;
  /** longer definition shown in the Mushaf sheet */
  definition?: string;
}

/**
 * Word-by-word gloss lookup.
 *
 * The dataset is not bundled yet — sourcing one with a licence compatible with
 * a closed-source store build is still open (the obvious candidate, the
 * Quranic Arabic Corpus, is GPL). The UI is built against this hook and
 * renders an empty state until it returns data, so adding the data later is a
 * drop-in change with no screen rework and no bundle cost today.
 */
export function useWordMeaning(
  _surah: number,
  _ayah: number,
  _wordIndex: number,
): WordMeaning | null {
  return null;
}
