import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import axios from "axios";
import { useAuth } from "../app/authentication/auth";
import { useMarkers } from "../app/context/markersContext";

const PumpModalView = ({ pump, onSelectMarker }) => {
  const { authState } = useAuth();
  const { fetchMarkers } = useMarkers();
  const [votingLoading, setVotingLoading] = useState(false);
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
        `${process.env.EXPO_PUBLIC_API_URL}/vote`,
        voteData
      );

      // Update pump counts locally for immediate UI feedback
      const updatedPump = {
        ...pump,
        positive: pump.positive + (voteType === "upvote" ? 1 : 0),
        negative: pump.negative + (voteType === "downvote" ? 1 : 0),
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
        <Text style={styles.xButtonText}>X</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{pump?.name}</Text>
      <Text style={styles.ratingLabel}>Other cyclists' rating for this pump</Text>
      <View style={styles.ratingView}>
        <View style={styles.ratingItem}>
          <Text style={styles.arrowUp}>▲</Text>
          <Text style={styles.ratingValue}>{pump?.positive || 0}</Text>
          <Text style={styles.arrowLabel}>Working</Text>
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.arrowDown}>▼</Text>
          <Text style={styles.ratingValue}>{pump?.negative || 0}</Text>
          <Text style={styles.arrowLabel}>Broken</Text>
        </View>
      </View>
      {/* <Text style={styles.description}>{pump?.status}</Text> */}
      <View style={styles.buttonView}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => copyToClipboard(pump?.latitude, pump?.longitude)}
        >
          <Text style={styles.buttonText}>Copy Coordinates</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => openInGoogleMaps(pump.latitude, pump.longitude)}
        >
          <Text style={styles.buttonText}>Open in Google Maps</Text>
        </TouchableOpacity>
      </View>
      {authState?.authenticated && (
        <View style={styles.voteButtonView}>
          <TouchableOpacity
            style={[styles.voteButton, styles.upvoteButton]}
            onPress={() => handleVote("upvote")}
            disabled={votingLoading}
          >
            <Text style={styles.voteButtonText}>👍 Works</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.voteButton, styles.downvoteButton]}
            onPress={() => handleVote("downvote")}
            disabled={votingLoading}
          >
            <Text style={styles.voteButtonText}>🔧 Broken</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PumpModalView;

function createStyles(status: string) {
  return StyleSheet.create({
    card: {
      backgroundColor: "#FEFAE0",
      position: "absolute",
      bottom: 50,
      left: 30,
      padding: 16,
      width: "85%",
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    title: {
      fontWeight: "700",
      fontSize: 22,
      color: "#626F47",
      marginBottom: 8,
    },
    ratingLabel: {
      fontSize: 12,
      color: "#A4B465",
      fontWeight: "500",
      marginBottom: 8,
      textAlign: "left",
    },
    ratingView: {
      flexDirection: "row",
      justifyContent: "flex-start",
      gap: 24,
      marginBottom: 12,
    },
    ratingItem: {
      alignItems: "center",
      gap: 4,
    },
    arrowUp: {
      fontSize: 16,
      color: "#4CAF50",
      fontWeight: "600",
    },
    arrowDown: {
      fontSize: 16,
      color: "#F44336",
      fontWeight: "600",
    },
    ratingValue: {
      fontSize: 13,
      color: "#626F47",
      fontWeight: "600",
    },
    arrowLabel: {
      fontSize: 11,
      color: "#626F47",
      fontWeight: "500",
    },
    description: {
      fontSize: 15,
      color: status === "Works" ? "#FFCF50" : "#A4B465",
      marginTop: 5,
      fontWeight: "600",
    },
    buttonView: {
      flexDirection: "row",
      marginTop: 16,
      gap: 10,
    },
    button: {
      flex: 1,
      borderRadius: 12,
      justifyContent: "center",
      borderColor: "#626F47",
      borderWidth: 2,
      paddingVertical: 12,
    },
    buttonText: {
      color: "#626F47",
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
    },
    voteButtonView: {
      flexDirection: "row",
      marginTop: 12,
      gap: 10,
    },
    voteButton: {
      flex: 1,
      borderRadius: 12,
      justifyContent: "center",
      paddingVertical: 10,
      borderWidth: 2,
    },
    upvoteButton: {
      backgroundColor: "#E8F5E9",
      borderColor: "#4CAF50",
    },
    downvoteButton: {
      backgroundColor: "#FFEBEE",
      borderColor: "#F44336",
    },
    voteButtonText: {
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
    },
    xButton: {
      backgroundColor: "#626F47",
      position: "absolute",
      right: 12,
      top: 12,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
    },
    xButtonText: {
      fontWeight: "700",
      fontSize: 16,
      color: "#FEFAE0",
    },
  });
}
