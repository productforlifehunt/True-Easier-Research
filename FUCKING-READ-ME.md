# FUCKING READ ME

> FUCKING READ ME AND KEEP IN YOUR CONTEXT IF POSSIBLE.  
> WHEN IN DOUBT, FUCKING READ ME.  
> NEVER FUCKING GUESS.  
> THESE ARE THINGS YOU FREQUENTLY GUESSED WRONG ALMOST EACH AND EVERY TIME.  
> NEVER FUCKING GUESS. FUCKING READ ME!!!

---

## 1. WHAT IS EASYRESEARCH

EasyResearch (branded "Easier") is a sub-app living under `/easyresearch/*` within the larger True-Easier-Research platform. It is a full-stack ESM/EMA research platform where researchers create surveys, manage participants, collect longitudinal data, and analyze responses. It supports one-time surveys AND multi-day longitudinal/ESM studies with scheduled prompts, consent flows, screening, participant types, and a configurable mobile app layout.

- **Stack:** React 18, TypeScript, Vite, TailwindCSS
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions) — all tables live in the `care_connector` schema
- **Mobile:** Capacitor for native iOS/Android push notifications
- **State:** React hooks and local state only (no Redux or React Query)
- **Drag-and-drop:** `@hello-pangea/dnd` and `@dnd-kit/core`
- **Entry point:** Routes defined in `src/App.tsx` under the EASYRESEARCH PLATFORM ROUTES section

---



## 6. RESEARCH PROJECT — THE CORE 

Every study lives in the `research_project` table. 




## 8. QUESTIONNAIRE — A PROPER DATABASE TABLE

Each questionnaire is a row in the `questionnaire` table in the `care_connector` schema. It belongs to one project and has a type field that determines its purpose:

- **survey** — A regular questionnaire with questions, schedule, frequency (once, daily, hourly, etc.), active time window, estimated duration, notification toggle, and Do Not Disturb settings.
- **consent** — A consent form with consent text and consent URL fields. The participant must agree before proceeding.
- **screening** — A screening questionnaire containing questions that determine participant eligibility. Questions can have a disqualify value in their config that auto-rejects participants.

Questionnaires are linked to participant types through the `questionnaire_participant_type` junction table — a many-to-many relationship. A questionnaire can be assigned to multiple participant types, and a participant type can have multiple questionnaires.

Questions within a questionnaire are standard `survey_question` rows with their `questionnaire_id` FK pointing to the parent questionnaire.

---

## 9. QUESTIONS

Each question is a row in the `survey_question` table. It belongs to one project and optionally to one questionnaire via the `questionnaire_id` FK column.

- **Core fields:** question type (one of 21 types), question text, optional description, sort order, required flag
- **Config:** The `question_config` JSONB holds type-specific settings — max length for text, min/max for sliders, scale labels for Likert, disqualify values for screening, and so on
- **Validation and Logic:** `validation_rule` and `logic_rule` JSONB columns for custom validation and conditional branching
- **AI and Voice:** `allow_voice` and `allow_ai_assist` boolean columns

Each question can have multiple options in the `question_option` table — used by choice-type questions. Options have display text, stored value, sort order, and an "is other" flag for free-text fallback.

---

## 10. PARTICIPANT TYPES — A PROPER DATABASE TABLE

Each participant type is a row in the `participant_type` table. It belongs to one project and defines a category of participant (e.g., "Primary Caregiver", "Family Member").

- **Fields:** name, description, relation options (as a text array), UI color, sort order
- **Consent and screening** are stored as separate questionnaire rows with type `consent` or `screening`, linked to participant types through the junction table. This means a consent form or screening set can be shared across multiple participant types.

The `ParticipantTypeManager.tsx` UI still shows consent forms and screening questions inline under each participant type, but the data is saved as questionnaire table rows.

---

## 11. SUPPORTED QUESTION TYPES

Defined as the single source of truth in `questionTypes.ts`. There are 21 types in 5 categories:

- **Text:** Short Text (max 100 chars), Long Text (max 2000 chars)
- **Choice:** Single Choice, Multiple Choice, Dropdown, Checkbox Group, Matrix/Grid, Ranking, Image Choice, Yes/No
- **Scale:** Slider, Bipolar Scale, Rating (stars), Likert Scale, NPS (0-10)
- **Data:** Number, Date, Time, Email, File Upload, Phone Number
- **Layout:** Instruction Block (display-only), Section Header (groups questions into tabs)

Legacy type strings (like `text`, `likert`, `scale`) are mapped to canonical types by `normalizeLegacyQuestionType()`. Unknown types fall back to Short Text.

---

## 12. APP LAYOUT

The app layout defines what the participant-facing mobile app looks like. Stored in the `app_layout` column on `research_project` (JSONB — the only remaining JSONB column on this table).

- **Tabs:** Each tab has a label, Lucide icon name, and a list of elements
- **Elements:** Types include questionnaire (linked by ID), consent, screening, profile, ecogram, text block, progress indicator, timeline, help section, spacer, divider, image, and button
- **Bottom nav:** Which tabs appear in the mobile bottom bar
- **Theme:** Primary color, background color, card style (flat, elevated, outlined)

The default layout has 3 tabs: Home (progress plus questionnaires), Timeline, and Settings (profile plus help).

---

## 13. ECOGRAM

An interactive care network visualization in `EcogramBuilder.tsx`. Participants place people on a concentric circle diagram. Each member has a name, relationship, distance, contact frequency, importance, support types (ADL, emotional, financial, etc.), and visual properties. Enabled per-project via the `ecogram_enabled` column on `research_project`.

---

## 14. AI SERVICE

Manages AI features through Supabase Edge Functions: survey support (question suggestions), voice processing (speech-to-text), entry summarization, and a help chatbot.

AI usage is gated by plan. Free gets 10 credits (no voice). Professional gets 500 with voice. Team gets 2000. Enterprise gets 10000. Each AI call costs 1 credit, voice costs 2. Credits are stored on the organization record.

---

## 15. NOTIFICATION SERVICE

Schedules local push notifications for ESM/longitudinal studies. Uses Capacitor on native platforms, browser Notification API on web (transient only). Supports hourly, 2-hour, 4-hour, twice-daily, and daily frequencies. Respects Do Not Disturb periods. iOS has a 64-notification limit.

---

## 16. VALIDATION SERVICE

Provides response validation with rule types: required, min/max length, regex pattern, numeric range, email, URL, and custom functions. The `useFormValidation()` React hook provides real-time field and form-level validation.

---

## 17. TEMPLATE SERVICE

15 pre-built templates: CSAT, NPS, Employee Engagement, Website Usability, Patient Experience, Academic Research, Product Feedback, Event Feedback, Market Research, Course Evaluation, Psychology Research, Exit Interview, Caregiver Wellbeing, SUS, and Dementia Caregiver ESM Study.

Template 15 is the most complex — a 7-day ESM study with 2 questionnaires, 2 participant types with per-type consent and screening, a 4-tab mobile layout, 20+ profile questions, and ecogram support.

When creating from a template, `createSurveyFromTemplate()` inserts the project row, then participant types into the `participant_type` table, consent forms as consent-type questionnaire rows, screening sets as screening-type questionnaire rows with their questions, and survey questionnaires — all with proper foreign keys.

---

## 18. PARTICIPANT ONBOARDING FLOW

`ParticipantOnboarding.tsx` runs a multi-step enrollment:

1. **Screening** — If enabled, loads screening questions from screening-type questionnaires in the questionnaire table. If any answer matches a disqualify value, the participant is rejected.
2. **Info** — Collects email, optional participant number, optional relation.
3. **Profile** — Collects demographic data if profile questions are configured.
4. **Completion** — Creates an enrollment record and navigates to the survey view.

---

## 19. ESM PARTICIPANT DASHBOARD

For longitudinal studies. Shows a timeline of survey instances with status badges (scheduled, in-progress, completed, missed, late), daily compliance rates and streak tracking, day/status filters, manual entry creation for retroactive logging, and response editing.

---

## 20. ENROLLMENT

The `enrollment` table links a participant to a project. Tracks `project_id`, `participant_id` (auth user UUID), `participant_email`, `participant_number`, `status` (active, inactive, completed), `consent_signed_at`, `enrollment_token` (for invite links), `study_start_date`, `profile_data` (JSONB), `dnd_setting` (JSONB), `enrollment_data` (JSONB), `completion_rate`, and timestamps. The enrollment ID is cached in localStorage to skip re-onboarding on repeat visits.

---

## 21. PRICING

- **Free** ($0) — 3 active surveys, 100 responses/month, basic analytics, CSV export
- **Professional** ($39/mo, $29/mo annual) — Unlimited surveys, 1000 responses/month, all question types, advanced analytics, skip logic, longitudinal and ESM
- **Enterprise** (custom) — Unlimited everything, compliance tracking, dedicated manager, team collaboration

---

## 22. PARTICIPANT TYPES SYSTEM

Participant types define categories of participants (e.g., "Caregiver", "Patient"). Each project can have multiple types. Questionnaires are assigned to types via a junction table — participants only see questionnaires assigned to their type.

### 22.1 Data Model

- **`participant_type`** — One row per category. Has name, description, color, order.
- **`questionnaire_participant_type`** — Junction table. Many-to-many link between questionnaires and types.
- **`enrollment`** — Links participant to project with their selected type.

### 22.2 How It Works

1. Researcher creates participant types in Settings tab (`ParticipantTypeManager.tsx`)
2. Researcher assigns questionnaires to types in Questionnaires tab (Settings panel → "Assigned Types")
3. On save, `SurveyBuilder.tsx` syncs junction table: delete old rows, insert new rows
4. Participant enrolls with a type → only sees questionnaires linked to that type

### 22.3 Rules

- New questionnaires default to all types assigned
- Always query junction table when filtering questionnaires for a participant
- FK constraints cascade deletes — deleting a type removes its junction rows

---

## 23. UNIFIED QUESTIONNAIRE SYSTEM

Consent forms, screening sets, and surveys are **all stored as questionnaire rows** in the `questionnaire` table. The `questionnaire_type` column determines behavior: `survey`, `consent`, or `screening`.

### 23.1 The Three Types

- **`survey`** — Regular questionnaire with questions, schedule, notifications
- **`consent`** — Consent form with text/URL. Must be accepted before proceeding.
- **`screening`** — Eligibility questions. If answer matches `disqualify_value` in question config, participant is rejected.

### 23.2 Why Unified

- All three types can be **dragged into Layout Builder** as elements
- All three link to participant types via the **same junction table**
- All three use the **same CRUD** in `QuestionnaireList.tsx`
- Questions link to any questionnaire type via `questionnaire_id` FK on `survey_question`

### 23.3 Onboarding Flow

1. Load screening questionnaires for participant's type → present questions → reject if disqualified
2. Load consent questionnaires for participant's type → show consent text → require acceptance
3. Collect profile info → create enrollment → proceed to surveys

---

## 24. DATABASE TABLES

All tables live in the `care_connector` schema on Supabase.

- **`organization`** — Team/org records with `plan` tier, `ai_credit` balance, `ai_credits_monthly`, `ai_credits_used`, `ai_features_enabled`, `voice_features_enabled`, Stripe fields, and a `setting` JSONB for org-level config
- **`researcher`** — Links an auth user (`user_id`) to an organization with `role`, `permission` (JSONB), `first_name`, `last_name`, `email`, and notification prefs (`email_notifications`, `response_alerts`, `weekly_digest`). Note: a `researchers` (plural) table also exists with similar columns — the save code uses `researcher` (singular), but the `research_project.researcher_id` FK points to `researchers` (plural)
- **`research_project`** — The core project record. All fields are proper typed columns (no JSONB blobs except `app_layout`). Includes: title, type, status, feature flags, consent fields, screening toggle, participant config, schedule, compensation, sampling fields, notification fields, ecogram fields, display/behavior toggles, and app layout.
- **`profile_question`** — Profile questions shown during participant onboarding. Belongs to a project. Has question text, type, options, required flag, and sort order.
- **`logic_rule`** — Conditional skip/branching rules. Belongs to a project. References source question, condition, value, action, and target question.
- **`questionnaire`** — Belongs to a project. Has a `questionnaire_type` field: `survey` for regular questionnaires, `consent` for consent forms, `screening` for eligibility screening sets. Survey-type rows have scheduling fields (`frequency`, `time_windows`, `notification_enabled`, `dnd_allowed`). Consent-type rows have `consent_text` and `consent_url`. Also has a legacy `question` JSONB column (NOT NULL, default `[]`) — actual questions live in `survey_question` rows with `questionnaire_id` FK.
- **`participant_type`** — A participant category within a project with name, description, relation options, color, and sort order
- **`questionnaire_participant_type`** — Many-to-many junction linking questionnaires to participant types
- **`survey_question`** — An individual question belonging to a project and optionally to a questionnaire (via `questionnaire_id` FK). Has `question_type`, `question_text`, `question_description`, `question_config` (JSONB), `validation_rule` (JSONB), `logic_rule` (JSONB), `ai_config` (JSONB), `order_index`, `required`, `allow_voice`, `allow_ai_assist`, and `section_name`.
- **`question_option`** — Options for choice-type questions with text, value, sort order, and "is other" flag
- **`enrollment`** — Links a participant to a project with `participant_id`, `participant_email`, `participant_number`, `status`, `consent_signed_at`, `enrollment_token`, `study_start_date`, `profile_data` (JSONB), `dnd_setting` (JSONB), `completion_rate`, and timestamps
- **`survey_instance`** — Individual survey instances for longitudinal studies (scheduled prompts with status tracking)
- **`survey_respons`** — Participant responses (note: table name intentionally has no "e" at the end — this is not a typo)

---

## 25. KEY ARCHITECTURAL DECISIONS

1. **No JSONB blobs on `research_project`.** Every field that used to be in the `setting`, `consent_form`, `notification_setting`, `sampling_strategy`, `recruitment_criteria`, or `profile_question` JSONB columns has been flattened into proper typed columns or moved to proper tables. The only remaining JSONB column is `app_layout` for the mobile UI layout. Migrations: `supabase/migrations/20260228_questionnaire_table.sql` and `supabase/migrations/20260228_flatten_jsonb.sql`.

2. **Questionnaires, participant types, and their assignments live in their own tables** — `questionnaire`, `participant_type`, and `questionnaire_participant_type`.

3. **Consent forms and screening sets are questionnaire rows** with `questionnaire_type` set to `consent` or `screening`. They link to participant types through the junction table.

4. **Questions link to their parent questionnaire via a proper `questionnaire_id` FK column** on `survey_question`. There is no JSONB-based linking.

5. **Profile questions live in the `profile_question` table**, not a JSONB array on the project row.

6. **Logic rules live in the `logic_rule` table**, not a JSONB array in settings.

7. **No `normalizeProject()` function.** Column names are consistent. The `SurveyBuilder` uses `toProjectState()` and `toDbRow()` for direct column mapping with zero JSONB merging.

8. **No legacy JSONB fallbacks.** We haven't launched, so there is no data to migrate. All reads go to proper columns and tables.

9. **Legacy question types exist.** Always use `normalizeLegacyQuestionType()` when reading types from the database. Canonical types are in `SUPPORTED_QUESTION_TYPES`.

10. **The BottomNav from the parent Dementia Survey app is hidden** for all `/easyresearch` routes.

11. **Template creation auto-provisions org and researcher records** if missing. It inserts questionnaires and participant types into their own tables, and writes all project settings as flat columns.

12. **Enrollment ID is cached in localStorage** as `enrollment_${projectId}` to skip re-onboarding on repeat visits.

13. **The `question_config` JSONB on `survey_question` is the only polymorphic JSONB that stays.** This holds type-specific config (max_length for text, min/max for sliders, scale labels, disqualify values, etc.) that varies by question type. This is a legitimate JSONB use case. Same for `validation_rule` and `logic_rule` JSONB on survey_question — these are per-question polymorphic configs.
