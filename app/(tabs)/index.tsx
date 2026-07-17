import React, { useEffect, useState } from "react";
import MapView from "react-native-maps";
import { StyleSheet, View, ActivityIndicator } from "react-native";

import CustomMarker from "@/components/CustomMarker";
import PumpModalView from "@/components/PumpModalView";
import AccountDropdown from "@/components/AccountDropdown";
import { useMarkers } from "../context/markersContext";

type MarkerData = {
  _id: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string;
};

export default function App() {
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const { markers, isLoading } = useMarkers(); // Get markers from context

  // ✅ Initialize AdMob once
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => console.log("✅ AdMob initialized"));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <AccountDropdown />
      </View>
      {isLoading ? (
        <View>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <MapView
          style={styles.map}
          showsUserLocation
          mapType="standard"
          loadingEnabled={true}
          key={"map-instance"}
          initialRegion={{
            latitude: 55.6761,
            longitude: 12.5683,
            latitudeDelta: 0.2722,
            longitudeDelta: 0.1221,
          }}
        >
          {markers?.map((marker, index) => (
            <CustomMarker
              pumps={marker}
              key={index}
              onSelectMarker={setSelectedMarker}
            />
          ))}
        </MapView>
      )}

      {selectedMarker && (
        <PumpModalView
          pump={selectedMarker}
          onSelectMarker={setSelectedMarker}
        />
      )}

      {/* ✅ Banner Ad Section */}
      <View style={styles.bannerContainer}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.BANNER}
          onAdLoaded={() => console.log("✅ Banner ad loaded")}
          onAdFailedToLoad={(error) =>
            console.log("❌ Banner ad failed:", error)
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: "absolute",
    top: 50,
    right: 16,
    zIndex: 100,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  bannerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 4,
  },
});
