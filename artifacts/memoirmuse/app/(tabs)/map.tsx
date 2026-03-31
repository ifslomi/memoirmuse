import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";
import { MAP_LOCATIONS, MapLocation } from "@/constants/data";

const TYPE_COLORS: Record<string, string> = {
  museum: COLORS.primary,
  heritage: COLORS.accent,
  library: COLORS.success,
};

const TYPE_ICONS: Record<string, string> = {
  museum: "home",
  heritage: "anchor",
  library: "book-open",
};

export default function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleMarkerPress = async (loc: MapLocation) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLocation(loc);
  };

  const handleOpenDetail = async (loc: MapLocation) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLocation(loc);
    setShowDetail(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={[styles.header, { paddingTop: 67 + 16 }]}
      >
        <Text style={styles.headerTitle}>Heritage Map</Text>
        <Text style={styles.headerSubtitle}>Sites of Cultural Significance</Text>
      </LinearGradient>

      <View style={styles.mapPlaceholder}>
        <View style={styles.mapIconWrap}>
          <Feather name="map" size={40} color={COLORS.textMuted} />
        </View>
        <Text style={styles.mapPlaceholderTitle}>Interactive Map</Text>
        <Text style={styles.mapPlaceholderText}>
          The full interactive map is available on the mobile app via Expo Go.
          Browse heritage sites below.
        </Text>
      </View>

      <View style={styles.legend}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.locationList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.locationListContent, { paddingBottom: 120 }]}
      >
        {MAP_LOCATIONS.map((loc) => (
          <TouchableOpacity
            key={loc.id}
            style={[
              styles.locationCard,
              selectedLocation?.id === loc.id && styles.locationCardActive,
            ]}
            onPress={() => handleOpenDetail(loc)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.locationCardIcon,
                { backgroundColor: (TYPE_COLORS[loc.type] ?? COLORS.primary) + "20" },
              ]}
            >
              <Feather
                name={(TYPE_ICONS[loc.type] ?? "map-pin") as any}
                size={20}
                color={TYPE_COLORS[loc.type] ?? COLORS.primary}
              />
            </View>
            <View style={styles.locationCardText}>
              <Text style={styles.locationCardName} numberOfLines={1}>
                {loc.name}
              </Text>
              <Text style={styles.locationCardAddress} numberOfLines={1}>
                {loc.address}
              </Text>
              <View style={styles.locationTypeBadge}>
                <View
                  style={[
                    styles.locationTypeDot,
                    { backgroundColor: TYPE_COLORS[loc.type] ?? COLORS.primary },
                  ]}
                />
                <Text style={styles.locationTypeText}>{loc.type}</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={showDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetail(false)}
      >
        {selectedLocation && (
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[
                (TYPE_COLORS[selectedLocation.type] ?? COLORS.primaryDark) + "DD",
                TYPE_COLORS[selectedLocation.type] ?? COLORS.primary,
              ]}
              style={styles.modalHeader}
            >
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowDetail(false)}
              >
                <Feather name="x" size={20} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.modalIconContainer}>
                <Feather
                  name={(TYPE_ICONS[selectedLocation.type] ?? "map-pin") as any}
                  size={32}
                  color={COLORS.white}
                />
              </View>
              <Text style={styles.modalType}>
                {selectedLocation.type.toUpperCase()}
              </Text>
              <Text style={styles.modalTitle}>{selectedLocation.name}</Text>
            </LinearGradient>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.modalAddressRow}>
                <Feather name="map-pin" size={16} color={COLORS.textMuted} />
                <Text style={styles.modalAddress}>{selectedLocation.address}</Text>
              </View>

              <View style={styles.modalDivider} />

              <Text style={styles.modalSectionLabel}>ABOUT THIS SITE</Text>
              <Text style={styles.modalDescription}>{selectedLocation.description}</Text>

              <View style={styles.connectionNote}>
                <Feather name="link" size={16} color={COLORS.primary} />
                <Text style={styles.connectionNoteText}>
                  This site is part of the Pedro S. Tolentino cultural heritage
                  trail, commemorating the life and legacy of the Father of
                  Tagalog Zarzuela.
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
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
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    fontStyle: "italic",
  },
  mapPlaceholder: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 32,
    gap: 10,
    backgroundColor: COLORS.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  mapIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 4,
  },
  mapPlaceholderTitle: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.text,
  },
  mapPlaceholderText: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceWarm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: COLORS.textSecondary,
  },
  locationList: {
    flex: 1,
  },
  locationListContent: {
    padding: 16,
    gap: 10,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  locationCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "08",
  },
  locationCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  locationCardText: {
    flex: 1,
    gap: 3,
  },
  locationCardName: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: COLORS.text,
  },
  locationCardAddress: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: COLORS.textMuted,
  },
  locationTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  locationTypeText: {
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
    color: COLORS.textMuted,
    textTransform: "capitalize",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    padding: 24,
    paddingTop: 48,
    alignItems: "center",
    gap: 8,
  },
  modalClose: {
    alignSelf: "flex-end",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalType: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.white,
    textAlign: "center",
  },
  modalBody: {
    flex: 1,
    padding: 24,
  },
  modalAddressRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  modalAddress: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 20,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 15,
    fontFamily: "Manrope_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  connectionNote: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: COLORS.surfaceWarm,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginTop: 20,
  },
  connectionNoteText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
