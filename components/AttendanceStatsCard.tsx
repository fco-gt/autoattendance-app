import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AttendanceStats } from '@/hooks/useAttendance';

interface AttendanceStatsCardProps {
  stats: AttendanceStats;
}

export default function AttendanceStatsCard({
  stats,
}: AttendanceStatsCardProps) {
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return '#4CAF50';
    if (rate >= 75) return '#FFA726';
    return '#FF7043';
  };

  const getPunctualityColor = (rate: number) => {
    if (rate >= 95) return '#4CAF50';
    if (rate >= 80) return '#FFA726';
    return '#FF7043';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas del Período</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="calendar-outline" size={24} color="#2196F3" />
          </View>
          <Text style={styles.statValue}>{stats.totalDays}</Text>
          <Text style={styles.statLabel}>Días totales</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#E8F5E8' }]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="#4CAF50"
            />
          </View>
          <Text style={styles.statValue}>{stats.presentDays}</Text>
          <Text style={styles.statLabel}>Días presentes</Text>
        </View>

        <View style={styles.statItem}>
          <View
            style={[
              styles.statIcon,
              {
                backgroundColor:
                  getAttendanceColor(stats.attendanceRate) + '20',
              },
            ]}
          >
            <Ionicons
              name="trending-up-outline"
              size={24}
              color={getAttendanceColor(stats.attendanceRate)}
            />
          </View>
          <Text
            style={[
              styles.statValue,
              { color: getAttendanceColor(stats.attendanceRate) },
            ]}
          >
            {formatPercentage(stats.attendanceRate)}
          </Text>
          <Text style={styles.statLabel}>Asistencia</Text>
        </View>

        <View style={styles.statItem}>
          <View
            style={[
              styles.statIcon,
              {
                backgroundColor:
                  getPunctualityColor(stats.punctualityRate) + '20',
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={24}
              color={getPunctualityColor(stats.punctualityRate)}
            />
          </View>
          <Text
            style={[
              styles.statValue,
              { color: getPunctualityColor(stats.punctualityRate) },
            ]}
          >
            {formatPercentage(stats.punctualityRate)}
          </Text>
          <Text style={styles.statLabel}>Puntualidad</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <View style={styles.detailIndicator} />
          <Text style={styles.detailText}>
            A tiempo: {stats.onTimeDays} días
          </Text>
        </View>
        <View style={styles.detailItem}>
          <View
            style={[styles.detailIndicator, { backgroundColor: '#FF7043' }]}
          />
          <Text style={styles.detailText}>
            Con retraso: {stats.lateDays} días
          </Text>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
  },
});
