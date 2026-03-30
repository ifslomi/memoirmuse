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
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>Heritage Map</Text>
        <Text style={styles.headerSubtitle}>Sites of Cultural Significance</Text>
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
            <View style={[styles.legendDot, { backgroundColor: color }]} />
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
                { backgroundColor: TYPE_COLORS[loc.type] || COLORS.primary },
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
            <View
              style={[
                styles.markerContainer,
                { backgroundColor: TYPE_COLORS[loc.type] || COLORS.primary },
              ]}
            >
              <Feather
                name={(TYPE_ICONS[loc.type] ?? "map-pin") as any}
                size={14}
                color={COLORS.white}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedLocation && (
        <TouchableOpacity
          style={styles.infoCard}
          onPress={onInfoCardPress}
          activeOpacity={0.9}
        >
          <View
            style={[
              styles.infoCardIcon,
              { backgroundColor: (TYPE_COLORS[selectedLocation.type] ?? COLORS.primary) + "20" },
            ]}
          >
            <Feather
              name={(TYPE_ICONS[selectedLocation.type] ?? "map-pin") as any}
              size={22}
              color={TYPE_COLORS[selectedLocation.type] ?? COLORS.primary}
            />
          </View>
          <View style={styles.infoCardText}>
            <Text style={styles.infoCardTitle}>{selectedLocation.name}</Text>
            <Text style={styles.infoCardAddress} numberOfLines={1}>
              {selectedLocation.address}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function WebMapContent({ locations, selectedLocation, onMarkerPress, onInfoCardPress }: MapContentProps) {
  return (
    <View style={[styles.mapContainer, styles.webMapContainer]}>
      <View style={styles.webMapPlaceholder}>
        <Feather name="map" size={36} color={COLORS.textMuted} />
        <Text style={styles.webMapTitle}>Interactive Map</Text>
        <Text style={styles.webMapSubtitle}>Available on mobile via Expo Go</Text>
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
            <View
              style={[
                styles.webLocationCardIcon,
                { backgroundColor: (TYPE_COLORS[loc.type] ?? COLORS.primary) + "20" },
              ]}
            >
              <Feather
                name={(TYPE_ICONS[loc.type] ?? "map-pin") as any}
                size={18}
                color={TYPE_COLORS[loc.type] ?? COLORS.primary}
              />
            </View>
            <View style={styles.webLocationCardText}>
              <Text style={styles.webLocationCardName} numberOfLines={1}>{loc.name}</Text>
              <Text style={styles.webLocationCardType}>{loc.type}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
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
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  webMapContainer: {
    backgroundColor: COLORS.backgroundDark,
  },
  webMapPlaceholder: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  webMapTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
  },
  webMapSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
  },
  webLocationGrid: {
    padding: 16,
    gap: 10,
  },
  webLocationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  webLocationCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "08",
  },
  webLocationCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  webLocationCardText: {
    flex: 1,
    gap: 3,
  },
  webLocationCardName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
  },
  webLocationCardType: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
    textTransform: "capitalize",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  infoCard: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  infoCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCardText: {
    flex: 1,
    gap: 4,
  },
  infoCardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
  },
  infoCardAddress: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceWarm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
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
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
  },
  locationList: {
    maxHeight: 56,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  locationListContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  locationChipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primary,
  },
  locationChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
    maxWidth: 140,
  },
  locationChipTextActive: {
    color: COLORS.white,
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
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
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
    fontFamily: "Inter_400Regular",
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
    fontFamily: "Inter_600SemiBold",
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
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
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
