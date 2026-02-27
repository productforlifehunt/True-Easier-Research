# PRD: Dementia Caregiver Daily Survey App

> **Single Source of Truth** — Last updated: 2026-02-26  
> App path: `packages/dementia-survey/` (standalone app)  
> Backend: External Supabase `yekarqanirdkdckimpna.supabase.co`, schema `care_connector`

---

## 1. Product Overview

A bilingual (EN/ZH) mobile-first research app that captures daily caregiving activities of dementia caregivers over a 7-day study period. Participants log activities, challenges, people involved, and resource needs. The app also collects baseline caregiver/patient profiles, care network diagrams (ecograms), and facilitates post-study interviews.

**Target users:** Dementia family caregivers (primary & secondary)  
**Study design:** 7-day ESM (Experience Sampling Method) longitudinal survey  
**Key differentiator:** Voice input + AI writing assistant to reduce logging burden

---

## 2. User Flows

### 2.1 Unauthenticated User
```
Landing (/) → Read about study → Join Study (/join-survey) → Submit registration form
                                → Sign In (AuthModal) → Authenticated flows
```

### 2.2 New Participant Onboarding (Post-Auth)
```
Homepage (/) → Progress cards auto-scroll to first incomplete step:
  1. Sign consent (/consent)
  2. Complete profile (/settings) — personal info, demographics
  3. Set study start date (Homepage card or Settings)
  4. Fill patient condition info (/settings — expandable sections)
  5. Draw care network ecogram (/settings — Ecogram component)
  6. Complete SSCQ questionnaire (/settings)
  7. Begin 7-day logging
```

### 2.3 Daily Logging (Core Loop)
```
Timeline (/timeline) → View 24-hour timeline with entries by hour
  → Tap entry → Entry Detail (/entry/:id) → View/Edit/Delete
  → Tap "+" FAB → Add Entry (/add-entry) → 3-tab form → Save → Back to Timeline
  → Edit existing → /edit-entry/:id (same AddEntry component in edit mode)
```

### 2.4 Post-Study
```
Summary (/summary) → View analytics (by week/day/category/time-of-day)
Settings → Accept interview invitation → View interview URL & schedule
```

---

## 3. Pages & Routes

| Route | Page | Auth | Description |
|---|---|---|---|
| `/` | Homepage | No* | Hero + progress cards (logged-in) or CTA (guest) |
| `/timeline` | Timeline | Yes | 24-hour vertical timeline with day selector (Days 1-7) |
| `/add-entry` | AddEntry | Yes | 3-tab entry form (Activity / People / Challenges & Resources) |
| `/edit-entry/:id` | AddEntry | Yes | Same component, pre-populated in edit mode |
| `/entry/:id` | EntryDetail | Yes | Read-only detail view with edit/delete actions |
| `/summary` | Summary | Yes | Analytics: entry counts by type, time-of-day distribution, drill-down |
| `/settings` | Settings | Yes | Profile, demographics, patient info, ecogram, SSCQ, notifications, interview |
| `/join-survey` | JoinSurvey | No | Registration form for new participants |
| `/about` | About | No | Study description |
| `/how-to` | HowTo | No | Step-by-step guide with AI chatbot assistant |
| `/contact` | Contact | No | Contact form |
| `/study-introduction` | StudyIntroduction | No | Full study protocol document with UI mockups |
| `/dementia-caregiver-survey` | DementiaCaregiverSurvey | Yes | Legacy survey page |

*Homepage shows different content based on auth state.

---

## 4. Features

### 4.1 Survey Entry CRUD
- **Create:** 3-tab form — Activity (type, category, description, time spent, event stress rating [-3 to +3], MBP checklist [3 Yes/No], MBP distress [0-4], positive affect [4 items, 1-7], negative affect [7 items, 1-7], urgency), People (who was involved, who else you wish could help, challenges reaching them), Challenges & Resources (task difficulty [-3 to +3], challenge types checklist, resources using, resources wanted)
- **Time options:** "Now" (auto-timestamp), "Other Time" (date+time picker), "Not Tied to Time" (null timestamp for general ideas)
- **Activity categories:** Multi-select checkboxes (ADL, IADL, medical, emotional support, etc.)
- **Challenge types:** Multi-select (knowledge gaps, patient condition, coordination, time, emotional stress, physical demands, communication, safety/liability, privacy, other)
- **Daily Sense of Competence:** 3 ESM items from SSCQ (stressed, privacy, strained) — 1-7 Likert scale, collected per entry
- **Daily Burden Rating:** -3 to +3 scale, collected at end-of-day
- **Read:** Timeline view (24h vertical, filterable by day 1-7 and time slot), Entry detail page
- **Update:** Same AddEntry form pre-populated with existing data
- **Delete:** iOS-style bottom-sheet confirmation modal

### 4.2 Voice Input
- Web Speech API (`webkitSpeechRecognition`)
- Available on all free-text fields (description, people, challenges, resources)
- Language-aware: switches between `en-US` and `zh-CN`

### 4.3 AI Writing Assistant
- Modal-based chat interface (`AISurveyAssistant` component)
- Calls edge function: `POST /functions/v1/process-voice-survey`
- Actions: enhance/expand text, help articulate responses
- Copy-to-field functionality

### 4.4 Participant Profile & Baseline Assessments
Collected in Settings page, stored in `profiles` table:

**Caregiver demographics:** name, age, gender (Male/Female), education, employment (full-time, part-time, self-employed, unemployed, retired, student), marital status (single, married, divorced, widowed), health status (1-5 scale), relationship to care recipient (dropdown: Spouse/Partner, Parent, Child, Sibling, Other Relative, Friend/Neighbor, Professional Caregiver, Other), caregiving duration (category: <6mo, 6mo-1yr, 1-2yr, 2-5yr, >5yr), hours/week, distance from recipient, participant number (PP###)

**Care recipient info:** age, gender, education, dementia type, years since diagnosis, dementia stage, comorbidities

**Functional assessments:**
- ADLs (eating, bathing, dressing, toileting, mobility) — 3-point scale
- IADLs (medication, finances, shopping, cooking, housework) — 3-point scale
- NPI-Q (12-item Neuropsychiatric Inventory): delusions, hallucinations, agitation/aggression, depression/dysphoria, anxiety, elation/euphoria, apathy/indifference, disinhibition, irritability/lability, aberrant motor behavior, nighttime behavior disturbances, appetite/eating changes — severity scale (No/Mild/Moderate/Severe)
- Communication ability

**Validated instruments:**
- SSCQ (Short Sense of Competence Questionnaire) — 7 items, 7-point Likert (1=Strongly Disagree to 7=Strongly Agree)
- MSPSS (Multidimensional Scale of Perceived Social Support) — 12 items (4 each for Significant Other, Family, Friends)
- Perseverance Time
- Daily SoC (3 ESM items per entry)

### 4.5 Ecogram (Care Network Diagram)
- Interactive drag-and-drop network visualization
- Members positioned in 3 concentric circles (closeness)
- Per member: name, relationship type, age, gender, distance, contact frequency, importance (0-100), support types (ADL/IADL/maintenance/other with custom text)
- Line styles: solid (strong), dashed (moderate), jagged (strained)
- Arrow directions: to/from/both (support flow)
- Saved as JSONB in `profiles.ecogram_data`

### 4.6 My Caring Week (Summary Visualization)
- `MyCaringWeek` component in Settings
- Visual summary of the participant's logged week
- Cross-references entries with ecogram network members

### 4.7 Interview Scheduling
- Researcher sets `interview_url`, `interview_datetime_start/end` in profiles table
- Participant can accept/decline interview invitation
- Interview agreement tracked in enrollments table

### 4.8 Notifications
- Hourly survey reminders (configurable)
- Do Not Disturb periods (CRUD on `dnd_periods` table)
- Uses `notificationScheduler` utility + Capacitor Local Notifications
- Notification permission tracking in profiles

### 4.9 Internationalization
- Full EN/ZH bilingual support
- Language toggle in header and settings
- Stored in localStorage via `useLanguage` hook
- All UI text, form labels, helper text, and validation messages translated

### 4.10 Participant Recruitment
- Registration form (`survey_registrations` table)
- Shareable invite link with copy-to-clipboard
- Already-enrolled users see "Invite Others" section instead of form

---

## 5. Data Model (care_connector schema)

### 5.1 `survey_entries` — Core daily log entries
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'care_connector' AND table_name = 'survey_entries';
```
Key columns:
| Column | Type | Description |
|---|---|---|
| id | int/uuid | PK |
| user_id | uuid | FK to auth.users |
| entry_type | text | `care_activity` / `care_need` / `struggle` |
| entry_timestamp | timestamptz | NULL = not tied to specific time |
| description | text | Main free-text entry |
| activity_categories | text[] | Multi-select activity types |
| time_spent | int | Minutes |
| emotional_impact | text | Legacy: how it affected the caregiver (deprecated) |
| event_stress_rating | int | Section 3.1.3: -3 (very unpleasant) to +3 (very pleasant) |
| mbp_memory | text | Section 3.1.5.a: patient memory problems (yes/no) |
| mbp_behavior | text | Section 3.1.5.b: patient behavior problems (yes/no) |
| mbp_depression | text | Section 3.1.5.c: patient depressive symptoms (yes/no) |
| mbp_distress | text | Section 3.1.6: MBP-related distress (0-4) |
| affect_cheerful, affect_relaxed, affect_enthusiastic, affect_satisfied | text | Section 3.1.10: positive affect (1-7 each) |
| affect_insecure, affect_lonely, affect_anxious, affect_irritated, affect_down, affect_desperate, affect_tensed | text | Section 3.1.11: negative affect (1-7 each) |
| urgency_level | text | Low/medium/high/urgent |
| task_difficulty | int | Section 3.3.1: -3 (no challenges) to +3 (extreme challenges) |
| people_with | text | Who was involved |
| people_want_with | text | Who they wish could help |
| people_challenges | text | Challenges reaching desired helpers |
| challenge_types | text[] | Multi-select challenge categories |
| challenges_faced | text | Free-text challenges |
| resources_using | text | Current tools/resources and issues |
| resources_wanted | text | Desired tools/resources |
| daily_soc_stressed | text | SSCQ ESM item |
| daily_soc_privacy | text | SSCQ ESM item |
| daily_soc_strained | text | SSCQ ESM item |
| daily_burden_rating | int | Section 4.3: -3 (very burdensome) to +3 (very manageable) |
| created_at | timestamptz | Auto |

### 5.2 `profiles` — Participant profile + baseline data
Key columns:
| Column | Type | Description |
|---|---|---|
| id | uuid | PK, matches auth.users.id |
| full_name | text | Display name |
| participant_number | text | PP### code |
| introduction | text | Self-introduction |
| relationship_to_patient | text | |
| is_primary_caregiver | bool | |
| caregiver_age, caregiver_gender, caregiver_education | text | Demographics |
| employment_status, marital_status, health_status | text | Demographics |
| caregiving_years, caregiving_hours_per_week | text | Caregiving context |
| living_with_recipient | text | |
| recipient_age, recipient_gender, recipient_education | text | Patient demographics |
| dementia_type, years_since_diagnosis, dementia_stage | text | Diagnosis info |
| recipient_adl_* | text | 5 ADL items |
| recipient_iadl_* | text | 5 IADL items |
| recipient_bpsd_* | text | 12 NPI-Q items (delusions, hallucinations, agitation, depression, anxiety, elation, apathy, disinhibition, irritability, motor, sleep, appetite) |
| recipient_communication | text | |
| sscq_* | text | 7 SSCQ items |
| perseverance_time | text | |
| ecogram_data | jsonb | `{ members: EcogramMember[], lastUpdated: string }` |
| hourly_reminders_enabled | bool | Notification pref |
| notification_permission_status | text | |
| interview_url | text | Set by researcher |
| interview_datetime_start/end | timestamptz | Interview schedule |
| interview_accepted | bool | |
| interview_accepted_at | timestamptz | |
| linked_primary_caregiver_id | uuid | For secondary caregivers |
| linked_primary_caregiver_code | text | PP### of linked primary |

### 5.3 `enrollments` — Study enrollment & consent
Key columns:
| Column | Type | Description |
|---|---|---|
| participant_id | uuid | FK to auth.users |
| study_start_date | date | Start of 7-day period |
| consent_signed_at | timestamptz | When consent was given |
| interview_agreement | bool | Willing to interview |
| created_at | timestamptz | |

**Important:** May have duplicate rows per user — always query with `ORDER BY created_at DESC LIMIT 1`.

### 5.4 `survey_registrations` — Pre-auth sign-ups
| Column | Type |
|---|---|
| name | text |
| email | text |
| phone | text |
| wechat | text |
| relationship | text |
| is_primary_caregiver | bool |
| willing_interview | bool |
| registered_at | timestamptz |

### 5.5 `dnd_periods` — Do Not Disturb windows
| Column | Type |
|---|---|
| id | int |
| user_id | uuid |
| start_time | text (HH:MM) |
| end_time | text (HH:MM) |
| label | text |
| is_active | bool |

### 5.6 `user_profiles` — Ecogram data (legacy/alternate)
Used by AddEntry to fetch network members:
| Column | Type |
|---|---|
| user_id | uuid |
| ecogram_data | jsonb |

---

## 6. Architecture

### 6.1 Tech Stack
- **Frontend:** React 18 + TypeScript + Vite (monorepo: `packages/dementia-survey/`)
- **Styling:** CSS custom properties (no Tailwind theme — uses `var(--color-green)`, `var(--bg-primary)`, etc.)
- **State:** React Context + useReducer (`AppStateProvider`)
- **Backend:** Supabase (external project, `care_connector` schema)
- **Auth:** Supabase Auth (email/password, PKCE flow)
- **AI:** Edge function `process-voice-survey` for text enhancement
- **Mobile:** Capacitor (iOS/Android) + PWA installable

### 6.2 Key Files
```
packages/dementia-survey/src/
├── App.tsx                    # Router, routes
├── pages/
│   ├── Homepage.tsx           # Landing + progress cards
│   ├── Timeline.tsx           # 24h timeline view
│   ├── AddEntry.tsx           # Create/edit entry (3-tab form)
│   ├── Summary.tsx            # Analytics dashboard
│   ├── Settings.tsx           # Profile, assessments, ecogram, notifications
│   ├── JoinSurvey.tsx         # Registration form
│   ├── StudyIntroduction.tsx  # Full study protocol
│   ├── About.tsx              # Study info
│   ├── HowTo.tsx              # Guide + AI chatbot
│   └── Contact.tsx            # Contact form
├── components/
│   ├── Ecogram.tsx            # Interactive network diagram
│   ├── MyCaringWeek.tsx       # Week summary visualization
│   ├── AISurveyAssistant.tsx  # AI chat modal
│   ├── AuthModal.tsx          # Login/signup modal
│   ├── BottomNav.tsx          # Mobile tab bar
│   ├── MobileHeader.tsx       # Mobile top bar
│   └── DesktopHeader.tsx      # Desktop navigation
├── store/
│   ├── AppStateProvider.tsx   # Global state (auth, UI, cache)
│   └── index.ts               # Reducer, actions, context
├── hooks/
│   ├── useAuth.ts             # Auth hook
│   ├── useLanguage.ts         # i18n hook
│   └── useStateManagement.ts  # State selectors
├── lib/
│   └── supabase.ts            # Dual Supabase clients (auth + data with care_connector schema)
└── utils/
    └── notificationScheduler.ts # Hourly notification logic
```

### 6.3 Supabase Client Setup
Two clients sharing the same auth storage key:
- `authClient` — Auth operations only (default `public` schema)
- `supabase` — All data operations (configured for `care_connector` schema with `Accept-Profile` and `Content-Profile` headers)

### 6.4 Study Day Calculation
```
current_day = floor((today - study_start_date) / 1 day) + 1
Clamped to [1, 7]. Fallback to consent_signed_at or created_at if study_start_date is null.
```

---

## 7. Business Rules

1. **Auth required** for Timeline, AddEntry, EntryDetail, Summary, Settings
2. **Guest access** for Homepage, About, HowTo, Contact, JoinSurvey, StudyIntroduction
3. **7-day study window** — entries are organized by study day (Day 1-7), calculated from `enrollments.study_start_date`
4. **Start date editable** — participants can change their study start date from Homepage or Settings
5. **Consent before data** — consent must be signed before logging begins
6. **Profile completeness** tracked as 5 fields: full_name, introduction, relationship_to_patient, is_primary_caregiver, participant_number
7. **Homepage auto-scrolls** progress cards to the first incomplete step
8. **Entries with null timestamp** = "ideas/general" (not tied to specific time), displayed separately in Summary
9. **Secondary caregivers** can be linked to a primary caregiver via `linked_primary_caregiver_code`
10. **No data deletion** by researchers — participants own their data and can delete entries
11. **Real-time subscriptions** active for caregivers and notifications tables (currently unused in survey context)

---

## 8. Edge Functions

| Function | Method | Purpose |
|---|---|---|
| `process-voice-survey` | POST | AI text enhancement. Accepts `{ text, language, user_id, action }`. Returns `{ success, enhanced_text }` |

---

## 9. Open Items / Known Issues

1. `EntryDetail` page lives in `src/pages/` (root), not in `packages/dementia-survey/` — shared across both apps
2. Many components in `packages/dementia-survey/src/components/` are leftover from the care connector app (BookingModal, PaymentFlow, etc.) — unused dead code
3. `dataService.ts` in shared package uses different table names (`survey_entries` via dataService vs direct supabase queries in pages) — inconsistent data access patterns
4. Settings.tsx is 2593 lines — needs refactoring into sub-components
5. StudyIntroduction.tsx is 1958 lines — mostly static content, could be markdown
6. Timeline day filtering logic uses index-based slicing instead of actual date comparison against study_start_date
