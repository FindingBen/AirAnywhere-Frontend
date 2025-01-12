import {
  View,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
  ScrollView,
  FlatList,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { MENU_ITEMS } from "@/constants/MenuItems";
import React, { useEffect, useState } from "react";
import axios from "axios";

type MarkerData = {
  id: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
};

export default function PumpScreen() {
  const colorScheme = useColorScheme();
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === "web" ? ScrollView : SafeAreaView;

  useEffect(() => {
    getMarkers();
  }, []);

  const getMarkers = async () => {
    try {
      let response = await axios.get("http://192.168.1.105:5000/markers");
      if (response.status === 200) {
        setMarkers(response.data);
      }
    } catch (error) {}
  };
  console.log(markers);
  return (
    <Container style={styles.contentContainer}>
      <FlatList
        data={markers}
        ListEmptyComponent={<Text>No items..</Text>}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text>{item.name}</Text>

              <Text>{item.status}</Text>
            </View>
          </View>
        )}
      ></FlatList>
    </Container>
  );
}

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    contentContainer: {
      flex: 1,
      backgroundColor: "#000", // Light background
      padding: 10,
    },
    card: {
      backgroundColor: "white",
      borderRadius: 10,
      marginHorizontal: 24,
      padding: 15,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      elevation: 3, // For Android shadow
    },
    separator: {
      height: 1,
      backgroundColor: colorScheme === "dark" ? "papayawhip" : "#000",
      width: "50%",
      maxWidth: 300,
      marginHorizontal: "auto",
      marginBottom: 10,
    },
  });
}
