import { View, Text, StyleSheet, ImageBackground } from "react-native";
import React from "react";
import aboutImg from "@/assets/images/cikles.jpg";
const about = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={aboutImg}
        resizeMode="cover"
        style={styles.image}
      >
        <Text style={styles.text}>About this app</Text>
        <Text style={styles.description}>
          This app was created with purpose to help find fellow cyklists around
          Copenhagen a public bike pump. If you have information about possible
          location of public air pump, give us a message!
        </Text>
      </ImageBackground>
    </View>
  );
};

export default about;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
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
  },
  description: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
