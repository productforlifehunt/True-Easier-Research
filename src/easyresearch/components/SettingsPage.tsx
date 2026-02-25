import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Users, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface UserSettings {
  email_notifications: boolean;
  response_alerts: boolean;
  weekly_digest: boolean;
  organization_name: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    response_alerts: true,
    weekly_digest: false,
    organization_name: ''
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/easyresearch/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data: researcher } = await supabase
        .from('researcher')
        .select('id, organization_id, email_notifications, response_alerts, weekly_digest')
        .eq('user_id', user?.id)
        .maybeSingle();

      const { data: org } = researcher?.organization_id
        ? await supabase
            .from('organization')
            .select('id, name')
            .eq('id', researcher.organization_id)
            .maybeSingle()
        : { data: null as any };

      if (researcher) {
        setSettings(prev => ({
          ...prev,
          organization_name: org?.name || '',
          email_notifications: researcher.email_notifications ?? true,
          response_alerts: researcher.response_alerts ?? true,
          weekly_digest: researcher.weekly_digest ?? false
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Get researcher record first to get organization_id
      const { data: researcher } = await supabase
        .from('researcher')
        .select('organization_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Update researcher notification settings (save to same columns as load)
      const { error: researcherError } = await supabase
        .from('researcher')
        .update({
          email_notifications: settings.email_notifications,
          response_alerts: settings.response_alerts,
          weekly_digest: settings.weekly_digest
        })
        .eq('user_id', user?.id);

      if (researcherError) throw researcherError;

      // Update organization name if changed and user has access
      if (researcher?.organization_id && settings.organization_name.trim()) {
        const { error: orgError } = await supabase
          .from('organization')
          .update({ name: settings.organization_name.trim() })
          .eq('id', researcher.organization_id);

        if (orgError) {
          console.warn('Could not update organization name:', orgError);
          // Don't fail the entire save if org update fails
        }
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ enabled, onChange, label, description }: { enabled: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className="relative w-12 h-6 rounded-full transition-colors"
        style={{ backgroundColor: enabled ? 'var(--color-green)' : 'var(--border-light)' }}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Settings
            </h1>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>

          <div className="space-y-6">
            {/* Organization Settings */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Users style={{ color: 'var(--color-green)' }} size={24} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Organization
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={settings.organization_name}
                    onChange={(e) => setSettings({ ...settings, organization_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)' }}
                    placeholder="Your organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Bell style={{ color: 'var(--color-green)' }} size={24} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Notifications
                </h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                <Toggle
                  enabled={settings.email_notifications}
                  onChange={(v) => setSettings({ ...settings, email_notifications: v })}
                  label="Email Notifications"
                  description="Receive email notifications for important updates"
                />
                <Toggle
                  enabled={settings.response_alerts}
                  onChange={(v) => setSettings({ ...settings, response_alerts: v })}
                  label="Response Alerts"
                  description="Get notified when participants complete surveys"
                />
                <Toggle
                  enabled={settings.weekly_digest}
                  onChange={(v) => setSettings({ ...settings, weekly_digest: v })}
                  label="Weekly Digest"
                  description="Receive a weekly summary of survey activity"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
  );
};

export default SettingsPage;
