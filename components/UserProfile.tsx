import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../app/authentication/auth";

const UserProfile = () => {
  const { user } = useAuth();

  // Generate avatar color based on username
  const avatarColor = useMemo(() => {
    if (!user?.username) return "#007BFF";
    
    const colors = [
      "#FF6B6B", // Red
      "#4ECDC4", // Teal
      "#45B7D1", // Blue
      "#FFA07A", // Light Salmon
      "#98D8C8", // Mint
      "#F7DC6F", // Yellow
      "#BB8FCE", // Purple
      "#85C1E2", // Sky Blue
    ];
    
    let hash = 0;
    for (let i = 0; i < user.username.length; i++) {
      hash = user.username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }, [user?.username]);

  // Get initials from username
  const initials = useMemo(() => {
    if (!user?.username) return "?";
    const parts = user.username.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  }, [user?.username]);

  if (!user) {
    // Show placeholder while loading
    return (
      <View style={styles.container}>
        <View style={[styles.avatar, { backgroundColor: "#007BFF" }]}>
          <Text style={styles.initials}>?</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.username}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.username} numberOfLines={1}>
          {user.username}
        </Text>
        {user.isAnonymous && (
          <Text style={styles.badge}>Guest</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  initials: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  textContainer: {
    maxWidth: 140,
  },
  username: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  badge: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
});

export default UserProfile;
