import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";
import { AR_MARKERS } from "@/constants/data";

const { width, height } = Dimensions.get("window");

type ScanState = "idle" | "scanning" | "detected";

export default function ARScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [markerIndex, setMarkerIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const detectAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cornerAnim = useRef(new Animated.Value(0)).current;
  const scanLoop = useRef<Animated.CompositeAnimation | null>(null);
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const currentMarker = AR_MARKERS[markerIndex % AR_MARKERS.length];

  useEffect(() => {
    if (scanState === "scanning") {
      Animated.timing(cornerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      scanLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      scanLoop.current.start();

      const timer = setTimeout(async () => {
        scanLoop.current?.stop();
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setScanState("detected");

        Animated.spring(detectAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }).start();

        pulseLoop.current = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.03,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
          ])
        );
        pulseLoop.current.start();
      }, 3500);

      return () => {
        clearTimeout(timer);
        scanLoop.current?.stop();
      };
    } else if (scanState === "idle") {
      Animated.timing(cornerAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      pulseLoop.current?.stop();
    }
  }, [scanState]);

  const handleScan = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    detectAnim.setValue(0);
    pulseAnim.setValue(1);
    scanLineAnim.setValue(0);
    setScanState("scanning");
  };

  const handleReset = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    pulseLoop.current?.stop();
    setScanState("idle");
    setMarkerIndex((i) => (i + 1) % AR_MARKERS.length);
  };

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  if (Platform.OS === "web") {
    return <WebARScreen
      scanState={scanState}
      currentMarker={currentMarker}
      markerIndex={markerIndex}
      topPad={topPad}
      scanLineAnim={scanLineAnim}
      detectAnim={detectAnim}
      pulseAnim={pulseAnim}
      showDetail={showDetail}
      onScan={handleScan}
      onReset={handleReset}
      onShowDetail={() => setShowDetail(true)}
      onHideDetail={() => setShowDetail(false)}
    />;
  }

  if (!permission) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadText}>Initializing camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <View style={styles.permBox}>
          <View style={styles.permIcon}>
            <Feather name="camera-off" size={40} color={COLORS.textMuted} />
          </View>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permText}>
            MemoirMuse needs camera access to scan AR markers and reveal
            historical artifacts.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Grant Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing="back">
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent", "transparent", "rgba(0,0,0,0.7)"]}
          style={[StyleSheet.absoluteFill, { paddingTop: topPad }]}
        >
          <View style={styles.nativeTopBar}>
            <Text style={styles.nativeTitle}>AR Scanner</Text>
            {scanState === "detected" && (
              <TouchableOpacity style={styles.nativeResetBtn} onPress={handleReset}>
                <Feather name="refresh-cw" size={16} color="#fff" />
                <Text style={styles.nativeResetText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>

          {scanState !== "detected" && (
            <View style={styles.frameArea}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              {scanState === "scanning" && (
                <Animated.View
                  style={[styles.nativeScanLine, { transform: [{ translateY: scanLineY }] }]}
                />
              )}
            </View>
          )}

          {scanState === "detected" && (
            <Animated.View
              style={[
                styles.nativeDetect,
                { opacity: detectAnim, transform: [{ scale: pulseAnim }] },
              ]}
            >
              <LinearGradient
                colors={[COLORS.primaryDark + "F0", COLORS.primary + "F0"]}
                style={styles.nativeDetectGrad}
              >
                <View style={styles.nativeDetectIcon}>
                  <Feather name={currentMarker.icon as any} size={28} color="#fff" />
                </View>
                <Text style={styles.nativeDetectBadge}>AR DETECTED</Text>
                <Text style={styles.nativeDetectTitle}>{currentMarker.title}</Text>
                <Text style={styles.nativeDetectDesc}>{currentMarker.description}</Text>
                <TouchableOpacity
                  style={styles.nativeLearnBtn}
                  onPress={() => setShowDetail(true)}
                >
                  <Text style={styles.nativeLearnText}>Learn More</Text>
                  <Feather name="arrow-right" size={14} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          )}

          {scanState !== "detected" && (
            <View style={styles.nativeBottomBar}>
              <Text style={styles.nativeScanHint}>
                {scanState === "scanning"
                  ? "Scanning for artifacts…"
                  : "Point at an AR marker and tap Scan"}
              </Text>
              <TouchableOpacity
                style={[styles.nativeScanBtn, scanState === "scanning" && styles.nativeScanBtnActive]}
                onPress={scanState === "idle" ? handleScan : undefined}
                activeOpacity={0.85}
              >
                <Feather name={scanState === "scanning" ? "zap" : "camera"} size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </CameraView>

      <DetailModal
        visible={showDetail}
        marker={currentMarker}
        onClose={() => setShowDetail(false)}
        onNext={() => { setShowDetail(false); handleReset(); }}
      />
    </View>
  );
}

function WebARScreen({
  scanState,
  currentMarker,
  markerIndex,
  topPad,
  scanLineAnim,
  detectAnim,
  pulseAnim,
  showDetail,
  onScan,
  onReset,
  onShowDetail,
  onHideDetail,
}: {
  scanState: ScanState;
  currentMarker: typeof AR_MARKERS[0];
  markerIndex: number;
  topPad: number;
  scanLineAnim: Animated.Value;
  detectAnim: Animated.Value;
  pulseAnim: Animated.Value;
  showDetail: boolean;
  onScan: () => void;
  onReset: () => void;
  onShowDetail: () => void;
  onHideDetail: () => void;
}) {
  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={[styles.webHeader, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.webHeaderTitle}>AR Scanner</Text>
        <Text style={styles.webHeaderSub}>Discover Historical Artifacts</Text>
      </LinearGradient>

      <ScrollView
        style={styles.webScroll}
        contentContainerStyle={styles.webScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.webCameraBox}>
          <View style={styles.webCameraInner}>
            <View style={styles.webGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={`h${i}`} style={[styles.webGridLine, styles.webGridLineH, { top: `${(i + 1) * (100 / 7)}%` as any }]} />
              ))}
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={`v${i}`} style={[styles.webGridLine, styles.webGridLineV, { left: `${(i + 1) * 20}%` as any }]} />
              ))}
            </View>

            <View style={styles.webCornerTL} />
            <View style={styles.webCornerTR} />
            <View style={styles.webCornerBL} />
            <View style={styles.webCornerBR} />

            {scanState === "scanning" && (
              <Animated.View
                style={[styles.webScanLine, { transform: [{ translateY: scanLineY }] }]}
              />
            )}

            {scanState === "idle" && (
              <View style={styles.webIdleContent}>
                <View style={styles.webIdleIcon}>
                  <Feather name="camera" size={36} color="rgba(255,255,255,0.4)" />
                </View>
                <Text style={styles.webIdleText}>Tap Scan to detect an artifact</Text>
              </View>
            )}

            {scanState === "scanning" && (
              <View style={styles.webScanningContent}>
                <Text style={styles.webScanningLabel}>SCANNING</Text>
                <Text style={styles.webScanningText}>Looking for artifacts…</Text>
              </View>
            )}

            {scanState === "detected" && (
              <Animated.View
                style={[
                  styles.webDetectedOverlay,
                  { opacity: detectAnim, transform: [{ scale: pulseAnim }] },
                ]}
              >
                <LinearGradient
                  colors={[COLORS.primaryDark + "E8", COLORS.primary + "E8"]}
                  style={styles.webDetectedGrad}
                >
                  <View style={styles.webDetectedIconRing}>
                    <Feather name={currentMarker.icon as any} size={32} color="#fff" />
                  </View>
                  <View style={styles.webDetectedBadgeRow}>
                    <View style={styles.webDetectedBadge}>
                      <Feather name="check-circle" size={12} color={COLORS.accent} />
                      <Text style={styles.webDetectedBadgeText}>AR DETECTED</Text>
                    </View>
                  </View>
                  <Text style={styles.webDetectedTitle}>{currentMarker.title}</Text>
                  <Text style={styles.webDetectedDesc}>{currentMarker.description}</Text>
                </LinearGradient>
              </Animated.View>
            )}

            <View style={styles.webArtifactCount}>
              {AR_MARKERS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.webDot,
                    i === markerIndex % AR_MARKERS.length && styles.webDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.webScanControls}>
            {scanState === "detected" ? (
              <View style={styles.webDetectedActions}>
                <TouchableOpacity style={styles.webLearnBtn} onPress={onShowDetail} activeOpacity={0.85}>
                  <Feather name="book-open" size={18} color="#fff" />
                  <Text style={styles.webLearnBtnText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.webNextBtn} onPress={onReset} activeOpacity={0.85}>
                  <Feather name="refresh-cw" size={16} color={COLORS.primary} />
                  <Text style={styles.webNextBtnText}>Scan Next</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.webScanBtn, scanState === "scanning" && styles.webScanBtnActive]}
                onPress={scanState === "idle" ? onScan : undefined}
                activeOpacity={0.9}
              >
                <Feather
                  name={scanState === "scanning" ? "zap" : "camera"}
                  size={22}
                  color="#fff"
                />
                <Text style={styles.webScanBtnText}>
                  {scanState === "scanning" ? "Scanning…" : "Scan Artifact"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {scanState === "detected" && (
          <Animated.View style={[styles.webInfoCard, { opacity: detectAnim }]}>
            <View style={styles.webInfoCardHeader}>
              <View style={[styles.webInfoIconWrap, { backgroundColor: COLORS.primary + "20" }]}>
                <Feather name={currentMarker.icon as any} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.webInfoCardMeta}>
                <Text style={styles.webInfoCardLabel}>AR ARTIFACT #{markerIndex % AR_MARKERS.length + 1}</Text>
                <Text style={styles.webInfoCardTitle}>{currentMarker.title}</Text>
              </View>
            </View>
            <Text style={styles.webInfoCardDesc}>{currentMarker.description}</Text>
            <View style={styles.webInfoCardDivider} />
            <Text style={styles.webInfoCardBody}>{currentMarker.details}</Text>
          </Animated.View>
        )}

        <View style={styles.webHintBox}>
          <Feather name="info" size={16} color={COLORS.textMuted} />
          <Text style={styles.webHintText}>
            In the mobile app, point your camera at AR markers at museums and historical
            sites to discover digital artifacts overlaid in real-time.
          </Text>
        </View>

        <View style={styles.webMarkerList}>
          <Text style={styles.webMarkerListTitle}>AVAILABLE ARTIFACTS</Text>
          {AR_MARKERS.map((m, i) => (
            <View key={m.id} style={styles.webMarkerRow}>
              <View style={[styles.webMarkerIcon, { backgroundColor: COLORS.primary + "18" }]}>
                <Feather name={m.icon as any} size={16} color={COLORS.primary} />
              </View>
              <View style={styles.webMarkerInfo}>
                <Text style={styles.webMarkerName}>{m.title}</Text>
                <Text style={styles.webMarkerDesc} numberOfLines={1}>{m.description}</Text>
              </View>
              <View style={[styles.webMarkerStatus, { opacity: i < (markerIndex % AR_MARKERS.length + (scanState === "detected" ? 1 : 0)) ? 1 : 0.3 }]}>
                <Feather name="check-circle" size={16} color={COLORS.success} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <DetailModal
        visible={showDetail}
        marker={currentMarker}
        onClose={onHideDetail}
        onNext={() => { onHideDetail(); onReset(); }}
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
  marker: typeof AR_MARKERS[0];
  onClose: () => void;
  onNext: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalWrap}>
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={styles.modalHead}
        >
          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Feather name="x" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.modalIconRing}>
            <Feather name={marker.icon as any} size={32} color="#fff" />
          </View>
          <View style={styles.modalBadge}>
            <Feather name="zap" size={11} color={COLORS.accent} />
            <Text style={styles.modalBadgeText}>AR ARTIFACT</Text>
          </View>
          <Text style={styles.modalHeadTitle}>{marker.title}</Text>
        </LinearGradient>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionLabel}>DESCRIPTION</Text>
            <Text style={styles.modalSectionText}>{marker.description}</Text>
          </View>
          <View style={styles.modalDivider} />
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionLabel}>HISTORICAL CONTEXT</Text>
            <Text style={styles.modalSectionText}>{marker.details}</Text>
          </View>
          <View style={styles.modalConnNote}>
            <Feather name="link-2" size={14} color={COLORS.primary} />
            <Text style={styles.modalConnNoteText}>
              This artifact is part of the Pedro S. Tolentino digital heritage collection,
              brought to life through augmented reality.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.modalNextBtn} onPress={onNext} activeOpacity={0.9}>
            <Feather name="camera" size={18} color="#fff" />
            <Text style={styles.modalNextText}>Scan Next Artifact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  center: { justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  loadText: { fontSize: 15, fontFamily: "Inter_400Regular", color: COLORS.textSecondary },

  // Permission
  permBox: { alignItems: "center", gap: 16, paddingHorizontal: 40 },
  permIcon: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.backgroundDark, justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  permTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: COLORS.text, textAlign: "center" },
  permText: { fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, textAlign: "center", lineHeight: 22 },
  permBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  permBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },

  // Native camera overlay
  nativeTopBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14 },
  nativeTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  nativeResetBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  nativeResetText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  frameArea: { width: 240, height: 240, alignSelf: "center", marginTop: 60, position: "relative", overflow: "hidden" },
  corner: { position: "absolute", width: 36, height: 36, borderColor: COLORS.accent, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  nativeScanLine: { position: "absolute", left: 0, right: 0, height: 2, backgroundColor: COLORS.accent },
  nativeDetect: { marginHorizontal: 24, borderRadius: 20, overflow: "hidden", marginTop: 20 },
  nativeDetectGrad: { padding: 24, alignItems: "center", gap: 10 },
  nativeDetectIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  nativeDetectBadge: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: COLORS.accent, letterSpacing: 2 },
  nativeDetectTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  nativeDetectDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 20 },
  nativeLearnBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginTop: 4 },
  nativeLearnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  nativeBottomBar: { alignItems: "center", paddingBottom: 48, gap: 16 },
  nativeScanHint: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  nativeScanBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.3)" },
  nativeScanBtnActive: { backgroundColor: COLORS.accent },

  // Web layout
  webHeader: { paddingHorizontal: 24, paddingBottom: 20 },
  webHeaderTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  webHeaderSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", marginTop: 4, fontStyle: "italic" },
  webScroll: { flex: 1, backgroundColor: COLORS.background },
  webScrollContent: { paddingBottom: 120 },

  webCameraBox: { margin: 16, borderRadius: 20, overflow: "hidden", backgroundColor: "#111", borderWidth: 1, borderColor: "#333" },
  webCameraInner: { height: 280, position: "relative", backgroundColor: "#0D1117", justifyContent: "center", alignItems: "center" },
  webGrid: { ...StyleSheet.absoluteFillObject },
  webGridLine: { position: "absolute", backgroundColor: "rgba(255,255,255,0.04)" },
  webGridLineH: { left: 0, right: 0, height: 1 },
  webGridLineV: { top: 0, bottom: 0, width: 1 },

  webCornerTL: { position: "absolute", top: 16, left: 16, width: 28, height: 28, borderTopWidth: 2, borderLeftWidth: 2, borderColor: COLORS.accent, borderTopLeftRadius: 3 },
  webCornerTR: { position: "absolute", top: 16, right: 16, width: 28, height: 28, borderTopWidth: 2, borderRightWidth: 2, borderColor: COLORS.accent, borderTopRightRadius: 3 },
  webCornerBL: { position: "absolute", bottom: 16, left: 16, width: 28, height: 28, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: COLORS.accent, borderBottomLeftRadius: 3 },
  webCornerBR: { position: "absolute", bottom: 16, right: 16, width: 28, height: 28, borderBottomWidth: 2, borderRightWidth: 2, borderColor: COLORS.accent, borderBottomRightRadius: 3 },

  webScanLine: { position: "absolute", left: 16, right: 16, height: 2, backgroundColor: COLORS.accent, shadowColor: COLORS.accent, shadowRadius: 8, shadowOpacity: 0.9, shadowOffset: { width: 0, height: 0 } },

  webIdleContent: { alignItems: "center", gap: 10 },
  webIdleIcon: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  webIdleText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },

  webScanningContent: { alignItems: "center", gap: 8 },
  webScanningLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: COLORS.accent, letterSpacing: 3 },
  webScanningText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },

  webDetectedOverlay: { ...StyleSheet.absoluteFillObject },
  webDetectedGrad: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  webDetectedIconRing: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  webDetectedBadgeRow: { flexDirection: "row" },
  webDetectedBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  webDetectedBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: COLORS.accent, letterSpacing: 1.5 },
  webDetectedTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  webDetectedDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 20 },

  webArtifactCount: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
  webDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.25)" },
  webDotActive: { backgroundColor: COLORS.accent, width: 18 },

  webScanControls: { padding: 16, borderTopWidth: 1, borderTopColor: "#222" },
  webScanBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 14 },
  webScanBtnActive: { backgroundColor: COLORS.accent },
  webScanBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },

  webDetectedActions: { flexDirection: "row", gap: 10 },
  webLearnBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 14 },
  webLearnBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  webNextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: COLORS.primary + "10" },
  webNextBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: COLORS.primary },

  webInfoCard: { marginHorizontal: 16, marginTop: 4, backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.borderLight, gap: 12 },
  webInfoCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  webInfoIconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  webInfoCardMeta: { flex: 1, gap: 2 },
  webInfoCardLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: COLORS.primary, letterSpacing: 1.5 },
  webInfoCardTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: COLORS.text },
  webInfoCardDesc: { fontSize: 14, fontFamily: "Inter_500Medium", color: COLORS.textSecondary, lineHeight: 22 },
  webInfoCardDivider: { height: 1, backgroundColor: COLORS.borderLight },
  webInfoCardBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, lineHeight: 22 },

  webHintBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginHorizontal: 16, marginTop: 16, padding: 14, backgroundColor: COLORS.backgroundDark, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight },
  webHintText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textMuted, lineHeight: 18 },

  webMarkerList: { marginHorizontal: 16, marginTop: 16, gap: 10 },
  webMarkerListTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: COLORS.primary, letterSpacing: 2, marginBottom: 4 },
  webMarkerRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.borderLight },
  webMarkerIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  webMarkerInfo: { flex: 1, gap: 2 },
  webMarkerName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.text },
  webMarkerDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  webMarkerStatus: {},

  // Detail modal
  modalWrap: { flex: 1, backgroundColor: COLORS.background },
  modalHead: { padding: 24, paddingTop: 48, alignItems: "center", gap: 10 },
  modalCloseBtn: { alignSelf: "flex-end", width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  modalIconRing: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  modalBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  modalBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: COLORS.accent, letterSpacing: 1.5 },
  modalHeadTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  modalBody: { flex: 1, padding: 24 },
  modalSection: { gap: 8 },
  modalSectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: COLORS.primary, letterSpacing: 2 },
  modalSectionText: { fontSize: 15, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, lineHeight: 24 },
  modalDivider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 20 },
  modalConnNote: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 20, padding: 16, backgroundColor: COLORS.surfaceWarm, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight },
  modalConnNoteText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, lineHeight: 20 },
  modalFooter: { padding: 24, paddingBottom: 40 },
  modalNextBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16 },
  modalNextText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
