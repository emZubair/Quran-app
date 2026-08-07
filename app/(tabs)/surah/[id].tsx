import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Share,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuranData, type Ayah } from "../../../hooks/useQuranData";
import { useBookmarkStore } from "../../../stores/bookmarkStore";
import { useSettingsStore } from "../../../stores/settingsStore";
import { useStreakStore } from "../../../stores/streakStore";
import { SURAH_LIST } from "../../../data/quranMeta";
import { juzForAyah } from "../../../data/juzMeta";
import { pageForAyah } from "../../../data/pageMeta";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { FONTS, overline, useDisplayFonts } from "../../../lib/fonts";
import { ReaderBar } from "../../../components/reader/ReaderBar";
import { SurahHeader } from "../../../components/reader/SurahHeader";
import {
  ArabicFlow,
  type WordRef,
} from "../../../components/reader/ArabicFlow";
import { AyahBlock } from "../../../components/reader/AyahBlock";
import { WordSheet } from "../../../components/reader/WordSheet";

/** Ayahs grouped by mushaf page — the unit of continuous flow in Mushaf. */
interface PageGroup {
  page: number;
  ayahs: Ayah[];
}

function groupByPage(surahNumber: number, ayahs: Ayah[]): PageGroup[] {
  const groups: PageGroup[] = [];
  for (const ayah of ayahs) {
    const page = pageForAyah(surahNumber, ayah.numberInSurah);
    const last = groups[groups.length - 1];
    if (last && last.page === page) last.ayahs.push(ayah);
    else groups.push({ page, ayahs: [ayah] });
  }
  return groups;
}

export default function SurahScreen() {
  const router = useRouter();
  const { id, ayah: ayahParam } = useLocalSearchParams<{
    id: string;
    ayah?: string;
  }>();
  const surahNumber = parseInt(id, 10);
  const surah = SURAH_LIST[surahNumber - 1];
  const { ayahs, loading, error } = useQuranData(surahNumber);
  const { width } = useWindowDimensions();
  const colors = useThemeColors();
  const fonts = useDisplayFonts();

  const practice = useSettingsStore((s) => s.theme) === "practice";
  const fontSize = useSettingsStore((s) => s.fontSize);
  const showTranslation = useSettingsStore((s) => s.showTranslation);
  const wordMeanings = useSettingsStore((s) => s.wordMeanings);
  const dailyGoalMinutes = useSettingsStore((s) => s.dailyGoalMinutes);

  const setLastRead = useBookmarkStore((s) => s.setLastRead);
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const recordReading = useStreakStore((s) => s.recordReading);

  const [selected, setSelected] = useState<WordRef | null>(null);
  const [visibleAyah, setVisibleAyah] = useState(
    ayahParam ? parseInt(ayahParam, 10) || 1 : 1,
  );

  const pages = useMemo(
    () => groupByPage(surahNumber, ayahs),
    [surahNumber, ayahs],
  );

  // Reading time feeds the streak. Counted from mount to unmount, which is a
  // fair proxy for a foreground reading session.
  useEffect(() => {
    const startedAt = Date.now();
    return () => {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      if (seconds > 0) recordReading(seconds, dailyGoalMinutes);
    };
  }, [recordReading, dailyGoalMinutes]);

  // lastRead follows the scroll position, debounced so AsyncStorage is not
  // written on every frame.
  const pendingAyah = useRef(visibleAyah);
  pendingAyah.current = visibleAyah;
  useEffect(() => {
    if (!surah) return;
    const timer = setTimeout(
      () => setLastRead(surahNumber, pendingAyah.current),
      1000,
    );
    return () => clearTimeout(timer);
  }, [surah, surahNumber, visibleAyah, setLastRead]);

  const handleWordPress = useCallback(
    (ref: WordRef) => {
      if (!wordMeanings) return;
      setSelected((current) =>
        current?.ayah === ref.ayah && current?.word === ref.word ? null : ref,
      );
    },
    [wordMeanings],
  );

  const isBookmarked = useCallback(
    (ayahNumber: number) =>
      bookmarks.some(
        (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber,
      ),
    [bookmarks, surahNumber],
  );

  const handleToggleBookmark = useCallback(
    (ayahNumber: number) =>
      toggleBookmark({
        surahNumber,
        surahName: surah?.englishName ?? "",
        ayahNumber,
      }),
    [toggleBookmark, surahNumber, surah],
  );

  const handleShare = useCallback(
    (item: Ayah) => {
      Share.share({
        message: `${item.text}\n\n${item.translation ?? ""}\n\n— ${surah?.englishName} ${surahNumber}:${item.numberInSurah}`,
      });
    },
    [surah, surahNumber],
  );

  const context = useMemo(() => {
    const juz = juzForAyah(surahNumber, visibleAyah);
    return `Juz ${juz.number} · Page ${pageForAyah(surahNumber, visibleAyah)}`;
  }, [surahNumber, visibleAyah]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 40 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { item: unknown }[] }) => {
      const first = viewableItems[0]?.item as Ayah | PageGroup | undefined;
      if (!first) return;
      const number =
        "numberInSurah" in first
          ? first.numberInSurah
          : first.ayahs[0]?.numberInSurah;
      if (number) setVisibleAyah(number);
    },
  ).current;

  const gutter = practice ? 22 : 24;
  const sidePadding = width > 768 ? Math.round(width * 0.1) : 0;

  if (!surah) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontFamily: FONTS.sans }}>
          Surah not found
        </Text>
      </View>
    );
  }

  if (loading || error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ReaderBar
          title={surah.englishName}
          context={error ? "" : "Loading"}
          onBack={() => router.back()}
          onTypePress={() => {}}
          onJumpPress={() => {}}
        />
        <View style={styles.center}>
          {error ? (
            <Text style={{ color: colors.text, fontFamily: FONTS.sans }}>
              {error}
            </Text>
          ) : (
            <ActivityIndicator size="large" color={colors.green} />
          )}
        </View>
      </View>
    );
  }

  const header = <SurahHeader surah={surah} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ReaderBar
        title={surah.englishName}
        context={context}
        onBack={() => router.back()}
        onTypePress={() => router.push("/(tabs)/settings")}
        onJumpPress={() => router.push("/(tabs)/browse")}
      />

      {practice ? (
        <FlatList
          data={ayahs}
          keyExtractor={(item) => String(item.number)}
          ListHeaderComponent={header}
          contentContainerStyle={{
            paddingHorizontal: sidePadding,
            paddingBottom: 40,
          }}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item }) => (
            <AyahBlock
              surah={surahNumber}
              ayah={item}
              selected={selected}
              onWordPress={handleWordPress}
              bookmarked={isBookmarked(item.numberInSurah)}
              onToggleBookmark={() => handleToggleBookmark(item.numberInSurah)}
              onShare={() => handleShare(item)}
            />
          )}
        />
      ) : (
        <FlatList
          data={pages}
          keyExtractor={(group) => String(group.page)}
          ListHeaderComponent={header}
          contentContainerStyle={{
            paddingHorizontal: sidePadding,
            paddingBottom: 40,
          }}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item }) => (
            <View style={{ paddingBottom: 24 }}>
              <ArabicFlow
                ayahs={item.ayahs}
                selected={selected}
                onWordPress={handleWordPress}
                fontSize={fontSize}
                lineHeightMultiplier={2.5}
                style={{ paddingHorizontal: gutter }}
              />

              {showTranslation && (
                <View
                  style={{
                    marginTop: 18,
                    marginHorizontal: gutter,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: colors.lineFaint,
                    gap: 12,
                  }}
                >
                  {item.ayahs.map((a) =>
                    a.translation ? (
                      <Pressable
                        key={a.number}
                        onLongPress={() =>
                          handleToggleBookmark(a.numberInSurah)
                        }
                        style={styles.translationRow}
                      >
                        <Text
                          style={[
                            overline(10, 0),
                            {
                              color: isBookmarked(a.numberInSurah)
                                ? colors.green
                                : colors.mutedFaint,
                              paddingTop: 4,
                              textTransform: "none",
                            },
                          ]}
                        >
                          {a.numberInSurah}
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            fontFamily: fonts.body,
                            fontSize: 15.5,
                            lineHeight: 15.5 * 1.55,
                            color: colors.textSecondary,
                          }}
                        >
                          {a.translation}
                        </Text>
                      </Pressable>
                    ) : null,
                  )}
                </View>
              )}
            </View>
          )}
        />
      )}

      {/* Mushaf shows the word meaning in a bottom sheet; Practice inlines it. */}
      {!practice && selected && (
        <WordSheet
          surah={surahNumber}
          ayah={selected.ayah}
          wordIndex={selected.word}
          arabic={
            ayahs.find((a) => a.numberInSurah === selected.ayah)?.words[
              selected.word
            ]?.text ?? ""
          }
          onDismiss={() => setSelected(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  translationRow: {
    flexDirection: "row",
    gap: 10,
  },
});
