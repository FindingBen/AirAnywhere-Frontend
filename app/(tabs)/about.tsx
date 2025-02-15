import { View, Text, StyleSheet, ImageBackground } from "react-native";
import React from "react";
import aboutImg from "@/assets/images/bl.jpg";
const about = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={aboutImg}
        resizeMode="cover"
        style={styles.image}
      >
        <Text style={styles.text}>Contact us</Text>
        <Text style={styles.description}>
          This app was created with purpose to help find fellow cyklists around
          Copenhagen find a public bike pump. If you have information about possible
          location of public air pump, give us a message!
        </Text>
        <Text style={styles.contact}>beniagic@gmail.com</Text>
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
    marginHorizontal: 20,
    fontWeight: "semibold",
    textAlign: "center",
  },
  contact: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 25,
  },
});
