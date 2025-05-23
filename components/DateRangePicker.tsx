'use client';

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DateRange } from '@/hooks/useAttendance';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  visible: boolean;
  onClose: () => void;
}

export default function DateRangePicker({
  dateRange,
  onDateRangeChange,
  visible,
  onClose,
}: DateRangePickerProps) {
  const [tempStartDate, setTempStartDate] = useState(dateRange.startDate);
  const [tempEndDate, setTempEndDate] = useState(dateRange.endDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleApply = () => {
    if (tempEndDate >= tempStartDate) {
      onDateRangeChange({
        startDate: tempStartDate,
        endDate: tempEndDate,
      });
      onClose();
    }
  };

  const handleQuickSelect = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    setTempStartDate(startDate);
    setTempEndDate(endDate);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar Período</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.quickSelectContainer}>
            <Text style={styles.sectionTitle}>Selección Rápida</Text>
            <View style={styles.quickSelectGrid}>
              <TouchableOpacity
                style={styles.quickSelectButton}
                onPress={() => handleQuickSelect(7)}
              >
                <Text style={styles.quickSelectText}>7 días</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickSelectButton}
                onPress={() => handleQuickSelect(30)}
              >
                <Text style={styles.quickSelectText}>30 días</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickSelectButton}
                onPress={() => handleQuickSelect(90)}
              >
                <Text style={styles.quickSelectText}>90 días</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.sectionTitle}>Rango Personalizado</Text>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Desde:</Text>
              <Text style={styles.dateValue}>{formatDate(tempStartDate)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Hasta:</Text>
              <Text style={styles.dateValue}>{formatDate(tempEndDate)}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  quickSelectContainer: {
    marginBottom: 24,
  },
  quickSelectGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickSelectButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickSelectText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  dateContainer: {
    marginBottom: 24,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateLabel: {
    fontSize: 16,
    color: '#666666',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#0077B6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
