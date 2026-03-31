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

const QUICK_ACTIONS = [
  { id: "map", label: "Map", desc: "Heritage locations", icon: "map-pin" as const, route: "/(tabs)/map" as const },
  { id: "quiz", label: "Quizzes", desc: "Test your knowledge", icon: "help-circle" as const, route: "/(tabs)/quiz" as const },
  { id: "gallery", label: "Achievements", desc: "8 unlocked", icon: "award" as const, route: "/(tabs)/gallery" as const },
];

const DISCOVERIES = [
  {
    id: "1",
    era: "CIRCA 1902 • THEATRICAL ERA",
    grade: "RARE GRADE",
    gradeColor: COLORS.tertiaryFixedDim,
    title: "The Kahapon, Ngayon at Bukas Script",
    desc: "A hand-written draft of Tolentino's most celebrated allegorical play discovered at the Marikina archive.",
  },
  {
    id: "2",
    era: "CIRCA 1896 • REVOLUTION",
    grade: "EPIC RELIC",
    gradeColor: COLORS.primaryContainer,
    title: "The Nationalist Manifesto",
    desc: "A rare document outlining Tolentino's vision for Filipino cultural sovereignty through the arts.",
  },
  {
    id: "3",
    era: "CIRCA 1858 • EARLY LIFE",
    grade: "COMMON GRADE",
    gradeColor: COLORS.onSurfaceVariant,
    title: "The Tolentino Birth Registry",
    desc: "Parish record from Quingua, Bulacan confirming Pedro S. Tolentino's birth date and lineage.",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const headerFade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const go = async (route: string) => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.topBar, { paddingTop: topPad + 12, opacity: headerFade }]}>
        <View style={styles.topLeft}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Feather name="user" size={18} color={COLORS.primaryContainer} />
            </View>
          </View>
          <View>
            <Text style={styles.appName}>THE CHRONOS INTERFACE</Text>
            <Text style={styles.userLevel}>Level 7 Archivist</Text>
          </View>
        </View>
        <View style={styles.xpChip}>
          <Feather name="star" size={13} color={COLORS.tertiaryFixedDim} />
          <Text style={styles.xpText}>1,250 XP</Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130, paddingTop: topPad + 68 }}
      >
        <Animated.View style={{ opacity: contentFade }}>
          <View style={styles.expeditionCard}>
            <LinearGradient
              colors={["#1c1b1b", "#0e0e0e"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.expeditionGlow} />
            <View style={styles.expContent}>
              <Text style={styles.expSubLabel}>ACTIVE EXPEDITION</Text>
              <Text style={styles.expTitle}>
                The Marikina{"\n"}
                <Text style={styles.expTitleCyan}>Heritage Trail</Text>
              </Text>
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryContainer]}
                    style={[styles.progressFill, { width: "45%" }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.progressPct}>45%</Text>
              </View>
              <View style={styles.nextLocRow}>
                <View style={styles.nextLocChip}>
                  <Feather name="map-pin" size={13} color={COLORS.primaryContainer} />
                  <Text style={styles.nextLocLabel}>NEXT ARTIFACT LOCATION</Text>
                </View>
                <Text style={styles.nextLocName}>Tolentino Heritage Museum</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.resumeBtn}
              onPress={() => go("/(tabs)/ar")}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryContainer]}
                style={styles.resumeGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather name="play" size={18} color="#00363d" />
                <Text style={styles.resumeText}>Resume Journey</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.quickCard}
                onPress={() => go(a.route)}
                activeOpacity={0.8}
              >
                <View style={styles.quickIconRing}>
                  <Feather name={a.icon} size={22} color={COLORS.tertiaryFixedDim} />
                </View>
                <Text style={styles.quickLabel}>{a.label}</Text>
                <Text style={styles.quickDesc}>{a.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Recent Discoveries</Text>
              <TouchableOpacity onPress={() => go("/(tabs)/timeline")} style={styles.archiveBtn}>
                <Text style={styles.archiveBtnText}>Archive</Text>
                <Feather name="arrow-right" size={13} color={COLORS.primaryContainer} />
              </TouchableOpacity>
            </View>

            {DISCOVERIES.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={styles.discoveryCard}
                activeOpacity={0.8}
                onPress={() => go("/(tabs)/gallery")}
              >
                <View style={styles.discThumb}>
                  <LinearGradient
                    colors={["#201f1f", "#1c1b1b"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <Feather name="book-open" size={28} color={COLORS.primaryContainer} />
                </View>
                <View style={styles.discBody}>
                  <Text style={styles.discEra}>{d.era}</Text>
                  <Text style={styles.discTitle}>{d.title}</Text>
                  <Text style={styles.discDesc} numberOfLines={2}>{d.desc}</Text>
                </View>
                <View style={[styles.discGrade, { borderColor: d.gradeColor + "40" }]}>
                  <Text style={[styles.discGradeText, { color: d.gradeColor }]}>{d.grade}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
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
    backgroundColor: "rgba(19,19,19,0.75)",
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.primaryContainer,
    letterSpacing: 1.5,
  },
  userLevel: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  xpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "30",
  },
  xpText: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.primaryContainer,
    letterSpacing: 0.5,
  },

  scroll: { flex: 1 },

  expeditionCard: {
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "20",
  },
  expeditionGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primaryContainer + "08",
  },
  expContent: { padding: 22, gap: 14 },
  expSubLabel: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  expTitle: {
    fontSize: 36,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onSurface,
    lineHeight: 42,
  },
  expTitleCyan: { color: COLORS.primaryContainer },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceContainerHighest,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressPct: { fontSize: 13, fontFamily: "SpaceGrotesk_600SemiBold", color: COLORS.primaryContainer },
  nextLocRow: {
    backgroundColor: COLORS.surfaceContainerHighest + "80",
    padding: 14,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "20",
  },
  nextLocChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  nextLocLabel: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  nextLocName: { fontSize: 14, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurface },
  resumeBtn: { margin: 16, marginTop: 4, borderRadius: 14, overflow: "hidden" },
  resumeGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  resumeText: { fontSize: 15, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 1, textTransform: "uppercase" },

  quickGrid: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 4 },
  quickCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "15",
  },
  quickIconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.tertiaryContainer + "18",
    justifyContent: "center",
    alignItems: "center",
  },
  quickLabel: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  quickDesc: { fontSize: 11, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 22, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  archiveBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  archiveBtnText: { fontSize: 12, fontFamily: "Manrope_700Bold", color: COLORS.primaryContainer, textTransform: "uppercase", letterSpacing: 1 },

  discoveryCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "15",
  },
  discThumb: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  discBody: { flex: 1, padding: 12, gap: 4 },
  discEra: { fontSize: 9, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurfaceVariant, letterSpacing: 1, textTransform: "uppercase" },
  discTitle: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  discDesc: { fontSize: 11, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 17 },
  discGrade: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: COLORS.surfaceContainerHighest + "cc",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  discGradeText: { fontSize: 8, fontFamily: "Manrope_800ExtraBold", letterSpacing: 0.5, textTransform: "uppercase" },
});
