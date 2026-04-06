import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useThemeColors } from "../hooks/useThemeColors";

export default function RootLayout() {
  const loadBookmarks = useBookmarkStore((s) => s.loadBookmarks);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const darkMode = useSettingsStore((s) => s.darkMode);
  const colors = useThemeColors();

  useEffect(() => {
    loadBookmarks();
    loadSettings();
  }, []);

  return (
    <>
      <StatusBar style={darkMode ? "dark" : "light"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="surah/[id]" options={{ headerBackTitle: "Back", headerBackVisible: true }} />
      </Stack>
    </>
  );
}
