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

const RETICLE_SIZE = 280;
const CORNER_SIZE = 52;

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
  const cornerScale = useRef(new Animated.Value(1)).current;
  const instrAnim = useRef(new Animated.Value(0)).current;
  const detectedScale = useRef(new Animated.Value(0)).current;
  const scanRingAnim = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const artifact = ARTIFACT_DATA[markerIndex % ARTIFACT_DATA.length];

  useEffect(() => {
    Animated.timing(instrAnim, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.9, duration: 1400, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.35, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerBlink, { toValue: 0.55, duration: 700, useNativeDriver: true }),
        Animated.timing(cornerBlink, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerScale, { toValue: 1.04, duration: 1600, useNativeDriver: true }),
        Animated.timing(cornerScale, { toValue: 0.97, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const startScanLine = useCallback(() => {
    scanLineAnim.setValue(0);
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const startScanRing = useCallback(() => {
    scanRingAnim.setValue(0);
    Animated.loop(
      Animated.timing(scanRingAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleScan = async () => {
    if (scanState !== "idle") return;
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setScanState("scanning");
    setSignalPct(0);
    startScanLine();
    startScanRing();

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10 + Math.random() * 14;
      setSignalPct(Math.min(Math.round(progress), 98));
      if (progress >= 100) {
        clearInterval(interval);
        setSignalPct(98);
        setScanState("detected");
        detectedScale.setValue(0);
        Animated.spring(detectedScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }).start();
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 300);
  };

  const handleReset = () => {
    setScanState("idle");
    setSignalPct(0);
    setMarkerIndex((i) => i + 1);
  };

  if (Platform.OS !== "web" && !permission?.granted) {
    return (
      <View style={[styles.root, styles.center]}>
        <LinearGradient colors={["#0a1520", "#050810"]} style={StyleSheet.absoluteFill} />
        <View style={styles.permBox}>
          <View style={styles.permGlow} />
          <View style={styles.permIconRing}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={StyleSheet.absoluteFill} />
            <View style={styles.permIconInner}>
              <Feather name="camera" size={32} color="#00363d" />
            </View>
          </View>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permText}>Enable camera to scan AR markers at heritage sites and discover hidden artifacts.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.permBtnGrad}>
              <Feather name="camera" size={18} color="#00363d" />
              <Text style={styles.permBtnText}>Enable Camera</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const scanYInterp = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, RETICLE_SIZE - 12],
  });

  const isNative = Platform.OS !== "web" && permission?.granted;
  const cornerColor = scanState === "detected" ? COLORS.tertiaryFixedDim : COLORS.primaryContainer;

  return (
    <View style={styles.root}>
      {isNative ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fakeCam]}>
          <LinearGradient colors={["#050e1a", "#030810", "#050c10"]} style={StyleSheet.absoluteFill} />
          <View style={styles.gridOverlay} />
        </View>
      )}

      <LinearGradient
        colors={["rgba(19,19,19,0.72)", "transparent", "rgba(19,19,19,0.82)"]}
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

      <Animated.View style={[styles.instructionsBubble, { opacity: instrAnim }]}>
        <Text style={[
          styles.instrTitle,
          scanState === "detected" && { color: COLORS.tertiaryFixedDim },
          scanState === "scanning" && { color: COLORS.primaryContainer },
        ]}>
          {scanState === "idle" ? "ENVIRONMENTAL SCAN" : scanState === "scanning" ? "SCANNING..." : "ARTIFACT DETECTED"}
        </Text>
        <Text style={styles.instrSub}>
          {scanState === "idle"
            ? "Scan a marker to discover Pedro S. Tolentino's legacy."
            : scanState === "scanning"
            ? "Hold steady — artifact data initializing."
            : artifact.title}
        </Text>
      </Animated.View>

      <View style={styles.reticleWrap} pointerEvents="none">
        <Animated.View style={[styles.reticle, { transform: [{ scale: cornerScale }], opacity: cornerBlink }]}>
          {[
            [styles.cornerTL],
            [styles.cornerTR],
            [styles.cornerBL],
            [styles.cornerBR],
          ].map((cornerStyles, i) => (
            <View key={i} style={[styles.corner, ...cornerStyles, { borderColor: cornerColor }]} />
          ))}

          {scanState === "scanning" && (
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanYInterp }] }]} />
          )}

          {scanState === "idle" && (
            <View style={styles.reticleCenter}>
              <Animated.View style={[styles.reticleRing, { transform: [{ scale: pulseAnim }] }]} />
              <Animated.View style={[styles.reticleDot, { opacity: glowAnim }]} />
            </View>
          )}

          {scanState === "detected" && (
            <Animated.View style={[styles.detectedBurst, { transform: [{ scale: detectedScale }] }]}>
              <View style={styles.detectedRingOuter} />
              <View style={styles.detectedRingInner} />
              <Feather name="check" size={34} color={COLORS.tertiaryFixedDim} />
            </Animated.View>
          )}
        </Animated.View>
      </View>

      <View style={styles.rightActions}>
        {[
          { icon: "sun" as const, label: "Hint", color: COLORS.tertiaryFixedDim },
          { icon: "zap" as const, label: "Flash", color: COLORS.primaryContainer },
          { icon: "archive" as const, label: "Relics", color: COLORS.onSurface },
        ].map((btn) => (
          <TouchableOpacity key={btn.label} style={styles.sideBtn} activeOpacity={0.8}>
            <Feather name={btn.icon} size={20} color={btn.color} />
            <Text style={styles.sideBtnLabel}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomHUD} pointerEvents="none">
        <View style={styles.trackingRow}>
          <Animated.View style={[styles.trackingDot, { opacity: glowAnim }]} />
          <Feather name="radio" size={12} color={COLORS.primaryContainer} />
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
            <Animated.View style={[styles.scanningDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.scanningText}>ANALYZING MARKER DATA...</Text>
          </View>
        )}
        {scanState === "detected" && (
          <View style={styles.detectedActions}>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => setShowDetail(true)} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.exploreBtnGrad}>
                <Feather name="eye" size={18} color="#00363d" />
                <Text style={styles.exploreBtnText}>Explore Artifact</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={handleReset} activeOpacity={0.8}>
              <Feather name="rotate-ccw" size={18} color={COLORS.primaryContainer} />
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
            <View style={styles.modalArtViewer}>
              <View style={styles.modalGlow} />
              <View style={styles.modalIconRing}>
                <LinearGradient
                  colors={["rgba(0,229,255,0.15)", "rgba(0,229,255,0.05)"]}
                  style={StyleSheet.absoluteFill}
                />
                <Feather name={artifact.icon as any} size={48} color={COLORS.primaryContainer} />
              </View>

              <View style={styles.modalTagRow}>
                <View style={styles.modalEraTag}>
                  <Text style={styles.modalEraText}>{artifact.era}</Text>
                </View>
                <View style={[styles.modalRarityTag, { borderColor: artifact.rarityColor + "50" }]}>
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
                <TouchableOpacity style={styles.modalIconBtn}>
                  <Feather name="share-2" size={20} color={COLORS.primaryContainer} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalIconBtn}>
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
                <LinearGradient
                  colors={[COLORS.tertiaryContainer + "12", COLORS.tertiaryContainer + "06"]}
                  style={StyleSheet.absoluteFill}
                />
                <Feather name="award" size={24} color={COLORS.tertiaryFixedDim} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalXpTitle}>Chronos Challenge Unlocked</Text>
                  <Text style={styles.modalXpSub}>Answer questions about this artifact to earn {artifact.xp}.</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFoot}>
            <TouchableOpacity style={styles.modalNextBtn} onPress={() => { setShowDetail(false); handleReset(); }} activeOpacity={0.85}>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050810" },
  center: { justifyContent: "center", alignItems: "center" },
  fakeCam: {},
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundImage: Platform.OS === "web"
      ? "linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)"
      : undefined,
    backgroundSize: Platform.OS === "web" ? "44px 44px" : undefined,
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
    paddingBottom: 14,
    backgroundColor: "rgba(19,19,19,0.65)",
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  topTitle: { fontSize: 12, fontFamily: "SpaceGrotesk_700Bold", color: "#00e5ff", letterSpacing: 1.5 },
  topSub: { fontSize: 9, fontFamily: "Manrope_600SemiBold", color: COLORS.onSurfaceVariant, letterSpacing: 1, textTransform: "uppercase" },
  xpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(53,53,52,0.65)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "25",
  },
  xpText: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", color: "#00e5ff" },

  instructionsBubble: {
    position: "absolute",
    top: Platform.OS === "web" ? 90 : 120,
    left: 20,
    right: 20,
    zIndex: 30,
    backgroundColor: "rgba(32,31,31,0.82)",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(59,73,76,0.25)",
  },
  instrTitle: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onSurface,
    letterSpacing: 2.5,
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
  },
  reticle: {
    width: RETICLE_SIZE,
    height: RETICLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  corner: { position: "absolute", width: CORNER_SIZE, height: CORNER_SIZE, borderWidth: 3.5 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12, shadowColor: "#00e5ff", shadowOpacity: 0.9, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12, shadowColor: "#00e5ff", shadowOpacity: 0.9, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12, shadowColor: "#00e5ff", shadowOpacity: 0.9, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12, shadowColor: "#00e5ff", shadowOpacity: 0.9, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  scanLine: {
    position: "absolute",
    top: 8,
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  reticleCenter: { justifyContent: "center", alignItems: "center" },
  reticleRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryContainer + "40",
  },
  reticleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  detectedBurst: { justifyContent: "center", alignItems: "center" },
  detectedRingOuter: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: COLORS.tertiaryFixedDim + "50",
  },
  detectedRingInner: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.tertiaryFixedDim,
    shadowColor: COLORS.tertiaryFixedDim,
    shadowOpacity: 0.7,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },

  rightActions: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -100,
    zIndex: 30,
    gap: 12,
  },
  sideBtn: {
    width: 58,
    height: 58,
    backgroundColor: "rgba(32,31,31,0.78)",
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(59,73,76,0.3)",
    gap: 3,
  },
  sideBtnLabel: { fontSize: 7, fontFamily: "Manrope_700Bold", color: COLORS.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.4 },

  bottomHUD: {
    position: "absolute",
    left: 20,
    bottom: 150,
    zIndex: 30,
    gap: 6,
  },
  trackingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  trackingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  trackingLabel: { fontSize: 10, fontFamily: "Manrope_700Bold", color: COLORS.primaryContainer, letterSpacing: 2, textTransform: "uppercase" },
  signalTrack: { width: 130, height: 3, backgroundColor: COLORS.surfaceContainerHighest, borderRadius: 2, overflow: "hidden" },
  signalFill: { height: "100%", borderRadius: 2, shadowColor: "#00e5ff", shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  signalLabel: { fontSize: 9, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, letterSpacing: 1.5, textTransform: "uppercase" },

  bottomActions: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 30,
  },
  scanBtn: { borderRadius: 18, overflow: "hidden" },
  scanBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  scanBtnText: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 2.5, textTransform: "uppercase" },
  scanningBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(32,31,31,0.88)",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.2)",
  },
  scanningDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  scanningText: { fontSize: 12, fontFamily: "SpaceGrotesk_600SemiBold", color: COLORS.primaryContainer, letterSpacing: 2 },
  detectedActions: { flexDirection: "row", gap: 10 },
  exploreBtn: { flex: 1, borderRadius: 18, overflow: "hidden" },
  exploreBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 18 },
  exploreBtnText: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 1 },
  nextBtn: {
    width: 58,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer + "50",
    backgroundColor: "rgba(0,229,255,0.08)",
  },

  permBox: {
    width: "85%",
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "20",
    overflow: "hidden",
  },
  permGlow: {
    position: "absolute",
    top: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primaryContainer + "08",
  },
  permIconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    padding: 2,
  },
  permIconInner: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  permTitle: { fontSize: 22, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, textAlign: "center" },
  permText: { fontSize: 14, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, textAlign: "center", lineHeight: 22 },
  permBtn: { width: "100%", borderRadius: 16, overflow: "hidden", marginTop: 4 },
  permBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 17 },
  permBtnText: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 1.5 },

  modalRoot: { flex: 1, backgroundColor: COLORS.background },
  modalTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant + "15",
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
  modalArtViewer: {
    padding: 28,
    alignItems: "center",
    gap: 16,
    position: "relative",
  },
  modalGlow: {
    position: "absolute",
    top: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primaryContainer + "06",
  },
  modalIconRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryContainer + "25",
    overflow: "hidden",
  },
  modalTagRow: { flexDirection: "row", gap: 8 },
  modalEraTag: {
    backgroundColor: COLORS.primaryContainer + "12",
    borderWidth: 1,
    borderColor: COLORS.primaryContainer + "25",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  modalEraText: { fontSize: 9, fontFamily: "Manrope_700Bold", color: COLORS.primaryContainer, letterSpacing: 1, textTransform: "uppercase" },
  modalRarityTag: {
    backgroundColor: "transparent",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  modalRarityText: { fontSize: 9, fontFamily: "Manrope_700Bold", letterSpacing: 1, textTransform: "uppercase" },
  modalTitle: { fontSize: 24, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, textAlign: "center", lineHeight: 32 },
  modalDesc: { fontSize: 14, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, textAlign: "center", lineHeight: 22 },
  modalActions: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%" },
  modalPlayBtn: { flex: 1, borderRadius: 16, overflow: "hidden" },
  modalPlayGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15 },
  modalPlayText: { fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 1.5 },
  modalIconBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "25",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  modalSectionLabel: { fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.primaryContainer, letterSpacing: 2.5, marginBottom: 4 },
  modalContextCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "15",
  },
  modalContextBar: { width: 3, backgroundColor: COLORS.primaryContainer, borderRadius: 2 },
  modalContextText: { flex: 1, fontSize: 14, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 22 },
  modalXpCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.tertiaryContainer + "25",
    overflow: "hidden",
  },
  modalXpTitle: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.tertiary, marginBottom: 4 },
  modalXpSub: { fontSize: 12, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, lineHeight: 18 },
  modalFoot: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: COLORS.outlineVariant + "15" },
  modalNextBtn: { borderRadius: 16, overflow: "hidden" },
  modalNextGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 17 },
  modalNextText: { fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: "#00363d", letterSpacing: 1 },
});
