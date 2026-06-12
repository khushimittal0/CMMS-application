import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
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
  const { tasks, isLoadingTasks, fetchTasks, isOnline, backendStatus, syncingCount, syncOfflineQueue, user, logout } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<'ALL' | TaskType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [tabletViewMode, setTabletViewMode] = useState<'CARD' | 'TABLE'>('TABLE');

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

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
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      task.equipmentId.toLowerCase().includes(query) ||
      task.equipmentName.toLowerCase().includes(query) ||
      task.area.toLowerCase().includes(query) ||
      task.zone.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return '#4CAF50'; // Green
      case 'In Progress':
        return '#2196F3'; // Blue
      case 'Cancelled':
        return '#F44336'; // Red
      default:
        return '#FFC107'; // Yellow (Pending)
    }
  };

  const getTypeColor = (type: TaskType) => {
    switch (type) {
      case 'MAINTENANCE':
        return theme.colors.maintenance;
      case 'REPAIR':
        return theme.colors.repair;
      default:
        return theme.colors.inspection;
    }
  };

  const handleSidebarNavigation = (screenName: 'Tasks' | 'Profile') => {
    navigation.navigate(screenName);
  };

  const renderTab = (tab: 'ALL' | TaskType, label: string) => {
    const isActive = activeTab === tab;
    const count = getTabCount(tab);
    
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

  const renderCardList = () => {
    const showGrid = isTablet && !isLandscape;
    return (
      <ScrollView contentContainerStyle={showGrid ? styles.gridBody : styles.cardListBody}>
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
              style={[styles.taskCard, showGrid && styles.gridCard]}
              onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIdText}>{task.equipmentId}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '15' }]}>
                  <View style={[styles.statusDotSmall, { backgroundColor: getStatusColor(task.status) }]} />
                  <Text style={[styles.statusTextBadge, { color: getStatusColor(task.status) }]}>{task.status}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{task.taskName}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>{task.equipmentName}</Text>

              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <CustomIcon name="home" size={12} color={theme.colors.textSecondary} />
                  <Text style={styles.footerText} numberOfLines={1}>{task.area} • {task.zone}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(task.type) + '15' }]}>
                  <Text style={[styles.typeBadgeText, { color: getTypeColor(task.type) }]}>{task.type}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    );
  };

  const renderResponsiveTable = () => {
    const showLandscapeTable = isTablet && isLandscape;

    return (
      <View style={[styles.landscapeTableWrapper, !isTablet && { margin: theme.spacing.xs }]}>
        {!showLandscapeTable && (
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.statusDotSmall, { backgroundColor: '#FFC107' }]} />
              <Text style={styles.legendText}>Pending</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.statusDotSmall, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.legendText}>In Progress</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.statusDotSmall, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.statusDotSmall, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>Cancelled</Text>
            </View>
          </View>
        )}
        <View style={styles.landscapeTableHeader}>
          {showLandscapeTable ? (
            <>
              <Text style={[styles.lHeaderCell, styles.colWidth12]}>Equipment ID</Text>
              <Text style={[styles.lHeaderCell, styles.colWidth18]}>Equipment</Text>
              <Text style={[styles.lHeaderCell, styles.colWidth15]}>Area</Text>
              <Text style={[styles.lHeaderCell, styles.colWidth10]}>Zone</Text>
              <Text style={[styles.lHeaderCell, styles.colWidth15]}>Assigned To</Text>
              <Text style={[styles.lHeaderCell, styles.colWidth12]}>Due Date</Text>
              <Text style={[styles.lHeaderCell, styles.colWidth8]}>Priority</Text>
              <Text style={[styles.lHeaderCell, styles.colWidth10]}>Status</Text>
            </>
          ) : (
            <>
              <Text style={[styles.lHeaderCell, isTablet ? styles.colWidthPortrait1 : styles.colWidthPhone1]}>Equipment ID</Text>
              <Text style={[styles.lHeaderCell, isTablet ? styles.colWidthPortrait2 : styles.colWidthPhone2]}>Equipment</Text>
              <Text style={[styles.lHeaderCell, isTablet ? styles.colWidthPortrait3 : styles.colWidthPhone3]}>Area</Text>
            </>
          )}
        </View>
        <ScrollView contentContainerStyle={styles.tableBody}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No matching tasks found</Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.landscapeTableRow}
                onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
                activeOpacity={0.7}
              >
                {showLandscapeTable ? (
                  <>
                    <Text style={[styles.lCellText, styles.colWidth12, styles.equipmentIdCell]} numberOfLines={1}>
                      {task.equipmentId}
                    </Text>
                    <View style={styles.colWidth18}>
                      <Text style={styles.lCellTextBold} numberOfLines={1}>{task.taskName}</Text>
                      <Text style={styles.taskTypeSubtitle} numberOfLines={1}>{task.equipmentName}</Text>
                    </View>
                    <Text style={[styles.lCellText, styles.colWidth15]} numberOfLines={1}>{task.area}</Text>
                    <Text style={[styles.lCellText, styles.colWidth10]} numberOfLines={1}>{task.zone}</Text>
                    <Text style={[styles.lCellText, styles.colWidth15]} numberOfLines={1}>{task.operatorName}</Text>
                    <Text style={[styles.lCellText, styles.colWidth12]} numberOfLines={1}>{task.date}</Text>
                    <View style={styles.colWidth8}>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '15' }]}>
                        <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                          {task.priority}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.colWidth10}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '15' }]}>
                        <Text style={[styles.statusTextBadge, { color: getStatusColor(task.status) }]}>{task.status}</Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={[styles.rowDirection, isTablet ? styles.colWidthPortrait1 : styles.colWidthPhone1, styles.alignItemsCenter]}>
                      <View style={[styles.statusDotSmall, { backgroundColor: getStatusColor(task.status), marginRight: 6 }]} />
                      <Text style={[styles.lCellText, styles.equipmentIdCell, { paddingHorizontal: 0 }]} numberOfLines={1}>
                        {task.equipmentId}
                      </Text>
                    </View>
                    <View style={isTablet ? styles.colWidthPortrait2 : styles.colWidthPhone2}>
                      <Text style={styles.lCellTextBold} numberOfLines={1}>{task.taskName}</Text>
                      <Text style={styles.taskTypeSubtitle} numberOfLines={1}>{task.equipmentName}</Text>
                    </View>
                    <Text style={[styles.lCellText, isTablet ? styles.colWidthPortrait3 : styles.colWidthPhone3]} numberOfLines={1}>
                      {task.area}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader showMenu={!isTablet || !isLandscape} onMenuPress={() => setSidebarVisible(true)} />

      {/* Offline/Sync Banner */}
      {backendStatus === 'OFFLINE' && (
        <View style={[styles.networkBanner, styles.offlineBanner]}>
          <Text style={styles.networkBannerText}>
            ⚠️ You are offline. {syncingCount > 0 ? `Sync pending: ${syncingCount} updates` : 'Viewing cached tasks'}
          </Text>
        </View>
      )}
      {backendStatus === 'SERVER_DOWN' && (
        <View style={[styles.networkBanner, styles.offlineBanner]}>
          <Text style={styles.networkBannerText}>
            ⚠️ Server Down. Backend unreachable. Updates will sync automatically when reachable.
          </Text>
        </View>
      )}
      {backendStatus === 'ONLINE' && syncingCount > 0 && (
        <TouchableOpacity 
          style={[styles.networkBanner, styles.syncingBanner]}
          onPress={() => syncOfflineQueue()}
          activeOpacity={0.8}
        >
          <Text style={styles.networkBannerText}>
            🔄 Tap to sync {syncingCount} queued updates to backend
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.mainLayout}>
        {isTablet && isLandscape && renderSidebar()}

        <View style={styles.contentContainer}>
          {/* Screen Title & Controls */}
          <View style={styles.contentHeader}>
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
                placeholder="Search by ID, equipment, area or zone..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Toggle for Tablet view mode */}
          {isTablet && (
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBtn, tabletViewMode === 'TABLE' && styles.toggleBtnActive]}
                onPress={() => setTabletViewMode('TABLE')}
              >
                <Text style={[styles.toggleBtnText, tabletViewMode === 'TABLE' && styles.toggleBtnTextActive]}>Table</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, tabletViewMode === 'CARD' && styles.toggleBtnActive]}
                onPress={() => setTabletViewMode('CARD')}
              >
                <Text style={[styles.toggleBtnText, tabletViewMode === 'CARD' && styles.toggleBtnTextActive]}>Cards</Text>
              </TouchableOpacity>
            </View>
          )}

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
            (!isTablet || tabletViewMode === 'TABLE') ? renderResponsiveTable() : renderCardList()
          )}
        </View>
      </View>

      {/* Slide-out Sidebar Drawer Modal (Mobile / Portrait Tablet) */}
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
  cardListBody: {
    padding: theme.spacing.md,
  },
  gridBody: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  gridCard: {
    width: '48%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardIdText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusTextBadge: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  cardDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  taskTypeSubtitle: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  landscapeTableWrapper: {
    flex: 1,
    margin: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  landscapeTableHeader: {
    height: 44,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  lHeaderCell: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  tableBody: {
    flexGrow: 1,
  },
  landscapeTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  lCellText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    paddingHorizontal: 4,
  },
  lCellTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryLight,
    padding: 3,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm - 1,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: theme.colors.primary,
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
  networkBanner: {
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineBanner: {
    backgroundColor: '#FFCDD2',
  },
  syncingBanner: {
    backgroundColor: '#E8F5E9',
  },
  networkBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  // Column width styles for landscape table
  colWidth8: {
    width: '8%',
  },
  colWidth10: {
    width: '10%',
  },
  colWidth12: {
    width: '12%',
  },
  colWidth15: {
    width: '15%',
  },
  colWidth18: {
    width: '18%',
  },
  // Equipment ID cell styling
  equipmentIdCell: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  rowDirection: {
    flexDirection: 'row',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  colWidthPortrait1: {
    width: '25%',
  },
  colWidthPortrait2: {
    width: '50%',
  },
  colWidthPortrait3: {
    width: '25%',
  },
  colWidthPhone1: {
    width: '32%',
  },
  colWidthPhone2: {
    width: '43%',
  },
  colWidthPhone3: {
    width: '25%',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
});
