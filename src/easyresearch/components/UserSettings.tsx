import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { User, Bell, Lock, Mail, Phone, LogOut, Edit2, Save } from 'lucide-react';
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

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadUserData(user);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const loadUserData = async (user: any) => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // Use auth user metadata for profile data
      const userMetadata = user.user_metadata || {};
      const updatedProfile = {
        id: user.id,
        email: user.email,
        full_name: userMetadata.full_name || '',
        phone: userMetadata.phone || '',
        notifications_enabled: userMetadata.notifications_enabled ?? true,
        email_notifications: userMetadata.email_notifications ?? true
      };
      
      setProfile(updatedProfile);
      setFormData({
        full_name: updatedProfile.full_name,
        email: updatedProfile.email || '',
        phone: updatedProfile.phone,
        notifications_enabled: updatedProfile.notifications_enabled,
        email_notifications: updatedProfile.email_notifications
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!authUser) return;
    
    setSaving(true);
    try {
      // Update auth user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          notifications_enabled: formData.notifications_enabled,
          email_notifications: formData.email_notifications
        }
      });
      
      if (error) throw error;
      
      setEditing(false);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await loadUserData(user);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/easyresearch/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pb-24 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Please Sign In</h2>
        <button
          onClick={() => navigate('/easyresearch/auth')}
          className="px-6 py-3 rounded-lg font-semibold"
          style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
            >
              <Edit2 size={18} />
              Edit
            </button>
          )}
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-3 mb-6">
            <User size={24} style={{ color: 'var(--color-green)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Profile
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 rounded-lg"
                style={{ 
                  border: '1px solid var(--border-light)',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Email
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                <Mail size={18} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{formData.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 rounded-lg"
                style={{ 
                  border: '1px solid var(--border-light)',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Bell size={24} style={{ color: 'var(--color-green)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>All Notifications</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enable or disable all notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications_enabled}
                  onChange={(e) => setFormData({ ...formData, notifications_enabled: e.target.checked })}
                  disabled={!editing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" 
                  style={{ backgroundColor: formData.notifications_enabled ? 'var(--color-green)' : 'var(--border-light)' }}>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Email Notifications</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.email_notifications}
                  onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
                  disabled={!editing || !formData.notifications_enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" 
                  style={{ backgroundColor: formData.email_notifications && formData.notifications_enabled ? 'var(--color-green)' : 'var(--border-light)' }}>
                </div>
              </label>
            </div>

          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Lock size={24} style={{ color: 'var(--color-green)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Security
            </h2>
          </div>

          <button
            onClick={async () => {
              if (!formData.email) return;
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                  redirectTo: `${window.location.origin}/easyresearch/auth`
                });
                if (error) throw error;
                toast.success('Password reset email sent. Check your inbox.');
              } catch (err: any) {
                toast.error(err.message || 'Failed to send reset email');
              }
            }}
            className="w-full px-4 py-3 rounded-lg text-left hover:opacity-80 transition-opacity"
            style={{ border: '1px solid var(--border-light)' }}
          >
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Change Password</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Send a password reset link to your email</p>
          </button>
        </div>

        {/* Action Buttons */}
        {editing && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={async () => {
                setEditing(false);
                const { data: { user } } = await supabase.auth.getUser();
                if (user) await loadUserData(user);
              }}
              className="px-6 py-4 rounded-lg font-semibold"
              style={{ border: '1px solid var(--border-light)' }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-80"
          style={{ backgroundColor: '#ef4444', color: 'white' }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
    </>
  );
};

export default UserSettings;
