import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import { Marker } from "react-native-maps";

const CustomMarker = ({ pumps, onSelectMarker }) => {
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
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 25,
  },
  markerText: {
    height: 25,
    width: 25,
  },
});
