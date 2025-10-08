import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius} from '../utils/theme';

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'pending' | 'warning' | 'error' | 'success';
  label?: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: ViewStyle;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'medium',
  showIcon = true,
  style,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: colors.success,
          icon: 'check-circle',
          backgroundColor: '#E8F5E8',
        };
      case 'inactive':
        return {
          color: colors.textSecondary,
          icon: 'radio-button-unchecked',
          backgroundColor: colors.lightGray,
        };
      case 'pending':
        return {
          color: colors.warning,
          icon: 'schedule',
          backgroundColor: '#FFF8E1',
        };
      case 'warning':
        return {
          color: colors.warning,
          icon: 'warning',
          backgroundColor: '#FFF8E1',
        };
      case 'error':
        return {
          color: colors.error,
          icon: 'error',
          backgroundColor: '#FFEBEE',
        };
      case 'success':
        return {
          color: colors.success,
          icon: 'check-circle',
          backgroundColor: '#E8F5E8',
        };
      default:
        return {
          color: colors.textSecondary,
          icon: 'help',
          backgroundColor: colors.lightGray,
        };
    }
  };

  const config = getStatusConfig();
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.indicator,
          styles[size],
          {backgroundColor: config.backgroundColor},
        ]}
      >
        {showIcon && (
          <Icon name={config.icon} size={iconSize} color={config.color} />
        )}
      </View>
      {label && (
        <Text style={[styles.label, styles[`${size}Label`]]}>{label}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  small: {
    width: 20,
    height: 20,
  },
  medium: {
    width: 24,
    height: 24,
  },
  large: {
    width: 32,
    height: 32,
  },
  label: {
    fontWeight: '600',
  },
  smallLabel: {
    ...typography.caption,
  },
  mediumLabel: {
    ...typography.bodySmall,
  },
  largeLabel: {
    ...typography.body,
  },
});

export default StatusIndicator;
