import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Easing,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";
import { AR_MARKERS } from "@/constants/data";

const { width: SW, height: SH } = Dimensions.get("window");
type ScanState = "idle" | "scanning" | "detected";

const ARTIFACT_DATA = AR_MARKERS.map((m, i) => ({
  ...m,
  era: ["CIRCA 1902 • THEATRICAL ERA", "CIRCA 1896 • REVOLUTIONARY", "CIRCA 1910 • CULTURAL"][i % 3],
  rarity: ["RARE GRADE", "EPIC RELIC", "COMMON GRADE"][i % 3],
  rarityColor: [COLORS.tertiaryFixedDim, COLORS.primaryContainer, COLORS.onSurfaceVariant][i % 3],
  xp: ["+350 XP", "+500 XP", "+150 XP"][i % 3],
}));

export default function ARScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [markerIndex, setMarkerIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [signalPct, setSignalPct] = useState(0);

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const cornerBlink = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const artifact = ARTIFACT_DATA[markerIndex % ARTIFACT_DATA.length];

  const startScanLine = useCallback(() => {
    scanLineAnim.setValue(0);
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.9, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerBlink, { toValue: 0.5, duration: 500, useNativeDriver: true }),
        Animated.timing(cornerBlink, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    startPulse();
  }, []);

  const handleScan = async () => {
    if (scanState !== "idle") return;
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setScanState("scanning");
    setSignalPct(0);
    startScanLine();

    let progress = 0;
    const interval = setInterval(() => {
      progress += 12 + Math.random() * 15;
      setSignalPct(Math.min(Math.round(progress), 98));
      if (progress >= 100) {
        clearInterval(interval);
        setSignalPct(98);
        setScanState("detected");
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 280);
  };

  const handleReset = () => {
    setScanState("idle");
    setSignalPct(0);
    setMarkerIndex((i) => i + 1);
  };

  if (Platform.OS !== "web" && !permission?.granted) {
    return (
      <View style={[styles.root, styles.center]}>
        <View style={styles.permBox}>
          <View style={styles.permIconRing}>
            <Feather name="camera" size={36} color={COLORS.primaryContainer} />
          </View>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permText}>Enable camera access to scan AR markers at heritage sites.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.permBtnGrad}>
              <Text style={styles.permBtnText}>Enable Camera</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const scanYInterp = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  const isNative = Platform.OS !== "web" && permission?.granted;

  return (
    <View style={styles.root}>
      {isNative ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fakeCam]}>
          <LinearGradient
            colors={["#0a1520", "#050810", "#0d1a10"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.gridOverlay} />
        </View>
      )}

      <LinearGradient
        colors={["rgba(19,19,19,0.65)", "transparent", "rgba(19,19,19,0.75)"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <View style={styles.topLeft}>
          <View style={styles.avatarRing}>
            <Feather name="user" size={16} color={COLORS.primaryContainer} />
          </View>
          <View>
            <Text style={styles.topTitle}>THE CHRONOS INTERFACE</Text>
            <Text style={styles.topSub}>Operator Level 24</Text>
          </View>
        </View>
        <View style={styles.xpChip}>
          <Feather name="star" size={12} color={COLORS.tertiaryFixedDim} />
          <Text style={styles.xpText}>1,250 XP</Text>
        </View>
      </View>

      {scanState === "idle" && (
        <View style={styles.instructions}>
          <Text style={styles.instrTitle}>ENVIRONMENTAL SCAN</Text>
          <Text style={styles.instrSub}>Scan a marker to discover Pedro S. Tolentino's legacy.</Text>
        </View>
      )}

      {scanState === "scanning" && (
        <View style={styles.instructions}>
          <Text style={[styles.instrTitle, { color: COLORS.primaryContainer }]}>SCANNING...</Text>
          <Text style={styles.instrSub}>Hold steady — artifact data initializing.</Text>
        </View>
      )}

      {scanState === "detected" && (
        <View style={styles.instructions}>
          <Text style={[styles.instrTitle, { color: COLORS.tertiaryFixedDim }]}>ARTIFACT DETECTED</Text>
          <Text style={styles.instrSub}>{artifact.title}</Text>
        </View>
      )}

      <View style={styles.reticleWrap}>
        <Animated.View style={[styles.reticle, { opacity: cornerBlink }]}>
          <View style={[styles.corner, styles.cornerTL, { borderColor: scanState === "detected" ? COLORS.tertiaryFixedDim : COLORS.primaryContainer }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: scanState === "detected" ? COLORS.tertiaryFixedDim : COLORS.primaryContainer }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: scanState === "detected" ? COLORS.tertiaryFixedDim : COLORS.primaryContainer }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: scanState === "detected" ? COLORS.tertiaryFixedDim : COLORS.primaryContainer }]} />

          {scanState === "scanning" && (
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanYInterp }] },
              ]}
            />
          )}

          {scanState === "idle" && (
            <View style={styles.reticleCenter}>
              <Animated.View style={[styles.reticleDot, { transform: [{ scale: pulseAnim }], opacity: glowAnim }]} />
            </View>
          )}

          {scanState === "detected" && (
            <View style={styles.detectedBurst}>
              <Animated.View style={[styles.detectedRing, { transform: [{ scale: pulseAnim }] }]} />
              <Feather name="check" size={32} color={COLORS.tertiaryFixedDim} />
            </View>
          )}
        </Animated.View>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.sideBtn}>
          <Feather name="sun" size={22} color={COLORS.tertiaryFixedDim} />
          <Text style={styles.sideBtnLabel}>Hint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn}>
          <Feather name="zap" size={22} color={COLORS.primaryContainer} />
          <Text style={styles.sideBtnLabel}>Flash</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn}>
          <Feather name="archive" size={22} color={COLORS.onSurface} />
          <Text style={styles.sideBtnLabel}>Relics</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomHUD}>
        <View style={styles.trackingRow}>
          <Feather name="radio" size={13} color={COLORS.primaryContainer} />
          <Text style={styles.trackingLabel}>TRACKING ACTIVE</Text>
        </View>
        <View style={styles.signalTrack}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryContainer]}
            style={[styles.signalFill, { width: `${signalPct}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.signalLabel}>Signal Strength: {signalPct}%</Text>
      </View>

      <View style={styles.bottomActions}>
        {scanState === "idle" && (
          <TouchableOpacity style={styles.scanBtn} onPress={handleScan} activeOpacity={0.85}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.scanBtnGrad}>
              <Feather name="camera" size={22} color="#00363d" />
              <Text style={styles.scanBtnText}>BEGIN SCAN</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {scanState === "scanning" && (
          <View style={styles.scanningBar}>
            <Animated.View style={[styles.scanningIndicator, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.scanningText}>ANALYZING MARKER DATA...</Text>
          </View>
        )}
        {scanState === "detected" && (
          <View style={styles.detectedActions}>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => setShowDetail(true)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.exploreBtnGrad}>
                <Feather name="eye" size={18} color="#00363d" />
                <Text style={styles.exploreBtnText}>Explore Artifact</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={handleReset} activeOpacity={0.8}>
              <Feather name="rotate-ccw" size={18} color={COLORS.primaryContainer} />
              <Text style={styles.nextBtnText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowDetail(false)}>
        <View style={styles.modalRoot}>
          <LinearGradient colors={[COLORS.surfaceContainer, COLORS.background]} style={StyleSheet.absoluteFill} />
          <View style={styles.modalTopBar}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowDetail(false)}>
              <Feather name="x" size={18} color={COLORS.onSurface} />
            </TouchableOpacity>
            <Text style={styles.modalTopTitle}>ARTIFACT DETAIL</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalArtifactViewer}>
              <View style={styles.modalGlowOrb} />
              <View style={styles.modalIconRing}>
                <Feather name={artifact.icon as any} size={44} color={COLORS.primaryContainer} />
              </View>
              <View style={styles.modalTagRow}>
                <View style={styles.modalEraTag}>
                  <Text style={styles.modalEraText}>{artifact.era}</Text>
                </View>
                <View style={[styles.modalRarityTag, { borderColor: artifact.rarityColor + "40" }]}>
                  <Text style={[styles.modalRarityText, { color: artifact.rarityColor }]}>{artifact.rarity}</Text>
                </View>
              </View>
              <Text style={styles.modalTitle}>{artifact.title}</Text>
              <Text style={styles.modalDesc}>{artifact.description}</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalPlayBtn} activeOpacity={0.85}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.modalPlayGrad}>
                    <Feather name="play" size={16} color="#00363d" />
                    <Text style={styles.modalPlayText}>PLAY NARRATION</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalShareBtn}>
                  <Feather name="share" size={20} color={COLORS.primaryContainer} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalShareBtn}>
                  <Feather name="bookmark" size={20} color={COLORS.primaryContainer} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSectionLabel}>HISTORICAL CONTEXT</Text>
              <View style={styles.modalContextCard}>
                <View style={styles.modalContextBar} />
                <Text style={styles.modalContextText}>{artifact.details}</Text>
              </View>

              <View style={styles.modalXpCard}>
                <Feather name="award" size={24} color={COLORS.tertiaryFixedDim} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalXpTitle}>Chronos Challenge Unlocked</Text>
                  <Text style={styles.modalXpSub}>Answer questions about this artifact to earn {artifact.xp}.</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFoot}>
            <TouchableOpacity
              style={styles.modalNextBtn}
              onPress={() => { setShowDetail(false); handleReset(); }}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.modalNextGrad}>
                <Feather name="camera" size={18} color="#00363d" />
                <Text style={styles.modalNextText}>Scan Next Artifact</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const RETICLE_SIZE = 280;
const CORNER_SIZE = 48;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050810" },
  center: { justifyContent: "center", alignItems: "center" },
  fakeCam: { backgroundColor: "#050810" },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundImage: Platform.OS === "web"
      ? "linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)"
      : undefined,
    backgroundSize: Platform.OS === "web" ? "40px 40px" : undefined,
  } as any,

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "rgba(19,19,19,0.6)",
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
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
  topTitle: { fontSize: 12, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.primaryContainer, letterSpacing: 1.5 },
  topSub: { fontSize: 9, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurfaceVariant, letterSpacing: 1, textTransform: "uppercase" },
  xpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(53,53,52,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "25",
  },
  xpText: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.primaryContainer },

  instructions: {
    position: "absolute",
    top: Platform.OS === "web" ? 100 : 130,
    left: 20,
    right: 20,
    zIndex: 30,
    backgroundColor: "rgba(53,53,52,0.7)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "20",
  },
  instrTitle: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onSurface,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  instrSub: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 18,
  },

  reticleWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    pointerEvents: "none",
  },
  reticle: {
    width: RETICLE_SIZE,
    height: RETICLE_SIZE,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: { position: "absolute", width: CORNER_SIZE, height: CORNER_SIZE, borderWidth: 3.5 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 10, shadowColor: "#00e5ff", shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 10, shadowColor: "#00e5ff", shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 10, shadowColor: "#00e5ff", shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 10, shadowColor: "#00e5ff", shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  reticleCenter: { justifyContent: "center", alignItems: "center" },
  reticleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  detectedBurst: { justifyContent: "center", alignItems: "center", gap: 0 },
  detectedRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.tertiaryFixedDim,
    shadowColor: COLORS.tertiaryFixedDim,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },

  rightActions: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -90,
    zIndex: 30,
    gap: 12,
  },
  sideBtn: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(53,53,52,0.7)",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "25",
    gap: 2,
  },
  sideBtnLabel: { fontSize: 7, fontFamily: "Manrope_700Bold", color: COLORS.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.5 },

  bottomHUD: {
    position: "absolute",
    left: 20,
    bottom: 130,
    zIndex: 30,
    gap: 6,
    pointerEvents: "none",
  },
  trackingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  trackingLabel: { fontSize: 10, fontFamily: "Manrope_700Bold", color: COLORS.primaryContainer, letterSpacing: 2, textTransform: "uppercase" },
  signalTrack: { width: 120, height: 3, backgroundColor: COLORS.surfaceContainerHighest, borderRadius: 2, overflow: "hidden" },
  signalFill: { height: "100%", borderRadius: 2 },
  signalLabel: { fontSize: 9, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, letterSpacing: 1.5, textTransform: "uppercase" },

  bottomActions: {
    position: "absolute",
    bottom: 94,
    left: 20,
    right: 20,
    zIndex: 30,
  },
  scanBtn: { borderRadius: 16, overflow: "hidden" },
  scanBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  scanBtnText: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 2, textTransform: "uppercase" },
  scanningBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(53,53,52,0.8)",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "20",
  },
  scanningIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  scanningText: { fontSize: 12, fontFamily: "SpaceGrotesk_600SemiBold", color: COLORS.primaryContainer, letterSpacing: 2 },
  detectedActions: { flexDirection: "row", gap: 10 },
  exploreBtn: { flex: 1, borderRadius: 16, overflow: "hidden" },
  exploreBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  exploreBtnText: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 1 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primaryContainer + "50",
    backgroundColor: COLORS.primaryContainer + "10",
  },
  nextBtnText: { fontSize: 14, fontFamily: "SpaceGrotesk_600SemiBold", color: COLORS.primaryContainer },

  permBox: { alignItems: "center", gap: 20, paddingHorizontal: 40 },
  permIconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primaryContainer + "40",
  },
  permTitle: { fontSize: 20, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, textAlign: "center" },
  permText: { fontSize: 14, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, textAlign: "center", lineHeight: 22 },
  permBtn: { borderRadius: 14, overflow: "hidden" },
  permBtnGrad: { paddingHorizontal: 36, paddingVertical: 14 },
  permBtnText: { fontSize: 15, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", textTransform: "uppercase", letterSpacing: 1 },

  modalRoot: { flex: 1, backgroundColor: COLORS.background },
  modalTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant + "20",
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerHighest,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTopTitle: { fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurfaceVariant, letterSpacing: 2.5 },
  modalScroll: { flex: 1 },
  modalArtifactViewer: {
    alignItems: "center",
    padding: 32,
    paddingTop: 40,
    gap: 16,
    position: "relative",
  },
  modalGlowOrb: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primaryContainer + "0a",
  },
  modalIconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primaryContainer + "30",
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  modalTagRow: { flexDirection: "row", gap: 8 },
  modalEraTag: {
    backgroundColor: COLORS.primaryContainer + "15",
    borderWidth: 1,
    borderColor: COLORS.primaryContainer + "30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  modalEraText: { fontSize: 9, fontFamily: "Manrope_700Bold", color: COLORS.primaryContainer, letterSpacing: 1.5, textTransform: "uppercase" },
  modalRarityTag: {
    backgroundColor: "transparent",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  modalRarityText: { fontSize: 9, fontFamily: "Manrope_700Bold", letterSpacing: 1.5, textTransform: "uppercase" },
  modalTitle: { fontSize: 26, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, textAlign: "center" },
  modalDesc: { fontSize: 15, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, textAlign: "center", lineHeight: 24 },
  modalActions: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 6 },
  modalPlayBtn: { flex: 1, borderRadius: 999, overflow: "hidden" },
  modalPlayGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  modalPlayText: { fontSize: 12, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 2, textTransform: "uppercase" },
  modalShareBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceContainerHighest,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "30",
  },
  modalBody: { paddingHorizontal: 24, paddingBottom: 40, gap: 20 },
  modalSectionLabel: { fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.primary, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 8 },
  modalContextCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "rgba(53,53,52,0.5)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "15",
  },
  modalContextBar: { width: 3, backgroundColor: COLORS.primaryContainer, borderRadius: 2, alignSelf: "stretch" },
  modalContextText: { flex: 1, fontSize: 14, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 24 },
  modalXpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.tertiaryContainer + "10",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.tertiaryContainer + "25",
  },
  modalXpTitle: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.tertiary },
  modalXpSub: { fontSize: 12, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 18, marginTop: 4 },
  modalFoot: { padding: 20, paddingBottom: Platform.OS === "ios" ? 36 : 20 },
  modalNextBtn: { borderRadius: 16, overflow: "hidden" },
  modalNextGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 17 },
  modalNextText: { fontSize: 15, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 1, textTransform: "uppercase" },
});
