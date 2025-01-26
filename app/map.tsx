import React, { useEffect, useState } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import {
  StyleSheet,
  View,
  Platform,
  Text,
  Button,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetch } from "expo/fetch";
import CustomMarker from "@/components/CustomMarker";
import PumpModalView from "@/components/PumpModalView";

import markers from "@/constants/Markers";
import axios from "axios";

type MarkerData = {
  _id: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string;
};
//55.70841663961272, 12.590810764204106
export default function App() {
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  //const [markers, setMarkerData] = useState([]);

  // useEffect(() => {
  //   getMarkers();
  //   return () => {};
  // }, []);
  // const getMarkers = async () => {
  //   try {
  //     let response = await axios.get("http://192.168.1.105:5000/markers");
  //     console.log("DD");

  //     if (response.status === 200) {
  //       console.log("DDDDDS");
  //       setMarkerData(response.data);
  //     }
  //   } catch (error) {}
  // };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} showsUserLocation key={"map-instance"}>
        {markers?.map((marker, index) => {
          return (
            <CustomMarker
              pumps={marker}
              key={index}
              onSelectMarker={setSelectedMarker}
            />
          );
        })}
      </MapView>

      {selectedMarker && (
        <PumpModalView
          pump={selectedMarker}
          onSelectMarker={setSelectedMarker}
        />
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
  // markerView: {
  //   backgroundColor: "white",
  //   padding: 3,
  //   borderWidth: 1,
  //   borderColor: "gray",
  //   borderRadius: 25,
  // },
  // markerText: {
  //   fontWeight: "semibold",
  // },
});
