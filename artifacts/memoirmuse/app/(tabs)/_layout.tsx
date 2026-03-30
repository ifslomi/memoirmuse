import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import COLORS from "@/constants/colors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="timeline">
        <Icon sf={{ default: "clock", selected: "clock.fill" }} />
        <Label>Timeline</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ar">
        <Icon sf={{ default: "camera", selected: "camera.fill" }} />
        <Label>AR</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="gallery">
        <Icon sf={{ default: "photo", selected: "photo.fill" }} />
        <Label>Gallery</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="quiz">
        <Icon sf={{ default: "questionmark.circle", selected: "questionmark.circle.fill" }} />
        <Label>Quiz</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : COLORS.white,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: COLORS.borderLight,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.white }]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_500Medium",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={24} />
            ) : (
              <Feather name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: "Timeline",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="clock" tintColor={color} size={24} />
            ) : (
              <Feather name="clock" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="ar"
        options={{
          title: "AR",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="camera" tintColor={color} size={24} />
            ) : (
              <Feather name="camera" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="photo" tintColor={color} size={24} />
            ) : (
              <Feather name="image" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: "Quiz",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="questionmark.circle" tintColor={color} size={24} />
            ) : (
              <Feather name="help-circle" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="map" tintColor={color} size={24} />
            ) : (
              <Feather name="map-pin" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
