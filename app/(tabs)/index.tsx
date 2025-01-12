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
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import React from "react";
import wheelImg from "@/assets/images/copenhagen.jpg";

const index = () => {
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
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    padding: 4,
  },
});
