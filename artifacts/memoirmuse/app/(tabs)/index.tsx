import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";

const FEATURES = [
  {
    id: "timeline",
    label: "Timeline",
    description: "Journey through key life milestones",
    icon: "clock" as const,
    route: "/(tabs)/timeline" as const,
    gradient: [COLORS.primary, COLORS.primaryDark] as [string, string],
  },
  {
    id: "ar",
    label: "AR Scanner",
    description: "Reveal 3D holographic artifacts",
    icon: "camera" as const,
    route: "/(tabs)/ar" as const,
    gradient: [COLORS.accent, "#7A5A14"] as [string, string],
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Explore the historical collection",
    icon: "image" as const,
    route: "/(tabs)/gallery" as const,
    gradient: ["#4A7A8C", "#2E5A6A"] as [string, string],
  },
  {
    id: "quiz",
    label: "Historia Quiz",
    description: "Test your heritage knowledge",
    icon: "help-circle" as const,
    route: "/(tabs)/quiz" as const,
    gradient: [COLORS.primaryLight, COLORS.primaryDark] as [string, string],
  },
  {
    id: "map",
    label: "Heritage Map",
    description: "Discover cultural sites in Marikina",
    icon: "map-pin" as const,
    route: "/(tabs)/map" as const,
    gradient: ["#6B4A8C", "#4A2E6A"] as [string, string],
  },
];

function FeatureCard({
  item,
  index,
  onPress,
}: {
  item: typeof FEATURES[0];
  index: number;
  onPress: (route: string) => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay: 200 + index * 70,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        delay: 200 + index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.cardInner}
        onPress={() => onPress(item.route)}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={item.gradient}
          style={styles.cardGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardIconBox}>
            <Feather name={item.icon} size={26} color="#fff" />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </View>
          <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.5)" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(heroAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(statsAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = async (route: string) => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ paddingTop: topPad, paddingBottom: 130 }]}
    >
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, "#A84040"]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.heroInner, { opacity: heroAnim }]}>
          <Text style={styles.heroApp}>MEMOIRMUSE</Text>
          <View style={styles.heroDivLine} />
          <Text style={styles.heroName}>Pedro S.{"\n"}Tolentino</Text>
          <Text style={styles.heroTagline}>Father of Tagalog Zarzuela</Text>
          <View style={styles.heroMeta}>
            <Feather name="calendar" size={12} color="rgba(255,255,255,0.55)" />
            <Text style={styles.heroMetaText}>1858 – 1913</Text>
            <View style={styles.heroMetaDot} />
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.55)" />
            <Text style={styles.heroMetaText}>Marikina</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.statsRow, { opacity: statsAnim }]}>
        {[
          { value: "55+", label: "Zarzuelas" },
          { value: "1900", label: "Masterpiece" },
          { value: "55", label: "Years Lived" },
        ].map((s, i) => (
          <React.Fragment key={s.value}>
            {i > 0 && <View style={styles.statSep} />}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </Animated.View>

      <View style={styles.bioWrap}>
        <Text style={styles.sectionLabel}>BIOGRAPHY</Text>
        <Text style={styles.bioText}>
          Pedro Serrano Tolentino was a celebrated playwright, nationalist, and pioneer
          of Filipino theatrical arts. Through his zarzuelas and allegorical plays, he wove
          cultural resistance into art — leaving an enduring legacy that inspires generations.
        </Text>
        <TouchableOpacity
          style={styles.bioLink}
          onPress={() => handlePress("/(tabs)/timeline")}
          activeOpacity={0.7}
        >
          <Text style={styles.bioLinkText}>Explore his timeline</Text>
          <Feather name="arrow-right" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionLabel}>EXPLORE</Text>
        <View style={styles.featuresList}>
          {FEATURES.map((item, index) => (
            <FeatureCard
              key={item.id}
              item={item}
              index={index}
              onPress={handlePress}
            />
          ))}
        </View>
      </View>

      <View style={styles.quoteWrap}>
        <View style={styles.quoteAccent} />
        <View style={styles.quoteBody}>
          <Text style={styles.quoteText}>
            "Art is the voice of the soul of a nation — and the Filipino soul will not be silenced."
          </Text>
          <Text style={styles.quoteAttrib}>— Inspired by Pedro S. Tolentino</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  hero: {
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 44,
  },
  heroInner: { alignItems: "center", gap: 10 },
  heroApp: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 4,
  },
  heroDivLine: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  heroName: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
    lineHeight: 50,
  },
  heroTagline: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    fontStyle: "italic",
    textAlign: "center",
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  heroMetaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  heroMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 28,
    paddingVertical: 22,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: {
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
  statSep: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 8,
  },

  bioWrap: {
    paddingHorizontal: 28,
    paddingVertical: 26,
    backgroundColor: COLORS.surfaceWarm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
    letterSpacing: 2.5,
  },
  bioText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 26,
  },
  bioLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  bioLinkText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.primary,
  },

  featuresSection: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 4,
    gap: 14,
  },
  featuresList: {
    gap: 10,
  },

  cardWrap: {
    width: "100%",
  },
  cardInner: {
    borderRadius: 18,
    overflow: "hidden",
  },
  cardGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardTextWrap: {
    flex: 1,
    gap: 4,
  },
  cardLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },

  quoteWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 8,
  },
  quoteAccent: {
    width: 3,
    minHeight: 60,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  quoteBody: { flex: 1, gap: 8 },
  quoteText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  quoteAttrib: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
  },
});
