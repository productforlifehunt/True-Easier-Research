/**
 * Questionnaire-Aware Notification Scheduler
 *
 * Architecture:
 *   - Notification content (title, body, type) is set per QUESTIONNAIRE by the researcher.
 *   - Notification schedule (frequency, time_windows) is set per QUESTIONNAIRE.
 *   - DND is per QUESTIONNAIRE per ENROLLMENT (stored in enrollment_dnd_period table
 *     with enrollment_id, questionnaire_id, start_time, end_time columns).
 *   - profiles.push_notifications_enabled is the MASTER KILL SWITCH — if false, nothing fires.
 *   - The scheduler runs client-side, reads enrolled questionnaires from Supabase,
 *     and fires browser notifications using each questionnaire's own title/body.
 */

import { supabase } from '../lib/supabase';

export interface QuestionnaireDNDPeriod {
  start: string; // HH:MM
  end: string;   // HH:MM
}

export interface QuestionnaireNotificationConfig {
  questionnaire_id: string;
  questionnaire_title: string;
  project_id: string;
  project_title: string;
  notification_enabled: boolean;
  notification_title: string;
  notification_body: string;
  notification_type: string; // 'push' | 'email' | 'sms' | 'push_email'
  notification_minutes_before: number;
  frequency: string; // 'once' | 'hourly' | '2hours' | '4hours' | 'daily' | 'twice_daily' | 'weekly'
  time_windows: { start: string; end: string }[];
  dnd_allowed: boolean;
  participant_dnd_periods: QuestionnaireDNDPeriod[]; // per-enrollment DND for this questionnaire
}

class NotificationScheduler {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private masterEnabled: boolean = false;
  private configs: QuestionnaireNotificationConfig[] = [];
  private language: 'en' | 'zh' = 'en';
  private lastFiredMap: Map<string, string> = new Map(); // questionnaire_id → ISO timestamp of last fire

  private canSendBrowserNotification(): boolean {
    if (!('Notification' in window)) return false;
    if (Notification.permission !== 'granted') return false;
    if (!this.masterEnabled) return false;
    return true;
  }

  private timeToMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  private isInDND(dndPeriods: QuestionnaireDNDPeriod[]): boolean {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    for (const p of dndPeriods) {
      const start = this.timeToMinutes(p.start);
      const end = this.timeToMinutes(p.end);
      if (start > end) {
        // overnight
        if (current >= start || current < end) return true;
      } else {
        if (current >= start && current < end) return true;
      }
    }
    return false;
  }

  private isInTimeWindow(windows: { start: string; end: string }[]): boolean {
    if (!windows || windows.length === 0) return true; // no window = always active
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    for (const w of windows) {
      const start = this.timeToMinutes(w.start);
      const end = this.timeToMinutes(w.end);
      if (start <= end) {
        if (current >= start && current < end) return true;
      } else {
        if (current >= start || current < end) return true;
      }
    }
    return false;
  }

  private getIntervalMs(frequency: string): number {
    switch (frequency) {
      case 'hourly': return 60 * 60 * 1000;
      case '2hours': return 2 * 60 * 60 * 1000;
      case '4hours': return 4 * 60 * 60 * 1000;
      case 'twice_daily': return 12 * 60 * 60 * 1000;
      case 'daily': return 24 * 60 * 60 * 1000;
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000; // default hourly
    }
  }

  private shouldFireNow(config: QuestionnaireNotificationConfig): boolean {
    if (!config.notification_enabled) return false;
    if (config.frequency === 'once') return false; // one-time questionnaires don't get recurring reminders
    if (!this.isInTimeWindow(config.time_windows)) return false;
    if (this.isInDND(config.participant_dnd_periods)) return false;

    // Check cooldown based on frequency
    const lastFired = this.lastFiredMap.get(config.questionnaire_id);
    if (lastFired) {
      const elapsed = Date.now() - new Date(lastFired).getTime();
      const interval = this.getIntervalMs(config.frequency);
      if (elapsed < interval * 0.9) return false; // 90% of interval to avoid drift-skip
    }
    return true;
  }

  private sendBrowserNotification(config: QuestionnaireNotificationConfig) {
    const title = config.notification_title || `Time for: ${config.questionnaire_title}`;
    const body = config.notification_body || `Please complete your "${config.questionnaire_title}" questionnaire.`;
    const tag = `qn-${config.questionnaire_id}`;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag,
        requireInteraction: false,
        silent: false,
      });
      notification.onclick = () => {
        window.focus();
        window.location.href = `/dashboard/research/${config.project_id}`;
        notification.close();
      };
      setTimeout(() => notification.close(), 12000);
      this.lastFiredMap.set(config.questionnaire_id, new Date().toISOString());
      console.log(`[Scheduler] Sent notification for questionnaire "${config.questionnaire_title}"`);
    } catch (err) {
      console.error('[Scheduler] Failed to send notification:', err);
    }
  }

  private tick() {
    if (!this.canSendBrowserNotification()) return;
    for (const config of this.configs) {
      if (this.shouldFireNow(config)) {
        this.sendBrowserNotification(config);
      }
    }
  }

  // ─── Public API ────────────────────────────────────────────────────

  /**
   * Load questionnaire notification configs for a participant from Supabase.
   * Reads all enrollments → their questionnaires → notification settings.
   * Merges participant's per-questionnaire DND from enrollment_dnd_period table.
   */
  async loadAndStart(userId: string, language: 'en' | 'zh' = 'en') {
    this.language = language;
    this.stop();

    // 1. Check master kill switch
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_notifications_enabled')
      .eq('id', userId)
      .maybeSingle();

    this.masterEnabled = profile?.push_notifications_enabled ?? true;
    if (!this.masterEnabled) {
      console.log('[Scheduler] Master push_notifications_enabled is OFF — not scheduling');
      return;
    }

    // 2. Get all active enrollments for this user
    const { data: enrollments } = await supabase
      .from('enrollment')
      .select('id, project_id, participant_type_id')
      .or(`participant_id.eq.${userId},participant_email.eq.${userId}`)
      .eq('status', 'active');

    if (!enrollments || enrollments.length === 0) {
      console.log('[Scheduler] No active enrollments — nothing to schedule');
      return;
    }

    // 3. Get all questionnaires for enrolled projects
    const projectIds = [...new Set(enrollments.map(e => e.project_id))];
    const { data: questionnaires } = await supabase
      .from('questionnaire')
      .select('id, title, project_id, notification_enabled, notification_title, notification_body, notification_type, notification_minutes_before, frequency, time_windows, dnd_allowed')
      .in('project_id', projectIds)
      .eq('notification_enabled', true);

    if (!questionnaires || questionnaires.length === 0) {
      console.log('[Scheduler] No questionnaires with notifications enabled');
      return;
    }

    // 4. Get project titles for display
    const { data: projects } = await supabase
      .from('research_project')
      .select('id, title')
      .in('id', projectIds);
    const projectTitleMap = new Map((projects || []).map((p: any) => [p.id, p.title]));

    // 4b. Load time_windows from flat questionnaire_time_window table
    const qIds = questionnaires.map(q => q.id);
    const { data: twRows } = await supabase
      .from('questionnaire_time_window')
      .select('questionnaire_id, start_time, end_time')
      .in('questionnaire_id', qIds)
      .order('order_index');
    const twByQ = new Map<string, { start: string; end: string }[]>();
    for (const row of (twRows || [])) {
      if (!twByQ.has(row.questionnaire_id)) twByQ.set(row.questionnaire_id, []);
      twByQ.get(row.questionnaire_id)!.push({ start: row.start_time, end: row.end_time });
    }

    // 4c. Load DND periods from flat enrollment_dnd_period table
    const enrollmentIds = enrollments.map(e => e.id);
    const { data: dndRows } = await supabase
      .from('enrollment_dnd_period')
      .select('enrollment_id, questionnaire_id, start_time, end_time')
      .in('enrollment_id', enrollmentIds);
    const dndByEnrollmentAndQ = new Map<string, { start: string; end: string }[]>();
    for (const row of (dndRows || [])) {
      const key = `${row.enrollment_id}:${row.questionnaire_id}`;
      if (!dndByEnrollmentAndQ.has(key)) dndByEnrollmentAndQ.set(key, []);
      dndByEnrollmentAndQ.get(key)!.push({ start: row.start_time, end: row.end_time });
    }

    // 5. Filter questionnaires by participant type (if questionnaire_participant_type junction exists)
    const enrollmentByProject = new Map(enrollments.map(e => [e.project_id, e]));

    // 6. Build configs with per-enrollment DND
    this.configs = [];
    for (const q of questionnaires) {
      const enrollment = enrollmentByProject.get(q.project_id);
      if (!enrollment) continue;

      // DND is loaded from flat enrollment_dnd_period table below
      const qDnd = dndByEnrollmentAndQ.get(`${enrollment.id}:${q.id}`) || [];

      this.configs.push({
        questionnaire_id: q.id,
        questionnaire_title: q.title,
        project_id: q.project_id,
        project_title: projectTitleMap.get(q.project_id) || 'Research',
        notification_enabled: q.notification_enabled,
        notification_title: q.notification_title || '',
        notification_body: q.notification_body || '',
        notification_type: q.notification_type || 'push',
        notification_minutes_before: q.notification_minutes_before || 5,
        frequency: q.frequency || 'daily',
        time_windows: twByQ.get(q.id) || [],
        dnd_allowed: q.dnd_allowed ?? true,
        participant_dnd_periods: qDnd,
      });
    }

    console.log(`[Scheduler] Loaded ${this.configs.length} questionnaire notification configs`);

    // 7. Start checking every minute
    this.intervalId = setInterval(() => this.tick(), 60 * 1000);
    // Immediate first check
    this.tick();
  }

  stop() {
    if (this.timerId) { clearTimeout(this.timerId); this.timerId = null; }
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    this.configs = [];
    this.lastFiredMap.clear();
    console.log('[Scheduler] Stopped');
  }

  /** Update master kill switch without full reload */
  setMasterEnabled(enabled: boolean) {
    this.masterEnabled = enabled;
    if (!enabled) {
      console.log('[Scheduler] Master kill switch OFF');
    }
  }

  /** Update DND for a specific questionnaire (called when participant changes DND in settings) */
  updateQuestionnaireDND(questionnaireId: string, dndPeriods: QuestionnaireDNDPeriod[]) {
    const config = this.configs.find(c => c.questionnaire_id === questionnaireId);
    if (config) {
      config.participant_dnd_periods = dndPeriods;
      console.log(`[Scheduler] Updated DND for questionnaire ${questionnaireId}: ${dndPeriods.length} periods`);
    }
  }

  /** Send a test notification immediately (ignores DND and other toggles) */
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
    const notification = new Notification(title, { body, icon: '/favicon.ico', tag: 'test-notification' });
    notification.onclick = () => notification.close();
    setTimeout(() => notification.close(), 5000);
  }

  /** Get current configs (for UI display) */
  getConfigs(): QuestionnaireNotificationConfig[] {
    return [...this.configs];
  }
}

// Export singleton instance
export const notificationScheduler = new NotificationScheduler();
