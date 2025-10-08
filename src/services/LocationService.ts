import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform} from 'react-native';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Location} from '../types/index';

class LocationService {
  private watchId: number | null = null;
  private currentLocation: Location | null = null;
  private locationCallbacks: ((location: Location) => void)[] = [];

  async initialize(): Promise<void> {
    await this.requestLocationPermission();
    await this.getCurrentPosition();
  }

  private async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      return granted === RESULTS.GRANTED;
    }
    return true;
  }

  async getCurrentPosition(): Promise<Location | null> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          
          this.currentLocation = location;
          this.notifyLocationCallbacks(location);
          resolve(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  startLocationTracking(): void {
    if (this.watchId !== null) {
      return; // Already tracking
    }

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        
        this.currentLocation = location;
        this.notifyLocationCallbacks(location);
      },
      (error) => {
        console.error('Error tracking location:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
        fastestInterval: 2000, // Fastest update every 2 seconds
      }
    );
  }

  stopLocationTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getCurrentLocation(): Location | null {
    return this.currentLocation;
  }

  addLocationCallback(callback: (location: Location) => void): void {
    this.locationCallbacks.push(callback);
  }

  removeLocationCallback(callback: (location: Location) => void): void {
    const index = this.locationCallbacks.indexOf(callback);
    if (index > -1) {
      this.locationCallbacks.splice(index, 1);
    }
  }

  private notifyLocationCallbacks(location: Location): void {
    this.locationCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location callback:', error);
      }
    });
  }

  // Calculate distance between two points in meters
  calculateDistance(location1: Location, location2: Location): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (location1.latitude * Math.PI) / 180;
    const φ2 = (location2.latitude * Math.PI) / 180;
    const Δφ = ((location2.latitude - location1.latitude) * Math.PI) / 180;
    const Δλ = ((location2.longitude - location1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Format location for display
  formatLocation(location: Location): string {
    const lat = location.latitude.toFixed(6);
    const lng = location.longitude.toFixed(6);
    return `${lat}, ${lng}`;
  }

  // Check if location is within a certain radius of a point
  isWithinRadius(
    centerLocation: Location,
    checkLocation: Location,
    radiusInMeters: number
  ): boolean {
    const distance = this.calculateDistance(centerLocation, checkLocation);
    return distance <= radiusInMeters;
  }
}

export const locationService = new LocationService();
export const initializeLocationService = () => locationService.initialize();
