import { useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBookmarkStore } from "../../stores/bookmarkStore";
import { useSettingsStore } from "../../stores/settingsStore";
import {
  useStreakStore,
  currentWeekDates,
  isoDate,
} from "../../stores/streakStore";
import { SURAH_LIST } from "../../data/quranMeta";
import { TOTAL_AYAHS, ayahFromAbsolute, juzForAyah } from "../../data/juzMeta";
import { pageForAyah, pageRangeForSurah } from "../../data/pageMeta";
import { getAyah } from "../../hooks/useQuranData";
import { useThemeColors, useThemeMetrics } from "../../hooks/useThemeColors";
import { FONTS, arabicLineHeight, useDisplayFonts } from "../../lib/fonts";
import { shortDateLine, longDateLine } from "../../lib/hijri";
import {
  Card,
  Overline,
  ProgressBar,
  ProgressRing,
} from "../../components/ui/Primitives";

/** Rough reading pace used for the "~24 min left" estimate on the Continue card. */
const AYAHS_PER_MINUTE = 4;

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Ayah of the day — seeded from the calendar date so it is stable across
 * re-renders and changes exactly once per day.
 */
function useAyahOfTheDay() {
  return useMemo(() => {
    const today = new Date();
    const seed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();
    // 32-bit mix so consecutive days land far apart. Kept inside Math.imul
    // rather than a plain multiply, which would overflow the safe integer
    // range and lose determinism guarantees.
    let hash = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35) >>> 0;
    const index = (hash % TOTAL_AYAHS) + 1;
    const ref = ayahFromAbsolute(index);
    return { ref, ayah: getAyah(ref.surah, ref.ayah) };
  }, []);
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const metrics = useThemeMetrics();
  const fonts = useDisplayFonts();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const practice = useSettingsStore((s) => s.theme) === "practice";
  const arabicFont = useSettingsStore((s) => s.arabicFont);
  const dailyGoalMinutes = useSettingsStore((s) => s.dailyGoalMinutes);
  const lastRead = useBookmarkStore((s) => s.lastRead);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const { days, currentStreak } = useStreakStore();

  const family = arabicFont === "AmiriQuran" ? FONTS.arabic : undefined;
  const gutter = metrics.gutter;
  const sidePadding = width > 768 ? Math.round(width * 0.08) : 0;

  const daily = useAyahOfTheDay();

  const resume = useMemo(() => {
    const ref = lastRead ?? { surah: 1, ayah: 1 };
    const surah = SURAH_LIST[ref.surah - 1];
    const juz = juzForAyah(ref.surah, ref.ayah);
    const [firstPage, lastPage] = pageRangeForSurah(
      ref.surah,
      surah.numberOfAyahs,
    );
    const page = pageForAyah(ref.surah, ref.ayah);
    const progress = ref.ayah / surah.numberOfAyahs;
    const minutesLeft = Math.max(
      1,
      Math.round((surah.numberOfAyahs - ref.ayah) / AYAHS_PER_MINUTE),
    );
    return {
      ref,
      surah,
      juz,
      progress,
      minutesLeft,
      page,
      pageInSurah: page - firstPage + 1,
      pagesInSurah: lastPage - firstPage + 1,
    };
  }, [lastRead]);

  const week = useMemo(() => {
    const dates = currentWeekDates();
    const today = isoDate();
    const goalSeconds = dailyGoalMinutes * 60;
    return dates.map((date, i) => {
      const seconds = days[date] ?? 0;
      return {
        date,
        letter: DAY_LETTERS[i],
        isToday: date === today,
        state:
          seconds >= goalSeconds
            ? ("met" as const)
            : seconds > 0
              ? ("partial" as const)
              : ("none" as const),
      };
    });
  }, [days, dailyGoalMinutes]);

  const todaySeconds = days[isoDate()] ?? 0;
  const todayMinutes = Math.floor(todaySeconds / 60);
  const goalProgress = Math.min(1, todaySeconds / (dailyGoalMinutes * 60));

  function openResume() {
    router.push(`/surah/${resume.ref.surah}?ayah=${resume.ref.ayah}`);
  }

  function barColor(state: "met" | "partial" | "none") {
    if (state === "met") return colors.green;
    if (state === "partial") return colors.greenSoft;
    return practice ? colors.line : colors.fillWarm;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 32,
        paddingHorizontal: sidePadding,
      }}
    >
      {practice ? (
        <PracticeHeader />
      ) : (
        <View style={{ paddingHorizontal: gutter, gap: 2 }}>
          <Overline size={11} em={0.14}>
            {shortDateLine()}
          </Overline>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 30,
              lineHeight: 36,
              letterSpacing: -0.3,
              color: colors.text,
            }}
          >
            Peace be upon you
          </Text>
        </View>
      )}

      {/* Streak card — Practice only; Mushaf puts the week at the bottom. */}
      {practice && (
        <Card
          style={{
            marginHorizontal: gutter,
            marginTop: 20,
            borderRadius: metrics.heroRadius,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
          }}
        >
          <ProgressRing progress={goalProgress} size={92} thickness={8}>
            <Text
              style={{
                fontFamily: FONTS.sansExtraBold,
                fontSize: 22,
                color: colors.text,
              }}
            >
              {currentStreak}
            </Text>
            <Overline size={9} em={0.1} color={colors.muted}>
              Days
            </Overline>
          </ProgressRing>
          <View style={{ flex: 1, gap: 6 }}>
            <Text
              style={{
                fontFamily: FONTS.sansBold,
                fontSize: 15,
                color: colors.text,
              }}
            >
              {todayMinutes} of {dailyGoalMinutes} min today
            </Text>
            <Text
              style={{
                fontFamily: FONTS.sans,
                fontSize: 12,
                color: colors.muted,
              }}
            >
              {goalProgress >= 1
                ? "Goal met — streak safe"
                : `${Math.max(1, dailyGoalMinutes - todayMinutes)} minutes to keep the streak`}
            </Text>
            <View style={styles.weekRow}>
              {week.map((day) => (
                <View
                  key={day.date}
                  style={{
                    flex: 1,
                    height: 26,
                    borderRadius: 5,
                    backgroundColor: barColor(day.state),
                  }}
                />
              ))}
            </View>
          </View>
        </Card>
      )}

      {/* Continue / Resume */}
      <Pressable
        onPress={openResume}
        accessibilityRole="button"
        style={{
          marginHorizontal: gutter,
          marginTop: practice ? 18 : 22,
          backgroundColor: colors.green,
          borderRadius: metrics.heroRadius,
          padding: 20,
          gap: 16,
        }}
      >
        <View style={styles.resumeRow}>
          <View style={{ flex: 1, gap: 4 }}>
            <Overline
              size={10}
              color={practice ? "rgba(11,15,13,.55)" : "rgba(250,247,240,.6)"}
            >
              {practice ? "Pick up where you left" : "Continue"}
            </Overline>
            <Text
              style={{
                fontFamily: practice ? FONTS.sansExtraBold : fonts.display,
                fontSize: practice ? 24 : 25,
                color: practice ? colors.onGreen : "#FAF7F0",
              }}
            >
              {resume.surah.englishName}
              {practice ? ` ${resume.ref.ayah}` : ""}
            </Text>
            <Text
              style={{
                fontFamily: practice ? FONTS.sansMedium : FONTS.sans,
                fontSize: 12.5,
                color: practice
                  ? "rgba(11,15,13,.65)"
                  : "rgba(250,247,240,.72)",
              }}
            >
              {practice
                ? `Juz ${resume.juz.number} · page ${resume.pageInSurah} of ${resume.pagesInSurah}`
                : `Ayah ${resume.ref.ayah} of ${resume.surah.numberOfAyahs} · Juz ${resume.juz.number}`}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: family,
              fontSize: 30,
              lineHeight: arabicLineHeight(30, family ?? ""),
              color: practice ? colors.onGreen : "rgba(250,247,240,.9)",
            }}
          >
            {resume.surah.name}
          </Text>
        </View>

        {practice ? (
          <View
            style={{
              height: 38,
              borderRadius: 10,
              backgroundColor: colors.onGreen,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.sansBold,
                fontSize: 13.5,
                color: colors.green,
              }}
            >
              Resume reading
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <ProgressBar
              progress={resume.progress}
              height={3}
              trackColor="rgba(250,247,240,.22)"
              fillColor="#D8C08A"
            />
            <View style={styles.resumeMetaRow}>
              <Text style={styles.resumeMeta}>
                {Math.round(resume.progress * 100)}% complete
              </Text>
              <Text style={styles.resumeMeta}>
                ~{resume.minutesLeft} min left
              </Text>
            </View>
          </View>
        )}
      </Pressable>

      {/* Ayah of the day — Mushaf */}
      {!practice && daily.ayah && (
        <View style={{ marginHorizontal: gutter, marginTop: 20, gap: 10 }}>
          <View style={styles.sectionHead}>
            <Overline>Ayah of the day</Overline>
            <Text
              style={{
                fontFamily: FONTS.sansSemiBold,
                fontSize: 11.5,
                color: colors.green,
              }}
            >
              {daily.ref.surah}:{daily.ref.ayah}
            </Text>
          </View>
          <Pressable
            onPress={() =>
              router.push(`/surah/${daily.ref.surah}?ayah=${daily.ref.ayah}`)
            }
          >
            <Card
              style={{
                paddingHorizontal: 18,
                paddingTop: 18,
                paddingBottom: 16,
                gap: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: family,
                  fontSize: 25,
                  lineHeight: Math.round(25 * 2.05),
                  color: colors.text,
                  textAlign: "right",
                  writingDirection: "rtl",
                }}
              >
                {daily.ayah.text}
              </Text>
              <View style={{ height: 1, backgroundColor: colors.lineFaint }} />
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 15.5,
                  lineHeight: 15.5 * 1.55,
                  color: colors.textSecondary,
                }}
              >
                {daily.ayah.translation}
              </Text>
            </Card>
          </Pressable>
        </View>
      )}

      {/* This week — Mushaf */}
      {!practice && (
        <View style={{ marginHorizontal: gutter, marginTop: 20, gap: 12 }}>
          <View style={styles.sectionHead}>
            <Overline>This week</Overline>
            <Text
              style={{
                fontFamily: FONTS.sans,
                fontSize: 11.5,
                color: colors.muted,
              }}
            >
              {currentStreak} day streak
            </Text>
          </View>
          <View style={styles.weekRow}>
            {week.map((day) => (
              <View key={day.date} style={{ flex: 1, gap: 6 }}>
                <View
                  style={{
                    height: 34,
                    borderRadius: 8,
                    backgroundColor: barColor(day.state),
                  }}
                />
                <Text
                  style={{
                    fontFamily: day.isToday ? FONTS.sansBold : FONTS.sans,
                    fontSize: 10,
                    textAlign: "center",
                    color: day.isToday ? colors.text : colors.mutedSoft,
                  }}
                >
                  {day.letter}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Jump back in — Practice */}
      {practice && (
        <View style={{ marginHorizontal: gutter, marginTop: 22, gap: 10 }}>
          <Overline color={colors.muted}>Jump back in</Overline>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {jumpTargets(bookmarks, lastRead).map((target) => (
              <Pressable
                key={`${target.surah}-${target.ayah}-${target.context}`}
                style={{ flex: 1 }}
                onPress={() =>
                  router.push(`/surah/${target.surah}?ayah=${target.ayah}`)
                }
              >
                <Card style={{ padding: 14, gap: 8 }}>
                  <Text
                    style={{
                      fontFamily: family,
                      fontSize: 22,
                      lineHeight: arabicLineHeight(22, family ?? ""),
                      color: colors.green,
                    }}
                  >
                    {SURAH_LIST[target.surah - 1].name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.sansBold,
                      fontSize: 13.5,
                      color: colors.text,
                    }}
                  >
                    {SURAH_LIST[target.surah - 1].englishName}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 11.5,
                      color: colors.muted,
                    }}
                  >
                    {target.context}
                  </Text>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

/** Two suggestions: the most recent bookmark and the last-read surah. */
function jumpTargets(
  bookmarks: {
    surahNumber: number;
    ayahNumber: number;
    timestamp: number;
  }[],
  lastRead: { surah: number; ayah: number } | null,
): { surah: number; ayah: number; context: string }[] {
  const targets: { surah: number; ayah: number; context: string }[] = [];
  const newest = [...bookmarks].sort((a, b) => b.timestamp - a.timestamp)[0];
  if (newest)
    targets.push({
      surah: newest.surahNumber,
      ayah: newest.ayahNumber,
      context: `Bookmarked ayah ${newest.ayahNumber}`,
    });
  if (lastRead && lastRead.surah !== newest?.surahNumber) {
    targets.push({
      surah: lastRead.surah,
      ayah: lastRead.ayah,
      context: "Continue reading",
    });
  }
  // Al-Kahf is the conventional Friday reading; a sensible cold-start default.
  if (targets.length === 0)
    targets.push({ surah: 18, ayah: 1, context: "Suggested" });
  if (targets.length === 1 && targets[0].surah !== 36) {
    targets.push({ surah: 36, ayah: 1, context: "Suggested" });
  }
  return targets.slice(0, 2);
}

function PracticeHeader() {
  const colors = useThemeColors();
  const metrics = useThemeMetrics();
  return (
    <View
      style={{
        paddingHorizontal: metrics.gutter,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontFamily: FONTS.sansExtraBold,
            fontSize: 22,
            letterSpacing: -0.44,
            color: colors.text,
          }}
        >
          Assalamu alaikum
        </Text>
        <Text
          style={{
            fontFamily: FONTS.sans,
            fontSize: 12.5,
            color: colors.muted,
          }}
        >
          {longDateLine()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weekRow: {
    flexDirection: "row",
    gap: 8,
  },
  resumeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  resumeMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resumeMeta: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: "rgba(250,247,240,.6)",
  },
});
