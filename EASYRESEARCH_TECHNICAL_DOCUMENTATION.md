# EasyResearch Platform - Technical Documentation

## Database Schema (care_connector)

### Core Tables

#### `research_projects`
- `id` (uuid, PK): Project identifier
- `title` (text): Project name
- `description` (text): Project overview
- `methodology` (text): Survey methodology type (ESM/EMA, daily diary, longitudinal)
- `status` (text): Project status (active, completed, draft)
- `created_at` (timestamp): Creation date
- `researcher_id` (uuid, FK): Creator reference

#### `enrollments`
- `id` (uuid, PK): Enrollment identifier
- `project_id` (uuid, FK): Links to research_projects
- `participant_email` (text): Participant identifier
- `status` (text): Enrollment status (active, completed, withdrawn)
- `created_at` (timestamp): Enrollment date (used for day number calculations)
- `notification_settings` (jsonb): DND periods and notification preferences

#### `survey_instances`
- `id` (uuid, PK): Instance identifier
- `enrollment_id` (uuid, FK): Links to enrollments
- `scheduled_time` (timestamp): When survey should be completed
- `actual_start_time` (timestamp): When participant started
- `actual_end_time` (timestamp): When participant finished
- `status` (text): scheduled | in_progress | completed | missed | late
- `day_number` (integer): Study day (calculated from enrollment date)
- `time_point` (text): Scheduled time label or 'manual'

#### `survey_questions`
- `id` (uuid, PK): Question identifier
- `project_id` (uuid, FK): Links to research_projects
- `question_text` (text): Question content
- `question_type` (text): text | scale | multiple_choice | etc.
- `order_index` (integer): Display order
- `options` (jsonb): For multiple choice/scale questions

#### `survey_responses`
- `id` (uuid, PK): Response identifier
- `enrollment_id` (uuid, FK): Links to enrollments
- `project_id` (uuid, FK): Links to research_projects
- `question_id` (uuid, FK): Links to survey_questions
- `instance_id` (uuid, FK): Links to survey_instances
- `response_text` (text): User's answer
- `response_value` (jsonb): Structured response data
- `created_at` (timestamp): Response submission time

---

## Application Architecture

### Participant Flow

#### 1. **Timeline Page** (`/easyresearch/participant/:projectId/timeline`)
**Component**: `ESMParticipantDashboard.tsx`

**Features**:
- Single day vertical timeline (00:00-24:00)
- Day tabs for navigation across study days
- Next survey alert banner
- Survey entry buttons (clickable)
- Delete icons (trash) per entry
- Floating Add Entry button

**Data Flow**:
```
Load → Get enrollment by projectId
     → Get survey_instances for enrollment
     → Calculate day numbers from enrollment.created_at
     → Display instances grouped by day/hour
```

**User Actions**:
- Click day tab → Filter to that day's 24-hour view
- Click survey entry → Open modal (completed or blank form)
- Click trash icon → Delete instance + responses (with confirmation)
- Click + button → Create manual entry, open survey form

#### 2. **Survey Modal**
**Components**: 
- `ParticipantSurveyView.tsx` (for scheduled/in-progress)
- `CompletedSurveyView.tsx` (for completed surveys)

**Modal Styling**:
- No background overlay (removed ghosting)
- 50% max width (600px)
- Centered on screen
- White background with shadow

**Completed Survey Features**:
- Shows all previous responses
- Edit button → Enables textarea editing
- Save button → Updates survey_responses table
- Cancel button → Reverts changes

**Data Flow - Viewing Completed**:
```
Click completed entry → Get instance by ID
                     → Get enrollment.project_id
                     → Query survey_responses by enrollment + project
                     → Join with survey_questions for question text
                     → Group by question_id, take most recent
                     → Display in order_index order
```

**Data Flow - Editing Responses**:
```
Click Edit → Enable textareas
          → Modify response_text values
Click Save → For each modified response:
              UPDATE survey_responses 
              SET response_text = newValue
              WHERE id = response.id
          → Reload responses
          → Exit edit mode
```

#### 3. **Summary Tab**
**Features**:
- Displays all completed survey responses
- Groups by timestamp
- Shows completion statistics
- Progress percentage

---

## CRUD Operations

### CREATE - Add Manual Entry

**Trigger**: Click floating + button

**Logic**:
```javascript
1. Get current day's date
2. Set time to current hour/minute
3. Calculate day_number from enrollment.created_at
4. INSERT INTO survey_instances:
   - enrollment_id
   - scheduled_time (now)
   - status: 'scheduled'
   - day_number
   - time_point: 'manual'
5. Reload dashboard data
6. Open survey modal with new instance ID
```

**SQL**:
```sql
INSERT INTO care_connector.survey_instances (
  enrollment_id, scheduled_time, status, day_number, time_point
) VALUES (?, ?, 'scheduled', ?, 'manual')
```

### READ - View Survey/Responses

**Timeline Display**:
```sql
SELECT * FROM care_connector.survey_instances
WHERE enrollment_id = ?
ORDER BY scheduled_time
```

**Completed Responses**:
```sql
SELECT 
  sr.id, sr.question_id, sr.response_text, sr.created_at,
  sq.question_text, sq.question_type, sq.order_index
FROM care_connector.survey_responses sr
JOIN care_connector.survey_questions sq ON sr.question_id = sq.id
WHERE sr.enrollment_id = ? AND sr.project_id = ?
ORDER BY sr.created_at DESC
```

### UPDATE - Edit Completed Response

**Trigger**: Click Edit → Modify text → Click Save

**Logic**:
```javascript
1. User clicks Edit button
2. Enable edit mode (textareas editable)
3. Track changes in editedResponses state
4. On Save:
   For each modified response:
     UPDATE survey_responses
     SET response_text = newText
     WHERE id = response.id
5. Reload responses from DB
6. Exit edit mode
```

**SQL**:
```sql
UPDATE care_connector.survey_responses
SET response_text = ?
WHERE id = ?
```

### DELETE - Remove Survey Entry

**Trigger**: Click trash icon → Confirm

**Logic**:
```javascript
1. User clicks trash icon
2. Confirm dialog appears
3. If confirmed:
   a. Delete associated responses first
   b. Delete the instance
   c. Reload dashboard data
```

**SQL**:
```sql
-- Step 1: Delete responses
DELETE FROM care_connector.survey_responses
WHERE instance_id = ?

-- Step 2: Delete instance
DELETE FROM care_connector.survey_instances
WHERE id = ?
```

---

## Navigation Structure

### Participant Routes
- `/easyresearch/participant/:projectId/timeline` - Main timeline view
- Tabs within timeline page:
  - Timeline (default)
  - Summary (completed responses overview)
  - Settings (notification preferences)

### Modal Navigation
- Timeline entry click → Survey modal opens
- Modal close (X button or click outside) → Return to timeline
- Survey completion → Auto-close and refresh timeline

---

## Day Number Calculation

**Formula**:
```javascript
const enrollmentDate = new Date(enrollment.created_at);
const targetDate = new Date(instance.scheduled_time);
const dayNumber = Math.floor(
  (targetDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)
) + 1;
```

**Example**:
- Enrollment: Oct 27, 2025
- Survey: Oct 28, 2025 10:28 AM
- Day Number: 2

---

## Status Management

### Survey Instance Status Flow
```
scheduled → (user starts) → in_progress → (user submits) → completed
         ↘ (deadline passes) → missed
         ↘ (late submission) → late
```

### Status Styling
- **completed**: Solid green background, white text
- **scheduled**: White background, light border
- **in_progress**: White background, green border (2px solid)
- **late**: White background, green dashed border
- **missed**: White background, green dotted border

---

## Key Design Decisions

### No Overlay Background
Modal appears without dark/ghosted overlay for cleaner UX per user requirement.

### Single Day View
Timeline shows one 24-hour period at a time, not horizontal scrolling Excel-style grid.

### Real-Time Calculations
Day numbers and current hour highlighting calculated dynamically from enrollment date and current time.

### Immediate CRUD Feedback
All create/update/delete operations immediately refresh the timeline data to show changes.

### No Schema Prefixes
Supabase client configured with `care_connector` schema at initialization. Individual queries use NO schema prefix (e.g., `.from('survey_instances')` not `.from('care_connector.survey_instances')`).

---

## Testing Verification

**Tested Operations**:
- ✅ Day tab navigation (15 days, Oct 27 - Nov 10)
- ✅ Survey entry display (17 entries before delete, 16 after)
- ✅ Add Entry button (creates instance, opens modal)
- ✅ Delete functionality (trash icon, confirmation, cascading delete)
- ✅ Edit completed responses (Edit → modify → Save → updates DB)
- ✅ No overlay background (modal appears without dark ghosting)
- ✅ Next survey alert (displays upcoming scheduled survey)

**Database Verification**:
- Project ID: `a3ba8854-b733-4d00-894d-a678fdd0c8ab`
- Enrollment ID: `52c5a833-2a41-4488-8120-cac63ed7402a`
- 28 total survey instances across 15 days
- 2 completed surveys with real responses
- All CRUD operations working with real Supabase data
