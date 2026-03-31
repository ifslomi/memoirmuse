import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";

const TAB_H = 64;
const CENTER_SIZE = 64;

const TAB_DEFS = [
  { name: "index", label: "Home", icon: "home" as const },
  { name: "map", label: "Map", icon: "map" as const },
  { name: "ar", label: "AR Camera", icon: "camera" as const, center: true },
  { name: "quiz", label: "Quizzes", icon: "help-circle" as const },
  { name: "gallery", label: "Profile", icon: "user" as const },
];

function TabItem({
  tab,
  isActive,
  onPress,
}: {
  tab: (typeof TAB_DEFS)[0];
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const activeOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(activeOpacity, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={handlePress}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: "center", gap: 4 }}>
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              opacity: activeOpacity,
              transform: [
                {
                  scaleX: activeOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Feather
          name={tab.icon}
          size={22}
          color={isActive ? "#00e5ff" : "rgba(229,226,225,0.35)"}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isActive ? "#00e5ff" : "rgba(229,226,225,0.35)" },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function CenterButton({
  isActive,
  onPress,
}: {
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 80 }),
    ]).start();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={styles.centerWrap}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Animated.View style={[styles.centerGlow, { opacity: glowOpacity }]} />
          <LinearGradient
            colors={["#c3f5ff", "#00e5ff"]}
            style={styles.centerBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="camera" size={26} color="#00363d" />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
      <Text style={[styles.centerLabel, { color: isActive ? "#00e5ff" : "rgba(229,226,225,0.45)" }]}>
        AR Camera
      </Text>
    </View>
  );
}

function CustomTabBar({ state, navigation, insets }: BottomTabBarProps & { insets: { bottom: number } }) {
  const bottomPad = Platform.OS === "ios" ? insets.bottom : 10;
  const barHeight = TAB_H + bottomPad;

  return (
    <View style={[styles.wrapper, { height: barHeight + 20, bottom: 0 }]}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidBg]} />
      )}
      <View style={[styles.bar, { paddingBottom: bottomPad }]}>
        {TAB_DEFS.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isActive = state.index === routeIndex;

          const handlePress = () => {
            if (routeIndex < 0) return;
            const event = navigation.emit({
              type: "tabPress",
              target: state.routes[routeIndex].key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(state.routes[routeIndex].name);
            }
          };

          if (tab.center) {
            return (
              <CenterButton key={tab.name} isActive={isActive} onPress={handlePress} />
            );
          }

          return (
            <TabItem
              key={tab.name}
              tab={tab}
              isActive={isActive}
              onPress={handlePress}
            />
          );
        })}
      </View>
    </View>
  );
}

function WrappedTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return <CustomTabBar {...props} insets={insets} />;
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <WrappedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="ar" />
      <Tabs.Screen name="quiz" />
      <Tabs.Screen name="gallery" />
      <Tabs.Screen name="timeline" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(59,73,76,0.3)",
    backgroundColor: "transparent",
    overflow: "visible",
  },
  androidBg: {
    backgroundColor: "rgba(20,20,20,0.97)",
  },
  bar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 6,
    height: TAB_H,
  },
  activeIndicator: {
    position: "absolute",
    top: -2,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#00e5ff",
    shadowColor: "#00e5ff",
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  tabLabel: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 4,
  },
  centerBtn: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -18 }],
  },
  centerGlow: {
    position: "absolute",
    width: CENTER_SIZE + 20,
    height: CENTER_SIZE + 20,
    borderRadius: (CENTER_SIZE + 20) / 2,
    backgroundColor: "#00e5ff",
    transform: [{ translateY: -18 }],
    top: -10,
    left: -10,
    shadowColor: "#00e5ff",
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  centerLabel: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginTop: -14,
  },
});
