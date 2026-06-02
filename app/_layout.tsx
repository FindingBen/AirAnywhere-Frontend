import React from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { MarkersProvider } from "./context/markersContext";
import { useEffect } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvide, useAuth } from "./authentication/auth";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "Map" }}
        />
        <Stack.Screen
          name="login"
          options={{ headerShown: false, title: "Login" }}
        />
        <Stack.Screen
          name="signup"
          options={{ headerShown: false, title: "Sign Up" }}
        />
        <Stack.Screen name="addPump" options={{ title: "Add Pump" }} />
        <Stack.Screen
          name="about"
          options={{ headerShown: false, title: "Contact Us" }}
        />
        <Stack.Screen
          name="leaderboard"
          options={{ headerShown: false, title: "Leaderboard" }}
        />
      </Stack>
    </ThemeProvider>
  );
}

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
        <RootLayoutNav />
      </MarkersProvider>
    </AuthProvide>
  );
}
