import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabaseClient';

/**
 * Push Notification Service
 * Handles push notification registration, token storage, and event handling
 */
class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.deviceToken = null;
    this.userId = null;
  }

  /**
   * Initialize push notifications
   * Call this when user logs in
   */
  async initialize(userId) {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (this.isInitialized) {
      return;
    }

    this.userId = userId;

    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('Push notification permission denied');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();

      // Set up event listeners
      this.setupListeners();

      this.isInitialized = true;
      console.log('Push notifications initialized');
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  /**
   * Set up push notification event listeners
   */
  setupListeners() {
    // Registration event - token received (do not log token value - security)
    PushNotifications.addListener('registration', async (token) => {
      this.deviceToken = token.value;
      await this.saveDeviceToken(token.value);
    });

    // Registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Notification received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      // You can show a custom in-app notification here
      this.handleNotificationReceived(notification);
    });

    // Notification tapped/opened
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action performed', action);
      this.handleNotificationTapped(action);
    });
  }

  /**
   * Save device token to Supabase
   */
  async saveDeviceToken(token) {
    if (!this.userId) {
      console.warn('Cannot save device token: user not logged in');
      return;
    }

    try {
      const platform = Capacitor.getPlatform();
      const deviceInfo = await this.getDeviceInfo();

      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: this.userId,
          device_token: token,
          platform: platform,
          device_info: deviceInfo,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_token'
        });

      if (error) {
        console.error('Error saving device token:', error);
      } else {
        console.log('Device token saved successfully');
      }
    } catch (error) {
      console.error('Error saving device token:', error);
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo() {
    try {
      const { Device } = await import('@capacitor/device');
      const device = await Device.getInfo();
      return {
        model: device.model,
        platform: device.platform,
        operatingSystem: device.operatingSystem,
        osVersion: device.osVersion,
        manufacturer: device.manufacturer
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return {};
    }
  }

  /**
   * Handle notification received (foreground)
   */
  handleNotificationReceived(notification) {
    // Show custom in-app notification
    // You can use react-hot-toast or a custom notification component
    if (window.showNotification) {
      window.showNotification({
        title: notification.title,
        body: notification.body,
        data: notification.data
      });
    }
  }

  /**
   * Handle notification tapped
   */
  handleNotificationTapped(action) {
    const notification = action.notification;
    const data = notification.data;

    // Navigate based on notification data
    if (data && data.route) {
      // Use React Router to navigate
      if (window.navigateToRoute) {
        window.navigateToRoute(data.route);
      } else {
        // Fallback: reload app at route
        window.location.href = data.route;
      }
    }
  }

  /**
   * Remove device token (on logout)
   */
  async removeDeviceToken() {
    if (!this.userId || !this.deviceToken) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_push_tokens')
        .delete()
        .eq('user_id', this.userId)
        .eq('device_token', this.deviceToken);

      if (error) {
        console.error('Error removing device token:', error);
      } else {
        console.log('Device token removed');
        this.deviceToken = null;
      }
    } catch (error) {
      console.error('Error removing device token:', error);
    }
  }

  /**
   * Cleanup (call on logout)
   */
  async cleanup() {
    await this.removeDeviceToken();
    this.isInitialized = false;
    this.userId = null;
    this.deviceToken = null;
  }

  /**
   * Get current device token
   */
  getDeviceToken() {
    return this.deviceToken;
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
