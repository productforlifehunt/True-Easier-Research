import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { User, Bell, Lock, Mail, Phone, LogOut, LogIn, Edit2, Save, Moon, Plus, X, Globe, Smartphone, Users, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface DndPeriod {
  id?: string;
  channel: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [dndPeriods, setDndPeriods] = useState<DndPeriod[]>([]);
  const [showLibraryDetails, setShowLibraryDetails] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    introduction: '',
    web_notifications_enabled: true,
    push_notifications_enabled: true,
    email_notifications_enabled: true,
    join_participant_library: false,
    country: '',
    occupation: '',
    age: '',
    gender: '',
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
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const p = profileRow || {};
    setProfile({ ...p, email: user.email });
    setFormData({
      full_name: p.full_name || user.user_metadata?.full_name || '',
      email: user.email || '',
      phone: p.phone || '',
      introduction: p.introduction || '',
      web_notifications_enabled: p.web_notifications_enabled ?? true,
      push_notifications_enabled: p.push_notifications_enabled ?? true,
      email_notifications_enabled: p.email_notifications_enabled ?? true,
      join_participant_library: p.join_participant_library ?? false,
      country: p.country || '',
      occupation: p.occupation || '',
      age: p.age || '',
      gender: p.gender || '',
    });

    const { data: dndRows } = await supabase
      .from('user_dnd_period')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at');
    setDndPeriods((dndRows || []).map((r: any) => ({
      id: r.id, channel: r.channel, start_time: r.start_time, end_time: r.end_time, is_active: r.is_active,
    })));
    setLoading(false);
  };

  // Save a single field or set of fields immediately
  const saveField = async (fields: Record<string, any>) => {
    if (!authUser) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: authUser.id, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (error) throw error;
      if (fields.full_name) {
        await supabase.auth.updateUser({ data: { full_name: fields.full_name } });
      }
      toast.success('Saved!');
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('Failed to save');
    }
  };

  // Toggle handler — update state + save immediately
  const handleToggle = async (field: string) => {
    const newVal = !(formData as any)[field];
    setFormData(prev => ({ ...prev, [field]: newVal }));
    await saveField({ [field]: newVal });
  };

  const handleSaveProfile = async () => {
    if (!authUser) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          full_name: formData.full_name,
          phone: formData.phone,
          introduction: formData.introduction,
          country: formData.country,
          occupation: formData.occupation,
          age: formData.age,
          gender: formData.gender,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      if (error) throw error;
      await supabase.auth.updateUser({ data: { full_name: formData.full_name } });
      setEditingProfile(false);
      toast.success('Profile saved!');
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // DND periods — save on every change
  const saveDndPeriods = async (periods: DndPeriod[]) => {
    if (!authUser) return;
    try {
      await supabase.from('user_dnd_period').delete().eq('user_id', authUser.id);
      if (periods.length > 0) {
        const rows = periods.map(d => ({
          user_id: authUser.id,
          channel: d.channel, start_time: d.start_time, end_time: d.end_time, is_active: d.is_active,
        }));
        await supabase.from('user_dnd_period').insert(rows);
      }
    } catch (err) {
      console.error('DND save error:', err);
    }
  };

  const addDndPeriod = () => {
    const updated = [...dndPeriods, { channel: 'all', start_time: '22:00', end_time: '07:00', is_active: true }];
    setDndPeriods(updated);
    saveDndPeriods(updated);
  };

  const removeDndPeriod = (index: number) => {
    const updated = dndPeriods.filter((_, i) => i !== index);
    setDndPeriods(updated);
    saveDndPeriods(updated);
  };

  const updateDndPeriod = (index: number, field: string, value: any) => {
    const updated = dndPeriods.map((p, i) => i === index ? { ...p, [field]: value } : p);
    setDndPeriods(updated);
    saveDndPeriods(updated);
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

  const SectionCard = ({ icon: Icon, title, children, headerRight }: { icon: any; title: string; children: React.ReactNode; headerRight?: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm mb-3 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-50">
        <div className="flex items-center gap-2.5">
          <Icon size={18} className="text-emerald-500" />
          <h2 className="text-[14px] font-semibold text-stone-800">{title}</h2>
        </div>
        {headerRight}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${enabled ? 'bg-emerald-500' : 'bg-stone-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${enabled ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="pb-4 bg-stone-50/50">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-stone-800 tracking-tight">Settings</h1>
          <p className="text-[13px] text-stone-400 font-light mt-0.5">Your account & preferences</p>
        </div>

        {/* Profile — has its own Edit/Save button */}
        <SectionCard
          icon={User}
          title="Profile"
          headerRight={
            !editingProfile ? (
              <button onClick={() => setEditingProfile(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                <Edit2 size={13} /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button onClick={handleSaveProfile} disabled={savingProfile}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50">
                  <Save size={13} /> {savingProfile ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditingProfile(false); checkAuthAndLoadData(); }}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-stone-500 hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
              </div>
            )
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Full Name</label>
              <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} disabled={!editingProfile}
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
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!editingProfile}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 disabled:bg-stone-50 disabled:text-stone-500 transition-all" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Introduction</label>
              <textarea value={formData.introduction} onChange={(e) => setFormData({ ...formData, introduction: e.target.value })} disabled={!editingProfile}
                placeholder="Tell researchers a bit about yourself..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 disabled:bg-stone-50 disabled:text-stone-500 transition-all resize-none" />
            </div>
          </div>
        </SectionCard>

        {/* Participant Library — toggles work immediately */}
        <SectionCard icon={Users} title="Participant Library">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50">
              <div className="flex-1 pr-3">
                <p className="text-[13px] font-medium text-stone-700">Join Participant Library</p>
                <p className="text-[11px] text-stone-400 font-light mt-0.5">
                  Make your profile discoverable by researchers looking for study participants. Your demographics will be visible, but personal details stay private.
                </p>
              </div>
              <Toggle enabled={formData.join_participant_library} onChange={() => handleToggle('join_participant_library')} />
            </div>

            {formData.join_participant_library && (
              <div className="space-y-3 pt-1">
                <button onClick={() => setShowLibraryDetails(!showLibraryDetails)}
                  className="flex items-center gap-1 text-[12px] font-medium text-emerald-600 hover:text-emerald-700">
                  {showLibraryDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showLibraryDetails ? 'Hide details' : 'Edit public profile details'}
                </button>
                {showLibraryDetails && (
                  <div className="space-y-3 p-3.5 rounded-xl border border-stone-100 bg-white">
                    <div>
                      <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Country / Region</label>
                      <input type="text" value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        onBlur={() => saveField({ country: formData.country })}
                        placeholder="e.g. United States"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Age</label>
                        <input type="text" value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          onBlur={() => saveField({ age: formData.age })}
                          placeholder="e.g. 25-34"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Gender</label>
                        <input type="text" value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          onBlur={() => saveField({ gender: formData.gender })}
                          placeholder="e.g. Female"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Occupation</label>
                      <input type="text" value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        onBlur={() => saveField({ occupation: formData.occupation })}
                        placeholder="e.g. Student, Engineer"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Notifications — all toggles work immediately */}
        <SectionCard icon={Bell} title="Notifications">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50">
              <div className="flex items-center gap-2.5">
                <Globe size={14} className="text-stone-400" />
                <div>
                  <p className="text-[13px] font-medium text-stone-700">Web / In-App Notifications</p>
                  <p className="text-[11px] text-stone-400 font-light">Browser and in-app alerts</p>
                </div>
              </div>
              <Toggle enabled={formData.web_notifications_enabled} onChange={() => handleToggle('web_notifications_enabled')} />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50">
              <div className="flex items-center gap-2.5">
                <Smartphone size={14} className="text-stone-400" />
                <div>
                  <p className="text-[13px] font-medium text-stone-700">Push Notifications</p>
                  <p className="text-[11px] text-stone-400 font-light">Mobile push via Capacitor</p>
                </div>
              </div>
              <Toggle enabled={formData.push_notifications_enabled} onChange={() => handleToggle('push_notifications_enabled')} />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50">
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-stone-400" />
                <div>
                  <p className="text-[13px] font-medium text-stone-700">Email Notifications</p>
                  <p className="text-[11px] text-stone-400 font-light">Receive updates via email</p>
                </div>
              </div>
              <Toggle enabled={formData.email_notifications_enabled} onChange={() => handleToggle('email_notifications_enabled')} />
            </div>

            {/* Do Not Disturb — directly editable */}
            <div className="mt-2 p-4 rounded-xl border border-stone-100 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Moon size={14} className="text-indigo-400" />
                <p className="text-[13px] font-semibold text-stone-700">Do Not Disturb</p>
              </div>
              <p className="text-[11px] text-stone-400 font-light mb-3">
                Add quiet periods when no notifications will be sent. Each period can apply to all channels or a specific one.
              </p>

              <div className="space-y-2">
                {dndPeriods.map((period, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50">
                    <select value={period.channel} onChange={(e) => updateDndPeriod(i, 'channel', e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-stone-200 text-[11px] bg-white min-w-[90px]">
                      <option value="all">All</option>
                      <option value="web">Web</option>
                      <option value="push">Push</option>
                      <option value="email">Email</option>
                    </select>
                    <input type="time" value={period.start_time} onChange={(e) => updateDndPeriod(i, 'start_time', e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-stone-200 text-[12px] bg-white" />
                    <span className="text-[10px] text-stone-400">to</span>
                    <input type="time" value={period.end_time} onChange={(e) => updateDndPeriod(i, 'end_time', e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-stone-200 text-[12px] bg-white" />
                    <button onClick={() => removeDndPeriod(i)} className="p-1 text-red-400 hover:bg-red-50 rounded">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={addDndPeriod}
                  className="w-full py-2 rounded-lg border border-dashed border-stone-200 text-[11px] font-medium text-emerald-500 hover:bg-emerald-50/50 flex items-center justify-center gap-1">
                  <Plus size={12} /> Add quiet period
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Security — click to send, no edit mode needed */}
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

        <button onClick={handleSignOut}
          className="w-full py-3 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserSettings;
