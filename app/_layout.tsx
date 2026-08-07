import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useStreakStore } from "../stores/streakStore";
import { useThemeColors } from "../hooks/useThemeColors";
import { FONT_ASSETS } from "../lib/fonts";

export default function RootLayout() {
  const loadBookmarks = useBookmarkStore((s) => s.loadBookmarks);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadStreaks = useStreakStore((s) => s.loadStreaks);
  const theme = useSettingsStore((s) => s.theme);
  const colors = useThemeColors();

  const [fontsLoaded] = useFonts(FONT_ASSETS);

  useEffect(() => {
    loadBookmarks();
    loadSettings();
    loadStreaks();
  }, [loadBookmarks, loadSettings, loadStreaks]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <>
      {/*
       * The filled green header is retired — screens own their own chrome, so
       * the status bar sits on the page background and follows the theme.
       */}
      <StatusBar style={theme === "practice" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
