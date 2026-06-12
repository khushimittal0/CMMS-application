import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { useApp, TaskStatus } from '../context/AppContext';
import { CustomHeader } from '../components/CustomHeader';
import { CustomIcon } from '../components/CustomIcon';
import { theme } from '../styles/theme';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getRemarksApi, TaskRemark } from '../services/api';

type RootStackParamList = {
  Tasks: undefined;
  TaskDetails: { taskId: string };
  Dashboard: undefined;
  Profile: undefined;
};

type TaskDetailsRouteProp = RouteProp<RootStackParamList, 'TaskDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TaskDetailsScreen() {
  const route = useRoute<TaskDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { tasks, updateTaskStatus, token, addRemark, user, logout } = useApp();
  const { taskId } = route.params;
  const [isUpdating, setIsUpdating] = useState(false);

  const [remarks, setRemarks] = useState<TaskRemark[]>([]);
  const [remarkText, setRemarkText] = useState('');
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const getAvatarColor = (name: string) => {
    const colors = [
      '#0C60B5', // Primary blue
      '#E2B93B', // Amber
      '#D9534F', // Red
      '#4CAF50', // Green
      '#3F51B5', // Indigo
      '#9C27B0', // Purple
      '#009688', // Teal
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

  const task = tasks.find((t) => t.id === taskId);

  useEffect(() => {
    async function loadRemarks() {
      if (!token) return;
      setIsLoadingRemarks(true);
      try {
        const data = await getRemarksApi(parseInt(taskId, 10), token);
        setRemarks(data);
      } catch (err) {
        console.warn('Failed to load remarks:', err);
      } finally {
        setIsLoadingRemarks(false);
      }
    }
    loadRemarks();
  }, [taskId, token]);

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

  const handleAddRemark = async () => {
    if (!remarkText.trim() || !token) return;
    try {
      await addRemark(taskId, remarkText.trim());
      
      const newRemark: TaskRemark = {
        id: Date.now(),
        taskId: parseInt(taskId, 10),
        remarkText: remarkText.trim(),
        createdBy: user?.username ?? 'me',
        createdAt: new Date().toISOString(),
      };
      setRemarks((prev) => [newRemark, ...prev]);
      setRemarkText('');
    } catch (err) {
      console.warn('Failed to add remark:', err);
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

  const renderSidebar = () => {
    return (
      <View style={styles.sidebarContainer}>
        {user && (
          <View style={styles.sidebarProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.username[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.sidebarUsername}>{user.username}</Text>
            <Text style={styles.sidebarRole}>{user.roles?.[0] ?? 'Operator'}</Text>
          </View>
        )}
        <View style={styles.sidebarDivider} />
        
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <CustomIcon name="home" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.sidebarItemText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sidebarItem, styles.sidebarItemActive]}
          onPress={() => navigation.navigate('Tasks')}
        >
          <CustomIcon name="tasks" size={18} color={theme.colors.primary} />
          <Text style={[styles.sidebarItemText, styles.sidebarItemTextActive]}>Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <CustomIcon name="profile" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.sidebarItemText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sidebarItem, styles.sidebarLogout]}
          onPress={logout}
        >
          <CustomIcon name="logout" size={18} color="#F44336" />
          <Text style={styles.sidebarLogoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <CustomHeader showMenu={!isTablet || !isLandscape} onMenuPress={() => navigation.navigate('Tasks')} />

      <View style={styles.mainLayout}>
        {isTablet && isLandscape && renderSidebar()}

        <View style={styles.contentContainer}>
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

            {/* Remarks Section */}
            <View style={styles.remarksCard}>
              <Text style={styles.remarksTitle}>Remarks & Notes</Text>
              <Text style={styles.remarksSubtitle}>Recent updates and notes on this task:</Text>

              {/* Add Remark Input */}
              <View style={styles.addRemarkContainer}>
                <TextInput
                  style={[
                    styles.remarkInput,
                    isInputFocused && { borderColor: theme.colors.primary, backgroundColor: '#FFFFFF' }
                  ]}
                  placeholder="Add a new remark..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={remarkText}
                  onChangeText={setRemarkText}
                  multiline
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                />
                <TouchableOpacity 
                  style={[styles.saveRemarkBtn, !remarkText.trim() && styles.disabledBtn]} 
                  onPress={handleAddRemark}
                  disabled={!remarkText.trim()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveRemarkBtnText}>Save Remark</Text>
                </TouchableOpacity>
              </View>

              {isLoadingRemarks ? (
                <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 12 }} />
              ) : remarks.length === 0 ? (
                <Text style={styles.noRemarksText}>No remarks added yet.</Text>
              ) : (
                <View style={styles.remarksList}>
                  {remarks.map((item, index) => (
                    <View key={item.id} style={styles.timelineItem}>
                      {/* Left timeline line and dot */}
                      <View style={styles.timelineLeft}>
                        <View style={[styles.avatarCircle, { backgroundColor: getAvatarColor(item.createdBy) }]}>
                          <Text style={styles.avatarLetter}>{item.createdBy[0].toUpperCase()}</Text>
                        </View>
                        {index < remarks.length - 1 && <View style={styles.timelineLine} />}
                      </View>

                      {/* Right remark content card */}
                      <View style={styles.remarkContentCard}>
                        <View style={styles.remarkHeader}>
                          <Text style={styles.remarkUser}>{item.createdBy}</Text>
                          <Text style={styles.remarkTime}>
                            {new Date(item.createdAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <Text style={styles.remarkText}>{item.remarkText}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Status Change Loading Overlay */}
      {isUpdating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>Updating task status...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarContainer: {
    width: 240,
    backgroundColor: theme.colors.headerBg,
    borderRightWidth: 1,
    borderRightColor: '#222222',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  sidebarProfile: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  sidebarUsername: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  sidebarRole: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: theme.spacing.md,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  sidebarItemActive: {
    backgroundColor: theme.colors.primary + '15',
  },
  sidebarItemText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  sidebarItemTextActive: {
    color: theme.colors.primary,
  },
  sidebarLogout: {
    marginTop: 'auto',
  },
  sidebarLogoutText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  contentContainer: {
    flex: 1,
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
    marginBottom: theme.spacing.md,
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
  remarksCard: {
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
  remarksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  remarksSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  addRemarkContainer: {
    marginBottom: theme.spacing.md,
  },
  remarkInput: {
    minHeight: 80,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.sm,
  },
  saveRemarkBtn: {
    height: 38,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledBtn: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveRemarkBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  noRemarksText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  remarksList: {
    marginTop: theme.spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
    width: 36,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
    zIndex: 1,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timelineLine: {
    position: 'absolute',
    top: 36,
    bottom: -16, // extends to the next item
    width: 2,
    backgroundColor: theme.colors.border,
    zIndex: 0,
  },
  remarkContentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  remarkUser: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  remarkTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  remarkText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
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
