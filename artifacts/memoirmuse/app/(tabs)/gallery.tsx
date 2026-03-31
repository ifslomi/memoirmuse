import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import COLORS from "@/constants/colors";

const BADGES = [
  { id: "1", name: "First Find", era: "Renaissance", icon: "search" as const, unlocked: true },
  { id: "2", name: "Citadel Sage", era: "Medieval", icon: "shield" as const, unlocked: true },
  { id: "3", name: "Lore Keeper", era: "Library", icon: "book" as const, unlocked: true },
  { id: "4", name: "Archivist", era: "Locked", icon: "lock" as const, unlocked: false },
  { id: "5", name: "Time Weaver", era: "Legendary", icon: "clock" as const, unlocked: false },
  { id: "6", name: "Nationalist", era: "Revolution", icon: "flag" as const, unlocked: false },
];

const LEADERS = [
  { rank: 1, name: "Dr. Aris Thorne", sub: "GRAND RICHVIST", xp: "12.4k", isYou: false },
  { rank: 2, name: "Lara Craft", sub: "MYTH-SEEKER", xp: "9.1k", isYou: false },
  { rank: 42, name: "You", sub: "UNREGISTERED HISTORIAN", xp: "1.2k", isYou: true },
  { rank: 43, name: "Marcus Aurel", sub: "SEEKER", xp: "1.1k", isYou: false },
];

const DAILY_XP_GOAL = 300;
const CURRENT_XP = 1250;
const LEVEL = 12;
const NEXT_LEVEL_XP = 1600;
const PROGRESS_PCT = Math.round((CURRENT_XP % NEXT_LEVEL_XP) / NEXT_LEVEL_XP * 100);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <View style={styles.topLeft}>
          <View style={styles.avatarRing}>
            <Feather name="user" size={16} color={COLORS.primaryContainer} />
          </View>
          <View>
            <Text style={styles.topTitle}>THE CHRONOS INTERFACE</Text>
            <Text style={styles.topSub}>Historian Profile</Text>
          </View>
        </View>
        <View style={styles.xpChip}>
          <Feather name="star" size={12} color={COLORS.tertiaryFixedDim} />
          <Text style={styles.xpText}>1,250 XP</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: topPad + 70, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.levelCard}>
            <LinearGradient
              colors={[COLORS.surfaceContainerLow, COLORS.surfaceContainerLowest]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroGlow} />

            <View style={styles.levelRingWrap}>
              <View style={styles.levelRing}>
                <Text style={styles.levelNum}>{LEVEL}</Text>
                <Text style={styles.levelLabel}>LEVEL</Text>
              </View>
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle}>Master Historian</Text>
              <Text style={styles.heroSub}>
                You've unlocked 45% of Tolentino's artifacts. Gain 350 more XP to reach Level 13.
              </Text>
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroBadge}>
                  <Feather name="zap" size={13} color={COLORS.tertiaryFixedDim} />
                  <Text style={styles.heroBadgeText}>7 Day Streak</Text>
                </View>
                <View style={[styles.heroBadge, { borderColor: COLORS.primaryContainer + "35", backgroundColor: COLORS.primaryContainer + "10" }]}>
                  <Feather name="award" size={13} color={COLORS.primaryContainer} />
                  <Text style={[styles.heroBadgeText, { color: COLORS.primaryContainer }]}>Top 5% Rank</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Relic Collection</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgeGrid}>
            {BADGES.map((b) => (
              <View
                key={b.id}
                style={[
                  styles.badgeCard,
                  !b.unlocked && styles.badgeCardLocked,
                  b.unlocked && styles.badgeCardUnlocked,
                ]}
              >
                <View style={[styles.badgeIconRing, { backgroundColor: b.unlocked ? COLORS.tertiaryContainer + "15" : COLORS.surfaceContainerHighest }]}>
                  <Feather
                    name={b.icon}
                    size={28}
                    color={b.unlocked ? COLORS.tertiaryFixedDim : COLORS.onSurfaceVariant}
                  />
                </View>
                <Text style={[styles.badgeName, !b.unlocked && { color: COLORS.onSurfaceVariant }]}>{b.name}</Text>
                <Text style={styles.badgeEra}>{b.era}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Historians</Text>
            <Feather name="bar-chart-2" size={18} color={COLORS.onSurfaceVariant} />
          </View>
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
        </View>

        <View style={[styles.section, { paddingBottom: 8 }]}>
          <View style={styles.unlockCard}>
            <Feather name="star" size={20} color={COLORS.tertiaryFixedDim} />
            <View style={{ flex: 1 }}>
              <Text style={styles.unlockTitle}>Unlock "The Golden Age" Quiz Pack</Text>
              <Text style={styles.unlockSub}>Complete 3 more daily challenges to get exclusive access to 50-bonus XP.</Text>
              <View style={styles.unlockProgress}>
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
        </View>
      </ScrollView>
    </View>
  );
}

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
    backgroundColor: "rgba(19,19,19,0.9)",
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  topTitle: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.primaryContainer, letterSpacing: 1.5 },
  topSub: { fontSize: 10, fontFamily: "Manrope_500Medium", color: COLORS.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 1 },
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
  xpText: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.primaryContainer },

  heroSection: { padding: 16 },
  levelCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "15",
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primaryContainer + "06",
  },
  levelRingWrap: { flexShrink: 0 },
  levelRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: COLORS.primaryContainer + "30",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  levelNum: { fontSize: 36, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  levelLabel: { fontSize: 8, fontFamily: "Manrope_700Bold", color: COLORS.onSurfaceVariant, letterSpacing: 2, textTransform: "uppercase" },
  heroInfo: { flex: 1, gap: 8 },
  heroTitle: { fontSize: 26, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  heroSub: { fontSize: 12, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 18 },
  heroBadgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.tertiaryContainer + "10",
    borderWidth: 1,
    borderColor: COLORS.tertiaryContainer + "30",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroBadgeText: { fontSize: 10, fontFamily: "Manrope_700Bold", color: COLORS.tertiaryFixedDim, textTransform: "uppercase", letterSpacing: 0.5 },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 22, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  viewAll: { fontSize: 13, fontFamily: "Manrope_700Bold", color: COLORS.primary },

  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCard: {
    width: "47%",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  badgeCardUnlocked: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderColor: COLORS.outlineVariant + "15",
  },
  badgeCardLocked: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderColor: COLORS.outlineVariant + "15",
    borderStyle: "dashed",
    opacity: 0.6,
  },
  badgeIconRing: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center" },
  badgeName: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, textAlign: "center" },
  badgeEra: { fontSize: 9, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 1 },

  leaderboard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
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
  leaderRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant + "10" },
  leaderRowYou: { backgroundColor: COLORS.primaryContainer + "08" },
  leaderRank: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurfaceVariant, width: 28 },
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerHighest,
    justifyContent: "center",
    alignItems: "center",
  },
  leaderAvatarYou: { borderWidth: 1.5, borderColor: COLORS.primaryContainer + "50" },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 14, fontFamily: "SpaceGrotesk_600SemiBold", color: COLORS.onSurface },
  leaderSub: { fontSize: 9, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurfaceVariant, letterSpacing: 1, textTransform: "uppercase" },
  leaderXp: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },

  globalRankBtn: { borderRadius: 14, overflow: "hidden" },
  globalRankGrad: { paddingVertical: 14, alignItems: "center" },
  globalRankText: { fontSize: 12, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, letterSpacing: 1.5, textTransform: "uppercase" },

  unlockCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: COLORS.tertiaryContainer + "08",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.tertiaryContainer + "20",
  },
  unlockTitle: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.tertiary, marginBottom: 4 },
  unlockSub: { fontSize: 12, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 17, marginBottom: 10 },
  unlockProgress: { gap: 6 },
  unlockTrack: { height: 4, backgroundColor: COLORS.surfaceContainerHighest, borderRadius: 2, overflow: "hidden" },
  unlockFill: { height: "100%", borderRadius: 2 },
  unlockPct: { fontSize: 10, fontFamily: "Manrope_700Bold", color: COLORS.onSurfaceVariant },

});
