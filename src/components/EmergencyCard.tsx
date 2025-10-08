import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius, shadows} from '../utils/theme';

interface EmergencyCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  type?: 'emergency' | 'warning' | 'info' | 'success';
  icon?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
  timestamp?: Date;
  location?: string;
}

const EmergencyCard: React.FC<EmergencyCardProps> = ({
  title,
  subtitle,
  description,
  type = 'info',
  icon,
  onPress,
  children,
  style,
  timestamp,
  location,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.card,
      ...shadows.medium,
    };

    switch (type) {
      case 'emergency':
        return {
          ...baseStyle,
          borderLeftColor: colors.error,
          borderLeftWidth: 4,
          backgroundColor: '#FFEBEE', // Light red background
        };
      case 'warning':
        return {
          ...baseStyle,
          borderLeftColor: colors.warning,
          borderLeftWidth: 4,
          backgroundColor: '#FFF8E1', // Light orange background
        };
      case 'info':
        return {
          ...baseStyle,
          borderLeftColor: colors.info,
          borderLeftWidth: 4,
          backgroundColor: colors.surface,
        };
      case 'success':
        return {
          ...baseStyle,
          borderLeftColor: colors.success,
          borderLeftWidth: 4,
          backgroundColor: '#E8F5E8', // Light green background
        };
      default:
        return baseStyle;
    }
  };

  const getIconName = (): string => {
    if (icon) return icon;
    
    switch (type) {
      case 'emergency':
        return 'warning';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'check-circle';
      default:
        return 'info';
    }
  };

  const getIconColor = (): string => {
    switch (type) {
      case 'emergency':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      case 'success':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const CardContent = () => (
    <View style={getCardStyle()}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon
            name={getIconName()}
            size={24}
            color={getIconColor()}
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        {timestamp && (
          <Text style={styles.timestamp}>
            {formatTimestamp(timestamp)}
          </Text>
        )}
      </View>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      {location && (
        <View style={styles.locationContainer}>
          <Icon name="location-on" size={16} color={colors.textSecondary} />
          <Text style={styles.location}>{location}</Text>
        </View>
      )}
      
      {children && <View style={styles.children}>{children}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  icon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  location: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  children: {
    marginTop: spacing.sm,
  },
});

export default EmergencyCard;
