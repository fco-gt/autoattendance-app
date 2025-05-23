import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Attendance, AttendanceStatus } from '@/types';
import { formatearHora } from '@/utils/dateUtils';

interface AttendanceCardProps {
  attendance: Attendance;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ attendance }) => {
  const getStatusColor = (status: AttendanceStatus) => {
    return status === AttendanceStatus.ON_TIME ? '#06D6A0' : '#EF476F';
  };

  const getStatusText = (status: AttendanceStatus) => {
    return status === AttendanceStatus.ON_TIME ? 'A tiempo' : 'Atrasado';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(attendance.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(attendance.status)}</Text>
        </View>
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Check In</Text>
          <Text style={styles.timeValue}>
            {attendance.checkInTime ? formatearHora(attendance.checkInTime) : '--:--'}
          </Text>
          <Text style={styles.scheduledTime}>
            Scheduled: {formatearHora(attendance.scheduleEntryTime)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Check Out</Text>
          <Text style={styles.timeValue}>
            {attendance.checkOutTime ? formatearHora(attendance.checkOutTime) : '--:--'}
          </Text>
          <Text style={styles.scheduledTime}>
            Scheduled: {formatearHora(attendance.scheduleExitTime)}
          </Text>
        </View>
      </View>

      {attendance.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{attendance.notes}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  timeBlock: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  scheduledTime: {
    fontSize: 12,
    color: '#888888',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  notesContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#333333',
  },
});

export default AttendanceCard;