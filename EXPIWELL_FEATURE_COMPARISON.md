# Expiwell vs EasyResearch Feature Comparison

## ✅ Features We Have (Matching Expiwell)

### Project Management
- ✅ Create new research projects
- ✅ Project status (draft/published)
- ✅ Survey code generation
- ✅ Project title and description
- ✅ Project type (one-time, longitudinal, ESM)
- ✅ Delete projects

### Survey Builder
- ✅ Multiple question types (text, scale, single choice, multiple choice, etc.)
- ✅ Question ordering
- ✅ Required questions
- ✅ Question descriptions
- ✅ AI assistance toggle
- ✅ Voice input toggle
- ✅ Survey preview

### Project Settings
- ✅ Study duration (days)
- ✅ Survey frequency (hourly, daily, weekly, etc.)
- ✅ Start and end dates
- ✅ Max participants
- ✅ Compensation settings
- ✅ Notification enabled
- ✅ Do-not-disturb settings
- ✅ Onboarding required toggle
- ✅ Onboarding instructions

### Participant Features
- ✅ Join by survey code
- ✅ Join by link
- ✅ Survey enrollment
- ✅ Timeline/schedule view (ESM)
- ✅ Response submission
- ✅ Progress tracking

## ⚠️ Features We're Missing (From Expiwell)

### Survey Builder - Question Logic
- ❌ **Skip Logic**: Skip to specific question based on answer
- ❌ **Jump Logic**: Jump to specific question/block/end
- ❌ **Display Logic**: Conditionally show/hide questions
- ❌ **Piping**: Insert text from previous question answers
- ❌ **Question Screener**: Qualify/disqualify based on answers

### Survey Builder - Response Options
- ❌ **Pre-fill Choices**: Quick templates (Yes-No, Agree-Disagree, etc.)
- ❌ **Force Response**: Require response before continuing
- ❌ **Allow Skipping**: Explicit skip permission
- ❌ **Request Response**: Gentle prompt to answer

### Survey Builder - Scoring & Weights
- ❌ **Response Weights**: Assign weights to choices
- ❌ **Response Scores**: Score each choice
- ❌ **Zero-Indexed Scoring**: Start scoring from 0
- ❌ **Reverse Scoring**: Reverse score order

### Survey Builder - Advanced Options
- ❌ **"Other" Option**: Allow custom text input in multiple choice
- ❌ **"None of the Above"**: Add none option
- ❌ **Disable Backtracking**: Prevent going back to previous questions
- ❌ **Show Progress Bar**: Display % completion
- ❌ **Auto Next Question**: Auto-advance after selection
- ❌ **Question Randomization**: Randomize question order

### Scale/Slider Customization
- ❌ **Customize Scale Labels**: Custom labels for each point
- ❌ **Slider Start Position**: Left/Center/Right
- ❌ **Hide Slider Numbers**: Show only labels
- ❌ **Custom Scale Range**: Any min-max range

### Project Features
- ❌ **Project Folders**: Organize surveys in folders
- ❌ **Duplicate Project**: Copy entire project
- ❌ **Send Project Copy**: Share with restrictions
- ❌ **Project Tags**: Tag for organization
- ❌ **Permission Management**: Granular permissions for collaborators
- ❌ **PDF Export**: Export survey as PDF

### E-Consent Features
- ❌ **Signed E-Consent**: Digital signature capture
- ❌ **Email Participants**: Auto-email after consent
- ❌ **Email Researcher**: Notify researcher of consent
- ❌ **Display Participant ID**: Show unique ID to participant

### Group/Sync Features
- ❌ **Group Synchronization**: Sync notifications across group members
- ❌ **Group Member Settings**: Define group size

### Schedule/Distribution
- ❌ **Schedule Mapping**: Define specific notification schedules
- ❌ **Free Scheduling**: Flexible participant-chosen times
- ❌ **Notification Preview**: Preview notifications before sending

### Data & Analytics
- ❌ **Response Archive**: View all responses for a question
- ❌ **Response Charts**: Visual charts of responses
- ❌ **Delete Individual Responses**: Remove specific responses
- ❌ **Feedback Display**: Show feedback based on answers

## 🎯 Critical Features to Implement (Priority Order)

### High Priority (Must Have)
1. **Skip/Jump Logic**: Essential for complex surveys
2. **Display Logic**: Conditional question display
3. **Pre-fill Choices**: Saves time for common scales
4. **Force Response**: Critical for data quality
5. **Progress Bar**: Better UX for participants
6. **"Other" Option**: Common requirement for multiple choice

### Medium Priority (Should Have)
7. **Piping**: Professional survey feature
8. **Question Randomization**: Reduce bias
9. **Disable Backtracking**: Data integrity
10. **Response Scoring/Weights**: For assessment surveys
11. **Customize Scale Labels**: Better UX
12. **Project Duplication**: Researcher productivity

### Low Priority (Nice to Have)
13. **PDF Export**: Sharing/documentation
14. **E-Consent Signature**: Legal compliance
15. **Project Folders**: Organization for power users
16. **Permission Management**: Team collaboration
17. **Group Synchronization**: Niche use case

## 📊 Feature Coverage Summary

**Total Expiwell Features Identified**: ~50
**Features We Have**: ~25 (50%)
**Critical Missing Features**: 12
**Overall Feature Parity**: ~50%

## 🔧 Implementation Notes

### Our Advantages
- ✅ **Better UX**: Simpler, cleaner interface (Expiwell is confusing)
- ✅ **Mobile-First**: Full mobile editor (Expiwell desktop-heavy)
- ✅ **Modern Stack**: React + Supabase vs legacy stack
- ✅ **Real-time Updates**: Instant preview of changes

### Their UX Problems (DO NOT COPY)
- Complex navigation with unclear hierarchy
- Too many nested modals and popups
- Inconsistent terminology
- Hidden features that are hard to discover
- Desktop-centric design not mobile-friendly

## 🎯 Next Steps

1. Implement skip/jump/display logic system
2. Add pre-fill choice templates
3. Add force response and skip options
4. Implement progress bar
5. Add "Other" option to multiple choice
6. Add response scoring system
