import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { CustomIcon } from './CustomIcon';
import { theme } from '../styles/theme';

interface CustomHeaderProps {
  showMenu?: boolean;
  onMenuPress?: () => void;
}

export function CustomHeader({ showMenu = true, onMenuPress }: CustomHeaderProps) {
  const { user, logout } = useApp();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Left Section: Logo & Toggle */}
        <View style={styles.leftSection}>
          {showMenu && (
            <TouchableOpacity onPress={onMenuPress} style={styles.iconButton} activeOpacity={0.7}>
              <CustomIcon name="menu" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          {/* SMS CMMS Overlapping Logo (Blue L-shape + Red offset square) */}
          <View style={styles.logoContainer}>
            <View style={styles.logoGraphic}>
              {/* Blue L-Shape Parts */}
              <View style={styles.blueLVertical} />
              <View style={styles.blueLHorizontal} />
              {/* Red Overlapping Square */}
              <View style={styles.redSquare} />
            </View>
            <Text style={styles.logoText}>SMS CMMS</Text>
          </View>
        </View>

        {/* Right Section: Only Username & Logout Icon */}
        {user && (
          <View style={styles.rightSection}>
            <Text style={styles.usernameText}>{user.username}</Text>
            <TouchableOpacity onPress={logout} style={styles.logoutButton} activeOpacity={0.7}>
              <CustomIcon name="logout" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.headerBg,
    ...Platform.select({
      android: {
        paddingTop: 0,
      },
    }),
  },
  container: {
    height: 56,
    backgroundColor: theme.colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoGraphic: {
    width: 22,
    height: 22,
    position: 'relative',
    marginRight: theme.spacing.sm,
  },
  blueLVertical: {
    width: 8,
    height: 16,
    backgroundColor: '#0C60B5',
    position: 'absolute',
    left: 0,
    bottom: 0,
    borderRadius: 1.5,
  },
  blueLHorizontal: {
    width: 16,
    height: 8,
    backgroundColor: '#0C60B5',
    position: 'absolute',
    left: 0,
    bottom: 0,
    borderRadius: 1.5,
  },
  redSquare: {
    width: 10,
    height: 10,
    backgroundColor: '#D9534F',
    position: 'absolute',
    right: 0,
    top: 0,
    borderRadius: 1.5,
    zIndex: 2,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginRight: theme.spacing.md,
  },
  logoutButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
