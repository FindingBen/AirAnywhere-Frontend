import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Button,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../authentication/auth";
import React from "react";
import wheelImg from "@/assets/images/bl.jpg";

const index = () => {
  const { authState, onLogout } = useAuth();
  console.log(authState);
  const handleLogout = async () => {
    try {
      await onLogout!(); // Call the logout function
      Alert.alert("Logged Out", "You have been successfully logged out.");
    } catch (error) {
      Alert.alert("Error", "An error occurred while logging out.");
      console.error("Logout error:", error);
    }
  };
  return (
    <View style={styles.container}>
      <ImageBackground
        source={wheelImg}
        resizeMode="cover"
        style={styles.image}
      >
        <Text style={styles.text}>Find me some air</Text>
        <Link style={{ marginHorizontal: "auto" }} href="/map" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Go to Map</Text>
          </Pressable>
        </Link>
        {authState?.authenticated ? (
          <Pressable style={styles.buttonLogOut} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>
        ) : (
          <></>
        )}
      </ImageBackground>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  image: {
    width: "100%",
    height: "100%",
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  link: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    textDecorationLine: "underline",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
  },
  button: {
    height: 45,
    borderRadius: 10,
    borderColor: "white",
    borderWidth: 1,
    backgroundColor: "rgba(4, 118, 208, 0.8)",
    justifyContent: "center",
  },
  buttonLogOut: {
    height: 45,
    marginTop: 5,
    borderRadius: 15,
    backgroundColor: "rgba(29, 76, 116, 1)",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "semibold",
    textAlign: "center",
    padding: 4,
  },
});
