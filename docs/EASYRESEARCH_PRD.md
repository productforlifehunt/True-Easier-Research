# EasyResearch Platform - Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** February 4, 2026  
> **ELI5 Level:** Written so clear that even a junior developer won't mess up the data model

---

## Table of Contents
1. [Data Model](#1-data-model)
2. [Feature List](#2-feature-list)
3. [Route Mapping](#3-route-mapping)

---

# 1. Data Model

## Overview: How Data Flows Like a River 🌊

Think of the data like a family tree:
```
Organization (The Company)
    └── Researcher (The Employee)
            └── Research Project (The Survey)
                    ├── Survey Questions (What you ask)
                    │       └── Question Options (Answer choices)
                    ├── Enrollment (Who joined)
                    │       └── Survey Instance (Each time they fill it)
                    │               └── Survey Response (Their answers)
                    └── Questionnaire Schedule (When to ask - longitudinal only)
```

---

## 1.1 Core Tables

### 📦 `organization`
**What is it?** The company/team that owns everything. Like a parent folder.

> ⚠️ **Naming note:** This table uses singular naming (`organization`) consistent with all other care_connector schema tables.

| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique ID for this org |
| `name` | text | Display name ("Acme Research Lab") |
| `slug` | text | URL-friendly name ("acme-research-lab"), unique |
| `plan` | text | Subscription tier: `free`, `professional`, `team`, `enterprise` |
| `ai_credit` | int | AI credit balance (default 100). Single column for tracking. |
| `setting` | jsonb | Extra config (theme, preferences, AI/voice feature flags) |
| `created_at` | timestamptz | When created |
| `updated_at` | timestamptz | When last modified |

**Business Rules:**
- Every researcher MUST belong to an organization
- `ai_credit` tracks remaining credits (decremented on use, not split into used/monthly)
- Plan determines feature limits
- AI/voice feature flags are stored inside the `setting` jsonb, NOT as separate boolean columns

---

### 👨‍🔬 `researcher`
**What is it?** A user who creates surveys. Links a Supabase auth user to an organization.

> ⚠️ **Naming note:** This table uses singular naming (`researcher`) consistent with all other care_connector schema tables.

| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique researcher ID |
| `user_id` | UUID | Links to Supabase `auth.users`, unique |
| `organization_id` | UUID | Which org they belong to (nullable) |
| `role` | text | Always `'researcher'` for now |
| `first_name` | text | Researcher's first name (nullable) |
| `last_name` | text | Researcher's last name (nullable) |
| `email` | text | Researcher's email (nullable) |
| `email_notifications` | bool | Receive email notifications? (default true) |
| `response_alerts` | bool | Get alerted on new responses? (default true) |
| `weekly_digest` | bool | Receive weekly summary email? (default false) |
| `created_at` | timestamptz | When created |
| `updated_at` | timestamptz | When last modified |

**Business Rules:**
- One user can be ONE researcher (unique on user_id)
- A researcher sees ONLY their organization's projects
- Created automatically when user signs up as researcher

**When is this table touched?**
| Operation | What Happens |
|-----------|---------------|
| Sign up as researcher | INSERT new row with `user_id`, `organization_id`, `role='researcher'` |
| Load dashboard | SELECT to get `organization_id` for filtering projects |
| Update settings | UPDATE `email_notifications`, `response_alerts`, `weekly_digest` WHERE id |

---

### 📋 `research_project`
**What is it?** THE MAIN TABLE. A survey or study that participants fill out.

| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique project ID |
| `organization_id` | UUID | Who owns this project (nullable) |
| `researcher_id` | UUID | Who created it (nullable) |
| `title` | text | Survey name shown to participants |
| `description` | text | What the survey is about |
| `status` | text | `draft`, `published`, `active`, `completed`, `paused` |
| `project_type` | text | `survey` (one-time) or `longitudinal` (multi-day) |
| `methodology_type` | varchar | `single_survey`, `esm`, `ema`, `daily_diary`, `longitudinal` |
| `ai_enabled` | bool | Can participants get AI help? (default false) |
| `voice_enabled` | bool | Can participants use voice input? (default false) |
| `notification_enabled` | bool | Send push notifications? (default true) |
| `max_participant` | int | How many people can join |
| `current_participant` | int | How many have joined (default 0) |
| `study_duration` | int | Days the study runs (default 7, longitudinal only) |
| `survey_frequency` | varchar | How often surveys are sent: `daily`, etc. (default 'daily') |
| `survey_code` | varchar | Short code for sharing (e.g., "ABC123") |
| `consent_form` | jsonb | Consent text and settings |
| `setting` | jsonb | Display settings (progress bar, back button, etc.) |
| `notification_setting` | jsonb | When to send notifications |
| `sampling_strategy` | jsonb | ESM/EMA scheduling config |
| `timeline_config` | jsonb | Timeline display configuration |
| `recruitment_criteria` | jsonb | Eligibility requirements |
| `compensation_amount` | numeric | Payment amount for participants |
| `compensation_type` | text | How compensation is paid |
| `allow_participant_dnd` | bool | Can participants set DND? (default false) |
| `participant_numbering` | bool | Auto-assign participant numbers? (default false) |
| `onboarding_required` | bool | Require onboarding before survey? (default false) |
| `onboarding_instruction` | text | Instructions shown during onboarding (singular!) |
| `profile_question` | jsonb | Profile questions for onboarding (singular!) |
| `allow_start_date_selection` | bool | Can participant pick study start date? (default false) |
| `help_information` | text | Help/FAQ content for participants |
| `published_at` | timestamp | When it went live |
| `start_at` | timestamp | Planned study start date |
| `end_at` | timestamp | Planned study end date |
| `created_at` | timestamp | When it was created |

**Status Flow:**
```
draft → published → active → completed
          ↓
        paused
```

**Project Type Explained:**
| `methodology_type` | `project_type` | What It Means |
|-------------------|----------------|---------------|
| `single_survey` | `survey` | Fill once and done |
| `esm` | `longitudinal` | Multiple prompts per day, random or fixed times |
| `ema` | `longitudinal` | Same as ESM, clinical-grade |
| `daily_diary` | `longitudinal` | Once per day reflection |
| `longitudinal` | `longitudinal` | Periodic check-ins over time |

**When is this table touched?**
| Operation | What Happens |
|-----------|--------------|
| Create survey | INSERT with `status='draft'`, generate `survey_code` |
| Edit survey | UPDATE `title`, `description`, `setting`, etc. |
| Publish survey | UPDATE `status='published'`, SET `published_at=NOW()` |
| Delete survey | DELETE row (must delete `survey_question` first!) |
| Duplicate survey | SELECT existing → INSERT copy with new ID, `status='draft'` |
| Participant joins | UPDATE `current_participant += 1` |

---

### ❓ `survey_question`
**What is it?** One question in a survey.

| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique question ID |
| `project_id` | UUID | Which survey this belongs to |
| `question_type` | text | See types below |
| `question_text` | text | The actual question ("How are you feeling?") |
| `question_description` | text | Helper text below question |
| `required` | bool | Must answer to continue? |
| `order_index` | int | Position in survey (1, 2, 3...) |
| `question_config` | jsonb | Type-specific settings |
| `validation_rule` | jsonb | Min/max, patterns, etc. |
| `logic_rule` | jsonb | Skip logic, show/hide conditions |
| `ai_config` | jsonb | AI assistance settings |
| `allow_voice` | bool | Can use voice for this question? |
| `allow_ai_assist` | bool | Can get AI help for this question? |
| `section_name` | text | Section grouping label (nullable) |
| `created_at` | timestamp | When created |
| `updated_at` | timestamp | When last modified |

**Question Types:**
| Type | What It Is |
|------|------------|
| `short_text` | One line answer |
| `long_text` | Paragraph answer |
| `single_choice` | Pick ONE option |
| `multiple_choice` | Pick MANY options |
| `likert_scale` | 1-5 or 1-7 agreement scale |
| `rating` | Stars or numeric rating |
| `dropdown` | Select from dropdown |
| `number` | Numeric input |
| `date` | Date picker |
| `time` | Time picker |
| `slider` | Drag slider for value |
| `matrix` | Grid of questions |
| `ranking` | Order items by preference |
| `file_upload` | Upload a file |

**When is this table touched?**
| Operation | What Happens |
|-----------|--------------|
| Add question | INSERT with `project_id`, `order_index = MAX + 1` |
| Edit question | UPDATE `question_text`, `question_type`, `required`, etc. |
| Reorder questions | UPDATE `order_index` for affected questions |
| Delete question | DELETE row (also delete `question_option` for this question!) |
| Duplicate question | SELECT → INSERT copy with new ID, `order_index = MAX + 1` |

---

### 🔘 `question_option`
**What is it?** Answer choices for single_choice, multiple_choice, dropdown questions.

| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique option ID |
| `question_id` | UUID | Which question this belongs to |
| `option_text` | text | What participant sees ("Very Happy") |
| `option_value` | text | Internal value ("very_happy") |
| `order_index` | int | Position in list (1, 2, 3...) |
| `is_other` | bool | Is this an "Other" option with text input? |

**When is this table touched?**
| Operation | What Happens |
|-----------|--------------|
| Create choice question | INSERT options with `question_id` |
| Add option | INSERT new row, set `order_index = MAX + 1` |
| Edit option | UPDATE `option_text`, `option_value` |
| Delete option | DELETE row |
| Reorder options | UPDATE `order_index` for affected rows |

---

### 👥 `enrollment`
**What is it?** A participant joining a survey. Links a user to a project.

| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique enrollment ID |
| `project_id` | UUID | Which survey they joined (nullable) |
| `participant_id` | UUID | User ID from Supabase auth (nullable for anonymous) |
| `participant_email` | varchar | Their email (nullable) |
| `participant_number` | varchar | Assigned number e.g. "P001" (nullable) |
| `status` | text | `invited`, `active`, `completed`, `withdrawn` (default **'invited'**) |
| `consent_signed_at` | timestamp | When they consented (nullable — null means no consent yet) |
| `consent_version` | text | Version of consent form accepted (nullable) |
| `enrollment_data` | jsonb | Extra metadata (default '{}') |
| `profile_data` | jsonb | Onboarding answers (nullable) |
| `dnd_setting` | jsonb | Do Not Disturb config (nullable) |
| `completion_rate` | numeric | Progress percentage (default 0) |
| `last_activity_at` | timestamp | Last interaction timestamp (nullable) |
| `compensation_status` | text | Payment status: `pending`, etc. (default 'pending') |
| `study_start_date` | date | When participant started the study (nullable) |
| `enrollment_token` | UUID | Token for invitation links (nullable) |
| `interview_agreement` | bool | Agreed to interview? (default false) |
| `enrollment_completed_at` | timestamptz | When onboarding was finished (nullable) |
| `completed_at` | timestamp | When study was completed (nullable) |
| `withdrawn_at` | timestamp | When participant withdrew (nullable) |
| `created_at` | timestamp | When enrolled |
| `updated_at` | timestamptz | When last modified |

> ⚠️ **Consolidation note:** Consent is tracked by `consent_signed_at` (timestamp, nullable) — NOT a boolean column. A non-null value means consent was given. There is NO `consent_given` or `consent_given_at` column. The default status is `'invited'`, NOT `'pending'`.

**When is this table touched?**
| Operation | What Happens |
|-----------|---------------|
| Researcher invites participant | INSERT with `status='invited'`, `participant_email` |
| Participant opens survey | SELECT to check if already enrolled |
| Accept consent | INSERT/UPDATE with `consent_signed_at=NOW()`, `status='active'` |
| Complete onboarding | UPDATE `profile_data`, `enrollment_completed_at=NOW()` |
| Finish survey (one-time) | UPDATE `status='completed'`, `completed_at=NOW()` (gap: not yet implemented) |
| Withdraw | UPDATE `status='withdrawn'`, `withdrawn_at=NOW()` |
| Update DND | UPDATE `dnd_setting` WHERE id |

---

### 📅 `survey_instance`
**What is it?** One "session" of a longitudinal survey. Like "Day 3, 2pm prompt".

> ✅ **This table EXISTS in the live database.** Earlier CRC sections incorrectly stated it did not.

| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique instance ID |
| `project_id` | UUID | Which survey (nullable) |
| `enrollment_id` | UUID | Which participant's enrollment (nullable) |
| `instance_number` | int | Sequential number (1, 2, 3...) |
| `day_number` | int | Day of the study (1, 2, 3...) (nullable) |
| `scheduled_time` | timestamp | When it was supposed to happen |
| `actual_start_time` | timestamp | When they actually started (nullable) |
| `actual_end_time` | timestamp | When they finished (nullable) |
| `status` | varchar | `scheduled`, `in_progress`, `completed`, `missed`, `late` (default 'scheduled') |
| `time_point` | varchar | Label like "Morning", "Afternoon" (nullable) |
| `completion_rate` | numeric | Completion percentage for this instance (nullable) |
| `metadata` | jsonb | Extra instance metadata (default '{}') |
| `created_at` | timestamp | When created |

**Status Flow:**
```
scheduled → in_progress → completed
    ↓
  missed (if time window passed)
    ↓
   late (if completed after window)
```

**When is this table touched?**
| Operation | What Happens |
|-----------|--------------|
| Enroll in longitudinal | INSERT instances for first day |
| Start survey prompt | UPDATE `status='in_progress'`, SET `actual_start_time=NOW()` |
| Complete prompt | UPDATE `status='completed'`, SET `actual_end_time=NOW()` |
| Add manual entry | INSERT new instance with `status='scheduled'` |
| Delete entry | DELETE row (must delete `survey_respons` first!) |
| Time passes without response | UPDATE `status='missed'` |

---

### 💬 `survey_respons`
**What is it?** ONE answer to ONE question. The actual data collected!

| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique response ID |
| `project_id` | UUID | Which survey (nullable) |
| `enrollment_id` | UUID | Who answered (nullable) |
| `question_id` | UUID | Which question (nullable) |
| `instance_id` | UUID | Which session (nullable — null for one-time surveys) |
| `response_type` | text | Type of response (nullable) |
| `response_text` | text | Text answer (nullable) |
| `response_value` | jsonb | Structured answer — option IDs, numbers, etc. (nullable) |
| `response_audio_url` | text | URL to voice recording if voice input used (nullable) |
| `ai_analysi` | jsonb | AI analysis results (nullable; singular naming convention) |
| `response_time_second` | int | How long participant spent answering, in seconds (nullable) |
| `created_at` | timestamp | When answered |
| `updated_at` | timestamp | When last modified |

**Response Value Examples:**
```json
// Single choice
{ "option_id": "uuid-here" }

// Multiple choice
["option-id-1", "option-id-2"]

// Likert scale
{ "value": 4 }

// Rating
{ "rating": 5 }
```

**When is this table touched?**
| Operation | What Happens |
|-----------|--------------|
| Answer question | INSERT/UPSERT with `question_id`, `response_text/value` |
| Edit answer | UPDATE `response_text`, `response_value` |
| Submit survey | INSERT all responses at once |
| Delete instance | DELETE all responses with that `instance_id` |

---

### 📆 `questionnaire` & `questionnaire_schedule`
**What is it?** For advanced longitudinal studies - pre-built questionnaire templates that can be scheduled.

**`questionnaire`:**
| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique questionnaire ID |
| `project_id` | UUID | Which project |
| `title` | text | Name ("Morning Check-in") |
| `description` | text | What it's about |
| `estimated_duration` | int | Minutes to complete |
| `question` | jsonb | Question definitions (singular! default '[]') |

**`questionnaire_schedule`:**
| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique schedule ID |
| `project_id` | UUID | Which project |
| `questionnaire_id` | UUID | Which questionnaire |
| `day_number` | int | Day of study (1, 2, 3...) |
| `scheduled_time` | time | Time of day ("14:00") |
| `notification_enabled` | bool | Send reminder? |
| `notification_minute_before` | int | Minutes before to remind |

---

### 👤 `participants`
**What is it?** A participant user record. Links a Supabase auth user to participant-specific data.

> ⚠️ **Note:** This table is used by ParticipantJoin.tsx to ensure a participant record exists before creating enrollment. The `enrollment.participant_id` column references `participants.id`, NOT `auth.users.id` directly (in the join-by-code flow).

| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique participant ID |
| `user_id` | UUID | Links to Supabase `auth.users` (nullable) |
| `email` | text | Participant's email (nullable) |

**When is this table touched?**
| Operation | What Happens |
|-----------|--------------|
| Join survey by code (logged in) | SELECT WHERE user_id. If not found, INSERT with user_id, email. |
| Create enrollment | `enrollment.participant_id` is set to `participants.id` |

---

### 📊 `compliance_tracking`
**What is it?** Tracks daily compliance/adherence data for longitudinal study participants.

> ⚠️ **Note:** Used by ESMParticipantDashboard.tsx to display compliance statistics.

| Column | Type | What It Means |
|--------|------|---------------|
| `id` | UUID | Unique tracking ID |
| `enrollment_id` | UUID | Which enrollment this tracks |
| `date` | date | The date being tracked |
| *(other columns)* | *(varies)* | Compliance metrics (exact schema TBD — needs DB verification) |

**When is this table touched?**
| Operation | What Happens |
|-----------|--------------|
| Load ESM dashboard | SELECT WHERE enrollment_id, ORDER BY date desc |

---

## 1.2 Data Relationships Diagram

```
┌─────────────────┐
│  organization   │
│  (The Company)  │
└────────┬────────┘
         │ 1:many
         ▼
┌─────────────────┐      ┌─────────────────┐
│   researcher    │──────│ auth.users      │
│ (Survey Makers) │ 1:1  │ (Supabase Auth) │
└────────┬────────┘      └────────┬────────┘
         │ 1:many                 │ 1:1
         ▼                        ▼
┌─────────────────┐      ┌─────────────────┐
│ research_project│      │  participants   │
│   (Surveys)     │      │ (Participant    │
└────────┬────────┘      │  User Records)  │
         │               └────────┬────────┘
    ┌────┴────┬──────────────┐    │
    │         │              │    │ participant_id
    ▼         ▼              ▼    ▼
┌────────┐ ┌────────────┐  ┌────────────────┐
│survey_ │ │ enrollment │  │questionnaire   │
│question│ │(Participants│  │(Templates)     │
└───┬────┘ └──┬───┬─────┘  └───────┬────────┘
    │         │   │                │
    ▼         │   ▼                ▼
┌────────┐   │ ┌─────────────┐ ┌────────────────┐
│question│   │ │survey_      │ │questionnaire_  │
│_option │   │ │instance     │ │schedule        │
└────────┘   │ └─────┬───────┘ └────────────────┘
             │       │
             │       ▼
             │ ┌────────────┐
             │ │survey_     │
             │ │respons     │
             │ │(Answers!)  │
             │ └────────────┘
             │
             ▼
       ┌────────────────┐
       │ compliance_    │
       │ tracking       │
       └────────────────┘
```

---

# 2. Feature List

## 2.1 Authentication & User Management

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Auth is handled by Supabase Auth (auth.users table). The app has two roles: researcher (creates surveys) and participant (takes surveys). Role is determined by presence in the `researcher` table.
>
> **Requirement:** Single auth page at /easyresearch/auth supports both sign-up and sign-in. Role selector only shown during sign-up.
>
> **Clarification:** Auth component is EasyResearchAuth.tsx. Uses `authClient.auth` for Supabase auth operations. Role detection: SELECT `researcher` WHERE user_id = auth user id (maybeSingle). If row exists, user is a researcher. Participants do not need a record in any role table — any authenticated user without a researcher row is treated as a participant. URL params: `?become=researcher` forces sign-up with researcher role. `?redirect=researcher` sets researcher role for sign-in. `?redirectTo=/path` sets custom post-auth redirect.

<!-- 🔒 CRC END -->

### F-2.1.1: Researcher Sign Up

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** New user creates account and becomes a researcher with an organization.
>
> **Requirement:** Email/password form with role selector. Auto-create org if none exists. Redirect to dashboard.
>
> **Clarification:** Calls Supabase `auth.signUp` with email, password, `options.data.role`. If role is researcher: SELECT first row from `organization` (limit 1, maybeSingle). If none, INSERT `organization` with name='My Organization', slug='org-{timestamp}', plan='free'. INSERT `researcher` with user_id, organization_id (nullable), role='researcher'. On conflict user_id: UPSERT. After auth, SELECT `researcher` WHERE user_id to verify. Navigate to /easyresearch/dashboard.

<!-- 🔒 CRC END -->

**What happens:** User creates account and becomes a researcher.

**Data Flow:**
1. User enters email/password
2. Supabase creates `auth.users` record
3. App checks if `organization` exists → if not, INSERT one
4. App INSERTs into `researcher` with `user_id` and `organization_id`
5. Redirect to dashboard

**Tables Affected:**
| Table | Operation | Columns |
|-------|-----------|---------|
| `organization` | INSERT (if new) | `name`, `slug`, `plan='free'` |
| `researcher` | INSERT | `user_id`, `organization_id`, `role='researcher'` |

---

### F-2.1.2: Researcher Sign In

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Existing user logs in and is routed based on their role.
>
> **Requirement:** Email/password form. After login, check if user is a researcher and route accordingly.
>
> **Clarification:** Calls `auth.signInWithPassword` with email, password. Then SELECT `researcher` WHERE user_id = auth user id (maybeSingle). If researcher row found OR user_metadata.role === 'researcher': navigate to /easyresearch/dashboard. Otherwise navigate to /easyresearch (participant landing). Supports `?redirectTo=` and `?redirect=researcher` URL params to override destination.

<!-- 🔒 CRC END -->

**What happens:** Existing user logs in.

**Data Flow:**
1. User enters credentials
2. Supabase validates auth
3. App SELECTs from `researcher` WHERE `user_id = logged_in_user`
4. If found → go to dashboard
5. If not found → prompt to become researcher

**Tables Affected:**
| Table | Operation | Columns |
|-------|-----------|---------|
| `researcher` | SELECT | `user_id`, `organization_id` |

---

### F-2.1.3: User Account Settings

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** User manages their account profile (name, phone, notification prefs).
>
> **Requirement:** Edit profile with save toggle. Support logout.
>
> **Clarification:** UserSettings at /easyresearch/user/settings. Reads from supabase.auth.getUser() user_metadata (full_name, phone, notifications_enabled, email_notifications, push_notifications). On save: supabase.auth.updateUser({ data: {...} }) updates auth.users.raw_user_meta_data jsonb. No custom profile table — all in Supabase auth metadata. Logout: supabase.auth.signOut().

<!-- 🔒 CRC END -->

**What happens:** User views and edits their account profile and notification preferences.

---

## 2.2 Survey Management (Researcher Side)

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researchers manage survey projects from a dashboard. Projects go through a lifecycle: draft → published → active → completed. Each project has questions, options, and settings.
>
> **Requirement:** Dashboard lists all projects for the researcher's organization. Support create, edit, publish/unpublish, duplicate, and delete operations.
>
> **Clarification:** ResearcherDashboard component at /easyresearch/dashboard. On load: SELECT `researcher` WHERE user_id (maybeSingle) to get organization_id. SELECT `research_project` WHERE organization_id, ORDER BY created_at desc. Project cards display: title, description, status (badge), project_type, methodology_type, created_at, survey_code (if published). Card actions: Edit (navigates to /easyresearch/project/{id}), Duplicate, Delete, View Responses (navigates to /easyresearch/project/{id}/responses). The `?create=true` URL param auto-opens the CreateProjectDialog.

<!-- 🔒 CRC END -->

### F-2.2.1: Create New Survey

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher creates a new survey/study project via a multi-step wizard dialog.
>
> **Requirement:** Wizard collects methodology type, title, description, schedule config (for longitudinal), and feature toggles (AI, voice, consent). Project starts as draft.
>
> **Clarification:** SELECT `researcher` WHERE user_id to get organization_id and researcher id. If researcher not found, SELECT first `organization` row, then INSERT `researcher` with user_id, organization_id, role='researcher'. INSERT into `research_project` with: organization_id, researcher_id, title, description, status='draft', project_type ('survey' or 'longitudinal' based on methodology), methodology_type, survey_code (random 6-char uppercase string), max_participant (default 100), setting (jsonb), consent_form (jsonb), ai_enabled, voice_enabled. For longitudinal types also sets study_duration, survey_frequency, sampling_strategy. After project creation, 3 default starter questions are inserted: a likert_scale (order_index=1), a multiple_choice (order_index=2), and a long_text (order_index=3). For the multiple_choice question, 5 default `question_option` rows are also inserted. This happens in CreateProjectDialog.tsx.

<!-- 🔒 CRC END -->

**What happens:** Researcher creates a new survey project.

**Data Flow:**
1. Click "Create Survey" → Opens wizard
2. Select methodology (single_survey, esm, ema, etc.)
3. Enter title, description
4. Configure schedule (for longitudinal)
5. Enable features (AI, voice, consent)
6. Click "Create"

**Tables Affected:**
| Table | Operation | Columns Changed |
|-------|-----------|-----------------|
| `researcher` | SELECT | Get `organization_id` |
| `research_project` | INSERT | All project columns |
| `survey_question` | INSERT | 3 default starter questions (likert_scale, multiple_choice, long_text) |
| `question_option` | INSERT | 5 options for the multiple_choice default question |

**Key Business Rules:**
- `status` starts as `'draft'`
- `survey_code` is auto-generated (6 char random)
- `project_type` = `'survey'` for single, `'longitudinal'` for others

---

### F-2.2.2: Edit Survey (Survey Builder)

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher edits questions, options, and settings for an existing survey project.
>
> **Requirement:** Desktop and mobile survey builder UI. Add/edit/reorder/delete questions and options. Auto-save on changes. Support all question types.
>
> **Clarification:** On load: SELECT `research_project` WHERE id=projectId (maybeSingle) to get project data including setting, consent_form. SELECT `survey_question` WHERE project_id ORDER BY order_index, with joined `question_option` rows. Adding a question: INSERT `survey_question` with project_id, question_type, question_text, order_index (max existing + 1), required (default false). Editing a question: UPDATE `survey_question` SET changed columns WHERE id. Adding/editing options: DELETE all `question_option` WHERE question_id, then INSERT new option rows with question_id, option_text, option_value, order_index. Reordering: UPDATE `survey_question` SET order_index for each affected row. Deleting a question: DELETE `question_option` WHERE question_id, then DELETE `survey_question` WHERE id. Project settings saved via UPDATE `research_project` SET setting, consent_form, title, description etc WHERE id.

<!-- 🔒 CRC END -->

**What happens:** Researcher modifies survey questions and settings.

**Adding a Question:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `survey_question` | INSERT | `project_id`, `question_type`, `question_text`, `order_index` |

**Editing a Question:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `survey_question` | UPDATE | Any column the user edited |

**Adding/Editing Options:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `question_option` | INSERT/UPDATE | `question_id`, `option_text`, `option_value`, `order_index` |

**Reordering Questions:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `survey_question` | UPDATE (multiple) | `order_index` for each moved question |

**Deleting a Question:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `question_option` | DELETE | All options WHERE `question_id = deleted_question` |
| `survey_question` | DELETE | The question row |

---

### F-2.2.3: Survey Preview

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher previews how the survey will look to participants before publishing.
>
> **Requirement:** Show questions in participant-facing layout. Toggle between desktop and mobile preview. Navigate between questions. No data is saved.
>
> **Clarification:** SurveyPreview component embedded in SurveyBuilder. Receives questions array, projectTitle, projectDescription as props. Renders each question using normalizeLegacyQuestionType() for type mapping. Supports desktop/mobile toggle. Allows mock responses for visual testing but does NOT write to any database table. Purely client-side UI preview.

<!-- 🔒 CRC END -->

**What happens:** Researcher sees a live preview of their survey as participants would see it.

---

### F-2.2.4: Survey Logic / Skip Logic

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher configures conditional logic rules that show/hide questions based on previous answers.
>
> **Requirement:** Define rules per question: if question X has answer Y, then show/hide question Z.
>
> **Clarification:** SurveyLogic component embedded in SurveyBuilder. Logic rules stored in `survey_question`.`logic_rule` (jsonb column, singular). Each rule: { source_question_id, condition ('equals'|'not_equals'|'contains'), value, action ('show'|'hide'|'skip_to'), target_question_id }. On save: UPDATE `survey_question` SET `logic_rule` WHERE id. During participant survey taking, `logic_rule` is evaluated client-side to determine question visibility.

<!-- 🔒 CRC END -->

**What happens:** Researcher sets up conditional logic to control question flow.

---

### F-2.2.5: Publish Survey

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher publishes a draft survey so participants can access it.
>
> **Requirement:** Must have at least one question. Generates survey_code if not already set. Can also unpublish back to draft.
>
> **Clarification:** Validates questions.length > 0 before publishing. UPDATE `research_project` SET status='published', published_at=NOW() WHERE id=projectId. If survey_code is null, generates a random 6-char uppercase alphanumeric string and sets it. Unpublish: UPDATE `research_project` SET status='draft', published_at=null WHERE id=projectId. Published surveys become visible to participants via share link or survey_code.

<!-- 🔒 CRC END -->

**What happens:** Survey goes live for participants.

**Data Flow:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `research_project` | UPDATE | `status='published'`, `published_at=NOW()` |

**Business Rules:**
- Cannot publish with 0 questions
- Published surveys show up in participant view
- Share link becomes active

---

### F-2.2.6: Delete Survey

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher permanently deletes a survey project and all its associated data.
>
> **Requirement:** Confirmation dialog before delete. Must delete child records before parent due to FK constraints. Show loading state during deletion.
>
> **Clarification:** Delete order (FK-safe): 1) SELECT `survey_question`.id WHERE project_id to collect question IDs. 2) DELETE `question_option` WHERE question_id IN (collected IDs). 3) DELETE `survey_respons` WHERE project_id. 4) DELETE `survey_question` WHERE project_id. 5) DELETE `survey_instance` WHERE project_id. 6) DELETE `enrollment` WHERE project_id. 7) DELETE `research_project` WHERE id. The `survey_instance` table EXISTS in the live DB and must be cleaned up. Skipping step 3 (survey_respons) will cause FK constraint failure if any responses exist.

<!-- 🔒 CRC END -->

**What happens:** Survey is permanently removed.

**Data Flow (ORDER MATTERS — must match CRC!):**
| Step | Table | Operation |
|------|-------|-----------|
| 1 | `survey_question` | SELECT id WHERE project_id (collect question IDs) |
| 2 | `question_option` | DELETE WHERE `question_id` IN (collected IDs) |
| 3 | `survey_respons` | DELETE WHERE `project_id` |
| 4 | `survey_question` | DELETE WHERE `project_id` |
| 5 | `survey_instance` | DELETE WHERE `project_id` |
| 6 | `enrollment` | DELETE WHERE `project_id` |
| 7 | `research_project` | DELETE WHERE `id` |

**⚠️ WARNING:** Must delete in this order due to foreign key constraints!

---

### F-2.2.7: Duplicate Survey

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher copies an existing survey project as a new draft, including all its questions and options.
>
> **Requirement:** One-click duplicate from dashboard. New project gets "(Copy)" appended to title, status reset to draft, no survey_code. All questions and options are deep-copied with new IDs.
>
> **Clarification:** SELECT `researchers` WHERE user_id to get organization_id and researcher id. INSERT into `research_project` with: organization_id, researcher_id, title='{original title} (Copy)', description (copied), status='draft', project_type (copied), methodology_type (copied), ai_enabled (copied), voice_enabled (copied), max_participant (copied), setting (copied), notification_setting (copied). No survey_code or published_at set on copy. Then SELECT `survey_question` WHERE project_id = original, with joined `question_option`. For each question: generate new UUID via crypto.randomUUID(), INSERT `survey_question` with new id, new project_id, all other fields copied. For each question's options: generate new UUIDs, INSERT `question_option` with new id, new question_id, all other fields copied.

<!-- 🔒 CRC END -->

**What happens:** Copy an existing survey as a new draft.

**Data Flow:**
| Step | Table | Operation |
|------|-------|-----------|
| 1 | `research_project` | SELECT original |
| 2 | `research_project` | INSERT copy with `status='draft'`, new `id`, NO survey_code or published_at |
| 3 | `survey_question` | SELECT originals, INSERT copies with new `project_id` |
| 4 | `question_option` | SELECT originals, INSERT copies with new `question_id`s |

---

### F-2.2.8: Questionnaire Scheduler

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher configures the schedule for longitudinal studies — which questionnaires are sent when during the study.
>
> **Requirement:** Drag-and-drop timeline for scheduling questionnaires across study days. Assign questionnaires to specific time slots.
>
> **Clarification:** QuestionnaireScheduler component used in project settings for longitudinal projects. Uses `questionnaire` table (id, project_id, title, description) and `questionnaire_schedule` table (id, questionnaire_id, day_number, time_slot, is_required). INSERT/UPDATE/DELETE on both tables as researcher builds schedule. Schedule data drives which surveys appear on which day in the participant timeline.

<!-- 🔒 CRC END -->

**What happens:** Researcher builds a multi-day schedule for longitudinal surveys.

---

### F-2.2.9: Manage Participants & Invite

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher views all enrolled participants for a project and can invite new ones by email.
>
> **Requirement:** List enrollments per project with status badges (invited/active/completed/withdrawn). Filter by status, search by email. Invite modal to send email invitations.
>
> **Clarification:** ParticipantsPage at /easyresearch/participants. On load: SELECT `researchers` WHERE user_id to get organization_id. SELECT `research_project` WHERE organization_id for project dropdown. SELECT `enrollment` WHERE project_id = selected, columns: id, participant_id, participant_email, status, created_at. Invite: check for existing enrollment (SELECT `enrollment` WHERE project_id AND participant_email, maybeSingle). If none: INSERT `enrollment` with project_id, participant_email (lowercased), status='invited'. No actual email is sent — enrollment record is created with 'invited' status.

<!-- 🔒 CRC END -->

**What happens:** Researcher manages participant enrollments and sends invitations.

---

### F-2.2.10: Researcher Settings

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher configures notification preferences and organization settings.
>
> **Requirement:** Toggle email notifications, response alerts, weekly digest. Edit organization name.
>
> **Clarification:** SettingsPage at /easyresearch/settings. On load: SELECT `researcher` WHERE user_id (maybeSingle) to get id, organization_id, email_notifications, response_alerts, weekly_digest. SELECT `organization` WHERE id=organization_id (maybeSingle) to get name. On save: UPDATE `researcher` SET email_notifications, response_alerts, weekly_digest WHERE id. UPDATE `organization` SET name WHERE id.

<!-- 🔒 CRC END -->

**What happens:** Researcher manages notification preferences and organization info.

---

## 2.3 Participant Flow

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participants access surveys via direct links or survey codes. They may be anonymous (no auth) or logged in. Enrollment tracks their participation. Consent may be required before starting.
>
> **Requirement:** Support both anonymous and authenticated participants. Store enrollment ID in localStorage for stateless access. Show consent form if project requires it. Route to correct view based on project_type.
>
> **Clarification:** Participant entry points: direct link /easyresearch/participant/{projectId} (via SurveyViewRouter), or join by code at /easyresearch/participant/join (ParticipantJoin). Enrollment is identified either by localStorage key `enrollment_{projectId}` (for anonymous) or by SELECT `enrollment` WHERE project_id AND participant_id (for logged-in users). The `enrollment` table uses `consent_signed_at` (timestamp, nullable) to track consent — NOT a boolean `consent_given` column. A non-null consent_signed_at means consent was given. Participant home at /easyresearch/home (ParticipantHome) lists enrolled surveys by SELECT `enrollment` WHERE participant_id or participant_email, joined with `research_project` for display.

<!-- 🔒 CRC END -->

### F-2.3.1: Participant Home Dashboard

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant's main hub showing enrolled surveys, available surveys to join, and their own research projects (if also a researcher).
>
> **Requirement:** Three tabs: Joined (enrolled surveys), Available (published surveys), My Research (own projects). Join by code modal. Create research modal.
>
> **Clarification:** ParticipantHome at /easyresearch/home. Joined tab: SELECT `enrollment` WHERE participant_id = auth user id, ORDER BY created_at desc. Then SELECT `research_project` WHERE id IN (enrollment project_ids) for display data. Available tab: SELECT `research_project` WHERE status IN ('published','active'), ORDER BY created_at desc. My Research tab: SELECT `researchers` WHERE user_id (maybeSingle), then SELECT `research_project` WHERE researcher_id. Clicking enrolled survey navigates to /easyresearch/participant/{projectId}/timeline (longitudinal) or /easyresearch/participant/{projectId}/dashboard (one-time). Also includes inline create-research form that INSERTs into `research_project`.

<!-- 🔒 CRC END -->

**What happens:** Participant sees their survey dashboard with enrolled, available, and owned surveys.

---

### F-2.3.2: Join Survey by Code / Invitation

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant joins a survey by entering a survey code or clicking an invitation link with a token.
>
> **Requirement:** Code input form. Validate code against published projects. Support invitation token URL params.
>
> **Clarification:** ParticipantJoin at /easyresearch/participant/join. Two modes: (1) By code: SELECT `research_project` WHERE survey_code = input (uppercased, trimmed) AND status IN ('published','active') (maybeSingle). If user is logged in, SELECT `participants` WHERE user_id (maybeSingle). If no participant record, INSERT `participants` with user_id and email. Then SELECT `enrollment` WHERE project_id AND participant_id to check for existing enrollment. If none, INSERT `enrollment` with project_id, participant_id (from participants.id), status='active', enrollment_token (random UUID). Navigate to /easyresearch/participant/{projectId}. (2) By invitation: URL params ?token=X&project=Y. SELECT `enrollment` WHERE enrollment_token=token AND project_id=projectId (maybeSingle). If valid, UPDATE `enrollment` SET status='active' WHERE id, then navigate to survey. The `participants` table stores participant records linked to auth.users via user_id. The `enrollment.participant_id` references `participants.id` (not auth.users.id directly) in the join-by-code flow.

<!-- 🔒 CRC END -->

**What happens:** Participant joins a survey using a code or invitation link.

---

### F-2.3.3: Participant Opens Survey Link

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant accesses a survey via URL containing the project ID. The app determines which view to show based on project type and enrollment status.
>
> **Requirement:** Route to correct survey view based on project_type. Check existing enrollment. Show consent if needed.
>
> **Clarification:** SurveyViewRouter at /easyresearch/participant/:projectId handles routing. SELECT `research_project` WHERE id=projectId. If project_type === 'longitudinal' and URL has ?instance= param: render ParticipantSurveyView. If project_type === 'longitudinal' without instance: render LongitudinalSurveyView. If project_type === 'survey': render OneTimeSurveyView. Enrollment check: first checks localStorage for key `enrollment_{projectId}`. If logged in, also SELECT `enrollment` WHERE project_id AND participant_id, ordered by created_at desc, limit 1 (maybeSingle). Checks enrollment.consent_signed_at to decide if consent modal is needed. If consent_signed_at is null/missing and project.consent_form.required is true, shows consent modal.

<!-- 🔒 CRC END -->

**What happens:** Participant clicks share link to join survey.

**Data Flow:**
1. Parse `projectId` from URL
2. SELECT `research_project` WHERE `id = projectId`
3. Check `status` - must be `'published'` or `'active'`
4. SELECT `enrollment` WHERE `project_id = projectId` AND `participant_id = user_id`
5. If enrolled → show survey
6. If not enrolled → show consent form

---

### F-2.3.4: Accept Consent & Enroll

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant accepts consent form and gets enrolled into the survey project.
>
> **Requirement:** Show consent_form content from research_project. On accept, create enrollment record. Store enrollment ID in localStorage for anonymous access.
>
> **Clarification:** If no existing enrollment: INSERT into `enrollment` with project_id, participant_id (auth user.id or null for anonymous), participant_email (from auth or prompted input), status='active', consent_signed_at=NOW(). The column is `consent_signed_at` (timestamp, nullable) — NOT `consent_given` (bool). A non-null consent_signed_at means consent was given. If enrollment already exists but consent_signed_at is null: UPDATE `enrollment` SET consent_signed_at=NOW() WHERE id. Enrollment ID is stored in localStorage under key `enrollment_{projectId}` for stateless participant access. If consent is not required by project (consent_form.required is false), enrollment is created without consent_signed_at. Code does NOT currently UPDATE `research_project`.current_participant on enrollment.

<!-- 🔒 CRC END -->

**What happens:** Participant agrees to participate.

**Tables Affected:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `enrollment` | INSERT | `project_id`, `participant_id`, `consent_signed_at=NOW()`, `status='active'` |
| `research_project` | UPDATE | `current_participant += 1` (gap: not yet implemented in code) |

**For Longitudinal Studies, also:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `survey_instance` | INSERT (multiple) | Create scheduled instances for day 1 |

---

### F-2.3.5: Complete Onboarding (Longitudinal)

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** For longitudinal studies, participant completes onboarding profile questions after consent but before starting surveys.
>
> **Requirement:** Show onboarding form if project has onboarding_required=true. Collect profile answers and store on enrollment record.
>
> **Clarification:** Onboarding is controlled by `research_project`.`onboarding_required` (bool) and `onboarding_instruction` (text, singular). Profile questions defined in `research_project`.`profile_question` (jsonb, singular). On submit: UPDATE `enrollment` SET profile_data = {collected answers as jsonb}, enrollment_completed_at=NOW() WHERE id=enrollmentId. After onboarding, participant proceeds to the survey timeline/dashboard. The ParticipantOnboarding component also sets study_start_date on enrollment creation.

<!-- 🔒 CRC END -->

**What happens:** Participant fills profile questions before starting.

**Tables Affected:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `enrollment` | UPDATE | `profile_data = { answers... }` |

---

### F-2.3.6: Answer Survey Questions

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant answers survey questions and their responses are saved to the database.
>
> **Requirement:** Validate required questions before submission. Save all responses in a single bulk insert. Support text, choice, rating, likert, and all other question types.
>
> **Clarification:** On submit: validates that all questions where required=true have a response. For each answered question, builds a row: { project_id, enrollment_id, question_id, response_text, response_value, instance_id (null for one-time surveys) }. response_text is the human-readable answer (option_text for choices, raw string for text inputs). response_value is the machine-readable value as jsonb (option_id for single choice, array of option_ids for multiple choice, numeric value for likert/rating). All rows are bulk-INSERTed into `survey_respons` in one operation. For longitudinal surveys, instance_id links to the specific survey_instance being completed. After successful insert, navigates to /easyresearch/survey/{projectId}/complete.

<!-- 🔒 CRC END -->

**What happens:** Participant submits responses.

**For Each Answer:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `survey_respons` | UPSERT | `question_id`, `response_text`, `response_value`, `enrollment_id`, `project_id`, `instance_id` |

**UPSERT Logic:**
- If response exists for this question + enrollment + instance → UPDATE
- If not exists → INSERT

---

### F-2.3.7: Complete Survey (One-Time)

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant finishes a one-time survey after submitting all responses.
>
> **Requirement:** After bulk-inserting responses, navigate to thank-you page. Enrollment status should be marked completed.
>
> **Clarification:** After successful INSERT of all `survey_respons` rows, the app navigates to /easyresearch/survey/{projectId}/complete which shows a static thank-you page. Note: the current code does NOT UPDATE `enrollment` SET status='completed' after submission — this is a gap. The enrollment remains status='active' after a one-time survey is completed.

<!-- 🔒 CRC END -->

**What happens:** Participant finishes a single survey.

**Tables Affected:**
| Table | Operation | What Changes |
|-------|-----------|---------------|
| `enrollment` | UPDATE | `status='completed'` (gap: NOT yet implemented — enrollment stays 'active') |

---

### F-2.3.8: Complete Survey Instance (Longitudinal)

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant finishes one scheduled survey prompt within a longitudinal study.
>
> **Requirement:** After submitting responses for a specific instance, mark that instance as completed with timestamp.
>
> **Clarification:** The `survey_instance` table EXISTS in the live database with columns: id, project_id, enrollment_id, instance_number, scheduled_time, actual_start_time, actual_end_time, status (default 'scheduled'), day_number, time_point, completion_rate, metadata, created_at. On instance completion: UPDATE `survey_instance` SET status='completed', actual_end_time=NOW() WHERE id=instanceId. Responses are linked via `survey_respons`.instance_id. The current longitudinal flow may not yet fully utilize survey_instance for all operations — some flows still derive timeline entries from study_duration and survey_frequency rather than querying survey_instance rows.

<!-- 🔒 CRC END -->

**What happens:** Participant finishes one prompt in a multi-day study.

**Tables Affected:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `survey_instance` | UPDATE | `status='completed'`, `actual_end_time=NOW()` |

---

### F-2.3.9: ESM/EMA Timeline Dashboard

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant views their longitudinal study progress as a timeline with daily entries, completion stats, and access to each survey prompt.
>
> **Requirement:** Show current study day, completion rate, streak, and a scrollable timeline of daily entries. Each day shows status (completed, available, upcoming, missed). Tapping an available day opens the survey.
>
> **Clarification:** ESMParticipantDashboard component at /easyresearch/participant/:projectId/dashboard and /timeline. On load: SELECT `enrollment` WHERE project_id AND participant_id (from auth user). SELECT `research_project` WHERE id=enrollment.project_id. SELECT `survey_instance` WHERE enrollment_id, ORDER BY scheduled_time — this IS used to build the timeline. SELECT `compliance_tracking` WHERE enrollment_id, ORDER BY date desc — for compliance stats. SELECT `survey_respons` WHERE enrollment_id, ORDER BY created_at desc — for summary tab. SELECT `survey_question` WHERE project_id, ORDER BY order_index — for question details. Add entry: SELECT max instance_number from `survey_instance` WHERE enrollment_id, then INSERT `survey_instance` with project_id, enrollment_id, instance_number, scheduled_time, status='scheduled', day_number. Delete entry: DELETE `survey_respons` WHERE instance_id, then DELETE `survey_instance` WHERE id. Edit responses: UPDATE `survey_respons` SET response_text, response_value WHERE enrollment_id AND question_id AND instance_id.

<!-- 🔒 CRC END -->

**What happens:** Participant views their progress in a longitudinal study.

**Data Loaded:**
| Table | Operation | What We Get |
|-------|-----------|-------------|
| `enrollment` | SELECT | WHERE project_id AND participant_id |
| `research_project` | SELECT | study_duration, survey_frequency, setting |
| `survey_instance` | SELECT | WHERE enrollment_id — builds the timeline |
| `compliance_tracking` | SELECT | WHERE enrollment_id — compliance stats |
| `survey_respons` | SELECT | WHERE enrollment_id — completed responses |
| `survey_question` | SELECT | WHERE project_id — question details |

**Write Operations:**
| Table | Operation | When |
|-------|-----------|------|
| `survey_instance` | INSERT | Add manual entry (new instance) |
| `survey_respons` | DELETE | Delete entry (delete responses first) |
| `survey_instance` | DELETE | Delete entry (then delete instance) |
| `survey_respons` | UPDATE | Edit completed response values |

---

### F-2.3.10: Participant Study Settings

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant manages per-study settings including DND (Do Not Disturb) periods, profile data, and enrollment answers.
>
> **Requirement:** Edit DND schedule (start/end times, days). Edit profile data and enrollment answers. Save all to enrollment record.
>
> **Clarification:** ParticipantSettings at /easyresearch/participant/:projectId/settings. On load: SELECT `research_project` WHERE id=projectId (maybeSingle) for project config. SELECT `enrollment` WHERE id = localStorage enrollment_{projectId} (maybeSingle) to get profile_data, enrollment_data, dnd_setting. On save: UPDATE `enrollment` SET profile_data (jsonb), enrollment_data (jsonb), dnd_setting (jsonb) WHERE id. DND setting structure: { periods: [{ start_time, end_time, days }] }. Also supports login/logout. There is NO separate `enrollment_question` table — enrollment-related questions are stored in `research_project`.`profile_question` (jsonb).

<!-- 🔒 CRC END -->

**What happens:** Participant configures their DND schedule and updates profile for a specific study.

---

## 2.4 Data & Analytics (Researcher Side)

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researchers view, analyze, and export participant response data for their survey projects.
>
> **Requirement:** Per-project response viewer, cross-project analytics dashboard, and CSV export. All data is scoped to the researcher's organization.
>
> **Clarification:** All data views are organization-scoped: SELECT `researcher` WHERE user_id to get organization_id, then all project queries filter by organization_id. Response data comes from `survey_respons` table joined with `survey_question` (for question text), `question_option` (for option labels), and `enrollment` (for participant_email). No server-side aggregation — all metric calculations happen client-side in JavaScript.

<!-- 🔒 CRC END -->

### F-2.4.1: View Responses

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher views all participant responses for a specific survey project, grouped by participant.
>
> **Requirement:** Show responses table grouped by enrollment. Display question text, answer, participant email, and submission time. Support filtering and CSV export.
>
> **Clarification:** SurveyResponses component at /easyresearch/project/:projectId/responses. SELECT `research_project` WHERE id=projectId (maybeSingle) for project metadata. SELECT `survey_question` WHERE project_id, ORDER BY order_index, with joined `question_option` rows to get question text and option labels. SELECT `survey_respons` WHERE project_id, columns: id, enrollment_id, question_id, response_text, response_value, created_at, instance_id. Collects unique enrollment_ids from responses, then SELECT `enrollment` WHERE id IN (those ids), columns: id, participant_email. Groups responses by enrollment_id for display. Each row shows question text (from survey_question join), response_text (human-readable answer), and participant_email (from enrollment join). ResponsesPage at /easyresearch/responses shows an aggregate view across all projects for the researcher's organization.

<!-- 🔒 CRC END -->

**What happens:** Researcher sees participant answers.

**Data Loaded:**
| Table | Operation | Joined Data |
|-------|-----------|-------------|
| `survey_respons` | SELECT | All responses for this project |
| `enrollment` | SELECT | Participant info |
| `survey_question` | SELECT | Question text |

---

### F-2.4.2: Analytics Dashboard

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher views aggregated statistics and charts for their survey projects.
>
> **Requirement:** Show total responses, completion rate, responses over time, and per-question breakdowns. Allow selecting which project to analyze.
>
> **Clarification:** AnalyticsPage component at /easyresearch/analytics. SELECT `researchers` WHERE user_id (maybeSingle) to get organization_id. SELECT `research_project` WHERE organization_id to list all projects for the dropdown selector. For selected project: SELECT `survey_respons` WHERE project_id to get all response data. SELECT `enrollment` WHERE project_id, columns: id, status, created_at to calculate enrollment stats. SELECT `survey_question` WHERE project_id with joined `question_option` for question labels. Metrics computed client-side: Total responses = COUNT of survey_respons rows. Completion rate = enrollments with status='completed' / total enrollments * 100. Responses by day = GROUP BY date(survey_respons.created_at). Per-question breakdown = GROUP BY question_id with value counts.

<!-- 🔒 CRC END -->

**What happens:** Researcher sees aggregated stats.

**Calculations:**
| Metric | How It's Calculated |
|--------|---------------------|
| Total Responses | COUNT(*) FROM `survey_respons` WHERE `project_id` |
| Completion Rate | (completed enrollments / total enrollments) × 100 |
| Responses by Day | GROUP BY date(created_at) |
| Question Breakdown | GROUP BY `question_id` |

---

### F-2.4.3: Export Data

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Researcher downloads survey response data as a CSV file.
>
> **Requirement:** Generate CSV with question text as column headers and each participant's answers as rows. Include participant email and submission timestamp.
>
> **Clarification:** Export available from SurveyResponses and ResponsesPage components. Builds CSV by joining data already loaded in the view: `survey_question` (for column headers using question_text), `survey_respons` (for response_text values), `enrollment` (for participant_email). CSV columns: Question, Answer, Participant Email, Submitted At (from survey_respons.created_at). Creates a Blob with text/csv MIME type, generates a temporary download URL via URL.createObjectURL, and triggers browser download. No server-side export endpoint — all done client-side from already-fetched data.

<!-- 🔒 CRC END -->

**What happens:** Download responses as CSV.

**Data Flow:**
1. SELECT all from `survey_respons` JOIN `enrollment` JOIN `survey_question`
2. Format as CSV
3. Download file

---

## 2.5 AI Features & Additional Feature Documentation

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** AI features allow participants to get assistance refining their text answers. AI usage is gated by organization-level credits and feature flags.
>
> **Requirement:** AI must be enabled at both org level and project level (ai_enabled). Credits are tracked and enforced per organization.
>
> **Clarification:** AI enablement is two-tier: `organizations`.`setting` jsonb contains AI feature flags (org-wide access), `research_project`.`ai_enabled` (bool) controls per-project access. Both must be true for AI to be available. Credits tracked on `organizations` table via `ai_credit` (int, default 100) — a single balance column that is decremented on each successful AI call. There are NO separate `ai_credits_monthly`, `ai_credits_used`, or `ai_features_enabled` columns — those were hallucinated. Credit limits by plan: free=10, professional=500, team=2000, enterprise=10000.

<!-- 🔒 CRC END -->

### F-2.5.1: AI-Assisted Responses

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant can request AI assistance to help refine or elaborate on their text answer for a specific question.
>
> **Requirement:** Check org-level AI credits before calling. Deduct one credit on success. Fail gracefully if over limit or AI disabled.
>
> **Clarification:** AI service checks: SELECT `researcher` WHERE user_id (maybeSingle) to get organization_id. SELECT `organization` WHERE id=organization_id (maybeSingle) to read `plan` and `ai_credit` (int). AI feature access is determined from `organization`.`setting` jsonb and the org's plan. If AI is disabled or `ai_credit` <= 0: return error, do not call AI. On successful AI call: UPDATE `organization` SET ai_credit = ai_credit - 1 WHERE id. There are NO `ai_features_enabled`, `ai_credits_used`, or `ai_credits_monthly` columns — use `ai_credit` (single balance) and `setting` jsonb instead. Credit limits by plan: free=10, professional=500, team=2000, enterprise=10000. The AI response is shown as a suggestion — participant can accept, edit, or discard it. No data is written to survey_respons until participant explicitly submits.

<!-- 🔒 CRC END -->

**What happens:** Participant gets AI help refining their answer.

**Data Flow:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `organization` | SELECT | Check `plan`, `ai_credit`, `setting` (for AI feature flags) |
| `organization` | UPDATE | `ai_credit = ai_credit - 1` (after successful call) |

**Business Rules:**
- Check credits BEFORE calling AI
- Fail gracefully if over limit
- Different plans have different limits:
  - Free: 10 credits
  - Professional: 500 credits
  - Team: 2000 credits
  - Enterprise: 10000 credits

### F-2.5.2: Voice Input

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant can use voice recording to answer text questions. The audio is transcribed via an AI endpoint and the transcription is used as the response text.
>
> **Requirement:** Voice must be enabled at both org level (via `organization`.`setting` jsonb) and project level (`research_project`.`voice_enabled`). Both must be true. Voice processing costs 2 AI credits per call. The audio URL is stored on the response record.
>
> **Clarification:** processVoiceInput() in aiService.ts checks voice entitlements via getAIEntitlements(). If voiceInputEnabled is false, throws error. Converts audio Blob to base64 string. Calls callAIEndpoint() with endpoint 'voiceProcessing', payload { audio, question }, creditsRequired=2. On success, decrements `organizations`.`ai_credit` by 2. The transcription result is returned as text. The audio URL (if stored) goes into `survey_respons`.`response_audio_url`. Per-question voice is controlled by `survey_question`.`allow_voice` (bool).

<!-- 🔒 CRC END -->

**What happens:** Participant records voice answer, gets transcription back.

**Data Flow:**
| Table | Operation | What Changes |
|-------|-----------|--------------|
| `organization` | SELECT | Check `setting`, `ai_credit`, `plan` for voice entitlements |
| `organization` | UPDATE | `ai_credit = ai_credit - 2` (after successful call) |
| `survey_respons` | INSERT | `response_audio_url` stores recording URL, `response_text` stores transcription |

---

> **📌 Note:** The following features (F-2.5.3 through F-2.5.7) are NOT AI features. They are documented here as additional feature CRC sections that don't fit neatly into the earlier categories. Logically: F-2.5.3 belongs with Participant Flow (2.3), F-2.5.4 and F-2.5.5 belong with Survey Management (2.2), and F-2.5.6/F-2.5.7 belong with Participant Flow (2.3).
>
> **⚠️ F-2.5.6 (LongitudinalSurveyDashboard)** documents a component that is **NOT currently imported** anywhere in the app. It may be dead code or a planned feature. The active equivalent is ESMParticipantDashboard (F-2.3.9).

---

### F-2.5.3: View/Edit Completed Responses

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant views their previously submitted survey responses and can optionally edit them.
>
> **Requirement:** Show all questions with previously submitted answers pre-filled. Allow editing and re-saving responses. Support both one-time and longitudinal surveys.
>
> **Clarification:** CompletedSurveyView component. On load: uses instanceId param (which is actually an enrollment_id) to SELECT `survey_respons` WHERE enrollment_id = instanceId, LIMIT 1 to get project_id. Then SELECT `survey_question` WHERE project_id ORDER BY order_index. Then SELECT `survey_respons` WHERE enrollment_id = instanceId to get all responses. Questions and responses are matched by question_id. On edit: UPDATE `survey_respons` SET response_text, response_value, updated_at=NOW() WHERE id for each changed response. No new rows are created on edit — existing response rows are updated in place.

<!-- 🔒 CRC END -->

**What happens:** Participant reviews and optionally edits their submitted answers.

---

### F-2.5.4: Mobile Survey Editor

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Mobile-optimized version of the survey builder for researchers editing surveys on smaller screens.
>
> **Requirement:** Touch-friendly question editing, reordering, and option management. Same data operations as desktop SurveyBuilder but with mobile-adapted UI.
>
> **Clarification:** MobileSurveyEditor component at /easyresearch/mobile/edit/:projectId. Same DB operations as F-2.2.2 (Edit Survey): SELECT `research_project` WHERE id, SELECT `survey_question` WHERE project_id with joined `question_option`. All INSERT/UPDATE/DELETE operations on `survey_question` and `question_option` are identical to the desktop builder. No separate data model — purely a UI adaptation.

<!-- 🔒 CRC END -->

**What happens:** Researcher edits survey on mobile with same functionality as desktop.

---

### F-2.5.5: Survey Settings Panel

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Consolidated settings panel for a survey project covering sharing, consent, notifications, AI/voice toggles, longitudinal config, compensation, onboarding, and help.
>
> **Requirement:** Tabbed or sectioned UI for all project-level settings. Auto-save or explicit save. Settings are stored on the `research_project` record.
>
> **Clarification:** SurveySettings component embedded in SurveyBuilder project page. On load: SELECT `research_project` WHERE id=projectId to read all setting columns. Settings map to these columns: sharing (survey_code display), consent (consent_form jsonb), notifications (notification_enabled, notification_setting jsonb), AI (ai_enabled bool), voice (voice_enabled bool), longitudinal (study_duration, survey_frequency, sampling_strategy, timeline_config, allow_start_date_selection), compensation (compensation_amount, compensation_type), onboarding (onboarding_required, onboarding_instruction, profile_question), help (help_information), participant management (max_participant, participant_numbering, allow_participant_dnd). On save: UPDATE `research_project` SET changed columns WHERE id. Also includes QuestionnaireScheduler sub-component for longitudinal schedule config (uses `questionnaire` and `questionnaire_schedule` tables per F-2.2.8).

<!-- 🔒 CRC END -->

**What happens:** Researcher configures all project settings from one panel.

---

### F-2.5.6: Longitudinal Survey Dashboard (Participant)

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant's progress dashboard for a longitudinal study, showing daily entries, completion stats, and navigation to fill surveys.
>
> **Requirement:** Show current study day, total days, completion rate, streak counter. Display scrollable list of daily entries with status (completed/available/upcoming/missed). Allow adding manual entries.
>
> **Clarification:** LongitudinalSurveyDashboard component. On load: reads enrollmentId from localStorage key `enrollment_{projectId}`. SELECT `enrollment` WHERE id=enrollmentId to get enrollment data. SELECT `research_project` WHERE id=projectId for study_duration, survey_frequency, setting. SELECT `survey_respons` WHERE enrollment_id, SELECT id and created_at, ORDER BY created_at desc — used to determine which days have been completed. Timeline entries are computed client-side from study_duration and survey_frequency (same as F-2.3.9). AddEntryDialog component allows inserting a manual `survey_instance` row with status='scheduled' for the selected time. Clicking an entry navigates to /easyresearch/participant/{projectId}?instance={day}.

<!-- 🔒 CRC END -->

**What happens:** Participant views longitudinal study progress and accesses daily surveys.

---

### F-2.5.7: Add Manual Entry (Longitudinal)

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Participant or researcher manually adds a new survey entry/instance for a longitudinal study outside the automated schedule.
>
> **Requirement:** Dialog with time selection (current time or custom). Creates a new survey instance record.
>
> **Clarification:** AddEntryDialog component. On confirm: INSERT into `survey_instance` with project_id, enrollment_id, instance_number (next sequential), scheduled_time (selected time), status='scheduled', day_number (calculated from enrollment start). The new instance appears in the longitudinal timeline and can be filled like any scheduled instance.

<!-- 🔒 CRC END -->

**What happens:** New survey entry is manually added to a longitudinal study.

---

## 2.6 Public Pages

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Public-facing pages accessible without authentication. Marketing, pricing, and template browsing.
>
> **Requirement:** Landing page for marketing. Pricing page for plan comparison. Template library for browsing pre-built surveys.
>
> **Clarification:** All public pages are static/read-only with no database writes (except template creation which requires auth). Routes: /easyresearch (LandingPage), /easyresearch/pricing (PricingPage), /easyresearch/templates (TemplateLibrary).

<!-- 🔒 CRC END -->

### F-2.6.1: Landing Page

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Marketing landing page showcasing features, question types, and use cases.
>
> **Requirement:** Hero section, feature grid, question type list, CTA buttons to auth/pricing. Responsive.
>
> **Clarification:** LandingPage at /easyresearch. Purely static — no database queries. Links to /easyresearch/auth (sign up), /easyresearch/pricing, /easyresearch/templates. Question types listed: Multiple Choice, Single Choice, Short Text, Long Text, Number Input, Date/Time, Dropdown, Rating Scale, Slider, Likert Scale. No DB operations.

<!-- 🔒 CRC END -->

**What happens:** Visitor sees marketing content and navigates to sign up or browse.

---

### F-2.6.2: Pricing Page

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Displays available subscription plans with feature comparison and CTA buttons.
>
> **Requirement:** Show Free, Professional, Team, Enterprise plans with monthly/annual toggle. Free plan goes to auth. Enterprise sends email. Paid plans redirect to Stripe checkout.
>
> **Clarification:** PricingPage at /easyresearch/pricing. No database reads for plan data — plans are hardcoded in component. Free plan: navigate to /easyresearch/auth or /easyresearch/dashboard if logged in. Enterprise: mailto:sales@easierresearch.com. Paid plans: if not logged in, save intended plan to localStorage key 'intended_plan' and redirect to auth. If logged in, would redirect to Stripe checkout (not yet implemented). Plan names match `organizations`.plan column values: 'free', 'professional', 'team', 'enterprise'.

<!-- 🔒 CRC END -->

**What happens:** Visitor compares plans and selects one to proceed.

---

### F-2.6.3: Template Library

<!-- 🔒 CRC START – AI edits require EXPLICIT approval. Code changes MUST read this first. Report mismatches immediately. -->

> **⚠️ CRC Section** *AI edits require explicit approval.*
>
> **Concept:** Browse pre-built survey templates and create a new project from a template.
>
> **Requirement:** Grid of templates by category (Academic, Healthcare, UX, Market Research, HR, Customer Feedback). Search and filter. Preview template questions. One-click create from template.
>
> **Clarification:** TemplateLibrary at /easyresearch/templates. Templates are hardcoded in the component (not stored in DB). Categories: academic, healthcare, ux, market, hr, customer. Each template has: id, name, description, category, questionCount, estimatedTime, tags, preview questions. Creating from template calls createSurveyFromTemplate() service which: SELECT `researchers` WHERE user_id, then INSERT `research_project` with template data, then INSERT `survey_question` rows with template questions and INSERT `question_option` rows. Requires authentication to create.

<!-- 🔒 CRC END -->

**What happens:** User browses templates, previews them, and creates a survey from a template.

---

# 3. Route Mapping

## 3.1 Public Routes (No Auth Required)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/easyresearch` | `LandingPage` | Marketing landing page |
| `/easyresearch/landing` | (redirect) | Redirects to `/easyresearch` |
| `/easyresearch/auth` | `EasyResearchAuth` | Sign in / Sign up |
| `/easyresearch/pricing` | `PricingPage` | Pricing plans |
| `/easyresearch/templates` | `TemplateLibrary` | Browse survey templates |

---

## 3.2 Researcher Routes (Auth Required)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/easyresearch/dashboard` | `ResearcherDashboard` | Main dashboard, list all surveys |
| `/easyresearch/create` | `ResearcherDashboard` | Alias — same as dashboard |
| `/easyresearch/dashboard?create=true` | `ResearcherDashboard` | Dashboard with create dialog open |
| `/easyresearch/create-survey` | `SurveyBuilder` | Create new survey (legacy) |
| `/easyresearch/project/:projectId` | `SurveyBuilder` | Edit existing survey |
| `/easyresearch/project/:projectId/responses` | `SurveyResponses` | View responses for one survey |
| `/easyresearch/responses` | `ResponsesPage` | View all responses |
| `/easyresearch/analytics` | `AnalyticsDashboard` | Analytics dashboard (imported as AnalyticsPage in App.tsx) |
| `/easyresearch/participants` | `ParticipantsPage` | Manage participants |
| `/easyresearch/settings` | `ResearcherSettings` | Account settings |
| `/easyresearch/mobile/edit/:projectId` | `MobileSurveyEditor` | Mobile-optimized editor |

---

## 3.3 Participant Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/easyresearch/home` | `ParticipantHome` | Participant's home (list enrolled surveys) |
| `/easyresearch/participant/home` | (redirect) | Redirects to `/easyresearch/home` |
| `/easyresearch/participant/join` | `ParticipantJoin` | Join via code |
| `/easyresearch/participant/:projectId` | `SurveyViewRouter` | Main entry - routes to correct view |
| `/easyresearch/participant/:projectId/dashboard` | `ESMParticipantDashboard` | Longitudinal study dashboard |
| `/easyresearch/participant/:projectId/timeline` | `ESMParticipantDashboard` | Timeline view (alias) |
| `/easyresearch/participant/:projectId/settings` | `ParticipantSettings` | Notification settings |
| `/easyresearch/survey/:projectId/complete` | (inline) | Thank you page |
| `/easyresearch/user/settings` | `UserSettings` | User account settings |

---

## 3.4 Route Decision Logic

### `SurveyViewRouter` - The Smart Router

When participant hits `/easyresearch/participant/:projectId`, this component decides where to go:

```
Load project
    │
    ▼
project.project_type === 'longitudinal'?
    │
    ├── YES: Has instanceId in URL?
    │         ├── YES → ParticipantSurveyView (fill specific instance)
    │         └── NO → LongitudinalSurveyView (show timeline)
    │
    └── NO (it's 'survey'): → OneTimeSurveyView (single questionnaire)
```

---

## 3.5 URL Parameters Reference

| Parameter | Used In | Purpose |
|-----------|---------|---------|
| `:projectId` | Most routes | UUID of the survey |
| `?create=true` | Dashboard | Auto-open create dialog |
| `?instance=:id` | Participant view | Specific survey instance |
| `?redirect=researcher` | Auth | Redirect after login |
| `?redirectTo=:path` | Auth | Custom redirect path |

---

# Quick Reference Card

## Status Values
| Table | Column | Possible Values |
|-------|--------|-----------------|
| `research_project` | `status` | `draft`, `published`, `active`, `completed`, `paused` |
| `enrollment` | `status` | `invited`, `active`, `completed`, `withdrawn` |
| `survey_instance` | `status` | `scheduled`, `in_progress`, `completed`, `missed`, `late` |

## Project Types
| `methodology_type` | `project_type` | Survey Pattern |
|-------------------|----------------|----------------|
| `single_survey` | `survey` | Once |
| `esm` | `longitudinal` | Multiple per day |
| `ema` | `longitudinal` | Multiple per day (clinical) |
| `daily_diary` | `longitudinal` | Once per day |
| `longitudinal` | `longitudinal` | Periodic waves |

## Delete Order (Foreign Key Safe)
```
1. SELECT survey_question.id WHERE project_id
2. question_option (WHERE question_id IN collected)
3. survey_respons (WHERE project_id)
4. survey_question (WHERE project_id)
5. survey_instance (WHERE project_id)
6. enrollment (WHERE project_id)
7. research_project (WHERE id)
```

---

## Orphaned Component Files

The following component files exist in `src/easyresearch/components/` but are **NOT imported anywhere** in the application. They may be dead code, legacy components, or planned features:

| File | DB Calls | Notes |
|------|----------|-------|
| `DesktopHome.tsx` | 4 | Queries enrollment + research_project. May have been a desktop-specific ParticipantHome variant. |
| `ResearcherAuth.tsx` | 2 | Inserts organization + researcher. Superseded by EasyResearchAuth.tsx. |
| `AnalyticsPage.tsx` | 8 | Full analytics page. Superseded by AnalyticsDashboard.tsx (which is the one used at /easyresearch/analytics). |
| `LongitudinalSurveyDashboard.tsx` | 3 | Documented in F-2.5.6 CRC. Superseded by ESMParticipantDashboard (F-2.3.9). |
| `EasierResearchLayout.tsx` | 0 | Layout component, never used. |

---

*End of PRD Document*
