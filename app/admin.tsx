import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { useAuth } from "./authentication/auth";
import { useMarkers } from "./context/markersContext";
import { buildApiUrl } from "@/utils/api";

type PhotoSubmission = {
  id: string;
  markerId: string;
  pumpName: string;
  contributor: string;
  submittedAt: string;
  imageUrl: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { authState, user } = useAuth();
  const { fetchMarkers } = useMarkers();
  const [submissions, setSubmissions] = useState<PhotoSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [lastAction, setLastAction] = useState("");
  const isAdmin = Boolean(authState?.authenticated && user?.isAdmin);

  useEffect(() => {
    if (authState?.authenticated !== null && !isAdmin) {
      router.replace("/");
    }
  }, [authState?.authenticated, isAdmin, router]);

  const fetchSubmissions = async () => {
    if (!authState?.token) return;

    setIsLoading(true);
    setLoadError("");
    try {
      const response = await axios.get<PhotoSubmission[]>(
        buildApiUrl("/admin/image-submissions"),
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setSubmissions(response.data);
    } catch (error: any) {
      setLoadError(
        error.response?.data?.error || "Unable to load pending photos."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) void fetchSubmissions();
  }, [isAdmin, authState?.token]);

  const reviewSubmission = async (
  submission: PhotoSubmission,
  action: "approved" | "rejected"
) => {
  try {
    await axios.post(
      buildApiUrl(`/admin/image-submissions/${submission.id}/review`),
      { action },
      { headers: { Authorization: `Bearer ${authState?.token}` } }
    );

    setSubmissions((current) =>
      current.filter((item) => item.id !== submission.id)
    );
    setLastAction(`${submission.pumpName} ${action}`);
    if (action === "approved") await fetchMarkers();
  } catch (error: any) {
    Alert.alert(
      "Review failed",
      error.response?.data?.error || "Please try again."
    );
  }
};

  if (authState?.authenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#626F47" />
      </View>
    );
  }

  if (!isAdmin) return null;

  return (
    <LinearGradient
      colors={["#FEFAE0", "#A4B465"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/")}
          accessibilityRole="button"
          accessibilityLabel="Return to map"
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#626F47" />
          <Text style={styles.backButtonText}>Map</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="shield-check" size={28} color="#FEFAE0" />
          </View>
          <Text style={styles.title}>Admin dashboard</Text>
          <Text style={styles.subtitle}>Review community pump photos</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{submissions.length}</Text>
            <Text style={styles.summaryLabel}>Awaiting review</Text>
          </View>
          <View style={styles.summaryCard}>
            <TouchableOpacity
              onPress={fetchSubmissions}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Refresh pending photos"
            >
              {isLoading ? (
                <ActivityIndicator color="#626F47" />
              ) : (
                <MaterialCommunityIcons name="refresh" size={26} color="#626F47" />
              )}
            </TouchableOpacity>
            <Text style={styles.summaryLabel}>Refresh queue</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending photos</Text>
          <Text style={styles.sectionCount}>{submissions.length}</Text>
        </View>

        {lastAction ? <Text style={styles.actionNotice}>{lastAction}</Text> : null}

        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#626F47" />
            <Text style={styles.emptyText}>Loading pending photos</Text>
          </View>
        ) : loadError ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="alert-circle-outline" size={34} color="#A33D35" />
            <Text style={styles.emptyTitle}>Could not load submissions</Text>
            <Text style={styles.emptyText}>{loadError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchSubmissions}>
              <MaterialCommunityIcons name="refresh" size={17} color="#FFFFFF" />
              <Text style={styles.approveText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : submissions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="image-multiple-outline" size={34} color="#87916A" />
            <Text style={styles.emptyTitle}>No pending photos</Text>
          </View>
        ) : (
          <View style={styles.submissionList}>
            {submissions.map((submission) => (
              <View key={submission.id} style={styles.submissionCard}>
                <Image source={{ uri: submission.imageUrl }} style={styles.submissionImage} resizeMode="cover" />
                <View style={styles.submissionDetails}>
                  <Text style={styles.pumpName} numberOfLines={1}>{submission.pumpName}</Text>
                  <Text style={styles.contributor}>By {submission.contributor}</Text>
                  <Text style={styles.submittedLabel}>
                    {new Date(submission.submittedAt).toLocaleString()}
                  </Text>
                  <View style={styles.reviewActions}>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => reviewSubmission(submission, "approved")}
                      accessibilityRole="button"
                      accessibilityLabel={`Approve ${submission.pumpName} photo`}
                    >
                      <MaterialCommunityIcons name="check" size={17} color="#FFFFFF" />
                      <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => reviewSubmission(submission, "rejected")}
                      accessibilityRole="button"
                      accessibilityLabel={`Reject ${submission.pumpName} photo`}
                    >
                      <MaterialCommunityIcons name="close" size={17} color="#A33D35" />
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FEFAE0" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  backButton: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, marginBottom: 18, marginTop: 34 },
  backButtonText: { color: "#626F47", fontSize: 16, fontWeight: "600" },
  header: { alignItems: "center", marginBottom: 22 },
  headerIcon: { width: 54, height: 54, borderRadius: 16, backgroundColor: "#626F47", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  title: { color: "#3F4A2D", fontSize: 28, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#626F47", fontSize: 14, marginTop: 5 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 26 },
  summaryCard: { flex: 1, minHeight: 88, backgroundColor: "#FEFAE0", borderRadius: 12, padding: 14, justifyContent: "center", alignItems: "center", gap: 5, borderWidth: 1, borderColor: "rgba(98, 111, 71, 0.15)" },
  summaryValue: { color: "#3F4A2D", fontSize: 25, fontWeight: "800" },
  summaryLabel: { color: "#626F47", fontSize: 12, fontWeight: "600", textAlign: "center" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { color: "#3F4A2D", fontSize: 19, fontWeight: "800" },
  sectionCount: { color: "#FEFAE0", backgroundColor: "#626F47", borderRadius: 12, minWidth: 26, textAlign: "center", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 3, fontSize: 12, fontWeight: "700" },
  actionNotice: { color: "#3F4A2D", fontSize: 12, marginBottom: 10, fontWeight: "600" },
  submissionList: { gap: 12 },
  submissionCard: { flexDirection: "row", gap: 12, backgroundColor: "#FEFAE0", borderRadius: 12, padding: 11, borderWidth: 1, borderColor: "rgba(98, 111, 71, 0.16)" },
  submissionImage: { width: 100, height: 118, borderRadius: 8, backgroundColor: "#E8E8D9" },
  submissionDetails: { flex: 1, justifyContent: "center", minWidth: 0 },
  pumpName: { color: "#3F4A2D", fontSize: 16, fontWeight: "800" },
  contributor: { color: "#626F47", fontSize: 12, marginTop: 5 },
  submittedLabel: { color: "#81866E", fontSize: 11, marginTop: 3 },
  reviewActions: { flexDirection: "row", gap: 8, marginTop: 13 },
  approveButton: { flex: 1, minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "#626F47", borderRadius: 8, paddingHorizontal: 7 },
  retryButton: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#626F47", borderRadius: 8, paddingHorizontal: 14, marginTop: 8 },
  approveText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  rejectButton: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "#F7E8E2", borderRadius: 8, paddingHorizontal: 9 },
  rejectText: { color: "#A33D35", fontSize: 12, fontWeight: "700" },
  emptyState: { minHeight: 190, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(254, 250, 224, 0.72)", borderRadius: 12, gap: 8, padding: 20 },
  emptyTitle: { color: "#3F4A2D", fontSize: 17, fontWeight: "700" },
  emptyText: { color: "#626F47", fontSize: 13, textAlign: "center" },
});
