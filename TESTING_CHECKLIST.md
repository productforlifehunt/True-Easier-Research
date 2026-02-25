# EasyResearch App - Comprehensive Testing Checklist

## PUBLIC ROUTES (No Auth Required)

### 1. Landing Page (`/easyresearch`)
- [ ] Page loads correctly
- [ ] Hero section displays
- [ ] Feature sections visible
- [ ] CTA buttons work
- [ ] Navigation to auth works
- [ ] Navigation to templates works
- [ ] Navigation to pricing works

### 2. Auth Page (`/easyresearch/auth`)
**Sign Up Flow:**
- [ ] Email input validation
- [ ] Password input validation
- [ ] Sign up as Researcher works
- [ ] Sign up as Participant works
- [ ] Error messages display correctly
- [ ] Success redirects to correct page

**Sign In Flow:**
- [ ] Email/password validation
- [ ] Sign in works for researcher
- [ ] Sign in works for participant
- [ ] Error messages for invalid credentials
- [ ] Redirect to dashboard after sign in

### 3. Template Library (`/easyresearch/templates`)
- [ ] Templates display correctly
- [ ] Template preview works
- [ ] "Use Template" creates project (when logged in)
- [ ] "Use Template" prompts sign in (when not logged in)
- [ ] Template categories filter works

### 4. Pricing Page (`/easyresearch/pricing`)
- [ ] Pricing plans display
- [ ] Feature comparison visible
- [ ] CTA buttons work
- [ ] Checkout flow initiates

---

## RESEARCHER ROUTES (Protected)

### 5. Dashboard (`/easyresearch/dashboard`)
**READ Operations:**
- [ ] Projects list loads
- [ ] Project cards display correctly
- [ ] Stats cards show correct numbers
- [ ] Search filters projects
- [ ] Tab filters (All/Active/Draft/Completed) work

**CREATE Operations:**
- [ ] "New Project" button opens dialog
- [ ] Create project dialog validates inputs
- [ ] New project creates successfully
- [ ] Default questions added to new project
- [ ] Redirect to project editor after creation

**UPDATE Operations:**
- [ ] Click project card navigates to editor

**DELETE Operations:**
- [ ] Delete button shows confirmation dialog
- [ ] Delete removes project
- [ ] Delete removes questions
- [ ] Delete removes question_options
- [ ] Delete removes enrollments
- [ ] Success toast displays

**DUPLICATE Operations:**
- [ ] Duplicate button creates copy
- [ ] Duplicated project has "(Copy)" in title
- [ ] Questions copied with new IDs
- [ ] Question options copied with new IDs
- [ ] Success toast displays

### 6. Project Editor (`/easyresearch/project/:projectId`)
**READ Operations:**
- [ ] Project loads correctly
- [ ] Questions list displays
- [ ] Question settings panel shows
- [ ] Tabs (Design/Logic/Settings/Preview) work

**CREATE Operations (Questions):**
- [ ] Add Question dropdown works
- [ ] Each question type creates correctly:
  - [ ] Short Text
  - [ ] Long Text
  - [ ] Single Choice
  - [ ] Multiple Choice
  - [ ] Dropdown
  - [ ] Slider (min/max/step)
  - [ ] Rating (configurable stars)
  - [ ] Likert Scale
  - [ ] NPS (0-10)
  - [ ] Number
  - [ ] Date
  - [ ] Time
  - [ ] Email
- [ ] Default options created for choice questions

**UPDATE Operations (Questions):**
- [ ] Edit question text
- [ ] Edit question description
- [ ] Change question type
- [ ] Edit question config (slider min/max, rating stars, etc.)
- [ ] Toggle required/optional
- [ ] Toggle AI assist
- [ ] Toggle voice input
- [ ] Add/edit/delete options (choice questions)
- [ ] Reorder options (drag & drop)
- [ ] Question preview updates in real-time
- [ ] Changes auto-save to local state

**UPDATE Operations (Project):**
- [ ] Edit project title inline
- [ ] Save button persists all changes
- [ ] Success toast on save
- [ ] Error toast on failure

**DELETE Operations (Questions):**
- [ ] Delete question removes it
- [ ] Selected question clears after delete

**REORDER Operations (Questions):**
- [ ] Move Up button works
- [ ] Move Down button works
- [ ] Order_index updates correctly

**DUPLICATE Operations (Questions):**
- [ ] Duplicate creates copy with new ID
- [ ] Options duplicated with new IDs
- [ ] "(Copy)" appended to question text

**PUBLISH/UNPUBLISH Operations:**
- [ ] Validation: Cannot publish without questions
- [ ] Validation: Cannot publish without title
- [ ] Publish generates survey_code
- [ ] Publish sets published_at timestamp
- [ ] Unpublish clears published_at
- [ ] Success toasts display

**PREVIEW Tab:**
- [ ] Desktop preview works
- [ ] Mobile preview works
- [ ] All question types render correctly
- [ ] Slider is interactive
- [ ] Rating stars clickable
- [ ] Response handling works

**LOGIC Tab:**
- [ ] Logic rules editor loads
- [ ] Add rule works
- [ ] Edit rule works
- [ ] Delete rule works
- [ ] Rules save with project

**SETTINGS Tab:**
- [ ] Survey code displays
- [ ] Participant link copyable
- [ ] AI enabled toggle works
- [ ] Voice enabled toggle works
- [ ] Notification settings save
- [ ] Consent form settings save

### 7. Responses Page (`/easyresearch/responses`)
**READ Operations:**
- [ ] All responses load
- [ ] Responses grouped by project
- [ ] Response details expandable
- [ ] Participant info displays

**UPDATE Operations:**
- [ ] Edit response (if supported)

**DELETE Operations:**
- [ ] Delete response (if supported)

### 8. Analytics Page (`/easyresearch/analytics`)
**READ Operations:**
- [ ] Project selector works
- [ ] Charts/graphs display
- [ ] Stats calculate correctly
- [ ] Date range filter works
- [ ] Export data works

### 9. Participants Page (`/easyresearch/participants`)
**READ Operations:**
- [ ] Enrollments list loads
- [ ] Participant details display
- [ ] Project filter works

**CREATE Operations:**
- [ ] Invite participant modal opens
- [ ] Email validation works
- [ ] Invitation creates enrollment
- [ ] Email sent (if configured)
- [ ] Success toast displays

**UPDATE Operations:**
- [ ] Edit participant status (if supported)

**DELETE Operations:**
- [ ] Remove participant (if supported)

### 10. Researcher Settings (`/easyresearch/settings`)
**READ Operations:**
- [ ] Current settings load

**UPDATE Operations:**
- [ ] Update profile info
- [ ] Update notification preferences
- [ ] Save changes
- [ ] Success toast displays

---

## PARTICIPANT ROUTES

### 11. Participant Home (`/easyresearch/home`)
**READ Operations:**
- [ ] Available surveys load
- [ ] My surveys load
- [ ] Tabs (Available/Enrolled/Completed) work

**CREATE Operations:**
- [ ] Join survey by code works
- [ ] Creates enrollment
- [ ] Redirects to survey

### 12. Survey View (`/easyresearch/participant/:projectId`)
**READ Operations:**
- [ ] Project loads
- [ ] Questions display
- [ ] Consent form shows (if required)
- [ ] Progress bar works

**CREATE Operations (Responses):**
- [ ] Answer each question type
- [ ] Slider interactive
- [ ] Rating stars clickable
- [ ] Choice selections work
- [ ] Text inputs work
- [ ] Validation works (required questions)
- [ ] Submit creates responses
- [ ] Redirect to completion page

**UPDATE Operations (Responses):**
- [ ] Edit previous responses (if allowed)

**Voice/AI Features:**
- [ ] Voice input works (if enabled)
- [ ] AI enhancement works (if enabled)

### 13. Participant Dashboard (`/easyresearch/participant/:projectId/dashboard`)
**READ Operations:**
- [ ] Instances list displays
- [ ] Timeline view works
- [ ] Completed surveys show
- [ ] Upcoming surveys show

**UPDATE Operations:**
- [ ] Edit completed response
- [ ] Reschedule instance (if allowed)

**DELETE Operations:**
- [ ] Delete response (if allowed)

### 14. Participant Settings (`/easyresearch/participant/:projectId/settings`)
**READ Operations:**
- [ ] Enrollment settings load

**UPDATE Operations:**
- [ ] Update notification preferences
- [ ] Update profile data
- [ ] Save changes
- [ ] Success toast displays

### 15. Join Survey (`/easyresearch/participant/join`)
**CREATE Operations:**
- [ ] Token validation works
- [ ] Enrollment acceptance works
- [ ] Redirect to survey

---

## CROSS-CUTTING CONCERNS

### Navigation
- [ ] Header displays on all pages
- [ ] Sidebar shows on researcher pages
- [ ] Bottom nav shows on participant mobile
- [ ] Logo link works
- [ ] User menu works
- [ ] Sign out works

### Authentication
- [ ] Protected routes require auth
- [ ] Redirect to login when not authenticated
- [ ] Stay on page after login
- [ ] Researcher can't access participant routes (if restricted)
- [ ] Participant can't access researcher routes

### Data Consistency
- [ ] FK constraints respected (no orphaned records)
- [ ] Cascading deletes work correctly
- [ ] UUID generation unique
- [ ] Timestamps set correctly

### UX/UI
- [ ] Loading states show
- [ ] Error states display
- [ ] Success toasts appear
- [ ] Error toasts appear
- [ ] Buttons disabled during operations
- [ ] Forms validate inputs
- [ ] Empty states display

### Performance
- [ ] Pages load within 2 seconds
- [ ] No console errors
- [ ] No memory leaks

---

## Status Legend
- [ ] Not tested
- [X] Tested & Working
- [!] Tested & Has Issues
- [~] Partially Working
