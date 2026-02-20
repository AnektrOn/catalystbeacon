import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hcuniversity.beacon',
  appName: 'HC Beacon',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Allow localhost in development
    hostname: process.env.NODE_ENV === 'development' ? 'localhost' : undefined,
    // Clear text traffic allowed for development only
    cleartext: process.env.NODE_ENV === 'development',
    // For production Android/iOS store builds, optionally load app from your site so OAuth redirect works:
    // url: process.env.CAPACITOR_SERVER_URL || 'https://app.humancatalystbeacon.com'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#B4833D',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#B4833D'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Camera: {
      permissions: {
        camera: 'Allow HC Beacon to access your camera to take photos for your profile.',
        photos: 'Allow HC Beacon to access your photos to select profile images.'
      }
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#F7F1E1'
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development',
    backgroundColor: '#F7F1E1',
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined
    }
  }
};

export default config;
