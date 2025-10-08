import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {colors, typography, spacing} from '../utils/theme';

interface EmergencyHeaderProps {
  title: string;
  subtitle?: string;
  showEmergencyButton?: boolean;
  onEmergencyPress?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationPress?: () => void;
  showMenu?: boolean;
  onMenuPress?: () => void;
}

const EmergencyHeader: React.FC<EmergencyHeaderProps> = ({
  title,
  subtitle,
  showEmergencyButton = false,
  onEmergencyPress,
  showNotifications = true,
  notificationCount = 0,
  onNotificationPress,
  showMenu = false,
  onMenuPress,
}) => {
  return (
    <LinearGradient
      colors={[colors.primary, '#B71C1C']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {showMenu && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={onMenuPress}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Icon name="menu" size={24} color={colors.surface} />
            </TouchableOpacity>
          )}
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        
        <View style={styles.actions}>
          {showNotifications && (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={onNotificationPress}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Icon name="notifications" size={24} color={colors.surface} />
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          
          {showEmergencyButton && (
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={onEmergencyPress}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Icon name="call" size={24} color={colors.surface} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {showEmergencyButton && (
        <View style={styles.emergencyBanner}>
          <Icon name="warning" size={20} color={colors.surface} />
          <Text style={styles.emergencyText}>
            In case of emergency, call 911
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.surface,
    fontWeight: 'bold',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.surface,
    opacity: 0.9,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 10,
  },
  emergencyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  emergencyText: {
    ...typography.bodySmall,
    color: colors.surface,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
});

export default EmergencyHeader;
