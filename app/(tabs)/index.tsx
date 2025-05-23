import AttendanceStatusCard from "@/components/AttendanceStatusCard";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useTodayAttendance } from "@/hooks/useAttendance";
import { formatearFecha } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const {
    attendance: todayAttendance,
    loading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
    hasCheckedIn,
    hasCheckedOut,
    nextAction,
  } = useTodayAttendance();

  const isLoading = attendanceLoading;
  const hasError = attendanceError;

  const handleRefresh = async () => {
    await Promise.all([refetchAttendance()]);
  };

  const handleScanQR = () => {
    if (nextAction === "COMPLETED") {
      Alert.alert(
        "Jornada completada",
        "Ya has registrado tu entrada y salida para hoy.",
        [{ text: "OK" }]
      );
      return;
    }

    router.push("/scan");
  };

  const getActionButtonText = () => {
    switch (nextAction) {
      case "CHECK_IN":
        return "Escanear QR para marcar entrada";
      case "CHECK_OUT":
        return "Escanear QR para marcar salida";
      case "COMPLETED":
        return "Jornada completada";
      default:
        return "Escanear QR";
    }
  };

  const getActionButtonIcon = () => {
    switch (nextAction) {
      case "CHECK_IN":
        return "log-in-outline";
      case "CHECK_OUT":
        return "log-out-outline";
      case "COMPLETED":
        return "checkmark-circle-outline";
      default:
        return "qr-code-outline";
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getWorkingHours = () => {
    if (!todayAttendance?.checkInTime) return "Sin entrada";

    const checkIn = new Date(todayAttendance.checkInTime);
    const endTime = todayAttendance.checkOutTime
      ? new Date(todayAttendance.checkOutTime)
      : new Date();

    const diffMs = endTime.getTime() - checkIn.getTime();

    if (diffMs < 0) return "Hora inválida";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return todayAttendance.checkOutTime
      ? `${hours}h ${minutes}m trabajadas`
      : `${hours}h ${minutes}m trabajando`;
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.dateText}>{formatearFecha(new Date())}</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isLoading}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color="#0077B6"
              style={isLoading ? { opacity: 0.5 } : {}}
            />
          </TouchableOpacity>
        </View>

        {/* Working Hours Summary */}
        {hasCheckedIn && (
          <View style={styles.workingHoursCard}>
            <Ionicons name="time-outline" size={24} color="#0077B6" />
            <Text style={styles.workingHoursText}>{getWorkingHours()}</Text>
          </View>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <ErrorMessage message={attendanceError || "Error desconocido"} />
        )}

        {/* Loading State */}
        {isLoading && <LoadingIndicator />}

        {/* Content */}
        {!isLoading && !hasError && (
          <View style={styles.content}>
            {/* Attendance Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estado de Asistencia</Text>
              <AttendanceStatusCard
                attendance={todayAttendance}
                hasCheckedIn={hasCheckedIn}
                hasCheckedOut={hasCheckedOut}
                nextAction={nextAction}
              />
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                nextAction === "COMPLETED" && styles.actionButtonCompleted,
              ]}
              onPress={handleScanQR}
              disabled={nextAction === "COMPLETED"}
            >
              <Ionicons
                name={getActionButtonIcon() as any}
                size={24}
                color={nextAction === "COMPLETED" ? "#999999" : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  nextAction === "COMPLETED" &&
                    styles.actionButtonTextCompleted,
                ]}
              >
                {getActionButtonText()}
              </Text>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={styles.quickActionItem}
                  onPress={() => router.push("/attendance")}
                >
                  <Ionicons name="calendar-outline" size={24} color="#0077B6" />
                  <Text style={styles.quickActionText}>Historial</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionItem}
                  onPress={() => router.push("/profile")}
                >
                  <Ionicons name="person-outline" size={24} color="#0077B6" />
                  <Text style={styles.quickActionText}>Perfil</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#26252A", // Anthracite
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  content: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#CCCCCC",
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00FF78", // Poison Green
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  workingHoursCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  workingHoursText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00FF78",
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  actionButton: {
    backgroundColor: "#00FF78",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  actionButtonCompleted: {
    backgroundColor: "#666666",
  },
  actionButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  actionButtonTextCompleted: {
    color: "#CCCCCC",
  },
  quickActions: {
    gap: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#333333",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
  },
});
