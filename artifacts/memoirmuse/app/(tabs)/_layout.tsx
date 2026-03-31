import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TAB_H = 64;
const CENTER_SIZE = 68;

const TAB_DEFS = [
  { name: "index", label: "Home", icon: "home" as const },
  { name: "map", label: "Map", icon: "map-pin" as const },
  { name: "ar", label: "AR Camera", icon: "camera" as const, center: true },
  { name: "quiz", label: "Quizzes", icon: "help-circle" as const },
  { name: "gallery", label: "Profile", icon: "user" as const },
];

function CustomTabBar({ state, navigation, insets }: BottomTabBarProps & { insets: { bottom: number } }) {
  const bottomPad = Platform.OS === "ios" ? insets.bottom : 8;
  const barHeight = TAB_H + bottomPad;

  return (
    <View style={[styles.wrapper, { height: barHeight + 22, bottom: 0 }]}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
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
              <View key={tab.name} style={styles.centerWrap}>
                <TouchableOpacity
                  onPress={handlePress}
                  activeOpacity={0.85}
                  style={styles.centerBtn}
                >
                  <LinearGradient
                    colors={["#c3f5ff", "#00e5ff"]}
                    style={styles.centerGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Feather name="camera" size={28} color="#00363d" />
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.centerLabel}>AR Camera</Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={handlePress}
              activeOpacity={0.7}
            >
              <Feather
                name={tab.icon}
                size={22}
                color={isActive ? "#00e5ff" : "rgba(229,226,225,0.4)"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? "#00e5ff" : "rgba(229,226,225,0.4)" },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
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
    borderTopWidth: 1,
    borderTopColor: "rgba(59,73,76,0.25)",
    backgroundColor: "transparent",
    overflow: "visible",
  },
  androidBg: {
    backgroundColor: "rgba(32,31,31,0.96)",
  },
  bar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 6,
    gap: 4,
    height: TAB_H,
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
    marginBottom: 2,
    shadowColor: "#00e5ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 12,
    transform: [{ translateY: -16 }],
  },
  centerGrad: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  centerLabel: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: "#00e5ff",
    marginTop: -6,
  },
});
