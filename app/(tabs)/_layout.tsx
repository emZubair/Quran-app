import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";

function TabIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = {
    Surahs: "📖",
    Bookmarks: "🔖",
    Settings: "⚙️",
  };
  return <Text style={{ fontSize: 22 }}>{icons[name] ?? "📄"}</Text>;
}

export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          paddingBottom: 6,
          height: 56,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Surahs",
          tabBarIcon: ({ color }) => <TabIcon name="Surahs" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color }) => <TabIcon name="Bookmarks" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabIcon name="Settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
