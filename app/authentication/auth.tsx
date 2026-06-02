import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

interface Authprops {
  authState?: { token: string | null; authenticated: boolean | null };
  onRegister?: (email: string, password: string) => Promise<any>;
  onLogin?: (email: string, password: string) => Promise<any>;
  onLogout?: () => Promise<any>;
}

const TOKEN_KEY = "AUTH_TOKEN";
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.105:5000";
const AuthContext = createContext<Authprops>({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvide = ({ children }: any) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
  }>({
    token: null,
    authenticated: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);

        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setAuthState({
            token: token,
            authenticated: true,
          });
        } else {
          setAuthState({
            token: null,
            authenticated: false,
          });
        }
      } catch (error) {
        console.log("Error loading token:", error);
        setAuthState({
          token: null,
          authenticated: false,
        });
      }
    };
    loadToken();
  }, []);

  const register = async (email: string, password: string, username:string) => {
    try {
      console.log("[REGISTER] Attempting registration for:", email);
      console.log("[REGISTER] API URL:", API_URL);
      const response = await axios.post(`${API_URL}register`, {
        email,
        password,
        username
      });
      console.log("[REGISTER] Success:", response.data);
      return { success: true, data: response.data };
    } catch (e) {
      const errorMsg = (e as any).response?.data || (e as any).message || "Registration failed.";
      const errorCode = (e as any).response?.status;
      console.log("[REGISTER] Error Code:", errorCode);
      console.log("[REGISTER] Error Message:", errorMsg);
      console.log("[REGISTER] Full Error:", e);
       return {
        error: true,
        msg: errorMsg,
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}login`, {
        email,
        password,
      });
      console.log("LOG");
      setAuthState({
        token: response.data.token,
        authenticated: true,
      });

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
      console.log(response);
      return response;
    } catch (e) {
      return { error: true, msg: (e as any).response.data };
    }
  };

  const logout = async () => {
    try {
      console.log("[LOGOUT] Starting logout...");
      await SecureStore.deleteItemAsync(TOKEN_KEY);

      setAuthState({
        token: null,
        authenticated: false,
      });
      console.log("[LOGOUT] Auth state cleared");
      axios.defaults.headers.common["Authorization"] = ``;
    } catch (e) {
      console.log("[LOGOUT] Error:", e);
      return { error: true, msg: (e as any).response?.data?.msg };
    }
  };

  const value = {
    authState,
    onRegister: register,
    onLogin: login,
    onLogout: logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
