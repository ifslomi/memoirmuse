import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { useRouter } from "expo-router";
import COLORS from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const BADGES = [
  { id: "1", name: "First Find", era: "Renaissance", icon: "search" as const, unlocked: true },
  { id: "2", name: "Citadel Sage", era: "Medieval", icon: "shield" as const, unlocked: true },
  { id: "3", name: "Lore Keeper", era: "Library", icon: "book" as const, unlocked: true },
  { id: "4", name: "Archivist", era: "Locked", icon: "lock" as const, unlocked: false },
  { id: "5", name: "Time Weaver", era: "Legendary", icon: "clock" as const, unlocked: false },
  { id: "6", name: "Nationalist", era: "Revolution", icon: "flag" as const, unlocked: false },
];

const LEADERS = [
  { rank: 1, name: "Dr. Aris Thorne", sub: "GRAND ARCHIVIST", xp: "12.4k", isYou: false },
  { rank: 2, name: "Lara Craft", sub: "MYTH-SEEKER", xp: "9.1k", isYou: false },
  { rank: 42, name: "You", sub: "UNREGISTERED HISTORIAN", xp: "1.2k", isYou: true },
  { rank: 43, name: "Marcus Aurel", sub: "SEEKER", xp: "1.1k", isYou: false },
];

const LEVEL = 12;
const CURRENT_XP = 1250;
const NEXT_LEVEL_XP = 1600;
const RING_SIZE = 130;
const RING_STROKE = 8;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PROGRESS = CURRENT_XP / NEXT_LEVEL_XP;

function AnimatedCard({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(22)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 480, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, friction: 8, tension: 55 }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[style, { opacity: anim, transform: [{ translateY }] }]}>{children}</Animated.View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    Animated.timing(ringAnim, { toValue: 1, duration: 1200, delay: 300, useNativeDriver: false }).start();
  }, []);

  const strokeDashoffset = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, CIRCUMFERENCE * (1 - PROGRESS)],
  });

  const handleLogout = () => {
    if (Platform.OS !== "web") {
      Alert.alert(
        "Sign Out",
        "You will be logged out of the Chronos Interface.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: () => { logout(); router.replace("/login"); },
          },
        ]
      );
    } else {
      logout();
      router.replace("/login");
    }
  };

  return (
    <View style={styles.root}>
      <Animated.View
        style={[styles.topBar, { paddingTop: topPad + 10 }]}
        entering={undefined}
      >
        <View style={styles.topLeft}>
          <View style={styles.avatarRing}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <View style={styles.avatarInner}>
              <Feather name="user" size={16} color={COLORS.primaryContainer} />
            </View>
          </View>
          <View>
            <Text style={styles.topTitle}>THE CHRONOS INTERFACE</Text>
            <Text style={styles.topSub}>{user ?? "Historian"} • Profile</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={styles.xpChip}>
            <Feather name="star" size={12} color={COLORS.tertiaryFixedDim} />
            <Text style={styles.xpText}>1,250 XP</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            style={styles.logoutBtn}
          >
            <Feather name="log-out" size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: topPad + 76, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedCard delay={60} style={{ padding: 16 }}>
          <View style={styles.levelCard}>
            <LinearGradient
              colors={["#0d1520", COLORS.surfaceContainerLowest]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.heroGlow} />

            <View style={styles.ringContainer}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={COLORS.surfaceContainerHighest}
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                <AnimatedCircle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={COLORS.primaryContainer}
                  strokeWidth={RING_STROKE}
                  fill="none"
                  strokeDasharray={`${CIRCUMFERENCE}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                />
              </Svg>
              <View style={styles.ringInner}>
                <Text style={styles.levelNum}>{LEVEL}</Text>
                <Text style={styles.levelLabel}>LEVEL</Text>
              </View>
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle}>Master Historian</Text>
              <Text style={styles.heroSub}>
                You've unlocked 65% of Tolentino's artifacts. Gain 350 more XP to reach Level 13.
              </Text>
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroBadge}>
                  <Feather name="zap" size={12} color={COLORS.tertiaryFixedDim} />
                  <Text style={styles.heroBadgeText}>7 Day Streak</Text>
                </View>
                <View style={[styles.heroBadge, { borderColor: COLORS.primaryContainer + "35", backgroundColor: COLORS.primaryContainer + "10" }]}>
                  <Feather name="award" size={12} color={COLORS.primaryContainer} />
                  <Text style={[styles.heroBadgeText, { color: COLORS.primaryContainer }]}>Top 5% Rank</Text>
                </View>
              </View>
            </View>
          </View>
        </AnimatedCard>

        <View style={styles.section}>
          <AnimatedCard delay={130} style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Relic Collection</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </AnimatedCard>
          <View style={styles.badgeGrid}>
            {BADGES.map((b, i) => (
              <AnimatedCard key={b.id} delay={180 + i * 50}>
                <View
                  style={[
                    styles.badgeCard,
                    b.unlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked,
                  ]}
                >
                  <View style={[styles.badgeIconRing, { backgroundColor: b.unlocked ? COLORS.tertiaryContainer + "15" : COLORS.surfaceContainerHighest }]}>
                    <Feather
                      name={b.icon}
                      size={26}
                      color={b.unlocked ? COLORS.tertiaryFixedDim : COLORS.onSurfaceVariant}
                    />
                  </View>
                  <Text style={[styles.badgeName, !b.unlocked && { color: COLORS.onSurfaceVariant }]}>{b.name}</Text>
                  <Text style={styles.badgeEra}>{b.era}</Text>
                </View>
              </AnimatedCard>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AnimatedCard delay={420} style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Historians</Text>
            <Feather name="bar-chart-2" size={18} color={COLORS.onSurfaceVariant} />
          </AnimatedCard>
          <AnimatedCard delay={460}>
            <View style={styles.leaderboard}>
              {LEADERS.map((l, i) => (
                <View
                  key={l.rank}
                  style={[
                    styles.leaderRow,
                    l.isYou && styles.leaderRowYou,
                    i < LEADERS.length - 1 && styles.leaderRowBorder,
                  ]}
                >
                  <Text style={[styles.leaderRank, l.isYou && { color: COLORS.primaryContainer }]}>
                    {String(l.rank).padStart(2, "0")}
                  </Text>
                  <View style={[styles.leaderAvatar, l.isYou && styles.leaderAvatarYou]}>
                    <Feather name="user" size={15} color={l.isYou ? COLORS.primaryContainer : COLORS.onSurfaceVariant} />
                  </View>
                  <View style={styles.leaderInfo}>
                    <Text style={[styles.leaderName, l.isYou && { color: COLORS.primaryContainer }]}>{l.name}</Text>
                    <Text style={styles.leaderSub}>{l.sub}</Text>
                  </View>
                  <Text style={[styles.leaderXp, l.isYou && { color: COLORS.primaryContainer }]}>{l.xp}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.globalRankBtn} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.surfaceContainerHigh, COLORS.surfaceContainer]} style={styles.globalRankGrad}>
                <Text style={styles.globalRankText}>View Global Ranking</Text>
              </LinearGradient>
            </TouchableOpacity>
          </AnimatedCard>
        </View>

        <View style={[styles.section, { paddingBottom: 8 }]}>
          <AnimatedCard delay={520}>
            <View style={styles.unlockCard}>
              <LinearGradient
                colors={[COLORS.tertiaryContainer + "10", "transparent"]}
                style={StyleSheet.absoluteFill}
              />
              <Feather name="star" size={22} color={COLORS.tertiaryFixedDim} />
              <View style={{ flex: 1 }}>
                <Text style={styles.unlockTitle}>Unlock "The Golden Age" Quiz Pack</Text>
                <Text style={styles.unlockSub}>Complete 3 more daily challenges to get exclusive access to 50-bonus XP.</Text>
                <View style={styles.unlockProgressRow}>
                  <View style={styles.unlockTrack}>
                    <LinearGradient
                      colors={[COLORS.tertiaryFixed, COLORS.tertiaryFixedDim]}
                      style={[styles.unlockFill, { width: "33%" }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text style={styles.unlockPct}>1/3 Tasks Done</Text>
                </View>
              </View>
            </View>
          </AnimatedCard>
        </View>
      </ScrollView>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

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
    backgroundColor: "rgba(19,19,19,0.92)",
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: { fontSize: 12, fontFamily: "SpaceGrotesk_700Bold", color: "#00e5ff", letterSpacing: 1.5 },
  topSub: { fontSize: 9, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 1 },
  xpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "30",
  },
  xpText: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", color: "#00e5ff" },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.errorContainer + "18",
    borderWidth: 1,
    borderColor: COLORS.error + "30",
    justifyContent: "center",
    alignItems: "center",
  },

  levelCard: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.1)",
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    position: "relative",
    shadowColor: "#00e5ff",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  heroGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primaryContainer + "07",
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    position: "relative",
  },
  ringInner: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  levelNum: { fontSize: 38, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  levelLabel: { fontSize: 8, fontFamily: "Manrope_700Bold", color: COLORS.onSurfaceVariant, letterSpacing: 2, textTransform: "uppercase" },

  heroInfo: { flex: 1, gap: 8 },
  heroTitle: { fontSize: 24, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  heroSub: { fontSize: 12, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 18 },
  heroBadgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.tertiaryContainer + "12",
    borderWidth: 1,
    borderColor: COLORS.tertiaryContainer + "30",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroBadgeText: { fontSize: 9, fontFamily: "Manrope_700Bold", color: COLORS.tertiaryFixedDim, textTransform: "uppercase", letterSpacing: 0.5 },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 22, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  viewAll: { fontSize: 13, fontFamily: "Manrope_700Bold", color: COLORS.primary },

  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCard: {
    width: "47%",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  badgeCardUnlocked: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderColor: COLORS.outlineVariant + "18",
  },
  badgeCardLocked: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderColor: COLORS.outlineVariant + "18",
    borderStyle: "dashed",
    opacity: 0.6,
  },
  badgeIconRing: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center" },
  badgeName: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, textAlign: "center" },
  badgeEra: { fontSize: 9, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 1 },

  leaderboard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "15",
    marginBottom: 10,
  },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  leaderRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.outlineVariant + "20" },
  leaderRowYou: { backgroundColor: COLORS.primaryContainer + "08" },
  leaderRank: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurfaceVariant, width: 28 },
  leaderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceContainerHighest,
    justifyContent: "center",
    alignItems: "center",
  },
  leaderAvatarYou: { borderWidth: 2, borderColor: COLORS.primaryContainer + "55" },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 14, fontFamily: "SpaceGrotesk_600SemiBold", color: COLORS.onSurface },
  leaderSub: { fontSize: 9, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurfaceVariant, letterSpacing: 1, textTransform: "uppercase" },
  leaderXp: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },

  globalRankBtn: { borderRadius: 16, overflow: "hidden" },
  globalRankGrad: { paddingVertical: 15, alignItems: "center" },
  globalRankText: { fontSize: 12, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, letterSpacing: 1.5, textTransform: "uppercase" },

  unlockCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.tertiaryContainer + "25",
    overflow: "hidden",
  },
  unlockTitle: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.tertiary, marginBottom: 4 },
  unlockSub: { fontSize: 12, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 17, marginBottom: 10 },
  unlockProgressRow: { gap: 6 },
  unlockTrack: { height: 4, backgroundColor: COLORS.surfaceContainerHighest, borderRadius: 2, overflow: "hidden" },
  unlockFill: { height: "100%", borderRadius: 2 },
  unlockPct: { fontSize: 10, fontFamily: "Manrope_700Bold", color: COLORS.onSurfaceVariant },
});
