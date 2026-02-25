import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.careconnector.app',
  appName: 'Care Connector',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    iosScheme: 'ionic'
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#FFFFFF'
  },
  android: {
    backgroundColor: '#FFFFFF',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    Keyboard: {
      resize: 'native',
      style: 'light',
      resizeOnFullScreen: true
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#10B981",
      sound: "beep.wav"
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#FFFFFF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: "#FFFFFF",
      overlaysWebView: false
    },
    App: {
      backgroundColor: '#FFFFFF'
    },
    Haptics: {}
  }
};

export default config;
