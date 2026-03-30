import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";
import { AR_MARKERS } from "@/constants/data";

const { width, height } = Dimensions.get("window");

export default function ARScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<typeof AR_MARKERS[0] | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [markerIndex, setMarkerIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let scanInterval: ReturnType<typeof setTimeout>;

    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      scanInterval = setTimeout(async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setDetected(true);
        setSelectedMarker(AR_MARKERS[markerIndex % AR_MARKERS.length]);
        setScanning(false);

        Animated.spring(overlayAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 3000);
    }

    return () => {
      if (scanInterval) clearTimeout(scanInterval);
      scanAnim.stopAnimation();
    };
  }, [scanning, markerIndex]);

  const handleStartScan = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDetected(false);
    setSelectedMarker(null);
    overlayAnim.setValue(0);
    pulseAnim.setValue(1);
    scanAnim.setValue(0);
    setScanning(true);
  };

  const handleReset = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScanning(false);
    setDetected(false);
    setSelectedMarker(null);
    overlayAnim.setValue(0);
    setMarkerIndex((prev) => (prev + 1) % AR_MARKERS.length);
  };

  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={[styles.header, { paddingTop: topPad + 16 }]}
        >
          <Text style={styles.headerTitle}>AR Scanner</Text>
          <Text style={styles.headerSubtitle}>Point & Discover</Text>
        </LinearGradient>
        <View style={styles.webFallback}>
          <View style={styles.webFallbackIcon}>
            <Feather name="camera" size={48} color={COLORS.textMuted} />
          </View>
          <Text style={styles.webFallbackTitle}>AR Available on Mobile</Text>
          <Text style={styles.webFallbackText}>
            Open this app on your mobile device via Expo Go to use the Augmented
            Reality scanner to discover historical artifacts.
          </Text>
          <Text style={styles.webFallbackHint}>
            Scan the QR code from the Replit URL bar
          </Text>
          <TouchableOpacity style={styles.simulateBtn} onPress={handleStartScan}>
            <Feather name="zap" size={16} color={COLORS.white} />
            <Text style={styles.simulateBtnText}>Simulate AR Discovery</Text>
          </TouchableOpacity>
          {detected && selectedMarker && (
            <Animated.View
              style={[
                styles.detectedCard,
                { transform: [{ scale: overlayAnim }], opacity: overlayAnim },
              ]}
            >
              <View style={styles.detectedHeader}>
                <View style={styles.detectedIcon}>
                  <Feather name={selectedMarker.icon as any} size={22} color={COLORS.white} />
                </View>
                <View>
                  <Text style={styles.detectedLabel}>AR Discovered</Text>
                  <Text style={styles.detectedTitle}>{selectedMarker.title}</Text>
                </View>
              </View>
              <Text style={styles.detectedDesc}>{selectedMarker.description}</Text>
              <TouchableOpacity
                style={styles.learnMoreBtn}
                onPress={() => setShowDetail(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.learnMoreText}>Learn More</Text>
                <Feather name="arrow-right" size={14} color={COLORS.white} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
        <DetailModal
          visible={showDetail}
          marker={selectedMarker}
          onClose={() => setShowDetail(false)}
          onNext={handleReset}
        />
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <View style={styles.permissionContainer}>
          <Feather name="camera-off" size={48} color={COLORS.textMuted} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            MemoirMuse needs camera access to enable the AR scanner experience.
          </Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionBtnText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        <View style={[styles.overlay, { paddingTop: topPad }]}>
          <View style={styles.topBar}>
            <Text style={styles.arTitle}>AR Scanner</Text>
            {detected && (
              <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                <Feather name="refresh-cw" size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>

          {!detected && (
            <View style={styles.scanFrame}>
              <View style={styles.scanCornerTL} />
              <View style={styles.scanCornerTR} />
              <View style={styles.scanCornerBL} />
              <View style={styles.scanCornerBR} />
              {scanning && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    { transform: [{ translateY: scanLineY }] },
                  ]}
                />
              )}
            </View>
          )}

          {detected && selectedMarker && (
            <Animated.View
              style={[
                styles.detectedOverlay,
                {
                  transform: [{ scale: overlayAnim }, { scale: pulseAnim }],
                  opacity: overlayAnim,
                },
              ]}
            >
              <LinearGradient
                colors={[COLORS.primaryDark + "F0", COLORS.primary + "F0"]}
                style={styles.detectedGradient}
              >
                <View style={styles.detectedIcon}>
                  <Feather name={selectedMarker.icon as any} size={24} color={COLORS.white} />
                </View>
                <Text style={styles.detectedBadge}>AR DETECTED</Text>
                <Text style={styles.detectedTitle}>{selectedMarker.title}</Text>
                <Text style={styles.detectedDesc}>{selectedMarker.description}</Text>
                <TouchableOpacity
                  style={styles.learnMoreBtn}
                  onPress={() => setShowDetail(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.learnMoreText}>Learn More</Text>
                  <Feather name="arrow-right" size={14} color={COLORS.white} />
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          )}

          {!detected && (
            <View style={styles.bottomBar}>
              <Text style={styles.scanInstruction}>
                {scanning ? "Scanning for artifacts..." : "Tap scan to discover AR artifacts"}
              </Text>
              <TouchableOpacity
                style={[styles.scanBtn, scanning && styles.scanBtnActive]}
                onPress={scanning ? undefined : handleStartScan}
                activeOpacity={0.85}
              >
                {scanning ? (
                  <View style={styles.scanBtnInner}>
                    <Feather name="zap" size={24} color={COLORS.white} />
                  </View>
                ) : (
                  <View style={styles.scanBtnInner}>
                    <Feather name="camera" size={24} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CameraView>

      <DetailModal
        visible={showDetail}
        marker={selectedMarker}
        onClose={() => setShowDetail(false)}
        onNext={handleReset}
      />
    </View>
  );
}

function DetailModal({
  visible,
  marker,
  onClose,
  onNext,
}: {
  visible: boolean;
  marker: typeof AR_MARKERS[0] | null;
  onClose: () => void;
  onNext: () => void;
}) {
  if (!marker) return null;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={styles.modalHeader}
        >
          <View style={styles.modalHeaderContent}>
            <View style={styles.modalIcon}>
              <Feather name={marker.icon as any} size={28} color={COLORS.white} />
            </View>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalLabel}>AR ARTIFACT</Text>
              <Text style={styles.modalTitle}>{marker.title}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <Feather name="x" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </LinearGradient>
        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.modalDescription}>{marker.description}</Text>
          <View style={styles.modalDivider} />
          <Text style={styles.modalDetailsTitle}>Historical Context</Text>
          <Text style={styles.modalDetails}>{marker.details}</Text>
        </ScrollView>
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.nextArtifactBtn} onPress={() => { onClose(); onNext(); }}>
            <Text style={styles.nextArtifactText}>Scan Next Artifact</Text>
            <Feather name="camera" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  arTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 240,
    height: 240,
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
  },
  scanCornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.accent,
    borderRadius: 4,
  },
  scanCornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.accent,
    borderRadius: 4,
  },
  scanCornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.accent,
    borderRadius: 4,
  },
  scanCornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.accent,
    borderRadius: 4,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  detectedOverlay: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: "hidden",
  },
  detectedGradient: {
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  bottomBar: {
    alignItems: "center",
    paddingBottom: 40,
    gap: 16,
  },
  scanInstruction: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scanBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  scanBtnActive: {
    backgroundColor: COLORS.accent,
  },
  scanBtnInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  detectedBadge: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.accentLight,
    letterSpacing: 2,
  },
  detectedTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: COLORS.white,
    textAlign: "center",
  },
  detectedDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 20,
  },
  detectedIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  learnMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 4,
  },
  learnMoreText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.white,
  },
  permissionContainer: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: COLORS.text,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  permissionBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.white,
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
  webFallback: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  webFallbackIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  webFallbackTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: COLORS.text,
    textAlign: "center",
  },
  webFallbackText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  webFallbackHint: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
    textAlign: "center",
    fontStyle: "italic",
  },
  simulateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  simulateBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.white,
  },
  detectedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    marginTop: 8,
  },
  detectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  detectedLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    padding: 24,
    paddingTop: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderText: {
    flex: 1,
    gap: 4,
  },
  modalLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: COLORS.white,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    flex: 1,
    padding: 24,
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: COLORS.text,
    lineHeight: 26,
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 20,
  },
  modalDetailsTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  modalDetails: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  modalFooter: {
    padding: 24,
    paddingBottom: 40,
  },
  nextArtifactBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextArtifactText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.white,
  },
});
