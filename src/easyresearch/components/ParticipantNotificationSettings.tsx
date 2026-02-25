import React, { useState, useEffect } from 'react';
import { X, Plus, Bell, Moon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DNDPeriod { start: string; end: string; }
interface ParticipantNotificationSettingsProps { isOpen: boolean; onClose: () => void; enrollmentId: string; currentSettings?: any; }

const ParticipantNotificationSettings: React.FC<ParticipantNotificationSettingsProps> = ({ isOpen, onClose, enrollmentId, currentSettings }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dndPeriods, setDndPeriods] = useState<DNDPeriod[]>([{ start: '22:00', end: '07:00' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setNotificationsEnabled(currentSettings.notifications_enabled ?? true);
      if (currentSettings.dnd_periods && Array.isArray(currentSettings.dnd_periods)) setDndPeriods(currentSettings.dnd_periods);
    }
  }, [currentSettings]);

  const handleAddDNDPeriod = () => { setDndPeriods([...dndPeriods, { start: '12:00', end: '13:00' }]); };
  const handleRemoveDNDPeriod = (index: number) => { setDndPeriods(dndPeriods.filter((_, i) => i !== index)); };
  const handleUpdateDNDPeriod = (index: number, field: 'start' | 'end', value: string) => { const n = [...dndPeriods]; n[index][field] = value; setDndPeriods(n); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('enrollment').update({ dnd_setting: { notifications_enabled: notificationsEnabled, dnd_periods: dndPeriods } }).eq('id', enrollmentId);
      if (error) throw error;
      onClose();
    } catch (error) { console.error('Error saving:', error); }
    finally { setSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-stone-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Bell size={18} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-stone-800">Notifications</h2>
              <p className="text-[12px] text-stone-400 font-light">Customize survey reminders</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X size={16} className="text-stone-400" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="p-4 rounded-xl border border-stone-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500" />
              <div>
                <p className="text-[13px] font-medium text-stone-700">Enable Notifications</p>
                <p className="text-[11px] text-stone-400 font-light">Receive reminders for surveys</p>
              </div>
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Moon size={14} className="text-emerald-500" />
              <h3 className="text-[13px] font-semibold text-stone-800">Do Not Disturb</h3>
            </div>
            <div className="space-y-2">
              {dndPeriods.map((period, index) => (
                <div key={index} className="flex items-center gap-2 p-3 rounded-xl border border-stone-100">
                  <input type="time" value={period.start} onChange={(e) => handleUpdateDNDPeriod(index, 'start', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  <span className="text-[11px] text-stone-400">to</span>
                  <input type="time" value={period.end} onChange={(e) => handleUpdateDNDPeriod(index, 'end', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  {dndPeriods.length > 1 && (
                    <button onClick={() => handleRemoveDNDPeriod(index)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={handleAddDNDPeriod}
                className="w-full py-2.5 rounded-xl border border-dashed border-stone-200 text-[12px] font-medium text-emerald-500 hover:bg-emerald-50/50 transition-colors flex items-center justify-center gap-1.5">
                <Plus size={14} /> Add Period
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantNotificationSettings;
