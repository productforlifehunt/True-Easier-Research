import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { User, Bell, Lock, Mail, Phone, LogOut, LogIn, Edit2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notifications_enabled: true,
    email_notifications: true
  });

  useEffect(() => { checkAuthAndLoadData(); }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await loadUserData(user);
      else setLoading(false);
    } catch { setLoading(false); }
  };

  const loadUserData = async (user: any) => {
    if (!user) { setLoading(false); return; }
    const m = user.user_metadata || {};
    const p = { id: user.id, email: user.email, full_name: m.full_name || '', phone: m.phone || '', notifications_enabled: m.notifications_enabled ?? true, email_notifications: m.email_notifications ?? true };
    setProfile(p);
    setFormData({ full_name: p.full_name, email: p.email || '', phone: p.phone, notifications_enabled: p.notifications_enabled, email_notifications: p.email_notifications });
    setLoading(false);
  };

  const handleSave = async () => {
    if (!authUser) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: formData.full_name, phone: formData.phone, notifications_enabled: formData.notifications_enabled, email_notifications: formData.email_notifications } });
      if (error) throw error;
      setEditing(false);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await loadUserData(user);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const handleSignOut = async () => { await logout(); navigate('/easyresearch/auth'); };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
          <User size={24} className="text-stone-300" />
        </div>
        <h2 className="text-lg font-semibold text-stone-800 mb-1">Please Sign In</h2>
        <p className="text-[13px] text-stone-400 font-light mb-4">Sign in to manage your account</p>
        <button onClick={() => navigate('/easyresearch/auth')}
          className="px-6 py-2.5 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center gap-2">
          <LogIn size={14} /> Sign In
        </button>
      </div>
    );
  }

  const SectionCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm mb-3 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-stone-50">
        <Icon size={18} className="text-emerald-500" />
        <h2 className="text-[14px] font-semibold text-stone-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  return (
    <div className="pb-4 bg-stone-50/50">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-stone-800 tracking-tight">Settings</h1>
            <p className="text-[13px] text-stone-400 font-light mt-0.5">Your account & preferences</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500">
              <Edit2 size={14} /> Edit
            </button>
          )}
        </div>

        <SectionCard icon={User} title="Profile">
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Full Name</label>
              <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} disabled={!editing}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 disabled:bg-stone-50 disabled:text-stone-500 transition-all" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Email</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <Mail size={14} className="text-stone-400" />
                <span className="text-[13px] text-stone-600">{formData.email}</span>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Phone (Optional)</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!editing}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 disabled:bg-stone-50 disabled:text-stone-500 transition-all" />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Bell} title="Notifications">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50">
              <div>
                <p className="text-[13px] font-medium text-stone-700">All Notifications</p>
                <p className="text-[11px] text-stone-400 font-light">Enable or disable all notifications</p>
              </div>
              <button onClick={() => editing && setFormData({ ...formData, notifications_enabled: !formData.notifications_enabled })}
                className={`w-10 h-5 rounded-full transition-all relative ${formData.notifications_enabled ? 'bg-emerald-500' : 'bg-stone-200'} ${!editing ? 'opacity-50' : ''}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${formData.notifications_enabled ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50">
              <div>
                <p className="text-[13px] font-medium text-stone-700">Email Notifications</p>
                <p className="text-[11px] text-stone-400 font-light">Receive updates via email</p>
              </div>
              <button onClick={() => editing && formData.notifications_enabled && setFormData({ ...formData, email_notifications: !formData.email_notifications })}
                className={`w-10 h-5 rounded-full transition-all relative ${formData.email_notifications && formData.notifications_enabled ? 'bg-emerald-500' : 'bg-stone-200'} ${!editing || !formData.notifications_enabled ? 'opacity-50' : ''}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${formData.email_notifications && formData.notifications_enabled ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Lock} title="Security">
          <button
            onClick={async () => {
              if (!formData.email) return;
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(formData.email, { redirectTo: `${window.location.origin}/easyresearch/auth` });
                if (error) throw error;
                toast.success('Password reset email sent!');
              } catch (err: any) { toast.error(err.message || 'Failed to send reset email'); }
            }}
            className="w-full p-3.5 rounded-xl text-left hover:bg-stone-50 transition-colors border border-stone-100">
            <p className="text-[13px] font-medium text-stone-700">Change Password</p>
            <p className="text-[11px] text-stone-400 font-light mt-0.5">Send a password reset link to your email</p>
          </button>
        </SectionCard>

        {editing && (
          <div className="flex gap-2 mb-3">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50">
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={async () => { setEditing(false); const { data: { user } } = await supabase.auth.getUser(); if (user) await loadUserData(user); }}
              className="px-5 py-3 rounded-xl text-[13px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
              Cancel
            </button>
          </div>
        )}

        <button onClick={handleSignOut}
          className="w-full py-3 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserSettings;
