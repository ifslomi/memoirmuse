import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";

const { width } = Dimensions.get("window");

const SECTIONS = [
  {
    id: "timeline",
    label: "Timeline",
    description: "Life milestones",
    icon: "clock" as const,
    route: "/(tabs)/timeline" as const,
    color: COLORS.primary,
    gradient: [COLORS.primary, COLORS.primaryDark] as [string, string],
  },
  {
    id: "ar",
    label: "AR Scanner",
    description: "Scan & discover",
    icon: "camera" as const,
    route: "/(tabs)/ar" as const,
    color: COLORS.accent,
    gradient: [COLORS.accent, "#9A6B1A"] as [string, string],
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Historical artifacts",
    icon: "image" as const,
    route: "/(tabs)/gallery" as const,
    color: "#4A7A8C",
    gradient: ["#4A7A8C", "#2E5A6A"] as [string, string],
  },
  {
    id: "quiz",
    label: "Quiz",
    description: "Test your knowledge",
    icon: "help-circle" as const,
    route: "/(tabs)/quiz" as const,
    color: COLORS.success,
    gradient: [COLORS.success, "#2E6040"] as [string, string],
  },
  {
    id: "map",
    label: "Map",
    description: "Heritage sites",
    icon: "map-pin" as const,
    route: "/(tabs)/map" as const,
    color: "#6B4A8C",
    gradient: ["#6B4A8C", "#4A2E6A"] as [string, string],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handlePress = async (route: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad, paddingBottom: Platform.OS === "web" ? 120 : 100 },
      ]}
    >
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroOverlay}>
          <View style={styles.decorativeLine} />
          <Text style={styles.heroSubtitle}>MEMOIRMUSE</Text>
          <Text style={styles.heroTitle}>Pedro S.{"\n"}Tolentino</Text>
          <Text style={styles.heroTagline}>Father of Tagalog Zarzuela</Text>
          <View style={styles.heroMeta}>
            <Text style={styles.heroDate}>1858 – 1913</Text>
            <View style={styles.heroDivider} />
            <Text style={styles.heroPlace}>Marikina, Philippines</Text>
          </View>
          <View style={styles.decorativeLine} />
        </View>
      </LinearGradient>

      <View style={styles.bioSection}>
        <Text style={styles.sectionLabel}>BIOGRAPHY</Text>
        <Text style={styles.bioText}>
          Pedro Serrano Tolentino was a celebrated playwright, nationalist, and
          pioneer of Filipino theatrical arts. Through his zarzuelas and allegorical
          plays, he wove cultural resistance into art, leaving an enduring legacy
          that continues to inspire generations.
        </Text>
        <TouchableOpacity
          style={styles.readMoreBtn}
          onPress={() => handlePress("/(tabs)/timeline")}
          activeOpacity={0.7}
        >
          <Text style={styles.readMoreText}>Explore his story</Text>
          <Feather name="arrow-right" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>55+</Text>
          <Text style={styles.statLabel}>Zarzuelas Written</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>1900</Text>
          <Text style={styles.statLabel}>Masterpiece Written</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>55</Text>
          <Text style={styles.statLabel}>Years of Life</Text>
        </View>
      </View>

      <Text style={styles.exploreSectionTitle}>EXPLORE</Text>

      <View style={styles.grid}>
        {SECTIONS.map((section, index) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.gridItem,
              index === 0 && styles.gridItemWide,
            ]}
            onPress={() => handlePress(section.route)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={section.gradient}
              style={styles.gridGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.gridIconContainer}>
                <Feather name={section.icon} size={24} color={COLORS.white} />
              </View>
              <Text style={styles.gridLabel}>{section.label}</Text>
              <Text style={styles.gridDescription}>{section.description}</Text>
              <Feather
                name="chevron-right"
                size={16}
                color="rgba(255,255,255,0.6)"
                style={styles.gridArrow}
              />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.quoteSection}>
        <View style={styles.quoteBar} />
        <Text style={styles.quoteText}>
          "Art is the voice of the soul of a nation — and the Filipino soul will not be silenced."
        </Text>
        <Text style={styles.quoteAttrib}>— Inspired by Pedro S. Tolentino</Text>
      </View>
    </ScrollView>
  );
}

const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 0,
  },
  hero: {
    width: "100%",
    minHeight: 280,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  heroOverlay: {
    alignItems: "center",
    gap: 8,
  },
  decorativeLine: {
    width: 60,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginVertical: 4,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    lineHeight: 46,
  },
  heroTagline: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    textAlign: "center",
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  heroDate: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  heroDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  heroPlace: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  bioSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: COLORS.surfaceWarm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 10,
  },
  bioText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  readMoreText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.primary,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 8,
  },
  exploreSectionTitle: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.primary,
    letterSpacing: 2,
  },
  grid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
  },
  gridItemWide: {
    width: "100%",
  },
  gridGradient: {
    padding: 20,
    minHeight: 120,
    justifyContent: "space-between",
  },
  gridIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: COLORS.white,
  },
  gridDescription: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  gridArrow: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  quoteSection: {
    marginHorizontal: 24,
    marginTop: 28,
    paddingLeft: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    flexWrap: "wrap",
  },
  quoteBar: {
    width: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    alignSelf: "stretch",
    minHeight: 60,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  quoteAttrib: {
    width: "100%",
    paddingLeft: 17,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
    marginTop: 6,
  },
});
