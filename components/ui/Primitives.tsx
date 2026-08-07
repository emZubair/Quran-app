import { ReactNode } from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useThemeColors, useThemeMetrics } from "../../hooks/useThemeColors";
import { useSettingsStore } from "../../stores/settingsStore";
import { FONTS, overline } from "../../lib/fonts";

/** Mono uppercase section label, e.g. AYAH OF THE DAY. */
export function Overline({
  children,
  size = 10,
  em = 0.16,
  color,
  style,
}: {
  children: ReactNode;
  size?: number;
  em?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useThemeColors();
  return (
    <Text
      style={[
        overline(size, em),
        { color: color ?? colors.mutedSoft },
        style as never,
      ]}
    >
      {children}
    </Text>
  );
}

/** Bordered surface card — the base container for every grouped section. */
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useThemeColors();
  const metrics = useThemeMetrics();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: metrics.cardRadius,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Divider() {
  const colors = useThemeColors();
  return <View style={{ height: 1, backgroundColor: colors.lineSoft }} />;
}

/** Flat progress track with a fill, used by the Continue card and juz rows. */
export function ProgressBar({
  progress,
  width,
  height = 3,
  trackColor,
  fillColor,
}: {
  progress: number;
  width?: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
}) {
  const colors = useThemeColors();
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <View
      style={{
        width,
        height,
        borderRadius: height / 2,
        backgroundColor: trackColor ?? colors.lineAlt,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: "100%",
          borderRadius: height / 2,
          backgroundColor: fillColor ?? colors.green,
        }}
      />
    </View>
  );
}

/**
 * Circular progress ring built from two rotated half-discs behind a centre
 * disc — the handoff explicitly rules out adding react-native-svg for this.
 *
 * Each side is a half-width clip holding a green semicircle pinned to the
 * ring's centre. Unrotated, the right semicircle covers 12→6 o'clock; rotating
 * it clockwise by `p·360 − 180` slides its trailing edge to the progress angle
 * and pushes the excess out of the clip. The left side repeats this for the
 * second half of the sweep, so the two together cover a full turn.
 */
export function ProgressRing({
  progress,
  size = 92,
  thickness = 8,
  children,
}: {
  progress: number;
  size?: number;
  thickness?: number;
  children?: ReactNode;
}) {
  const colors = useThemeColors();
  const clamped = Math.min(1, Math.max(0, progress));
  const half = size / 2;

  const halfDisc = (side: "left" | "right", sweep: number) => {
    const isRight = side === "right";
    return (
      <View
        style={[
          styles.ringHalf,
          { width: half, height: size, [isRight ? "right" : "left"]: 0 },
        ]}
      >
        <View
          style={{
            width: half,
            height: size,
            backgroundColor: colors.green,
            borderTopRightRadius: isRight ? half : 0,
            borderBottomRightRadius: isRight ? half : 0,
            borderTopLeftRadius: isRight ? 0 : half,
            borderBottomLeftRadius: isRight ? 0 : half,
            transformOrigin: isRight ? "left center" : "right center",
            transform: [{ rotate: `${sweep * 360 - 180}deg` }],
          }}
        />
      </View>
    );
  };

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: half,
        backgroundColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {halfDisc("right", Math.min(0.5, clamped))}
      {halfDisc("left", Math.max(0, clamped - 0.5))}
      <View
        style={{
          width: size - thickness * 2,
          height: size - thickness * 2,
          borderRadius: half,
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </View>
    </View>
  );
}

/** Check circle for the translations list: filled green tick, or empty ring. */
export function CheckCircle({ checked }: { checked: boolean }) {
  const colors = useThemeColors();
  const theme = useSettingsStore((s) => s.theme);
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: checked ? colors.green : "transparent",
        borderWidth: checked ? 0 : 1.5,
        borderColor: colors.checkOff,
      }}
    >
      {checked && (
        <Text
          style={{
            color: theme === "practice" ? colors.onGreen : "#FFFFFF",
            fontSize: 11,
            fontFamily: FONTS.sansBold,
            lineHeight: 13,
          }}
        >
          ✓
        </Text>
      )}
    </View>
  );
}

/**
 * The ornamental rule above the surah name in the Mushaf reader: two hairlines
 * flanking a small square rotated 45°.
 */
export function Ornament() {
  const colors = useThemeColors();
  return (
    <View style={styles.ornament}>
      <View
        style={[styles.ornamentRule, { backgroundColor: colors.lineAlt }]}
      />
      <View
        style={{
          width: 5,
          height: 5,
          backgroundColor: colors.gold,
          transform: [{ rotate: "45deg" }],
        }}
      />
      <View
        style={[styles.ornamentRule, { backgroundColor: colors.lineAlt }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ringHalf: {
    position: "absolute",
    top: 0,
    overflow: "hidden",
  },
  ornament: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "stretch",
  },
  ornamentRule: {
    flex: 1,
    height: 1,
  },
});
