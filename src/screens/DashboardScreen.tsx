import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useApp } from '../context/AppContext';
import { CustomHeader } from '../components/CustomHeader';
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

export function DashboardScreen() {
  const { user } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navMessage, setNavMessage] = useState('');

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

  const displayName = user?.fullName || 'operator';
  const displayRole = user?.role || 'Operator';

  return (
    <View style={styles.container}>
      <CustomHeader showMenu={true} onMenuPress={() => setSidebarVisible(true)} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title & Operator Greetings (Dynamic based on login session) */}
        <View style={styles.headerSection}>
          <Text style={styles.titleText}>{displayRole} Dashboard</Text>
          <Text style={styles.greetingText}>
            Welcome, <Text style={styles.boldText}>{displayName}</Text> to the {displayRole} Dashboard
          </Text>
        </View>

        {/* Dynamic Shortcut Cards (Image 5 style) */}
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
