import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import React, { useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "./authentication/auth";
import axios from "axios";
import { buildApiUrl } from "@/utils/api";

const about = () => {
  const router = useRouter();
  const { authState } = useAuth();
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const feedbackInputRef = useRef<TextInput>(null);

  const handleSubmitFeedback = async () => {
    const trimmed = feedbackText.trim();

    if (!trimmed) {
      Alert.alert("Empty Feedback", "Please write some feedback before submitting.");
      return;
    }

    if (trimmed.length > 500) {
      Alert.alert("Too Long", "Feedback must be 500 characters or less.");
      return;
    }

    if (!authState?.token) {
      Alert.alert("Authentication Required", "You must be logged in to submit feedback.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await axios.post(
        buildApiUrl("/reviews"),
        { text: trimmed },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      console.log("[FEEDBACK] Submitted successfully:", response.data);
      setSubmitStatus("success");
      setFeedbackText("");
      
      setTimeout(() => {
        setSubmitStatus("idle");
        Alert.alert("Thank You!", "Your feedback has been submitted successfully.");
      }, 1500);
    } catch (error: any) {
      console.error("[FEEDBACK] Error:", error.response?.data || error.message);
      setSubmitStatus("error");
      const errorMessage = error.response?.data?.error || "Failed to submit feedback. Please try again.";
      setErrorMsg(errorMessage);
      
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      style={styles.container}
    >
      <LinearGradient
        colors={["#FEFAE0", "#A4B465"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>About Erforus</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardDescription}>
            This app was created to help fellow cyclists around Copenhagen find
            public bike pumps quickly and easily.
          </Text>
        </View>

        

        <View style={styles.contactCard}>
          <Text style={styles.contactLabel}>Contact Us</Text>
          <Text style={styles.contactEmail}>beniagic@gmail.com</Text>
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>💬 Share Your Feedback</Text>
          <Text style={styles.feedbackSubtitle}>
            Help us improve! Tell us what you think about the app.
          </Text>

          <TextInput
            ref={feedbackInputRef}
            style={[
              styles.feedbackInput,
              submitStatus === "success" && styles.inputSuccess,
              submitStatus === "error" && styles.inputError,
            ]}
            placeholder="Write your feedback here..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
            maxLength={500}
            editable={!isSubmitting}
            value={feedbackText}
            onChangeText={setFeedbackText}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 200);
            }}
          />

          <View style={styles.charCountContainer}>
            <Text style={styles.charCount}>
              {feedbackText.length}/500
            </Text>
          </View>

          {submitStatus === "error" && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>❌ {errorMsg}</Text>
            </View>
          )}

          {submitStatus === "success" && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Feedback submitted!</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitFeedback}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default about;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  backButton: {
    alignSelf: "flex-start",
    top:20,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#626F47",
  },
  header: {
    marginBottom: 32,
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#626F47",
  },
  card: {
    backgroundColor: "#FEFAE0",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#626F47",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#626F47",
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: "#626F47",
    lineHeight: 22,
    fontWeight: "500",
  },
  contactCard: {
    backgroundColor: "#626F47",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  contactLabel: {
    fontSize: 14,
    color: "#FEFAE0",
    fontWeight: "600",
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFCF50",
  },
  feedbackSection: {
    backgroundColor: "#FEFAE0",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#D4C847",
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#626F47",
    marginBottom: 8,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: "#626F47",
    fontWeight: "500",
    marginBottom: 16,
    opacity: 0.8,
  },
  feedbackInput: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D4C847",
    padding: 14,
    fontSize: 14,
    color: "#333",
    textAlignVertical: "top",
    minHeight: 120,
    fontFamily: "System",
  },
  inputSuccess: {
    borderColor: "#4CAF50",
  },
  inputError: {
    borderColor: "#F44336",
  },
  charCountContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#C62828",
    fontSize: 13,
    fontWeight: "600",
  },
  successBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  successText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#626F47",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#626F47",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FEFAE0",
    fontSize: 15,
    fontWeight: "700",
  },
});
