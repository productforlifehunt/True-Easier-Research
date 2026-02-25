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
    email_notifications: true, response_alerts: true, weekly_digest: false, organization_name: ''
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/easyresearch/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data: researcher } = await supabase.from('researcher')
        .select('id, organization_id, email_notifications, response_alerts, weekly_digest')
        .eq('user_id', user?.id).maybeSingle();
      const { data: org } = researcher?.organization_id
        ? await supabase.from('organization').select('id, name').eq('id', researcher.organization_id).maybeSingle()
        : { data: null as any };
      if (researcher) {
        setSettings(prev => ({
          ...prev, organization_name: org?.name || '',
          email_notifications: researcher.email_notifications ?? true,
          response_alerts: researcher.response_alerts ?? true,
          weekly_digest: researcher.weekly_digest ?? false
        }));
      }
    } catch (error) { console.error('Error loading settings:', error); }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: researcher } = await supabase.from('researcher').select('organization_id').eq('user_id', user?.id).maybeSingle();
      const { error: researcherError } = await supabase.from('researcher').update({
        email_notifications: settings.email_notifications,
        response_alerts: settings.response_alerts,
        weekly_digest: settings.weekly_digest
      }).eq('user_id', user?.id);
      if (researcherError) throw researcherError;
      if (researcher?.organization_id && settings.organization_name.trim()) {
        await supabase.from('organization').update({ name: settings.organization_name.trim() }).eq('id', researcher.organization_id);
      }
      toast.success('Settings saved');
    } catch (error) { console.error('Error saving settings:', error); toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const Toggle = ({ enabled, onChange, label, description }: { enabled: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-[14px] font-medium text-slate-900">{label}</p>
        <p className="text-[12px] text-slate-400 mt-0.5 font-light">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-indigo-500' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform`}
          style={{ left: enabled ? '22px' : '2px' }}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </button>
      </div>

      <div className="space-y-4">
        {/* Organization */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center gap-2.5 mb-5">
            <Users size={16} className="text-indigo-500" strokeWidth={1.5} />
            <h2 className="text-[15px] font-semibold text-slate-900">Organization</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-slate-400 mb-1.5">Organization Name</label>
              <input
                type="text"
                value={settings.organization_name}
                onChange={(e) => setSettings({ ...settings, organization_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                placeholder="Your organization"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-400 mb-1.5">Account Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-slate-100 bg-slate-50 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center gap-2.5 mb-5">
            <Bell size={16} className="text-indigo-500" strokeWidth={1.5} />
            <h2 className="text-[15px] font-semibold text-slate-900">Notifications</h2>
          </div>
          <div className="divide-y divide-slate-100">
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
  );
};

export default SettingsPage;
