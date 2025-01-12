import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

type PumpData = {
  name: string;
  status: string;
  latitude: number;
  longitude: number;
};

export default function addPump() {
  const navigation = useNavigation();
  const [pumpObj, setPumpObj] = useState<PumpData>({
    name: "",
    status: "",
    latitude: 0,
    longitude: 0,
  });

  const createPump = async () => {
    const requestBody = {
      name: pumpObj.name,
      status: pumpObj.status,
      latitude: pumpObj.latitude,
      longitude: pumpObj.longitude,
    };
    console.log(requestBody);
    try {
      let response = await axios.post(
        "http://192.168.1.105:5000/markers",
        requestBody
      );

      Alert.alert(
        "Success",
        "Pump added successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to the index page after the alert is dismissed
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );

      console.log("Pump added successfully", response.data);
    } catch (error) {
      console.error("Error adding pump:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text>addPump</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Name"
          value={pumpObj.name}
          placeholderTextColor="gray"
          onChangeText={(text) =>
            setPumpObj((prev) => ({ ...prev, name: text }))
          }
        />
        <TextInput
          style={styles.textInput}
          placeholder="Status"
          value={pumpObj.status}
          placeholderTextColor="gray"
          onChangeText={(text) =>
            setPumpObj((prev) => ({ ...prev, status: text }))
          }
        />
        <TextInput
          style={styles.textInput}
          placeholder="Latitude"
          keyboardType="numeric"
          placeholderTextColor="gray"
          value={pumpObj.latitude.toString()}
          onChangeText={(text) =>
            setPumpObj((prev) => ({ ...prev, latitude: parseFloat(text) }))
          }
        />
        <TextInput
          style={styles.textInput}
          placeholder="Longitude"
          keyboardType="numeric"
          placeholderTextColor="gray"
          value={pumpObj.longitude.toString()}
          onChangeText={(text) =>
            setPumpObj((prev) => ({ ...prev, longitude: parseFloat(text) }))
          }
        />
        <LinearGradient
          colors={["#4c669f", "#3b5998", "#192f6a"]}
          style={styles.gradient}
        >
          <TouchableOpacity onPress={createPump} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    backgroundColor: "black",
  },
  inputContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
    gap: 20,
    padding: 10,
    width: "100%",
    maxWidth: 1024,
    marginHorizontal: "auto",
    pointerEvents: "auto",
  },
  textInput: {
    flex: 1,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    fontSize: 18,
    width: 190,
    minWidth: 0,
    color: "white",
  },
  addButton: {
    borderRadius: 5,
    padding: 6,
  },
  addButtonText: {
    fontSize: 18,
    color: "white",
  },
  gradient: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    width: 100,
    borderRadius: 10,
  },
});
