import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Haptic Feedback Service
 * Provides haptic feedback for user interactions
 */

class HapticsService {
  /**
   * Trigger impact haptic feedback
   * @param {string} style - 'light', 'medium', or 'heavy'
   */
  async impact(style = 'medium') {
    if (!Capacitor.isNativePlatform()) {
      return; // No haptics on web
    }

    try {
      let impactStyle;
      switch (style) {
        case 'light':
          impactStyle = ImpactStyle.Light;
          break;
        case 'heavy':
          impactStyle = ImpactStyle.Heavy;
          break;
        case 'medium':
        default:
          impactStyle = ImpactStyle.Medium;
          break;
      }

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.error('Error triggering haptic impact:', error);
    }
  }

  /**
   * Trigger notification haptic feedback
   * @param {string} type - 'success', 'warning', or 'error'
   */
  async notification(type = 'success') {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      let notificationType;
      switch (type) {
        case 'warning':
          notificationType = NotificationType.Warning;
          break;
        case 'error':
          notificationType = NotificationType.Error;
          break;
        case 'success':
        default:
          notificationType = NotificationType.Success;
          break;
      }

      await Haptics.notification({ type: notificationType });
    } catch (error) {
      console.error('Error triggering haptic notification:', error);
    }
  }

  /**
   * Trigger selection haptic feedback (for pickers, switches, etc.)
   */
  async selection() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await Haptics.selectionStart();
      // Selection end is called automatically after a short delay
      setTimeout(() => {
        Haptics.selectionEnd().catch(() => {});
      }, 100);
    } catch (error) {
      console.error('Error triggering haptic selection:', error);
    }
  }

  /**
   * Vibrate (for Android compatibility; on web uses Vibration API)
   * @param {number} duration - Duration in milliseconds
   */
  async vibrate(duration = 200) {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.vibrate({ duration });
      } catch (error) {
        console.error('Error vibrating:', error);
      }
      return;
    }

    // Web: use Vibration API when available (Android Chrome, etc.; not supported on iOS Safari)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // ignore
      }
    }
  }
}

/**
 * Web-only: start a repeating "ring" vibration pattern (e.g. for incoming call).
 * Uses Vibration API. Returns a stop function. No-op if API not available (e.g. iOS).
 * @returns {() => void} Call to stop vibrating
 */
export function startRingVibration() {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return () => {};

  const pattern = [400, 200, 400]; // vibrate, pause, vibrate (like a ring)
  const intervalMs = 2000; // repeat every 2s
  const id = setInterval(() => {
    navigator.vibrate(pattern);
  }, intervalMs);
  // First buzz immediately
  navigator.vibrate(pattern);

  return () => {
    clearInterval(id);
    navigator.vibrate(0); // cancel
  };
}

// Export singleton instance
export const hapticsService = new HapticsService();

// Convenience functions
export const hapticImpact = (style) => hapticsService.impact(style);
export const hapticNotification = (type) => hapticsService.notification(type);
export const hapticSelection = () => hapticsService.selection();
export const hapticVibrate = (duration) => hapticsService.vibrate(duration);
