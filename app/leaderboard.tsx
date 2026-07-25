import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { buildApiUrl } from "@/utils/api";

type User = {
  rank: number;
  username: string;
  contributionScore: number;
};

type ApiUser = {
  username: string;
  contributionPoints: number;
};

const leaderboard = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const url = buildApiUrl("/users");
      console.log("Fetching leaderboard from:", url);
      
      const response = await axios.get(url);
      const apiUsers = response.data as ApiUser[];

      // Sort by contributionPoints descending and add rank
      const sortedUsers = apiUsers
        .sort(
          (a: ApiUser, b: ApiUser) => b.contributionPoints - a.contributionPoints
        )
        .slice(0, 5) // Top 5
        .map((user: ApiUser, index: number) => ({
          rank: index + 1,
          username: user.username,
          contributionScore: user.contributionPoints,
        }));

      setUsers(sortedUsers);
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error.message);
      console.error("Error response:", error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };
  console.log(users)
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return "#626F47"; // Default
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "medal";
      case 2:
        return "medal";
      case 3:
        return "medal";
      default:
        return "circle";
    }
  };

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

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#626F47" />
          </View>
        ) : (
          <>
            <View style={styles.header}>
          <MaterialCommunityIcons
            name="trophy"
            size={40}
            color="#626F47"
            style={styles.trophyIcon}
          />
          <Text style={styles.title}>Contribution Score</Text>
          <Text style={styles.subtitle}>
            Top contributors helping cyclists across Copenhagen
          </Text>
        </View>

        <View style={styles.leaderboardContainer}>
          {users.map((user) => (
            <View key={user.rank} style={styles.rankCard}>
              <View style={styles.rankContent}>
                <MaterialCommunityIcons
                  name={getMedalIcon(user.rank)}
                  size={32}
                  color={getMedalColor(user.rank)}
                  style={styles.medalIcon}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.rank}>#{user.rank}</Text>
                  <Text style={styles.username}>{user.username}</Text>
                </View>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.score}>{user.contributionScore}</Text>
                <Text style={styles.scoreLabel}>pts</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to Earn Points</Text>
          <Text style={styles.infoText}>
            👍 <Text style={styles.bold}>+10 points</Text> for voting a pump works or if it doesn't
          </Text>
          <Text style={styles.infoText}>
            🔧 <Text style={styles.bold}>+15 points</Text> for reporting a pump broken and sending an email to us about it.
          </Text>
          <Text style={styles.infoText}>
            Keep contributing to help the cycling community!
          </Text>
        </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default leaderboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 14,
    top:40,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#626F47",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 8,
  },
  trophyIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#626F47",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#626F47",
    fontWeight: "500",
    textAlign: "center",
  },
  leaderboardContainer: {
    marginBottom: 24,
    gap: 12,
  },
  rankCard: {
    backgroundColor: "#FEFAE0",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#626F47",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#A4B465",
  },
  rankContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  medalIcon: {
    marginRight: 4,
  },
  userInfo: {
    flex: 1,
  },
  rank: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A4B465",
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    color: "#626F47",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  score: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFCF50",
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#626F47",
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: "#626F47",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FEFAE0",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: "#FEFAE0",
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: "700",
  },
});
