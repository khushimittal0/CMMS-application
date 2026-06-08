import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

  const handleSidebarNavigation = (screenName: 'Tasks' | 'Profile') => {
    navigation.navigate(screenName);
  };

  const displayName = user?.fullName || 'operator';
  const displayRole = user?.role || 'Operator';
  const displayUsername = user?.username || 'operator';

  return (
    <View style={styles.container}>
      <CustomHeader showMenu={true} onMenuPress={() => setSidebarVisible(true)} />

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
