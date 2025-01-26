import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Pressable,
  TouchableWithoutFeedback,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Keyboard,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import img from "@/assets/images/bl.jpg";
import { useRouter } from "expo-router";
import { useAuth } from "../authentication/auth";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import axios from "axios";

type PumpData = {
  name: string;
  status: string;
  latitude: string;
  longitude: string;
  address: string;
};

export default function addPump() {
  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const { authState } = useAuth();
  const router = useRouter();
  const [errors, setErrors] = useState({
    name: false,
    status: false,
    latitude: false,
    longitude: false,
    address: false,
  });

  const styles = createStyles();
  const [pumpObj, setPumpObj] = useState<PumpData>({
    name: "",
    status: "",
    latitude: "0",
    longitude: "0",
    address: "",
  });

  useEffect(() => {
    if (!authState?.authenticated) {
      router.replace("/login");
    }
  }, [authState]);

  if (!authState?.authenticated) {
    return null; // Render nothing while redirecting
  }

  const validateFields = () => {
    const newErrors = {
      name: !pumpObj.name.trim(),
      status: !pumpObj.status.trim(),
      latitude: !pumpObj.latitude,
      longitude: !pumpObj.longitude,
      address: !pumpObj.address.trim(),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const createPump = async () => {
    if (!validateFields()) return;

    setLoading(true);
    const requestBody = {
      name: pumpObj.name,
      status: pumpObj.status,
      latitude: pumpObj.latitude,
      longitude: pumpObj.longitude,
      address: pumpObj.address,
    };

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
              setPumpObj({
                name: "",
                status: "",
                latitude: "",
                longitude: "",
                address: "",
              });
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
      setLoading(false);
      console.log("Pump request sent successfully", response.data);
    } catch (error) {
      console.error("Error adding pump:", error);
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground source={img} resizeMode="cover" style={styles.image}>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Pump location</Text>
          <TextInput
            style={[
              styles.textInput,
              errors.name && styles.errorInput, // Conditionally apply error style
            ]}
            placeholder="Name*"
            value={pumpObj.name}
            onChangeText={(text) =>
              setPumpObj((prev) => ({ ...prev, name: text }))
            }
          />
          <TextInput
            style={[
              styles.textInput,
              errors.status && styles.errorInput, // Conditionally apply error style
            ]}
            placeholder="Status*"
            value={pumpObj.status}
            onChangeText={(text) =>
              setPumpObj((prev) => ({ ...prev, status: text }))
            }
          />
          <TextInput
            style={[
              styles.textInput,
              errors.address && styles.errorInput, // Conditionally apply error style
            ]}
            placeholder="Address*"
            value={pumpObj.address}
            onChangeText={(text) =>
              setPumpObj((prev) => ({ ...prev, address: text }))
            }
          />
          <TextInput
            style={[
              styles.textInput,
              errors.latitude && styles.errorInput, // Conditionally apply error style
            ]}
            placeholder="Latitude*"
            //keyboardType="numeric"
            value={pumpObj.latitude.toString()}
            onChangeText={(text) =>
              setPumpObj((prev) => ({ ...prev, latitude: text }))
            }
          />
          <TextInput
            style={[
              styles.textInput,
              errors.longitude && styles.errorInput, // Conditionally apply error style
            ]}
            placeholder="Longitude*"
            //keyboardType="numeric"
            value={pumpObj.longitude.toString()}
            onChangeText={(text) =>
              setPumpObj((prev) => ({ ...prev, longitude: text }))
            }
          />
          {!loading ? (
            <LinearGradient
              colors={["#00558D", "#007CE9"]}
              style={styles.gradient}
            >
              <TouchableOpacity onPress={createPump} style={styles.addButton}>
                <Text style={styles.addButtonText}>Request</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <ActivityIndicator color="#0000ff" size="large" />
          )}
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}
function createStyles() {
  return StyleSheet.create({
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
      height: "57%",
      maxWidth: 1024,
      pointerEvents: "auto",
    },
    title: {
      color: "white",
      fontSize: 30,
    },
    textInput: {
      flex: 1,
      borderColor: "white", // Default border color
      borderWidth: 1,
      borderRadius: 4,
      padding: 10,
      fontSize: 18,
      width: "70%",
      color: "white",
    },
    errorInput: {
      borderColor: "#b42324", // Red border for errors
    },
    addButton: {
      borderRadius: 5,
      borderColor: "white",
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
      borderRadius: 4,
      borderColor: "white",
    },
    error: {
      color: "#b42323",
      fontSize: 15,
    },
    image: {
      width: "100%",
      height: "100%",
      flex: 1,
      resizeMode: "cover",
      justifyContent: "center",
    },
  });
}
