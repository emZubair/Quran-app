import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  pageNumber: number;
  timestamp: number;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  lastReadPage: number | null;
  lastReadSurah: number | null;
  addBookmark: (bookmark: Omit<Bookmark, "timestamp">) => void;
  removeBookmark: (surahNumber: number, pageNumber: number) => void;
  isBookmarked: (surahNumber: number, pageNumber: number) => boolean;
  setLastRead: (surahNumber: number, pageNumber: number) => void;
  loadBookmarks: () => Promise<void>;
}

const BOOKMARKS_KEY = "quran_bookmarks";
const LAST_READ_KEY = "quran_last_read";

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  lastReadPage: null,
  lastReadSurah: null,

  addBookmark: (bookmark) => {
    const newBookmark: Bookmark = { ...bookmark, timestamp: Date.now() };
    const updated = [...get().bookmarks, newBookmark];
    set({ bookmarks: updated });
    AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  },

  removeBookmark: (surahNumber, pageNumber) => {
    const updated = get().bookmarks.filter(
      (b) => !(b.surahNumber === surahNumber && b.pageNumber === pageNumber)
    );
    set({ bookmarks: updated });
    AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  },

  isBookmarked: (surahNumber, pageNumber) => {
    return get().bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.pageNumber === pageNumber
    );
  },

  setLastRead: (surahNumber, pageNumber) => {
    set({ lastReadSurah: surahNumber, lastReadPage: pageNumber });
    AsyncStorage.setItem(
      LAST_READ_KEY,
      JSON.stringify({ surahNumber, pageNumber })
    );
  },

  loadBookmarks: async () => {
    const [bookmarksJson, lastReadJson] = await Promise.all([
      AsyncStorage.getItem(BOOKMARKS_KEY),
      AsyncStorage.getItem(LAST_READ_KEY),
    ]);
    if (bookmarksJson) {
      set({ bookmarks: JSON.parse(bookmarksJson) });
    }
    if (lastReadJson) {
      const { surahNumber, pageNumber } = JSON.parse(lastReadJson);
      set({ lastReadSurah: surahNumber, lastReadPage: pageNumber });
    }
  },
}));
