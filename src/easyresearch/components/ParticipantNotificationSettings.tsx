import React, { useState, useEffect } from 'react';
import { X, Plus, Bell, Moon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DNDPeriod {
  start: string;
  end: string;
}

interface ParticipantNotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  currentSettings?: any;
}

const ParticipantNotificationSettings: React.FC<ParticipantNotificationSettingsProps> = ({
  isOpen,
  onClose,
  enrollmentId,
  currentSettings
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dndPeriods, setDndPeriods] = useState<DNDPeriod[]>([
    { start: '22:00', end: '07:00' }
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setNotificationsEnabled(currentSettings.notifications_enabled ?? true);
      if (currentSettings.dnd_periods && Array.isArray(currentSettings.dnd_periods)) {
        setDndPeriods(currentSettings.dnd_periods);
      }
    }
  }, [currentSettings]);

  const handleAddDNDPeriod = () => {
    setDndPeriods([...dndPeriods, { start: '12:00', end: '13:00' }]);
  };

  const handleRemoveDNDPeriod = (index: number) => {
    setDndPeriods(dndPeriods.filter((_, i) => i !== index));
  };

  const handleUpdateDNDPeriod = (index: number, field: 'start' | 'end', value: string) => {
    const newPeriods = [...dndPeriods];
    newPeriods[index][field] = value;
    setDndPeriods(newPeriods);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('enrollment')
        .update({
          dnd_setting: {
            notifications_enabled: notificationsEnabled,
            dnd_periods: dndPeriods
          }
        })
        .eq('id', enrollmentId);

      if (error) throw error;

      onClose();
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Notification Settings
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Customize when you receive survey reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable Notifications */}
          <div className="p-6 rounded-xl border-2" style={{ borderColor: 'var(--border-light)' }}>
            <label className="flex items-center gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5 rounded"
                style={{ accentColor: 'var(--color-green)' }}
              />
              <div className="flex-1">
                <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Enable Survey Notifications
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Receive reminders when it's time to complete a survey
                </div>
              </div>
            </label>
          </div>

          {/* DND Periods */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Moon size={20} style={{ color: 'var(--color-green)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Do Not Disturb Periods
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Set times when you don't want to receive survey notifications. You can still complete surveys during these times.
            </p>

            <div className="space-y-3">
              {dndPeriods.map((period, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-4 rounded-xl border-2"
                  style={{ borderColor: 'var(--border-light)' }}
                >
                  <input
                    type="time"
                    value={period.start}
                    onChange={(e) => handleUpdateDNDPeriod(index, 'start', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border-2"
                    style={{ borderColor: 'var(--border-light)' }}
                  />
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>to</span>
                  <input
                    type="time"
                    value={period.end}
                    onChange={(e) => handleUpdateDNDPeriod(index, 'end', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border-2"
                    style={{ borderColor: 'var(--border-light)' }}
                  />
                  {dndPeriods.length > 1 && (
                    <button
                      onClick={() => handleRemoveDNDPeriod(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={handleAddDNDPeriod}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{ borderColor: 'var(--border-light)', color: 'var(--color-green)' }}
              >
                <Plus size={20} />
                <span className="font-medium">Add Another Period</span>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div 
            className="p-4 rounded-xl"
            style={{ backgroundColor: '#f0fdf4', border: '1px solid var(--color-green)' }}
          >
            <div className="flex gap-3">
              <Bell size={20} style={{ color: 'var(--color-green)' }} className="flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  About Survey Reminders
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Survey reminders are scheduled by your research team. Do Not Disturb periods prevent notifications during your chosen times, but you can always access pending surveys from your dashboard.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-medium border-2 transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white transition-colors"
            style={{ 
              backgroundColor: saving ? '#9ca3af' : 'var(--color-green)',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantNotificationSettings;
