import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import {
  API_BASE_URL,
  buildApiUrl,
  hasConfiguredApiBaseUrl,
} from "@/utils/api";

interface Authprops {
  authState?: { token: string | null; authenticated: boolean | null; isAnonymous?: boolean };
  user?: { userId: string; username: string; isAnonymous: boolean } | null;
  onRegister?: (email: string, password: string, username: string) => Promise<any>;
  onLogin?: (email: string, password: string) => Promise<any>;
  onLogout?: () => Promise<any>;
}

const TOKEN_KEY = "AUTH_TOKEN";
const USER_ID_KEY = "ANON_USER_ID";
const INSTALL_ID_KEY = "INSTALL_ID";
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

  console.log("[AUTH] Initial render - authState:", authState);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        console.log("[AUTH] Resolved API base URL:", API_BASE_URL || "<empty>");

        if (!hasConfiguredApiBaseUrl) {
          console.error(
            "[AUTH] EXPO_PUBLIC_API_URL is missing. Configure it for this build profile."
          );
        }

        console.log("[AUTH] Initializing user...");
        // First check if user has a token (registered/logged in)
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        console.log("[AUTH] Token found:", !!token);

        if (token) {
          console.log("[AUTH] Token exists, attempting to fetch user from /me");
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          // Fetch user info for registered user
          try {
            const userResponse = await axios.get(buildApiUrl("/me"));
            setUser({
              userId: userResponse.data.userId,
              username: userResponse.data.username,
              isAnonymous: userResponse.data.isAnonymous || false,
            });
            setAuthState({
              token: token,
              authenticated: true,
              isAnonymous: userResponse.data.isAnonymous || false,
            });
            console.log("[AUTH] Registered user loaded:", userResponse.data.username);
            return;
          } catch (err) {
            console.error("[AUTH] Failed to fetch user info from /me:", err);
            console.log("[AUTH] Token was:", token.substring(0, 20) + "...");
            console.log("[AUTH] API URL:", buildApiUrl(""));
            // Token exists but user not found - clear it and create anonymous user instead
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            console.log("[AUTH] Clearing invalid token, creating anonymous user instead");
            
            // Now create anonymous user
            let installId = await SecureStore.getItemAsync(INSTALL_ID_KEY);
            if (!installId) {
              installId = `device-${Date.now()}`;
              await SecureStore.setItemAsync(INSTALL_ID_KEY, installId);
            }

            try {
              const anonResponse = await axios.post(buildApiUrl("/auth/anonymous"), {
                installId: installId,
              });
              
              const { token: anonToken, userId, username, isAnonymous } = anonResponse.data;
              console.log("[AUTH] Anonymous user created after /me failure:", username);
              
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
            } catch (anonError) {
              console.error("[AUTH] Error creating fallback anonymous user:", anonError);
              // Last resort
              const fallbackUser = `user${Math.floor(Math.random() * 1000000)}`;
              setUser({
                userId: fallbackUser,
                username: fallbackUser,
                isAnonymous: true,
              });
              setAuthState({
                token: null,
                authenticated: true,
                isAnonymous: true,
              });
            }
          }
          return;
        }

        // No token, create anonymous user
        try {
          let installId = await SecureStore.getItemAsync(INSTALL_ID_KEY);

          // If no install ID, generate one
          if (!installId) {
            installId = `device-${Date.now()}`;
            await SecureStore.setItemAsync(INSTALL_ID_KEY, installId);
          }

          console.log("[AUTH] No token found, creating anonymous user with installId:", installId);
          console.log("[AUTH] API URL:", buildApiUrl(""));

          // Try to create/restore anonymous user from backend
          const response = await axios.post(buildApiUrl("/auth/anonymous"), {
            installId: installId,
          });
          
          console.log("[AUTH] Anonymous response received:", response.data);
          const { token: anonToken, userId, username, isAnonymous } = response.data;
          console.log("[AUTH] Anonymous user created:", username, "Token:", !!anonToken);
          
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
          console.log("[AUTH] Auth state set to authenticated: true");
        } catch (error) {
          console.error("[AUTH] Error creating anonymous user from backend:", error);
          console.error("[AUTH] Error details:", (error as any).response?.data || error);
          // Fallback: create local anonymous user
          const randomId = Math.floor(Math.random() * 1000000);
          const username = `user${randomId}`;
          console.log("[AUTH] Using fallback local user:", username);
          
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
          console.log("[AUTH] Fallback: Auth state set to authenticated: true");
        }
      } catch (error) {
        console.error("[AUTH] Critical initialization error:", error);
        const fallbackUser = `user${Math.floor(Math.random() * 1000000)}`;
        console.log("[AUTH] Using critical fallback user:", fallbackUser);
        // Last resort fallback
        setAuthState({
          token: null,
          authenticated: true,
          isAnonymous: true,
        });
        
        setUser({
          userId: fallbackUser,
          username: fallbackUser,
          isAnonymous: true,
        });
      }
      console.log("[AUTH] ✅ Initialization complete");
    };
    initializeUser();
  }, []);

  const register = async (email: string, password: string, username:string) => {
    try {
      console.log("[REGISTER] Attempting registration for:", email);
      console.log("[REGISTER] API URL:", buildApiUrl(""));
      const response = await axios.post(buildApiUrl("/register"), {
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
      const response = await axios.post(buildApiUrl("/login"), {
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
