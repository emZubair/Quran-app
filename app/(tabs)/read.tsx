import { useCallback } from "react";
import { View } from "react-native";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useBookmarkStore } from "../../stores/bookmarkStore";
import { useThemeColors } from "../../hooks/useThemeColors";

/**
 * Read is a launcher, not a screen: focusing it opens the reader at the
 * last-read position. It also flips the selected tab back to Home first, so
 * dismissing the reader lands on Home instead of re-triggering this effect.
 */
export default function ReadTab() {
  const router = useRouter();
  const navigation = useNavigation();
  const lastRead = useBookmarkStore((s) => s.lastRead);
  const colors = useThemeColors();

  useFocusEffect(
    useCallback(() => {
      const target = lastRead ?? { surah: 1, ayah: 1 };
      navigation.navigate("index" as never);
      router.push(`/surah/${target.surah}?ayah=${target.ayah}`);
    }, [lastRead, navigation, router]),
  );

  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
