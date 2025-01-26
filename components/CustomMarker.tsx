import { View, Text, StyleSheet } from "react-native";
import React from "react";
import wheel from "@/assets/images/wheel.jpg";
import { Marker } from "react-native-maps";

const CustomMarker = ({ pumps, onSelectMarker }) => {
  console.log("SDDDA", pumps.latitude);
  return (
    <Marker
      key={pumps?._id}
      //tracksViewChanges={false}
      coordinate={{
        latitude: pumps?.latitude,
        longitude: pumps?.longitude,
      }}
      onPress={() => onSelectMarker(pumps)}
    >
      <View style={styles.markerView}>
        <Text style={styles.markerText}>{pumps?.name}</Text>
      </View>
    </Marker>
  );
};

export default CustomMarker;

const styles = StyleSheet.create({
  markerView: {
    backgroundColor: "white",
    padding: 3,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 25,
  },
  markerText: {
    fontWeight: "semibold",
  },
});
