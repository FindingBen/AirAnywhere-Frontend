import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
  Text,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../app/authentication/auth";
import { useRouter } from "expo-router";

const AccountDropdown = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { authState, onLogout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    setMenuVisible(false);
    try {
      await onLogout?.();
      Alert.alert("Logged Out", "You have been logged out successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
    }
  };

  const handleLogin = () => {
    setMenuVisible(false);
    router.push("/login");
  };

  const handleRegister = () => {
    setMenuVisible(false);
    router.push("/signup");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.accountButton}
        onPress={() => setMenuVisible(true)}
      >
        <MaterialCommunityIcons
          name="account-circle"
          size={28}
          color="#626F47"
        />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdown}>
              {authState?.authenticated && authState?.isAnonymous ? (
                // Anonymous user - show Register button
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                >
                  <MaterialCommunityIcons
                    name="account-plus"
                    size={20}
                    color="#007BFF"
                  />
                  <Text style={styles.registerButtonText}>Create Account</Text>
                </TouchableOpacity>
              ) : authState?.authenticated ? (
                // Registered user - show Logout button
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <MaterialCommunityIcons
                    name="logout"
                    size={20}
                    color="#F44336"
                  />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              ) : (
                // Not authenticated - show Login button
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                >
                  <MaterialCommunityIcons
                    name="login"
                    size={20}
                    color="#4CAF50"
                  />
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  accountButton: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  dropdownContainer: {
    position: "absolute",
    top: 120,
    right: 16,
  },
  dropdown: {
    backgroundColor: "#FEFAE0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F44336",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007BFF",
  },
});

export default AccountDropdown;
