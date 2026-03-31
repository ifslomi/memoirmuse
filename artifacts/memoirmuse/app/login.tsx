import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import COLORS from "@/constants/colors";

const { width: W, height: H } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const glow1 = useRef(new Animated.Value(0.4)).current;
  const glow2 = useRef(new Animated.Value(0.6)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentAnim, { toValue: 1, duration: 700, delay: 200, useNativeDriver: true }),
      Animated.spring(contentSlide, { toValue: 0, delay: 200, useNativeDriver: true, friction: 8 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow1, { toValue: 0.9, duration: 3000, useNativeDriver: true }),
        Animated.timing(glow1, { toValue: 0.4, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow2, { toValue: 0.3, duration: 2500, useNativeDriver: true }),
        Animated.timing(glow2, { toValue: 0.7, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError("");
    const result = login(username, password);
    setLoading(false);
    if (result.ok) {
      router.replace("/(tabs)");
    } else {
      setError(result.error ?? "Login failed");
      shake();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleGuest = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    login("user", "user");
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#040e1a", "#060c12", "#131313"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[StyleSheet.absoluteFill, styles.gridBg]} />

      <Animated.View style={[styles.glowTop, { opacity: glow1 }]} />
      <Animated.View style={[styles.glowBottom, { opacity: glow2 }]} />

      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryContainer]}
            style={styles.logoCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="clock" size={16} color="#00363d" />
          </LinearGradient>
          <Text style={styles.brandName}>MEMOIRMUSE</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>SYSTEM ONLINE: V4.0.2</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: contentAnim,
                transform: [{ translateY: contentSlide }],
              },
            ]}
          >
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                Resurrect{"\n"}
                <Text style={styles.heroSub}>Lost Eras.</Text>
              </Text>
              <Text style={styles.heroDesc}>
                Bridge the gap between raw data and immersive reality. Experience history not as a record, but as a living landscape.
              </Text>

              <View style={styles.featureBento}>
                <View style={styles.bentoCard}>
                  <Feather name="cpu" size={22} color={COLORS.tertiaryFixedDim} />
                  <Text style={styles.bentoTitle}>SPATIAL SYNC</Text>
                </View>
                <View style={[styles.bentoCard, styles.bentoCardOffset]}>
                  <Feather name="star" size={22} color={COLORS.primaryContainer} />
                  <Text style={styles.bentoTitle}>NEURAL AR</Text>
                </View>
              </View>
            </View>

            <Animated.View style={[styles.loginCard, { transform: [{ translateX: shakeAnim }] }]}>
              <View style={styles.loginGlow} />

              <View style={styles.loginHeader}>
                <Text style={styles.loginTitle}>Access Interface</Text>
                <Text style={styles.loginSub}>Enter your credentials to re-materialize.</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>ARCHIVE ID</Text>
                <View style={styles.inputWrap}>
                  <Feather name="at-sign" size={16} color={COLORS.onSurfaceVariant} />
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="your username"
                    placeholderTextColor={COLORS.onSurfaceVariant + "70"}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>QUANTUM KEY</Text>
                <View style={styles.inputWrap}>
                  <Feather name="lock" size={16} color={COLORS.onSurfaceVariant} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.onSurfaceVariant + "70"}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowPass((v) => !v)}>
                    <Feather name={showPass ? "eye-off" : "eye"} size={16} color={COLORS.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>
              </View>

              {!!error && (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={14} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleLogin}
                activeOpacity={0.88}
                disabled={loading}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryContainer]}
                  style={styles.loginBtnGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.loginBtnText}>
                    {loading ? "INITIALIZING..." : "Initialize Login"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>PROTOCOL SELECTION</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.altBtns}>
                <TouchableOpacity
                  style={styles.altBtn}
                  onPress={() => router.push("/register")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.altBtnText}>Create Account</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.altBtn} onPress={handleGuest} activeOpacity={0.85}>
                  <Text style={styles.altBtnText}>Guest Access</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.legalText}>
                By accessing MemoirMuse, you agree to the{" "}
                <Text style={styles.legalLink}>MemoirMuse Terms of Service</Text>.
              </Text>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>COORDINATES</Text>
          <Text style={styles.footerValue}>14.5995° N, 120.9842° E</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>EPOCH TIME</Text>
          <Text style={styles.footerValue}>1709424000 MS</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#040e1a" },
  gridBg: {
    backgroundImage: Platform.OS === "web"
      ? "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)"
      : undefined,
    backgroundSize: Platform.OS === "web" ? "40px 40px" : undefined,
  } as any,
  glowTop: {
    position: "absolute",
    top: -80,
    left: -80,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#00e5ff",
    shadowColor: "#00e5ff",
    shadowOpacity: 0.3,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
    opacity: 0.05,
  },
  glowBottom: {
    position: "absolute",
    bottom: -60,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.tertiaryFixedDim,
    shadowColor: COLORS.tertiaryFixedDim,
    shadowOpacity: 0.2,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    opacity: 0.04,
  },

  topBar: {
    paddingTop: Platform.OS === "ios" ? 54 : 44,
    paddingHorizontal: 24,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00e5ff",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  brandName: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.primaryContainer,
    letterSpacing: 3,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceContainerHighest + "88",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "20",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primaryContainer,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  statusText: {
    fontSize: 8,
    fontFamily: "Manrope_700Bold",
    color: COLORS.primary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 80, paddingTop: 8 },
  content: { gap: 28 },

  heroSection: { gap: 16 },
  heroTitle: {
    fontSize: 52,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.primaryContainer,
    lineHeight: 58,
  },
  heroSub: {
    color: COLORS.onSurface,
    opacity: 0.9,
  },
  heroDesc: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
    maxWidth: 340,
  },

  featureBento: { flexDirection: "row", gap: 12, marginTop: 4 },
  bentoCard: {
    flex: 1,
    backgroundColor: "rgba(53,53,52,0.55)",
    padding: 20,
    borderRadius: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "15",
  },
  bentoCardOffset: { transform: [{ translateY: 14 }] },
  bentoTitle: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onSurface,
    letterSpacing: 1.5,
  },

  loginCard: {
    backgroundColor: "rgba(53,53,52,0.55)",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "22",
    gap: 18,
    overflow: "hidden",
    position: "relative",
  },
  loginGlow: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#00e5ff06",
  },
  loginHeader: { gap: 6 },
  loginTitle: {
    fontSize: 24,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onSurface,
  },
  loginSub: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: COLORS.onSurfaceVariant,
  },

  formGroup: { gap: 8 },
  fieldLabel: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginLeft: 4,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "18",
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: COLORS.onSurface,
    padding: 0,
    margin: 0,
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.errorContainer + "15",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.error + "30",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: COLORS.error,
    flex: 1,
  },

  loginBtn: { borderRadius: 999, overflow: "hidden" },
  loginBtnGrad: {
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#00e5ff",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  loginBtnText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onPrimary,
    letterSpacing: 1.5,
  },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.outlineVariant + "25" },
  dividerText: {
    fontSize: 8,
    fontFamily: "Manrope_700Bold",
    color: COLORS.outlineVariant,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  altBtns: { flexDirection: "row", gap: 10 },
  altBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "15",
  },
  altBtnText: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: COLORS.onSurface,
    letterSpacing: 0.5,
  },

  legalText: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: COLORS.onSurfaceVariant + "80",
    textAlign: "center",
    lineHeight: 16,
  },
  legalLink: { color: COLORS.primary, textDecorationLine: "underline" },

  footer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 32 : 20,
    left: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  footerItem: { gap: 2 },
  footerLabel: {
    fontSize: 7,
    fontFamily: "Manrope_700Bold",
    color: COLORS.outlineVariant,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  footerValue: {
    fontSize: 10,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.onSurface,
  },
  footerDivider: { width: 1, height: 32, backgroundColor: COLORS.outlineVariant + "25" },
});
