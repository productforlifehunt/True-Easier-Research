# Care Connector App - Complete CRUD Operations Reference

This document lists **EVERY SINGLE** database operation in the app, organized by operation type and mapped to specific pages/features.

**Database Schema:** `care_connector` (all operations use this schema unless noted)

---

# 🔍 READ Operations (SELECT)

## 1. User Profile Operations

### `care_connector.profiles` table
**Used By:** 
- **AppStateProvider.tsx** - User session management
- **dataService.ts** - `getCaregiver()`, `getProfessionals()`, `getCareCheckers()` (fallback), `getFeaturedCaregivers()`
- **AdminAnalytics.tsx** - User count statistics
- **AdminDashboardPage.tsx** - User count statistics
- **MessagingSystem.tsx** - User names for conversations
- **Multiple pages** - User profile data

**Columns:** `id`, `role`, `first_name`, `last_name`, `full_name`, `bio`, `location`, `specialties`, `is_verified`, `hourly_rate`, `years_of_experience`, `average_rating`, `profile_picture_url`, `avatar_url`, `reviews_count`, `availability`, `created_at`, `updated_at`, `is_featured`

**Filters:** `role = 'caregiver'|'professional'|'companion'|'care_checker'|'facility'`, `is_verified = true`, `is_featured = true`

## 2. Care Provider Operations

### `care_connector.care_provider` table
**Used By:**
- **dataService.ts** - `getCaregivers()`, `getCompanions()`, `getCareCheckers()`
- **AdminAnalytics.tsx** - Provider count statistics
- **AdminDashboardPage.tsx** - Provider count statistics

**Columns:** `id`, `full_name`, `bio`, `location`, `care_provider_type`, `hourly_rate`, `average_rating`, `profile_picture_url`, `is_verified`, `years_of_experience`, `reviews_count`, `specialties`, `accepted_insurance_plans`

**Filters:** `care_provider_type = 'caregiver'|'companion'|'care_checker'`

## 3. Care Groups Operations

### `care_connector.care_groups` table
**Used By:**
- **dataService.ts** - `getCareGroups()`, `getUserCareGroups()`
- **AdminAnalytics.tsx** - Group count statistics
- **AdminDashboardPage.tsx** - Group count statistics
- **CareGroupSettingsPage.tsx** - Group management
- **CareGroupEventsPage.tsx** - Group information
- **CareGroupDetailPage.tsx** - Group details
- **JoinGroup.tsx** - Group information

**Columns:** `id`, `name`, `description`, `privacy_setting`, `created_at`, `updated_at`, `created_by`, `location`, `category_id`, `avatar_url`, `tags`, `welcome_message`, `rules_guidelines`, `member_count`, `max_members`

### `care_connector.care_group_members` table
**Used By:**
- **dataService.ts** - Member counts, user memberships, dashboard stats
- **CareGroupSettingsPage.tsx** - Member management
- **CareGroupEventsPage.tsx** - Event attendees
- **CareGroupDetailPage.tsx** - Member list
- **CareGroupMembersPage.tsx** - Member management
- **JoinGroup.tsx** - Membership checking

**Columns:** `group_id`, `user_id`, `joined_at`, `role`

### `care_connector.care_group_activity` table
**Used By:**
- **CareGroupSettingsPage.tsx** - Activity deletion
- **CareGroupEventsPage.tsx** - Activity logging

**Columns:** `group_id`, `user_id`, `activity_type`

## 4. Booking Operations

### `care_connector.bookings` table
**Used By:**
- **dataService.ts** - Dashboard statistics, recent activity
- **BookingStatusPage.tsx** - User bookings
- **BookingOverviewPage.tsx** - Booking overview
- **BookingAnalyticsPage.tsx** - Booking analytics

**Columns:** `id`, `user_id`, `provider_id`, `status`, `start_time`, `end_time`, `created_at`

### `care_connector.service_provider_bookings` table
**Used By:**
- **Appointments.tsx** - Creating appointments
- **AdminAnalytics.tsx** - Booking count statistics
- **AdminDashboardPage.tsx** - Booking count statistics
- **CreateBookingPage.tsx** - Creating bookings
- **ProviderProfile.tsx** - Booking creation

**Columns:** Various booking fields for service providers

### `care_connector.recurring_bookings` table
**Used By:**
- **BookingRecurringPage.tsx** - Recurring appointment management

**Columns:** `client_id`, `provider_id`, `frequency`

## 5. Reviews & Ratings Operations

### `care_connector.service_provider_reviews` table
**Used By:**
- **dataService.ts** - `getRealRatingForProfile()`, `getReviewsForProfile()`, homepage statistics

**Columns:** `id`, `rating`, `review_text`, `created_at`, `user_id`, `caregiver_id`, `professional_id`, `companion_id`, `care_checker_id`, `is_hidden_by_moderator`

## 6. Messaging Operations

### `care_connector.messages` table
**Used By:**
- **dataService.ts** - `getMessages()`
- **MessagingSystem.tsx** - Chat functionality
- **SecureMessaging.tsx** - Secure messaging
- **ProviderProfile.tsx** - Direct messaging

**Columns:** `id`, `sender_id`, `receiver_id`, `message`, `created_at`, `is_read`, `conversation_id`

### `care_connector.conversations` table
**Used By:**
- **MessagingSystem.tsx** - Conversation management
- **ProviderProfile.tsx** - Creating conversations

**Columns:** `participant_1_id`, `participant_2_id`

## 7. CMS & Content Operations

### `care_connector.cms_content` table
**Used By:**
- **dataService.ts** - Homepage content sections

**Columns:** `section`, `content`
**Sections:** `homepage_search`, `footer`, `homepage_features`, `homepage_tools`

### `care_connector.homepage_content` table
**Used By:**
- **dataService.ts** - Homepage sections

**Columns:** `section`
**Sections:** `featured_providers`, `provider_network`, `take_control`

### `care_connector.cms_pages` table
**Used By:**
- **dataService.ts** - `getHeroContent()`

**Columns:** `slug`

### `care_connector.features` table
**Used By:**
- **dataService.ts** - `getFeatures()`

**Columns:** `is_active`, `display_order`

### `care_connector.tools` table
**Used By:**
- **dataService.ts** - `getEssentialTools()`

**Columns:** `is_featured`, `display_order`

### `care_connector.security_badges` table
**Used By:**
- **dataService.ts** - `getSecurityBadges()`

**Columns:** `is_active`, `display_order`

## 8. Filter & Options Operations

### `care_connector.care_types` table
**Used By:**
- **dataService.ts** - `getSearchFilterOptions()`

**Columns:** `id`, `name`, `description`, `is_active`, `display_order`

### `care_connector.languages` table
**Used By:**
- **dataService.ts** - `getSearchFilterOptions()`

**Columns:** `id`, `name`, `code`, `is_active`

### `care_connector.insurance_providers` table
**Used By:**
- **dataService.ts** - `getSearchFilterOptions()`

**Columns:** `id`, `name`, `type`, `is_active`

### `care_connector.certifications` table
**Used By:**
- **dataService.ts** - `getSearchFilterOptions()`

**Columns:** `id`, `name`, `category`, `is_active`

## 9. Other Tables (READ)

### `care_connector.notifications` table
**Used By:**
- **dataService.ts** - `getNotifications()`

**Columns:** `user_id`, `created_at`

### `care_connector.tasks` table
**Used By:**
- **dataService.ts** - `getTasks()`

**Columns:** `created_at`

### `care_connector.saved_providers` table
**Used By:**
- **dataService.ts** - Dashboard statistics

**Columns:** `user_id`

### `care_connector.medications` table
**Used By:**
- **MedicationManagement.tsx** - Medication tracking

### `care_connector.security_audit_log` table
**Used By:**
- **securityAuditService.ts** - Security monitoring

**Columns:** `event_type`, `created_at`

### `care_connector.user_preferences` table
**Used By:**
- **BookingPreferencesPage.tsx** - User booking preferences
- **BookingRemindersPage.tsx** - Reminder settings

### `care_connector.user_payment_methods` table
**Used By:**
- **BookingPaymentPage.tsx** - Payment method management

### `care_connector.platform_settings` table
**Used By:**
- **AdminSettings.tsx** - Platform configuration

---

# ✍️ CREATE Operations (INSERT)

## 1. Reviews & Ratings Creation
### `care_connector.service_provider_reviews` table
**Used By:**
- **dataService.ts** - `submitRealReview()`

**Columns:** `caregiver_id`/`professional_id`/`companion_id`/`care_checker_id`, `user_id`, `rating`, `review_text`, `created_at`, `is_hidden_by_moderator`

## 2. Care Group Management
### `care_connector.care_group_members` table
**Used By:**
- **dataService.ts** - `joinCareGroup()`
- **CareGroups.tsx** - Creating group membership for creator
- **CareGroupDetailPage.tsx** - Joining groups
- **CareGroupMembersPage.tsx** - Adding members
- **JoinGroup.tsx** - Joining groups

**Columns:** `group_id`, `user_id`, `joined_at`, `role`

### `care_connector.care_groups` table
**Used By:**
- **CareGroups.tsx** - Creating new care groups

**Columns:** `name`, `description`, `location`, `created_by`

## 3. Messaging System
### `care_connector.messages` table
**Used By:**
- **MessagingSystem.tsx** - Sending messages
- **SecureMessaging.tsx** - Secure messaging
- **ProviderProfile.tsx** - Direct messaging

**Columns:** `conversation_id`, `sender_id`, `receiver_id`, `message`, `created_at`

### `care_connector.conversations` table
**Used By:**
- **MessagingSystem.tsx** - Creating conversations
- **ProviderProfile.tsx** - Creating conversations

**Columns:** `participant_1_id`, `participant_2_id`

## 4. Booking Operations
### `care_connector.service_provider_bookings` table
**Used By:**
- **Appointments.tsx** - Creating appointments
- **CreateBookingPage.tsx** - Creating bookings
- **ProviderProfile.tsx** - Creating bookings

### `care_connector.recurring_bookings` table
**Used By:**
- **BookingRecurringPage.tsx** - Creating recurring bookings

**Columns:** `client_id`, `provider_id`, `frequency`

### `care_connector.booking_reminders` table
**Used By:**
- **BookingRemindersPage.tsx** - Creating reminders

**Columns:** `user_id`

## 5. User Profile Creation
### `care_connector.profiles` table
**Used By:**
- **ProvideCare.tsx** - Creating care provider profiles

**Columns:** `id`, `first_name`, `last_name`, `role`, `bio`, `location`

## 6. Events & Activities
### `care_connector.care_group_events` table
**Used By:**
- **CareGroupEventsPage.tsx** - Creating events

**Columns:** `group_id`, `title`, `description`

### `care_connector.care_group_event_attendees` table
**Used By:**
- **CareGroupEventsPage.tsx** - Event attendance

**Columns:** `event_id`, `user_id`, `status`

### `care_connector.care_group_activity` table
**Used By:**
- **CareGroupEventsPage.tsx** - Activity logging

**Columns:** `group_id`, `user_id`, `activity_type`

## 7. Safety & Security
### `care_connector.safety_check_ins` table
**Used By:**
- **SafetyLocation.tsx** - Safety check-ins and emergency alerts

### `care_connector.emergency_contacts` table
**Used By:**
- **SafetyLocation.tsx** - Emergency contact management

### `care_connector.security_audit_log` table
**Used By:**
- **securityAuditService.ts** - Security event logging

## 8. Health Management
### `care_connector.medications` table
**Used By:**
- **MedicationManagement.tsx** - Adding medications

## 9. Notifications
### `care_connector.notifications` table
**Used By:**
- **ProviderProfile.tsx** - Creating notifications for providers

**Columns:** `user_id`, `type`, `title`

## 10. Payment & Preferences
### `care_connector.user_payment_methods` table
**Used By:**
- **BookingPaymentPage.tsx** - Adding payment methods

**Columns:** `user_id`, `type`, `last_four`

---

# 🔄 UPDATE Operations (UPDATE/UPSERT)

## 1. Care Group Management
### `care_connector.care_groups` table
**Used By:**
- **dataService.ts** - `joinCareGroup()` (member count updates)

**Columns:** `member_count`

### `care_connector.care_group_event_attendees` table
**Used By:**
- **CareGroupEventsPage.tsx** - Updating event attendance

**Columns:** `event_id`, `user_id`, `status`

## 2. User Preferences
### `care_connector.user_preferences` table
**Used By:**
- **BookingPreferencesPage.tsx** - Updating booking preferences
- **BookingRemindersPage.tsx** - Updating reminder settings

**Columns:** `user_id`, `booking_preferences`, `reminder_settings`, `updated_at`

## 3. Platform Settings
### `care_connector.platform_settings` table
**Used By:**
- **AdminSettings.tsx** - Platform configuration updates

## 4. Profile Updates
### `care_connector.profiles` table
**Used By:**
- **dataService.ts** - `updateUserProfile()`

**Columns:** Any profile field can be updated

---

# 🗑️ DELETE Operations

## 1. Care Group Operations
### `care_connector.care_group_members` table
**Used By:**
- **CareGroupSettingsPage.tsx** - Group deletion (delete all members)

**Filter:** `group_id`

### `care_connector.care_group_activity` table
**Used By:**
- **CareGroupSettingsPage.tsx** - Group deletion (delete all activity)

**Filter:** `group_id`

### `care_connector.care_groups` table
**Used By:**
- **CareGroupSettingsPage.tsx** - Group deletion

**Filter:** `id`

---

# 🔐 AUTH Operations (Supabase Auth)

## Authentication Methods
**Used By:**
- **AppStateProvider.tsx** - Session management
- **dataService.ts** - Sign in/out methods
- **authService.ts** - Complete auth service
- **SignIn.tsx** - User login
- **ForgotPassword.tsx** - Password reset
- **ProvideCare.tsx** - Provider registration
- **Multiple pages** - User session checking

**Operations:**
- `supabase.auth.getSession()`
- `supabase.auth.getUser()`
- `supabase.auth.signInWithPassword()`
- `supabase.auth.signOut()`
- `supabase.auth.signUp()`
- `supabase.auth.resetPasswordForEmail()`
- `supabase.auth.updateUser()`
- `supabase.auth.signInWithOAuth()`
- `supabase.auth.onAuthStateChange()`

---

# 🚨 CRITICAL CONSISTENCY ISSUES FOUND

## 1. **PROVIDER DATA INCONSISTENCY** ⚠️
**Problem:** Care providers are accessed through **TWO DIFFERENT TABLES**:
- **Primary:** `care_connector.care_provider` 
- **Fallback:** `care_connector.profiles`

**Affected Features:**
- Caregivers: Uses `care_provider` then falls back to `profiles`
- Companions: Uses `care_provider` then falls back to `profiles`
- Professionals: **ONLY** uses `profiles`  
- Care Checkers: Uses `care_provider` then falls back to `profiles`

**Inconsistency:** Same data (names, rates, ratings) stored in different columns across tables.

## 2. **BOOKING TABLE CONFUSION** ⚠️
**Problem:** Two different booking tables used:
- `care_connector.bookings` - Used by dashboard and statistics
- `care_connector.service_provider_bookings` - Used by actual booking pages

**Risk:** Booking data fragmented across multiple tables.

## 3. **PROFILE IMAGE INCONSISTENCY** ⚠️
**Problem:** Profile images stored in different columns:
- `profile_picture_url` in `care_provider` table
- `avatar_url` in `profiles` table

**Risk:** Same user might have different profile images in different views.

## 4. **NAME FIELD INCONSISTENCY** ⚠️
**Problem:** Names stored differently:
- `full_name` in `care_provider` table
- `first_name` + `last_name` in `profiles` table
- Code manually combines `first_name` + `last_name` to create `full_name`

**Risk:** Name display inconsistencies across the app.

---

# 📋 COMPLETE TABLE SUMMARY

**Tables with READ operations:** 22 tables
**Tables with CREATE operations:** 15 tables  
**Tables with UPDATE operations:** 6 tables
**Tables with DELETE operations:** 3 tables

**Most Critical Tables:**
1. **`profiles`** - 25+ operations across entire app
2. **`care_provider`** - Primary provider data but inconsistent usage
3. **`care_group_members`** - Full CRUD operations
4. **`messages`** - Communication system
5. **`service_provider_reviews`** - Rating system
6. **`bookings`** vs **`service_provider_bookings`** - Booking confusion

**Schema Compliance:** ✅ All operations use `care_connector` schema
**RPC Usage:** ✅ No RPC functions used (compliant)
**Consistency Status:** ❌ **MAJOR ISSUES FOUND** - Provider data fragmented across multiple tables
