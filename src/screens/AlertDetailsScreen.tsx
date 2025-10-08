import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmergencyHeader from '../components/EmergencyHeader';
import EmergencyCard from '../components/EmergencyCard';
import EmergencyButton from '../components/EmergencyButton';
import StatusIndicator from '../components/StatusIndicator';
import {colors, typography, spacing} from '../utils/theme';
import {mapService} from '../services/MapService';
import {Alert as AlertType} from '../types/index';

const AlertDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [alert, setAlert] = useState<AlertType | null>(null);

  useEffect(() => {
    loadAlert();
  }, []);

  const loadAlert = () => {
    const {alertId} = route.params as {alertId: string};
    const foundAlert = mapService.getAlertById(alertId);
    
    if (foundAlert) {
      setAlert(foundAlert);
      // Mark as read
      mapService.markAlertAsRead(alertId);
    }
  };

  const handleShare = () => {
    if (alert) {
      const shareText = `${alert.title}\n\n${alert.message}\n\nFrom APSAR Emergency App`;
      // In a real app, this would use the Share API
      Alert.alert('Share Alert', shareText);
    }
  };

  const handleGetDirections = () => {
    if (alert?.location) {
      const url = `https://maps.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`;
      Linking.openURL(url);
    }
  };

  const getAlertTypeIcon = (type: AlertType['type']): string => {
    switch (type) {
      case 'emergency':
        return 'warning';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'search':
        return 'search';
      case 'weather':
        return 'cloud';
      case 'traffic':
        return 'traffic';
      case 'event':
        return 'event';
      default:
        return 'notifications';
    }
  };

  const getPriorityColor = (priority: AlertType['priority']): string => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString();
  };

  const getAlertActions = (alert: AlertType) => {
    const actions = [];
    
    if (alert.actions) {
      actions.push(...alert.actions.map(action => (
        <EmergencyButton
          key={action.id}
          title={action.title}
          onPress={action.action}
          variant={action.type === 'primary' ? 'primary' : action.type === 'destructive' ? 'danger' : 'secondary'}
          size="large"
          style={styles.actionButton}
        />
      )));
    }

    // Default actions based on alert type
    switch (alert.type) {
      case 'search':
        actions.push(
          <EmergencyButton
            key="avoid-area"
            title="Avoid This Area"
            icon={<Icon name="block" size={20} color={colors.surface} />}
            onPress={() => Alert.alert('Information', 'Please avoid the search area to allow rescue operations to proceed safely.')}
            variant="warning"
            size="large"
            style={styles.actionButton}
          />
        );
        break;
      case 'weather':
        actions.push(
          <EmergencyButton
            key="safety-tips"
            title="Weather Safety Tips"
            icon={<Icon name="info" size={20} color={colors.surface} />}
            onPress={() => Alert.alert('Weather Safety', 'Stay indoors, avoid driving, and monitor weather conditions.')}
            variant="info"
            size="large"
            style={styles.actionButton}
          />
        );
        break;
      case 'traffic':
        actions.push(
          <EmergencyButton
            key="alternate-route"
            title="Find Alternate Route"
            icon={<Icon name="directions" size={20} color={colors.surface} />}
            onPress={() => Alert.alert('Alternate Route', 'Use your maps app to find an alternate route around the affected area.')}
            variant="secondary"
            size="large"
            style={styles.actionButton}
          />
        );
        break;
    }

    return actions;
  };

  if (!alert) {
    return (
      <View style={styles.container}>
        <EmergencyHeader
          title="Alert Details"
          subtitle="Loading..."
          showNotifications={false}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading alert details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EmergencyHeader
        title="Alert Details"
        subtitle={`Priority: ${alert.priority.toUpperCase()}`}
        showNotifications={false}
      />

      <ScrollView style={styles.content}>
        {/* Alert Overview */}
        <EmergencyCard
          type={alert.priority === 'high' ? 'emergency' : alert.priority === 'medium' ? 'warning' : 'info'}
          title={alert.title}
          description={alert.message}
          icon={getAlertTypeIcon(alert.type)}
          timestamp={alert.timestamp}
          location={alert.location ? `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}` : undefined}
        >
          <View style={styles.alertMeta}>
            <StatusIndicator
              status={alert.priority === 'high' ? 'error' : alert.priority === 'medium' ? 'warning' : 'success'}
              label={alert.priority.toUpperCase()}
              size="medium"
            />
            <Text style={styles.alertType}>
              {alert.type.toUpperCase()}
            </Text>
          </View>
        </EmergencyCard>

        {/* Alert Information */}
        <EmergencyCard
          type="info"
          title="Alert Information"
          description="Details about this emergency alert"
          icon="info"
        >
          <View style={styles.alertInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>{alert.type.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Priority:</Text>
              <Text style={[styles.infoValue, {color: getPriorityColor(alert.priority)}]}>
                {alert.priority.toUpperCase()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Issued:</Text>
              <Text style={styles.infoValue}>{formatTimestamp(alert.timestamp)}</Text>
            </View>
            {alert.expiresAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expires:</Text>
                <Text style={styles.infoValue}>{formatTimestamp(alert.expiresAt)}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={styles.infoValue}>
                {alert.isRead ? 'READ' : 'UNREAD'}
              </Text>
            </View>
          </View>
        </EmergencyCard>

        {/* Location Information */}
        {alert.location && (
          <EmergencyCard
            type="info"
            title="Location Details"
            description="Location information for this alert"
            icon="location-on"
          >
            <View style={styles.locationInfo}>
              <Text style={styles.coordinates}>
                {alert.location.latitude.toFixed(6)}, {alert.location.longitude.toFixed(6)}
              </Text>
              <EmergencyButton
                title="Get Directions"
                icon={<Icon name="directions" size={20} color={colors.surface} />}
                onPress={handleGetDirections}
                variant="secondary"
                size="medium"
              />
            </View>
          </EmergencyCard>
        )}

        {/* Alert Actions */}
        <EmergencyCard
          type="info"
          title="Recommended Actions"
          description="What you should do in response to this alert"
          icon="recommend"
        >
          <View style={styles.actionsContainer}>
            {getAlertActions(alert)}
            
            <EmergencyButton
              title="Share Alert"
              icon={<Icon name="share" size={20} color={colors.surface} />}
              onPress={handleShare}
              variant="secondary"
              size="large"
              style={styles.actionButton}
            />
          </View>
        </EmergencyCard>

        {/* Safety Information */}
        <EmergencyCard
          type="info"
          title="Safety Information"
          description="General safety tips for emergency situations"
          icon="security"
        >
          <View style={styles.safetyTips}>
            <View style={styles.safetyTip}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.safetyTipText}>
                Stay informed by checking for updates regularly
              </Text>
            </View>
            <View style={styles.safetyTip}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.safetyTipText}>
                Follow instructions from emergency personnel
              </Text>
            </View>
            <View style={styles.safetyTip}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.safetyTipText}>
                Avoid affected areas unless you need to be there
              </Text>
            </View>
            <View style={styles.safetyTip}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.safetyTipText}>
                Report any additional information to emergency services
              </Text>
            </View>
          </View>
        </EmergencyCard>

        {/* Contact Information */}
        <EmergencyCard
          type="emergency"
          title="Emergency Contact"
          description="Contact emergency services if needed"
          icon="call"
        >
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>
              If you have additional information about this alert or need immediate assistance, contact emergency services.
            </Text>
            <View style={styles.contactButtons}>
              <EmergencyButton
                title="Call 911"
                icon={<Icon name="call" size={20} color={colors.surface} />}
                onPress={() => Alert.alert('Emergency', 'Calling 911...')}
                variant="danger"
                size="large"
                style={styles.contactButton}
              />
              <EmergencyButton
                title="Call APSAR"
                icon={<Icon name="phone" size={20} color={colors.surface} />}
                onPress={() => Alert.alert('APSAR', 'Calling APSAR headquarters...')}
                variant="primary"
                size="large"
                style={styles.contactButton}
              />
            </View>
          </View>
        </EmergencyCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  alertType: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  alertInfo: {
    marginTop: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  infoValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  locationInfo: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  coordinates: {
    ...typography.body,
    color: colors.text,
    fontFamily: 'monospace',
    marginBottom: spacing.md,
  },
  actionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    marginVertical: spacing.xs,
  },
  safetyTips: {
    marginTop: spacing.sm,
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  safetyTipText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  contactInfo: {
    marginTop: spacing.sm,
  },
  contactText: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contactButton: {
    flex: 1,
  },
});

export default AlertDetailsScreen;
