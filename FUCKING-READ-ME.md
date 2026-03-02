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

Every study lives in the `research_project` table. and all layout information is stored in research_project.app_layout, no other file used or should be used. 

A research project can have multiple questionaires, because we are also supporting longitudual surveys that may take several days and use multiple questionaires, e.g. an hourly questionaire to be filled every hour, a daily questionaire to be filled every day. Each questionaire can have multiple questions. We also allow user to use components, components are also questionaires from a data point, but they are displayed as components for users, because sections like profile questions, faqs, etc, are more intuiative for user to configure as "components", but they use the same model as questionaires. 

Research project, questionaire and question can all be set as templetes (either private or public) and imported from the private templete library or public templete library

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


---

## 10. PARTICIPANT TYPES 

Each participant type is a row in the `participant_type` table. It belongs to one project and defines a category of participant (e.g., "Primary Caregiver", "Family Member").

all questionaires and questions can be configured to be shown to what participant type

## 11. Layout and design

There are only two layouts for this project, 1) desktop layout, for all desktop screen sizes, whether small or large; and we are using only one header, one footer, one siderbar for the entire desktop layout, the header and footer should be displayed on all public pages, and the sidebar should be displayed on all dashboard pages, 2) mobile layout, for all mobile and tablet screen sizes; and we are using only one mobile header, one mobile footer for all mobile pages, and they should persist on all pages, whether it's a research project or not

desktop/mobile homepage: homepage only serves as a static homepage, log in will direct to /dashboard and log out back to homepage

desktop footer: basic company info, not navigation footer

desktop sidebar: 4 sidebars: research, discover, inbox and setting. the same logic and function as mobile footer.

desktop header: left: Site logo, name; participants, features, templetes right: language switcher profile button (dropdown to handle auth, and a button to go to dashboard, no other bullshit)

mobile header: left: Site logo, name; participants, right: language switcher profile button (dropdown to handle auth, no other bullshit)

mobile footer: 4 tabs: research, discover, inbox and setting.   1)research is the unified research project hub for researchers and participants to find or manage their researches, with edit button to dynamic display tabs for researchers or participants; 2) discover is for discovering research projects to join; 3) inbox is the unified inbox page to show both notifications and direct-message between and researcher and participant; 4) setting is the setting page for basic profile information and notification

## 12. Notification 

questionaire notification is set at questionaire level, making each questionaire able to send a custom notification, e.g. an hourly log questionaire can be set to send a notification from 8am-10pm each day. Do not disturb is also set at questionaire level, if allowed, participant can set multiple dnd period per questionaire, e.g. 8am-9am, 1pm-3pm, and the notification for this questionaire will be blocked during. 

---
