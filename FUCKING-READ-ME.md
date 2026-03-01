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

Every study lives in the `research_project` table. and all layout information is stored in research_project.app_layout, no other file used or should be used

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

Each question is a row in the `survey_question` table. It belongs to one project and optionally to one questionnaire via the `questionnaire_id` FK column.

- **Core fields:** question type (one of 21 types), question text, optional description, sort order, required flag
- **Config:** The `question_config` JSONB holds type-specific settings — max length for text, min/max for sliders, scale labels for Likert, disqualify values for screening, and so on
- **Validation and Logic:** `validation_rule` and `logic_rule` JSONB columns for custom validation and conditional branching
- **AI and Voice:** `allow_voice` and `allow_ai_assist` boolean columns

Each question can have multiple options in the `question_option` table — used by choice-type questions. Options have display text, stored value, sort order, and an "is other" flag for free-text fallback.

---

## 10. PARTICIPANT TYPES 

Each participant type is a row in the `participant_type` table. It belongs to one project and defines a category of participant (e.g., "Primary Caregiver", "Family Member").

- **Fields:** name, description, relation options (as a text array), UI color, sort order
- **Consent and screening** are stored as separate questionnaire rows with type `consent` or `screening`, linked to participant types through the junction table. This means a consent form or screening set can be shared across multiple participant types.

The `ParticipantTypeManager.tsx` UI still shows consent forms and screening questions inline under each participant type, but the data is saved as questionnaire table rows.

---
