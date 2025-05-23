import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useQrAttendance } from '../../hooks/useAttendance';
import { AttendanceStatus } from '../../types';

export default function Scan() {
  const [facing, setFacing] = React.useState<CameraType>('back');
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
    if (scanStatus === 'READY' || scanStatus === 'SCANNING') {
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
    if (scanStatus === 'SUCCESS') {
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
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  // Verificar permisos de cámara
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.message}>
            Necesitamos tu permiso para acceder a la cámara
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
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
          <ActivityIndicator size="large" color="#2196F3" />
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
      todayAttendance.checkInTime && todayAttendance.checkInTime !== '';
    const hasCheckedOut =
      todayAttendance.checkOutTime && todayAttendance.checkOutTime !== '';

    return (
      <View style={styles.attendanceCard}>
        <Text style={styles.attendanceCardTitle}>Asistencia de hoy</Text>
        <View style={styles.attendanceCardContent}>
          {hasCheckedIn && (
            <View style={styles.attendanceItem}>
              <Ionicons
                name="log-in-outline"
                size={24}
                color={
                  todayAttendance.status === AttendanceStatus.ON_TIME
                    ? '#4CAF50'
                    : '#FF9800'
                }
              />
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
                          ? '#4CAF50'
                          : '#FF9800',
                    },
                  ]}
                >
                  {todayAttendance.status === AttendanceStatus.ON_TIME
                    ? 'A tiempo'
                    : 'Con retraso'}
                </Text>
              </View>
            </View>
          )}

          {hasCheckedOut && (
            <View style={styles.attendanceItem}>
              <Ionicons name="log-out-outline" size={24} color="#4CAF50" />
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
    if (!timeString) return '';

    // Si es una fecha ISO completa, extraer solo la hora
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Si ya es formato HH:MM, devolverlo directamente
    return timeString;
  };

  // Renderizar el estado de procesamiento
  const renderProcessingState = () => {
    if (scanStatus === 'PROCESSING') {
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
    if (scanStatus === 'SUCCESS') {
      return (
        <Animated.View
          style={[styles.successContainer, { opacity: successOpacity }]}
        >
          <Ionicons name="checkmark-circle" size={80} color="white" />
          <Text style={styles.successText}>{message}</Text>
          {attendance && (
            <View style={styles.attendanceInfo}>
              <Text style={styles.attendanceText}>
                Hora:{' '}
                {formatTime(
                  attendance.checkInTime || attendance.checkOutTime || ''
                )}
              </Text>
              {attendance.status && (
                <Text style={styles.attendanceText}>
                  Estado:{' '}
                  {attendance.status === AttendanceStatus.ON_TIME
                    ? 'A tiempo'
                    : 'Con retraso'}
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
    if (scanStatus === 'ERROR') {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={80} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={resetScan}>
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
      todayAttendance.checkInTime === ''
    ) {
      return 'Escanea el código QR para registrar tu entrada';
    } else if (
      !todayAttendance.checkOutTime ||
      todayAttendance.checkOutTime === ''
    ) {
      return 'Escanea el código QR para registrar tu salida';
    } else {
      return 'Has completado tu jornada de hoy';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderAttendanceCard()}

        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={isScanned ? undefined : handleBarCodeScanned}
          >
            {/* Overlay para el área de escaneo */}
            <View style={styles.overlay}>
              <View style={styles.unfocusedContainer}></View>
              <View style={styles.middleContainer}>
                <View style={styles.unfocusedContainer}></View>
                <View style={styles.focusedContainer}>
                  {(scanStatus === 'READY' || scanStatus === 'SCANNING') && (
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
                disabled={scanStatus === 'PROCESSING'}
              >
                <Ionicons name="camera-reverse" size={30} color="white" />
                <Text style={styles.text}>Cambiar cámara</Text>
              </TouchableOpacity>

              {isScanned && scanStatus !== 'PROCESSING' && (
                <TouchableOpacity
                  style={styles.scanAgainButton}
                  onPress={resetScan}
                >
                  <Text style={styles.scanAgainText}>Escanear de nuevo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Encabezado con instrucciones */}
            <View style={styles.scanHeaderContainer}>
              <Text style={styles.scanHeaderText}>{getHeaderText()}</Text>
              <Text style={styles.subHeaderText}>
                {scanStatus === 'READY' || scanStatus === 'SCANNING'
                  ? 'Coloca el código dentro del marco'
                  : scanStatus === 'PROCESSING'
                  ? 'Procesando...'
                  : scanStatus === 'SUCCESS'
                  ? '¡Asistencia registrada!'
                  : 'Error al procesar'}
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  attendanceCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendanceCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  attendanceCardContent: {
    gap: 16,
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attendanceItemContent: {
    flex: 1,
  },
  attendanceItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  attendanceItemTime: {
    fontSize: 14,
    color: '#666',
  },
  attendanceItemStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  attendanceAction: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  attendanceActionText: {
    color: '#666',
    fontSize: 14,
  },
  noAttendanceCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noAttendanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noAttendanceSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cameraContainer: {
    height: 500,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 50,
    padding: 15,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  middleContainer: {
    flexDirection: 'row',
    height: 250,
  },
  focusedContainer: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#00e5ff',
  },
  processingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  processingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  successContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 150, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  attendanceInfo: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    width: '80%',
  },
  attendanceText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(150, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanAgainButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#2196F3',
    borderRadius: 25,
  },
  scanAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanHeaderContainer: {
    position: 'absolute',
    top: 20,
    width: '100%',
    alignItems: 'center',
  },
  scanHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subHeaderText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
});
