import axios, { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

const memoryStore: Record<string, string> = {};

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("localStorage.getItem failed", e);
      return memoryStore[key] || null;
    }
  }
  return await SecureStore.getItemAsync(key);
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(key, value);
      return;
    } catch (e) {
      console.error("localStorage.setItem failed", e);
      memoryStore[key] = value;
      return;
    }
  }
  await SecureStore.setItemAsync(key, value);
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(key);
      return;
    } catch (e) {
      console.error("localStorage.removeItem failed", e);
      delete memoryStore[key];
      return;
    }
  }
  await SecureStore.deleteItemAsync(key);
}

const BASE_URL = "https://api-gateway-production-17b2.up.railway.app/v1/api/";
const TOKEN_KEY = "attendance_app_token";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  async (config) => {
    // Don't add auth header for login request
    if (config.url === "auth/login") {
      return config;
    }

    const token = await secureGet(TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // You could implement token refresh logic here if your API supports it
      // For now, we'll just sign the user out
      await secureDelete(TOKEN_KEY);
      // Force app to return to login screen
      // This will be handled by the auth context
    }

    // Transform error message for better UX
    let errorMessage = "An unexpected error occurred";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message === "Network Error") {
      errorMessage =
        "Unable to connect to the server. Please check your internet connection.";
    }

    // Create a new error with the transformed message
    const enhancedError = new Error(errorMessage);
    return Promise.reject(enhancedError);
  }
);

// Token management functions
export const saveToken = async (token: string): Promise<void> => {
  await secureSet(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await secureGet(TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
  await secureDelete(TOKEN_KEY);
};

export default api;
