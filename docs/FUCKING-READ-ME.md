1. both the hourly log and daily log can be submited so long as one field in the entire form is filled, no bullshit checks 
2. the hourly log uses the care_connector.survey_entries table and the daily log uses the care_connector.end_of_day_surveys Do not mess up. 

---

## 3. Hourly Notification

Reminds the participant to fill out their hourly survey log.

**When it fires:** Every hour on the hour, **8 AM to 10 PM** local time only. Outside this window, it silently skips. Also skips if inside any active DND period.

**Where it's set:** `Settings > Notification Settings > Hourly Survey Reminders` toggle.

**Data model:**
- `profiles.hourly_reminders_enabled` (boolean, default `true`) — the on/off toggle.
- Content is hardcoded in `src/utils/notificationScheduler.ts`, bilingual EN/ZH.
- Delivery is client-side via the browser `Notification` API (no server push).

**Gates:** Requires `push_notifications_enabled = true` (master toggle) AND `Notification.permission = 'granted'`.

**Scheduler logic:** `startHourlySchedule()` computes ms until the next `:00` minute mark, then fires `setInterval` every 60 minutes. Each tick calls `checkAndNotifyHourly()` which checks: hourly enabled → push enabled → 8AM–10PM window → DND periods → send.

**8 AM morning greeting:** The first notification of the day (8 AM) has special content — a "Good Morning!" greeting that also reminds the user to log any care activities, thoughts, or observations from overnight before starting the day's hourly survey. All other hours use the standard "Survey Reminder" text.

---

## 4. Daily Notification

Reminds the participant once per day to complete their daily survey.

**When it fires:** Once per day at the user-chosen time. Default is **10 PM (22:00)** local time. The user can change the time via a time picker in Settings. If the app is opened after the configured time and today's reminder hasn't fired yet, it sends immediately (catch-up).

**Where it's set:** `Settings > Daily Reminders` toggle + `Reminder Time` time picker (visible when toggle is ON).

**Data model:**
- `profiles.daily_reminders_enabled` (boolean, default `true`) — the on/off toggle.
- `profiles.daily_reminder_time` (time, default `22:00:00`) — the user-chosen local time.
- Content is hardcoded in `src/utils/notificationScheduler.ts`, bilingual EN/ZH.
- Deduplication: `localStorage` key `last_daily_reminder_date` stores the date string (`YYYY-MM-DD`) of the last sent reminder. Prevents duplicates within the same calendar day.

**Gates:** Requires `push_notifications_enabled = true` AND `Notification.permission = 'granted'`. Also respects DND periods.

**Scheduler logic:** `startDailySchedule()` computes ms until the configured hour/minute, sets a `setTimeout`. When it fires, calls `checkAndNotifyDaily()` which checks: daily enabled → push enabled → already sent today → DND → send. Then recursively re-schedules for the next day.

---

## 5. Research Notification

All research-related notifications sent by the researcher: interview time schedules, study progress updates, milestone announcements, custom messages.

**When it fires:** At the time the **researcher decides**. The researcher sets `scheduled_at` when creating the notification. `NULL` means send immediately.

**Where it's set:** `Settings > Research Notifications` toggle controls whether the participant receives these. The researcher creates them via the `notification_messages` table (future: researcher dashboard UI).

**Data model — two tables:**

### `notification_messages` (researcher-authored content)
| Column | Purpose |
|--------|---------|
| `id` | Primary key |
| `created_by` | The researcher (FK → auth.users) |
| `title_en`, `title_zh` | Bilingual notification title |
| `body_en`, `body_zh` | Bilingual notification body |
| `notification_type` | `research_update`, `interview_schedule`, `milestone`, `announcement`, `custom` |
| `scheduled_at` | When to send (researcher decides). NULL = immediately |
| `sent_at` | When it was actually sent |
| `status` | `draft` → `scheduled` → `sent` / `cancelled` |
| `target_user_ids` | UUID array of specific participants. NULL = all participants |
| `navigate_to` | Where clicking the notification goes (default `/survey`) |
| `metadata` | JSONB for extra data (interview link, meeting room, etc.) |

### `user_notifications` (per-user delivery log)
| Column | Purpose |
|--------|---------|
| `id` | Primary key |
| `user_id` | The recipient |
| `notification_id` | FK → notification_messages (NULL for system-generated hourly/daily) |
| `source` | `research`, `hourly_reminder`, `daily_reminder`, `system` |
| `title`, `body` | Inline content (for system-generated that have no notification_messages row) |
| `delivered_at` | When delivered |
| `read_at` | When read (NULL = unread) |
| `dismissed_at` | When dismissed |

**Gate:** Participant must have `profiles.research_updates_enabled = true` AND `push_notifications_enabled = true`.

**Unique constraint:** `(user_id, notification_id)` — prevents duplicate delivery of the same message.

---

## 6. Master Controls

| Control | Column | Effect |
|---------|--------|--------|
| **Push Notifications** toggle | `profiles.push_notifications_enabled` | Master gate. When OFF, ALL browser notifications (hourly, daily, research) are suppressed. |
| **Notification Permission** | `profiles.notification_permission_status` | Tracks browser permission: `default`, `granted`, `denied`. Nothing fires unless `granted`. |
| **Do Not Disturb** | `dnd_periods` table (multiple rows per user) | Quiet periods. Each has `start_time`, `end_time`, `label`, `is_active`. Supports overnight spans. If current time falls in ANY active DND period, hourly and daily notifications are suppressed. |

## 7 consent

Consent form is harcoded in Consent.tsx, not stored in db, signed state is defined by onsent_signed_at colomn at table care_connector.enrollment, null=not signed