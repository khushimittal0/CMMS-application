import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useApp, Task } from '../context/AppContext';
import { CustomHeader } from '../components/CustomHeader';
import { CustomIcon } from '../components/CustomIcon';
import { SidebarModal } from '../components/SidebarModal';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Profile: undefined;
  TaskDetails: { taskId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TasksScreen() {
  const { tasks, isLoadingTasks, fetchTasks } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScreenLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    return (
      task.taskName.toLowerCase().includes(query) ||
      task.areaName.toLowerCase().includes(query) ||
      task.zoneName.toLowerCase().includes(query) ||
      task.equipments.some((eq) => eq.toLowerCase().includes(query))
    );
  });

  const handleSidebarNavigation = (screenName: 'Tasks' | 'Profile') => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <CustomHeader showMenu={true} onMenuPress={() => setSidebarVisible(true)} />

      {/* Screen Title & Controls */}
      <View style={styles.contentHeader}>
        {/* Back Link to Dashboard */}
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.navigate('Dashboard')}
          activeOpacity={0.7}
        >
          <CustomIcon name="chevron-right" size={14} color={theme.colors.primary} />
          <Text style={styles.backLinkText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>My Tasks ({tasks.length})</Text>
          {/* Refresh button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => fetchTasks()}
            activeOpacity={0.7}
            disabled={isLoadingTasks}
          >
            {isLoadingTasks ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
              <Text style={styles.refreshButtonText}>↻ Refresh</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by task name, area, zone, or equipment..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isScreenLoading ? (
        <View style={styles.screenLoader}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.screenLoaderText}>Loading task list...</Text>
        </View>
      ) : (
        /* Tasks Table */
        <View style={styles.tableWrapper}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.cellTaskName]}>Task Name</Text>
            <Text style={[styles.headerCell, styles.cellArea]}>Area</Text>
            <Text style={[styles.headerCell, styles.cellZone]}>Zone</Text>
            <Text style={[styles.headerCell, styles.cellEquipments]}>Equipments</Text>
          </View>

          <ScrollView contentContainerStyle={styles.tableBody}>
            {filteredTasks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {tasks.length === 0
                    ? 'No tasks assigned to you yet'
                    : 'No matching tasks found'}
                </Text>
              </View>
            ) : (
              filteredTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.tableRow}
                  onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.rowCell, styles.cellTaskName]}>
                    <Text style={styles.taskNameText} numberOfLines={2}>{task.taskName}</Text>
                  </View>

                  <View style={[styles.rowCell, styles.cellArea]}>
                    <Text style={styles.cellText} numberOfLines={2}>{task.areaName}</Text>
                  </View>

                  <View style={[styles.rowCell, styles.cellZone]}>
                    <Text style={styles.cellText} numberOfLines={1}>{task.zoneName}</Text>
                  </View>

                  <View style={[styles.rowCell, styles.cellEquipments]}>
                    <Text style={styles.cellText} numberOfLines={2}>
                      {task.equipments.length > 0
                        ? task.equipments.join(', ')
                        : '—'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* Slide-out Sidebar Drawer Modal */}
      {sidebarVisible && (
        <SidebarModal
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onNavigate={handleSidebarNavigation}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  contentHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryLight,
  },
  refreshButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    transform: [{ rotate: '180deg' }],
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: 4,
    transform: [{ rotate: '180deg' }],
  },
  searchContainer: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  tableWrapper: {
    flex: 1,
    margin: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tableHeader: {
    height: 44,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  headerCell: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tableBody: {
    flexGrow: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowCell: {
    justifyContent: 'center',
  },
  cellTaskName: {
    width: '30%',
  },
  taskNameText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  cellArea: {
    width: '25%',
  },
  cellZone: {
    width: '18%',
  },
  cellEquipments: {
    width: '27%',
  },
  cellText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  screenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
  },
  screenLoaderText: {
    marginTop: 12,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});
