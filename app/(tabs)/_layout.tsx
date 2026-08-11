import { Tabs } from "expo-router";
import { View } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSettingsStore } from "../../stores/settingsStore";
import { FONTS } from "../../lib/fonts";

type NavIconName = "home" | "read" | "browse" | "settings";

function NavIcon({
  name,
  color,
  focused,
}: {
  name: NavIconName;
  color: string;
  focused: boolean;
}) {
  const colors = useThemeColors();
  const stroke = focused ? 2 : 1.6;

  if (name === "home") {
    return (
      <View style={{ width: 24, height: 22 }}>
        <View
          style={{
            position: "absolute",
            width: 15,
            height: 15,
            left: 4.5,
            top: 4,
            borderLeftWidth: stroke,
            borderTopWidth: stroke,
            borderColor: color,
            borderRadius: 2,
            transform: [{ rotate: "45deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 14,
            height: 11,
            left: 5,
            bottom: 0,
            borderWidth: stroke,
            borderTopWidth: 0,
            borderColor: color,
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
            backgroundColor: focused ? colors.greenTint : colors.navBg,
          }}
        >
          <View
            style={{
              position: "absolute",
              width: 4,
              height: 7,
              left: 3.5,
              bottom: -stroke,
              borderWidth: stroke,
              borderBottomWidth: 0,
              borderColor: color,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
            }}
          />
        </View>
      </View>
    );
  }

  if (name === "read") {
    return (
      <View style={{ width: 25, height: 22 }}>
        <View
          style={{
            position: "absolute",
            width: 11,
            height: 17,
            left: 1.5,
            top: 2,
            borderWidth: stroke,
            borderRightWidth: stroke / 2,
            borderColor: color,
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 3,
            backgroundColor: focused ? colors.greenTint : "transparent",
            transform: [{ rotate: "-3deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 11,
            height: 17,
            right: 1.5,
            top: 2,
            borderWidth: stroke,
            borderLeftWidth: stroke / 2,
            borderColor: color,
            borderTopRightRadius: 4,
            borderBottomRightRadius: 3,
            backgroundColor: focused ? colors.greenTint : "transparent",
            transform: [{ rotate: "3deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            width: stroke,
            height: 15,
            left: (25 - stroke) / 2,
            top: 3,
            backgroundColor: color,
          }}
        />
      </View>
    );
  }

  if (name === "browse") {
    return (
      <View
        style={{
          width: 21,
          height: 21,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={{
              width: 9,
              height: 9,
              borderWidth: stroke,
              borderRadius: focused ? 3 : 2.5,
              borderColor: color,
              backgroundColor:
                focused && (index === 0 || index === 3) ? color : "transparent",
            }}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={{ width: 23, height: 21, justifyContent: "space-between" }}>
      {[7, 14, 10].map((knobLeft, index) => (
        <View key={index} style={{ height: 5, justifyContent: "center" }}>
          <View style={{ height: stroke, backgroundColor: color }} />
          <View
            style={{
              position: "absolute",
              width: 6,
              height: 6,
              left: knobLeft,
              borderRadius: 3,
              borderWidth: focused ? 0 : 1.5,
              borderColor: color,
              backgroundColor: focused ? color : colors.navBg,
            }}
          />
        </View>
      ))}
    </View>
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
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: theme === "practice" ? "Home" : "Today",
          tabBarIcon: ({ color, focused }) => (
            <NavIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="read"
        options={{
          title: "Read",
          tabBarIcon: ({ color, focused }) => (
            <NavIcon name="read" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, focused }) => (
            <NavIcon name="browse" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <NavIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />
      {/*
       * The reader lives inside the tab navigator so the bar stays visible
       * while reading, but it is not itself a tab — href: null keeps it out of
       * the bar. Its URL is unaffected: (tabs) is a group, so this is /surah/1.
       */}
      <Tabs.Screen name="surah/[id]" options={{ href: null }} />
    </Tabs>
  );
}
