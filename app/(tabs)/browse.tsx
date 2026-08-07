import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SURAH_LIST, type SurahMeta } from "../../data/quranMeta";
import {
  JUZ_LIST,
  juzProgress,
  juzRangeLabel,
  type JuzMeta,
} from "../../data/juzMeta";
import { PAGE_STARTS } from "../../data/pageMeta";
import { useBookmarkStore, type Bookmark } from "../../stores/bookmarkStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useThemeColors, useThemeMetrics } from "../../hooks/useThemeColors";
import { FONTS, arabicLineHeight, useDisplayFonts } from "../../lib/fonts";
import { ProgressBar } from "../../components/ui/Primitives";

type MushafTab = "juz" | "surah" | "bookmarks";
type PracticeTab = "surah" | "juz" | "page" | "saved";
type Filter = "all" | "Meccan" | "Medinan" | "short";

const SHORT_SURAH_MAX_AYAHS = 20;

/** "2:255" or "2 255" jumps straight to that ayah. */
function parseReference(query: string): { surah: number; ayah: number } | null {
  const match = query.trim().match(/^(\d{1,3})\s*[:\s]\s*(\d{1,3})$/);
  if (!match) return null;
  const surah = Number(match[1]);
  const ayah = Number(match[2]);
  const meta = SURAH_LIST[surah - 1];
  if (!meta || ayah < 1 || ayah > meta.numberOfAyahs) return null;
  return { surah, ayah };
}

export default function BrowseScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const metrics = useThemeMetrics();
  const fonts = useDisplayFonts();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const practice = useSettingsStore((s) => s.theme) === "practice";
  const arabicFont = useSettingsStore((s) => s.arabicFont);
  const lastRead = useBookmarkStore((s) => s.lastRead);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);

  const [query, setQuery] = useState("");
  const [mushafTab, setMushafTab] = useState<MushafTab>("juz");
  const [practiceTab, setPracticeTab] = useState<PracticeTab>("surah");
  const [filter, setFilter] = useState<Filter>("all");

  const family = arabicFont === "AmiriQuran" ? FONTS.arabic : undefined;
  const gutter = metrics.gutter;
  const sidePadding = width > 768 ? Math.round(width * 0.08) : 0;
  const tab: string = practice ? practiceTab : mushafTab;

  const reference = parseReference(query);

  const surahs = useMemo(() => {
    const term = query.trim().toLowerCase();
    return SURAH_LIST.filter((s) => {
      if (filter === "Meccan" || filter === "Medinan") {
        if (s.revelationType !== filter) return false;
      }
      if (filter === "short" && s.numberOfAyahs > SHORT_SURAH_MAX_AYAHS) {
        return false;
      }
      if (!term) return true;
      return (
        s.englishName.toLowerCase().includes(term) ||
        s.englishTranslation.toLowerCase().includes(term) ||
        s.name.includes(query.trim()) ||
        String(s.number) === term
      );
    });
  }, [query, filter]);

  const juzs = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return JUZ_LIST;
    return JUZ_LIST.filter(
      (j) =>
        j.transliteration.toLowerCase().includes(term) ||
        String(j.number) === term,
    );
  }, [query]);

  const savedRows = useMemo(
    () => [...bookmarks].sort((a, b) => b.timestamp - a.timestamp),
    [bookmarks],
  );

  function open(surah: number, ayah = 1) {
    router.push(`/surah/${surah}?ayah=${ayah}`);
  }

  // ---- rows -------------------------------------------------------------

  function SurahRow({ item }: { item: SurahMeta }) {
    const isReading = lastRead?.surah === item.number;
    const highlighted = practice && isReading;
    return (
      <Pressable
        onPress={() => open(item.number, isReading ? lastRead!.ayah : 1)}
        style={[
          practice ? styles.rowPractice : styles.rowMushaf,
          { borderBottomColor: practice ? colors.lineFaint : colors.lineSoft },
          highlighted && {
            backgroundColor: colors.surface,
            borderRadius: 10,
            marginHorizontal: -12,
            paddingHorizontal: 12,
            borderBottomColor: "transparent",
          },
        ]}
      >
        <View
          style={[
            practice ? styles.indexSquare : styles.indexCircle,
            {
              backgroundColor: highlighted
                ? colors.green
                : practice
                  ? colors.surfaceAlt
                  : "transparent",
              borderColor: practice ? colors.lineAlt : colors.lineAlt,
              borderWidth: highlighted ? 0 : 1,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: practice ? FONTS.sansBold : fonts.display,
              fontSize: practice ? 13 : 16,
              color: highlighted
                ? colors.onGreen
                : practice
                  ? colors.green
                  : colors.textSecondary,
            }}
          >
            {item.number}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontFamily: practice ? FONTS.sansBold : fonts.display,
              fontSize: practice ? 15 : 17,
              color: colors.text,
            }}
          >
            {item.englishName}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.sans,
              fontSize: practice ? 11.5 : 12,
              color: highlighted ? colors.green : colors.mutedSoft,
            }}
          >
            {highlighted
              ? `Reading · ayah ${lastRead!.ayah} of ${item.numberOfAyahs}`
              : `${item.englishTranslation} · ${item.numberOfAyahs} · ${item.revelationType}`}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: family,
            fontSize: practice ? 20 : 20,
            lineHeight: arabicLineHeight(20, family ?? ""),
            color: practice ? colors.textSecondary : colors.text,
          }}
        >
          {item.name}
        </Text>
      </Pressable>
    );
  }

  function JuzRow({ item }: { item: JuzMeta }) {
    const progress = juzProgress(item, lastRead);
    const started = progress > 0;
    return (
      <Pressable
        onPress={() => open(item.start.surah, item.start.ayah)}
        style={[
          practice ? styles.rowPractice : styles.rowMushaf,
          { borderBottomColor: practice ? colors.lineFaint : colors.lineSoft },
        ]}
      >
        <View
          style={[
            practice ? styles.indexSquare : styles.indexCircle,
            {
              backgroundColor: started
                ? colors.green
                : practice
                  ? colors.surfaceAlt
                  : "transparent",
              borderColor: colors.lineAlt,
              borderWidth: started ? 0 : 1,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: practice ? FONTS.sansBold : fonts.display,
              fontSize: practice ? 13 : 16,
              color: started
                ? colors.onGreen
                : practice
                  ? colors.green
                  : colors.textSecondary,
            }}
          >
            {item.number}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontFamily: practice ? FONTS.sansBold : fonts.display,
              fontSize: practice ? 15 : 17,
              color: colors.text,
            }}
          >
            {item.transliteration}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.sans,
              fontSize: practice ? 11.5 : 12,
              color: colors.mutedSoft,
            }}
          >
            {juzRangeLabel(item)}
          </Text>
        </View>

        {started ? (
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text
              style={{
                fontFamily: FONTS.sansSemiBold,
                fontSize: 11,
                color: colors.green,
              }}
            >
              {Math.round(progress * 100)}%
            </Text>
            <ProgressBar progress={progress} width={44} height={3} />
          </View>
        ) : (
          <Text style={{ color: colors.mutedFaint, fontSize: 14 }}>—</Text>
        )}
      </Pressable>
    );
  }

  function PageRow({
    item,
  }: {
    item: { page: number; surah: number; ayah: number };
  }) {
    const meta = SURAH_LIST[item.surah - 1];
    return (
      <Pressable
        onPress={() => open(item.surah, item.ayah)}
        style={[
          practice ? styles.rowPractice : styles.rowMushaf,
          { borderBottomColor: practice ? colors.lineFaint : colors.lineSoft },
        ]}
      >
        <View
          style={[
            practice ? styles.indexSquare : styles.indexCircle,
            {
              backgroundColor: practice ? colors.surfaceAlt : "transparent",
              borderColor: colors.lineAlt,
              borderWidth: practice ? 1 : 1,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: practice ? FONTS.sansBold : fonts.display,
              fontSize: practice ? 12 : 15,
              color: practice ? colors.green : colors.textSecondary,
            }}
          >
            {item.page}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontFamily: practice ? FONTS.sansBold : fonts.display,
              fontSize: practice ? 15 : 17,
              color: colors.text,
            }}
          >
            Page {item.page}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.sans,
              fontSize: practice ? 11.5 : 12,
              color: colors.mutedSoft,
            }}
          >
            Starts at {meta.englishName} {item.ayah}
          </Text>
        </View>
      </Pressable>
    );
  }

  function BookmarkRow({ item }: { item: Bookmark }) {
    const meta = SURAH_LIST[item.surahNumber - 1];
    return (
      <Pressable
        onPress={() => open(item.surahNumber, item.ayahNumber)}
        onLongPress={() => removeBookmark(item.surahNumber, item.ayahNumber)}
        style={[
          practice ? styles.rowPractice : styles.rowMushaf,
          { borderBottomColor: practice ? colors.lineFaint : colors.lineSoft },
        ]}
      >
        <View
          style={[
            practice ? styles.indexSquare : styles.indexCircle,
            {
              backgroundColor: practice ? colors.surfaceAlt : "transparent",
              borderColor: colors.lineAlt,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: practice ? FONTS.sansBold : fonts.display,
              fontSize: practice ? 13 : 16,
              color: practice ? colors.green : colors.textSecondary,
            }}
          >
            {item.surahNumber}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontFamily: practice ? FONTS.sansBold : fonts.display,
              fontSize: practice ? 15 : 17,
              color: colors.text,
            }}
          >
            {item.surahName || meta?.englishName}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.sans,
              fontSize: practice ? 11.5 : 12,
              color: colors.mutedSoft,
            }}
          >
            Ayah {item.ayahNumber} · long-press to remove
          </Text>
        </View>
        <Text
          style={{
            fontFamily: family,
            fontSize: 20,
            lineHeight: arabicLineHeight(20, family ?? ""),
            color: practice ? colors.textSecondary : colors.text,
          }}
        >
          {meta?.name}
        </Text>
      </Pressable>
    );
  }

  // ---- data for the active tab -----------------------------------------

  const pageRows = useMemo(
    () =>
      PAGE_STARTS.map(([surah, ayah], i) => ({
        page: i + 1,
        surah,
        ayah,
      })).filter((row) => {
        const term = query.trim();
        return !term || String(row.page).startsWith(term);
      }),
    [query],
  );

  function renderList() {
    if (reference) {
      const meta = SURAH_LIST[reference.surah - 1];
      return (
        <Pressable
          onPress={() => open(reference.surah, reference.ayah)}
          style={[styles.rowPractice, { borderBottomColor: "transparent" }]}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              style={{
                fontFamily: practice ? FONTS.sansBold : fonts.display,
                fontSize: practice ? 15 : 17,
                color: colors.green,
              }}
            >
              Go to {meta.englishName} {reference.ayah}
            </Text>
            <Text
              style={{
                fontFamily: FONTS.sans,
                fontSize: 11.5,
                color: colors.mutedSoft,
              }}
            >
              {reference.surah}:{reference.ayah}
            </Text>
          </View>
        </Pressable>
      );
    }

    const empty = (message: string) => (
      <Text
        style={{
          fontFamily: FONTS.sans,
          fontSize: 13,
          color: colors.mutedSoft,
          paddingVertical: 28,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
    );

    if (tab === "juz") {
      return (
        <FlatList
          data={juzs}
          keyExtractor={(j) => String(j.number)}
          renderItem={JuzRow}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={empty("No juz match that search.")}
        />
      );
    }
    if (tab === "page") {
      return (
        <FlatList
          data={pageRows}
          keyExtractor={(p) => String(p.page)}
          renderItem={PageRow}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={empty("No pages match that search.")}
        />
      );
    }
    if (tab === "bookmarks" || tab === "saved") {
      return (
        <FlatList
          data={savedRows}
          keyExtractor={(b) => `${b.surahNumber}-${b.ayahNumber}`}
          renderItem={BookmarkRow}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={empty(
            "No bookmarks yet. Long-press an ayah in the reader to save it.",
          )}
        />
      );
    }
    return (
      <FlatList
        data={surahs}
        keyExtractor={(s) => String(s.number)}
        renderItem={SurahRow}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={empty("No surahs match that search.")}
      />
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingHorizontal: sidePadding,
      }}
    >
      <Text
        style={{
          fontFamily: practice ? FONTS.sansExtraBold : fonts.display,
          fontSize: practice ? 26 : 30,
          color: colors.text,
          paddingHorizontal: gutter,
          paddingTop: 14,
        }}
      >
        Browse
      </Text>

      <View style={{ paddingHorizontal: gutter, paddingTop: 12 }}>
        <View
          style={[
            styles.search,
            {
              backgroundColor: practice ? colors.surface : colors.fill,
              borderRadius: practice ? 11 : 10,
              borderWidth: practice ? 1 : 0,
              borderColor: colors.line,
            },
          ]}
        >
          <View
            style={[styles.searchGlyph, { borderColor: colors.mutedFaint }]}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={
              practice
                ? "Search surah, juz or 2:255"
                : "Surah, juz, or ayah number"
            }
            placeholderTextColor={practice ? colors.muted : colors.mutedSoft}
            style={{
              flex: 1,
              fontFamily: FONTS.sans,
              fontSize: 14,
              color: colors.text,
            }}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (reference) open(reference.surah, reference.ayah);
            }}
          />
        </View>
      </View>

      {practice ? (
        <>
          <View style={{ paddingHorizontal: gutter, paddingTop: 12 }}>
            <View
              style={[
                styles.segmented,
                { backgroundColor: colors.surface, borderColor: colors.line },
              ]}
            >
              {(["surah", "juz", "page", "saved"] as PracticeTab[]).map(
                (key) => {
                  const active = practiceTab === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setPracticeTab(key)}
                      style={[
                        styles.segment,
                        active && {
                          backgroundColor: colors.green,
                          borderRadius: 8,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: active
                            ? FONTS.sansBold
                            : FONTS.sansSemiBold,
                          fontSize: 12.5,
                          color: active ? colors.onGreen : colors.textSecondary,
                          textTransform: "capitalize",
                        }}
                      >
                        {key}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>
          </View>

          {practiceTab === "surah" && (
            <View style={[styles.chipRow, { paddingHorizontal: gutter }]}>
              {(
                [
                  ["all", "All"],
                  ["Meccan", "Meccan"],
                  ["Medinan", "Medinan"],
                  ["short", "Short"],
                ] as [Filter, string][]
              ).map(([key, label]) => {
                const active = filter === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setFilter(key)}
                    style={{
                      borderRadius: 13,
                      paddingVertical: 5,
                      paddingHorizontal: 11,
                      backgroundColor: active
                        ? colors.green
                        : colors.surfaceAlt,
                      borderWidth: active ? 0 : 1,
                      borderColor: colors.lineAlt,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: active
                          ? FONTS.sansBold
                          : FONTS.sansSemiBold,
                        fontSize: 11.5,
                        color: active ? colors.onGreen : colors.textSecondary,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </>
      ) : (
        <View
          style={[
            styles.tabRow,
            { paddingHorizontal: gutter, borderBottomColor: colors.lineFaint },
          ]}
        >
          {(
            [
              ["juz", "Juz"],
              ["surah", "Surah"],
              ["bookmarks", "Bookmarks"],
            ] as [MushafTab, string][]
          ).map(([key, label]) => {
            const active = mushafTab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setMushafTab(key)}
                style={[
                  styles.tab,
                  active && {
                    borderBottomWidth: 2,
                    borderBottomColor: colors.green,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: active ? FONTS.sansBold : FONTS.sansMedium,
                    fontSize: 14,
                    color: active ? colors.text : colors.mutedSoft,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={{ flex: 1, paddingHorizontal: gutter }}>{renderList()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 9,
  },
  searchGlyph: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  tabRow: {
    flexDirection: "row",
    gap: 26,
    marginTop: 14,
    borderBottomWidth: 1,
  },
  tab: {
    paddingBottom: 10,
    marginBottom: -1,
  },
  segmented: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 11,
    padding: 4,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 7,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
  },
  rowMushaf: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  rowPractice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  indexCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  indexSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 24,
  },
});
