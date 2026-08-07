import { Pressable, View, StyleSheet } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSettingsStore } from "../../stores/settingsStore";

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
}

/**
 * The design specifies a 46 × 28 track with a 23 px thumb, which the platform
 * <Switch> cannot be styled into — so it is rebuilt here.
 */
export function Switch({
  value,
  onValueChange,
  accessibilityLabel,
}: SwitchProps) {
  const colors = useThemeColors();
  const theme = useSettingsStore((s) => s.theme);
  const thumbColor = theme === "practice" ? colors.onGreen : "#FFFFFF";

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      style={[
        styles.track,
        {
          backgroundColor: value ? colors.green : colors.fillWarm,
          justifyContent: "center",
          alignItems: value ? "flex-end" : "flex-start",
        },
      ]}
    >
      <View
        style={[
          styles.thumb,
          { backgroundColor: value ? thumbColor : "#FFFFFF" },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 28,
    borderRadius: 14,
    padding: 2.5,
  },
  thumb: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
  },
});
