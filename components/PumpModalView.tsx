import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import axios from "axios";
import { useAuth } from "../app/authentication/auth";
import { useMarkers } from "../app/context/markersContext";
import { buildApiUrl } from "@/utils/api";

type PumpData = {
  _id: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
  positive?: number;
  negative?: number;
};

type PumpModalViewProps = {
  pump: PumpData;
  onSelectMarker: (marker: PumpData | null) => void;
};

const PumpModalView = ({ pump, onSelectMarker }: PumpModalViewProps) => {
  const { authState } = useAuth();
  const { fetchMarkers } = useMarkers();
  const [votingLoading, setVotingLoading] = useState(false);
  
  console.log("[MODAL] Auth state:", authState);
  console.log("[MODAL] Authenticated:", authState?.authenticated);
  console.log("[MODAL] Token:", authState?.token ? "exists" : "null");
  const copyToClipboard = (latitude: number, longitude: number) => {
    const coordinates = `${latitude}, ${longitude}`;
    Clipboard.setStringAsync(coordinates);

    Alert.alert("Copied to Clipboard", `Coordinates: ${coordinates}`);
  };

  const openInGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open Google Maps.")
    );
  };

  const decodeToken = (token: string) => {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  };

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!authState?.authenticated) {
      Alert.alert("Authentication Required", "Please login to cast your vote.");
      return;
    }

    setVotingLoading(true);
    try {
      const decoded = decodeToken(authState.token!);
      const userId = decoded?.userId || decoded?.id || decoded?.sub;

      if (!userId) {
        Alert.alert("Error", "Could not extract user ID from token");
        setVotingLoading(false);
        return;
      }

      const voteData = {
        userId,
        markerId: pump._id,
        voteType,
        pointsAwarded: voteType === "upvote" ? 10 : -5,
      };

      console.log("Sending vote:", voteData);

      const response = await axios.post(
        buildApiUrl("/vote"),
        voteData
      );

      // Update pump counts locally for immediate UI feedback
      const updatedPump = {
        ...pump,
        positive: (pump.positive ?? 0) + (voteType === "upvote" ? 1 : 0),
        negative: (pump.negative ?? 0) + (voteType === "downvote" ? 1 : 0),
      };
      onSelectMarker(updatedPump);

      // Refresh markers from backend to ensure sync
      await fetchMarkers();

      Alert.alert("Success", response.data.message);
    } catch (error: any) {
      console.log("Vote error:", error.response?.data || error.message);
      const errorMsg =
        error.response?.data?.error || "Failed to submit vote";
      Alert.alert("Error", errorMsg);
    } finally {
      setVotingLoading(false);
    }
  };


  const styles = createStyles(pump?.status);
  return (
    <View style={styles.card}>
      <TouchableOpacity
        hitSlop={{ top: 30, bottom: 30, left: 30, right: 50 }}
        style={styles.xButton}
        onPress={() => onSelectMarker(null)}
      >
        <Text style={styles.xButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Header with Status Badge */}
      <View style={styles.headerView}>
        <Text style={styles.title}>{pump?.name}</Text>
        <View
          style={[
            styles.statusBadge,
            pump?.status === "Works"
              ? styles.statusWorking
              : styles.statusBroken,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  pump?.status === "Works" ? "#2E7D32" : "#C62828",
              },
            ]}
          >
            {pump?.status === "Works" ? "✓ Working" : "⚠ Broken"}
          </Text>
        </View>
      </View>

      {/* Coordinates Section */}
      <View style={styles.coordinatesSection}>
        <Text style={styles.sectionLabel}>📍 Location</Text>
        <Text style={styles.coordinates}>
          {pump?.latitude.toFixed(4)}, {pump?.longitude.toFixed(4)}
        </Text>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => copyToClipboard(pump?.latitude, pump?.longitude)}
        >
          <Text style={styles.smallButtonText}>Copy</Text>
        </TouchableOpacity>
      </View>

      {/* Community Feedback Section */}
      <View style={styles.feedbackSection}>
        <Text style={styles.sectionLabel}>👥 Community Feedback</Text>
        <View style={styles.feedbackGrid}>
          <View style={[styles.feedbackBox, styles.workingBox]}>
            <Text style={styles.feedbackEmoji}>✓</Text>
            <Text style={styles.feedbackCount}>{pump?.positive || 0}</Text>
            <Text style={styles.feedbackLabel}>Working</Text>
          </View>
          <View style={[styles.feedbackBox, styles.brokenBox]}>
            <Text style={styles.feedbackEmoji}>✕</Text>
            <Text style={styles.feedbackCount}>{pump?.negative || 0}</Text>
            <Text style={styles.feedbackLabel}>Broken</Text>
          </View>
        </View>
      </View>

      {/* Voting Buttons */}
      {authState?.authenticated && (
        <View style={styles.voteButtonView}>
          <TouchableOpacity
            style={[styles.voteButton, styles.upvoteButton]}
            onPress={() => handleVote("upvote")}
            disabled={votingLoading}
          >
            <Text style={styles.voteEmoji}>✓</Text>
            <Text style={styles.voteButtonText}>Works</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.voteButton, styles.downvoteButton]}
            onPress={() => handleVote("downvote")}
            disabled={votingLoading}
          >
            <Text style={styles.voteEmoji}>✕</Text>
            <Text style={styles.voteButtonText}>Broken</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation Button */}
      <TouchableOpacity
        style={styles.mapsButton}
        onPress={() => openInGoogleMaps(pump.latitude, pump.longitude)}
      >
        <Text style={styles.mapsButtonText}>🗺️ Open in Maps</Text>
      </TouchableOpacity>
    </View>
  );
  };

export default PumpModalView;

function createStyles(status: string) {
  return StyleSheet.create({
    card: {
      position: "absolute",
      bottom: 64,
      left: 0,
      right: 0,
      backgroundColor: "#FFFFFF",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 24,
      paddingHorizontal: 20,
      paddingBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
    },

    xButton: {
      position: "absolute",
      right: 20,
      top: 16,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#F0F0F0",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    xButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#666",
    },

    headerView: {
      marginBottom: 14,
      paddingRight: 40,
    },
    title: {
      fontWeight: "800",
      fontSize: 22,
      color: "#1a1a1a",
      marginBottom: 8,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    statusWorking: {
      backgroundColor: "#E8F5E9",
      borderColor: "#4CAF50",
      borderWidth: 1.5,
    },
    statusBroken: {
      backgroundColor: "#FFEBEE",
      borderColor: "#F44336",
      borderWidth: 1.5,
    },
    statusText: {
      fontSize: 13,
      fontWeight: "700",
    },

    sectionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: "#999",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 10,
    },

    coordinatesSection: {
      backgroundColor: "#F9F9F9",
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    },
    coordinates: {
      fontSize: 13,
      color: "#333",
      fontWeight: "600",
      marginBottom: 8,
      fontFamily: "Menlo",
    },
    smallButton: {
      backgroundColor: "#007BFF",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: "flex-start",
    },
    smallButtonText: {
      color: "#FFF",
      fontSize: 12,
      fontWeight: "600",
    },

    feedbackSection: {
      marginBottom: 16,
    },
    feedbackGrid: {
      flexDirection: "row",
      gap: 12,
    },
    feedbackBox: {
      flex: 1,
      borderRadius: 12,
      padding: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
    },
    workingBox: {
      backgroundColor: "#F0F9FF",
      borderColor: "#4CAF50",
    },
    brokenBox: {
      backgroundColor: "#FFF5F5",
      borderColor: "#F44336",
    },
    feedbackEmoji: {
      fontSize: 20,
      marginBottom: 4,
    },
    feedbackCount: {
      fontSize: 18,
      fontWeight: "800",
      color: "#333",
      marginBottom: 2,
    },
    feedbackLabel: {
      fontSize: 11,
      color: "#666",
      fontWeight: "600",
    },

    actionSection: {
      marginBottom: 18,
    },
    voteButtonView: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    voteButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2.5,
      flexDirection: "row",
      gap: 6,
    },
    upvoteButton: {
      backgroundColor: "#E8F5E9",
      borderColor: "#4CAF50",
    },
    downvoteButton: {
      backgroundColor: "#FFEBEE",
      borderColor: "#F44336",
    },
    voteEmoji: {
      fontSize: 18,
    },
    voteButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#333",
    },

    mapsButton: {
      backgroundColor: "#007BFF",
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    mapsButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFF",
    },
  });
}
