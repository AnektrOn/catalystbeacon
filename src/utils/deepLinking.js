import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';

/**
 * Deep Linking Service
 * Handles deep links and universal links for iOS and Android
 */

class DeepLinkingService {
  constructor() {
    this.listeners = [];
    this.currentUrl = null;
    this.isInitialized = false;
  }

  /**
   * Initialize deep linking
   * Call this in App.js after router is ready
   */
  async initialize(navigate) {
    if (this.isInitialized) {
      return;
    }

    this.navigate = navigate;

    if (Capacitor.isNativePlatform()) {
      // Listen for app URL open events (deep links)
      App.addListener('appUrlOpen', (event) => {
        console.log('App opened via URL:', event.url);
        this.handleDeepLink(event.url);
      });

      // Get initial URL if app was opened via deep link
      App.getLaunchUrl().then((result) => {
        if (result && result.url) {
          console.log('App launched via URL:', result.url);
          this.handleDeepLink(result.url);
        }
      }).catch(() => {
        // No launch URL, app opened normally
      });
    } else {
      // Web: Handle URL changes
      window.addEventListener('popstate', () => {
        this.handleDeepLink(window.location.href);
      });
    }

    this.isInitialized = true;
  }

  /**
   * Handle deep link URL
   * @param {string} url - The deep link URL
   */
  handleDeepLink(url) {
    if (!url) return;

    this.currentUrl = url;
    console.log('Handling deep link:', url);

    try {
      // Parse URL (query and hash; Supabase OAuth uses hash for tokens)
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const queryParams = new URLSearchParams(urlObj.search);
      const hashParams = urlObj.hash ? new URLSearchParams(urlObj.hash.slice(1)) : new URLSearchParams();
      const params = new URLSearchParams([...queryParams.entries(), ...hashParams.entries()]);

      // Extract route from path
      let route = path;

      // Handle different URL schemes
      if (urlObj.hostname === 'humancatalystbeacon.com' || 
          urlObj.hostname === 'www.humancatalystbeacon.com') {
        // Universal link / App link
        route = path;
      } else if (urlObj.protocol === 'hcbeacon:') {
        // Custom scheme
        route = path;
      }

      // Handle authentication tokens (query or hash – Supabase OAuth uses hash)
      const accessToken = params.get('access_token') || params.get('token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        this.handleAuthTokens(accessToken, refreshToken, route);
        return;
      }

      // Handle password reset
      if (route.includes('/reset-password')) {
        const accessToken = params.get('access_token');
        const type = params.get('type');
        if (accessToken && type === 'recovery') {
          this.navigate(`/reset-password?access_token=${accessToken}&type=${type}`);
          return;
        }
      }

      // Handle email verification
      if (route.includes('/verify-email')) {
        const accessToken = params.get('access_token');
        const type = params.get('type');
        if (accessToken && type === 'signup') {
          this.navigate(`/verify-email?access_token=${accessToken}&type=${type}`);
          return;
        }
      }

      // Handle course links
      if (route.startsWith('/courses/')) {
        this.navigate(route);
        return;
      }

      // Handle lesson links
      const lessonMatch = route.match(/\/courses\/([^/]+)\/chapters\/(\d+)\/lessons\/(\d+)/);
      if (lessonMatch) {
        const [, courseId, chapterNumber, lessonNumber] = lessonMatch;
        this.navigate(`/courses/${courseId}/chapters/${chapterNumber}/lessons/${lessonNumber}`);
        return;
      }

      // Handle roadmap links
      if (route.startsWith('/roadmap/')) {
        this.navigate(route);
        return;
      }

      // Handle profile links
      if (route.startsWith('/profile')) {
        this.navigate(route);
        return;
      }

      // Handle dashboard
      if (route === '/' || route === '/dashboard') {
        this.navigate('/dashboard');
        return;
      }

      // Default: navigate to route
      if (route && route !== '/') {
        this.navigate(route);
      }

      // Notify listeners
      this.notifyListeners({ url, route, params });
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }

  /**
   * Handle authentication tokens from deep link
   */
  async handleAuthTokens(token, refreshToken, route) {
    try {
      const { supabase } = await import('../lib/supabaseClient');
      
      // Set session with tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: refreshToken
      });

      if (error) {
        console.error('Error setting session from deep link:', error);
        return;
      }

      // Navigate to intended route or dashboard
      const targetRoute = route && route !== '/' ? route : '/dashboard';
      this.navigate(targetRoute);
    } catch (error) {
      console.error('Error handling auth tokens:', error);
    }
  }

  /**
   * Add listener for deep link events
   */
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in deep link listener:', error);
      }
    });
  }

  /**
   * Get current URL
   */
  getCurrentUrl() {
    return this.currentUrl;
  }

  /**
   * Create deep link URL
   * @param {string} route - Route path
   * @param {object} params - URL parameters
   */
  createDeepLink(route, params = {}) {
    const baseUrl = 'https://humancatalystbeacon.com';
    const url = new URL(route, baseUrl);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return url.toString();
  }
}

// Export singleton instance
export const deepLinkingService = new DeepLinkingService();

/**
 * React hook for deep linking
 */
export function useDeepLinking() {
  const navigate = useNavigate();

  React.useEffect(() => {
    deepLinkingService.initialize(navigate);
    
    return () => {
      // Cleanup if needed
    };
  }, [navigate]);

  return {
    handleDeepLink: (url) => deepLinkingService.handleDeepLink(url),
    createDeepLink: (route, params) => deepLinkingService.createDeepLink(route, params),
    addListener: (callback) => deepLinkingService.addListener(callback),
  };
}
