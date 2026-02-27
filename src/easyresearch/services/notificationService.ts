// Capacitor Local Notifications Service for EasyResearch ESM studies
// This service schedules native push notifications for survey reminders

interface NotificationConfig {
  studyDuration: number; // days
  frequency: string; // 'hourly', '2hours', '4hours', 'daily', 'twice_daily'
  startHour?: number; // default 9
  endHour?: number;   // default 21
  dndPeriods?: { start_time: string; end_time: string }[];
  projectTitle: string;
  projectId: string;
}

interface ScheduledNotification {
  id: number;
  title: string;
  body: string;
  schedule: { at: Date };
  extra?: Record<string, any>;
}

// Check if Capacitor Local Notifications is available
const isCapacitorAvailable = () => {
  try {
    return typeof (window as any).Capacitor !== 'undefined' &&
      (window as any).Capacitor.isNativePlatform?.();
  } catch {
    return false;
  }
};

// Dynamically import Capacitor plugin
const getLocalNotifications = async () => {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    return LocalNotifications;
  } catch {
    return null;
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (isCapacitorAvailable()) {
    const LocalNotifications = await getLocalNotifications();
    if (!LocalNotifications) return false;
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  }
  
  // Web fallback
  if ('Notification' in window) {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
};

// Check current permission status
export const getNotificationPermissionStatus = async (): Promise<string> => {
  if (isCapacitorAvailable()) {
    const LocalNotifications = await getLocalNotifications();
    if (!LocalNotifications) return 'denied';
    const result = await LocalNotifications.checkPermissions();
    return result.display;
  }
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
};

// Check if a time is within a DND period
const isInDndPeriod = (hour: number, minute: number, dndPeriods: { start_time: string; end_time: string }[]): boolean => {
  const timeInMinutes = hour * 60 + minute;
  return dndPeriods.some(period => {
    const [sh, sm] = period.start_time.split(':').map(Number);
    const [eh, em] = period.end_time.split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (start <= end) {
      return timeInMinutes >= start && timeInMinutes < end;
    }
    // Overnight period (e.g., 22:00 - 08:00)
    return timeInMinutes >= start || timeInMinutes < end;
  });
};

// Generate notification schedule based on config
const generateSchedule = (config: NotificationConfig, enrollmentDate: Date): ScheduledNotification[] => {
  const notifications: ScheduledNotification[] = [];
  const startHour = config.startHour ?? 9;
  const endHour = config.endHour ?? 21;
  const dndPeriods = config.dndPeriods || [];

  let intervalHours: number;
  switch (config.frequency) {
    case 'hourly': intervalHours = 1; break;
    case '2hours': intervalHours = 2; break;
    case '4hours': intervalHours = 4; break;
    case 'twice_daily': intervalHours = 12; break;
    case 'daily': intervalHours = 24; break;
    default: intervalHours = 1;
  }

  let notificationId = 1;

  for (let day = 0; day < config.studyDuration; day++) {
    const dayDate = new Date(enrollmentDate);
    dayDate.setDate(dayDate.getDate() + day);

    if (config.frequency === 'daily') {
      // One notification per day at startHour
      const scheduleTime = new Date(dayDate);
      scheduleTime.setHours(startHour, 0, 0, 0);
      if (scheduleTime > new Date() && !isInDndPeriod(startHour, 0, dndPeriods)) {
        notifications.push({
          id: notificationId++,
          title: `📋 ${config.projectTitle}`,
          body: `Day ${day + 1}: Time to complete your daily survey!`,
          schedule: { at: scheduleTime },
          extra: { projectId: config.projectId, day: day + 1 }
        });
      }
    } else {
      // Multiple per day
      for (let hour = startHour; hour < endHour; hour += intervalHours) {
        if (isInDndPeriod(hour, 0, dndPeriods)) continue;
        const scheduleTime = new Date(dayDate);
        scheduleTime.setHours(hour, 0, 0, 0);
        if (scheduleTime > new Date()) {
          notifications.push({
            id: notificationId++,
            title: `📋 ${config.projectTitle}`,
            body: `Day ${day + 1}, ${hour}:00 — Time for your survey entry!`,
            schedule: { at: scheduleTime },
            extra: { projectId: config.projectId, day: day + 1, hour }
          });
        }
      }
    }
  }

  return notifications;
};

// Schedule all notifications for a study
export const scheduleStudyNotifications = async (config: NotificationConfig, enrollmentDate: Date): Promise<number> => {
  const notifications = generateSchedule(config, enrollmentDate);
  
  if (notifications.length === 0) return 0;

  if (isCapacitorAvailable()) {
    const LocalNotifications = await getLocalNotifications();
    if (!LocalNotifications) return 0;
    
    // Cancel existing notifications first
    await cancelAllNotifications();
    
    // Schedule new ones (Capacitor has a limit of ~64 on iOS)
    const maxNotifications = notifications.slice(0, 64);
    await LocalNotifications.schedule({
      notifications: maxNotifications.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        schedule: n.schedule,
        extra: n.extra,
        smallIcon: 'ic_stat_icon_config_sample',
        iconColor: '#10B981',
        sound: 'beep.wav',
      }))
    });
    
    return maxNotifications.length;
  }
  
  // Web fallback: no persistent scheduling (browser notifications are transient)
  console.log(`Would schedule ${notifications.length} notifications (native only)`);
  return 0;
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async (): Promise<void> => {
  if (isCapacitorAvailable()) {
    const LocalNotifications = await getLocalNotifications();
    if (!LocalNotifications) return;
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id }))
      });
    }
  }
};

// Show an immediate notification (for testing)
export const showImmediateNotification = async (title: string, body: string): Promise<void> => {
  if (isCapacitorAvailable()) {
    const LocalNotifications = await getLocalNotifications();
    if (!LocalNotifications) return;
    await LocalNotifications.schedule({
      notifications: [{
        id: Date.now(),
        title,
        body,
        schedule: { at: new Date(Date.now() + 1000) }
      }]
    });
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icon.png' });
  }
};

export default {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  scheduleStudyNotifications,
  cancelAllNotifications,
  showImmediateNotification,
};
