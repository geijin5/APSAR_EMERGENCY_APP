import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, {Marker, Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmergencyHeader from '../components/EmergencyHeader';
import EmergencyButton from '../components/EmergencyButton';
import StatusIndicator from '../components/StatusIndicator';
import {colors, typography, spacing} from '../utils/theme';
import {mapService} from '../services/MapService';
import {locationService} from '../services/LocationService';
import {MapZone, Location, Alert as AlertType} from '../types/index';

const {width, height} = Dimensions.get('window');

const MapScreen: React.FC = () => {
  const mapRef = useRef<MapView>(null);
  const [zones, setZones] = useState<MapZone[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [selectedZone, setSelectedZone] = useState<MapZone | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showLegend, setShowLegend] = useState(false);
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    loadMapData();
    setupLocationTracking();
  }, []);

  const loadMapData = () => {
    const mapZones = mapService.getZones();
    const mapAlerts = mapService.getActiveAlerts();
    setZones(mapZones);
    setAlerts(mapAlerts);
  };

  const setupLocationTracking = () => {
    locationService.addLocationCallback((location) => {
      setCurrentLocation(location);
      
      if (isTracking && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    });

    // Get initial location
    locationService.getCurrentPosition().then((location) => {
      if (location) {
        setCurrentLocation(location);
      }
    });
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    if (!isTracking && currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const centerOnLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const getZoneColor = (zone: MapZone): string => {
    return mapService.getZoneColor(zone.type);
  };

  const getZoneOpacity = (zone: MapZone): number => {
    return mapService.getZoneOpacity(zone);
  };

  const handleZonePress = (zone: MapZone) => {
    setSelectedZone(zone);
    Alert.alert(
      zone.name,
      zone.description || 'No additional information available.',
      [
        {text: 'Close', style: 'cancel'},
        {text: 'Get Directions', onPress: () => getDirectionsToZone(zone)},
      ]
    );
  };

  const getDirectionsToZone = (zone: MapZone) => {
    // In a real app, this would open the device's maps app
    Alert.alert(
      'Directions',
      'This would open your maps app with directions to the selected zone.',
      [{text: 'OK'}]
    );
  };

  const renderLegend = () => {
    if (!showLegend) return null;

    const legendItems = [
      {color: colors.restricted, label: 'Restricted', icon: 'block'},
      {color: colors.caution, label: 'Caution', icon: 'warning'},
      {color: colors.clear, label: 'Clear', icon: 'check'},
      {color: colors.searchZone, label: 'Search Zone', icon: 'search'},
      {color: colors.detour, label: 'Detour', icon: 'directions'},
    ];

    return (
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Map Legend</Text>
        {legendItems.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, {backgroundColor: item.color}]} />
            <Icon name={item.icon} size={16} color={colors.textSecondary} />
            <Text style={styles.legendLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderZoneInfo = () => {
    if (!selectedZone) return null;

    return (
      <View style={styles.zoneInfo}>
        <Text style={styles.zoneTitle}>{selectedZone.name}</Text>
        <Text style={styles.zoneDescription}>{selectedZone.description}</Text>
        <StatusIndicator
          status={selectedZone.isActive ? 'active' : 'inactive'}
          label={selectedZone.isActive ? 'Active' : 'Inactive'}
          size="small"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <EmergencyHeader
        title="Emergency Map"
        subtitle="Real-time emergency zones and alerts"
        showNotifications={true}
        notificationCount={alerts.length}
        onNotificationPress={() => {/* Navigate to alerts */}}
      />
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          initialRegion={{
            latitude: currentLocation?.latitude || 45.9231,
            longitude: currentLocation?.longitude || -113.3943,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* Render zones as polygons */}
          {zones.map((zone) => (
            <Polygon
              key={zone.id}
              coordinates={zone.coordinates}
              fillColor={`${getZoneColor(zone)}${Math.round(getZoneOpacity(zone) * 255).toString(16).padStart(2, '0')}`}
              strokeColor={getZoneColor(zone)}
              strokeWidth={2}
              tappable={true}
              onPress={() => handleZonePress(zone)}
            />
          ))}

          {/* Render alert markers */}
          {alerts.map((alert) => (
            alert.location && (
              <Marker
                key={alert.id}
                coordinate={alert.location}
                title={alert.title}
                description={alert.message}
                pinColor={alert.priority === 'high' ? colors.error : colors.warning}
              />
            )
          ))}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnLocation}
          >
            <Icon name="my-location" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, isTracking && styles.activeControl]}
            onPress={toggleTracking}
          >
            <Icon name="gps-fixed" size={24} color={isTracking ? colors.surface : colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowLegend(!showLegend)}
          >
            <Icon name="legend-toggle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Map Type Selector */}
        <View style={styles.mapTypeSelector}>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'standard' && styles.activeMapType]}
            onPress={() => setMapType('standard')}
          >
            <Text style={[styles.mapTypeText, mapType === 'standard' && styles.activeMapTypeText]}>
              Standard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'satellite' && styles.activeMapType]}
            onPress={() => setMapType('satellite')}
          >
            <Text style={[styles.mapTypeText, mapType === 'satellite' && styles.activeMapTypeText]}>
              Satellite
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'hybrid' && styles.activeMapType]}
            onPress={() => setMapType('hybrid')}
          >
            <Text style={[styles.mapTypeText, mapType === 'hybrid' && styles.activeMapTypeText]}>
              Hybrid
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legend */}
        {renderLegend()}

        {/* Zone Info */}
        {renderZoneInfo()}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <EmergencyButton
          title="Report Emergency"
          icon={<Icon name="report-problem" size={20} color={colors.surface} />}
          onPress={() => {/* Navigate to report */}}
          variant="danger"
          size="medium"
          style={styles.quickActionButton}
        />
        <EmergencyButton
          title="View Alerts"
          icon={<Icon name="notifications" size={20} color={colors.surface} />}
          onPress={() => {/* Navigate to alerts */}}
          variant="warning"
          size="medium"
          style={styles.quickActionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapControls: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'column',
  },
  controlButton: {
    backgroundColor: colors.surface,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...colors.shadows.medium,
  },
  activeControl: {
    backgroundColor: colors.primary,
  },
  mapTypeSelector: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    ...colors.shadows.medium,
  },
  mapTypeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  activeMapType: {
    backgroundColor: colors.primary,
  },
  mapTypeText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  activeMapTypeText: {
    color: colors.surface,
  },
  legend: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    ...colors.shadows.large,
  },
  legendTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  legendLabel: {
    ...typography.bodySmall,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  zoneInfo: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    ...colors.shadows.large,
  },
  zoneTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  zoneDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default MapScreen;
