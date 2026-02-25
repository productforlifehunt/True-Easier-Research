-- Care Log Table for Dementia Caregiver Survey
-- This table stores daily care activities, needs, and struggles logged by caregivers

CREATE TABLE IF NOT EXISTS care_connector.care_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('care_activity', 'care_need', 'struggle')),
    description TEXT NOT NULL,
    person_doing_with TEXT,
    person_want_to_do_with TEXT,
    struggles_encountered TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_care_log_user_id ON care_connector.care_log(user_id);
CREATE INDEX IF NOT EXISTS idx_care_log_timestamp ON care_connector.care_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_care_log_type ON care_connector.care_log(type);
CREATE INDEX IF NOT EXISTS idx_care_log_created_at ON care_connector.care_log(created_at);

-- Enable Row Level Security (RLS) - following user memory requirement for zero RLS
-- NOTE: Based on user requirements, this app needs ZERO RLS policies for collaboration
-- Commenting out RLS to maintain open access for collaboration features
-- ALTER TABLE care_connector.care_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (DISABLED per user requirements)
-- CREATE POLICY "Users can view their own care log entries" ON care_connector.care_log
--     FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own care log entries" ON care_connector.care_log
--     FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own care log entries" ON care_connector.care_log
--     FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own care log entries" ON care_connector.care_log
--     FOR DELETE USING (auth.uid() = user_id);

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION care_connector.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_care_log_updated_at BEFORE UPDATE
ON care_connector.care_log FOR EACH ROW EXECUTE FUNCTION
care_connector.update_updated_at_column();
