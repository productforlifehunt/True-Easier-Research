/**
 * Notification Scheduler Service
 * Handles hourly survey reminders with multiple Do Not Disturb periods support
 */

interface DNDPeriod {
  id?: number;
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  label?: string;
  is_active: boolean;
}

interface NotificationPreferences {
  hourly_reminders_enabled: boolean;
  dnd_periods: DNDPeriod[];
  notification_permission_status: 'default' | 'granted' | 'denied';
}

class NotificationScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private preferences: NotificationPreferences | null = null;

  /**
   * Check if current time is within any active DND period
   */
  private isInAnyDNDPeriod(dndPeriods: DNDPeriod[]): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const period of dndPeriods) {
      if (!period.is_active) continue;

      // Parse DND times (format: HH:MM:SS)
      const [startHour, startMin] = period.start_time.split(':').map(Number);
      const [endHour, endMin] = period.end_time.split(':').map(Number);
      
      const dndStartMinutes = startHour * 60 + startMin;
      const dndEndMinutes = endHour * 60 + endMin;

      // Handle overnight DND period (e.g., 22:00 to 08:00)
      if (dndStartMinutes > dndEndMinutes) {
        if (currentTime >= dndStartMinutes || currentTime < dndEndMinutes) {
          return true;
        }
      } else {
        // Same day DND period
        if (currentTime >= dndStartMinutes && currentTime < dndEndMinutes) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Send a survey reminder notification
   */
  private async sendSurveyReminder(language: 'en' | 'zh' = 'en') {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const title = language === 'zh' ? '调查提醒' : 'Survey Reminder';
    const body = language === 'zh' 
      ? '是时候填写您的每小时调查了。点击查看详情。'
      : 'Time to fill out your hourly survey. Click to view details.';

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'hourly-survey-reminder',
        requireInteraction: false,
        silent: false,
        data: {
          url: '/survey',
          timestamp: new Date().toISOString()
        }
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = '/survey';
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      console.log('Survey reminder sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Check and send notification if conditions are met
   */
  private checkAndNotify(language: 'en' | 'zh' = 'en') {
    if (!this.preferences) {
      console.log('No notification preferences set');
      return;
    }

    // Check if hourly reminders are enabled
    if (!this.preferences.hourly_reminders_enabled) {
      console.log('Hourly reminders are disabled');
      return;
    }

    // Check if in any DND period
    if (this.isInAnyDNDPeriod(this.preferences.dnd_periods)) {
      console.log('Currently in Do Not Disturb period - skipping notification');
      return;
    }

    // Send notification
    this.sendSurveyReminder(language);
  }

  /**
   * Start hourly notification schedule
   */
  start(preferences: NotificationPreferences, language: 'en' | 'zh' = 'en') {
    this.preferences = preferences;

    // Clear any existing interval
    this.stop();

    if (!preferences.hourly_reminders_enabled) {
      console.log('Hourly reminders disabled - not starting scheduler');
      return;
    }

    console.log('Starting hourly notification scheduler');
    console.log(`Active DND Periods: ${preferences.dnd_periods.filter(p => p.is_active).length}`);

    // Send initial check (in case starting mid-hour)
    this.checkAndNotify(language);

    // Schedule hourly checks (every hour at :00 minutes)
    const now = new Date();
    const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;

    // Wait until next hour, then start hourly interval
    setTimeout(() => {
      this.checkAndNotify(language);
      
      // Then check every hour
      this.intervalId = setInterval(() => {
        this.checkAndNotify(language);
      }, 60 * 60 * 1000); // 1 hour in milliseconds
    }, msUntilNextHour);

    console.log(`Next notification check in ${Math.round(msUntilNextHour / 1000 / 60)} minutes`);
  }

  /**
   * Stop notification schedule
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Stopped hourly notification scheduler');
    }
  }

  /**
   * Update preferences and restart if needed
   */
  updatePreferences(preferences: NotificationPreferences, language: 'en' | 'zh' = 'en') {
    this.preferences = preferences;
    
    if (preferences.hourly_reminders_enabled) {
      this.start(preferences, language);
    } else {
      this.stop();
    }
  }

  /**
   * Send a test notification immediately (ignores DND)
   */
  async sendTestNotification(language: 'en' | 'zh' = 'en') {
    const title = language === 'zh' ? '测试通知' : 'Test Notification';
    const body = language === 'zh' 
      ? '这是一个测试通知。您的每小时提醒将按此方式发送。'
      : 'This is a test notification. Your hourly reminders will be sent this way.';

    if (!('Notification' in window)) {
      throw new Error('Browser does not support notifications');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'test-notification',
      requireInteraction: false
    });

    notification.onclick = () => {
      notification.close();
    };

    setTimeout(() => notification.close(), 5000);
  }
}

// Export singleton instance
export const notificationScheduler = new NotificationScheduler();
