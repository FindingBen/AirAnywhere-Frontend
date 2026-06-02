import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "./authentication/auth";
import { LinearGradient } from "expo-linear-gradient";
import { TextInput } from "react-native-gesture-handler";
import { useRouter } from "expo-router";

const signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { onRegister } = useAuth();
  const router = useRouter();

  const handleBackPress = () => {
    router.replace("/");
  };

  const handleSignup = async () => {
    console.log("[SIGNUP] Form submission started");
    console.log("[SIGNUP] Email:", email);
    console.log("[SIGNUP] Password length:", password.length);
    console.log("[SIGNUP] Confirm password length:", confirmPassword.length);

    if (!email || !password || !confirmPassword) {
      console.log("[SIGNUP] Validation failed: Missing fields");
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      console.log("[SIGNUP] Validation failed: Passwords do not match");
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      console.log("[SIGNUP] Validation failed: Password too short");
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    console.log("[SIGNUP] All validations passed, calling onRegister");
    setLoading(true);
    const response = await onRegister!(email, password,username);
    console.log("[SIGNUP] Registration response:", response);

    if (response && response.error) {
      console.log("[SIGNUP] Registration error:", response.msg);
      Alert.alert("Error", response.msg?.error || response.msg || "Registration failed");
    } else {
      console.log("[SIGNUP] Registration successful");
      Alert.alert("Success", "Account created! Please log in.");
      router.back();
    }
    setLoading(false);
  };

  return (
    <GestureHandlerRootView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <LinearGradient
            colors={["#FEFAE0", "#A4B465"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
          >
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBackPress}>
                <Text style={styles.backButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join the community</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#A4B465"
                onChangeText={(text: string) => setEmail(text)}
                value={email}
                editable={!loading}
                keyboardType="email-address"
              />
              <TextInput
                              style={styles.input}
                              placeholder="Username"
                              placeholderTextColor="#A4B465"
                              onChangeText={(text: string) => setUsername(text)}
                              value={username}
                              editable={!loading}
                              keyboardType="default"
                            />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A4B465"
                secureTextEntry={true}
                onChangeText={(text: string) => setPassword(text)}
                value={password}
                editable={!loading}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#A4B465"
                secureTextEntry={true}
                onChangeText={(text: string) => setConfirmPassword(text)}
                value={confirmPassword}
                editable={!loading}
              />

              <TouchableOpacity
                onPress={handleSignup}
                style={[styles.button, styles.signupButton]}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Creating..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

export default signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#626F47",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#626F47",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#626F47",
    fontWeight: "500",
  },
  form: {
    gap: 16,
  },
  input: {
    height: 50,
    borderWidth: 0,
    borderRadius: 12,
    backgroundColor: "#FEFAE0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#626F47",
    fontWeight: "500",
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signupButton: {
    backgroundColor: "#626F47",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FEFAE0",
  },
});
