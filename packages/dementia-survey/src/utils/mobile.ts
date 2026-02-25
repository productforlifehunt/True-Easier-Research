import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

export class MobileService {
  private static instance: MobileService;

  public static getInstance(): MobileService {
    if (!MobileService.instance) {
      MobileService.instance = new MobileService();
    }
    return MobileService.instance;
  }

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Mobile features only available on native platforms');
      return;
    }

    try {
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
      await StatusBar.setOverlaysWebView({ overlay: false });

      // Hide splash screen after initialization
      await SplashScreen.hide();

      // Set up app lifecycle listeners
      this.setupAppListeners();

      console.log('Mobile service initialized successfully');
    } catch (error) {
      console.error('Error initializing mobile service:', error);
    }
  }

  private setupAppListeners(): void {
    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
      
      if (isActive) {
        // App came to foreground
        this.handleAppActivated();
      } else {
        // App went to background
        this.handleAppDeactivated();
      }
    });

    // Handle URL opened (deep linking)
    App.addListener('appUrlOpen', (event) => {
      console.log('App opened via URL:', event.url);
      // Handle deep linking here if needed
    });

    // Handle back button on Android
    App.addListener('backButton', (event) => {
      console.log('Back button pressed');
      // Custom back button handling if needed
      // For now, let the default behavior happen
    });
  }

  private handleAppActivated(): void {
    // Refresh data when app comes to foreground
    const event = new CustomEvent('app-activated');
    window.dispatchEvent(event);
  }

  private handleAppDeactivated(): void {
    // Save any pending data when app goes to background
    const event = new CustomEvent('app-deactivated');
    window.dispatchEvent(event);
  }

  static isMobile(): boolean {
    return Capacitor.isNativePlatform();
  }

  static getPlatform(): string {
    return Capacitor.getPlatform();
  }

  static async exitApp(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await App.exitApp();
    }
  }
}

export const mobileService = MobileService.getInstance();
