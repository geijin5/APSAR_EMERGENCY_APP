import {MapZone, Location, Alert} from '../types/index';
import {getOfflineData, setOfflineData} from './AppService';

class MapService {
  private zones: MapZone[] = [];
  private alerts: Alert[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Load cached zones and alerts
    await this.loadCachedData();
    
    // Start periodic updates
    this.startPeriodicUpdates();
    
    this.isInitialized = true;
  }

  private async loadCachedData(): Promise<void> {
    try {
      const cachedZones = await getOfflineData('map_zones');
      const cachedAlerts = await getOfflineData('map_alerts');
      
      if (cachedZones) {
        this.zones = cachedZones.map((zone: any) => ({
          ...zone,
          startTime: zone.startTime ? new Date(zone.startTime) : undefined,
          endTime: zone.endTime ? new Date(zone.endTime) : undefined,
        }));
      }
      
      if (cachedAlerts) {
        this.alerts = cachedAlerts.map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp),
          expiresAt: alert.expiresAt ? new Date(alert.expiresAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load cached map data:', error);
    }
  }

  private startPeriodicUpdates(): void {
    // Update zones and alerts every 30 seconds
    setInterval(() => {
      this.updateMapData();
    }, 30000);
  }

  private async updateMapData(): Promise<void> {
    try {
      // In a real app, this would fetch from a server
      // For now, we'll simulate some data
      await this.fetchZonesFromServer();
      await this.fetchAlertsFromServer();
    } catch (error) {
      console.error('Failed to update map data:', error);
    }
  }

  private async fetchZonesFromServer(): Promise<void> {
    // Simulate server data - in real app, this would be an API call
    const mockZones: MapZone[] = [
      {
        id: '1',
        name: 'Active Search Zone - Pintler Mountains',
        type: 'search',
        coordinates: [
          {latitude: 45.9231, longitude: -113.3943},
          {latitude: 45.9281, longitude: -113.3893},
          {latitude: 45.9331, longitude: -113.3943},
          {latitude: 45.9281, longitude: -113.3993},
        ],
        description: 'Active search operation in progress',
        startTime: new Date(),
        isActive: true,
      },
      {
        id: '2',
        name: 'Parade Route - Main Street',
        type: 'parade',
        coordinates: [
          {latitude: 45.9200, longitude: -113.4000},
          {latitude: 45.9200, longitude: -113.3800},
        ],
        description: 'Annual Anaconda Parade Route',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        isActive: false,
      },
      {
        id: '3',
        name: 'Road Closure - Highway 1',
        type: 'restricted',
        coordinates: [
          {latitude: 45.9000, longitude: -113.3500},
          {latitude: 45.9100, longitude: -113.3500},
        ],
        description: 'Construction zone - use alternate route',
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        isActive: true,
      },
    ];

    this.zones = mockZones;
    await setOfflineData('map_zones', this.zones);
  }

  private async fetchAlertsFromServer(): Promise<void> {
    // Simulate server data
    const mockAlerts: Alert[] = [
      {
        id: '1',
        title: 'Active Search Operation',
        message: 'Search and rescue operation in progress in Pintler Mountains. Please avoid the area.',
        type: 'search',
        priority: 'high',
        timestamp: new Date(),
        location: {latitude: 45.9231, longitude: -113.3943},
        isRead: false,
      },
      {
        id: '2',
        title: 'Weather Warning',
        message: 'Severe weather expected in the area. Stay alert for changing conditions.',
        type: 'weather',
        priority: 'medium',
        timestamp: new Date(),
        isRead: false,
      },
      {
        id: '3',
        title: 'Community Event',
        message: 'Annual Anaconda Parade tomorrow at 2 PM on Main Street.',
        type: 'event',
        priority: 'low',
        timestamp: new Date(),
        isRead: false,
      },
    ];

    this.alerts = mockAlerts;
    await setOfflineData('map_alerts', this.alerts);
  }

  getZones(): MapZone[] {
    return this.zones;
  }

  getActiveZones(): MapZone[] {
    return this.zones.filter(zone => zone.isActive);
  }

  getZoneById(id: string): MapZone | undefined {
    return this.zones.find(zone => zone.id === id);
  }

  getZonesByType(type: MapZone['type']): MapZone[] {
    return this.zones.filter(zone => zone.type === type);
  }

  getAlerts(): Alert[] {
    return this.alerts;
  }

  getActiveAlerts(): Alert[] {
    const now = new Date();
    return this.alerts.filter(alert => 
      !alert.isRead && 
      (!alert.expiresAt || alert.expiresAt > now)
    );
  }

  getAlertById(id: string): Alert | undefined {
    return this.alerts.find(alert => alert.id === id);
  }

  markAlertAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      setOfflineData('map_alerts', this.alerts);
    }
  }

  getZonesNearLocation(location: Location, radiusInMeters: number = 1000): MapZone[] {
    return this.zones.filter(zone => {
      // Check if any coordinate in the zone is within radius
      return zone.coordinates.some(coord => 
        this.calculateDistance(location, coord) <= radiusInMeters
      );
    });
  }

  private calculateDistance(location1: Location, location2: Location): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (location1.latitude * Math.PI) / 180;
    const φ2 = (location2.latitude * Math.PI) / 180;
    const Δφ = ((location2.latitude - location1.latitude) * Math.PI) / 180;
    const Δλ = ((location2.longitude - location1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Get zone color based on type
  getZoneColor(type: MapZone['type']): string {
    switch (type) {
      case 'restricted':
        return '#D32F2F'; // Red
      case 'caution':
        return '#FFC107'; // Yellow
      case 'clear':
        return '#4CAF50'; // Green
      case 'search':
        return '#9C27B0'; // Purple
      case 'detour':
        return '#FF9800'; // Orange
      case 'parade':
        return '#2196F3'; // Blue
      default:
        return '#9E9E9E'; // Gray
    }
  }

  // Get zone opacity based on status
  getZoneOpacity(zone: MapZone): number {
    if (!zone.isActive) return 0.3;
    
    const now = new Date();
    if (zone.startTime && zone.startTime > now) return 0.5;
    if (zone.endTime && zone.endTime < now) return 0.3;
    
    return 0.7;
  }
}

export const mapService = new MapService();
export const initializeMapService = () => mapService.initialize();
