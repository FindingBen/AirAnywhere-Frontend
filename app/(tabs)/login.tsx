import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Button,
  Alert,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "../authentication/auth";
import { LinearGradient } from "expo-linear-gradient";
import { TextInput } from "react-native-gesture-handler";
import wheel from "@/assets/images/wheel.jpg";
import bg from "@/assets/images/bl.jpg";

const login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { onLogin, onRegister } = useAuth();

  const login = async () => {
    const response = await onLogin!(email, password);

    console.log("AA", response);
    if (response && response.error) {
      Alert.alert(response.msg["error"]);
    }
  };

  const register = async () => {
    const response = await onRegister!(email, password);
    console.log("DASD", response);
    if (response && response.error) {
      Alert.alert(response.msg["error"]);
    }
  };
  return (
    <GestureHandlerRootView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ImageBackground source={bg} resizeMode="cover" style={styles.bImage}>
            <View style={styles.form}>
              <Image
                source={{
                  uri: "https://www.svgrepo.com/show/198286/wheel.svg",
                }}
                style={styles.image}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={(text: string) => setEmail(text)}
                value={email}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={true}
                onChangeText={(text: string) => setPassword(text)}
                value={password}
              />

              <TouchableOpacity onPress={login} style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={register}
                style={styles.registerButton}
              >
                <Text style={styles.loginButtonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
};

export default login;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    flexDirection: "column",
    textAlign: "center",
    width: "100%",
  },
  form: {
    gap: 10,
    width: "60%",
    textAlign: "center",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 4,
    color: "gray",
    padding: 10,
    borderColor: "white",
  },
  image: {
    width: "50%",
    height: "50%",
    resizeMode: "contain",
  },
  bImage: {
    width: "100%",
    height: "100%",
    flex: 1,
    resizeMode: "cover",
    alignItems: "center",
  },
  loginButton: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "white",
    padding: 6,
    marginTop: 4,
    alignItems: "center",
    backgroundColor: "rgba(4, 118, 208, 0.8)",
  },
  registerButton: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "white",
    padding: 6,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 18,
    color: "white",
  },
  gradient: {
    padding: 10,
    width: 100,
    borderRadius: 20,
    borderColor: "white",
    justifyContent: "center",
  },
});
