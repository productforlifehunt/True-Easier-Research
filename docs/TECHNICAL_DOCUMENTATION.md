# A Week in the Life of Dementia Caregivers

## Technical Documentation & Data Dictionary

Version: 1.0  
Last Updated: November 2025

---

# QUICK REFERENCE

Platform               | URL              | Auth Required
-----------------------|------------------|---------------------------
Dementia Survey        | `/`              | Public (actions need auth)
EasyResearch           | `/easyresearch`  | Yes
Preview Port           | `4005`           | -

---

# PART 1: DEMENTIA CAREGIVER SURVEY PLATFORM

---

## 1.1 Page & Route Map

Route                        | Page Component            | Purpose                        | Auth Required
-----------------------------|---------------------------|--------------------------------|---------------
`/`                          | Homepage                  | Landing page with study info   | Public
`/home`                      | Homepage                  | Same as above                  | Public
`/survey`                    | Timeline                  | View submitted entries         | Public view, auth for edit
`/timeline`                  | Timeline                  | Same as above                  | Public view, auth for edit
`/dementia-caregiver-survey` | DementiaCaregiverSurvey   | Daily activity logging         | Auth for actions
`/add-entry`                 | AddEntry                  | Add new survey entry           | Auth required
`/summary`                   | Summary                   | Analytics & insights           | Auth required
`/about`                     | About                     | Study information              | Public
`/how-to`                    | HowTo                     | Registration guide + AI chat   | Public
`/contact`                   | Contact                   | Contact form                   | Public
`/join-survey`               | JoinSurvey                | Registration form              | Public
`/settings`                  | Settings                  | User profile & preferences     | Auth required

---

## 1.2 Homepage (`/`)

### What This Page Shows

- **Hero Section**: Title "A Week in the Life of Dementia Caregivers" + green "Start Survey" button
- **About This Study Card**: Research overview text
- **How It Works Card**: 3-step process (Register → Daily Log → Complete)
- **Features Card**: Voice input, AI assistance, data visualization icons

### Data Used

- None (all static content)

### Buttons & Actions

Button              | Where It Goes        | Auth Needed
--------------------|----------------------|-------------
Start Survey        | `/timeline`          | No
Sign In / Sign Up   | Opens AuthModal      | -

---

## 1.3 Timeline Page (`/survey`, `/timeline`)

### What This Page Shows

- **Entry Cards**: List of all submitted survey entries, newest first
- **Each Card Shows**: Date, activity type badge, description preview, emotional impact tag

### Data Source

```
TABLE: care_connector.survey_entries
FILTER: WHERE user_id = [current logged-in user's ID]
ORDER: ORDER BY entry_timestamp DESC
```

### Actions

Action         | Auth Needed | Database Operation
---------------|-------------|-----------------------------------------------
View Entry     | No          | SELECT from `survey_entries`
Edit Entry     | Yes         | Opens edit form, then UPDATE `survey_entries`
Delete Entry   | Yes         | DELETE from `survey_entries`

---

## 1.4 Add Entry / Daily Survey (`/add-entry`, `/dementia-caregiver-survey`)

### Form Structure

This form has 4 tabs. Each field below shows the exact database location.

---

#### TAB 1: Activity

UI Field Label          | Database Location                          | Data Type     | Required
------------------------|--------------------------------------------|--------------|---------
Activity Type           | `survey_entries.entry_type`                | varchar      | YES
Description             | `survey_entries.description`               | text         | YES
Difficulties            | `survey_entries.difficulties_challenges`   | text         | No
Desired Companion       | `survey_entries.person_want_to_do_with`    | varchar      | No
Struggles               | `survey_entries.struggles_encountered`     | text         | No

---

#### TAB 2: Resources

UI Field Label          | Database Location                          | Data Type     | Required
------------------------|--------------------------------------------|--------------|---------
Tools Currently Using   | `survey_entries.tools_using`               | text         | No
Tools Wanted            | `survey_entries.tools_wanted`              | text         | No
People Helping          | `survey_entries.people_with`               | text         | No
People Wanted           | `survey_entries.people_want_with`          | text         | No

---

#### TAB 3: Challenges

UI Field Label          | Database Location                               | Data Type | Required
------------------------|-------------------------------------------------|-----------|----------
Communication Issues    | `survey_entries.communication_challenges`       | text      | No
Collaboration Issues    | `survey_entries.collaboration_challenges`       | text      | No
Cooperation Issues      | `survey_entries.cooperation_challenges`         | text      | No
Help Access Issues      | `survey_entries.help_reaching_challenges`       | text      | No
Knowledge Gaps          | `survey_entries.knowledge_gaps`                 | text      | No
Liability Concerns      | `survey_entries.liability_concerns`             | text      | No

---

#### TAB 4: Impact

UI Field Label          | Database Location                          | Data Type     | Required
------------------------|--------------------------------------------|--------------|---------
Time Spent (minutes)    | `survey_entries.time_spent`                | integer      | No
Emotional Impact        | `survey_entries.emotional_impact`          | varchar      | No
Urgency Level           | `survey_entries.urgency_level`             | varchar      | No
Support Needed          | `survey_entries.support_needed`            | text         | No

---

#### Valid Values for `survey_entries.entry_type`

Value              | Meaning
-------------------|------------------------------------------
`care_activity`    | General caregiving activities
`medical`          | Medical appointments, medications
`personal_care`    | Bathing, dressing, feeding
`emotional_support`| Companionship, conversation
`household`        | Cooking, cleaning, errands
`coordination`     | Scheduling, communication with providers

---

#### Valid Values for `survey_entries.urgency_level`

Value    | Meaning
---------|-------------------
`low`    | Not urgent
`medium` | Somewhat urgent
`high`   | Very urgent

---

#### AI Features on This Page

Feature      | Button Icon     | What It Does
-------------|-----------------|---------------------------------------------
Voice Input  | Microphone 🎤   | Speech-to-text via Web Speech API
AI Enhance   | Sparkles ✨     | Sends text to backend, returns improved version

---

## 1.5 Settings Page (`/settings`)

### Section 1: Survey Progress Card

What It Shows                  | Data Source
-------------------------------|-----------------------------------------------
"Day X of 7" progress circle   | Calculated from `enrollments.study_start_date`
Start Date                     | `enrollments.study_start_date`
Current Day                    | Today minus `enrollments.study_start_date`
Completion Status              | "Survey complete!" if day 7 reached

---

### Section 2: Personal Information Card

UI Field Label              | Database Location                     | Editable?
----------------------------|---------------------------------------|-------------
Full Name                   | `profiles.full_name`                  | Yes
Introduction                | `profiles.introduction`               | Yes
Relationship to Patient     | `profiles.relationship_to_patient`    | Yes
Participant Number          | `profiles.participant_number`         | Display only (system-assigned)
Primary Caregiver Toggle    | `profiles.is_primary_caregiver`       | Yes

---

### Section 3: Primary Caregiver Demographics

**Note**: This section ONLY appears when `profiles.is_primary_caregiver` = true

UI Field Label    | Database Location                  | Valid Values
------------------|------------------------------------|-----------------------------------------
Your Age          | `profiles.caregiver_age`           | Any integer
Your Gender       | `profiles.caregiver_gender`        | `male`, `female`, `other`, `prefer_not_to_say`
Your Education    | `profiles.caregiver_education`     | `elementary`, `middle_school`, `high_school`, `associate`, `bachelor`, `master`, `doctorate`

---

### Section 4: Interview Agreement Toggle

UI Element                  | Database Location                   | Data Type
----------------------------|-------------------------------------|----------
"Agree to Interview" toggle | `enrollments.interview_agreement`   | boolean

---

### Section 5: Interview Scheduling (Only shows when Interview Agreement = ON)

**Condition**: This section ONLY appears when `enrollments.interview_agreement` = true

UI Element                  | Database Location                          | Data Type       | Notes
----------------------------|--------------------------------------------|-----------------|---------------------------------
Interview URL               | `profiles.interview_url`                   | text            | Display only, set by researcher
Interview Start Time        | `profiles.interview_datetime_start`        | timestamptz     | Date + Start time
Interview End Time          | `profiles.interview_datetime_end`          | timestamptz     | End time (same day)
Accept Button               | Updates `profiles.interview_accepted`      | -               | Sets to true + timestamp
Not Accept Button           | Updates `profiles.interview_accepted`      | -               | Sets to false
Accepted Status Display     | `profiles.interview_accepted`              | boolean         | Shows "Accepted" badge
Accepted Timestamp          | `profiles.interview_accepted_at`           | timestamptz     | When user clicked Accept

**Note**: If no interview is scheduled yet, shows message "Interview time not yet scheduled. The researcher will contact you soon."

---

### Section 6: Interview Content (3-Tab Structure)

**Condition**: This section ONLY appears when `enrollments.interview_agreement` = true

#### Tab Navigation

Tab Name    | Content
------------|----------------------------------------------------
Questions   | Shows interview questions based on caregiver type
Graphs      | Ecogram and network visualizations (placeholder)
Resources   | Support resources and links (placeholder)

---

#### PRIMARY CAREGIVER Interview Questions (16 total)

**Condition**: Shows when `profiles.is_primary_caregiver` = true

Database columns for answers: `profiles.interview_pc_q1` through `profiles.interview_pc_q16`

Question # | Column                        | Question Text
-----------|-------------------------------|--------------------------------------------------
Q1         | `profiles.interview_pc_q1`    | What are your social support needs?
Q2         | `profiles.interview_pc_q2`    | Do you know where to find social support?
Q3         | `profiles.interview_pc_q3`    | Looking at your own network (ecogram), how does your network provide support?
Q4         | `profiles.interview_pc_q4`    | What does this support mean to you?
Q5         | `profiles.interview_pc_q5`    | Do you receive most support from people close or at a distance?
Q6         | `profiles.interview_pc_q6`    | Are there people close to you? (e.g., such that you could call them)
Q7         | `profiles.interview_pc_q7`    | When/under which circumstances are you able to ask for support?
Q8         | `profiles.interview_pc_q8`    | Do you experience difficulties to ask for support? (why, when)
Q9         | `profiles.interview_pc_q9`    | What circumstances could change your request for support?
Q10        | `profiles.interview_pc_q10`   | Do you want to give something in return for the support you receive?
Q11        | `profiles.interview_pc_q11`   | How is the interaction with people in your social network going?
Q12        | `profiles.interview_pc_q12`   | Do you experience difficulties in social interactions with others?
Q13        | `profiles.interview_pc_q13`   | Did the contact with your spouse change?
Q14        | `profiles.interview_pc_q14`   | Did your social network change? (pointing at the ecogram)
Q15        | `profiles.interview_pc_q15`   | How would your "dream network" look like? (how could this be reached?)
Q16        | `profiles.interview_pc_q16`   | Network satisfaction score 0-100

---

#### OTHER CAREGIVER / Network Member Interview Questions (12 total)

**Condition**: Shows when `profiles.is_primary_caregiver` = false

Database columns for answers: `profiles.interview_oc_q1` through `profiles.interview_oc_q12`

Question # | Column                        | Question Text
-----------|-------------------------------|--------------------------------------------------
Q1         | `profiles.interview_oc_q1`    | How do you provide support to your family member, friend, or neighbour caring for a person with dementia?
Q2         | `profiles.interview_oc_q2`    | How do you experience providing this support?
Q3         | `profiles.interview_oc_q3`    | How much time do you spend caring approximately?
Q4         | `profiles.interview_oc_q4`    | Is the support you deliver accepted, wished?
Q5         | `profiles.interview_oc_q5`    | Do you experience difficulties offering support? (why, when)
Q6         | `profiles.interview_oc_q6`    | Would you like to offer more or less support than you currently provide? (why, how)
Q7         | `profiles.interview_oc_q7`    | When should support be offered?
Q8         | `profiles.interview_oc_q8`    | When the situation is changing, are you willing to change the amount of support you provide?
Q9         | `profiles.interview_oc_q9`    | How is the interaction with your family member, friend or acquaintance going?
Q10        | `profiles.interview_oc_q10`   | Would you prefer to keep in contact with other network members?
Q11        | `profiles.interview_oc_q11`   | Do you expect something in return for the support you offer?
Q12        | `profiles.interview_oc_q12`   | How could support be organised better?

---

### Section 7: Notification Settings

UI Element                   | Database Location                             | Data Type
-----------------------------|-----------------------------------------------|----------
Hourly Reminders toggle      | `profiles.hourly_reminders_enabled`           | boolean
Permission Status display    | `profiles.notification_permission_status`     | varchar (`default`, `granted`, `denied`)

---

### Section 8: Do Not Disturb Periods

Each DND period is a row in the `dnd_periods` table.

Field           | Database Location           | Data Type
----------------|-----------------------------|-----------
Period ID       | `dnd_periods.id`            | bigint (auto)
User            | `dnd_periods.user_id`       | uuid → links to `profiles.id`
Start Time      | `dnd_periods.start_time`    | time (e.g., "22:00")
End Time        | `dnd_periods.end_time`      | time (e.g., "08:00")
Label           | `dnd_periods.label`         | varchar (optional, e.g., "Sleep time")
Active?         | `dnd_periods.is_active`     | boolean

**Foreign Key**: `dnd_periods.user_id` → `profiles.id`

---

## 1.6 Global Components

### Components That Appear on All Pages

Component      | File Location                    | When It Shows
---------------|----------------------------------|-----------------------------------
DesktopHeader  | `components/DesktopHeader.tsx`   | Always (desktop viewport)
MobileHeader   | `components/MobileHeader.tsx`    | Always (mobile viewport)
BottomNav      | `components/BottomNav.tsx`       | Only Dementia Survey pages, only when logged in
Toaster        | react-hot-toast                  | Always (shows toast notifications)
AuthModal      | `components/AuthModal.tsx`       | On-demand when auth required

---

### BottomNav Tabs (Only Shows When User Logged In)

Tab       | Icon      | Route          | Purpose
----------|-----------|----------------|-------------------
Home      | 🏠        | `/`            | Go to homepage
Survey    | 📄        | `/timeline`    | View entries
Add (+)   | ➕        | `/add-entry`   | Add new entry
Summary   | 📊        | `/summary`     | View analytics
Settings  | ⚙️        | `/settings`    | User settings

**Important**: BottomNav has `if (!user) return null` — it won't render for logged-out users.

---

# PART 2: DATABASE SCHEMA (DEMENTIA SURVEY)

---

## 2.1 TABLE: `profiles`

**Purpose**: Stores all user information including demographics and preferences.

**Schema**: `care_connector`

**Primary Key**: `profiles.id` (uuid) — same as Supabase Auth user ID

---

### Core Identity Columns

Column Name           | Data Type    | Purpose
----------------------|--------------|------------------------------------------
`profiles.id`         | uuid         | User ID from Supabase Auth (PRIMARY KEY)
`profiles.full_name`  | text         | Display name
`profiles.email`      | text         | Email address (unique)
`profiles.phone`      | text         | Phone number
`profiles.avatar_url` | text         | Profile picture URL

---

### Caregiver-Specific Columns

Column Name                          | Data Type | Purpose
-------------------------------------|-----------|------------------------------------------
`profiles.introduction`              | text      | Self-introduction / bio
`profiles.relationship_to_patient`   | text      | e.g., "son", "spouse", "daughter"
`profiles.is_primary_caregiver`      | boolean   | Is this user the main caregiver?
`profiles.caregiver_role`            | varchar   | "primary" or "other"
`profiles.participant_number`        | text      | Study participant ID (e.g., "P002")
`profiles.caregiver_age`             | integer   | Age (only if primary caregiver)
`profiles.caregiver_gender`          | text      | Gender (only if primary caregiver)
`profiles.caregiver_education`       | text      | Education level (only if primary caregiver)

---

### Notification Preference Columns

Column Name                                  | Data Type | Purpose
---------------------------------------------|-----------|------------------------------
`profiles.hourly_reminders_enabled`          | boolean   | Hourly notification toggle
`profiles.notification_permission_status`    | varchar   | "default", "granted", or "denied"
`profiles.push_notifications`                | boolean   | Push notification master toggle
`profiles.email_notifications`               | boolean   | Email notification master toggle

---

### Interview Scheduling Columns

Column Name                              | Data Type   | Purpose
-----------------------------------------|-------------|-------------------------------------------
`profiles.interview_url`                 | text        | Video call URL set by researcher
`profiles.interview_datetime_start`      | timestamptz | Interview start date/time
`profiles.interview_datetime_end`        | timestamptz | Interview end time
`profiles.interview_accepted`            | boolean     | Participant accepted the interview time
`profiles.interview_accepted_at`         | timestamptz | When participant clicked Accept

---

### Interview Answer Columns - Primary Caregiver (16 questions)

**Note**: These store researcher-recorded answers during the interview.

Column Name                    | Data Type | Question Summary
-------------------------------|-----------|------------------------------------------
`profiles.interview_pc_q1`     | text      | Social support needs
`profiles.interview_pc_q2`     | text      | Where to find social support
`profiles.interview_pc_q3`     | text      | How network provides support
`profiles.interview_pc_q4`     | text      | What support means to you
`profiles.interview_pc_q5`     | text      | Support from close vs distance
`profiles.interview_pc_q6`     | text      | People close to you
`profiles.interview_pc_q7`     | text      | When able to ask for support
`profiles.interview_pc_q8`     | text      | Difficulties asking for support
`profiles.interview_pc_q9`     | text      | Circumstances to change request
`profiles.interview_pc_q10`    | text      | Give something in return
`profiles.interview_pc_q11`    | text      | Interaction with social network
`profiles.interview_pc_q12`    | text      | Difficulties in social interactions
`profiles.interview_pc_q13`    | text      | Contact with spouse change
`profiles.interview_pc_q14`    | text      | Social network change
`profiles.interview_pc_q15`    | text      | Dream network
`profiles.interview_pc_q16`    | text      | Network satisfaction 0-100

---

### Interview Answer Columns - Other Caregiver / Network Member (12 questions)

Column Name                    | Data Type | Question Summary
-------------------------------|-----------|------------------------------------------
`profiles.interview_oc_q1`     | text      | How provide support
`profiles.interview_oc_q2`     | text      | Experience providing support
`profiles.interview_oc_q3`     | text      | Time spent caring
`profiles.interview_oc_q4`     | text      | Support accepted/wished
`profiles.interview_oc_q5`     | text      | Difficulties offering support
`profiles.interview_oc_q6`     | text      | More or less support
`profiles.interview_oc_q7`     | text      | When support should be offered
`profiles.interview_oc_q8`     | text      | Willing to change support amount
`profiles.interview_oc_q9`     | text      | Interaction with family member
`profiles.interview_oc_q10`    | text      | Keep contact with network
`profiles.interview_oc_q11`    | text      | Expect something in return
`profiles.interview_oc_q12`    | text      | How organize support better

---

### System Columns

Column Name                  | Data Type     | Purpose
-----------------------------|---------------|---------------------------
`profiles.created_at`        | timestamptz   | Account creation date
`profiles.updated_at`        | timestamptz   | Last profile update
`profiles.preferred_language`| varchar       | "en" or "zh"

---

## 2.2 TABLE: `survey_entries`

**Purpose**: Stores each daily caregiving activity entry submitted by users.

**Schema**: `care_connector`

**Primary Key**: `survey_entries.id` (integer, auto-increment)

**Foreign Key**: `survey_entries.user_id` → `profiles.id`

---

### Required Columns

Column Name                       | Data Type     | Purpose
----------------------------------|---------------|----------------------------------
`survey_entries.id`               | integer       | Entry ID (PRIMARY KEY, auto)
`survey_entries.user_id`          | uuid          | Who submitted this → links to `profiles.id`
`survey_entries.entry_type`       | varchar       | Activity category (see valid values above)
`survey_entries.description`      | text          | What happened
`survey_entries.entry_timestamp`  | timestamptz   | When activity occurred

---

### Challenge Columns

Column Name                                  | Data Type | Purpose
---------------------------------------------|-----------|--------------------------------
`survey_entries.difficulties_challenges`     | text      | General difficulties faced
`survey_entries.struggles_encountered`       | text      | Specific struggles
`survey_entries.communication_challenges`    | text      | Communication issues
`survey_entries.collaboration_challenges`    | text      | Working with others issues
`survey_entries.cooperation_challenges`      | text      | Getting cooperation issues
`survey_entries.help_reaching_challenges`    | text      | Accessing help issues
`survey_entries.knowledge_gaps`              | text      | What they don't know
`survey_entries.liability_concerns`          | text      | Legal/safety worries

---

### Resource Columns

Column Name                              | Data Type | Purpose
-----------------------------------------|-----------|------------------------
`survey_entries.tools_using`             | text      | Current tools/tech
`survey_entries.tools_wanted`            | text      | Desired tools/tech
`survey_entries.people_with`             | text      | Current helpers
`survey_entries.people_want_with`        | text      | Desired helpers
`survey_entries.person_want_to_do_with`  | varchar   | Desired companion

---

### Impact Columns

Column Name                        | Data Type | Purpose
-----------------------------------|-----------|---------------------------
`survey_entries.time_spent`        | integer   | Minutes spent on activity
`survey_entries.emotional_impact`  | varchar   | How it made them feel
`survey_entries.urgency_level`     | varchar   | "low", "medium", "high"
`survey_entries.support_needed`    | text      | What support would help

---

## 2.3 TABLE: `enrollments`

**Purpose**: Tracks participant enrollment status and 7-day study timeline.

**Schema**: `care_connector`

**Primary Key**: `enrollments.id` (uuid)

**Foreign Key**: `enrollments.participant_id` → `profiles.id`

---

### Columns

Column Name                          | Data Type   | Purpose
-------------------------------------|-------------|------------------------------------------
`enrollments.id`                     | uuid        | Enrollment ID (PRIMARY KEY)
`enrollments.project_id`             | uuid        | Research project ID
`enrollments.participant_id`         | uuid        | User ID → links to `profiles.id`
`enrollments.status`                 | text        | "invited", "active", "completed", "withdrawn"
`enrollments.study_start_date`       | date        | When their 7-day study begins
`enrollments.interview_agreement`    | boolean     | Agreed to post-study interview?
`enrollments.consent_signed_at`      | timestamp   | When consent was given
`enrollments.completion_rate`        | numeric     | Percentage of entries completed
`enrollments.participant_number`     | varchar     | Assigned participant ID (e.g., "P002")
`enrollments.created_at`             | timestamp   | Enrollment creation date

---

## 2.4 TABLE: `dnd_periods`

**Purpose**: Defines quiet hours when notifications should not be sent.

**Schema**: `care_connector`

**Primary Key**: `dnd_periods.id` (bigint, auto-increment)

**Foreign Key**: `dnd_periods.user_id` → `profiles.id`

---

### Columns

Column Name              | Data Type   | Purpose
-------------------------|-------------|--------------------------------------
`dnd_periods.id`         | bigint      | Period ID (PRIMARY KEY, auto)
`dnd_periods.user_id`    | uuid        | Who set this → links to `profiles.id`
`dnd_periods.start_time` | time        | Quiet hours start (e.g., "22:00")
`dnd_periods.end_time`   | time        | Quiet hours end (e.g., "08:00")
`dnd_periods.label`      | varchar     | Optional name (e.g., "Sleep time")
`dnd_periods.is_active`  | boolean     | Is this period enabled?
`dnd_periods.created_at` | timestamptz | When created

---

## 2.5 TABLE: `survey_enrollments`

**Purpose**: Simpler enrollment tracking for the 7-day survey period.

**Schema**: `care_connector`

**Primary Key**: `survey_enrollments.id` (bigint, auto-increment)

**Foreign Key**: `survey_enrollments.user_id` → `profiles.id`

---

### Columns

Column Name                         | Data Type   | Purpose
------------------------------------|-------------|----------------------------------
`survey_enrollments.id`             | bigint      | ID (PRIMARY KEY, auto)
`survey_enrollments.user_id`        | uuid        | Participant → links to `profiles.id`
`survey_enrollments.enrollment_date`| date        | When they enrolled
`survey_enrollments.start_date`     | date        | Study start date
`survey_enrollments.end_date`       | date        | Study end date (start + 7 days)
`survey_enrollments.status`         | text        | "active", "completed", "withdrawn"

---

# PART 3: EASYRESEARCH PLATFORM

---

## 3.1 Route Map

Route                                          | Component               | Purpose
-----------------------------------------------|-------------------------|---------------------------
`/easyresearch`                                | ParticipantHome         | Participant dashboard
`/easyresearch/landing`                        | LandingPage             | Marketing page
`/easyresearch/auth`                           | EasyResearchAuth        | Login/signup
`/easyresearch/dashboard`                      | ResearcherDashboard     | Researcher project list
`/easyresearch/project/:projectId`             | SurveyBuilder           | Build/edit surveys
`/easyresearch/analytics`                      | AnalyticsPage           | Response analytics
`/easyresearch/settings`                       | ResearcherSettings      | Researcher settings
`/easyresearch/participant/:projectId`         | ParticipantSurveyView   | Take survey
`/easyresearch/participant/:projectId/dashboard`| ESMParticipantDashboard| ESM schedule view
`/easyresearch/participant/:projectId/settings`| ParticipantSettings     | Participant settings

---

## 3.2 Key Tables

### TABLE: `survey_templates`

Column Name                    | Data Type | Purpose
-------------------------------|-----------|----------------------------------
`survey_templates.id`          | uuid      | Project ID (PRIMARY KEY)
`survey_templates.owner_id`    | uuid      | Researcher who created it
`survey_templates.title`       | text      | Project name
`survey_templates.description` | text      | Project description
`survey_templates.questions`   | jsonb     | Survey questions structure
`survey_templates.is_esm`      | boolean   | Is Experience Sampling Method?
`survey_templates.esm_config`  | jsonb     | ESM schedule configuration
`survey_templates.status`      | text      | "draft", "active", "paused", "completed"

---

### TABLE: `survey_responses`

Column Name                       | Data Type | Purpose
----------------------------------|-----------|----------------------------------
`survey_responses.id`             | uuid      | Response ID (PRIMARY KEY)
`survey_responses.template_id`    | uuid      | Which survey → `survey_templates.id`
`survey_responses.participant_id` | uuid      | Who answered → `profiles.id`
`survey_responses.response_data`  | jsonb     | All answers
`survey_responses.completed_at`   | timestamp | When submitted

---

# PART 4: OPERATION FLOWS

---

## 4.1 New User Registration Flow

```
Step 1: User visits /join-survey
Step 2: User fills form (name, email, phone, relationship, primary caregiver checkbox)
Step 3: System creates account in Supabase Auth
Step 4: System INSERT INTO profiles (full_name, email, etc.)
Step 5: Redirect to /settings to complete profile
```

---

## 4.2 Daily Entry Submission Flow

```
Step 1: User navigates to /add-entry
Step 2: User fills 4-tab form (Activity → Resources → Challenges → Impact)
Step 3: Optional: Uses voice input or AI enhance
Step 4: User clicks Submit
Step 5: System INSERT INTO survey_entries (user_id, entry_type, description, ...)
Step 6: Redirect to /timeline with success toast
```

---

## 4.3 Authentication Flow

```
Step 1: User tries protected action (edit, delete, submit)
Step 2: System checks: is user logged in?
Step 3: If NO: AuthModal appears
Step 4: User signs in (email/password or Google OAuth)
Step 5: On success: AuthModal closes, action proceeds
```

---

## 4.4 Profile Save Flow

```
Step 1: User clicks "Edit Profile" button
Step 2: Form fields become editable
Step 3: User makes changes
Step 4: User clicks "Save Profile"
Step 5: System UPDATE profiles SET full_name=?, introduction=?, ... WHERE id = [user.id]
Step 6: Success toast shown
Step 7: Form returns to read-only mode
```

---

# PART 5: FOREIGN KEY RELATIONSHIPS

---

## Complete Relationship Map

```
TABLE: profiles
PRIMARY KEY: profiles.id
    │
    ├── survey_entries.user_id → profiles.id
    │   (Each survey entry belongs to one user)
    │
    ├── enrollments.participant_id → profiles.id
    │   (Each enrollment belongs to one user)
    │
    ├── dnd_periods.user_id → profiles.id
    │   (Each DND period belongs to one user)
    │
    └── survey_enrollments.user_id → profiles.id
        (Each survey enrollment belongs to one user)


TABLE: survey_templates
PRIMARY KEY: survey_templates.id
    │
    ├── enrollments.project_id → survey_templates.id
    │   (Each enrollment is for one research project)
    │
    └── survey_responses.template_id → survey_templates.id
        (Each response is for one survey)
```

---

## Common JOIN Queries

### Get user's survey entries with their profile info:

```sql
SELECT 
    e.id,
    e.entry_type,
    e.description,
    e.entry_timestamp,
    p.full_name,
    p.participant_number
FROM care_connector.survey_entries e
JOIN care_connector.profiles p ON e.user_id = p.id
WHERE e.user_id = '[user-uuid]'
ORDER BY e.entry_timestamp DESC;
```

---

### Get enrollment with user info:

```sql
SELECT 
    e.study_start_date,
    e.status,
    e.interview_agreement,
    p.full_name,
    p.participant_number
FROM care_connector.enrollments e
JOIN care_connector.profiles p ON e.participant_id = p.id
WHERE e.participant_id = '[user-uuid]';
```

---

### Get user's DND periods:

```sql
SELECT 
    d.start_time,
    d.end_time,
    d.label,
    d.is_active
FROM care_connector.dnd_periods d
WHERE d.user_id = '[user-uuid]'
AND d.is_active = true;
```

---

# PART 6: API & DATA ACCESS

---

## Data Service Functions

**File**: `src/lib/dataService.ts`

Function Name                          | Purpose                        | Table Affected
---------------------------------------|--------------------------------|------------------------
`dataService.getUserProfile(userId)`   | Get user profile               | `profiles`
`dataService.updateUserProfile(id, d)` | Update profile                 | `profiles`
`dataService.createSurveyEntry(data)`  | Create new entry               | `survey_entries`
`dataService.updateSurveyEntry(id, d)` | Update entry                   | `survey_entries`
`dataService.deleteSurveyEntry(id)`    | Delete entry                   | `survey_entries`
`dataService.getSurveyEntries(userId)` | Get user's entries             | `survey_entries`

---

## Direct Supabase Access

When dataService doesn't have a function, use Supabase client:

```typescript
import { supabase } from '../lib/supabase';

// Example: Update interview agreement
await supabase
  .from('enrollments')
  .update({ interview_agreement: true })
  .eq('participant_id', userId);
```

---

# PART 7: DEVELOPER NOTES

---

## DO's ✓

- Always check `if (!user)` before data mutations
- Use `dataService` functions when they exist
- Respect `profiles.is_primary_caregiver` flag — demographics only show when true
- Test both EN and ZH language modes
- Keep mobile responsiveness in mind (test at 430px width)

---

## DON'Ts ✗

- Don't hardcode user IDs
- Don't bypass Supabase RLS policies
- Don't store sensitive data in localStorage
- Don't assume user is always authenticated
- Don't modify `profiles.participant_number` — it's system-assigned

---

## Common Gotchas

Problem                              | Cause                                            | Solution
-------------------------------------|--------------------------------------------------|------------------------------
BottomNav not showing                | User not logged in                               | BottomNav has `if (!user) return null`
Demographic fields not showing       | Primary caregiver toggle is OFF                  | Turn on `profiles.is_primary_caregiver`
Can't edit entry                     | Not authenticated                                | Must sign in first
Survey progress stuck at Day 1       | `enrollments.study_start_date` not set           | Check enrollments table

---

# APPENDIX: FILE STRUCTURE

```
src/
├── components/
│   ├── AuthModal.tsx              # Login/signup modal
│   ├── BottomNav.tsx              # Mobile bottom navigation (auth users only)
│   ├── DesktopHeader.tsx          # Desktop top navigation
│   ├── MobileHeader.tsx           # Mobile top navigation
│   └── ui/                        # Reusable UI components
│
├── pages/
│   ├── Homepage.tsx               # Landing page (/)
│   ├── Timeline.tsx               # Entry list (/survey)
│   ├── DementiaCaregiverSurvey.tsx # Main survey form
│   ├── AddEntry.tsx               # Add new entry (/add-entry)
│   ├── Summary.tsx                # Analytics (/summary)
│   ├── Settings.tsx               # User settings (/settings)
│   ├── About.tsx                  # Study info (/about)
│   ├── HowTo.tsx                  # Help page (/how-to)
│   ├── Contact.tsx                # Contact form (/contact)
│   └── JoinSurvey.tsx             # Registration (/join-survey)
│
├── easyresearch/
│   └── components/                # EasyResearch platform components
│
├── lib/
│   ├── supabase.ts                # Supabase client initialization
│   └── dataService.ts             # Data access functions
│
├── hooks/
│   ├── useAuth.ts                 # Authentication hook
│   └── useLanguage.ts             # i18n hook (EN/ZH)
│
└── store/
    └── AppStateProvider.tsx       # Global state management
```

---

**End of Documentation**
