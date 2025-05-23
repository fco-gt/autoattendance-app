import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type Attendance, AttendanceStatus, AttendanceMethod } from '../types';

interface AttendanceHistoryItemProps {
  attendance: Attendance;
  onPress?: () => void;
}

export default function AttendanceHistoryItem({
  attendance,
  onPress,
}: AttendanceHistoryItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  };

  const formatTime = (timeString: string) => {
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

  const getStatusColor = () => {
    switch (attendance.status) {
      case AttendanceStatus.ON_TIME:
        return '#4CAF50';
      case AttendanceStatus.LATE:
        return '#FF7043';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (attendance.status) {
      case AttendanceStatus.ON_TIME:
        return 'A tiempo';
      case AttendanceStatus.LATE:
        return 'Con retraso';
      default:
        return 'Sin estado';
    }
  };

  const getMethodIcon = (method: AttendanceMethod) => {
    switch (method) {
      case AttendanceMethod.QR:
        return 'qr-code-outline';
      case AttendanceMethod.NFC:
        return 'radio-outline';
      case AttendanceMethod.MANUAL:
        return 'hand-left-outline';
      default:
        return 'help-outline';
    }
  };

  const hasCheckedIn = attendance.checkInTime && attendance.checkInTime !== '';
  const hasCheckedOut =
    attendance.checkOutTime && attendance.checkOutTime !== '';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(attendance.date)}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor() },
              ]}
            />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </View>

      <View style={styles.timesContainer}>
        <View style={styles.timeItem}>
          <View style={styles.timeHeader}>
            <Ionicons name="log-in-outline" size={16} color="#4CAF50" />
            <Text style={styles.timeLabel}>Entrada</Text>
            {hasCheckedIn && (
              <Ionicons
                name={getMethodIcon(attendance.methodIn) as any}
                size={14}
                color="#666666"
              />
            )}
          </View>
          <Text
            style={[
              styles.timeValue,
              { color: hasCheckedIn ? '#333333' : '#CCCCCC' },
            ]}
          >
            {formatTime(attendance.checkInTime)}
          </Text>
          <Text style={styles.scheduledTime}>
            Programada: {formatTime(attendance.scheduleEntryTime)}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.timeItem}>
          <View style={styles.timeHeader}>
            <Ionicons name="log-out-outline" size={16} color="#FF7043" />
            <Text style={styles.timeLabel}>Salida</Text>
            {hasCheckedOut && (
              <Ionicons
                name={getMethodIcon(attendance.methodOut) as any}
                size={14}
                color="#666666"
              />
            )}
          </View>
          <Text
            style={[
              styles.timeValue,
              { color: hasCheckedOut ? '#333333' : '#CCCCCC' },
            ]}
          >
            {formatTime(attendance.checkOutTime)}
          </Text>
          <Text style={styles.scheduledTime}>
            Programada: {formatTime(attendance.scheduleExitTime)}
          </Text>
        </View>
      </View>

      {attendance.notes && attendance.notes.trim() !== '' && (
        <View style={styles.notesContainer}>
          <Ionicons name="document-text-outline" size={16} color="#666666" />
          <Text style={styles.notesText}>{attendance.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeItem: {
    flex: 1,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
    flex: 1,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  scheduledTime: {
    fontSize: 12,
    color: '#999999',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
