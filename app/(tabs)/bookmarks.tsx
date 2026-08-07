import React from "react";
import { FlatList, Pressable, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBookmarkStore, Bookmark } from "../../stores/bookmarkStore";
import { useThemeColors } from "../../hooks/useThemeColors";

export default function BookmarksScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);

  const sortedBookmarks = [...bookmarks].sort(
    (a, b) => b.timestamp - a.timestamp,
  );

  function renderBookmark({ item }: { item: Bookmark }) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.item,
          { borderBottomColor: colors.border },
          pressed && { backgroundColor: colors.surfacePressed },
        ]}
        onPress={() => router.push(`/surah/${item.surahNumber}`)}
      >
        <View style={styles.info}>
          <Text style={[styles.surahName, { color: colors.text }]}>
            {item.surahName}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            Surah {item.surahNumber} • Page {item.pageNumber}
          </Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>

        <Pressable
          style={styles.removeBtn}
          onPress={() => removeBookmark(item.surahNumber, item.pageNumber)}
        >
          <Text style={[styles.removeText, { color: colors.textMuted }]}>
            ✕
          </Text>
        </Pressable>
      </Pressable>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.primary, paddingTop: insets.top + 20 },
        ]}
      >
        <Text style={styles.title}>🔖 Bookmarks</Text>
      </View>

      {sortedBookmarks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔖</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No bookmarks yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            Tap the bookmark icon while reading a surah to save your place.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedBookmarks}
          keyExtractor={(item) => `${item.surahNumber}-${item.pageNumber}`}
          renderItem={renderBookmark}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  removeBtn: {
    padding: 8,
  },
  removeText: {
    fontSize: 18,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  list: {
    paddingBottom: 20,
  },
});
