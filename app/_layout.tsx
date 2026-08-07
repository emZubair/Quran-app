import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useThemeColors } from "../hooks/useThemeColors";

export default function RootLayout() {
  const loadBookmarks = useBookmarkStore((s) => s.loadBookmarks);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const colors = useThemeColors();

  const [fontsLoaded] = useFonts({
    AmiriQuran: require("../assets/fonts/AmiriQuran-Regular.ttf"),
  });

  useEffect(() => {
    loadBookmarks();
    loadSettings();
  }, [loadBookmarks, loadSettings]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <>
      {/* Status bar always sits on the green header, so icons stay light */}
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="surah/[id]"
          options={{ headerBackTitle: "Back", headerBackVisible: true }}
        />
      </Stack>
    </>
  );
}
