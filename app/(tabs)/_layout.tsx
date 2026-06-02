import { Tabs } from "expo-router";
import React, { useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { TabBarIcon } from "@/components/icons/TabBarIcon";
import { useEffect } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { AuthProvide } from "../authentication/auth";
import { useFonts } from "expo-font";
import { useAuth } from "../authentication/auth";
import { Alert, TouchableOpacity } from "react-native";
import mobileAds from "react-native-google-mobile-ads";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";


const adUnitId = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-8405702460762102/5022833445";

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

  useEffect(() => {
    console.log("[TABS] Auth state updated:", authState?.authenticated);
  }, [authState?.authenticated]);


    useEffect(() => {
      mobileAds()
        .initialize()
        .then(() => console.log("✅ AdMob initialized"));
    }, []);

  if (!loaded) {
    return null;
  }

  console.log(authState);

  return (
    <>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="map" size={24} color={color}></Feather>
          ),
        }}
      />

      {/* <Tabs.Screen
        name="about"
        options={{
          title: "Contact",
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="message" size={24} color={color} />
          ),
        }}
      /> */}

      <Tabs.Screen
        name="addPump"
        options={{
          title: "Add pump",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 name="add" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="+not-found" />
    </Tabs>
            </>
  );
}
