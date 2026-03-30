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

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

type ScanState = "idle" | "scanning" | "detected";

const ARTIFACT_THEMES = [
  { primary: "#C8922A", secondary: "#8B5E1A", glow: "#C8922A40", label: "THEATRICAL" },
  { primary: "#8B2E2E", secondary: "#5C1A1A", glow: "#8B2E2E40", label: "HISTORICAL" },
  { primary: "#4A7A8C", secondary: "#2E5A6A", glow: "#4A7A8C40", label: "CARTOGRAPHIC" },
];

function Particle({ delay, radius }: { delay: number; radius: number }) {
  const angle = useRef(Math.random() * Math.PI * 2).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(Math.cos(angle) * radius)).current;
  const y = useRef(new Animated.Value(Math.sin(angle) * radius)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const size = 2 + Math.random() * 3;
    const duration = 2000 + Math.random() * 2000;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.9, duration: 400, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.1, duration: duration - 400, useNativeDriver: true }),
          ]),
          Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const px = Math.cos(angle) * radius;
  const py = Math.sin(angle) * radius;
  const dotSize = 2 + Math.random() * 3;

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: COLORS.accent,
        opacity,
        transform: [{ translateX: px }, { translateY: py }, { scale }],
      }}
    />
  );
}

function HolographicModel({
  marker,
  theme,
  visible,
}: {
  marker: typeof AR_MARKERS[0];
  theme: typeof ARTIFACT_THEMES[0];
  visible: boolean;
}) {
  const spinY = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  const ring1Rot = useRef(new Animated.Value(0)).current;
  const ring2Rot = useRef(new Animated.Value(0)).current;
  const ring3Scale = useRef(new Animated.Value(0.8)).current;
  const modelScale = useRef(new Animated.Value(0)).current;
  const dataOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      modelScale.setValue(0);
      dataOpacity.setValue(0);
      return;
    }

    Animated.sequence([
      Animated.spring(modelScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 7,
      }),
      Animated.timing(dataOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const spin = Animated.loop(
      Animated.timing(spinY, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -12,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale, { toValue: 1.15, duration: 1800, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.7, duration: 1800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.35, duration: 1800, useNativeDriver: true }),
        ]),
      ])
    );

    const r1 = Animated.loop(
      Animated.timing(ring1Rot, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
    );
    const r2 = Animated.loop(
      Animated.timing(ring2Rot, { toValue: -1, duration: 6000, easing: Easing.linear, useNativeDriver: true })
    );
    const r3 = Animated.loop(
      Animated.sequence([
        Animated.timing(ring3Scale, { toValue: 1.15, duration: 2000, useNativeDriver: true }),
        Animated.timing(ring3Scale, { toValue: 0.85, duration: 2000, useNativeDriver: true }),
      ])
    );

    spin.start();
    float.start();
    glow.start();
    r1.start();
    r2.start();
    r3.start();

    return () => {
      spin.stop();
      float.stop();
      glow.stop();
      r1.stop();
      r2.stop();
      r3.stop();
    };
  }, [visible]);

  const spinInterp = spinY.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const ring1Interp = ring1Rot.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const ring2Interp = ring2Rot.interpolate({
    inputRange: [-1, 0],
    outputRange: ["-360deg", "0deg"],
  });

  const particles = Array.from({ length: 18 });

  return (
    <Animated.View style={[styles.modelContainer, { transform: [{ scale: modelScale }] }]}>
      <Animated.View style={[styles.modelInner, { transform: [{ translateY: floatY }] }]}>
        <Animated.View
          style={[
            styles.glowOrb,
            {
              backgroundColor: theme.glow,
              transform: [{ scale: glowScale }],
              opacity: glowOpacity,
            },
          ]}
        />

        {particles.map((_, i) => (
          <Particle key={i} delay={i * 160} radius={78 + (i % 3) * 20} />
        ))}

        <Animated.View
          style={[
            styles.orbitalRing,
            {
              borderColor: theme.primary + "60",
              transform: [{ rotateZ: ring1Interp }, { rotateX: "72deg" }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orbitalRing2,
            {
              borderColor: theme.primary + "40",
              transform: [{ rotateZ: ring2Interp }, { rotateX: "40deg" }, { rotateY: "30deg" }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.outerRingPulse,
            {
              borderColor: theme.primary + "25",
              transform: [{ scale: ring3Scale }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.modelFaceWrap,
            { transform: [{ perspective: 900 }, { rotateY: spinInterp }] },
          ]}
        >
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            style={styles.modelFace}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.modelFaceInner}>
              <View style={styles.modelFaceIconRing}>
                <Feather name={marker.icon as any} size={36} color="#fff" />
              </View>
              <Text style={styles.modelFaceTitle} numberOfLines={1}>
                {marker.title.toUpperCase()}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.dataPoints, { opacity: dataOpacity }]}>
          <View style={[styles.dataLine, styles.dataLineLeft]}>
            <View style={[styles.dataDot, { backgroundColor: theme.primary }]} />
            <View style={[styles.dataConnector, { backgroundColor: theme.primary + "80" }]} />
            <View style={[styles.dataChip, { borderColor: theme.primary + "60" }]}>
              <Text style={[styles.dataChipText, { color: theme.primary }]}>AR</Text>
            </View>
          </View>
          <View style={[styles.dataLine, styles.dataLineRight]}>
            <View style={[styles.dataChip, { borderColor: theme.primary + "60" }]}>
              <Text style={[styles.dataChipText, { color: theme.primary }]}>{theme.label}</Text>
            </View>
            <View style={[styles.dataConnector, { backgroundColor: theme.primary + "80" }]} />
            <View style={[styles.dataDot, { backgroundColor: theme.primary }]} />
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

export default function ARScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [markerIndex, setMarkerIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const infoSlide = useRef(new Animated.Value(100)).current;
  const infoOpacity = useRef(new Animated.Value(0)).current;
  const scanRingScale = useRef(new Animated.Value(1)).current;
  const scanRingOpacity = useRef(new Animated.Value(0)).current;
  const scanLoop = useRef<Animated.CompositeAnimation | null>(null);
  const ringLoop = useRef<Animated.CompositeAnimation | null>(null);

  const currentMarker = AR_MARKERS[markerIndex % AR_MARKERS.length];
  const currentTheme = ARTIFACT_THEMES[markerIndex % ARTIFACT_THEMES.length];

  useEffect(() => {
    if (scanState === "scanning") {
      scanRingOpacity.setValue(1);
      scanRingScale.setValue(1);
      ringLoop.current = Animated.loop(
        Animated.parallel([
          Animated.timing(scanRingScale, { toValue: 2.4, duration: 1400, useNativeDriver: true }),
          Animated.timing(scanRingOpacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ])
      );
      ringLoop.current.start();

      scanLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(scanLineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
      scanLoop.current.start();

      const t = setTimeout(async () => {
        scanLoop.current?.stop();
        ringLoop.current?.stop();
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setScanState("detected");
        Animated.parallel([
          Animated.spring(infoSlide, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
          Animated.timing(infoOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]).start();
      }, 3200);

      return () => {
        clearTimeout(t);
        scanLoop.current?.stop();
        ringLoop.current?.stop();
      };
    }
  }, [scanState]);

  const handleScan = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scanLineAnim.setValue(0);
    infoSlide.setValue(100);
    infoOpacity.setValue(0);
    setScanState("scanning");
  };

  const handleReset = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScanState("idle");
    setMarkerIndex((i) => (i + 1) % AR_MARKERS.length);
    infoSlide.setValue(100);
    infoOpacity.setValue(0);
  };

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-130, 130],
  });

  if (Platform.OS !== "web") {
    if (!permission) return <View style={[styles.bg, styles.center]} />;
    if (!permission.granted) {
      return (
        <View style={[styles.bg, styles.center]}>
          <View style={styles.permBox}>
            <View style={styles.permIconRing}>
              <Feather name="camera-off" size={36} color={COLORS.textMuted} />
            </View>
            <Text style={styles.permTitle}>Camera Access Required</Text>
            <Text style={styles.permText}>
              MemoirMuse needs your camera to scan AR markers and reveal digital artifacts.
            </Text>
            <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
              <Text style={styles.permBtnText}>Grant Access</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.bg}>
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
        <LinearGradient
          colors={["rgba(0,0,0,0.65)", "transparent", "transparent", "rgba(0,0,0,0.8)"]}
          style={[StyleSheet.absoluteFill, { paddingTop: topPad }]}
        >
          <View style={styles.nativeTopBar}>
            <Text style={styles.nativeTitle}>AR Scanner</Text>
            {scanState === "detected" && (
              <TouchableOpacity style={styles.nativeResetChip} onPress={handleReset}>
                <Feather name="refresh-cw" size={14} color="#fff" />
                <Text style={styles.nativeResetText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>

          {scanState !== "detected" && (
            <View style={styles.nativeScanFrame}>
              <View style={[styles.nc, styles.ncTL, { borderColor: currentTheme.primary }]} />
              <View style={[styles.nc, styles.ncTR, { borderColor: currentTheme.primary }]} />
              <View style={[styles.nc, styles.ncBL, { borderColor: currentTheme.primary }]} />
              <View style={[styles.nc, styles.ncBR, { borderColor: currentTheme.primary }]} />
              {scanState === "scanning" && (
                <Animated.View
                  style={[
                    styles.nativeScanLine,
                    { backgroundColor: currentTheme.primary, transform: [{ translateY: scanLineY }] },
                  ]}
                />
              )}
              <Animated.View
                style={[
                  styles.nativePingRing,
                  {
                    borderColor: currentTheme.primary,
                    transform: [{ scale: scanRingScale }],
                    opacity: scanRingOpacity,
                  },
                ]}
              />
            </View>
          )}

          {scanState === "detected" && (
            <View style={styles.nativeModelArea}>
              <HolographicModel marker={currentMarker} theme={currentTheme} visible />
            </View>
          )}

          <View style={styles.nativeBottomArea}>
            {scanState === "detected" ? (
              <Animated.View
                style={[
                  styles.nativeInfoCard,
                  { opacity: infoOpacity, transform: [{ translateY: infoSlide }] },
                ]}
              >
                <Text style={styles.nativeInfoBadge}>{currentTheme.label} ARTIFACT</Text>
                <Text style={styles.nativeInfoTitle}>{currentMarker.title}</Text>
                <Text style={styles.nativeInfoDesc} numberOfLines={2}>{currentMarker.description}</Text>
                <TouchableOpacity
                  style={[styles.nativeDetailBtn, { backgroundColor: currentTheme.primary }]}
                  onPress={() => setShowDetail(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nativeDetailBtnText}>Explore Artifact</Text>
                  <Feather name="arrow-right" size={15} color="#fff" />
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={styles.nativeIdleBottom}>
                <Text style={styles.nativeScanHint}>
                  {scanState === "scanning" ? "Scanning for artifacts…" : "Point at a marker and scan"}
                </Text>
                <TouchableOpacity
                  style={[styles.nativeScanBtn, scanState === "scanning" && { backgroundColor: currentTheme.primary }]}
                  onPress={scanState === "idle" ? handleScan : undefined}
                  activeOpacity={0.9}
                >
                  <Feather name={scanState === "scanning" ? "zap" : "camera"} size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>
        <DetailModal visible={showDetail} marker={currentMarker} theme={currentTheme} onClose={() => setShowDetail(false)} onNext={() => { setShowDetail(false); handleReset(); }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={[styles.webHeader, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.webHeaderTitle}>AR Scanner</Text>
        <Text style={styles.webHeaderSub}>Holographic Artifact Discovery</Text>
      </LinearGradient>

      <ScrollView
        style={styles.webScroll}
        contentContainerStyle={styles.webContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.webViewport}>
          <View style={styles.webViewportInner}>
            {[...Array(7)].map((_, i) => (
              <View key={`h${i}`} style={[styles.gridLine, { top: `${(i + 1) * 12.5}%` as any, left: 0, right: 0, height: 1 }]} />
            ))}
            {[...Array(5)].map((_, i) => (
              <View key={`v${i}`} style={[styles.gridLine, { left: `${(i + 1) * 16.66}%` as any, top: 0, bottom: 0, width: 1 }]} />
            ))}

            <View style={[styles.wc, styles.wcTL, { borderColor: currentTheme.primary }]} />
            <View style={[styles.wc, styles.wcTR, { borderColor: currentTheme.primary }]} />
            <View style={[styles.wc, styles.wcBL, { borderColor: currentTheme.primary }]} />
            <View style={[styles.wc, styles.wcBR, { borderColor: currentTheme.primary }]} />

            {scanState === "scanning" && (
              <Animated.View
                style={[
                  styles.webScanLine,
                  { backgroundColor: currentTheme.primary, transform: [{ translateY: scanLineY }] },
                ]}
              />
            )}

            {scanState === "idle" && (
              <View style={styles.webIdleCenter}>
                <View style={[styles.webIdleRing, { borderColor: currentTheme.primary + "40" }]}>
                  <View style={[styles.webIdleRingInner, { borderColor: currentTheme.primary + "20" }]}>
                    <Feather name="camera" size={40} color={currentTheme.primary + "60"} />
                  </View>
                </View>
                <Text style={styles.webIdleLabel}>Tap to begin scanning</Text>
              </View>
            )}

            {scanState === "scanning" && (
              <View style={styles.webScanCenter}>
                <Animated.View
                  style={[
                    styles.webPingRing,
                    {
                      borderColor: currentTheme.primary,
                      transform: [{ scale: scanRingScale }],
                      opacity: scanRingOpacity,
                    },
                  ]}
                />
                <Text style={[styles.webScanLabel, { color: currentTheme.primary }]}>SCANNING</Text>
                <Text style={styles.webScanSub}>Detecting artifact…</Text>
              </View>
            )}

            {scanState === "detected" && (
              <View style={styles.webModelCenter}>
                <HolographicModel marker={currentMarker} theme={currentTheme} visible />
              </View>
            )}

            <View style={styles.webDotRow}>
              {AR_MARKERS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.webDot,
                    i === markerIndex % AR_MARKERS.length
                      ? { backgroundColor: currentTheme.primary, width: 20 }
                      : { backgroundColor: currentTheme.primary + "40" },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={[styles.webCtrBar, { borderTopColor: currentTheme.primary + "30" }]}>
            {scanState === "detected" ? (
              <View style={styles.webCtrDetected}>
                <TouchableOpacity
                  style={[styles.webExploreBtn, { backgroundColor: currentTheme.primary }]}
                  onPress={() => setShowDetail(true)}
                  activeOpacity={0.9}
                >
                  <Feather name="book-open" size={18} color="#fff" />
                  <Text style={styles.webExploreBtnText}>Explore Artifact</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.webNextBtn} onPress={handleReset} activeOpacity={0.85}>
                  <Feather name="refresh-cw" size={16} color={currentTheme.primary} />
                  <Text style={[styles.webNextBtnText, { color: currentTheme.primary }]}>Scan Next</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.webScanBtn,
                  { backgroundColor: scanState === "scanning" ? currentTheme.primary : COLORS.primary },
                ]}
                onPress={scanState === "idle" ? handleScan : undefined}
                activeOpacity={0.9}
              >
                <Feather name={scanState === "scanning" ? "zap" : "camera"} size={20} color="#fff" />
                <Text style={styles.webScanBtnText}>
                  {scanState === "scanning" ? "Scanning…" : "Scan Artifact"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {scanState === "detected" && (
          <Animated.View
            style={[styles.webInfoCard, { opacity: infoOpacity, transform: [{ translateY: infoSlide }] }]}
          >
            <View style={styles.webInfoTop}>
              <View style={[styles.webInfoIconBox, { backgroundColor: currentTheme.primary + "18" }]}>
                <Feather name={currentMarker.icon as any} size={24} color={currentTheme.primary} />
              </View>
              <View style={styles.webInfoMeta}>
                <Text style={[styles.webInfoBadge, { color: currentTheme.primary }]}>
                  {currentTheme.label} ARTIFACT
                </Text>
                <Text style={styles.webInfoTitle}>{currentMarker.title}</Text>
              </View>
            </View>
            <Text style={styles.webInfoDesc}>{currentMarker.description}</Text>
            <View style={styles.webInfoDivider} />
            <Text style={styles.webInfoBody}>{currentMarker.details}</Text>
          </Animated.View>
        )}

        <View style={styles.webTip}>
          <Feather name="smartphone" size={15} color={COLORS.textMuted} />
          <Text style={styles.webTipText}>
            On mobile, point your camera at AR markers at heritage museums and sites to see live 3D artifact projections.
          </Text>
        </View>

        <View style={styles.webArtifactList}>
          <Text style={styles.webArtifactListTitle}>ARTIFACT LIBRARY</Text>
          {AR_MARKERS.map((m, i) => {
            const theme = ARTIFACT_THEMES[i % ARTIFACT_THEMES.length];
            const scanned = i < (markerIndex % AR_MARKERS.length) + (scanState === "detected" ? 1 : 0);
            return (
              <View key={m.id} style={styles.webArtifactRow}>
                <View style={[styles.webArtifactIcon, { backgroundColor: theme.primary + "18" }]}>
                  <Feather name={m.icon as any} size={18} color={theme.primary} />
                </View>
                <View style={styles.webArtifactMeta}>
                  <Text style={styles.webArtifactName}>{m.title}</Text>
                  <Text style={[styles.webArtifactTag, { color: theme.primary }]}>{theme.label}</Text>
                </View>
                {scanned ? (
                  <View style={styles.webScannedBadge}>
                    <Feather name="check" size={11} color={COLORS.success} />
                    <Text style={styles.webScannedText}>Scanned</Text>
                  </View>
                ) : (
                  <Text style={styles.webUnscannedText}>Pending</Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <DetailModal
        visible={showDetail}
        marker={currentMarker}
        theme={currentTheme}
        onClose={() => setShowDetail(false)}
        onNext={() => { setShowDetail(false); handleReset(); }}
      />
    </View>
  );
}

function DetailModal({
  visible,
  marker,
  theme,
  onClose,
  onNext,
}: {
  visible: boolean;
  marker: typeof AR_MARKERS[0];
  theme: typeof ARTIFACT_THEMES[0];
  onClose: () => void;
  onNext: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalWrap}>
        <LinearGradient colors={[theme.secondary, theme.primary]} style={styles.modalHead}>
          <TouchableOpacity style={styles.modalX} onPress={onClose}>
            <Feather name="x" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.modalIconRing}>
            <Feather name={marker.icon as any} size={34} color="#fff" />
          </View>
          <View style={styles.modalBadge}>
            <Feather name="zap" size={10} color="#fff" />
            <Text style={styles.modalBadgeText}>AR HOLOGRAPHIC ARTIFACT</Text>
          </View>
          <Text style={styles.modalTitle}>{marker.title}</Text>
        </LinearGradient>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionLabel}>ABOUT THIS ARTIFACT</Text>
            <Text style={styles.modalSectionText}>{marker.description}</Text>
          </View>
          <View style={styles.modalSep} />
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionLabel}>HISTORICAL CONTEXT</Text>
            <Text style={styles.modalSectionText}>{marker.details}</Text>
          </View>
          <View style={styles.modalNote}>
            <Feather name="archive" size={14} color={theme.primary} />
            <Text style={styles.modalNoteText}>
              This artifact is part of the Pedro S. Tolentino Digital Heritage Collection — preserved and brought to life through augmented reality.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.modalFoot}>
          <TouchableOpacity
            style={[styles.modalNextBtn, { backgroundColor: theme.primary }]}
            onPress={onNext}
            activeOpacity={0.9}
          >
            <Feather name="camera" size={18} color="#fff" />
            <Text style={styles.modalNextText}>Scan Next Artifact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const S = 160;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  bg: { flex: 1, backgroundColor: "#050810" },
  center: { justifyContent: "center", alignItems: "center" },

  permBox: { alignItems: "center", gap: 20, paddingHorizontal: 40 },
  permIconRing: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.backgroundDark, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.borderLight },
  permTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: COLORS.white, textAlign: "center" },
  permText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 22 },
  permBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 14 },
  permBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },

  nativeTopBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  nativeTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  nativeResetChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  nativeResetText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  nativeScanFrame: { width: 260, height: 260, alignSelf: "center", justifyContent: "center", alignItems: "center" },
  nc: { position: "absolute", width: 40, height: 40, borderWidth: 3 },
  ncTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  ncTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  ncBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  ncBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  nativeScanLine: { position: "absolute", left: 12, right: 12, height: 2, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  nativePingRing: { position: "absolute", width: 100, height: 100, borderRadius: 50, borderWidth: 2 },
  nativeModelArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  nativeBottomArea: { paddingHorizontal: 20, paddingBottom: 50 },
  nativeInfoCard: { backgroundColor: "rgba(10,10,18,0.92)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", gap: 10 },
  nativeInfoBadge: { fontSize: 10, fontFamily: "Inter_700Bold", color: COLORS.accent, letterSpacing: 2 },
  nativeInfoTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  nativeInfoDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", lineHeight: 20 },
  nativeDetailBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14, marginTop: 4 },
  nativeDetailBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  nativeIdleBottom: { alignItems: "center", gap: 16 },
  nativeScanHint: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center" },
  nativeScanBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.25)" },

  modelContainer: { width: S * 2, height: S * 2, justifyContent: "center", alignItems: "center" },
  modelInner: { width: S * 2, height: S * 2, justifyContent: "center", alignItems: "center" },
  glowOrb: { position: "absolute", width: S * 1.5, height: S * 1.5, borderRadius: S * 0.75 },
  orbitalRing: { position: "absolute", width: S * 1.8, height: S * 1.8, borderRadius: S * 0.9, borderWidth: 1.5 },
  orbitalRing2: { position: "absolute", width: S * 2.1, height: S * 2.1, borderRadius: S * 1.05, borderWidth: 1 },
  outerRingPulse: { position: "absolute", width: S * 2.6, height: S * 2.6, borderRadius: S * 1.3, borderWidth: 1 },
  modelFaceWrap: { width: S, height: S, borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowRadius: 30, shadowOpacity: 0.6, shadowOffset: { width: 0, height: 10 } },
  modelFace: { flex: 1, justifyContent: "center", alignItems: "center" },
  modelFaceInner: { alignItems: "center", gap: 12 },
  modelFaceIconRing: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" },
  modelFaceTitle: { fontSize: 10, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.85)", letterSpacing: 1.5, paddingHorizontal: 8 },
  dataPoints: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "center" },
  dataLine: { position: "absolute", flexDirection: "row", alignItems: "center", gap: 4 },
  dataLineLeft: { left: 0, top: "30%" as any },
  dataLineRight: { right: 0, top: "62%" as any },
  dataDot: { width: 6, height: 6, borderRadius: 3 },
  dataConnector: { width: 24, height: 1 },
  dataChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  dataChipText: { fontSize: 8, fontFamily: "Inter_700Bold", letterSpacing: 1 },

  webHeader: { paddingHorizontal: 28, paddingBottom: 24 },
  webHeaderTitle: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff" },
  webHeaderSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", marginTop: 6, fontStyle: "italic" },
  webScroll: { flex: 1 },
  webContent: { paddingBottom: 140 },

  webViewport: { margin: 20, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#222", backgroundColor: "#080C14" },
  webViewportInner: { height: 340, position: "relative", justifyContent: "center", alignItems: "center" },
  gridLine: { position: "absolute", backgroundColor: "rgba(255,255,255,0.03)" },
  wc: { position: "absolute", width: 30, height: 30 },
  wcTL: { top: 16, left: 16, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 4 },
  wcTR: { top: 16, right: 16, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 4 },
  wcBL: { bottom: 16, left: 16, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 4 },
  wcBR: { bottom: 16, right: 16, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 4 },
  webScanLine: { position: "absolute", left: 20, right: 20, height: 2, shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  webPingRing: { position: "absolute", width: 90, height: 90, borderRadius: 45, borderWidth: 2 },

  webIdleCenter: { alignItems: "center", gap: 14 },
  webIdleRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  webIdleRingInner: { width: 82, height: 82, borderRadius: 41, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  webIdleLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)" },

  webScanCenter: { alignItems: "center", gap: 10 },
  webScanLabel: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 3 },
  webScanSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },

  webModelCenter: { flex: 1, justifyContent: "center", alignItems: "center" },

  webDotRow: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
  webDot: { height: 6, borderRadius: 3, width: 6 },

  webCtrBar: { padding: 16, borderTopWidth: 1, backgroundColor: "#0D1220" },
  webCtrDetected: { flexDirection: "row", gap: 10 },
  webExploreBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, borderRadius: 14 },
  webExploreBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  webNextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary + "50", backgroundColor: COLORS.primary + "12" },
  webNextBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  webScanBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, borderRadius: 14 },
  webScanBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },

  webInfoCard: { marginHorizontal: 20, marginTop: 8, backgroundColor: COLORS.surface, borderRadius: 20, padding: 22, borderWidth: 1, borderColor: COLORS.borderLight, gap: 14, shadowColor: COLORS.cardShadow, shadowRadius: 16, shadowOpacity: 1, shadowOffset: { width: 0, height: 4 } },
  webInfoTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  webInfoIconBox: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center" },
  webInfoMeta: { flex: 1, gap: 3 },
  webInfoBadge: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  webInfoTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.text },
  webInfoDesc: { fontSize: 14, fontFamily: "Inter_500Medium", color: COLORS.textSecondary, lineHeight: 22 },
  webInfoDivider: { height: 1, backgroundColor: COLORS.borderLight },
  webInfoBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, lineHeight: 24 },

  webTip: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginHorizontal: 20, marginTop: 20, padding: 16, backgroundColor: COLORS.backgroundDark, borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderLight },
  webTipText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textMuted, lineHeight: 19 },

  webArtifactList: { marginHorizontal: 20, marginTop: 20, gap: 10 },
  webArtifactListTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: COLORS.primary, letterSpacing: 2, marginBottom: 4 },
  webArtifactRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.borderLight },
  webArtifactIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  webArtifactMeta: { flex: 1, gap: 2 },
  webArtifactName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.text },
  webArtifactTag: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  webScannedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.success + "12", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  webScannedText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: COLORS.success },
  webUnscannedText: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },

  modalWrap: { flex: 1, backgroundColor: COLORS.background },
  modalHead: { padding: 28, paddingTop: 52, alignItems: "center", gap: 12 },
  modalX: { alignSelf: "flex-end", width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  modalIconRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  modalBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  modalBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 2 },
  modalTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  modalBody: { flex: 1, padding: 28 },
  modalSection: { gap: 10 },
  modalSectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: COLORS.primary, letterSpacing: 2 },
  modalSectionText: { fontSize: 15, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, lineHeight: 26 },
  modalSep: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 24 },
  modalNote: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 24, padding: 18, backgroundColor: COLORS.surfaceWarm, borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderLight },
  modalNoteText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, lineHeight: 21 },
  modalFoot: { padding: 24, paddingBottom: 48 },
  modalNextBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, paddingVertical: 17, borderRadius: 17 },
  modalNextText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
