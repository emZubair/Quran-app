import { ReactNode } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useSettingsStore,
  ARABIC_FONT_OPTIONS,
  TRANSLATION_EDITIONS,
  THEME_OPTIONS,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
} from "../../stores/settingsStore";
import { useThemeColors, useThemeMetrics } from "../../hooks/useThemeColors";
import { FONTS, arabicLineHeight, useDisplayFonts } from "../../lib/fonts";
import {
  Card,
  CheckCircle,
  Divider,
  Overline,
} from "../../components/ui/Primitives";
import { Switch } from "../../components/ui/Switch";
import { Slider } from "../../components/ui/Slider";

const BISMILLAH_PREVIEW = "بِسْمِ اللَّهِ";
const GOAL_OPTIONS = [5, 10, 15, 20, 30];

function Row({
  label,
  sublabel,
  value,
  chevron,
  right,
  onPress,
}: {
  label: string;
  sublabel?: string;
  value?: string;
  chevron?: boolean;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={styles.row}
      accessibilityRole={onPress ? "button" : undefined}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{ fontFamily: FONTS.sans, fontSize: 14.5, color: colors.text }}
        >
          {label}
        </Text>
        {sublabel && (
          <Text
            style={{
              fontFamily: FONTS.sans,
              fontSize: 11.5,
              color: colors.mutedSoft,
            }}
          >
            {sublabel}
          </Text>
        )}
      </View>
      {right}
      {value && (
        <Text
          style={{
            fontFamily: FONTS.sans,
            fontSize: 13.5,
            color: colors.muted,
          }}
        >
          {value}
        </Text>
      )}
      {chevron && (
        <Text style={{ color: colors.muted, fontSize: 15, marginLeft: 6 }}>
          ›
        </Text>
      )}
    </Pressable>
  );
}

function Section({
  title,
  accessory,
  children,
}: {
  title: string;
  accessory?: ReactNode;
  children: ReactNode;
}) {
  const metrics = useThemeMetrics();
  return (
    <View style={{ marginTop: 22, paddingHorizontal: metrics.gutter, gap: 10 }}>
      <View style={styles.sectionHead}>
        <Overline>{title}</Overline>
        {accessory}
      </View>
      <Card>{children}</Card>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useThemeColors();
  const metrics = useThemeMetrics();
  const fonts = useDisplayFonts();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const {
    fontSize,
    setFontSize,
    arabicFont,
    setArabicFont,
    showTranslation,
    setShowTranslation,
    theme,
    setTheme,
    tajweed,
    setTajweed,
    wordMeanings,
    setWordMeanings,
    translations,
    toggleTranslation,
    dailyGoalMinutes,
    setDailyGoalMinutes,
  } = useSettingsStore();

  const practice = theme === "practice";
  const family = arabicFont === "AmiriQuran" ? FONTS.arabic : undefined;
  const sidePadding = width > 768 ? Math.round(width * 0.08) : 0;

  function cycleFont() {
    const index = ARABIC_FONT_OPTIONS.findIndex((o) => o.value === arabicFont);
    setArabicFont(
      ARABIC_FONT_OPTIONS[(index + 1) % ARABIC_FONT_OPTIONS.length].value,
    );
  }

  function cycleGoal() {
    const index = GOAL_OPTIONS.indexOf(dailyGoalMinutes);
    setDailyGoalMinutes(GOAL_OPTIONS[(index + 1) % GOAL_OPTIONS.length]);
  }

  function cycleTheme() {
    const index = THEME_OPTIONS.findIndex((o) => o.value === theme);
    setTheme(THEME_OPTIONS[(index + 1) % THEME_OPTIONS.length].value);
  }

  const fontLabel =
    ARABIC_FONT_OPTIONS.find((o) => o.value === arabicFont)?.label ?? "";
  const themeLabel = THEME_OPTIONS.find((o) => o.value === theme)?.label ?? "";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 14,
        paddingBottom: 40,
        paddingHorizontal: sidePadding,
      }}
    >
      <Text
        style={{
          fontFamily: practice ? FONTS.sansExtraBold : fonts.display,
          fontSize: practice ? 26 : 30,
          color: colors.text,
          paddingHorizontal: metrics.gutter,
        }}
      >
        Settings
      </Text>

      <Section title="Arabic text">
        <View style={styles.previewBlock}>
          <Text
            style={{
              fontFamily: family,
              fontSize: 28,
              lineHeight: arabicLineHeight(28, family ?? ""),
              color: colors.text,
              textAlign: "center",
            }}
          >
            {BISMILLAH_PREVIEW}
          </Text>
          <View style={styles.sliderRow}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 15,
                color: colors.muted,
              }}
            >
              A
            </Text>
            <Slider
              value={fontSize}
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              onChange={setFontSize}
              accessibilityLabel="Arabic text size"
            />
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 22,
                color: colors.muted,
              }}
            >
              A
            </Text>
          </View>
        </View>
        <Divider />
        <Row label="Typeface" value={fontLabel} chevron onPress={cycleFont} />
        <Divider />
        <Row
          label="Tajweed colouring"
          sublabel={
            practice
              ? "idghām · madd · ghunnah · qalqalah"
              : "Colour-codes recitation rules"
          }
          right={
            <Switch
              value={tajweed}
              onValueChange={setTajweed}
              accessibilityLabel="Tajweed colouring"
            />
          }
        />
      </Section>

      <Section
        title="Translations"
        accessory={
          <Text
            style={{
              fontFamily: practice ? FONTS.sansBold : FONTS.sansSemiBold,
              fontSize: 11.5,
              color: colors.green,
            }}
          >
            {translations.length} shown
          </Text>
        }
      >
        {TRANSLATION_EDITIONS.map((edition, i) => (
          <View key={edition.id}>
            {i > 0 && <Divider />}
            <Row
              label={edition.name}
              sublabel={`${edition.language} · ${edition.year}`}
              right={
                <CheckCircle checked={translations.includes(edition.id)} />
              }
              onPress={() => toggleTranslation(edition.id)}
            />
          </View>
        ))}
        <Divider />
        <Row
          label="Show translation in reader"
          right={
            <Switch
              value={showTranslation}
              onValueChange={setShowTranslation}
              accessibilityLabel="Show translation"
            />
          }
        />
      </Section>

      <Section title={practice ? "Habit" : "Reading"}>
        <Row
          label="Daily goal"
          value={`${dailyGoalMinutes} min`}
          chevron
          onPress={cycleGoal}
        />
        <Divider />
        <Row
          label="Word meanings on tap"
          right={
            <Switch
              value={wordMeanings}
              onValueChange={setWordMeanings}
              accessibilityLabel="Word meanings on tap"
            />
          }
        />
      </Section>

      <Section title="Appearance">
        <Row label="Theme" value={themeLabel} chevron onPress={cycleTheme} />
      </Section>

      {/*
       * Attribution is preserved verbatim from the pre-redesign Settings —
       * the Play Console and App Store listings depend on it.
       */}
      <Section title="About">
        <View style={styles.about}>
          <Text style={[styles.aboutText, { color: colors.muted }]}>
            Quran text (Imlaei / standard script) from the Tanzil project
            (tanzil.net).
          </Text>
          <Text style={[styles.aboutText, { color: colors.muted }]}>
            English translation: Marmaduke Pickthall, 1930 (public domain).
          </Text>
          <Text style={[styles.aboutText, { color: colors.muted }]}>
            Data compiled via the Al Quran Cloud API (alquran.cloud).
          </Text>
          <Text style={[styles.aboutText, { color: colors.muted }]}>
            Arabic typeface: Amiri Quran (SIL Open Font License).
          </Text>
          <Text style={[styles.aboutText, { color: colors.muted }]}>
            Interface typefaces: Newsreader and Plus Jakarta Sans (SIL Open Font
            License).
          </Text>
          <Text style={[styles.aboutText, { color: colors.muted }]}>
            Version {Constants.expoConfig?.version ?? "1.0.0"} • No ads • No
            tracking — everything stays on your device.
          </Text>
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  previewBlock: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 10,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  about: {
    padding: 16,
    gap: 4,
  },
  aboutText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
