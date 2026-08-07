import { Tabs } from "expo-router";
import { View } from "react-native";
import { useThemeColors, useThemeMetrics } from "../../hooks/useThemeColors";
import { useSettingsStore } from "../../stores/settingsStore";
import { FONTS } from "../../lib/fonts";

/**
 * Emoji tab icons are retired. Each tab is a small geometric mark over its
 * label — a circle in Mushaf, a rounded square in Practice. The label is what
 * identifies the tab, so labels are never hidden.
 */
function NavMark({ focused }: { focused: boolean }) {
  const colors = useThemeColors();
  const metrics = useThemeMetrics();
  return (
    <View
      style={{
        width: metrics.markSize,
        height: metrics.markSize,
        borderRadius: metrics.markRadius,
        backgroundColor: focused ? colors.green : "transparent",
        borderWidth: focused ? 0 : 1.5,
        borderColor: colors.mutedFaint,
      }}
    />
  );
}

export default function TabLayout() {
  const colors = useThemeColors();
  const theme = useSettingsStore((s) => s.theme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 74,
          paddingTop: 10,
          backgroundColor: colors.navBg,
          borderTopWidth: 1,
          borderTopColor: colors.line,
        },
        tabBarLabelStyle: {
          fontFamily: theme === "practice" ? FONTS.sansSemiBold : FONTS.sans,
          fontSize: 12,
          marginTop: 6,
        },
        tabBarIcon: ({ focused }) => <NavMark focused={focused} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: theme === "practice" ? "Home" : "Today" }}
      />
      <Tabs.Screen name="read" options={{ title: "Read" }} />
      <Tabs.Screen name="browse" options={{ title: "Browse" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      {/*
       * The reader lives inside the tab navigator so the bar stays visible
       * while reading, but it is not itself a tab — href: null keeps it out of
       * the bar. Its URL is unaffected: (tabs) is a group, so this is /surah/1.
       */}
      <Tabs.Screen name="surah/[id]" options={{ href: null }} />
    </Tabs>
  );
}
