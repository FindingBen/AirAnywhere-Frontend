import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React from "react";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";

const PumpModalView = ({ pump, onSelectMarker }) => {
  const copyToClipboard = (latitude: number, longitude: number) => {
    const coordinates = `${latitude}, ${longitude}`;
    Clipboard.setStringAsync(coordinates);
    console.log("AAAA");
    Alert.alert("Copied to Clipboard", `Coordinates: ${coordinates}`);
  };

  const openInGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open Google Maps.")
    );
  };

  const styles = createStyles(pump?.status);
  return (
    <View style={styles.card}>
      <TouchableOpacity
        hitSlop={{ top: 30, bottom: 30, left: 30, right: 50 }}
        style={styles.xButton}
        onPress={() => onSelectMarker(null)}
      >
        <Text style={styles.xButtonText}>X</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{pump?.name}</Text>
      <Text style={styles.description}>{pump?.status}</Text>
      <View style={styles.buttonView}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => copyToClipboard(pump?.latitude, pump?.longitude)}
        >
          <Text style={styles.buttonText}>Copy Coordinates</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => openInGoogleMaps(pump.latitude, pump.longitude)}
        >
          <Text style={styles.buttonText}>Open in Google Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PumpModalView;

function createStyles(status: string) {
  return StyleSheet.create({
    card: {
      backgroundColor: "white",
      position: "absolute",
      bottom: 50,
      left: 30,
      padding: 10,
      width: "85%",
      height: "25%",
      borderRadius: 20,
    },
    title: {
      fontWeight: "semibold",
      fontSize: 20,
    },
    description: {
      fontSize: 15,
      color: status != "Works" ? "#b42324" : "#00FF00",
      marginTop: 5,
    },
    buttonView: {
      flex: 1,
      flexDirection: "column",
      position: "absolute",
      bottom: 10,
      left: 75,
      gap: 10,
    },
    button: {
      borderRadius: 15,
      justifyContent: "center",
      color: "gray",
      borderColor: "gray",
      borderWidth: 1,
    },
    buttonText: {
      color: "black",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
      padding: 4,
    },
    xButton: {
      backgroundColor: "#808080",
      position: "absolute",
      right: 12,
      top: 5,
      borderRadius: 15,
      alignItems: "center",
      width: 25,
      height: 25,
    },
    xButtonText: {
      fontWeight: "bold",
      padding: 5,
      color: "white",
    },
  });
}
