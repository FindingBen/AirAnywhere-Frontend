import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../app/authentication/auth";
import { useRouter } from "expo-router";

const RightNavigation = () => {
  const { authState, onLogout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await onLogout?.();
      Alert.alert("Logged Out", "You have been logged out successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = () => {
    router.push("/signup");
  };

  const handleContactUs = () => {
    router.push("/about");
  };

  const handleLeaderboard = () => {
    router.push("/leaderboard");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={handleLeaderboard}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="trophy"
          size={24}
          color="#626F47"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={handleContactUs}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="message"
          size={24}
          color="#626F47"
        />
      </TouchableOpacity>

      {authState?.authenticated && authState?.isAnonymous ? (
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleRegister}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="account-plus"
            size={24}
            color="#007BFF"
          />
        </TouchableOpacity>
      ) : authState?.authenticated ? (
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="logout"
            size={24}
            color="#F44336"
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="login"
            size={24}
            color="#4CAF50"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 52,
    right: 16,
    zIndex: 100,
    gap: 12,
  },
  navButton: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RightNavigation;
