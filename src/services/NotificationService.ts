import PushNotification from 'react-native-push-notification';
import {Alert, Linking, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert as AlertType, CallOut} from '../types/index';
import {apiService} from './ApiService';
import {authService} from './AuthService';

const STORAGE_KEYS = {
  NOTIFICATION_TOKEN: 'notification_token',
  SMS_ENABLED: 'sms_notifications_enabled',
  VOICE_ENABLED: 'voice_notifications_enabled',
};

interface NotificationOptions {
  title: string;
  message: string;
  data?: any;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  sound?: string;
  vibrate?: boolean | number[];
  actions?: NotificationAction[];
  category?: string;
  badge?: number;
  userInfo?: any;
}

interface NotificationAction {
  id: string;
  title: string;
  foreground?: boolean;
}

interface SMSOptions {
  phoneNumber: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
}

interface VoiceCallOptions {
  phoneNumber: string;
  message?: string;
  timeout?: number;
}

class NotificationService {
  private isInitialized = false;
  private notificationToken: string | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Create notification channels (Android)
    this.createNotificationChannels();

    PushNotification.configure({
      onRegister: async (token) => {
        console.log('Push notification token:', token);
        this.notificationToken = token.token;
        await this.storeNotificationToken(token.token);
        await this.registerTokenWithServer(token.token);
      },

      onNotification: (notification) => {
        console.log('Received notification:', notification);
        
        // Handle notification based on type
        if (notification.userInteraction) {
          this.handleNotificationTap(notification);
        }
        
        // Show notification even when app is in foreground
        if (Platform.OS === 'ios') {
          notification.finish('UIBackgroundFetchResultNoData');
        }
      },

      onAction: (notification) => {
        console.log('Notification action:', notification);
        this.handleNotificationAction(notification);
      },

      onRegistrationError: (error) => {
        console.error('Push notification registration error:', error);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    this.isInitialized = true;
  }

  private async storeNotificationToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_TOKEN, token);
    } catch (error) {
      console.error('Failed to store notification token:', error);
    }
  }

  private async registerTokenWithServer(token: string): Promise<void> {
    try {
      // Register token with backend for push notifications
      const user = authService.getCurrentUser();
      if (user) {
        // API call would go here to register token
        // await apiService.registerNotificationToken(token);
        console.log('Token registered with server:', token);
      }
    } catch (error) {
      console.error('Failed to register token with server:', error);
    }
  }

  private handleNotificationTap(notification: any): void {
    // Handle notification tap based on data
    const {data} = notification;
    
    if (data?.alertId) {
      // Navigate to alert details
      this.navigateToAlert(data.alertId);
    } else if (data?.reportId) {
      // Navigate to report details
      this.navigateToReport(data.reportId);
    } else if (data?.eventId) {
      // Navigate to event details
      this.navigateToEvent(data.eventId);
    } else if (data?.callOutId) {
      // Navigate to call-out details
      this.navigateToCallOut(data.callOutId);
    } else if (data?.missionId) {
      // Navigate to SAR mission details
      this.navigateToSARMission(data.missionId);
    } else if (data?.incidentId) {
      // Navigate to incident details
      this.navigateToIncident(data.incidentId);
    } else if (data?.url) {
      // Open URL
      Linking.openURL(data.url);
    }
  }

  private handleNotificationAction(notification: any): void {
    const {action, notification: notificationData} = notification;
    
    switch (action) {
      case 'VIEW':
        this.handleNotificationTap(notificationData);
        break;
      case 'DISMISS':
        // Mark notification as read
        break;
      case 'RESPOND':
        // Navigate to response screen
        if (notificationData.data?.callOutId) {
          this.navigateToCallOut(notificationData.data.callOutId);
        }
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }

  private navigateToAlert(alertId: string): void {
    console.log('Navigate to alert:', alertId);
    // Navigation logic will be handled by the navigation service
  }

  private navigateToReport(reportId: string): void {
    console.log('Navigate to report:', reportId);
  }

  private navigateToEvent(eventId: string): void {
    console.log('Navigate to event:', eventId);
  }

  private navigateToCallOut(callOutId: string): void {
    console.log('Navigate to call-out:', callOutId);
  }

  private navigateToSARMission(missionId: string): void {
    console.log('Navigate to SAR mission:', missionId);
  }

  private navigateToIncident(incidentId: string): void {
    console.log('Navigate to incident:', incidentId);
  }

  /**
   * Send enhanced push notification
   */
  async sendPushNotification(options: NotificationOptions): Promise<void> {
    const {
      title,
      message,
      data,
      priority = 'high',
      sound = 'default',
      vibrate = true,
      actions,
      category,
      badge,
      userInfo,
    } = options;

    PushNotification.localNotification({
      title,
      message,
      data: data || userInfo,
      soundName: sound,
      vibrate: typeof vibrate === 'boolean' ? vibrate : true,
      vibration: typeof vibrate === 'object' ? vibrate : 300,
      priority: Platform.OS === 'android' ? priority : undefined,
      importance: Platform.OS === 'android' ? priority : undefined,
      channelId: this.getChannelIdForPriority(priority),
      playSound: true,
      userInfo: userInfo || data,
      actions: actions,
      category: category,
      number: badge,
    });
  }

  /**
   * Send emergency notification with special styling
   */
  sendEmergencyNotification(
    title: string,
    message: string,
    data?: any
  ): void {
    this.sendPushNotification({
      title: `🚨 ${title}`,
      message,
      data,
      priority: 'max',
      sound: 'emergency_alert.mp3',
      vibrate: [0, 500, 200, 500],
      category: 'EMERGENCY',
    });

    // Also trigger emergency sound/vibration patterns
    PushNotification.localNotification({
      title: `🚨 ${title}`,
      message,
      data,
      soundName: 'emergency_alert.mp3',
      vibrate: true,
      vibration: [0, 500, 200, 500, 200, 500],
      priority: 'max',
      importance: 'max',
      channelId: 'apsar-emergency',
      playSound: true,
      ongoing: true,
      actions: ['VIEW', 'DISMISS'],
      category: 'EMERGENCY',
    });
  }

  /**
   * Send call-out notification with response actions
   */
  async sendCallOutNotification(callOut: CallOut): Promise<void> {
    await this.sendPushNotification({
      title: '📞 Call-Out Request',
      message: callOut.title,
      data: {callOutId: callOut.id, type: 'callout'},
      priority: 'max',
      sound: 'callout_alert.mp3',
      vibrate: [0, 400, 200, 400],
      actions: [
        {id: 'RESPOND', title: 'Respond', foreground: false},
        {id: 'VIEW', title: 'View Details', foreground: true},
      ],
      category: 'CALLOUT',
    });

    // Also send SMS if enabled and user is personnel
    const user = authService.getCurrentUser();
    if (user && user.phone) {
      const smsEnabled = await this.isSMSEnabled();
      if (smsEnabled) {
        await this.sendSMS({
          phoneNumber: user.phone,
          message: `APSAR Call-Out: ${callOut.title}\n${callOut.message}\nRespond in app or call dispatch.`,
          priority: 'high',
        });
      }
    }
  }

  /**
   * Send SMS notification (via backend API - Twilio integration)
   */
  async sendSMS(options: SMSOptions): Promise<boolean> {
    try {
      const {phoneNumber, message, priority = 'normal'} = options;

      // In production, this would call the backend API which uses Twilio
      // await apiService.sendSMS({phoneNumber, message, priority});
      
      console.log(`SMS to ${phoneNumber}: ${message}`);
      
      // For development, log the SMS
      if (__DEV__) {
        console.log('[SMS]', {
          to: phoneNumber,
          message,
          priority,
          timestamp: new Date().toISOString(),
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Send voice call notification (via backend API - Twilio integration)
   */
  async sendVoiceCall(options: VoiceCallOptions): Promise<boolean> {
    try {
      const {phoneNumber, message = 'You have an emergency call-out. Please check the APSAR app for details.', timeout = 30} = options;

      // In production, this would call the backend API which uses Twilio
      // await apiService.sendVoiceCall({phoneNumber, message, timeout});
      
      console.log(`Voice call to ${phoneNumber}: ${message}`);
      
      // For development, log the call
      if (__DEV__) {
        console.log('[Voice Call]', {
          to: phoneNumber,
          message,
          timeout,
          timestamp: new Date().toISOString(),
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to send voice call:', error);
      return false;
    }
  }

  /**
   * Send multi-channel notification (push + SMS + voice for critical alerts)
   */
  async sendMultiChannelNotification(
    title: string,
    message: string,
    options: {
      push?: boolean;
      sms?: boolean;
      voice?: boolean;
      phoneNumber?: string;
      priority?: 'low' | 'normal' | 'high' | 'critical';
      data?: any;
    } = {}
  ): Promise<{
    push: boolean;
    sms: boolean;
    voice: boolean;
  }> {
    const {
      push = true,
      sms = false,
      voice = false,
      phoneNumber,
      priority = 'normal',
      data,
    } = options;

    const results = {
      push: false,
      sms: false,
      voice: false,
    };

    // Send push notification
    if (push) {
      try {
        await this.sendPushNotification({
          title,
          message,
          data,
          priority: priority === 'critical' ? 'max' : priority === 'high' ? 'high' : 'default',
        });
        results.push = true;
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }

    // Send SMS if requested
    if (sms && phoneNumber) {
      results.sms = await this.sendSMS({
        phoneNumber,
        message: `${title}\n\n${message}`,
        priority: priority === 'critical' || priority === 'high' ? 'high' : 'normal',
      });
    }

    // Send voice call if requested (critical only)
    if (voice && phoneNumber && (priority === 'critical' || priority === 'high')) {
      results.voice = await this.sendVoiceCall({
        phoneNumber,
        message: `${title}. ${message}`,
      });
    }

    return results;
  }

  /**
   * Get channel ID based on priority (Android)
   */
  private getChannelIdForPriority(priority: string): string {
    switch (priority) {
      case 'max':
        return 'apsar-emergency';
      case 'high':
        return 'apsar-emergency';
      case 'default':
        return 'apsar-general';
      case 'low':
      case 'min':
        return 'apsar-community';
      default:
        return 'apsar-general';
    }
  }

  /**
   * Cancel all notifications
   */
  cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * Cancel specific notification
   */
  cancelNotification(id: string): void {
    PushNotification.cancelLocalNotifications({id});
  }

  /**
   * Set up notification channels (Android)
   */
  createNotificationChannels(): void {
    if (Platform.OS !== 'android') {
      return;
    }

    PushNotification.createChannel(
      {
        channelId: 'apsar-emergency',
        channelName: 'APSAR Emergency Alerts',
        channelDescription: 'Critical emergency notifications',
        importance: 4, // HIGH
        vibrate: true,
        soundName: 'emergency_alert.mp3',
        enableVibrate: true,
        enableLights: true,
      },
      (created) => console.log(`Emergency channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'apsar-general',
        channelName: 'APSAR General Updates',
        channelDescription: 'General app notifications',
        importance: 3, // DEFAULT
        vibrate: true,
        enableVibrate: true,
      },
      (created) => console.log(`General channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'apsar-community',
        channelName: 'APSAR Community Events',
        channelDescription: 'Community events and volunteer opportunities',
        importance: 2, // LOW
        vibrate: false,
        enableVibrate: false,
      },
      (created) => console.log(`Community channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'apsar-callout',
        channelName: 'APSAR Call-Outs',
        channelDescription: 'Personnel call-out notifications',
        importance: 4, // HIGH
        vibrate: true,
        soundName: 'callout_alert.mp3',
        enableVibrate: true,
        enableLights: true,
      },
      (created) => console.log(`Call-out channel created: ${created}`)
    );
  }

  /**
   * Schedule notification
   */
  scheduleNotification(
    title: string,
    message: string,
    date: Date,
    repeatType?: 'minute' | 'hour' | 'day' | 'week'
  ): void {
    PushNotification.localNotificationSchedule({
      title,
      message,
      date,
      repeatType,
      soundName: 'default',
      vibrate: true,
    });
  }

  /**
   * Get notification permissions status
   */
  async getPermissionsStatus(): Promise<{
    alert: boolean;
    badge: boolean;
    sound: boolean;
  }> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve({
          alert: permissions.alert || false,
          badge: permissions.badge || false,
          sound: permissions.sound || false,
        });
      });
    });
  }

  /**
   * Enable/disable SMS notifications
   */
  async setSMSEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SMS_ENABLED, JSON.stringify(enabled));
    } catch (error) {
      console.error('Failed to save SMS preference:', error);
    }
  }

  /**
   * Check if SMS notifications are enabled
   */
  async isSMSEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.SMS_ENABLED);
      return value ? JSON.parse(value) : false;
    } catch (error) {
      console.error('Failed to read SMS preference:', error);
      return false;
    }
  }

  /**
   * Enable/disable voice call notifications
   */
  async setVoiceEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VOICE_ENABLED, JSON.stringify(enabled));
    } catch (error) {
      console.error('Failed to save voice preference:', error);
    }
  }

  /**
   * Check if voice call notifications are enabled
   */
  async isVoiceEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.VOICE_ENABLED);
      return value ? JSON.parse(value) : false;
    } catch (error) {
      console.error('Failed to read voice preference:', error);
      return false;
    }
  }

  /**
   * Get notification token
   */
  getNotificationToken(): string | null {
    return this.notificationToken;
  }
}

export const notificationService = new NotificationService();
export const setupPushNotifications = () => notificationService.initialize();
export const initializeNotificationService = () => notificationService.initialize();
