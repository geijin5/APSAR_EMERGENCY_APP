import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import EmergencyHeader from '../components/EmergencyHeader';
import EmergencyCard from '../components/EmergencyCard';
import EmergencyButton from '../components/EmergencyButton';
import StatusIndicator from '../components/StatusIndicator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing} from '../utils/theme';
import {mapService} from '../services/MapService';
import {locationService} from '../services/LocationService';
import {Alert as AlertType} from '../types/index';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<AlertType[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>('Loading...');

  useEffect(() => {
    loadData();
    setupLocationTracking();
  }, []);

  const loadData = async () => {
    try {
      const alerts = mapService.getActiveAlerts();
      setActiveAlerts(alerts.slice(0, 3)); // Show only first 3 alerts
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  };

  const setupLocationTracking = () => {
    locationService.addLocationCallback((location) => {
      setCurrentLocation(
        `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      );
    });
    
    // Get initial location
    locationService.getCurrentPosition().then((location) => {
      if (location) {
        setCurrentLocation(
          `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
        );
      }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Call',
      'This will dial 911. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Call 911', style: 'destructive', onPress: () => {
          // In a real app, this would initiate a phone call
          console.log('Calling 911...');
        }},
      ]
    );
  };

  const handleQuickActions = (action: string) => {
    switch (action) {
      case 'map':
        navigation.navigate('Map' as never);
        break;
      case 'report':
        navigation.navigate('Reports' as never);
        break;
      case 'alerts':
        navigation.navigate('Alerts' as never);
        break;
      case 'resources':
        navigation.navigate('Resources' as never);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <EmergencyHeader
        title="APSAR Emergency"
        subtitle="Anaconda Pintler Search & Rescue"
        showEmergencyButton={true}
        onEmergencyPress={handleEmergencyCall}
        notificationCount={activeAlerts.length}
        onNotificationPress={() => navigation.navigate('Alerts' as never)}
      />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Overview */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statusGrid}>
            <StatusIndicator
              status="active"
              label="Services Online"
              size="medium"
            />
            <StatusIndicator
              status="active"
              label="GPS Tracking"
              size="medium"
            />
            <StatusIndicator
              status="active"
              label="Alerts Active"
              size="medium"
            />
          </View>
        </View>

        {/* Current Location */}
        <EmergencyCard
          type="info"
          title="Your Location"
          description={currentLocation}
          icon="my-location"
        />

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {activeAlerts.map((alert) => (
              <EmergencyCard
                key={alert.id}
                title={alert.title}
                description={alert.message}
                type={alert.priority === 'high' ? 'emergency' : 'warning'}
                timestamp={alert.timestamp}
                location={alert.location ? `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}` : undefined}
                onPress={() => navigation.navigate('AlertDetails' as any, {alertId: alert.id})}
              />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <EmergencyButton
              title="Emergency Map"
              icon={<Icon name="map" size={20} color={colors.surface} />}
              onPress={() => handleQuickActions('map')}
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
            <EmergencyButton
              title="Report Emergency"
              icon={<Icon name="report-problem" size={20} color={colors.surface} />}
              onPress={() => handleQuickActions('report')}
              variant="danger"
              size="large"
              style={styles.actionButton}
            />
          </View>
          <View style={styles.actionGrid}>
            <EmergencyButton
              title="View Alerts"
              icon={<Icon name="notifications" size={20} color={colors.surface} />}
              onPress={() => handleQuickActions('alerts')}
              variant="warning"
              size="large"
              style={styles.actionButton}
            />
            <EmergencyButton
              title="Emergency Resources"
              icon={<Icon name="local-hospital" size={20} color={colors.surface} />}
              onPress={() => handleQuickActions('resources')}
              variant="success"
              size="large"
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Community Updates */}
        <EmergencyCard
          type="info"
          title="Community Update"
          description="APSAR is conducting routine training exercises this weekend. No emergency response will be affected."
          icon="info"
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            APSAR Emergency App v1.0.0
          </Text>
          <Text style={styles.footerText}>
            For non-emergencies: (406) 555-0123
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  statusSection: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  alertsSection: {
    paddingHorizontal: spacing.sm,
  },
  actionsSection: {
    padding: spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});

export default HomeScreen;
