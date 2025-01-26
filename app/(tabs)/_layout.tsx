import { Tabs } from "expo-router";
import React, { useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { TabBarIcon } from "@/components/icons/TabBarIcon";
import { useEffect } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { AuthProvide } from "../authentication/auth";
import { useFonts } from "expo-font";
import { useAuth } from "../authentication/auth";
import { Alert, TouchableOpacity } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { authState, onLogout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  console.log(authState);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            ></TabBarIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: "Contact",
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="message1" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="addPump"
        redirect={!authState?.authenticated}
        options={{
          title: "Add pump",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 name="add" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="login"
        redirect={authState?.authenticated}
        options={{
          title: "Sign in",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="sign-in" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="+not-found" />
    </Tabs>
  );
}
