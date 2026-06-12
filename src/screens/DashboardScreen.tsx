import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import { CustomHeader } from '../components/CustomHeader';
import { SidebarModal } from '../components/SidebarModal';
import { CustomIcon } from '../components/CustomIcon';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const { user, logout } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navMessage, setNavMessage] = useState('');

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

  const handleSidebarNavigation = (screenName: 'Tasks' | 'Profile') => {
    setNavMessage(screenName === 'Tasks' ? 'Opening Tasks list...' : 'Opening Profile details...');
    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
      navigation.navigate(screenName);
    }, 450);
  };

  const handleProfilePress = () => {
    setNavMessage('Opening Profile details...');
    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
      navigation.navigate('Profile');
    }, 450);
  };

  const handleTasksPress = () => {
    setNavMessage('Opening Tasks list...');
    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
      navigation.navigate('Tasks');
    }, 450);
  };

  const displayName = user?.firstName || user?.username || 'Operator';
  const displayRole = user?.roles?.[0] || 'Operator';
  const capitalizedRole = displayRole.charAt(0).toUpperCase() + displayRole.slice(1);

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
          style={[styles.sidebarItem, styles.sidebarItemActive]}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <CustomIcon name="home" size={18} color={theme.colors.primary} />
          <Text style={[styles.sidebarItemText, styles.sidebarItemTextActive]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => navigation.navigate('Tasks')}
        >
          <CustomIcon name="tasks" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.sidebarItemText}>Tasks</Text>
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
    <View style={styles.container}>
      <CustomHeader showMenu={!isTablet || !isLandscape} onMenuPress={() => setSidebarVisible(true)} />
      
      <View style={styles.mainLayout}>
        {isTablet && isLandscape && renderSidebar()}

        <View style={styles.contentContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Title & Operator Greetings (Dynamic based on login session) */}
            <View style={styles.headerSection}>
              <Text style={styles.titleText}>{capitalizedRole} Dashboard</Text>
              <Text style={styles.greetingText}>
                Welcome, <Text style={styles.boldText}>{displayName}</Text> to the {capitalizedRole} Dashboard
              </Text>
            </View>

            {/* Dynamic Shortcut Cards */}
            <View style={styles.cardContainer}>
              {/* Profile Card */}
              <TouchableOpacity
                style={styles.menuCard}
                onPress={handleProfilePress}
                activeOpacity={0.8}
              >
                <Text style={styles.cardLabel}>Profile</Text>
              </TouchableOpacity>

              {/* Tasks Card */}
              <TouchableOpacity
                style={styles.menuCard}
                onPress={handleTasksPress}
                activeOpacity={0.8}
              >
                <Text style={styles.cardLabel}>Tasks</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Slide-out Sidebar Drawer Modal */}
      {sidebarVisible && (
        <SidebarModal
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onNavigate={handleSidebarNavigation}
        />
      )}

      {/* Loading/Navigating Overlay */}
      {isNavigating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>{navMessage}</Text>
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
    padding: theme.spacing.lg,
  },
  headerSection: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  greetingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  boldText: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    width: 140,
    height: 100,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
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
