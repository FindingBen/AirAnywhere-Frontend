import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import { Marker } from "react-native-maps";

const CustomMarker = ({ pumps, onSelectMarker }) => {
  const latitude = Number(pumps?.latitude);
  const longitude = Number(pumps?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return (
    <Marker
      key={pumps?._id}
      //tracksViewChanges={false}
      coordinate={{
        latitude,
        longitude,
      }}
      onPress={() => onSelectMarker(pumps)}
    >
      <View style={styles.markerView}>
        <Image
          source={require("@/assets/images/room.png")}
          style={styles.markerText}
        ></Image>
      </View>
    </Marker>
  );
};

export default CustomMarker;

const styles = StyleSheet.create({
  markerView: {
    backgroundColor: "white",
    padding: 3,
    borderWidth: 2,
    borderColor: "#626F47",
    borderRadius: 25,
    shadowColor: "#626F47",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  markerText: {
    height: 25,
    width: 25,
  },
});
