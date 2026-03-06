# FUCKING READ ME

> FUCKING READ ME AND KEEP IN YOUR CONTEXT IF POSSIBLE.  
> WHEN IN DOUBT, FUCKING READ ME.  
> NEVER FUCKING GUESS.  
> THESE ARE THINGS YOU FREQUENTLY GUESSED WRONG ALMOST EACH AND EVERY TIME.  
> NEVER FUCKING GUESS. FUCKING READ ME!!!
> This file is designed as a transferable system prompt to be fully pasted to any ai workspace. Only write in brief bullet point paragraphs!

---

## 1. WHAT IS EASYRESEARCH

EasyResearch (branded "Easier") is a sub-app living under `/easyresearch/*` within the larger True-Easier-Research platform. It is a full-stack ESM/EMA research platform where researchers create surveys, manage participants, collect longitudinal data, and analyze responses. It supports one-time surveys AND multi-day longitudinal/ESM studies with scheduled prompts, consent flows, screening, participant types, and a configurable mobile app layout.

- **Stack:** React 18, TypeScript, Vite, TailwindCSS
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions) — all tables live in the `care_connector` schema
- **Mobile:** Capacitor for native iOS/Android push notifications
- **State:** React hooks and local state only (no Redux or React Query)
- **Drag-and-drop:** `@hello-pangea/dnd` and `@dnd-kit/core`
- **Entry point:** Routes defined in `src/App.tsx` under the EASYRESEARCH PLATFORM ROUTES section
- **Development stage ai api key: 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 use google/gemma-3-27b-it to save my fucking money

---



## 5. RESEARCH PROJECT 

Every study lives in the `research_project` table. A project can have multiple questionnaires (e.g. hourly, daily), and components (profile questions, FAQs) which are also questionnaires under the hood. Layout is stored in flat relational tables (`app_tab`, `app_tab_element`, and child tables) — NOT in JSONB.

Research project, questionnaire, and question can all be set as templates (either private or public) and imported from template libraries.

**All actually-used flat columns on `research_project` (no DB dump — only what the app reads/writes):**

*Core identity:*
- `id` (uuid PK)
- `organization_id` (uuid FK) — which organization owns this project
- `researcher_id` (uuid FK) — which researcher created it
- `title` (text) — project name shown everywhere
- `description` (text) — purpose and goals
- `status` (text) — 'draft' or 'published'
- `published_at` (timestamp) — when published, null if draft
- `project_type` (text) — 'survey', 'longitudinal', 'esm', 'clinical_trial', 'diary'
- `methodology_type` (text) — sub-classification like 'single_survey'
- `survey_code` (text) — short code participants can enter to join

*Feature toggles:*
- `ai_enabled` (bool) — allow AI-assisted questions
- `voice_enabled` (bool) — allow voice input
- `notification_enabled` (bool) — enable notifications for this project
- `messaging_enabled` (bool) — enable direct messaging between researcher and participants

*Consent & screening:*
- `consent_required` (bool) — must participants accept consent before enrollment
- `consent_form_title` (text) — consent form heading
- `consent_form_text` (text) — consent body text
- `consent_form_url` (text) — link to external consent document
- `screening_enabled` (bool) — require eligibility screening before enrollment

*Participant config:*
- `max_participant` (int) — enrollment cap
- `participant_numbering` (bool) — global auto-number toggle (fallback when no participant types defined)
- `participant_number_prefix` (text) — global prefix e.g. 'PP' (fallback when no participant types defined)
- `participant_relation_enabled` (bool) — ask participants to select their relationship/role
- `participant_relation_options` (text[]) — list of role options like ['Parent', 'Spouse']

*Compensation:*
- `compensation_amount` (numeric) — payment amount
- `compensation_type` (text) — 'none', 'monetary', 'gift_card', 'raffle'

*Schedule:*
- `start_at` (timestamp) — study start date
- `end_at` (timestamp) — study end date
- `study_duration` (int) — number of days for longitudinal studies
- `survey_frequency` (text) — 'hourly', '2hours', '4hours', 'daily', 'twice_daily', 'weekly'
- `allow_participant_dnd` (bool) — let participants set Do Not Disturb hours
- `allow_start_date_selection` (bool) — let participants choose their own start date

*Onboarding:*
- `onboarding_required` (bool) — show onboarding instructions before starting
- `onboarding_instruction` (text) — the instruction text

*Display & behavior:*
- `show_progress_bar` (bool) — show completion percentage during survey
- `disable_backtracking` (bool) — prevent going back to previous questions
- `randomize_questions` (bool) — shuffle question order to reduce bias
- `auto_advance` (bool) — auto-move to next question after selection

*Ecogram / network diagram:*
- `ecogram_enabled` (bool) — let participants build a care network diagram
- `ecogram_center_label` (text) — label for center node, e.g. 'Me' or 'Patient'
- `ecogram_relationship_options` (text[]) — relationship types to choose from
- `ecogram_support_categories` (text[]) — support category labels

*Notification config (project-level defaults):*
- `notification_frequency` (text) — default notification frequency
- `notification_times_per_day` (int) — how many times per day
- `notification_times` (text[]) — specific times of day
- `notification_send_reminders` (bool) — send follow-up reminders
- `notification_timezone` (text) — timezone for scheduling

*Sampling (ESM-specific):*
- `sampling_type` (text) — type of sampling strategy
- `sampling_prompts_per_day` (int) — number of random prompts per day
- `sampling_start_hour` (int) — earliest hour for prompts (0-23)
- `sampling_end_hour` (int) — latest hour for prompts (0-23)
- `sampling_allow_late` (bool) — allow responding after the prompt window
- `sampling_late_window_minutes` (int) — how many minutes late is allowed

*Recruitment:*
- `recruitment_criteria_text` (text) — free-text eligibility criteria description

*Help & completion:*
- `help_information` (text) — study protocol, FAQ, contact info shown in Help tab
- `completion_title` (text) — thank-you page heading
- `completion_message` (text) — thank-you page body
- `completion_redirect_url` (text) — redirect URL after completion

*Incentives:*
- `incentive_enabled` (bool) — whether incentives are active
- `incentive_type` (text) — 'fixed', 'variable', etc.
- `incentive_amount` (numeric) — payment amount
- `incentive_currency` (text) — e.g. 'USD'
- `incentive_description` (text) — what participants receive
- `incentive_payment_method` (text) — 'manual', 'paypal', etc.
- `incentive_payment_instructions` (text) — how to claim payment

*Template columns (on all three tables: project, questionnaire, question):*
- `is_template` (bool) — true = this row is a template, not a real project
- `template_is_public_or_private` (bool) — true = public, false = private
- `template_category` (text) — grouping label
- `source_template_id` (uuid FK to self) — which template this was cloned from

*Layout theme/header (flat columns — layout tabs and elements are in separate tables, see section 13):*
- `layout_show_header` (bool) — show header bar in participant app
- `layout_header_title` (text) — custom header title
- `layout_theme_primary_color` (text) — primary accent color, e.g. '#10b981'
- `layout_theme_background_color` (text) — background color
- `layout_theme_card_style` (text) — 'flat', 'elevated', or 'outlined'

**ZERO JSONB columns on research_project.** All layout structure is in flat relational tables (see section 13).

## 5b. TEMPLATES

A template is NOT a separate table or a JSONB blob. A template is a row in the SAME table as real data with `is_template = true`. Never create a separate template table. Never dump template data into JSONB.

- **Project template** = a `research_project` row with `is_template = true`
- **Questionnaire template** = a `questionnaire` row with `is_template = true`
- **Question template** = a `question` row with `is_template = true`

Template columns added to all three tables: `is_template` (bool), `template_is_public_or_private` (bool — true = public, false = private), `template_category` (text), `source_template_id` (uuid FK to self). One boolean column, no separate is_private.

"Use template" = deep-clone the template row + its children into new rows with `is_template = false`. "Save as template" = deep-clone the real row + its children into new rows with `is_template = true`.

`template_is_public_or_private = true` → visible to all users. `template_is_public_or_private = false` → only visible to creator. Templates are NEVER hardcoded in frontend code — they always live in the database.

## 6. USER PROFILE

User role is defined in profile table


## 7. USER ROLE

user role is defined in profile table's is_researcher toggle is_participant toggle, a users can be both, this should not overide if a user can sumbit or can join a research, a user can be both researcher and a participant (join another researcher's research), the actual dashboard display logic is defined by user setting what he wants to get displayed



## 8. QUESTIONNAIRE 

Each questionnaire is a row in the `questionnaire` table in the `care_connector` schema. It belongs to one project and has a type field that determines its purpose:

- **survey** — A regular questionnaire with questions, schedule, frequency (once, daily, hourly, etc.), active time window, estimated duration, notification toggle, and Do Not Disturb settings.
- **consent** — A consent form with consent text and consent URL fields. The participant must agree before proceeding.
- **screening** — A screening questionnaire containing questions that determine participant eligibility. Questions can have a disqualify value in their config that auto-rejects participants.

REMEMBER NOT to use a seperate consent of screening table,they are also defined as questionnaire in this project

Questionnaires are linked to participant types through the `questionnaire_participant_type` junction table — a many-to-many relationship. A questionnaire can be assigned to multiple participant types, and a participant type can have multiple questionnaires.



## 9. QUESTIONS

Each question is a row in the `question` table (renamed from the old `survey_question` — NEVER use `survey_question` anymore). A question belongs to one project via `project_id` and optionally to one questionnaire via `questionnaire_id`.

**Flat columns on the `question` table (no unnecessary JSONB):**
- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `questionnaire_id` (uuid FK → questionnaire) — links the question to a specific questionnaire
- `question_type` (text) — the type string, e.g. `'single_choice'`, `'likert_scale'`, `'matrix'`, `'slider'`. The canonical list lives in `src/easyresearch/constants/questionTypes.ts`
- `question_text` (text) — the actual question prompt shown to participants
- `question_description` (text) — optional help text or description
- `order_index` (int) — position within the questionnaire
- `required` (bool) — whether the participant must answer
- `section_name` (text) — groups questions into sections for display
- `allow_voice` (bool) — voice input allowed
- `allow_ai_assist` (bool) — AI assistant allowed
- `allow_other` (bool) — adds an "Other" free-text option (for choice types)
- `allow_none` (bool) — adds a "None of the above" option (for choice types)

**Flat config columns on `question`:**
- `cfg_*` (38 columns) — type-specific settings stored as flat columns. For a slider: `cfg_min_value`, `cfg_max_value`, `cfg_step`. For text: `cfg_max_length`. For matrix: `cfg_columns` (JSON string). Each question type has its own config shape defined in `QUESTION_TYPE_DEFINITIONS`. Hydrated to in-memory `question_config` object via `questionConfigSync.ts`.
- `vr_*` (8 columns) — validation rules: `vr_min_length`, `vr_max_length`, `vr_min_value`, `vr_max_value`, `vr_min`, `vr_max`, `vr_allow_future_dates`, `vr_allow_past_dates`. Hydrated to in-memory `validation_rule` object.
- `logic_rules` — skip/branch logic (reserved, not yet implemented)
- `ai_config` — AI-related settings (reserved, not yet implemented)
- `scoring_config` — scoring/weighting for analytics
- `piping_config` — answer piping into later questions

**Question options** are stored in the `question_option` table (one row per option), NOT in JSONB:
- `id` (uuid PK)
- `question_id` (uuid FK → question)
- `option_text` (text) — display text
- `option_value` (text) — programmatic value
- `order_index` (int) — position
- `is_other` (bool) — whether this is the "Other" free-text option

**Responses** are stored in `survey_response` with typed columns:
- `answer_text` (text) — for text, email, phone, date, time, single_choice, yes_no
- `answer_number` (numeric) — for number, slider, rating, likert_scale, NPS
- `answer_array` (text[]) — for multiple_choice, checkbox_group, ranking
- `answer_json` (JSONB) — for matrix and complex types only

**Questions can be shown per participant type.** Each questionnaire is linked to participant types via the `questionnaire_participant_type` junction table. When a questionnaire is assigned to specific participant types, only participants of those types see the questionnaire and its questions. This is a many-to-many relationship — one questionnaire can serve multiple participant types, and one participant type can have multiple questionnaires.

**Supported question types** (defined in `questionTypes.ts`):
- Text: `text_short`, `text_long`
- Choice: `single_choice`, `multiple_choice`, `dropdown`, `checkbox_group`
- Scale: `slider`, `bipolar_scale`, `rating`, `likert_scale`, `nps`
- Data: `number`, `date`, `time`, `email`, `phone`
- Advanced: `matrix`, `ranking`, `file_upload`, `image_choice`, `yes_no`, `instruction`
- Layout: `section_header`, `text_block`, `divider`, `image_block` (these don't collect responses)

---

## 10. PARTICIPANT TYPES 

Each participant type is a row in the `participant_type` table. It belongs to one project via `project_id` and defines a category of participant (e.g., "Primary Caregiver", "Family Member").

**Flat columns on `participant_type`:**
- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `name` (text) — e.g. "Primary Caregiver"
- `description` (text)
- `color` (text) — hex color for UI display
- `order_index` (int) — display order
- `numbering_enabled` (bool) — whether participants of this type get auto-numbered
- `number_prefix` (text) — prefix for auto-numbering, e.g. "CG" → CG001, CG002...
- `relations` (text[]) — relationship options participants can choose from

**Auto-numbering per participant type:** When a participant enrolls, the system counts existing enrollments of the same `participant_type_id` for that project and generates the next sequential number using the type's prefix. E.g., if 3 caregivers already enrolled with prefix "CG", the next gets "CG004". The number is stored in `enrollment.participant_number`.

**Questionnaires and questions are displayed per participant type.** Questionnaires are linked to participant types via the `questionnaire_participant_type` junction table. A questionnaire can be assigned to multiple types, and a type can have multiple questionnaires. Only participants of the assigned types see those questionnaires.

## 11. Layout and design

There are only two layouts for this project, 1) desktop layout, for all desktop screen sizes, whether small or large; and we are using only one header, one footer, one siderbar for the entire desktop layout, the header and footer should be displayed on all public pages, and the sidebar should be displayed on all dashboard pages, 2) mobile layout, for all mobile and tablet screen sizes; and we are using only one mobile header, one mobile footer for all mobile pages, and they should persist on all pages, whether it's a research project or not

desktop/mobile homepage: homepage only serves as a static homepage, log in will direct to /dashboard and log out back to homepage

desktop footer: basic company info, not navigation footer, and make sure the footer is using the exact same size of icon, app name as the header, and position alighed with the header's icon, app name

desktop footer should also always be displayed on all publish pages (not fixed, just shown at bottom) on all screen sizes, including even mobile screen

desktop sidebar: 4 sidebars: research, discover, inbox and setting. the same logic and function as mobile footer.

desktop header: left: Site logo, name; join studies (just for participants finding existing researches, and inform they may get paid, also display the money for each research), participants, features, templetes right: language switcher profile button (dropdown to handle auth, and a button to go to dashboard, no other bullshit)

mobile header: left: Site logo, name; participants, right: language switcher profile button (dropdown to handle auth, no other bullshit)

mobile footer: 4 tabs: research, discover, inbox and setting. 1)research is the unified research project hub for researchers and participants to find or manage their researches, with edit button to dynamic display tabs for researchers or participants; 2) discover is for discovering research projects to join; 3) inbox is the unified inbox page to show both notifications and direct-message between and researcher and participant; 4) setting is the setting page for basic profile information and notification

remember: mobile footer should never be shown on public pages, to be precise, it should only show on /dashboard routes, and make sure the app either shows sidebar (on large screens), or mobile footer (on tablet/phone) on dashboard routes, it's one or the other, never neither or both, and make sure they only show on dashboard routes. and remember, the desktop header has join studies, templetes, participants, don't confuse them with the dashabord version of the same page or feature, these desktop versions are for public view, for visitors, they are not dashboard routes, they are just standard public routes, don't display mobile footer

## 12. Notification

Notification is set at **questionnaire level**, not project level. Each questionnaire has its own notification config:

- `notification_enabled` (bool) — researcher toggles per questionnaire
- `notification_title`, `notification_body` (text) — custom content
- `notification_type` (text) — 'push', 'email', 'sms', 'push_email'
- `notification_minutes_before` (int) — advance warning
- `frequency` (text) — 'hourly', '2hours', '4hours', 'daily', 'twice_daily', 'weekly', 'once'
- `time_windows` — **FLATTENED** to `questionnaire_time_window` table (questionnaire_id, start_time, end_time, order_index). In-memory still `[{start, end}]`.
- `dnd_allowed` (bool) — whether researcher allows participants to set DND for this questionnaire

**DND is per-questionnaire per-enrollment.** **FLATTENED** to `enrollment_dnd_period` table (enrollment_id, questionnaire_id, start_time, end_time, order_index). In-memory still `{ [questionnaire_id]: { dnd_periods: [{start, end}] } }`. If `dnd_allowed` is false on the questionnaire, participants cannot set DND for it.

**Master kill switch:** `profiles.push_notifications_enabled` (bool). If false, no notifications fire regardless of questionnaire config. This is the participant's global opt-out. The Settings page shows this toggle and informs the participant about the notification agreements of their enrolled research projects — but it does NOT override the master kill switch.

**How delivery works:** `notificationScheduler.ts` runs client-side. On load, it queries all active enrollments → their questionnaires with `notification_enabled=true` → builds a per-questionnaire notification schedule. Every 60 seconds it checks each questionnaire: is it within the time window? Is it past the frequency cooldown? Is it in DND? If all pass, fires a browser notification using the questionnaire's custom title/body. Time windows are read from `questionnaire_time_window` table. Participant DND is read from `enrollment_dnd_period` table keyed by enrollment + questionnaire ID.

**Participant joins multiple researches:** Each enrollment is independent. Research A's questionnaire notifications have their own schedule and DND. Research B's are separate. The participant can set DND per-questionnaire from the notification settings modal (`ParticipantNotificationSettings`).

---

## 13. SURVEY BUILDER AND LAYOUT

The survey builder (`SurveyBuilder.tsx`) is the main researcher tool for creating and editing research projects. It has tabs: settings, questionnaires, components, logic, layout, preview, participants, responses.

**How questions are saved:** The `syncQuestions` function in `SurveyBuilder.tsx` takes all questions from all questionnaires and upserts them into the `question` table. Each question gets a `questionnaire_id` FK linking it to its questionnaire. Question options go to `question_option` table. Deleted questions and stale options are cleaned up in the same sync.

**Question config — ALL FLAT COLUMNS, ZERO JSONB.** The per-question type-specific config (e.g. `max_length` for text, `min_value`/`max_value` for sliders, `yes_label`/`no_label` for yes/no) is stored as flat `cfg_*` columns on the `question` table. There are 38 config keys, each mapped to a `cfg_` prefixed column. On save, `questionConfigToDbCols()` spreads the config object into flat columns. On load, `hydrateQuestionRows()` reconstructs the `question_config` object from flat columns. Both in `src/easyresearch/utils/questionConfigSync.ts`. Components keep using `question.question_config.xxx` — the hydration is transparent.

**All cfg_* columns on `question` table:**
- `cfg_max_length` (int) — text max length
- `cfg_allow_other`, `cfg_allow_none`, `cfg_allow_multiple` (bool) — choice options
- `cfg_columns`, `cfg_custom_labels` (text) — matrix columns / likert labels (JSON string)
- `cfg_min_value`, `cfg_max_value`, `cfg_min`, `cfg_max`, `cfg_step` (numeric) — scale range
- `cfg_min_label`, `cfg_max_label` (text) — scale endpoint labels
- `cfg_show_value_labels` (bool), `cfg_scale_type` (text) — scale display
- `cfg_yes_label`, `cfg_no_label` (text) — yes/no labels
- `cfg_max_files` (int), `cfg_max_size_mb` (int), `cfg_accepted_types` (text) — file upload
- `cfg_image_url`, `cfg_alt_text`, `cfg_max_width`, `cfg_caption` (text) — image block
- `cfg_section_color`, `cfg_section_icon` (text) — section header
- `cfg_content`, `cfg_content_type`, `cfg_font_size` (text) — text block
- `cfg_color`, `cfg_thickness`, `cfg_style` (text) — divider/style
- `cfg_disqualify_value` (text) — screening disqualification
- `cfg_response_required` (text) — 'optional', 'required', etc.
- `cfg_questionnaire_id` (uuid) — questionnaire reference
- `cfg_options` (text) — inline options (JSON string, rare)
- `cfg_allow_ai_assist`, `cfg_allow_ai_auto_answer`, `cfg_allow_voice` (bool) — AI/voice

**Question order:** Each question has an `order_index` (integer) that determines its position within the questionnaire. The builder lets researchers drag-and-drop to reorder, which updates `order_index` values.

**Display modes (flat columns on `questionnaire` table):**
- `display_mode` (text) — `'all_at_once'`, `'one_per_page'`, or `'section_per_page'`
- `questions_per_page` (int) — how many questions per page when in paged mode

**Tab/section assignment:** Each questionnaire can have `tab_sections` stored in questionnaire config. Questions are grouped into sections by `section_name`. Layout question types (`section_header`, `divider`, `text_block`, `image_block`) create visual separators but don't collect data.

**App layout — ALL FLAT TABLES, ZERO JSONB.** The participant-facing mobile app layout is stored across flat relational tables. No JSONB blobs anywhere.

**`app_tab` table** — one row per tab in the participant app:
- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `label` (text) — tab display name, e.g. 'Home', 'Timeline'
- `icon` (text) — icon key, e.g. 'Home', 'FileText', 'Settings'
- `order_index` (int) — tab order

**`app_tab_element` table** — one row per element within a tab:
- `id` (uuid PK)
- `tab_id` (uuid FK → app_tab)
- `project_id` (uuid FK → research_project)
- `type` (text) — element type: 'questionnaire', 'consent', 'screening', 'profile', 'ecogram', 'text_block', 'progress', 'timeline', 'help', 'custom', 'spacer', 'divider', 'image', 'button', 'todo_list'
- `order_index` (int) — element order within tab
- `questionnaire_id` (uuid FK, nullable) — which questionnaire this element shows
- `title` (text) — element title
- `content` (text) — text content for text_block/custom elements
- `visible` (bool) — whether element is visible
- `participant_types` (text[]) — which participant types can see this element
- `width` (text) — '25%', '33%', '50%', '75%', '100%'
- `style_padding`, `style_background`, `style_border_radius`, `style_height` (text) — style overrides
- `button_action`, `button_label` (text) — button config
- `image_url` (text) — image URL
- `show_question_count`, `show_estimated_time` (bool) — questionnaire display options
- `consent_text`, `screening_criteria` (text) — consent/screening element text
- `progress_style` (text) — 'bar', 'ring', 'steps'
- `timeline_start_hour`, `timeline_end_hour`, `timeline_days` (int) — timeline config
- `todo_layout` (text) — 'horizontal' or 'vertical'
- `todo_auto_scroll` (bool) — auto-scroll todo list

**`app_element_todo_card` table** — child of `app_tab_element` for todo_list elements:
- `id` (uuid PK)
- `element_id` (uuid FK → app_tab_element)
- `type` (text) — 'questionnaire' or 'custom'
- `questionnaire_id` (uuid FK, nullable) — which questionnaire this card represents
- `title`, `description` (text)
- `completion_trigger` (text) — 'manual', 'time', 'questionnaire_complete'
- `order_index` (int)

**`app_element_help_section` table** — child of `app_tab_element` for help elements:
- `id` (uuid PK)
- `element_id` (uuid FK → app_tab_element)
- `title`, `content` (text)
- `order_index` (int)

**`app_element_tab_section` table** — child of `app_tab_element` for questionnaire tab sections:
- `id` (uuid PK)
- `element_id` (uuid FK → app_tab_element)
- `label` (text)
- `question_ids` (text[]) — ordered list of question IDs in this section
- `order_index` (int)

**Layout theme/header** stored as flat columns on `research_project`: `layout_show_header`, `layout_header_title`, `layout_theme_primary_color`, `layout_theme_background_color`, `layout_theme_card_style`.

**Bottom nav** is derived from `app_tab` rows (each tab = one nav item). No separate storage needed.

Auto-saved to flat tables with 1.5s debounce via `saveLayoutToDb()`. Loaded via `loadLayoutFromDb()`. Both in `src/easyresearch/utils/layoutSync.ts`.

**EVERYTHING is flat columns or relational tables.** Questions, options, questionnaires, participant types, enrollments, layout tabs, layout elements — all stored in proper tables with flat columns.

---
