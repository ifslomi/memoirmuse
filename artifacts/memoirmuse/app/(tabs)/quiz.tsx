import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";
import { QUIZ_QUESTIONS, BADGES } from "@/constants/data";

type Phase = "intro" | "playing" | "result";

const TAB_BOTTOM = Platform.OS === "web" ? 120 : 120;

export default function QuizScreen() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const current = QUIZ_QUESTIONS[currentIndex];
  const total = QUIZ_QUESTIONS.length;

  const getBadge = () => {
    const sorted = [...BADGES].sort((a, b) => b.minScore - a.minScore);
    return sorted.find((b) => score >= b.minScore) ?? BADGES[0];
  };

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore((s) => s + 1);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex + 1 >= total) {
      setPhase("result");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRestart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase("intro");
  };

  if (phase === "intro") {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.introContent,
          { paddingTop: topPad, paddingBottom: TAB_BOTTOM },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={styles.introHero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.introIconCircle}>
            <Feather name="help-circle" size={40} color={COLORS.white} />
          </View>
          <Text style={styles.introTitle}>Historia Quiz</Text>
          <Text style={styles.introSubtitle}>Test Your Knowledge</Text>
          <View style={styles.introDivider} />
          <Text style={styles.introTagline}>{total} questions · Heritage of Tolentino</Text>
        </LinearGradient>

        <View style={styles.introBody}>
          <Text style={styles.introDesc}>
            How well do you know the life and legacy of Pedro S. Tolentino?
            Answer {total} questions about the Father of Tagalog Zarzuela and
            earn your badge!
          </Text>

          <View style={styles.badgePreview}>
            <Text style={styles.badgePreviewTitle}>BADGES TO EARN</Text>
            {BADGES.map((badge) => (
              <View key={badge.id} style={styles.badgeRow}>
                <View style={styles.badgeIcon}>
                  <Feather name={badge.icon as any} size={18} color={COLORS.accent} />
                </View>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeReq}>
                    {badge.minScore === 0
                      ? "Complete the quiz"
                      : `Score ${badge.minScore}+ out of ${total}`}
                  </Text>
                </View>
                <Feather name="chevron-right" size={14} color={COLORS.borderLight} />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <Feather name="play" size={18} color={COLORS.white} />
            <Text style={styles.startBtnText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (phase === "result") {
    const badge = getBadge();
    const percentage = Math.round((score / total) * 100);

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.introContent,
          { paddingTop: topPad, paddingBottom: TAB_BOTTOM },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={styles.introHero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.resultBadgeCircle}>
            <Feather name={badge.icon as any} size={40} color={COLORS.accent} />
          </View>
          <Text style={styles.resultBadgeName}>{badge.name}</Text>
          <Text style={styles.introSubtitle}>Badge Earned!</Text>
        </LinearGradient>

        <View style={styles.introBody}>
          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreTotal}>/ {total}</Text>
          </View>
          <Text style={styles.scorePercent}>{percentage}% Correct</Text>

          <View style={styles.resultBar}>
            <View style={[styles.resultBarFill, { width: `${percentage}%` as any }]} />
          </View>

          <Text style={styles.resultMessage}>
            {percentage === 100
              ? "Perfect score! You are a true Tolentino scholar!"
              : percentage >= 80
              ? "Excellent! You have a deep knowledge of Tolentino's legacy."
              : percentage >= 50
              ? "Good effort! Keep exploring to learn more about Tolentino."
              : "Keep learning! Explore the Timeline and Gallery to discover more."}
          </Text>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleRestart}
            activeOpacity={0.85}
          >
            <Feather name="refresh-cw" size={16} color={COLORS.white} />
            <Text style={styles.startBtnText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.quizHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.quizProgress}>
          <View style={styles.quizProgressLabelRow}>
            <Text style={styles.quizProgressText}>
              Question {currentIndex + 1} of {total}
            </Text>
          </View>
          <View style={styles.quizProgressBarBg}>
            <View
              style={[
                styles.quizProgressBarFill,
                { width: `${((currentIndex + 1) / total) * 100}%` as any },
              ]}
            />
          </View>
        </View>
        <View style={styles.scoreChip}>
          <Feather name="star" size={12} color={COLORS.accent} />
          <Text style={styles.scoreChipText}>{score}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.quizBody}
        contentContainerStyle={[
          styles.quizBodyContent,
          { paddingBottom: TAB_BOTTOM },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <View style={styles.questionNumberRow}>
            <View style={styles.questionNumberBadge}>
              <Text style={styles.questionNumberText}>Q{currentIndex + 1}</Text>
            </View>
          </View>
          <Text style={styles.questionText}>{current.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {current.options.map((option, idx) => {
            let style = styles.optionBtn;
            let textStyle = styles.optionText;
            let icon: "circle" | "check-circle" | "x-circle" = "circle";
            let iconColor = COLORS.border;

            if (answered) {
              if (idx === current.correct) {
                style = { ...styles.optionBtn, ...styles.optionCorrect };
                textStyle = { ...styles.optionText, color: COLORS.text };
                icon = "check-circle";
                iconColor = COLORS.success;
              } else if (idx === selected && idx !== current.correct) {
                style = { ...styles.optionBtn, ...styles.optionWrong };
                textStyle = { ...styles.optionText, color: COLORS.error };
                icon = "x-circle";
                iconColor = COLORS.error;
              }
            } else if (idx === selected) {
              style = { ...styles.optionBtn, ...styles.optionSelected };
              textStyle = { ...styles.optionText, color: COLORS.primary };
              iconColor = COLORS.primary;
            }

            return (
              <TouchableOpacity
                key={idx}
                style={style}
                onPress={() => handleAnswer(idx)}
                activeOpacity={answered ? 1 : 0.75}
              >
                <Feather name={icon} size={18} color={iconColor} />
                <Text style={textStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {answered && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Feather
                name={selected === current.correct ? "check-circle" : "info"}
                size={16}
                color={selected === current.correct ? COLORS.success : COLORS.accent}
              />
              <Text
                style={[
                  styles.explanationLabel,
                  {
                    color:
                      selected === current.correct ? COLORS.success : COLORS.accent,
                  },
                ]}
              >
                {selected === current.correct ? "Correct!" : "Explanation"}
              </Text>
            </View>
            <Text style={styles.explanationText}>{current.explanation}</Text>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>
                {currentIndex + 1 >= total ? "See Results" : "Next Question"}
              </Text>
              <Feather name="arrow-right" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  introContent: {
    paddingHorizontal: 0,
  },
  introHero: {
    alignItems: "center",
    paddingVertical: 44,
    paddingHorizontal: 24,
    gap: 10,
  },
  introIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  introTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: COLORS.white,
  },
  introSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    fontStyle: "italic",
  },
  introDivider: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 4,
  },
  introTagline: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.5,
  },
  introBody: {
    padding: 24,
    gap: 20,
  },
  introDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  badgePreview: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  badgePreviewTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
  },
  badgeReq: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
    marginTop: 1,
  },
  startBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.white,
  },
  resultBadgeCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  resultBadgeName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: COLORS.white,
  },
  scoreDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 6,
  },
  scoreNumber: {
    fontSize: 60,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
  },
  scoreTotal: {
    fontSize: 26,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
  },
  scorePercent: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
    marginTop: -8,
  },
  resultBar: {
    height: 8,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 4,
    overflow: "hidden",
  },
  resultBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  resultMessage: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: "center",
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
  },
  quizProgress: {
    flex: 1,
    gap: 10,
  },
  quizProgressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  quizProgressText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.75)",
  },
  quizProgressBarBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  quizProgressBarFill: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  scoreChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreChipText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: COLORS.white,
  },
  quizBody: {
    flex: 1,
  },
  quizBodyContent: {
    padding: 20,
    gap: 14,
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  questionNumberRow: {
    flexDirection: "row",
  },
  questionNumberBadge: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  questionNumberText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 10,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "08",
  },
  optionCorrect: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "12",
  },
  optionWrong: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "08",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: COLORS.text,
    lineHeight: 22,
  },
  explanationCard: {
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  explanationLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  explanationText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  nextBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  nextBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.white,
  },
});
