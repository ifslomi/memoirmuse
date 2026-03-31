import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "@/constants/colors";
import { TIMELINE_EVENTS } from "@/constants/data";

export default function TimelineScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleToggle = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>Timeline</Text>
        <Text style={styles.headerSubtitle}>Life of Pedro S. Tolentino</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 120 },
        ]}
      >
        <View style={styles.timeline}>
          {TIMELINE_EVENTS.map((event, index) => (
            <View key={event.id} style={styles.eventRow}>
              <View style={styles.leftColumn}>
                <View style={[styles.dot, { backgroundColor: event.color }]}>
                  <Feather name={event.icon as any} size={12} color={COLORS.white} />
                </View>
                {index < TIMELINE_EVENTS.length - 1 && (
                  <View style={styles.connector} />
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.card,
                  expandedId === event.id && styles.cardExpanded,
                ]}
                onPress={() => handleToggle(event.id)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <View
                      style={[
                        styles.yearBadge,
                        { backgroundColor: event.color + "18" },
                      ]}
                    >
                      <Text style={[styles.yearText, { color: event.color }]}>
                        {event.year}
                      </Text>
                    </View>
                    <Feather
                      name={expandedId === event.id ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={COLORS.textMuted}
                    />
                  </View>
                  <Text style={styles.cardTitle}>{event.title}</Text>
                  <Text style={styles.cardDescription}>{event.description}</Text>
                </View>

                {expandedId === event.id && (
                  <View style={styles.cardBody}>
                    <View style={[styles.cardBodyDivider, { backgroundColor: event.color + "30" }]} />
                    <Text style={styles.cardDetails}>{event.details}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    fontStyle: "italic",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  timeline: {
    gap: 0,
  },
  eventRow: {
    flexDirection: "row",
    gap: 14,
  },
  leftColumn: {
    alignItems: "center",
    width: 32,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  connector: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.borderLight,
    marginVertical: 2,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardExpanded: {
    borderColor: COLORS.border,
  },
  cardHeader: {
    gap: 6,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  yearBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  yearText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
  },
  cardDescription: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  cardBody: {
    marginTop: 12,
    gap: 12,
  },
  cardBodyDivider: {
    height: 1,
  },
  cardDetails: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
