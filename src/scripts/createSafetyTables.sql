-- Safety & Location Features Database Schema
-- Create tables for safety check-ins, emergency contacts, medications, and medication reminders

-- Safety Check-ins Table
CREATE TABLE IF NOT EXISTS care_connector.safety_check_ins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location_data JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('safe', 'emergency', 'check_in')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Contacts Table
CREATE TABLE IF NOT EXISTS care_connector.emergency_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications Table
CREATE TABLE IF NOT EXISTS care_connector.medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'weekly', 'as_needed')),
    times TEXT[] NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    prescriber TEXT,
    instructions TEXT,
    side_effects TEXT[],
    interactions TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication Reminders Table
CREATE TABLE IF NOT EXISTS care_connector.medication_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES care_connector.medications(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    taken BOOLEAN DEFAULT FALSE,
    taken_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication Log Table (for tracking adherence history)
CREATE TABLE IF NOT EXISTS care_connector.medication_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES care_connector.medications(id) ON DELETE CASCADE,
    reminder_id UUID REFERENCES care_connector.medication_reminders(id) ON DELETE SET NULL,
    taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
    dosage_taken TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_safety_check_ins_user_id ON care_connector.safety_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_check_ins_created_at ON care_connector.safety_check_ins(created_at);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON care_connector.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_is_primary ON care_connector.emergency_contacts(is_primary);
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON care_connector.medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_is_active ON care_connector.medications(is_active);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_user_id ON care_connector.medication_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_scheduled_time ON care_connector.medication_reminders(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_medication_id ON care_connector.medication_reminders(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_log_user_id ON care_connector.medication_log(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_log_taken_at ON care_connector.medication_log(taken_at);

-- Enable Row Level Security (RLS)
ALTER TABLE care_connector.safety_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.medication_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Safety Check-ins policies
CREATE POLICY "Users can view their own safety check-ins" ON care_connector.safety_check_ins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own safety check-ins" ON care_connector.safety_check_ins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Emergency Contacts policies
CREATE POLICY "Users can view their own emergency contacts" ON care_connector.emergency_contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency contacts" ON care_connector.emergency_contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts" ON care_connector.emergency_contacts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts" ON care_connector.emergency_contacts
    FOR DELETE USING (auth.uid() = user_id);

-- Medications policies
CREATE POLICY "Users can view their own medications" ON care_connector.medications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications" ON care_connector.medications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications" ON care_connector.medications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications" ON care_connector.medications
    FOR DELETE USING (auth.uid() = user_id);

-- Medication Reminders policies
CREATE POLICY "Users can view their own medication reminders" ON care_connector.medication_reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medication reminders" ON care_connector.medication_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication reminders" ON care_connector.medication_reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medication reminders" ON care_connector.medication_reminders
    FOR DELETE USING (auth.uid() = user_id);

-- Medication Log policies
CREATE POLICY "Users can view their own medication log" ON care_connector.medication_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medication log" ON care_connector.medication_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);
