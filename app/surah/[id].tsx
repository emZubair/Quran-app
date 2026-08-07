import React, { useEffect } from "react";
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { AyahView } from "../../components/AyahView";
import { useQuranData } from "../../hooks/useQuranData";
import { useBookmarkStore } from "../../stores/bookmarkStore";
import { SURAH_LIST } from "../../data/quranMeta";
import { useThemeColors } from "../../hooks/useThemeColors";

export default function SurahScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahNumber = parseInt(id, 10);
  const surah = SURAH_LIST[surahNumber - 1];
  const { ayahs, loading, error } = useQuranData(surahNumber);
  const { width } = useWindowDimensions();
  const colors = useThemeColors();

  const { addBookmark, removeBookmark, isBookmarked, setLastRead } =
    useBookmarkStore();

  const bookmarked = isBookmarked(surahNumber, 1);

  useEffect(() => {
    if (surah) {
      setLastRead(surahNumber, 1);
    }
  }, [surah, surahNumber, setLastRead]);

  function toggleBookmark() {
    if (bookmarked) {
      removeBookmark(surahNumber, 1);
    } else {
      addBookmark({
        surahNumber,
        surahName: surah?.englishName ?? "",
        pageNumber: 1,
      });
    }
  }

  function handleWordPress(wordIndex: number, text: string) {
    // Future: show word meaning popup
  }

  function renderHeader() {
    if (!surah) return null;
    return (
      <View
        style={[
          styles.surahHeader,
          {
            backgroundColor: colors.primaryLighter,
            borderBottomColor: colors.primaryLight,
          },
        ]}
      >
        {surahNumber !== 1 && surahNumber !== 9 && (
          <Text style={[styles.bismillah, { color: colors.primary }]}>
            بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ
          </Text>
        )}
        <Text style={[styles.surahTitle, { color: colors.text }]}>
          {surah.name}
        </Text>
        <Text style={[styles.surahEnglish, { color: colors.textSecondary }]}>
          {surah.englishName} — {surah.englishTranslation}
        </Text>
        <Text style={[styles.surahMeta, { color: colors.textMuted }]}>
          {surah.revelationType} • {surah.numberOfAyahs} Ayahs
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: surah?.englishName ?? "Loading...",
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>← Back</Text>
              </Pressable>
            ),
          }}
        />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading surah...
          </Text>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Error",
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>← Back</Text>
              </Pressable>
            ),
          }}
        />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: surah?.englishName ?? "",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={toggleBookmark} style={styles.bookmarkBtn}>
              <Text style={styles.bookmarkIcon}>
                {bookmarked ? "🔖" : "📑"}
              </Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={ayahs}
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item }) => (
          <AyahView ayah={item} onWordPress={handleWordPress} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.list,
          {
            paddingHorizontal: width > 768 ? width * 0.1 : 0,
            backgroundColor: colors.background,
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#888",
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
  },
  surahHeader: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "#E8F5E9",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C8E6C9",
  },
  bismillah: {
    fontSize: 26,
    color: "#2E7D32",
    marginBottom: 12,
  },
  surahTitle: {
    fontSize: 36,
    color: "#1B1B1B",
    fontWeight: "700",
  },
  surahEnglish: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
  surahMeta: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  bookmarkBtn: {
    padding: 8,
  },
  bookmarkIcon: {
    fontSize: 22,
  },
  list: {
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
});
