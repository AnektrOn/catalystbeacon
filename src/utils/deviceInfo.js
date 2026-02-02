import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

/**
 * Device Information Service
 * Provides device information and capabilities
 */

class DeviceInfoService {
  constructor() {
    this.deviceInfo = null;
    this.isInitialized = false;
  }

  /**
   * Initialize device info
   */
  async initialize() {
    if (this.isInitialized) {
      return this.deviceInfo;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getInfo();
        this.deviceInfo = {
          model: info.model,
          platform: info.platform,
          operatingSystem: info.operatingSystem,
          osVersion: info.osVersion,
          manufacturer: info.manufacturer,
          isVirtual: info.isVirtual,
          memUsed: info.memUsed,
          diskFree: info.diskFree,
          diskTotal: info.diskTotal,
          isNative: true
        };
      } else {
        // Web platform
        const ua = navigator.userAgent;
        this.deviceInfo = {
          model: 'Web Browser',
          platform: 'web',
          operatingSystem: this.getWebOS(),
          osVersion: this.getWebOSVersion(),
          manufacturer: this.getBrowserName(),
          isVirtual: false,
          isNative: false,
          userAgent: ua
        };
      }

      this.isInitialized = true;
      return this.deviceInfo;
    } catch (error) {
      console.error('Error getting device info:', error);
      return {
        platform: 'unknown',
        isNative: false
      };
    }
  }

  /**
   * Get device info (cached)
   */
  async getDeviceInfo() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.deviceInfo;
  }

  /**
   * Check if device is iOS
   */
  async isIOS() {
    const info = await this.getDeviceInfo();
    return info.platform === 'ios';
  }

  /**
   * Check if device is Android
   */
  async isAndroid() {
    const info = await this.getDeviceInfo();
    return info.platform === 'android';
  }

  /**
   * Check if device is native (not web)
   */
  async isNative() {
    const info = await this.getDeviceInfo();
    return info.isNative === true;
  }

  /**
   * Get platform name
   */
  async getPlatform() {
    const info = await this.getDeviceInfo();
    return info.platform;
  }

  /**
   * Get OS version
   */
  async getOSVersion() {
    const info = await this.getDeviceInfo();
    return info.osVersion;
  }

  /**
   * Check if device has low memory
   */
  async hasLowMemory() {
    const info = await this.getDeviceInfo();
    if (info.memUsed && info.diskFree) {
      // Consider low memory if less than 1GB free
      return info.diskFree < 1024 * 1024 * 1024;
    }
    return false;
  }

  /**
   * Get browser name (web only)
   */
  getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Get web OS
   */
  getWebOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Get web OS version
   */
  getWebOSVersion() {
    const ua = navigator.userAgent;
    const match = ua.match(/(Windows NT|Mac OS X|Linux|Android|iPhone OS|iPad OS)\s*([\d._]+)/);
    return match ? match[2] : 'Unknown';
  }

  /**
   * Get device capabilities for performance optimization
   */
  async getCapabilities() {
    const info = await this.getDeviceInfo();
    const isLowEnd = await this.hasLowMemory();
    
    return {
      supports3D: !isLowEnd && info.isNative,
      supportsHighQualityVideo: !isLowEnd,
      supportsOfflineMode: info.isNative,
      supportsPushNotifications: info.isNative,
      supportsBiometrics: info.isNative && (info.platform === 'ios' || info.platform === 'android'),
      recommendedQuality: isLowEnd ? 'low' : 'high'
    };
  }
}

// Export singleton instance
export const deviceInfoService = new DeviceInfoService();
