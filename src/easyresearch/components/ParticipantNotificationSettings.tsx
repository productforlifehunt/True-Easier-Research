import React, { useState, useEffect } from 'react';
import { X, Plus, Bell, Moon, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notificationScheduler, QuestionnaireDNDPeriod } from '../../utils/notificationScheduler';
import { loadDndSetting, saveDndSetting } from '../utils/enrollmentSync';

interface NotifConfigInfo {
  id: string;
  questionnaire_id: string | null;
  title: string;
  body: string;
  frequency: string;
  notification_type: string;
  dnd_allowed: boolean;
}

interface QuestionnaireInfo {
  id: string;
  title: string;
  time_windows: { start: string; end: string }[];
  notifications: NotifConfigInfo[];
}

interface ParticipantNotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  projectId: string;
  currentSettings?: any; // deprecated — DND now loaded from enrollment_dnd_period table
}

const ParticipantNotificationSettings: React.FC<ParticipantNotificationSettingsProps> = ({
  isOpen, onClose, enrollmentId, projectId, currentSettings,
}) => {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireInfo[]>([]);
  const [projectNotifs, setProjectNotifs] = useState<NotifConfigInfo[]>([]);
  // dndByQ: { [questionnaire_id]: { dnd_periods: [{start, end}] } }
  const [dndByQ, setDndByQ] = useState<Record<string, { dnd_periods: QuestionnaireDNDPeriod[] }>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);

      // Load all notification_config rows for this project
      const { data: ncRows } = await supabase
        .from('notification_config')
        .select('*')
        .eq('project_id', projectId)
        .eq('enabled', true)
        .order('order_index');

      const configs: NotifConfigInfo[] = (ncRows || []).map((r: any) => ({
        id: r.id,
        questionnaire_id: r.questionnaire_id || null,
        title: r.title || '',
        body: r.body || '',
        frequency: r.frequency || 'daily',
        notification_type: r.notification_type || 'push',
        dnd_allowed: r.dnd_allowed ?? true,
      }));

      // Separate project-level vs questionnaire-level
      setProjectNotifs(configs.filter(c => !c.questionnaire_id));
      const qLevelConfigs = configs.filter(c => c.questionnaire_id);

      // Get unique questionnaire IDs that have notifications
      const qIds = [...new Set(qLevelConfigs.map(c => c.questionnaire_id!))];

      // Load questionnaire titles
      let qInfos: QuestionnaireInfo[] = [];
      if (qIds.length > 0) {
        const { data: qRows } = await supabase
          .from('questionnaire')
          .select('id, title')
          .in('id', qIds)
          .order('order_index');

        // Load time_windows
        const { data: twRows } = await supabase
          .from('questionnaire_time_window')
          .select('questionnaire_id, start_time, end_time')
          .in('questionnaire_id', qIds)
          .order('order_index');
        const twByQ = new Map<string, { start: string; end: string }[]>();
        for (const tw of (twRows || [])) {
          if (!twByQ.has(tw.questionnaire_id)) twByQ.set(tw.questionnaire_id, []);
          twByQ.get(tw.questionnaire_id)!.push({ start: tw.start_time, end: tw.end_time });
        }

        qInfos = (qRows || []).map((qr: any) => ({
          id: qr.id,
          title: qr.title,
          time_windows: twByQ.get(qr.id) || [],
          notifications: qLevelConfigs.filter(c => c.questionnaire_id === qr.id),
        }));
      }
      setQuestionnaires(qInfos);

      // Load DND from flat table
      const existing = await loadDndSetting(enrollmentId);
      const parsed: Record<string, { dnd_periods: QuestionnaireDNDPeriod[] }> = {};
      for (const qId of qIds) {
        parsed[qId] = existing[qId] || { dnd_periods: [] };
      }
      setDndByQ(parsed);
      setLoading(false);
    };
    load();
  }, [isOpen, projectId, enrollmentId]);

  const addDndPeriod = (qId: string) => {
    setDndByQ(prev => ({
      ...prev,
      [qId]: { dnd_periods: [...(prev[qId]?.dnd_periods || []), { start: '22:00', end: '07:00' }] },
    }));
  };

  const removeDndPeriod = (qId: string, index: number) => {
    setDndByQ(prev => ({
      ...prev,
      [qId]: { dnd_periods: (prev[qId]?.dnd_periods || []).filter((_, i) => i !== index) },
    }));
  };

  const updateDndPeriod = (qId: string, index: number, field: 'start' | 'end', value: string) => {
    setDndByQ(prev => {
      const periods = [...(prev[qId]?.dnd_periods || [])];
      periods[index] = { ...periods[index], [field]: value };
      return { ...prev, [qId]: { dnd_periods: periods } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save DND to flat table instead of JSONB
      // Merge with existing (preserve settings for questionnaires not shown here)
      const existing = await loadDndSetting(enrollmentId);
      const merged = { ...existing, ...dndByQ };
      await saveDndSetting(enrollmentId, merged);

      // Live-update scheduler DND without full reload
      for (const [qId, val] of Object.entries(dndByQ)) {
        notificationScheduler.updateQuestionnaireDND(qId, val.dnd_periods);
      }
      onClose();
    } catch (error) {
      console.error('Error saving DND:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const freqLabel = (f: string) => {
    const map: Record<string, string> = {
      hourly: 'Hourly', '2hours': 'Every 2h', '4hours': 'Every 4h',
      daily: 'Daily', twice_daily: 'Twice daily', weekly: 'Weekly', once: 'One-time',
    };
    return map[f] || f;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-stone-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Bell size={18} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-stone-800">Notification Settings</h2>
              <p className="text-[12px] text-stone-400 font-light">Set Do Not Disturb per questionnaire</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X size={16} className="text-stone-400" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent mx-auto" />
          </div>
        ) : questionnaires.length === 0 && projectNotifs.length === 0 ? (
          <p className="text-[13px] text-stone-400 text-center py-6">No notifications configured for this study.</p>
        ) : (
          <div className="space-y-4">
            {/* Project-level notifications (read-only display) */}
            {projectNotifs.length > 0 && (
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 space-y-2">
                <h3 className="text-[13px] font-semibold text-stone-800">Study Notifications</h3>
                {projectNotifs.map(n => (
                  <div key={n.id} className="text-[11px] text-stone-500">
                    <span className="font-medium text-stone-600">{n.title}</span>
                    <span className="ml-2 text-stone-400">({freqLabel(n.frequency)})</span>
                  </div>
                ))}
              </div>
            )}

            {/* Questionnaire-level notifications with DND controls */}
            {questionnaires.map(q => {
              const periods = dndByQ[q.id]?.dnd_periods || [];
              const hasDndAllowed = q.notifications.some(n => n.dnd_allowed);
              return (
                <div key={q.id} className="p-4 rounded-xl border border-stone-100 space-y-3">
                  <div>
                    <h3 className="text-[13px] font-semibold text-stone-800">{q.title}</h3>
                    {q.time_windows?.[0] && (
                      <span className="text-[11px] text-stone-400">{q.time_windows[0].start}–{q.time_windows[0].end}</span>
                    )}
                  </div>

                  {/* Show each notification config for this questionnaire */}
                  {q.notifications.map(n => (
                    <div key={n.id} className="text-[11px] text-stone-500 flex items-center gap-2">
                      <Bell size={10} className="text-emerald-400 shrink-0" />
                      <span className="font-medium text-stone-600">"{n.title}"</span>
                      <span className="text-stone-400">({freqLabel(n.frequency)})</span>
                    </div>
                  ))}

                  {/* DND periods for this questionnaire */}
                  {hasDndAllowed ? (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Moon size={12} className="text-indigo-400" />
                        <span className="text-[11px] font-medium text-stone-500">Do Not Disturb</span>
                      </div>
                      <div className="space-y-1.5">
                        {periods.map((p, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input type="time" value={p.start} onChange={(e) => updateDndPeriod(q.id, i, 'start', e.target.value)}
                              className="flex-1 px-2 py-1.5 rounded-lg border border-stone-200 text-[12px]" />
                            <span className="text-[10px] text-stone-400">to</span>
                            <input type="time" value={p.end} onChange={(e) => updateDndPeriod(q.id, i, 'end', e.target.value)}
                              className="flex-1 px-2 py-1.5 rounded-lg border border-stone-200 text-[12px]" />
                            <button onClick={() => removeDndPeriod(q.id, i)} className="p-1 text-red-400 hover:bg-red-50 rounded">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => addDndPeriod(q.id)}
                          className="w-full py-2 rounded-lg border border-dashed border-stone-200 text-[11px] font-medium text-emerald-500 hover:bg-emerald-50/50 flex items-center justify-center gap-1">
                          <Plus size={12} /> Add quiet period
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-400 italic">DND not available for this questionnaire (set by researcher)</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
