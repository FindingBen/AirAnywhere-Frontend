import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  API_BASE_URL,
  buildApiUrl,
  hasConfiguredApiBaseUrl,
} from "@/utils/api";

type MarkerData = {
  _id: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
};

type ApiMarkerData = Omit<MarkerData, "latitude" | "longitude"> & {
  latitude: number | string;
  longitude: number | string;
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

  const normalizeMarker = (marker: ApiMarkerData): MarkerData | null => {
    const latitude = Number(marker.latitude);
    const longitude = Number(marker.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return {
      ...marker,
      latitude,
      longitude,
    };
  };

  const fetchMarkers = async () => {
    setIsLoading(true);
    const url = buildApiUrl("/markers");

    try {
      if (!hasConfiguredApiBaseUrl) {
        console.error(
          "[MARKERS] EXPO_PUBLIC_API_URL is missing. Configure it for the build profile."
        );
        console.error("[MARKERS] Resolved API base URL:", API_BASE_URL || "<empty>");
        setMarkers([]);
        return;
      }

      console.log("[MARKERS] Fetching from URL:", url);
      const response = await axios.get(url);
      if (response.status === 200) {
        const normalizedMarkers = (response.data as ApiMarkerData[])
          .map(normalizeMarker)
          .filter((marker): marker is MarkerData => marker !== null);

        setMarkers(normalizedMarkers);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("[MARKERS] Request failed");
        console.error("[MARKERS] URL:", url);
        console.error("[MARKERS] Message:", error.message);
        console.error("[MARKERS] Status:", error.response?.status);
        console.error("[MARKERS] Data:", error.response?.data);
      } else {
        console.error("[MARKERS] Unexpected error:", error);
      }
    } finally {
      setIsLoading(false);
    }
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
