import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useApp } from '../context/AppContext';
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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const { user, logout } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

  const handleSidebarNavigation = (screenName: 'Tasks' | 'Profile') => {
    navigation.navigate(screenName);
  };

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username || 'Operator';
  const displayRole = user?.roles?.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ') || 'Operator';
  const displayUsername = user?.username || 'operator';

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
          style={styles.sidebarItem}
          onPress={() => navigation.navigate('Tasks')}
        >
          <CustomIcon name="tasks" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.sidebarItemText}>Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sidebarItem, styles.sidebarItemActive]}
          onPress={() => navigation.navigate('Profile')}
        >
          <CustomIcon name="profile" size={18} color={theme.colors.primary} />
          <Text style={[styles.sidebarItemText, styles.sidebarItemTextActive]}>Profile</Text>
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
            {/* Navigation back row */}
            <TouchableOpacity
              style={styles.backLink}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <CustomIcon name="chevron-right" size={16} color={theme.colors.primary} />
              <Text style={styles.backLinkText}>Back to Dashboard</Text>
            </TouchableOpacity>

            {/* Cohesive Centered Card (Matches Login Page Card style) */}
            <View style={styles.card}>
              {/* Avatar Icon */}
              <View style={styles.avatarIconContainer}>
                <CustomIcon name="profile" size={24} color="#FFFFFF" />
              </View>

              <Text style={styles.title}>{displayRole} Profile</Text>

              {/* Full Name Display */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.inputText}>{displayName}</Text>
                </View>
              </View>

              {/* Username Display */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.inputText}>{displayUsername}</Text>
                </View>
              </View>

              {/* Role Display */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Assigned Role</Text>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.inputText}>{displayRole}</Text>
                </View>
              </View>

              {/* Log Out Button (Matches Login screen button style) */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={logout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutButtonText}>LOG OUT</Text>
              </TouchableOpacity>
            </View>

            {/* Copyright Footer */}
            <Text style={styles.copyrightText}>Copyright © SMS CMMS 2026.</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    transform: [{ rotate: '180deg' }], // Chevrons point left
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 380,
  },
  backLinkText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: 4,
    transform: [{ rotate: '180deg' }], // Untransform the text itself
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  readOnlyInput: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC', // Slightly greyed out for read-only look
  },
  inputText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  logoutButton: {
    width: '100%',
    height: 44,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  copyrightText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    width: '100%',
    maxWidth: 380,
  },
});
