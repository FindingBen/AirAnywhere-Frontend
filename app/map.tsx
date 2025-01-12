import React, { useState } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import {
  StyleSheet,
  View,
  Platform,
  Text,
  Button,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";

import markers from "@/constants/Markers";

type MarkerData = {
  name: string;
  status: string;
  latitude: number;
  longitude: number;
};
//55.70841663961272, 12.590810764204106
export default function App() {
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

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

  return (
    <View style={styles.container}>
      <MapView style={styles.map} showsUserLocation>
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            onPress={() => setSelectedMarker(marker)}
          />
        ))}
      </MapView>
      {selectedMarker && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedMarker}
          onRequestClose={() => setSelectedMarker(null)}
        >
          <View style={styles.modal}>
            <Text style={styles.title}>{selectedMarker.name}</Text>
            <Text style={styles.coordinates}>{selectedMarker.status}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                copyToClipboard(
                  selectedMarker.latitude,
                  selectedMarker.longitude
                )
              }
            >
              <Text style={styles.buttonText}>Copy Coordinates</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                openInGoogleMaps(
                  selectedMarker.latitude,
                  selectedMarker.longitude
                )
              }
            >
              <Text style={styles.buttonText}>Open in Google Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedMarker(null)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  coordinates: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
