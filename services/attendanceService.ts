import api, { ApiResponse } from './api';
import { Attendance } from '../types';

/**
 * Marca la asistencia mediante un código QR
 * @param url URL extraída del código QR
 * @returns Objeto de asistencia y mensaje de éxito
 */
export const markQrAttendance = async (
  url: string
): Promise<ApiResponse<Attendance>> => {
  try {
    // Extraer el token del QR
    const qrToken = extractTokenFromUrl(url);
    const checkType = extractCheckTypeFromUrl(url);

    if (!qrToken || !checkType) {
      throw new Error('URL de QR inválida o incompleta');
    }

    // Llamar a la API con el token extraído
    const response = await api.get<ApiResponse<Attendance>>('/attendance/qr', {
      params: {
        token: qrToken,
        type: checkType,
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al procesar la asistencia: ${error.message}`);
    }
    throw new Error('Error desconocido al procesar la asistencia');
  }
};

/**
 * Extrae el token de la URL del código QR
 */
const extractTokenFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('token');
  } catch (e) {
    return null;
  }
};

/**
 * Extrae el tipo de registro (check-in o check-out) de la URL
 */
const extractCheckTypeFromUrl = (
  url: string
): 'check-in' | 'check-out' | null => {
  try {
    const urlObj = new URL(url);
    const type = urlObj.searchParams.get('type');

    if (type === 'check-in' || type === 'check-out') {
      return type;
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Obtiene la asistencia del día actual para el usuario
 */
export const getTodayAttendance = async (): Promise<Attendance | null> => {
  try {
    const response = await api.get<Attendance>(`/attendance/today`);

    if (!response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error('Error al obtener la asistencia del día:', error);
    return null;
  }
};

/**
 * Obtiene el historial de asistencias para el usuario
 */
export const getAttendanceHistory = async (
  startDate: string,
  endDate: string
): Promise<Attendance[]> => {
  try {
    const response = await api.get<Attendance[]>(`/attendance/history/user`, {
      params: {
        startDate,
        endDate,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al obtener el historial de asistencia:', error);
    return [];
  }
};
