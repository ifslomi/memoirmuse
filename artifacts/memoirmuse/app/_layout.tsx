import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  useFonts as useSpaceGrotesk,
} from "@expo-google-fonts/space-grotesk";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts as useManrope,
} from "@expo-google-fonts/manrope";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inLogin = segments[0] === "login";
    const inRegister = segments[0] === "register";
    const inAuth = inLogin || inRegister;

    if (!user && !inAuth) {
      router.replace("/login");
    } else if (user && inAuth) {
      router.replace("/(tabs)");
    }
  }, [user, segments, initialized]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [sgLoaded] = useSpaceGrotesk({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const [mpLoaded] = useManrope({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const [ready, setReady] = useState(Platform.OS === "web");

  useEffect(() => {
    if (sgLoaded && mpLoaded) {
      if (Platform.OS !== "web") {
        SplashScreen.hideAsync();
      }
      setReady(true);
    }
  }, [sgLoaded, mpLoaded]);

  useEffect(() => {
    if (Platform.OS === "web") {
      const timer = setTimeout(() => setReady(true), 150);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#131313" }}>
              <KeyboardProvider>
                <AuthGate>
                  <Slot />
                </AuthGate>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
