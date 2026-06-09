import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { CustomHeader } from '../components/CustomHeader';
import { CustomIcon } from '../components/CustomIcon';
import { theme } from '../styles/theme';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Tasks: undefined;
  TaskDetails: { taskId: string };
};

type TaskDetailsRouteProp = RouteProp<RootStackParamList, 'TaskDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TaskDetailsScreen() {
  const route = useRoute<TaskDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { tasks } = useApp();
  const { taskId } = route.params;

  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return (
      <View style={styles.container}>
        <CustomHeader showMenu={true} onMenuPress={() => navigation.navigate('Tasks')} />
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Task not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader showMenu={true} onMenuPress={() => navigation.navigate('Tasks')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navigation back row */}
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-right" size={16} color={theme.colors.primary} />
          <Text style={styles.backLinkText}>Back to Tasks</Text>
        </TouchableOpacity>

        {/* Task Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.idContainer}>
              <Text style={styles.taskIdLabel}>Task ID</Text>
              <Text style={styles.taskIdVal}>#{task.id}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Task Name */}
          <View style={styles.detailRow}>
            <Text style={styles.fieldLabel}>Task Name</Text>
            <Text style={[styles.fieldVal, styles.bold]}>{task.taskName}</Text>
          </View>

          {/* Area */}
          <View style={styles.detailRow}>
            <Text style={styles.fieldLabel}>Area</Text>
            <Text style={styles.fieldVal}>{task.areaName}</Text>
          </View>

          {/* Zone */}
          <View style={styles.detailRow}>
            <Text style={styles.fieldLabel}>Zone</Text>
            <Text style={styles.fieldVal}>{task.zoneName}</Text>
          </View>

          {/* Operator */}
          <View style={styles.detailRow}>
            <Text style={styles.fieldLabel}>Assigned To</Text>
            <Text style={styles.fieldVal}>{task.operatorName}</Text>
          </View>

          {/* Created By */}
          {task.createdBy && (
            <View style={styles.detailRow}>
              <Text style={styles.fieldLabel}>Created By</Text>
              <Text style={styles.fieldVal}>{task.createdBy}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Equipments Section */}
          <Text style={styles.sectionTitle}>Equipments</Text>
          {task.equipments.length > 0 ? (
            task.equipments.map((eq, index) => (
              <View key={index} style={styles.equipmentItem}>
                <View style={styles.equipmentDot} />
                <Text style={styles.equipmentText}>{eq}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noEquipmentText}>No equipments assigned</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    transform: [{ rotate: '180deg' }],
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: 4,
    transform: [{ rotate: '180deg' }],
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idContainer: {
    flexDirection: 'column',
  },
  taskIdLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  taskIdVal: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  fieldVal: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  bold: {
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.bg,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 4,
  },
  equipmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  equipmentText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  noEquipmentText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  backBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
