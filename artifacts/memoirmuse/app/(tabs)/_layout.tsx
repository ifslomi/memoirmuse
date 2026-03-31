import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import COLORS from "@/constants/colors";

export default function TabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: isWeb ? 16 : 24,
          height: 72,
          borderRadius: 36,
          backgroundColor: isIOS ? "transparent" : COLORS.white,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: "#2C1810",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          borderWidth: 1,
          borderColor: COLORS.borderLight,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint="light"
              style={[StyleSheet.absoluteFill, { borderRadius: 36, overflow: "hidden" }]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: COLORS.white,
                  borderRadius: 36,
                  borderWidth: 1,
                  borderColor: COLORS.borderLight,
                },
              ]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ar"
        options={{
          tabBarLabel: "AR",
          tabBarIcon: ({ color }) => (
            <Feather name="camera" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          tabBarLabel: "Gallery",
          tabBarIcon: ({ color }) => (
            <Feather name="image" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          tabBarLabel: "Quiz",
          tabBarIcon: ({ color }) => (
            <Feather name="help-circle" size={20} color={color} />
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

const styles = StyleSheet.create({});
