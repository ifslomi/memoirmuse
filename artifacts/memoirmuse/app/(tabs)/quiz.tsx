import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";
import { QUIZ_QUESTIONS } from "@/constants/data";

type Phase = "home" | "playing" | "result";

const CHALLENGES = [
  {
    id: "1",
    title: "The Playwright's Code",
    desc: "Answer 5 questions about Tolentino's theatrical works correctly.",
    xp: "+150 XP",
    icon: "book-open" as const,
    color: COLORS.primaryContainer,
    locked: false,
  },
  {
    id: "2",
    title: "AR Artifact Hunter",
    desc: "Locate and scan the 'Kahapon, Ngayon at Bukas' AR marker at the museum.",
    xp: "+350 XP",
    icon: "camera" as const,
    color: COLORS.tertiaryFixedDim,
    locked: true,
  },
  {
    id: "3",
    title: "Heritage Cartographer",
    desc: "Visit 3 GPS-triggered heritage locations in Marikina City.",
    xp: "+500 XP",
    icon: "map-pin" as const,
    color: COLORS.secondary,
    locked: true,
  },
];

function AnimatedCard({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, friction: 8, tension: 60 }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[style, { opacity: anim, transform: [{ translateY }] }]}>{children}</Animated.View>
  );
}

export default function QuizScreen() {
  const [phase, setPhase] = useState<Phase>("home");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const questionAnim = useRef(new Animated.Value(1)).current;

  const current = QUIZ_QUESTIONS[currentIndex];
  const total = QUIZ_QUESTIONS.length;

  const handleStart = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase("playing");
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
  };

  const handleAnswer = async (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const isCorrect = idx === current.correct;
    if (Platform.OS !== "web") {
      await (isCorrect
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
    }
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(questionAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(questionAnim, { toValue: 1, duration: 280, delay: 60, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      if (currentIndex + 1 >= total) {
        setPhase("result");
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setAnswered(false);
      }
    }, 180);
  };

  const handleReset = () => {
    setPhase("home");
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
  };

  const xpEarned = score * 50;
  const pct = Math.round((score / total) * 100);

  if (phase === "playing") {
    return (
      <View style={styles.root}>
        <View style={[styles.topBar, { paddingTop: topPad + 10 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={handleReset}>
            <Feather name="x" size={18} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              style={[styles.progressFill, { width: `${(currentIndex / total) * 100}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <View style={styles.scoreChip}>
            <Feather name="star" size={11} color={COLORS.tertiaryFixedDim} />
            <Text style={styles.scoreChipText}>{score * 50} XP</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingTop: topPad + 76, paddingBottom: 140, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: questionAnim }}>
            <Text style={styles.qCounter}>QUESTION {currentIndex + 1} OF {total}</Text>
            <Text style={styles.qText}>{current.question}</Text>

            <View style={styles.optionsWrap}>
              {current.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === current.correct;
                const showFeedback = answered;
                let borderColor = COLORS.outlineVariant + "35";
                let bgColor = COLORS.surfaceContainerHigh;
                let textColor = COLORS.onSurface;
                let iconEl = null;

                if (showFeedback) {
                  if (isCorrect) {
                    borderColor = COLORS.tertiaryFixedDim + "70";
                    bgColor = COLORS.tertiaryContainer + "12";
                    textColor = COLORS.tertiaryFixed;
                    iconEl = <Feather name="check-circle" size={18} color={COLORS.tertiaryFixedDim} />;
                  } else if (isSelected && !isCorrect) {
                    borderColor = "#ffb4ab70";
                    bgColor = COLORS.errorContainer + "20";
                    textColor = COLORS.error;
                    iconEl = <Feather name="x-circle" size={18} color={COLORS.error} />;
                  }
                } else if (isSelected) {
                  borderColor = COLORS.primaryContainer + "70";
                  bgColor = COLORS.primaryContainer + "12";
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.option, { backgroundColor: bgColor, borderColor }]}
                    onPress={() => handleAnswer(idx)}
                    activeOpacity={0.82}
                    disabled={answered}
                  >
                    <View style={[styles.optionLetter, { borderColor: borderColor }]}>
                      <Text style={[styles.optionLetterText, { color: textColor }]}>
                        {["A", "B", "C", "D"][idx]}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                    {iconEl}
                  </TouchableOpacity>
                );
              })}
            </View>

            {answered && (
              <View style={styles.feedbackCard}>
                <LinearGradient
                  colors={
                    selected === current.correct
                      ? [COLORS.tertiaryContainer + "10", "transparent"]
                      : [COLORS.errorContainer + "10", "transparent"]
                  }
                  style={StyleSheet.absoluteFill}
                />
                <View style={[styles.feedbackBar, { backgroundColor: selected === current.correct ? COLORS.tertiaryFixedDim : COLORS.error }]} />
                <Text style={styles.feedbackText}>
                  {selected === current.correct
                    ? "Correct! Pedro S. Tolentino's legacy lives on through your knowledge."
                    : `The correct answer is: "${current.options[current.correct]}"`}
                </Text>
              </View>
            )}

            {answered && (
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.nextBtnGrad}>
                  <Text style={styles.nextBtnText}>
                    {currentIndex + 1 >= total ? "SEE RESULTS" : "NEXT QUESTION"}
                  </Text>
                  <Feather name="arrow-right" size={18} color="#00363d" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  if (phase === "result") {
    const title = pct >= 80 ? "Master Historian!" : pct >= 50 ? "Historia Scholar" : "Keep Exploring";
    return (
      <View style={styles.root}>
        <LinearGradient colors={["#0d1520", COLORS.background]} style={StyleSheet.absoluteFill} />
        <ScrollView
          contentContainerStyle={{ paddingTop: topPad + 40, paddingBottom: 140, paddingHorizontal: 24, alignItems: "center" }}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedCard delay={0}>
            <View style={styles.resultRing}>
              <View style={styles.resultRingGlow} />
              <View style={styles.resultRingInner}>
                <Text style={styles.resultScore}>{score}/{total}</Text>
                <Text style={styles.resultScoreLabel}>CORRECT</Text>
              </View>
            </View>
          </AnimatedCard>

          <AnimatedCard delay={100} style={{ alignItems: "center", gap: 8, marginBottom: 24 }}>
            <Text style={styles.resultTitle}>{title}</Text>
            <Text style={styles.resultSub}>
              {pct >= 80
                ? "Exceptional knowledge of Tolentino's legacy."
                : pct >= 50
                ? "Good progress. Explore more artifacts to improve."
                : "Scan more AR markers to unlock knowledge."}
            </Text>
          </AnimatedCard>

          <AnimatedCard delay={180}>
            <View style={styles.resultXpCard}>
              <LinearGradient colors={[COLORS.tertiaryContainer + "15", COLORS.tertiaryContainer + "05"]} style={StyleSheet.absoluteFill} />
              <Feather name="zap" size={22} color={COLORS.tertiaryFixedDim} />
              <Text style={styles.resultXpText}>+{xpEarned} XP Earned</Text>
            </View>
          </AnimatedCard>

          <AnimatedCard delay={240}>
            <View style={styles.resultStatRow}>
              {[
                { label: "Correct", value: `${score}`, color: COLORS.primaryContainer },
                { label: "Missed", value: `${total - score}`, color: COLORS.error },
                { label: "Accuracy", value: `${pct}%`, color: COLORS.tertiaryFixedDim },
              ].map((s) => (
                <View key={s.label} style={styles.resultStat}>
                  <Text style={[styles.resultStatVal, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.resultStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </AnimatedCard>

          <AnimatedCard delay={300} style={{ width: "100%" }}>
            <TouchableOpacity style={styles.nextBtn} onPress={handleReset} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.nextBtnGrad}>
                <Text style={styles.nextBtnText}>BACK TO CHALLENGES</Text>
                <Feather name="arrow-right" size={18} color="#00363d" />
              </LinearGradient>
            </TouchableOpacity>
          </AnimatedCard>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: topPad + 10 }]}>
        <View style={styles.topLeft}>
          <View style={styles.avatarRing}>
            <Feather name="user" size={18} color={COLORS.onSurface} />
          </View>
          <View>
            <Text style={styles.topTitle}>MEMOIRMUSE</Text>
            <Text style={styles.topSub}>MemoirMuse Challenges</Text>
          </View>
        </View>
        <View style={styles.xpChip}>
          <Feather name="star" size={12} color={COLORS.tertiaryFixedDim} />
          <Text style={styles.xpText}>1,250 XP</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: topPad + 76, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedCard delay={60} style={{ padding: 16 }}>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={[COLORS.surfaceContainerLow, COLORS.surfaceContainerLowest]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroGlow} />

            <View style={styles.heroIconWrap}>
              <View style={styles.heroIconRing}>
                <Feather name="help-circle" size={40} color={COLORS.tertiaryFixedDim} />
              </View>
              <View style={styles.heroIconBadge}>
                <Feather name="plus" size={10} color="#00363d" />
              </View>
            </View>

            <Text style={styles.heroTitle}>MemoirMuse Challenge</Text>
            <Text style={styles.heroSub}>
              Test your knowledge of Pedro S. Tolentino's life, works, and legacy to earn XP and unlock Digital Artifact Badges.
            </Text>

            <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.startBtnGrad}>
                <Feather name="play" size={18} color="#00363d" />
                <Text style={styles.startBtnText}>START CHALLENGE</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.startMeta}>{total} Questions • +{total * 50} XP Available</Text>
          </View>
        </AnimatedCard>

        <View style={styles.challengesSection}>
          <AnimatedCard delay={140} style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Daily Challenges</Text>
            <View style={styles.resetChip}>
              <Text style={styles.resetText}>Resets in 4h 12m</Text>
            </View>
          </AnimatedCard>

          {CHALLENGES.map((c, i) => (
            <AnimatedCard key={c.id} delay={200 + i * 70}>
              <TouchableOpacity
                style={[styles.challengeCard, c.locked && styles.challengeCardLocked]}
                activeOpacity={c.locked ? 1 : 0.82}
              >
                <View style={[styles.challengeIcon, { backgroundColor: c.color + "14" }]}>
                  <Feather name={c.icon} size={22} color={c.color} />
                </View>
                <View style={styles.challengeBody}>
                  <Text style={[styles.challengeTitle, c.locked && { color: COLORS.onSurfaceVariant }]}>{c.title}</Text>
                  <Text style={styles.challengeDesc}>{c.desc}</Text>
                </View>
                <View style={styles.challengeRight}>
                  <Text style={[styles.challengeXp, { color: c.color }]}>{c.xp}</Text>
                  <TouchableOpacity
                    style={[
                      styles.challengeBtn,
                      c.locked ? styles.challengeBtnLocked : { backgroundColor: COLORS.primaryContainer },
                    ]}
                    onPress={c.locked ? undefined : handleStart}
                    activeOpacity={c.locked ? 1 : 0.85}
                  >
                    <Text style={[styles.challengeBtnText, c.locked && styles.challengeBtnTextLocked]}>
                      {c.locked ? "Locked" : "Start"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </AnimatedCard>
          ))}
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
    backgroundColor: "rgba(19,19,19,0.92)",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceContainerHighest,
    justifyContent: "center",
    alignItems: "center",
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

  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceContainerHighest,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  scoreChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  scoreChipText: { fontSize: 12, fontFamily: "SpaceGrotesk_700Bold", color: "#00e5ff" },

  heroCard: {
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "18",
    overflow: "hidden",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.tertiaryContainer + "06",
  },
  heroIconWrap: { position: "relative" },
  heroIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.tertiaryContainer + "12",
    borderWidth: 1,
    borderColor: COLORS.tertiaryContainer + "25",
    justifyContent: "center",
    alignItems: "center",
  },
  heroIconBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: { fontSize: 26, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.tertiary, textAlign: "center" },
  heroSub: { fontSize: 14, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, textAlign: "center", lineHeight: 22 },
  startBtn: { width: "100%", borderRadius: 18, overflow: "hidden" },
  startBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  startBtnText: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 2, textTransform: "uppercase" },
  startMeta: { fontSize: 11, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant },

  challengesSection: { paddingHorizontal: 16, gap: 10 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  sectionTitle: { fontSize: 22, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  resetChip: { backgroundColor: COLORS.surfaceContainer, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  resetText: { fontSize: 9, fontFamily: "Manrope_700Bold", color: COLORS.onSurfaceVariant, letterSpacing: 1, textTransform: "uppercase" },

  challengeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "12",
  },
  challengeCardLocked: { opacity: 0.6 },
  challengeIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  challengeBody: { flex: 1, gap: 4 },
  challengeTitle: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  challengeDesc: { fontSize: 12, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 17 },
  challengeRight: { alignItems: "flex-end", gap: 6 },
  challengeXp: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold" },
  challengeBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  challengeBtnLocked: { backgroundColor: COLORS.surfaceContainerHighest },
  challengeBtnText: { fontSize: 10, fontFamily: "Manrope_800ExtraBold", color: "#00363d", letterSpacing: 1, textTransform: "uppercase" },
  challengeBtnTextLocked: { color: COLORS.onSurfaceVariant },

  qCounter: { fontSize: 10, fontFamily: "Manrope_700Bold", color: COLORS.onSurfaceVariant, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  qText: { fontSize: 22, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, lineHeight: 32, marginBottom: 28 },
  optionsWrap: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  optionLetter: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  optionLetterText: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold" },
  optionText: { flex: 1, fontSize: 15, fontFamily: "Manrope_500Medium", lineHeight: 22 },
  feedbackCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "18",
    overflow: "hidden",
  },
  feedbackBar: { width: 3, borderRadius: 2 },
  feedbackText: { flex: 1, fontSize: 14, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 22 },

  nextBtn: { marginTop: 24, borderRadius: 18, overflow: "hidden" },
  nextBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  nextBtnText: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 2, textTransform: "uppercase" },

  resultRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  resultRingGlow: {
    position: "absolute",
    inset: 0,
    borderRadius: 85,
    borderWidth: 4,
    borderColor: COLORS.primaryContainer + "35",
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  resultRingInner: { alignItems: "center" },
  resultScore: { fontSize: 46, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  resultScoreLabel: { fontSize: 9, fontFamily: "Manrope_700Bold", color: COLORS.onSurfaceVariant, letterSpacing: 2, textTransform: "uppercase" },
  resultTitle: { fontSize: 32, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, textAlign: "center" },
  resultSub: { fontSize: 14, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, textAlign: "center", lineHeight: 22 },
  resultXpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.tertiaryContainer + "30",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    marginBottom: 24,
    overflow: "hidden",
  },
  resultXpText: { fontSize: 16, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.tertiaryFixed },
  resultStatRow: { flexDirection: "row", gap: 32, marginBottom: 8 },
  resultStat: { alignItems: "center", gap: 4 },
  resultStatVal: { fontSize: 28, fontFamily: "SpaceGrotesk_700Bold" },
  resultStatLabel: { fontSize: 10, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 1 },
});
