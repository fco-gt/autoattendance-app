import { BarcodeScanningResult } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Vibration } from "react-native";
import {
  getAttendanceHistory,
  getTodayAttendance,
  markQrAttendance,
} from "../services/attendanceService";
import { Attendance, AttendanceStatus } from "../types";

export type ScanStatus =
  | "READY"
  | "SCANNING"
  | "PROCESSING"
  | "SUCCESS"
  | "ERROR";

interface UseQrAttendanceReturn {
  scanStatus: ScanStatus;
  attendance: Attendance | null;
  message: string;
  error: string | null;
  handleBarCodeScanned: (scanResult: BarcodeScanningResult) => void;
  resetScan: () => void;
  isScanned: boolean;
  todayAttendance: Attendance | null;
  isLoading: boolean;
}

interface UseTodayAttendanceReturn {
  attendance: Attendance | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  canCheckOut: boolean;
  nextAction: "CHECK_IN" | "CHECK_OUT" | "COMPLETED";
}

export type TimePeriod = "week" | "month" | "quarter" | "custom";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  onTimeDays: number;
  lateDays: number;
  attendanceRate: number;
  punctualityRate: number;
}

interface UseAttendanceHistoryReturn {
  attendanceHistory: Attendance[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  selectedPeriod: TimePeriod;
  dateRange: DateRange;
  stats: AttendanceStats;
  setSelectedPeriod: (period: TimePeriod) => void;
  setCustomDateRange: (range: DateRange) => void;
  refetch: () => Promise<void>;
  onRefresh: () => void;
}

/**
 * Hook personalizado para manejar la asistencia del día actual
 * ARREGLADO: Previene bucles infinitos
 */
export const useTodayAttendance = (): UseTodayAttendanceReturn => {
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // SOLUCIÓN: Usar useRef para controlar peticiones duplicadas
  const isRequestInProgress = useRef(false);
  const lastFetchTime = useRef<number>(0);

  // SOLUCIÓN: Función estable sin dependencias problemáticas
  const fetchTodayAttendance = useCallback(async () => {
    // Evitar peticiones muy frecuentes
    const now = Date.now();
    if (now - lastFetchTime.current < 1000) {
      console.log("Petición muy frecuente evitada - useTodayAttendance");
      return;
    }

    // Evitar peticiones duplicadas
    if (isRequestInProgress.current) {
      console.log("Petición duplicada evitada - useTodayAttendance");
      return;
    }

    try {
      isRequestInProgress.current = true;
      lastFetchTime.current = now;
      setLoading(true);
      setError(null);

      console.log("Fetching today attendance...");
      const todayAttendance = await getTodayAttendance();
      setAttendance(todayAttendance);
    } catch (err) {
      console.error("Error al obtener la asistencia del día:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
      isRequestInProgress.current = false;
    }
  }, []); // ARREGLADO: Sin dependencias

  // Función para refrescar los datos
  const refetch = useCallback(async () => {
    await fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  // ARREGLADO: Solo ejecutar una vez al montar
  useEffect(() => {
    fetchTodayAttendance();
  }, []); // Array vacío para ejecutar solo al montar

  // Calcular estados derivados (memoizados)
  const hasCheckedIn = Boolean(
    attendance?.checkInTime && attendance.checkInTime !== ""
  );
  const hasCheckedOut = Boolean(
    attendance?.checkOutTime && attendance.checkOutTime !== ""
  );
  const canCheckOut = hasCheckedIn && !hasCheckedOut;

  const nextAction: "CHECK_IN" | "CHECK_OUT" | "COMPLETED" = !hasCheckedIn
    ? "CHECK_IN"
    : !hasCheckedOut
    ? "CHECK_OUT"
    : "COMPLETED";

  return {
    attendance,
    loading,
    error,
    refetch,
    hasCheckedIn,
    hasCheckedOut,
    canCheckOut,
    nextAction,
  };
};

/**
 * Hook personalizado para manejar el escaneo de QR y registro de asistencia
 * ARREGLADO: Previene bucles infinitos
 */
export const useQrAttendance = (): UseQrAttendanceReturn => {
  const [scanStatus, setScanStatus] = useState<ScanStatus>("READY");
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(
    null
  );
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isScanned, setIsScanned] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // SOLUCIÓN: Controlar peticiones duplicadas
  const isRequestInProgress = useRef(false);

  // ARREGLADO: Cargar la asistencia del día solo una vez
  useEffect(() => {
    const loadTodayAttendance = async () => {
      if (isRequestInProgress.current) return;

      try {
        isRequestInProgress.current = true;
        setIsLoading(true);
        console.log("Loading today attendance for QR...");
        const today = await getTodayAttendance();
        setTodayAttendance(today);
      } catch (err) {
        console.error("Error al cargar la asistencia del día:", err);
      } finally {
        setIsLoading(false);
        isRequestInProgress.current = false;
      }
    };

    loadTodayAttendance();
  }, []); // Solo al montar

  // ARREGLADO: Función estable para resetear
  const resetScan = useCallback(() => {
    setScanStatus("READY");
    setAttendance(null);
    setMessage("");
    setError(null);
    setIsScanned(false);

    // Recargar la asistencia del día sin causar bucles
    if (!isRequestInProgress.current) {
      getTodayAttendance()
        .then((today) => {
          setTodayAttendance(today);
        })
        .catch((err) => {
          console.error("Error al recargar la asistencia:", err);
        });
    }
  }, []); // Sin dependencias problemáticas

  // Validar URL del código QR
  const isValidQrUrl = useCallback((data: string): boolean => {
    try {
      const url = new URL(data);
      return (
        url.href.includes("attendance/qr") &&
        url.searchParams.has("token") &&
        url.searchParams.has("type")
      );
    } catch (e) {
      return false;
    }
  }, []);

  // ARREGLADO: Manejar el resultado del escaneo
  const handleBarCodeScanned = useCallback(
    async ({ type, data }: BarcodeScanningResult) => {
      // Evitar múltiples escaneos
      if (isScanned || scanStatus === "PROCESSING") return;

      setIsScanned(true);
      Vibration.vibrate(200);

      if (!isValidQrUrl(data)) {
        setScanStatus("ERROR");
        setError(
          "QR inválido. Por favor, escanea un código QR de asistencia válido."
        );
        return;
      }

      try {
        setScanStatus("PROCESSING");
        setMessage("Procesando asistencia...");

        const response = await markQrAttendance(data);

        if (response.success) {
          setScanStatus("SUCCESS");
          setAttendance(response.data);
          setTodayAttendance(response.data);

          const isCheckIn =
            !response.data.checkOutTime || response.data.checkOutTime === "";
          const statusText =
            response.data.status === AttendanceStatus.ON_TIME
              ? "a tiempo"
              : "con retraso";

          if (isCheckIn) {
            setMessage(`Entrada registrada ${statusText}`);
          } else {
            setMessage("Salida registrada correctamente");
          }
        } else {
          setScanStatus("ERROR");
          setError(response.message || "Error al registrar asistencia");
        }
      } catch (err) {
        setScanStatus("ERROR");
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido al procesar la asistencia");
        }
      }
    },
    [isScanned, scanStatus, isValidQrUrl] // Dependencias estables
  );

  // Mostrar alertas según el estado
  useEffect(() => {
    if (scanStatus === "SUCCESS") {
      const isCheckIn =
        attendance &&
        (!attendance.checkOutTime || attendance.checkOutTime === "");
      const statusText =
        attendance?.status === AttendanceStatus.ON_TIME
          ? "a tiempo"
          : "con retraso";

      Alert.alert(
        "¡Asistencia registrada!",
        isCheckIn
          ? `Has registrado tu entrada ${statusText}.`
          : `Has registrado tu salida correctamente.`,
        [{ text: "OK", onPress: () => {} }]
      );
    } else if (scanStatus === "ERROR" && error) {
      Alert.alert("Error", error, [
        { text: "Intentar de nuevo", onPress: resetScan },
      ]);
    }
  }, [scanStatus, error, attendance, resetScan]);

  return {
    scanStatus,
    attendance,
    message,
    error,
    handleBarCodeScanned,
    resetScan,
    isScanned,
    todayAttendance,
    isLoading,
  };
};

/**
 * Hook personalizado para manejar el historial de asistencias
 * ARREGLADO: Previene bucles infinitos
 */
export const useAttendanceHistory = (): UseAttendanceHistoryReturn => {
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week");
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    return { startDate, endDate };
  });

  // SOLUCIÓN: Controlar peticiones duplicadas
  const isRequestInProgress = useRef(false);
  const lastRequestParams = useRef<string>("");

  // ARREGLADO: Función estable para calcular estadísticas
  const calculateStats = useCallback(
    (attendances: Attendance[]): AttendanceStats => {
      const totalDays = attendances.length;
      const presentDays = attendances.filter(
        (a) => a.checkInTime && a.checkInTime !== ""
      ).length;
      const onTimeDays = attendances.filter(
        (a) => a.status === AttendanceStatus.ON_TIME
      ).length;
      const lateDays = attendances.filter(
        (a) => a.status === AttendanceStatus.LATE
      ).length;

      const attendanceRate =
        totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      const punctualityRate =
        presentDays > 0 ? (onTimeDays / presentDays) * 100 : 0;

      return {
        totalDays,
        presentDays,
        onTimeDays,
        lateDays,
        attendanceRate,
        punctualityRate,
      };
    },
    []
  );

  // ARREGLADO: Formatear fecha sin dependencias
  const formatDateForAPI = useCallback((date: Date): string => {
    return date.toISOString().split("T")[0];
  }, []);

  // ARREGLADO: Función de fetch optimizada
  const fetchAttendanceHistory = useCallback(
    async (showRefresh = false) => {
      // Crear identificador único para evitar duplicados
      const requestId = `${formatDateForAPI(
        dateRange.startDate
      )}-${formatDateForAPI(dateRange.endDate)}`;

      if (
        isRequestInProgress.current &&
        lastRequestParams.current === requestId
      ) {
        console.log("Petición duplicada evitada - useAttendanceHistory");
        return;
      }

      isRequestInProgress.current = true;
      lastRequestParams.current = requestId;

      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      try {
        const formattedStartDate = formatDateForAPI(dateRange.startDate);
        const formattedEndDate = formatDateForAPI(dateRange.endDate);

        console.log("Fetching attendance history:", {
          formattedStartDate,
          formattedEndDate,
        });

        const history = await getAttendanceHistory(
          formattedStartDate,
          formattedEndDate
        );

        const sortedHistory = history.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setAttendanceHistory(sortedHistory);
      } catch (err) {
        console.error("Error al obtener historial:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar el historial de asistencias"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        isRequestInProgress.current = false;
      }
    },
    [dateRange.startDate, dateRange.endDate, formatDateForAPI] // Solo dependencias necesarias
  );

  // ARREGLADO: Calcular rango sin dependencias problemáticas
  const calculateDateRange = useCallback(
    (period: TimePeriod): DateRange => {
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case "custom":
          return dateRange;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      return { startDate, endDate };
    },
    [dateRange]
  );

  // ARREGLADO: useEffect para cambios de período
  useEffect(() => {
    if (selectedPeriod !== "custom") {
      const newRange = calculateDateRange(selectedPeriod);

      // Solo actualizar si las fechas realmente cambiaron
      const currentStart = dateRange.startDate.getTime();
      const currentEnd = dateRange.endDate.getTime();
      const newStart = newRange.startDate.getTime();
      const newEnd = newRange.endDate.getTime();

      if (currentStart !== newStart || currentEnd !== newEnd) {
        console.log(
          "Actualizando rango de fechas para período:",
          selectedPeriod
        );
        setDateRange(newRange);
      }
    }
  }, [selectedPeriod]); // Solo selectedPeriod como dependencia

  // ARREGLADO: useEffect para fetch cuando cambian las fechas
  useEffect(() => {
    // Debounce para evitar múltiples llamadas
    const timeoutId = setTimeout(() => {
      fetchAttendanceHistory();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [dateRange.startDate.getTime(), dateRange.endDate.getTime()]); // Usar getTime() para comparación

  // Funciones de control
  const refetch = useCallback(async () => {
    await fetchAttendanceHistory();
  }, [fetchAttendanceHistory]);

  const onRefresh = useCallback(() => {
    fetchAttendanceHistory(true);
  }, [fetchAttendanceHistory]);

  // ARREGLADO: Función para establecer período personalizado
  const setCustomDateRange = useCallback(
    (range: DateRange) => {
      // Solo actualizar si las fechas realmente cambiaron
      const currentStart = dateRange.startDate.getTime();
      const currentEnd = dateRange.endDate.getTime();
      const newStart = range.startDate.getTime();
      const newEnd = range.endDate.getTime();

      if (currentStart !== newStart || currentEnd !== newEnd) {
        console.log("Estableciendo rango personalizado:", range);
        setDateRange(range);
        setSelectedPeriod("custom");
      }
    },
    [dateRange]
  );

  // Calcular estadísticas
  const stats = calculateStats(attendanceHistory);

  return {
    attendanceHistory,
    loading,
    refreshing,
    error,
    selectedPeriod,
    dateRange,
    stats,
    setSelectedPeriod,
    setCustomDateRange,
    refetch,
    onRefresh,
  };
};
