import React, { useRef, useMemo, useState } from "react";
import {
  FlatList,
  TextInput,
  View,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SurahListItem } from "../../components/SurahListItem";
import { SURAH_LIST } from "../../data/quranMeta";
import { useBookmarkStore } from "../../stores/bookmarkStore";
import { useThemeColors } from "../../hooks/useThemeColors";

export default function SurahListScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [search, setSearch] = useState("");
  const searchRef = useRef<TextInput>(null);
  const lastReadSurah = useBookmarkStore((s) => s.lastReadSurah);

  const filtered = useMemo(() => {
    if (!search.trim()) return SURAH_LIST;
    const q = search.toLowerCase();
    return SURAH_LIST.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.name.includes(search) ||
        s.number.toString() === q
    );
  }, [search]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>القرآن الكريم</Text>
        <Text style={styles.subtitle}>The Noble Quran</Text>
      </View>

      {lastReadSurah && (
        <Pressable
          style={[styles.lastRead, { backgroundColor: colors.primaryLighter, borderBottomColor: colors.primaryLight }]}
          onPress={() => router.push(`/surah/${lastReadSurah}`)}
        >
          <Text style={[styles.lastReadText, { color: colors.primary }]}>
            📖 Continue Reading: {SURAH_LIST[lastReadSurah - 1]?.englishName}
          </Text>
        </Pressable>
      )}

      <View style={[styles.searchContainer, { backgroundColor: colors.searchBg }]}>
        <TextInput
          ref={searchRef}
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search surah by name or number..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          selectTextOnFocus
        />
        {search.length > 0 && (
          <Pressable
            style={styles.clearBtn}
            onPress={() => {
              setSearch("");
              searchRef.current?.focus();
            }}
          >
            <Text style={[styles.clearBtnText, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item }) => (
          <SurahListItem
            surah={item}
            onPress={(num) => router.push(`/surah/${num}`)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#C8E6C9",
    marginTop: 4,
  },
  lastRead: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastReadText: {
    fontSize: 15,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    paddingBottom: 20,
  },
});
