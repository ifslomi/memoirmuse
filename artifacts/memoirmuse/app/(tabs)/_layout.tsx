import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import COLORS from "@/constants/colors";

function TabIcon({
  name,
  focused,
}: {
  name: string;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      <Feather
        name={name as any}
        size={21}
        color={focused ? COLORS.primary : COLORS.textMuted}
      />
      {focused && <View style={styles.activeDot} />}
    </View>
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
          left: 24,
          right: 24,
          bottom: isWeb ? 16 : 24,
          height: 68,
          borderRadius: 34,
          backgroundColor: isIOS ? "transparent" : COLORS.white,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: "#2C1810",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.14,
          shadowRadius: 20,
          borderWidth: 1,
          borderColor: COLORS.borderLight,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint="light"
              style={[StyleSheet.absoluteFill, { borderRadius: 34, overflow: "hidden" }]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: COLORS.white,
                  borderRadius: 34,
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
          tabBarIcon: (props) => <TabIcon name="home" {...props} />,
        }}
      />
      <Tabs.Screen
        name="ar"
        options={{
          tabBarIcon: (props) => <TabIcon name="camera" {...props} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          tabBarIcon: (props) => <TabIcon name="image" {...props} />,
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          tabBarIcon: (props) => <TabIcon name="help-circle" {...props} />,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    gap: 4,
  },
  tabIconWrapActive: {
    backgroundColor: COLORS.primary + "12",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});
