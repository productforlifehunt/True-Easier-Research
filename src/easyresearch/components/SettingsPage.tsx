import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Users, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { bToast } from '../utils/bilingualToast';

interface UserSettings {
  email_notifications: boolean;
  response_alerts: boolean;
  weekly_digest: boolean;
  organization_name: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
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
      bToast.success('Settings saved', '设置已保存');
    } catch (error) { console.error('Error saving settings:', error); bToast.error('Failed to save', '保存失败'); }
    finally { setSaving(false); }
  };

  const Toggle = ({ enabled, onChange, label, description }: { enabled: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-[14px] font-medium text-stone-800">{label}</p>
        <p className="text-[12px] text-stone-400 mt-0.5 font-light">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-stone-200'}`}
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
        <h1 className="text-2xl font-semibold tracking-tight text-stone-800">{t('resSettings.title')}</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-all shadow-sm shadow-emerald-200"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {t('resSettings.save')}
        </button>
      </div>

      <div className="space-y-4">
        {/* Organization / 组织 */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
              <Users size={16} className="text-emerald-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-[15px] font-semibold text-stone-800">{t('resSettings.organization')}</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">{t('resSettings.orgName')}</label>
              <input
                type="text"
                value={settings.organization_name}
                onChange={(e) => setSettings({ ...settings, organization_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                placeholder={t('resSettings.orgPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">{t('resSettings.accountEmail')}</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-100 bg-stone-50 text-stone-400"
              />
            </div>
          </div>
        </div>

        {/* Notifications / 通知 */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
              <Bell size={16} className="text-amber-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-[15px] font-semibold text-stone-800">{t('resSettings.notifications')}</h2>
          </div>
          <div className="divide-y divide-stone-100">
            <Toggle
              enabled={settings.email_notifications}
              onChange={(v) => setSettings({ ...settings, email_notifications: v })}
              label={t('resSettings.emailNotif')}
              description={t('resSettings.emailNotifDesc')}
            />
            <Toggle
              enabled={settings.response_alerts}
              onChange={(v) => setSettings({ ...settings, response_alerts: v })}
              label={t('resSettings.responseAlerts')}
              description={t('resSettings.responseAlertsDesc')}
            />
            <Toggle
              enabled={settings.weekly_digest}
              onChange={(v) => setSettings({ ...settings, weekly_digest: v })}
              label={t('resSettings.weeklyDigest')}
              description={t('resSettings.weeklyDigestDesc')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
