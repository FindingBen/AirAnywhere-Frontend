import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import React, { useState } from "react";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
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
  address?: string;
  positive?: number;
  negative?: number;
  imageUrl?: string | null;
  imageUpdatedAt?: string | null;
};

type PumpModalViewProps = {
  pump: PumpData;
  onSelectMarker: (marker: PumpData | null) => void;
};

const PumpModalView = ({ pump, onSelectMarker }: PumpModalViewProps) => {
  const { authState } = useAuth();
  const { fetchMarkers } = useMarkers();
  const [votingLoading, setVotingLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const canUploadImage = Boolean(
    authState?.authenticated && !authState?.isAnonymous
  );
  
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

  const uploadPumpImage = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!canUploadImage || !authState?.token) {
      Alert.alert("Authentication Required", "Please login to add a pump photo.");
      return;
    }

    setImageLoading(true);
    try {
      const fileType = asset.mimeType?.toLowerCase() || "image/jpeg";
      if (!["image/jpeg", "image/png", "image/webp"].includes(fileType)) {
        throw new Error("Choose a JPEG, PNG, or WebP image.");
      }

      const imageResponse = await fetch(asset.uri);
      if (!imageResponse.ok) {
        throw new Error("Could not read the selected image.");
      }
      const imageBlob = await imageResponse.blob();

      const response = await axios.post(
        buildApiUrl(`/markers/${encodeURIComponent(pump._id)}/image-submissions`),
        imageBlob,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
            "Content-Type": fileType,
          },
          transformRequest: [(data) => data],
        }
      );

      Alert.alert(
        "Photo submitted",
        response.data?.message || "Your photo is waiting for admin approval."
      );
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Please try again.";
      Alert.alert("Photo Upload Failed", message);
    } finally {
      setImageLoading(false);
    }
  };

  const choosePumpImage = async (source: "camera" | "library") => {
    if (!canUploadImage) {
      Alert.alert("Authentication Required", "Please login to add a pump photo.");
      return;
    }

    try {
      if (Platform.OS !== "web") {
        const permission =
          source === "camera"
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission Needed",
            source === "camera"
              ? "Allow camera access to take a pump photo."
              : "Allow photo library access to choose a pump photo."
          );
          return;
        }
      }

      const options = {
        mediaTypes: ["images"] as ImagePicker.MediaType[],
        allowsEditing: true,
        aspect: [4, 3] as [number, number],
        quality: 0.8,
      };
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        await uploadPumpImage(result.assets[0]);
      }
    } catch (error: any) {
      Alert.alert(
        "Unable to Select Photo",
        error.message || "Please try again."
      );
    }
  };

  const imageDate = pump.imageUpdatedAt
    ? new Date(pump.imageUpdatedAt)
    : null;
  const imageDateLabel =
    imageDate && Number.isFinite(imageDate.getTime())
      ? `Updated ${imageDate.toLocaleDateString()}`
      : "No photo yet";


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

      {/* Location and pump photo */}
      <View style={styles.locationPhotoRow}>
        <View style={[styles.coordinatesSection, styles.locationColumn]}>
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

        <View style={styles.photoColumn}>
          <TouchableOpacity
            style={styles.photoFrame}
            onPress={() =>
              pump.imageUrl
                ? setPhotoViewerVisible(true)
                : choosePumpImage("camera")
            }
            disabled={imageLoading}
            accessibilityRole="button"
            accessibilityLabel={
              canUploadImage
                ? pump.imageUrl
                  ? "View pump photo"
                  : "Take pump photo"
                : "Pump photo"
            }
          >
            {pump.imageUrl ? (
              <Image
                source={{
                  uri: /^https?:\/\//i.test(pump.imageUrl)
                    ? pump.imageUrl
                    : buildApiUrl(pump.imageUrl),
                }}
                style={styles.pumpImage}
                resizeMode="cover"
                accessibilityLabel={`${pump.name} photo`}
              />
            ) : (
              <View style={styles.emptyPhoto}>
                <Text style={styles.emptyPhotoIcon}>▧</Text>
                <Text style={styles.emptyPhotoText}>
                  {canUploadImage ? "Tap to add photo" : "Pump photo"}
                </Text>
              </View>
            )}
            {imageLoading && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.imageDate} numberOfLines={1}>
            {imageDateLabel}
          </Text>
          {canUploadImage && (
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.photoActionButton}
                onPress={() => choosePumpImage("camera")}
                disabled={imageLoading}
                accessibilityLabel="Take an updated pump photo for review"
              >
                <Text style={styles.photoActionText}>Update</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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

      <Modal
        visible={photoViewerVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPhotoViewerVisible(false)}
      >
        <View style={styles.photoViewer}>
          <TouchableOpacity
            style={styles.photoViewerClose}
            onPress={() => setPhotoViewerVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close photo"
          >
            <Text style={styles.photoViewerCloseText}>✕</Text>
          </TouchableOpacity>
          {pump.imageUrl && (
            <Image
              source={{
                uri: /^https?:\/\//i.test(pump.imageUrl)
                  ? pump.imageUrl
                  : buildApiUrl(pump.imageUrl),
              }}
              style={styles.photoViewerImage}
              resizeMode="contain"
              accessibilityLabel={`${pump.name} photo enlarged`}
            />
          )}
          <Text style={styles.photoViewerCaption}>{pump.name}</Text>
        </View>
      </Modal>
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
    locationPhotoRow: {
      flexDirection: "row",
      alignItems: "stretch",
      gap: 10,
      marginBottom: 12,
    },
    locationColumn: {
      flex: 1,
      minWidth: 0,
      marginBottom: 0,
    },
    photoColumn: {
      width: 132,
    },
    photoViewer: {
      flex: 1,
      backgroundColor: "rgba(14, 18, 16, 0.96)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 54,
    },
    photoViewerImage: {
      width: "100%",
      height: "100%",
    },
    photoViewerClose: {
      position: "absolute",
      top: 48,
      right: 20,
      zIndex: 1,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255, 255, 255, 0.16)",
      alignItems: "center",
      justifyContent: "center",
    },
    photoViewerCloseText: {
      color: "#FFFFFF",
      fontSize: 19,
      fontWeight: "700",
    },
    photoViewerCaption: {
      position: "absolute",
      bottom: 22,
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
    photoFrame: {
      height: 94,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "#E9F0EE",
    },
    pumpImage: {
      width: "100%",
      height: "100%",
    },
    emptyPhoto: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    emptyPhotoIcon: {
      fontSize: 24,
      color: "#57766D",
    },
    emptyPhotoText: {
      fontSize: 11,
      color: "#57766D",
      fontWeight: "600",
    },
    imageLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    imageDate: {
      color: "#6D7774",
      fontSize: 10,
      marginTop: 5,
      textAlign: "center",
    },
    photoActions: {
      marginTop: 5,
    },
    photoActionButton: {
      flex: 1,
      backgroundColor: "#E8F2EF",
      borderRadius: 7,
      paddingVertical: 6,
      alignItems: "center",
    },
    photoActionText: {
      color: "#245C4D",
      fontSize: 10,
      fontWeight: "700",
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
