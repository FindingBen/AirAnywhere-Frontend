import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";

interface Authprops {
  authState?: { token: string | null; authenticated: boolean | null; isAnonymous?: boolean };
  user?: { userId: string; username: string; isAnonymous: boolean } | null;
  onRegister?: (email: string, password: string) => Promise<any>;
  onLogin?: (email: string, password: string) => Promise<any>;
  onLogout?: () => Promise<any>;
}

const TOKEN_KEY = "AUTH_TOKEN";
const USER_ID_KEY = "ANON_USER_ID";
const INSTALL_ID_KEY = "INSTALL_ID";
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.105:5000";
const AuthContext = createContext<Authprops>({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvide = ({ children }: any) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
    isAnonymous?: boolean;
  }>({
    token: null,
    authenticated: null,
    isAnonymous: false,
  });

  const [user, setUser] = useState<{ userId: string; username: string; isAnonymous: boolean } | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // First check if user has a token (registered/logged in)
        const token = await SecureStore.getItemAsync(TOKEN_KEY);

        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setAuthState({
            token: token,
            authenticated: true,
            isAnonymous: false,
          });
        } else {
          // No token, check for anonymous user
          let installId = await SecureStore.getItemAsync(INSTALL_ID_KEY);

          // If no install ID, generate one
          if (!installId) {
            installId = `${Device.modelId || "device"}-${Date.now()}`;
            await SecureStore.setItemAsync(INSTALL_ID_KEY, installId);
          }

          // Create/restore anonymous user
          try {
            const response = await axios.post(`${API_URL}/auth/anonymous`, {
              installId: installId,
            });
            
            const { token: anonToken, userId, username, isAnonymous } = response.data;
            
            // Store token for anonymous user
            if (anonToken) {
              await SecureStore.setItemAsync(TOKEN_KEY, anonToken);
              axios.defaults.headers.common["Authorization"] = `Bearer ${anonToken}`;
            }
            
            setUser({
              userId: userId,
              username: username,
              isAnonymous: isAnonymous,
            });
            
            setAuthState({
              token: anonToken || null,
              authenticated: true,
              isAnonymous: true,
            });
          } catch (error) {
            console.error("Error creating anonymous user:", error);
            // Fallback: create local anonymous user
            const randomId = Math.floor(Math.random() * 1000000);
            const username = `user${randomId}`;
            
            setUser({
              userId: username,
              username: username,
              isAnonymous: true,
            });
            
            setAuthState({
              token: null,
              authenticated: true,
              isAnonymous: true,
            });
          }
        }
      } catch (error) {
        console.log("Error initializing user:", error);
        setAuthState({
          token: null,
          authenticated: false,
        });
      }
    };
    initializeUser();
  }, []);

  const register = async (email: string, password: string, username:string) => {
    try {
      console.log("[REGISTER] Attempting registration for:", email);
      console.log("[REGISTER] API URL:", API_URL);
      const response = await axios.post(`${API_URL}/register`, {
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
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      
      const { token, userId, username, isAnonymous } = response.data;
      
      setAuthState({
        token: token,
        authenticated: true,
        isAnonymous: isAnonymous,
      });

      setUser({
        userId: userId,
        username: username,
        isAnonymous: isAnonymous,
      });

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.log("Login successful:", response.data);
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
        isAnonymous: false,
      });
      setUser(null);
      console.log("[LOGOUT] Auth state cleared");
      axios.defaults.headers.common["Authorization"] = ``;
    } catch (e) {
      console.log("[LOGOUT] Error:", e);
      return { error: true, msg: (e as any).response?.data?.msg };
    }
  };

  const value = {
    authState,
    user,
    onRegister: register,
    onLogin: login,
    onLogout: logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
