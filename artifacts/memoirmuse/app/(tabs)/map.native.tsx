import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";
import { MAP_LOCATIONS, MapLocation } from "@/constants/data";

const TYPE_COLORS: Record<string, string> = {
  museum: COLORS.primaryContainer,
  heritage: COLORS.tertiaryFixedDim,
  library: COLORS.secondary,
};

const TYPE_ICONS: Record<string, string> = {
  museum: "home",
  heritage: "anchor",
  library: "book-open",
};

export default function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleMarkerPress = async (loc: MapLocation) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLocation(loc);
  };

  const handleOpenDetail = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDetail(true);
  };

  const MapContent = Platform.OS !== "web" ? NativeMapContent : WebMapContent;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0d1520", "#0a1020"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Feather name="map" size={20} color={COLORS.primaryContainer} />
          </View>
          <View>
            <Text style={styles.headerEyebrow}>MEMOIRMUSE</Text>
            <Text style={styles.headerTitle}>Heritage Map</Text>
          </View>
        </View>
        <View style={styles.headerBadge}>
          <Feather name="map-pin" size={11} color={COLORS.tertiaryFixedDim} />
          <Text style={styles.headerBadgeText}>{MAP_LOCATIONS.length} Sites</Text>
        </View>
      </LinearGradient>

      <MapContent
        locations={MAP_LOCATIONS}
        selectedLocation={selectedLocation}
        onMarkerPress={handleMarkerPress}
        onInfoCardPress={handleOpenDetail}
      />

      <View style={styles.legend}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color, shadowColor: color, shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }]} />
            <Text style={styles.legendText}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.locationList}
        contentContainerStyle={styles.locationListContent}
      >
        {MAP_LOCATIONS.map((loc) => (
          <TouchableOpacity
            key={loc.id}
            style={[
              styles.locationChip,
              selectedLocation?.id === loc.id && styles.locationChipActive,
            ]}
            onPress={() => handleMarkerPress(loc)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.locationChipDot,
                { backgroundColor: TYPE_COLORS[loc.type] || COLORS.primaryContainer },
              ]}
            />
            <Text
              style={[
                styles.locationChipText,
                selectedLocation?.id === loc.id && styles.locationChipTextActive,
              ]}
              numberOfLines={1}
            >
              {loc.name}
            </Text>
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
              colors={["#0d1520", COLORS.background]}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[
                (TYPE_COLORS[selectedLocation.type] ?? COLORS.primaryContainer) + "20",
                "transparent",
              ]}
              style={styles.modalHeaderGrad}
            />
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowDetail(false)}>
                <Feather name="x" size={18} color={COLORS.onSurface} />
              </TouchableOpacity>
              <View style={styles.modalIconContainer}>
                <Feather
                  name={(TYPE_ICONS[selectedLocation.type] ?? "map-pin") as any}
                  size={32}
                  color={TYPE_COLORS[selectedLocation.type] ?? COLORS.primaryContainer}
                />
              </View>
              <View style={styles.modalTypeTag}>
                <Text style={[styles.modalTypeText, { color: TYPE_COLORS[selectedLocation.type] ?? COLORS.primaryContainer }]}>
                  {selectedLocation.type.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.modalTitle}>{selectedLocation.name}</Text>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.modalAddressRow}>
                <Feather name="map-pin" size={15} color={COLORS.primaryContainer} />
                <Text style={styles.modalAddress}>{selectedLocation.address}</Text>
              </View>

              <View style={styles.modalDivider} />

              <Text style={styles.modalSectionLabel}>ABOUT THIS SITE</Text>
              <Text style={styles.modalDescription}>{selectedLocation.description}</Text>

              <View style={styles.connectionNote}>
                <LinearGradient
                  colors={[COLORS.primaryContainer + "08", "transparent"]}
                  style={StyleSheet.absoluteFill}
                />
                <Feather name="link" size={16} color={COLORS.primaryContainer} />
                <Text style={styles.connectionNoteText}>
                  This site is part of the Pedro S. Tolentino cultural heritage trail, commemorating the life and legacy of the Father of Tagalog Zarzuela.
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

interface MapContentProps {
  locations: MapLocation[];
  selectedLocation: MapLocation | null;
  onMarkerPress: (loc: MapLocation) => void;
  onInfoCardPress: () => void;
}

function NativeMapContent({ locations, selectedLocation, onMarkerPress, onInfoCardPress }: MapContentProps) {
  const MapView = require("react-native-maps").default;
  const { Marker } = require("react-native-maps");

  const INITIAL_REGION = {
    latitude: 14.6200,
    longitude: 121.0500,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={false}
        showsPointsOfInterest={false}
      >
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            onPress={() => onMarkerPress(loc)}
          >
            <View style={[styles.markerContainer, { backgroundColor: TYPE_COLORS[loc.type] || COLORS.primaryContainer }]}>
              <Feather
                name={(TYPE_ICONS[loc.type] ?? "map-pin") as any}
                size={14}
                color="#fff"
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedLocation && (
        <TouchableOpacity style={styles.infoCard} onPress={onInfoCardPress} activeOpacity={0.9}>
          <LinearGradient colors={[COLORS.surfaceContainer, COLORS.surfaceContainerLow]} style={StyleSheet.absoluteFill} />
          <View
            style={[styles.infoCardIcon, { backgroundColor: (TYPE_COLORS[selectedLocation.type] ?? COLORS.primaryContainer) + "18" }]}
          >
            <Feather
              name={(TYPE_ICONS[selectedLocation.type] ?? "map-pin") as any}
              size={22}
              color={TYPE_COLORS[selectedLocation.type] ?? COLORS.primaryContainer}
            />
          </View>
          <View style={styles.infoCardText}>
            <Text style={styles.infoCardTitle}>{selectedLocation.name}</Text>
            <Text style={styles.infoCardAddress} numberOfLines={1}>{selectedLocation.address}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function WebMapContent({ locations, selectedLocation, onMarkerPress, onInfoCardPress }: MapContentProps) {
  return (
    <View style={[styles.mapContainer, styles.webMapContainer]}>
      <LinearGradient colors={["#080e18", "#050810"]} style={StyleSheet.absoluteFill} />
      <View style={styles.webMapPlaceholder}>
        <View style={styles.webMapIconRing}>
          <Feather name="map" size={32} color={COLORS.primaryContainer} />
        </View>
        <Text style={styles.webMapTitle}>Heritage Map</Text>
        <Text style={styles.webMapSubtitle}>Live map available on mobile via Expo Go</Text>
      </View>

      <View style={styles.webLocationGrid}>
        {locations.map((loc) => (
          <TouchableOpacity
            key={loc.id}
            style={[
              styles.webLocationCard,
              selectedLocation?.id === loc.id && styles.webLocationCardActive,
            ]}
            onPress={() => { onMarkerPress(loc); onInfoCardPress(); }}
            activeOpacity={0.8}
          >
            <View style={[styles.webLocationCardIcon, { backgroundColor: (TYPE_COLORS[loc.type] ?? COLORS.primaryContainer) + "18" }]}>
              <Feather
                name={(TYPE_ICONS[loc.type] ?? "map-pin") as any}
                size={18}
                color={TYPE_COLORS[loc.type] ?? COLORS.primaryContainer}
              />
            </View>
            <View style={styles.webLocationCardText}>
              <Text style={styles.webLocationCardName} numberOfLines={1}>{loc.name}</Text>
              <Text style={styles.webLocationCardType}>{loc.type}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,229,255,0.08)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,229,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerEyebrow: {
    fontSize: 9,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#00e5ff",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onSurface,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "20",
  },
  headerBadgeText: { fontSize: 11, fontFamily: "Manrope_700Bold", color: COLORS.tertiaryFixedDim, letterSpacing: 0.5 },

  mapContainer: { flex: 1, position: "relative" },
  webMapContainer: {},
  webMapPlaceholder: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant + "15",
  },
  webMapIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,229,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  webMapTitle: { fontSize: 18, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface },
  webMapSubtitle: { fontSize: 13, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant },
  webLocationGrid: { padding: 16, gap: 10 },
  webLocationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "18",
  },
  webLocationCardActive: { borderColor: COLORS.primaryContainer + "50", backgroundColor: COLORS.primaryContainer + "08" },
  webLocationCardIcon: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center" },
  webLocationCardText: { flex: 1, gap: 3 },
  webLocationCardName: { fontSize: 14, fontFamily: "SpaceGrotesk_600SemiBold", color: COLORS.onSurface },
  webLocationCardType: { fontSize: 11, fontFamily: "Manrope_500Medium", color: COLORS.onSurfaceVariant, textTransform: "capitalize" },

  map: { flex: 1 },
  markerContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff30",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  infoCard: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "20",
    overflow: "hidden",
  },
  infoCardIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  infoCardText: { flex: 1, gap: 4 },
  infoCardTitle: { fontSize: 15, fontFamily: "SpaceGrotesk_600SemiBold", color: COLORS.onSurface },
  infoCardAddress: { fontSize: 12, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant },

  legend: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant + "15",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurfaceVariant, textTransform: "capitalize" },

  locationList: {
    maxHeight: 58,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant + "15",
  },
  locationListContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8, alignItems: "center" },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "20",
  },
  locationChipActive: { backgroundColor: "rgba(0,229,255,0.1)", borderColor: "rgba(0,229,255,0.4)" },
  locationChipDot: { width: 7, height: 7, borderRadius: 4 },
  locationChipText: { fontSize: 12, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurfaceVariant, maxWidth: 140 },
  locationChipTextActive: { color: "#00e5ff" },

  modalContainer: { flex: 1, backgroundColor: COLORS.background, overflow: "hidden" },
  modalHeaderGrad: { position: "absolute", top: 0, left: 0, right: 0, height: 280 },
  modalHeader: {
    padding: 24,
    paddingTop: 36,
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant + "15",
    position: "relative",
  },
  modalClose: {
    position: "absolute",
    top: 24,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerHighest,
    justifyContent: "center",
    alignItems: "center",
  },
  modalIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(0,229,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTypeTag: {
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  modalTypeText: { fontSize: 10, fontFamily: "Manrope_700Bold", letterSpacing: 1.5, textTransform: "uppercase" },
  modalTitle: { fontSize: 22, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, textAlign: "center" },
  modalBody: { flex: 1, padding: 24 },
  modalAddressRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalAddress: { flex: 1, fontSize: 14, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 22 },
  modalDivider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.outlineVariant + "25", marginBottom: 20 },
  modalSectionLabel: {
    fontSize: 10,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.primaryContainer,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  modalDescription: { fontSize: 15, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 24 },
  connectionNote: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryContainer + "20",
    marginTop: 20,
    overflow: "hidden",
  },
  connectionNoteText: { flex: 1, fontSize: 13, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 20 },
});
