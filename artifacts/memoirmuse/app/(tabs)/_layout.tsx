import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, View, Animated, Text } from "react-native";
import COLORS from "@/constants/colors";

function TabIcon({
  name,
  color,
  focused,
  label,
}: {
  name: string;
  color: string;
  focused: boolean;
  label: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1.1, useNativeDriver: true, tension: 120, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [focused]);

  return (
    <Animated.View style={[styles.tabIconWrap, { transform: [{ scale }] }]}>
      <Animated.View
        style={[styles.tabPill, { opacity, backgroundColor: COLORS.primary + "18" }]}
      />
      <Feather name={name as any} size={22} color={color} />
      <Text style={[styles.tabLabel, { color, fontFamily: focused ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

export default function TabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: isWeb ? 20 : 28,
          height: 72,
          borderRadius: 36,
          backgroundColor: isIOS ? "transparent" : COLORS.white,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: COLORS.cardShadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
          borderWidth: 1,
          borderColor: COLORS.borderLight,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={85}
              tint="light"
              style={[StyleSheet.absoluteFill, { borderRadius: 36, overflow: "hidden" }]}
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.white, borderRadius: 36 }]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="ar"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="camera" color={color} focused={focused} label="AR" />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="image" color={color} focused={focused} label="Gallery" />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="help-circle" color={color} focused={focused} label="Quiz" />
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="map"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 3,
    minWidth: 60,
    position: "relative",
  },
  tabPill: {
    position: "absolute",
    top: -6,
    left: -16,
    right: -16,
    bottom: -6,
    borderRadius: 20,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
