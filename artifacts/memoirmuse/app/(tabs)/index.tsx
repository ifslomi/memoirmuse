import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";

const { width: W } = Dimensions.get("window");

const DISCOVERIES = [
  {
    id: "1",
    era: "CIRCA 1902 • THEATRICAL ERA",
    grade: "RARE GRADE",
    gradeColor: COLORS.tertiaryFixedDim,
    title: "The Kahapon, Ngayon at Bukas Script",
    desc: "A hand-written draft of Tolentino's most celebrated allegorical play discovered at the Marikina archive.",
    icon: "book-open" as const,
    gradColors: ["#1c1b1b", "#201f1f"] as const,
  },
  {
    id: "2",
    era: "CIRCA 1896 • REVOLUTION",
    grade: "EPIC RELIC",
    gradeColor: COLORS.primaryContainer,
    title: "The Nationalist Manifesto",
    desc: "A rare document outlining Tolentino's vision for Filipino cultural sovereignty through the arts.",
    icon: "file-text" as const,
    gradColors: ["#0e1520", "#0d1524"] as const,
  },
  {
    id: "3",
    era: "CIRCA 1858 • EARLY LIFE",
    grade: "COMMON GRADE",
    gradeColor: COLORS.onSurfaceVariant,
    title: "The Tolentino Birth Registry",
    desc: "Parish record from Quingua, Bulacan confirming Pedro S. Tolentino's birth date and lineage.",
    icon: "archive" as const,
    gradColors: ["#1c1b1b", "#201f1f"] as const,
  },
];

function AnimatedCard({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: anim, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

function PressableCard({ onPress, children, style }: { onPress: () => void; children: React.ReactNode; style?: any }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 8 }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start()
      }
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const go = async (route: string) => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.topBar, { paddingTop: topPad + 10, opacity: headerAnim }]}>
        <View style={styles.topLeft}>
          <View style={styles.avatarRing}>
            <Feather name="user" size={18} color={COLORS.onSurface} />
          </View>
          <View>
            <Text style={styles.appName}>MEMOIRMUSE</Text>
            <Text style={styles.userLevel}>Level 14 Archivist</Text>
          </View>
        </View>
        <View style={styles.xpChip}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Feather name="star" size={13} color={COLORS.tertiaryFixedDim} />
          </Animated.View>
          <Text style={styles.xpText}>1,250 XP</Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: topPad + 72 }}
      >
        <AnimatedCard delay={80}>
          <PressableCard onPress={() => go("/(tabs)/ar")} style={styles.expeditionCard}>
            <LinearGradient
              colors={["#0d1520", "#0e0e0e"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.expGlowTop} />
            <View style={styles.expGlowRight} />

            <View style={styles.expContent}>
              <View style={styles.expStatusRow}>
                <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.expSubLabel}>ACTIVE EXPEDITION</Text>
              </View>
              <Text style={styles.expTitle}>
                The Victorian{"\n"}
                <Text style={styles.expTitleAccent}>Underground</Text>
              </Text>
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryContainer]}
                    style={[styles.progressFill, { width: "65%" }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.progressPct}>65%</Text>
              </View>
              <View style={styles.nextLocRow}>
                <Feather name="map-pin" size={13} color={COLORS.primaryContainer} />
                <View>
                  <Text style={styles.nextLocLabel}>NEXT ARTIFACT LOCATION</Text>
                  <Text style={styles.nextLocName}>Old Station Vaults</Text>
                </View>
              </View>
            </View>

            <View style={styles.expImageArea}>
              <View style={styles.playCircleGlow} />
              <View style={styles.playCircle}>
                <Feather name="play" size={28} color={COLORS.primaryContainer} />
              </View>
              <Text style={styles.resumeLabel}>Resume{"\n"}Journey</Text>
            </View>
          </PressableCard>
        </AnimatedCard>

        <AnimatedCard delay={160} style={styles.bentoGrid}>
          <PressableCard
            onPress={() => go("/(tabs)/quiz")}
            style={styles.bentoCard}
          >
            <LinearGradient colors={["#1c1b1b", "#1a1a1a"]} style={StyleSheet.absoluteFill} />
            <View style={[styles.bentoIconRing, { backgroundColor: COLORS.tertiaryContainer + "15" }]}>
              <Feather name="help-circle" size={22} color={COLORS.tertiaryFixedDim} />
            </View>
            <Text style={styles.bentoTitle}>Quizzes</Text>
            <Text style={styles.bentoDesc}>Test your era knowledge</Text>
          </PressableCard>

          <PressableCard
            onPress={() => go("/(tabs)/gallery")}
            style={styles.bentoCard}
          >
            <LinearGradient colors={["#1c1b1b", "#1a1a1a"]} style={StyleSheet.absoluteFill} />
            <View style={[styles.bentoIconRing, { backgroundColor: COLORS.primaryContainer + "12" }]}>
              <Feather name="award" size={22} color={COLORS.primaryContainer} />
            </View>
            <Text style={styles.bentoTitle}>Achievements</Text>
            <Text style={styles.bentoDesc}>8 Unlocked this week</Text>
          </PressableCard>
        </AnimatedCard>

        <View style={styles.section}>
          <AnimatedCard delay={220} style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Discoveries</Text>
            <TouchableOpacity onPress={() => go("/(tabs)/timeline")} style={styles.archiveBtn}>
              <Text style={styles.archiveBtnText}>ARCHIVE VIEW</Text>
              <Feather name="arrow-right" size={13} color={COLORS.primaryContainer} />
            </TouchableOpacity>
          </AnimatedCard>

          {DISCOVERIES.map((d, i) => (
            <AnimatedCard key={d.id} delay={280 + i * 80}>
              <PressableCard
                onPress={() => go("/(tabs)/gallery")}
                style={styles.discoveryCard}
              >
                <LinearGradient
                  colors={d.gradColors}
                  style={styles.discThumb}
                >
                  <View style={styles.discThumbInner}>
                    <Feather name={d.icon} size={26} color={COLORS.primaryContainer} />
                  </View>
                  <View style={[styles.discGrade, { borderColor: d.gradeColor + "50" }]}>
                    <Text style={[styles.discGradeText, { color: d.gradeColor }]}>{d.grade}</Text>
                  </View>
                </LinearGradient>
                <View style={styles.discBody}>
                  <Text style={styles.discEra}>{d.era}</Text>
                  <Text style={styles.discTitle}>{d.title}</Text>
                  <Text style={styles.discDesc} numberOfLines={2}>{d.desc}</Text>
                </View>
              </PressableCard>
            </AnimatedCard>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "rgba(19,19,19,0.85)",
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primaryContainer + "60",
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#00e5ff",
    letterSpacing: 1.5,
  },
  userLevel: {
    fontSize: 9,
    fontFamily: "Manrope_600SemiBold",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  xpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "25",
  },
  xpText: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#00e5ff",
    letterSpacing: 0.5,
  },

  scroll: { flex: 1 },

  expeditionCard: {
    margin: 16,
    marginBottom: 10,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.1)",
    flexDirection: "row",
    minHeight: 220,
    shadowColor: "#00e5ff",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  expGlowTop: {
    position: "absolute",
    top: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#00e5ff08",
  },
  expGlowRight: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 140,
    backgroundColor: "rgba(0,229,255,0.03)",
  },
  expContent: { flex: 1, padding: 22, gap: 14, justifyContent: "center" },
  expStatusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  expSubLabel: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  expTitle: {
    fontSize: 30,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onSurface,
    lineHeight: 36,
  },
  expTitleAccent: { color: COLORS.primaryContainer },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceContainerHighest,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3, shadowColor: "#00e5ff", shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  progressPct: { fontSize: 12, fontFamily: "SpaceGrotesk_600SemiBold", color: COLORS.primaryContainer },
  nextLocRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.surfaceContainerHighest + "60",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "15",
  },
  nextLocLabel: {
    fontSize: 8,
    fontFamily: "Manrope_700Bold",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  nextLocName: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurface },

  expImageArea: {
    width: 120,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(0,229,255,0.06)",
  },
  playCircleGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#00e5ff0c",
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "rgba(0,229,255,0.3)",
    backgroundColor: "rgba(0,229,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  resumeLabel: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onSurface,
    textAlign: "center",
    lineHeight: 17,
  },

  bentoGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 4,
  },
  bentoCard: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "18",
    minHeight: 120,
  },
  bentoIconRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  bentoTitle: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onSurface,
  },
  bentoDesc: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: COLORS.onSurfaceVariant,
    lineHeight: 16,
  },

  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 22, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  archiveBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  archiveBtnText: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: COLORS.primaryContainer,
    letterSpacing: 1.2,
  },

  discoveryCard: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "18",
    backgroundColor: COLORS.surfaceContainerLow,
  },
  discThumb: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  discThumbInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,229,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  discGrade: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(53,53,52,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  discGradeText: {
    fontSize: 9,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  discBody: { padding: 16, gap: 6 },
  discEra: {
    fontSize: 9,
    fontFamily: "Manrope_600SemiBold",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  discTitle: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onSurface,
  },
  discDesc: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
  },
});
