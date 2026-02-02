import { deviceInfoService } from './deviceInfo';

/**
 * Performance Optimization Utilities
 * Provides utilities for optimizing app performance on mobile devices
 */

class PerformanceService {
  constructor() {
    this.deviceCapabilities = null;
    this.isLowEndDevice = false;
  }

  /**
   * Initialize performance service
   */
  async initialize() {
    const capabilities = await deviceInfoService.getCapabilities();
    this.deviceCapabilities = capabilities;
    this.isLowEndDevice = capabilities.recommendedQuality === 'low';
    return capabilities;
  }

  /**
   * Get recommended quality settings based on device
   */
  async getQualitySettings() {
    if (!this.deviceCapabilities) {
      await this.initialize();
    }

    if (this.isLowEndDevice) {
      return {
        quality: 'low',
        enableShadows: false,
        enablePostProcessing: false,
        particleCount: 50,
        textureQuality: 512,
        antialiasing: false,
        renderScale: 0.75
      };
    }

    return {
      quality: 'high',
      enableShadows: true,
      enablePostProcessing: true,
      particleCount: 200,
      textureQuality: 1024,
      antialiasing: true,
      renderScale: 1.0
    };
  }

  /**
   * Throttle function calls
   */
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  /**
   * Debounce function calls
   */
  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Lazy load image
   */
  lazyLoadImage(src, placeholder) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
      
      if (placeholder) {
        img.src = placeholder;
        img.onload = () => {
          img.src = src;
        };
      }
    });
  }

  /**
   * Check if device can handle 3D rendering
   */
  async canHandle3D() {
    if (!this.deviceCapabilities) {
      await this.initialize();
    }
    return this.deviceCapabilities.supports3D;
  }

  /**
   * Get recommended particle count
   */
  async getRecommendedParticleCount() {
    const settings = await this.getQualitySettings();
    return settings.particleCount;
  }

  /**
   * Get recommended texture size
   */
  async getRecommendedTextureSize() {
    const settings = await this.getQualitySettings();
    return settings.textureQuality;
  }

  /**
   * Should enable shadows
   */
  async shouldEnableShadows() {
    const settings = await this.getQualitySettings();
    return settings.enableShadows;
  }

  /**
   * Should enable post-processing
   */
  async shouldEnablePostProcessing() {
    const settings = await this.getQualitySettings();
    return settings.enablePostProcessing;
  }

  /**
   * Get render scale (for performance)
   */
  async getRenderScale() {
    const settings = await this.getQualitySettings();
    return settings.renderScale;
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Convenience functions
export const throttle = (func, delay) => performanceService.throttle(func, delay);
export const debounce = (func, delay) => performanceService.debounce(func, delay);
