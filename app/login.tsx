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

const login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { onLogin } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    const response = await onLogin!(email, password);

    if (response && response.error) {
      Alert.alert("Error", response.msg?.error || "Login failed");
    } else {
      Alert.alert("Success", "Logged in successfully");
      router.replace("/");
    }
    setLoading(false);
  };

  const handleCreateAccount = () => {
    router.push("/signup");
  };

  const handleBackPress = () => {
    router.replace("/");
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
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <View style={styles.header}>
                <Text style={styles.title}>Erforus</Text>
                <Text style={styles.subtitle}>Find Your Pump</Text>
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
                  placeholder="Password"
                  placeholderTextColor="#A4B465"
                  secureTextEntry={true}
                  onChangeText={(text: string) => setPassword(text)}
                  value={password}
                  editable={!loading}
                />

                <TouchableOpacity
                  onPress={handleLogin}
                  style={[styles.button, styles.loginButton]}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Logging in..." : "Login"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateAccount}
                  style={[styles.button, styles.registerButton]}
                >
                  <Text style={styles.registerButtonText}>
                    Create Account
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

export default login;

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
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#626F47",
  },
  title: {
    fontSize: 36,
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
  loginButton: {
    backgroundColor: "#626F47",
  },
  registerButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#626F47",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FEFAE0",
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#626F47",
  },
});
