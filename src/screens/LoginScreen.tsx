import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {TextInput, Button, Text, Surface} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {authService} from '../services/AuthService';
import {colors, typography, spacing, borderRadius} from '../utils/theme';
import {NavigationParams} from '../types/index';

type LoginScreenNavigationProp = StackNavigationProp<NavigationParams, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        navigation.replace('Main');
      }
    };
    checkAuth();
  }, [navigation]);

  const handleLogin = async () => {
    if (!emailOrPhone.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email/phone and password');
      return;
    }

    setLoading(true);
    try {
      if (show2FA) {
        if (!twoFactorCode.trim()) {
          Alert.alert('Error', 'Please enter your 2FA code');
          setLoading(false);
          return;
        }
        await authService.loginWith2FA(emailOrPhone, password, twoFactorCode);
      } else {
        await authService.login(emailOrPhone, password);
      }

      // Navigate to appropriate screen based on role
      const user = authService.getCurrentUser();
      if (user) {
        if (user.role === 'public') {
          navigation.replace('Main');
        } else {
          // Personnel, admin, or command - go to personnel dashboard or main
          navigation.replace('Main');
        }
      }
    } catch (error: any) {
      // Check if 2FA is required
      if (error.message?.includes('2FA') || error.message?.includes('two-factor')) {
        setShow2FA(true);
      } else {
        Alert.alert('Login Failed', error.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Password reset functionality will be implemented. Please contact your administrator.',
      [{text: 'OK'}]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.surface}>
          <View style={styles.header}>
            <Text style={styles.title}>Anaconda–Deer Lodge County</Text>
            <Text style={styles.subtitle}>Emergency Services</Text>
            <Text style={styles.loginTitle}>Personnel Login</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email or Phone"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              disabled={loading}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              disabled={loading}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            {show2FA && (
              <TextInput
                label="2FA Code"
                value={twoFactorCode}
                onChangeText={setTwoFactorCode}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
                disabled={loading}
                left={<TextInput.Icon icon="shield-check" />}
                placeholder="Enter 6-digit code"
              />
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={loading}
              contentStyle={styles.buttonContent}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                'Login'
              )}
            </Button>

            <Button
              mode="text"
              onPress={handleForgotPassword}
              style={styles.forgotButton}
              disabled={loading}
            >
              Forgot Password?
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              For public access, continue without logging in
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.replace('Main')}
              disabled={loading}
            >
              Continue as Guest
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  surface: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  loginTitle: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  loginButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  forgotButton: {
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});

export default LoginScreen;

