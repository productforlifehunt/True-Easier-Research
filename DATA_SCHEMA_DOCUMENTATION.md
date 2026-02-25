# Care Connector Survey App - Complete Data Schema Documentation

## Table of Contents
1. [Database Overview](#database-overview)
2. [Schema Configuration](#schema-configuration)
3. [Tables Structure](#tables-structure)
4. [Query Methods](#query-methods)
5. [Frontend Integration](#frontend-integration)
6. [Data Flow](#data-flow)
7. [Best Practices](#best-practices)

---

## Database Overview

**Database Type:** PostgreSQL (Supabase)  
**Project ID:** yekarqanirdkdckimpna  
**Project URL:** https://yekarqanirdkdckimpna.supabase.co  
**Schema:** care_connector  
**RLS (Row Level Security):** Disabled (frontend handles permissions)

### Active Tables for Survey App

| Table Name | Purpose | Rows | RLS Enabled |
|------------|---------|------|-------------|
| `survey_entries` | Stores all survey entry data (activities, needs, struggles) | Active | No |
| `auth.users` | Supabase authentication (managed by Supabase Auth) | Active | Yes |

**Note:** The `survey_users` table exists but is NOT used. Authentication is handled by Supabase Auth (`auth.users`).

---

## Schema Configuration

### Supabase Client Setup

```typescript
// Location: src/lib/supabase.ts

export const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const SHARED_STORAGE_KEY = 'sb-yekarqanirdkdckimpna-auth-token';

// Auth-only client - NO schema override
export const authClient = createClient(supabaseUrl, supabaseKey, {
  auth: { 
    persistSession: true, 
    storageKey: SHARED_STORAGE_KEY 
  }
});

// Data client - WITH care_connector schema
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { 
    persistSession: true, 
    storageKey: SHARED_STORAGE_KEY 
  },
  db: { 
    schema: 'care_connector'  // ← Schema set ONCE here
  },
  global: {
    headers: {
      'Accept-Profile': 'care_connector',
      'Content-Profile': 'care_connector'
    }
  }
});
```

**Critical Rules:**
- ✅ Schema configured ONCE at client initialization
- ❌ NEVER add schema prefix to queries (e.g., `.from('care_connector.table')`)
- ❌ NEVER use `.schema('care_connector')` in individual queries
- ✅ Always use `supabase.from('table_name')` directly

---

## Tables Structure

### 1. `survey_entries` (Primary Data Table)

**Purpose:** Stores all dementia caregiving survey entries including daily activities, care needs, and struggles.

**Location:** `care_connector.survey_entries`

#### Column Structure

| Column Name | Data Type | Constraints | Default | Description |
|-------------|-----------|-------------|---------|-------------|
| `id` | `integer` | PRIMARY KEY, AUTO INCREMENT | `nextval('survey_entries_id_seq')` | Unique entry identifier |
| `entry_type` | `varchar` | NOT NULL, CHECK | - | Type of entry: 'care_activity', 'care_need', or 'struggle' |
| `description` | `text` | NOT NULL | - | Main description of the activity/need/struggle |
| `difficulties_challenges` | `text` | NULLABLE | NULL | Difficulties or challenges encountered |
| `person_want_to_do_with` | `varchar` | NULLABLE | NULL | Person the user wishes to do this activity with |
| `struggles_encountered` | `text` | NULLABLE | NULL | Additional struggles encountered during the activity |
| `entry_timestamp` | `timestamptz` | NULLABLE | `now()` | Timestamp when the entry occurred |
| `created_at` | `timestamptz` | NULLABLE | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | NULLABLE | `now()` | Record last update timestamp |
| `user_id` | `uuid` | NOT NULL, FOREIGN KEY | - | References `auth.users.id` |

#### Constraints

**Primary Key:**
```sql
PRIMARY KEY (id)
```

**Foreign Key:**
```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id)
```

**Check Constraint:**
```sql
CHECK (entry_type IN ('care_activity', 'care_need', 'struggle'))
```

#### Indexes

```sql
-- Auto-generated primary key index
CREATE INDEX survey_entries_pkey ON survey_entries(id);

-- Recommended additional indexes for performance
CREATE INDEX idx_survey_entries_user_id ON survey_entries(user_id);
CREATE INDEX idx_survey_entries_entry_timestamp ON survey_entries(entry_timestamp DESC);
CREATE INDEX idx_survey_entries_entry_type ON survey_entries(entry_type);
```

---

### 2. `auth.users` (Authentication Table)

**Purpose:** Managed by Supabase Auth. Stores user authentication data.

**Location:** `auth.users` (public schema, managed by Supabase)

#### Key Fields Used

| Field Name | Type | Usage |
|------------|------|-------|
| `id` | `uuid` | Primary user identifier, used as foreign key in survey_entries |
| `email` | `text` | User email for login |
| `created_at` | `timestamptz` | Account creation timestamp |
| `user_metadata` | `jsonb` | Stores additional user data (role, full_name, etc.) |

**Note:** We do NOT query this table directly. Supabase Auth SDK manages it.

---

## Query Methods

### Location: `src/lib/dataService.ts`

All database operations go through the `dataService` object. This ensures consistency and maintainability.

### CREATE Operation

**Method:** `createSurveyEntry(entry: any)`

**Purpose:** Insert a new survey entry into the database.

**Implementation:**
```typescript
async createSurveyEntry(entry: any) {
  try {
    const mappedEntry = {
      user_id: entry.user_id,
      entry_type: entry.type || entry.entry_type,
      description: entry.description,
      difficulties_challenges: entry.difficulties_challenges,
      person_want_to_do_with: entry.person_want_to_do_with,
      struggles_encountered: entry.struggles_encountered,
      entry_timestamp: entry.timestamp || new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('survey_entries')  // ← NO schema prefix
      .insert([mappedEntry])
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating survey entry:', error)
    throw error
  }
}
```

**Query Pattern:**
```sql
INSERT INTO survey_entries (
  user_id, entry_type, description, difficulties_challenges, 
  person_want_to_do_with, struggles_encountered, entry_timestamp
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;
```

**Frontend Usage:**
```typescript
const newEntry = await dataService.createSurveyEntry({
  user_id: user.id,
  entry_type: 'care_activity',
  description: 'Helped with morning routine',
  difficulties_challenges: 'Patient was resistant'
});
```

---

### READ Operation

**Method:** `getSurveyEntries(userId: string)`

**Purpose:** Fetch all survey entries for a specific user, ordered by most recent first.

**Implementation:**
```typescript
async getSurveyEntries(userId: string) {
  try {
    const { data, error } = await supabase
      .from('survey_entries')  // ← NO schema prefix
      .select('*')
      .eq('user_id', userId)
      .order('entry_timestamp', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching survey entries:', error)
    return []
  }
}
```

**Query Pattern:**
```sql
SELECT * 
FROM survey_entries 
WHERE user_id = $1 
ORDER BY entry_timestamp DESC;
```

**Frontend Usage:**
```typescript
const entries = await dataService.getSurveyEntries(user.id);
// Returns array of entries, newest first
```

---

### UPDATE Operation

**Method:** `updateSurveyEntry(id: number, updates: any)`

**Purpose:** Update an existing survey entry.

**Implementation:**
```typescript
async updateSurveyEntry(id: number, updates: any) {
  try {
    const mappedUpdates = {
      ...updates,
      entry_type: updates.type || updates.entry_type,
      entry_timestamp: updates.timestamp || updates.entry_timestamp,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('survey_entries')  // ← NO schema prefix
      .update(mappedUpdates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating survey entry:', error)
    throw error
  }
}
```

**Query Pattern:**
```sql
UPDATE survey_entries 
SET 
  entry_type = $1,
  description = $2,
  difficulties_challenges = $3,
  updated_at = $4
WHERE id = $5
RETURNING *;
```

**Frontend Usage:**
```typescript
const updated = await dataService.updateSurveyEntry(entryId, {
  description: 'Updated description',
  difficulties_challenges: 'New challenges noted'
});
```

---

### DELETE Operation

**Method:** `deleteSurveyEntry(id: number)`

**Purpose:** Delete a survey entry by ID.

**Implementation:**
```typescript
async deleteSurveyEntry(id: number) {
  try {
    const { error } = await supabase
      .from('survey_entries')  // ← NO schema prefix
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting survey entry:', error)
    throw error
  }
}
```

**Query Pattern:**
```sql
DELETE FROM survey_entries 
WHERE id = $1;
```

**Frontend Usage:**
```typescript
await dataService.deleteSurveyEntry(entryId);
```

---

## Frontend Integration

### Component: `DementiaCaregiverSurvey.tsx`

**Location:** `src/pages/DementiaCaregiverSurvey.tsx`

**Purpose:** Main survey form component with full CRUD functionality.

#### Data Flow

```
User Action → Component State → dataService Method → Supabase Client → PostgreSQL
                ↓
           UI Update ← Component State Update ← Response Data
```

#### State Management

```typescript
interface SurveyEntry {
  id: number;
  entry_type: string;
  description: string;
  difficulties_challenges?: string;
  person_want_to_do_with?: string;
  struggles_encountered?: string;
  entry_timestamp: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const [entries, setEntries] = useState<SurveyEntry[]>([]);
const [loading, setLoading] = useState(true);
const [editingId, setEditingId] = useState<number | null>(null);
const [showCreateForm, setShowCreateForm] = useState(false);
```

#### CRUD Operations in Component

**READ (on mount):**
```typescript
useEffect(() => {
  const loadEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await dataService.getSurveyEntries(user.id);
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  loadEntries();
}, [user]);
```

**CREATE:**
```typescript
const handleCreate = async () => {
  if (!user) return;

  try {
    const newEntry = {
      user_id: user.id,
      ...formData  // entry_type, description, etc.
    };

    const created = await dataService.createSurveyEntry(newEntry);
    if (created && created[0]) {
      setEntries([created[0], ...entries]);  // Add to top of list
      setFormData({ /* reset */ });
      setShowCreateForm(false);
    }
  } catch (error) {
    console.error('Error creating entry:', error);
  }
};
```

**UPDATE:**
```typescript
const handleUpdate = async (id: number) => {
  try {
    const updated = await dataService.updateSurveyEntry(id, formData);
    if (updated && updated[0]) {
      setEntries(entries.map(e => e.id === id ? updated[0] : e));
      setEditingId(null);
    }
  } catch (error) {
    console.error('Error updating entry:', error);
  }
};
```

**DELETE:**
```typescript
const handleDelete = async (id: number) => {
  try {
    await dataService.deleteSurveyEntry(id);
    setEntries(entries.filter(e => e.id !== id));
  } catch (error) {
    console.error('Error deleting entry:', error);
  }
};
```

---

## Data Flow

### Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  DementiaCaregiverSurvey Component (React)                          │
│  - User clicks "Add Entry" button                                   │
│  - Fills form with entry_type, description, etc.                    │
│  - Clicks "Save"                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  handleCreate() Function                                             │
│  - Validates user is logged in                                       │
│  - Prepares entry object with user_id                                │
│  - Calls dataService.createSurveyEntry()                             │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  dataService.createSurveyEntry() (src/lib/dataService.ts)           │
│  - Maps fields to database schema                                    │
│  - Calls supabase.from('survey_entries').insert()                    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Supabase Client (src/lib/supabase.ts)                              │
│  - Configured with care_connector schema                             │
│  - Sends HTTP POST to Supabase REST API                             │
│  - Headers: Accept-Profile: care_connector                           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Supabase REST API (yekarqanirdkdckimpna.supabase.co)               │
│  - Authenticates request with anon key                               │
│  - Validates JWT token for user_id                                   │
│  - Routes to PostgreSQL                                              │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PostgreSQL Database (care_connector schema)                         │
│  - Executes: INSERT INTO survey_entries (...) VALUES (...) RETURNING *│
│  - Validates constraints (CHECK, FOREIGN KEY)                         │
│  - Returns new entry with generated id, timestamps                    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Response flows back through:                                        │
│  Supabase API → Supabase Client → dataService → Component           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Component State Update                                              │
│  - setEntries([newEntry, ...oldEntries])                            │
│  - React re-renders with new entry visible                          │
│  - User sees entry in list immediately                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. Query Patterns

**✅ DO:**
```typescript
// Correct - No schema prefix
await supabase.from('survey_entries').select('*')
```

**❌ DON'T:**
```typescript
// Wrong - Schema prefix breaks queries
await supabase.from('care_connector.survey_entries').select('*')
await supabase.schema('care_connector').from('survey_entries').select('*')
```

### 2. Error Handling

```typescript
// Always wrap in try-catch
try {
  const { data, error } = await supabase.from('survey_entries').select('*')
  if (error) throw error
  return data
} catch (error) {
  console.error('Database error:', error)
  // Return safe default or throw
  return []
}
```

### 3. Field Mapping

```typescript
// Map frontend field names to database column names
const mappedEntry = {
  user_id: entry.user_id,
  entry_type: entry.type || entry.entry_type,  // Handle both names
  description: entry.description,
  // ... etc
}
```

### 4. Date Handling

```typescript
// Always use ISO strings for timestamps
entry_timestamp: new Date().toISOString()

// Let PostgreSQL handle defaults when possible
// created_at, updated_at use DEFAULT now()
```

### 5. User Context

```typescript
// Always validate user is authenticated
if (!user) {
  console.error('User not authenticated')
  return
}

// Always include user_id in queries
.eq('user_id', user.id)
```

---

## Authentication Flow

### Login Process

```
User enters email/password
         ↓
SurveyPlatform.handleEmailSignIn()
         ↓
login() from useAuth hook
         ↓
dataService.signIn(email, password)
         ↓
supabase.auth.signInWithPassword({ email, password })
         ↓
Supabase Auth verifies credentials
         ↓
Returns session with user object
         ↓
useAuth dispatches AUTH_LOGIN_SUCCESS
         ↓
User data stored in AppStateProvider
         ↓
Component re-renders with user context
         ↓
DementiaCaregiverSurvey loads user's entries
```

### User Object Structure

```typescript
interface User {
  id: string;              // UUID from auth.users.id
  email: string;           // From auth.users.email
  full_name: string;       // From user_metadata
  first_name: string;      // From user_metadata
  last_name: string;       // From user_metadata
  avatar_url: string;      // From user_metadata
  phone: string;           // From user_metadata
  role: string;            // From user_metadata (default: 'caregiver')
  is_verified: boolean;    // From user_metadata
  created_at: string;      // From auth.users.created_at
  updated_at: string;      // From auth.users.updated_at
}
```

---

## Database Migrations

### Current Schema Version

**Migration:** `create_survey_entries_table`

```sql
-- Create survey_entries table
CREATE TABLE care_connector.survey_entries (
  id SERIAL PRIMARY KEY,
  entry_type VARCHAR CHECK (entry_type IN ('care_activity', 'care_need', 'struggle')),
  description TEXT NOT NULL,
  difficulties_challenges TEXT,
  person_want_to_do_with VARCHAR,
  struggles_encountered TEXT,
  entry_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_survey_entries_user_id ON care_connector.survey_entries(user_id);
CREATE INDEX idx_survey_entries_entry_timestamp ON care_connector.survey_entries(entry_timestamp DESC);
```

---

## Environment Variables

**Location:** `.env`

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://yekarqanirdkdckimpna.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development
VITE_PORT=4002
```

**Usage in Code:**
```typescript
// NOT USED - Values are hardcoded in supabase.ts
// This is intentional for stability
export const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## Testing

### Manual Testing Checklist

**CREATE:**
- [ ] User can add new care_activity entry
- [ ] User can add new care_need entry
- [ ] User can add new struggle entry
- [ ] Entry appears immediately in list
- [ ] Timestamp is correct
- [ ] user_id matches logged-in user

**READ:**
- [ ] All user's entries load on page mount
- [ ] Entries are sorted by timestamp (newest first)
- [ ] No other user's entries visible

**UPDATE:**
- [ ] User can edit their own entries
- [ ] Changes save correctly
- [ ] updated_at timestamp updates
- [ ] Cannot edit other user's entries

**DELETE:**
- [ ] User can delete their own entries
- [ ] Entry removed from UI immediately
- [ ] Entry removed from database
- [ ] Cannot delete other user's entries

### Database Verification

```sql
-- Check total entries
SELECT COUNT(*) FROM care_connector.survey_entries;

-- Check entries by type
SELECT entry_type, COUNT(*) 
FROM care_connector.survey_entries 
GROUP BY entry_type;

-- Check recent entries
SELECT id, entry_type, description, entry_timestamp 
FROM care_connector.survey_entries 
ORDER BY entry_timestamp DESC 
LIMIT 10;

-- Check entries for specific user
SELECT * FROM care_connector.survey_entries 
WHERE user_id = 'USER_UUID_HERE';
```

---

## Troubleshooting

### Common Issues

**Issue:** Queries hang indefinitely
**Cause:** Wrong Supabase anon key
**Solution:** Verify key with `mcp3_get_anon_key` and update `supabase.ts`

**Issue:** "No entries found" but data exists
**Cause:** Schema prefix in query (e.g., `from('care_connector.survey_entries')`)
**Solution:** Remove schema prefix, use `from('survey_entries')` only

**Issue:** Auth works but queries fail
**Cause:** Missing schema configuration in client
**Solution:** Verify `db: { schema: 'care_connector' }` in supabase.ts

**Issue:** User not found after login
**Cause:** Querying `profiles` table instead of using `auth.user`
**Solution:** Use `session.user` data directly, don't query profiles table

---

## Performance Considerations

### Indexing Strategy

**Current Indexes:**
- Primary key on `id` (auto-generated)
- Index on `user_id` (for user-specific queries)
- Index on `entry_timestamp DESC` (for recent entries)

**Query Performance:**
```sql
-- Fast - Uses user_id index
SELECT * FROM survey_entries WHERE user_id = $1;

-- Fast - Uses timestamp index  
SELECT * FROM survey_entries ORDER BY entry_timestamp DESC LIMIT 10;

-- Fast - Uses both indexes
SELECT * FROM survey_entries 
WHERE user_id = $1 
ORDER BY entry_timestamp DESC;
```

### Optimization Tips

1. **Limit Results:** Use `.limit(n)` for paginated queries
2. **Select Specific Fields:** Use `.select('id, description')` instead of `*`
3. **Filter Early:** Add WHERE clauses before ORDER BY
4. **Use Prepared Statements:** Supabase client handles this automatically

---

## Security Notes

**RLS (Row Level Security):** Disabled for survey app
- Frontend handles user context and filtering
- All queries include `.eq('user_id', userId)` filter
- Supabase Auth JWT validates user identity

**API Key Security:**
- Anon key is public (safe to expose)
- User-specific data protected by JWT token
- Service role key NEVER exposed to frontend

**Data Validation:**
- CHECK constraints on entry_type
- FOREIGN KEY constraint on user_id
- NOT NULL constraints on required fields

---

## Future Enhancements

### Potential Schema Updates

1. **Add Indexes:**
```sql
CREATE INDEX idx_survey_entries_entry_type ON survey_entries(entry_type);
CREATE INDEX idx_survey_entries_created_at ON survey_entries(created_at DESC);
```

2. **Add Full-Text Search:**
```sql
ALTER TABLE survey_entries ADD COLUMN search_vector tsvector;
CREATE INDEX idx_survey_entries_search ON survey_entries USING gin(search_vector);
```

3. **Add Soft Delete:**
```sql
ALTER TABLE survey_entries ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_survey_entries_not_deleted ON survey_entries(id) WHERE deleted_at IS NULL;
```

---

## Appendix

### Complete dataService.ts Reference

```typescript
export const dataService = {
  // Auth methods
  signIn(email: string, password: string),
  signOut(),
  getCurrentUser(),
  
  // Survey CRUD methods
  getSurveyEntries(userId: string),
  createSurveyEntry(entry: any),
  updateSurveyEntry(id: number, updates: any),
  deleteSurveyEntry(id: number),
  
  // Legacy compatibility
  getCareLogEntries(userId: string),  // → getSurveyEntries
  createCareLogEntry(entry: any),     // → createSurveyEntry
  updateCareLogEntry(id, updates),    // → updateSurveyEntry
  deleteCareLogEntry(id)              // → deleteSurveyEntry
}
```

### Complete Survey Entry Type

```typescript
interface SurveyEntry {
  id: number;                          // Database ID
  entry_type: 'care_activity' | 'care_need' | 'struggle';
  description: string;                  // Required
  difficulties_challenges?: string;     // Optional
  person_want_to_do_with?: string;     // Optional
  struggles_encountered?: string;       // Optional
  entry_timestamp: string;             // ISO timestamp
  created_at: string;                  // ISO timestamp
  updated_at: string;                  // ISO timestamp
  user_id: string;                     // UUID
}
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-23  
**Author:** Care Connector Development Team  
**Status:** Production Ready
