'use client';

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAttendanceHistory, type TimePeriod } from '@/hooks/useAttendance';
import AttendanceStatsCard from '@/components/AttendanceStatsCard';
import AttendanceHistoryItem from '@/components/AttendanceHistoryItem';
import DateRangePicker from '@/components/DateRangePicker';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingIndicator from '@/components/LoadingIndicator';

export default function AttendanceScreen() {
  const {
    attendanceHistory,
    loading,
    refreshing,
    error,
    selectedPeriod,
    dateRange,
    stats,
    setSelectedPeriod,
    setCustomDateRange,
    onRefresh,
  } = useAttendanceHistory();

  const [showDatePicker, setShowDatePicker] = useState(false);

  const periodOptions: { key: TimePeriod; label: string }[] = [
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
    { key: 'quarter', label: 'Trimestre' },
    { key: 'custom', label: 'Personalizado' },
  ];

  const formatDateRange = () => {
    const startDate = dateRange.startDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
    const endDate = dateRange.endDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
    return `${startDate} - ${endDate}`;
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {periodOptions.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.periodButton,
            selectedPeriod === option.key && styles.selectedPeriodButton,
          ]}
          onPress={() => {
            if (option.key === 'custom') {
              setShowDatePicker(true);
            } else {
              setSelectedPeriod(option.key);
            }
          }}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === option.key && styles.selectedPeriodButtonText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateText}>No hay registros de asistencia</Text>
      <Text style={styles.emptyStateSubtext}>
        Los registros aparecerán aquí una vez que comiences a marcar asistencia
      </Text>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <AttendanceStatsCard stats={stats} />
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Historial de Asistencias</Text>
        <Text style={styles.dateRangeText}>{formatDateRange()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.title}>Historial de Asistencias</Text>
        {renderPeriodSelector()}
      </View>

      {loading && !refreshing ? (
        <LoadingIndicator />
      ) : error ? (
        <View style={styles.errorContainer}>
          <ErrorMessage message={error} />
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={attendanceHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AttendanceHistoryItem
              attendance={item}
              onPress={() => {
                // Aquí podrías navegar a una pantalla de detalles
                console.log('Ver detalles de:', item.id);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={renderListHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0077B6']}
              tintColor="#0077B6"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={setCustomDateRange}
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedPeriodButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  selectedPeriodButtonText: {
    color: '#0077B6',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  listHeader: {
    marginBottom: 24,
  },
  historyHeader: {
    marginTop: 24,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  dateRangeText: {
    fontSize: 14,
    color: '#666666',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    backgroundColor: '#0077B6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
