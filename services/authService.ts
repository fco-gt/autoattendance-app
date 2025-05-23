import { AuthUserResponse, UserFrontend } from "@/types";
import api, { getToken, removeToken, saveToken } from "./api";

export const login = async (
  email: string,
  password: string
): Promise<AuthUserResponse> => {
  try {
    const response = await api.post<AuthUserResponse>("users/login", {
      email,
      password,
    });

    // Store the token
    await saveToken(response.data.token);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkAuthStatus = async (): Promise<UserFrontend | null> => {
  try {
    const token = await getToken();

    if (!token) {
      return null;
    }

    // Verify token by fetching user profile
    const response = await api.get<UserFrontend>("users/me");
    return response.data;
  } catch (error) {
    console.error("Error checking auth status:", error);
    await removeToken();
    return null;
  }
};

export const logout = async (): Promise<void> => {
  await removeToken();
};
