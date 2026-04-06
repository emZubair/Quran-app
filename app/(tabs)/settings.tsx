import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingsStore } from "../../stores/settingsStore";
import { useThemeColors } from "../../hooks/useThemeColors";

export default function SettingsScreen() {
  const {
    fontSize,
    showTranslation,
    darkMode,
    setFontSize,
    setShowTranslation,
    setDarkMode,
  } = useSettingsStore();
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>⚙️ Settings</Text>
      </View>

      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Arabic Font Size
        </Text>
        <View style={styles.sliderRow}>
          <Text style={[styles.sliderLabel, { color: colors.primary }]}>
            {fontSize}
          </Text>
          <View style={styles.sliderContainer}>
            <View style={styles.slider}>
              <Text
                style={[styles.previewText, { color: colors.text, fontSize }]}
                numberOfLines={1}
              >
                بِسْمِ ٱللَّهِ
              </Text>
            </View>
            <View style={styles.sliderButtons}>
              <Text
                style={[
                  styles.sliderBtn,
                  {
                    color: colors.primary,
                    backgroundColor: colors.primaryLighter,
                  },
                ]}
                onPress={() => setFontSize(Math.max(18, fontSize - 2))}
              >
                A−
              </Text>
              <Text
                style={[
                  styles.sliderBtn,
                  {
                    color: colors.primary,
                    backgroundColor: colors.primaryLighter,
                  },
                ]}
                onPress={() => setFontSize(Math.min(48, fontSize + 2))}
              >
                A+
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <View style={styles.toggleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Show Translation
          </Text>
          <Switch
            value={showTranslation}
            onValueChange={setShowTranslation}
            trackColor={{ false: "#DDD", true: colors.primaryLight }}
            thumbColor={showTranslation ? colors.primary : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <View style={styles.toggleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Dark Mode
          </Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#DDD", true: colors.primaryLight }}
            thumbColor={darkMode ? colors.primary : "#f4f3f4"}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  section: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: "700",
    width: 40,
    textAlign: "center",
  },
  sliderContainer: {
    flex: 1,
    marginLeft: 12,
  },
  slider: {
    alignItems: "center",
    paddingVertical: 8,
  },
  previewText: {},
  sliderButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderBtn: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
