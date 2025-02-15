import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import Constants from "expo-constants";
type MarkerData = {
  _id: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
};

type MarkersContextType = {
  markers: MarkerData[];
  fetchMarkers: () => Promise<void>;
  isLoading: boolean;
};

const MarkersContext = createContext<MarkersContextType | undefined>(undefined);

export const MarkersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}markers`
      );
      if (response.status === 200) {
        setMarkers(response.data);
      }
    } catch (error) {
      console.error("Error fetching markers:", error);
    }
    setIsLoading(false);
  };

  return (
    <MarkersContext.Provider value={{ markers, fetchMarkers, isLoading }}>
      {children}
    </MarkersContext.Provider>
  );
};

export const useMarkers = () => {
  const context = useContext(MarkersContext);
  if (!context) {
    throw new Error("useMarkers must be used within a MarkersProvider");
  }
  return context;
};
