import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useApp, TaskStatus } from '../context/AppContext';
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
  const { tasks, updateTaskStatus } = useApp();
  const { taskId } = route.params;
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (task.status === newStatus) return;
    setIsUpdating(true);
    try {
      await updateTaskStatus(task.id, newStatus);
    } catch (err) {
      console.warn('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return theme.colors.repair;
      case 'Medium':
        return theme.colors.maintenance;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'MAINTENANCE':
        return { color: theme.colors.maintenance, icon: 'maintenance' as const };
      case 'REPAIR':
        return { color: theme.colors.repair, icon: 'repair' as const };
      case 'INSPECTION':
      default:
        return { color: theme.colors.inspection, icon: 'inspection' as const };
    }
  };

  const getStatusBadgeStyle = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return { bg: '#E8F5E9', text: theme.colors.inspection };
      case 'In Progress':
        return { bg: theme.colors.primaryLight, text: theme.colors.primary };
      default:
        return { bg: '#ECEFF1', text: theme.colors.textSecondary };
    }
  };

  const statusStyle = getStatusBadgeStyle(task.status);
  const typeStyle = getTypeStyle(task.type);

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
              <Text style={styles.taskIdLabel}>Equipment ID</Text>
              <Text style={styles.taskIdVal}>{task.equipmentId}</Text>
            </View>

            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{task.status}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Task Name */}
          <View style={styles.detailRow}>
            <Text style={styles.fieldLabel}>Task Name</Text>
            <Text style={[styles.fieldVal, styles.bold]}>{task.taskName}</Text>
          </View>

          {/* Equipment Name */}
          <View style={styles.detailRow}>
            <Text style={styles.fieldLabel}>Equipment</Text>
            <Text style={styles.fieldVal}>{task.equipmentName}</Text>
          </View>

          {/* Area */}
          <View style={styles.detailRow}>
            <Text style={styles.fieldLabel}>Area</Text>
            <Text style={styles.fieldVal}>{task.area}</Text>
          </View>

          {/* Zone */}
          <View style={styles.detailRow}>
            <Text style={styles.fieldLabel}>Zone</Text>
            <Text style={styles.fieldVal}>{task.zone}</Text>
          </View>

          {/* Scheduled Date */}
          <View style={styles.detailRow}>
            <Text style={styles.fieldLabel}>Scheduled Date</Text>
            <Text style={styles.fieldVal}>{task.date}</Text>
          </View>

          {/* Priority */}
          <View style={styles.detailRow}>
            <Text style={styles.fieldLabel}>Priority</Text>
            <Text style={[styles.fieldVal, styles.bold, { color: getPriorityColor(task.priority) }]}>
              {task.priority}
            </Text>
          </View>

          {/* Task Type */}
          <View style={styles.detailRow}>
            <Text style={styles.fieldLabel}>Task Type</Text>
            <View style={styles.typeBadge}>
              <CustomIcon name={typeStyle.icon} size={14} color={typeStyle.color} />
              <Text style={[styles.typeText, { color: typeStyle.color }]}> {task.type}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Work Description */}
          <Text style={styles.descriptionLabel}>Work Description</Text>
          <Text style={styles.descriptionVal}>{task.description}</Text>
        </View>

        {/* Update Status Controls */}
        <View style={styles.controlsCard}>
          <Text style={styles.controlsTitle}>Update Task Status</Text>
          <Text style={styles.controlsSubtitle}>Change the progress status of this equipment task:</Text>
          
          <View style={styles.btnRow}>
            {/* Pending Button */}
            <TouchableOpacity
              style={[
                styles.statusBtn,
                task.status === 'Pending' && styles.activePendingBtn,
              ]}
              onPress={() => handleStatusChange('Pending')}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  task.status === 'Pending' && styles.activeBtnText,
                ]}
              >
                Pending
              </Text>
            </TouchableOpacity>

            {/* In Progress Button */}
            <TouchableOpacity
              style={[
                styles.statusBtn,
                task.status === 'In Progress' && styles.activeProgressBtn,
              ]}
              onPress={() => handleStatusChange('In Progress')}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  task.status === 'In Progress' && styles.activeBtnText,
                ]}
              >
                In Progress
              </Text>
            </TouchableOpacity>

            {/* Completed Button */}
            <TouchableOpacity
              style={[
                styles.statusBtn,
                task.status === 'Completed' && styles.activeCompletedBtn,
              ]}
              onPress={() => handleStatusChange('Completed')}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  task.status === 'Completed' && styles.activeBtnText,
                ]}
              >
                Completed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Status Change Loading Overlay */}
      {isUpdating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>Updating task status...</Text>
        </View>
      )}
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
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
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
  },
  fieldVal: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  bold: {
    fontWeight: '700',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  descriptionVal: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: theme.spacing.lg,
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  controlsSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBtn: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.bg,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activePendingBtn: {
    backgroundColor: '#CFD8DC',
    borderColor: '#90A4AE',
  },
  activeProgressBtn: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  activeCompletedBtn: {
    backgroundColor: '#E8F5E9',
    borderColor: theme.colors.inspection,
  },
  activeBtnText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});
