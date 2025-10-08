import PushNotification from 'react-native-push-notification';
import {Alert} from 'react-native';
import {Alert as AlertType} from '../types/index';

class NotificationService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
        // Store token for server communication
        this.storeNotificationToken(token.token);
      },

      onNotification: (notification) => {
        console.log('Received notification:', notification);
        
        // Handle notification based on type
        if (notification.userInteraction) {
          this.handleNotificationTap(notification);
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

  private storeNotificationToken(token: string): void {
    // Store token in AsyncStorage or send to server
    console.log('Storing notification token:', token);
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
      case 'REPORT':
        // Navigate to report screen
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }

  private navigateToAlert(alertId: string): void {
    // Navigation logic will be handled by the navigation service
    console.log('Navigate to alert:', alertId);
  }

  private navigateToReport(reportId: string): void {
    console.log('Navigate to report:', reportId);
  }

  private navigateToEvent(eventId: string): void {
    console.log('Navigate to event:', eventId);
  }

  // Send local notification
  sendLocalNotification(
    title: string,
    message: string,
    data?: any,
    actions?: string[]
  ): void {
    PushNotification.localNotification({
      title,
      message,
      data,
      actions,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      channelId: 'apsar-emergency',
      playSound: true,
    });
  }

  // Send emergency notification with special styling
  sendEmergencyNotification(
    title: string,
    message: string,
    data?: any
  ): void {
    PushNotification.localNotification({
      title: `🚨 ${title}`,
      message,
      data,
      soundName: 'emergency_alert.mp3', // Custom emergency sound
      vibrate: true,
      vibration: [0, 500, 200, 500], // Emergency vibration pattern
      priority: 'max',
      importance: 'max',
      channelId: 'apsar-emergency',
      playSound: true,
      ongoing: true, // Makes notification persistent
    });
  }

  // Cancel all notifications
  cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  // Cancel specific notification
  cancelNotification(id: string): void {
    PushNotification.cancelLocalNotifications({id});
  }

  // Set up notification channels (Android)
  createNotificationChannels(): void {
    PushNotification.createChannel(
      {
        channelId: 'apsar-emergency',
        channelName: 'APSAR Emergency Alerts',
        channelDescription: 'Critical emergency notifications',
        importance: 4,
        vibrate: true,
        soundName: 'emergency_alert.mp3',
      },
      (created) => console.log(`Emergency channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'apsar-general',
        channelName: 'APSAR General Updates',
        channelDescription: 'General app notifications',
        importance: 3,
        vibrate: true,
      },
      (created) => console.log(`General channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'apsar-community',
        channelName: 'APSAR Community Events',
        channelDescription: 'Community events and volunteer opportunities',
        importance: 2,
        vibrate: false,
      },
      (created) => console.log(`Community channel created: ${created}`)
    );
  }

  // Schedule recurring notification
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

  // Get notification permissions status
  async getPermissionsStatus(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions.alert && permissions.badge && permissions.sound);
      });
    });
  }
}

export const notificationService = new NotificationService();
export const setupPushNotifications = () => notificationService.initialize();
export const initializeNotificationService = () => notificationService.initialize();
