import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useQrAttendance } from "../../hooks/useAttendance";
import { AttendanceStatus } from "../../types";

export default function Scan() {
  const [facing, setFacing] = React.useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  const {
    scanStatus,
    attendance,
    message,
    error,
    handleBarCodeScanned,
    resetScan,
    isScanned,
    todayAttendance,
    isLoading,
  } = useQrAttendance();

  // Animaciones
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Animación de la línea de escaneo
  useEffect(() => {
    if (scanStatus === "READY" || scanStatus === "SCANNING") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.stopAnimation();
    }

    // Animación de éxito
    if (scanStatus === "SUCCESS") {
      Animated.sequence([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [scanStatus]);

  // Cambiar cámara frontal/trasera
  function cambiarCamara() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  // Verificar permisos de cámara
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIconContainer}>
            <Ionicons name="camera-outline" size={64} color="#5BBA6F" />
          </View>
          <Text style={styles.permissionTitle}>Acceso a la Cámara</Text>
          <Text style={styles.message}>
            Necesitamos tu permiso para acceder a la cámara y escanear códigos
            QR
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.permissionButtonText}>Conceder permiso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizar el estado de carga
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5BBA6F" />
          <Text style={styles.loadingText}>
            Cargando información de asistencia...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizar la tarjeta de asistencia del día
  const renderAttendanceCard = () => {
    if (!todayAttendance) {
      return (
        <View style={styles.noAttendanceCard}>
          <View style={styles.noAttendanceIcon}>
            <Ionicons name="calendar-outline" size={32} color="#5BBA6F" />
          </View>
          <Text style={styles.noAttendanceText}>
            No has registrado asistencia hoy
          </Text>
          <Text style={styles.noAttendanceSubText}>
            Escanea un código QR para registrar tu entrada
          </Text>
        </View>
      );
    }

    const hasCheckedIn =
      todayAttendance.checkInTime && todayAttendance.checkInTime !== "";
    const hasCheckedOut =
      todayAttendance.checkOutTime && todayAttendance.checkOutTime !== "";

    return (
      <View style={styles.attendanceCard}>
        <View style={styles.attendanceCardHeader}>
          <Ionicons name="today-outline" size={24} color="#5BBA6F" />
          <Text style={styles.attendanceCardTitle}>Asistencia de hoy</Text>
        </View>
        <View style={styles.attendanceCardContent}>
          {hasCheckedIn && (
            <View style={styles.attendanceItem}>
              <View
                style={[
                  styles.attendanceIconContainer,
                  {
                    backgroundColor:
                      todayAttendance.status === AttendanceStatus.ON_TIME
                        ? "#E8F5E8"
                        : "#FFF3E0",
                  },
                ]}
              >
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color={
                    todayAttendance.status === AttendanceStatus.ON_TIME
                      ? "#5BBA6F"
                      : "#FF9800"
                  }
                />
              </View>
              <View style={styles.attendanceItemContent}>
                <Text style={styles.attendanceItemTitle}>Entrada</Text>
                <Text style={styles.attendanceItemTime}>
                  {formatTime(todayAttendance.checkInTime)}
                </Text>
                <Text
                  style={[
                    styles.attendanceItemStatus,
                    {
                      color:
                        todayAttendance.status === AttendanceStatus.ON_TIME
                          ? "#5BBA6F"
                          : "#FF9800",
                    },
                  ]}
                >
                  {todayAttendance.status === AttendanceStatus.ON_TIME
                    ? "A tiempo"
                    : "Con retraso"}
                </Text>
              </View>
            </View>
          )}

          {hasCheckedOut && (
            <View style={styles.attendanceItem}>
              <View
                style={[
                  styles.attendanceIconContainer,
                  { backgroundColor: "#E8F5E8" },
                ]}
              >
                <Ionicons name="log-out-outline" size={20} color="#5BBA6F" />
              </View>
              <View style={styles.attendanceItemContent}>
                <Text style={styles.attendanceItemTitle}>Salida</Text>
                <Text style={styles.attendanceItemTime}>
                  {formatTime(todayAttendance.checkOutTime)}
                </Text>
              </View>
            </View>
          )}

          {!hasCheckedOut && hasCheckedIn && (
            <View style={styles.attendanceAction}>
              <Ionicons name="qr-code-outline" size={20} color="#5BBA6F" />
              <Text style={styles.attendanceActionText}>
                Escanea un código QR para registrar tu salida
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Formatear hora HH:MM
  const formatTime = (timeString: string) => {
    if (!timeString) return "";

    // Si es una fecha ISO completa, extraer solo la hora
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Si ya es formato HH:MM, devolverlo directamente
    return timeString;
  };

  // Renderizar el estado de procesamiento
  const renderProcessingState = () => {
    if (scanStatus === "PROCESSING") {
      return (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.processingText}>{message}</Text>
        </View>
      );
    }
    return null;
  };

  // Renderizar el estado de éxito
  const renderSuccessState = () => {
    if (scanStatus === "SUCCESS") {
      return (
        <Animated.View
          style={[styles.successContainer, { opacity: successOpacity }]}
        >
          <Ionicons name="checkmark-circle" size={80} color="white" />
          <Text style={styles.successText}>{message}</Text>
          {attendance && (
            <View style={styles.attendanceInfo}>
              <Text style={styles.attendanceText}>
                Hora:{" "}
                {formatTime(
                  attendance.checkInTime || attendance.checkOutTime || ""
                )}
              </Text>
              {attendance.status && (
                <Text style={styles.attendanceText}>
                  Estado:{" "}
                  {attendance.status === AttendanceStatus.ON_TIME
                    ? "A tiempo"
                    : "Con retraso"}
                </Text>
              )}
            </View>
          )}
        </Animated.View>
      );
    }
    return null;
  };

  // Renderizar el estado de error
  const renderErrorState = () => {
    if (scanStatus === "ERROR") {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={80} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={resetScan}>
            <Ionicons name="refresh-outline" size={20} color="#2C2C2C" />
            <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  // Determinar qué texto mostrar en el encabezado
  const getHeaderText = () => {
    if (
      !todayAttendance ||
      !todayAttendance.checkInTime ||
      todayAttendance.checkInTime === ""
    ) {
      return "Escanea el código QR para registrar tu entrada";
    } else if (
      !todayAttendance.checkOutTime ||
      todayAttendance.checkOutTime === ""
    ) {
      return "Escanea el código QR para registrar tu salida";
    } else {
      return "Has completado tu jornada de hoy";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderAttendanceCard()}

        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={isScanned ? undefined : handleBarCodeScanned}
          >
            {/* Overlay para el área de escaneo */}
            <View style={styles.overlay}>
              <View style={styles.unfocusedContainer}></View>
              <View style={styles.middleContainer}>
                <View style={styles.unfocusedContainer}></View>
                <View style={styles.focusedContainer}>
                  {(scanStatus === "READY" || scanStatus === "SCANNING") && (
                    <Animated.View
                      style={[
                        styles.scanLine,
                        {
                          transform: [
                            {
                              translateY: scanLineAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 200],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.unfocusedContainer}></View>
              </View>
              <View style={styles.unfocusedContainer}></View>
            </View>

            {/* Estados de procesamiento, éxito y error */}
            {renderProcessingState()}
            {renderSuccessState()}
            {renderErrorState()}

            {/* Botones de control */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={cambiarCamara}
                disabled={scanStatus === "PROCESSING"}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
                <Text style={styles.text}>Cambiar cámara</Text>
              </TouchableOpacity>

              {isScanned && scanStatus !== "PROCESSING" && (
                <TouchableOpacity
                  style={styles.scanAgainButton}
                  onPress={resetScan}
                >
                  <Ionicons name="refresh-outline" size={20} color="white" />
                  <Text style={styles.scanAgainText}>Escanear de nuevo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Encabezado con instrucciones */}
            <View style={styles.scanHeaderContainer}>
              <Text style={styles.scanHeaderText}>{getHeaderText()}</Text>
              <Text style={styles.subHeaderText}>
                {scanStatus === "READY" || scanStatus === "SCANNING"
                  ? "Coloca el código dentro del marco"
                  : scanStatus === "PROCESSING"
                  ? "Procesando..."
                  : scanStatus === "SUCCESS"
                  ? "¡Asistencia registrada!"
                  : "Error al procesar"}
              </Text>
            </View>
          </CameraView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2C2C2C",
  },
  scrollView: {
    flex: 1,
  },
  // Permission States
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#2C2C2C",
  },
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(91, 186, 111, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#5BBA6F",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#5BBA6F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#2C2C2C",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 20,
    lineHeight: 24,
  },
  // Attendance Cards
  attendanceCard: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  attendanceCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  attendanceCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
    color: "#2C2C2C",
  },
  attendanceCardContent: {
    gap: 16,
  },
  attendanceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  attendanceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  attendanceItemContent: {
    flex: 1,
  },
  attendanceItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 4,
  },
  attendanceItemTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  attendanceItemStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  attendanceAction: {
    backgroundColor: "rgba(91, 186, 111, 0.1)",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  attendanceActionText: {
    color: "#5BBA6F",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  noAttendanceCard: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noAttendanceIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(91, 186, 111, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noAttendanceText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 8,
    textAlign: "center",
  },
  noAttendanceSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  // Camera
  cameraContainer: {
    height: 500,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#5BBA6F",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  middleContainer: {
    flexDirection: "row",
    height: 250,
  },
  focusedContainer: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: "#5BBA6F",
    borderRadius: 16,
    overflow: "hidden",
  },
  scanLine: {
    width: "100%",
    height: 3,
    backgroundColor: "#5BBA6F",
    shadowColor: "#5BBA6F",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  // Control Buttons
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  button: {
    alignItems: "center",
    backgroundColor: "rgba(44, 44, 44, 0.8)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(91, 186, 111, 0.3)",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  scanAgainButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#5BBA6F",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scanAgainText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  // Header
  scanHeaderContainer: {
    position: "absolute",
    top: 30,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  scanHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
    backgroundColor: "rgba(44, 44, 44, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(91, 186, 111, 0.3)",
  },
  subHeaderText: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    backgroundColor: "rgba(44, 44, 44, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(91, 186, 111, 0.3)",
  },
  // Status Overlays
  processingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(44, 44, 44, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  processingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  successContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(91, 186, 111, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    textAlign: "center",
  },
  attendanceInfo: {
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    borderRadius: 12,
    width: "90%",
  },
  attendanceText: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(220, 53, 69, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryButtonText: {
    color: "#2C2C2C",
    fontSize: 16,
    fontWeight: "600",
  },
});
