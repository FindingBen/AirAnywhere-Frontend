import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { MarkersProvider } from "./context/markersContext";
import { useEffect } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvide } from "./authentication/auth";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvide>
      <MarkersProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, title: "Home" }}
            ></Stack.Screen>
          </Stack>
        </ThemeProvider>
      </MarkersProvider>
    </AuthProvide>
  );
}
