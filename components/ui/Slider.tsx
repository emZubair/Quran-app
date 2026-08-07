import { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSettingsStore } from "../../stores/settingsStore";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  accessibilityLabel?: string;
}

const THUMB = 20;

/**
 * Replaces the old A− / A+ buttons. Built on PanResponder rather than a
 * package — the project keeps its native dependency surface near zero.
 */
export function Slider({
  value,
  min,
  max,
  onChange,
  accessibilityLabel,
}: SliderProps) {
  const colors = useThemeColors();
  const theme = useSettingsStore((s) => s.theme);
  const [width, setWidth] = useState(0);

  // PanResponder is created once, so it reads live props through a ref.
  const state = useRef({ width: 0, min, max, onChange });
  state.current = { width, min, max, onChange };

  // Page X of the track's left edge, captured when the gesture starts. Moves
  // report absolute page coordinates, so they need it to become track-local.
  const originX = useRef(0);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { pageX, locationX } = e.nativeEvent;
        originX.current = pageX - locationX;
        emit(locationX);
      },
      onPanResponderMove: (_e, gesture) =>
        emit(gesture.moveX - originX.current),
    }),
  ).current;

  function emit(x: number) {
    const { width: w, min: lo, max: hi, onChange: cb } = state.current;
    if (w <= 0) return;
    const usable = w - THUMB;
    const ratio = Math.min(1, Math.max(0, (x - THUMB / 2) / usable));
    cb(Math.round(lo + ratio * (hi - lo)));
  }

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const fillWidth = ratio * Math.max(0, width - THUMB) + THUMB / 2;
  const trackHeight = theme === "practice" ? 4 : 3;

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value }}
      style={styles.container}
      onLayout={onLayout}
      {...responder.panHandlers}
    >
      <View
        style={[
          styles.track,
          { height: trackHeight, backgroundColor: colors.fillWarm },
        ]}
      />
      <View
        style={[
          styles.fill,
          {
            height: trackHeight,
            width: fillWidth,
            backgroundColor: colors.green,
          },
        ]}
      />
      <View
        style={[
          styles.thumb,
          {
            left: fillWidth - THUMB / 2,
            backgroundColor:
              theme === "practice" ? colors.green : colors.surface,
            borderColor: colors.green,
            borderWidth: theme === "practice" ? 0 : 1.5,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 32,
    justifyContent: "center",
    flex: 1,
  },
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: 2,
  },
  fill: {
    position: "absolute",
    left: 0,
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
  },
});
