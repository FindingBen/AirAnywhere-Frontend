const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

// Remove trailing slashes so endpoint joins never create "//path".
const normalizedApiUrl = rawApiUrl ? rawApiUrl.replace(/\/+$/, "") : "";

// Keep local fallback only for development to avoid silent production failures.
const developmentFallbackApiUrl = "http://192.168.1.105:5000";

export const API_BASE_URL =
  normalizedApiUrl || (__DEV__ ? developmentFallbackApiUrl : "");

export const hasConfiguredApiBaseUrl = API_BASE_URL.length > 0;

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
