import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  timestamp: number;
}

export interface LastRead {
  surah: number;
  ayah: number;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  lastRead: LastRead | null;
  addBookmark: (bookmark: Omit<Bookmark, "timestamp">) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  toggleBookmark: (bookmark: Omit<Bookmark, "timestamp">) => void;
  setLastRead: (surah: number, ayah: number) => void;
  loadBookmarks: () => Promise<void>;
}

const BOOKMARKS_KEY = "quran_bookmarks";
const LAST_READ_KEY = "quran_last_read";

/**
 * v1 stored surah-level bookmarks with a hardcoded `pageNumber: 1`, so every
 * saved row read "Page 1". Those rows migrate to ayah 1 of the same surah —
 * the surah is the only real information they carried.
 */
function migrateBookmarks(raw: unknown): Bookmark[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((b): b is Record<string, unknown> => !!b && typeof b === "object")
    .map((b) => ({
      surahNumber: Number(b.surahNumber),
      surahName: String(b.surahName ?? ""),
      ayahNumber: Number(b.ayahNumber ?? 1) || 1,
      timestamp: Number(b.timestamp ?? Date.now()),
    }))
    .filter((b) => Number.isFinite(b.surahNumber) && b.surahNumber > 0);
}

function migrateLastRead(raw: unknown): LastRead | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  // v1: { surahNumber, pageNumber }. v2: { surah, ayah }.
  const surah = Number(r.surah ?? r.surahNumber);
  const ayah = Number(r.ayah ?? 1) || 1;
  if (!Number.isFinite(surah) || surah <= 0) return null;
  return { surah, ayah };
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  lastRead: null,

  addBookmark: (bookmark) => {
    const exists = get().bookmarks.some(
      (b) =>
        b.surahNumber === bookmark.surahNumber &&
        b.ayahNumber === bookmark.ayahNumber,
    );
    if (exists) return;
    const updated = [
      ...get().bookmarks,
      { ...bookmark, timestamp: Date.now() },
    ];
    set({ bookmarks: updated });
    AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  },

  removeBookmark: (surahNumber, ayahNumber) => {
    const updated = get().bookmarks.filter(
      (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber),
    );
    set({ bookmarks: updated });
    AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  },

  isBookmarked: (surahNumber, ayahNumber) =>
    get().bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber,
    ),

  toggleBookmark: (bookmark) => {
    if (get().isBookmarked(bookmark.surahNumber, bookmark.ayahNumber)) {
      get().removeBookmark(bookmark.surahNumber, bookmark.ayahNumber);
    } else {
      get().addBookmark(bookmark);
    }
  },

  setLastRead: (surah, ayah) => {
    set({ lastRead: { surah, ayah } });
    AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify({ surah, ayah }));
  },

  loadBookmarks: async () => {
    const [bookmarksJson, lastReadJson] = await Promise.all([
      AsyncStorage.getItem(BOOKMARKS_KEY),
      AsyncStorage.getItem(LAST_READ_KEY),
    ]);
    if (bookmarksJson) {
      set({ bookmarks: migrateBookmarks(JSON.parse(bookmarksJson)) });
    }
    if (lastReadJson) {
      set({ lastRead: migrateLastRead(JSON.parse(lastReadJson)) });
    }
  },
}));
