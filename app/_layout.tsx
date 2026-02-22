import { darkTheme, lightTheme } from "@/constants/Themes";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { GlobalSettingsMenu } from "@/components/GlobalSettingsMenu";
import { CustomHeader } from "@/components/CustomHeader";

import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper"; // Import this if you haven't
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../lib/theme-context";
import { Audio } from "expo-av";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // const isAuth = false;
  const { user, isLoadingUser } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    async function setupAudio() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true, // 🟢 Sound plays even on silent switch
        staysActiveInBackground: true, // 🟢 Keeps music going when app is minimized
        shouldDuckAndroid: true, // 🟢 Lowers volume when a notification comes in
        interruptionModeIOS: 1, // Do not mix with other apps (standard for music)
      });
    }
    setupAudio();
  }, []);

  useEffect(() => {
    // check if user is already in auth page
    const inAuthGroup = segments[0] === "auth";
    const timer = setTimeout(() => {
      if (!user && !inAuthGroup && !isLoadingUser) {
        router.replace("/auth");
      } else if (user && inAuthGroup && !isLoadingUser) {
        router.replace("/");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, segments]);
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <SafeAreaProvider>
            <RouteGuard>
              {/* <GlobalSettingsMenu /> */}
              <Stack
                screenOptions={{
                  header: (props) => <CustomHeader {...props} />,
                }}
              >
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
                <Stack.Screen
                  name="task-details/[id]"
                  options={{
                    title: "Task Details",
                  }}
                />
                <Stack.Screen
                  name="task/[id]"
                  options={{
                    title: "Task Details",
                  }}
                />
              </Stack>
            </RouteGuard>
          </SafeAreaProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
