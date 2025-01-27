import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { create } from "react-test-renderer";

interface Authprops {
  authState?: { token: string | null; authenticated: boolean | null };
  onRegister?: (email: string, password: string) => Promise<any>;
  onLogin?: (email: string, password: string) => Promise<any>;
  onLogout?: () => Promise<any>;
}

const TOKEN_KEY = "KURAC";
export const API_URL = "http://192.168.1.105:5000";
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
      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setAuthState({
          token: token,
          authenticated: true,
        });
      }
    };
    loadToken();
  }, []);

  const register = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        email,
        password,
      });
      return { success: true, data: response.data };
    } catch (e) {
       return {
        error: true,
        msg: (e as any).response?.data || "Registration failed.",
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
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
      await SecureStore.deleteItemAsync(TOKEN_KEY);

      setAuthState({
        token: null,
        authenticated: null,
      });

      axios.defaults.headers.common["Authorization"] = ``;
    } catch (e) {
      return { error: true, msg: (e as any).response.data.msg };
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
