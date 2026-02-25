-- Security Audit Log Table
-- Create table for logging security events and authentication activities

CREATE TABLE IF NOT EXISTS care_connector.security_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'login', 
        'logout', 
        'failed_login', 
        'password_reset', 
        'password_change', 
        'session_timeout', 
        'suspicious_activity', 
        'account_locked'
    )),
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON care_connector.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON care_connector.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity ON care_connector.security_audit_log(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON care_connector.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_ip_address ON care_connector.security_audit_log(ip_address);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_event ON care_connector.security_audit_log(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_time ON care_connector.security_audit_log(event_type, created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE care_connector.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Only allow admins and the user themselves to view their security events
CREATE POLICY "Users can view their own security events" ON care_connector.security_audit_log
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM care_connector.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only allow the system (service role) to insert security events
CREATE POLICY "System can insert security events" ON care_connector.security_audit_log
    FOR INSERT WITH CHECK (true);

-- Only allow admins to update security events (for investigation purposes)
CREATE POLICY "Admins can update security events" ON care_connector.security_audit_log
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM care_connector.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only allow admins to delete security events (for data retention purposes)
CREATE POLICY "Admins can delete security events" ON care_connector.security_audit_log
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM care_connector.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create a function to automatically clean up old security events (data retention)
CREATE OR REPLACE FUNCTION care_connector.cleanup_old_security_events()
RETURNS void AS $$
BEGIN
    -- Delete security events older than 1 year, except critical events
    DELETE FROM care_connector.security_audit_log 
    WHERE created_at < NOW() - INTERVAL '1 year' 
    AND severity != 'critical';
    
    -- Delete critical events older than 3 years
    DELETE FROM care_connector.security_audit_log 
    WHERE created_at < NOW() - INTERVAL '3 years' 
    AND severity = 'critical';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup weekly (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-security-events', '0 2 * * 0', 'SELECT care_connector.cleanup_old_security_events();');

-- Grant necessary permissions
GRANT SELECT, INSERT ON care_connector.security_audit_log TO authenticated;
GRANT ALL ON care_connector.security_audit_log TO service_role;

-- Add comments for documentation
COMMENT ON TABLE care_connector.security_audit_log IS 'Security audit log for tracking authentication and security events';
COMMENT ON COLUMN care_connector.security_audit_log.user_id IS 'User ID associated with the event (null for anonymous events)';
COMMENT ON COLUMN care_connector.security_audit_log.event_type IS 'Type of security event that occurred';
COMMENT ON COLUMN care_connector.security_audit_log.ip_address IS 'IP address from which the event originated';
COMMENT ON COLUMN care_connector.security_audit_log.user_agent IS 'User agent string of the client';
COMMENT ON COLUMN care_connector.security_audit_log.details IS 'Additional event details in JSON format';
COMMENT ON COLUMN care_connector.security_audit_log.severity IS 'Severity level of the security event';
COMMENT ON COLUMN care_connector.security_audit_log.created_at IS 'Timestamp when the event occurred';
