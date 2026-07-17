import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useAuth } from "../app/authentication/auth";
import { useRouter } from "expo-router";

const UserProfile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [showFeedbackNotification, setShowFeedbackNotification] = useState(false);

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
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowFeedbackNotification(true)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.initials}>{initials}</Text>
          {/* Notification Badge */}
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.username} numberOfLines={1}>
            {user.username}
          </Text>
          {user.isAnonymous && (
            <Text style={styles.badge}>Guest</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Feedback Notification Modal */}
      <Modal
        visible={showFeedbackNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFeedbackNotification(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFeedbackNotification(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.notificationIcon}>💭</Text>
            <Text style={styles.notificationTitle}>We'd Love Your Feedback!</Text>
            
            <Text style={styles.notificationMessage}>
              If you're enjoying the app, please share your thoughts on how we can improve it. Your feedback helps us make Erforus better!
            </Text>

            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => {
                setShowFeedbackNotification(false);
                router.push("/about");
              }}
            >
              <Text style={styles.feedbackButtonText}>✍️ Share Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.laterButton}
              onPress={() => setShowFeedbackNotification(false)}
            >
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF4444",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 320,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#999",
    fontWeight: "600",
  },
  notificationIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  feedbackButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  feedbackButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  laterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  laterButtonText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default UserProfile;
