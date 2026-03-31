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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import COLORS from "@/constants/colors";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const contentAnim = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glow1 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentAnim, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
      Animated.spring(contentSlide, { toValue: 0, delay: 100, useNativeDriver: true, friction: 8 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow1, { toValue: 1, duration: 2800, useNativeDriver: true }),
        Animated.timing(glow1, { toValue: 0.4, duration: 2800, useNativeDriver: true }),
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

  const handleRegister = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError("");
    if (!username.trim() || !password) {
      setError("All fields are required.");
      shake();
      return;
    }
    if (password !== confirmPass) {
      setError("Quantum Keys do not match.");
      shake();
      return;
    }
    setLoading(true);
    const result = register(username, password);
    setLoading(false);
    if (result.ok) {
      router.replace("/(tabs)");
    } else {
      setError(result.error ?? "Registration failed.");
      shake();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#040e1a", "#060c12", "#131313"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View style={[styles.glowTop, { opacity: glow1 }]} />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color={COLORS.onSurface} />
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryContainer]}
            style={styles.logoCircle}
          >
            <Feather name="clock" size={16} color="#00363d" />
          </LinearGradient>
          <Text style={styles.brandName}>MEMOIRMUSE</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: contentAnim, transform: [{ translateY: contentSlide }] }}>
            <View style={styles.headerSection}>
              <View style={styles.iconRing}>
                <LinearGradient colors={["rgba(0,229,255,0.15)", "rgba(0,229,255,0.05)"]} style={StyleSheet.absoluteFill} />
                <Feather name="user-plus" size={32} color={COLORS.primaryContainer} />
              </View>
              <Text style={styles.pageTitle}>Create Archive</Text>
              <Text style={styles.pageSub}>Register your identity in the Chronos network.</Text>
            </View>

            <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}>
              <View style={styles.formGlow} />

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>ARCHIVE ID</Text>
                <View style={styles.inputWrap}>
                  <Feather name="user" size={16} color={COLORS.onSurfaceVariant} />
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Choose a unique ID"
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
                    placeholder="Min. 4 characters"
                    placeholderTextColor={COLORS.onSurfaceVariant + "70"}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPass((v) => !v)}>
                    <Feather name={showPass ? "eye-off" : "eye"} size={16} color={COLORS.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>CONFIRM QUANTUM KEY</Text>
                <View style={styles.inputWrap}>
                  <Feather name="shield" size={16} color={COLORS.onSurfaceVariant} />
                  <TextInput
                    style={styles.input}
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                    placeholder="Repeat your key"
                    placeholderTextColor={COLORS.onSurfaceVariant + "70"}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {!!error && (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={14} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.registerBtn}
                onPress={handleRegister}
                activeOpacity={0.88}
                disabled={loading}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryContainer]}
                  style={styles.registerBtnGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Feather name="user-plus" size={18} color="#00363d" />
                  <Text style={styles.registerBtnText}>
                    {loading ? "REGISTERING..." : "Register Archive"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Feather name="arrow-left" size={14} color={COLORS.primaryContainer} />
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#040e1a" },
  glowTop: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#00e5ff04",
  },

  topBar: {
    paddingTop: Platform.OS === "ios" ? 54 : 44,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerHighest,
    justifyContent: "center",
    alignItems: "center",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  brandName: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_700Bold",
    color: COLORS.primaryContainer,
    letterSpacing: 3,
  },

  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 60, paddingTop: 8, gap: 28 },

  headerSection: { alignItems: "center", gap: 14, paddingTop: 12, paddingBottom: 8 },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryContainer + "25",
    overflow: "hidden",
  },
  pageTitle: { fontSize: 32, fontFamily: "SpaceGrotesk_700Bold", color: COLORS.onSurface, textAlign: "center" },
  pageSub: { fontSize: 14, fontFamily: "Manrope_400Regular", color: COLORS.onSurfaceVariant, textAlign: "center" },

  formCard: {
    backgroundColor: "rgba(53,53,52,0.55)",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "22",
    gap: 16,
    overflow: "hidden",
  },
  formGlow: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#00e5ff04",
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

  registerBtn: { borderRadius: 999, overflow: "hidden", marginTop: 4 },
  registerBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  registerBtnText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#00363d",
    letterSpacing: 1.5,
  },

  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 4,
  },
  backToLoginText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: COLORS.primaryContainer,
  },
});
