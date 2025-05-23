import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Attendance, AttendanceStatus } from '../types';

interface AttendanceStatusCardProps {
  attendance: Attendance | null;
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  nextAction: 'CHECK_IN' | 'CHECK_OUT' | 'COMPLETED';
}

export default function AttendanceStatusCard({
  attendance,
  hasCheckedIn,
  hasCheckedOut,
  nextAction,
}: AttendanceStatusCardProps) {
  const getStatusColor = () => {
    if (!hasCheckedIn) return '#FFA726'; // Naranja para pendiente
    if (attendance?.status === AttendanceStatus.ON_TIME) return '#4CAF50'; // Verde para a tiempo
    if (attendance?.status === AttendanceStatus.LATE) return '#FF7043'; // Rojo para tarde
    return '#9E9E9E'; // Gris por defecto
  };

  const getStatusText = () => {
    if (!hasCheckedIn) return 'Pendiente de entrada';
    if (!hasCheckedOut) return 'En el trabajo';
    return 'Jornada completada';
  };

  const getStatusIcon = () => {
    if (!hasCheckedIn) return 'time-outline';
    if (!hasCheckedOut) return 'business-outline';
    return 'checkmark-circle-outline';
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return '--:--';

    // Si es una fecha ISO completa, extraer solo la hora
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return timeString;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        >
          <Ionicons name={getStatusIcon() as any} size={24} color="white" />
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {attendance?.status && (
            <Text style={[styles.statusDetail, { color: getStatusColor() }]}>
              {attendance.status === AttendanceStatus.ON_TIME
                ? 'A tiempo'
                : 'Con retraso'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.timesContainer}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>Entrada</Text>
          <Text
            style={[
              styles.timeValue,
              { color: hasCheckedIn ? '#333' : '#999' },
            ]}
          >
            {formatTime(attendance?.checkInTime)}
          </Text>
          {attendance?.scheduleEntryTime && (
            <Text style={styles.scheduledTime}>
              Programada: {formatTime(attendance.scheduleEntryTime)}
            </Text>
          )}
        </View>

        <View style={styles.separator} />

        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>Salida</Text>
          <Text
            style={[
              styles.timeValue,
              { color: hasCheckedOut ? '#333' : '#999' },
            ]}
          >
            {formatTime(attendance?.checkOutTime)}
          </Text>
          {attendance?.scheduleExitTime && (
            <Text style={styles.scheduledTime}>
              Programada: {formatTime(attendance.scheduleExitTime)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  statusDetail: {
    fontSize: 14,
    fontWeight: '500',
  },
  timesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  scheduledTime: {
    fontSize: 12,
    color: '#999999',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
});
