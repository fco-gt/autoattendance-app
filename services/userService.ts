import api from './api';
import { UserFrontend } from '@/types';

// Get the currently logged in user's profile
export const getUserProfile = async (): Promise<UserFrontend> => {
  try {
    const response = await api.get<UserFrontend>('users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};