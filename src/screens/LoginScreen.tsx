import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { CustomIcon } from '../components/CustomIcon';
import { CustomHeader } from '../components/CustomHeader';
import { theme } from '../styles/theme';
import { forgotPasswordApi } from '../services/api';

export function LoginScreen() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Focus transition refs
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Both username and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(username, password);
      if (!response.success) {
        setError(response.error || 'Failed to log in.');
      }
    } catch  {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotUsername.trim() || !forgotEmail.trim() || !forgotNewPassword.trim()) {
      setForgotError('All fields are required.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const response = await forgotPasswordApi(
        forgotUsername.trim(),
        forgotEmail.trim(),
        forgotNewPassword,
      );
      if (response.success) {
        setForgotSuccess(response.message || 'Password reset successfully!');
        setForgotUsername('');
        setForgotEmail('');
        setForgotNewPassword('');
      } else {
        setForgotError('Failed to reset password.');
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to reset password.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top logo header bar */}
      <CustomHeader showMenu={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {/* Circle Lock Icon */}
            <View style={styles.lockIconContainer}>
              <CustomIcon name="lock" size={24} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>Welcome To CMMS</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Enter your username"
                placeholderTextColor={theme.colors.textSecondary}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                ref={passwordInputRef}
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(null);
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
            </View>

            {/* Log In Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>LOG IN</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPassword}
              activeOpacity={0.7}
              onPress={() => {
                setForgotError(null);
                setForgotSuccess(null);
                setShowForgotModal(true);
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Copyright Footer */}
          <Text style={styles.copyrightText}>Copyright © SMS CMMS 2026.</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>Authenticating, please wait...</Text>
        </View>
      )}

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowForgotModal(false);
                  setForgotError(null);
                  setForgotSuccess(null);
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {forgotError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{forgotError}</Text>
              </View>
            )}

            {forgotSuccess && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{forgotSuccess}</Text>
              </View>
            )}

            {/* Reset Fields */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor={theme.colors.textSecondary}
                value={forgotUsername}
                onChangeText={(text) => {
                  setForgotUsername(text);
                  if (forgotError) setForgotError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Registered Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter registered email"
                placeholderTextColor={theme.colors.textSecondary}
                value={forgotEmail}
                onChangeText={(text) => {
                  setForgotEmail(text);
                  if (forgotError) setForgotError(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor={theme.colors.textSecondary}
                value={forgotNewPassword}
                onChangeText={(text) => {
                  setForgotNewPassword(text);
                  if (forgotError) setForgotError(null);
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleForgotPassword}
              disabled={isForgotLoading}
              activeOpacity={0.8}
            >
              {isForgotLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>RESET PASSWORD</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
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
  },
  lockIconContainer: {
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
  errorContainer: {
    width: '100%',
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.repair,
    fontSize: 13,
    textAlign: 'center',
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
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: theme.colors.repair,
  },
  loginButton: {
    width: '100%',
    height: 44,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  forgotPassword: {
    marginTop: theme.spacing.xs,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: theme.spacing.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  successContainer: {
    width: '100%',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  successText: {
    color: theme.colors.primary,
    fontSize: 13,
    textAlign: 'center',
  },
});
