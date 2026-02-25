import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationSchedule {
  id: number;
  title: string;
  body: string;
  hour: number;
  minute: number;
}

export class NotificationService {
  private static instance: NotificationService;
  private notificationSchedules: NotificationSchedule[] = [
    {
      id: 1,
      title: "🌅 Morning Care Check-in",
      body: "How is your caregiving morning going? Tap to log your activities and feelings.",
      hour: 12,
      minute: 0
    },
    {
      id: 2,
      title: "🌆 Evening Care Reflection",
      body: "Time for your evening care log. Share what happened during your afternoon.",
      hour: 18,
      minute: 0
    },
    {
      id: 3,
      title: "🌙 Night Care Summary",
      body: "Before bed, let's capture your evening caregiving experiences.",
      hour: 22,
      minute: 0
    }
  ];

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Notifications only available on mobile platforms');
      return;
    }

    try {
      // Request permissions
      const permission = await LocalNotifications.requestPermissions();
      
      if (permission.display === 'granted') {
        console.log('Notification permissions granted');
        await this.scheduleNotifications();
      } else {
        console.warn('Notification permissions denied');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async scheduleNotifications(): Promise<void> {
    try {
      // Cancel any existing notifications
      await LocalNotifications.cancel({ notifications: this.notificationSchedules.map(n => ({ id: n.id })) });

      const notifications = this.notificationSchedules.map(schedule => {
        const now = new Date();
        const scheduledTime = new Date(now);
        scheduledTime.setHours(schedule.hour, schedule.minute, 0, 0);

        // If the time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        return {
          id: schedule.id,
          title: schedule.title,
          body: schedule.body,
          schedule: {
            at: scheduledTime,
            repeats: true,
            every: 'day' as const
          },
          sound: 'default',
          attachments: undefined,
          actionTypeId: 'CARE_LOG_REMINDER',
          extra: {
            action: 'open_care_log',
            hour: schedule.hour
          }
        };
      });

      await LocalNotifications.schedule({ notifications });
      console.log('Notifications scheduled successfully:', notifications.length);
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await LocalNotifications.cancel({ 
        notifications: this.notificationSchedules.map(n => ({ id: n.id })) 
      });
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  async testNotification(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Test notification only available on mobile platforms');
      return;
    }

    try {
      const testTime = new Date();
      testTime.setSeconds(testTime.getSeconds() + 5); // 5 seconds from now

      await LocalNotifications.schedule({
        notifications: [{
          id: 999,
          title: "🧪 Test Notification",
          body: "This is a test notification from Care Connector!",
          schedule: { at: testTime },
          sound: 'default',
          extra: { action: 'test' }
        }]
      });

      console.log('Test notification scheduled for 5 seconds from now');
    } catch (error) {
      console.error('Error scheduling test notification:', error);
    }
  }

  setupNotificationListeners(): void {
    if (!Capacitor.isNativePlatform()) return;

    // Handle notification received (app is open)
    LocalNotifications.addListener('localNotificationReceived', notification => {
      console.log('Notification received:', notification);
      // You can show in-app notification here
    });

    // Handle notification action performed (user tapped notification)
    LocalNotifications.addListener('localNotificationActionPerformed', notification => {
      console.log('Notification action performed:', notification);
      
      if (notification.notification.extra?.action === 'open_care_log') {
        // Navigate to care log page or show add entry form
        this.handleCareLogReminder();
      }
    });
  }

  private handleCareLogReminder(): void {
    // This will be called when user taps on a care log reminder notification
    // You can dispatch a custom event that the main app can listen to
    const event = new CustomEvent('care-log-reminder', { 
      detail: { timestamp: new Date().toISOString() } 
    });
    window.dispatchEvent(event);
  }
}

export const notificationService = NotificationService.getInstance();
