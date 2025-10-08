import AsyncStorage from '@react-native-async-storage/async-storage';
import {PermissionsAndroid, Platform} from 'react-native';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {initializeLocationService} from './LocationService';
import {initializeMapService} from './MapService';
import {initializeNotificationService} from './NotificationService';

const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  OFFLINE_DATA: 'offline_data',
  LAST_SYNC: 'last_sync',
  APP_VERSION: 'app_version',
};

export const initializeApp = async (): Promise<void> => {
  try {
    console.log('Initializing APSAR Emergency App...');
    
    // Request necessary permissions
    await requestPermissions();
    
    // Initialize core services
    await initializeLocationService();
    await initializeMapService();
    await initializeNotificationService();
    
    // Load cached data
    await loadOfflineData();
    
    // Check for app updates
    await checkAppVersion();
    
    console.log('App initialization complete');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    throw error;
  }
};

const requestPermissions = async (): Promise<void> => {
  const permissions = [
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  ];

  if (Platform.OS === 'android') {
    // Request location permissions
    const locationPermission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (locationPermission !== RESULTS.GRANTED) {
      console.warn('Location permission not granted');
    }

    // Request camera permission
    const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
    if (cameraPermission !== RESULTS.GRANTED) {
      console.warn('Camera permission not granted');
    }

    // Request storage permissions
    const storagePermission = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    if (storagePermission !== RESULTS.GRANTED) {
      console.warn('Storage permission not granted');
    }
  }
};

const loadOfflineData = async (): Promise<void> => {
  try {
    const offlineData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
    if (offlineData) {
      const data = JSON.parse(offlineData);
      console.log('Loaded offline data:', Object.keys(data).length, 'items');
    }
  } catch (error) {
    console.error('Failed to load offline data:', error);
  }
};

const checkAppVersion = async (): Promise<void> => {
  try {
    const currentVersion = '1.0.0';
    const storedVersion = await AsyncStorage.getItem(STORAGE_KEYS.APP_VERSION);
    
    if (storedVersion !== currentVersion) {
      console.log('App version updated from', storedVersion, 'to', currentVersion);
      await AsyncStorage.setItem(STORAGE_KEYS.APP_VERSION, currentVersion);
      
      // Clear old cache if needed
      if (storedVersion) {
        await clearOldCache();
      }
    }
  } catch (error) {
    console.error('Failed to check app version:', error);
  }
};

const clearOldCache = async (): Promise<void> => {
  try {
    // Clear old cached data if app version changed
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    console.log('Cleared old cache data');
  } catch (error) {
    console.error('Failed to clear old cache:', error);
  }
};

export const getOfflineData = async (key: string): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return null;
  }
};

export const setOfflineData = async (key: string, data: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to set offline data:', error);
  }
};

export const clearOfflineData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.OFFLINE_DATA,
      STORAGE_KEYS.LAST_SYNC,
    ]);
    console.log('Cleared all offline data');
  } catch (error) {
    console.error('Failed to clear offline data:', error);
  }
};
