import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const about = () => {
  const router = useRouter();

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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get Involved</Text>
          <Text style={styles.cardDescription}>
            Know a pump location we're missing? Have suggestions? We'd love to
            hear from you!
          </Text>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactLabel}>Contact Us</Text>
          <Text style={styles.contactEmail}>beniagic@gmail.com</Text>
        </View>
      </ScrollView>
    </LinearGradient>
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
});
