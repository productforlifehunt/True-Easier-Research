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


---

## 22. PARTICIPANT TYPES SYSTEM

Participant types define categories of participants (e.g., "Caregiver", "Patient"). Each project can have multiple types. Questionnaires are assigned to types via a junction table — participants only see questionnaires assigned to their type.

### 22.1 Data Model

- **`participant_type`** — One row per category. Has name, description, color, order.
- **`questionnaire_participant_type`** — Junction table. Many-to-many link between questionnaires and types.
- **`enrollment`** — Links participant to project with their selected type.



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
- **`researcher of a project: defined by — research_project.researcher_id
-    participant of a project: defined by - enrollment.participant_id
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



2. **Questionnaires, participant types, and their assignments live in their own tables** — `questionnaire`, `participant_type`, and `questionnaire_participant_type`.

3. **Consent forms and screening sets are questionnaire rows** with `questionnaire_type` set to `consent` or `screening`. They link to participant types through the junction table.

4. **Questions link to their parent questionnaire via a proper `questionnaire_id` FK column** on `survey_question`. There is no JSONB-based linking.

5. **Profile questions live in the `profile_question` table**, not a JSONB array on the project row.


