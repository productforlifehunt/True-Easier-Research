/**
 * Notification Scheduler Service
 * Production-ready notification system with:
 * - Hourly survey reminders (fires every hour on the hour, 8 AM – 10 PM local time)
 * - Daily survey reminders (fires once per day at user-configured time, default 10 PM)
 * - Multiple Do Not Disturb periods with overnight support
 * - Push notifications master toggle (gates all browser notification delivery)
 * - Research notifications preference (stored for server-side; sent at researcher-decided time)
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
  daily_reminders_enabled: boolean;
  daily_reminder_time: string; // HH:MM:SS format, default '22:00:00' (10 PM)
  push_notifications_enabled: boolean;
  dnd_periods: DNDPeriod[];
  notification_permission_status: 'default' | 'granted' | 'denied';
}
const DAILY_REMINDER_STORAGE_KEY = 'last_daily_reminder_date';

class NotificationScheduler {
  private hourlyIntervalId: ReturnType<typeof setTimeout> | null = null;
  private hourlyTimerId: ReturnType<typeof setTimeout> | null = null;
  private dailyTimerId: ReturnType<typeof setTimeout> | null = null;
  private preferences: NotificationPreferences | null = null;
  private language: 'en' | 'zh' = 'en';

  /**
   * Check if browser notifications can be delivered
   */
  private canSendNotification(): boolean {
    if (!('Notification' in window)) return false;
    if (Notification.permission !== 'granted') return false;
    if (!this.preferences) return false;
    // Master push toggle gates all browser notifications
    if (!this.preferences.push_notifications_enabled) return false;
    return true;
  }

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
   * Send a browser notification with click-to-navigate
   */
  private sendBrowserNotification(
    title: string,
    body: string,
    tag: string,
    navigateTo: string = '/survey',
    autoCloseMs: number = 10000
  ) {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag,
        requireInteraction: false,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = navigateTo;
        notification.close();
      };

      setTimeout(() => notification.close(), autoCloseMs);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // ─── Hourly Reminders ──────────────────────────────────────────────

  /**
   * Check if current hour is within the hourly active window (8 AM – 10 PM)
   */
  private isInHourlyActiveWindow(): boolean {
    const hour = new Date().getHours();
    return hour >= 8 && hour < 22; // 8:00 AM to 9:59 PM (last reminder at 21:00)
  }

  /**
   * Check and send hourly reminder if conditions are met
   */
  private checkAndNotifyHourly() {
    if (!this.preferences) return;
    if (!this.preferences.hourly_reminders_enabled) return;
    if (!this.canSendNotification()) return;
    if (!this.isInHourlyActiveWindow()) {
      console.log('[Scheduler] Outside hourly active window (8 AM–10 PM) — skipping');
      return;
    }
    if (this.isInAnyDNDPeriod(this.preferences.dnd_periods)) {
      console.log('[Scheduler] In DND period — skipping hourly reminder');
      return;
    }

    const hour = new Date().getHours();
    let title: string;
    let body: string;

    if (hour === 8) {
      // First notification of the day — morning greeting + overnight reminder
      title = this.language === 'zh' ? '早上好！' : 'Good Morning!';
      body = this.language === 'zh'
        ? '新的一天开始了。如果夜间有任何护理活动或想法，可以先记录下来，然后开始今天的每小时调查。'
        : 'A new day begins. If anything happened overnight — care activities, thoughts, or observations — you can log them now before starting today\'s hourly survey.';
    } else {
      title = this.language === 'zh' ? '调查提醒' : 'Survey Reminder';
      body = this.language === 'zh'
        ? '是时候填写您的每小时调查了。点击查看详情。'
        : 'Time to fill out your hourly survey. Click to view details.';
    }

    this.sendBrowserNotification(title, body, 'hourly-survey-reminder', '/survey');
    console.log(`[Scheduler] Hourly reminder sent (hour=${hour})`);
  }

  /**
   * Start hourly notification schedule
   */
  private startHourlySchedule() {
    this.stopHourlySchedule();

    if (!this.preferences?.hourly_reminders_enabled) return;

    console.log('[Scheduler] Starting hourly schedule');
    console.log(`[Scheduler] Active DND Periods: ${this.preferences.dnd_periods.filter(p => p.is_active).length}`);

    // Calculate ms until next hour boundary (:00)
    const now = new Date();
    const msUntilNextHour = ((60 - now.getMinutes()) * 60 - now.getSeconds()) * 1000;

    // Wait until next hour, then fire every hour
    this.hourlyTimerId = setTimeout(() => {
      this.checkAndNotifyHourly();
      this.hourlyIntervalId = setInterval(() => {
        this.checkAndNotifyHourly();
      }, 60 * 60 * 1000);
    }, msUntilNextHour);

    console.log(`[Scheduler] Next hourly check in ${Math.round(msUntilNextHour / 1000 / 60)} minutes`);
  }

  private stopHourlySchedule() {
    if (this.hourlyTimerId) {
      clearTimeout(this.hourlyTimerId);
      this.hourlyTimerId = null;
    }
    if (this.hourlyIntervalId) {
      clearInterval(this.hourlyIntervalId);
      this.hourlyIntervalId = null;
    }
  }

  // ─── Daily Reminders ───────────────────────────────────────────────

  /**
   * Check if daily reminder was already sent today (persisted in localStorage)
   */
  private wasDailyReminderSentToday(): boolean {
    try {
      const lastDate = localStorage.getItem(DAILY_REMINDER_STORAGE_KEY);
      if (!lastDate) return false;
      const today = new Date().toISOString().split('T')[0];
      return lastDate === today;
    } catch {
      return false;
    }
  }

  private markDailyReminderSent() {
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(DAILY_REMINDER_STORAGE_KEY, today);
    } catch {
      // localStorage may be unavailable
    }
  }

  /**
   * Check and send daily reminder if conditions are met
   */
  private checkAndNotifyDaily() {
    if (!this.preferences) return;
    if (!this.preferences.daily_reminders_enabled) return;
    if (!this.canSendNotification()) return;
    if (this.wasDailyReminderSentToday()) return;
    if (this.isInAnyDNDPeriod(this.preferences.dnd_periods)) {
      console.log('[Scheduler] In DND period — skipping daily reminder');
      return;
    }

    const title = this.language === 'zh' ? '每日调查提醒' : 'Daily Survey Reminder';
    const body = this.language === 'zh'
      ? '别忘了完成今天的调查。您的回答对研究非常重要！'
      : 'Don\'t forget to complete today\'s survey. Your responses are important to the research!';

    const sent = this.sendBrowserNotification(title, body, 'daily-survey-reminder', '/survey');
    if (sent) {
      this.markDailyReminderSent();
      console.log('[Scheduler] Daily reminder sent');
    }
  }

  /**
   * Parse the user-configured daily reminder time
   */
  private getDailyReminderHourMinute(): { hour: number; minute: number } {
    const timeStr = this.preferences?.daily_reminder_time || '22:00:00';
    const [h, m] = timeStr.split(':').map(Number);
    return { hour: isNaN(h) ? 22 : h, minute: isNaN(m) ? 0 : m };
  }

  /**
   * Start daily notification schedule — fires at user-configured time
   */
  private startDailySchedule() {
    this.stopDailySchedule();

    if (!this.preferences?.daily_reminders_enabled) return;

    const { hour, minute } = this.getDailyReminderHourMinute();
    console.log(`[Scheduler] Starting daily schedule at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);

    // Calculate ms until next configured time
    const now = new Date();
    const nextReminder = new Date(now);
    nextReminder.setHours(hour, minute, 0, 0);
    if (now >= nextReminder) {
      // Already past configured time today — check if we missed today's reminder
      this.checkAndNotifyDaily();
      // Schedule for tomorrow
      nextReminder.setDate(nextReminder.getDate() + 1);
    }

    const msUntilNext = nextReminder.getTime() - now.getTime();

    this.dailyTimerId = setTimeout(() => {
      this.checkAndNotifyDaily();
      // Re-schedule for the next day (using recursive setTimeout for drift-resistance)
      this.startDailySchedule();
    }, msUntilNext);

    const hoursUntil = Math.round(msUntilNext / 1000 / 60 / 60 * 10) / 10;
    console.log(`[Scheduler] Next daily check in ${hoursUntil} hours`);
  }

  private stopDailySchedule() {
    if (this.dailyTimerId) {
      clearTimeout(this.dailyTimerId);
      this.dailyTimerId = null;
    }
  }

  // ─── Public API ────────────────────────────────────────────────────

  /**
   * Start all notification schedules based on preferences
   */
  start(preferences: NotificationPreferences, language: 'en' | 'zh' = 'en') {
    this.preferences = preferences;
    this.language = language;

    this.startHourlySchedule();
    this.startDailySchedule();
  }

  /**
   * Stop all notification schedules
   */
  stop() {
    this.stopHourlySchedule();
    this.stopDailySchedule();
    console.log('[Scheduler] All schedules stopped');
  }

  /**
   * Update preferences and restart relevant schedules
   */
  updatePreferences(preferences: NotificationPreferences, language: 'en' | 'zh' = 'en') {
    this.preferences = preferences;
    this.language = language;

    // Restart hourly schedule based on new preferences
    if (preferences.hourly_reminders_enabled && preferences.push_notifications_enabled) {
      this.startHourlySchedule();
    } else {
      this.stopHourlySchedule();
    }

    // Restart daily schedule based on new preferences
    if (preferences.daily_reminders_enabled && preferences.push_notifications_enabled) {
      this.startDailySchedule();
    } else {
      this.stopDailySchedule();
    }
  }

  /**
   * Send a test notification immediately (ignores DND and other toggles)
   */
  async sendTestNotification(language: 'en' | 'zh' = 'en') {
    if (!('Notification' in window)) {
      throw new Error(language === 'zh' ? '浏览器不支持通知' : 'Browser does not support notifications');
    }

    if (Notification.permission !== 'granted') {
      throw new Error(language === 'zh' ? '通知权限未授予' : 'Notification permission not granted');
    }

    const title = language === 'zh' ? '测试通知' : 'Test Notification';
    const body = language === 'zh' 
      ? '这是一个测试通知。您的提醒将按此方式发送。'
      : 'This is a test notification. Your reminders will be sent this way.';

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
