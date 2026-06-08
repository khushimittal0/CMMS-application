import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useApp, Task, TaskType, TaskStatus } from '../context/AppContext';
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
  const { tasks } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<'ALL' | TaskType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScreenLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Calculate dynamic tab counts
  const getTabCount = (tab: 'ALL' | TaskType) => {
    if (tab === 'ALL') return tasks.length;
    return tasks.filter((t) => t.type === tab).length;
  };

  // Filter tasks based on selected tab and search query
  const filteredTasks = tasks.filter((task) => {
    const matchesTab = activeTab === 'ALL' || task.type === activeTab;
    const matchesSearch =
      task.equipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const renderTab = (tab: 'ALL' | TaskType, label: string) => {
    const isActive = activeTab === tab;
    const count = getTabCount(tab);
    
    // Choose status indicator color
    let indicatorColor = theme.colors.primary;
    if (tab === 'MAINTENANCE') indicatorColor = theme.colors.maintenance;
    if (tab === 'REPAIR') indicatorColor = theme.colors.repair;
    if (tab === 'INSPECTION') indicatorColor = theme.colors.inspection;

    return (
      <TouchableOpacity
        key={tab}
        style={[
          styles.tabItem,
          isActive && styles.activeTabItem,
          isActive && { borderBottomColor: indicatorColor }
        ]}
        onPress={() => setActiveTab(tab)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.tabText, isActive && styles.activeTabText]}
          numberOfLines={1}
        >
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  // Return priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return theme.colors.repair;
      case 'Medium':
        return theme.colors.maintenance;
      case 'Low':
      default:
        return theme.colors.inspection;
    }
  };

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
          <Text style={styles.screenTitle}>Tasks Management</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, equipment, area or zone..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs list */}
      <View style={styles.tabsContainer}>
        {renderTab('ALL', 'ALL')}
        {renderTab('MAINTENANCE', 'MAINTENANCE')}
        {renderTab('REPAIR', 'REPAIR')}
        {renderTab('INSPECTION', 'INSPECTION')}
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
            <Text style={[styles.headerCell, styles.cellId]}>Equipment ID</Text>
            <Text style={[styles.headerCell, styles.cellEquipment]}>Equipment</Text>
            <Text style={[styles.headerCell, styles.cellArea]}>Area</Text>
            <Text style={[styles.headerCell, styles.cellZone]}>Zone</Text>
          </View>

          <ScrollView contentContainerStyle={styles.tableBody}>
            {filteredTasks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items found</Text>
              </View>
            ) : (
              filteredTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.tableRow}
                  onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.rowCell, styles.cellId]}>
                    <Text style={styles.idText}>{task.equipmentId}</Text>
                    {/* Status Indicator circle */}
                    <View style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          task.status === 'Completed'
                            ? theme.colors.inspection
                            : task.status === 'In Progress'
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                      }
                    ]} />
                  </View>
                  
                  <View style={[styles.rowCell, styles.cellEquipment]}>
                    <Text style={styles.cellText}>{task.equipmentName}</Text>
                    <Text style={styles.taskTypeSubtitle}>{task.type}</Text>
                  </View>

                  <View style={[styles.rowCell, styles.cellArea]}>
                    <Text style={styles.cellText}>{task.area}</Text>
                  </View>

                  <View style={[styles.rowCell, styles.cellZone]}>
                    <View style={styles.zoneWrapper}>
                      <Text style={styles.cellText}>{task.zone}</Text>
                      {/* Priority badge */}
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '15' }]}>
                        <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                          {task.priority[0]}
                        </Text>
                      </View>
                    </View>
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
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    transform: [{ rotate: '180deg' }], // Chevrons point left
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
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  activeTabText: {
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
  cellId: {
    width: '25%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  idText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
    marginRight: 6,
  },
  cellEquipment: {
    width: '35%',
  },
  cellArea: {
    width: '22%',
  },
  cellZone: {
    width: '18%',
  },
  cellText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  taskTypeSubtitle: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  zoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 4,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700',
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
