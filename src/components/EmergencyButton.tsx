import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows} from '../utils/theme';

interface EmergencyButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[size],
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
          ...shadows.medium,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.secondary,
          ...shadows.medium,
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: colors.error,
          ...shadows.medium,
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: colors.warning,
          ...shadows.medium,
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: colors.success,
          ...shadows.medium,
        };
      case 'info':
        return {
          ...baseStyle,
          backgroundColor: colors.info,
          ...shadows.medium,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
      color: variant === 'secondary' ? colors.surface : colors.surface,
    };

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: spacing.xs,
  },
  smallText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  mediumText: {
    ...typography.body,
    fontWeight: 'bold',
  },
  largeText: {
    ...typography.h4,
    fontWeight: 'bold',
  },
});

export default EmergencyButton;
