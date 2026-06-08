import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { CustomIcon } from './CustomIcon';
import { theme } from '../styles/theme';

interface SidebarModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screenName: 'Tasks' | 'Profile') => void;
}

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

export function SidebarModal({ visible, onClose, onNavigate }: SidebarModalProps) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleNavigation = (screenName: 'Tasks' | 'Profile') => {
    onClose();
    setTimeout(() => {
      onNavigate(screenName);
    }, 150);
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.container}>
        {/* Backdrop overlay */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Sidebar content container */}
        <Animated.View
          style={[
            styles.sidebar,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Header (operator portal text removed) */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoGraphic}>
                <View style={styles.blueLVertical} />
                <View style={styles.blueLHorizontal} />
                <View style={styles.redSquare} />
              </View>
              <Text style={styles.logoText}>SMS CMMS</Text>
            </View>
          </View>

          {/* Nav Items */}
          <View style={styles.navContainer}>
            {/* Task Item */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleNavigation('Tasks')}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                <CustomIcon name="tasks" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.navLabel}>Task</Text>
            </TouchableOpacity>

            {/* Profile Item */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleNavigation('Profile')}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                <CustomIcon name="profile" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.navLabel}>Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Footer (No logout option) */}
          <View style={styles.footer}>
            <Text style={styles.copyright}>SMS CMMS v1.0.0</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  navContainer: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
  },
  iconBox: {
    width: 32,
    marginRight: theme.spacing.md,
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  copyright: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
});
